
// // import { useState, useEffect, useCallback, useRef } from 'react';
// // import { createPortal } from 'react-dom';
// // import {
// //   LineChart, Line, BarChart, Bar, XAxis, YAxis,
// //   CartesianGrid, Tooltip, ResponsiveContainer,
// //   PieChart, Pie, Cell,
// // } from 'recharts';
// // import {
// //   fetchPLFilters,
// //   fetchPLSummary,
// //   fetchPLTrend,
// //   fetchPLComparison,
// //   fetchPLExpenseBreakdown,
// //   fetchPLStatement,
// //   exportPL,
// // } from '../services/plApi';
// // import { C, CHART_COLORS } from '../utils/theme';
// // import PLTrendCard from '../components/Charts/PLTrendCard';
// // import PLComparisonCard from '../components/Charts/PLComparisonCard';
// // import ExpenseBreakdownCard from '../components/Charts/ExpenseBreakdownCard';

// // /* ══════════════════════════════════════════════════════════════════
// //    CONSTANTS & DEFAULTS
// // ══════════════════════════════════════════════════════════════════ */
// // const DEFAULT_FILTERS = {
// //   legalGroupId: ['All'],
// //   legalEntityId: ['All'],
// //   parentDivisionId: ['All'],
// //   subdivisionId: ['All'],
// //   year: '',
// //   periodName: '',
// //   comparePeriodName: '',
// //   currency: 'AED',
// // };

// // const EXPENSE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#a855f7', '#f43f5e'];

// // /* ══════════════════════════════════════════════════════════════════
// //    SHARED STYLES
// // ══════════════════════════════════════════════════════════════════ */
// // const selStyle = {
// //   appearance: 'none', padding: '6px 28px 6px 10px',
// //   fontSize: '0.78rem', fontWeight: 500, color: '#334155',
// //   background: '#fff', border: `1px solid ${C.border}`,
// //   borderRadius: 7, cursor: 'pointer', outline: 'none', width: '100%',
// //   backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
// //   backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
// // };

// // const TH = {
// //   padding: '10px 12px', textAlign: 'right', fontSize: '0.72rem',
// //   fontWeight: 700, color: '#1e3a8a', background: '#f8fafc',
// //   borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap',
// // };
// // const TH_L = { ...TH, textAlign: 'left' };
// // const TD = { padding: '8px 12px', textAlign: 'right', fontSize: '0.74rem', color: '#334155', borderBottom: '1px solid #f1f5f9' };
// // const TD_L = { ...TD, textAlign: 'left', color: C.navy };

// // /* ══════════════════════════════════════════════════════════════════
// //    HELPER COMPONENTS
// // ══════════════════════════════════════════════════════════════════ */

// // function Skeleton({ h = 20, w = '100%', radius = 6 }) {
// //   return (
// //     <div style={{
// //       height: h, width: w, borderRadius: radius,
// //       background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)',
// //       backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
// //     }} />
// //   );
// // }

// // function ErrorBanner({ message, onRetry }) {
// //   return (
// //     <div style={{
// //       background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10,
// //       padding: '10px 16px', display: 'flex', alignItems: 'center',
// //       justifyContent: 'space-between', gap: 4, fontSize: '0.78rem', color: '#be123c', marginTop: 8,
// //     }}>
// //       <span>⚠ {message}</span>
// //       {onRetry && (
// //         <button onClick={onRetry} style={{
// //           background: '#be123c', color: '#fff', border: 'none',
// //           borderRadius: 6, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
// //         }}>Retry</button>
// //       )}
// //     </div>
// //   );
// // }

// // function FilterField({ label, children, style }) {
// //   return (
// //     <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 80, flex: '1 1 0', ...style }}>
// //       <span style={{ fontSize: '0.66rem', color: '#1e3a8a', fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
// //         {label}
// //       </span>
// //       {children}
// //     </div>
// //   );
// // }

// // function ExportToast({ message, type }) {
// //   if (!message) return null;
// //   const isErr = type === 'error';
// //   const isInfo = type === 'info';
// //   const bg = isErr ? '#fff1f2' : isInfo ? '#eff6ff' : '#f0fdf4';
// //   const border = isErr ? '#fecdd3' : isInfo ? '#bfdbfe' : '#bbf7d0';
// //   const color = isErr ? '#be123c' : isInfo ? '#1d4ed8' : '#15803d';
// //   const icon = isErr ? '⚠ ' : isInfo ? 'ℹ ' : '✓ ';
// //   return (
// //     <div style={{
// //       position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
// //       background: bg, border: `1px solid ${border}`, color,
// //       borderRadius: 10, padding: '10px 18px',
// //       fontSize: '0.78rem', fontWeight: 700,
// //       boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
// //       display: 'flex', alignItems: 'center', gap: 4,
// //       animation: 'fadeIn 0.2s ease', maxWidth: 380,
// //     }}>
// //       {icon}{message}
// //     </div>
// //   );
// // }

// // /* ── Three-dot Kebab Menu ─────────────────────────────────────── */
// // function KebabMenu({ id, items }) {
// //   const [open, setOpen] = useState(false);
// //   const ref = useRef(null);

// //   useEffect(() => {
// //     if (!open) return;
// //     const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
// //     document.addEventListener('mousedown', handler);
// //     return () => document.removeEventListener('mousedown', handler);
// //   }, [open]);

// //   return (
// //     <div ref={ref} style={{ position: 'relative' }}>
// //       <button
// //         id={id}
// //         onClick={() => setOpen(v => !v)}
// //         title="Options"
// //         style={{
// //           background: open ? '#f1f5f9' : 'none',
// //           border: 'none', cursor: 'pointer',
// //           padding: '4px 7px', borderRadius: 6,
// //           fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1,
// //           display: 'flex', alignItems: 'center', outline: 'none',
// //           transition: 'background 0.15s',
// //         }}
// //       >
// //         ⋮
// //       </button>

// //       {open && (
// //         <div style={{
// //           position: 'absolute', right: 0, top: 'calc(100% + 4px)',
// //           background: '#fff', borderRadius: 10,
// //           boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
// //           border: '1px solid #e2e8f0',
// //           minWidth: 170, zIndex: 200, overflow: 'hidden',
// //           animation: 'menuPop 0.14s cubic-bezier(0.34,1.56,0.64,1) forwards',
// //         }}>
// //           {items.map((item, i) => (
// //             <button
// //               key={i}
// //               onClick={() => { item.action(); setOpen(false); }}
// //               disabled={item.disabled}
// //               style={{
// //                 display: 'flex', alignItems: 'center', gap: 4,
// //                 width: '100%', textAlign: 'left',
// //                 padding: '9px 14px', background: 'none', border: 'none',
// //                 fontSize: '0.74rem', fontWeight: 600, color: item.danger ? '#be123c' : '#334155',
// //                 cursor: item.disabled ? 'not-allowed' : 'pointer',
// //                 borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
// //                 opacity: item.disabled ? 0.5 : 1,
// //                 transition: 'background 0.1s',
// //               }}
// //               onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = '#f8fafc'; }}
// //               onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
// //             >
// //               <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
// //               {item.label}
// //             </button>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // /* ── View All Modal ───────────────────────────────────────────── */
// // function MultiSelect({ options, value, onChange, placeholder = 'All', style }) {
// //   const [open, setOpen] = useState(false);
// //   const ref = useRef(null);
// //   useEffect(() => {
// //     const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
// //     document.addEventListener('mousedown', h);
// //     return () => document.removeEventListener('mousedown', h);
// //   }, []);

// //   const normOptions = options.map(o => {
// //     if (typeof o === 'string') return { id: o, name: o };
// //     const id = o.value !== undefined ? o.value : o.id;
// //     const name = o.label !== undefined ? o.label : o.name;
// //     return { id, name };
// //   });

// //   const isAll = !value || value.length === 0 || (value.length === 1 && String(value[0]) === 'All');
// //   const toggle = (optId) => {
// //     if (String(optId) === 'All') { onChange(['All']); return; }
// //     const cur = isAll ? [] : value.filter(v => String(v) !== 'All');
// //     const next = cur.some(v => String(v) === String(optId))
// //       ? cur.filter(v => String(v) !== String(optId))
// //       : [...cur, optId];
// //     onChange(next.length === 0 ? ['All'] : next);
// //   };

// //   const selectedVals = normOptions.filter(o => value && value.some(v => String(v) === String(o.id)));
// //   const label = isAll ? placeholder : selectedVals.length === 1 ? selectedVals[0].name : (selectedVals.length + ' selected');

// //   return (
// //     <div ref={ref} style={{ position: 'relative', ...style }}>
// //       <div onClick={() => setOpen(o => !o)} style={{ ...selStyle, backgroundImage: 'none', appearance: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', userSelect: 'none' }}>
// //         <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85%' }}>{label}</span>
// //         <span style={{ fontSize: '0.65rem', color: '#94a3b8', flexShrink: 0 }}>{open ? '\u25B2' : '\u25BC'}</span>
// //       </div>
// //       {open && (
// //         <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: '220px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 500, marginTop: 2, maxHeight: 200, overflowY: 'auto' }}>

// //           <div onClick={() => toggle('All')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', cursor: 'pointer', fontSize: '0.78rem', background: isAll ? '#eff6ff' : '#fff', color: isAll ? '#2563eb' : '#334155', fontWeight: isAll ? 600 : 400, borderBottom: '1px solid #f8fafc', whiteSpace: 'normal', lineHeight: 1.25 }} onMouseEnter={e => { if (!isAll) e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={e => { if (!isAll) e.currentTarget.style.background = '#fff'; }}>
// //             <span style={{ width: 14, height: 14, border: '1.5px solid ' + (isAll ? '#2563eb' : '#cbd5e1'), borderRadius: 3, background: isAll ? '#2563eb' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
// //               {isAll && <span style={{ color: '#fff', fontSize: '0.6rem', lineHeight: 1 }}>✓</span>}
// //             </span>
// //             All
// //           </div>

// //           {normOptions.map(opt => {
// //             if (opt.id === 'All') return null;
// //             const selected = !isAll && value && value.some(v => String(v) === String(opt.id));
// //             return (
// //               <div key={opt.id} onClick={() => toggle(opt.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', cursor: 'pointer', fontSize: '0.78rem', background: selected ? '#eff6ff' : '#fff', color: selected ? '#2563eb' : '#334155', fontWeight: selected ? 600 : 400, borderBottom: '1px solid #f8fafc', whiteSpace: 'normal', lineHeight: 1.25 }} onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={e => { if (!selected) e.currentTarget.style.background = '#fff'; }}>
// //                 <span style={{ width: 14, height: 14, border: '1.5px solid ' + (selected ? '#2563eb' : '#cbd5e1'), borderRadius: 3, background: selected ? '#2563eb' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
// //                   {selected && <span style={{ color: '#fff', fontSize: '0.6rem', lineHeight: 1 }}>✓</span>}
// //                 </span>
// //                 {opt.name}
// //               </div>
// //             );
// //           })}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }


// // /* ── View All interactive filters ───────────────────────────────── */
// // function ViewAllFilterBar({
// //   filters,
// //   setFilters,
// //   filterOptions,
// //   onApply,
// //   onReset,
// //   onExport,
// //   exporting = null,
// //   loading = false,
// // }) {
// //   const update = (key, value) => {
// //     setFilters(prev => {
// //       const next = { ...prev, [key]: value };
// //       if (key === 'legalEntityId') {
// //         next.parentDivisionId = ['All'];
// //         next.subdivisionId = ['All'];
// //       }
// //       if (key === 'parentDivisionId') {
// //         next.subdivisionId = ['All'];
// //       }
// //       return next;
// //     });
// //   };

// //   return (
// //     <div
// //       style={{
// //         padding: '12px 16px',
// //         borderBottom: '1px solid #e2e8f0',
// //         background: '#fff',
// //         display: 'grid',
// //         gridTemplateColumns: 'repeat(5, minmax(130px, 1fr)) auto auto',
// //         gap: 8,
// //         alignItems: 'end',
// //         minWidth: 900,
// //       }}
// //     >
// //       <FilterField label="Year">
// //         <MultiSelect
// //           options={filterOptions.years}
// //           value={
// //             Array.isArray(filters.year) && filters.year.length
// //               ? filters.year
// //               : filterOptions.years?.[0]
// //                 ? [filterOptions.years[0]]
// //                 : []
// //           }
// //           onChange={v => update('year', v)}
// //           style={{ width: '100%' }}
// //         />
// //       </FilterField>

// //       <FilterField label="Legal Entity">
// //         <MultiSelect
// //           options={filterOptions.legalEntities}
// //           value={filters.legalEntityId}
// //           onChange={v => update('legalEntityId', v)}
// //           style={{ width: '100%' }}
// //         />
// //       </FilterField>

// //       <FilterField label="Parent Division">
// //         <MultiSelect
// //           options={filterOptions.parentDivisions}
// //           value={filters.parentDivisionId}
// //           onChange={v => update('parentDivisionId', v)}
// //           style={{ width: '100%' }}
// //         />
// //       </FilterField>

// //       <FilterField label="Sub-Division">
// //         <MultiSelect
// //           options={filterOptions.subdivisions}
// //           value={filters.subdivisionId}
// //           onChange={v => update('subdivisionId', v)}
// //           style={{ width: '100%' }}
// //         />
// //       </FilterField>

// //       <FilterField label="Period">
// //         <MultiSelect
// //           options={filterOptions.periods}
// //           value={filters.periodName}
// //           onChange={v => update('periodName', v)}
// //           style={{ width: '100%' }}
// //         />
// //       </FilterField>

// //       <button
// //         onClick={onApply}
// //         disabled={loading}
// //         style={{
// //           padding: '7px 16px',
// //           background: C.primary,
// //           color: '#fff',
// //           border: 'none',
// //           borderRadius: 8,
// //           fontSize: '0.75rem',
// //           fontWeight: 700,
// //           cursor: loading ? 'not-allowed' : 'pointer',
// //           opacity: loading ? 0.65 : 1,
// //           whiteSpace: 'nowrap',
// //         }}
// //       >
// //         {loading ? 'Loading…' : 'Apply'}
// //       </button>

// //       <button
// //         onClick={onReset}
// //         disabled={loading || !!exporting}
// //         style={{
// //           background: 'none',
// //           border: 'none',
// //           color: C.slate,
// //           fontWeight: 600,
// //           fontSize: '0.75rem',
// //           cursor: loading || exporting ? 'not-allowed' : 'pointer',
// //           padding: '7px 4px',
// //           whiteSpace: 'nowrap',
// //         }}
// //       >
// //         Reset
// //       </button>

// //       <button
// //         onClick={() => onExport?.('excel')}
// //         disabled={loading || !!exporting}
// //         style={{
// //           padding: '7px 12px',
// //           background: '#fff',
// //           color: C.primary,
// //           border: `1px solid ${C.primary}`,
// //           borderRadius: 8,
// //           fontSize: '0.72rem',
// //           fontWeight: 700,
// //           cursor: loading || exporting ? 'not-allowed' : 'pointer',
// //           opacity: loading || exporting ? 0.6 : 1,
// //           whiteSpace: 'nowrap',
// //         }}
// //       >
// //         {exporting === 'excel' ? 'Exporting…' : 'Export Excel'}
// //       </button>

// //       <button
// //         onClick={() => onExport?.('pdf')}
// //         disabled={loading || !!exporting}
// //         style={{
// //           padding: '7px 12px',
// //           background: C.primary,
// //           color: '#fff',
// //           border: `1px solid ${C.primary}`,
// //           borderRadius: 8,
// //           fontSize: '0.72rem',
// //           fontWeight: 700,
// //           cursor: loading || exporting ? 'not-allowed' : 'pointer',
// //           opacity: loading || exporting ? 0.6 : 1,
// //           whiteSpace: 'nowrap',
// //         }}
// //       >
// //         {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
// //       </button>
// //     </div>
// //   );
// // }

// // function ModalCloseButton({ onClick }) {
// //   const [hover, setHover] = useState(false);
// //   return (
// //     <button
// //       onClick={onClick}
// //       onMouseEnter={() => setHover(true)}
// //       onMouseLeave={() => setHover(false)}
// //       style={{
// //         background: hover ? '#f1f5f9' : 'none',
// //         border: 'none',
// //         fontSize: '0.85rem',
// //         color: C.slate,
// //         cursor: 'pointer',
// //         display: 'flex',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         width: 28,
// //         height: 28,
// //         borderRadius: '50%',
// //         transition: 'all 0.15s',
// //         outline: 'none',
// //       }}
// //       title="Close"
// //     >
// //       ✕
// //     </button>
// //   );
// // }

// // function ViewAllModal({ isOpen, onClose, title, subtitle, children }) {
// //   const bodyRef = useRef(null);
// //   const overlayRef = useRef(null);

// //   useEffect(() => {
// //     if (!isOpen) return;
// //     const esc = (e) => { if (e.key === 'Escape') onClose(); };
// //     document.addEventListener('keydown', esc);

// //     const prevOverflow = document.body.style.overflow;
// //     document.body.style.overflow = 'hidden';

// //     if (overlayRef.current) overlayRef.current.scrollTop = 0;
// //     if (bodyRef.current) bodyRef.current.scrollTop = 0;

// //     return () => {
// //       document.removeEventListener('keydown', esc);
// //       document.body.style.overflow = prevOverflow;
// //     };
// //   }, [isOpen, onClose]);

// //   if (!isOpen) return null;

// //   const modalContent = (
// //     <div
// //       ref={overlayRef}
// //       onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
// //       style={{
// //         position: 'fixed', inset: 0,
// //         background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)',
// //         WebkitBackdropFilter: 'blur(6px)',
// //         display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
// //         padding: 0,
// //         overflowY: 'auto',
// //         minHeight: '100vh',
// //         zIndex: 99999, animation: 'fadeIn 0.18s ease',
// //       }}
// //     >
// //       <div style={{
// //         background: '#fff', borderRadius: 0,
// //         width: '98%', maxWidth: 1500,
// //         height: '90vh', maxHeight: '90vh', minHeight: 0,
// //         display: 'flex', flexDirection: 'column',
// //         boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
// //         animation: 'modalPop 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards',
// //         overflow: 'hidden', border: '1px solid #e2e8f0',
// //         marginTop: '5vh', flexShrink: 0,
// //       }}>
// //         {/* Modal Header */}
// //         <div style={{
// //           padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
// //           background: 'linear-gradient(90deg,#f8fafc,#fff)',
// //           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
// //           flexShrink: 0,
// //         }}>
// //           <div>
// //             <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: C.navy }}>{title}</h3>
// //             {subtitle && <div style={{ fontSize: '0.7rem', color: C.muted, marginTop: 2 }}>{subtitle}</div>}
// //           </div>
// //           <button
// //             onClick={onClose}
// //             style={{
// //               background: 'none', border: 'none', cursor: 'pointer',
// //               width: 30, height: 30, borderRadius: '50%',
// //               display: 'flex', alignItems: 'center', justifyContent: 'center',
// //               fontSize: '0.85rem', color: C.slate, transition: 'background 0.15s',
// //             }}
// //             onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
// //             onMouseLeave={e => e.currentTarget.style.background = 'none'}
// //             title="Close (Esc)"
// //           >✕</button>
// //         </div>

// //         {/* Modal Body */}
// //         <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
// //           {children}
// //         </div>
// //       </div>
// //     </div>
// //   );

// //   return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
// // }

// // /* ── Variance Cell ────────────────────────────────────────────── */
// // function VarCell({ v, isPct = false }) {
// //   if (v === null || v === undefined) return <td style={TD}>—</td>;
// //   if (typeof v === 'string' && v.includes('%')) return <td style={{ ...TD, color: C.slate }}>{v}</td>;
// //   const pos = v >= 0;
// //   return (
// //     <td style={{ ...TD, color: pos ? C.green : C.rose, fontWeight: 700 }}>
// //       {pos ? '▲' : '▼'} {Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: isPct ? 2 : 0 })}{isPct ? '%' : ''}
// //     </td>
// //   );
// // }

// // /* Inline variance badge for modal tables */
// // function VarBadge({ v, isPct = false }) {
// //   if (v === null || v === undefined) return <span style={{ color: C.muted }}>—</span>;
// //   const pos = v >= 0;
// //   return (
// //     <span style={{ color: pos ? C.green : C.rose, fontWeight: 700 }}>
// //       {pos ? '▲' : '▼'} {Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: isPct ? 2 : 0 })}{isPct ? '%' : ''}
// //     </span>
// //   );
// // }

// // /* ── Number formatters ────────────────────────────────────────── */
// // const fmtNum = (v, currency = 'AED') => {
// //   if (v === null || v === undefined) return '—';
// //   const n = Number(v);
// //   if (isNaN(n)) return v;
// //   return `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
// // };
// // /* Compact formatter for KPI cards — keeps numbers from overflowing */
// // const fmtKPI = (v, currency = 'AED') => {
// //   if (v === null || v === undefined) return '—';
// //   const n = Number(v);
// //   if (isNaN(n)) return v;
// //   if (Math.abs(n) >= 1_000_000_000) return `${currency} ${(n / 1_000_000_000).toFixed(2)}B`;
// //   if (Math.abs(n) >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(2)}M`;
// //   if (Math.abs(n) >= 1_000) return `${currency} ${(n / 1_000).toFixed(1)}K`;
// //   return `${currency} ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
// // };
// // const fmtPct = (v) => (v !== null && v !== undefined) ? `${Number(v).toFixed(2)}%` : '—';
// // const fmtAxisNum = (v) => {
// //   if (v === 0) return '0';
// //   if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
// //   if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
// //   if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
// //   return String(v);
// // };

// // /* ── Custom Chart Tooltip ─────────────────────────────────────── */
// // const ChartTooltip = ({ active, payload, label, currency = 'AED' }) => {
// //   if (!active || !payload?.length) return null;
// //   return (
// //     <div style={{
// //       background: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0',
// //       backdropFilter: 'blur(6px)', borderRadius: 8, padding: '8px 12px',
// //       fontSize: '0.7rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', minWidth: 150,
// //     }}>
// //       <div style={{ fontWeight: 700, color: C.navy, marginBottom: 5, borderBottom: '1px solid #f1f5f9', paddingBottom: 4 }}>
// //         {label}
// //       </div>
// //       {payload.map((p, i) => (
// //         <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 3 }}>
// //           <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
// //             <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
// //             <span style={{ color: C.slate }}>{p.name}</span>
// //           </div>
// //           <span style={{ fontWeight: 700, color: C.navy }}>
// //             {currency} {Number(p.value).toLocaleString('en-US', { maximumFractionDigits: 0 })}
// //           </span>
// //         </div>
// //       ))}
// //     </div>
// //   );
// // };

// // /* ── Legend Row ───────────────────────────────────────────────── */
// // function LegendRow({ items }) {
// //   return (
// //     <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
// //       {items.map(([label, color, dashed]) => (
// //         <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
// //           <span style={{
// //             width: 18, height: 2.5,
// //             background: dashed ? 'transparent' : color,
// //             borderTop: dashed ? `2.5px dashed ${color}` : 'none',
// //             display: 'inline-block', borderRadius: 1,
// //           }} />
// //           <span style={{ fontSize: '0.62rem', color: C.slate, fontWeight: 500 }}>{label}</span>
// //         </div>
// //       ))}
// //     </div>
// //   );
// // }

// // /* ── KPI Card ─────────────────────────────────────────────────── */
// // function KPICard({ id, label, value, subValue, changePct, compareLabel, color, iconBg, icon, loading, error }) {
// //   const [hover, setHover] = useState(false);
// //   const accent = color || C.primary;
// //   const up = changePct >= 0;

// //   return (
// //     <div
// //       id={`kpi-${id}`}
// //       onMouseEnter={() => setHover(true)}
// //       onMouseLeave={() => setHover(false)}
// //       style={{
// //         flex: 1, minWidth: 140,
// //         background: `linear-gradient(145deg, #fff 0%, ${iconBg}80 100%)`,
// //         borderRadius: 12, padding: '12px 14px',
// //         boxShadow: hover ? `0 8px 24px ${accent}25` : '0 2px 8px rgba(0,0,0,0.04)',
// //         border: `1px solid ${hover ? accent + '30' : 'rgba(0,0,0,0.04)'}`,
// //         transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
// //         transform: hover ? 'translateY(-2px)' : 'none',
// //         display: 'flex', alignItems: 'center', gap: 4,
// //         overflow: 'hidden', position: 'relative', minHeight: 82,
// //       }}
// //     >
// //       <div style={{
// //         width: 44, height: 44, borderRadius: '50%', background: iconBg,
// //         display: 'flex', alignItems: 'center', justifyContent: 'center',
// //         flexShrink: 0, color: accent, fontSize: '1.2rem',
// //       }}>
// //         {icon}
// //       </div>
// //       <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
// //         <span style={{ fontSize: '0.65rem', fontWeight: 700, color: accent, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
// //           {label}
// //         </span>
// //         {loading ? <Skeleton h={16} w={90} /> : error ? (
// //           <span style={{ fontSize: '0.68rem', color: C.rose }}>Error loading</span>
// //         ) : (
// //           <>
// //             <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
// //               {value}
// //             </div>
// //             {subValue && <div style={{ fontSize: '0.62rem', color: C.slate, fontWeight: 500 }}>{subValue}</div>}
// //             {changePct !== null && changePct !== undefined && compareLabel && (
// //               <div style={{ fontSize: '0.62rem', fontWeight: 600, lineHeight: 1.1, marginTop: 2 }}>
// //                 <span style={{ color: up ? C.green : C.rose, marginRight: 3 }}>
// //                   {up ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
// //                 </span>
// //                 <span style={{ color: C.muted }}>{compareLabel}</span>
// //               </div>
// //             )}
// //           </>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // /* ── Modal Table wrapper styles ───────────────────────────────── */
// // const MTH = {
// //   padding: '10px 14px', textAlign: 'right', fontSize: '0.73rem',
// //   fontWeight: 700, color: '#1e3a8a', background: '#f8fafc',
// //   borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 1,
// // };
// // const MTH_L = { ...MTH, textAlign: 'left' };
// // const MTD = { padding: '9px 14px', textAlign: 'right', fontSize: '0.74rem', color: '#334155', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };
// // const MTD_L = { ...MTD, textAlign: 'left', color: C.navy };



// // /* ── Section Header (collapsible table row) ───────────────────── */
// // function SectionHeader({
// //   label,
// //   expanded,
// //   onToggle,
// //   colSpan = 9,
// // }) {
// //   return (
// //     <tr
// //       onClick={onToggle}
// //       style={{
// //         background:
// //           'linear-gradient(90deg, #f0f4ff, #f8fafc)',
// //         cursor: 'pointer',
// //         borderBottom: `1px solid ${C.border}`,
// //       }}
// //     >
// //       <td
// //         colSpan={colSpan}
// //         style={{
// //           padding: '8px 12px',
// //           fontSize: '0.72rem',
// //           fontWeight: 800,
// //           color: C.navy,
// //           letterSpacing: '0.04em',
// //         }}
// //       >
// //         <span
// //           style={{
// //             marginRight: 7,
// //             fontSize: '0.62rem',
// //             display: 'inline-block',
// //             transition: 'transform 0.2s',
// //             transform: expanded
// //               ? 'rotate(90deg)'
// //               : 'none',
// //           }}
// //         >
// //           ▶
// //         </span>

// //         {label}
// //       </td>
// //     </tr>
// //   );
// // }

// // /* ── P&L Statement Row ────────────────────────────────────────── */

// // function PLRow({
// //   row,
// //   indent = false,
// //   currency = 'AED',
// //   thStyles,
// //   tdStyles,
// // }) {
// //   const [hover, setHover] = useState(false);

// //   const TDx = tdStyles || TD;

// //   const TDLx = {
// //     ...(tdStyles || TD),
// //     textAlign: 'left',
// //     color: C.navy,
// //   };

// //   // ------------------------------------------------------------
// //   // Backend hierarchy
// //   // ------------------------------------------------------------
// //   const isSubtotal =
// //     row?.is_subtotal === true ||
// //     row?.row_type === 'subtotal';

// //   // ------------------------------------------------------------
// //   // Important CFO subtotal rows
// //   // ------------------------------------------------------------
// //   const label = String(
// //     row?.particulars ?? '—'
// //   );

// //   const labelLower = label.toLowerCase();

// //   const isNetProfit =
// //     labelLower === 'net profit';

// //   const isEbitda =
// //     labelLower === 'ebitda';

// //   const isGrossProfit =
// //     labelLower === 'gross profit';

// //   const isPBT =
// //     labelLower === 'pbt' ||
// //     labelLower === 'profit before tax';

// //   const isImportantSubtotal =
// //     isSubtotal &&
// //     (
// //       isNetProfit ||
// //       isEbitda ||
// //       isGrossProfit ||
// //       isPBT ||
// //       labelLower === 'total revenue' ||
// //       labelLower === 'total cost of sales' ||
// //       labelLower === 'total operating expenses'
// //     );

// //   // ------------------------------------------------------------
// //   // Row styling
// //   // ------------------------------------------------------------
// //   const rowBg =
// //     isNetProfit
// //       ? '#f0fdf4'
// //       : isEbitda || isGrossProfit || isPBT
// //         ? '#eef2ff'
// //         : isSubtotal
// //           ? '#f8fafc'
// //           : 'transparent';

// //   const labelColor =
// //     isNetProfit
// //       ? C.green
// //       : isEbitda || isGrossProfit || isPBT
// //         ? C.primary
// //         : isSubtotal
// //           ? C.navy
// //           : '#334155';

// //   // ------------------------------------------------------------
// //   // Exact backend values
// //   // ------------------------------------------------------------
// //   const currentPTD = row?.current_ptd;
// //   const comparePTD = row?.compare_ptd;
// //   const targetPTD = row?.target_ptd;

// //   const varianceCurrentVsCompare =
// //     row?.variance_pct_current_vs_compare;

// //   const varianceCurrentVsTarget =
// //     row?.variance_pct_current_vs_target;

// //   const currentYTD = row?.current_ytd;
// //   const targetYTD = row?.target_ytd;

// //   const varianceYTDVsTarget =
// //     row?.variance_pct_ytd_vs_target;

// //   // ------------------------------------------------------------
// //   // Null-safe formatters
// //   // ------------------------------------------------------------
// //   const formatAmount = (value) => {
// //     if (
// //       value === null ||
// //       value === undefined ||
// //       value === ''
// //     ) {
// //       return '—';
// //     }

// //     return fmtNum(value, currency);
// //   };

// //   const formatPercent = (value) => {
// //     if (
// //       value === null ||
// //       value === undefined ||
// //       value === ''
// //     ) {
// //       return '—';
// //     }

// //     const num = Number(value);

// //     if (!Number.isFinite(num)) {
// //       return '—';
// //     }

// //     return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
// //   };

// //   return (
// //     <tr
// //       style={{
// //         background:
// //           hover && !isSubtotal
// //             ? '#f0f6ff'
// //             : rowBg,
// //         transition: 'background 0.1s',
// //       }}
// //       onMouseEnter={() => {
// //         if (!isSubtotal) setHover(true);
// //       }}
// //       onMouseLeave={() => setHover(false)}
// //     >

// //       {/* ======================================================
// //           PARTICULARS
// //       ====================================================== */}
// //       <td
// //         style={{
// //           ...TDLx,
// //           paddingLeft: indent ? 28 : 12,
// //           fontWeight:
// //             isImportantSubtotal || isSubtotal
// //               ? 700
// //               : 400,
// //           color: labelColor,
// //           fontSize:
// //             isImportantSubtotal
// //               ? '0.76rem'
// //               : '0.74rem',
// //           borderBottom:
// //             `1px solid ${isSubtotal
// //               ? '#e2e8f0'
// //               : '#f1f5f9'
// //             }`,
// //         }}
// //       >
// //         {label}
// //       </td>

// //       {/* ======================================================
// //           CURRENT PTD
// //       ====================================================== */}
// //       <td
// //         style={{
// //           ...TDx,
// //           fontWeight:
// //             isImportantSubtotal || isSubtotal
// //               ? 700
// //               : 400,
// //           color: labelColor,
// //         }}
// //       >
// //         {formatAmount(currentPTD)}
// //       </td>

// //       {/* ======================================================
// //           COMPARE PTD
// //       ====================================================== */}
// //       <td
// //         style={{
// //           ...TDx,
// //           color: C.slate,
// //         }}
// //       >
// //         {formatAmount(comparePTD)}
// //       </td>

// //       {/* ======================================================
// //           TARGET PTD
// //       ====================================================== */}
// //       <td
// //         style={{
// //           ...TDx,
// //           color: C.slate,
// //         }}
// //       >
// //         {formatAmount(targetPTD)}
// //       </td>

// //       {/* ======================================================
// //           VAR % CURRENT VS COMPARE
// //       ====================================================== */}
// //       <td
// //         style={{
// //           ...TDx,
// //           color:
// //             varianceCurrentVsCompare == null
// //               ? C.slate
// //               : Number(varianceCurrentVsCompare) >= 0
// //                 ? C.green
// //                 : C.rose,
// //           fontWeight:
// //             varianceCurrentVsCompare == null
// //               ? 400
// //               : 600,
// //         }}
// //       >
// //         {formatPercent(
// //           varianceCurrentVsCompare
// //         )}
// //       </td>

// //       {/* ======================================================
// //           VAR % CURRENT VS TARGET
// //       ====================================================== */}
// //       <td
// //         style={{
// //           ...TDx,
// //           color:
// //             varianceCurrentVsTarget == null
// //               ? C.slate
// //               : Number(varianceCurrentVsTarget) >= 0
// //                 ? C.green
// //                 : C.rose,
// //           fontWeight:
// //             varianceCurrentVsTarget == null
// //               ? 400
// //               : 600,
// //         }}
// //       >
// //         {formatPercent(
// //           varianceCurrentVsTarget
// //         )}
// //       </td>

// //       {/* ======================================================
// //           CURRENT YTD
// //       ====================================================== */}
// //       <td
// //         style={{
// //           ...TDx,
// //           fontWeight:
// //             isImportantSubtotal || isSubtotal
// //               ? 700
// //               : 400,
// //           color: labelColor,
// //         }}
// //       >
// //         {formatAmount(currentYTD)}
// //       </td>

// //       {/* ======================================================
// //           TARGET YTD
// //       ====================================================== */}
// //       <td
// //         style={{
// //           ...TDx,
// //           color: C.slate,
// //         }}
// //       >
// //         {formatAmount(targetYTD)}
// //       </td>

// //       {/* ======================================================
// //           VAR % YTD VS TARGET
// //       ====================================================== */}
// //       <td
// //         style={{
// //           ...TDx,
// //           color:
// //             varianceYTDVsTarget == null
// //               ? C.slate
// //               : Number(varianceYTDVsTarget) >= 0
// //                 ? C.green
// //                 : C.rose,
// //           fontWeight:
// //             varianceYTDVsTarget == null
// //               ? 400
// //               : 600,
// //         }}
// //       >
// //         {formatPercent(
// //           varianceYTDVsTarget
// //         )}
// //       </td>

// //     </tr>
// //   );
// // }
// // /* ══════════════════════════════════════════════════════════════════
// //    VIEW ALL MODAL CONTENTS
// // ══════════════════════════════════════════════════════════════════ */

// // /* Trend View All Table */
// // function TrendViewAll({ data, currency }) {
// //   if (!data?.length) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
// //   return (
// //     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
// //       <thead>
// //         <tr>
// //           <th style={MTH_L}>Period</th>
// //           <th style={MTH}>Revenue</th>
// //           <th style={MTH}>Gross Profit</th>
// //           <th style={MTH}>EBITDA</th>
// //           <th style={MTH}>Net Profit</th>
// //         </tr>
// //       </thead>
// //       <tbody>
// //         {data.map((row, i) => (
// //           <tr key={i}
// //             onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
// //             onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
// //           >
// //             <td style={{ ...MTD_L, fontWeight: 600 }}>{row.period_name}</td>
// //             <td style={MTD}>{fmtNum(row.total_revenue, currency)}</td>
// //             <td style={{ ...MTD, color: C.green, fontWeight: 600 }}>{fmtNum(row.gross_profit, currency)}</td>
// //             <td style={{ ...MTD, color: C.purple, fontWeight: 600 }}>{fmtNum(row.ebitda, currency)}</td>
// //             <td style={{ ...MTD, color: C.orange, fontWeight: 600 }}>{fmtNum(row.net_profit, currency)}</td>
// //           </tr>
// //         ))}
// //       </tbody>
// //     </table>
// //   );
// // }

// // /* Comparison View All Table */
// // function ComparisonViewAll({ data, currency, periodLabel, compareLabel }) {
// //   if (!data?.length) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
// //   return (
// //     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
// //       <thead>
// //         <tr>
// //           <th style={MTH_L}>Metric</th>
// //           <th style={MTH}>{periodLabel}</th>
// //           <th style={MTH}>{compareLabel}</th>
// //           <th style={MTH}>Prior Year</th>
// //           <th style={MTH}>Variance (vs Compare)</th>
// //           <th style={MTH}>Variance %</th>
// //         </tr>
// //       </thead>
// //       <tbody>
// //         {data.map((row, i) => {
// //           const varVal = row.current - row.compare;
// //           const varPct = row.compare ? ((varVal / Math.abs(row.compare)) * 100) : null;
// //           return (
// //             <tr key={i}
// //               onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
// //               onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
// //             >
// //               <td style={{ ...MTD_L, fontWeight: 700 }}>{row.metric}</td>
// //               <td style={{ ...MTD, fontWeight: 700, color: C.primary }}>{fmtNum(row.current, currency)}</td>
// //               <td style={MTD}>{fmtNum(row.compare, currency)}</td>
// //               <td style={{ ...MTD, color: C.slate }}>{fmtNum(row.prior_year, currency)}</td>
// //               <td style={{ ...MTD, color: varVal >= 0 ? C.green : C.rose, fontWeight: 700 }}>
// //                 <VarBadge v={varVal} />
// //               </td>
// //               <td style={{ ...MTD, color: varPct >= 0 ? C.green : C.rose, fontWeight: 700 }}>
// //                 {varPct !== null ? <VarBadge v={varPct} isPct /> : '—'}
// //               </td>
// //             </tr>
// //           );
// //         })}
// //       </tbody>
// //     </table>
// //   );
// // }

// // /* Expense Breakdown View All Table */
// // function ExpenseViewAll({ data, totalExpenses, currency }) {
// //   const items = data?.items || [];
// //   if (!items.length) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
// //   return (
// //     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
// //       <thead>
// //         <tr>
// //           <th style={MTH_L}>Expense Category</th>
// //           <th style={MTH}>Amount</th>
// //           <th style={MTH}>Percentage</th>
// //           <th style={MTH}>of Total Expenses</th>
// //         </tr>
// //       </thead>
// //       <tbody>
// //         {items.map((item, i) => (
// //           <tr key={i}
// //             onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
// //             onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
// //           >
// //             <td style={MTD_L}>
// //               <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
// //                 <span style={{ width: 10, height: 10, borderRadius: 2, background: EXPENSE_COLORS[i % EXPENSE_COLORS.length], display: 'inline-block', flexShrink: 0 }} />
// //                 {item.name}
// //               </div>
// //             </td>
// //             <td style={{ ...MTD, fontWeight: 600 }}>{fmtNum(item.amount, currency)}</td>
// //             <td style={{ ...MTD, fontWeight: 700, color: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}>
// //               {item.pct != null ? `${Number(item.pct).toFixed(2)}%` : '—'}
// //             </td>
// //             <td style={MTD}>
// //               {totalExpenses ? (
// //                 <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
// //                   <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden', maxWidth: 100 }}>
// //                     <div style={{ width: `${item.pct || 0}%`, height: '100%', background: EXPENSE_COLORS[i % EXPENSE_COLORS.length], borderRadius: 3 }} />
// //                   </div>
// //                   <span style={{ fontSize: '0.7rem', color: C.slate }}>{item.pct?.toFixed(1)}%</span>
// //                 </div>
// //               ) : '—'}
// //             </td>
// //           </tr>
// //         ))}
// //         {/* Total row */}
// //         <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
// //           <td style={{ ...MTD_L, fontWeight: 800, color: C.navy }}>Total Expenses</td>
// //           <td style={{ ...MTD, fontWeight: 800, color: C.navy }}>{fmtNum(totalExpenses, currency)}</td>
// //           <td style={{ ...MTD, fontWeight: 800, color: C.navy }}>100.00%</td>
// //           <td style={MTD}>—</td>
// //         </tr>
// //       </tbody>
// //     </table>
// //   );
// // }

// // /* KPI Summary View All Table */
// // function KPISummaryViewAll({ summary, currency, periodName, comparePeriodName }) {
// //   if (!summary) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
// //   const rows = [
// //     { label: 'Total Revenue', current: summary.total_revenue, compare: summary.compare_total_revenue, varPct: summary.revenue_variance_pct },
// //     { label: 'Cost of Sales', current: summary.cost_of_sales, compare: null, varPct: null },
// //     { label: 'Gross Profit', current: summary.gross_profit, compare: summary.compare_gross_profit, varPct: summary.gross_profit_variance_pct, pct: summary.gross_profit_pct },
// //     { label: 'Other Income', current: summary.other_income, compare: null, varPct: null },
// //     { label: 'Operating Expenses', current: summary.operating_expenses, compare: null, varPct: null },
// //     { label: 'EBITDA', current: summary.ebitda, compare: summary.compare_ebitda, varPct: summary.ebitda_variance_pct, pct: summary.ebitda_pct },
// //     { label: 'PBT', current: summary.pbt, compare: null, varPct: null },
// //     { label: 'Tax Expense', current: summary.tax_expense, compare: null, varPct: null },
// //     { label: 'Net Profit', current: summary.net_profit, compare: summary.compare_net_profit, varPct: summary.net_profit_variance_pct, pct: summary.net_profit_pct, isNet: true },
// //   ];
// //   return (
// //     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
// //       <thead>
// //         <tr>
// //           <th style={MTH_L}>Metric</th>
// //           <th style={MTH}>{periodName || 'Current'}</th>
// //           <th style={MTH}>{comparePeriodName || 'Compare'}</th>
// //           <th style={MTH}>Variance %</th>
// //           <th style={MTH}>Margin %</th>
// //         </tr>
// //       </thead>
// //       <tbody>
// //         {rows.map((row, i) => (
// //           <tr key={i}
// //             style={{ background: row.isNet ? '#f0fdf4' : 'transparent' }}
// //             onMouseEnter={e => !row.isNet && (e.currentTarget.style.background = '#f8faff')}
// //             onMouseLeave={e => !row.isNet && (e.currentTarget.style.background = 'transparent')}
// //           >
// //             <td style={{ ...MTD_L, fontWeight: row.isNet ? 800 : 500, color: row.isNet ? C.green : C.navy }}>{row.label}</td>
// //             <td style={{ ...MTD, fontWeight: row.isNet ? 800 : 500, color: row.isNet ? C.green : '#334155' }}>{fmtNum(row.current, currency)}</td>
// //             <td style={{ ...MTD, color: C.slate }}>{row.compare != null ? fmtNum(row.compare, currency) : '—'}</td>
// //             <td style={MTD}>{row.varPct != null ? <VarBadge v={row.varPct} isPct /> : '—'}</td>
// //             <td style={{ ...MTD, color: C.slate }}>{row.pct != null ? fmtPct(row.pct) : '—'}</td>
// //           </tr>
// //         ))}
// //       </tbody>
// //     </table>
// //   );
// // }

// // /* P&L Statement View All (full statement in modal) */
// // // function StatementViewAll({ statementData, currency, periodName, comparePeriodName }) {
// // //   const [secIncome, setSecIncome] = useState(true);
// // //   const [secCOGS, setSecCOGS] = useState(true);
// // //   const [secExpenses, setSecExpenses] = useState(true);
// // //   if (!statementData) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
// // //   return (
// // //     <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
// // //       <thead>
// // //         <tr>
// // //           <th style={{ ...MTH_L, width: '26%' }}>Particulars</th>
// // //           <th style={MTH}>Current Period<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>{periodName}</span></th>
// // //           <th style={MTH}>Compare Period<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>{comparePeriodName}</span></th>
// // //           <th style={MTH}>Variance<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(Value)</span></th>
// // //           <th style={MTH}>Variance<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(%)</span></th>
// // //           <th style={MTH}>YTD Current</th>
// // //           <th style={MTH}>YTD Prev Year</th>
// // //           <th style={MTH}>YTD Var<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(%)</span></th>
// // //         </tr>
// // //       </thead>
// // //       <tbody>
// // //         <SectionHeader label="INCOME" expanded={secIncome} onToggle={() => setSecIncome(p => !p)} />
// // //         {secIncome && statementData.income?.map((row, i) => <PLRow key={i} row={row} indent={!row.isTotal} currency={''} tdStyles={MTD} />)}
// // //         <SectionHeader label="COST OF SALES" expanded={secCOGS} onToggle={() => setSecCOGS(p => !p)} />
// // //         {secCOGS && statementData.cost_of_sales?.map((row, i) => <PLRow key={i} row={row} indent={!row.isTotal && !row.isGrossProfit && !row.isPct} currency={''} tdStyles={MTD} />)}
// // //         <SectionHeader label="EXPENSES" expanded={secExpenses} onToggle={() => setSecExpenses(p => !p)} />
// // //         {secExpenses && statementData.expenses?.map((row, i) => <PLRow key={i} row={row} indent={!row.isTotal && !row.isEbitda && !row.isPct} currency={''} tdStyles={MTD} />)}
// // //         {statementData.bottom?.map((row, i) => <PLRow key={i} row={row} indent={!row.isNetProfit} currency={''} tdStyles={MTD} />)}
// // //       </tbody>
// // //     </table>
// // //   );
// // // }

// // function StatementViewAll({
// //   incomeRows = [],
// //   costOfSalesRows = [],
// //   profitabilityRows = [],
// //   expensesRows = [],
// //   otherExpensesRows = [],
// //   currency,
// //   periodName,
// //   comparePeriodName,
// // }) {
// //   const [secIncome, setSecIncome] = useState(true);
// //   const [secCOGS, setSecCOGS] = useState(true);
// //   const [secProfitability, setSecProfitability] = useState(true);
// //   const [secExpenses, setSecExpenses] = useState(true);
// //   const [secOtherExpenses, setSecOtherExpenses] = useState(true);

// //   const hasData =
// //     incomeRows.length > 0 ||
// //     costOfSalesRows.length > 0 ||
// //     profitabilityRows.length > 0 ||
// //     expensesRows.length > 0 ||
// //     otherExpensesRows.length > 0;

// //   if (!hasData) {
// //     return (
// //       <div
// //         style={{
// //           padding: 32,
// //           textAlign: 'center',
// //           color: C.muted,
// //           fontSize: '0.8rem',
// //         }}
// //       >
// //         No data available
// //       </div>
// //     );
// //   }

// //   return (
// //     <div
// //       style={{
// //         width: '100%',
// //         overflowX: 'auto',
// //       }}
// //     >
// //       <table
// //         style={{
// //           width: '100%',
// //           minWidth: 1100,
// //           borderCollapse: 'collapse',
// //           fontSize: '0.74rem',
// //         }}
// //       >
// //         <thead>
// //           <tr>
// //             <th
// //               style={{
// //                 ...MTH_L,
// //                 width: '25%',
// //                 minWidth: 250,
// //               }}
// //             >
// //               Particulars
// //               <br />
// //               <span
// //                 style={{
// //                   fontWeight: 400,
// //                   opacity: 0.75,
// //                 }}
// //               >
// //                 (in {currency})
// //               </span>
// //             </th>

// //             <th style={MTH}>
// //               Current PTD
// //               <br />
// //               <span
// //                 style={{
// //                   fontWeight: 400,
// //                   opacity: 0.75,
// //                 }}
// //               >
// //                 {periodName}
// //               </span>
// //             </th>

// //             <th style={MTH}>
// //               Compare PTD
// //               <br />
// //               <span
// //                 style={{
// //                   fontWeight: 400,
// //                   opacity: 0.75,
// //                 }}
// //               >
// //                 {comparePeriodName || '—'}
// //               </span>
// //             </th>

// //             <th style={MTH}>
// //               Target PTD
// //             </th>

// //             <th style={MTH}>
// //               Var % Current
// //               <br />
// //               <span
// //                 style={{
// //                   fontWeight: 400,
// //                   opacity: 0.75,
// //                 }}
// //               >
// //                 vs Compare
// //               </span>
// //             </th>

// //             <th style={MTH}>
// //               Var % Current
// //               <br />
// //               <span
// //                 style={{
// //                   fontWeight: 400,
// //                   opacity: 0.75,
// //                 }}
// //               >
// //                 vs Target
// //               </span>
// //             </th>

// //             <th style={MTH}>
// //               Current YTD
// //             </th>

// //             <th style={MTH}>
// //               Target YTD
// //             </th>

// //             <th style={MTH}>
// //               Var % YTD
// //               <br />
// //               <span
// //                 style={{
// //                   fontWeight: 400,
// //                   opacity: 0.75,
// //                 }}
// //               >
// //                 vs Target
// //               </span>
// //             </th>
// //           </tr>
// //         </thead>

// //         <tbody>

// //           {/* =========================
// //               INCOME
// //           ========================= */}

// //           <SectionHeader
// //             label="INCOME"
// //             expanded={secIncome}
// //             onToggle={() =>
// //               setSecIncome((p) => !p)
// //             }
// //             colSpan={9}
// //           />

// //           {incomeRows.map((row, i) => {
// //             const visible =
// //               secIncome || row.is_subtotal;

// //             if (!visible) return null;

// //             return (
// //               <PLRow
// //                 key={`income-${row.display_order ?? i}`}
// //                 row={row}
// //                 indent={!row.is_subtotal}
// //                 currency={currency}
// //                 tdStyles={MTD}
// //               />
// //             );
// //           })}

// //           {/* =========================
// //               COST OF SALES
// //           ========================= */}

// //           <SectionHeader
// //             label="COST OF SALES"
// //             expanded={secCOGS}
// //             onToggle={() =>
// //               setSecCOGS((p) => !p)
// //             }
// //             colSpan={9}
// //           />

// //           {costOfSalesRows.map((row, i) => {
// //             const visible =
// //               secCOGS || row.is_subtotal;

// //             if (!visible) return null;

// //             return (
// //               <PLRow
// //                 key={`cogs-${row.display_order ?? i}`}
// //                 row={row}
// //                 indent={!row.is_subtotal}
// //                 currency={currency}
// //                 tdStyles={MTD}
// //               />
// //             );
// //           })}

// //           {/* =========================
// //               PROFITABILITY
// //           ========================= */}

// //           <SectionHeader
// //             label="PROFITABILITY"
// //             expanded={secProfitability}
// //             onToggle={() =>
// //               setSecProfitability((p) => !p)
// //             }
// //             colSpan={9}
// //           />

// //           {profitabilityRows.map((row, i) => {
// //             const visible =
// //               secProfitability || row.is_subtotal;

// //             if (!visible) return null;

// //             return (
// //               <PLRow
// //                 key={`profitability-${row.display_order ?? i}`}
// //                 row={row}
// //                 indent={!row.is_subtotal}
// //                 currency={currency}
// //                 tdStyles={MTD}
// //               />
// //             );
// //           })}

// //           {/* =========================
// //               EXPENSES
// //           ========================= */}

// //           <SectionHeader
// //             label="EXPENSES"
// //             expanded={secExpenses}
// //             onToggle={() =>
// //               setSecExpenses((p) => !p)
// //             }
// //             colSpan={9}
// //           />

// //           {expensesRows.map((row, i) => {
// //             const visible =
// //               secExpenses || row.is_subtotal;

// //             if (!visible) return null;

// //             return (
// //               <PLRow
// //                 key={`expenses-${row.display_order ?? i}`}
// //                 row={row}
// //                 indent={!row.is_subtotal}
// //                 currency={currency}
// //                 tdStyles={MTD}
// //               />
// //             );
// //           })}

// //           {/* =========================
// //               OTHER EXPENSES
// //           ========================= */}

// //           <SectionHeader
// //             label="OTHER EXPENSES"
// //             expanded={secOtherExpenses}
// //             onToggle={() =>
// //               setSecOtherExpenses((p) => !p)
// //             }
// //             colSpan={9}
// //           />

// //           {otherExpensesRows.map((row, i) => {
// //             const visible =
// //               secOtherExpenses || row.is_subtotal;

// //             if (!visible) return null;

// //             return (
// //               <PLRow
// //                 key={`other-expenses-${row.display_order ?? i}`}
// //                 row={row}
// //                 indent={!row.is_subtotal}
// //                 currency={currency}
// //                 tdStyles={MTD}
// //               />
// //             );
// //           })}

// //         </tbody>
// //       </table>
// //     </div>
// //   );
// // }

// // /* ══════════════════════════════════════════════════════════════════
// //    MAIN PAGE COMPONENT
// // ══════════════════════════════════════════════════════════════════ */
// // export default function PLAnalytics() {

// //   /* ── Dropdown options & Filter state ─────────────────────────── */
// //   const [filterOptions, setFilterOptions] = useState({
// //     legalGroups: ['All'],
// //     legalEntities: ['All'],
// //     parentDivisions: ['All'],
// //     subdivisions: ['All'],
// //     years: [],
// //     periods: [],
// //     comparePeriods: [],
// //     currencies: ['AED'],
// //   });

// //   const [filters, setFilters] = useState(DEFAULT_FILTERS);
// //   const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

// //   // Auto-apply filters on first load once periods are loaded
// //   const [initialLoaded, setInitialLoaded] = useState(false);
// //   useEffect(() => {
// //     if (!initialLoaded && filters.periodName && filterOptions.periods.length > 0) {
// //       setAppliedFilters(filters);
// //       setInitialLoaded(true);
// //     }
// //   }, [filters.periodName, filterOptions.periods, initialLoaded]);

// //   const updateFilter = (key, val) => {
// //     setFilters(prev => {
// //       const next = { ...prev, [key]: val };
// //       if (key === 'legalGroupId') { next.legalEntityId = ['All']; next.parentDivisionId = ['All']; next.subdivisionId = ['All']; }
// //       if (key === 'legalEntityId') { next.parentDivisionId = ['All']; next.subdivisionId = ['All']; }
// //       if (key === 'parentDivisionId') { next.subdivisionId = ['All']; }
// //       return next;
// //     });
// //   };

// //   /* ── Data state ───────────────────────────────────────────────── */
// //   const [summary, setSummary] = useState(null);
// //   const [trendData, setTrendData] = useState([]);
// //   const [comparisonData, setComparisonData] = useState([]);
// //   const [expenseData, setExpenseData] = useState(null);
// //   const [statementData, setStatementData] = useState(null);

// //   /* ── Section collapse (inline table) ─────────────────────────── */
// //   const [secIncome, setSecIncome] = useState(true);
// //   const [secCOGS, setSecCOGS] = useState(true);
// //   const [secExpenses, setSecExpenses] = useState(true);
// //   const [secOtherExpenses, setSecOtherExpenses] = useState(true);
// //   const [secProfitability, setSecProfitability] = useState(true);

// //   /* ── Loading & Error ──────────────────────────────────────────── */
// //   const [loading, setLoading] = useState({
// //     filters: true, summary: true, trend: true,
// //     comparison: true, expenseBreakdown: true, statement: true,
// //   });
// //   const [errors, setErrors] = useState({});

// //   /* ── Toast ────────────────────────────────────────────────────── */
// //   const [toast, setToast] = useState(null);
// //   const showToast = (msg, type = 'success') => {
// //     setToast({ msg, type });
// //     setTimeout(() => setToast(null), 3500);
// //   };

// //   /* ── View All modal state ─────────────────────────────────────── */
// //   const [openModal, setOpenModal] = useState(null);

// //   /*
// //    * View All has its own filter state/data so changing filters inside a modal
// //    * does not change the main-page filter selections until the user chooses to
// //    * do so on the main page.
// //    */
// //   const [viewAllFilters, setViewAllFilters] = useState(null);
// //   const [viewAllFilterOptions, setViewAllFilterOptions] = useState(null);
// //   const [viewAllData, setViewAllData] = useState({
// //     summary: null,
// //     trend: [],
// //     comparison: [],
// //     expenseBreakdown: null,
// //     statement: null,
// //   });
// //   const [viewAllLoading, setViewAllLoading] = useState(false);
// //   const [viewAllExporting, setViewAllExporting] = useState(null);

// //   const closeModal = () => {
// //     setOpenModal(null);
// //     setViewAllFilters(null);
// //   };

// //   const cloneViewAllFilters = (source) => {
// //     const sourceYear = Array.isArray(source?.year) ? source.year.filter(Boolean) : (source?.year ? [source.year] : []);
// //     const sourcePeriod = Array.isArray(source?.periodName) ? source.periodName.filter(Boolean) : (source?.periodName ? [source.periodName] : []);
// //     const sourceCompare = Array.isArray(source?.comparePeriodName)
// //       ? source.comparePeriodName.filter(Boolean)
// //       : (source?.comparePeriodName ? [source.comparePeriodName] : []);

// //     return {
// //       ...source,
// //       year: sourceYear.length && sourceYear[0] !== 'All'
// //         ? [...sourceYear]
// //         : (filterOptions.years?.[0] ? [filterOptions.years[0]] : ['All']),
// //       periodName: sourcePeriod.length && sourcePeriod[0] !== 'All'
// //         ? [...sourcePeriod]
// //         : (filterOptions.periods?.[0] ? [filterOptions.periods[0]] : ['All']),
// //       comparePeriodName: sourceCompare.length ? [...sourceCompare] : [],
// //       legalEntityId: Array.isArray(source?.legalEntityId) ? [...source.legalEntityId] : ['All'],
// //       parentDivisionId: Array.isArray(source?.parentDivisionId) ? [...source.parentDivisionId] : ['All'],
// //       subdivisionId: Array.isArray(source?.subdivisionId) ? [...source.subdivisionId] : ['All'],
// //     };
// //   };

// //   const buildViewAllOptions = (options) => ({
// //     legalEntities: options?.legalEntities || filterOptions.legalEntities || ['All'],
// //     parentDivisions: options?.parentDivisions || filterOptions.parentDivisions || ['All'],
// //     subdivisions: options?.subdivisions || filterOptions.subdivisions || ['All'],
// //     years: options?.years || filterOptions.years || [],
// //     periods: options?.periods || filterOptions.periods || [],
// //     comparePeriods: options?.comparePeriods || filterOptions.comparePeriods || [],
// //   });

// //   const loadViewAllData = useCallback(async (nextFilters) => {
// //     setViewAllLoading(true);
// //     try {
// //       const [summaryResult, trendResult, comparisonResult, expenseResult, statementResult] = await Promise.all([
// //         fetchPLSummary(nextFilters),
// //         fetchPLTrend(nextFilters),
// //         fetchPLComparison(nextFilters),
// //         fetchPLExpenseBreakdown(nextFilters),
// //         fetchPLStatement(nextFilters),
// //       ]);

// //       setViewAllData({
// //         summary: summaryResult || null,
// //         trend: trendResult || [],
// //         comparison: comparisonResult || [],
// //         expenseBreakdown: expenseResult || null,
// //         statement: statementResult || null,
// //       });
// //     } catch (err) {
// //       showToast(err?.message || 'Failed to refresh View All data.', 'error');
// //     } finally {
// //       setViewAllLoading(false);
// //     }
// //   }, [showToast]);

// //   const openViewAll = useCallback(async (type) => {
// //     // Load the latest filter options first so Year is available before
// //     // the View All filters are initialized. This only affects the modal.
// //     let options = filterOptions;

// //     try {
// //       const data = await fetchPLFilters({
// //         legalGroupId: appliedFilters?.legalGroupId,
// //         legalEntityId: appliedFilters?.legalEntityId,
// //         parentDivisionId: appliedFilters?.parentDivisionId,
// //         year: appliedFilters?.year || '',
// //         periodName: appliedFilters?.periodName || '',
// //       });

// //       const periods = data?.periods || filterOptions?.periods || [];
// //       const backendCompare = data?.comparePeriods || [];
// //       const comparePeriods = [
// //         ...backendCompare,
// //         ...periods.filter(p => !backendCompare.includes(p)),
// //       ];

// //       options = {
// //         ...filterOptions,
// //         legalEntities: data?.legalEntities || filterOptions?.legalEntities || ['All'],
// //         parentDivisions: data?.parentDivisions || filterOptions?.parentDivisions || ['All'],
// //         subdivisions: data?.subdivisions || filterOptions?.subdivisions || ['All'],
// //         years: data?.years?.length ? data.years : (filterOptions?.years || []),
// //         periods,
// //         comparePeriods,
// //       };
// //     } catch (err) {
// //       // Keep existing options if the modal-specific options request fails.
// //     }

// //     const defaultYear = options?.years?.[0] || '';
// //     const defaultPeriod = options?.periods?.[0] || '';

// //     const initial = cloneViewAllFilters({
// //       ...appliedFilters,
// //       year: appliedFilters?.year || defaultYear,
// //       periodName: appliedFilters?.periodName || defaultPeriod,
// //     });

// //     setViewAllFilters(initial);
// //     setViewAllFilterOptions(buildViewAllOptions(options));
// //     setOpenModal(type);
// //     loadViewAllData(initial);
// //   }, [appliedFilters, filterOptions, loadViewAllData]);

// //   const handleViewAllExport = useCallback((format) => {
// //     if (!viewAllFilters || viewAllExporting) return;

// //     setViewAllExporting(format);
// //     exportPL(format, viewAllFilters)
// //       .then(() => showToast(`${format.toUpperCase()} export downloaded successfully.`, 'success'))
// //       .catch(err => showToast(
// //         `Export failed: ${err?.message || 'Unknown error'}. Please try again.`,
// //         'error'
// //       ))
// //       .finally(() => setViewAllExporting(null));
// //   }, [viewAllFilters, viewAllExporting]);

// //   const applyViewAllFilters = useCallback(() => {
// //     if (!viewAllFilters) return;
// //     loadViewAllData(viewAllFilters);
// //   }, [viewAllFilters, loadViewAllData]);

// //   const resetViewAllFilters = useCallback(() => {
// //     const reset = cloneViewAllFilters(appliedFilters);
// //     setViewAllFilters(reset);
// //     setViewAllFilterOptions(buildViewAllOptions(filterOptions));
// //     loadViewAllData(reset);
// //   }, [appliedFilters, filterOptions, loadViewAllData]);

// //   /* Refresh dropdown options when the View All hierarchy/year changes.
// //      Only the modal's local state is updated; the main page is untouched. */
// //   useEffect(() => {
// //     if (!openModal || !viewAllFilters) return;

// //     const optionPeriod = viewAllFilters.periodName?.[0] || '';
// //     const optionYear = viewAllFilters.year?.[0] || '';
// //     let cancelled = false;

// //     fetchPLFilters({
// //       legalEntityId: viewAllFilters.legalEntityId,
// //       parentDivisionId: viewAllFilters.parentDivisionId,
// //       year: optionYear,
// //       periodName: optionPeriod,
// //     })
// //       .then(data => {
// //         if (cancelled) return;
// //         const periods = data.periods || [];
// //         const backendCompare = data.comparePeriods || [];
// //         const comparePeriods = [
// //           ...backendCompare,
// //           ...periods.filter(p => !backendCompare.includes(p)),
// //         ];
// //         setViewAllFilterOptions({
// //           legalEntities: data.legalEntities || filterOptions.legalEntities || ['All'],
// //           parentDivisions: data.parentDivisions || filterOptions.parentDivisions || ['All'],
// //           subdivisions: data.subdivisions || filterOptions.subdivisions || ['All'],
// //           years: data.years || filterOptions.years || [],
// //           periods,
// //           comparePeriods,
// //         });
// //       })
// //       .catch(() => {
// //         // Keep the already loaded modal options if a cascading refresh fails.
// //       });

// //     return () => { cancelled = true; };
// //   }, [
// //     openModal,
// //     viewAllFilters?.year?.join('|'),
// //     viewAllFilters?.legalEntityId?.join('|'),
// //     viewAllFilters?.parentDivisionId?.join('|'),
// //   ]);

// //   /* ── Load filter options (cascading) ──────────────────────────── */
// //   useEffect(() => {
// //     setLoading(prev => ({ ...prev, filters: true }));
// //     fetchPLFilters({
// //       legalGroupId: filters.legalGroupId,
// //       legalEntityId: filters.legalEntityId,
// //       parentDivisionId: filters.parentDivisionId,
// //       year: filters.year,
// //       periodName: filters.periodName,
// //     })
// //       .then(data => {
// //         const years = data.years || [];
// //         const periods = data.periods || [];
// //         const backendCompare = data.comparePeriods || [];

// //         // Prior periods from backend (e.g. ['Jan-26'] for Feb-26)
// //         const priorPeriods = backendCompare.filter(p => p !== filters.periodName);
// //         // All other periods in fiscal year (excluding current selected period and prior periods)
// //         const otherPeriods = periods.filter(p => p !== (filters.periodName || periods[0]) && !priorPeriods.includes(p));
// //         // Combined comparison periods: prior periods first, then other available periods
// //         const comparePeriods = [...priorPeriods, ...otherPeriods];
// //         const currencies = data.currencies?.length ? data.currencies : ['AED'];

// //         setFilterOptions(prev => ({
// //           ...prev,
// //           legalGroups: data.legalGroups || [],
// //           legalEntities: data.legalEntities || [],
// //           parentDivisions: data.parentDivisions || [],
// //           subdivisions: data.subdivisions || [],
// //           years,
// //           periods,
// //           comparePeriods,
// //           currencies,
// //         }));

// //         setFilters(f => {
// //           const nextComparePeriod = comparePeriods.includes(f.comparePeriodName)
// //             ? f.comparePeriodName
// //             : (priorPeriods[0] || '');

// //           return {
// //             ...f,
// //             year: f.year || years[0] || '',
// //             periodName: f.periodName || periods[0] || '',
// //             comparePeriodName: nextComparePeriod,
// //             currency: f.currency || currencies[0] || 'AED',
// //           };
// //         });

// //         setAppliedFilters(f => {
// //           const nextComparePeriod = comparePeriods.includes(f.comparePeriodName)
// //             ? f.comparePeriodName
// //             : (priorPeriods[0] || '');

// //           return {
// //             ...f,
// //             year: f.year || years[0] || '',
// //             periodName: f.periodName || periods[0] || '',
// //             comparePeriodName: nextComparePeriod,
// //             currency: f.currency || currencies[0] || 'AED',
// //           };
// //         });
// //       })
// //       .catch(err => setErrors(prev => ({ ...prev, filters: err?.message || 'Failed to load filters' })))
// //       .finally(() => setLoading(prev => ({ ...prev, filters: false })));
// //   }, [filters.legalGroupId, filters.legalEntityId, filters.parentDivisionId, filters.year, filters.periodName]);

// //   /* ── Fetch all data ───────────────────────────────────────────── */
// //   const fetchAll = useCallback((f) => {
// //     setLoading({ filters: false, summary: true, trend: true, comparison: true, expenseBreakdown: true, statement: true });
// //     setErrors({});
// //     const guard = (key, promise) =>
// //       promise
// //         .catch(err => { setErrors(prev => ({ ...prev, [key]: err?.message || 'Failed to load data' })); return null; })
// //         .finally(() => setLoading(prev => ({ ...prev, [key]: false })));

// //     guard('summary', fetchPLSummary(f)).then(d => { if (d) setSummary(d); });
// //     guard('trend', fetchPLTrend(f)).then(d => { if (d) setTrendData(d); });
// //     guard('comparison', fetchPLComparison(f)).then(d => { if (d) setComparisonData(d); });
// //     guard('expenseBreakdown', fetchPLExpenseBreakdown(f)).then(d => { if (d) setExpenseData(d); });
// //     guard('statement', fetchPLStatement(f)).then(d => { if (d) setStatementData(d); });
// //   }, []);

// //   useEffect(() => {
// //     if (appliedFilters.periodName) fetchAll(appliedFilters);
// //   }, [appliedFilters.periodName, fetchAll]);

// //   /* ── Filter handlers ──────────────────────────────────────────── */
// //   const handleApply = () => { setAppliedFilters({ ...filters }); fetchAll({ ...filters }); };
// //   const handleReset = () => {
// //     const reset = {
// //       ...DEFAULT_FILTERS,
// //       year: filterOptions.years[0] || '',
// //       periodName: filterOptions.periods[0] || '',
// //       comparePeriodName: '',
// //       currency: filterOptions.currencies[0] || 'AED',
// //     };
// //     setFilters(reset); setAppliedFilters(reset); fetchAll(reset);
// //   };

// //   /* ── Export handler ───────────────────────────────────────────── */
// //   const [exporting, setExporting] = useState(null);
// //   const handleExport = (format, section = 'full') => {
// //     if (exporting) return;
// //     setExporting(format);
// //     exportPL(format, appliedFilters)
// //       .then(() => showToast(`${format.toUpperCase()} export downloaded successfully.`, 'success'))
// //       .catch(err => showToast(
// //         `Export failed: ${err?.message || 'Unknown error'}. Please try again.`,
// //         'error'
// //       ))
// //       .finally(() => setExporting(null));
// //   };

// //   /* ── Derived values ───────────────────────────────────────────── */
// //   const currency = appliedFilters.currency || 'AED';
// //   const compareLbl = appliedFilters.comparePeriodName ? `vs ${appliedFilters.comparePeriodName}` : '';
// //   const periodLabel = appliedFilters.periodName || 'Current';
// //   const compareLabel = appliedFilters.comparePeriodName || 'Compare';
// //   const priorLabel = 'Prior Year';
// //   const expenseItems = expenseData?.items || (Array.isArray(expenseData?.data) ? expenseData.data : []);
// //   const totalExpenses = expenseData?.total_expenses
// //     ?? expenseItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

// //   /* ── KPI card definitions ─────────────────────────────────────── */
// //   const kpiCards = [
// //     { id: 'total-rev', label: 'Total Revenue (PTD)', value: fmtKPI(summary?.total_revenue, currency), subValue: null, changePct: summary?.revenue_variance_pct, compareLabel: compareLbl, color: '#2563eb', iconBg: '#eff6ff', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg> },
// //     { id: 'gross-profit', label: 'Gross Profit (PTD)', value: fmtKPI(summary?.gross_profit, currency), subValue: summary?.gross_profit_pct ? `Margin: ${fmtPct(summary.gross_profit_pct)}` : null, changePct: summary?.gross_profit_variance_pct, compareLabel: compareLbl, color: '#16a34a', iconBg: '#f0fdf4', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fillOpacity="0.85" /></svg> },
// //     { id: 'ebitda', label: 'EBITDA (PTD)', value: fmtKPI(summary?.ebitda, currency), subValue: summary?.ebitda_pct ? `Margin: ${fmtPct(summary.ebitda_pct)}` : null, changePct: summary?.ebitda_variance_pct, compareLabel: compareLbl, color: '#7c3aed', iconBg: '#faf5ff', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg> },
// //     { id: 'net-profit', label: 'Net Profit (PTD)', value: fmtKPI(summary?.net_profit, currency), subValue: null, changePct: summary?.net_profit_variance_pct, compareLabel: compareLbl, color: '#ea580c', iconBg: '#fff7ed', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" /><path d="M12 18V6" /></svg> },
// //     { id: 'np-margin', label: 'Net Profit Margin (PTD)', value: fmtPct(summary?.net_profit_pct), subValue: null, changePct: summary && summary.net_profit_pct != null && summary.compare_net_profit_pct != null ? +(summary.net_profit_pct - summary.compare_net_profit_pct).toFixed(2) : null, compareLabel: compareLbl, color: '#0d9488', iconBg: '#f0fdfa', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 4.5C4.5 4.5 2 7 2 10s2.5 5.5 5.5 5.5S13 13 13 10 10.5 4.5 7.5 4.5zm0 9C5.57 13.5 4 11.93 4 10s1.57-3.5 3.5-3.5S11 8.07 11 10s-1.57 3.5-3.5 3.5z" fillOpacity="0.9" /><path d="M19 8l-7 8M14 4h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></svg> },
// //     { id: 'ebitda-margin', label: 'EBITDA Margin (PTD)', value: fmtPct(summary?.ebitda_pct), subValue: null, changePct: summary && summary.ebitda_pct != null && summary.compare_ebitda_pct != null ? +(summary.ebitda_pct - summary.compare_ebitda_pct).toFixed(2) : null, compareLabel: compareLbl, color: '#db2777', iconBg: '#fdf2f8', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.12" /><polyline points="12 6 12 12 16 14" /></svg> },
// //   ];

// //   /* ── Kebab menu definitions ───────────────────────────────────── */
// //   const makeExportItems = (section) => [
// //     { icon: '📊', label: 'Export Excel', action: () => handleExport('excel', section) },
// //     { icon: '📄', label: 'Export PDF', action: () => handleExport('pdf', section) },
// //   ];

// //   const kpiMenuItems = [{ icon: '🔎', label: 'View All', action: () => openViewAll('kpi') }, ...makeExportItems('kpi')];
// //   const trendMenuItems = [{ icon: '🔎', label: 'View All', action: () => openViewAll('trend') }, ...makeExportItems('trend')];
// //   const compMenuItems = [{ icon: '🔎', label: 'View All', action: () => openViewAll('comparison') }, ...makeExportItems('comparison')];
// //   const expenseMenuItems = [{ icon: '🔎', label: 'View All', action: () => openViewAll('expense') }, ...makeExportItems('expense')];
// //   const statementMenuItems = [{ icon: '🔎', label: 'View All', action: () => openViewAll('statement') }, ...makeExportItems('statement')];


// //   const statementRows = Array.isArray(statementData?.rows)
// //     ? statementData.rows
// //     : Array.isArray(statementData?.data)
// //       ? statementData.data
// //       : Array.isArray(statementData)
// //         ? statementData
// //         : [];

// //   const getStatementSection = (section) =>
// //     statementRows
// //       .filter(
// //         (row) =>
// //           String(row.section || '').toUpperCase() === section
// //       )
// //       .sort(
// //         (a, b) =>
// //           Number(a.display_order || 0) -
// //           Number(b.display_order || 0)
// //       );

// //   const incomeRows = getStatementSection('INCOME');
// //   const costOfSalesRows = getStatementSection('COST OF SALES');
// //   const expensesRows = getStatementSection('EXPENSES');
// //   const otherExpensesRows = getStatementSection('OTHER EXPENSES');
// //   const profitabilityRows = getStatementSection('PROFITABILITY');

// //   /* ══════════════════════════════════════════════════════════════════
// //      RENDER
// //   ══════════════════════════════════════════════════════════════════ */
// //   return (
// //     <div className="animate-in" style={{ width: '100%', maxWidth: 'none', padding: '20px 0 40px', background: C.bg, minHeight: '100%' }}>

// //       <style>{`
// //         @keyframes shimmer  { from { background-position: 200% 0; } to { background-position: -200% 0; } }
// //         @keyframes fadeIn   { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
// //         @keyframes menuPop  { from { opacity: 0; transform: scale(0.94) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
// //         @keyframes modalPop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
// //       `}</style>

// //       {toast && <ExportToast message={toast.msg} type={toast.type} />}

// //       {/* ══ VIEW ALL MODALS ══ */}
// //       {viewAllFilters && viewAllFilterOptions && (
// //         <>
// //           <ViewAllModal isOpen={openModal === 'kpi'} onClose={closeModal} title="KPI Summary" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'All'}`}>
// //             <ViewAllFilterBar
// //               filters={viewAllFilters}
// //               setFilters={setViewAllFilters}
// //               filterOptions={viewAllFilterOptions}
// //               onApply={applyViewAllFilters}
// //               onReset={resetViewAllFilters}
// //               onExport={handleViewAllExport}
// //               exporting={viewAllExporting}
// //               loading={viewAllLoading}
// //             />
// //             {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={220} /></div> : (
// //               <KPISummaryViewAll
// //                 summary={viewAllData.summary}
// //                 currency={currency}
// //                 periodName={(viewAllFilters.periodName || []).join(', ')}
// //                 comparePeriodName={(viewAllFilters.comparePeriodName || []).join(', ')}
// //               />
// //             )}
// //           </ViewAllModal>

// //           <ViewAllModal isOpen={openModal === 'trend'} onClose={closeModal} title="P&L Trend — All Periods" subtitle={`Currency: ${currency}`}>
// //             <ViewAllFilterBar
// //               filters={viewAllFilters}
// //               setFilters={setViewAllFilters}
// //               filterOptions={viewAllFilterOptions}
// //               onApply={applyViewAllFilters}
// //               onReset={resetViewAllFilters}
// //               onExport={handleViewAllExport}
// //               exporting={viewAllExporting}
// //               loading={viewAllLoading}
// //             />
// //             {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={220} /></div> : <TrendViewAll data={viewAllData.trend} currency={currency} />}
// //           </ViewAllModal>

// //           <ViewAllModal isOpen={openModal === 'comparison'} onClose={closeModal} title="P&L Comparison" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'Current'}`}>
// //             <ViewAllFilterBar
// //               filters={viewAllFilters}
// //               setFilters={setViewAllFilters}
// //               filterOptions={viewAllFilterOptions}
// //               onApply={applyViewAllFilters}
// //               onReset={resetViewAllFilters}
// //               onExport={handleViewAllExport}
// //               exporting={viewAllExporting}
// //               loading={viewAllLoading}
// //             />
// //             {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={220} /></div> : (
// //               <ComparisonViewAll
// //                 data={viewAllData.comparison}
// //                 currency={currency}
// //                 periodLabel={(viewAllFilters.periodName || []).join(', ')}
// //                 compareLabel={(viewAllFilters.comparePeriodName || []).join(', ')}
// //               />
// //             )}
// //           </ViewAllModal>

// //           <ViewAllModal isOpen={openModal === 'expense'} onClose={closeModal} title="Expense Breakdown" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'All'} | Currency: ${currency}`}>
// //             <ViewAllFilterBar
// //               filters={viewAllFilters}
// //               setFilters={setViewAllFilters}
// //               filterOptions={viewAllFilterOptions}
// //               onApply={applyViewAllFilters}
// //               onReset={resetViewAllFilters}
// //               onExport={handleViewAllExport}
// //               exporting={viewAllExporting}
// //               loading={viewAllLoading}
// //             />
// //             {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={220} /></div> : (
// //               <ExpenseViewAll
// //                 data={viewAllData.expenseBreakdown}
// //                 totalExpenses={viewAllData.expenseBreakdown?.total_expenses ?? 0}
// //                 currency={currency}
// //               />
// //             )}
// //           </ViewAllModal>

// //           <ViewAllModal isOpen={openModal === 'statement'} onClose={closeModal} title="Profit & Loss Statement" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'All'} | All values in ${currency}`}>
// //             <ViewAllFilterBar
// //               filters={viewAllFilters}
// //               setFilters={setViewAllFilters}
// //               filterOptions={viewAllFilterOptions}
// //               onApply={applyViewAllFilters}
// //               onReset={resetViewAllFilters}
// //               onExport={handleViewAllExport}
// //               exporting={viewAllExporting}
// //               loading={viewAllLoading}
// //             />
// //             {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={300} /></div> : (
// //               <StatementViewAll
// //                 incomeRows={(viewAllData.statement?.rows || []).filter(row => String(row.section || '').toUpperCase() === 'INCOME').sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))}
// //                 costOfSalesRows={(viewAllData.statement?.rows || []).filter(row => String(row.section || '').toUpperCase() === 'COST OF SALES').sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))}
// //                 profitabilityRows={(viewAllData.statement?.rows || []).filter(row => String(row.section || '').toUpperCase() === 'PROFITABILITY').sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))}
// //                 expensesRows={(viewAllData.statement?.rows || []).filter(row => String(row.section || '').toUpperCase() === 'EXPENSES').sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))}
// //                 otherExpensesRows={(viewAllData.statement?.rows || []).filter(row => String(row.section || '').toUpperCase() === 'OTHER EXPENSES').sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))}
// //                 currency={currency}
// //                 periodName={(viewAllFilters.periodName || []).join(', ')}
// //                 comparePeriodName={(viewAllFilters.comparePeriodName || []).join(', ')}
// //               />
// //             )}
// //           </ViewAllModal>
// //         </>
// //       )}

// //       {/* ══ PAGE HEADER ══ */}
// //       <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
// //         <div>
// //           <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.navy, margin: 0 }}>Profitability Analysis</h1>
// //           <p style={{ fontSize: '0.76rem', color: C.slate, margin: '3px 0 0' }}>
// //             Analyze profitability metrics and track financial performance across periods
// //           </p>
// //         </div>
// //         <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
// //           <select id="pl-currency" value={filters.currency} onChange={e => setFilters(prev => ({ ...prev, currency: e.target.value }))}
// //             style={{ ...selStyle, width: 80, fontSize: '0.74rem', padding: '7px 22px 7px 8px' }} title="Select currency">
// //             {filterOptions.currencies.map(c => <option key={c}>{c}</option>)}
// //           </select>
// //           <button id="btn-pl-export-excel" onClick={() => handleExport('excel')} disabled={!!exporting}
// //             style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: exporting?.includes('excel') ? '#d1fae5' : '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: '0.76rem', fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.7 : 1 }}>
// //             {exporting?.includes('excel') ? '⏳' : '📊'} Excel
// //           </button>
// //           <button id="btn-pl-export-pdf" onClick={() => handleExport('pdf')} disabled={!!exporting}
// //             style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: exporting?.includes('pdf') ? '#fee2e2' : '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', borderRadius: 8, fontSize: '0.76rem', fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.7 : 1 }}>
// //             {exporting?.includes('pdf') ? '⏳' : '📄'} PDF
// //           </button>
// //         </div>
// //       </div>

// //       {/* ══ FILTER BAR ══ */}
// //       <div className="card" style={{ padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'flex-end', gap: 4, flexWrap: 'nowrap' }}>
// //         <FilterField label="Legal Group">
// //           <MultiSelect options={filterOptions.legalGroups} value={filters.legalGroupId} onChange={v => updateFilter('legalGroupId', v)} style={{ width: 150 }} />
// //         </FilterField>
// //         <FilterField label="Legal Entity">
// //           <MultiSelect options={filterOptions.legalEntities} value={filters.legalEntityId} onChange={v => updateFilter('legalEntityId', v)} style={{ width: 150 }} />
// //         </FilterField>
// //         <FilterField label="Parent Division">
// //           <MultiSelect options={filterOptions.parentDivisions} value={filters.parentDivisionId} onChange={v => updateFilter('parentDivisionId', v)} style={{ width: 150 }} />
// //         </FilterField>
// //         <FilterField label="Sub-Division">
// //           <MultiSelect options={filterOptions.subdivisions} value={filters.subdivisionId} onChange={v => updateFilter('subdivisionId', v)} style={{ width: 150 }} />
// //         </FilterField>
// //         <FilterField label="Year" style={{ minWidth: 70, flex: '0.7 1 0' }}>
// //           <select id="filter-pl-year" style={selStyle} value={filters.year} onChange={e => setFilters(prev => ({ ...prev, year: e.target.value }))} disabled={loading.filters}>
// //             {filterOptions.years.length === 0 && <option key="loading" value="">Loading…</option>}
// //             {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
// //           </select>
// //         </FilterField>
// //         <FilterField label="Period" style={{ minWidth: 90, flex: '0.8 1 0' }}>
// //           <select id="filter-pl-period" style={selStyle} value={filters.periodName} onChange={e => setFilters(prev => ({ ...prev, periodName: e.target.value }))} disabled={loading.filters}>
// //             {filterOptions.periods.length === 0 && <option key="loading" value="">Loading…</option>}
// //             {filterOptions.periods.map(p => <option key={p} value={p}>{p}</option>)}
// //           </select>
// //         </FilterField>
// //         <FilterField label="Compare With" style={{ minWidth: 125, flex: '1.2 1 0' }}>
// //           <select
// //             id="filter-pl-compare"
// //             style={selStyle}
// //             value={filters.comparePeriodName}
// //             onChange={(e) =>
// //               setFilters((prev) => ({
// //                 ...prev,
// //                 comparePeriodName: e.target.value,
// //               }))
// //             }
// //             disabled={loading.filters}
// //           >
// //             <option value="">None</option>
// //             {filterOptions.comparePeriods.map((period) => (
// //               <option key={period} value={period}>
// //                 {period}
// //               </option>
// //             ))}
// //           </select>
// //         </FilterField>
// //         <button id="btn-pl-apply" onClick={handleApply} style={{ padding: '7px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end', whiteSpace: 'nowrap' }}>Apply</button>
// //         <button id="btn-pl-reset" onClick={handleReset} style={{ background: 'none', border: 'none', color: C.slate, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', alignSelf: 'flex-end', padding: '7px 4px', whiteSpace: 'nowrap' }}>Reset</button>
// //       </div>

// //       {errors.filters && <ErrorBanner message={errors.filters} />}

// //       {/* ══ KPI CARDS ══ */}
// //       <div className="card" style={{ padding: '12px 16px', marginBottom: 18 }}>
// //         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
// //           <span style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>Key Performance Indicators</span>
// //           <KebabMenu id="menu-kpi" items={kpiMenuItems} />
// //         </div>
// //         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
// //           {kpiCards.map(kpi => <KPICard key={kpi.id} {...kpi} loading={loading.summary} error={errors.summary} />)}
// //         </div>
// //       </div>

// //       {/* ══ CHARTS ROW ══ */}
// //       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }}>

// //         {/* P&L Trend */}
// //         <PLTrendCard
// //           data={trendData}
// //           loading={loading.trend}
// //           currency={currency}
// //         />

// //         {/* P&L Comparison */}
// //         <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
// //           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
// //             <div>
// //               <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>P&amp;L Comparison</div>
// //               <div style={{ fontSize: '0.65rem', color: C.muted, marginTop: 1 }}>{periodLabel} vs {compareLabel} vs {priorLabel}</div>
// //             </div>
// //             <KebabMenu id="menu-comparison" items={compMenuItems} />
// //           </div>
// //           {errors.comparison ? <ErrorBanner message={errors.comparison} onRetry={() => fetchAll(appliedFilters)} />
// //             : (
// //               <PLComparisonCard
// //                 data={comparisonData}
// //                 loading={loading.comparison}
// //                 currency={currency}
// //                 periodLabel={periodLabel}
// //                 compareLabel={compareLabel}
// //                 priorLabel={priorLabel}
// //               />
// //             )
// //           }
// //         </div>

// //         {/* Expense Breakdown */}
// //         <ExpenseBreakdownCard
// //           data={expenseItems}
// //           loading={loading.expenseBreakdown}
// //           currency={currency}
// //           error={errors.expenseBreakdown}
// //           onRetry={() => fetchAll(appliedFilters)}
// //           menuItems={expenseMenuItems}
// //           KebabMenu={KebabMenu}
// //           ErrorBanner={ErrorBanner}
// //           Skeleton={Skeleton}
// //         />
// //       </div>

// //       {/* ══ P&L STATEMENT TABLE ══ */}
// //       <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 8 }}>
// //         <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, background: 'linear-gradient(90deg,#f8fafc,#fff)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
// //           <div>
// //             <span style={{ fontWeight: 800, fontSize: '0.88rem', color: C.navy }}>Profit &amp; Loss Statement</span>
// //             <span style={{ fontSize: '0.7rem', color: C.slate, marginLeft: 12 }}>
// //               {appliedFilters.periodName} &nbsp;|&nbsp; All values in {currency}
// //             </span>
// //           </div>
// //           <KebabMenu id="menu-statement" items={statementMenuItems} />
// //         </div>

// //         {errors.statement ? (
// //           <div style={{ padding: 16 }}><ErrorBanner message={errors.statement} onRetry={() => fetchAll(appliedFilters)} /></div>
// //         ) : loading.statement ? (
// //           <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
// //             {[...Array(8)].map((_, i) => <Skeleton key={i} h={24} w={`${60 + (i % 3) * 15}%`} />)}
// //           </div>
// //         ) : (
// //           <div style={{ overflowX: 'auto' }}>
// //             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
// //               <thead>
// //                 <tr>
// //                   <th
// //                     style={{
// //                       ...TH_L,
// //                       width: '25%',
// //                       minWidth: 250,
// //                     }}
// //                   >
// //                     Particulars
// //                     <br />
// //                     <span
// //                       style={{
// //                         fontWeight: 400,
// //                         opacity: 0.75,
// //                       }}
// //                     >
// //                       (in {currency})
// //                     </span>
// //                   </th>

// //                   <th style={TH}>
// //                     Current PTD
// //                     <br />
// //                     <span
// //                       style={{
// //                         fontWeight: 400,
// //                         opacity: 0.75,
// //                       }}
// //                     >
// //                       {appliedFilters.periodName}
// //                     </span>
// //                   </th>

// //                   <th style={TH}>
// //                     Compare PTD
// //                     <br />
// //                     <span
// //                       style={{
// //                         fontWeight: 400,
// //                         opacity: 0.75,
// //                       }}
// //                     >
// //                       {appliedFilters.comparePeriodName || '—'}
// //                     </span>
// //                   </th>

// //                   <th style={TH}>
// //                     Target PTD
// //                   </th>

// //                   <th style={TH}>
// //                     Var % Current
// //                     <br />
// //                     <span
// //                       style={{
// //                         fontWeight: 400,
// //                         opacity: 0.75,
// //                       }}
// //                     >
// //                       vs Compare
// //                     </span>
// //                   </th>

// //                   <th style={TH}>
// //                     Var % Current
// //                     <br />
// //                     <span
// //                       style={{
// //                         fontWeight: 400,
// //                         opacity: 0.75,
// //                       }}
// //                     >
// //                       vs Target
// //                     </span>
// //                   </th>

// //                   <th style={TH}>
// //                     Current YTD
// //                   </th>

// //                   <th style={TH}>
// //                     Target YTD
// //                   </th>

// //                   <th style={TH}>
// //                     Var % YTD
// //                     <br />
// //                     <span
// //                       style={{
// //                         fontWeight: 400,
// //                         opacity: 0.75,
// //                       }}
// //                     >
// //                       vs Target
// //                     </span>
// //                   </th>
// //                 </tr>
// //               </thead>
// //               <tbody>

// //                 {/* ============================================================
// //       INCOME
// //   ============================================================ */}
// //                 <SectionHeader
// //                   label="INCOME"
// //                   expanded={secIncome}
// //                   onToggle={() => setSecIncome((p) => !p)}
// //                   colSpan={9}
// //                 />

// //                 {incomeRows.map((row, i) => {
// //                   const visible =
// //                     secIncome || row.is_subtotal;

// //                   if (!visible) return null;

// //                   return (
// //                     <PLRow
// //                       key={`income-${row.display_order ?? i}`}
// //                       row={row}
// //                       indent={!row.is_subtotal}
// //                       currency={currency}
// //                     />
// //                   );
// //                 })}


// //                 {/* ============================================================
// //       COST OF SALES
// //   ============================================================ */}
// //                 <SectionHeader
// //                   label="COST OF SALES"
// //                   expanded={secCOGS}
// //                   onToggle={() => setSecCOGS((p) => !p)}
// //                   colSpan={9}
// //                 />

// //                 {costOfSalesRows.map((row, i) => {
// //                   const visible =
// //                     secCOGS || row.is_subtotal;

// //                   if (!visible) return null;

// //                   return (
// //                     <PLRow
// //                       key={`cogs-${row.display_order ?? i}`}
// //                       row={row}
// //                       indent={!row.is_subtotal}
// //                       currency={currency}
// //                     />
// //                   );
// //                 })}


// //                 {/* ============================================================
// //       PROFITABILITY
// //       Gross Profit / EBITDA / PBT / Net Profit stay visible
// //       even when collapsed because they are subtotals.
// //   ============================================================ */}
// //                 <SectionHeader
// //                   label="PROFITABILITY"
// //                   expanded={secProfitability}
// //                   onToggle={() =>
// //                     setSecProfitability((p) => !p)
// //                   }
// //                   colSpan={9}
// //                 />

// //                 {profitabilityRows.map((row, i) => {
// //                   const visible =
// //                     secProfitability || row.is_subtotal;

// //                   if (!visible) return null;

// //                   return (
// //                     <PLRow
// //                       key={`profitability-${row.display_order ?? i}`}
// //                       row={row}
// //                       indent={!row.is_subtotal}
// //                       currency={currency}
// //                     />
// //                   );
// //                 })}


// //                 {/* ============================================================
// //       EXPENSES
// //   ============================================================ */}
// //                 <SectionHeader
// //                   label="EXPENSES"
// //                   expanded={secExpenses}
// //                   onToggle={() => setSecExpenses((p) => !p)}
// //                   colSpan={9}
// //                 />

// //                 {expensesRows.map((row, i) => {
// //                   const visible =
// //                     secExpenses || row.is_subtotal;

// //                   if (!visible) return null;

// //                   return (
// //                     <PLRow
// //                       key={`expenses-${row.display_order ?? i}`}
// //                       row={row}
// //                       indent={!row.is_subtotal}
// //                       currency={currency}
// //                     />
// //                   );
// //                 })}


// //                 {/* ============================================================
// //       OTHER EXPENSES
// //   ============================================================ */}
// //                 <SectionHeader
// //                   label="OTHER EXPENSES"
// //                   expanded={secOtherExpenses}
// //                   onToggle={() =>
// //                     setSecOtherExpenses((p) => !p)
// //                   }
// //                   colSpan={9}
// //                 />

// //                 {otherExpensesRows.map((row, i) => {
// //                   const visible =
// //                     secOtherExpenses || row.is_subtotal;

// //                   if (!visible) return null;

// //                   return (
// //                     <PLRow
// //                       key={`other-expenses-${row.display_order ?? i}`}
// //                       row={row}
// //                       indent={!row.is_subtotal}
// //                       currency={currency}
// //                     />
// //                   );
// //                 })}

// //               </tbody>
// //             </table>
// //           </div>
// //         )}
// //       </div>

// //       {/* ══ FOOTER ══ */}
// //       <div style={{ fontSize: '0.64rem', color: C.muted, display: 'flex', justifyContent: 'space-between', paddingTop: 8, flexWrap: 'wrap', gap: 4 }}>
// //         <span>All values in {currency} &nbsp;|&nbsp; Period: {appliedFilters.periodName || '—'} &nbsp;|&nbsp; Compared with: {appliedFilters.comparePeriodName || '—'}</span>
// //         <span>☁️ Source: Oracle Fusion Cloud</span>
// //       </div>

// //     </div>
// //   );
// // }



// import { useState, useEffect, useCallback, useRef } from 'react';
// import { createPortal } from 'react-dom';
// import {
//   LineChart, Line, BarChart, Bar, XAxis, YAxis,
//   CartesianGrid, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell,
// } from 'recharts';
// import {
//   fetchPLFilters,
//   fetchPLSummary,
//   fetchPLTrend,
//   fetchPLComparison,
//   fetchPLExpenseBreakdown,
//   fetchPLStatement,
//   exportPL,
// } from '../services/plApi';
// import { C, CHART_COLORS } from '../utils/theme';
// import PLTrendCard from '../components/Charts/PLTrendCard';
// import PLComparisonCard from '../components/Charts/PLComparisonCard';
// import ExpenseBreakdownCard from '../components/Charts/ExpenseBreakdownCard';

// /* ══════════════════════════════════════════════════════════════════
//    CONSTANTS & DEFAULTS
// ══════════════════════════════════════════════════════════════════ */
// const DEFAULT_FILTERS = {
//   legalGroupId: ['All'],
//   legalEntityId: ['All'],
//   parentDivisionId: ['All'],
//   subdivisionId: ['All'],
//   year: '',
//   periodName: '',
//   comparePeriodName: '',
//   currency: 'AED',
// };

// const EXPENSE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#a855f7', '#f43f5e'];

// /* ══════════════════════════════════════════════════════════════════
//    SHARED STYLES
// ══════════════════════════════════════════════════════════════════ */
// const selStyle = {
//   appearance: 'none', padding: '6px 28px 6px 10px',
//   fontSize: '0.78rem', fontWeight: 500, color: '#334155',
//   background: '#fff', border: `1px solid ${C.border}`,
//   borderRadius: 7, cursor: 'pointer', outline: 'none', width: '100%',
//   backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
//   backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
// };

// const TH = {
//   padding: '10px 12px', textAlign: 'right', fontSize: '0.72rem',
//   fontWeight: 700, color: '#1e3a8a', background: '#f8fafc',
//   borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap',
// };
// const TH_L = { ...TH, textAlign: 'left' };
// const TD = { padding: '8px 12px', textAlign: 'right', fontSize: '0.74rem', color: '#334155', borderBottom: '1px solid #f1f5f9' };
// const TD_L = { ...TD, textAlign: 'left', color: C.navy };

// /* ══════════════════════════════════════════════════════════════════
//    HELPER COMPONENTS
// ══════════════════════════════════════════════════════════════════ */

// function Skeleton({ h = 20, w = '100%', radius = 6 }) {
//   return (
//     <div style={{
//       height: h, width: w, borderRadius: radius,
//       background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)',
//       backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
//     }} />
//   );
// }

// function ErrorBanner({ message, onRetry }) {
//   return (
//     <div style={{
//       background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10,
//       padding: '10px 16px', display: 'flex', alignItems: 'center',
//       justifyContent: 'space-between', gap: 4, fontSize: '0.78rem', color: '#be123c', marginTop: 8,
//     }}>
//       <span>⚠ {message}</span>
//       {onRetry && (
//         <button onClick={onRetry} style={{
//           background: '#be123c', color: '#fff', border: 'none',
//           borderRadius: 6, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
//         }}>Retry</button>
//       )}
//     </div>
//   );
// }

// function FilterField({ label, children, style }) {
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 80, flex: '1 1 0', ...style }}>
//       <span style={{ fontSize: '0.66rem', color: '#1e3a8a', fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
//         {label}
//       </span>
//       {children}
//     </div>
//   );
// }

// function ExportToast({ message, type }) {
//   if (!message) return null;
//   const isErr = type === 'error';
//   const isInfo = type === 'info';
//   const bg = isErr ? '#fff1f2' : isInfo ? '#eff6ff' : '#f0fdf4';
//   const border = isErr ? '#fecdd3' : isInfo ? '#bfdbfe' : '#bbf7d0';
//   const color = isErr ? '#be123c' : isInfo ? '#1d4ed8' : '#15803d';
//   const icon = isErr ? '⚠ ' : isInfo ? 'ℹ ' : '✓ ';
//   return (
//     <div style={{
//       position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
//       background: bg, border: `1px solid ${border}`, color,
//       borderRadius: 10, padding: '10px 18px',
//       fontSize: '0.78rem', fontWeight: 700,
//       boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
//       display: 'flex', alignItems: 'center', gap: 4,
//       animation: 'fadeIn 0.2s ease', maxWidth: 380,
//     }}>
//       {icon}{message}
//     </div>
//   );
// }

// /* ── Three-dot Kebab Menu ─────────────────────────────────────── */
// function KebabMenu({ id, items }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     if (!open) return;
//     const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, [open]);

//   return (
//     <div ref={ref} style={{ position: 'relative' }}>
//       <button
//         id={id}
//         onClick={() => setOpen(v => !v)}
//         title="Options"
//         style={{
//           background: open ? '#f1f5f9' : 'none',
//           border: 'none', cursor: 'pointer',
//           padding: '4px 7px', borderRadius: 6,
//           fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1,
//           display: 'flex', alignItems: 'center', outline: 'none',
//           transition: 'background 0.15s',
//         }}
//       >
//         ⋮
//       </button>

//       {open && (
//         <div style={{
//           position: 'absolute', right: 0, top: 'calc(100% + 4px)',
//           background: '#fff', borderRadius: 10,
//           boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
//           border: '1px solid #e2e8f0',
//           minWidth: 170, zIndex: 200, overflow: 'hidden',
//           animation: 'menuPop 0.14s cubic-bezier(0.34,1.56,0.64,1) forwards',
//         }}>
//           {items.map((item, i) => (
//             <button
//               key={i}
//               onClick={() => { item.action(); setOpen(false); }}
//               disabled={item.disabled}
//               style={{
//                 display: 'flex', alignItems: 'center', gap: 4,
//                 width: '100%', textAlign: 'left',
//                 padding: '9px 14px', background: 'none', border: 'none',
//                 fontSize: '0.74rem', fontWeight: 600, color: item.danger ? '#be123c' : '#334155',
//                 cursor: item.disabled ? 'not-allowed' : 'pointer',
//                 borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
//                 opacity: item.disabled ? 0.5 : 1,
//                 transition: 'background 0.1s',
//               }}
//               onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = '#f8fafc'; }}
//               onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
//             >
//               <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
//               {item.label}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ── View All Modal ───────────────────────────────────────────── */
// function MultiSelect({ options, value, onChange, placeholder = 'All', style }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);
//   useEffect(() => {
//     const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
//     document.addEventListener('mousedown', h);
//     return () => document.removeEventListener('mousedown', h);
//   }, []);

//   const normOptions = options.map(o => {
//     if (typeof o === 'string') return { id: o, name: o };
//     const id = o.value !== undefined ? o.value : o.id;
//     const name = o.label !== undefined ? o.label : o.name;
//     return { id, name };
//   });

//   const normalizedValue = Array.isArray(value)
//     ? value
//     : value
//       ? [value]
//       : [];

//   const isAll = normalizedValue.length === 0 || (normalizedValue.length === 1 && String(normalizedValue[0]) === 'All');
//   const toggle = (optId) => {
//     if (String(optId) === 'All') { onChange(['All']); return; }
//     const cur = isAll ? [] : normalizedValue.filter(v => String(v) !== 'All');
//     const next = cur.some(v => String(v) === String(optId))
//       ? cur.filter(v => String(v) !== String(optId))
//       : [...cur, optId];
//     onChange(next.length === 0 ? ['All'] : next);
//   };

//   const selectedVals = normOptions.filter(o => normalizedValue.some(v => String(v) === String(o.id)));
//   const label = isAll ? placeholder : selectedVals.length === 1 ? selectedVals[0].name : (selectedVals.length + ' selected');

//   return (
//     <div ref={ref} style={{ position: 'relative', ...style }}>
//       <div onClick={() => setOpen(o => !o)} style={{ ...selStyle, backgroundImage: 'none', appearance: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', userSelect: 'none' }}>
//         <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85%' }}>{label}</span>
//         <span style={{ fontSize: '0.65rem', color: '#94a3b8', flexShrink: 0 }}>{open ? '\u25B2' : '\u25BC'}</span>
//       </div>
//       {open && (
//         <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: '220px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 500, marginTop: 2, maxHeight: 200, overflowY: 'auto' }}>

//           <div onClick={() => toggle('All')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', cursor: 'pointer', fontSize: '0.78rem', background: isAll ? '#eff6ff' : '#fff', color: isAll ? '#2563eb' : '#334155', fontWeight: isAll ? 600 : 400, borderBottom: '1px solid #f8fafc', whiteSpace: 'normal', lineHeight: 1.25 }} onMouseEnter={e => { if (!isAll) e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={e => { if (!isAll) e.currentTarget.style.background = '#fff'; }}>
//             <span style={{ width: 14, height: 14, border: '1.5px solid ' + (isAll ? '#2563eb' : '#cbd5e1'), borderRadius: 3, background: isAll ? '#2563eb' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//               {isAll && <span style={{ color: '#fff', fontSize: '0.6rem', lineHeight: 1 }}>✓</span>}
//             </span>
//             All
//           </div>

//           {normOptions.map(opt => {
//             if (opt.id === 'All') return null;
//             const selected = !isAll && normalizedValue.some(v => String(v) === String(opt.id));
//             return (
//               <div key={opt.id} onClick={() => toggle(opt.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', cursor: 'pointer', fontSize: '0.78rem', background: selected ? '#eff6ff' : '#fff', color: selected ? '#2563eb' : '#334155', fontWeight: selected ? 600 : 400, borderBottom: '1px solid #f8fafc', whiteSpace: 'normal', lineHeight: 1.25 }} onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={e => { if (!selected) e.currentTarget.style.background = '#fff'; }}>
//                 <span style={{ width: 14, height: 14, border: '1.5px solid ' + (selected ? '#2563eb' : '#cbd5e1'), borderRadius: 3, background: selected ? '#2563eb' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                   {selected && <span style={{ color: '#fff', fontSize: '0.6rem', lineHeight: 1 }}>✓</span>}
//                 </span>
//                 {opt.name}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }


// /* ── View All interactive filters ───────────────────────────────── */
// function ViewAllFilterBar({
//   filters,
//   setFilters,
//   filterOptions,
//   onApply,
//   onReset,
//   loading = false,
// }) {
//   // Keep the View All Year populated with the first available year when
//   // the modal opens or when its filter options finish loading.
//   useEffect(() => {
//     const years = filterOptions?.years || [];
//     if (!years.length) return;

//     setFilters(prev => {
//       if (!prev) return prev;

//       const currentYear = Array.isArray(prev.year)
//         ? prev.year.filter(Boolean)
//         : prev.year
//           ? [prev.year]
//           : [];

//       const validYear = currentYear.find(
//         year => String(year) !== 'All' && years.some(y => String(y) === String(year))
//       );

//       if (validYear) return prev;

//       return { ...prev, year: [years[0]] };
//     });
//   }, [filterOptions?.years?.join('|'), setFilters]);

//   const update = (key, value) => {
//     setFilters(prev => {
//       const next = { ...prev, [key]: value };
//       if (key === 'legalEntityId') {
//         next.parentDivisionId = ['All'];
//         next.subdivisionId = ['All'];
//       }
//       if (key === 'parentDivisionId') {
//         next.subdivisionId = ['All'];
//       }
//       return next;
//     });
//   };

//   return (
//     <div
//       style={{
//         padding: '12px 16px',
//         borderBottom: '1px solid #e2e8f0',
//         background: '#fff',
//         display: 'grid',
//         gridTemplateColumns: 'repeat(5, minmax(130px, 1fr)) auto auto',
//         gap: 8,
//         alignItems: 'end',
//         minWidth: 900,
//       }}
//     >
//       <FilterField label="Year">
//         <MultiSelect
//           options={filterOptions.years}
//           value={
//             (() => {
//               const currentYear = Array.isArray(filters.year)
//                 ? filters.year.filter(Boolean)
//                 : filters.year
//                   ? [filters.year]
//                   : [];
//               const validYear = currentYear.find(
//                 year => String(year) !== 'All' && (filterOptions.years || []).some(y => String(y) === String(year))
//               );
//               return validYear
//                 ? [validYear]
//                 : (filterOptions.years?.[0] ? [filterOptions.years[0]] : []);
//             })()
//           }
//           onChange={v => update('year', v)}
//           style={{ width: '100%' }}
//         />
//       </FilterField>

//       <FilterField label="Legal Entity">
//         <MultiSelect
//           options={filterOptions.legalEntities}
//           value={filters.legalEntityId}
//           onChange={v => update('legalEntityId', v)}
//           style={{ width: '100%' }}
//         />
//       </FilterField>

//       <FilterField label="Parent Division">
//         <MultiSelect
//           options={filterOptions.parentDivisions}
//           value={filters.parentDivisionId}
//           onChange={v => update('parentDivisionId', v)}
//           style={{ width: '100%' }}
//         />
//       </FilterField>

//       <FilterField label="Sub-Division">
//         <MultiSelect
//           options={filterOptions.subdivisions}
//           value={filters.subdivisionId}
//           onChange={v => update('subdivisionId', v)}
//           style={{ width: '100%' }}
//         />
//       </FilterField>

//       <FilterField label="Period">
//         <MultiSelect
//           options={filterOptions.periods}
//           value={filters.periodName}
//           onChange={v => update('periodName', v)}
//           style={{ width: '100%' }}
//         />
//       </FilterField>

//       <button
//         onClick={onApply}
//         disabled={loading}
//         style={{
//           padding: '7px 16px',
//           background: C.primary,
//           color: '#fff',
//           border: 'none',
//           borderRadius: 8,
//           fontSize: '0.75rem',
//           fontWeight: 700,
//           cursor: loading ? 'not-allowed' : 'pointer',
//           opacity: loading ? 0.65 : 1,
//           whiteSpace: 'nowrap',
//         }}
//       >
//         {loading ? 'Loading…' : 'Apply'}
//       </button>

//       <button
//         onClick={onReset}
//         disabled={loading}
//         style={{
//           background: 'none',
//           border: 'none',
//           color: C.slate,
//           fontWeight: 600,
//           fontSize: '0.75rem',
//           cursor: loading ? 'not-allowed' : 'pointer',
//           padding: '7px 4px',
//           whiteSpace: 'nowrap',
//         }}
//       >
//         Reset
//       </button>

//     </div>
//   );
// }

// function ModalCloseButton({ onClick }) {
//   const [hover, setHover] = useState(false);
//   return (
//     <button
//       onClick={onClick}
//       onMouseEnter={() => setHover(true)}
//       onMouseLeave={() => setHover(false)}
//       style={{
//         background: hover ? '#f1f5f9' : 'none',
//         border: 'none',
//         fontSize: '0.85rem',
//         color: C.slate,
//         cursor: 'pointer',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         width: 28,
//         height: 28,
//         borderRadius: '50%',
//         transition: 'all 0.15s',
//         outline: 'none',
//       }}
//       title="Close"
//     >
//       ✕
//     </button>
//   );
// }

// function ViewAllModal({ isOpen, onClose, title, subtitle, children }) {
//   const bodyRef = useRef(null);
//   const overlayRef = useRef(null);

//   useEffect(() => {
//     if (!isOpen) return;
//     const esc = (e) => { if (e.key === 'Escape') onClose(); };
//     document.addEventListener('keydown', esc);

//     const prevOverflow = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';

//     if (overlayRef.current) overlayRef.current.scrollTop = 0;
//     if (bodyRef.current) bodyRef.current.scrollTop = 0;

//     return () => {
//       document.removeEventListener('keydown', esc);
//       document.body.style.overflow = prevOverflow;
//     };
//   }, [isOpen, onClose]);

//   if (!isOpen) return null;

//   const modalContent = (
//     <div
//       ref={overlayRef}
//       onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
//       style={{
//         position: 'fixed', inset: 0,
//         background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)',
//         WebkitBackdropFilter: 'blur(6px)',
//         display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
//         padding: 0,
//         overflowY: 'auto',
//         minHeight: '100vh',
//         zIndex: 99999, animation: 'fadeIn 0.18s ease',
//       }}
//     >
//       <div style={{
//         background: '#fff', borderRadius: 0,
//         width: '98%', maxWidth: 1500,
//         height: '90vh', maxHeight: '90vh', minHeight: 0,
//         display: 'flex', flexDirection: 'column',
//         boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
//         animation: 'modalPop 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards',
//         overflow: 'hidden', border: '1px solid #e2e8f0',
//         marginTop: '5vh', flexShrink: 0,
//       }}>
//         {/* Modal Header */}
//         <div style={{
//           padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
//           background: 'linear-gradient(90deg,#f8fafc,#fff)',
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//           flexShrink: 0,
//         }}>
//           <div>
//             <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: C.navy }}>{title}</h3>
//             {subtitle && <div style={{ fontSize: '0.7rem', color: C.muted, marginTop: 2 }}>{subtitle}</div>}
//           </div>
//           <button
//             onClick={onClose}
//             style={{
//               background: 'none', border: 'none', cursor: 'pointer',
//               width: 30, height: 30, borderRadius: '50%',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: '0.85rem', color: C.slate, transition: 'background 0.15s',
//             }}
//             onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
//             onMouseLeave={e => e.currentTarget.style.background = 'none'}
//             title="Close (Esc)"
//           >✕</button>
//         </div>

//         {/* Modal Body */}
//         <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
//           {children}
//         </div>
//       </div>
//     </div>
//   );

//   return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
// }

// /* ── Variance Cell ────────────────────────────────────────────── */
// function VarCell({ v, isPct = false }) {
//   if (v === null || v === undefined) return <td style={TD}>—</td>;
//   if (typeof v === 'string' && v.includes('%')) return <td style={{ ...TD, color: C.slate }}>{v}</td>;
//   const pos = v >= 0;
//   return (
//     <td style={{ ...TD, color: pos ? C.green : C.rose, fontWeight: 700 }}>
//       {pos ? '▲' : '▼'} {Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: isPct ? 2 : 0 })}{isPct ? '%' : ''}
//     </td>
//   );
// }

// /* Inline variance badge for modal tables */
// function VarBadge({ v, isPct = false }) {
//   if (v === null || v === undefined) return <span style={{ color: C.muted }}>—</span>;
//   const pos = v >= 0;
//   return (
//     <span style={{ color: pos ? C.green : C.rose, fontWeight: 700 }}>
//       {pos ? '▲' : '▼'} {Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: isPct ? 2 : 0 })}{isPct ? '%' : ''}
//     </span>
//   );
// }

// /* ── Number formatters ────────────────────────────────────────── */
// const fmtNum = (v, currency = 'AED') => {
//   if (v === null || v === undefined) return '—';
//   const n = Number(v);
//   if (isNaN(n)) return v;
//   return `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
// };
// /* Compact formatter for KPI cards — keeps numbers from overflowing */
// const fmtKPI = (v, currency = 'AED') => {
//   if (v === null || v === undefined) return '—';
//   const n = Number(v);
//   if (isNaN(n)) return v;
//   if (Math.abs(n) >= 1_000_000_000) return `${currency} ${(n / 1_000_000_000).toFixed(2)}B`;
//   if (Math.abs(n) >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(2)}M`;
//   if (Math.abs(n) >= 1_000) return `${currency} ${(n / 1_000).toFixed(1)}K`;
//   return `${currency} ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
// };
// const fmtPct = (v) => (v !== null && v !== undefined) ? `${Number(v).toFixed(2)}%` : '—';
// const fmtAxisNum = (v) => {
//   if (v === 0) return '0';
//   if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
//   if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
//   if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
//   return String(v);
// };

// /* ── Custom Chart Tooltip ─────────────────────────────────────── */
// const ChartTooltip = ({ active, payload, label, currency = 'AED' }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div style={{
//       background: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0',
//       backdropFilter: 'blur(6px)', borderRadius: 8, padding: '8px 12px',
//       fontSize: '0.7rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', minWidth: 150,
//     }}>
//       <div style={{ fontWeight: 700, color: C.navy, marginBottom: 5, borderBottom: '1px solid #f1f5f9', paddingBottom: 4 }}>
//         {label}
//       </div>
//       {payload.map((p, i) => (
//         <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 3 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
//             <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
//             <span style={{ color: C.slate }}>{p.name}</span>
//           </div>
//           <span style={{ fontWeight: 700, color: C.navy }}>
//             {currency} {Number(p.value).toLocaleString('en-US', { maximumFractionDigits: 0 })}
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// };

// /* ── Legend Row ───────────────────────────────────────────────── */
// function LegendRow({ items }) {
//   return (
//     <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
//       {items.map(([label, color, dashed]) => (
//         <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
//           <span style={{
//             width: 18, height: 2.5,
//             background: dashed ? 'transparent' : color,
//             borderTop: dashed ? `2.5px dashed ${color}` : 'none',
//             display: 'inline-block', borderRadius: 1,
//           }} />
//           <span style={{ fontSize: '0.62rem', color: C.slate, fontWeight: 500 }}>{label}</span>
//         </div>
//       ))}
//     </div>
//   );
// }

// /* ── KPI Card ─────────────────────────────────────────────────── */
// function KPICard({ id, label, value, subValue, changePct, compareLabel, color, iconBg, icon, loading, error }) {
//   const [hover, setHover] = useState(false);
//   const accent = color || C.primary;
//   const up = changePct >= 0;

//   return (
//     <div
//       id={`kpi-${id}`}
//       onMouseEnter={() => setHover(true)}
//       onMouseLeave={() => setHover(false)}
//       style={{
//         flex: 1, minWidth: 140,
//         background: `linear-gradient(145deg, #fff 0%, ${iconBg}80 100%)`,
//         borderRadius: 12, padding: '12px 14px',
//         boxShadow: hover ? `0 8px 24px ${accent}25` : '0 2px 8px rgba(0,0,0,0.04)',
//         border: `1px solid ${hover ? accent + '30' : 'rgba(0,0,0,0.04)'}`,
//         transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
//         transform: hover ? 'translateY(-2px)' : 'none',
//         display: 'flex', alignItems: 'center', gap: 4,
//         overflow: 'hidden', position: 'relative', minHeight: 82,
//       }}
//     >
//       <div style={{
//         width: 44, height: 44, borderRadius: '50%', background: iconBg,
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         flexShrink: 0, color: accent, fontSize: '1.2rem',
//       }}>
//         {icon}
//       </div>
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
//         <span style={{ fontSize: '0.65rem', fontWeight: 700, color: accent, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
//           {label}
//         </span>
//         {loading ? <Skeleton h={16} w={90} /> : error ? (
//           <span style={{ fontSize: '0.68rem', color: C.rose }}>Error loading</span>
//         ) : (
//           <>
//             <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
//               {value}
//             </div>
//             {subValue && <div style={{ fontSize: '0.62rem', color: C.slate, fontWeight: 500 }}>{subValue}</div>}
//             {changePct !== null && changePct !== undefined && compareLabel && (
//               <div style={{ fontSize: '0.62rem', fontWeight: 600, lineHeight: 1.1, marginTop: 2 }}>
//                 <span style={{ color: up ? C.green : C.rose, marginRight: 3 }}>
//                   {up ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
//                 </span>
//                 <span style={{ color: C.muted }}>{compareLabel}</span>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ── Modal Table wrapper styles ───────────────────────────────── */
// const MTH = {
//   padding: '10px 14px', textAlign: 'right', fontSize: '0.73rem',
//   fontWeight: 700, color: '#1e3a8a', background: '#f8fafc',
//   borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 1,
// };
// const MTH_L = { ...MTH, textAlign: 'left' };
// const MTD = { padding: '9px 14px', textAlign: 'right', fontSize: '0.74rem', color: '#334155', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };
// const MTD_L = { ...MTD, textAlign: 'left', color: C.navy };



// /* ── Section Header (collapsible table row) ───────────────────── */
// function SectionHeader({
//   label,
//   expanded,
//   onToggle,
//   colSpan = 9,
// }) {
//   return (
//     <tr
//       onClick={onToggle}
//       style={{
//         background:
//           'linear-gradient(90deg, #f0f4ff, #f8fafc)',
//         cursor: 'pointer',
//         borderBottom: `1px solid ${C.border}`,
//       }}
//     >
//       <td
//         colSpan={colSpan}
//         style={{
//           padding: '8px 12px',
//           fontSize: '0.72rem',
//           fontWeight: 800,
//           color: C.navy,
//           letterSpacing: '0.04em',
//         }}
//       >
//         <span
//           style={{
//             marginRight: 7,
//             fontSize: '0.62rem',
//             display: 'inline-block',
//             transition: 'transform 0.2s',
//             transform: expanded
//               ? 'rotate(90deg)'
//               : 'none',
//           }}
//         >
//           ▶
//         </span>

//         {label}
//       </td>
//     </tr>
//   );
// }

// /* ── P&L Statement Row ────────────────────────────────────────── */

// function PLRow({
//   row,
//   indent = false,
//   currency = 'AED',
//   thStyles,
//   tdStyles,
// }) {
//   const [hover, setHover] = useState(false);

//   const TDx = tdStyles || TD;

//   const TDLx = {
//     ...(tdStyles || TD),
//     textAlign: 'left',
//     color: C.navy,
//   };

//   // ------------------------------------------------------------
//   // Backend hierarchy
//   // ------------------------------------------------------------
//   const isSubtotal =
//     row?.is_subtotal === true ||
//     row?.row_type === 'subtotal';

//   // ------------------------------------------------------------
//   // Important CFO subtotal rows
//   // ------------------------------------------------------------
//   const label = String(
//     row?.particulars ?? '—'
//   );

//   const labelLower = label.toLowerCase();

//   const isNetProfit =
//     labelLower === 'net profit';

//   const isEbitda =
//     labelLower === 'ebitda';

//   const isGrossProfit =
//     labelLower === 'gross profit';

//   const isPBT =
//     labelLower === 'pbt' ||
//     labelLower === 'profit before tax';

//   const isImportantSubtotal =
//     isSubtotal &&
//     (
//       isNetProfit ||
//       isEbitda ||
//       isGrossProfit ||
//       isPBT ||
//       labelLower === 'total revenue' ||
//       labelLower === 'total cost of sales' ||
//       labelLower === 'total operating expenses'
//     );

//   // ------------------------------------------------------------
//   // Row styling
//   // ------------------------------------------------------------
//   const rowBg =
//     isNetProfit
//       ? '#f0fdf4'
//       : isEbitda || isGrossProfit || isPBT
//         ? '#eef2ff'
//         : isSubtotal
//           ? '#f8fafc'
//           : 'transparent';

//   const labelColor =
//     isNetProfit
//       ? C.green
//       : isEbitda || isGrossProfit || isPBT
//         ? C.primary
//         : isSubtotal
//           ? C.navy
//           : '#334155';

//   // ------------------------------------------------------------
//   // Exact backend values
//   // ------------------------------------------------------------
//   const currentPTD = row?.current_ptd;
//   const comparePTD = row?.compare_ptd;
//   const targetPTD = row?.target_ptd;

//   const varianceCurrentVsCompare =
//     row?.variance_pct_current_vs_compare;

//   const varianceCurrentVsTarget =
//     row?.variance_pct_current_vs_target;

//   const currentYTD = row?.current_ytd;
//   const targetYTD = row?.target_ytd;

//   const varianceYTDVsTarget =
//     row?.variance_pct_ytd_vs_target;

//   // ------------------------------------------------------------
//   // Null-safe formatters
//   // ------------------------------------------------------------
//   const formatAmount = (value) => {
//     if (
//       value === null ||
//       value === undefined ||
//       value === ''
//     ) {
//       return '—';
//     }

//     return fmtNum(value, currency);
//   };

//   const formatPercent = (value) => {
//     if (
//       value === null ||
//       value === undefined ||
//       value === ''
//     ) {
//       return '—';
//     }

//     const num = Number(value);

//     if (!Number.isFinite(num)) {
//       return '—';
//     }

//     return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
//   };

//   return (
//     <tr
//       style={{
//         background:
//           hover && !isSubtotal
//             ? '#f0f6ff'
//             : rowBg,
//         transition: 'background 0.1s',
//       }}
//       onMouseEnter={() => {
//         if (!isSubtotal) setHover(true);
//       }}
//       onMouseLeave={() => setHover(false)}
//     >

//       {/* ======================================================
//           PARTICULARS
//       ====================================================== */}
//       <td
//         style={{
//           ...TDLx,
//           paddingLeft: indent ? 28 : 12,
//           fontWeight:
//             isImportantSubtotal || isSubtotal
//               ? 700
//               : 400,
//           color: labelColor,
//           fontSize:
//             isImportantSubtotal
//               ? '0.76rem'
//               : '0.74rem',
//           borderBottom:
//             `1px solid ${isSubtotal
//               ? '#e2e8f0'
//               : '#f1f5f9'
//             }`,
//         }}
//       >
//         {label}
//       </td>

//       {/* ======================================================
//           CURRENT PTD
//       ====================================================== */}
//       <td
//         style={{
//           ...TDx,
//           fontWeight:
//             isImportantSubtotal || isSubtotal
//               ? 700
//               : 400,
//           color: labelColor,
//         }}
//       >
//         {formatAmount(currentPTD)}
//       </td>

//       {/* ======================================================
//           COMPARE PTD
//       ====================================================== */}
//       <td
//         style={{
//           ...TDx,
//           color: C.slate,
//         }}
//       >
//         {formatAmount(comparePTD)}
//       </td>

//       {/* ======================================================
//           TARGET PTD
//       ====================================================== */}
//       <td
//         style={{
//           ...TDx,
//           color: C.slate,
//         }}
//       >
//         {formatAmount(targetPTD)}
//       </td>

//       {/* ======================================================
//           VAR % CURRENT VS COMPARE
//       ====================================================== */}
//       <td
//         style={{
//           ...TDx,
//           color:
//             varianceCurrentVsCompare == null
//               ? C.slate
//               : Number(varianceCurrentVsCompare) >= 0
//                 ? C.green
//                 : C.rose,
//           fontWeight:
//             varianceCurrentVsCompare == null
//               ? 400
//               : 600,
//         }}
//       >
//         {formatPercent(
//           varianceCurrentVsCompare
//         )}
//       </td>

//       {/* ======================================================
//           VAR % CURRENT VS TARGET
//       ====================================================== */}
//       <td
//         style={{
//           ...TDx,
//           color:
//             varianceCurrentVsTarget == null
//               ? C.slate
//               : Number(varianceCurrentVsTarget) >= 0
//                 ? C.green
//                 : C.rose,
//           fontWeight:
//             varianceCurrentVsTarget == null
//               ? 400
//               : 600,
//         }}
//       >
//         {formatPercent(
//           varianceCurrentVsTarget
//         )}
//       </td>

//       {/* ======================================================
//           CURRENT YTD
//       ====================================================== */}
//       <td
//         style={{
//           ...TDx,
//           fontWeight:
//             isImportantSubtotal || isSubtotal
//               ? 700
//               : 400,
//           color: labelColor,
//         }}
//       >
//         {formatAmount(currentYTD)}
//       </td>

//       {/* ======================================================
//           TARGET YTD
//       ====================================================== */}
//       <td
//         style={{
//           ...TDx,
//           color: C.slate,
//         }}
//       >
//         {formatAmount(targetYTD)}
//       </td>

//       {/* ======================================================
//           VAR % YTD VS TARGET
//       ====================================================== */}
//       <td
//         style={{
//           ...TDx,
//           color:
//             varianceYTDVsTarget == null
//               ? C.slate
//               : Number(varianceYTDVsTarget) >= 0
//                 ? C.green
//                 : C.rose,
//           fontWeight:
//             varianceYTDVsTarget == null
//               ? 400
//               : 600,
//         }}
//       >
//         {formatPercent(
//           varianceYTDVsTarget
//         )}
//       </td>

//     </tr>
//   );
// }
// /* ══════════════════════════════════════════════════════════════════
//    VIEW ALL MODAL CONTENTS
// ══════════════════════════════════════════════════════════════════ */

// /* Trend View All Table */
// function TrendViewAll({ data, currency }) {
//   if (!data?.length) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
//   return (
//     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//       <thead>
//         <tr>
//           <th style={MTH_L}>Period</th>
//           <th style={MTH}>Revenue</th>
//           <th style={MTH}>Gross Profit</th>
//           <th style={MTH}>EBITDA</th>
//           <th style={MTH}>Net Profit</th>
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((row, i) => (
//           <tr key={i}
//             onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
//             onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
//           >
//             <td style={{ ...MTD_L, fontWeight: 600 }}>{row.period_name}</td>
//             <td style={MTD}>{fmtNum(row.total_revenue, currency)}</td>
//             <td style={{ ...MTD, color: C.green, fontWeight: 600 }}>{fmtNum(row.gross_profit, currency)}</td>
//             <td style={{ ...MTD, color: C.purple, fontWeight: 600 }}>{fmtNum(row.ebitda, currency)}</td>
//             <td style={{ ...MTD, color: C.orange, fontWeight: 600 }}>{fmtNum(row.net_profit, currency)}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }

// /* Comparison View All Table */
// function ComparisonViewAll({ data, currency, periodLabel, compareLabel }) {
//   if (!data?.length) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
//   return (
//     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//       <thead>
//         <tr>
//           <th style={MTH_L}>Metric</th>
//           <th style={MTH}>{periodLabel}</th>
//           <th style={MTH}>{compareLabel}</th>
//           <th style={MTH}>Prior Year</th>
//           <th style={MTH}>Variance (vs Compare)</th>
//           <th style={MTH}>Variance %</th>
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((row, i) => {
//           const varVal = row.current - row.compare;
//           const varPct = row.compare ? ((varVal / Math.abs(row.compare)) * 100) : null;
//           return (
//             <tr key={i}
//               onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
//               onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
//             >
//               <td style={{ ...MTD_L, fontWeight: 700 }}>{row.metric}</td>
//               <td style={{ ...MTD, fontWeight: 700, color: C.primary }}>{fmtNum(row.current, currency)}</td>
//               <td style={MTD}>{fmtNum(row.compare, currency)}</td>
//               <td style={{ ...MTD, color: C.slate }}>{fmtNum(row.prior_year, currency)}</td>
//               <td style={{ ...MTD, color: varVal >= 0 ? C.green : C.rose, fontWeight: 700 }}>
//                 <VarBadge v={varVal} />
//               </td>
//               <td style={{ ...MTD, color: varPct >= 0 ? C.green : C.rose, fontWeight: 700 }}>
//                 {varPct !== null ? <VarBadge v={varPct} isPct /> : '—'}
//               </td>
//             </tr>
//           );
//         })}
//       </tbody>
//     </table>
//   );
// }

// /* Expense Breakdown View All Table */
// function ExpenseViewAll({ data, totalExpenses, currency }) {
//   const items = data?.items || [];
//   if (!items.length) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
//   return (
//     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//       <thead>
//         <tr>
//           <th style={MTH_L}>Expense Category</th>
//           <th style={MTH}>Amount</th>
//           <th style={MTH}>Percentage</th>
//           <th style={MTH}>of Total Expenses</th>
//         </tr>
//       </thead>
//       <tbody>
//         {items.map((item, i) => (
//           <tr key={i}
//             onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
//             onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
//           >
//             <td style={MTD_L}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
//                 <span style={{ width: 10, height: 10, borderRadius: 2, background: EXPENSE_COLORS[i % EXPENSE_COLORS.length], display: 'inline-block', flexShrink: 0 }} />
//                 {item.name}
//               </div>
//             </td>
//             <td style={{ ...MTD, fontWeight: 600 }}>{fmtNum(item.amount, currency)}</td>
//             <td style={{ ...MTD, fontWeight: 700, color: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}>
//               {item.pct != null ? `${Number(item.pct).toFixed(2)}%` : '—'}
//             </td>
//             <td style={MTD}>
//               {totalExpenses ? (
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                   <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden', maxWidth: 100 }}>
//                     <div style={{ width: `${item.pct || 0}%`, height: '100%', background: EXPENSE_COLORS[i % EXPENSE_COLORS.length], borderRadius: 3 }} />
//                   </div>
//                   <span style={{ fontSize: '0.7rem', color: C.slate }}>{item.pct?.toFixed(1)}%</span>
//                 </div>
//               ) : '—'}
//             </td>
//           </tr>
//         ))}
//         {/* Total row */}
//         <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
//           <td style={{ ...MTD_L, fontWeight: 800, color: C.navy }}>Total Expenses</td>
//           <td style={{ ...MTD, fontWeight: 800, color: C.navy }}>{fmtNum(totalExpenses, currency)}</td>
//           <td style={{ ...MTD, fontWeight: 800, color: C.navy }}>100.00%</td>
//           <td style={MTD}>—</td>
//         </tr>
//       </tbody>
//     </table>
//   );
// }

// /* KPI Summary View All Table */
// function KPISummaryViewAll({ summary, currency, periodName, comparePeriodName }) {
//   if (!summary) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
//   const rows = [
//     { label: 'Total Revenue', current: summary.total_revenue, compare: summary.compare_total_revenue, varPct: summary.revenue_variance_pct },
//     { label: 'Cost of Sales', current: summary.cost_of_sales, compare: null, varPct: null },
//     { label: 'Gross Profit', current: summary.gross_profit, compare: summary.compare_gross_profit, varPct: summary.gross_profit_variance_pct, pct: summary.gross_profit_pct },
//     { label: 'Other Income', current: summary.other_income, compare: null, varPct: null },
//     { label: 'Operating Expenses', current: summary.operating_expenses, compare: null, varPct: null },
//     { label: 'EBITDA', current: summary.ebitda, compare: summary.compare_ebitda, varPct: summary.ebitda_variance_pct, pct: summary.ebitda_pct },
//     { label: 'PBT', current: summary.pbt, compare: null, varPct: null },
//     { label: 'Tax Expense', current: summary.tax_expense, compare: null, varPct: null },
//     { label: 'Net Profit', current: summary.net_profit, compare: summary.compare_net_profit, varPct: summary.net_profit_variance_pct, pct: summary.net_profit_pct, isNet: true },
//   ];
//   return (
//     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//       <thead>
//         <tr>
//           <th style={MTH_L}>Metric</th>
//           <th style={MTH}>{periodName || 'Current'}</th>
//           <th style={MTH}>{comparePeriodName || 'Compare'}</th>
//           <th style={MTH}>Variance %</th>
//           <th style={MTH}>Margin %</th>
//         </tr>
//       </thead>
//       <tbody>
//         {rows.map((row, i) => (
//           <tr key={i}
//             style={{ background: row.isNet ? '#f0fdf4' : 'transparent' }}
//             onMouseEnter={e => !row.isNet && (e.currentTarget.style.background = '#f8faff')}
//             onMouseLeave={e => !row.isNet && (e.currentTarget.style.background = 'transparent')}
//           >
//             <td style={{ ...MTD_L, fontWeight: row.isNet ? 800 : 500, color: row.isNet ? C.green : C.navy }}>{row.label}</td>
//             <td style={{ ...MTD, fontWeight: row.isNet ? 800 : 500, color: row.isNet ? C.green : '#334155' }}>{fmtNum(row.current, currency)}</td>
//             <td style={{ ...MTD, color: C.slate }}>{row.compare != null ? fmtNum(row.compare, currency) : '—'}</td>
//             <td style={MTD}>{row.varPct != null ? <VarBadge v={row.varPct} isPct /> : '—'}</td>
//             <td style={{ ...MTD, color: C.slate }}>{row.pct != null ? fmtPct(row.pct) : '—'}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }

// /* P&L Statement View All (full statement in modal) */
// // function StatementViewAll({ statementData, currency, periodName, comparePeriodName }) {
// //   const [secIncome, setSecIncome] = useState(true);
// //   const [secCOGS, setSecCOGS] = useState(true);
// //   const [secExpenses, setSecExpenses] = useState(true);
// //   if (!statementData) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
// //   return (
// //     <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
// //       <thead>
// //         <tr>
// //           <th style={{ ...MTH_L, width: '26%' }}>Particulars</th>
// //           <th style={MTH}>Current Period<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>{periodName}</span></th>
// //           <th style={MTH}>Compare Period<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>{comparePeriodName}</span></th>
// //           <th style={MTH}>Variance<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(Value)</span></th>
// //           <th style={MTH}>Variance<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(%)</span></th>
// //           <th style={MTH}>YTD Current</th>
// //           <th style={MTH}>YTD Prev Year</th>
// //           <th style={MTH}>YTD Var<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(%)</span></th>
// //         </tr>
// //       </thead>
// //       <tbody>
// //         <SectionHeader label="INCOME" expanded={secIncome} onToggle={() => setSecIncome(p => !p)} />
// //         {secIncome && statementData.income?.map((row, i) => <PLRow key={i} row={row} indent={!row.isTotal} currency={''} tdStyles={MTD} />)}
// //         <SectionHeader label="COST OF SALES" expanded={secCOGS} onToggle={() => setSecCOGS(p => !p)} />
// //         {secCOGS && statementData.cost_of_sales?.map((row, i) => <PLRow key={i} row={row} indent={!row.isTotal && !row.isGrossProfit && !row.isPct} currency={''} tdStyles={MTD} />)}
// //         <SectionHeader label="EXPENSES" expanded={secExpenses} onToggle={() => setSecExpenses(p => !p)} />
// //         {secExpenses && statementData.expenses?.map((row, i) => <PLRow key={i} row={row} indent={!row.isTotal && !row.isEbitda && !row.isPct} currency={''} tdStyles={MTD} />)}
// //         {statementData.bottom?.map((row, i) => <PLRow key={i} row={row} indent={!row.isNetProfit} currency={''} tdStyles={MTD} />)}
// //       </tbody>
// //     </table>
// //   );
// // }

// function StatementViewAll({
//   incomeRows = [],
//   costOfSalesRows = [],
//   profitabilityRows = [],
//   expensesRows = [],
//   otherExpensesRows = [],
//   currency,
//   periodName,
//   comparePeriodName,
// }) {
//   const [secIncome, setSecIncome] = useState(true);
//   const [secCOGS, setSecCOGS] = useState(true);
//   const [secProfitability, setSecProfitability] = useState(true);
//   const [secExpenses, setSecExpenses] = useState(true);
//   const [secOtherExpenses, setSecOtherExpenses] = useState(true);

//   const hasData =
//     incomeRows.length > 0 ||
//     costOfSalesRows.length > 0 ||
//     profitabilityRows.length > 0 ||
//     expensesRows.length > 0 ||
//     otherExpensesRows.length > 0;

//   if (!hasData) {
//     return (
//       <div
//         style={{
//           padding: 32,
//           textAlign: 'center',
//           color: C.muted,
//           fontSize: '0.8rem',
//         }}
//       >
//         No data available
//       </div>
//     );
//   }

//   return (
//     <div
//       style={{
//         width: '100%',
//         overflowX: 'auto',
//       }}
//     >
//       <table
//         style={{
//           width: '100%',
//           minWidth: 1100,
//           borderCollapse: 'collapse',
//           fontSize: '0.74rem',
//         }}
//       >
//         <thead>
//           <tr>
//             <th
//               style={{
//                 ...MTH_L,
//                 width: '25%',
//                 minWidth: 250,
//               }}
//             >
//               Particulars
//               <br />
//               <span
//                 style={{
//                   fontWeight: 400,
//                   opacity: 0.75,
//                 }}
//               >
//                 (in {currency})
//               </span>
//             </th>

//             <th style={MTH}>
//               Current PTD
//               <br />
//               <span
//                 style={{
//                   fontWeight: 400,
//                   opacity: 0.75,
//                 }}
//               >
//                 {periodName}
//               </span>
//             </th>

//             <th style={MTH}>
//               Compare PTD
//               <br />
//               <span
//                 style={{
//                   fontWeight: 400,
//                   opacity: 0.75,
//                 }}
//               >
//                 {comparePeriodName || '—'}
//               </span>
//             </th>

//             <th style={MTH}>
//               Target PTD
//             </th>

//             <th style={MTH}>
//               Var % Current
//               <br />
//               <span
//                 style={{
//                   fontWeight: 400,
//                   opacity: 0.75,
//                 }}
//               >
//                 vs Compare
//               </span>
//             </th>

//             <th style={MTH}>
//               Var % Current
//               <br />
//               <span
//                 style={{
//                   fontWeight: 400,
//                   opacity: 0.75,
//                 }}
//               >
//                 vs Target
//               </span>
//             </th>

//             <th style={MTH}>
//               Current YTD
//             </th>

//             <th style={MTH}>
//               Target YTD
//             </th>

//             <th style={MTH}>
//               Var % YTD
//               <br />
//               <span
//                 style={{
//                   fontWeight: 400,
//                   opacity: 0.75,
//                 }}
//               >
//                 vs Target
//               </span>
//             </th>
//           </tr>
//         </thead>

//         <tbody>

//           {/* =========================
//               INCOME
//           ========================= */}

//           <SectionHeader
//             label="INCOME"
//             expanded={secIncome}
//             onToggle={() =>
//               setSecIncome((p) => !p)
//             }
//             colSpan={9}
//           />

//           {incomeRows.map((row, i) => {
//             const visible =
//               secIncome || row.is_subtotal;

//             if (!visible) return null;

//             return (
//               <PLRow
//                 key={`income-${row.display_order ?? i}`}
//                 row={row}
//                 indent={!row.is_subtotal}
//                 currency={currency}
//                 tdStyles={MTD}
//               />
//             );
//           })}

//           {/* =========================
//               COST OF SALES
//           ========================= */}

//           <SectionHeader
//             label="COST OF SALES"
//             expanded={secCOGS}
//             onToggle={() =>
//               setSecCOGS((p) => !p)
//             }
//             colSpan={9}
//           />

//           {costOfSalesRows.map((row, i) => {
//             const visible =
//               secCOGS || row.is_subtotal;

//             if (!visible) return null;

//             return (
//               <PLRow
//                 key={`cogs-${row.display_order ?? i}`}
//                 row={row}
//                 indent={!row.is_subtotal}
//                 currency={currency}
//                 tdStyles={MTD}
//               />
//             );
//           })}

//           {/* =========================
//               PROFITABILITY
//           ========================= */}

//           <SectionHeader
//             label="PROFITABILITY"
//             expanded={secProfitability}
//             onToggle={() =>
//               setSecProfitability((p) => !p)
//             }
//             colSpan={9}
//           />

//           {profitabilityRows.map((row, i) => {
//             const visible =
//               secProfitability || row.is_subtotal;

//             if (!visible) return null;

//             return (
//               <PLRow
//                 key={`profitability-${row.display_order ?? i}`}
//                 row={row}
//                 indent={!row.is_subtotal}
//                 currency={currency}
//                 tdStyles={MTD}
//               />
//             );
//           })}

//           {/* =========================
//               EXPENSES
//           ========================= */}

//           <SectionHeader
//             label="EXPENSES"
//             expanded={secExpenses}
//             onToggle={() =>
//               setSecExpenses((p) => !p)
//             }
//             colSpan={9}
//           />

//           {expensesRows.map((row, i) => {
//             const visible =
//               secExpenses || row.is_subtotal;

//             if (!visible) return null;

//             return (
//               <PLRow
//                 key={`expenses-${row.display_order ?? i}`}
//                 row={row}
//                 indent={!row.is_subtotal}
//                 currency={currency}
//                 tdStyles={MTD}
//               />
//             );
//           })}

//           {/* =========================
//               OTHER EXPENSES
//           ========================= */}

//           <SectionHeader
//             label="OTHER EXPENSES"
//             expanded={secOtherExpenses}
//             onToggle={() =>
//               setSecOtherExpenses((p) => !p)
//             }
//             colSpan={9}
//           />

//           {otherExpensesRows.map((row, i) => {
//             const visible =
//               secOtherExpenses || row.is_subtotal;

//             if (!visible) return null;

//             return (
//               <PLRow
//                 key={`other-expenses-${row.display_order ?? i}`}
//                 row={row}
//                 indent={!row.is_subtotal}
//                 currency={currency}
//                 tdStyles={MTD}
//               />
//             );
//           })}

//         </tbody>
//       </table>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════════════
//    MAIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════ */
// export default function PLAnalytics() {

//   /* ── Dropdown options & Filter state ─────────────────────────── */
//   const [filterOptions, setFilterOptions] = useState({
//     legalGroups: ['All'],
//     legalEntities: ['All'],
//     parentDivisions: ['All'],
//     subdivisions: ['All'],
//     years: [],
//     periods: [],
//     comparePeriods: [],
//     currencies: ['AED'],
//   });

//   const [filters, setFilters] = useState(DEFAULT_FILTERS);
//   const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

//   // Auto-apply filters on first load once periods are loaded
//   const [initialLoaded, setInitialLoaded] = useState(false);
//   useEffect(() => {
//     if (!initialLoaded && filters.periodName && filterOptions.periods.length > 0) {
//       setAppliedFilters(filters);
//       setInitialLoaded(true);
//     }
//   }, [filters.periodName, filterOptions.periods, initialLoaded]);

//   const updateFilter = (key, val) => {
//     setFilters(prev => {
//       const next = { ...prev, [key]: val };
//       if (key === 'legalGroupId') { next.legalEntityId = ['All']; next.parentDivisionId = ['All']; next.subdivisionId = ['All']; }
//       if (key === 'legalEntityId') { next.parentDivisionId = ['All']; next.subdivisionId = ['All']; }
//       if (key === 'parentDivisionId') { next.subdivisionId = ['All']; }
//       return next;
//     });
//   };

//   /* ── Data state ───────────────────────────────────────────────── */
//   const [summary, setSummary] = useState(null);
//   const [trendData, setTrendData] = useState([]);
//   const [comparisonData, setComparisonData] = useState([]);
//   const [expenseData, setExpenseData] = useState(null);
//   const [statementData, setStatementData] = useState(null);

//   /* ── Section collapse (inline table) ─────────────────────────── */
//   const [secIncome, setSecIncome] = useState(true);
//   const [secCOGS, setSecCOGS] = useState(true);
//   const [secExpenses, setSecExpenses] = useState(true);
//   const [secOtherExpenses, setSecOtherExpenses] = useState(true);
//   const [secProfitability, setSecProfitability] = useState(true);

//   /* ── Loading & Error ──────────────────────────────────────────── */
//   const [loading, setLoading] = useState({
//     filters: true, summary: true, trend: true,
//     comparison: true, expenseBreakdown: true, statement: true,
//   });
//   const [errors, setErrors] = useState({});

//   /* ── Toast ────────────────────────────────────────────────────── */
//   const [toast, setToast] = useState(null);
//   const showToast = (msg, type = 'success') => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3500);
//   };

//   /* ── View All modal state ─────────────────────────────────────── */
//   const [openModal, setOpenModal] = useState(null);

//   /*
//    * View All has its own filter state/data so changing filters inside a modal
//    * does not change the main-page filter selections until the user chooses to
//    * do so on the main page.
//    */
//   const [viewAllFilters, setViewAllFilters] = useState(null);
//   const [viewAllFilterOptions, setViewAllFilterOptions] = useState(null);
//   const [viewAllData, setViewAllData] = useState({
//     summary: null,
//     trend: [],
//     comparison: [],
//     expenseBreakdown: null,
//     statement: null,
//   });
//   const [viewAllLoading, setViewAllLoading] = useState(false);

//   const closeModal = () => {
//     setOpenModal(null);
//     setViewAllFilters(null);
//   };

//   const cloneViewAllFilters = (source, options = filterOptions) => {
//     const sourceYear = Array.isArray(source?.year)
//       ? source.year.filter(Boolean)
//       : source?.year
//         ? [source.year]
//         : [];

//     const sourcePeriod = Array.isArray(source?.periodName)
//       ? source.periodName.filter(Boolean)
//       : source?.periodName
//         ? [source.periodName]
//         : [];

//     return {
//       ...source,

//       year:
//         sourceYear.length && sourceYear[0] !== 'All'
//           ? sourceYear
//           : options?.years?.length
//             ? [options.years[0]]
//             : ['All'],

//       periodName:
//         sourcePeriod.length && sourcePeriod[0] !== 'All'
//           ? sourcePeriod
//           : options?.periods?.length
//             ? [options.periods[0]]
//             : ['All'],

//       comparePeriodName: [],

//       legalEntityId:
//         Array.isArray(source?.legalEntityId)
//           ? [...source.legalEntityId]
//           : ['All'],

//       parentDivisionId:
//         Array.isArray(source?.parentDivisionId)
//           ? [...source.parentDivisionId]
//           : ['All'],

//       subdivisionId:
//         Array.isArray(source?.subdivisionId)
//           ? [...source.subdivisionId]
//           : ['All'],
//     };
//   };

//   const buildViewAllOptions = (options) => ({
//     legalEntities: options?.legalEntities || filterOptions.legalEntities || ['All'],
//     parentDivisions: options?.parentDivisions || filterOptions.parentDivisions || ['All'],
//     subdivisions: options?.subdivisions || filterOptions.subdivisions || ['All'],
//     years: options?.years || filterOptions.years || [],
//     periods: options?.periods || filterOptions.periods || [],
//     comparePeriods: options?.comparePeriods || filterOptions.comparePeriods || [],
//   });

//   const loadViewAllData = useCallback(async (nextFilters) => {
//     setViewAllLoading(true);
//     try {
//       const [summaryResult, trendResult, comparisonResult, expenseResult, statementResult] = await Promise.all([
//         fetchPLSummary(nextFilters),
//         fetchPLTrend(nextFilters),
//         fetchPLComparison(nextFilters),
//         fetchPLExpenseBreakdown(nextFilters),
//         fetchPLStatement(nextFilters),
//       ]);

//       setViewAllData({
//         summary: summaryResult || null,
//         trend: trendResult || [],
//         comparison: comparisonResult || [],
//         expenseBreakdown: expenseResult || null,
//         statement: statementResult || null,
//       });
//     } catch (err) {
//       showToast(err?.message || 'Failed to refresh View All data.', 'error');
//     } finally {
//       setViewAllLoading(false);
//     }
//   }, [showToast]);

//   const openViewAll = useCallback(async (type) => {
//     let options = filterOptions;

//     try {
//       const data = await fetchPLFilters({
//         legalGroupId: appliedFilters?.legalGroupId,
//         legalEntityId: appliedFilters?.legalEntityId,
//         parentDivisionId: appliedFilters?.parentDivisionId,
//         year: appliedFilters?.year || '',
//         periodName: appliedFilters?.periodName || '',
//       });

//       const periods = data?.periods || filterOptions?.periods || [];

//       const backendCompare = data?.comparePeriods || [];

//       const comparePeriods = [
//         ...backendCompare,
//         ...periods.filter(p => !backendCompare.includes(p)),
//       ];

//       options = {
//         ...filterOptions,
//         legalEntities:
//           data?.legal_entities || filterOptions?.legalEntities || ['All'],

//         parentDivisions:
//           data?.parent_divisions || filterOptions?.parentDivisions || ['All'],

//         subdivisions:
//           data?.subdivisions || filterOptions?.subdivisions || ['All'],

//         years:
//           data?.years?.length
//             ? data.years
//             : (filterOptions?.years || []),

//         periods,
//         comparePeriods,
//       };
//     } catch (err) {
//       console.error('Failed to load View All filter options:', err);
//     }

//     // ------------------------------------------
//     // IMPORTANT: Get Year from MAIN PAGE first
//     // ------------------------------------------

//     const mainYear = Array.isArray(appliedFilters?.year)
//       ? appliedFilters.year.filter(Boolean)
//       : appliedFilters?.year
//         ? [appliedFilters.year]
//         : [];

//     const validMainYear = mainYear.find(
//       year =>
//         String(year) !== 'All' &&
//         (options?.years || []).some(
//           y => String(y) === String(year)
//         )
//     );

//     // If main page has a valid year, use it.
//     // Otherwise use the first available year.
//     const selectedYear =
//       validMainYear
//         ? [validMainYear]
//         : options?.years?.length
//           ? [options.years[0]]
//           : ['All'];

//     const mainPeriod = Array.isArray(appliedFilters?.periodName)
//       ? appliedFilters.periodName.filter(Boolean)
//       : appliedFilters?.periodName
//         ? [appliedFilters.periodName]
//         : [];

//     const selectedPeriod =
//       mainPeriod.length
//         ? mainPeriod
//         : options?.periods?.length
//           ? [options.periods[0]]
//           : ['All'];

//     const initial = cloneViewAllFilters(
//       {
//         ...appliedFilters,

//         // IMPORTANT
//         year: selectedYear,

//         periodName: selectedPeriod,

//         // Keep Compare With empty
//         comparePeriodName: [],
//       },
//       options
//     );

//     setViewAllFilters(initial);
//     setViewAllFilterOptions(buildViewAllOptions(options));
//     setOpenModal(type);

//     // Load modal data using the SAME initialized filters
//     loadViewAllData(initial);

//   }, [
//     appliedFilters,
//     filterOptions,
//     loadViewAllData
//   ]);

//   const applyViewAllFilters = useCallback(() => {
//     if (!viewAllFilters) return;
//     loadViewAllData(viewAllFilters);
//   }, [viewAllFilters, loadViewAllData]);

//   const resetViewAllFilters = useCallback(() => {
//     const reset = cloneViewAllFilters(appliedFilters, filterOptions);
//     setViewAllFilters(reset);
//     setViewAllFilterOptions(buildViewAllOptions(filterOptions));
//     loadViewAllData(reset);
//   }, [appliedFilters, filterOptions, loadViewAllData]);

//   /* Refresh dropdown options when the View All hierarchy/year changes.
//      Only the modal's local state is updated; the main page is untouched. */
//   useEffect(() => {
//     if (!openModal || !viewAllFilters) return;

//     const optionPeriod = viewAllFilters.periodName?.[0] || '';
//     const optionYear = viewAllFilters.year?.[0] || '';
//     let cancelled = false;

//     fetchPLFilters({
//       legalEntityId: viewAllFilters.legalEntityId,
//       parentDivisionId: viewAllFilters.parentDivisionId,
//       year: optionYear,
//       periodName: optionPeriod,
//     })
//       .then(data => {
//         if (cancelled) return;
//         const periods = data.periods || [];
//         const backendCompare = data.comparePeriods || [];
//         const comparePeriods = [
//           ...backendCompare,
//           ...periods.filter(p => !backendCompare.includes(p)),
//         ];
//         setViewAllFilterOptions({
//           legalEntities: data.legalEntities || filterOptions.legalEntities || ['All'],
//           parentDivisions: data.parentDivisions || filterOptions.parentDivisions || ['All'],
//           subdivisions: data.subdivisions || filterOptions.subdivisions || ['All'],
//           years: data.years || filterOptions.years || [],
//           periods,
//           comparePeriods,
//         });
//       })
//       .catch(() => {
//         // Keep the already loaded modal options if a cascading refresh fails.
//       });

//     return () => { cancelled = true; };
//   }, [
//     openModal,
//     viewAllFilters?.year?.join('|'),
//     viewAllFilters?.legalEntityId?.join('|'),
//     viewAllFilters?.parentDivisionId?.join('|'),
//   ]);

//   /* ── Load filter options (cascading) ──────────────────────────── */
//   useEffect(() => {
//     setLoading(prev => ({ ...prev, filters: true }));
//     fetchPLFilters({
//       legalGroupId: filters.legalGroupId,
//       legalEntityId: filters.legalEntityId,
//       parentDivisionId: filters.parentDivisionId,
//       year: filters.year,
//       periodName: filters.periodName,
//     })
//       .then(data => {
//         const years = data.years || [];
//         const periods = data.periods || [];
//         const backendCompare = data.comparePeriods || [];

//         // Prior periods from backend (e.g. ['Jan-26'] for Feb-26)
//         const priorPeriods = backendCompare.filter(p => p !== filters.periodName);
//         // All other periods in fiscal year (excluding current selected period and prior periods)
//         const otherPeriods = periods.filter(p => p !== (filters.periodName || periods[0]) && !priorPeriods.includes(p));
//         // Combined comparison periods: prior periods first, then other available periods
//         const comparePeriods = [...priorPeriods, ...otherPeriods];
//         const currencies = data.currencies?.length ? data.currencies : ['AED'];

//         setFilterOptions(prev => ({
//           ...prev,
//           legalGroups: data.legalGroups || [],
//           legalEntities: data.legalEntities || [],
//           parentDivisions: data.parentDivisions || [],
//           subdivisions: data.subdivisions || [],
//           years,
//           periods,
//           comparePeriods,
//           currencies,
//         }));

//         setFilters(f => {
//           const nextComparePeriod = comparePeriods.includes(f.comparePeriodName)
//             ? f.comparePeriodName
//             : (priorPeriods[0] || '');

//           return {
//             ...f,
//             year: f.year || years[0] || '',
//             periodName: f.periodName || periods[0] || '',
//             comparePeriodName: nextComparePeriod,
//             currency: f.currency || currencies[0] || 'AED',
//           };
//         });

//         setAppliedFilters(f => {
//           const nextComparePeriod = comparePeriods.includes(f.comparePeriodName)
//             ? f.comparePeriodName
//             : (priorPeriods[0] || '');

//           return {
//             ...f,
//             year: f.year || years[0] || '',
//             periodName: f.periodName || periods[0] || '',
//             comparePeriodName: nextComparePeriod,
//             currency: f.currency || currencies[0] || 'AED',
//           };
//         });
//       })
//       .catch(err => setErrors(prev => ({ ...prev, filters: err?.message || 'Failed to load filters' })))
//       .finally(() => setLoading(prev => ({ ...prev, filters: false })));
//   }, [filters.legalGroupId, filters.legalEntityId, filters.parentDivisionId, filters.year, filters.periodName]);

//   /* ── Fetch all data ───────────────────────────────────────────── */
//   const fetchAll = useCallback((f) => {
//     setLoading({ filters: false, summary: true, trend: true, comparison: true, expenseBreakdown: true, statement: true });
//     setErrors({});
//     const guard = (key, promise) =>
//       promise
//         .catch(err => { setErrors(prev => ({ ...prev, [key]: err?.message || 'Failed to load data' })); return null; })
//         .finally(() => setLoading(prev => ({ ...prev, [key]: false })));

//     guard('summary', fetchPLSummary(f)).then(d => { if (d) setSummary(d); });
//     guard('trend', fetchPLTrend(f)).then(d => { if (d) setTrendData(d); });
//     guard('comparison', fetchPLComparison(f)).then(d => { if (d) setComparisonData(d); });
//     guard('expenseBreakdown', fetchPLExpenseBreakdown(f)).then(d => { if (d) setExpenseData(d); });
//     guard('statement', fetchPLStatement(f)).then(d => { if (d) setStatementData(d); });
//   }, []);

//   useEffect(() => {
//     if (appliedFilters.periodName) fetchAll(appliedFilters);
//   }, [appliedFilters.periodName, fetchAll]);

//   /* ── Filter handlers ──────────────────────────────────────────── */
//   const handleApply = () => { setAppliedFilters({ ...filters }); fetchAll({ ...filters }); };
//   const handleReset = () => {
//     const reset = {
//       ...DEFAULT_FILTERS,
//       year: filterOptions.years[0] || '',
//       periodName: filterOptions.periods[0] || '',
//       comparePeriodName: '',
//       currency: filterOptions.currencies[0] || 'AED',
//     };
//     setFilters(reset); setAppliedFilters(reset); fetchAll(reset);
//   };

//   /* ── Export handler ───────────────────────────────────────────── */
//   const [exporting, setExporting] = useState(null);
//   const handleExport = (format, section = 'full') => {
//     if (exporting) return;
//     setExporting(format);
//     exportPL(format, appliedFilters)
//       .then(() => showToast(`${format.toUpperCase()} export downloaded successfully.`, 'success'))
//       .catch(err => showToast(
//         `Export failed: ${err?.message || 'Unknown error'}. Please try again.`,
//         'error'
//       ))
//       .finally(() => setExporting(null));
//   };

//   /* ── Derived values ───────────────────────────────────────────── */
//   const currency = appliedFilters.currency || 'AED';
//   const compareLbl = appliedFilters.comparePeriodName ? `vs ${appliedFilters.comparePeriodName}` : '';
//   const periodLabel = appliedFilters.periodName || 'Current';
//   const compareLabel = appliedFilters.comparePeriodName || 'Compare';
//   const priorLabel = 'Prior Year';
//   const expenseItems = expenseData?.items || (Array.isArray(expenseData?.data) ? expenseData.data : []);
//   const totalExpenses = expenseData?.total_expenses
//     ?? expenseItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

//   /* ── KPI card definitions ─────────────────────────────────────── */
//   const kpiCards = [
//     { id: 'total-rev', label: 'Total Revenue (PTD)', value: fmtKPI(summary?.total_revenue, currency), subValue: null, changePct: summary?.revenue_variance_pct, compareLabel: compareLbl, color: '#2563eb', iconBg: '#eff6ff', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg> },
//     { id: 'gross-profit', label: 'Gross Profit (PTD)', value: fmtKPI(summary?.gross_profit, currency), subValue: summary?.gross_profit_pct ? `Margin: ${fmtPct(summary.gross_profit_pct)}` : null, changePct: summary?.gross_profit_variance_pct, compareLabel: compareLbl, color: '#16a34a', iconBg: '#f0fdf4', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fillOpacity="0.85" /></svg> },
//     { id: 'ebitda', label: 'EBITDA (PTD)', value: fmtKPI(summary?.ebitda, currency), subValue: summary?.ebitda_pct ? `Margin: ${fmtPct(summary.ebitda_pct)}` : null, changePct: summary?.ebitda_variance_pct, compareLabel: compareLbl, color: '#7c3aed', iconBg: '#faf5ff', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg> },
//     { id: 'net-profit', label: 'Net Profit (PTD)', value: fmtKPI(summary?.net_profit, currency), subValue: null, changePct: summary?.net_profit_variance_pct, compareLabel: compareLbl, color: '#ea580c', iconBg: '#fff7ed', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" /><path d="M12 18V6" /></svg> },
//     { id: 'np-margin', label: 'Net Profit Margin (PTD)', value: fmtPct(summary?.net_profit_pct), subValue: null, changePct: summary && summary.net_profit_pct != null && summary.compare_net_profit_pct != null ? +(summary.net_profit_pct - summary.compare_net_profit_pct).toFixed(2) : null, compareLabel: compareLbl, color: '#0d9488', iconBg: '#f0fdfa', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 4.5C4.5 4.5 2 7 2 10s2.5 5.5 5.5 5.5S13 13 13 10 10.5 4.5 7.5 4.5zm0 9C5.57 13.5 4 11.93 4 10s1.57-3.5 3.5-3.5S11 8.07 11 10s-1.57 3.5-3.5 3.5z" fillOpacity="0.9" /><path d="M19 8l-7 8M14 4h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></svg> },
//     { id: 'ebitda-margin', label: 'EBITDA Margin (PTD)', value: fmtPct(summary?.ebitda_pct), subValue: null, changePct: summary && summary.ebitda_pct != null && summary.compare_ebitda_pct != null ? +(summary.ebitda_pct - summary.compare_ebitda_pct).toFixed(2) : null, compareLabel: compareLbl, color: '#db2777', iconBg: '#fdf2f8', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.12" /><polyline points="12 6 12 12 16 14" /></svg> },
//   ];

//   /* ── Kebab menu definitions ───────────────────────────────────── */
//   const makeExportItems = (section) => [
//     { icon: '📊', label: 'Export Excel', action: () => handleExport('excel', section) },
//     { icon: '📄', label: 'Export PDF', action: () => handleExport('pdf', section) },
//   ];

//   const kpiMenuItems = [{ icon: '🔎', label: 'View All', action: () => openViewAll('kpi') }, ...makeExportItems('kpi')];
//   const trendMenuItems = [{ icon: '🔎', label: 'View All', action: () => openViewAll('trend') }, ...makeExportItems('trend')];
//   const compMenuItems = [{ icon: '🔎', label: 'View All', action: () => openViewAll('comparison') }, ...makeExportItems('comparison')];
//   const expenseMenuItems = [{ icon: '🔎', label: 'View All', action: () => openViewAll('expense') }, ...makeExportItems('expense')];
//   const statementMenuItems = [{ icon: '🔎', label: 'View All', action: () => openViewAll('statement') }, ...makeExportItems('statement')];


//   const statementRows = Array.isArray(statementData?.rows)
//     ? statementData.rows
//     : Array.isArray(statementData?.data)
//       ? statementData.data
//       : Array.isArray(statementData)
//         ? statementData
//         : [];

//   const getStatementSection = (section) =>
//     statementRows
//       .filter(
//         (row) =>
//           String(row.section || '').toUpperCase() === section
//       )
//       .sort(
//         (a, b) =>
//           Number(a.display_order || 0) -
//           Number(b.display_order || 0)
//       );

//   const incomeRows = getStatementSection('INCOME');
//   const costOfSalesRows = getStatementSection('COST OF SALES');
//   const expensesRows = getStatementSection('EXPENSES');
//   const otherExpensesRows = getStatementSection('OTHER EXPENSES');
//   const profitabilityRows = getStatementSection('PROFITABILITY');

//   /* ══════════════════════════════════════════════════════════════════
//      RENDER
//   ══════════════════════════════════════════════════════════════════ */
//   return (
//     <div className="animate-in" style={{ width: '100%', maxWidth: 'none', padding: '20px 0 40px', background: C.bg, minHeight: '100%' }}>

//       <style>{`
//         @keyframes shimmer  { from { background-position: 200% 0; } to { background-position: -200% 0; } }
//         @keyframes fadeIn   { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
//         @keyframes menuPop  { from { opacity: 0; transform: scale(0.94) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
//         @keyframes modalPop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
//       `}</style>

//       {toast && <ExportToast message={toast.msg} type={toast.type} />}

//       {/* ══ VIEW ALL MODALS ══ */}
//       {viewAllFilters && viewAllFilterOptions && (
//         <>
//           <ViewAllModal isOpen={openModal === 'kpi'} onClose={closeModal} title="KPI Summary" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'All'}`}>
//             <ViewAllFilterBar
//               filters={viewAllFilters}
//               setFilters={setViewAllFilters}
//               filterOptions={viewAllFilterOptions}
//               onApply={applyViewAllFilters}
//               onReset={resetViewAllFilters}
//               loading={viewAllLoading}
//             />
//             {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={220} /></div> : (
//               <KPISummaryViewAll
//                 summary={viewAllData.summary}
//                 currency={currency}
//                 periodName={(viewAllFilters.periodName || []).join(', ')}
//                 comparePeriodName={(viewAllFilters.comparePeriodName || []).join(', ')}
//               />
//             )}
//           </ViewAllModal>

//           <ViewAllModal isOpen={openModal === 'trend'} onClose={closeModal} title="P&L Trend — All Periods" subtitle={`Currency: ${currency}`}>
//             <ViewAllFilterBar
//               filters={viewAllFilters}
//               setFilters={setViewAllFilters}
//               filterOptions={viewAllFilterOptions}
//               onApply={applyViewAllFilters}
//               onReset={resetViewAllFilters}
//               loading={viewAllLoading}
//             />
//             {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={220} /></div> : <TrendViewAll data={viewAllData.trend} currency={currency} />}
//           </ViewAllModal>

//           <ViewAllModal isOpen={openModal === 'comparison'} onClose={closeModal} title="P&L Comparison" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'Current'}`}>
//             <ViewAllFilterBar
//               filters={viewAllFilters}
//               setFilters={setViewAllFilters}
//               filterOptions={viewAllFilterOptions}
//               onApply={applyViewAllFilters}
//               onReset={resetViewAllFilters}
//               loading={viewAllLoading}
//             />
//             {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={220} /></div> : (
//               <ComparisonViewAll
//                 data={viewAllData.comparison}
//                 currency={currency}
//                 periodLabel={(viewAllFilters.periodName || []).join(', ')}
//                 compareLabel={(viewAllFilters.comparePeriodName || []).join(', ')}
//               />
//             )}
//           </ViewAllModal>

//           <ViewAllModal isOpen={openModal === 'expense'} onClose={closeModal} title="Expense Breakdown" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'All'} | Currency: ${currency}`}>
//             <ViewAllFilterBar
//               filters={viewAllFilters}
//               setFilters={setViewAllFilters}
//               filterOptions={viewAllFilterOptions}
//               onApply={applyViewAllFilters}
//               onReset={resetViewAllFilters}
//               loading={viewAllLoading}
//             />
//             {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={220} /></div> : (
//               <ExpenseViewAll
//                 data={viewAllData.expenseBreakdown}
//                 totalExpenses={viewAllData.expenseBreakdown?.total_expenses ?? 0}
//                 currency={currency}
//               />
//             )}
//           </ViewAllModal>

//           <ViewAllModal isOpen={openModal === 'statement'} onClose={closeModal} title="Profit & Loss Statement" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'All'} | All values in ${currency}`}>
//             <ViewAllFilterBar
//               filters={viewAllFilters}
//               setFilters={setViewAllFilters}
//               filterOptions={viewAllFilterOptions}
//               onApply={applyViewAllFilters}
//               onReset={resetViewAllFilters}
//               loading={viewAllLoading}
//             />
//             {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={300} /></div> : (
//               <StatementViewAll
//                 incomeRows={(viewAllData.statement?.rows || []).filter(row => String(row.section || '').toUpperCase() === 'INCOME').sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))}
//                 costOfSalesRows={(viewAllData.statement?.rows || []).filter(row => String(row.section || '').toUpperCase() === 'COST OF SALES').sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))}
//                 profitabilityRows={(viewAllData.statement?.rows || []).filter(row => String(row.section || '').toUpperCase() === 'PROFITABILITY').sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))}
//                 expensesRows={(viewAllData.statement?.rows || []).filter(row => String(row.section || '').toUpperCase() === 'EXPENSES').sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))}
//                 otherExpensesRows={(viewAllData.statement?.rows || []).filter(row => String(row.section || '').toUpperCase() === 'OTHER EXPENSES').sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))}
//                 currency={currency}
//                 periodName={(viewAllFilters.periodName || []).join(', ')}
//                 comparePeriodName={(viewAllFilters.comparePeriodName || []).join(', ')}
//               />
//             )}
//           </ViewAllModal>
//         </>
//       )}

//       {/* ══ PAGE HEADER ══ */}
//       <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
//         <div>
//           <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.navy, margin: 0 }}>Profitability Analysis</h1>
//           <p style={{ fontSize: '0.76rem', color: C.slate, margin: '3px 0 0' }}>
//             Analyze profitability metrics and track financial performance across periods
//           </p>
//         </div>
//         <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
//           <select id="pl-currency" value={filters.currency} onChange={e => setFilters(prev => ({ ...prev, currency: e.target.value }))}
//             style={{ ...selStyle, width: 80, fontSize: '0.74rem', padding: '7px 22px 7px 8px' }} title="Select currency">
//             {filterOptions.currencies.map(c => <option key={c}>{c}</option>)}
//           </select>
//           <button id="btn-pl-export-excel" onClick={() => handleExport('excel')} disabled={!!exporting}
//             style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: exporting?.includes('excel') ? '#d1fae5' : '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: '0.76rem', fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.7 : 1 }}>
//             {exporting?.includes('excel') ? '⏳' : '📊'} Excel
//           </button>
//           <button id="btn-pl-export-pdf" onClick={() => handleExport('pdf')} disabled={!!exporting}
//             style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: exporting?.includes('pdf') ? '#fee2e2' : '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', borderRadius: 8, fontSize: '0.76rem', fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.7 : 1 }}>
//             {exporting?.includes('pdf') ? '⏳' : '📄'} PDF
//           </button>
//         </div>
//       </div>

//       {/* ══ FILTER BAR ══ */}
//       <div className="card" style={{ padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'flex-end', gap: 4, flexWrap: 'nowrap' }}>
//         <FilterField label="Legal Group">
//           <MultiSelect options={filterOptions.legalGroups} value={filters.legalGroupId} onChange={v => updateFilter('legalGroupId', v)} style={{ width: 150 }} />
//         </FilterField>
//         <FilterField label="Legal Entity">
//           <MultiSelect options={filterOptions.legalEntities} value={filters.legalEntityId} onChange={v => updateFilter('legalEntityId', v)} style={{ width: 150 }} />
//         </FilterField>
//         <FilterField label="Parent Division">
//           <MultiSelect options={filterOptions.parentDivisions} value={filters.parentDivisionId} onChange={v => updateFilter('parentDivisionId', v)} style={{ width: 150 }} />
//         </FilterField>
//         <FilterField label="Sub-Division">
//           <MultiSelect options={filterOptions.subdivisions} value={filters.subdivisionId} onChange={v => updateFilter('subdivisionId', v)} style={{ width: 150 }} />
//         </FilterField>
//         <FilterField label="Year" style={{ minWidth: 70, flex: '0.7 1 0' }}>
//           <select id="filter-pl-year" style={selStyle} value={filters.year} onChange={e => setFilters(prev => ({ ...prev, year: e.target.value }))} disabled={loading.filters}>
//             {filterOptions.years.length === 0 && <option key="loading" value="">Loading…</option>}
//             {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
//           </select>
//         </FilterField>
//         <FilterField label="Period" style={{ minWidth: 90, flex: '0.8 1 0' }}>
//           <select id="filter-pl-period" style={selStyle} value={filters.periodName} onChange={e => setFilters(prev => ({ ...prev, periodName: e.target.value }))} disabled={loading.filters}>
//             {filterOptions.periods.length === 0 && <option key="loading" value="">Loading…</option>}
//             {filterOptions.periods.map(p => <option key={p} value={p}>{p}</option>)}
//           </select>
//         </FilterField>
//         <FilterField label="Compare With" style={{ minWidth: 125, flex: '1.2 1 0' }}>
//           <select
//             id="filter-pl-compare"
//             style={selStyle}
//             value={filters.comparePeriodName}
//             onChange={(e) =>
//               setFilters((prev) => ({
//                 ...prev,
//                 comparePeriodName: e.target.value,
//               }))
//             }
//             disabled={loading.filters}
//           >
//             <option value="">None</option>
//             {filterOptions.comparePeriods.map((period) => (
//               <option key={period} value={period}>
//                 {period}
//               </option>
//             ))}
//           </select>
//         </FilterField>
//         <button id="btn-pl-apply" onClick={handleApply} style={{ padding: '7px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end', whiteSpace: 'nowrap' }}>Apply</button>
//         <button id="btn-pl-reset" onClick={handleReset} style={{ background: 'none', border: 'none', color: C.slate, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', alignSelf: 'flex-end', padding: '7px 4px', whiteSpace: 'nowrap' }}>Reset</button>
//       </div>

//       {errors.filters && <ErrorBanner message={errors.filters} />}

//       {/* ══ KPI CARDS ══ */}
//       <div className="card" style={{ padding: '12px 16px', marginBottom: 18 }}>
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
//           <span style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>Key Performance Indicators</span>
//           <KebabMenu id="menu-kpi" items={kpiMenuItems} />
//         </div>
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
//           {kpiCards.map(kpi => <KPICard key={kpi.id} {...kpi} loading={loading.summary} error={errors.summary} />)}
//         </div>
//       </div>

//       {/* ══ CHARTS ROW ══ */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }}>

//         {/* P&L Trend */}
//         <PLTrendCard
//           data={trendData}
//           loading={loading.trend}
//           currency={currency}
//         />

//         {/* P&L Comparison */}
//         <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
//             <div>
//               <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>P&amp;L Comparison</div>
//               <div style={{ fontSize: '0.65rem', color: C.muted, marginTop: 1 }}>{periodLabel} vs {compareLabel} vs {priorLabel}</div>
//             </div>
//             <KebabMenu id="menu-comparison" items={compMenuItems} />
//           </div>
//           {errors.comparison ? <ErrorBanner message={errors.comparison} onRetry={() => fetchAll(appliedFilters)} />
//             : (
//               <PLComparisonCard
//                 data={comparisonData}
//                 loading={loading.comparison}
//                 currency={currency}
//                 periodLabel={periodLabel}
//                 compareLabel={compareLabel}
//                 priorLabel={priorLabel}
//               />
//             )
//           }
//         </div>

//         {/* Expense Breakdown */}
//         <ExpenseBreakdownCard
//           data={expenseItems}
//           loading={loading.expenseBreakdown}
//           currency={currency}
//           error={errors.expenseBreakdown}
//           onRetry={() => fetchAll(appliedFilters)}
//           menuItems={expenseMenuItems}
//           KebabMenu={KebabMenu}
//           ErrorBanner={ErrorBanner}
//           Skeleton={Skeleton}
//         />
//       </div>

//       {/* ══ P&L STATEMENT TABLE ══ */}
//       <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 8 }}>
//         <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, background: 'linear-gradient(90deg,#f8fafc,#fff)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <div>
//             <span style={{ fontWeight: 800, fontSize: '0.88rem', color: C.navy }}>Profit &amp; Loss Statement</span>
//             <span style={{ fontSize: '0.7rem', color: C.slate, marginLeft: 12 }}>
//               {appliedFilters.periodName} &nbsp;|&nbsp; All values in {currency}
//             </span>
//           </div>
//           <KebabMenu id="menu-statement" items={statementMenuItems} />
//         </div>

//         {errors.statement ? (
//           <div style={{ padding: 16 }}><ErrorBanner message={errors.statement} onRetry={() => fetchAll(appliedFilters)} /></div>
//         ) : loading.statement ? (
//           <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
//             {[...Array(8)].map((_, i) => <Skeleton key={i} h={24} w={`${60 + (i % 3) * 15}%`} />)}
//           </div>
//         ) : (
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
//               <thead>
//                 <tr>
//                   <th
//                     style={{
//                       ...TH_L,
//                       width: '25%',
//                       minWidth: 250,
//                     }}
//                   >
//                     Particulars
//                     <br />
//                     <span
//                       style={{
//                         fontWeight: 400,
//                         opacity: 0.75,
//                       }}
//                     >
//                       (in {currency})
//                     </span>
//                   </th>

//                   <th style={TH}>
//                     Current PTD
//                     <br />
//                     <span
//                       style={{
//                         fontWeight: 400,
//                         opacity: 0.75,
//                       }}
//                     >
//                       {appliedFilters.periodName}
//                     </span>
//                   </th>

//                   <th style={TH}>
//                     Compare PTD
//                     <br />
//                     <span
//                       style={{
//                         fontWeight: 400,
//                         opacity: 0.75,
//                       }}
//                     >
//                       {appliedFilters.comparePeriodName || '—'}
//                     </span>
//                   </th>

//                   <th style={TH}>
//                     Target PTD
//                   </th>

//                   <th style={TH}>
//                     Var % Current
//                     <br />
//                     <span
//                       style={{
//                         fontWeight: 400,
//                         opacity: 0.75,
//                       }}
//                     >
//                       vs Compare
//                     </span>
//                   </th>

//                   <th style={TH}>
//                     Var % Current
//                     <br />
//                     <span
//                       style={{
//                         fontWeight: 400,
//                         opacity: 0.75,
//                       }}
//                     >
//                       vs Target
//                     </span>
//                   </th>

//                   <th style={TH}>
//                     Current YTD
//                   </th>

//                   <th style={TH}>
//                     Target YTD
//                   </th>

//                   <th style={TH}>
//                     Var % YTD
//                     <br />
//                     <span
//                       style={{
//                         fontWeight: 400,
//                         opacity: 0.75,
//                       }}
//                     >
//                       vs Target
//                     </span>
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>

//                 {/* ============================================================
//       INCOME
//   ============================================================ */}
//                 <SectionHeader
//                   label="INCOME"
//                   expanded={secIncome}
//                   onToggle={() => setSecIncome((p) => !p)}
//                   colSpan={9}
//                 />

//                 {incomeRows.map((row, i) => {
//                   const visible =
//                     secIncome || row.is_subtotal;

//                   if (!visible) return null;

//                   return (
//                     <PLRow
//                       key={`income-${row.display_order ?? i}`}
//                       row={row}
//                       indent={!row.is_subtotal}
//                       currency={currency}
//                     />
//                   );
//                 })}


//                 {/* ============================================================
//       COST OF SALES
//   ============================================================ */}
//                 <SectionHeader
//                   label="COST OF SALES"
//                   expanded={secCOGS}
//                   onToggle={() => setSecCOGS((p) => !p)}
//                   colSpan={9}
//                 />

//                 {costOfSalesRows.map((row, i) => {
//                   const visible =
//                     secCOGS || row.is_subtotal;

//                   if (!visible) return null;

//                   return (
//                     <PLRow
//                       key={`cogs-${row.display_order ?? i}`}
//                       row={row}
//                       indent={!row.is_subtotal}
//                       currency={currency}
//                     />
//                   );
//                 })}


//                 {/* ============================================================
//       PROFITABILITY
//       Gross Profit / EBITDA / PBT / Net Profit stay visible
//       even when collapsed because they are subtotals.
//   ============================================================ */}
//                 <SectionHeader
//                   label="PROFITABILITY"
//                   expanded={secProfitability}
//                   onToggle={() =>
//                     setSecProfitability((p) => !p)
//                   }
//                   colSpan={9}
//                 />

//                 {profitabilityRows.map((row, i) => {
//                   const visible =
//                     secProfitability || row.is_subtotal;

//                   if (!visible) return null;

//                   return (
//                     <PLRow
//                       key={`profitability-${row.display_order ?? i}`}
//                       row={row}
//                       indent={!row.is_subtotal}
//                       currency={currency}
//                     />
//                   );
//                 })}


//                 {/* ============================================================
//       EXPENSES
//   ============================================================ */}
//                 <SectionHeader
//                   label="EXPENSES"
//                   expanded={secExpenses}
//                   onToggle={() => setSecExpenses((p) => !p)}
//                   colSpan={9}
//                 />

//                 {expensesRows.map((row, i) => {
//                   const visible =
//                     secExpenses || row.is_subtotal;

//                   if (!visible) return null;

//                   return (
//                     <PLRow
//                       key={`expenses-${row.display_order ?? i}`}
//                       row={row}
//                       indent={!row.is_subtotal}
//                       currency={currency}
//                     />
//                   );
//                 })}


//                 {/* ============================================================
//       OTHER EXPENSES
//   ============================================================ */}
//                 <SectionHeader
//                   label="OTHER EXPENSES"
//                   expanded={secOtherExpenses}
//                   onToggle={() =>
//                     setSecOtherExpenses((p) => !p)
//                   }
//                   colSpan={9}
//                 />

//                 {otherExpensesRows.map((row, i) => {
//                   const visible =
//                     secOtherExpenses || row.is_subtotal;

//                   if (!visible) return null;

//                   return (
//                     <PLRow
//                       key={`other-expenses-${row.display_order ?? i}`}
//                       row={row}
//                       indent={!row.is_subtotal}
//                       currency={currency}
//                     />
//                   );
//                 })}

//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* ══ FOOTER ══ */}
//       <div style={{ fontSize: '0.64rem', color: C.muted, display: 'flex', justifyContent: 'space-between', paddingTop: 8, flexWrap: 'wrap', gap: 4 }}>
//         <span>All values in {currency} &nbsp;|&nbsp; Period: {appliedFilters.periodName || '—'} &nbsp;|&nbsp; Compared with: {appliedFilters.comparePeriodName || '—'}</span>
//         <span>☁️ Source: Oracle Fusion Cloud</span>
//       </div>

//     </div>
//   );
// }



import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  fetchPLFilters,
  fetchPLSummary,
  fetchPLTrend,
  fetchPLComparison,
  fetchPLExpenseBreakdown,
  fetchPLStatement,
  exportPL,
} from '../services/plApi';
import { C, CHART_COLORS } from '../utils/theme';
import PLTrendCard from '../components/Charts/PLTrendCard';
import PLComparisonCard from '../components/Charts/PLComparisonCard';
import ExpenseBreakdownCard from '../components/Charts/ExpenseBreakdownCard';
import ExportButtons from "../components/Common/ExportButtons";


/* ══════════════════════════════════════════════════════════════════
   CONSTANTS & DEFAULTS
══════════════════════════════════════════════════════════════════ */
const DEFAULT_FILTERS = {
  legalGroupId: ['All'],
  legalEntityId: ['All'],
  parentDivisionId: ['All'],
  subdivisionId: ['All'],
  year: '',
  periodName: '',
  comparePeriodName: '',
  currency: 'AED',
};

const EXPENSE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#a855f7', '#f43f5e'];

/* ══════════════════════════════════════════════════════════════════
   SHARED STYLES
══════════════════════════════════════════════════════════════════ */
const selStyle = {
  appearance: 'none', padding: '6px 28px 6px 10px',
  fontSize: '0.78rem', fontWeight: 500, color: '#334155',
  background: '#fff', border: `1px solid ${C.border}`,
  borderRadius: 7, cursor: 'pointer', outline: 'none', width: '100%',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
};

const TH = {
  padding: '10px 12px', textAlign: 'right', fontSize: '0.72rem',
  fontWeight: 700, color: '#1e3a8a', background: '#f8fafc',
  borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap',
};
const TH_L = { ...TH, textAlign: 'left' };
const TD = { padding: '8px 12px', textAlign: 'right', fontSize: '0.74rem', color: '#334155', borderBottom: '1px solid #f1f5f9' };
const TD_L = { ...TD, textAlign: 'left', color: C.navy };

/* ══════════════════════════════════════════════════════════════════
   HELPER COMPONENTS
══════════════════════════════════════════════════════════════════ */

function Skeleton({ h = 20, w = '100%', radius = 6 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: radius,
      background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
    }} />
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10,
      padding: '10px 16px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 4, fontSize: '0.78rem', color: '#be123c', marginTop: 8,
    }}>
      <span>⚠ {message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: '#be123c', color: '#fff', border: 'none',
          borderRadius: 6, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
        }}>Retry</button>
      )}
    </div>
  );
}

function FilterField({ label, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 80, flex: '1 1 0', ...style }}>
      <span style={{ fontSize: '0.66rem', color: '#1e3a8a', fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function ExportToast({ message, type }) {
  if (!message) return null;
  const isErr = type === 'error';
  const isInfo = type === 'info';
  const bg = isErr ? '#fff1f2' : isInfo ? '#eff6ff' : '#f0fdf4';
  const border = isErr ? '#fecdd3' : isInfo ? '#bfdbfe' : '#bbf7d0';
  const color = isErr ? '#be123c' : isInfo ? '#1d4ed8' : '#15803d';
  const icon = isErr ? '⚠ ' : isInfo ? 'ℹ ' : '✓ ';
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: bg, border: `1px solid ${border}`, color,
      borderRadius: 10, padding: '10px 18px',
      fontSize: '0.78rem', fontWeight: 700,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      display: 'flex', alignItems: 'center', gap: 4,
      animation: 'fadeIn 0.2s ease', maxWidth: 380,
    }}>
      {icon}{message}
    </div>
  );
}

/* ── Three-dot Kebab Menu ─────────────────────────────────────── */
function KebabMenu({ id, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        id={id}
        onClick={() => setOpen(v => !v)}
        title="Options"
        style={{
          background: open ? '#f1f5f9' : 'none',
          border: 'none', cursor: 'pointer',
          padding: '4px 7px', borderRadius: 6,
          fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1,
          display: 'flex', alignItems: 'center', outline: 'none',
          transition: 'background 0.15s',
        }}
      >
        ⋮
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 4px)',
          background: '#fff', borderRadius: 10,
          boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
          border: '1px solid #e2e8f0',
          minWidth: 170, zIndex: 200, overflow: 'hidden',
          animation: 'menuPop 0.14s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}>
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { item.action(); setOpen(false); }}
              disabled={item.disabled}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                width: '100%', textAlign: 'left',
                padding: '9px 14px', background: 'none', border: 'none',
                fontSize: '0.74rem', fontWeight: 600, color: item.danger ? '#be123c' : '#334155',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
                opacity: item.disabled ? 0.5 : 1,
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── View All Modal ───────────────────────────────────────────── */
function MultiSelect({ options, value, onChange, placeholder = 'All', style }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const normOptions = options.map(o => {
    if (typeof o === 'string') return { id: o, name: o };
    const id = o.value !== undefined ? o.value : o.id;
    const name = o.label !== undefined ? o.label : o.name;
    return { id, name };
  });

  const normalizedValue = Array.isArray(value)
    ? value
    : value
      ? [value]
      : [];

  const isAll = normalizedValue.length === 0 || (normalizedValue.length === 1 && String(normalizedValue[0]) === 'All');
  const toggle = (optId) => {
    if (String(optId) === 'All') { onChange(['All']); return; }
    const cur = isAll ? [] : normalizedValue.filter(v => String(v) !== 'All');
    const next = cur.some(v => String(v) === String(optId))
      ? cur.filter(v => String(v) !== String(optId))
      : [...cur, optId];
    onChange(next.length === 0 ? ['All'] : next);
  };

  const selectedVals = normOptions.filter(o => normalizedValue.some(v => String(v) === String(o.id)));
  const label = isAll ? placeholder : selectedVals.length === 1 ? selectedVals[0].name : (selectedVals.length + ' selected');

  return (
    <div ref={ref} style={{ position: 'relative', ...style }}>
      <div onClick={() => setOpen(o => !o)} style={{ ...selStyle, backgroundImage: 'none', appearance: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', userSelect: 'none' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85%' }}>{label}</span>
        <span style={{ fontSize: '0.65rem', color: '#94a3b8', flexShrink: 0 }}>{open ? '\u25B2' : '\u25BC'}</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: '220px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 500, marginTop: 2, maxHeight: 200, overflowY: 'auto' }}>

          <div onClick={() => toggle('All')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', cursor: 'pointer', fontSize: '0.78rem', background: isAll ? '#eff6ff' : '#fff', color: isAll ? '#2563eb' : '#334155', fontWeight: isAll ? 600 : 400, borderBottom: '1px solid #f8fafc', whiteSpace: 'normal', lineHeight: 1.25 }} onMouseEnter={e => { if (!isAll) e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={e => { if (!isAll) e.currentTarget.style.background = '#fff'; }}>
            <span style={{ width: 14, height: 14, border: '1.5px solid ' + (isAll ? '#2563eb' : '#cbd5e1'), borderRadius: 3, background: isAll ? '#2563eb' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isAll && <span style={{ color: '#fff', fontSize: '0.6rem', lineHeight: 1 }}>✓</span>}
            </span>
            All
          </div>

          {normOptions.map(opt => {
            if (opt.id === 'All') return null;
            const selected = !isAll && normalizedValue.some(v => String(v) === String(opt.id));
            return (
              <div key={opt.id} onClick={() => toggle(opt.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', cursor: 'pointer', fontSize: '0.78rem', background: selected ? '#eff6ff' : '#fff', color: selected ? '#2563eb' : '#334155', fontWeight: selected ? 600 : 400, borderBottom: '1px solid #f8fafc', whiteSpace: 'normal', lineHeight: 1.25 }} onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={e => { if (!selected) e.currentTarget.style.background = '#fff'; }}>
                <span style={{ width: 14, height: 14, border: '1.5px solid ' + (selected ? '#2563eb' : '#cbd5e1'), borderRadius: 3, background: selected ? '#2563eb' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selected && <span style={{ color: '#fff', fontSize: '0.6rem', lineHeight: 1 }}>✓</span>}
                </span>
                {opt.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


const getYearValue = (year) => {
  if (year === null || year === undefined) return '';

  if (typeof year === 'object') {
    return String(
      year.value ??
      year.id ??
      year.year ??
      year.label ??
      year.name ??
      ''
    );
  }

  return String(year);
};

/* ── View All interactive filters ───────────────────────────────── */
function ViewAllFilterBar({
  filters,
  setFilters,
  filterOptions,
  onApply,
  onReset,
  onExport,
  exporting = null,
  loading = false,
}) {

  const yearOptions = (filterOptions?.years || [])
    .map(year => {
      if (typeof year === 'object' && year !== null) {
        return String(
          year.value ??
          year.id ??
          year.year ??
          year.label ??
          year.name ??
          ''
        );
      }

      return String(year);
    })
    .filter(Boolean);

  const selectedYearValues = (
    Array.isArray(filters?.year)
      ? filters.year
      : filters?.year
        ? [filters.year]
        : []
  )
    .map(year => {
      if (typeof year === 'object' && year !== null) {
        return String(
          year.value ??
          year.id ??
          year.year ??
          year.label ??
          year.name ??
          ''
        );
      }

      return String(year);
    })
    .filter(Boolean);
  // Keep the View All Year populated with the first available year when
  // the modal opens or when its filter options finish loading.
  useEffect(() => {
    if (!yearOptions.length) return;

    setFilters(prev => {
      if (!prev) return prev;

      const currentYear = (
        Array.isArray(prev.year)
          ? prev.year
          : prev.year
            ? [prev.year]
            : []
      )
        .map(year => {
          if (typeof year === 'object' && year !== null) {
            return String(
              year.value ??
              year.id ??
              year.year ??
              year.label ??
              year.name ??
              ''
            );
          }

          return String(year);
        })
        .filter(Boolean);

      const validYear = currentYear.find(
        year =>
          year !== 'All' &&
          yearOptions.includes(year)
      );

      if (validYear) {
        return {
          ...prev,
          year: [validYear],
        };
      }

      return {
        ...prev,
        year: [yearOptions[0]],
      };
    });
  }, [filterOptions?.years?.join('|'), yearOptions.join('|'), setFilters]);

  const update = (key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'legalEntityId') {
        next.parentDivisionId = ['All'];
        next.subdivisionId = ['All'];
      }
      if (key === 'parentDivisionId') {
        next.subdivisionId = ['All'];
      }
      return next;
    });
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e2e8f0',
        background: '#fff',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(130px, 1fr)) auto auto 1fr',
        gap: 8,
        alignItems: 'end',
        minWidth: 900,
      }}
    >
      <FilterField label="Year">
        <MultiSelect
          options={yearOptions}
          value={
            selectedYearValues.length &&
              selectedYearValues.some(
                year =>
                  year !== 'All' &&
                  yearOptions.includes(year)
              )
              ? selectedYearValues.filter(
                year => year !== 'All' && yearOptions.includes(year)
              )
              : yearOptions.length
                ? [yearOptions[0]]
                : []
          }
          onChange={v => update('year', v)}
          style={{ width: '100%' }}
        />
      </FilterField>
      <FilterField label="Legal Entity">
        <MultiSelect
          options={filterOptions.legalEntities}
          value={filters.legalEntityId}
          onChange={v => update('legalEntityId', v)}
          style={{ width: '100%' }}
        />
      </FilterField>

      <FilterField label="Parent Division">
        <MultiSelect
          options={filterOptions.parentDivisions}
          value={filters.parentDivisionId}
          onChange={v => update('parentDivisionId', v)}
          style={{ width: '100%' }}
        />
      </FilterField>

      <FilterField label="Sub-Division">
        <MultiSelect
          options={filterOptions.subdivisions}
          value={filters.subdivisionId}
          onChange={v => update('subdivisionId', v)}
          style={{ width: '100%' }}
        />
      </FilterField>

      <FilterField label="Period">
        <MultiSelect
          options={filterOptions.periods}
          value={filters.periodName}
          onChange={v => update('periodName', v)}
          style={{ width: '100%' }}
        />
      </FilterField>

      <button
        onClick={onApply}
        disabled={loading}
        style={{
          padding: '7px 16px',
          background: C.primary,
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.65 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {loading ? 'Loading…' : 'Apply'}
      </button>

      <button
        onClick={onReset}
        disabled={loading}
        style={{
          background: 'none',
          border: 'none',
          color: C.slate,
          fontWeight: 600,
          fontSize: '0.75rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          padding: '7px 4px',
          whiteSpace: 'nowrap',
        }}
      >
        Reset
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 6,
        }}
      >
        <ExportButtons
          endpoint="pl-view-all"
          exporting={exporting}
          handleExport={onExport}
        />
      </div>

    </div>
  );
}

function ModalCloseButton({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? '#f1f5f9' : 'none',
        border: 'none',
        fontSize: '0.85rem',
        color: C.slate,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '50%',
        transition: 'all 0.15s',
        outline: 'none',
      }}
      title="Close"
    >
      ✕
    </button>
  );
}

function ViewAllModal({ isOpen, onClose, title, subtitle, children }) {
  const bodyRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (overlayRef.current) overlayRef.current.scrollTop = 0;
    if (bodyRef.current) bodyRef.current.scrollTop = 0;

    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: 0,
        overflowY: 'auto',
        minHeight: '100vh',
        zIndex: 99999, animation: 'fadeIn 0.18s ease',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 0,
        width: '98%', maxWidth: 1500,
        height: '90vh', maxHeight: '90vh', minHeight: 0,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
        animation: 'modalPop 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards',
        overflow: 'hidden', border: '1px solid #e2e8f0',
        marginTop: '5vh', flexShrink: 0,
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(90deg,#f8fafc,#fff)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: C.navy }}>{title}</h3>
            {subtitle && <div style={{ fontSize: '0.7rem', color: C.muted, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              width: 30, height: 30, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', color: C.slate, transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            title="Close (Esc)"
          >✕</button>
        </div>

        {/* Modal Body */}
        <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

/* ── Variance Cell ────────────────────────────────────────────── */
function VarCell({ v, isPct = false }) {
  if (v === null || v === undefined) return <td style={TD}>—</td>;
  if (typeof v === 'string' && v.includes('%')) return <td style={{ ...TD, color: C.slate }}>{v}</td>;
  const pos = v >= 0;
  return (
    <td style={{ ...TD, color: pos ? C.green : C.rose, fontWeight: 700 }}>
      {pos ? '▲' : '▼'} {Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: isPct ? 2 : 0 })}{isPct ? '%' : ''}
    </td>
  );
}

/* Inline variance badge for modal tables */
function VarBadge({ v, isPct = false }) {
  if (v === null || v === undefined) return <span style={{ color: C.muted }}>—</span>;
  const pos = v >= 0;
  return (
    <span style={{ color: pos ? C.green : C.rose, fontWeight: 700 }}>
      {pos ? '▲' : '▼'} {Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: isPct ? 2 : 0 })}{isPct ? '%' : ''}
    </span>
  );
}

/* ── Number formatters ────────────────────────────────────────── */
const fmtNum = (v, currency = 'AED') => {
  if (v === null || v === undefined) return '—';
  const n = Number(v);
  if (isNaN(n)) return v;
  return `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
/* Compact formatter for KPI cards — keeps numbers from overflowing */
const fmtKPI = (v, currency = 'AED') => {
  if (v === null || v === undefined) return '—';
  const n = Number(v);
  if (isNaN(n)) return v;
  if (Math.abs(n) >= 1_000_000_000) return `${currency} ${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `${currency} ${(n / 1_000).toFixed(1)}K`;
  return `${currency} ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};
const fmtPct = (v) => (v !== null && v !== undefined) ? `${Number(v).toFixed(2)}%` : '—';
const fmtAxisNum = (v) => {
  if (v === 0) return '0';
  if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
};

/* ── Custom Chart Tooltip ─────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label, currency = 'AED' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0',
      backdropFilter: 'blur(6px)', borderRadius: 8, padding: '8px 12px',
      fontSize: '0.7rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', minWidth: 150,
    }}>
      <div style={{ fontWeight: 700, color: C.navy, marginBottom: 5, borderBottom: '1px solid #f1f5f9', paddingBottom: 4 }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
            <span style={{ color: C.slate }}>{p.name}</span>
          </div>
          <span style={{ fontWeight: 700, color: C.navy }}>
            {currency} {Number(p.value).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Legend Row ───────────────────────────────────────────────── */
function LegendRow({ items }) {
  return (
    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
      {items.map(([label, color, dashed]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 18, height: 2.5,
            background: dashed ? 'transparent' : color,
            borderTop: dashed ? `2.5px dashed ${color}` : 'none',
            display: 'inline-block', borderRadius: 1,
          }} />
          <span style={{ fontSize: '0.62rem', color: C.slate, fontWeight: 500 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────── */
function KPICard({ id, label, value, subValue, changePct, compareLabel, color, iconBg, icon, loading, error }) {
  const [hover, setHover] = useState(false);
  const accent = color || C.primary;
  const up = changePct >= 0;

  return (
    <div
      id={`kpi-${id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1, minWidth: 140,
        background: `linear-gradient(145deg, #fff 0%, ${iconBg}80 100%)`,
        borderRadius: 12, padding: '12px 14px',
        boxShadow: hover ? `0 8px 24px ${accent}25` : '0 2px 8px rgba(0,0,0,0.04)',
        border: `1px solid ${hover ? accent + '30' : 'rgba(0,0,0,0.04)'}`,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hover ? 'translateY(-2px)' : 'none',
        display: 'flex', alignItems: 'center', gap: 4,
        overflow: 'hidden', position: 'relative', minHeight: 82,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: '50%', background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: accent, fontSize: '1.2rem',
      }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: accent, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
          {label}
        </span>
        {loading ? <Skeleton h={16} w={90} /> : error ? (
          <span style={{ fontSize: '0.68rem', color: C.rose }}>Error loading</span>
        ) : (
          <>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
              {value}
            </div>
            {subValue && <div style={{ fontSize: '0.62rem', color: C.slate, fontWeight: 500 }}>{subValue}</div>}
            {changePct !== null && changePct !== undefined && compareLabel && (
              <div style={{ fontSize: '0.62rem', fontWeight: 600, lineHeight: 1.1, marginTop: 2 }}>
                <span style={{ color: up ? C.green : C.rose, marginRight: 3 }}>
                  {up ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
                </span>
                <span style={{ color: C.muted }}>{compareLabel}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Modal Table wrapper styles ───────────────────────────────── */
const MTH = {
  padding: '10px 14px', textAlign: 'right', fontSize: '0.73rem',
  fontWeight: 700, color: '#1e3a8a', background: '#f8fafc',
  borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 1,
};
const MTH_L = { ...MTH, textAlign: 'left' };
const MTD = { padding: '9px 14px', textAlign: 'right', fontSize: '0.74rem', color: '#334155', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };
const MTD_L = { ...MTD, textAlign: 'left', color: C.navy };



/* ── Section Header (collapsible table row) ───────────────────── */
function SectionHeader({
  label,
  expanded,
  onToggle,
  colSpan = 9,
}) {
  return (
    <tr
      onClick={onToggle}
      style={{
        background:
          'linear-gradient(90deg, #f0f4ff, #f8fafc)',
        cursor: 'pointer',
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <td
        colSpan={colSpan}
        style={{
          padding: '8px 12px',
          fontSize: '0.72rem',
          fontWeight: 800,
          color: C.navy,
          letterSpacing: '0.04em',
        }}
      >
        <span
          style={{
            marginRight: 7,
            fontSize: '0.62rem',
            display: 'inline-block',
            transition: 'transform 0.2s',
            transform: expanded
              ? 'rotate(90deg)'
              : 'none',
          }}
        >
          ▶
        </span>

        {label}
      </td>
    </tr>
  );
}

/* ── P&L Statement Row ────────────────────────────────────────── */

function PLRow({
  row,
  indent = false,
  currency = 'AED',
  thStyles,
  tdStyles,
}) {
  const [hover, setHover] = useState(false);

  const TDx = tdStyles || TD;

  const TDLx = {
    ...(tdStyles || TD),
    textAlign: 'left',
    color: C.navy,
  };

  // ------------------------------------------------------------
  // Backend hierarchy
  // ------------------------------------------------------------
  const isSubtotal =
    row?.is_subtotal === true ||
    row?.row_type === 'subtotal';

  // ------------------------------------------------------------
  // Important CFO subtotal rows
  // ------------------------------------------------------------
  const label = String(
    row?.particulars ?? '—'
  );

  const labelLower = label.toLowerCase();

  const isNetProfit =
    labelLower === 'net profit';

  const isEbitda =
    labelLower === 'ebitda';

  const isGrossProfit =
    labelLower === 'gross profit';

  const isPBT =
    labelLower === 'pbt' ||
    labelLower === 'profit before tax';

  const isImportantSubtotal =
    isSubtotal &&
    (
      isNetProfit ||
      isEbitda ||
      isGrossProfit ||
      isPBT ||
      labelLower === 'total revenue' ||
      labelLower === 'total cost of sales' ||
      labelLower === 'total operating expenses'
    );

  // ------------------------------------------------------------
  // Row styling
  // ------------------------------------------------------------
  const rowBg =
    isNetProfit
      ? '#f0fdf4'
      : isEbitda || isGrossProfit || isPBT
        ? '#eef2ff'
        : isSubtotal
          ? '#f8fafc'
          : 'transparent';

  const labelColor =
    isNetProfit
      ? C.green
      : isEbitda || isGrossProfit || isPBT
        ? C.primary
        : isSubtotal
          ? C.navy
          : '#334155';

  // ------------------------------------------------------------
  // Exact backend values
  // ------------------------------------------------------------
  const currentPTD = row?.current_ptd;
  const comparePTD = row?.compare_ptd;
  const targetPTD = row?.target_ptd;

  const varianceCurrentVsCompare =
    row?.variance_pct_current_vs_compare;

  const varianceCurrentVsTarget =
    row?.variance_pct_current_vs_target;

  const currentYTD = row?.current_ytd;
  const targetYTD = row?.target_ytd;

  const varianceYTDVsTarget =
    row?.variance_pct_ytd_vs_target;

  // ------------------------------------------------------------
  // Null-safe formatters
  // ------------------------------------------------------------
  const formatAmount = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '—';
    }

    return fmtNum(value, currency);
  };

  const formatPercent = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '—';
    }

    const num = Number(value);

    if (!Number.isFinite(num)) {
      return '—';
    }

    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  return (
    <tr
      style={{
        background:
          hover && !isSubtotal
            ? '#f0f6ff'
            : rowBg,
        transition: 'background 0.1s',
      }}
      onMouseEnter={() => {
        if (!isSubtotal) setHover(true);
      }}
      onMouseLeave={() => setHover(false)}
    >

      {/* ======================================================
          PARTICULARS
      ====================================================== */}
      <td
        style={{
          ...TDLx,
          paddingLeft: indent ? 28 : 12,
          fontWeight:
            isImportantSubtotal || isSubtotal
              ? 700
              : 400,
          color: labelColor,
          fontSize:
            isImportantSubtotal
              ? '0.76rem'
              : '0.74rem',
          borderBottom:
            `1px solid ${isSubtotal
              ? '#e2e8f0'
              : '#f1f5f9'
            }`,
        }}
      >
        {label}
      </td>

      {/* ======================================================
          CURRENT PTD
      ====================================================== */}
      <td
        style={{
          ...TDx,
          fontWeight:
            isImportantSubtotal || isSubtotal
              ? 700
              : 400,
          color: labelColor,
        }}
      >
        {formatAmount(currentPTD)}
      </td>

      {/* ======================================================
          COMPARE PTD
      ====================================================== */}
      <td
        style={{
          ...TDx,
          color: C.slate,
        }}
      >
        {formatAmount(comparePTD)}
      </td>

      {/* ======================================================
          TARGET PTD
      ====================================================== */}
      <td
        style={{
          ...TDx,
          color: C.slate,
        }}
      >
        {formatAmount(targetPTD)}
      </td>

      {/* ======================================================
          VAR % CURRENT VS COMPARE
      ====================================================== */}
      <td
        style={{
          ...TDx,
          color:
            varianceCurrentVsCompare == null
              ? C.slate
              : Number(varianceCurrentVsCompare) >= 0
                ? C.green
                : C.rose,
          fontWeight:
            varianceCurrentVsCompare == null
              ? 400
              : 600,
        }}
      >
        {formatPercent(
          varianceCurrentVsCompare
        )}
      </td>

      {/* ======================================================
          VAR % CURRENT VS TARGET
      ====================================================== */}
      <td
        style={{
          ...TDx,
          color:
            varianceCurrentVsTarget == null
              ? C.slate
              : Number(varianceCurrentVsTarget) >= 0
                ? C.green
                : C.rose,
          fontWeight:
            varianceCurrentVsTarget == null
              ? 400
              : 600,
        }}
      >
        {formatPercent(
          varianceCurrentVsTarget
        )}
      </td>

      {/* ======================================================
          CURRENT YTD
      ====================================================== */}
      <td
        style={{
          ...TDx,
          fontWeight:
            isImportantSubtotal || isSubtotal
              ? 700
              : 400,
          color: labelColor,
        }}
      >
        {formatAmount(currentYTD)}
      </td>

      {/* ======================================================
          TARGET YTD
      ====================================================== */}
      <td
        style={{
          ...TDx,
          color: C.slate,
        }}
      >
        {formatAmount(targetYTD)}
      </td>

      {/* ======================================================
          VAR % YTD VS TARGET
      ====================================================== */}
      <td
        style={{
          ...TDx,
          color:
            varianceYTDVsTarget == null
              ? C.slate
              : Number(varianceYTDVsTarget) >= 0
                ? C.green
                : C.rose,
          fontWeight:
            varianceYTDVsTarget == null
              ? 400
              : 600,
        }}
      >
        {formatPercent(
          varianceYTDVsTarget
        )}
      </td>

    </tr>
  );
}
/* ══════════════════════════════════════════════════════════════════
   VIEW ALL MODAL CONTENTS
══════════════════════════════════════════════════════════════════ */

/* Trend View All Table */
function TrendViewAll({ data, currency }) {
  if (!data?.length) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={MTH_L}>Period</th>
          <th style={MTH}>Revenue</th>
          <th style={MTH}>Gross Profit</th>
          <th style={MTH}>EBITDA</th>
          <th style={MTH}>Net Profit</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}
            onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <td style={{ ...MTD_L, fontWeight: 600 }}>{row.period_name}</td>
            <td style={MTD}>{fmtNum(row.total_revenue, currency)}</td>
            <td style={{ ...MTD, color: C.green, fontWeight: 600 }}>{fmtNum(row.gross_profit, currency)}</td>
            <td style={{ ...MTD, color: C.purple, fontWeight: 600 }}>{fmtNum(row.ebitda, currency)}</td>
            <td style={{ ...MTD, color: C.orange, fontWeight: 600 }}>{fmtNum(row.net_profit, currency)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* Comparison View All Table */
function ComparisonViewAll({ data, currency, periodLabel, compareLabel }) {
  if (!data?.length) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;

  const currentPeriod = periodLabel || 'Current';
  const comparisonPeriod = compareLabel || 'Compare';

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={MTH_L}>Metric</th>
          <th style={MTH}>
            Current Period<br />
            <span style={{ fontWeight: 400, opacity: 0.75 }}>{currentPeriod}</span>
          </th>
          <th style={MTH}>
            Compare Period<br />
            <span style={{ fontWeight: 400, opacity: 0.75 }}>{comparisonPeriod}</span>
          </th>
          <th style={MTH}>Prior Year</th>
          <th style={MTH}>
            Variance<br />
            <span style={{ fontWeight: 400, opacity: 0.75 }}>(Value)</span>
          </th>
          <th style={MTH}>
            Variance<br />
            <span style={{ fontWeight: 400, opacity: 0.75 }}>(%)</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => {
          const varVal = row.current - row.compare;
          const varPct = row.compare ? ((varVal / Math.abs(row.compare)) * 100) : null;
          return (
            <tr key={i}
              onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ ...MTD_L, fontWeight: 700 }}>{row.metric}</td>
              <td style={{ ...MTD, fontWeight: 700, color: C.primary }}>{fmtNum(row.current, currency)}</td>
              <td style={MTD}>{fmtNum(row.compare, currency)}</td>
              <td style={{ ...MTD, color: C.slate }}>{fmtNum(row.prior_year, currency)}</td>
              <td style={{ ...MTD, color: varVal >= 0 ? C.green : C.rose, fontWeight: 700 }}>
                <VarBadge v={varVal} />
              </td>
              <td style={{ ...MTD, color: varPct >= 0 ? C.green : C.rose, fontWeight: 700 }}>
                {varPct !== null ? <VarBadge v={varPct} isPct /> : '—'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* Expense Breakdown View All Table */
function ExpenseViewAll({ data, totalExpenses, currency }) {
  const items = data?.items || [];
  if (!items.length) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={MTH_L}>Expense Category</th>
          <th style={MTH}>Amount</th>
          <th style={MTH}>Percentage</th>
          <th style={MTH}>of Total Expenses</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i}
            onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <td style={MTD_L}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: EXPENSE_COLORS[i % EXPENSE_COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                {item.name}
              </div>
            </td>
            <td style={{ ...MTD, fontWeight: 600 }}>{fmtNum(item.amount, currency)}</td>
            <td style={{ ...MTD, fontWeight: 700, color: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}>
              {item.pct != null ? `${Number(item.pct).toFixed(2)}%` : '—'}
            </td>
            <td style={MTD}>
              {totalExpenses ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden', maxWidth: 100 }}>
                    <div style={{ width: `${item.pct || 0}%`, height: '100%', background: EXPENSE_COLORS[i % EXPENSE_COLORS.length], borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: C.slate }}>{item.pct?.toFixed(1)}%</span>
                </div>
              ) : '—'}
            </td>
          </tr>
        ))}
        {/* Total row */}
        <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
          <td style={{ ...MTD_L, fontWeight: 800, color: C.navy }}>Total Expenses</td>
          <td style={{ ...MTD, fontWeight: 800, color: C.navy }}>{fmtNum(totalExpenses, currency)}</td>
          <td style={{ ...MTD, fontWeight: 800, color: C.navy }}>100.00%</td>
          <td style={MTD}>—</td>
        </tr>
      </tbody>
    </table>
  );
}

/* KPI Summary View All Table */
function KPISummaryViewAll({ summary, currency, periodName, comparePeriodName }) {
  if (!summary) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
  const rows = [
    { label: 'Total Revenue', current: summary.total_revenue, compare: summary.compare_total_revenue, varPct: summary.revenue_variance_pct },
    { label: 'Cost of Sales', current: summary.cost_of_sales, compare: null, varPct: null },
    { label: 'Gross Profit', current: summary.gross_profit, compare: summary.compare_gross_profit, varPct: summary.gross_profit_variance_pct, pct: summary.gross_profit_pct },
    { label: 'Other Income', current: summary.other_income, compare: null, varPct: null },
    { label: 'Operating Expenses', current: summary.operating_expenses, compare: null, varPct: null },
    { label: 'EBITDA', current: summary.ebitda, compare: summary.compare_ebitda, varPct: summary.ebitda_variance_pct, pct: summary.ebitda_pct },
    { label: 'PBT', current: summary.pbt, compare: null, varPct: null },
    { label: 'Tax Expense', current: summary.tax_expense, compare: null, varPct: null },
    { label: 'Net Profit', current: summary.net_profit, compare: summary.compare_net_profit, varPct: summary.net_profit_variance_pct, pct: summary.net_profit_pct, isNet: true },
  ];
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={MTH_L}>Metric</th>
          <th style={MTH}>{periodName || 'Current'}</th>
          <th style={MTH}>{comparePeriodName || 'Compare'}</th>
          <th style={MTH}>Variance %</th>
          <th style={MTH}>Margin %</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}
            style={{ background: row.isNet ? '#f0fdf4' : 'transparent' }}
            onMouseEnter={e => !row.isNet && (e.currentTarget.style.background = '#f8faff')}
            onMouseLeave={e => !row.isNet && (e.currentTarget.style.background = 'transparent')}
          >
            <td style={{ ...MTD_L, fontWeight: row.isNet ? 800 : 500, color: row.isNet ? C.green : C.navy }}>{row.label}</td>
            <td style={{ ...MTD, fontWeight: row.isNet ? 800 : 500, color: row.isNet ? C.green : '#334155' }}>{fmtNum(row.current, currency)}</td>
            <td style={{ ...MTD, color: C.slate }}>{row.compare != null ? fmtNum(row.compare, currency) : '—'}</td>
            <td style={MTD}>{row.varPct != null ? <VarBadge v={row.varPct} isPct /> : '—'}</td>
            <td style={{ ...MTD, color: C.slate }}>{row.pct != null ? fmtPct(row.pct) : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* P&L Statement View All (full statement in modal) */
// function StatementViewAll({ statementData, currency, periodName, comparePeriodName }) {
//   const [secIncome, setSecIncome] = useState(true);
//   const [secCOGS, setSecCOGS] = useState(true);
//   const [secExpenses, setSecExpenses] = useState(true);
//   if (!statementData) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
//   return (
//     <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
//       <thead>
//         <tr>
//           <th style={{ ...MTH_L, width: '26%' }}>Particulars</th>
//           <th style={MTH}>Current Period<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>{periodName}</span></th>
//           <th style={MTH}>Compare Period<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>{comparePeriodName}</span></th>
//           <th style={MTH}>Variance<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(Value)</span></th>
//           <th style={MTH}>Variance<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(%)</span></th>
//           <th style={MTH}>YTD Current</th>
//           <th style={MTH}>YTD Prev Year</th>
//           <th style={MTH}>YTD Var<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(%)</span></th>
//         </tr>
//       </thead>
//       <tbody>
//         <SectionHeader label="INCOME" expanded={secIncome} onToggle={() => setSecIncome(p => !p)} />
//         {secIncome && statementData.income?.map((row, i) => <PLRow key={i} row={row} indent={!row.isTotal} currency={''} tdStyles={MTD} />)}
//         <SectionHeader label="COST OF SALES" expanded={secCOGS} onToggle={() => setSecCOGS(p => !p)} />
//         {secCOGS && statementData.cost_of_sales?.map((row, i) => <PLRow key={i} row={row} indent={!row.isTotal && !row.isGrossProfit && !row.isPct} currency={''} tdStyles={MTD} />)}
//         <SectionHeader label="EXPENSES" expanded={secExpenses} onToggle={() => setSecExpenses(p => !p)} />
//         {secExpenses && statementData.expenses?.map((row, i) => <PLRow key={i} row={row} indent={!row.isTotal && !row.isEbitda && !row.isPct} currency={''} tdStyles={MTD} />)}
//         {statementData.bottom?.map((row, i) => <PLRow key={i} row={row} indent={!row.isNetProfit} currency={''} tdStyles={MTD} />)}
//       </tbody>
//     </table>
//   );
// }

function StatementViewAll({
  incomeRows = [],
  costOfSalesRows = [],
  profitabilityRows = [],
  expensesRows = [],
  otherExpensesRows = [],
  currency,
  periodName,
  comparePeriodName,
}) {
  const [secIncome, setSecIncome] = useState(true);
  const [secCOGS, setSecCOGS] = useState(true);
  const [secProfitability, setSecProfitability] = useState(true);
  const [secExpenses, setSecExpenses] = useState(true);
  const [secOtherExpenses, setSecOtherExpenses] = useState(true);

  const hasData =
    incomeRows.length > 0 ||
    costOfSalesRows.length > 0 ||
    profitabilityRows.length > 0 ||
    expensesRows.length > 0 ||
    otherExpensesRows.length > 0;

  if (!hasData) {
    return (
      <div
        style={{
          padding: 32,
          textAlign: 'center',
          color: C.muted,
          fontSize: '0.8rem',
        }}
      >
        No data available
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
      }}
    >
      <table
        style={{
          width: '100%',
          minWidth: 1100,
          borderCollapse: 'collapse',
          fontSize: '0.74rem',
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                ...MTH_L,
                width: '25%',
                minWidth: 250,
              }}
            >
              Particulars
              <br />
              <span
                style={{
                  fontWeight: 400,
                  opacity: 0.75,
                }}
              >
                (in {currency})
              </span>
            </th>

            <th style={MTH}>
              Current PTD
              <br />
              <span
                style={{
                  fontWeight: 400,
                  opacity: 0.75,
                }}
              >
                {periodName}
              </span>
            </th>

            <th style={MTH}>
              Compare PTD
              <br />
              <span
                style={{
                  fontWeight: 400,
                  opacity: 0.75,
                }}
              >
                {comparePeriodName || '—'}
              </span>
            </th>

            <th style={MTH}>
              Target PTD
            </th>

            <th style={MTH}>
              Var % Current
              <br />
              <span
                style={{
                  fontWeight: 400,
                  opacity: 0.75,
                }}
              >
                vs Compare
              </span>
            </th>

            <th style={MTH}>
              Var % Current
              <br />
              <span
                style={{
                  fontWeight: 400,
                  opacity: 0.75,
                }}
              >
                vs Target
              </span>
            </th>

            <th style={MTH}>
              Current YTD
            </th>

            <th style={MTH}>
              Target YTD
            </th>

            <th style={MTH}>
              Var % YTD
              <br />
              <span
                style={{
                  fontWeight: 400,
                  opacity: 0.75,
                }}
              >
                vs Target
              </span>
            </th>
          </tr>
        </thead>

        <tbody>

          {/* =========================
              INCOME
          ========================= */}

          <SectionHeader
            label="INCOME"
            expanded={secIncome}
            onToggle={() =>
              setSecIncome((p) => !p)
            }
            colSpan={9}
          />

          {incomeRows.map((row, i) => {
            const visible =
              secIncome || row.is_subtotal;

            if (!visible) return null;

            return (
              <PLRow
                key={`income-${row.display_order ?? i}`}
                row={row}
                indent={!row.is_subtotal}
                currency={currency}
                tdStyles={MTD}
              />
            );
          })}

          {/* =========================
              COST OF SALES
          ========================= */}

          <SectionHeader
            label="COST OF SALES"
            expanded={secCOGS}
            onToggle={() =>
              setSecCOGS((p) => !p)
            }
            colSpan={9}
          />

          {costOfSalesRows.map((row, i) => {
            const visible =
              secCOGS || row.is_subtotal;

            if (!visible) return null;

            return (
              <PLRow
                key={`cogs-${row.display_order ?? i}`}
                row={row}
                indent={!row.is_subtotal}
                currency={currency}
                tdStyles={MTD}
              />
            );
          })}

          {/* =========================
              PROFITABILITY
          ========================= */}

          <SectionHeader
            label="PROFITABILITY"
            expanded={secProfitability}
            onToggle={() =>
              setSecProfitability((p) => !p)
            }
            colSpan={9}
          />

          {profitabilityRows.map((row, i) => {
            const visible =
              secProfitability || row.is_subtotal;

            if (!visible) return null;

            return (
              <PLRow
                key={`profitability-${row.display_order ?? i}`}
                row={row}
                indent={!row.is_subtotal}
                currency={currency}
                tdStyles={MTD}
              />
            );
          })}

          {/* =========================
              EXPENSES
          ========================= */}

          <SectionHeader
            label="EXPENSES"
            expanded={secExpenses}
            onToggle={() =>
              setSecExpenses((p) => !p)
            }
            colSpan={9}
          />

          {expensesRows.map((row, i) => {
            const visible =
              secExpenses || row.is_subtotal;

            if (!visible) return null;

            return (
              <PLRow
                key={`expenses-${row.display_order ?? i}`}
                row={row}
                indent={!row.is_subtotal}
                currency={currency}
                tdStyles={MTD}
              />
            );
          })}

          {/* =========================
              OTHER EXPENSES
          ========================= */}

          <SectionHeader
            label="OTHER EXPENSES"
            expanded={secOtherExpenses}
            onToggle={() =>
              setSecOtherExpenses((p) => !p)
            }
            colSpan={9}
          />

          {otherExpensesRows.map((row, i) => {
            const visible =
              secOtherExpenses || row.is_subtotal;

            if (!visible) return null;

            return (
              <PLRow
                key={`other-expenses-${row.display_order ?? i}`}
                row={row}
                indent={!row.is_subtotal}
                currency={currency}
                tdStyles={MTD}
              />
            );
          })}

        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function PLAnalytics() {

  /* ── Dropdown options & Filter state ─────────────────────────── */
  const [filterOptions, setFilterOptions] = useState({
    legalGroups: ['All'],
    legalEntities: ['All'],
    parentDivisions: ['All'],
    subdivisions: ['All'],
    years: [],
    periods: [],
    comparePeriods: [],
    currencies: ['AED'],
  });

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  // Auto-apply filters on first load once periods are loaded
  const [initialLoaded, setInitialLoaded] = useState(false);
  useEffect(() => {
    if (!initialLoaded && filters.periodName && filterOptions.periods.length > 0) {
      setAppliedFilters(filters);
      setInitialLoaded(true);
    }
  }, [filters.periodName, filterOptions.periods, initialLoaded]);

  const updateFilter = (key, val) => {
    setFilters(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'legalGroupId') { next.legalEntityId = ['All']; next.parentDivisionId = ['All']; next.subdivisionId = ['All']; }
      if (key === 'legalEntityId') { next.parentDivisionId = ['All']; next.subdivisionId = ['All']; }
      if (key === 'parentDivisionId') { next.subdivisionId = ['All']; }
      return next;
    });
  };

  /* ── Data state ───────────────────────────────────────────────── */
  const [summary, setSummary] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [expenseData, setExpenseData] = useState(null);
  const [statementData, setStatementData] = useState(null);

  /* ── Section collapse (inline table) ─────────────────────────── */
  const [secIncome, setSecIncome] = useState(true);
  const [secCOGS, setSecCOGS] = useState(true);
  const [secExpenses, setSecExpenses] = useState(true);
  const [secOtherExpenses, setSecOtherExpenses] = useState(true);
  const [secProfitability, setSecProfitability] = useState(true);

  /* ── Loading & Error ──────────────────────────────────────────── */
  const [loading, setLoading] = useState({
    filters: true, summary: true, trend: true,
    comparison: true, expenseBreakdown: true, statement: true,
  });
  const [errors, setErrors] = useState({});

  /* ── Toast ────────────────────────────────────────────────────── */
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── View All modal state ─────────────────────────────────────── */
  const [openModal, setOpenModal] = useState(null);

  /*
   * View All has its own filter state/data so changing filters inside a modal
   * does not change the main-page filter selections until the user chooses to
   * do so on the main page.
   */
  const [viewAllFilters, setViewAllFilters] = useState(null);
  const [viewAllFilterOptions, setViewAllFilterOptions] = useState(null);
  const [viewAllData, setViewAllData] = useState({
    summary: null,
    trend: [],
    comparison: [],
    expenseBreakdown: null,
    statement: null,
  });
  const [viewAllLoading, setViewAllLoading] = useState(false);

  const closeModal = () => {
    setOpenModal(null);
    setViewAllFilters(null);
  };


  const cloneViewAllFilters = (source, options = filterOptions) => {
    const sourceYear = Array.isArray(source?.year)
      ? source.year.filter(Boolean)
      : source?.year
        ? [source.year]
        : [];

    const sourcePeriod = Array.isArray(source?.periodName)
      ? source.periodName.filter(Boolean)
      : source?.periodName
        ? [source.periodName]
        : [];

    return {
      ...source,

      year:
        sourceYear.length && getYearValue(sourceYear[0]) !== 'All'
          ? [getYearValue(sourceYear[0])]
          : options?.years?.length
            ? [getYearValue(options.years[0])]
            : ['All'],

      periodName:
        sourcePeriod.length && sourcePeriod[0] !== 'All'
          ? sourcePeriod
          : options?.periods?.length
            ? [options.periods[0]]
            : ['All'],

      comparePeriodName: [],

      legalEntityId:
        Array.isArray(source?.legalEntityId)
          ? [...source.legalEntityId]
          : ['All'],

      parentDivisionId:
        Array.isArray(source?.parentDivisionId)
          ? [...source.parentDivisionId]
          : ['All'],

      subdivisionId:
        Array.isArray(source?.subdivisionId)
          ? [...source.subdivisionId]
          : ['All'],
    };
  };

  const buildViewAllOptions = (options) => ({
    legalEntities: options?.legalEntities || filterOptions.legalEntities || ['All'],
    parentDivisions: options?.parentDivisions || filterOptions.parentDivisions || ['All'],
    subdivisions: options?.subdivisions || filterOptions.subdivisions || ['All'],
    years: options?.years || filterOptions.years || [],
    periods: options?.periods || filterOptions.periods || [],
    comparePeriods: options?.comparePeriods || filterOptions.comparePeriods || [],
  });

  const loadViewAllData = useCallback(async (nextFilters) => {
    setViewAllLoading(true);
    try {
      const [summaryResult, trendResult, comparisonResult, expenseResult, statementResult] = await Promise.all([
        fetchPLSummary(nextFilters),
        fetchPLTrend(nextFilters),
        fetchPLComparison(nextFilters),
        fetchPLExpenseBreakdown(nextFilters),
        fetchPLStatement(nextFilters),
      ]);

      setViewAllData({
        summary: summaryResult || null,
        trend: trendResult || [],
        comparison: comparisonResult || [],
        expenseBreakdown: expenseResult || null,
        statement: statementResult || null,
      });
    } catch (err) {
      showToast(err?.message || 'Failed to refresh View All data.', 'error');
    } finally {
      setViewAllLoading(false);
    }
  }, [showToast]);

  const openViewAll = useCallback(async (type) => {
    let options = filterOptions;

    try {
      const data = await fetchPLFilters({
        legalGroupId: appliedFilters?.legalGroupId,
        legalEntityId: appliedFilters?.legalEntityId,
        parentDivisionId: appliedFilters?.parentDivisionId,
        year: appliedFilters?.year || '',
        periodName: appliedFilters?.periodName || '',
      });

      const periods = data?.periods || filterOptions?.periods || [];

      const backendCompare = data?.comparePeriods || [];

      const comparePeriods = [
        ...backendCompare,
        ...periods.filter(p => !backendCompare.includes(p)),
      ];

      const fetchedYears = data?.years?.length
        ? data.years
        : (filterOptions?.years || []);

      const mainYearValues = Array.isArray(appliedFilters?.year)
        ? appliedFilters.year.filter(Boolean)
        : appliedFilters?.year
          ? [appliedFilters.year]
          : [];

      const years = [...fetchedYears];
      mainYearValues.forEach(year => {
        if (
          String(year) !== 'All' &&
          !years.some(y => String(y) === String(year))
        ) {
          years.unshift(year);
        }
      });

      options = {
        ...filterOptions,
        legalEntities:
          data?.legal_entities || filterOptions?.legalEntities || ['All'],

        parentDivisions:
          data?.parent_divisions || filterOptions?.parentDivisions || ['All'],

        subdivisions:
          data?.subdivisions || filterOptions?.subdivisions || ['All'],

        years,
        periods,
        comparePeriods,
      };
    } catch (err) {
      console.error('Failed to load View All filter options:', err);
    }

    // ------------------------------------------
    // IMPORTANT: Get Year from MAIN PAGE first
    // ------------------------------------------

    const mainYear = Array.isArray(appliedFilters?.year)
      ? appliedFilters.year.filter(Boolean)
      : appliedFilters?.year
        ? [appliedFilters.year]
        : [];

    const validMainYear = mainYear.find(
      year =>
        String(year) !== 'All' &&
        (options?.years || []).some(
          y => String(y) === String(year)
        )
    );

    // If main page has a valid year, use it.
    // Otherwise use the first available year.
    const selectedYear =
      validMainYear
        ? [validMainYear]
        : options?.years?.length
          ? [options.years[0]]
          : ['All'];

    const mainPeriod = Array.isArray(appliedFilters?.periodName)
      ? appliedFilters.periodName.filter(Boolean)
      : appliedFilters?.periodName
        ? [appliedFilters.periodName]
        : [];

    const selectedPeriod =
      mainPeriod.length
        ? mainPeriod
        : options?.periods?.length
          ? [options.periods[0]]
          : ['All'];

    const initial = cloneViewAllFilters(
      {
        ...appliedFilters,

        // IMPORTANT
        year: selectedYear,

        periodName: selectedPeriod,

        // Keep Compare With empty
        comparePeriodName: [],
      },
      options
    );

    setViewAllFilters(initial);
    setViewAllFilterOptions(buildViewAllOptions(options));
    setOpenModal(type);

    // Load modal data using the SAME initialized filters
    loadViewAllData(initial);

  }, [
    appliedFilters,
    filterOptions,
    loadViewAllData
  ]);

  const applyViewAllFilters = useCallback(() => {
    if (!viewAllFilters) return;
    loadViewAllData(viewAllFilters);
  }, [viewAllFilters, loadViewAllData]);

  const resetViewAllFilters = useCallback(() => {
    const reset = cloneViewAllFilters(appliedFilters, filterOptions);
    setViewAllFilters(reset);
    setViewAllFilterOptions(buildViewAllOptions(filterOptions));
    loadViewAllData(reset);
  }, [appliedFilters, filterOptions, loadViewAllData]);

  /* Refresh dropdown options when the View All hierarchy/year changes.
     Only the modal's local state is updated; the main page is untouched. */
  useEffect(() => {
    if (!openModal || !viewAllFilters) return;

    const optionPeriod = viewAllFilters.periodName?.[0] || '';
    const optionYear = viewAllFilters.year?.[0] || '';
    let cancelled = false;

    fetchPLFilters({
      legalEntityId: viewAllFilters.legalEntityId,
      parentDivisionId: viewAllFilters.parentDivisionId,
      year: optionYear,
      periodName: optionPeriod,
    })
      .then(data => {
        if (cancelled) return;
        const periods = data.periods || [];
        const backendCompare = data.comparePeriods || [];
        const comparePeriods = [
          ...backendCompare,
          ...periods.filter(p => !backendCompare.includes(p)),
        ];
        const refreshedYears = data.years?.length
          ? data.years
          : (viewAllFilterOptions?.years || filterOptions.years || []);

        const selectedModalYear = viewAllFilters.year?.[0];
        const years = [...refreshedYears];
        if (
          selectedModalYear &&
          String(selectedModalYear) !== 'All' &&
          !years.some(y => String(y) === String(selectedModalYear))
        ) {
          years.unshift(selectedModalYear);
        }

        setViewAllFilterOptions({
          legalEntities: data.legalEntities || filterOptions.legalEntities || ['All'],
          parentDivisions: data.parentDivisions || filterOptions.parentDivisions || ['All'],
          subdivisions: data.subdivisions || filterOptions.subdivisions || ['All'],
          years,
          periods,
          comparePeriods,
        });
      })
      .catch(() => {
        // Keep the already loaded modal options if a cascading refresh fails.
      });

    return () => { cancelled = true; };
  }, [
    openModal,
    viewAllFilters?.year?.join('|'),
    viewAllFilters?.legalEntityId?.join('|'),
    viewAllFilters?.parentDivisionId?.join('|'),
  ]);

  /* ── Load filter options (cascading) ──────────────────────────── */
  useEffect(() => {
    setLoading(prev => ({ ...prev, filters: true }));
    fetchPLFilters({
      legalGroupId: filters.legalGroupId,
      legalEntityId: filters.legalEntityId,
      parentDivisionId: filters.parentDivisionId,
      year: filters.year,
      periodName: filters.periodName,
    })
      .then(data => {
        const years = data.years || [];
        const periods = data.periods || [];
        const backendCompare = data.comparePeriods || [];

        // Prior periods from backend (e.g. ['Jan-26'] for Feb-26)
        const priorPeriods = backendCompare.filter(p => p !== filters.periodName);
        // All other periods in fiscal year (excluding current selected period and prior periods)
        const otherPeriods = periods.filter(p => p !== (filters.periodName || periods[0]) && !priorPeriods.includes(p));
        // Combined comparison periods: prior periods first, then other available periods
        const comparePeriods = [...priorPeriods, ...otherPeriods];
        const currencies = data.currencies?.length ? data.currencies : ['AED'];

        setFilterOptions(prev => ({
          ...prev,
          legalGroups: data.legalGroups || [],
          legalEntities: data.legalEntities || [],
          parentDivisions: data.parentDivisions || [],
          subdivisions: data.subdivisions || [],
          years,
          periods,
          comparePeriods,
          currencies,
        }));

        setFilters(f => {
          const nextComparePeriod = comparePeriods.includes(f.comparePeriodName)
            ? f.comparePeriodName
            : (priorPeriods[0] || '');

          return {
            ...f,
            year: f.year || years[0] || '',
            periodName: f.periodName || periods[0] || '',
            comparePeriodName: nextComparePeriod,
            currency: f.currency || currencies[0] || 'AED',
          };
        });

        setAppliedFilters(f => {
          const nextComparePeriod = comparePeriods.includes(f.comparePeriodName)
            ? f.comparePeriodName
            : (priorPeriods[0] || '');

          return {
            ...f,
            year: f.year || years[0] || '',
            periodName: f.periodName || periods[0] || '',
            comparePeriodName: nextComparePeriod,
            currency: f.currency || currencies[0] || 'AED',
          };
        });
      })
      .catch(err => setErrors(prev => ({ ...prev, filters: err?.message || 'Failed to load filters' })))
      .finally(() => setLoading(prev => ({ ...prev, filters: false })));
  }, [filters.legalGroupId, filters.legalEntityId, filters.parentDivisionId, filters.year, filters.periodName]);

  /* ── Fetch all data ───────────────────────────────────────────── */
  const fetchAll = useCallback((f) => {
    setLoading({ filters: false, summary: true, trend: true, comparison: true, expenseBreakdown: true, statement: true });
    setErrors({});
    const guard = (key, promise) =>
      promise
        .catch(err => { setErrors(prev => ({ ...prev, [key]: err?.message || 'Failed to load data' })); return null; })
        .finally(() => setLoading(prev => ({ ...prev, [key]: false })));

    guard('summary', fetchPLSummary(f)).then(d => { if (d) setSummary(d); });
    guard('trend', fetchPLTrend(f)).then(d => { if (d) setTrendData(d); });
    guard('comparison', fetchPLComparison(f)).then(d => { if (d) setComparisonData(d); });
    guard('expenseBreakdown', fetchPLExpenseBreakdown(f)).then(d => { if (d) setExpenseData(d); });
    guard('statement', fetchPLStatement(f)).then(d => { if (d) setStatementData(d); });
  }, []);

  useEffect(() => {
    if (appliedFilters.periodName) fetchAll(appliedFilters);
  }, [appliedFilters.periodName, fetchAll]);

  /* ── Filter handlers ──────────────────────────────────────────── */
  const handleApply = () => { setAppliedFilters({ ...filters }); fetchAll({ ...filters }); };
  const handleReset = () => {
    const reset = {
      ...DEFAULT_FILTERS,
      year: filterOptions.years[0] || '',
      periodName: filterOptions.periods[0] || '',
      comparePeriodName: '',
      currency: filterOptions.currencies[0] || 'AED',
    };
    setFilters(reset); setAppliedFilters(reset); fetchAll(reset);
  };

  /* ── Export handler ───────────────────────────────────────────── */
  const [exporting, setExporting] = useState(null);
  const handleExport = (format, section = 'full') => {
    if (exporting) return;
    setExporting(format);
    exportPL(format, appliedFilters)
      .then(() => showToast(`${format.toUpperCase()} export downloaded successfully.`, 'success'))
      .catch(err => showToast(
        `Export failed: ${err?.message || 'Unknown error'}. Please try again.`,
        'error'
      ))
      .finally(() => setExporting(null));
  };


  /* ── View All export handler ─────────────────────────────────── */

  const [viewAllExporting, setViewAllExporting] = useState(null);

  const handleViewAllExport = (format) => {
    if (!viewAllFilters || viewAllExporting) return;

    setViewAllExporting(format);

    exportPL(format, viewAllFilters)
      .then(() => {
        showToast(
          `${format.toUpperCase()} export downloaded successfully.`,
          "success"
        );
      })
      .catch((err) => {
        showToast(
          `Export failed: ${err?.message || "Unknown error"}. Please try again.`,
          "error"
        );
      })
      .finally(() => {
        setViewAllExporting(null);
      });
  };
  /* ── Derived values ───────────────────────────────────────────── */
  const currency = appliedFilters.currency || 'AED';
  const compareLbl = appliedFilters.comparePeriodName ? `vs ${appliedFilters.comparePeriodName}` : '';
  const periodLabel = appliedFilters.periodName || 'Current';
  const compareLabel = appliedFilters.comparePeriodName || 'Compare';
  const priorLabel = 'Prior Year';
  const expenseItems = expenseData?.items || (Array.isArray(expenseData?.data) ? expenseData.data : []);
  const totalExpenses = expenseData?.total_expenses
    ?? expenseItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  /* ── KPI card definitions ─────────────────────────────────────── */
  const kpiCards = [
    { id: 'total-rev', label: 'Total Revenue (PTD)', value: fmtKPI(summary?.total_revenue, currency), subValue: null, changePct: summary?.revenue_variance_pct, compareLabel: compareLbl, color: '#2563eb', iconBg: '#eff6ff', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg> },
    { id: 'gross-profit', label: 'Gross Profit (PTD)', value: fmtKPI(summary?.gross_profit, currency), subValue: summary?.gross_profit_pct ? `Margin: ${fmtPct(summary.gross_profit_pct)}` : null, changePct: summary?.gross_profit_variance_pct, compareLabel: compareLbl, color: '#16a34a', iconBg: '#f0fdf4', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fillOpacity="0.85" /></svg> },
    { id: 'ebitda', label: 'EBITDA (PTD)', value: fmtKPI(summary?.ebitda, currency), subValue: summary?.ebitda_pct ? `Margin: ${fmtPct(summary.ebitda_pct)}` : null, changePct: summary?.ebitda_variance_pct, compareLabel: compareLbl, color: '#7c3aed', iconBg: '#faf5ff', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg> },
    { id: 'net-profit', label: 'Net Profit (PTD)', value: fmtKPI(summary?.net_profit, currency), subValue: null, changePct: summary?.net_profit_variance_pct, compareLabel: compareLbl, color: '#ea580c', iconBg: '#fff7ed', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" /><path d="M12 18V6" /></svg> },
    { id: 'np-margin', label: 'Net Profit Margin (PTD)', value: fmtPct(summary?.net_profit_pct), subValue: null, changePct: summary && summary.net_profit_pct != null && summary.compare_net_profit_pct != null ? +(summary.net_profit_pct - summary.compare_net_profit_pct).toFixed(2) : null, compareLabel: compareLbl, color: '#0d9488', iconBg: '#f0fdfa', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 4.5C4.5 4.5 2 7 2 10s2.5 5.5 5.5 5.5S13 13 13 10 10.5 4.5 7.5 4.5zm0 9C5.57 13.5 4 11.93 4 10s1.57-3.5 3.5-3.5S11 8.07 11 10s-1.57 3.5-3.5 3.5z" fillOpacity="0.9" /><path d="M19 8l-7 8M14 4h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></svg> },
    { id: 'ebitda-margin', label: 'EBITDA Margin (PTD)', value: fmtPct(summary?.ebitda_pct), subValue: null, changePct: summary && summary.ebitda_pct != null && summary.compare_ebitda_pct != null ? +(summary.ebitda_pct - summary.compare_ebitda_pct).toFixed(2) : null, compareLabel: compareLbl, color: '#db2777', iconBg: '#fdf2f8', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.12" /><polyline points="12 6 12 12 16 14" /></svg> },
  ];

  /* ── Kebab menu definitions ───────────────────────────────────── */
  const makeExportItems = (section) => [
    { icon: '📊', label: 'Export Excel', action: () => handleExport('excel', section) },
    { icon: '📄', label: 'Export PDF', action: () => handleExport('pdf', section) },
  ];

  const kpiMenuItems = [{ icon: '🔎', label: 'View All', action: () => openViewAll('kpi') }, ...makeExportItems('kpi')];
  const trendMenuItems = [{ icon: '🔎', label: 'View All', action: () => openViewAll('trend') }, ...makeExportItems('trend')];
  const compMenuItems = [{ icon: '🔎', label: 'View All', action: () => openViewAll('comparison') }, ...makeExportItems('comparison')];
  const expenseMenuItems = [{ icon: '🔎', label: 'View All', action: () => openViewAll('expense') }, ...makeExportItems('expense')];
  const statementMenuItems = [{ icon: '🔎', label: 'View All', action: () => openViewAll('statement') }, ...makeExportItems('statement')];


  const statementRows = Array.isArray(statementData?.rows)
    ? statementData.rows
    : Array.isArray(statementData?.data)
      ? statementData.data
      : Array.isArray(statementData)
        ? statementData
        : [];

  const getStatementSection = (section) =>
    statementRows
      .filter(
        (row) =>
          String(row.section || '').toUpperCase() === section
      )
      .sort(
        (a, b) =>
          Number(a.display_order || 0) -
          Number(b.display_order || 0)
      );

  const incomeRows = getStatementSection('INCOME');
  const costOfSalesRows = getStatementSection('COST OF SALES');
  const expensesRows = getStatementSection('EXPENSES');
  const otherExpensesRows = getStatementSection('OTHER EXPENSES');
  const profitabilityRows = getStatementSection('PROFITABILITY');

  /* ══════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="animate-in" style={{ width: '100%', maxWidth: 'none', padding: '20px 0 40px', background: C.bg, minHeight: '100%' }}>

      <style>{`
        @keyframes shimmer  { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        @keyframes fadeIn   { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @keyframes menuPop  { from { opacity: 0; transform: scale(0.94) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes modalPop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {toast && <ExportToast message={toast.msg} type={toast.type} />}

      {/* ══ VIEW ALL MODALS ══ */}
      {viewAllFilters && viewAllFilterOptions && (
        <>
          <ViewAllModal isOpen={openModal === 'kpi'} onClose={closeModal} title="KPI Summary" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'All'}`}>
            <ViewAllFilterBar
              filters={viewAllFilters}
              setFilters={setViewAllFilters}
              filterOptions={viewAllFilterOptions}
              onApply={applyViewAllFilters}
              onReset={resetViewAllFilters}
              loading={viewAllLoading}
              onExport={handleViewAllExport}
              exporting={viewAllExporting}
            />
            {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={220} /></div> : (
              <KPISummaryViewAll
                summary={viewAllData.summary}
                currency={currency}
                periodName={(viewAllFilters.periodName || []).join(', ')}
                comparePeriodName={(viewAllFilters.comparePeriodName || []).join(', ')}
              />
            )}
          </ViewAllModal>

          <ViewAllModal isOpen={openModal === 'trend'} onClose={closeModal} title="P&L Trend — All Periods" subtitle={`Currency: ${currency}`}>
            <ViewAllFilterBar
              filters={viewAllFilters}
              setFilters={setViewAllFilters}
              filterOptions={viewAllFilterOptions}
              onApply={applyViewAllFilters}
              onReset={resetViewAllFilters}
              loading={viewAllLoading}
              onExport={handleViewAllExport}
              exporting={viewAllExporting}
            />
            {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={220} /></div> : <TrendViewAll data={viewAllData.trend} currency={currency} />}
          </ViewAllModal>

          <ViewAllModal isOpen={openModal === 'comparison'} onClose={closeModal} title="P&L Comparison" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'Current'}`}>
            <ViewAllFilterBar
              filters={viewAllFilters}
              setFilters={setViewAllFilters}
              filterOptions={viewAllFilterOptions}
              onApply={applyViewAllFilters}
              onReset={resetViewAllFilters}
              loading={viewAllLoading}
              onExport={handleViewAllExport}
              exporting={viewAllExporting}
            />
            {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={220} /></div> : (
              <ComparisonViewAll
                data={viewAllData.comparison}
                currency={currency}
                periodLabel={(viewAllFilters.periodName || []).join(', ') || periodLabel}
                compareLabel={
                  (viewAllFilters.comparePeriodName || []).join(', ') ||
                  appliedFilters.comparePeriodName ||
                  compareLabel
                }
              />
            )}
          </ViewAllModal>

          <ViewAllModal isOpen={openModal === 'expense'} onClose={closeModal} title="Expense Breakdown" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'All'} | Currency: ${currency}`}>
            <ViewAllFilterBar
              filters={viewAllFilters}
              setFilters={setViewAllFilters}
              filterOptions={viewAllFilterOptions}
              onApply={applyViewAllFilters}
              onReset={resetViewAllFilters}
              loading={viewAllLoading}
              onExport={handleViewAllExport}
              exporting={viewAllExporting}
            />
            {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={220} /></div> : (
              <ExpenseViewAll
                data={viewAllData.expenseBreakdown}
                totalExpenses={viewAllData.expenseBreakdown?.total_expenses ?? 0}
                currency={currency}
              />
            )}
          </ViewAllModal>

          <ViewAllModal isOpen={openModal === 'statement'} onClose={closeModal} title="Profit & Loss Statement" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'All'} | All values in ${currency}`}>
            <ViewAllFilterBar
              filters={viewAllFilters}
              setFilters={setViewAllFilters}
              filterOptions={viewAllFilterOptions}
              onApply={applyViewAllFilters}
              onReset={resetViewAllFilters}
              loading={viewAllLoading}
              onExport={handleViewAllExport}
              exporting={viewAllExporting}
            />
            {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={300} /></div> : (
              <StatementViewAll
                incomeRows={(viewAllData.statement?.rows || []).filter(row => String(row.section || '').toUpperCase() === 'INCOME').sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))}
                costOfSalesRows={(viewAllData.statement?.rows || []).filter(row => String(row.section || '').toUpperCase() === 'COST OF SALES').sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))}
                profitabilityRows={(viewAllData.statement?.rows || []).filter(row => String(row.section || '').toUpperCase() === 'PROFITABILITY').sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))}
                expensesRows={(viewAllData.statement?.rows || []).filter(row => String(row.section || '').toUpperCase() === 'EXPENSES').sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))}
                otherExpensesRows={(viewAllData.statement?.rows || []).filter(row => String(row.section || '').toUpperCase() === 'OTHER EXPENSES').sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0))}
                currency={currency}
                periodName={(viewAllFilters.periodName || []).join(', ')}
                comparePeriodName={(viewAllFilters.comparePeriodName || []).join(', ')}
              />
            )}
          </ViewAllModal>
        </>
      )}

      {/* ══ PAGE HEADER ══ */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.navy, margin: 0 }}>Profitability Analysis</h1>
          <p style={{ fontSize: '0.76rem', color: C.slate, margin: '3px 0 0' }}>
            Analyze profitability metrics and track financial performance across periods
          </p>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <select id="pl-currency" value={filters.currency} onChange={e => setFilters(prev => ({ ...prev, currency: e.target.value }))}
            style={{ ...selStyle, width: 80, fontSize: '0.74rem', padding: '7px 22px 7px 8px' }} title="Select currency">
            {filterOptions.currencies.map(c => <option key={c}>{c}</option>)}
          </select>
          <button id="btn-pl-export-excel" onClick={() => handleExport('excel')} disabled={!!exporting}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: exporting?.includes('excel') ? '#d1fae5' : '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: '0.76rem', fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.7 : 1 }}>
            {exporting?.includes('excel') ? '⏳' : '📊'} Excel
          </button>
          <button id="btn-pl-export-pdf" onClick={() => handleExport('pdf')} disabled={!!exporting}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: exporting?.includes('pdf') ? '#fee2e2' : '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', borderRadius: 8, fontSize: '0.76rem', fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.7 : 1 }}>
            {exporting?.includes('pdf') ? '⏳' : '📄'} PDF
          </button>
        </div>
      </div>

      {/* ══ FILTER BAR ══ */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'flex-end', gap: 4, flexWrap: 'nowrap' }}>
        <FilterField label="Legal Group">
          <MultiSelect options={filterOptions.legalGroups} value={filters.legalGroupId} onChange={v => updateFilter('legalGroupId', v)} style={{ width: 150 }} />
        </FilterField>
        <FilterField label="Legal Entity">
          <MultiSelect options={filterOptions.legalEntities} value={filters.legalEntityId} onChange={v => updateFilter('legalEntityId', v)} style={{ width: 150 }} />
        </FilterField>
        <FilterField label="Parent Division">
          <MultiSelect options={filterOptions.parentDivisions} value={filters.parentDivisionId} onChange={v => updateFilter('parentDivisionId', v)} style={{ width: 150 }} />
        </FilterField>
        <FilterField label="Sub-Division">
          <MultiSelect options={filterOptions.subdivisions} value={filters.subdivisionId} onChange={v => updateFilter('subdivisionId', v)} style={{ width: 150 }} />
        </FilterField>
        <FilterField label="Year" style={{ minWidth: 70, flex: '0.7 1 0' }}>
          <select id="filter-pl-year" style={selStyle} value={filters.year} onChange={e => setFilters(prev => ({ ...prev, year: e.target.value }))} disabled={loading.filters}>
            {filterOptions.years.length === 0 && <option key="loading" value="">Loading…</option>}
            {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </FilterField>
        <FilterField label="Period" style={{ minWidth: 90, flex: '0.8 1 0' }}>
          <select id="filter-pl-period" style={selStyle} value={filters.periodName} onChange={e => setFilters(prev => ({ ...prev, periodName: e.target.value }))} disabled={loading.filters}>
            {filterOptions.periods.length === 0 && <option key="loading" value="">Loading…</option>}
            {filterOptions.periods.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </FilterField>
        <FilterField label="Compare With" style={{ minWidth: 125, flex: '1.2 1 0' }}>
          <select
            id="filter-pl-compare"
            style={selStyle}
            value={filters.comparePeriodName}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                comparePeriodName: e.target.value,
              }))
            }
            disabled={loading.filters}
          >
            <option value="">None</option>
            {filterOptions.comparePeriods.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </FilterField>
        <button id="btn-pl-apply" onClick={handleApply} style={{ padding: '7px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end', whiteSpace: 'nowrap' }}>Apply</button>
        <button id="btn-pl-reset" onClick={handleReset} style={{ background: 'none', border: 'none', color: C.slate, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', alignSelf: 'flex-end', padding: '7px 4px', whiteSpace: 'nowrap' }}>Reset</button>
      </div>

      {errors.filters && <ErrorBanner message={errors.filters} />}

      {/* ══ KPI CARDS ══ */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>Key Performance Indicators</span>
          <KebabMenu id="menu-kpi" items={kpiMenuItems} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
          {kpiCards.map(kpi => <KPICard key={kpi.id} {...kpi} loading={loading.summary} error={errors.summary} />)}
        </div>
      </div>

      {/* ══ CHARTS ROW ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }}>

        {/* P&L Trend */}
        <PLTrendCard
          data={trendData}
          loading={loading.trend}
          currency={currency}
        />

        {/* P&L Comparison */}
        <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>P&amp;L Comparison</div>
              <div style={{ fontSize: '0.65rem', color: C.muted, marginTop: 1 }}>{periodLabel} vs {compareLabel} vs {priorLabel}</div>
            </div>
            <KebabMenu id="menu-comparison" items={compMenuItems} />
          </div>
          {errors.comparison ? <ErrorBanner message={errors.comparison} onRetry={() => fetchAll(appliedFilters)} />
            : (
              <PLComparisonCard
                data={comparisonData}
                loading={loading.comparison}
                currency={currency}
                periodLabel={periodLabel}
                compareLabel={compareLabel}
                priorLabel={priorLabel}
              />
            )
          }
        </div>

        {/* Expense Breakdown */}
        <ExpenseBreakdownCard
          data={expenseItems}
          loading={loading.expenseBreakdown}
          currency={currency}
          error={errors.expenseBreakdown}
          onRetry={() => fetchAll(appliedFilters)}
          menuItems={expenseMenuItems}
          KebabMenu={KebabMenu}
          ErrorBanner={ErrorBanner}
          Skeleton={Skeleton}
        />
      </div>

      {/* ══ P&L STATEMENT TABLE ══ */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, background: 'linear-gradient(90deg,#f8fafc,#fff)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: C.navy }}>Profit &amp; Loss Statement</span>
            <span style={{ fontSize: '0.7rem', color: C.slate, marginLeft: 12 }}>
              {appliedFilters.periodName} &nbsp;|&nbsp; All values in {currency}
            </span>
          </div>
          <KebabMenu id="menu-statement" items={statementMenuItems} />
        </div>

        {errors.statement ? (
          <div style={{ padding: 16 }}><ErrorBanner message={errors.statement} onRetry={() => fetchAll(appliedFilters)} /></div>
        ) : loading.statement ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[...Array(8)].map((_, i) => <Skeleton key={i} h={24} w={`${60 + (i % 3) * 15}%`} />)}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
              <thead>
                <tr>
                  <th
                    style={{
                      ...TH_L,
                      width: '25%',
                      minWidth: 250,
                    }}
                  >
                    Particulars
                    <br />
                    <span
                      style={{
                        fontWeight: 400,
                        opacity: 0.75,
                      }}
                    >
                      (in {currency})
                    </span>
                  </th>

                  <th style={TH}>
                    Current PTD
                    <br />
                    <span
                      style={{
                        fontWeight: 400,
                        opacity: 0.75,
                      }}
                    >
                      {appliedFilters.periodName}
                    </span>
                  </th>

                  <th style={TH}>
                    Compare PTD
                    <br />
                    <span
                      style={{
                        fontWeight: 400,
                        opacity: 0.75,
                      }}
                    >
                      {appliedFilters.comparePeriodName || '—'}
                    </span>
                  </th>

                  <th style={TH}>
                    Target PTD
                  </th>

                  <th style={TH}>
                    Var % Current
                    <br />
                    <span
                      style={{
                        fontWeight: 400,
                        opacity: 0.75,
                      }}
                    >
                      vs Compare
                    </span>
                  </th>

                  <th style={TH}>
                    Var % Current
                    <br />
                    <span
                      style={{
                        fontWeight: 400,
                        opacity: 0.75,
                      }}
                    >
                      vs Target
                    </span>
                  </th>

                  <th style={TH}>
                    Current YTD
                  </th>

                  <th style={TH}>
                    Target YTD
                  </th>

                  <th style={TH}>
                    Var % YTD
                    <br />
                    <span
                      style={{
                        fontWeight: 400,
                        opacity: 0.75,
                      }}
                    >
                      vs Target
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>

                {/* ============================================================
      INCOME
  ============================================================ */}
                <SectionHeader
                  label="INCOME"
                  expanded={secIncome}
                  onToggle={() => setSecIncome((p) => !p)}
                  colSpan={9}
                />

                {incomeRows.map((row, i) => {
                  const visible =
                    secIncome || row.is_subtotal;

                  if (!visible) return null;

                  return (
                    <PLRow
                      key={`income-${row.display_order ?? i}`}
                      row={row}
                      indent={!row.is_subtotal}
                      currency={currency}
                    />
                  );
                })}


                {/* ============================================================
      COST OF SALES
  ============================================================ */}
                <SectionHeader
                  label="COST OF SALES"
                  expanded={secCOGS}
                  onToggle={() => setSecCOGS((p) => !p)}
                  colSpan={9}
                />

                {costOfSalesRows.map((row, i) => {
                  const visible =
                    secCOGS || row.is_subtotal;

                  if (!visible) return null;

                  return (
                    <PLRow
                      key={`cogs-${row.display_order ?? i}`}
                      row={row}
                      indent={!row.is_subtotal}
                      currency={currency}
                    />
                  );
                })}


                {/* ============================================================
      PROFITABILITY
      Gross Profit / EBITDA / PBT / Net Profit stay visible
      even when collapsed because they are subtotals.
  ============================================================ */}
                <SectionHeader
                  label="PROFITABILITY"
                  expanded={secProfitability}
                  onToggle={() =>
                    setSecProfitability((p) => !p)
                  }
                  colSpan={9}
                />

                {profitabilityRows.map((row, i) => {
                  const visible =
                    secProfitability || row.is_subtotal;

                  if (!visible) return null;

                  return (
                    <PLRow
                      key={`profitability-${row.display_order ?? i}`}
                      row={row}
                      indent={!row.is_subtotal}
                      currency={currency}
                    />
                  );
                })}


                {/* ============================================================
      EXPENSES
  ============================================================ */}
                <SectionHeader
                  label="EXPENSES"
                  expanded={secExpenses}
                  onToggle={() => setSecExpenses((p) => !p)}
                  colSpan={9}
                />

                {expensesRows.map((row, i) => {
                  const visible =
                    secExpenses || row.is_subtotal;

                  if (!visible) return null;

                  return (
                    <PLRow
                      key={`expenses-${row.display_order ?? i}`}
                      row={row}
                      indent={!row.is_subtotal}
                      currency={currency}
                    />
                  );
                })}


                {/* ============================================================
      OTHER EXPENSES
  ============================================================ */}
                <SectionHeader
                  label="OTHER EXPENSES"
                  expanded={secOtherExpenses}
                  onToggle={() =>
                    setSecOtherExpenses((p) => !p)
                  }
                  colSpan={9}
                />

                {otherExpensesRows.map((row, i) => {
                  const visible =
                    secOtherExpenses || row.is_subtotal;

                  if (!visible) return null;

                  return (
                    <PLRow
                      key={`other-expenses-${row.display_order ?? i}`}
                      row={row}
                      indent={!row.is_subtotal}
                      currency={currency}
                    />
                  );
                })}

              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══ FOOTER ══ */}
      <div style={{ fontSize: '0.64rem', color: C.muted, display: 'flex', justifyContent: 'space-between', paddingTop: 8, flexWrap: 'wrap', gap: 4 }}>
        <span>All values in {currency} &nbsp;|&nbsp; Period: {appliedFilters.periodName || '—'} &nbsp;|&nbsp; Compared with: {appliedFilters.comparePeriodName || '—'}</span>
        <span>☁️ Source: Oracle Fusion Cloud</span>
      </div>

    </div>
  );
}