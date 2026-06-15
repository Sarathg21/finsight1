import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { fetchFilters } from '../services/salesRevenueApi';
import { useAuth } from './AuthContext';
import { LEGAL_ENTITIES, COUNTRIES, DIVISIONS, CURRENCIES, PERIODS, SCENARIOS } from '../data/masterData';

// ── Filter Context ─────────────────────────────────────────────────────────
// Central reactive state for all dashboard filter dimensions.
// Values are always constrained to the user's authorized data scope.

const FilterContext = createContext(null);

// ── Date-range presets ────────────────────────────────────────────────────
const now = new Date();
const YEAR = now.getFullYear();
const MONTH = now.getMonth(); // 0-indexed

export const DATE_PRESETS = [
  { key: 'current_month',   label: 'Current Month',    months: 1 },
  { key: 'previous_month',  label: 'Previous Month',   months: 1, offset: 1 },
  { key: 'qtd',             label: 'Quarter to Date',  months: Math.floor(MONTH % 3) + 1 },
  { key: 'ytd',             label: 'Year to Date',     months: MONTH + 1 },
  { key: 'full_year',       label: 'Full Year',        months: 12 },
  { key: 'custom',          label: 'Custom Range',     months: null },
];

export const COMPARISON_MODES = [
  { key: 'vs_py',     label: 'vs Prior Year' },
  { key: 'vs_budget', label: 'vs Budget' },
  { key: 'vs_pm',     label: 'vs Prior Month' },
  { key: 'ytd_vs_bgt',label: 'YTD vs Budget' },
];

// ── Month slices (Jan=0 … Dec=11) ─────────────────────────────────────────
export const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getPresetMonthIndices(presetKey) {
  switch (presetKey) {
    case 'current_month':  return [MONTH];
    case 'previous_month': return [MONTH === 0 ? 11 : MONTH - 1];
    case 'qtd': {
      const q = Math.floor(MONTH / 3) * 3;
      return Array.from({ length: MONTH - q + 1 }, (_, i) => q + i);
    }
    case 'ytd':      return Array.from({ length: MONTH + 1 }, (_, i) => i);
    case 'full_year': return Array.from({ length: 12 }, (_, i) => i);
    default:         return Array.from({ length: MONTH + 1 }, (_, i) => i); // ytd fallback
  }
}

export function FilterProvider({ children }) {
  const auth = useAuth();
  // Guard against HMR re-render before AuthProvider is in tree
  const { user, getScopedEntities, getScopedCountries, auditLog } = auth || {};

  // ── scoped dimension lists ──────────────────────────────────────────────
  const scopedEntities  = useMemo(() => getScopedEntities?.() || LEGAL_ENTITIES, [user?.id]);
  const scopedCountries = useMemo(() => getScopedCountries?.() || COUNTRIES.filter(c => c !== 'All Countries'), [user?.id]);
  const scopedDivisions = useMemo(() => {
    if (!user?.scope?.divisions || user.scope.divisions === 'all') return DIVISIONS;
    const d = user.scope.divisions;
    return Array.isArray(d) ? d : DIVISIONS;
  }, [user?.id]);

  // ── filter state ───────────────────────────────────────────────────────
  const [salesmenList, setSalesmenList] = useState(['all']);

  useEffect(() => {
    fetchFilters()
      .then(data => {
        if (data && data.salesmen) {
          setSalesmenList(['all', ...data.salesmen]);
        }
      })
      .catch(console.error);
  }, []);
  const [period,     setPeriod]     = useState('ytd');           // DATE_PRESETS key
  const [year,       setYear]       = useState(String(YEAR));
  const [country,    setCountry]    = useState('all');
  const [entity,     setEntity]     = useState('all');           // entity id or 'all'
  const [division,   setDivision]   = useState('all');
  const [currency,   setCurrency]   = useState('AED');
  const [comparison, setComparison] = useState('vs_py');         // COMPARISON_MODES key
  const [scenario,   setScenario]   = useState('Actual');
  const [salesman,   setSalesman]   = useState(
    user?.scope?.salesman || 'all'
  );
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo,   setCustomTo]   = useState(null);

  // Lock salesman if user scope restricts it
  const salesmanLocked = !!user?.scope?.salesman;
  const entityLocked   = scopedEntities.length === 1;

  // ── derived: active month indices in MONTHLY data ─────────────────────
  const activeMonthIndices = useMemo(() => {
    if (period === 'custom' && customFrom !== null && customTo !== null) {
      return Array.from({ length: customTo - customFrom + 1 }, (_, i) => customFrom + i);
    }
    return getPresetMonthIndices(period);
  }, [period, customFrom, customTo]);

  // ── drill state (KPI → chart → table) ─────────────────────────────────
  const [drillLevel,  setDrillLevel]  = useState(0);   // 0=KPI, 1=trend chart, 2=detail table
  const [drillTarget, setDrillTarget] = useState(null); // e.g. 'revenue', 'ar', etc.

  function drillDown(target) {
    setDrillTarget(target);
    setDrillLevel(prev => Math.min(prev + 1, 2));
    auditLog?.('drill_down', { target, level: drillLevel + 1 });
  }
  function drillReset() { setDrillLevel(0); setDrillTarget(null); }

  // ── audited setters ────────────────────────────────────────────────────
  function setFilterAudited(key, value, setter) {
    auditLog?.('filter_change', { filterKey: key, filterValue: value });
    setter(value);
  }

  const filters = {
    period, year, country, entity, division, currency,
    comparison, scenario, salesman, customFrom, customTo,
    activeMonthIndices, drillLevel, drillTarget,
  };

  const setters = {
    setPeriod:    v => setFilterAudited('period',    v, setPeriod),
    setYear:      v => setFilterAudited('year',      v, setYear),
    setCountry:   v => setFilterAudited('country',   v, setCountry),
    setEntity:    v => setFilterAudited('entity',    v, setEntity),
    setDivision:  v => setFilterAudited('division',  v, setDivision),
    setCurrency:  v => setFilterAudited('currency',  v, setCurrency),
    setComparison:v => setFilterAudited('comparison',v, setComparison),
    setScenario:  v => setFilterAudited('scenario',  v, setScenario),
    setSalesman:  v => !salesmanLocked && setFilterAudited('salesman', v, setSalesman),
    setCustomFrom, setCustomTo,
    drillDown, drillReset,
  };

  const meta = {
    scopedEntities, scopedCountries, scopedDivisions,
    salesmanLocked, entityLocked, salesmenList,
    DATE_PRESETS, COMPARISON_MODES, MONTHS_SHORT,
    activeMonthLabel: DATE_PRESETS.find(p => p.key === period)?.label || 'YTD',
    comparisonLabel: COMPARISON_MODES.find(c => c.key === comparison)?.label || 'vs Prior Year',
  };

  return (
    <FilterContext.Provider value={{ filters, setters, meta }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  return useContext(FilterContext);
}
