
// import React, {
//     useCallback,
//     useEffect,
//     useMemo,
//     useRef,
//     useState,
// } from 'react';

// import { createPortal } from 'react-dom';

// import {
//     BarChart,
//     Bar,
//     LineChart,
//     Line,
//     CartesianGrid,
//     Legend,
//     ResponsiveContainer,
//     Tooltip,
//     XAxis,
//     YAxis,
// } from 'recharts';

// import {
//     BarChart3,
//     ChevronDown,
//     ChevronRight,
//     FileSpreadsheet,
//     FileText,
//     Package,
//     RefreshCw,
//     ShoppingBag,
//     MoreVertical,
//     X,
// } from 'lucide-react';

// import {
//     fetchPLCostClassificationMonthly,
//     fetchPLDirectCostBreakdown,
//     fetchPLDirectCostDetail,
//     fetchPLDirectCostMonthly,
//     fetchPLDirectCostDetailMonthly,
//     exportPL,
// } from '../services/plApi';

// import { C } from '../utils/theme';
// import ExportButtons from "../components/Common/ExportButtons";


// /* =========================================================
//    CATEGORY META
// ========================================================= */

// const CATEGORY_META = {
//     'Cost of Material': {
//         color: '#19b99d',
//         icon: Package,
//         bg: '#dff8f1',
//     },

//     'Direct Expenses': {
//         color: '#7040dc',
//         icon: BarChart3,
//         bg: '#eee7ff',
//     },

//     'Operating Expenses': {
//         color: '#f47d20',
//         icon: ShoppingBag,
//         bg: '#fff0df',
//     },
// };


// /* =========================================================
//    DIRECT COST CATEGORIES
// ========================================================= */

// const DIRECT_CATEGORIES = [
//     'Cost of Material',
//     'Direct Labour',
//     'Manufacturing / Direct Overheads',
//     'Overhead Absorption',
//     'Direct Expenses - RKME',
// ];


// /* =========================================================
//    EMPTY FILTER OPTIONS
// ========================================================= */

// const emptyOptions = {
//     legalGroups: [],
//     legalEntities: [],
//     parentDivisions: [],
//     subdivisions: [],
//     years: [],
//     periods: [],
//     currencies: ['AED'],
// };


// /* =========================================================
//    HELPERS
// ========================================================= */

// const asArray = (value) => (
//     Array.isArray(value)
//         ? value
//         : value == null
//             ? []
//             : [value]
// );


// const unwrapRows = (payload) => {
//     if (Array.isArray(payload)) {
//         return payload;
//     }

//     if (Array.isArray(payload?.data)) {
//         return payload.data;
//     }

//     if (Array.isArray(payload?.rows)) {
//         return payload.rows;
//     }

//     if (Array.isArray(payload?.items)) {
//         return payload.items;
//     }

//     if (Array.isArray(payload?.results)) {
//         return payload.results;
//     }

//     if (Array.isArray(payload?.months)) {
//         return payload.months;
//     }

//     /*
//      * Some backend responses may return a single
//      * summary object instead of an array.
//      *
//      * Keep that object instead of converting it
//      * to an empty array.
//      */
//     if (
//         payload &&
//         typeof payload === 'object' &&
//         !Array.isArray(payload)
//     ) {
//         return [payload];
//     }

//     return [];
// };

// const getValue = (row, keys) => {
//     if (!row || typeof row !== 'object') {
//         return null;
//     }

//     for (const key of keys) {
//         if (
//             row[key] !== undefined &&
//             row[key] !== null
//         ) {
//             return row[key];
//         }
//     }

//     return null;
// };


// const getLabel = (row) => String(
//     getValue(row, [
//         'category',
//         'cost_category',
//         'costCategory',
//         'classification',
//         'label',
//         'name',
//         'particulars',
//     ]) ?? '—'
// );


// const getPeriod = (row) => String(
//     getValue(row, [
//         'period_name',
//         'period',
//         'month',
//         'month_name',
//         'monthName',
//         'label',
//     ]) ?? '—'
// );


// const getPTD = (row) => getValue(row, [
//     'actual_ptd',
//     'current_ptd',
//     'ptd',
//     'ptd_value',
//     'actual',
//     'current',
//     'value',
//     'amount',
// ]);


// const getYTD = (row) => getValue(row, [
//     'actual_ytd',
//     'current_ytd',
//     'ytd',
//     'ytd_value',
// ]);


// const getTargetPTD = (row) => getValue(row, [
//     'target_ptd',
//     'target_period',
//     'target',
// ]);


// const getTargetYTD = (row) => getValue(row, [
//     'target_ytd',
//     'ytd_target',
// ]);


// const getVariancePTD = (row) => getValue(row, [
//     'variance_ptd',
//     'variance_ptd_value',
//     'variance',
// ]);


// const getVarianceYTD = (row) => getValue(row, [
//     'variance_ytd',
//     'variance_ytd_value',
// ]);


// const sumNumbers = (values) => {
//     const nums = values.map(numberOrNull).filter((v) => v !== null);
//     return nums.length ? nums.reduce((sum, v) => sum + v, 0) : null;
// };


// const numberOrNull = (value) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === ''
//     ) {
//         return null;
//     }

//     if (typeof value === 'number') {
//         return Number.isFinite(value)
//             ? value
//             : null;
//     }

//     const parsed = Number(
//         String(value).replace(/,/g, '')
//     );

//     return Number.isFinite(parsed)
//         ? parsed
//         : null;
// };


// const formatMoney = (
//     value,
//     currency = 'AED'
// ) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === ''
//     ) {
//         return '—';
//     }

//     const numeric = numberOrNull(value);

//     if (numeric === null) {
//         return String(value);
//     }

//     return `${currency} ${numeric.toLocaleString(
//         'en-US',
//         {
//             maximumFractionDigits: 2,
//         }
//     )}`;
// };


// const formatTableMoney = (
//     value
// ) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === ''
//     ) {
//         return '—';
//     }

//     const numeric = numberOrNull(value);

//     if (numeric === null) {
//         return String(value);
//     }

//     return numeric.toLocaleString(
//         'en-US',
//         {
//             maximumFractionDigits: 0,
//             minimumFractionDigits: 0,
//         }
//     );
// };


// const formatMillions = (
//     value,
//     currency = 'AED'
// ) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === ''
//     ) {
//         return '—';
//     }

//     const numeric = numberOrNull(value);

//     if (numeric === null) {
//         return String(value);
//     }

//     return `${currency} ${(numeric / 1000000).toFixed(2)}M`;
// };


// const formatPercent = (value) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === ''
//     ) {
//         return '—';
//     }

//     const numeric = numberOrNull(value);

//     if (numeric === null) {
//         return String(value);
//     }

//     return `${numeric.toFixed(1)}%`;
// };


// const valueColor = (value) => {
//     const numeric = numberOrNull(value);

//     return numeric !== null && numeric < 0
//         ? '#dc2626'
//         : '#334155';
// };


// const optionValue = (option) => {
//     if (
//         option &&
//         typeof option === 'object'
//     ) {
//         return String(
//             option.value ??
//             option.id ??
//             option.code ??
//             option.name ??
//             ''
//         );
//     }

//     return String(option ?? '');
// };


// const optionLabel = (option) => {
//     if (
//         option &&
//         typeof option === 'object'
//     ) {
//         return String(
//             option.label ??
//             option.name ??
//             option.value ??
//             option.id ??
//             ''
//         );
//     }

//     return String(option ?? '');
// };


// /* =========================================================
//    MONTHLY CATEGORY NORMALIZATION
// ========================================================= */

// const normalizeCategoryMonthlyRows = (rows) => {
//     const sourceRows = unwrapRows(rows);

//     const categoryKey = (label) => {
//         const normalized = String(label || '')
//             .trim()
//             .toLowerCase();

//         if (normalized === 'cost of material') {
//             return 'material';
//         }

//         if (normalized === 'direct expenses') {
//             return 'direct';
//         }

//         if (
//             normalized === 'operating expenses' ||
//             normalized === 'operating expense'
//         ) {
//             return 'operating';
//         }

//         return null;
//     };

//     const periodSortValue = (period) => {
//         const match = String(period || '').match(
//             /^([A-Za-z]{3})[-\s](\d{2,4})$/
//         );

//         if (!match) {
//             return Number.MAX_SAFE_INTEGER;
//         }

//         const monthIndex = {
//             jan: 0,
//             feb: 1,
//             mar: 2,
//             apr: 3,
//             may: 4,
//             jun: 5,
//             jul: 6,
//             aug: 7,
//             sep: 8,
//             oct: 9,
//             nov: 10,
//             dec: 11,
//         }[match[1].toLowerCase()];

//         const year = Number(match[2]);
//         const normalizedYear = year < 100 ? 2000 + year : year;

//         return normalizedYear * 12 + (monthIndex ?? 0);
//     };

//     const monthlyRows = sourceRows.filter((row) => {
//         const monthly = getValue(row, [
//             'monthly_actual',
//             'monthly_actual_aed',
//         ]);

//         return (
//             monthly &&
//             typeof monthly === 'object' &&
//             !Array.isArray(monthly)
//         );
//     });

//     if (monthlyRows.length) {
//         const periods = new Set();

//         monthlyRows.forEach((row) => {
//             const monthly = getValue(row, [
//                 'monthly_actual',
//                 'monthly_actual_aed',
//             ]);

//             Object.keys(monthly || {}).forEach((period) => {
//                 periods.add(period);
//             });
//         });

//         return Array.from(periods)
//             .sort((a, b) => periodSortValue(a) - periodSortValue(b))
//             .map((period) => {
//                 const result = {
//                     period,
//                     material: null,
//                     direct: null,
//                     operating: null,
//                 };

//                 monthlyRows.forEach((row) => {
//                     const key = categoryKey(getLabel(row));
//                     if (!key) return;

//                     const monthly = getValue(row, [
//                         'monthly_actual',
//                         'monthly_actual_aed',
//                     ]);

//                     if (
//                         monthly &&
//                         Object.prototype.hasOwnProperty.call(monthly, period)
//                     ) {
//                         result[key] = numberOrNull(monthly[period]);
//                     }
//                 });

//                 return result;
//             });
//     }

//     /* Backward-compatible support for a period-oriented response. */
//     return sourceRows
//         .map((row) => ({
//             period: getPeriod(row),
//             material: numberOrNull(getValue(row, [
//                 'cost_of_material',
//                 'cost_of_material_ptd',
//                 'cost_of_material_ptd_aed',
//                 'actual_cost_of_material',
//                 'actual_cost_of_material_aed',
//                 'material',
//                 'material_ptd',
//                 'material_ptd_aed',
//             ])),
//             direct: numberOrNull(getValue(row, [
//                 'direct_expenses',
//                 'direct_expenses_ptd',
//                 'direct_expenses_ptd_aed',
//                 'actual_direct_expenses',
//                 'actual_direct_expenses_aed',
//                 'direct',
//                 'direct_ptd',
//                 'direct_ptd_aed',
//             ])),
//             operating: numberOrNull(getValue(row, [
//                 'operating_expenses',
//                 'operating_expenses_ptd',
//                 'operating_expenses_ptd_aed',
//                 'actual_operating_expenses',
//                 'actual_operating_expenses_aed',
//                 'operating',
//                 'operating_ptd',
//                 'operating_ptd_aed',
//             ])),
//         }))
//         .filter((row) => row.period !== '—');
// };


// /* =========================================================
//    DIRECT COST MONTHLY NORMALIZATION
// ========================================================= */

// const normalizeDirectCostMonthlyRows = (rows) => {
//     const sourceRows = unwrapRows(rows);

//     const categoryKey = (label) => {
//         const normalized = String(label || '')
//             .trim()
//             .toLowerCase();

//         if (normalized === 'cost of material') return 'material';
//         if (normalized === 'direct labour' || normalized === 'direct labor') return 'labour';
//         if (normalized === 'manufacturing / direct overheads' || normalized === 'manufacturing/direct overheads') return 'manufacturing';
//         if (normalized === 'overhead absorption') return 'absorption';
//         if (normalized === 'direct expenses - rkme' || normalized === 'direct expenses–rkme') return 'rkme';
//         return null;
//     };

//     const periodSortValue = (period) => {
//         const match = String(period || '').match(/^([A-Za-z]{3})[-\s](\d{2,4})$/);
//         if (!match) return Number.MAX_SAFE_INTEGER;

//         const monthIndex = {
//             jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
//             jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
//         }[match[1].toLowerCase()];

//         const year = Number(match[2]);
//         return (year < 100 ? 2000 + year : year) * 12 + (monthIndex ?? 0);
//     };

//     const monthlyRows = sourceRows.filter((row) => {
//         const monthly = getValue(row, ['monthly_actual', 'monthly_actual_aed']);
//         return monthly && typeof monthly === 'object' && !Array.isArray(monthly);
//     });

//     if (monthlyRows.length) {
//         const periods = new Set();

//         monthlyRows.forEach((row) => {
//             const monthly = getValue(row, ['monthly_actual', 'monthly_actual_aed']);
//             Object.keys(monthly || {}).forEach((period) => periods.add(period));
//         });

//         return Array.from(periods)
//             .sort((a, b) => periodSortValue(a) - periodSortValue(b))
//             .map((period) => {
//                 const result = {
//                     period,
//                     material: null,
//                     labour: null,
//                     manufacturing: null,
//                     absorption: null,
//                     rkme: null,
//                 };

//                 monthlyRows.forEach((row) => {
//                     const key = categoryKey(getLabel(row));
//                     if (!key) return;

//                     const monthly = getValue(row, ['monthly_actual', 'monthly_actual_aed']);
//                     if (monthly && Object.prototype.hasOwnProperty.call(monthly, period)) {
//                         result[key] = numberOrNull(monthly[period]);
//                     }
//                 });

//                 return result;
//             });
//     }

//     return sourceRows
//         .map((row) => ({
//             period: getPeriod(row),
//             material: numberOrNull(getValue(row, ['cost_of_material', 'material', 'actual_cost_of_material'])),
//             labour: numberOrNull(getValue(row, ['direct_labour', 'direct_labor', 'labour', 'labor'])),
//             manufacturing: numberOrNull(getValue(row, ['manufacturing_direct_overheads', 'manufacturing_direct_overhead', 'manufacturing'])),
//             absorption: numberOrNull(getValue(row, ['overhead_absorption', 'absorption'])),
//             rkme: numberOrNull(getValue(row, ['direct_expenses_rkme', 'rkme'])),
//         }))
//         .filter((row) => row.period !== '—');
// };


// /* =========================================================
//    VIEW ALL KPI CARD
// ========================================================= */

// function ViewAllCostCard({
//     title,
//     ptd,
//     ytd,
//     color,
//     bg,
//     icon: Icon,
//     loading,
//     currency,
// }) {
//     return (
//         <div
//             style={{
//                 background: bg,
//                 border: '1px solid #e3eaf2',
//                 borderRadius: 10,
//                 minHeight: 100,
//                 padding: '12px 18px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 14,
//                 boxSizing: 'border-box',
//             }}
//         >
//             <div
//                 style={{
//                     width: 48,
//                     height: 48,
//                     borderRadius: 10,
//                     background: '#ffffff88',
//                     color,
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     flexShrink: 0,
//                 }}
//             >
//                 <Icon size={25} strokeWidth={2} />
//             </div>

//             <div style={{ flex: 1, minWidth: 0 }}>
//                 <div
//                     style={{
//                         fontSize: 14,
//                         fontWeight: 800,
//                         color: '#173b82',
//                         marginBottom: 9,
//                     }}
//                     title={
//                         title === 'Direct Expenses'
//                             ? 'Direct Expenses includes Direct Labour, Manufacturing/Direct Overheads, Overhead Absorption and Direct Expenses–RKME.'
//                             : undefined
//                     }
//                 >
//                     {title}
//                 </div>

//                 <div
//                     style={{
//                         display: 'grid',
//                         gridTemplateColumns: '1fr 1fr',
//                         gap: 0,
//                     }}
//                 >
//                     <div
//                         style={{
//                             borderRight: '1px solid #d9e0e8',
//                             paddingRight: 20,
//                         }}
//                     >
//                         <div
//                             style={{
//                                 fontSize: 12,
//                                 color: '#64748b',
//                                 marginBottom: 2,
//                             }}
//                         >
//                             PTD
//                         </div>
//                         <div
//                             style={{
//                                 fontSize: 18,
//                                 fontWeight: 800,
//                                 color: '#172554',
//                                 lineHeight: '22px',
//                             }}
//                         >
//                             {loading ? '—' : formatMillions(ptd, currency)}
//                         </div>
//                     </div>

//                     <div style={{ paddingLeft: 20 }}>
//                         <div
//                             style={{
//                                 fontSize: 12,
//                                 color: '#64748b',
//                                 marginBottom: 2,
//                             }}
//                         >
//                             YTD
//                         </div>
//                         <div
//                             style={{
//                                 fontSize: 18,
//                                 fontWeight: 800,
//                                 color: '#172554',
//                                 lineHeight: '22px',
//                             }}
//                         >
//                             {loading ? '—' : formatMillions(ytd, currency)}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


// /* =========================================================
//    COMPACT MULTI SELECT
// ========================================================= */

// function CompactMultiSelect({
//     options = [],
//     value = ['All'],
//     onChange,
//     placeholder = 'All',
// }) {
//     const [open, setOpen] = useState(false);
//     const [search, setSearch] = useState('');
//     const ref = useRef(null);

//     const normalized = asArray(value)
//         .map(optionValue)
//         .filter(Boolean);

//     const allSelected =
//         normalized.length === 0 ||
//         normalized.includes('All') ||
//         normalized.includes('all');

//     const cleanOptions = options.filter(
//         (o) =>
//             optionValue(o) !== '-1' &&
//             optionLabel(o).toLowerCase() !== 'all'
//     );

//     const filteredOptions = cleanOptions.filter((opt) =>
//         optionLabel(opt)
//             .toLowerCase()
//             .includes(search.trim().toLowerCase())
//     );

//     useEffect(() => {
//         const handler = (event) => {
//             if (ref.current && !ref.current.contains(event.target)) {
//                 setOpen(false);
//                 setSearch('');
//             }
//         };
//         document.addEventListener('mousedown', handler);
//         return () => document.removeEventListener('mousedown', handler);
//     }, []);

//     useEffect(() => {
//         if (!open) setSearch('');
//     }, [open]);

//     const toggle = (id) => {
//         const current = normalized.filter((v) => v !== 'All' && v !== 'all');
//         if (current.includes(id)) {
//             const next = current.filter((v) => v !== id);
//             onChange(next.length ? next : ['All']);
//         } else {
//             onChange([...current, id]);
//         }
//     };

//     const selectAll = () => {
//         const current = normalized.filter((v) => v !== 'All' && v !== 'all');
//         const visibleIds = filteredOptions.map((opt) => optionValue(opt)).filter(Boolean);
//         const next = Array.from(new Set([...current, ...visibleIds]));
//         onChange(next.length ? next : ['All']);
//         setSearch('');
//     };

//     const clearAll = () => {
//         onChange(['All']);
//         setSearch('');
//     };

//     const display =
//         allSelected
//             ? placeholder
//             : normalized.length === 1
//                 ? optionLabel(
//                     cleanOptions.find((o) => optionValue(o) === normalized[0]) ?? normalized[0]
//                 )
//                 : `${normalized.length} selected`;

//     return (
//         <div ref={ref} style={{ position: 'relative', minWidth: 150 }}>
//             <button
//                 type="button"
//                 onClick={() => setOpen((v) => !v)}
//                 style={{
//                     width: '100%',
//                     minHeight: 34,
//                     padding: '6px 9px',
//                     border: `1px solid ${C.border}`,
//                     borderRadius: 7,
//                     background: '#fff',
//                     color: '#334155',
//                     fontSize: 13,
//                     textAlign: 'left',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'space-between',
//                     cursor: 'pointer',
//                 }}
//             >
//                 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                     {display}
//                 </span>
//                 <ChevronDown size={13} color="#94a3b8" />
//             </button>

//             {open && (
//                 <div
//                     style={{
//                         position: 'absolute',
//                         top: 'calc(100% + 4px)',
//                         left: 0,
//                         right: 0,
//                         minWidth: 230,
//                         maxHeight: 300,
//                         overflowY: 'auto',
//                         background: '#fff',
//                         border: '1px solid #e2e8f0',
//                         borderRadius: 9,
//                         boxShadow: '0 12px 30px rgba(15,23,42,.14)',
//                         zIndex: 1200,
//                     }}
//                 >
//                     <div style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
//                         <input
//                             type="text"
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                             onClick={(e) => e.stopPropagation()}
//                             placeholder="🔍 Search..."
//                             style={{
//                                 width: '100%',
//                                 boxSizing: 'border-box',
//                                 height: 30,
//                                 padding: '5px 8px',
//                                 border: '1px solid #dbe2ea',
//                                 borderRadius: 6,
//                                 outline: 'none',
//                                 fontSize: 11,
//                                 color: '#334155',
//                             }}
//                         />
//                     </div>

//                     <div style={{ display: 'flex', gap: 6, padding: '7px 8px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
//                         <button
//                             type="button"
//                             onClick={selectAll}
//                             style={{ flex: 1, border: '1px solid #dbe2ea', borderRadius: 6, background: '#f8fafc', color: '#334155', padding: '5px 6px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
//                         >
//                             Select All
//                         </button>
//                         <button
//                             type="button"
//                             onClick={clearAll}
//                             style={{ flex: 1, border: '1px solid #dbe2ea', borderRadius: 6, background: '#fff', color: '#64748b', padding: '5px 6px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
//                         >
//                             Clear
//                         </button>
//                     </div>

//                     {filteredOptions.map((opt) => {
//                         const id = optionValue(opt);
//                         const checked = !allSelected && normalized.includes(id);
//                         return (
//                             <button
//                                 type="button"
//                                 key={id}
//                                 onClick={() => toggle(id)}
//                                 style={{
//                                     width: '100%',
//                                     border: 0,
//                                     borderBottom: '1px solid #f8fafc',
//                                     background: '#fff',
//                                     padding: '8px 10px',
//                                     textAlign: 'left',
//                                     fontSize: 12,
//                                     color: '#334155',
//                                     cursor: 'pointer',
//                                     display: 'flex',
//                                     gap: 8,
//                                     alignItems: 'center',
//                                 }}
//                             >
//                                 <span
//                                     aria-hidden="true"
//                                     style={{
//                                         width: 15,
//                                         height: 15,
//                                         border: `1px solid ${checked ? '#173b68' : '#cbd5e1'}`,
//                                         borderRadius: 3,
//                                         background: checked ? '#173b68' : '#fff',
//                                         display: 'inline-flex',
//                                         alignItems: 'center',
//                                         justifyContent: 'center',
//                                         flexShrink: 0,
//                                         boxSizing: 'border-box',
//                                     }}
//                                 >
//                                     {checked && (
//                                         <span
//                                             style={{
//                                                 color: '#fff',
//                                                 fontSize: 10,
//                                                 lineHeight: 1,
//                                                 fontWeight: 800,
//                                             }}
//                                         >
//                                             ✓
//                                         </span>
//                                     )}
//                                 </span>
//                                 <span>{optionLabel(opt)}</span>
//                             </button>
//                         );
//                     })}

//                     {!filteredOptions.length && (
//                         <div style={{ padding: 12, textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>
//                             No matching options
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }

// /* =========================================================
//    FILTER CHIPS
// ========================================================= */

// function FilterChips({
//     label,
//     value = ['All'],
//     options = [],
//     onRemove,
// }) {
//     const vals = asArray(value).filter(
//         (v) =>
//             String(v) !== 'All' &&
//             String(v) !== 'all'
//     );

//     if (!vals.length) {
//         return null;
//     }

//     return (
//         <div
//             style={{
//                 display: 'flex',
//                 gap: 5,
//                 flexWrap: 'wrap',
//                 alignItems: 'center',
//             }}
//         >
//             <span
//                 style={{
//                     fontSize: 11,
//                     color: '#64748b',
//                     fontWeight: 700,
//                 }}
//             >
//                 {label}:
//             </span>

//             {vals.slice(0, 4).map((v) => {
//                 const labelValue =
//                     optionLabel(
//                         options.find(
//                             (o) =>
//                                 optionValue(o) ===
//                                 String(v)
//                         ) ?? v
//                     );

//                 return (
//                     <span
//                         key={String(v)}
//                         style={{
//                             display: 'inline-flex',
//                             alignItems: 'center',
//                             gap: 4,
//                             padding: '3px 7px',
//                             borderRadius: 999,
//                             background: '#f1f5f9',
//                             color: '#475569',
//                             fontSize: 11,
//                         }}
//                     >
//                         {labelValue}

//                         <button
//                             type="button"
//                             onClick={() =>
//                                 onRemove(v)
//                             }
//                             style={{
//                                 border: 0,
//                                 background:
//                                     'transparent',
//                                 padding: 0,
//                                 cursor: 'pointer',
//                                 color: '#94a3b8',
//                             }}
//                         >
//                             ×
//                         </button>
//                     </span>
//                 );
//             })}

//             {vals.length > 4 && (
//                 <span
//                     style={{
//                         fontSize: 11,
//                         color: '#64748b',
//                     }}
//                 >
//                     +{vals.length - 4}
//                 </span>
//             )}
//         </div>
//     );
// }


// /* =========================================================
//    COST CARD
// ========================================================= */

// function CostCard({
//     title,
//     value,
//     ytd,
//     target,
//     color,
//     bg,
//     icon: Icon,
//     loading,
//     currency,
// }) {
//     return (
//         <div
//             style={{
//                 background: bg || '#fff',
//                 border: '1px solid #e5ebf2',
//                 borderRadius: 10,
//                 padding: '10px 14px',
//                 minHeight: 78,
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 10,
//                 boxSizing: 'border-box',
//                 boxShadow: '0 1px 4px rgba(15,23,42,.025)',
//             }}
//         >
//             <div
//                 style={{
//                     width: 43,
//                     height: 43,
//                     borderRadius: '50%',
//                     background: '#ffffff99',
//                     color,
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     flexShrink: 0,
//                     border: `1px solid ${color}22`,
//                 }}
//             >
//                 <Icon size={19} strokeWidth={2.1} />
//             </div>

//             <div style={{ minWidth: 0, flex: 1 }}>
//                 <div
//                     style={{
//                         fontSize: 11,
//                         color,
//                         fontWeight: 800,
//                         marginBottom: 1,
//                         lineHeight: '14px',
//                     }}
//                 >
//                     {title}
//                 </div>

//                 {loading ? (
//                     <div
//                         style={{
//                             width: 105,
//                             height: 17,
//                             borderRadius: 5,
//                             background: '#f1f5f9',
//                             marginBottom: 3,
//                         }}
//                     />
//                 ) : (
//                     <div
//                         style={{
//                             fontSize: 15,
//                             fontWeight: 800,
//                             color: '#172554',
//                             lineHeight: '18px',
//                         }}
//                     >
//                         {formatMillions(value, currency)}
//                     </div>
//                 )}

//                 <div
//                     style={{
//                         display: 'flex',
//                         gap: 14,
//                         marginTop: 2,
//                         fontSize: 11,
//                         color: '#7d8798',
//                         flexWrap: 'wrap',
//                         lineHeight: '13px',
//                     }}
//                 >
//                     <span>
//                         YTD:{' '}
//                         <span style={{ color: '#526071' }}>
//                             {formatMillions(ytd, currency)}
//                         </span>
//                     </span>

//                     <span>
//                         Target:{' '}
//                         <span style={{ color: '#526071' }}>
//                             {formatMillions(target, currency)}
//                         </span>
//                     </span>
//                 </div>
//             </div>
//         </div>
//     );
// }


// /* =========================================================
//    MAIN COST CHART
// ========================================================= */

// function MainCostChart({
//     data,
//     currency,
// }) {
//     /*
//      * /api/pl/cost-classification-monthly returns one row per
//      * cost category. Each row contains monthly_actual as:
//      *
//      * {
//      *   "Apr-26": "24800000",
//      *   "May-26": "23200000",
//      *   ...
//      * }
//      *
//      * The chart needs the opposite shape: one row per period.
//      */
//     const rows = unwrapRows(data);

//     const categoryKey = (label) => {
//         const normalized = String(label || '')
//             .trim()
//             .toLowerCase();

//         if (normalized === 'cost of material') {
//             return 'material';
//         }

//         if (normalized === 'direct expenses') {
//             return 'direct';
//         }

//         if (
//             normalized === 'operating expenses' ||
//             normalized === 'operating expense'
//         ) {
//             return 'operating';
//         }

//         return null;
//     };

//     const monthlyPeriods = new Set();

//     rows.forEach((row) => {
//         const monthly =
//             getValue(row, [
//                 'monthly_actual',
//                 'monthly_actual_aed',
//             ]);

//         if (
//             monthly &&
//             typeof monthly === 'object' &&
//             !Array.isArray(monthly)
//         ) {
//             Object.keys(monthly).forEach((period) => {
//                 monthlyPeriods.add(period);
//             });
//         }
//     });

//     const periodSortValue = (period) => {
//         const match = String(period || '').match(
//             /^([A-Za-z]{3})[-\s](\d{2,4})$/
//         );

//         if (!match) {
//             return Number.MAX_SAFE_INTEGER;
//         }

//         const monthIndex = {
//             jan: 0,
//             feb: 1,
//             mar: 2,
//             apr: 3,
//             may: 4,
//             jun: 5,
//             jul: 6,
//             aug: 7,
//             sep: 8,
//             oct: 9,
//             nov: 10,
//             dec: 11,
//         }[match[1].toLowerCase()];

//         const year = Number(match[2]);
//         const normalizedYear =
//             year < 100 ? 2000 + year : year;

//         return (
//             normalizedYear * 12 +
//             (monthIndex ?? 0)
//         );
//     };

//     const periods = Array.from(monthlyPeriods).sort(
//         (a, b) =>
//             periodSortValue(a) -
//             periodSortValue(b)
//     );

//     const chartData = periods.map((period) => {
//         const result = {
//             period,
//             material: null,
//             direct: null,
//             operating: null,
//         };

//         rows.forEach((row) => {
//             const key = categoryKey(
//                 getLabel(row)
//             );

//             if (!key) {
//                 return;
//             }

//             const monthly =
//                 getValue(row, [
//                     'monthly_actual',
//                     'monthly_actual_aed',
//                 ]);

//             if (
//                 monthly &&
//                 typeof monthly === 'object' &&
//                 !Array.isArray(monthly) &&
//                 Object.prototype.hasOwnProperty.call(
//                     monthly,
//                     period
//                 )
//             ) {
//                 result[key] = numberOrNull(
//                     monthly[period]
//                 );
//             }
//         });

//         return result;
//     });

//     /*
//      * Backward-compatible fallback for an older
//      * period-oriented response.
//      */
//     const fallbackChartData =
//         !chartData.length
//             ? rows
//                 .map((row) => ({
//                     period: getPeriod(row),
//                     material: numberOrNull(
//                         getValue(row, [
//                             'cost_of_material',
//                             'cost_of_material_ptd',
//                             'material',
//                             'material_ptd',
//                         ])
//                     ),
//                     direct: numberOrNull(
//                         getValue(row, [
//                             'direct_expenses',
//                             'direct_expenses_ptd',
//                             'direct',
//                             'direct_ptd',
//                         ])
//                     ),
//                     operating: numberOrNull(
//                         getValue(row, [
//                             'operating_expenses',
//                             'operating_expenses_ptd',
//                             'operating',
//                             'operating_ptd',
//                         ])
//                     ),
//                 }))
//                 .filter(
//                     (row) => row.period !== '—'
//                 )
//             : chartData;

//     return (
//         <div
//             className="cost-structure-chart"
//             style={{
//                 background: '#fff',
//                 border: '1px solid #e7ebf1',
//                 borderRadius: 11,
//                 padding: '12px 14px',
//                 height: 246,
//                 boxSizing: 'border-box',
//                 boxShadow:
//                     '0 1px 3px rgba(15,23,42,.035)',
//             }}
//         >
//             <div
//                 style={{
//                     fontSize: 13,
//                     fontWeight: 700,
//                     color: '#182338',
//                     marginBottom: 8,
//                 }}
//             >
//                 Month-on-Month Cost Classification
//             </div>

//             <div
//                 style={{
//                     height: 188,
//                 }}
//             >
//                 {fallbackChartData.length ? (
//                     <ResponsiveContainer
//                         width="100%"
//                         height="100%"
//                     >
//                         <LineChart
//                             data={fallbackChartData}
//                             margin={{
//                                 top: 8,
//                                 right: 10,
//                                 left: -12,
//                                 bottom: 4,
//                             }}
//                         >
//                             <CartesianGrid
//                                 strokeDasharray="3 3"
//                                 vertical={false}
//                                 stroke="#edf0f4"
//                             />

//                             <XAxis
//                                 dataKey="period"
//                                 tick={{
//                                     fontSize: 10,
//                                     fill: '#687386',
//                                 }}
//                                 axisLine={{
//                                     stroke: '#dfe5ec',
//                                 }}
//                                 tickLine={false}
//                             />

//                             <YAxis
//                                 tick={{
//                                     fontSize: 10,
//                                     fill: '#8b94a3',
//                                 }}
//                                 axisLine={false}
//                                 tickLine={false}
//                                 tickFormatter={(v) =>
//                                     `${(
//                                         Number(v) /
//                                         1000000
//                                     ).toFixed(0)}M`
//                                 }
//                             />

//                             <Tooltip
//                                 formatter={(value, name) => [
//                                     formatMoney(value, currency),
//                                     name,
//                                 ]}
//                                 contentStyle={{
//                                     borderRadius: 8,
//                                     border:
//                                         '1px solid #e2e8f0',
//                                     fontSize: 11,
//                                     boxShadow:
//                                         '0 8px 24px rgba(15,23,42,.12)',
//                                 }}
//                             />

//                             <Legend
//                                 verticalAlign="bottom"
//                                 height={20}
//                                 wrapperStyle={{
//                                     fontSize: 10,
//                                     paddingTop: 2,
//                                 }}
//                             />

//                             <Line
//                                 type="monotone"
//                                 dataKey="material"
//                                 name="Cost of Material"
//                                 stroke={CATEGORY_META['Cost of Material'].color}
//                                 strokeWidth={2.5}
//                                 dot={{
//                                     r: 3,
//                                     strokeWidth: 1.5,
//                                 }}
//                                 activeDot={{
//                                     r: 5,
//                                 }}
//                                 connectNulls
//                             />

//                             <Line
//                                 type="monotone"
//                                 dataKey="direct"
//                                 name="Direct Expenses"
//                                 stroke={CATEGORY_META['Direct Expenses'].color}
//                                 strokeWidth={2.5}
//                                 dot={{
//                                     r: 3,
//                                     strokeWidth: 1.5,
//                                 }}
//                                 activeDot={{
//                                     r: 5,
//                                 }}
//                                 connectNulls
//                             />

//                             <Line
//                                 type="monotone"
//                                 dataKey="operating"
//                                 name="Operating Expenses"
//                                 stroke={CATEGORY_META['Operating Expenses'].color}
//                                 strokeWidth={2.5}
//                                 dot={{
//                                     r: 3,
//                                     strokeWidth: 1.5,
//                                 }}
//                                 activeDot={{
//                                     r: 5,
//                                 }}
//                                 connectNulls
//                             />
//                         </LineChart>
//                     </ResponsiveContainer>
//                 ) : (
//                     <div
//                         style={{
//                             height: '100%',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent:
//                                 'center',
//                             color: '#94a3b8',
//                             fontSize: 13,
//                         }}
//                     >
//                         No data available
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// /* =========================================================
//    COST MIX
// ========================================================= */

// function CostMix({
//     payload,
//     currency,
//     periodName = '',
// }) {
//     /*
//      * Current PTD Cost Mix is driven by the same
//      * /api/pl/cost-classification-monthly response.
//      *
//      * The backend returns one row per category and
//      * monthly_actual[periodName] contains the PTD value.
//      * Do not read the PTD value from /direct-cost-breakdown.
//      */
//     const rows = unwrapRows(payload);

//     const findCategory = (name) =>
//         rows.find(
//             (row) =>
//                 getLabel(row)
//                     .trim()
//                     .toLowerCase() ===
//                 name.toLowerCase()
//         );

//     const readMonthlyActual = (row) => {
//         if (!row || typeof row !== 'object') {
//             return null;
//         }

//         const monthly = getValue(row, [
//             'monthly_actual',
//             'monthly_actual_aed',
//         ]);

//         if (
//             monthly && !Array.isArray(monthly)
//         ) {
//             if (
//                 periodName &&
//                 Object.prototype.hasOwnProperty.call(
//                     monthly,
//                     periodName
//                 )
//             ) {
//                 return monthly[periodName];
//             }

//             /*
//              * Keep the UI populated during an initial
//              * period transition if the selected period
//              * has not arrived in the response yet.
//              */
//             const availablePeriods =
//                 Object.keys(monthly);

//             if (availablePeriods.length) {
//                 return monthly[
//                     availablePeriods[0]
//                 ];
//             }
//         }

//         return getValue(row, [
//             'actual_ptd',
//             'actual_ptd_aed',
//             'current_ptd',
//             'current_ptd_aed',
//             'ptd',
//             'ptd_value',
//             'ptd_aed',
//             'value',
//             'amount',
//             'amount_aed',
//         ]);
//     };

//     const readBackendPercentage = (row) => {
//         const value = getValue(row, [
//             'percentage',
//             'percentage_ptd',
//             'percentage_ptd_cost_mix',
//             'pct',
//             'pct_ptd',
//             'share',
//             'mix_percentage',
//             'cost_mix_percentage',
//         ]);

//         const numeric = numberOrNull(value);

//         if (numeric === null) {
//             return null;
//         }

//         /*
//          * Support both 82.6 and 0.826 backend conventions.
//          */
//         return Math.abs(numeric) <= 1
//             ? numeric * 100
//             : numeric;
//     };

//     const normalized = [
//         'Cost of Material',
//         'Direct Expenses',
//         'Operating Expenses',
//     ]
//         .map((category) => {
//             const row = findCategory(
//                 category
//             );

//             return {
//                 label: category,
//                 value: readMonthlyActual(row),
//                 backendPercentage:
//                     readBackendPercentage(row),
//             };
//         });

//     const total = normalized.reduce(
//         (sum, item) =>
//             sum +
//             (numberOrNull(item.value) ?? 0),
//         0
//     );

//     const displayRows = normalized.map(
//         (item) => {
//             const numericValue =
//                 numberOrNull(item.value);

//             /*
//              * Prefer a percentage explicitly supplied
//              * by the backend. Otherwise calculate the
//              * mix from the three classification values.
//              */
//             const percentage =
//                 item.backendPercentage !== null
//                     ? item.backendPercentage
//                     : total > 0 &&
//                         numericValue !== null
//                         ? (numericValue / total) *
//                         100
//                         : null;

//             return {
//                 ...item,
//                 percentage,
//             };
//         }
//     );

//     return (
//         <div
//             style={{
//                 background: '#fff',
//                 border: '1px solid #e7ebf1',
//                 borderRadius: 11,
//                 padding: '12px 14px',
//                 height: 246,
//                 boxSizing: 'border-box',
//                 boxShadow:
//                     '0 1px 3px rgba(15,23,42,.035)',
//             }}
//         >
//             <div
//                 style={{
//                     fontSize: 13,
//                     fontWeight: 700,
//                     color: '#182338',
//                     marginBottom: 14,
//                 }}
//             >
//                 Current PTD Cost Mix
//             </div>

//             <div
//                 style={{
//                     display: 'flex',
//                     flexDirection: 'column',
//                     gap: 15,
//                 }}
//             >
//                 {displayRows.some(
//                     (item) =>
//                         numberOrNull(
//                             item.value
//                         ) !== null
//                 ) ? (
//                     displayRows.map((item) => {
//                         const meta =
//                             CATEGORY_META[
//                             item.label
//                             ] || {
//                                 color: '#64748b',
//                             };

//                         const pct =
//                             numberOrNull(
//                                 item.percentage
//                             );

//                         return (
//                             <div
//                                 key={item.label}
//                                 style={{
//                                     display: 'grid',
//                                     gridTemplateColumns:
//                                         '88px minmax(0, 1fr) 78px',
//                                     alignItems:
//                                         'center',
//                                     gap: 10,
//                                 }}
//                             >
//                                 <div
//                                     style={{
//                                         fontSize: 12, fontWeight: 800,
//                                         lineHeight:
//                                             '12px',
//                                         color:
//                                             '#3e4859',
//                                     }}
//                                 >
//                                     {item.label}
//                                 </div>

//                                 <div
//                                     style={{
//                                         height: 25,
//                                         background:
//                                             '#f5f6f8',
//                                         position:
//                                             'relative',
//                                         borderRadius: 3,
//                                         overflow:
//                                             'hidden',
//                                     }}
//                                 >
//                                     {pct !== null && (
//                                         <div
//                                             style={{
//                                                 height:
//                                                     '100%',
//                                                 width: `${Math.max(
//                                                     0,
//                                                     Math.min(
//                                                         100,
//                                                         pct
//                                                     )
//                                                 )}%`,
//                                                 background:
//                                                     meta.color,
//                                                 borderRadius:
//                                                     3,
//                                                 minWidth:
//                                                     pct >
//                                                         0
//                                                         ? 2
//                                                         : 0,
//                                             }}
//                                         />
//                                     )}
//                                 </div>

//                                 <div
//                                     style={{
//                                         fontSize: 10,
//                                         color:
//                                             '#1e293b',
//                                         lineHeight:
//                                             '13px',
//                                         minWidth: 0,
//                                     }}
//                                 >
//                                     <div
//                                         style={{
//                                             fontWeight:
//                                                 700,
//                                             whiteSpace:
//                                                 'nowrap',
//                                         }}
//                                     >
//                                         {formatMillions(
//                                             item.value,
//                                             currency
//                                         )}
//                                     </div>

//                                     <div
//                                         style={{
//                                             color: '#626b7a',
//                                         }}
//                                     >
//                                         {formatPercent(
//                                             item.percentage
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })
//                 ) : (
//                     <div
//                         style={{
//                             color: '#94a3b8',
//                             fontSize: 13,
//                             paddingTop: 25,
//                         }}
//                     >
//                         No cost mix data available
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// /* =========================================================
//    DIRECT COST TABLE
// ========================================================= */

// function DirectCostTable({
//     rows,
//     currency,
//     onExpand,
//     expanded,
//     details,
//     loadingDetails,
// }) {
//     return (
//         <div
//             style={{
//                 overflowX: 'auto',
//             }}
//         >
//             <table
//                 className="cost-structure-table"
//                 style={{
//                     width: '100%',
//                     borderCollapse:
//                         'collapse',
//                     tableLayout: 'fixed',
//                     fontSize: 11,
//                 }}
//             >
//                 <thead>
//                     <tr
//                         style={{
//                             background: '#fff',
//                         }}
//                     >
//                         <th
//                             style={{
//                                 width: 30,
//                                 borderTop:
//                                     '1px solid #e4e9ef',
//                                 borderBottom:
//                                     '1px solid #e4e9ef',
//                             }}
//                         />

//                         {[
//                             'Cost Category',
//                             'Actual PTD',
//                             'Target PTD',
//                             'Variance PTD',
//                             'Actual YTD',
//                             'Target YTD',
//                             'Variance YTD',
//                         ].map((h) => (
//                             <th
//                                 key={h}
//                                 style={{
//                                     padding: 8,
//                                     textAlign:
//                                         h ===
//                                             'Cost Category'
//                                             ? 'left'
//                                             : 'right',
//                                     fontWeight: 700,
//                                     fontSize: 10,
//                                     color: '#173b68',
//                                     background: '#fff',
//                                     borderRight:
//                                         '1px solid #e4e9ef',
//                                     borderBottom:
//                                         '1px solid #e4e9ef',
//                                     whiteSpace:
//                                         'nowrap',
//                                 }}
//                             >
//                                 {h}
//                             </th>
//                         ))}
//                     </tr>
//                 </thead>

//                 <tbody>
//                     {rows.map(
//                         (
//                             row,
//                             index
//                         ) => {
//                             const category =
//                                 getLabel(
//                                     row
//                                 );

//                             const categoryTooltip =
//                                 category.trim().toLowerCase() === 'direct expenses'
//                                     ? 'Direct Expenses includes Direct Labour, Manufacturing/Direct Overheads, Overhead Absorption and Direct Expenses–RKME.'
//                                     : undefined;

//                             const key =
//                                 `${category}-${index}`;

//                             const isOpen =
//                                 !!expanded[
//                                 key
//                                 ];

//                             const ptd =
//                                 getPTD(
//                                     row
//                                 );

//                             const ytd =
//                                 getYTD(
//                                     row
//                                 );

//                             const rowDetails =
//                                 details?.[
//                                 category
//                                 ] || [];

//                             const rowLoading =
//                                 !!loadingDetails?.[
//                                 category
//                                 ];

//                             return (
//                                 <React.Fragment
//                                     key={
//                                         key
//                                     }
//                                 >
//                                     <tr
//                                         style={{
//                                             borderBottom:
//                                                 '1px solid #edf0f4',
//                                             background:
//                                                 '#fff',
//                                         }}
//                                     >
//                                         <td
//                                             style={{
//                                                 textAlign:
//                                                     'center',
//                                                 padding:
//                                                     '9px 3px',
//                                                 borderRight:
//                                                     '1px solid #edf0f4',
//                                             }}
//                                         >
//                                             <button
//                                                 type="button"
//                                                 onClick={() =>
//                                                     onExpand(
//                                                         row,
//                                                         key
//                                                     )
//                                                 }
//                                                 style={{
//                                                     border: 0,
//                                                     background:
//                                                         'transparent',
//                                                     padding:
//                                                         0,
//                                                     cursor:
//                                                         'pointer',
//                                                     color:
//                                                         '#364152',
//                                                     display:
//                                                         'inline-flex',
//                                                 }}
//                                             >
//                                                 {isOpen ? (
//                                                     <ChevronDown
//                                                         size={
//                                                             13
//                                                         }
//                                                     />
//                                                 ) : (
//                                                     <ChevronRight
//                                                         size={
//                                                             13
//                                                         }
//                                                     />
//                                                 )}
//                                             </button>
//                                         </td>

//                                         <td
//                                             style={{
//                                                 padding:
//                                                     '9px 8px',
//                                                 textAlign:
//                                                     'left',
//                                                 color:
//                                                     '#344054',
//                                                 borderRight:
//                                                     '1px solid #edf0f4',
//                                             }}
//                                         >
//                                             <span title={categoryTooltip}>
//                                                 {category}
//                                                 {categoryTooltip ? (
//                                                     <span
//                                                         style={{
//                                                             marginLeft: 5,
//                                                             display: 'inline-flex',
//                                                             width: 14,
//                                                             height: 14,
//                                                             borderRadius: '50%',
//                                                             alignItems: 'center',
//                                                             justifyContent: 'center',
//                                                             background: '#eee7ff',
//                                                             color: '#7040dc',
//                                                             fontSize: 9,
//                                                             fontWeight: 800,
//                                                             cursor: 'help',
//                                                         }}
//                                                     >i</span>
//                                                 ) : null}
//                                             </span>
//                                         </td>

//                                         <td
//                                             style={{
//                                                 padding:
//                                                     '9px 8px',
//                                                 textAlign:
//                                                     'right',
//                                                 color:
//                                                     valueColor(
//                                                         ptd
//                                                     ),
//                                                 borderRight:
//                                                     '1px solid #edf0f4',
//                                             }}
//                                         >
//                                             {formatTableMoney(
//                                                 ptd,
//                                                 currency
//                                             )}
//                                         </td>

//                                         <td
//                                             style={{
//                                                 padding:
//                                                     '9px 8px',
//                                                 textAlign:
//                                                     'right',
//                                                 color:
//                                                     valueColor(
//                                                         getTargetPTD(
//                                                             row
//                                                         )
//                                                     ),
//                                                 borderRight:
//                                                     '1px solid #edf0f4',
//                                             }}
//                                         >
//                                             {formatTableMoney(
//                                                 getTargetPTD(
//                                                     row
//                                                 ),
//                                                 currency
//                                             )}
//                                         </td>

//                                         <td
//                                             style={{
//                                                 padding:
//                                                     '9px 8px',
//                                                 textAlign:
//                                                     'right',
//                                                 color:
//                                                     valueColor(
//                                                         getVariancePTD(
//                                                             row
//                                                         )
//                                                     ),
//                                                 borderRight:
//                                                     '1px solid #edf0f4',
//                                             }}
//                                         >
//                                             {formatTableMoney(
//                                                 getVariancePTD(
//                                                     row
//                                                 ),
//                                                 currency
//                                             )}
//                                         </td>

//                                         <td
//                                             style={{
//                                                 padding:
//                                                     '9px 8px',
//                                                 textAlign:
//                                                     'right',
//                                                 color:
//                                                     valueColor(
//                                                         ytd
//                                                     ),
//                                                 borderRight:
//                                                     '1px solid #edf0f4',
//                                             }}
//                                         >
//                                             {formatTableMoney(
//                                                 ytd,
//                                                 currency
//                                             )}
//                                         </td>

//                                         <td
//                                             style={{
//                                                 padding:
//                                                     '9px 8px',
//                                                 textAlign:
//                                                     'right',
//                                                 color:
//                                                     valueColor(
//                                                         getTargetYTD(
//                                                             row
//                                                         )
//                                                     ),
//                                                 borderRight:
//                                                     '1px solid #edf0f4',
//                                             }}
//                                         >
//                                             {formatTableMoney(
//                                                 getTargetYTD(
//                                                     row
//                                                 ),
//                                                 currency
//                                             )}
//                                         </td>

//                                         <td
//                                             style={{
//                                                 padding:
//                                                     '9px 8px',
//                                                 textAlign:
//                                                     'right',
//                                                 color:
//                                                     valueColor(
//                                                         getVarianceYTD(
//                                                             row
//                                                         )
//                                                     ),
//                                             }}
//                                         >
//                                             {formatTableMoney(
//                                                 getVarianceYTD(
//                                                     row
//                                                 ),
//                                                 currency
//                                             )}
//                                         </td>
//                                     </tr>


//                                     {isOpen && (
//                                         <tr
//                                             style={{
//                                                 background:
//                                                     '#fafbfd',
//                                             }}
//                                         >
//                                             <td
//                                                 colSpan={
//                                                     8
//                                                 }
//                                                 style={{
//                                                     padding:
//                                                         0,
//                                                 }}
//                                             >
//                                                 {rowLoading ? (
//                                                     <div
//                                                         style={{
//                                                             padding:
//                                                                 '12px 28px',
//                                                             color:
//                                                                 '#64748b',
//                                                             fontSize: 11,
//                                                         }}
//                                                     >
//                                                         Loading account
//                                                         details…
//                                                     </div>
//                                                 ) : rowDetails.length ? (
//                                                     <div>
//                                                         <table
//                                                             className="cost-structure-table"
//                                                             style={{
//                                                                 width: '100%',
//                                                                 borderCollapse:
//                                                                     'collapse',
//                                                                 fontSize: 11,
//                                                             }}
//                                                         >
//                                                             <thead>
//                                                                 <tr>
//                                                                     <th
//                                                                         style={{
//                                                                             padding:
//                                                                                 '7px 10px 7px 42px',
//                                                                             textAlign:
//                                                                                 'left',
//                                                                             color:
//                                                                                 '#173b68',
//                                                                             background:
//                                                                                 '#fff',
//                                                                             fontWeight:
//                                                                                 700,
//                                                                         }}
//                                                                     >
//                                                                         Account Code
//                                                                     </th>

//                                                                     <th
//                                                                         style={{
//                                                                             padding: 7,
//                                                                             textAlign:
//                                                                                 'left',
//                                                                             color:
//                                                                                 '#173b68',
//                                                                             background:
//                                                                                 '#fff',
//                                                                             fontWeight:
//                                                                                 700,
//                                                                         }}
//                                                                     >
//                                                                         Account Name
//                                                                     </th>

//                                                                     <th
//                                                                         style={{
//                                                                             padding: 7,
//                                                                             textAlign:
//                                                                                 'right',
//                                                                             color:
//                                                                                 '#173b68',
//                                                                             background:
//                                                                                 '#fff',
//                                                                             fontWeight:
//                                                                                 700,
//                                                                         }}
//                                                                     >
//                                                                         Actual PTD
//                                                                     </th>

//                                                                     <th
//                                                                         style={{
//                                                                             padding: 7,
//                                                                             textAlign:
//                                                                                 'right',
//                                                                             color:
//                                                                                 '#173b68',
//                                                                             background:
//                                                                                 '#fff',
//                                                                             fontWeight:
//                                                                                 700,
//                                                                         }}
//                                                                     >
//                                                                         Actual YTD
//                                                                     </th>
//                                                                 </tr>
//                                                             </thead>

//                                                             <tbody>
//                                                                 {rowDetails.map(
//                                                                     (
//                                                                         detail,
//                                                                         i
//                                                                     ) => (
//                                                                         <tr
//                                                                             key={
//                                                                                 i
//                                                                             }
//                                                                             style={{
//                                                                                 borderTop:
//                                                                                     '1px solid #edf0f4',
//                                                                             }}
//                                                                         >
//                                                                             <td
//                                                                                 style={{
//                                                                                     padding:
//                                                                                         '7px 10px 7px 42px',
//                                                                                     textAlign:
//                                                                                         'left',
//                                                                                     color:
//                                                                                         '#475569',
//                                                                                 }}
//                                                                             >
//                                                                                 {getValue(
//                                                                                     detail,
//                                                                                     [
//                                                                                         'account_code',
//                                                                                         'accountCode',
//                                                                                         'code',
//                                                                                         'account',
//                                                                                     ]
//                                                                                 ) ??
//                                                                                     '—'}
//                                                                             </td>

//                                                                             <td
//                                                                                 style={{
//                                                                                     padding: 7,
//                                                                                     textAlign:
//                                                                                         'left',
//                                                                                     color:
//                                                                                         '#475569',
//                                                                                 }}
//                                                                             >
//                                                                                 {getValue(
//                                                                                     detail,
//                                                                                     [
//                                                                                         'account_name',
//                                                                                         'accountName',
//                                                                                         'name',
//                                                                                         'particulars',
//                                                                                     ]
//                                                                                 ) ??
//                                                                                     '—'}
//                                                                             </td>

//                                                                             <td
//                                                                                 style={{
//                                                                                     padding: 7,
//                                                                                     textAlign:
//                                                                                         'right',
//                                                                                     color:
//                                                                                         valueColor(
//                                                                                             getPTD(
//                                                                                                 detail
//                                                                                             )
//                                                                                         ),
//                                                                                 }}
//                                                                             >
//                                                                                 {formatTableMoney(
//                                                                                     getPTD(
//                                                                                         detail
//                                                                                     ),
//                                                                                     currency
//                                                                                 )}
//                                                                             </td>

//                                                                             <td
//                                                                                 style={{
//                                                                                     padding: 7,
//                                                                                     textAlign:
//                                                                                         'right',
//                                                                                     color:
//                                                                                         valueColor(
//                                                                                             getYTD(
//                                                                                                 detail
//                                                                                             )
//                                                                                         ),
//                                                                                 }}
//                                                                             >
//                                                                                 {formatTableMoney(
//                                                                                     getYTD(
//                                                                                         detail
//                                                                                     ),
//                                                                                     currency
//                                                                                 )}
//                                                                             </td>
//                                                                         </tr>
//                                                                     )
//                                                                 )}
//                                                             </tbody>
//                                                         </table>
//                                                     </div>
//                                                 ) : (
//                                                     <div
//                                                         style={{
//                                                             padding:
//                                                                 '12px 28px',
//                                                             color:
//                                                                 '#94a3b8',
//                                                             fontSize: 11,
//                                                         }}
//                                                     >
//                                                         No account details
//                                                         returned by backend.
//                                                     </div>
//                                                 )}
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </React.Fragment>
//                             );
//                         }
//                     )}

//                     {rows.length > 0 && (() => {
//                         const totalPTD = sumNumbers(rows.map((row) => getPTD(row)));
//                         const totalTargetPTD = sumNumbers(rows.map((row) => getTargetPTD(row)));
//                         const totalVariancePTD = sumNumbers(rows.map((row) => getVariancePTD(row)));
//                         const totalYTD = sumNumbers(rows.map((row) => getYTD(row)));
//                         const totalTargetYTD = sumNumbers(rows.map((row) => getTargetYTD(row)));
//                         const totalVarianceYTD = sumNumbers(rows.map((row) => getVarianceYTD(row)));
//                         return (
//                             <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
//                                 <td style={{ textAlign: 'center', padding: '9px 3px', borderRight: '1px solid #edf0f4' }} />
//                                 <td style={{ padding: '9px 8px', color: '#182338', fontWeight: 800, borderRight: '1px solid #edf0f4' }}>Total Cost of Sales</td>
//                                 <td style={{ padding: '9px 8px', textAlign: 'right', color: valueColor(totalPTD), borderRight: '1px solid #edf0f4', fontWeight: 800 }}>{formatMoney(totalPTD, currency)}</td>
//                                 <td style={{ padding: '9px 8px', textAlign: 'right', color: valueColor(totalTargetPTD), borderRight: '1px solid #edf0f4', fontWeight: 800 }}>{formatMoney(totalTargetPTD, currency)}</td>
//                                 <td style={{ padding: '9px 8px', textAlign: 'right', color: valueColor(totalVariancePTD), borderRight: '1px solid #edf0f4', fontWeight: 800 }}>{formatMoney(totalVariancePTD, currency)}</td>
//                                 <td style={{ padding: '9px 8px', textAlign: 'right', color: valueColor(totalYTD), borderRight: '1px solid #edf0f4', fontWeight: 800 }}>{formatMoney(totalYTD, currency)}</td>
//                                 <td style={{ padding: '9px 8px', textAlign: 'right', color: valueColor(totalTargetYTD), borderRight: '1px solid #edf0f4', fontWeight: 800 }}>{formatMoney(totalTargetYTD, currency)}</td>
//                                 <td style={{ padding: '9px 8px', textAlign: 'right', color: valueColor(totalVarianceYTD), fontWeight: 800 }}>{formatMoney(totalVarianceYTD, currency)}</td>
//                             </tr>
//                         );
//                     })()}

//                     {!rows.length && (
//                         <tr>
//                             <td
//                                 colSpan={8}
//                                 style={{
//                                     padding: 30,
//                                     textAlign:
//                                         'center',
//                                     color:
//                                         '#94a3b8',
//                                 }}
//                             >
//                                 No data available
//                             </td>
//                         </tr>
//                     )}
//                 </tbody>
//             </table>
//         </div>
//     );
// }


// /* =========================================================
//    MODAL FILTERS
// ========================================================= */

// const getOptionField = (option, keys) => {
//     if (!option || typeof option !== 'object') return null;
//     for (const key of keys) {
//         if (option[key] !== undefined && option[key] !== null) return option[key];
//     }
//     return null;
// };

// const relationValueCandidates = (value) => {
//     if (value === null || value === undefined || value === '') return [];
//     if (Array.isArray(value)) {
//         return value.flatMap(relationValueCandidates);
//     }
//     if (typeof value === 'object') {
//         return [
//             optionValue(value),
//             value.id,
//             value.value,
//             value.code,
//             value.name,
//             value.label,
//         ]
//             .filter((v) => v !== null && v !== undefined && v !== '')
//             .map(String);
//     }
//     return [String(value)];
// };

// const matchesSelectedRelation = (option, selectedValues, keys) => {
//     const selected = asArray(selectedValues)
//         .map(optionValue)
//         .filter((v) => v !== 'All' && v !== 'all' && v !== '');

//     if (!selected.length) return true;

//     const related = getOptionField(option, keys);

//     /*
//      * If the backend supplies the hierarchy relation, filter against it.
//      * When no relation field is present, keep the option rather than
//      * incorrectly hiding valid values.
//      */
//     if (related === null || related === undefined || related === '') {
//         return true;
//     }

//     const relatedValues = relationValueCandidates(related);
//     return relatedValues.some((v) => selected.includes(String(v)));
// };

// const cascadeOptionsByAncestors = ({ options = [], relations = [] }) => {
//     if (!Array.isArray(options)) return [];
//     return options.filter((option) =>
//         relations.every(({ selected, relationKeys }) =>
//             matchesSelectedRelation(option, selected, relationKeys)
//         )
//     );
// };


// function ModalFilters({
//     filters,
//     setFilters,
//     options,
//     onApply,
//     onReset,
//     loading,
// }) {
//     const cascadingOptions = useMemo(() => ({
//         legalGroups: options.legalGroups || [],
//         legalEntities: cascadeOptionsByAncestors({
//             options: options.legalEntities || [],
//             relations: [
//                 {
//                     selected: filters.legalGroupId,
//                     relationKeys: ['legal_group_id', 'legalGroupId', 'legal_group_ids', 'legalGroupIds', 'group_id', 'groupId', 'legal_group', 'legalGroup'],
//                 },
//             ],
//         }),
//         parentDivisions: cascadeOptionsByAncestors({
//             options: options.parentDivisions || [],
//             relations: [
//                 {
//                     selected: filters.legalGroupId,
//                     relationKeys: ['legal_group_id', 'legalGroupId', 'legal_group_ids', 'legalGroupIds', 'group_id', 'groupId', 'legal_group', 'legalGroup'],
//                 },
//                 {
//                     selected: filters.legalEntityId,
//                     relationKeys: ['legal_entity_id', 'legalEntityId', 'legal_entity_ids', 'legalEntityIds', 'entity_id', 'entityId', 'legal_entity', 'legalEntity'],
//                 },
//             ],
//         }),
//         subdivisions: cascadeOptionsByAncestors({
//             options: options.subdivisions || [],
//             relations: [
//                 {
//                     selected: filters.legalGroupId,
//                     relationKeys: ['legal_group_id', 'legalGroupId', 'legal_group_ids', 'legalGroupIds', 'group_id', 'groupId', 'legal_group', 'legalGroup'],
//                 },
//                 {
//                     selected: filters.legalEntityId,
//                     relationKeys: ['legal_entity_id', 'legalEntityId', 'legal_entity_ids', 'legalEntityIds', 'entity_id', 'entityId', 'legal_entity', 'legalEntity'],
//                 },
//                 {
//                     selected: filters.parentDivisionId,
//                     relationKeys: ['parent_division_id', 'parentDivisionId', 'parent_division_ids', 'parentDivisionIds', 'division_id', 'divisionId', 'parent_division', 'parentDivision'],
//                 },
//             ],
//         }),
//     }), [options, filters.legalGroupId, filters.legalEntityId, filters.parentDivisionId]);

//     const updateMulti = (key, value) => {
//         setFilters((prev) => {
//             const next = { ...prev, [key]: value };
//             if (key === 'legalGroupId') {
//                 next.legalEntityId = ['All'];
//                 next.parentDivisionId = ['All'];
//                 next.subdivisionId = ['All'];
//             } else if (key === 'legalEntityId') {
//                 next.parentDivisionId = ['All'];
//                 next.subdivisionId = ['All'];
//             } else if (key === 'parentDivisionId') {
//                 next.subdivisionId = ['All'];
//             }
//             return next;
//         });
//     };


//     const removeChip = (
//         key,
//         item
//     ) => {
//         setFilters((prev) => {
//             const next = asArray(
//                 prev[key]
//             ).filter(
//                 (v) =>
//                     String(v) !==
//                     String(item)
//             );

//             return {
//                 ...prev,
//                 [key]: next.length
//                     ? next
//                     : ['All'],
//             };
//         });
//     };


//     return (
//         <div
//             style={{
//                 padding: '12px 16px',
//                 borderBottom:
//                     '1px solid #e2e8f0',
//                 background:
//                     '#fbfcfe',
//             }}
//         >
//             <div
//                 className="cost-structure-filter-grid"
//                 style={{
//                     display: 'grid',
//                     gridTemplateColumns:
//                         'repeat(8, minmax(105px, 1fr))',
//                     gap: 10,
//                 }}
//             >
//                 <FilterField label="Legal Group">
//                     <CompactMultiSelect
//                         options={
//                             options.legalGroups
//                         }
//                         value={
//                             filters.legalGroupId
//                         }
//                         onChange={(v) =>
//                             updateMulti(
//                                 'legalGroupId',
//                                 v
//                             )
//                         }
//                     />
//                 </FilterField>

//                 <FilterField label="Legal Entity">
//                     <CompactMultiSelect
//                         options={
//                             cascadingOptions.legalEntities
//                         }
//                         value={
//                             filters.legalEntityId
//                         }
//                         onChange={(v) =>
//                             updateMulti(
//                                 'legalEntityId',
//                                 v
//                             )
//                         }
//                     />
//                 </FilterField>

//                 <FilterField label="Parent Division">
//                     <CompactMultiSelect
//                         options={
//                             cascadingOptions.parentDivisions
//                         }
//                         value={
//                             filters.parentDivisionId
//                         }
//                         onChange={(v) =>
//                             updateMulti(
//                                 'parentDivisionId',
//                                 v
//                             )
//                         }
//                     />
//                 </FilterField>

//                 <FilterField label="Sub-Division">
//                     <CompactMultiSelect
//                         options={
//                             cascadingOptions.subdivisions
//                         }
//                         value={
//                             filters.subdivisionId
//                         }
//                         onChange={(v) =>
//                             updateMulti(
//                                 'subdivisionId',
//                                 v
//                             )
//                         }
//                     />
//                 </FilterField>

//                 <FilterField label="Year">
//                     <select
//                         value={
//                             filters.year || ''
//                         }
//                         onChange={(e) =>
//                             setFilters(
//                                 (p) => ({
//                                     ...p,
//                                     year:
//                                         e.target
//                                             .value,
//                                 })
//                             )
//                         }
//                         style={
//                             selectStyle
//                         }
//                     >
//                         {options.years.map(
//                             (y) => (
//                                 <option
//                                     key={optionValue(
//                                         y
//                                     )}
//                                     value={optionValue(
//                                         y
//                                     )}
//                                 >
//                                     {optionLabel(
//                                         y
//                                     )}
//                                 </option>
//                             )
//                         )}
//                     </select>
//                 </FilterField>

//                 <FilterField label="Period">
//                     <select
//                         value={
//                             filters.periodName ||
//                             ''
//                         }
//                         onChange={(e) =>
//                             setFilters(
//                                 (p) => ({
//                                     ...p,
//                                     periodName:
//                                         e.target
//                                             .value,
//                                 })
//                             )
//                         }
//                         style={
//                             selectStyle
//                         }
//                     >
//                         {options.periods.map(
//                             (p) => (
//                                 <option
//                                     key={optionValue(
//                                         p
//                                     )}
//                                     value={optionValue(
//                                         p
//                                     )}
//                                 >
//                                     {optionLabel(
//                                         p
//                                     )}
//                                 </option>
//                             )
//                         )}
//                     </select>
//                 </FilterField>

//                 <FilterField label="Reporting Currency">
//                     <select
//                         value={
//                             filters.currency ||
//                             'AED'
//                         }
//                         onChange={(e) =>
//                             setFilters(
//                                 (p) => ({
//                                     ...p,
//                                     currency:
//                                         e.target
//                                             .value,
//                                 })
//                             )
//                         }
//                         style={
//                             selectStyle
//                         }
//                     >
//                         {options.currencies.map(
//                             (c) => (
//                                 <option
//                                     key={optionValue(
//                                         c
//                                     )}
//                                     value={optionValue(
//                                         c
//                                     )}
//                                 >
//                                     {optionLabel(
//                                         c
//                                     )}
//                                 </option>
//                             )
//                         )}
//                     </select>
//                 </FilterField>

//                 <div
//                     style={{
//                         display: 'flex',
//                         alignItems:
//                             'flex-end',
//                         gap: 7,
//                     }}
//                 >
//                     <button
//                         type="button"
//                         onClick={onApply}
//                         disabled={loading}
//                         style={
//                             applyButtonStyle
//                         }
//                     >
//                         {loading
//                             ? 'Loading…'
//                             : 'Apply'}
//                     </button>

//                     <button
//                         type="button"
//                         onClick={onReset}
//                         disabled={loading}
//                         style={
//                             resetButtonStyle
//                         }
//                     >
//                         Reset
//                     </button>
//                 </div>
//             </div>

//         </div>
//     );
// }


// /* =========================================================
//    BASIC UI
// ========================================================= */

// function FilterField({
//     label,
//     children,
// }) {
//     return (
//         <div
//             style={{
//                 display: 'flex',
//                 flexDirection:
//                     'column',
//                 gap: 4,
//             }}
//         >
//             <span
//                 style={{
//                     fontSize: 11,
//                     color: '#1e3a8a',
//                     fontWeight: 700,
//                 }}
//             >
//                 {label}
//             </span>

//             {children}
//         </div>
//     );
// }


// const selectStyle = {
//     width: '100%',
//     minHeight: 34,
//     padding: '6px 9px',
//     border: `1px solid ${C.border}`,
//     borderRadius: 7,
//     background: '#fff',
//     color: '#334155',
//     fontSize: 13,
//     outline: 'none',
// };


// const applyButtonStyle = {
//     minHeight: 34,
//     padding: '0 15px',
//     border: 0,
//     borderRadius: 7,
//     background: C.primary,
//     color: '#fff',
//     fontSize: 13,
//     fontWeight: 700,
//     cursor: 'pointer',
// };


// const resetButtonStyle = {
//     minHeight: 34,
//     padding: '0 8px',
//     border: 0,
//     background: 'transparent',
//     color: '#64748b',
//     fontSize: 13,
//     fontWeight: 600,
//     cursor: 'pointer',
// };


// function TabButton({
//     active,
//     children,
//     onClick,
// }) {
//     return (
//         <button
//             type="button"
//             onClick={onClick}
//             style={{
//                 border: 0,
//                 borderBottom:
//                     `2px solid ${active
//                         ? C.primary
//                         : 'transparent'
//                     }`,
//                 background:
//                     'transparent',
//                 padding:
//                     '10px 13px',
//                 color: active
//                     ? C.primary
//                     : '#64748b',
//                 fontSize: 13,
//                 fontWeight: active
//                     ? 800
//                     : 600,
//                 cursor: 'pointer',
//             }}
//         >
//             {children}
//         </button>
//     );
// }


// function Modal({
//     children,
//     onClose,
// }) {
//     const bodyRef = useRef(null);
//     const overlayRef = useRef(null);

//     useEffect(() => {
//         const handler = (e) => {
//             if (e.key === 'Escape') {
//                 onClose();
//             }
//         };

//         document.addEventListener(
//             'keydown',
//             handler
//         );

//         const prevOverflow =
//             document.body.style.overflow;

//         document.body.style.overflow =
//             'hidden';

//         if (overlayRef.current) {
//             overlayRef.current.scrollTop = 0;
//         }

//         if (bodyRef.current) {
//             bodyRef.current.scrollTop = 0;
//         }

//         return () => {
//             document.removeEventListener(
//                 'keydown',
//                 handler
//             );

//             document.body.style.overflow =
//                 prevOverflow;
//         };
//     }, [onClose]);

//     const modalContent = (
//         <div
//             ref={overlayRef}
//             onClick={(e) => {
//                 if (
//                     e.target ===
//                     e.currentTarget
//                 ) {
//                     onClose();
//                 }
//             }}
//             style={{
//                 position: 'fixed',
//                 inset: 0,
//                 background:
//                     'rgba(15,23,42,0.45)',
//                 backdropFilter:
//                     'blur(6px)',
//                 WebkitBackdropFilter:
//                     'blur(6px)',
//                 display: 'flex',
//                 alignItems:
//                     'flex-start',
//                 justifyContent:
//                     'center',
//                 padding: 0,
//                 overflowY: 'auto',
//                 minHeight: '100vh',
//                 zIndex: 99999,
//                 animation:
//                     'fadeIn 0.18s ease',
//                 boxSizing: 'border-box',
//             }}
//         >
//             <div
//                 style={{
//                     background: '#fff',
//                     borderRadius: 0,
//                     width: '98%',
//                     maxWidth: 1500,
//                     height: '90vh',
//                     maxHeight: '90vh',
//                     minHeight: 0,
//                     display: 'flex',
//                     flexDirection:
//                         'column',
//                     boxShadow:
//                         '0 24px 48px rgba(0,0,0,0.18)',
//                     animation:
//                         'modalPop 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards',
//                     overflow: 'hidden',
//                     border:
//                         '1px solid #e2e8f0',
//                     marginTop: '5vh',
//                     flexShrink: 0,
//                     boxSizing: 'border-box',
//                 }}
//             >
//                 {/* Modal Body */}
//                 <div
//                     ref={bodyRef}
//                     style={{
//                         flex: '1 1 auto',
//                         minHeight: 0,
//                         minWidth: 0,
//                         overflowY: 'auto',
//                         overflowX: 'auto',
//                         WebkitOverflowScrolling: 'touch',
//                         boxSizing: 'border-box',
//                     }}
//                 >
//                     {children}
//                 </div>
//             </div>
//         </div>
//     );

//     return typeof document !==
//         'undefined'
//         ? createPortal(
//             modalContent,
//             document.body
//         )
//         : modalContent;
// }


// /* =========================================================
//    VIEW ALL CONTENT
// ========================================================= */

// function ViewAllContent({
//     tab,
//     setTab,
//     filters,
//     setFilters,
//     options,
//     loading,
//     classification,
//     breakdown,
//     monthly,
//     expanded,
//     detailMap,
//     detailLoading,
//     onExpand,
//     onApply,
//     onReset,
//     onExport,
//     exporting,
//     currency,
// }) {
//     const classificationRows =
//         unwrapRows(
//             classification
//         );

//     const monthlyRows =
//         unwrapRows(monthly);

//     const breakdownRows =
//         unwrapRows(breakdown);


//     const classificationPeriodRows =
//         normalizeCategoryMonthlyRows(classificationRows);

//     const monthlyPeriodRows =
//         normalizeDirectCostMonthlyRows(monthlyRows);

//     /*
//      * Both monthly endpoints can be period-oriented or category-oriented.
//      * Normalize them into one consistent period -> category shape before
//      * rendering, so the UI always matches the backend response.
//      */
//     const chartRows =
//         monthlyPeriodRows.length
//             ? monthlyPeriodRows
//             : classificationPeriodRows;

//     const modalSummary = normalizeSummary(
//         classification,
//         breakdown,
//         currency,
//         filters?.periodName || ''
//     );


//     return (
//         <div
//             style={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 flex: '1 1 auto',
//                 minHeight: 0,
//                 height: '100%',
//                 minHeight: '100%',
//                 overflow: 'hidden',
//                 boxSizing: 'border-box',
//             }}
//         >
//             <ModalFilters
//                 filters={filters}
//                 setFilters={
//                     setFilters
//                 }
//                 options={options}
//                 onApply={onApply}
//                 onReset={onReset}
//                 loading={loading}
//             />

//             <div
//                 style={{
//                     display: 'grid',
//                     gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
//                     gap: 12,
//                     padding: '12px 16px 10px',
//                     background: '#fff',
//                 }}
//                 className="cost-structure-summary-grid"
//             ><ViewAllCostCard
//                     title="Cost of Material"
//                     ptd={modalSummary.material.ptd}
//                     ytd={modalSummary.material.ytd}
//                     color="#8ddfd0"
//                     bg="#f5fdfb"
//                     icon={Package}
//                     loading={loading}
//                     currency={currency}
//                 />

//                 <ViewAllCostCard
//                     title="Direct Expenses"
//                     ptd={modalSummary.direct.ptd}
//                     ytd={modalSummary.direct.ytd}
//                     color="#b49bea"
//                     bg="#faf8ff"
//                     icon={BarChart3}
//                     loading={loading}
//                     currency={currency}
//                 />

//                 <ViewAllCostCard
//                     title="Operating Expenses"
//                     ptd={modalSummary.operating.ptd}
//                     ytd={modalSummary.operating.ytd}
//                     color="#f5bd8b"
//                     bg="#fffaf5"
//                     icon={ShoppingBag}
//                     loading={loading}
//                     currency={currency}
//                 />
//             </div>

//             <div
//                 style={{
//                     display: 'flex',
//                     alignItems:
//                         'center',
//                     justifyContent:
//                         'space-between',
//                     borderBottom:
//                         '1px solid #e2e8f0',
//                     padding:
//                         '0 16px',
//                 }}
//             >
//                 <div
//                     style={{
//                         display: 'flex',
//                         gap: 3,
//                     }}
//                 >
//                     <TabButton
//                         active={
//                             tab ===
//                             'classification'
//                         }
//                         onClick={() =>
//                             setTab(
//                                 'classification'
//                             )
//                         }
//                     >
//                         Cost Classification
//                     </TabButton>

//                     <TabButton
//                         active={
//                             tab ===
//                             'breakdown'
//                         }
//                         onClick={() =>
//                             setTab(
//                                 'breakdown'
//                             )
//                         }
//                     >
//                         Direct Cost Drill-Down
//                     </TabButton>

//                     <TabButton
//                         active={
//                             tab ===
//                             'monthly'
//                         }
//                         onClick={() =>
//                             setTab(
//                                 'monthly'
//                             )
//                         }
//                     >
//                         Month-on-Month
//                     </TabButton>
//                 </div>

//                 <div
//                     style={{
//                         display: 'flex',
//                         gap: 6,
//                     }}
//                 >
//                     <button
//                         type="button"
//                         onClick={() =>
//                             onExport(
//                                 'excel'
//                             )
//                         }
//                         disabled={
//                             !!exporting
//                         }
//                         style={exportButton(
//                             '#f1fbf8',
//                             '#168f7a',
//                             '#dcefe9'
//                         )}
//                     >
//                         <FileSpreadsheet
//                             size={14}
//                         />
//                         Excel
//                     </button>

//                     <button
//                         type="button"
//                         onClick={() =>
//                             onExport(
//                                 'pdf'
//                             )
//                         }
//                         disabled={
//                             !!exporting
//                         }
//                         style={exportButton(
//                             '#fff3f5',
//                             '#d34b68',
//                             '#f4dce1'
//                         )}
//                     >
//                         <FileText
//                             size={14}
//                         />
//                         PDF
//                     </button>
//                 </div>
//             </div>

//             <div
//                 style={{
//                     overflowX: 'auto',
//                     overflowY: 'visible',
//                     padding: 16,
//                     boxSizing: 'border-box',
//                     minWidth: 0,
//                 }}
//             >
//                 {loading ? (
//                     <div
//                         style={{
//                             padding: 60,
//                             textAlign:
//                                 'center',
//                             color:
//                                 '#64748b',
//                             fontSize: 13,
//                         }}
//                     >
//                         Loading cost structure data…
//                     </div>
//                 ) : tab ===
//                     'classification' ? (
//                     <ClassificationTab
//                         rows={
//                             classificationPeriodRows
//                         }
//                         currency={
//                             currency
//                         }
//                     />
//                 ) : tab ===
//                     'breakdown' ? (
//                     <DirectCostTable
//                         rows={
//                             breakdownRows
//                         }
//                         currency={
//                             currency
//                         }
//                         expanded={
//                             expanded
//                         }
//                         details={
//                             detailMap
//                         }
//                         loadingDetails={
//                             detailLoading
//                         }
//                         onExpand={
//                             onExpand
//                         }
//                     />
//                 ) : (
//                     <MonthlyTab
//                         rows={
//                             chartRows
//                         }
//                         chartRows={
//                             chartRows
//                         }
//                         currency={
//                             currency
//                         }
//                     />
//                 )}
//             </div>
//         </div>
//     );
// }


// /* =========================================================
//    CLASSIFICATION TAB
// ========================================================= */

// function ClassificationTab({
//     rows,
//     currency,
// }) {
//     return (
//         <div
//             style={{
//                 minHeight: '100%',
//                 boxSizing: 'border-box',
//             }}
//         >
//             <div
//                 style={{
//                     fontSize: 14,
//                     fontWeight: 800,
//                     color: C.navy,
//                     marginBottom: 10,
//                 }}
//             >
//                 Cost Classification
//             </div>

//             <div
//                 style={{
//                     overflowX: 'auto',
//                 }}
//             >
//                 <table
//                     className="cost-structure-table"
//                     style={{
//                         width: '100%',
//                         borderCollapse:
//                             'collapse',
//                         fontSize: 12,
//                     }}
//                 >
//                     <thead>
//                         <tr
//                             style={{
//                                 background:
//                                     '#fff',
//                             }}
//                         >
//                             <th
//                                 style={
//                                     modalThLeft
//                                 }
//                             >
//                                 Period
//                             </th>

//                             <th
//                                 style={
//                                     modalTh
//                                 }
//                             >
//                                 Cost of Material
//                             </th>

//                             <th
//                                 style={
//                                     modalTh
//                                 }
//                                 title="Direct Expenses includes Direct Labour, Manufacturing/Direct Overheads, Overhead Absorption and Direct Expenses–RKME."
//                             >
//                                 Direct Expenses
//                             </th>

//                             <th
//                                 style={
//                                     modalTh
//                                 }
//                             >
//                                 Operating Expenses
//                             </th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {rows.map(
//                             (
//                                 row,
//                                 i
//                             ) => (
//                                 <tr
//                                     key={
//                                         i
//                                     }
//                                 >
//                                     <td
//                                         style={
//                                             modalTdLeft
//                                         }
//                                     >
//                                         {getPeriod(
//                                             row
//                                         )}
//                                     </td>

//                                     <td
//                                         style={{
//                                             ...modalTd,
//                                             color: valueColor(
//                                                 getValue(
//                                                     row,
//                                                     [
//                                                         'cost_of_material',
//                                                         'cost_of_material_ptd',
//                                                         'material',
//                                                         'material_ptd',
//                                                     ]
//                                                 )
//                                             ),
//                                         }}
//                                     >
//                                         {formatTableMoney(
//                                             getValue(
//                                                 row,
//                                                 [
//                                                     'cost_of_material',
//                                                     'cost_of_material_ptd',
//                                                     'material',
//                                                     'material_ptd',
//                                                 ]
//                                             )
//                                         )}
//                                     </td>

//                                     <td
//                                         style={{
//                                             ...modalTd,
//                                             color: valueColor(
//                                                 getValue(
//                                                     row,
//                                                     [
//                                                         'direct_expenses',
//                                                         'direct_expenses_ptd',
//                                                         'direct',
//                                                         'direct_ptd',
//                                                     ]
//                                                 )
//                                             ),
//                                         }}
//                                     >
//                                         {formatTableMoney(
//                                             getValue(
//                                                 row,
//                                                 [
//                                                     'direct_expenses',
//                                                     'direct_expenses_ptd',
//                                                     'direct',
//                                                     'direct_ptd',
//                                                 ]
//                                             )
//                                         )}
//                                     </td>

//                                     <td
//                                         style={{
//                                             ...modalTd,
//                                             color: valueColor(
//                                                 getValue(
//                                                     row,
//                                                     [
//                                                         'operating_expenses',
//                                                         'operating_expenses_ptd',
//                                                         'operating',
//                                                         'operating_ptd',
//                                                     ]
//                                                 )
//                                             ),
//                                         }}
//                                     >
//                                         {formatTableMoney(
//                                             getValue(
//                                                 row,
//                                                 [
//                                                     'operating_expenses',
//                                                     'operating_expenses_ptd',
//                                                     'operating',
//                                                     'operating_ptd',
//                                                 ]
//                                             )
//                                         )}
//                                     </td>
//                                 </tr>
//                             )
//                         )}

//                         {rows.length > 0 && (() => {
//                             const totalMaterial = sumNumbers(rows.map((row) => getValue(row, ['cost_of_material', 'cost_of_material_ptd', 'material', 'material_ptd'])));
//                             const totalDirect = sumNumbers(rows.map((row) => getValue(row, ['direct_expenses', 'direct_expenses_ptd', 'direct', 'direct_ptd'])));
//                             const totalOperating = sumNumbers(rows.map((row) => getValue(row, ['operating_expenses', 'operating_expenses_ptd', 'operating', 'operating_ptd'])));
//                             return (
//                                 <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
//                                     <td style={{ ...modalTdLeft, fontWeight: 800 }}>Total</td>
//                                     <td style={{ ...modalTd, fontWeight: 800, color: valueColor(totalMaterial) }}>{formatTableMoney(totalMaterial)}</td>
//                                     <td style={{ ...modalTd, fontWeight: 800, color: valueColor(totalDirect) }}>{formatTableMoney(totalDirect)}</td>
//                                     <td style={{ ...modalTd, fontWeight: 800, color: valueColor(totalOperating) }}>{formatTableMoney(totalOperating)}</td>
//                                 </tr>
//                             );
//                         })()}

//                         {!rows.length && (
//                             <tr>
//                                 <td
//                                     colSpan={
//                                         4
//                                     }
//                                     style={{
//                                         padding: 30,
//                                         textAlign:
//                                             'center',
//                                         color:
//                                             '#94a3b8',
//                                     }}
//                                 >
//                                     No data available
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }


// /* =========================================================
//    MONTHLY TAB
// ========================================================= */

// function MonthlyTab({
//     rows,
//     chartRows,
//     currency,
// }) {
//     return (
//         <div>
//             <div
//                 style={{
//                     fontSize: 14,
//                     fontWeight: 800,
//                     color: C.navy,
//                     marginBottom: 10,
//                 }}
//             >
//                 Month-on-Month Cost Classification
//             </div>

//             <div
//                 className="cost-structure-chart"
//                 style={{
//                     height: 'clamp(280px, 42vh, 420px)',
//                     minHeight: 300,
//                     marginBottom: 16,
//                 }}
//             >
//                 {chartRows.length ? (
//                     <ResponsiveContainer
//                         width="100%"
//                         height="100%"
//                     >
//                         <LineChart
//                             data={
//                                 chartRows
//                             }
//                             margin={{
//                                 top: 10,
//                                 right: 20,
//                                 left: 0,
//                                 bottom: 8,
//                             }}
//                         >
//                             <CartesianGrid
//                                 strokeDasharray="3 3"
//                                 vertical={
//                                     false
//                                 }
//                             />

//                             <XAxis
//                                 dataKey="period"
//                                 tick={{
//                                     fontSize: 13,
//                                 }}
//                             />

//                             <YAxis
//                                 tick={{
//                                     fontSize: 13,
//                                 }}
//                                 tickFormatter={(
//                                     v
//                                 ) =>
//                                     `${(
//                                         Number(
//                                             v
//                                         ) /
//                                         1000000
//                                     ).toFixed(
//                                         0
//                                     )}M`
//                                 }
//                             />

//                             <Tooltip
//                                 formatter={(
//                                     value
//                                 ) =>
//                                     formatMoney(
//                                         value,
//                                         currency
//                                     )
//                                 }
//                             />

//                             <Legend
//                                 wrapperStyle={{
//                                     fontSize: 13,
//                                 }}
//                             />

//                             <Line
//                                 type="monotone"
//                                 dataKey="material"
//                                 name="Cost of Material"
//                                 stroke="#19b99d"
//                                 strokeWidth={2}
//                                 dot={{ r: 3 }}
//                                 activeDot={{ r: 5 }}
//                                 connectNulls
//                             />

//                             <Line
//                                 type="monotone"
//                                 dataKey="labour"
//                                 name="Direct Labour"
//                                 stroke="#7040dc"
//                                 strokeWidth={2}
//                                 dot={{ r: 3 }}
//                                 activeDot={{ r: 5 }}
//                                 connectNulls
//                             />

//                             <Line
//                                 type="monotone"
//                                 dataKey="manufacturing"
//                                 name="Manufacturing / Direct Overheads"
//                                 stroke="#8b5cf6"
//                                 strokeWidth={2}
//                                 dot={{ r: 3 }}
//                                 activeDot={{ r: 5 }}
//                                 connectNulls
//                             />

//                             <Line
//                                 type="monotone"
//                                 dataKey="absorption"
//                                 name="Overhead Absorption"
//                                 stroke="#f59e0b"
//                                 strokeWidth={2}
//                                 dot={{ r: 3 }}
//                                 activeDot={{ r: 5 }}
//                                 connectNulls
//                             />

//                             <Line
//                                 type="monotone"
//                                 dataKey="rkme"
//                                 name="Direct Expenses - RKME"
//                                 stroke="#f47d20"
//                                 strokeWidth={2}
//                                 dot={{ r: 3 }}
//                                 activeDot={{ r: 5 }}
//                                 connectNulls
//                             />
//                         </LineChart>
//                     </ResponsiveContainer>
//                 ) : (
//                     <div
//                         style={{
//                             height: '100%',
//                             display: 'flex',
//                             alignItems:
//                                 'center',
//                             justifyContent:
//                                 'center',
//                             color:
//                                 '#94a3b8',
//                         }}
//                     >
//                         No data available
//                     </div>
//                 )}
//             </div>

//             <div
//                 style={{
//                     overflowX: 'auto',
//                 }}
//             >
//                 <table
//                     className="cost-structure-table"
//                     style={{
//                         width: '100%',
//                         borderCollapse:
//                             'collapse',
//                         fontSize: 13,
//                     }}
//                 >
//                     <thead>
//                         <tr
//                             style={{
//                                 background:
//                                     '#fff',
//                             }}
//                         >
//                             <th
//                                 style={
//                                     modalThLeft
//                                 }
//                             >
//                                 Period
//                             </th>

//                             <th style={modalTh}>Cost of Material</th>
//                             <th style={modalTh}>Direct Labour</th>
//                             <th style={modalTh}>Manufacturing / Direct Overheads</th>
//                             <th style={modalTh}>Overhead Absorption</th>
//                             <th style={modalTh}>Direct Expenses - RKME</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {rows.map(
//                             (
//                                 row,
//                                 i
//                             ) => (
//                                 <tr
//                                     key={
//                                         i
//                                     }
//                                 >
//                                     <td
//                                         style={
//                                             modalTdLeft
//                                         }
//                                     >
//                                         {getPeriod(
//                                             row
//                                         )}
//                                     </td>

//                                     <td style={{ ...modalTd, color: valueColor(row.material) }}>{formatTableMoney(row.material)}</td>
//                                     <td style={{ ...modalTd, color: valueColor(row.labour) }}>{formatTableMoney(row.labour)}</td>
//                                     <td style={{ ...modalTd, color: valueColor(row.manufacturing) }}>{formatTableMoney(row.manufacturing)}</td>
//                                     <td style={{ ...modalTd, color: valueColor(row.absorption) }}>{formatTableMoney(row.absorption)}</td>
//                                     <td style={{ ...modalTd, color: valueColor(row.rkme) }}>{formatTableMoney(row.rkme)}</td>
//                                 </tr>
//                             )
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }


// /* ===================ABLE STYLES
// ========================================================= */

// const modalTh = {
//     padding: '8px 10px',
//     textAlign: 'right',
//     color: '#173b68',
//     background: '#fff',
//     fontWeight: 700,
//     borderBottom:
//         '1px solid #e2e8f0',
//     whiteSpace: 'nowrap',
// };


// const modalThLeft = {
//     ...modalTh,
//     textAlign: 'left',
// };


// const modalTd = {
//     padding: '8px 10px',
//     textAlign: 'right',
//     color: '#334155',
//     borderBottom:
//         '1px solid #f1f5f9',
//     whiteSpace: 'nowrap',
// };


// const modalTdLeft = {
//     ...modalTd,
//     textAlign: 'left',
// };


// const exportButton = (
//     background,
//     color,
//     border
// ) => ({
//     height: 31,
//     padding: '0 11px',
//     borderRadius: 7,
//     border: `1px solid ${border}`,
//     background,
//     color,
//     fontSize: 12,
//     fontWeight: 700,
//     display: 'inline-flex',
//     alignItems: 'center',
//     gap: 5,
//     cursor: 'pointer',
// });


// /* =========================================================
//    SUMMARY NORMALIZATION
// ========================================================= */

// function normalizeSummary(
//     classification,
//     breakdown,
//     currency,
//     periodName = ''
// ) {
//     /*
//      * The cost-classification-monthly backend response is shaped like:
//      *
//      * {
//      *   category: "Cost of Material",
//      *   monthly_actual: { "Jan-26": "56057542.41" },
//      *   actual_ytd: "56057542.41",
//      *   monthly_target: { "Jan-26": null },
//      *   target_ytd: null
//      * }
//      *
//      * IMPORTANT:
//      * Do not read PTD from `actual_ptd` here because that field does
//      * not exist in this response. PTD must come from monthly_actual
//      * for the currently selected period.
//      *
//      * Also, do not use the last row as a fallback for a different
//      * category. That can make one KPI display another category's value.
//      */

//     const classRows = unwrapRows(classification);

//     const findCategory = (name) =>
//         classRows.find(
//             (row) =>
//                 getLabel(row).trim().toLowerCase() ===
//                 name.toLowerCase()
//         );

//     const getMonthlyValue = (row, objectKeys, directKeys = []) => {
//         if (!row || typeof row !== 'object') {
//             return null;
//         }

//         for (const key of objectKeys) {
//             const monthly = row[key];

//             if (
//                 monthly &&
//                 typeof monthly === 'object' &&
//                 !Array.isArray(monthly)
//             ) {
//                 /*
//                  * Prefer the selected period. If the selected period
//                  * is not present (for example during initial loading),
//                  * use the first available month from the backend
//                  * response rather than returning a wrong category value.
//                  */
//                 if (
//                     periodName &&
//                     Object.prototype.hasOwnProperty.call(
//                         monthly,
//                         periodName
//                     )
//                 ) {
//                     return monthly[periodName];
//                 }

//                 const availablePeriods = Object.keys(monthly);

//                 if (availablePeriods.length) {
//                     return monthly[availablePeriods[0]];
//                 }
//             }
//         }

//         return getValue(row, directKeys);
//     };

//     const getTargetMonthlyValue = (row) => {
//         if (!row || typeof row !== 'object') {
//             return null;
//         }

//         const monthlyTarget = row.monthly_target;

//         if (
//             monthlyTarget &&
//             typeof monthlyTarget === 'object' &&
//             !Array.isArray(monthlyTarget)
//         ) {
//             if (
//                 periodName &&
//                 Object.prototype.hasOwnProperty.call(
//                     monthlyTarget,
//                     periodName
//                 )
//             ) {
//                 return monthlyTarget[periodName];
//             }

//             const availablePeriods = Object.keys(monthlyTarget);

//             if (availablePeriods.length) {
//                 return monthlyTarget[availablePeriods[0]];
//             }
//         }

//         return getValue(row, [
//             'target_ptd',
//             'target_period',
//             'target',
//         ]);
//     };

//     const buildCategory = (name) => {
//         const row = findCategory(name);

//         if (!row) {
//             return {
//                 ptd: null,
//                 ytd: null,
//                 target: null,
//             };
//         }

//         return {
//             ptd: getMonthlyValue(
//                 row,
//                 [
//                     'monthly_actual',
//                     'monthly_actual_aed',
//                 ],
//                 [
//                     'actual_ptd',
//                     'actual_ptd_aed',
//                     'current_ptd',
//                     'current_ptd_aed',
//                     'ptd',
//                     'ptd_value',
//                     'value',
//                     'amount',
//                 ]
//             ),

//             ytd: getValue(row, [
//                 'actual_ytd',
//                 'actual_ytd_aed',
//                 'current_ytd',
//                 'current_ytd_aed',
//                 'ytd',
//                 'ytd_value',
//                 'ytd_aed',
//             ]),

//             target: getTargetMonthlyValue(row),
//         };
//     };

//     return {
//         material: buildCategory('Cost of Material'),

//         direct: buildCategory('Direct Expenses'),

//         operating: buildCategory('Operating Expenses'),

//         currency,
//     };
// }



// /* =========================================================
//    MAIN COMPONENT
// ========================================================= */

// export default function CostStructureAnalysis({
//     filters = {},
//     filterOptions = {},
//     onToast,
// }) {
//     const [
//         classification,
//         setClassification,
//     ] = useState(null);

//     const [
//         breakdown,
//         setBreakdown,
//     ] = useState(null);

//     const [
//         monthly,
//         setMonthly,
//     ] = useState(null);

//     const [
//         modalClassification,
//         setModalClassification,
//     ] = useState(null);

//     const [
//         modalBreakdown,
//         setModalBreakdown,
//     ] = useState(null);

//     const [
//         modalMonthly,
//         setModalMonthly,
//     ] = useState(null);

//     const [
//         loading,
//         setLoading,
//     ] = useState(true);

//     const [
//         error,
//         setError,
//     ] = useState(null);

//     const [
//         modalOpen,
//         setModalOpen,
//     ] = useState(false);

//     const [
//         actionMenuOpen,
//         setActionMenuOpen,
//     ] = useState(false);

//     const [
//         modalTab,
//         setModalTab,
//     ] = useState(
//         'classification'
//     );

//     const [
//         modalFilters,
//         setModalFilters,
//     ] = useState(null);

//     const [
//         modalOptions,
//         setModalOptions,
//     ] = useState(emptyOptions);

//     const [
//         modalLoading,
//         setModalLoading,
//     ] = useState(false);

//     const [
//         detailMap,
//         setDetailMap,
//     ] = useState({});

//     const [
//         detailLoading,
//         setDetailLoading,
//     ] = useState({});

//     const [
//         expanded,
//         setExpanded,
//     ] = useState({});

//     const [
//         mainDetailMap,
//         setMainDetailMap,
//     ] = useState({});

//     const [
//         mainDetailLoading,
//         setMainDetailLoading,
//     ] = useState({});

//     const [
//         mainExpanded,
//         setMainExpanded,
//     ] = useState({});

//     const [
//         exporting,
//         setExporting,
//     ] = useState(null);


//     /* =====================================================
//        BASE FILTERS
//     ===================================================== */

//     const baseFilters = useMemo(
//         () => ({
//             legalGroupId:
//                 asArray(
//                     filters.legalGroupId
//                 ).length
//                     ? [
//                         ...asArray(
//                             filters.legalGroupId
//                         ),
//                     ]
//                     : ['All'],

//             legalEntityId:
//                 asArray(
//                     filters.legalEntityId
//                 ).length
//                     ? [
//                         ...asArray(
//                             filters.legalEntityId
//                         ),
//                     ]
//                     : ['All'],

//             parentDivisionId:
//                 asArray(
//                     filters.parentDivisionId
//                 ).length
//                     ? [
//                         ...asArray(
//                             filters.parentDivisionId
//                         ),
//                     ]
//                     : ['All'],

//             subdivisionId:
//                 asArray(
//                     filters.subdivisionId
//                 ).length
//                     ? [
//                         ...asArray(
//                             filters.subdivisionId
//                         ),
//                     ]
//                     : ['All'],

//             year:
//                 filters.year || '',

//             /*
//              * Backend requires period_name for both
//              * cost-classification-monthly and
//              * direct-cost-breakdown.
//              *
//              * Keep the selected page filter when available.
//              * During the first render, fall back to the first
//              * period supplied by the backend filter options.
//              * Do not call the APIs with an empty period.
//              */
//             periodName:
//                 filters.periodName ||
//                 optionValue(
//                     filterOptions?.periods?.[0] ??
//                     ''
//                 ),

//             currency:
//                 filters.currency ||
//                 optionValue(
//                     filterOptions?.currencies?.[0] ??
//                     'AED'
//                 ),
//         }),
//         [filters, filterOptions]
//     );


//     /* =====================================================
//        LOAD MAIN DATA
//     ===================================================== */

//     const loadMain =
//         useCallback(
//             async () => {
//                 /*
//                  * Both backend endpoints require period_name.
//                  * The parent P&L filters may be empty for the first
//                  * render while filter-options are still loading.
//                  * Skip that render instead of sending:
//                  *   ?currency=AED
//                  */
//                 if (!baseFilters.periodName) {
//                     setLoading(false);
//                     return;
//                 }

//                 setLoading(true);
//                 setError(null);

//                 try {
//                     const [
//                         classificationResult,
//                         breakdownResult,
//                     ] =
//                         await Promise.all([
//                             fetchPLCostClassificationMonthly(
//                                 baseFilters
//                             ),

//                             fetchPLDirectCostBreakdown(
//                                 baseFilters
//                             ),
//                         ]);

//                     setClassification(
//                         classificationResult
//                     );

//                     setBreakdown(
//                         breakdownResult
//                     );

//                     /*
//                      * Monthly chart uses the same
//                      * backend cost-classification
//                      * monthly response.
//                      */
//                     setMonthly(
//                         classificationResult
//                     );
//                 } catch (err) {
//                     console.error(
//                         '[CostStructureAnalysis] load failed:',
//                         err
//                     );

//                     setError(
//                         err?.message ||
//                         'Failed to load Cost Structure Analysis.'
//                     );
//                 } finally {
//                     setLoading(false);
//                 }
//             },
//             [baseFilters]
//         );


//     useEffect(() => {
//         loadMain();
//     }, [loadMain]);


//     /* =====================================================
//        LOAD VIEW ALL DATA
//     ===================================================== */

//     const loadModal =
//         useCallback(
//             async (
//                 nextFilters
//             ) => {
//                 /*
//                  * Do not hit the backend until a period is available.
//                  * Both classification and direct-cost breakdown require
//                  * period_name.
//                  */
//                 if (!nextFilters?.periodName) {
//                     setModalLoading(false);
//                     return;
//                 }

//                 setModalLoading(
//                     true
//                 );

//                 try {
//                     const [
//                         classificationResult,
//                         breakdownResult,
//                         monthlyResult,
//                     ] =
//                         await Promise.all([
//                             fetchPLCostClassificationMonthly(
//                                 nextFilters
//                             ),

//                             fetchPLDirectCostBreakdown(
//                                 nextFilters
//                             ),

//                             fetchPLDirectCostMonthly(
//                                 nextFilters
//                             ),
//                         ]);

//                     setModalClassification(
//                         classificationResult
//                     );

//                     setModalBreakdown(
//                         breakdownResult
//                     );

//                     setModalMonthly(
//                         monthlyResult
//                     );
//                 } catch (err) {
//                     onToast?.(
//                         err?.message ||
//                         'Failed to load Cost Structure Analysis View All.',
//                         'error'
//                     );
//                 } finally {
//                     setModalLoading(
//                         false
//                     );
//                 }
//             },
//             [onToast]
//         );


//     /* =====================================================
//        OPEN VIEW ALL
//     ===================================================== */

//     const openViewAll =
//         useCallback(
//             async () => {
//                 const initial = {
//                     legalGroupId:
//                         asArray(
//                             baseFilters.legalGroupId
//                         ).length
//                             ? [
//                                 ...asArray(
//                                     baseFilters.legalGroupId
//                                 ),
//                             ]
//                             : ['All'],

//                     legalEntityId:
//                         asArray(
//                             baseFilters.legalEntityId
//                         ).length
//                             ? [
//                                 ...asArray(
//                                     baseFilters.legalEntityId
//                                 ),
//                             ]
//                             : ['All'],

//                     parentDivisionId:
//                         asArray(
//                             baseFilters.parentDivisionId
//                         ).length
//                             ? [
//                                 ...asArray(
//                                     baseFilters.parentDivisionId
//                                 ),
//                             ]
//                             : ['All'],

//                     subdivisionId:
//                         asArray(
//                             baseFilters.subdivisionId
//                         ).length
//                             ? [
//                                 ...asArray(
//                                     baseFilters.subdivisionId
//                                 ),
//                             ]
//                             : ['All'],

//                     year:
//                         baseFilters.year ||
//                         optionValue(
//                             filterOptions
//                                 .years?.[0] ??
//                             ''
//                         ),

//                     periodName:
//                         baseFilters.periodName ||
//                         optionValue(
//                             filterOptions
//                                 .periods?.[0] ??
//                             ''
//                         ),

//                     currency:
//                         baseFilters.currency ||
//                         optionValue(
//                             filterOptions
//                                 .currencies?.[0] ??
//                             'AED'
//                         ),
//                 };


//                 /*
//                  * Use the filter options already
//                  * supplied by the P&L page.
//                  *
//                  * No undefined fetchPLFilters()
//                  * call is required here.
//                  */
//                 const options = {
//                     legalGroups:
//                         filterOptions
//                             .legalGroups ||
//                         [],

//                     legalEntities:
//                         filterOptions
//                             .legalEntities ||
//                         [],

//                     parentDivisions:
//                         filterOptions
//                             .parentDivisions ||
//                         [],

//                     subdivisions:
//                         filterOptions
//                             .subdivisions ||
//                         [],

//                     years:
//                         filterOptions
//                             .years ||
//                         [],

//                     periods:
//                         filterOptions
//                             .periods ||
//                         [],

//                     currencies:
//                         filterOptions
//                             .currencies
//                             ?.length
//                             ? filterOptions.currencies
//                             : ['AED'],
//                 };


//                 setModalOptions(
//                     options
//                 );

//                 setModalFilters(
//                     initial
//                 );

//                 setModalTab(
//                     'classification'
//                 );

//                 setExpanded({});

//                 setDetailMap({});

//                 setDetailLoading({});

//                 setModalOpen(true);

//                 await loadModal(
//                     initial
//                 );
//             },
//             [
//                 baseFilters,
//                 filterOptions,
//                 loadModal,
//             ]
//         );


//     /* =====================================================
//        APPLY MODAL FILTERS
//     ===================================================== */

//     const applyModal =
//         useCallback(() => {
//             if (
//                 modalFilters
//             ) {
//                 loadModal(
//                     modalFilters
//                 );
//             }
//         }, [
//             modalFilters,
//             loadModal,
//         ]);


//     /* =====================================================
//        RESET MODAL FILTERS
//     ===================================================== */

//     const resetModal =
//         useCallback(() => {
//             const reset = {
//                 legalGroupId: [
//                     ...asArray(
//                         baseFilters.legalGroupId
//                     ),
//                 ],

//                 legalEntityId: [
//                     ...asArray(
//                         baseFilters.legalEntityId
//                     ),
//                 ],

//                 parentDivisionId: [
//                     ...asArray(
//                         baseFilters.parentDivisionId
//                     ),
//                 ],

//                 subdivisionId: [
//                     ...asArray(
//                         baseFilters.subdivisionId
//                     ),
//                 ],

//                 year:
//                     baseFilters.year ||
//                     optionValue(
//                         modalOptions
//                             .years?.[0] ??
//                         ''
//                     ),

//                 periodName:
//                     baseFilters.periodName ||
//                     optionValue(
//                         modalOptions
//                             .periods?.[0] ??
//                         ''
//                     ),

//                 currency:
//                     baseFilters.currency ||
//                     'AED',
//             };


//             setModalFilters(
//                 reset
//             );

//             setExpanded({});

//             setDetailMap({});

//             setDetailLoading({});

//             loadModal(reset);
//         }, [
//             baseFilters,
//             modalOptions,
//             loadModal,
//         ]);


//     /* =====================================================
//        MAIN TABLE EXPAND
//        IMPORTANT:
//        fetchPLDirectCostDetail(filters, category)
//     ===================================================== */

//     /* =====================================================
//        EXPORT HELPER
//        Defined before any callback that references it to avoid
//        temporal-dead-zone initialization errors.
//     ===================================================== */

//     const downloadCostStructureExport = useCallback(
//         async (reportName, format, sourceFilters = {}, category = null) => {
//             const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
//             const params = new URLSearchParams();

//             params.set('format', format === 'xlsx' ? 'excel' : format);

//             const filterMap = {
//                 legalGroupId: 'legal_group_id',
//                 legalEntityId: 'legal_entity_id',
//                 parentDivisionId: 'parent_division_id',
//                 subdivisionId: 'subdivision_id',
//                 year: 'year',
//                 periodName: 'period_name',
//                 currency: 'currency',
//             };

//             Object.entries(filterMap).forEach(([sourceKey, queryKey]) => {
//                 const value = sourceFilters?.[sourceKey];
//                 const values = asArray(value).filter(
//                     (item) => item !== null && item !== undefined && item !== '' && item !== 'All'
//                 );

//                 values.forEach((item) => params.append(queryKey, optionValue(item)));
//             });

//             if (category) {
//                 params.set('category', category);
//             }

//             const token =
//                 localStorage.getItem('finsight_token') ||
//                 localStorage.getItem('token');

//             const response = await fetch(
//                 `${baseUrl}/api/pl/${encodeURIComponent(reportName)}/export?${params.toString()}`,
//                 {
//                     method: 'GET',
//                     headers: token
//                         ? { Authorization: `Bearer ${token}` }
//                         : {},
//                 }
//             );

//             if (!response.ok) {
//                 let message = `Export failed (${response.status})`;
//                 try {
//                     const body = await response.json();
//                     message = body?.detail || body?.message || message;
//                 } catch (_) {
//                     // Keep the HTTP status message when the response is not JSON.
//                 }
//                 throw new Error(message);
//             }

//             const blob = await response.blob();
//             const disposition = response.headers.get('content-disposition') || '';
//             const filenameMatch = disposition.match(/filename[^;=]*=(?:UTF-8''|\"?)([^;\"]+)/i);
//             const extension = format === 'pdf' ? 'pdf' : 'xlsx';
//             const filename =
//                 filenameMatch?.[1]?.trim() ||
//                 `${reportName}${category ? `-${category}` : ''}.${extension}`;

//             const url = URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             link.download = filename.replace(/[\\/:*?\"<>|]/g, '-');
//             document.body.appendChild(link);
//             link.click();
//             link.remove();
//             URL.revokeObjectURL(url);
//         },
//         []
//     );


//     const handleMainExpand =
//         useCallback(
//             async (
//                 row,
//                 key
//             ) => {
//                 const nextOpen =
//                     !mainExpanded[
//                     key
//                     ];

//                 setMainExpanded(
//                     (prev) => ({
//                         ...prev,
//                         [key]:
//                             nextOpen,
//                     })
//                 );

//                 if (!nextOpen) {
//                     return;
//                 }

//                 const category =
//                     getLabel(row);

//                 if (
//                     !category
//                 ) {
//                     return;
//                 }

//                 if (
//                     mainDetailMap[
//                     category
//                     ]
//                 ) {
//                     return;
//                 }

//                 setMainDetailLoading(
//                     (prev) => ({
//                         ...prev,
//                         [category]:
//                             true,
//                     })
//                 );

//                 try {
//                     /*
//                      * Backend contract:
//                      * fetchPLDirectCostDetail(filters, category)
//                      */
//                     const details =
//                         await fetchPLDirectCostDetail(
//                             baseFilters,
//                             category
//                         );

//                     setMainDetailMap(
//                         (prev) => ({
//                             ...prev,
//                             [category]:
//                                 unwrapRows(
//                                     details
//                                 ),
//                         })
//                     );
//                 } catch (err) {
//                     onToast?.(
//                         err?.message ||
//                         `Failed to load details for ${category}.`,
//                         'error'
//                     );

//                     setMainDetailMap(
//                         (prev) => ({
//                             ...prev,
//                             [category]:
//                                 [],
//                         })
//                     );
//                 } finally {
//                     setMainDetailLoading(
//                         (prev) => ({
//                             ...prev,
//                             [category]:
//                                 false,
//                         })
//                     );
//                 }
//             },
//             [
//                 mainExpanded,
//                 mainDetailMap,
//                 baseFilters,
//                 onToast,
//                 downloadCostStructureExport,
//             ]
//         );


//     /* =====================================================
//        MODAL DETAIL EXPAND
//     ===================================================== */

//     const handleExpand =
//         useCallback(
//             async (
//                 row,
//                 key
//             ) => {
//                 const nextOpen =
//                     !expanded[key];

//                 setExpanded(
//                     (prev) => ({
//                         ...prev,
//                         [key]:
//                             nextOpen,
//                     })
//                 );

//                 if (!nextOpen) {
//                     return;
//                 }

//                 const category =
//                     getLabel(row);

//                 if (
//                     !category
//                 ) {
//                     return;
//                 }

//                 if (
//                     detailMap[
//                     category
//                     ]
//                 ) {
//                     return;
//                 }

//                 setDetailLoading(
//                     (prev) => ({
//                         ...prev,
//                         [category]:
//                             true,
//                     })
//                 );

//                 try {
//                     const details =
//                         await fetchPLDirectCostDetail(
//                             modalFilters ||
//                             baseFilters,
//                             category
//                         );

//                     setDetailMap(
//                         (prev) => ({
//                             ...prev,
//                             [category]:
//                                 unwrapRows(
//                                     details
//                                 ),
//                         })
//                     );
//                 } catch (err) {
//                     onToast?.(
//                         err?.message ||
//                         `Failed to load details for ${category}.`,
//                         'error'
//                     );

//                     setDetailMap(
//                         (prev) => ({
//                             ...prev,
//                             [category]:
//                                 [],
//                         })
//                     );
//                 } finally {
//                     setDetailLoading(
//                         (prev) => ({
//                             ...prev,
//                             [category]:
//                                 false,
//                         })
//                     );
//                 }
//             },
//             [
//                 expanded,
//                 detailMap,
//                 modalFilters,
//                 baseFilters,
//                 onToast,
//             ]
//         );


//     /* =====================================================
//        EXPORT
//     ===================================================== */

//     const handleExport =
//         useCallback(
//             async (
//                 format,
//                 reportName =
//                     'cost-classification-monthly',
//                 category = null,
//                 sourceFilters =
//                     baseFilters
//             ) => {
//                 const key =
//                     `${reportName}-${format}`;

//                 if (
//                     exporting
//                 ) {
//                     return;
//                 }

//                 setExporting(
//                     key
//                 );

//                 try {
//                     /*
//                      * Existing P&L export integration.
//                      */
//                     const exportFilters = {
//                         ...(sourceFilters || {}),
//                         ...(category ? { category } : {}),
//                     };

//                     try {
//                         await exportPL(
//                             reportName,
//                             format,
//                             exportFilters
//                         );
//                     } catch (exportError) {
//                         /*
//                          * Fallback to the exact Cost Structure export endpoint.
//                          * This keeps the existing P&L export/auth flow while ensuring
//                          * the five backend report names and detail category parameter
//                          * are supported here.
//                          */
//                         await downloadCostStructureExport(
//                             reportName,
//                             format,
//                             exportFilters,
//                             category
//                         );
//                     }

//                     onToast?.(
//                         `${format.toUpperCase()} export downloaded successfully.`,
//                         'success'
//                     );
//                 } catch (err) {
//                     onToast?.(
//                         `Export failed: ${err?.message ||
//                         'Unknown error'
//                         }.`,
//                         'error'
//                     );
//                 } finally {
//                     setExporting(
//                         null
//                     );
//                 }
//             },
//             [
//                 exporting,
//                 baseFilters,
//                 onToast,
//             ]
//         );


//     /* =====================================================
//        SUMMARY
//     ===================================================== */

//     const summary =
//         normalizeSummary(
//             classification,
//             breakdown,
//             baseFilters.currency,
//             baseFilters.periodName
//         );


//     /*
//      * IMPORTANT:
//      * Only show the intended direct-cost
//      * categories in the main drill-down.
//      *
//      * Do not use:
//      * !getLabel(row).includes(...)
//      *
//      * because that could unintentionally
//      * include unrelated backend rows.
//      */
//     const mainRows =
//         unwrapRows(
//             breakdown
//         ).filter((row) =>
//             DIRECT_CATEGORIES.includes(
//                 getLabel(row).trim()
//             )
//         );


//     /* =====================================================
//        RENDER
//     ===================================================== */

//     return (
//         <>
//             <section
//                 className="cost-structure-analysis-page"
//                 style={{
//                     marginBottom: 18,
//                 }}
//             >
//                 <div
//                     style={{
//                         background: '#fff',
//                         border:
//                             '1px solid #e7ebf1',
//                         borderRadius: 12,
//                         padding:
//                             '10px 14px',
//                         marginBottom: 10,
//                         boxShadow:
//                             '0 1px 3px rgba(15,23,42,.04)',
//                     }}
//                 >
//                     <div
//                         style={{
//                             display:
//                                 'flex',
//                             justifyContent:
//                                 'space-between',
//                             alignItems:
//                                 'center',
//                             gap: 15,
//                             flexWrap:
//                                 'wrap',
//                         }}
//                     >
//                         <div>
//                             <h2
//                                 style={{
//                                     margin: 0,
//                                     fontSize: 18,
//                                     lineHeight:
//                                         '22px',
//                                     fontWeight:
//                                         700,
//                                     color:
//                                         '#182338',
//                                 }}
//                             >
//                                 Cost Structure Analysis
//                             </h2>

//                             <div
//                                 style={{
//                                     marginTop: 3,
//                                     fontSize: 12,
//                                     color:
//                                         '#7a8496',
//                                 }}
//                             >
//                                 Cost of material,
//                                 direct expenses
//                                 and operating
//                                 expenses.
//                             </div>
//                         </div>

//                         <div
//                             style={{
//                                 position: 'relative',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: 8,
//                             }}
//                         >
//                             <ExportButtons
//                                 endpoint="cost-structure-analysis"
//                                 exporting={
//                                     exporting === 'cost-classification-monthly-excel'
//                                         ? 'excel'
//                                         : exporting === 'cost-classification-monthly-pdf'
//                                             ? 'pdf'
//                                             : null
//                                 }
//                                 handleExport={handleExport}
//                             />

//                             <button
//                                 type="button"
//                                 aria-label="Cost Structure Analysis actions"
//                                 title="More actions"
//                                 onClick={() =>
//                                     setActionMenuOpen((prev) => !prev)
//                                 }
//                                 style={{
//                                     width: 32,
//                                     height: 32,
//                                     border: '1px solid #e4e9f0',
//                                     borderRadius: 7,
//                                     background: '#fff',
//                                     color: '#64748b',
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     cursor: 'pointer',
//                                 }}
//                             >
//                                 <MoreVertical size={18} />
//                             </button>

//                             {actionMenuOpen && (
//                                 <>
//                                     <div
//                                         style={{
//                                             position: 'fixed',
//                                             inset: 0,
//                                             zIndex: 119,
//                                         }}
//                                         onClick={() =>
//                                             setActionMenuOpen(false)
//                                         }
//                                     />
//                                     <div
//                                         style={{
//                                             position: 'absolute',
//                                             top: 35,
//                                             right: 0,
//                                             zIndex: 120,
//                                             width: 155,
//                                             padding: 5,
//                                             background: '#fff',
//                                             border: '1px solid #e5eaf1',
//                                             borderRadius: 9,
//                                             boxShadow: '0 12px 28px rgba(15,23,42,.14)',
//                                         }}
//                                     >
//                                         <button
//                                             type="button"
//                                             onClick={() => {
//                                                 setActionMenuOpen(false);
//                                                 openViewAll();
//                                             }}
//                                             style={{
//                                                 width: '100%',
//                                                 border: 0,
//                                                 background: 'transparent',
//                                                 padding: '9px 10px',
//                                                 borderRadius: 6,
//                                                 textAlign: 'left',
//                                                 color: '#708090',
//                                                 fontSize: 12,
//                                                 fontWeight: 700,
//                                                 cursor: 'pointer',
//                                             }}
//                                         >
//                                             🔎  View All
//                                         </button>

//                                         <button
//                                             type="button"
//                                             onClick={() => {
//                                                 setActionMenuOpen(false);
//                                                 handleExport('excel');
//                                             }}
//                                             disabled={!!exporting}
//                                             style={{
//                                                 width: '100%',
//                                                 border: 0,
//                                                 background: 'transparent',
//                                                 padding: '9px 10px',
//                                                 borderRadius: 6,
//                                                 textAlign: 'left',
//                                                 color: '#708090',
//                                                 fontSize: 12,
//                                                 fontWeight: 700,
//                                                 cursor: exporting ? 'not-allowed' : 'pointer',
//                                                 opacity: exporting ? 0.6 : 1,
//                                             }}
//                                         >
//                                             📊 Export Excel
//                                         </button>

//                                         <button
//                                             type="button"
//                                             onClick={() => {
//                                                 setActionMenuOpen(false);
//                                                 handleExport('pdf');
//                                             }}
//                                             disabled={!!exporting}
//                                             style={{
//                                                 width: '100%',
//                                                 border: 0,
//                                                 background: 'transparent',
//                                                 padding: '9px 10px',
//                                                 borderRadius: 6,
//                                                 textAlign: 'left',
//                                                 color: '#708090',
//                                                 fontSize: 12,
//                                                 fontWeight: 700,
//                                                 cursor: exporting ? 'not-allowed' : 'pointer',
//                                                 opacity: exporting ? 0.6 : 1,
//                                             }}
//                                         >
//                                             📄 Export PDF
//                                         </button>
//                                     </div>
//                                 </>
//                             )}
//                         </div>
//                     </div>
//                 </div>


//                 {error && (
//                     <div
//                         style={{
//                             padding:
//                                 '9px 12px',
//                             marginBottom: 10,
//                             borderRadius: 8,
//                             border:
//                                 '1px solid #fecdd3',
//                             background:
//                                 '#fff1f2',
//                             color:
//                                 '#be123c',
//                             fontSize: 12,
//                             display:
//                                 'flex',
//                             justifyContent:
//                                 'space-between',
//                             alignItems:
//                                 'center',
//                         }}
//                     >
//                         <span>
//                             {error}
//                         </span>

//                         <button
//                             type="button"
//                             onClick={
//                                 loadMain
//                             }
//                             style={{
//                                 border: 0,
//                                 background:
//                                     'transparent',
//                                 color:
//                                     '#be123c',
//                                 cursor:
//                                     'pointer',
//                             }}
//                         >
//                             <RefreshCw
//                                 size={
//                                     13
//                                 }
//                             />
//                         </button>
//                     </div>
//                 )}


//                 <div
//                     style={{
//                         display:
//                             'grid',
//                         gridTemplateColumns:
//                             'repeat(3, minmax(0, 1fr))',
//                         gap: 8,
//                         marginBottom: 10,
//                     }}
//                     className="cost-structure-summary-grid"
//                 >
//                     <CostCard
//                         title="Cost of Material (PTD)"
//                         value={
//                             summary
//                                 .material
//                                 .ptd
//                         }
//                         ytd={
//                             summary
//                                 .material
//                                 .ytd
//                         }
//                         target={
//                             summary
//                                 .material
//                                 .target
//                         }
//                         color="#18b89b"
//                         bg="#dff8f1"
//                         icon={Package}
//                         loading={
//                             loading
//                         }
//                         currency={
//                             baseFilters.currency
//                         }
//                     />

//                     <CostCard
//                         title="Direct Expenses (PTD)"
//                         value={
//                             summary
//                                 .direct
//                                 .ptd
//                         }
//                         ytd={
//                             summary
//                                 .direct
//                                 .ytd
//                         }
//                         target={
//                             summary
//                                 .direct
//                                 .target
//                         }
//                         color="#7040dc"
//                         bg="#eee7ff"
//                         icon={
//                             BarChart3
//                         }
//                         loading={
//                             loading
//                         }
//                         currency={
//                             baseFilters.currency
//                         }
//                     />

//                     <CostCard
//                         title="Operating Expenses (PTD)"
//                         value={
//                             summary
//                                 .operating
//                                 .ptd
//                         }
//                         ytd={
//                             summary
//                                 .operating
//                                 .ytd
//                         }
//                         target={
//                             summary
//                                 .operating
//                                 .target
//                         }
//                         color="#f47d20"
//                         bg="#fff0df"
//                         icon={
//                             ShoppingBag
//                         }
//                         loading={
//                             loading
//                         }
//                         currency={
//                             baseFilters.currency
//                         }
//                     />
//                 </div>


//                 <div
//                     style={{
//                         display:
//                             'grid',
//                         gridTemplateColumns:
//                             '1.5fr 1fr',
//                         gap: 10,
//                         marginBottom: 10,
//                     }}
//                     className="cost-structure-chart-grid"
//                 >
//                     <MainCostChart
//                         data={unwrapRows(
//                             classification
//                         )}
//                         currency={
//                             baseFilters.currency
//                         }
//                     />

//                     <CostMix
//                         payload={
//                             classification
//                         }
//                         currency={
//                             baseFilters.currency
//                         }
//                         periodName={
//                             baseFilters.periodName
//                         }
//                     />
//                 </div>


//                 <div
//                     style={{
//                         background:
//                             '#fff',
//                         border:
//                             '1px solid #e7ebf1',
//                         borderRadius: 11,
//                         overflow:
//                             'hidden',
//                         boxShadow:
//                             '0 1px 3px rgba(15,23,42,.035)',
//                     }}
//                 >
//                     <div
//                         style={{
//                             padding:
//                                 '12px 14px 10px',
//                             fontSize: 13,
//                             fontWeight: 700,
//                             color:
//                                 '#182338',
//                         }}
//                     >
//                         Direct Cost Drill-Down
//                     </div>

//                     <DirectCostTable
//                         rows={mainRows}
//                         currency={
//                             baseFilters.currency
//                         }
//                         expanded={
//                             mainExpanded
//                         }
//                         details={
//                             mainDetailMap
//                         }
//                         loadingDetails={
//                             mainDetailLoading
//                         }
//                         onExpand={
//                             handleMainExpand
//                         }
//                     />
//                 </div>
//             </section>


//             {modalOpen && (
//                 <Modal
//                     onClose={() =>
//                         setModalOpen(
//                             false
//                         )
//                     }
//                 >
//                     <div
//                         style={{
//                             padding:
//                                 '14px 18px',
//                             borderBottom:
//                                 '1px solid #e2e8f0',
//                             display:
//                                 'flex',
//                             alignItems:
//                                 'flex-start',
//                             justifyContent:
//                                 'space-between',
//                             gap: 12,
//                             background: '#fff',
//                         }}
//                     >
//                         <div>
//                             <div
//                                 style={{
//                                     fontSize: 19,
//                                     fontWeight:
//                                         800,
//                                     color:
//                                         C.navy,
//                                 }}
//                             >
//                                 Cost Structure Analysis –
//                                 View All
//                             </div>

//                             <div
//                                 style={{
//                                     marginTop: 3,
//                                     fontSize: 12,
//                                     color: '#64748b',
//                                 }}
//                             >
//                                 Detailed cost of material, direct expense and operating expense analysis
//                             </div>

//                             <div
//                                 style={{
//                                     marginTop: 4,
//                                     fontSize: 11,
//                                     color: '#8a94a6',
//                                 }}
//                             >
//                                 Period: {
//                                     (modalFilters || baseFilters).periodName || '—'
//                                 } | All values in {
//                                     (modalFilters || baseFilters).currency || 'AED'
//                                 }
//                             </div>
//                         </div>

//                         <button
//                             type="button"
//                             onClick={() =>
//                                 setModalOpen(
//                                     false
//                                 )
//                             }
//                             style={{
//                                 width: 31,
//                                 height: 31,
//                                 border: 0,
//                                 borderRadius: 7,
//                                 background:
//                                     '#fff',
//                                 color:
//                                     '#64748b',
//                                 cursor:
//                                     'pointer',
//                             }}
//                         >
//                             <X
//                                 size={16}
//                             />
//                         </button>
//                     </div>


//                     <ViewAllContent
//                         tab={modalTab}
//                         setTab={
//                             setModalTab
//                         }
//                         filters={
//                             modalFilters ||
//                             baseFilters
//                         }
//                         setFilters={
//                             setModalFilters
//                         }
//                         options={
//                             modalOptions
//                         }
//                         loading={
//                             modalLoading
//                         }
//                         classification={
//                             modalClassification
//                         }
//                         breakdown={
//                             modalBreakdown
//                         }
//                         monthly={
//                             modalMonthly
//                         }
//                         expanded={
//                             expanded
//                         }
//                         detailMap={
//                             detailMap
//                         }
//                         detailLoading={
//                             detailLoading
//                         }
//                         onExpand={
//                             handleExpand
//                         }
//                         onApply={
//                             applyModal
//                         }
//                         onReset={
//                             resetModal
//                         }
//                         onExport={(
//                             format
//                         ) => {
//                             const report =
//                                 modalTab ===
//                                     'classification'
//                                     ? 'cost-classification-monthly'
//                                     : modalTab ===
//                                         'breakdown'
//                                         ? 'direct-cost-breakdown'
//                                         : 'direct-cost-monthly';

//                             handleExport(
//                                 format,
//                                 report,
//                                 null,
//                                 modalFilters ||
//                                 baseFilters
//                             );
//                         }}
//                         exporting={
//                             exporting
//                         }
//                         currency={
//                             (
//                                 modalFilters ||
//                                 baseFilters
//                             ).currency ||
//                             'AED'
//                         }
//                     />
//                 </Modal>
//             )}


//             <style>
//                 {`
//                     @media (max-width: 1200px) {
//                         .cost-structure-filter-grid {
//                             grid-template-columns: repeat(4, minmax(140px, 1fr)) !important;
//                         }
//                     }

//                     @media (max-width: 900px) {
//                         .cost-structure-filter-grid {
//                             grid-template-columns: repeat(2, minmax(140px, 1fr)) !important;
//                         }

//                         .cost-structure-chart-grid {
//                             grid-template-columns: 1fr !important;
//                         }

//                         .cost-structure-summary-grid {
//                             grid-template-columns: 1fr !important;
//                         }
//                     }

//                     @media (max-width: 700px) {
//                         .cost-structure-filter-grid {
//                             grid-template-columns: 1fr !important;
//                         }

//                         .cost-structure-summary-grid {
//                             grid-template-columns: 1fr !important;
//                         }

//                         .cost-structure-chart-grid {
//                             grid-template-columns: 1fr !important;
//                         }
//                     }

//                     /* =========================================================
//    TABLE HEADER CONSISTENCY
// ========================================================= */

// /* Scoped to this component so existing application tables are untouched. */

// .cost-structure-table thead tr {
//     background: #fff !important;
//     color: #173b68 !important;
// }

// .cost-structure-table thead th {
//     background: #fff !important;
//     color: #173b68 !important;
// }

// /* Keep View All charts compact and prevent inherited/global typography
//    from making chart labels larger than the FinSight layout. */
// .cost-structure-chart text {
//     font-size: 13px !important;
// }

// .cost-structure-chart .recharts-legend-item-text {
//      font-size: 13px !important;
// }
//                 `}
//             </style>
//         </>
//     );
// }


import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { createPortal } from 'react-dom';

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import {
    BarChart3,
    ChevronDown,
    ChevronRight,
    FileSpreadsheet,
    FileText,
    Package,
    RefreshCw,
    ShoppingBag,
    MoreVertical,
    X,
} from 'lucide-react';

import {
    fetchPLCostClassificationMonthly,
    fetchPLDirectCostBreakdown,
    fetchPLDirectCostDetail,
    fetchPLDirectCostMonthly,
    fetchPLDirectCostDetailMonthly,
    exportPL,
} from '../services/plApi';

import { C } from '../utils/theme';
import ExportButtons from "../components/Common/ExportButtons";


/* =========================================================
   CATEGORY META
========================================================= */

const CATEGORY_META = {
    'Cost of Material': {
        color: '#19b99d',
        icon: Package,
        bg: '#dff8f1',
    },

    'Direct Expenses': {
        color: '#7040dc',
        icon: BarChart3,
        bg: '#eee7ff',
    },

    'Operating Expenses': {
        color: '#f47d20',
        icon: ShoppingBag,
        bg: '#fff0df',
    },
};


/* =========================================================
   DIRECT COST CATEGORIES
========================================================= */

const DIRECT_CATEGORIES = [
    'Cost of Material',
    'Direct Labour',
    'Manufacturing / Direct Overheads',
    'Overhead Absorption',
    'Direct Expenses - RKME',
];


/* =========================================================
   EMPTY FILTER OPTIONS
========================================================= */

const emptyOptions = {
    legalGroups: [],
    legalEntities: [],
    parentDivisions: [],
    subdivisions: [],
    years: [],
    periods: [],
    currencies: ['AED'],
};


/* =========================================================
   HELPERS
========================================================= */

const asArray = (value) => (
    Array.isArray(value)
        ? value
        : value == null
            ? []
            : [value]
);


const unwrapRows = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload?.rows)) {
        return payload.rows;
    }

    if (Array.isArray(payload?.items)) {
        return payload.items;
    }

    if (Array.isArray(payload?.results)) {
        return payload.results;
    }

    if (Array.isArray(payload?.months)) {
        return payload.months;
    }

    /*
     * Some backend responses may return a single
     * summary object instead of an array.
     *
     * Keep that object instead of converting it
     * to an empty array.
     */
    if (
        payload &&
        typeof payload === 'object' &&
        !Array.isArray(payload)
    ) {
        return [payload];
    }

    return [];
};

const getValue = (row, keys) => {
    if (!row || typeof row !== 'object') {
        return null;
    }

    for (const key of keys) {
        if (
            row[key] !== undefined &&
            row[key] !== null
        ) {
            return row[key];
        }
    }

    return null;
};


const getLabel = (row) => String(
    getValue(row, [
        'category',
        'cost_category',
        'costCategory',
        'classification',
        'label',
        'name',
        'particulars',
    ]) ?? '—'
);


const getPeriod = (row) => String(
    getValue(row, [
        'period_name',
        'period',
        'month',
        'month_name',
        'monthName',
        'label',
    ]) ?? '—'
);


const getPTD = (row) => getValue(row, [
    'actual_ptd',
    'current_ptd',
    'ptd',
    'ptd_value',
    'actual',
    'current',
    'value',
    'amount',
]);


const getYTD = (row) => getValue(row, [
    'actual_ytd',
    'current_ytd',
    'ytd',
    'ytd_value',
]);


const getTargetPTD = (row) => getValue(row, [
    'target_ptd',
    'target_period',
    'target',
]);


const getTargetYTD = (row) => getValue(row, [
    'target_ytd',
    'ytd_target',
]);


const getVariancePTD = (row) => getValue(row, [
    'variance_ptd',
    'variance_ptd_value',
    'variance',
]);


const getVarianceYTD = (row) => getValue(row, [
    'variance_ytd',
    'variance_ytd_value',
]);


const sumNumbers = (values) => {
    const nums = values.map(numberOrNull).filter((v) => v !== null);
    return nums.length ? nums.reduce((sum, v) => sum + v, 0) : null;
};


const numberOrNull = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return null;
    }

    if (typeof value === 'number') {
        return Number.isFinite(value)
            ? value
            : null;
    }

    const parsed = Number(
        String(value).replace(/,/g, '')
    );

    return Number.isFinite(parsed)
        ? parsed
        : null;
};


const formatMoney = (
    value,
    currency = 'AED'
) => {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '—';
    }

    const numeric = numberOrNull(value);

    if (numeric === null) {
        return String(value);
    }

    return `${currency} ${numeric.toLocaleString(
        'en-US',
        {
            maximumFractionDigits: 2,
        }
    )}`;
};


const formatTableMoney = (
    value
) => {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '—';
    }

    const numeric = numberOrNull(value);

    if (numeric === null) {
        return String(value);
    }

    return numeric.toLocaleString(
        'en-US',
        {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
        }
    );
};


const formatMillions = (
    value,
    currency = 'AED'
) => {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '—';
    }

    const numeric = numberOrNull(value);

    if (numeric === null) {
        return String(value);
    }

    return `${currency} ${(numeric / 1000000).toFixed(2)}M`;
};


const formatPercent = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '—';
    }

    const numeric = numberOrNull(value);

    if (numeric === null) {
        return String(value);
    }

    return `${numeric.toFixed(1)}%`;
};


const valueColor = (value) => {
    const numeric = numberOrNull(value);

    return numeric !== null && numeric < 0
        ? '#dc2626'
        : '#334155';
};


const optionValue = (option) => {
    if (
        option &&
        typeof option === 'object'
    ) {
        return String(
            option.value ??
            option.id ??
            option.code ??
            option.name ??
            ''
        );
    }

    return String(option ?? '');
};


const optionLabel = (option) => {
    if (
        option &&
        typeof option === 'object'
    ) {
        return String(
            option.label ??
            option.name ??
            option.value ??
            option.id ??
            ''
        );
    }

    return String(option ?? '');
};


/* =========================================================
   MONTHLY CATEGORY NORMALIZATION
========================================================= */

const normalizeCategoryMonthlyRows = (rows) => {
    const sourceRows = unwrapRows(rows);

    const categoryKey = (label) => {
        const normalized = String(label || '')
            .trim()
            .toLowerCase();

        if (normalized === 'cost of material') {
            return 'material';
        }

        if (normalized === 'direct expenses') {
            return 'direct';
        }

        if (
            normalized === 'operating expenses' ||
            normalized === 'operating expense'
        ) {
            return 'operating';
        }

        return null;
    };

    const periodSortValue = (period) => {
        const match = String(period || '').match(
            /^([A-Za-z]{3})[-\s](\d{2,4})$/
        );

        if (!match) {
            return Number.MAX_SAFE_INTEGER;
        }

        const monthIndex = {
            jan: 0,
            feb: 1,
            mar: 2,
            apr: 3,
            may: 4,
            jun: 5,
            jul: 6,
            aug: 7,
            sep: 8,
            oct: 9,
            nov: 10,
            dec: 11,
        }[match[1].toLowerCase()];

        const year = Number(match[2]);
        const normalizedYear = year < 100 ? 2000 + year : year;

        return normalizedYear * 12 + (monthIndex ?? 0);
    };

    const monthlyRows = sourceRows.filter((row) => {
        const monthly = getValue(row, [
            'monthly_actual',
            'monthly_actual_aed',
        ]);

        return (
            monthly &&
            typeof monthly === 'object' &&
            !Array.isArray(monthly)
        );
    });

    if (monthlyRows.length) {
        const periods = new Set();

        monthlyRows.forEach((row) => {
            const monthly = getValue(row, [
                'monthly_actual',
                'monthly_actual_aed',
            ]);

            Object.keys(monthly || {}).forEach((period) => {
                periods.add(period);
            });
        });

        return Array.from(periods)
            .sort((a, b) => periodSortValue(a) - periodSortValue(b))
            .map((period) => {
                const result = {
                    period,
                    material: null,
                    direct: null,
                    operating: null,
                };

                monthlyRows.forEach((row) => {
                    const key = categoryKey(getLabel(row));
                    if (!key) return;

                    const monthly = getValue(row, [
                        'monthly_actual',
                        'monthly_actual_aed',
                    ]);

                    if (
                        monthly &&
                        Object.prototype.hasOwnProperty.call(monthly, period)
                    ) {
                        result[key] = numberOrNull(monthly[period]);
                    }
                });

                return result;
            });
    }

    /* Backward-compatible support for a period-oriented response. */
    return sourceRows
        .map((row) => ({
            period: getPeriod(row),
            material: numberOrNull(getValue(row, [
                'cost_of_material',
                'cost_of_material_ptd',
                'cost_of_material_ptd_aed',
                'actual_cost_of_material',
                'actual_cost_of_material_aed',
                'material',
                'material_ptd',
                'material_ptd_aed',
            ])),
            direct: numberOrNull(getValue(row, [
                'direct_expenses',
                'direct_expenses_ptd',
                'direct_expenses_ptd_aed',
                'actual_direct_expenses',
                'actual_direct_expenses_aed',
                'direct',
                'direct_ptd',
                'direct_ptd_aed',
            ])),
            operating: numberOrNull(getValue(row, [
                'operating_expenses',
                'operating_expenses_ptd',
                'operating_expenses_ptd_aed',
                'actual_operating_expenses',
                'actual_operating_expenses_aed',
                'operating',
                'operating_ptd',
                'operating_ptd_aed',
            ])),
        }))
        .filter((row) => row.period !== '—');
};


/* =========================================================
   DIRECT COST MONTHLY NORMALIZATION
========================================================= */

const normalizeDirectCostMonthlyRows = (rows) => {
    const sourceRows = unwrapRows(rows);

    const categoryKey = (label) => {
        const normalized = String(label || '')
            .trim()
            .toLowerCase();

        if (normalized === 'cost of material') return 'material';
        if (normalized === 'direct labour' || normalized === 'direct labor') return 'labour';
        if (normalized === 'manufacturing / direct overheads' || normalized === 'manufacturing/direct overheads') return 'manufacturing';
        if (normalized === 'overhead absorption') return 'absorption';
        if (normalized === 'direct expenses - rkme' || normalized === 'direct expenses–rkme') return 'rkme';
        return null;
    };

    const periodSortValue = (period) => {
        const match = String(period || '').match(/^([A-Za-z]{3})[-\s](\d{2,4})$/);
        if (!match) return Number.MAX_SAFE_INTEGER;

        const monthIndex = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
        }[match[1].toLowerCase()];

        const year = Number(match[2]);
        return (year < 100 ? 2000 + year : year) * 12 + (monthIndex ?? 0);
    };

    const monthlyRows = sourceRows.filter((row) => {
        const monthly = getValue(row, ['monthly_actual', 'monthly_actual_aed']);
        return monthly && typeof monthly === 'object' && !Array.isArray(monthly);
    });

    if (monthlyRows.length) {
        const periods = new Set();

        monthlyRows.forEach((row) => {
            const monthly = getValue(row, ['monthly_actual', 'monthly_actual_aed']);
            Object.keys(monthly || {}).forEach((period) => periods.add(period));
        });

        return Array.from(periods)
            .sort((a, b) => periodSortValue(a) - periodSortValue(b))
            .map((period) => {
                const result = {
                    period,
                    material: null,
                    labour: null,
                    manufacturing: null,
                    absorption: null,
                    rkme: null,
                };

                monthlyRows.forEach((row) => {
                    const key = categoryKey(getLabel(row));
                    if (!key) return;

                    const monthly = getValue(row, ['monthly_actual', 'monthly_actual_aed']);
                    if (monthly && Object.prototype.hasOwnProperty.call(monthly, period)) {
                        result[key] = numberOrNull(monthly[period]);
                    }
                });

                return result;
            });
    }

    return sourceRows
        .map((row) => ({
            period: getPeriod(row),
            material: numberOrNull(getValue(row, ['cost_of_material', 'material', 'actual_cost_of_material'])),
            labour: numberOrNull(getValue(row, ['direct_labour', 'direct_labor', 'labour', 'labor'])),
            manufacturing: numberOrNull(getValue(row, ['manufacturing_direct_overheads', 'manufacturing_direct_overhead', 'manufacturing'])),
            absorption: numberOrNull(getValue(row, ['overhead_absorption', 'absorption'])),
            rkme: numberOrNull(getValue(row, ['direct_expenses_rkme', 'rkme'])),
        }))
        .filter((row) => row.period !== '—');
};


/* =========================================================
   VIEW ALL KPI CARD
========================================================= */

function ViewAllCostCard({
    title,
    ptd,
    ytd,
    color,
    bg,
    icon: Icon,
    loading,
    currency,
}) {
    return (
        <div
            style={{
                background: bg,
                border: '1px solid #e3eaf2',
                borderRadius: 10,
                minHeight: 100,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: '#ffffff88',
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <Icon size={25} strokeWidth={2} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: '#173b82',
                        marginBottom: 9,
                    }}
                    title={
                        title === 'Direct Expenses'
                            ? 'Direct Expenses includes Direct Labour, Manufacturing/Direct Overheads, Overhead Absorption and Direct Expenses–RKME.'
                            : undefined
                    }
                >
                    {title}
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 0,
                    }}
                >
                    <div
                        style={{
                            borderRight: '1px solid #d9e0e8',
                            paddingRight: 20,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                color: '#64748b',
                                marginBottom: 2,
                            }}
                        >
                            PTD
                        </div>
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 800,
                                color: '#172554',
                                lineHeight: '22px',
                            }}
                        >
                            {loading ? '—' : formatMillions(ptd, currency)}
                        </div>
                    </div>

                    <div style={{ paddingLeft: 20 }}>
                        <div
                            style={{
                                fontSize: 12,
                                color: '#64748b',
                                marginBottom: 2,
                            }}
                        >
                            YTD
                        </div>
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 800,
                                color: '#172554',
                                lineHeight: '22px',
                            }}
                        >
                            {loading ? '—' : formatMillions(ytd, currency)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


/* =========================================================
   COMPACT MULTI SELECT
========================================================= */

function CompactMultiSelect({
    options = [],
    value = ['All'],
    onChange,
    placeholder = 'All',
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef(null);

    const normalized = asArray(value)
        .map(optionValue)
        .filter(Boolean);

    const allSelected =
        normalized.length === 0 ||
        normalized.includes('All') ||
        normalized.includes('all');

    const cleanOptions = options.filter(
        (o) =>
            optionValue(o) !== '-1' &&
            optionLabel(o).toLowerCase() !== 'all'
    );

    const filteredOptions = cleanOptions.filter((opt) =>
        optionLabel(opt)
            .toLowerCase()
            .includes(search.trim().toLowerCase())
    );

    useEffect(() => {
        const handler = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (!open) setSearch('');
    }, [open]);

    const toggle = (id) => {
        const current = normalized.filter((v) => v !== 'All' && v !== 'all');
        if (current.includes(id)) {
            const next = current.filter((v) => v !== id);
            onChange(next.length ? next : ['All']);
        } else {
            onChange([...current, id]);
        }
    };

    const selectAll = () => {
        const current = normalized.filter((v) => v !== 'All' && v !== 'all');
        const visibleIds = filteredOptions.map((opt) => optionValue(opt)).filter(Boolean);
        const next = Array.from(new Set([...current, ...visibleIds]));
        onChange(next.length ? next : ['All']);
        setSearch('');
    };

    const clearAll = () => {
        onChange(['All']);
        setSearch('');
    };

    const display =
        allSelected
            ? placeholder
            : normalized.length === 1
                ? optionLabel(
                    cleanOptions.find((o) => optionValue(o) === normalized[0]) ?? normalized[0]
                )
                : `${normalized.length} selected`;

    return (
        <div ref={ref} style={{ position: 'relative', minWidth: 150 }}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                style={{
                    width: '100%',
                    minHeight: 34,
                    padding: '6px 9px',
                    border: `1px solid ${C.border}`,
                    borderRadius: 7,
                    background: '#fff',
                    color: '#334155',
                    fontSize: 13,
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {display}
                </span>
                <ChevronDown size={13} color="#94a3b8" />
            </button>

            {open && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        minWidth: 230,
                        maxHeight: 300,
                        overflowY: 'auto',
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 9,
                        boxShadow: '0 12px 30px rgba(15,23,42,.14)',
                        zIndex: 1200,
                    }}
                >
                    <div style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="🔍 Search..."
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                height: 30,
                                padding: '5px 8px',
                                border: '1px solid #dbe2ea',
                                borderRadius: 6,
                                outline: 'none',
                                fontSize: 11,
                                color: '#334155',
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 6, padding: '7px 8px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={selectAll}
                            style={{ flex: 1, border: '1px solid #dbe2ea', borderRadius: 6, background: '#f8fafc', color: '#334155', padding: '5px 6px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                        >
                            Select All
                        </button>
                        <button
                            type="button"
                            onClick={clearAll}
                            style={{ flex: 1, border: '1px solid #dbe2ea', borderRadius: 6, background: '#fff', color: '#64748b', padding: '5px 6px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                        >
                            Clear
                        </button>
                    </div>

                    {filteredOptions.map((opt) => {
                        const id = optionValue(opt);
                        const checked = !allSelected && normalized.includes(id);
                        return (
                            <button
                                type="button"
                                key={id}
                                onClick={() => toggle(id)}
                                style={{
                                    width: '100%',
                                    border: 0,
                                    borderBottom: '1px solid #f8fafc',
                                    background: '#fff',
                                    padding: '8px 10px',
                                    textAlign: 'left',
                                    fontSize: 12,
                                    color: '#334155',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    gap: 8,
                                    alignItems: 'center',
                                }}
                            >
                                <span
                                    aria-hidden="true"
                                    style={{
                                        width: 15,
                                        height: 15,
                                        border: `1px solid ${checked ? '#173b68' : '#cbd5e1'}`,
                                        borderRadius: 3,
                                        background: checked ? '#173b68' : '#fff',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    {checked && (
                                        <span
                                            style={{
                                                color: '#fff',
                                                fontSize: 10,
                                                lineHeight: 1,
                                                fontWeight: 800,
                                            }}
                                        >
                                            ✓
                                        </span>
                                    )}
                                </span>
                                <span>{optionLabel(opt)}</span>
                            </button>
                        );
                    })}

                    {!filteredOptions.length && (
                        <div style={{ padding: 12, textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>
                            No matching options
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* =========================================================
   FILTER CHIPS
========================================================= */

function FilterChips({
    label,
    value = ['All'],
    options = [],
    onRemove,
}) {
    const vals = asArray(value).filter(
        (v) =>
            String(v) !== 'All' &&
            String(v) !== 'all'
    );

    if (!vals.length) {
        return null;
    }

    return (
        <div
            style={{
                display: 'flex',
                gap: 5,
                flexWrap: 'wrap',
                alignItems: 'center',
            }}
        >
            <span
                style={{
                    fontSize: 11,
                    color: '#64748b',
                    fontWeight: 700,
                }}
            >
                {label}:
            </span>

            {vals.slice(0, 4).map((v) => {
                const labelValue =
                    optionLabel(
                        options.find(
                            (o) =>
                                optionValue(o) ===
                                String(v)
                        ) ?? v
                    );

                return (
                    <span
                        key={String(v)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 7px',
                            borderRadius: 999,
                            background: '#f1f5f9',
                            color: '#475569',
                            fontSize: 11,
                        }}
                    >
                        {labelValue}

                        <button
                            type="button"
                            onClick={() =>
                                onRemove(v)
                            }
                            style={{
                                border: 0,
                                background:
                                    'transparent',
                                padding: 0,
                                cursor: 'pointer',
                                color: '#94a3b8',
                            }}
                        >
                            ×
                        </button>
                    </span>
                );
            })}

            {vals.length > 4 && (
                <span
                    style={{
                        fontSize: 11,
                        color: '#64748b',
                    }}
                >
                    +{vals.length - 4}
                </span>
            )}
        </div>
    );
}


/* =========================================================
   COST CARD
========================================================= */

function CostCard({
    title,
    value,
    ytd,
    target,
    color,
    bg,
    icon: Icon,
    loading,
    currency,
}) {
    return (
        <div
            style={{
                background: bg || '#fff',
                border: '1px solid #e5ebf2',
                borderRadius: 10,
                padding: '10px 14px',
                minHeight: 78,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxSizing: 'border-box',
                boxShadow: '0 1px 4px rgba(15,23,42,.025)',
            }}
        >
            <div
                style={{
                    width: 43,
                    height: 43,
                    borderRadius: '50%',
                    background: '#ffffff99',
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: `1px solid ${color}22`,
                }}
            >
                <Icon size={19} strokeWidth={2.1} />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
                <div
                    style={{
                        fontSize: 11,
                        color,
                        fontWeight: 800,
                        marginBottom: 1,
                        lineHeight: '14px',
                    }}
                >
                    {title}
                </div>

                {loading ? (
                    <div
                        style={{
                            width: 105,
                            height: 17,
                            borderRadius: 5,
                            background: '#f1f5f9',
                            marginBottom: 3,
                        }}
                    />
                ) : (
                    <div
                        style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: '#172554',
                            lineHeight: '18px',
                        }}
                    >
                        {formatMillions(value, currency)}
                    </div>
                )}

                <div
                    style={{
                        display: 'flex',
                        gap: 14,
                        marginTop: 2,
                        fontSize: 11,
                        color: '#7d8798',
                        flexWrap: 'wrap',
                        lineHeight: '13px',
                    }}
                >
                    <span>
                        YTD:{' '}
                        <span style={{ color: '#526071' }}>
                            {formatMillions(ytd, currency)}
                        </span>
                    </span>

                    <span>
                        Target:{' '}
                        <span style={{ color: '#526071' }}>
                            {formatMillions(target, currency)}
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
}


/* =========================================================
   MAIN COST CHART
========================================================= */

function MainCostChart({
    data,
    currency,
}) {
    /*
     * /api/pl/cost-classification-monthly returns one row per
     * cost category. Each row contains monthly_actual as:
     *
     * {
     *   "Apr-26": "24800000",
     *   "May-26": "23200000",
     *   ...
     * }
     *
     * The chart needs the opposite shape: one row per period.
     */
    const rows = unwrapRows(data);

    const categoryKey = (label) => {
        const normalized = String(label || '')
            .trim()
            .toLowerCase();

        if (normalized === 'cost of material') {
            return 'material';
        }

        if (normalized === 'direct expenses') {
            return 'direct';
        }

        if (
            normalized === 'operating expenses' ||
            normalized === 'operating expense'
        ) {
            return 'operating';
        }

        return null;
    };

    const monthlyPeriods = new Set();

    rows.forEach((row) => {
        const monthly =
            getValue(row, [
                'monthly_actual',
                'monthly_actual_aed',
            ]);

        if (
            monthly &&
            typeof monthly === 'object' &&
            !Array.isArray(monthly)
        ) {
            Object.keys(monthly).forEach((period) => {
                monthlyPeriods.add(period);
            });
        }
    });

    const periodSortValue = (period) => {
        const match = String(period || '').match(
            /^([A-Za-z]{3})[-\s](\d{2,4})$/
        );

        if (!match) {
            return Number.MAX_SAFE_INTEGER;
        }

        const monthIndex = {
            jan: 0,
            feb: 1,
            mar: 2,
            apr: 3,
            may: 4,
            jun: 5,
            jul: 6,
            aug: 7,
            sep: 8,
            oct: 9,
            nov: 10,
            dec: 11,
        }[match[1].toLowerCase()];

        const year = Number(match[2]);
        const normalizedYear =
            year < 100 ? 2000 + year : year;

        return (
            normalizedYear * 12 +
            (monthIndex ?? 0)
        );
    };

    const periods = Array.from(monthlyPeriods).sort(
        (a, b) =>
            periodSortValue(a) -
            periodSortValue(b)
    );

    const chartData = periods.map((period) => {
        const result = {
            period,
            material: null,
            direct: null,
            operating: null,
        };

        rows.forEach((row) => {
            const key = categoryKey(
                getLabel(row)
            );

            if (!key) {
                return;
            }

            const monthly =
                getValue(row, [
                    'monthly_actual',
                    'monthly_actual_aed',
                ]);

            if (
                monthly &&
                typeof monthly === 'object' &&
                !Array.isArray(monthly) &&
                Object.prototype.hasOwnProperty.call(
                    monthly,
                    period
                )
            ) {
                result[key] = numberOrNull(
                    monthly[period]
                );
            }
        });

        return result;
    });

    /*
     * Backward-compatible fallback for an older
     * period-oriented response.
     */
    const fallbackChartData =
        !chartData.length
            ? rows
                .map((row) => ({
                    period: getPeriod(row),
                    material: numberOrNull(
                        getValue(row, [
                            'cost_of_material',
                            'cost_of_material_ptd',
                            'material',
                            'material_ptd',
                        ])
                    ),
                    direct: numberOrNull(
                        getValue(row, [
                            'direct_expenses',
                            'direct_expenses_ptd',
                            'direct',
                            'direct_ptd',
                        ])
                    ),
                    operating: numberOrNull(
                        getValue(row, [
                            'operating_expenses',
                            'operating_expenses_ptd',
                            'operating',
                            'operating_ptd',
                        ])
                    ),
                }))
                .filter(
                    (row) => row.period !== '—'
                )
            : chartData;

    return (
        <div
            className="cost-structure-chart"
            style={{
                background: '#fff',
                border: '1px solid #e7ebf1',
                borderRadius: 11,
                padding: '12px 14px',
                height: 246,
                boxSizing: 'border-box',
                boxShadow:
                    '0 1px 3px rgba(15,23,42,.035)',
            }}
        >
            <div
                style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#182338',
                    marginBottom: 8,
                }}
            >
                Month-on-Month Cost Classification
            </div>

            <div
                style={{
                    height: 188,
                }}
            >
                {fallbackChartData.length ? (
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <BarChart
                            data={fallbackChartData}
                            margin={{
                                top: 8,
                                right: 10,
                                left: -12,
                                bottom: 4,
                            }}
                            barGap={8}
                            barCategoryGap="20%"
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#edf0f4"
                            />

                            <XAxis
                                dataKey="period"
                                tick={{
                                    fontSize: 10,
                                    fill: '#687386',
                                }}
                                axisLine={{
                                    stroke: '#dfe5ec',
                                }}
                                tickLine={false}
                            />

                            <YAxis
                                tick={{
                                    fontSize: 10,
                                    fill: '#8b94a3',
                                }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) =>
                                    Number(v) === 0
                                        ? '0'
                                        : `${(
                                            Number(v) /
                                            1000000
                                        ).toFixed(0)}M`
                                }
                            />

                            <Tooltip
                                formatter={(value, name) => [
                                    formatMoney(value, currency),
                                    name,
                                ]}
                                contentStyle={{
                                    borderRadius: 8,
                                    border:
                                        '1px solid #e2e8f0',
                                    fontSize: 11,
                                    boxShadow:
                                        '0 8px 24px rgba(15,23,42,.12)',
                                }}
                            />

                            <Legend
                                verticalAlign="bottom"
                                height={20}
                                wrapperStyle={{
                                    fontSize: 10,
                                    paddingTop: 2,
                                }}
                            />

                            <Bar
                                dataKey="material"
                                name="Cost of Material"
                                fill={CATEGORY_META['Cost of Material'].color}
                                barSize={12}
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="direct"
                                name="Direct Expenses"
                                fill={CATEGORY_META['Direct Expenses'].color}
                                barSize={12}
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="operating"
                                name="Operating Expenses"
                                fill={CATEGORY_META['Operating Expenses'].color}
                                barSize={12}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div
                        style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent:
                                'center',
                            color: '#94a3b8',
                            fontSize: 13,
                        }}
                    >
                        No data available
                    </div>
                )}
            </div>
        </div>
    );
}

/* =========================================================
   COST MIX
========================================================= */

function CostMix({
    payload,
    currency,
    periodName = '',
}) {
    /*
     * Current PTD Cost Mix is driven by the same
     * /api/pl/cost-classification-monthly response.
     *
     * The backend returns one row per category and
     * monthly_actual[periodName] contains the PTD value.
     * Do not read the PTD value from /direct-cost-breakdown.
     */
    const rows = unwrapRows(payload);

    const findCategory = (name) =>
        rows.find(
            (row) =>
                getLabel(row)
                    .trim()
                    .toLowerCase() ===
                name.toLowerCase()
        );

    const readMonthlyActual = (row) => {
        if (!row || typeof row !== 'object') {
            return null;
        }

        const monthly = getValue(row, [
            'monthly_actual',
            'monthly_actual_aed',
        ]);

        if (
            monthly && !Array.isArray(monthly)
        ) {
            if (
                periodName &&
                Object.prototype.hasOwnProperty.call(
                    monthly,
                    periodName
                )
            ) {
                return monthly[periodName];
            }

            /*
             * Keep the UI populated during an initial
             * period transition if the selected period
             * has not arrived in the response yet.
             */
            const availablePeriods =
                Object.keys(monthly);

            if (availablePeriods.length) {
                return monthly[
                    availablePeriods[0]
                ];
            }
        }

        return getValue(row, [
            'actual_ptd',
            'actual_ptd_aed',
            'current_ptd',
            'current_ptd_aed',
            'ptd',
            'ptd_value',
            'ptd_aed',
            'value',
            'amount',
            'amount_aed',
        ]);
    };

    const readBackendPercentage = (row) => {
        const value = getValue(row, [
            'percentage',
            'percentage_ptd',
            'percentage_ptd_cost_mix',
            'pct',
            'pct_ptd',
            'share',
            'mix_percentage',
            'cost_mix_percentage',
        ]);

        const numeric = numberOrNull(value);

        if (numeric === null) {
            return null;
        }

        /*
         * Support both 82.6 and 0.826 backend conventions.
         */
        return Math.abs(numeric) <= 1
            ? numeric * 100
            : numeric;
    };

    const normalized = [
        'Cost of Material',
        'Direct Expenses',
        'Operating Expenses',
    ]
        .map((category) => {
            const row = findCategory(
                category
            );

            return {
                label: category,
                value: readMonthlyActual(row),
                backendPercentage:
                    readBackendPercentage(row),
            };
        });

    const total = normalized.reduce(
        (sum, item) =>
            sum +
            (numberOrNull(item.value) ?? 0),
        0
    );

    const displayRows = normalized.map(
        (item) => {
            const numericValue =
                numberOrNull(item.value);

            /*
             * Prefer a percentage explicitly supplied
             * by the backend. Otherwise calculate the
             * mix from the three classification values.
             */
            const percentage =
                item.backendPercentage !== null
                    ? item.backendPercentage
                    : total > 0 &&
                        numericValue !== null
                        ? (numericValue / total) *
                        100
                        : null;

            return {
                ...item,
                percentage,
            };
        }
    );

    return (
        <div
            style={{
                background: '#fff',
                border: '1px solid #e7ebf1',
                borderRadius: 11,
                padding: '12px 14px',
                height: 246,
                boxSizing: 'border-box',
                boxShadow:
                    '0 1px 3px rgba(15,23,42,.035)',
            }}
        >
            <div
                style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#182338',
                    marginBottom: 14,
                }}
            >
                Current PTD Cost Mix
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 15,
                }}
            >
                {displayRows.some(
                    (item) =>
                        numberOrNull(
                            item.value
                        ) !== null
                ) ? (
                    displayRows.map((item) => {
                        const meta =
                            CATEGORY_META[
                            item.label
                            ] || {
                                color: '#64748b',
                            };

                        const pct =
                            numberOrNull(
                                item.percentage
                            );

                        return (
                            <div
                                key={item.label}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                        '88px minmax(0, 1fr) 78px',
                                    alignItems:
                                        'center',
                                    gap: 10,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 12, fontWeight: 800,
                                        lineHeight:
                                            '12px',
                                        color:
                                            '#3e4859',
                                    }}
                                >
                                    {item.label}
                                </div>

                                <div
                                    style={{
                                        height: 25,
                                        background:
                                            '#f5f6f8',
                                        position:
                                            'relative',
                                        borderRadius: 3,
                                        overflow:
                                            'hidden',
                                    }}
                                >
                                    {pct !== null && (
                                        <div
                                            style={{
                                                height:
                                                    '100%',
                                                width: `${Math.max(
                                                    0,
                                                    Math.min(
                                                        100,
                                                        pct
                                                    )
                                                )}%`,
                                                background:
                                                    meta.color,
                                                borderRadius:
                                                    3,
                                                minWidth:
                                                    pct >
                                                        0
                                                        ? 2
                                                        : 0,
                                            }}
                                        />
                                    )}
                                </div>

                                <div
                                    style={{
                                        fontSize: 10,
                                        color:
                                            '#1e293b',
                                        lineHeight:
                                            '13px',
                                        minWidth: 0,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight:
                                                700,
                                            whiteSpace:
                                                'nowrap',
                                        }}
                                    >
                                        {formatMillions(
                                            item.value,
                                            currency
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            color: '#626b7a',
                                        }}
                                    >
                                        {formatPercent(
                                            item.percentage
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div
                        style={{
                            color: '#94a3b8',
                            fontSize: 13,
                            paddingTop: 25,
                        }}
                    >
                        No cost mix data available
                    </div>
                )}
            </div>
        </div>
    );
}

/* =========================================================
   DIRECT COST TABLE
========================================================= */

function DirectCostTable({
    rows,
    currency,
    onExpand,
    expanded,
    details,
    loadingDetails,
}) {
    return (
        <div
            style={{
                overflowX: 'auto',
            }}
        >
            <table
                className="cost-structure-table"
                style={{
                    width: '100%',
                    borderCollapse:
                        'collapse',
                    tableLayout: 'fixed',
                    fontSize: 11,
                }}
            >
                <thead>
                    <tr
                        style={{
                            background: '#fff',
                        }}
                    >
                        <th
                            style={{
                                width: 30,
                                borderTop:
                                    '1px solid #e4e9ef',
                                borderBottom:
                                    '1px solid #e4e9ef',
                            }}
                        />

                        {[
                            'Cost Category',
                            'Actual PTD',
                            'Target PTD',
                            'Variance PTD',
                            'Actual YTD',
                            'Target YTD',
                            'Variance YTD',
                        ].map((h) => (
                            <th
                                key={h}
                                style={{
                                    padding: 8,
                                    textAlign:
                                        h ===
                                            'Cost Category'
                                            ? 'left'
                                            : 'right',
                                    fontWeight: 700,
                                    fontSize: 10,
                                    color: '#173b68',
                                    background: '#fff',
                                    borderRight:
                                        '1px solid #e4e9ef',
                                    borderBottom:
                                        '1px solid #e4e9ef',
                                    whiteSpace:
                                        'nowrap',
                                }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {rows.map(
                        (
                            row,
                            index
                        ) => {
                            const category =
                                getLabel(
                                    row
                                );

                            const categoryTooltip =
                                category.trim().toLowerCase() === 'direct expenses'
                                    ? 'Direct Expenses includes Direct Labour, Manufacturing/Direct Overheads, Overhead Absorption and Direct Expenses–RKME.'
                                    : undefined;

                            const key =
                                `${category}-${index}`;

                            const isOpen =
                                !!expanded[
                                key
                                ];

                            const ptd =
                                getPTD(
                                    row
                                );

                            const ytd =
                                getYTD(
                                    row
                                );

                            const rowDetails =
                                details?.[
                                category
                                ] || [];

                            const rowLoading =
                                !!loadingDetails?.[
                                category
                                ];

                            return (
                                <React.Fragment
                                    key={
                                        key
                                    }
                                >
                                    <tr
                                        style={{
                                            borderBottom:
                                                '1px solid #edf0f4',
                                            background:
                                                '#fff',
                                        }}
                                    >
                                        <td
                                            style={{
                                                textAlign:
                                                    'center',
                                                padding:
                                                    '9px 3px',
                                                borderRight:
                                                    '1px solid #edf0f4',
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onExpand(
                                                        row,
                                                        key
                                                    )
                                                }
                                                style={{
                                                    border: 0,
                                                    background:
                                                        'transparent',
                                                    padding:
                                                        0,
                                                    cursor:
                                                        'pointer',
                                                    color:
                                                        '#364152',
                                                    display:
                                                        'inline-flex',
                                                }}
                                            >
                                                {isOpen ? (
                                                    <ChevronDown
                                                        size={
                                                            13
                                                        }
                                                    />
                                                ) : (
                                                    <ChevronRight
                                                        size={
                                                            13
                                                        }
                                                    />
                                                )}
                                            </button>
                                        </td>

                                        <td
                                            style={{
                                                padding:
                                                    '9px 8px',
                                                textAlign:
                                                    'left',
                                                color:
                                                    '#344054',
                                                borderRight:
                                                    '1px solid #edf0f4',
                                            }}
                                        >
                                            <span title={categoryTooltip}>
                                                {category}
                                                {categoryTooltip ? (
                                                    <span
                                                        style={{
                                                            marginLeft: 5,
                                                            display: 'inline-flex',
                                                            width: 14,
                                                            height: 14,
                                                            borderRadius: '50%',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: '#eee7ff',
                                                            color: '#7040dc',
                                                            fontSize: 9,
                                                            fontWeight: 800,
                                                            cursor: 'help',
                                                        }}
                                                    >i</span>
                                                ) : null}
                                            </span>
                                        </td>

                                        <td
                                            style={{
                                                padding:
                                                    '9px 8px',
                                                textAlign:
                                                    'right',
                                                color:
                                                    valueColor(
                                                        ptd
                                                    ),
                                                borderRight:
                                                    '1px solid #edf0f4',
                                            }}
                                        >
                                            {formatTableMoney(
                                                ptd,
                                                currency
                                            )}
                                        </td>

                                        <td
                                            style={{
                                                padding:
                                                    '9px 8px',
                                                textAlign:
                                                    'right',
                                                color:
                                                    valueColor(
                                                        getTargetPTD(
                                                            row
                                                        )
                                                    ),
                                                borderRight:
                                                    '1px solid #edf0f4',
                                            }}
                                        >
                                            {formatTableMoney(
                                                getTargetPTD(
                                                    row
                                                ),
                                                currency
                                            )}
                                        </td>

                                        <td
                                            style={{
                                                padding:
                                                    '9px 8px',
                                                textAlign:
                                                    'right',
                                                color:
                                                    valueColor(
                                                        getVariancePTD(
                                                            row
                                                        )
                                                    ),
                                                borderRight:
                                                    '1px solid #edf0f4',
                                            }}
                                        >
                                            {formatTableMoney(
                                                getVariancePTD(
                                                    row
                                                ),
                                                currency
                                            )}
                                        </td>

                                        <td
                                            style={{
                                                padding:
                                                    '9px 8px',
                                                textAlign:
                                                    'right',
                                                color:
                                                    valueColor(
                                                        ytd
                                                    ),
                                                borderRight:
                                                    '1px solid #edf0f4',
                                            }}
                                        >
                                            {formatTableMoney(
                                                ytd,
                                                currency
                                            )}
                                        </td>

                                        <td
                                            style={{
                                                padding:
                                                    '9px 8px',
                                                textAlign:
                                                    'right',
                                                color:
                                                    valueColor(
                                                        getTargetYTD(
                                                            row
                                                        )
                                                    ),
                                                borderRight:
                                                    '1px solid #edf0f4',
                                            }}
                                        >
                                            {formatTableMoney(
                                                getTargetYTD(
                                                    row
                                                ),
                                                currency
                                            )}
                                        </td>

                                        <td
                                            style={{
                                                padding:
                                                    '9px 8px',
                                                textAlign:
                                                    'right',
                                                color:
                                                    valueColor(
                                                        getVarianceYTD(
                                                            row
                                                        )
                                                    ),
                                            }}
                                        >
                                            {formatTableMoney(
                                                getVarianceYTD(
                                                    row
                                                ),
                                                currency
                                            )}
                                        </td>
                                    </tr>


                                    {isOpen && (
                                        <tr
                                            style={{
                                                background:
                                                    '#fafbfd',
                                            }}
                                        >
                                            <td
                                                colSpan={
                                                    8
                                                }
                                                style={{
                                                    padding:
                                                        0,
                                                }}
                                            >
                                                {rowLoading ? (
                                                    <div
                                                        style={{
                                                            padding:
                                                                '12px 28px',
                                                            color:
                                                                '#64748b',
                                                            fontSize: 11,
                                                        }}
                                                    >
                                                        Loading account
                                                        details…
                                                    </div>
                                                ) : rowDetails.length ? (
                                                    <div>
                                                        <table
                                                            className="cost-structure-table"
                                                            style={{
                                                                width: '100%',
                                                                borderCollapse:
                                                                    'collapse',
                                                                fontSize: 11,
                                                            }}
                                                        >
                                                            <thead>
                                                                <tr>
                                                                    <th
                                                                        style={{
                                                                            padding:
                                                                                '7px 10px 7px 42px',
                                                                            textAlign:
                                                                                'left',
                                                                            color:
                                                                                '#173b68',
                                                                            background:
                                                                                '#fff',
                                                                            fontWeight:
                                                                                700,
                                                                        }}
                                                                    >
                                                                        Account Code
                                                                    </th>

                                                                    <th
                                                                        style={{
                                                                            padding: 7,
                                                                            textAlign:
                                                                                'left',
                                                                            color:
                                                                                '#173b68',
                                                                            background:
                                                                                '#fff',
                                                                            fontWeight:
                                                                                700,
                                                                        }}
                                                                    >
                                                                        Account Name
                                                                    </th>

                                                                    <th
                                                                        style={{
                                                                            padding: 7,
                                                                            textAlign:
                                                                                'right',
                                                                            color:
                                                                                '#173b68',
                                                                            background:
                                                                                '#fff',
                                                                            fontWeight:
                                                                                700,
                                                                        }}
                                                                    >
                                                                        Actual PTD
                                                                    </th>

                                                                    <th
                                                                        style={{
                                                                            padding: 7,
                                                                            textAlign:
                                                                                'right',
                                                                            color:
                                                                                '#173b68',
                                                                            background:
                                                                                '#fff',
                                                                            fontWeight:
                                                                                700,
                                                                        }}
                                                                    >
                                                                        Actual YTD
                                                                    </th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                {rowDetails.map(
                                                                    (
                                                                        detail,
                                                                        i
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                i
                                                                            }
                                                                            style={{
                                                                                borderTop:
                                                                                    '1px solid #edf0f4',
                                                                            }}
                                                                        >
                                                                            <td
                                                                                style={{
                                                                                    padding:
                                                                                        '7px 10px 7px 42px',
                                                                                    textAlign:
                                                                                        'left',
                                                                                    color:
                                                                                        '#475569',
                                                                                }}
                                                                            >
                                                                                {getValue(
                                                                                    detail,
                                                                                    [
                                                                                        'account_code',
                                                                                        'accountCode',
                                                                                        'code',
                                                                                        'account',
                                                                                    ]
                                                                                ) ??
                                                                                    '—'}
                                                                            </td>

                                                                            <td
                                                                                style={{
                                                                                    padding: 7,
                                                                                    textAlign:
                                                                                        'left',
                                                                                    color:
                                                                                        '#475569',
                                                                                }}
                                                                            >
                                                                                {getValue(
                                                                                    detail,
                                                                                    [
                                                                                        'account_name',
                                                                                        'accountName',
                                                                                        'name',
                                                                                        'particulars',
                                                                                    ]
                                                                                ) ??
                                                                                    '—'}
                                                                            </td>

                                                                            <td
                                                                                style={{
                                                                                    padding: 7,
                                                                                    textAlign:
                                                                                        'right',
                                                                                    color:
                                                                                        valueColor(
                                                                                            getPTD(
                                                                                                detail
                                                                                            )
                                                                                        ),
                                                                                }}
                                                                            >
                                                                                {formatTableMoney(
                                                                                    getPTD(
                                                                                        detail
                                                                                    ),
                                                                                    currency
                                                                                )}
                                                                            </td>

                                                                            <td
                                                                                style={{
                                                                                    padding: 7,
                                                                                    textAlign:
                                                                                        'right',
                                                                                    color:
                                                                                        valueColor(
                                                                                            getYTD(
                                                                                                detail
                                                                                            )
                                                                                        ),
                                                                                }}
                                                                            >
                                                                                {formatTableMoney(
                                                                                    getYTD(
                                                                                        detail
                                                                                    ),
                                                                                    currency
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            padding:
                                                                '12px 28px',
                                                            color:
                                                                '#94a3b8',
                                                            fontSize: 11,
                                                        }}
                                                    >
                                                        No account details
                                                        returned by backend.
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        }
                    )}

                    {rows.length > 0 && (() => {
                        const totalPTD = sumNumbers(rows.map((row) => getPTD(row)));
                        const totalTargetPTD = sumNumbers(rows.map((row) => getTargetPTD(row)));
                        const totalVariancePTD = sumNumbers(rows.map((row) => getVariancePTD(row)));
                        const totalYTD = sumNumbers(rows.map((row) => getYTD(row)));
                        const totalTargetYTD = sumNumbers(rows.map((row) => getTargetYTD(row)));
                        const totalVarianceYTD = sumNumbers(rows.map((row) => getVarianceYTD(row)));
                        return (
                            <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                                <td style={{ textAlign: 'center', padding: '9px 3px', borderRight: '1px solid #edf0f4' }} />
                                <td style={{ padding: '9px 8px', color: '#182338', fontWeight: 800, borderRight: '1px solid #edf0f4' }}>Total Cost of Sales</td>
                                <td style={{ padding: '9px 8px', textAlign: 'right', color: valueColor(totalPTD), borderRight: '1px solid #edf0f4', fontWeight: 800 }}>{formatMoney(totalPTD, currency)}</td>
                                <td style={{ padding: '9px 8px', textAlign: 'right', color: valueColor(totalTargetPTD), borderRight: '1px solid #edf0f4', fontWeight: 800 }}>{formatMoney(totalTargetPTD, currency)}</td>
                                <td style={{ padding: '9px 8px', textAlign: 'right', color: valueColor(totalVariancePTD), borderRight: '1px solid #edf0f4', fontWeight: 800 }}>{formatMoney(totalVariancePTD, currency)}</td>
                                <td style={{ padding: '9px 8px', textAlign: 'right', color: valueColor(totalYTD), borderRight: '1px solid #edf0f4', fontWeight: 800 }}>{formatMoney(totalYTD, currency)}</td>
                                <td style={{ padding: '9px 8px', textAlign: 'right', color: valueColor(totalTargetYTD), borderRight: '1px solid #edf0f4', fontWeight: 800 }}>{formatMoney(totalTargetYTD, currency)}</td>
                                <td style={{ padding: '9px 8px', textAlign: 'right', color: valueColor(totalVarianceYTD), fontWeight: 800 }}>{formatMoney(totalVarianceYTD, currency)}</td>
                            </tr>
                        );
                    })()}

                    {!rows.length && (
                        <tr>
                            <td
                                colSpan={8}
                                style={{
                                    padding: 30,
                                    textAlign:
                                        'center',
                                    color:
                                        '#94a3b8',
                                }}
                            >
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}


/* =========================================================
   MODAL FILTERS
========================================================= */

const getOptionField = (option, keys) => {
    if (!option || typeof option !== 'object') return null;
    for (const key of keys) {
        if (option[key] !== undefined && option[key] !== null) return option[key];
    }
    return null;
};

const relationValueCandidates = (value) => {
    if (value === null || value === undefined || value === '') return [];
    if (Array.isArray(value)) {
        return value.flatMap(relationValueCandidates);
    }
    if (typeof value === 'object') {
        return [
            optionValue(value),
            value.id,
            value.value,
            value.code,
            value.name,
            value.label,
        ]
            .filter((v) => v !== null && v !== undefined && v !== '')
            .map(String);
    }
    return [String(value)];
};

const matchesSelectedRelation = (option, selectedValues, keys) => {
    const selected = asArray(selectedValues)
        .map(optionValue)
        .filter((v) => v !== 'All' && v !== 'all' && v !== '');

    if (!selected.length) return true;

    const related = getOptionField(option, keys);

    /*
     * If the backend supplies the hierarchy relation, filter against it.
     * When no relation field is present, keep the option rather than
     * incorrectly hiding valid values.
     */
    if (related === null || related === undefined || related === '') {
        return true;
    }

    const relatedValues = relationValueCandidates(related);
    return relatedValues.some((v) => selected.includes(String(v)));
};

const cascadeOptionsByAncestors = ({ options = [], relations = [] }) => {
    if (!Array.isArray(options)) return [];
    return options.filter((option) =>
        relations.every(({ selected, relationKeys }) =>
            matchesSelectedRelation(option, selected, relationKeys)
        )
    );
};


function ModalFilters({
    filters,
    setFilters,
    options,
    onApply,
    onReset,
    loading,
}) {
    const cascadingOptions = useMemo(() => ({
        legalGroups: options.legalGroups || [],
        legalEntities: cascadeOptionsByAncestors({
            options: options.legalEntities || [],
            relations: [
                {
                    selected: filters.legalGroupId,
                    relationKeys: ['legal_group_id', 'legalGroupId', 'legal_group_ids', 'legalGroupIds', 'group_id', 'groupId', 'legal_group', 'legalGroup'],
                },
            ],
        }),
        parentDivisions: cascadeOptionsByAncestors({
            options: options.parentDivisions || [],
            relations: [
                {
                    selected: filters.legalGroupId,
                    relationKeys: ['legal_group_id', 'legalGroupId', 'legal_group_ids', 'legalGroupIds', 'group_id', 'groupId', 'legal_group', 'legalGroup'],
                },
                {
                    selected: filters.legalEntityId,
                    relationKeys: ['legal_entity_id', 'legalEntityId', 'legal_entity_ids', 'legalEntityIds', 'entity_id', 'entityId', 'legal_entity', 'legalEntity'],
                },
            ],
        }),
        subdivisions: cascadeOptionsByAncestors({
            options: options.subdivisions || [],
            relations: [
                {
                    selected: filters.legalGroupId,
                    relationKeys: ['legal_group_id', 'legalGroupId', 'legal_group_ids', 'legalGroupIds', 'group_id', 'groupId', 'legal_group', 'legalGroup'],
                },
                {
                    selected: filters.legalEntityId,
                    relationKeys: ['legal_entity_id', 'legalEntityId', 'legal_entity_ids', 'legalEntityIds', 'entity_id', 'entityId', 'legal_entity', 'legalEntity'],
                },
                {
                    selected: filters.parentDivisionId,
                    relationKeys: ['parent_division_id', 'parentDivisionId', 'parent_division_ids', 'parentDivisionIds', 'division_id', 'divisionId', 'parent_division', 'parentDivision'],
                },
            ],
        }),
    }), [options, filters.legalGroupId, filters.legalEntityId, filters.parentDivisionId]);

    const updateMulti = (key, value) => {
        setFilters((prev) => {
            const next = { ...prev, [key]: value };
            if (key === 'legalGroupId') {
                next.legalEntityId = ['All'];
                next.parentDivisionId = ['All'];
                next.subdivisionId = ['All'];
            } else if (key === 'legalEntityId') {
                next.parentDivisionId = ['All'];
                next.subdivisionId = ['All'];
            } else if (key === 'parentDivisionId') {
                next.subdivisionId = ['All'];
            }
            return next;
        });
    };


    const removeChip = (
        key,
        item
    ) => {
        setFilters((prev) => {
            const next = asArray(
                prev[key]
            ).filter(
                (v) =>
                    String(v) !==
                    String(item)
            );

            return {
                ...prev,
                [key]: next.length
                    ? next
                    : ['All'],
            };
        });
    };


    return (
        <div
            style={{
                padding: '12px 16px',
                borderBottom:
                    '1px solid #e2e8f0',
                background:
                    '#fbfcfe',
            }}
        >
            <div
                className="cost-structure-filter-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns:
                        'repeat(8, minmax(105px, 1fr))',
                    gap: 10,
                }}
            >
                <FilterField label="Legal Group">
                    <CompactMultiSelect
                        options={
                            options.legalGroups
                        }
                        value={
                            filters.legalGroupId
                        }
                        onChange={(v) =>
                            updateMulti(
                                'legalGroupId',
                                v
                            )
                        }
                    />
                </FilterField>

                <FilterField label="Legal Entity">
                    <CompactMultiSelect
                        options={
                            cascadingOptions.legalEntities
                        }
                        value={
                            filters.legalEntityId
                        }
                        onChange={(v) =>
                            updateMulti(
                                'legalEntityId',
                                v
                            )
                        }
                    />
                </FilterField>

                <FilterField label="Parent Division">
                    <CompactMultiSelect
                        options={
                            cascadingOptions.parentDivisions
                        }
                        value={
                            filters.parentDivisionId
                        }
                        onChange={(v) =>
                            updateMulti(
                                'parentDivisionId',
                                v
                            )
                        }
                    />
                </FilterField>

                <FilterField label="Sub-Division">
                    <CompactMultiSelect
                        options={
                            cascadingOptions.subdivisions
                        }
                        value={
                            filters.subdivisionId
                        }
                        onChange={(v) =>
                            updateMulti(
                                'subdivisionId',
                                v
                            )
                        }
                    />
                </FilterField>

                <FilterField label="Year">
                    <select
                        value={
                            filters.year || ''
                        }
                        onChange={(e) =>
                            setFilters(
                                (p) => ({
                                    ...p,
                                    year:
                                        e.target
                                            .value,
                                })
                            )
                        }
                        style={
                            selectStyle
                        }
                    >
                        {options.years.map(
                            (y) => (
                                <option
                                    key={optionValue(
                                        y
                                    )}
                                    value={optionValue(
                                        y
                                    )}
                                >
                                    {optionLabel(
                                        y
                                    )}
                                </option>
                            )
                        )}
                    </select>
                </FilterField>

                <FilterField label="Period">
                    <select
                        value={
                            filters.periodName ||
                            ''
                        }
                        onChange={(e) =>
                            setFilters(
                                (p) => ({
                                    ...p,
                                    periodName:
                                        e.target
                                            .value,
                                })
                            )
                        }
                        style={
                            selectStyle
                        }
                    >
                        {options.periods.map(
                            (p) => (
                                <option
                                    key={optionValue(
                                        p
                                    )}
                                    value={optionValue(
                                        p
                                    )}
                                >
                                    {optionLabel(
                                        p
                                    )}
                                </option>
                            )
                        )}
                    </select>
                </FilterField>

                <FilterField label="Reporting Currency">
                    <select
                        value={
                            filters.currency ||
                            'AED'
                        }
                        onChange={(e) =>
                            setFilters(
                                (p) => ({
                                    ...p,
                                    currency:
                                        e.target
                                            .value,
                                })
                            )
                        }
                        style={
                            selectStyle
                        }
                    >
                        {options.currencies.map(
                            (c) => (
                                <option
                                    key={optionValue(
                                        c
                                    )}
                                    value={optionValue(
                                        c
                                    )}
                                >
                                    {optionLabel(
                                        c
                                    )}
                                </option>
                            )
                        )}
                    </select>
                </FilterField>

                <div
                    style={{
                        display: 'flex',
                        alignItems:
                            'flex-end',
                        gap: 7,
                    }}
                >
                    <button
                        type="button"
                        onClick={onApply}
                        disabled={loading}
                        style={
                            applyButtonStyle
                        }
                    >
                        {loading
                            ? 'Loading…'
                            : 'Apply'}
                    </button>

                    <button
                        type="button"
                        onClick={onReset}
                        disabled={loading}
                        style={
                            resetButtonStyle
                        }
                    >
                        Reset
                    </button>
                </div>
            </div>

        </div>
    );
}


/* =========================================================
   BASIC UI
========================================================= */

function FilterField({
    label,
    children,
}) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection:
                    'column',
                gap: 4,
            }}
        >
            <span
                style={{
                    fontSize: 11,
                    color: '#1e3a8a',
                    fontWeight: 700,
                }}
            >
                {label}
            </span>

            {children}
        </div>
    );
}


const selectStyle = {
    width: '100%',
    minHeight: 34,
    padding: '6px 9px',
    border: `1px solid ${C.border}`,
    borderRadius: 7,
    background: '#fff',
    color: '#334155',
    fontSize: 13,
    outline: 'none',
};


const applyButtonStyle = {
    minHeight: 34,
    padding: '0 15px',
    border: 0,
    borderRadius: 7,
    background: C.primary,
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
};


const resetButtonStyle = {
    minHeight: 34,
    padding: '0 8px',
    border: 0,
    background: 'transparent',
    color: '#64748b',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
};


function TabButton({
    active,
    children,
    onClick,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                border: 0,
                borderBottom:
                    `2px solid ${active
                        ? C.primary
                        : 'transparent'
                    }`,
                background:
                    'transparent',
                padding:
                    '10px 13px',
                color: active
                    ? C.primary
                    : '#64748b',
                fontSize: 13,
                fontWeight: active
                    ? 800
                    : 600,
                cursor: 'pointer',
            }}
        >
            {children}
        </button>
    );
}


function Modal({
    children,
    onClose,
}) {
    const bodyRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener(
            'keydown',
            handler
        );

        const prevOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            'hidden';

        if (overlayRef.current) {
            overlayRef.current.scrollTop = 0;
        }

        if (bodyRef.current) {
            bodyRef.current.scrollTop = 0;
        }

        return () => {
            document.removeEventListener(
                'keydown',
                handler
            );

            document.body.style.overflow =
                prevOverflow;
        };
    }, [onClose]);

    const modalContent = (
        <div
            ref={overlayRef}
            onClick={(e) => {
                if (
                    e.target ===
                    e.currentTarget
                ) {
                    onClose();
                }
            }}
            style={{
                position: 'fixed',
                inset: 0,
                background:
                    'rgba(15,23,42,0.45)',
                backdropFilter:
                    'blur(6px)',
                WebkitBackdropFilter:
                    'blur(6px)',
                display: 'flex',
                alignItems:
                    'flex-start',
                justifyContent:
                    'center',
                padding: 0,
                overflowY: 'auto',
                minHeight: '100vh',
                zIndex: 99999,
                animation:
                    'fadeIn 0.18s ease',
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 0,
                    width: '98%',
                    maxWidth: 1500,
                    height: '90vh',
                    maxHeight: '90vh',
                    minHeight: 0,
                    display: 'flex',
                    flexDirection:
                        'column',
                    boxShadow:
                        '0 24px 48px rgba(0,0,0,0.18)',
                    animation:
                        'modalPop 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards',
                    overflow: 'hidden',
                    border:
                        '1px solid #e2e8f0',
                    marginTop: '5vh',
                    flexShrink: 0,
                    boxSizing: 'border-box',
                }}
            >
                {/* Modal Body */}
                <div
                    ref={bodyRef}
                    style={{
                        flex: '1 1 auto',
                        minHeight: 0,
                        minWidth: 0,
                        overflowY: 'auto',
                        overflowX: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        boxSizing: 'border-box',
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );

    return typeof document !==
        'undefined'
        ? createPortal(
            modalContent,
            document.body
        )
        : modalContent;
}


/* =========================================================
   VIEW ALL CONTENT
========================================================= */

function ViewAllContent({
    tab,
    setTab,
    filters,
    setFilters,
    options,
    loading,
    classification,
    breakdown,
    monthly,
    expanded,
    detailMap,
    detailLoading,
    onExpand,
    onApply,
    onReset,
    onExport,
    exporting,
    currency,
}) {
    const classificationRows =
        unwrapRows(
            classification
        );

    const monthlyRows =
        unwrapRows(monthly);

    const breakdownRows =
        unwrapRows(breakdown);


    const classificationPeriodRows =
        normalizeCategoryMonthlyRows(classificationRows);

    const monthlyPeriodRows =
        normalizeDirectCostMonthlyRows(monthlyRows);

    /*
     * Both monthly endpoints can be period-oriented or category-oriented.
     * Normalize them into one consistent period -> category shape before
     * rendering, so the UI always matches the backend response.
     */
    const chartRows =
        monthlyPeriodRows.length
            ? monthlyPeriodRows
            : classificationPeriodRows;

    const modalSummary = normalizeSummary(
        classification,
        breakdown,
        currency,
        filters?.periodName || ''
    );


    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
                minHeight: '100%',
                overflow: 'hidden',
                boxSizing: 'border-box',
            }}
        >
            <ModalFilters
                filters={filters}
                setFilters={
                    setFilters
                }
                options={options}
                onApply={onApply}
                onReset={onReset}
                loading={loading}
            />

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 12,
                    padding: '12px 16px 10px',
                    background: '#fff',
                }}
                className="cost-structure-summary-grid"
            ><ViewAllCostCard
                    title="Cost of Material"
                    ptd={modalSummary.material.ptd}
                    ytd={modalSummary.material.ytd}
                    color="#8ddfd0"
                    bg="#f5fdfb"
                    icon={Package}
                    loading={loading}
                    currency={currency}
                />

                <ViewAllCostCard
                    title="Direct Expenses"
                    ptd={modalSummary.direct.ptd}
                    ytd={modalSummary.direct.ytd}
                    color="#b49bea"
                    bg="#faf8ff"
                    icon={BarChart3}
                    loading={loading}
                    currency={currency}
                />

                <ViewAllCostCard
                    title="Operating Expenses"
                    ptd={modalSummary.operating.ptd}
                    ytd={modalSummary.operating.ytd}
                    color="#f5bd8b"
                    bg="#fffaf5"
                    icon={ShoppingBag}
                    loading={loading}
                    currency={currency}
                />
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems:
                        'center',
                    justifyContent:
                        'space-between',
                    borderBottom:
                        '1px solid #e2e8f0',
                    padding:
                        '0 16px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: 3,
                    }}
                >
                    <TabButton
                        active={
                            tab ===
                            'classification'
                        }
                        onClick={() =>
                            setTab(
                                'classification'
                            )
                        }
                    >
                        Cost Classification
                    </TabButton>

                    <TabButton
                        active={
                            tab ===
                            'breakdown'
                        }
                        onClick={() =>
                            setTab(
                                'breakdown'
                            )
                        }
                    >
                        Direct Cost Drill-Down
                    </TabButton>

                    <TabButton
                        active={
                            tab ===
                            'monthly'
                        }
                        onClick={() =>
                            setTab(
                                'monthly'
                            )
                        }
                    >
                        Month-on-Month
                    </TabButton>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: 6,
                    }}
                >
                    <button
                        type="button"
                        onClick={() =>
                            onExport(
                                'excel'
                            )
                        }
                        disabled={
                            !!exporting
                        }
                        style={exportButton(
                            '#f1fbf8',
                            '#168f7a',
                            '#dcefe9'
                        )}
                    >
                        <FileSpreadsheet
                            size={14}
                        />
                        Excel
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onExport(
                                'pdf'
                            )
                        }
                        disabled={
                            !!exporting
                        }
                        style={exportButton(
                            '#fff3f5',
                            '#d34b68',
                            '#f4dce1'
                        )}
                    >
                        <FileText
                            size={14}
                        />
                        PDF
                    </button>
                </div>
            </div>

            <div
                style={{
                    overflowX: 'auto',
                    overflowY: 'visible',
                    padding: 16,
                    boxSizing: 'border-box',
                    minWidth: 0,
                }}
            >
                {loading ? (
                    <div
                        style={{
                            padding: 60,
                            textAlign:
                                'center',
                            color:
                                '#64748b',
                            fontSize: 13,
                        }}
                    >
                        Loading cost structure data…
                    </div>
                ) : tab ===
                    'classification' ? (
                    <ClassificationTab
                        rows={
                            classificationPeriodRows
                        }
                        currency={
                            currency
                        }
                    />
                ) : tab ===
                    'breakdown' ? (
                    <DirectCostTable
                        rows={
                            breakdownRows
                        }
                        currency={
                            currency
                        }
                        expanded={
                            expanded
                        }
                        details={
                            detailMap
                        }
                        loadingDetails={
                            detailLoading
                        }
                        onExpand={
                            onExpand
                        }
                    />
                ) : (
                    <MonthlyTab
                        rows={
                            chartRows
                        }
                        chartRows={
                            chartRows
                        }
                        currency={
                            currency
                        }
                    />
                )}
            </div>
        </div>
    );
}


/* =========================================================
   CLASSIFICATION TAB
========================================================= */

function ClassificationTab({
    rows,
    currency,
}) {
    return (
        <div
            style={{
                minHeight: '100%',
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: C.navy,
                    marginBottom: 10,
                }}
            >
                Cost Classification
            </div>

            <div
                style={{
                    overflowX: 'auto',
                }}
            >
                <table
                    className="cost-structure-table"
                    style={{
                        width: '100%',
                        borderCollapse:
                            'collapse',
                        fontSize: 12,
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                background:
                                    '#fff',
                            }}
                        >
                            <th
                                style={
                                    modalThLeft
                                }
                            >
                                Period
                            </th>

                            <th
                                style={
                                    modalTh
                                }
                            >
                                Cost of Material
                            </th>

                            <th
                                style={
                                    modalTh
                                }
                                title="Direct Expenses includes Direct Labour, Manufacturing/Direct Overheads, Overhead Absorption and Direct Expenses–RKME."
                            >
                                Direct Expenses
                            </th>

                            <th
                                style={
                                    modalTh
                                }
                            >
                                Operating Expenses
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map(
                            (
                                row,
                                i
                            ) => (
                                <tr
                                    key={
                                        i
                                    }
                                >
                                    <td
                                        style={
                                            modalTdLeft
                                        }
                                    >
                                        {getPeriod(
                                            row
                                        )}
                                    </td>

                                    <td
                                        style={{
                                            ...modalTd,
                                            color: valueColor(
                                                getValue(
                                                    row,
                                                    [
                                                        'cost_of_material',
                                                        'cost_of_material_ptd',
                                                        'material',
                                                        'material_ptd',
                                                    ]
                                                )
                                            ),
                                        }}
                                    >
                                        {formatTableMoney(
                                            getValue(
                                                row,
                                                [
                                                    'cost_of_material',
                                                    'cost_of_material_ptd',
                                                    'material',
                                                    'material_ptd',
                                                ]
                                            )
                                        )}
                                    </td>

                                    <td
                                        style={{
                                            ...modalTd,
                                            color: valueColor(
                                                getValue(
                                                    row,
                                                    [
                                                        'direct_expenses',
                                                        'direct_expenses_ptd',
                                                        'direct',
                                                        'direct_ptd',
                                                    ]
                                                )
                                            ),
                                        }}
                                    >
                                        {formatTableMoney(
                                            getValue(
                                                row,
                                                [
                                                    'direct_expenses',
                                                    'direct_expenses_ptd',
                                                    'direct',
                                                    'direct_ptd',
                                                ]
                                            )
                                        )}
                                    </td>

                                    <td
                                        style={{
                                            ...modalTd,
                                            color: valueColor(
                                                getValue(
                                                    row,
                                                    [
                                                        'operating_expenses',
                                                        'operating_expenses_ptd',
                                                        'operating',
                                                        'operating_ptd',
                                                    ]
                                                )
                                            ),
                                        }}
                                    >
                                        {formatTableMoney(
                                            getValue(
                                                row,
                                                [
                                                    'operating_expenses',
                                                    'operating_expenses_ptd',
                                                    'operating',
                                                    'operating_ptd',
                                                ]
                                            )
                                        )}
                                    </td>
                                </tr>
                            )
                        )}

                        {rows.length > 0 && (() => {
                            const totalMaterial = sumNumbers(rows.map((row) => getValue(row, ['cost_of_material', 'cost_of_material_ptd', 'material', 'material_ptd'])));
                            const totalDirect = sumNumbers(rows.map((row) => getValue(row, ['direct_expenses', 'direct_expenses_ptd', 'direct', 'direct_ptd'])));
                            const totalOperating = sumNumbers(rows.map((row) => getValue(row, ['operating_expenses', 'operating_expenses_ptd', 'operating', 'operating_ptd'])));
                            return (
                                <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                                    <td style={{ ...modalTdLeft, fontWeight: 800 }}>Total</td>
                                    <td style={{ ...modalTd, fontWeight: 800, color: valueColor(totalMaterial) }}>{formatTableMoney(totalMaterial)}</td>
                                    <td style={{ ...modalTd, fontWeight: 800, color: valueColor(totalDirect) }}>{formatTableMoney(totalDirect)}</td>
                                    <td style={{ ...modalTd, fontWeight: 800, color: valueColor(totalOperating) }}>{formatTableMoney(totalOperating)}</td>
                                </tr>
                            );
                        })()}

                        {!rows.length && (
                            <tr>
                                <td
                                    colSpan={
                                        4
                                    }
                                    style={{
                                        padding: 30,
                                        textAlign:
                                            'center',
                                        color:
                                            '#94a3b8',
                                    }}
                                >
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


/* =========================================================
   MONTHLY TAB
========================================================= */

function MonthlyTab({
    rows,
    chartRows,
    currency,
}) {
    return (
        <div>
            <div
                style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: C.navy,
                    marginBottom: 10,
                }}
            >
                Month-on-Month Cost Classification
            </div>

            <div
                className="cost-structure-chart"
                style={{
                    height: 'clamp(280px, 42vh, 420px)',
                    minHeight: 300,
                    marginBottom: 16,
                }}
            >
                {chartRows.length ? (
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <BarChart
                            data={
                                chartRows
                            }
                            margin={{
                                top: 10,
                                right: 20,
                                left: 0,
                                bottom: 8,
                            }}
                            barGap={8}
                            barCategoryGap="20%"
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={
                                    false
                                }
                                stroke="#edf0f4"
                            />

                            <XAxis
                                dataKey="period"
                                tick={{
                                    fontSize: 12,
                                    fill: '#687386',
                                }}
                                axisLine={{
                                    stroke: '#dfe5ec',
                                }}
                                tickLine={false}
                            />

                            <YAxis
                                tick={{
                                    fontSize: 12,
                                    fill: '#8b94a3',
                                }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(
                                    v
                                ) =>
                                    Number(v) === 0
                                        ? '0'
                                        : `${(
                                            Number(
                                                v
                                            ) /
                                            1000000
                                        ).toFixed(
                                            0
                                        )}M`
                                }
                            />

                            <Tooltip
                                formatter={(
                                    value
                                ) =>
                                    formatMoney(
                                        value,
                                        currency
                                    )
                                }
                                contentStyle={{
                                    borderRadius: 8,
                                    border:
                                        '1px solid #e2e8f0',
                                    fontSize: 11,
                                    boxShadow:
                                        '0 8px 24px rgba(15,23,42,.12)',
                                }}
                            />

                            <Legend
                                verticalAlign="bottom"
                                height={24}
                                wrapperStyle={{
                                    fontSize: 11,
                                    paddingTop: 4,
                                }}
                            />

                            <Bar
                                dataKey="material"
                                name="Cost of Material"
                                fill="#19b99d"
                                barSize={14}
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="labour"
                                name="Direct Labour"
                                fill="#7040dc"
                                barSize={14}
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="manufacturing"
                                name="Manufacturing / Direct Overheads"
                                fill="#8b5cf6"
                                barSize={14}
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="absorption"
                                name="Overhead Absorption"
                                fill="#f59e0b"
                                barSize={14}
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="rkme"
                                name="Direct Expenses - RKME"
                                fill="#f47d20"
                                barSize={14}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div
                        style={{
                            height: '100%',
                            display: 'flex',
                            alignItems:
                                'center',
                            justifyContent:
                                'center',
                            color:
                                '#94a3b8',
                        }}
                    >
                        No data available
                    </div>
                )}
            </div>

            <div
                style={{
                    overflowX: 'auto',
                }}
            >
                <table
                    className="cost-structure-table"
                    style={{
                        width: '100%',
                        borderCollapse:
                            'collapse',
                        fontSize: 13,
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                background:
                                    '#fff',
                            }}
                        >
                            <th
                                style={
                                    modalThLeft
                                }
                            >
                                Period
                            </th>

                            <th style={modalTh}>Cost of Material</th>
                            <th style={modalTh}>Direct Labour</th>
                            <th style={modalTh}>Manufacturing / Direct Overheads</th>
                            <th style={modalTh}>Overhead Absorption</th>
                            <th style={modalTh}>Direct Expenses - RKME</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map(
                            (
                                row,
                                i
                            ) => (
                                <tr
                                    key={
                                        i
                                    }
                                >
                                    <td
                                        style={
                                            modalTdLeft
                                        }
                                    >
                                        {getPeriod(
                                            row
                                        )}
                                    </td>

                                    <td style={{ ...modalTd, color: valueColor(row.material) }}>{formatTableMoney(row.material)}</td>
                                    <td style={{ ...modalTd, color: valueColor(row.labour) }}>{formatTableMoney(row.labour)}</td>
                                    <td style={{ ...modalTd, color: valueColor(row.manufacturing) }}>{formatTableMoney(row.manufacturing)}</td>
                                    <td style={{ ...modalTd, color: valueColor(row.absorption) }}>{formatTableMoney(row.absorption)}</td>
                                    <td style={{ ...modalTd, color: valueColor(row.rkme) }}>{formatTableMoney(row.rkme)}</td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


/* ===================ABLE STYLES
========================================================= */

const modalTh = {
    padding: '8px 10px',
    textAlign: 'right',
    color: '#173b68',
    background: '#fff',
    fontWeight: 700,
    borderBottom:
        '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
};


const modalThLeft = {
    ...modalTh,
    textAlign: 'left',
};


const modalTd = {
    padding: '8px 10px',
    textAlign: 'right',
    color: '#334155',
    borderBottom:
        '1px solid #f1f5f9',
    whiteSpace: 'nowrap',
};


const modalTdLeft = {
    ...modalTd,
    textAlign: 'left',
};


const exportButton = (
    background,
    color,
    border
) => ({
    height: 31,
    padding: '0 11px',
    borderRadius: 7,
    border: `1px solid ${border}`,
    background,
    color,
    fontSize: 12,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    cursor: 'pointer',
});


/* =========================================================
   SUMMARY NORMALIZATION
========================================================= */

function normalizeSummary(
    classification,
    breakdown,
    currency,
    periodName = ''
) {
    /*
     * The cost-classification-monthly backend response is shaped like:
     *
     * {
     *   category: "Cost of Material",
     *   monthly_actual: { "Jan-26": "56057542.41" },
     *   actual_ytd: "56057542.41",
     *   monthly_target: { "Jan-26": null },
     *   target_ytd: null
     * }
     *
     * IMPORTANT:
     * Do not read PTD from `actual_ptd` here because that field does
     * not exist in this response. PTD must come from monthly_actual
     * for the currently selected period.
     *
     * Also, do not use the last row as a fallback for a different
     * category. That can make one KPI display another category's value.
     */

    const classRows = unwrapRows(classification);

    const findCategory = (name) =>
        classRows.find(
            (row) =>
                getLabel(row).trim().toLowerCase() ===
                name.toLowerCase()
        );

    const getMonthlyValue = (row, objectKeys, directKeys = []) => {
        if (!row || typeof row !== 'object') {
            return null;
        }

        for (const key of objectKeys) {
            const monthly = row[key];

            if (
                monthly &&
                typeof monthly === 'object' &&
                !Array.isArray(monthly)
            ) {
                /*
                 * Prefer the selected period. If the selected period
                 * is not present (for example during initial loading),
                 * use the first available month from the backend
                 * response rather than returning a wrong category value.
                 */
                if (
                    periodName &&
                    Object.prototype.hasOwnProperty.call(
                        monthly,
                        periodName
                    )
                ) {
                    return monthly[periodName];
                }

                const availablePeriods = Object.keys(monthly);

                if (availablePeriods.length) {
                    return monthly[availablePeriods[0]];
                }
            }
        }

        return getValue(row, directKeys);
    };

    const getTargetMonthlyValue = (row) => {
        if (!row || typeof row !== 'object') {
            return null;
        }

        const monthlyTarget = row.monthly_target;

        if (
            monthlyTarget &&
            typeof monthlyTarget === 'object' &&
            !Array.isArray(monthlyTarget)
        ) {
            if (
                periodName &&
                Object.prototype.hasOwnProperty.call(
                    monthlyTarget,
                    periodName
                )
            ) {
                return monthlyTarget[periodName];
            }

            const availablePeriods = Object.keys(monthlyTarget);

            if (availablePeriods.length) {
                return monthlyTarget[availablePeriods[0]];
            }
        }

        return getValue(row, [
            'target_ptd',
            'target_period',
            'target',
        ]);
    };

    const buildCategory = (name) => {
        const row = findCategory(name);

        if (!row) {
            return {
                ptd: null,
                ytd: null,
                target: null,
            };
        }

        return {
            ptd: getMonthlyValue(
                row,
                [
                    'monthly_actual',
                    'monthly_actual_aed',
                ],
                [
                    'actual_ptd',
                    'actual_ptd_aed',
                    'current_ptd',
                    'current_ptd_aed',
                    'ptd',
                    'ptd_value',
                    'value',
                    'amount',
                ]
            ),

            ytd: getValue(row, [
                'actual_ytd',
                'actual_ytd_aed',
                'current_ytd',
                'current_ytd_aed',
                'ytd',
                'ytd_value',
                'ytd_aed',
            ]),

            target: getTargetMonthlyValue(row),
        };
    };

    return {
        material: buildCategory('Cost of Material'),

        direct: buildCategory('Direct Expenses'),

        operating: buildCategory('Operating Expenses'),

        currency,
    };
}



/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CostStructureAnalysis({
    filters = {},
    filterOptions = {},
    onToast,
}) {
    const [
        classification,
        setClassification,
    ] = useState(null);

    const [
        breakdown,
        setBreakdown,
    ] = useState(null);

    const [
        monthly,
        setMonthly,
    ] = useState(null);

    const [
        modalClassification,
        setModalClassification,
    ] = useState(null);

    const [
        modalBreakdown,
        setModalBreakdown,
    ] = useState(null);

    const [
        modalMonthly,
        setModalMonthly,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState(null);

    const [
        modalOpen,
        setModalOpen,
    ] = useState(false);

    const [
        actionMenuOpen,
        setActionMenuOpen,
    ] = useState(false);

    const [
        modalTab,
        setModalTab,
    ] = useState(
        'classification'
    );

    const [
        modalFilters,
        setModalFilters,
    ] = useState(null);

    const [
        modalOptions,
        setModalOptions,
    ] = useState(emptyOptions);

    const [
        modalLoading,
        setModalLoading,
    ] = useState(false);

    const [
        detailMap,
        setDetailMap,
    ] = useState({});

    const [
        detailLoading,
        setDetailLoading,
    ] = useState({});

    const [
        expanded,
        setExpanded,
    ] = useState({});

    const [
        mainDetailMap,
        setMainDetailMap,
    ] = useState({});

    const [
        mainDetailLoading,
        setMainDetailLoading,
    ] = useState({});

    const [
        mainExpanded,
        setMainExpanded,
    ] = useState({});

    const [
        exporting,
        setExporting,
    ] = useState(null);


    /* =====================================================
       BASE FILTERS
    ===================================================== */

    const baseFilters = useMemo(
        () => ({
            legalGroupId:
                asArray(
                    filters.legalGroupId
                ).length
                    ? [
                        ...asArray(
                            filters.legalGroupId
                        ),
                    ]
                    : ['All'],

            legalEntityId:
                asArray(
                    filters.legalEntityId
                ).length
                    ? [
                        ...asArray(
                            filters.legalEntityId
                        ),
                    ]
                    : ['All'],

            parentDivisionId:
                asArray(
                    filters.parentDivisionId
                ).length
                    ? [
                        ...asArray(
                            filters.parentDivisionId
                        ),
                    ]
                    : ['All'],

            subdivisionId:
                asArray(
                    filters.subdivisionId
                ).length
                    ? [
                        ...asArray(
                            filters.subdivisionId
                        ),
                    ]
                    : ['All'],

            year:
                filters.year || '',

            /*
             * Backend requires period_name for both
             * cost-classification-monthly and
             * direct-cost-breakdown.
             *
             * Keep the selected page filter when available.
             * During the first render, fall back to the first
             * period supplied by the backend filter options.
             * Do not call the APIs with an empty period.
             */
            periodName:
                filters.periodName ||
                optionValue(
                    filterOptions?.periods?.[0] ??
                    ''
                ),

            currency:
                filters.currency ||
                optionValue(
                    filterOptions?.currencies?.[0] ??
                    'AED'
                ),
        }),
        [filters, filterOptions]
    );


    /* =====================================================
       LOAD MAIN DATA
    ===================================================== */

    const loadMain =
        useCallback(
            async () => {
                /*
                 * Both backend endpoints require period_name.
                 * The parent P&L filters may be empty for the first
                 * render while filter-options are still loading.
                 * Skip that render instead of sending:
                 *   ?currency=AED
                 */
                if (!baseFilters.periodName) {
                    setLoading(false);
                    return;
                }

                setLoading(true);
                setError(null);

                try {
                    const [
                        classificationResult,
                        breakdownResult,
                    ] =
                        await Promise.all([
                            fetchPLCostClassificationMonthly(
                                baseFilters
                            ),

                            fetchPLDirectCostBreakdown(
                                baseFilters
                            ),
                        ]);

                    setClassification(
                        classificationResult
                    );

                    setBreakdown(
                        breakdownResult
                    );

                    /*
                     * Monthly chart uses the same
                     * backend cost-classification
                     * monthly response.
                     */
                    setMonthly(
                        classificationResult
                    );
                } catch (err) {
                    console.error(
                        '[CostStructureAnalysis] load failed:',
                        err
                    );

                    setError(
                        err?.message ||
                        'Failed to load Cost Structure Analysis.'
                    );
                } finally {
                    setLoading(false);
                }
            },
            [baseFilters]
        );


    useEffect(() => {
        loadMain();
    }, [loadMain]);


    /* =====================================================
       LOAD VIEW ALL DATA
    ===================================================== */

    const loadModal =
        useCallback(
            async (
                nextFilters
            ) => {
                /*
                 * Do not hit the backend until a period is available.
                 * Both classification and direct-cost breakdown require
                 * period_name.
                 */
                if (!nextFilters?.periodName) {
                    setModalLoading(false);
                    return;
                }

                setModalLoading(
                    true
                );

                try {
                    const [
                        classificationResult,
                        breakdownResult,
                        monthlyResult,
                    ] =
                        await Promise.all([
                            fetchPLCostClassificationMonthly(
                                nextFilters
                            ),

                            fetchPLDirectCostBreakdown(
                                nextFilters
                            ),

                            fetchPLDirectCostMonthly(
                                nextFilters
                            ),
                        ]);

                    setModalClassification(
                        classificationResult
                    );

                    setModalBreakdown(
                        breakdownResult
                    );

                    setModalMonthly(
                        monthlyResult
                    );
                } catch (err) {
                    onToast?.(
                        err?.message ||
                        'Failed to load Cost Structure Analysis View All.',
                        'error'
                    );
                } finally {
                    setModalLoading(
                        false
                    );
                }
            },
            [onToast]
        );


    /* =====================================================
       OPEN VIEW ALL
    ===================================================== */

    const openViewAll =
        useCallback(
            async () => {
                const initial = {
                    legalGroupId:
                        asArray(
                            baseFilters.legalGroupId
                        ).length
                            ? [
                                ...asArray(
                                    baseFilters.legalGroupId
                                ),
                            ]
                            : ['All'],

                    legalEntityId:
                        asArray(
                            baseFilters.legalEntityId
                        ).length
                            ? [
                                ...asArray(
                                    baseFilters.legalEntityId
                                ),
                            ]
                            : ['All'],

                    parentDivisionId:
                        asArray(
                            baseFilters.parentDivisionId
                        ).length
                            ? [
                                ...asArray(
                                    baseFilters.parentDivisionId
                                ),
                            ]
                            : ['All'],

                    subdivisionId:
                        asArray(
                            baseFilters.subdivisionId
                        ).length
                            ? [
                                ...asArray(
                                    baseFilters.subdivisionId
                                ),
                            ]
                            : ['All'],

                    year:
                        baseFilters.year ||
                        optionValue(
                            filterOptions
                                .years?.[0] ??
                            ''
                        ),

                    periodName:
                        baseFilters.periodName ||
                        optionValue(
                            filterOptions
                                .periods?.[0] ??
                            ''
                        ),

                    currency:
                        baseFilters.currency ||
                        optionValue(
                            filterOptions
                                .currencies?.[0] ??
                            'AED'
                        ),
                };


                /*
                 * Use the filter options already
                 * supplied by the P&L page.
                 *
                 * No undefined fetchPLFilters()
                 * call is required here.
                 */
                const options = {
                    legalGroups:
                        filterOptions
                            .legalGroups ||
                        [],

                    legalEntities:
                        filterOptions
                            .legalEntities ||
                        [],

                    parentDivisions:
                        filterOptions
                            .parentDivisions ||
                        [],

                    subdivisions:
                        filterOptions
                            .subdivisions ||
                        [],

                    years:
                        filterOptions
                            .years ||
                        [],

                    periods:
                        filterOptions
                            .periods ||
                        [],

                    currencies:
                        filterOptions
                            .currencies
                            ?.length
                            ? filterOptions.currencies
                            : ['AED'],
                };


                setModalOptions(
                    options
                );

                setModalFilters(
                    initial
                );

                setModalTab(
                    'classification'
                );

                setExpanded({});

                setDetailMap({});

                setDetailLoading({});

                setModalOpen(true);

                await loadModal(
                    initial
                );
            },
            [
                baseFilters,
                filterOptions,
                loadModal,
            ]
        );


    /* =====================================================
       APPLY MODAL FILTERS
    ===================================================== */

    const applyModal =
        useCallback(() => {
            if (
                modalFilters
            ) {
                loadModal(
                    modalFilters
                );
            }
        }, [
            modalFilters,
            loadModal,
        ]);


    /* =====================================================
       RESET MODAL FILTERS
    ===================================================== */

    const resetModal =
        useCallback(() => {
            const reset = {
                legalGroupId: [
                    ...asArray(
                        baseFilters.legalGroupId
                    ),
                ],

                legalEntityId: [
                    ...asArray(
                        baseFilters.legalEntityId
                    ),
                ],

                parentDivisionId: [
                    ...asArray(
                        baseFilters.parentDivisionId
                    ),
                ],

                subdivisionId: [
                    ...asArray(
                        baseFilters.subdivisionId
                    ),
                ],

                year:
                    baseFilters.year ||
                    optionValue(
                        modalOptions
                            .years?.[0] ??
                        ''
                    ),

                periodName:
                    baseFilters.periodName ||
                    optionValue(
                        modalOptions
                            .periods?.[0] ??
                        ''
                    ),

                currency:
                    baseFilters.currency ||
                    'AED',
            };


            setModalFilters(
                reset
            );

            setExpanded({});

            setDetailMap({});

            setDetailLoading({});

            loadModal(reset);
        }, [
            baseFilters,
            modalOptions,
            loadModal,
        ]);


    /* =====================================================
       MAIN TABLE EXPAND
       IMPORTANT:
       fetchPLDirectCostDetail(filters, category)
    ===================================================== */

    /* =====================================================
       EXPORT HELPER
       Defined before any callback that references it to avoid
       temporal-dead-zone initialization errors.
    ===================================================== */

    const downloadCostStructureExport = useCallback(
        async (reportName, format, sourceFilters = {}, category = null) => {
            const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
            const params = new URLSearchParams();

            params.set('format', format === 'xlsx' ? 'excel' : format);

            const filterMap = {
                legalGroupId: 'legal_group_id',
                legalEntityId: 'legal_entity_id',
                parentDivisionId: 'parent_division_id',
                subdivisionId: 'subdivision_id',
                year: 'year',
                periodName: 'period_name',
                currency: 'currency',
            };

            Object.entries(filterMap).forEach(([sourceKey, queryKey]) => {
                const value = sourceFilters?.[sourceKey];
                const values = asArray(value).filter(
                    (item) => item !== null && item !== undefined && item !== '' && item !== 'All'
                );

                values.forEach((item) => params.append(queryKey, optionValue(item)));
            });

            if (category) {
                params.set('category', category);
            }

            const token =
                localStorage.getItem('finsight_token') ||
                localStorage.getItem('token');

            const response = await fetch(
                `${baseUrl}/api/pl/${encodeURIComponent(reportName)}/export?${params.toString()}`,
                {
                    method: 'GET',
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : {},
                }
            );

            if (!response.ok) {
                let message = `Export failed (${response.status})`;
                try {
                    const body = await response.json();
                    message = body?.detail || body?.message || message;
                } catch (_) {
                    // Keep the HTTP status message when the response is not JSON.
                }
                throw new Error(message);
            }

            const blob = await response.blob();
            const disposition = response.headers.get('content-disposition') || '';
            const filenameMatch = disposition.match(/filename[^;=]*=(?:UTF-8''|\"?)([^;\"]+)/i);
            const extension = format === 'pdf' ? 'pdf' : 'xlsx';
            const filename =
                filenameMatch?.[1]?.trim() ||
                `${reportName}${category ? `-${category}` : ''}.${extension}`;

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename.replace(/[\\/:*?\"<>|]/g, '-');
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        },
        []
    );


    const handleMainExpand =
        useCallback(
            async (
                row,
                key
            ) => {
                const nextOpen =
                    !mainExpanded[
                    key
                    ];

                setMainExpanded(
                    (prev) => ({
                        ...prev,
                        [key]:
                            nextOpen,
                    })
                );

                if (!nextOpen) {
                    return;
                }

                const category =
                    getLabel(row);

                if (
                    !category
                ) {
                    return;
                }

                if (
                    mainDetailMap[
                    category
                    ]
                ) {
                    return;
                }

                setMainDetailLoading(
                    (prev) => ({
                        ...prev,
                        [category]:
                            true,
                    })
                );

                try {
                    /*
                     * Backend contract:
                     * fetchPLDirectCostDetail(filters, category)
                     */
                    const details =
                        await fetchPLDirectCostDetail(
                            baseFilters,
                            category
                        );

                    setMainDetailMap(
                        (prev) => ({
                            ...prev,
                            [category]:
                                unwrapRows(
                                    details
                                ),
                        })
                    );
                } catch (err) {
                    onToast?.(
                        err?.message ||
                        `Failed to load details for ${category}.`,
                        'error'
                    );

                    setMainDetailMap(
                        (prev) => ({
                            ...prev,
                            [category]:
                                [],
                        })
                    );
                } finally {
                    setMainDetailLoading(
                        (prev) => ({
                            ...prev,
                            [category]:
                                false,
                        })
                    );
                }
            },
            [
                mainExpanded,
                mainDetailMap,
                baseFilters,
                onToast,
                downloadCostStructureExport,
            ]
        );


    /* =====================================================
       MODAL DETAIL EXPAND
    ===================================================== */

    const handleExpand =
        useCallback(
            async (
                row,
                key
            ) => {
                const nextOpen =
                    !expanded[key];

                setExpanded(
                    (prev) => ({
                        ...prev,
                        [key]:
                            nextOpen,
                    })
                );

                if (!nextOpen) {
                    return;
                }

                const category =
                    getLabel(row);

                if (
                    !category
                ) {
                    return;
                }

                if (
                    detailMap[
                    category
                    ]
                ) {
                    return;
                }

                setDetailLoading(
                    (prev) => ({
                        ...prev,
                        [category]:
                            true,
                    })
                );

                try {
                    const details =
                        await fetchPLDirectCostDetail(
                            modalFilters ||
                            baseFilters,
                            category
                        );

                    setDetailMap(
                        (prev) => ({
                            ...prev,
                            [category]:
                                unwrapRows(
                                    details
                                ),
                        })
                    );
                } catch (err) {
                    onToast?.(
                        err?.message ||
                        `Failed to load details for ${category}.`,
                        'error'
                    );

                    setDetailMap(
                        (prev) => ({
                            ...prev,
                            [category]:
                                [],
                        })
                    );
                } finally {
                    setDetailLoading(
                        (prev) => ({
                            ...prev,
                            [category]:
                                false,
                        })
                    );
                }
            },
            [
                expanded,
                detailMap,
                modalFilters,
                baseFilters,
                onToast,
            ]
        );


    /* =====================================================
       EXPORT
    ===================================================== */

    const handleExport =
        useCallback(
            async (
                format,
                reportName =
                    'cost-classification-monthly',
                category = null,
                sourceFilters =
                    baseFilters
            ) => {
                const key =
                    `${reportName}-${format}`;

                if (
                    exporting
                ) {
                    return;
                }

                setExporting(
                    key
                );

                try {
                    /*
                     * Existing P&L export integration.
                     */
                    const exportFilters = {
                        ...(sourceFilters || {}),
                        ...(category ? { category } : {}),
                    };

                    try {
                        await exportPL(
                            reportName,
                            format,
                            exportFilters
                        );
                    } catch (exportError) {
                        /*
                         * Fallback to the exact Cost Structure export endpoint.
                         * This keeps the existing P&L export/auth flow while ensuring
                         * the five backend report names and detail category parameter
                         * are supported here.
                         */
                        await downloadCostStructureExport(
                            reportName,
                            format,
                            exportFilters,
                            category
                        );
                    }

                    onToast?.(
                        `${format.toUpperCase()} export downloaded successfully.`,
                        'success'
                    );
                } catch (err) {
                    onToast?.(
                        `Export failed: ${err?.message ||
                        'Unknown error'
                        }.`,
                        'error'
                    );
                } finally {
                    setExporting(
                        null
                    );
                }
            },
            [
                exporting,
                baseFilters,
                onToast,
            ]
        );


    /* =====================================================
       SUMMARY
    ===================================================== */

    const summary =
        normalizeSummary(
            classification,
            breakdown,
            baseFilters.currency,
            baseFilters.periodName
        );


    /*
     * IMPORTANT:
     * Only show the intended direct-cost
     * categories in the main drill-down.
     *
     * Do not use:
     * !getLabel(row).includes(...)
     *
     * because that could unintentionally
     * include unrelated backend rows.
     */
    const mainRows =
        unwrapRows(
            breakdown
        ).filter((row) =>
            DIRECT_CATEGORIES.includes(
                getLabel(row).trim()
            )
        );


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <>
            <section
                className="cost-structure-analysis-page"
                style={{
                    marginBottom: 18,
                }}
            >
                <div
                    style={{
                        background: '#fff',
                        border:
                            '1px solid #e7ebf1',
                        borderRadius: 12,
                        padding:
                            '10px 14px',
                        marginBottom: 10,
                        boxShadow:
                            '0 1px 3px rgba(15,23,42,.04)',
                    }}
                >
                    <div
                        style={{
                            display:
                                'flex',
                            justifyContent:
                                'space-between',
                            alignItems:
                                'center',
                            gap: 15,
                            flexWrap:
                                'wrap',
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 18,
                                    lineHeight:
                                        '22px',
                                    fontWeight:
                                        700,
                                    color:
                                        '#182338',
                                }}
                            >
                                Cost Structure Analysis
                            </h2>

                            <div
                                style={{
                                    marginTop: 3,
                                    fontSize: 12,
                                    color:
                                        '#7a8496',
                                }}
                            >
                                Cost of material,
                                direct expenses
                                and operating
                                expenses.
                            </div>
                        </div>

                        <div
                            style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <ExportButtons
                                endpoint="cost-structure-analysis"
                                exporting={
                                    exporting === 'cost-classification-monthly-excel'
                                        ? 'excel'
                                        : exporting === 'cost-classification-monthly-pdf'
                                            ? 'pdf'
                                            : null
                                }
                                handleExport={handleExport}
                            />

                            <button
                                type="button"
                                aria-label="Cost Structure Analysis actions"
                                title="More actions"
                                onClick={() =>
                                    setActionMenuOpen((prev) => !prev)
                                }
                                style={{
                                    width: 32,
                                    height: 32,
                                    border: '1px solid #e4e9f0',
                                    borderRadius: 7,
                                    background: '#fff',
                                    color: '#64748b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                <MoreVertical size={18} />
                            </button>

                            {actionMenuOpen && (
                                <>
                                    <div
                                        style={{
                                            position: 'fixed',
                                            inset: 0,
                                            zIndex: 119,
                                        }}
                                        onClick={() =>
                                            setActionMenuOpen(false)
                                        }
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 35,
                                            right: 0,
                                            zIndex: 120,
                                            width: 155,
                                            padding: 5,
                                            background: '#fff',
                                            border: '1px solid #e5eaf1',
                                            borderRadius: 9,
                                            boxShadow: '0 12px 28px rgba(15,23,42,.14)',
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActionMenuOpen(false);
                                                openViewAll();
                                            }}
                                            style={{
                                                width: '100%',
                                                border: 0,
                                                background: 'transparent',
                                                padding: '9px 10px',
                                                borderRadius: 6,
                                                textAlign: 'left',
                                                color: '#708090',
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            🔎  View All
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActionMenuOpen(false);
                                                handleExport('excel');
                                            }}
                                            disabled={!!exporting}
                                            style={{
                                                width: '100%',
                                                border: 0,
                                                background: 'transparent',
                                                padding: '9px 10px',
                                                borderRadius: 6,
                                                textAlign: 'left',
                                                color: '#708090',
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor: exporting ? 'not-allowed' : 'pointer',
                                                opacity: exporting ? 0.6 : 1,
                                            }}
                                        >
                                            📊 Export Excel
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActionMenuOpen(false);
                                                handleExport('pdf');
                                            }}
                                            disabled={!!exporting}
                                            style={{
                                                width: '100%',
                                                border: 0,
                                                background: 'transparent',
                                                padding: '9px 10px',
                                                borderRadius: 6,
                                                textAlign: 'left',
                                                color: '#708090',
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor: exporting ? 'not-allowed' : 'pointer',
                                                opacity: exporting ? 0.6 : 1,
                                            }}
                                        >
                                            📄 Export PDF
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>


                {error && (
                    <div
                        style={{
                            padding:
                                '9px 12px',
                            marginBottom: 10,
                            borderRadius: 8,
                            border:
                                '1px solid #fecdd3',
                            background:
                                '#fff1f2',
                            color:
                                '#be123c',
                            fontSize: 12,
                            display:
                                'flex',
                            justifyContent:
                                'space-between',
                            alignItems:
                                'center',
                        }}
                    >
                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={
                                loadMain
                            }
                            style={{
                                border: 0,
                                background:
                                    'transparent',
                                color:
                                    '#be123c',
                                cursor:
                                    'pointer',
                            }}
                        >
                            <RefreshCw
                                size={
                                    13
                                }
                            />
                        </button>
                    </div>
                )}


                <div
                    style={{
                        display:
                            'grid',
                        gridTemplateColumns:
                            'repeat(3, minmax(0, 1fr))',
                        gap: 8,
                        marginBottom: 10,
                    }}
                    className="cost-structure-summary-grid"
                >
                    <CostCard
                        title="Cost of Material (PTD)"
                        value={
                            summary
                                .material
                                .ptd
                        }
                        ytd={
                            summary
                                .material
                                .ytd
                        }
                        target={
                            summary
                                .material
                                .target
                        }
                        color="#18b89b"
                        bg="#dff8f1"
                        icon={Package}
                        loading={
                            loading
                        }
                        currency={
                            baseFilters.currency
                        }
                    />

                    <CostCard
                        title="Direct Expenses (PTD)"
                        value={
                            summary
                                .direct
                                .ptd
                        }
                        ytd={
                            summary
                                .direct
                                .ytd
                        }
                        target={
                            summary
                                .direct
                                .target
                        }
                        color="#7040dc"
                        bg="#eee7ff"
                        icon={
                            BarChart3
                        }
                        loading={
                            loading
                        }
                        currency={
                            baseFilters.currency
                        }
                    />

                    <CostCard
                        title="Operating Expenses (PTD)"
                        value={
                            summary
                                .operating
                                .ptd
                        }
                        ytd={
                            summary
                                .operating
                                .ytd
                        }
                        target={
                            summary
                                .operating
                                .target
                        }
                        color="#f47d20"
                        bg="#fff0df"
                        icon={
                            ShoppingBag
                        }
                        loading={
                            loading
                        }
                        currency={
                            baseFilters.currency
                        }
                    />
                </div>


                <div
                    style={{
                        display:
                            'grid',
                        gridTemplateColumns:
                            '1.5fr 1fr',
                        gap: 10,
                        marginBottom: 10,
                    }}
                    className="cost-structure-chart-grid"
                >
                    <MainCostChart
                        data={unwrapRows(
                            classification
                        )}
                        currency={
                            baseFilters.currency
                        }
                    />

                    <CostMix
                        payload={
                            classification
                        }
                        currency={
                            baseFilters.currency
                        }
                        periodName={
                            baseFilters.periodName
                        }
                    />
                </div>


                <div
                    style={{
                        background:
                            '#fff',
                        border:
                            '1px solid #e7ebf1',
                        borderRadius: 11,
                        overflow:
                            'hidden',
                        boxShadow:
                            '0 1px 3px rgba(15,23,42,.035)',
                    }}
                >
                    <div
                        style={{
                            padding:
                                '12px 14px 10px',
                            fontSize: 13,
                            fontWeight: 700,
                            color:
                                '#182338',
                        }}
                    >
                        Direct Cost Drill-Down
                    </div>

                    <DirectCostTable
                        rows={mainRows}
                        currency={
                            baseFilters.currency
                        }
                        expanded={
                            mainExpanded
                        }
                        details={
                            mainDetailMap
                        }
                        loadingDetails={
                            mainDetailLoading
                        }
                        onExpand={
                            handleMainExpand
                        }
                    />
                </div>
            </section>


            {modalOpen && (
                <Modal
                    onClose={() =>
                        setModalOpen(
                            false
                        )
                    }
                >
                    <div
                        style={{
                            padding:
                                '14px 18px',
                            borderBottom:
                                '1px solid #e2e8f0',
                            display:
                                'flex',
                            alignItems:
                                'flex-start',
                            justifyContent:
                                'space-between',
                            gap: 12,
                            background: '#fff',
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: 19,
                                    fontWeight:
                                        800,
                                    color:
                                        C.navy,
                                }}
                            >
                                Cost Structure Analysis –
                                View All
                            </div>

                            <div
                                style={{
                                    marginTop: 3,
                                    fontSize: 12,
                                    color: '#64748b',
                                }}
                            >
                                Detailed cost of material, direct expense and operating expense analysis
                            </div>

                            <div
                                style={{
                                    marginTop: 4,
                                    fontSize: 11,
                                    color: '#8a94a6',
                                }}
                            >
                                Period: {
                                    (modalFilters || baseFilters).periodName || '—'
                                } | All values in {
                                    (modalFilters || baseFilters).currency || 'AED'
                                }
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setModalOpen(
                                    false
                                )
                            }
                            style={{
                                width: 31,
                                height: 31,
                                border: 0,
                                borderRadius: 7,
                                background:
                                    '#fff',
                                color:
                                    '#64748b',
                                cursor:
                                    'pointer',
                            }}
                        >
                            <X
                                size={16}
                            />
                        </button>
                    </div>


                    <ViewAllContent
                        tab={modalTab}
                        setTab={
                            setModalTab
                        }
                        filters={
                            modalFilters ||
                            baseFilters
                        }
                        setFilters={
                            setModalFilters
                        }
                        options={
                            modalOptions
                        }
                        loading={
                            modalLoading
                        }
                        classification={
                            modalClassification
                        }
                        breakdown={
                            modalBreakdown
                        }
                        monthly={
                            modalMonthly
                        }
                        expanded={
                            expanded
                        }
                        detailMap={
                            detailMap
                        }
                        detailLoading={
                            detailLoading
                        }
                        onExpand={
                            handleExpand
                        }
                        onApply={
                            applyModal
                        }
                        onReset={
                            resetModal
                        }
                        onExport={(
                            format
                        ) => {
                            const report =
                                modalTab ===
                                    'classification'
                                    ? 'cost-classification-monthly'
                                    : modalTab ===
                                        'breakdown'
                                        ? 'direct-cost-breakdown'
                                        : 'direct-cost-monthly';

                            handleExport(
                                format,
                                report,
                                null,
                                modalFilters ||
                                baseFilters
                            );
                        }}
                        exporting={
                            exporting
                        }
                        currency={
                            (
                                modalFilters ||
                                baseFilters
                            ).currency ||
                            'AED'
                        }
                    />
                </Modal>
            )}


            <style>
                {`
                    @media (max-width: 1200px) {
                        .cost-structure-filter-grid {
                            grid-template-columns: repeat(4, minmax(140px, 1fr)) !important;
                        }
                    }

                    @media (max-width: 900px) {
                        .cost-structure-filter-grid {
                            grid-template-columns: repeat(2, minmax(140px, 1fr)) !important;
                        }

                        .cost-structure-chart-grid {
                            grid-template-columns: 1fr !important;
                        }

                        .cost-structure-summary-grid {
                            grid-template-columns: 1fr !important;
                        }
                    }

                    @media (max-width: 700px) {
                        .cost-structure-filter-grid {
                            grid-template-columns: 1fr !important;
                        }

                        .cost-structure-summary-grid {
                            grid-template-columns: 1fr !important;
                        }

                        .cost-structure-chart-grid {
                            grid-template-columns: 1fr !important;
                        }
                    }

                    /* =========================================================
   TABLE HEADER CONSISTENCY
========================================================= */

/* Scoped to this component so existing application tables are untouched. */

.cost-structure-table thead tr {
    background: #fff !important;
    color: #173b68 !important;
}

.cost-structure-table thead th {
    background: #fff !important;
    color: #173b68 !important;
}

/* Keep View All charts compact and prevent inherited/global typography
   from making chart labels larger than the FinSight layout. */
.cost-structure-chart text {
    font-size: 13px !important;
}

.cost-structure-chart .recharts-legend-item-text {
     font-size: 13px !important;
}
                `}
            </style>
        </>
    );
}