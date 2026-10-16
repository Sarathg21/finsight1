import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, Check } from "lucide-react";

export default function MultiSelectDropdown({
  options = [],
  value = ["All"],
  onChange,
  placeholder = "All",
  label = "",
  disabled = false,
  id,
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current && searchRef.current.focus(), 0);
    }
    if (!open) setSearchTerm("");
  }, [open]);

  // Normalize options into { id, name, value, label }, filtering out inactive items, duplicates, and redundant "All" option
  const normOptions = useMemo(() => {
    const seenNames = new Set();
    const result = [];
    (options || []).forEach((o) => {
      if (o == null) return;
      if (typeof o === "object") {
        if (o.active === false || o.is_active === false) return;
        if (o.status && String(o.status).toLowerCase() === "inactive") return;
      }
      if (typeof o === "string" || typeof o === "number") {
        const str = String(o);
        const lower = str.trim().toLowerCase();
        if (lower !== "" && lower !== "all" && !seenNames.has(lower)) {
          seenNames.add(lower);
          result.push({ id: str, name: str, value: o, label: str });
        }
        return;
      }
      const val = o.value !== undefined ? o.value : (o.id !== undefined ? o.id : "");
      const lbl = o.label !== undefined ? o.label : (o.name !== undefined ? o.name : String(val));
      const strVal = String(val ?? "");
      const strLbl = typeof lbl === "object" ? String(lbl?.label || lbl?.name || val || "") : String(lbl ?? "");
      const lower = strLbl.trim().toLowerCase();
      if (strVal !== "" && lower !== "" && lower !== "all" && !seenNames.has(lower)) {
        seenNames.add(lower);
        result.push({ id: strVal, name: strLbl, value: val, label: strLbl, ...o });
      }
    });
    return result;
  }, [options]);

  const allRealIds = useMemo(() => {
    return normOptions.map((o) => String(o.id));
  }, [normOptions]);

  // Sales Revenue convention: default is "All" where all options are checked [✓]
  const isAll = useMemo(() => {
    if (!value) return true;
    if (typeof value === "string") return value.trim().toLowerCase() === "all";
    if (Array.isArray(value)) {
      if (value.length === 1 && String(value[0]).trim().toLowerCase() === "all") return true;
      if (allRealIds.length > 0 && value.length === allRealIds.length) {
        return allRealIds.every((id) =>
          value.some((v) => String(v).toLowerCase() === id.toLowerCase())
        );
      }
    }
    return false;
  }, [value, allRealIds]);

  const rawValue = useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const isOptionSelected = (opt) => {
    if (isAll) return true;
    const optVal = String(opt.value ?? opt.id ?? "").toLowerCase();
    const optId = String(opt.id ?? "").toLowerCase();
    const optName = String(opt.name ?? opt.label ?? "").toLowerCase();
    return rawValue.some((v) => {
      const sv = String(v).toLowerCase();
      return sv === optVal || sv === optId || sv === optName;
    });
  };

  const handleToggle = (opt) => {
    const optVal = String(opt.value ?? opt.id);
    const optName = String(opt.name ?? opt.label);
    if (optVal.toLowerCase() === "all" || optName.toLowerCase() === "all") {
      onChange && onChange(["All"]);
      return;
    }

    const cur = isAll
      ? allRealIds
      : rawValue.map(String).filter((v) => v.toLowerCase() !== "all");

    const selected = isOptionSelected(opt);

    let next;
    if (selected) {
      next = cur.filter((v) => {
        const sv = v.toLowerCase();
        return sv !== optVal.toLowerCase() && sv !== optName.toLowerCase();
      });
    } else {
      next = [...cur, optVal];
    }

    if (next.length === 0) {
      onChange && onChange([]);
    } else if (allRealIds.length > 0 && next.length === allRealIds.length) {
      onChange && onChange(["All"]);
    } else {
      onChange && onChange(next);
    }
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange && onChange([]);
  };

  const handleSelectAll = (e) => {
    e.stopPropagation();
    onChange && onChange(["All"]);
  };

  const selectedVals = useMemo(() => {
    if (isAll) return normOptions;
    return normOptions.filter((o) => isOptionSelected(o));
  }, [isAll, normOptions, rawValue]);

  const displayValue = () => {
    if (isAll) return placeholder;
    if (selectedVals.length === 0) return "0 selected";
    if (selectedVals.length === 1) return selectedVals[0].name;
    if (selectedVals.length === normOptions.length && normOptions.length > 0) return placeholder;
    return `${selectedVals.length} selected`;
  };

  const searchPlaceholder = label ? `Search ${label}...` : "Search...";

  const q = searchTerm.trim().toLowerCase();
  const visibleOptions = q
    ? normOptions.filter((o) => o.name.toLowerCase().includes(q))
    : normOptions;

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
          title={displayValue()}
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            paddingRight: "6px",
            color: isAll || selectedVals.length > 0 ? "#1e293b" : "#475569",
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
            width: "max-content",
            minWidth: "260px",
            maxWidth: "480px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
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
            <Search size={15} color="#16a34a" style={{ flexShrink: 0 }} />
            <input
              ref={searchRef}
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
            {searchTerm && (
              <span
                onClick={(e) => { e.stopPropagation(); setSearchTerm(""); }}
                style={{ fontSize: "0.65rem", color: "#94a3b8", cursor: "pointer", flexShrink: 0 }}
              >
                ✕
              </span>
            )}
          </div>

          {/* Action Bar (Select All / Clear) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "5px 6px 7px",
              borderBottom: "1px solid #f1f5f9",
              marginBottom: "4px",
            }}
          >
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
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
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onClick={handleClearAll}
              style={{
                background: "none",
                border: "none",
                color: "#dc2626",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                padding: 0,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#b91c1c")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#dc2626")}
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
            {visibleOptions.length === 0 ? (
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
              visibleOptions.map((opt, idx) => {
                const isSelected = isOptionSelected(opt);

                return (
                  <div
                    key={`${opt.id}-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(opt);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isSelected ? "#eff6ff" : "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isSelected ? "#eff6ff" : "transparent";
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      userSelect: "none",
                      backgroundColor: isSelected ? "#eff6ff" : "transparent",
                      transition: "background-color 0.12s",
                    }}
                  >
                    {/* Custom Checkbox matching Sales Revenue */}
                    <div
                      style={{
                        width: "15px",
                        height: "15px",
                        borderRadius: "3px",
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
                      title={opt.name}
                      style={{
                        fontSize: "0.82rem",
                        color: isSelected ? "#1d4ed8" : "#334155",
                        fontWeight: isSelected ? 600 : 500,
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                        lineHeight: 1.25,
                      }}
                    >
                      {opt.name}
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
