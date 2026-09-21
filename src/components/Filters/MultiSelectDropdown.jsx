import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";

export default function MultiSelectDropdown({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options",
  disabled = false,
  id
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const safeOptions = Array.isArray(options) ? options : [];
  const safeValue = Array.isArray(value) ? value : [];

  const handleToggle = (optionValue) => {
    const isSelected = safeValue.includes(optionValue);
    if (isSelected) {
      onChange(safeValue.filter((v) => v !== optionValue));
    } else {
      onChange([...safeValue, optionValue]);
    }
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  const handleSelectAll = (e) => {
    e.stopPropagation();
    onChange(safeOptions.map((o) => typeof o === "string" ? o : (o.value || o.id || o.name || o.label)));
  };

  const displayValue = () => {
    if (safeValue.length === 0) return placeholder;
    if (safeValue.length === 1) {
      const opt = safeOptions.find(o => {
        const val = typeof o === "string" ? o : (o.value || o.id || o.name || o.label);
        return val === safeValue[0];
      });
      if (opt) {
        return typeof opt === "string" ? opt : (opt.label || opt.name || opt.value);
      }
      return safeValue[0];
    }
    return `${safeValue.length} selected`;
  };

  const filteredOptions = safeOptions.filter(o => {
    const label = typeof o === "string" ? o : (o.label || o.name || o.value);
    return String(label).toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="relative inline-block w-full text-sm" ref={ref} id={id}>
      <div
        className={`flex items-center justify-between border rounded px-3 py-1.5 cursor-pointer bg-white ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-blue-400"}`}
        style={{ borderColor: "#cbd5e1", minHeight: "34px" }}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span className="truncate text-slate-700" style={{ maxWidth: "calc(100% - 24px)" }}>
          {displayValue()}
        </span>
        <div className="flex items-center gap-1">
          {safeValue.length > 0 && (
            <div
              className="text-slate-400 hover:text-slate-600 rounded-full p-0.5"
              onClick={handleClearAll}
              title="Clear all"
            >
              <X size={14} />
            </div>
          )}
          <ChevronDown size={14} className="text-slate-500" />
        </div>
      </div>

      {open && !disabled && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded shadow-lg"
          style={{ minWidth: "180px", maxHeight: "250px", display: "flex", flexDirection: "column" }}
        >
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-blue-600 cursor-pointer hover:bg-slate-100" onClick={handleSelectAll}>
            <span>Select All</span>
          </div>

          <div className="overflow-y-auto overflow-x-hidden flex-1 py-1" style={{ maxHeight: "180px" }}>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-slate-400 text-xs">No options found</div>
            ) : (
              filteredOptions.map((o, idx) => {
                const val = typeof o === "string" ? o : (o.value || o.id || o.name || o.label);
                const label = typeof o === "string" ? o : (o.label || o.name || o.value);
                const isSelected = safeValue.includes(val);
                return (
                  <div
                    key={idx}
                    className="flex items-center px-3 py-1.5 cursor-pointer hover:bg-slate-50 text-slate-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(val);
                    }}
                  >
                    <div
                      className={`flex items-center justify-center w-4 h-4 mr-2 border rounded ${isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}
                    >
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                    <span className="truncate" title={label}>{label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
