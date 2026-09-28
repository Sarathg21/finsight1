import React from "react";

export default function ExportButtons({
  endpoint,
  exporting,
  handleExport,
}) {
  const btnBase = {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "7px 14px",
    borderRadius: 8,
    fontSize: "0.76rem",
    fontWeight: 700,
  };

  return (
    <>
      <button
        id={`btn-export-excel-${endpoint}`}
        onClick={() => handleExport("excel")}
        disabled={!!exporting}
        title="Export to Excel"
        style={{
          ...btnBase,
          background: exporting === "excel" ? "#d1fae5" : "#f0fdf4",
          color: "#15803d",
          border: "1px solid #bbf7d0",
          opacity: exporting ? 0.7 : 1,
          cursor: exporting ? "not-allowed" : "pointer",
        }}
      >
        {exporting === "excel" ? "⏳" : "📊"} Excel
      </button>

      <button
        id={`btn-export-pdf-${endpoint}`}
        onClick={() => handleExport("pdf")}
        disabled={!!exporting}
        title="Export to PDF"
        style={{
          ...btnBase,
          background: exporting === "pdf" ? "#fee2e2" : "#fff1f2",
          color: "#be123c",
          border: "1px solid #fecdd3",
          opacity: exporting ? 0.7 : 1,
          cursor: exporting ? "not-allowed" : "pointer",
        }}
      >
        {exporting === "pdf" ? "⏳" : "📄"} PDF
      </button>
    </>
  );
}