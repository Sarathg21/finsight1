import { useState, useRef } from 'react';
import { useFilters, DATE_PRESETS, COMPARISON_MODES } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';
import { CURRENCIES } from '../data/masterData';
import {
  Calendar, ChevronDown, Globe, Building2, Layers,
  BarChart2, TrendingUp, RefreshCw, Download, FileText,
  FileSpreadsheet, X, Filter,
} from 'lucide-react';

/* ── tiny helpers ────────────────────────────────────────────────── */
function Pill({ icon: Icon, label, value, id, children, accent }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  return (
    <div style={{ position: 'relative' }} ref={ref} id={id}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 8,
          background: open ? (accent || '#7c3aed') : '#fff',
          color: open ? '#fff' : '#334155',
          border: `1px solid ${open ? (accent || '#7c3aed') : '#e2e8f0'}`,
          fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.15s', whiteSpace: 'nowrap',
        }}
      >
        {Icon && <Icon size={13} style={{ opacity: 0.75 }} />}
        <span style={{ color: 'inherit', opacity: 0.65, fontWeight: 500 }}>{label}:</span>
        <span style={{ fontWeight: 700 }}>{value}</span>
        <ChevronDown size={11} style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <>
          {/* backdrop */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: '110%', left: 0, zIndex: 50,
            background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 200,
            overflow: 'hidden', animation: 'fadeInDown 0.15s ease',
          }}>
            {children({ close: () => setOpen(false) })}
          </div>
        </>
      )}
    </div>
  );
}

function OptionList({ items, selected, onSelect }) {
  return (
    <div style={{ maxHeight: 240, overflowY: 'auto', padding: '6px' }}>
      {items.map(item => {
        const key   = typeof item === 'string' ? item : item.key;
        const label = typeof item === 'string' ? item : item.label;
        const isActive = key === selected;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: '0.78rem', fontWeight: isActive ? 700 : 500,
              background: isActive ? '#ede9fe' : 'transparent',
              color: isActive ? '#7c3aed' : '#334155',
              transition: 'background 0.1s',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Export menu ─────────────────────────────────────────────────── */
function ExportMenu({ hasExportRight, filters, auditLog }) {
  const [open, setOpen] = useState(false);
  function doExport(type) {
    if (!hasExportRight(type === 'excel' ? 'excel' : type === 'csv' ? 'csv' : 'pdf')) return;
    auditLog?.('export', { exportType: type, ...filters });
    // Trigger browser download of a demo CSV
    if (type === 'csv') {
      const csv = 'Month,Revenue,GP,EBIT,Net Profit\nJan,42.1,16.0,9.3,6.7\nFeb,38.7,14.7,8.5,6.2\n';
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'finsight_export.csv'; a.click();
      URL.revokeObjectURL(url);
    } else {
      alert(`${type.toUpperCase()} export would download here in production.`);
    }
    setOpen(false);
  }

  const icons = { excel: FileSpreadsheet, pdf: FileText, csv: Download };

  return (
    <div style={{ position: 'relative' }}>
      <button
        id="export-btn"
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
          background: '#fff', color: '#334155', fontSize: '0.78rem', fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        <Download size={13} style={{ opacity: 0.7 }} />
        Export
        <ChevronDown size={11} style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: '110%', right: 0, zIndex: 50,
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: 6, minWidth: 160,
          }}>
            {[
              { type: 'excel', label: 'Excel (.xlsx)', right: 'excel' },
              { type: 'pdf',   label: 'PDF Report',   right: 'pdf'   },
              { type: 'csv',   label: 'CSV Data',     right: 'csv'   },
            ].map(({ type, label, right }) => {
              const allowed = hasExportRight(right);
              const Icon = icons[type];
              return (
                <button
                  key={type}
                  onClick={() => doExport(type)}
                  disabled={!allowed}
                  id={`export-${type}-btn`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: 'none', cursor: allowed ? 'pointer' : 'not-allowed',
                    fontSize: '0.78rem', fontWeight: 600,
                    background: 'transparent',
                    color: allowed ? '#334155' : '#cbd5e1',
                    opacity: allowed ? 1 : 0.5,
                    transition: 'background 0.1s',
                  }}
                >
                  <Icon size={13} />
                  {label}
                  {!allowed && <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: '#f59e0b' }}>🔒</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* FilterBar – drop-in for any dashboard page                          */
/* Props: compact (bool) – show a slimmer one-row version              */
/* ═══════════════════════════════════════════════════════════════════ */
export default function FilterBar({ compact = false, showSalesman = false }) {
  const { filters, setters, meta } = useFilters();
  const { user, hasExportRight, auditLog } = useAuth();

  const {
    period, year, country, entity, division, currency,
    comparison, scenario, salesman,
  } = filters;

  const {
    setPeriod, setYear, setCountry, setEntity,
    setDivision, setCurrency, setComparison, setScenario, setSalesman,
  } = setters;

  const {
    scopedEntities, scopedCountries, scopedDivisions,
    salesmanLocked, entityLocked,
    activeMonthLabel, comparisonLabel,
  } = meta;

  /* entity display name */
  const entityLabel = entity === 'all'
    ? 'All Entities'
    : scopedEntities.find(e => String(e.id) === String(entity))?.name?.split(' ').slice(0,2).join(' ') || entity;

  const countryLabel = country === 'all' ? 'All Countries' : country;
  const divisionLabel = division === 'all' ? 'All Divisions' : division.split(' ').slice(0,2).join(' ');

  const YEARS_OPT = ['2023', '2024', '2025', '2026'];

  return (
    <div
      id="filter-bar"
      style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
        padding: compact ? '10px 0' : '14px 0',
        borderBottom: '1px solid #f1f5f9', marginBottom: compact ? 16 : 20,
      }}
    >
      <style>{`
        @keyframes fadeInDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        #filter-bar button:not([disabled]):hover { background: #f8fafc !important; }
      `}</style>

      {/* Filter icon */}
      {!compact && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4, color: '#94a3b8' }}>
          <Filter size={14} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filters</span>
        </div>
      )}

      {/* ── Period preset ── */}
      <Pill id="filter-period" icon={Calendar} label="Period" value={activeMonthLabel} accent="#7c3aed">
        {({ close }) => (
          <OptionList
            items={DATE_PRESETS.map(p => ({ key: p.key, label: p.label }))}
            selected={period}
            onSelect={v => { setPeriod(v); close(); }}
          />
        )}
      </Pill>

      {/* ── Year ── */}
      <Pill id="filter-year" icon={Calendar} label="Year" value={year}>
        {({ close }) => (
          <OptionList
            items={YEARS_OPT}
            selected={year}
            onSelect={v => { setYear(v); close(); }}
          />
        )}
      </Pill>

      {/* ── Country (scoped) ── */}
      <Pill id="filter-country" icon={Globe} label="Country" value={countryLabel}>
        {({ close }) => (
          <OptionList
            items={['all', ...scopedCountries].map(c => ({ key: c, label: c === 'all' ? 'All Countries' : c }))}
            selected={country}
            onSelect={v => { setCountry(v); setEntity('all'); close(); }}
          />
        )}
      </Pill>

      {/* ── Entity (scoped, filtered by country) ── */}
      <Pill id="filter-entity" icon={Building2} label="Entity" value={entityLabel} accent={entityLocked ? '#94a3b8' : undefined}>
        {({ close }) => {
          const filtered = country === 'all'
            ? scopedEntities
            : scopedEntities.filter(e => e.country === country);
          return (
            <OptionList
              items={[{ key: 'all', label: 'All Entities' }, ...filtered.map(e => ({ key: String(e.id), label: e.name }))]}
              selected={String(entity)}
              onSelect={v => { setEntity(v); close(); }}
            />
          );
        }}
      </Pill>

      {/* ── Division ── */}
      <Pill id="filter-division" icon={Layers} label="Division" value={divisionLabel}>
        {({ close }) => (
          <OptionList
            items={['all', ...scopedDivisions].map(d => ({ key: d, label: d === 'all' ? 'All Divisions' : d }))}
            selected={division}
            onSelect={v => { setDivision(v); close(); }}
          />
        )}
      </Pill>

      {/* ── Currency ── */}
      <Pill id="filter-currency" icon={TrendingUp} label="CCY" value={currency}>
        {({ close }) => (
          <OptionList
            items={CURRENCIES}
            selected={currency}
            onSelect={v => { setCurrency(v); close(); }}
          />
        )}
      </Pill>

      {/* ── Comparison ── */}
      <Pill id="filter-comparison" icon={BarChart2} label="Compare" value={comparisonLabel} accent="#0ea5e9">
        {({ close }) => (
          <OptionList
            items={COMPARISON_MODES}
            selected={comparison}
            onSelect={v => { setComparison(v); close(); }}
          />
        )}
      </Pill>

      {/* ── Salesman (only if showSalesman or user is sales-scoped) ── */}
      {(showSalesman || salesmanLocked) && (
        <Pill id="filter-salesman" icon={Filter} label="Salesman" value={salesman === 'all' ? 'All' : salesman} accent={salesmanLocked ? '#94a3b8' : undefined}>
          {({ close }) => (
            <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: salesmanLocked ? '#94a3b8' : '#334155' }}>
              {salesmanLocked
                ? `Locked to: ${salesman}`
                : <OptionList 
                    items={meta.salesmenList.map(s => ({ key: s, label: s === 'all' ? 'All Salespeople' : s }))} 
                    selected={salesman} 
                    onSelect={v => { setSalesman(v); close(); }} 
                  />}
            </div>
          )}
        </Pill>
      )}

      {/* ── spacer + right-side actions ── */}
      <div style={{ flex: 1 }} />

      {/* Reset */}
      <button
        id="filter-reset-btn"
        onClick={() => {
          setPeriod('ytd'); setYear(String(new Date().getFullYear()));
          setCountry('all'); setEntity('all'); setDivision('all');
          setCurrency('AED'); setComparison('vs_py');
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
          borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
          color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
        }}
      >
        <RefreshCw size={12} /> Reset
      </button>

      {/* Export */}
      <ExportMenu hasExportRight={hasExportRight} filters={filters} auditLog={auditLog} />
    </div>
  );
}
