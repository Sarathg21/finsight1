import React, { useState, useRef, useEffect } from "react";
import { Search, Check } from "lucide-react";

export default function MultiSelectDropdown({
  options = [],
  value = [],
  onChange,
  placeholder = "All",
  label = "",
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
    const allVals = safeOptions.map((o) =>
      typeof o === "string" ? o : (o.value ?? o.id ?? o.name ?? o.label)
    );
    onChange(allVals);
  };

  const displayValue = () => {
    if (safeValue.length === 0) return placeholder;
    if (safeValue.length === 1) {
      const opt = safeOptions.find((o) => {
        const val = typeof o === "string" ? o : (o.value ?? o.id ?? o.name ?? o.label);
        return val === safeValue[0];
      });
      if (opt) {
        return typeof opt === "string" ? opt : (opt.label || opt.name || opt.value);
      }
      return safeValue[0];
    }
    if (safeValue.length === safeOptions.length && safeOptions.length > 0) {
      return placeholder;
    }
    return `${safeValue.length} Selected`;
  };

  const searchPlaceholder = label ? `Search ${label}` : "Search...";

  const filteredOptions = safeOptions.filter((o) => {
    const optLabel = typeof o === "string" ? o : (o.label || o.name || o.value || "");
    return String(optLabel).toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div
      ref={ref}
      id={id}
      style={{
        position: "relative",
        display: "inline-block",
        width: "100%",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* Trigger Button */}
      <div
        onClick={() => !disabled && setOpen(!open)}
        style={{
          width: "100%",
          height: "32px",
          border: open ? "1.5px solid #2563eb" : "1px solid #dfe4ec",
          borderRadius: "7px",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
          boxSizing: "border-box",
          color: "#1e293b",
          fontSize: "0.82rem",
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: open ? "0 0 0 2px rgba(37, 99, 235, 0.12)" : "none",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            paddingRight: "6px",
            color: safeValue.length > 0 ? "#1e293b" : "#475569",
          }}
        >
          {displayValue()}
        </span>
        <span
          style={{
            fontSize: "8px",
            color: open ? "#2563eb" : "#64748b",
            transition: "transform 0.15s",
            transform: open ? "rotate(0deg)" : "rotate(180deg)",
            display: "inline-block",
          }}
        >
          ▲
        </span>
      </div>

      {/* Floating Dropdown */}
      {open && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            width: "100%",
            minWidth: "220px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)",
            padding: "8px",
            zIndex: 9999,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search Box */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
              boxSizing: "border-box",
            }}
          >
            <Search size={15} color="#8b5cf6" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "0.82rem",
                color: "#334155",
                padding: 0,
              }}
            />
          </div>

          {/* Action Bar (Select All / Clear) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "5px 4px 7px",
              borderBottom: "1px solid #f1f5f9",
              marginBottom: "4px",
            }}
          >
            <button
              type="button"
              onClick={handleSelectAll}
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Clear
            </button>
          </div>

          {/* Options List */}
          <div
            style={{
              maxHeight: "210px",
              overflowY: "auto",
              paddingRight: "2px",
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: "12px 8px",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "0.78rem",
                }}
              >
                No options found
              </div>
            ) : (
              filteredOptions.map((o, idx) => {
                const val = typeof o === "string" ? o : (o.value ?? o.id ?? o.name ?? o.label);
                const optLabel = typeof o === "string" ? o : (o.label || o.name || o.value || "");
                const isSelected = safeValue.includes(val);

                return (
                  <div
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(val);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      padding: "6px 6px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      userSelect: "none",
                      transition: "background-color 0.12s",
                    }}
                  >
                    {/* Custom Checkbox */}
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "4px",
                        border: isSelected ? "1.5px solid #2563eb" : "1.5px solid #cbd5e1",
                        background: isSelected ? "#2563eb" : "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.12s",
                      }}
                    >
                      {isSelected && <Check size={11} color="#ffffff" strokeWidth={3} />}
                    </div>

                    {/* Option Label */}
                    <span
                      title={optLabel}
                      style={{
                        fontSize: "0.82rem",
                        color: "#334155",
                        fontWeight: isSelected ? 600 : 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {optLabel}
                    </span>
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
