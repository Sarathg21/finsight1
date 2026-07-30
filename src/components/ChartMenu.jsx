
import React, { useState, useEffect, useRef } from "react";
import { getReceivableExport } from "../api/recevablesApi";

function ChartMenu({ onViewAll, endpoint, filters = {} }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [open]);


  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  };


  const handleExport = async (format) => {
    try {
      setExporting(format);

      const response = await getReceivableExport(
        format,
        {
          ...filters,
          endpoint,
        }
      );

      downloadFile(
        response.data,
        format === "excel"
          ? "Receivables.xlsx"
          : "Receivables.pdf"
      );

    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setExporting(null);
      setOpen(false);
    }
  };


  const menuItems = [
    ...(onViewAll
      ? [
        {
          label: "🔎 View All",
          action: () => {
            onViewAll();
            setOpen(false);
          },
        },
      ]
      : []),

    {
      label:
        exporting === "excel"
          ? "⏳ Exporting..."
          : "📊 Export Excel",
      action: () => handleExport("excel"),
    },

    {
      label:
        exporting === "pdf"
          ? "⏳ Exporting..."
          : "📄 Export PDF",
      action: () => handleExport("pdf"),
    },
  ];


  return (
    <div ref={ref} style={{ position: "relative" }}>

      <button
        onClick={() => setOpen((v) => !v)}
        title="Options"
        style={{
          background: open ? "#f1f5f9" : "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 6px",
          borderRadius: 6,
          fontSize: "1.1rem",
          color: "#94a3b8",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        ⋮
      </button>


      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 4px)",
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.13)",
            border: "1px solid #e2e8f0",
            minWidth: 160,
            zIndex: 100,
            overflow: "hidden",
          }}
        >

          {menuItems.map((item, i) => (

            <button
              key={i}
              onClick={item.action}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "9px 14px",
                background: "none",
                border: "none",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#334155",
                cursor: "pointer",
                borderTop:
                  i > 0
                    ? "1px solid #f1f5f9"
                    : "none",
              }}

              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f8fafc")
              }

              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "none")
              }
            >
              {item.label}
            </button>

          ))}

        </div>
      )}

    </div>
  );
}

export default ChartMenu;