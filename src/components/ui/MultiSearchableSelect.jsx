import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

const uniq = (arr) => Array.from(new Set((arr || []).map(String)));

const MultiSearchableSelect = ({
  options = [],
  values = [],
  onChange,
  placeholder = 'Select options',
  className = '',
  style = {},
  disabled = false,
  maxTags = 2,
}) => {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = useMemo(() => uniq(values), [values]);

  const selectedOptions = useMemo(() => {
    const map = new Map(options.map((o) => [String(o.value), o]));
    return selected.map((v) => map.get(String(v))).filter(Boolean);
  }, [options, selected]);

  const filteredOptions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => {
      const label = (opt.label || '').toLowerCase();
      const value = String(opt.value || '').toLowerCase();
      return label.includes(q) || value.includes(q);
    });
  }, [options, searchTerm]);

  const toggleValue = (v) => {
    if (disabled) return;
    const s = new Set(selected);
    const key = String(v);
    if (s.has(key)) s.delete(key);
    else s.add(key);
    onChange?.(Array.from(s));
  };

  const clearAll = () => {
    if (disabled) return;
    onChange?.([]);
  };

  const removeOne = (v) => {
    if (disabled) return;
    onChange?.(selected.filter((x) => String(x) !== String(v)));
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`} style={style}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen(!isOpen);
          if (!isOpen) setSearchTerm('');
        }}
        className={`w-full px-3 py-2 rounded-xl border border-slate-200 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition-all shadow-sm ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {selectedOptions.length === 0 ? (
            <span className="text-[12px] truncate text-slate-400 font-medium">{placeholder}</span>
          ) : (
            <>
              {selectedOptions.slice(0, maxTags).map((opt) => (
                <span
                  key={String(opt.value)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold max-w-[180px]"
                  title={opt.label}
                >
                  <span className="truncate">{opt.label}</span>
                  {!disabled && (
                    <X
                      size={12}
                      className="shrink-0 opacity-70 hover:opacity-100"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeOne(opt.value);
                      }}
                    />
                  )}
                </span>
              ))}
              {selectedOptions.length > maxTags && (
                <span className="text-[11px] font-bold text-slate-500">+{selectedOptions.length - maxTags}</span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!disabled && selectedOptions.length > 0 && (
            <X
              size={14}
              className="text-slate-400 hover:text-slate-600"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                clearAll();
              }}
              title="Clear"
            />
          )}
          <ChevronDown
            size={16}
            className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-[100] mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
            <Search size={14} className="text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent text-[12px] font-medium outline-none text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => {
                const isSelected = selected.includes(String(option.value));
                return (
                  <button
                    key={`${option.value}-${idx}`}
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 text-[12px] rounded-lg transition-colors ${
                      isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100 font-medium hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate pr-2">{option.label}</span>
                    {isSelected && <Check size={14} className="text-indigo-600 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-center text-slate-400 text-[11px] font-medium italic">No matches found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSearchableSelect;

