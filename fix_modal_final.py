import re

with open('src/pages/SalesRevenueReport.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new DetailApiModal function
new_modal = '''function DetailApiModal({
  isOpen,
  canExport,
  onClose,
  title,
  endpoint,
  fetchFn,
  columnDefs,
  filters,
  searchPlaceholder = 'Search...',
  maxWidth = '96vw',
  periodLabel = null,

  headerGroups = null,

  localFiltersConfig = null,
  dateFiltersConfig = null,
  showUnitToggle = false,
}) {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [searchTerm, setSearch] = useState('');
  const [page, setPage]         = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const pageSize = 15;

  const [localFiltersState, setLocalFiltersState] = useState({});
  const [dateFiltersState, setDateFiltersState]   = useState({});
  
  // Pending unapplied state
  const [pendingLocalFilters, setPendingLocalFilters] = useState({});
  const [pendingDateFilters, setPendingDateFilters]   = useState({});

  const [modalUnit, setModalUnit]                 = useState('aed');

  useEffect(() => {
    if (isOpen && localFiltersConfig && filters) {
      const initialState = {};
      localFiltersConfig.forEach(cfg => {
        const val = filters[cfg.key];
        initialState[cfg.key] = Array.isArray(val) ? val : (val && val !== 'All' ? [val] : ['All']);
      });
      setLocalFiltersState(initialState);
      setPendingLocalFilters(initialState);
    }
    if (isOpen && dateFiltersConfig && filters) {
      const initial = {};
      dateFiltersConfig.forEach(cfg => {
        initial[cfg.fromKey] = filters[cfg.fromKey] || '';
        initial[cfg.toKey]   = filters[cfg.toKey]   || '';
      });
      setDateFiltersState(initial);
      setPendingDateFilters(initial);
    }
  }, [isOpen, filters, localFiltersConfig, dateFiltersConfig]);

  const activeFilters = useMemo(() => {
    const combined = { ...filters };
    if (localFiltersConfig) {
      localFiltersConfig.forEach(cfg => {
        if (localFiltersState[cfg.key] !== undefined) {
          combined[cfg.key] = localFiltersState[cfg.key];
        }
      });
    }
    if (dateFiltersConfig) {
      dateFiltersConfig.forEach(cfg => {
        if (dateFiltersState[cfg.fromKey]) combined[cfg.fromKey] = dateFiltersState[cfg.fromKey];
        if (dateFiltersState[cfg.toKey])   combined[cfg.toKey]   = dateFiltersState[cfg.toKey];
      });
    }
    return combined;
  }, [filters, localFiltersConfig, localFiltersState, dateFiltersConfig, dateFiltersState]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    setRows([]);

    fetchFn(activeFilters)
      .then(res => {
        setRows(res?.data || []);
        setPage(0);
      })
      .catch(err => setError(err?.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [isOpen, activeFilters, fetchFn]);

  const handleApply = () => {
    setLocalFiltersState(pendingLocalFilters);
    setDateFiltersState(pendingDateFilters);
    setPage(0);
  };

  const handleReset = () => {
    const defaultLocal = {};
    const defaultDate = {};
    if (localFiltersConfig) localFiltersConfig.forEach(cfg => defaultLocal[cfg.key] = ['All']);
    if (dateFiltersConfig) dateFiltersConfig.forEach(cfg => { defaultDate[cfg.fromKey] = ''; defaultDate[cfg.toKey] = ''; });
    
    setPendingLocalFilters(defaultLocal);
    setPendingDateFilters(defaultDate);
    setLocalFiltersState(defaultLocal);
    setDateFiltersState(defaultDate);
    setPage(0);
  };

  if (!isOpen) return null;

  const filtered = rows.filter(r => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return columnDefs.some(col => String(r[col.key] || '').toLowerCase().includes(q));
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];
    const isNum = (v) => v != null && !isNaN(v);
    if (isNum(valA) && isNum(valB)) {
      return sortConfig.direction === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    }
    const sA = String(valA || '').toLowerCase();
    const sB = String(valB || '').toLowerCase();
    return sortConfig.direction === 'asc' ? sA.localeCompare(sB) : sB.localeCompare(sA);
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key) => {
    if (!key) return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sumKey = (arr, key) => arr.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);

  const fmtCurrency = (val) => {
    if (val === null || val === undefined) return '—';
    const raw = Number(val);
    if (isNaN(raw)) return '—';
    if (modalUnit === 'millions') {
      const m = raw / 1_000_000;
      return m.toFixed(2) + 'M';
    }
    return raw.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.35)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, animation: 'fadeIn 0.2s ease',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
      <div style={{
        background: '#fff', borderRadius: 16,
        width: '96vw', maxWidth: maxWidth,
        maxHeight: '94vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        animation: 'scaleUp 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        overflow: 'hidden', border: '1px solid #e2e8f0',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(90deg,#f8fafc,#fff)',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: C.navy }}>
              {title}
            </h3>
            {periodLabel && (
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2, fontWeight: 500 }}>
                Period: {periodLabel}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {showUnitToggle && (
              <UnitToggle
                unit={modalUnit}
                onToggle={setModalUnit}
                currency={filters?.reportingCurrency || 'AED'}
              />
            )}
            <ModalCloseButton onClick={onClose} />
          </div>
        </div>

        {/* Search & Export Bar */}
        <div style={{
          padding: '10px 20px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', gap: 4, alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 280, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              style={{
                padding: '6px 12px', borderRadius: 8, border: '1px solid #cbd5e1',
                fontSize: '0.78rem', minWidth: 200, outline: 'none',
              }}
            />
            {localFiltersConfig && localFiltersConfig.map((cfg, idx) => {
              const selectedValues = pendingLocalFilters[cfg.key] || ['All'];
              return (
                <div key={idx} style={{ width: 180, position: 'relative' }}>
                  <MultiSelect
                    options={cfg.options}
                    value={selectedValues}
                    onChange={(vals) => {
                      setPendingLocalFilters(prev => ({ 
                        ...prev, 
                        [cfg.key]: vals
                      }));
                    }}
                    placeholder={`All ${cfg.label || ''}`}
                  />
                </div>
              );
            })}
            {dateFiltersConfig && dateFiltersConfig.map((cfg, idx) => (
              <div key={`df-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Period:</span>
                
                <div style={{ position: 'relative' }}>
                  <input
                    id={`hidden-${cfg.fromKey}`} type="date"
                    value={pendingDateFilters[cfg.fromKey] || ''}
                    onChange={e => setPendingDateFilters(prev => ({ ...prev, [cfg.fromKey]: e.target.value }))}
                    style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`hidden-${cfg.fromKey}`);
                      if (el) { el.showPicker ? el.showPicker() : el.click(); }
                    }}
                    style={{
                        width: 95, height: 28, boxSizing: "border-box", border: "1px solid #cbd5e1",
                        borderRadius: 6, padding: "0 22px 0 8px", background: "#f8fafc", color: "#334155",
                        fontSize: '0.74rem', fontWeight: 500, outline: "none", cursor: "pointer", textAlign: "left", position: "relative",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                    }}
                  >
                    {pendingDateFilters[cfg.fromKey] ? pendingDateFilters[cfg.fromKey].split('-').reverse().join('-') : 'Select'}
                    <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 13, pointerEvents: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                        📅
                    </span>
                  </button>
                </div>

                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>-</span>

                <div style={{ position: 'relative' }}>
                  <input
                    id={`hidden-${cfg.toKey}`} type="date"
                    value={pendingDateFilters[cfg.toKey] || ''}
                    onChange={e => setPendingDateFilters(prev => ({ ...prev, [cfg.toKey]: e.target.value }))}
                    style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`hidden-${cfg.toKey}`);
                      if (el) { el.showPicker ? el.showPicker() : el.click(); }
                    }}
                    style={{
                        width: 95, height: 28, boxSizing: "border-box", border: "1px solid #cbd5e1",
                        borderRadius: 6, padding: "0 22px 0 8px", background: "#f8fafc", color: "#334155",
                        fontSize: '0.74rem', fontWeight: 500, outline: "none", cursor: "pointer", textAlign: "left", position: "relative",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                    }}
                  >
                    {pendingDateFilters[cfg.toKey] ? pendingDateFilters[cfg.toKey].split('-').reverse().join('-') : 'Select'}
                    <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 13, pointerEvents: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                        📅
                    </span>
                  </button>
                </div>

              </div>
            ))}
            
            {(localFiltersConfig || dateFiltersConfig) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                <button onClick={handleApply} style={{
                  background: C.blue, color: '#fff', border: 'none', height: 28, padding: '0 12px',
                  fontWeight: 700, borderRadius: 6, fontSize: '0.74rem', cursor: 'pointer', whiteSpace: 'nowrap'
                }}>Apply</button>
                <button onClick={handleReset} style={{
                  background: 'none', border: 'none', color: C.slate, height: 28, padding: '0 6px',
                  fontWeight: 600, borderRadius: 6, fontSize: '0.74rem', cursor: 'pointer', whiteSpace: 'nowrap'
                }}>Reset</button>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!loading && sorted.length > 0 && (
              <span style={{ fontSize: '0.68rem', color: C.muted, fontWeight: 600 }}>
                {sorted.length} {searchTerm ? 'matches' : 'records'}
              </span>
            )}
            {canExport && <ExportButtons endpoint={endpoint} filters={activeFilters} />}
          </div>
        </div>

        {/* Table */}'''

start_idx = content.find("function DetailApiModal({")
end_idx = content.find("{/* Table */}", start_idx) + len("{/* Table */}")

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + new_modal + content[end_idx:]
    with open('src/pages/SalesRevenueReport.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success")
else:
    print("Failed to find DetailApiModal")
