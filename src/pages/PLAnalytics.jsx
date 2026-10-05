
import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
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
import { HandCoins } from "lucide-react";
import CostStructureAnalysis from '../components/CostStructureAnalysis';


/* ══════════════════════════════════════════════════════════════════
   CONSTANTS & DEFAULTS
══════════════════════════════════════════════════════════════════ */
const DEFAULT_FILTERS = {
    legalGroupId: [],
    legalEntityId: [],
    parentDivisionId: [],
    subdivisionId: [],
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
function MultiSelect({ options = [], value, onChange, placeholder = 'All', style }) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownPosition, setDropdownPosition] = useState(null);
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    const updateDropdownPosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownPosition({
            top: rect.bottom + 3,
            left: rect.left,
            width: Math.max(rect.width, 220),
        });
    }, []);

    useEffect(() => {
        if (!open) return;

        updateDropdownPosition();

        const handleClickOutside = (event) => {
            const target = event.target;
            if (
                triggerRef.current && !triggerRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
                setOpen(false);
                setSearchTerm('');
            }
        };

        const handleReposition = () => updateDropdownPosition();

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('resize', handleReposition);
        window.addEventListener('scroll', handleReposition, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', handleReposition);
            window.removeEventListener('scroll', handleReposition, true);
        };
    }, [open, updateDropdownPosition]);

    const normOptions = (Array.isArray(options) ? options : []).map((option) => {
        if (typeof option === 'string') return { id: option, name: option };
        const id = option?.value !== undefined ? option.value : option?.id;
        const name = option?.label !== undefined ? option.label : option?.name;
        return { id, name };
    });

    const normalizedValue = Array.isArray(value)
        ? value.filter((item) => String(item) !== 'All')
        : value && String(value) !== 'All' ? [value] : [];

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const selectableOptions = normOptions.filter(
        (option) => option?.id !== null && option?.id !== undefined &&
            String(option.id) !== '' && String(option.id) !== 'All'
    );
    const filteredOptions = selectableOptions.filter((option) =>
        !normalizedSearch || String(option.name ?? '').toLowerCase().includes(normalizedSearch)
    );
    const selectedConcreteValues = normalizedValue;
    const allOptionsSelected = selectableOptions.length > 0 && selectableOptions.every((option) =>
        selectedConcreteValues.some((selected) => String(selected) === String(option.id))
    );

    const toggle = (optionId) => {
        const exists = selectedConcreteValues.some((selected) => String(selected) === String(optionId));
        const nextValues = exists
            ? selectedConcreteValues.filter((selected) => String(selected) !== String(optionId))
            : [...selectedConcreteValues, optionId];
        onChange(nextValues);
    };

    const selectAll = () => onChange(selectableOptions.map((option) => option.id));
    const clearAll = () => {
        onChange([]);
        setSearchTerm('');
    };

    const selectedVals = selectableOptions.filter((option) =>
        selectedConcreteValues.some((selected) => String(selected) === String(option.id))
    );
    // `All` means there is no explicit selection. Never infer `All` from
    // the currently returned option list because the backend may return a
    // narrowed list after a filter is selected.
    const label = selectedConcreteValues.length === 0
        ? placeholder
        : selectedConcreteValues.length === 1
            ? (selectedVals[0]?.name ?? String(selectedConcreteValues[0]))
            : `${selectedConcreteValues.length} selected`;

    const dropdown = open && dropdownPosition && typeof document !== 'undefined'
        ? createPortal(
            <div
                ref={dropdownRef}
                style={{
                    position: 'fixed',
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                    minWidth: 220,
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    boxShadow: '0 10px 28px rgba(0,0,0,0.14)',
                    zIndex: 100000,
                    maxHeight: 300,
                    overflowY: 'auto',
                }}
            >
                <div style={{ padding: '7px 8px', borderBottom: '1px solid #f1f5f9', background: '#fff', position: 'sticky', top: 0, zIndex: 3 }}>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <span
                            aria-hidden="true"
                            style={{
                                position: 'absolute',
                                left: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '0.78rem',
                                lineHeight: 1,
                                color: '#94a3b8',
                                pointerEvents: 'none',
                                zIndex: 1,
                            }}
                        >
                            🔍
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            onClick={(event) => event.stopPropagation()}
                            onMouseDown={(event) => event.stopPropagation()}
                            onKeyDown={(event) => event.stopPropagation()}
                            placeholder="Search..."
                            autoFocus
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '6px 8px 6px 28px',
                                border: '1px solid #e2e8f0',
                                borderRadius: 6,
                                outline: 'none',
                                fontSize: '0.72rem',
                                color: '#334155',
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', borderBottom: '1px solid #f1f5f9', background: '#fff', position: 'sticky', top: 42, zIndex: 2 }}>
                    <button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); selectAll(); }} style={{ border: 'none', background: 'transparent', padding: 0, color: '#1e3a8a', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Select All</button>
                    <button type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); clearAll(); }} style={{ border: 'none', background: 'transparent', padding: 0, color: '#64748b', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Clear</button>
                </div>

                {filteredOptions.length === 0 ? (
                    <div style={{ padding: '10px 12px', fontSize: '0.72rem', color: '#64748b' }}>
                        {normalizedSearch ? 'No matching options' : 'No options available'}
                    </div>
                ) : filteredOptions.map((option) => {
                    const selected = selectedConcreteValues.some((selectedValue) => String(selectedValue) === String(option.id));
                    return (
                        <div
                            key={String(option.id)}
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={() => toggle(option.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', cursor: 'pointer', fontSize: '0.78rem', background: selected ? '#eff6ff' : '#fff', color: selected ? '#2563eb' : '#334155', fontWeight: selected ? 600 : 400, borderBottom: '1px solid #f8fafc', whiteSpace: 'normal', lineHeight: 1.25 }}
                        >
                            <span style={{ width: 14, height: 14, border: `1.5px solid ${selected ? '#2563eb' : '#cbd5e1'}`, borderRadius: 3, background: selected ? '#2563eb' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {selected && <span style={{ color: '#fff', fontSize: '0.6rem', lineHeight: 1 }}>✓</span>}
                            </span>
                            {option.name}
                        </div>
                    );
                })}
            </div>,
            document.body
        ) : null;

    return (
        <>
            <div ref={triggerRef} style={{ position: 'relative', ...style }}>
                <div
                    onClick={() => {
                        setOpen((previous) => {
                            const next = !previous;
                            if (!next) setSearchTerm('');
                            return next;
                        });
                    }}
                    style={{ ...selStyle, backgroundImage: 'none', appearance: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', userSelect: 'none' }}
                >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85%' }}>{label}</span>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', flexShrink: 0 }}>{open ? '\u25B2' : '\u25BC'}</span>
                </div>
            </div>
            {dropdown}
        </>
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

/* Backend-safe Reporting Currency options. */
const normalizeCurrencyOptions = (values) => {
    const source = Array.isArray(values) ? values : [];
    const normalized = source
        .map((item) => {
            if (item === null || item === undefined) return '';
            if (typeof item === 'string' || typeof item === 'number') return String(item).trim();
            return String(
                item.value ?? item.code ?? item.currency ?? item.currency_code ??
                item.currencyCode ?? item.label ?? item.name ?? ''
            ).trim();
        })
        .filter(Boolean);
    return [...new Set(normalized)];
};

/* Backend-first latest Period.
   Prefer an explicit latest/current period returned by /api/pl/filter-options.
   If the backend only returns the ordered periods array, use its last value (latest). */
const getLatestBackendPeriod = (data, periods = []) => {
    const explicitLatest =
        data?.latest_period ??
        data?.latestPeriod ??
        data?.current_period ??
        data?.currentPeriod ??
        data?.latest_period_name ??
        data?.latestPeriodName;

    if (explicitLatest !== null && explicitLatest !== undefined && String(explicitLatest).trim()) {
        return String(explicitLatest).trim();
    }

    // The backend returns periods in chronological order, so the latest
    // available Period is the LAST item in the periods array.
    const latestPeriod = Array.isArray(periods) && periods.length
        ? periods[periods.length - 1]
        : '';

    if (latestPeriod !== null && latestPeriod !== undefined) {
        if (typeof latestPeriod === 'object') {
            return String(
                latestPeriod.value ??
                latestPeriod.id ??
                latestPeriod.period_name ??
                latestPeriod.periodName ??
                latestPeriod.label ??
                latestPeriod.name ??
                ''
            ).trim();
        }
        return String(latestPeriod).trim();
    }

    return '';
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
    showCompare = false,
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

    const periodOptions = (filterOptions?.periods || [])
        .map(period => {
            if (typeof period === 'object' && period !== null) {
                return String(
                    period.value ??
                    period.id ??
                    period.period_name ??
                    period.periodName ??
                    period.label ??
                    period.name ??
                    ''
                );
            }

            return String(period);
        })
        .filter(Boolean);

    const compareOptions = (filterOptions?.comparePeriods || [])
        .map(period => {
            if (typeof period === 'object' && period !== null) {
                return String(
                    period.value ??
                    period.id ??
                    period.period_name ??
                    period.periodName ??
                    period.label ??
                    period.name ??
                    ''
                );
            }

            return String(period);
        })
        .filter(Boolean);

    const getSingleValue = (value) => {
        if (Array.isArray(value)) {
            return value.find(v => v !== undefined && v !== null && String(v) !== 'All') ?? '';
        }
        return value !== undefined && value !== null && String(value) !== 'All'
            ? String(value)
            : '';
    };

    const selectedYear = getSingleValue(filters?.year);
    const selectedPeriod = getSingleValue(filters?.periodName);
    const selectedCompare = getSingleValue(filters?.comparePeriodName);

    const update = (key, value) => {
        setFilters(prev => {
            const next = { ...prev, [key]: value };

            // Hierarchy filters remain multi-select and keep the existing
            // cascading behaviour.
            if (key === 'legalEntityId') {
                next.parentDivisionId = [];
                next.subdivisionId = [];
            }

            if (key === 'parentDivisionId') {
                next.subdivisionId = [];
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
                gridTemplateColumns: showCompare
                    ? 'repeat(8, minmax(120px, 1fr)) auto auto 1fr'
                    : 'repeat(7, minmax(130px, 1fr)) auto auto 1fr',
                gap: 8,
                alignItems: 'end',
                minWidth: 900,
            }}
        >
            {/* Year comes directly from /api/pl/filter-options. */}
            <FilterField label="Year">
                <select
                    value={selectedYear}
                    onChange={e => update('year', e.target.value ? [e.target.value] : [])}
                    disabled={loading || !yearOptions.length}
                    style={selStyle}
                >
                    {!yearOptions.length && <option value="">Loading…</option>}
                    {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </FilterField>

            {/* Hierarchy filters remain multi-select. */}
            <FilterField label="Legal Entity">
                <MultiSelect
                    options={filterOptions?.legalEntities || []}
                    value={filters?.legalEntityId || []}
                    onChange={v => update('legalEntityId', v)}
                    style={{ width: '100%' }}
                />
            </FilterField>

            <FilterField label="Parent Division">
                <MultiSelect
                    options={filterOptions?.parentDivisions || []}
                    value={filters?.parentDivisionId || []}
                    onChange={v => update('parentDivisionId', v)}
                    style={{ width: '100%' }}
                />
            </FilterField>

            <FilterField label="Sub-Division">
                <MultiSelect
                    options={filterOptions?.subdivisions || []}
                    value={filters?.subdivisionId || []}
                    onChange={v => update('subdivisionId', v)}
                    style={{ width: '100%' }}
                />
            </FilterField>

            {/* Period is a single selection. Changing it refreshes backend compare_periods. */}
            <FilterField label="Period">
                <select
                    value={selectedPeriod}
                    onChange={e => update('periodName', e.target.value ? [e.target.value] : [])}
                    disabled={loading || !periodOptions.length}
                    style={selStyle}
                >
                    {!periodOptions.length && <option value="">Loading…</option>}
                    {periodOptions.map(period => (
                        <option key={period} value={period}>{period}</option>
                    ))}
                </select>
            </FilterField>

            {showCompare && (
                <FilterField label="Compare With">
                    <select
                        value={selectedCompare}
                        onChange={e => update('comparePeriodName', e.target.value ? [e.target.value] : [])}
                        disabled={loading || !compareOptions.length}
                        style={selStyle}
                    >
                        {!compareOptions.length && <option value="">None</option>}
                        {compareOptions.map(period => (
                            <option key={period} value={period}>{period}</option>
                        ))}
                    </select>
                </FilterField>
            )}

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
    return `${currency} ${n.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};

const fmtViewAllNum = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    return n.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};
/* Compact formatter for KPI cards — matches the dashboard reference: 2 decimals */
const fmtKPI = (v, currency = 'AED') => {
    if (v === null || v === undefined) return '—';
    const n = Number(v);
    if (isNaN(n)) return v;
    if (Math.abs(n) >= 1_000_000_000) return `${currency} ${(n / 1_000_000_000).toFixed(2)}B`;
    if (Math.abs(n) >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(2)}M`;
    if (Math.abs(n) >= 1_000) return `${currency} ${(n / 1_000).toFixed(2)}K`;
    return `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const fmtKPIPct = (v) => (v !== null && v !== undefined && Number.isFinite(Number(v)))
    ? `${Number(v).toFixed(2)}%`
    : '—';
const fmtPct = (v) => (v !== null && v !== undefined) ? `${Number(v).toFixed(0)}%` : '—';
const fmtAxisNum = (v) => {
    if (v === 0) return '0';
    if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(0)}B`;
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
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
function KPICard({
    id,
    label,
    value,
    subValue,
    targetText,
    targetVariancePct,
    changePct,
    compareLabel,
    color,
    iconBg,
    icon,
    loading,
    error,
}) {
    const [hover, setHover] = useState(false);
    const accent = color || C.primary;
    const hasTarget = targetText !== null && targetText !== undefined && targetText !== '';
    const numericVariance = Number(targetVariancePct);
    const hasTargetVariance = Number.isFinite(numericVariance);
    const varianceUp = hasTargetVariance && numericVariance >= 0;

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

                        {true && (
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    alignSelf: 'flex-start',
                                    gap: 4,
                                    marginTop: 2,
                                    padding: '2px 6px',
                                    borderRadius: 5,
                                    background: '#f1f5f9',
                                    fontSize: '0.58rem',
                                    lineHeight: 1.2,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <span style={{ color: C.slate, fontWeight: 500 }}>
                                    Target: {hasTarget ? targetText : '—'}
                                </span>
                                {hasTargetVariance && (
                                    <span style={{ color: varianceUp ? C.green : C.rose, fontWeight: 700 }}>
                                        {varianceUp ? '▲' : '▼'} {Math.abs(numericVariance).toFixed(2)}%
                                    </span>
                                )}
                            </div>
                        )}

                        {!hasTarget && changePct !== null && changePct !== undefined && compareLabel && (
                            <div style={{ fontSize: '0.62rem', fontWeight: 600, lineHeight: 1.1, marginTop: 2 }}>
                                <span style={{ color: Number(changePct) >= 0 ? C.green : C.rose, marginRight: 3 }}>
                                    {Number(changePct) >= 0 ? '▲' : '▼'} {Math.abs(Number(changePct)).toFixed(2)}%
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

// Fixed widths are shared by the statement header and body tables so every column stays aligned.
const STATEMENT_COL_WIDTHS = ['25%', '9.375%', '9.375%', '9.375%', '9.375%', '9.375%', '9.375%', '9.375%', '9.375%'];

const StatementColGroup = () => (
    <colgroup>
        {STATEMENT_COL_WIDTHS.map((width, index) => (
            <col key={index} style={{ width }} />
        ))}
    </colgroup>
);



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

    const rowType = String(row?.row_type ?? '').trim().toLowerCase();
    const isPercentage = rowType === 'percentage';
    const isSubtotal =
        row?.is_subtotal === true ||
        row?.row_type === 'subtotal';

    const label = String(row?.particulars ?? row?.label ?? row?.name ?? '—');
    const labelLower = label.trim().toLowerCase();

    const isNetProfit = labelLower === 'net profit';
    const isEbitda = labelLower === 'ebitda';
    const isGrossProfit = labelLower === 'gross profit';
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
            labelLower === 'total direct expenses' ||
            labelLower === 'total other income'
        );

    const rowBg =
        isNetProfit
            ? '#f0fdf4'
            : isEbitda || isGrossProfit || isPBT
                ? '#eef2ff'
                : isSubtotal
                    ? '#f8fafc'
                    : isPercentage
                        ? '#fafafa'
                        : 'transparent';

    const labelColor =
        isNetProfit
            ? C.green
            : isEbitda || isGrossProfit || isPBT
                ? C.primary
                : isSubtotal
                    ? C.navy
                    : '#334155';

    /*
     * CFO revised statement contract:
     * - Amount rows use the backend PTD/YTD values.
     * - Percentage rows use the backend percentage values directly.
     * - No percentage is recalculated in the frontend.
     */
    const currentPTD = row?.current_ptd;
    const comparePTD = row?.compare_ptd;
    const targetPTD = row?.target_ptd;
    const currentYTD = row?.current_ytd;
    const targetYTD = row?.target_ytd;

    const varianceCurrentVsCompare = row?.variance_pct_current_vs_compare;
    const varianceCurrentVsTarget = row?.variance_pct_current_vs_target;
    const varianceYTDVsTarget = row?.variance_pct_ytd_vs_target;

    const toNumber = (value) => {
        if (value === null || value === undefined || value === '') return null;
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
    };

    const formatAmount = (value) => {
        const num = toNumber(value);
        if (num === null) {
            return value === null || value === undefined || value === ''
                ? '—'
                : String(value);
        }

        return num.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    const formatPercentage = (value) => {
        const num = toNumber(value);
        if (num === null) return '—';

        return `${num.toFixed(2)}%`;
    };

    const formatVariance = (value) => {
        const num = toNumber(value);
        if (num === null) return '—';
        return `${num >= 0 ? '+' : ''}${num.toFixed(0)}%`;
    };

    const amountColor = (value, fallback = labelColor) => {
        const num = toNumber(value);
        return num !== null && num < 0 ? C.rose : fallback;
    };

    const varianceColor = (value) => {
        const num = toNumber(value);
        if (num === null) return C.slate;
        return num >= 0 ? C.green : C.rose;
    };

    const getFavourability = (value) => {
        const normalized = String(value ?? '').trim().toLowerCase();
        if (normalized === 'favourable' || normalized === 'favorable') {
            return { label: 'Favourable', color: C.green };
        }
        if (normalized === 'unfavourable' || normalized === 'unfavorable') {
            return { label: 'Unfavourable', color: C.rose };
        }
        return { label: 'Neutral', color: C.slate };
    };

    const favourability = getFavourability(row?.favourability);

    return (
        <tr
            style={{
                background: hover && !isSubtotal && !isPercentage ? '#f0f6ff' : rowBg,
                transition: 'background 0.1s',
            }}
            onMouseEnter={() => {
                if (!isSubtotal && !isPercentage) setHover(true);
            }}
            onMouseLeave={() => setHover(false)}
        >
            <td
                style={{
                    ...TDLx,
                    paddingLeft: indent ? 28 : 12,
                    fontWeight: isImportantSubtotal || isSubtotal || isPercentage ? 700 : 400,
                    color: isPercentage ? C.slate : labelColor,
                    fontSize: isImportantSubtotal ? '0.76rem' : '0.74rem',
                    borderBottom: `1px solid ${isSubtotal || isPercentage ? '#e2e8f0' : '#f1f5f9'}`,
                }}
            >
                {label}
            </td>

            {/* Current PTD */}
            <td
                style={{
                    ...TDx,
                    fontWeight: isPercentage ? 700 : (isImportantSubtotal || isSubtotal ? 700 : 400),
                    color: isPercentage ? C.slate : amountColor(currentPTD),
                }}
            >
                {isPercentage ? formatPercentage(currentPTD) : formatAmount(currentPTD)}
            </td>

            {/* Compare PTD */}
            <td
                style={{
                    ...TDx,
                    fontWeight: isPercentage ? 700 : 400,
                    color: isPercentage ? C.slate : amountColor(comparePTD, C.slate),
                }}
            >
                {isPercentage ? formatPercentage(comparePTD) : formatAmount(comparePTD)}
            </td>

            {/* Target PTD */}
            <td
                style={{
                    ...TDx,
                    fontWeight: isPercentage ? 700 : 400,
                    color: isPercentage ? C.slate : amountColor(targetPTD, C.slate),
                }}
            >
                {isPercentage ? formatPercentage(targetPTD) : formatAmount(targetPTD)}
            </td>

            {/* Variance Current vs Compare is not a percentage-row value. */}
            <td
                style={{
                    ...TDx,
                    color: isPercentage ? C.muted : favourability.color,
                    fontWeight: isPercentage ? 700 : (varianceCurrentVsCompare == null ? 400 : 600),
                }}
            >
                {isPercentage ? '—' : formatVariance(varianceCurrentVsCompare)}
            </td>

            {/* Variance Current vs Target is not a percentage-row value. */}
            <td
                style={{
                    ...TDx,
                    color: isPercentage ? C.muted : varianceColor(varianceCurrentVsTarget),
                    fontWeight: isPercentage ? 700 : (varianceCurrentVsTarget == null ? 400 : 600),
                }}
            >
                {isPercentage ? '—' : formatVariance(varianceCurrentVsTarget)}
            </td>

            {/* Current YTD */}
            <td
                style={{
                    ...TDx,
                    fontWeight: isPercentage ? 700 : (isImportantSubtotal || isSubtotal ? 700 : 400),
                    color: isPercentage ? C.slate : amountColor(currentYTD),
                }}
            >
                {isPercentage ? formatPercentage(currentYTD) : formatAmount(currentYTD)}
            </td>

            {/* Target YTD */}
            <td
                style={{
                    ...TDx,
                    fontWeight: isPercentage ? 700 : 400,
                    color: isPercentage ? C.slate : amountColor(targetYTD, C.slate),
                }}
            >
                {isPercentage ? formatPercentage(targetYTD) : formatAmount(targetYTD)}
            </td>

            {/* YTD variance is not a percentage-row value. */}
            <td
                style={{
                    ...TDx,
                    color: isPercentage ? C.muted : varianceColor(varianceYTDVsTarget),
                    fontWeight: isPercentage ? 700 : (varianceYTDVsTarget == null ? 400 : 600),
                }}
            >
                {isPercentage ? '—' : formatVariance(varianceYTDVsTarget)}
            </td>
        </tr>
    );
}

/*
 * Render the statement exactly in backend display_order.
 *
 * No section/row order is hard-coded here. Section headers are inserted only
 * when the ordered API rows move to a different section.
 */
function StatementRowsRenderer({
    rows = [],
    currency = 'AED',
    tdStyles,
}) {
    const [collapsedSections, setCollapsedSections] = useState({});

    const orderedRows = (Array.isArray(rows) ? rows : [])
        .map((row, index) => ({ row, index }))
        .sort((a, b) => {
            const aOrder = Number(a.row?.display_order);
            const bOrder = Number(b.row?.display_order);

            const aValid = Number.isFinite(aOrder);
            const bValid = Number.isFinite(bOrder);

            if (aValid && bValid && aOrder !== bOrder) return aOrder - bOrder;
            if (aValid && !bValid) return -1;
            if (!aValid && bValid) return 1;
            return a.index - b.index;
        })
        .map(({ row }) => row);

    let previousSection = null;

    return (
        <>
            {orderedRows.map((row, index) => {
                const section = String(row?.section ?? '').trim() || 'UNSPECIFIED';
                const showSectionHeader = section !== previousSection;
                previousSection = section;

                const isCollapsed = collapsedSections[section] === true;
                const sectionHeader = showSectionHeader ? (
                    <SectionHeader
                        key={`section-${section}-${row?.display_order ?? index}`}
                        label={section}
                        expanded={!isCollapsed}
                        onToggle={() => setCollapsedSections(prev => ({
                            ...prev,
                            [section]: !prev[section],
                        }))}
                        colSpan={9}
                    />
                ) : null;

                if (isCollapsed) return sectionHeader;

                return (
                    <Fragment key={`statement-row-${row?.display_order ?? index}`}>
                        {sectionHeader}
                        <PLRow
                            row={row}
                            indent={!(
                                row?.is_subtotal === true ||
                                String(row?.row_type ?? '').toLowerCase() === 'subtotal'
                            )}
                            currency={currency}
                            tdStyles={tdStyles}
                        />
                    </Fragment>
                );
            })}
        </>
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
                        <td style={{ ...MTD, color: Number(row.total_revenue) < 0 ? C.rose : '#334155' }}>{fmtViewAllNum(row.total_revenue)}</td>
                        <td style={{ ...MTD, color: Number(row.gross_profit) < 0 ? C.rose : C.green, fontWeight: 600 }}>{fmtViewAllNum(row.gross_profit)}</td>
                        <td style={{ ...MTD, color: Number(row.ebitda) < 0 ? C.rose : C.purple, fontWeight: 600 }}>{fmtViewAllNum(row.ebitda)}</td>
                        <td style={{ ...MTD, color: Number(row.net_profit) < 0 ? C.rose : C.orange, fontWeight: 600 }}>{fmtViewAllNum(row.net_profit)}</td>
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

    const getFavourability = (value) => {
        const normalized = String(value ?? '').trim().toLowerCase();
        if (normalized === 'favourable' || normalized === 'favorable') {
            return { label: 'Favourable', color: C.green };
        }
        if (normalized === 'unfavourable' || normalized === 'unfavorable') {
            return { label: 'Unfavourable', color: C.rose };
        }
        return { label: 'Neutral', color: C.slate };
    };

    const amountColor = (value, fallback = '#334155') => {
        const n = Number(value);
        return Number.isFinite(n) && n < 0 ? C.rose : fallback;
    };

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
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
                    <th style={MTH}>Favourability</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, i) => {
                    const currentValue = Number(row.current_value ?? row.current);
                    const compareValue = Number(row.compare_value ?? row.compare);
                    const priorYearValue = Number(row.prior_year_value ?? row.prior_year);

                    // IMPORTANT: use backend-provided variance/favourability only.
                    // No frontend recalculation or sign inversion.
                    const varVal = Number.isFinite(Number(row.variance_amount))
                        ? Number(row.variance_amount)
                        : null;
                    const varPct = Number.isFinite(Number(row.variance_pct_current_vs_compare))
                        ? Number(row.variance_pct_current_vs_compare)
                        : null;

                    const favourability = getFavourability(row.favourability);

                    return (
                        <tr key={i}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <td style={{ ...MTD_L, fontWeight: 700 }}>{row.metric}</td>
                            <td style={{ ...MTD, fontWeight: 700, color: amountColor(currentValue, C.primary) }}>
                                {fmtViewAllNum(currentValue)}
                            </td>
                            <td style={{ ...MTD, color: amountColor(compareValue) }}>
                                {fmtViewAllNum(compareValue)}
                            </td>
                            <td style={{ ...MTD, color: amountColor(priorYearValue, C.slate) }}>
                                {fmtViewAllNum(priorYearValue)}
                            </td>
                            <td style={{
                                ...MTD,
                                color: amountColor(varVal, varVal !== null && varVal >= 0 ? C.green : C.rose),
                                fontWeight: 700,
                            }}>
                                {varVal !== null && Number.isFinite(varVal) ? <VarBadge v={varVal} /> : '—'}
                            </td>
                            <td style={{
                                ...MTD,
                                color: varPct !== null && Number(varPct) < 0 ? C.rose : C.green,
                                fontWeight: 700,
                            }}>
                                {varPct !== null && Number.isFinite(varPct) ? <VarBadge v={varPct} isPct /> : '—'}
                            </td>
                            <td style={{ ...MTD, color: favourability.color, fontWeight: 700, textAlign: 'center' }}>
                                {favourability.label}
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
                        <td style={{ ...MTD, fontWeight: 600, color: Number(item.amount) < 0 ? C.rose : '#334155' }}>{fmtViewAllNum(item.amount)}</td>
                        <td style={{ ...MTD, fontWeight: 700, color: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}>
                            {item.pct != null ? `${Number(item.pct).toFixed(0)}%` : '—'}
                        </td>
                        <td style={MTD}>
                            {totalExpenses ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden', maxWidth: 100 }}>
                                        <div style={{ width: `${item.pct || 0}%`, height: '100%', background: EXPENSE_COLORS[i % EXPENSE_COLORS.length], borderRadius: 3 }} />
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: C.slate }}>{item.pct?.toFixed(0)}%</span>
                                </div>
                            ) : '—'}
                        </td>
                    </tr>
                ))}
                {/* Total row */}
                <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                    <td style={{ ...MTD_L, fontWeight: 800, color: C.navy }}>Total Expenses</td>
                    <td style={{ ...MTD, fontWeight: 800, color: Number(totalExpenses) < 0 ? C.rose : C.navy }}>{fmtViewAllNum(totalExpenses)}</td>
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
                        <td style={{ ...MTD, fontWeight: row.isNet ? 800 : 500, color: Number(row.current) < 0 ? C.rose : (row.isNet ? C.green : '#334155') }}>{fmtViewAllNum(row.current)}</td>
                        <td style={{ ...MTD, color: row.compare != null && Number(row.compare) < 0 ? C.rose : C.slate }}>{row.compare != null ? fmtViewAllNum(row.compare) : '—'}</td>
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
    rows = [],
    currency = 'AED',
    periodName,
    comparePeriodName,
}) {
    const statementHeaderRef = useRef(null);

    const handleBodyScroll = useCallback((event) => {
        const scrollLeft = event.currentTarget.scrollLeft;
        if (statementHeaderRef.current) {
            statementHeaderRef.current.style.transform = `translateX(-${scrollLeft}px)`;
        }
    }, []);

    const hasData = Array.isArray(rows) && rows.length > 0;

    if (!hasData) {
        return (
            <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>
                No data available
            </div>
        );
    }

    return (
        <div style={{ width: '100%' }}>
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    background: '#fff',
                    overflow: 'hidden',
                    borderBottom: '1px solid #e2e8f0',
                }}
            >
                <div ref={statementHeaderRef} style={{ willChange: 'transform' }}>
                    <table
                        style={{
                            width: '100%',
                            minWidth: 1100,
                            borderCollapse: 'collapse',
                            tableLayout: 'fixed',
                            fontSize: '0.74rem',
                        }}
                    >
                        <StatementColGroup />
                        <thead>
                            <tr>
                                <th style={{ ...MTH_L, width: '25%', minWidth: 250 }}>
                                    Particulars
                                </th>
                                <th style={MTH}>
                                    Actual PTD
                                    <br />
                                    <span style={{ fontWeight: 400, opacity: 0.75 }}>
                                        {periodName || '—'}
                                    </span>
                                </th>
                                <th style={MTH}>
                                    Compare PTD
                                    <br />
                                    <span style={{ fontWeight: 400, opacity: 0.75 }}>
                                        {comparePeriodName || '—'}
                                    </span>
                                </th>
                                <th style={MTH}>
                                    Target PTD
                                    <br />
                                    <span style={{ fontWeight: 400, opacity: 0.75 }}>
                                        {comparePeriodName || '—'}
                                    </span>
                                </th>
                                <th style={MTH}>
                                    Var % Actual
                                    <br />
                                    <span style={{ fontWeight: 400, opacity: 0.75 }}>
                                        vs Compare
                                    </span>
                                </th>
                                <th style={MTH}>
                                    Var % Actual
                                    <br />
                                    <span style={{ fontWeight: 400, opacity: 0.75 }}>
                                        vs Target
                                    </span>
                                </th>
                                <th style={MTH}>Actual YTD</th>
                                <th style={MTH}>Target YTD</th>
                                <th style={MTH}>
                                    Var % YTD
                                    <br />
                                    <span style={{ fontWeight: 400, opacity: 0.75 }}>
                                        vs Target
                                    </span>
                                </th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>

            <div
                onScroll={handleBodyScroll}
                style={{ overflowX: 'auto' }}
            >
                <table
                    style={{
                        width: '100%',
                        minWidth: 1100,
                        borderCollapse: 'collapse',
                        tableLayout: 'fixed',
                        fontSize: '0.74rem',
                    }}
                >
                    <StatementColGroup />
                    <tbody>
                        <StatementRowsRenderer
                            rows={rows}
                            currency={currency}
                            tdStyles={MTD}
                        />
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* =====================================================
      FOOTER DATE
   ===================================================== */

const formatDataAsOf = (
    date
) => {

    if (!date) {
        return "";
    }

    const parsedDate =
        new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return date;
    }

    return parsedDate.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function PLAnalytics() {

    /* ── Dropdown options & Filter state ─────────────────────────── */

    const statementTableScrollRef = useRef(null);
    const statementHeaderInnerRef = useRef(null);

    const handleStatementTableScroll = useCallback((event) => {
        const scrollLeft = event.currentTarget.scrollLeft;
        if (statementHeaderInnerRef.current) {
            statementHeaderInnerRef.current.style.transform = `translateX(-${scrollLeft}px)`;
        }
    }, []);
    const [filterOptions, setFilterOptions] = useState({
        legalGroups: [],
        legalEntities: [],
        parentDivisions: [],
        subdivisions: [],
        years: [],
        periods: [],
        latestPeriod: '',
        comparePeriods: [],
        currencies: ['AED'],
    });

    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);


    const [
        dataAsOf,
        setDataAsOf,
    ] = useState(null);


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
            if (key === 'legalGroupId') { next.legalEntityId = []; next.parentDivisionId = []; next.subdivisionId = []; }
            if (key === 'legalEntityId') { next.parentDivisionId = []; next.subdivisionId = []; }
            if (key === 'parentDivisionId') { next.subdivisionId = []; }
            return next;
        });
    };

    /* ── Data state ───────────────────────────────────────────────── */
    const [summary, setSummary] = useState(null);
    const [trendData, setTrendData] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [expenseData, setExpenseData] = useState(null);
    const [statementData, setStatementData] = useState(null);


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
                        ? [getLatestBackendPeriod(options, options.periods)]
                        : ['All'],

            comparePeriodName:
                Array.isArray(source?.comparePeriodName)
                    ? source.comparePeriodName.filter(Boolean)
                    : source?.comparePeriodName
                        ? [source.comparePeriodName]
                        : [],

            legalEntityId:
                Array.isArray(source?.legalEntityId)
                    ? [...source.legalEntityId]
                    : [],

            parentDivisionId:
                Array.isArray(source?.parentDivisionId)
                    ? [...source.parentDivisionId]
                    : [],

            subdivisionId:
                Array.isArray(source?.subdivisionId)
                    ? [...source.subdivisionId]
                    : [],
        };
    };


    const buildViewAllOptions = (options) => ({
        legalEntities: options?.legalEntities || filterOptions.legalEntities || [],
        parentDivisions: options?.parentDivisions || filterOptions.parentDivisions || [],
        subdivisions: options?.subdivisions || filterOptions.subdivisions || [],
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

            // Compare With must come only from the backend filter-options
            // response. Do not generate/merge compare periods in the frontend.
            const comparePeriods = Array.isArray(data?.comparePeriods)
                ? data.comparePeriods
                : Array.isArray(data?.compare_periods)
                    ? data.compare_periods
                    : [];

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
                    data?.legal_entities || filterOptions?.legalEntities || [],

                parentDivisions:
                    data?.parent_divisions || filterOptions?.parentDivisions || [],

                subdivisions:
                    data?.subdivisions || filterOptions?.subdivisions || [],

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
                    ? [getLatestBackendPeriod(options, options.periods)]
                    : ['All'];

        const backendComparePeriods = Array.isArray(options?.comparePeriods)
            ? options.comparePeriods
            : [];

        const mainCompare = Array.isArray(appliedFilters?.comparePeriodName)
            ? appliedFilters.comparePeriodName.filter(Boolean)
            : appliedFilters?.comparePeriodName
                ? [appliedFilters.comparePeriodName]
                : [];

        const selectedComparePeriod = mainCompare.find(compare =>
            backendComparePeriods.some(period => String(period) === String(compare))
        );

        const initial = cloneViewAllFilters(
            {
                ...appliedFilters,

                // IMPORTANT
                year: selectedYear,

                periodName: selectedPeriod,

                // Preserve only a backend-provided Compare With value.
                // The View All Compare With list itself comes exclusively from
                // /api/pl/filter-options -> compare_periods.
                comparePeriodName:
                    selectedComparePeriod ||
                    backendComparePeriods[0] ||
                    '',
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
            subdivisionId: viewAllFilters.subdivisionId,
            year: optionYear,
            periodName: optionPeriod,
        })
            .then(data => {
                if (cancelled) return;
                const periods = data.periods || [];

                // Compare With must use only backend compare_periods for the
                // currently selected Period. Never build it from periods in frontend.
                const comparePeriods = Array.isArray(data?.comparePeriods)
                    ? data.comparePeriods
                    : Array.isArray(data?.compare_periods)
                        ? data.compare_periods
                        : [];
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
                    legalEntities: data.legalEntities || filterOptions.legalEntities || [],
                    parentDivisions: data.parentDivisions || filterOptions.parentDivisions || [],
                    subdivisions: data.subdivisions || filterOptions.subdivisions || [],
                    years,
                    periods,
                    comparePeriods,
                });

                // Keep the selected Compare With only when it is returned by the
                // backend for the newly selected Period. Otherwise use the first
                // backend-provided compare period, or blank when none is available.
                setViewAllFilters(prev => {
                    if (!prev) return prev;

                    const currentCompare = Array.isArray(prev.comparePeriodName)
                        ? prev.comparePeriodName.filter(Boolean)
                        : prev.comparePeriodName
                            ? [prev.comparePeriodName]
                            : [];

                    const validCompare = currentCompare.filter(value =>
                        comparePeriods.some(period => String(period) === String(value))
                    );

                    const nextCompare =
                        validCompare.length > 0
                            ? [validCompare[0]]
                            : comparePeriods.length > 0
                                ? [comparePeriods[0]]
                                : [];

                    const currentValue = currentCompare[0] || '';
                    const nextValue = nextCompare[0] || '';

                    if (currentValue === nextValue) return prev;

                    return {
                        ...prev,
                        comparePeriodName: nextCompare,
                    };
                });
            })
            .catch(() => {
                // Keep the already loaded modal options if a cascading refresh fails.
            });

        return () => { cancelled = true; };
    }, [
        openModal,
        viewAllFilters?.year?.join('|'),
        viewAllFilters?.periodName?.join('|'),
        viewAllFilters?.legalEntityId?.join('|'),
        viewAllFilters?.parentDivisionId?.join('|'),
        viewAllFilters?.subdivisionId?.join('|'),
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
                const latestBackendPeriod = getLatestBackendPeriod(data, periods);
                const periodValues = periods
                    .map(period => {
                        if (period === null || period === undefined) return '';
                        if (typeof period === 'object') {
                            return String(
                                period.value ??
                                period.id ??
                                period.period_name ??
                                period.periodName ??
                                period.label ??
                                period.name ??
                                ''
                            ).trim();
                        }
                        return String(period).trim();
                    })
                    .filter(Boolean);
                const backendCompare = data.comparePeriods || [];

                // Prior periods from backend (e.g. ['Jan-26'] for Feb-26)
                const priorPeriods = backendCompare.filter(p => p !== filters.periodName);
                // All other periods in fiscal year (excluding current selected period and prior periods)
                const otherPeriods = periods.filter(p => p !== (filters.periodName || periods[0]) && !priorPeriods.includes(p));
                // Combined comparison periods: prior periods first, then other available periods
                const comparePeriods = [...priorPeriods, ...otherPeriods];
                const backendCurrencies =
                    data?.reporting_currencies ??
                    data?.reportingCurrencies ??
                    data?.currencies ??
                    [];
                const currencies = normalizeCurrencyOptions(backendCurrencies);
                if (!currencies.length) currencies.push('AED');

                setFilterOptions(prev => ({
                    ...prev,
                    legalGroups: data.legalGroups || [],
                    legalEntities: data.legalEntities || [],
                    parentDivisions: data.parentDivisions || [],
                    subdivisions: data.subdivisions || [],
                    years,
                    periods,
                    latestPeriod: latestBackendPeriod,
                    comparePeriods,
                    currencies,
                }));

                setFilters(f => {
                    const nextComparePeriod = comparePeriods.includes(f.comparePeriodName)
                        ? f.comparePeriodName
                        : (priorPeriods[0] || '');
                    const currentPeriod = String(f.periodName || '').trim();
                    const nextPeriod =
                        currentPeriod && periodValues.includes(currentPeriod)
                            ? currentPeriod
                            : (latestBackendPeriod || '');
                    const currentCurrency = String(f.currency || '').trim();
                    const nextCurrency =
                        currentCurrency && currencies.some(c => String(c) === currentCurrency)
                            ? currentCurrency
                            : (currencies[0] || 'AED');
                    return {
                        ...f,
                        year: f.year || years[0] || '',
                        // Keep a user-selected Period when valid; otherwise use
                        // the latest Period supplied by the backend.
                        periodName: nextPeriod,
                        comparePeriodName: nextComparePeriod,
                        currency: nextCurrency,
                    };
                });

                setAppliedFilters(f => {
                    const nextComparePeriod = comparePeriods.includes(f.comparePeriodName)
                        ? f.comparePeriodName
                        : (priorPeriods[0] || '');
                    const currentPeriod = String(f.periodName || '').trim();
                    const nextPeriod =
                        currentPeriod && periodValues.includes(currentPeriod)
                            ? currentPeriod
                            : (latestBackendPeriod || '');
                    const currentCurrency = String(f.currency || '').trim();
                    const nextCurrency =
                        currentCurrency && currencies.some(c => String(c) === currentCurrency)
                            ? currentCurrency
                            : (currencies[0] || 'AED');
                    return {
                        ...f,
                        year: f.year || years[0] || '',
                        periodName: nextPeriod,
                        comparePeriodName: nextComparePeriod,
                        currency: nextCurrency,
                    };
                });
            })
            .catch(err => setErrors(prev => ({ ...prev, filters: err?.message || 'Failed to load filters' })))
            .finally(() => setLoading(prev => ({ ...prev, filters: false })));
    }, [filters.year, filters.periodName]);

    /* ── Fetch all data ───────────────────────────────────────────── */
    const fetchAll = useCallback((f) => {
        setLoading({ filters: false, summary: true, trend: true, comparison: true, expenseBreakdown: true, statement: true });
        setErrors({});
        const guard = (key, promise) =>
            promise
                .catch(err => { setErrors(prev => ({ ...prev, [key]: err?.message || 'Failed to load data' })); return null; })
                .finally(() => setLoading(prev => ({ ...prev, [key]: false })));

        guard('summary', fetchPLSummary(f)).then(d => {
            if (d) {
                setSummary(d);
                setDataAsOf(
                    d?.data_as_of ??
                    d?.dataAsOf ??
                    d?.as_of_date ??
                    d?.report_date ??
                    null
                );
            }
        });
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
            periodName: getLatestBackendPeriod(filterOptions, filterOptions.periods) || '',
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

        exportPL(section, format, appliedFilters)
            .then(() => {
                showToast(
                    `${format.toUpperCase()} export downloaded successfully.`,
                    'success'
                );
            })
            .catch(err => {
                showToast(
                    `Export failed: ${err?.message || 'Unknown error'}. Please try again.`,
                    'error'
                );
            })
            .finally(() => {
                setExporting(null);
            });
    };
    /* ── View All export handler ─────────────────────────────────── */

    const [viewAllExporting, setViewAllExporting] = useState(null);

    const handleViewAllExport = (format, section) => {
        if (!viewAllFilters || viewAllExporting) return;

        setViewAllExporting(format);

        /*
         * The revised P&L statement View All must use the backend statement
         * export, not a client-generated file. Other View All exports keep
         * their existing report routing unchanged.
         */
        const reportName = openModal === 'statement'
            ? 'statement'
            : (section || 'full');

        exportPL(reportName, format, viewAllFilters)
            .then(() => {
                showToast(
                    `${format.toUpperCase()} export downloaded successfully.`,
                    'success'
                );
            })
            .catch((err) => {
                showToast(
                    `Export failed: ${err?.message || 'Unknown error'}. Please try again.`,
                    'error'
                );
            })
            .finally(() => {
                setViewAllExporting(null);
            });
    };

    /* ── Derived values ───────────────────────────────────────────── */
    const currency = appliedFilters.currency || 'AED';
    const compareLbl = appliedFilters.comparePeriodName ? `vs ${appliedFilters.comparePeriodName}` : '';
    const periodLabel = appliedFilters.periodName || 'Actual';
    const compareLabel = appliedFilters.comparePeriodName || 'Compare';
    const priorLabel = 'Prior Year';
    const expenseItems = expenseData?.items || (Array.isArray(expenseData?.data) ? expenseData.data : []);
    const totalExpenses = expenseData?.total_expenses
        ?? expenseItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    /* ── KPI source rows / target mapping ───────────────────────────── */
    const kpiStatementRows = Array.isArray(statementData?.rows)
        ? statementData.rows
        : Array.isArray(statementData?.data)
            ? statementData.data
            : Array.isArray(statementData)
                ? statementData
                : [];

    const normalizeKpiLabel = (value) =>
        String(value ?? '')
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();

    const findStatementMetric = (labels) => {
        const wanted = labels.map(normalizeKpiLabel);

        const exact = kpiStatementRows.find((row) => {
            const label = normalizeKpiLabel(row?.particulars ?? row?.label ?? row?.name);
            return wanted.some((item) => label === item);
        });

        if (exact) return exact;

        return kpiStatementRows.find((row) => {
            const label = normalizeKpiLabel(row?.particulars ?? row?.label ?? row?.name);
            return wanted.some((item) => label.includes(item) || item.includes(label));
        }) || null;
    };

    const getFirstMetricValue = (obj, keys) => {
        for (const key of keys) {
            const value = obj?.[key];
            if (value !== null && value !== undefined && value !== '') return value;
        }
        return null;
    };

    const revenueMetric = findStatementMetric([
        'Total Revenue',
        'Sales Revenue',
        'Revenue',
    ]);
    const grossProfitMetric = findStatementMetric(['Gross Profit']);
    const ebitdaMetric = findStatementMetric(['EBITDA']);
    const netProfitMetric = findStatementMetric(['Net Profit']);

    const getKpiTarget = (summaryKeys, varianceKeys, statementMetric) => ({
        target: getFirstMetricValue(summary, summaryKeys) ?? statementMetric?.target_ptd ?? null,
        variancePct:
            getFirstMetricValue(summary, varianceKeys) ??
            statementMetric?.variance_pct_current_vs_target ??
            null,
    });

    const revenueTarget = getKpiTarget(
        ['total_revenue_target', 'revenue_target', 'target_revenue', 'target_total_revenue'],
        ['total_revenue_variance_pct', 'revenue_variance_pct', 'revenue_variance_vs_target_pct'],
        revenueMetric
    );
    const grossProfitTarget = getKpiTarget(
        ['gross_profit_target', 'target_gross_profit'],
        ['gross_profit_variance_pct', 'gross_profit_variance_vs_target_pct'],
        grossProfitMetric
    );
    const ebitdaTarget = getKpiTarget(
        ['ebitda_target', 'target_ebitda'],
        ['ebitda_variance_pct', 'ebitda_variance_vs_target_pct'],
        ebitdaMetric
    );
    const netProfitTarget = getKpiTarget(
        ['net_profit_target', 'target_net_profit'],
        ['net_profit_variance_pct', 'net_profit_variance_vs_target_pct'],
        netProfitMetric
    );

    const netProfitMarginTarget = getKpiTarget(
        ['net_profit_margin_target', 'target_net_profit_margin', 'target_net_profit_pct'],
        ['net_profit_margin_variance_pct', 'net_profit_margin_variance_vs_target_pct'],
        null
    );
    const ebitdaMarginTarget = getKpiTarget(
        ['ebitda_margin_target', 'target_ebitda_margin', 'target_ebitda_pct'],
        ['ebitda_margin_variance_pct', 'ebitda_margin_variance_vs_target_pct'],
        null
    );

    /* ── KPI card definitions ─────────────────────────────────────── */
    const kpiCards = [
        {
            id: 'total-rev',
            label: 'Sales Revenue (PTD)',
            value: fmtKPI(summary?.total_revenue, currency),
            targetText: revenueTarget.target != null ? fmtKPI(revenueTarget.target, currency) : null,
            targetVariancePct: revenueTarget.variancePct,
            color: '#2563eb',
            iconBg: '#eff6ff',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>,
        },
        {

            id: 'gross-profit',
            label: 'Gross Profit (PTD)',
            value: fmtKPI(summary?.gross_profit, currency),
            subValue: summary?.gross_profit_pct != null
                ? `Margin: ${fmtKPIPct(summary.gross_profit_pct)}`
                : null,
            targetText: grossProfitTarget.target != null
                ? fmtKPI(grossProfitTarget.target, currency)
                : null,
            targetVariancePct: grossProfitTarget.variancePct,
            color: '#16a34a',
            iconBg: '#f0fdf4',

            icon: (
                <HandCoins size={22} strokeWidth={2}
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round" />
            ),
            // icon: (
            //   <svg
            //     width="22"
            //     height="22"
            //     viewBox="0 0 24 24"
            //     fill="none"
            //     stroke="currentColor"
            //     strokeWidth="2"
            //     strokeLinecap="round"
            //     strokeLinejoin="round"
            //   >
            //     <circle cx="12" cy="12" r="9" />
            //     <path d="M9 9.5c0-1.1 1.3-2 3-2s3 .9 3 2-1.3 2-3 2-3 .9-3 2 1.3 2 3 2 3-.9 3-2" />
            //     <path d="M12 5.5v13" />
            //   </svg>
            // ),
        },

        {
            id: 'ebitda',
            label: 'EBITDA (PTD)',
            value: fmtKPI(summary?.ebitda, currency),
            subValue: summary?.ebitda_pct != null ? `Margin: ${fmtKPIPct(summary.ebitda_pct)}` : null,
            targetText: ebitdaTarget.target != null ? fmtKPI(ebitdaTarget.target, currency) : null,
            targetVariancePct: ebitdaTarget.variancePct,
            color: '#7c3aed',
            iconBg: '#faf5ff',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>,
        },
        {
            id: 'net-profit',
            label: 'Net Profit (PTD)',
            value: fmtKPI(summary?.net_profit, currency),
            targetText: netProfitTarget.target != null ? fmtKPI(netProfitTarget.target, currency) : null,
            targetVariancePct: netProfitTarget.variancePct,
            color: '#ea580c',
            iconBg: '#fff7ed',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" /><path d="M12 18V6" /></svg>,
        },
        {
            id: 'np-margin',
            label: 'Net Profit Margin (PTD)',
            value: fmtKPIPct(summary?.net_profit_pct),
            targetText: netProfitMarginTarget.target != null ? fmtKPIPct(netProfitMarginTarget.target) : null,
            targetVariancePct: netProfitMarginTarget.variancePct,
            color: '#0d9488',
            iconBg: '#f0fdfa',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 4.5C4.5 4.5 2 7 2 10s2.5 5.5 5.5 5.5S13 13 13 10 10.5 4.5 7.5 4.5zm0 9C5.57 13.5 4 11.93 4 10s1.57-3.5 3.5-3.5S11 8.07 11 10s-1.57 3.5-3.5 3.5z" fillOpacity="0.9" /><path d="M19 8l-7 8M14 4h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>,
        },
        {
            id: 'ebitda-margin',
            label: 'EBITDA Margin (PTD)',
            value: fmtKPIPct(summary?.ebitda_pct),
            targetText: ebitdaMarginTarget.target != null ? fmtKPIPct(ebitdaMarginTarget.target) : null,
            targetVariancePct: ebitdaMarginTarget.variancePct,
            color: '#db2777',
            iconBg: '#fdf2f8',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.12" /><polyline points="12 6 12 12 16 14" /></svg>,
        },
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


    /*
     * Revised CFO statement:
     * Keep every API row intact and let StatementRowsRenderer sort exclusively
     * by display_order. No frontend section/row ordering or percentage formulas.
     */
    const statementRows = kpiStatementRows;
    const orderedStatementRows = statementRows;
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
                    <ViewAllModal isOpen={openModal === 'kpi'} onClose={closeModal} title="KPI Summary" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'All'} | Amounts in ${currency}`}>
                        <ViewAllFilterBar
                            filters={viewAllFilters}
                            setFilters={setViewAllFilters}
                            filterOptions={viewAllFilterOptions}
                            showCompare
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

                    <ViewAllModal isOpen={openModal === 'trend'} onClose={closeModal} title="P&L Trend — All Periods" subtitle={`Amounts in ${currency}`}>
                        <ViewAllFilterBar
                            filters={viewAllFilters}
                            setFilters={setViewAllFilters}
                            filterOptions={viewAllFilterOptions}
                            showCompare
                            onApply={applyViewAllFilters}
                            onReset={resetViewAllFilters}
                            loading={viewAllLoading}
                            onExport={handleViewAllExport}
                            exporting={viewAllExporting}
                        />
                        {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={220} /></div> : <TrendViewAll data={viewAllData.trend} currency={currency} />}
                    </ViewAllModal>

                    <ViewAllModal isOpen={openModal === 'comparison'} onClose={closeModal} title="P&L Comparison" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'Current'} | Amounts in ${currency}`}>
                        <ViewAllFilterBar
                            filters={viewAllFilters}
                            setFilters={setViewAllFilters}
                            filterOptions={viewAllFilterOptions}
                            showCompare
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

                    <ViewAllModal isOpen={openModal === 'expense'} onClose={closeModal} title="Expense Breakdown" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'All'} | Amounts in ${currency}`}>
                        <ViewAllFilterBar
                            filters={viewAllFilters}
                            setFilters={setViewAllFilters}
                            filterOptions={viewAllFilterOptions}
                            showCompare
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

                    <ViewAllModal isOpen={openModal === 'statement'} onClose={closeModal} title="Profit & Loss Statement" subtitle={`Period: ${(viewAllFilters.periodName || []).join(', ') || 'All'} | Amounts in ${currency}`}>
                        <ViewAllFilterBar
                            filters={viewAllFilters}
                            setFilters={setViewAllFilters}
                            filterOptions={viewAllFilterOptions}
                            showCompare
                            onApply={applyViewAllFilters}
                            onReset={resetViewAllFilters}
                            loading={viewAllLoading}
                            onExport={handleViewAllExport}
                            exporting={viewAllExporting}
                        />
                        {viewAllLoading ? <div style={{ padding: 24 }}><Skeleton h={300} /></div> : (
                            <StatementViewAll
                                rows={viewAllData.statement?.rows || []}
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
                {/* Required order: Legal Group → Legal Entity → Parent Division → Sub-Division → Reporting Currency → Year → Period → Compare With */}
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
                <FilterField label="Reporting Currency" style={{ minWidth: 125, width: 125, maxWidth: 125, flex: '0 0 125px' }}>
                    <select
                        id="filter-pl-reporting-currency"
                        style={selStyle}
                        value={filters.currency || ''}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                currency: e.target.value,
                            }))
                        }
                        disabled={filterOptions.currencies.length === 0}
                    >
                        {filterOptions.currencies.length === 0 && <option value="">Loading…</option>}
                        {filterOptions.currencies.map((c) => (
                            <option key={String(c)} value={String(c)}>{String(c)}</option>
                        ))}
                    </select>
                </FilterField>
                <FilterField label="Year" style={{ minWidth: 70, flex: '0.7 1 0' }}>
                    <select id="filter-pl-year" style={selStyle} value={filters.year} onChange={e => setFilters(prev => ({ ...prev, year: e.target.value }))} disabled={loading.filters}>
                        {filterOptions.years.length === 0 && <option key="loading" value="">Loading…</option>}
                        {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </FilterField>
                <FilterField label="Period" style={{ minWidth: 95, flex: '0.85 1 0' }}>
                    <select id="filter-pl-period" style={selStyle} value={filters.periodName} onChange={e => setFilters(prev => ({ ...prev, periodName: e.target.value }))} disabled={loading.filters}>
                        {filterOptions.periods.length === 0 && <option key="loading" value="">Loading…</option>}
                        {filterOptions.periods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </FilterField>
                <FilterField label="Compare With" style={{ minWidth: 125, flex: '1.15 1 0' }}>
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
                    onExport={(format) =>
                        exportPL('trend', format, appliedFilters)
                    }
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
                {/* <ExpenseBreakdownCard
                    data={expenseItems}
                    loading={loading.expenseBreakdown}
                    currency={currency}
                    error={errors.expenseBreakdown}
                    onRetry={() => fetchAll(appliedFilters)}
                    menuItems={expenseMenuItems}
                    KebabMenu={KebabMenu}
                    ErrorBanner={ErrorBanner}
                    Skeleton={Skeleton}
                /> */}

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
                    filters={appliedFilters}
                />
            </div>

            {/* ═══════════════════════════════════════════════════════════════
         COST STRUCTURE ANALYSIS
         Uses the parent page's already-applied P&L filters and backend
         filter options. No existing P&L API/integration is changed.
      ═══════════════════════════════════════════════════════════════ */}

            <div className="card" style={{ padding: 0, overflow: 'clip', marginBottom: 8 }}>
                <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, background: 'linear-gradient(90deg,#f8fafc,#fff)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <CostStructureAnalysis
                        filters={appliedFilters}
                        filterOptions={filterOptions}
                        onToast={showToast}
                    />
                </div>
            </div>

            {/* ══ P&L STATEMENT TABLE ══ */}
            <div className="card" style={{ padding: 0, overflow: 'clip', marginBottom: 8 }}>
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
                    <>
                        <div
                            style={{
                                position: 'sticky',
                                top: 0,
                                zIndex: 30,
                                background: '#fff',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                ref={statementHeaderInnerRef}
                                style={{
                                    willChange: 'transform',
                                }}
                            >
                                <table style={{ width: '100%', minWidth: 1100, borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: '0.74rem' }}>
                                    <StatementColGroup />
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
                                            </th>

                                            <th style={TH}>
                                                Actual PTD
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
                                                <br />
                                                <span
                                                    style={{
                                                        fontWeight: 400,
                                                        opacity: 0.75,
                                                    }}
                                                >
                                                    {appliedFilters.comparePeriodName || 'Compare Month'}
                                                </span>
                                            </th>

                                            <th style={TH}>
                                                Var % Actual
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
                                                Var % Actual
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
                                                Actual YTD
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
                                </table>
                            </div>
                        </div>
                        <div
                            ref={statementTableScrollRef}
                            onScroll={handleStatementTableScroll}
                            style={{ overflowX: 'auto' }}
                        >
                            <table style={{ width: '100%', minWidth: 1100, borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: '0.74rem' }}>
                                <StatementColGroup />
                                <tbody>
                                    <StatementRowsRenderer
                                        rows={orderedStatementRows}
                                        currency={currency}
                                    />
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>



            {/* ══ FOOTER ══ */}
            <div style={{ fontSize: '0.64rem', color: C.muted, display: 'flex', justifyContent: 'space-between', paddingTop: 8, flexWrap: 'wrap', gap: 4 }}>
                <span>All values in {currency} &nbsp;|&nbsp; Period: {appliedFilters.periodName || '—'} &nbsp;|&nbsp; Compared with: {appliedFilters.comparePeriodName || '—'} &nbsp;|&nbsp; Last Updated On: {formatDataAsOf(dataAsOf) || '—'}</span>

                <span>☁️ Source: Oracle Fusion Cloud</span>
            </div>

        </div>
    );
}
