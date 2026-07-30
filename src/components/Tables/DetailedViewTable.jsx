
import React from "react";
import { useState } from "react";

const columns = [
  { label: "Customer", field: "customer_name", align: "left", width: "11%" },
  { label: "Type", field: "customer_type", align: "left", width: "8%" },
  { label: "Currency", field: "currency", align: "center", width: "8%" },
  { label: "Country", field: "country", align: "left", width: "7%" },
  { label: "Invoice", field: "invoice_number", align: "left", width: "9%" },
  { label: "Inv Date", field: "invoice_date", align: "center", width: "8%" },
  { label: "Due Date", field: "due_date", align: "center", width: "8%" },
  {
    label: "Outstanding",
    field: "outstanding_amount",
    align: "right",
    width: "11%",
  },
  { label: "Bucket", field: "aging_bucket", align: "center", width: "8%" },
  { label: "Salesman", field: "salesman", align: "left", width: "8%" },
  { label: "Division", field: "division", align: "left", width: "8%" },
  { label: "Legal", field: "legal_entity", align: "left", width: "8%" },
];

export default function DetailedViewTable({
  data = [],
  currency = "AED",
  page = 1,
  pageSize = 50,
  totalCount = 0,
  onPageChange,
  onSort,
  showPagination = false,
  onExport,
  exporting,
}) {


  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / pageSize)
  );

  const startIndex = (page - 1) * pageSize;

  const formatCurrency = (value) => {
    if (value == null) return "-";

    return `${currency} ${Number(value).toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
  <div className="flex flex-col h-full overflow-hidden p-2">
      {/* TABLE */}
      <div className="h-[calc(100%-55px)] overflow-y-auto border border-slate-200 rounded-lg">
        <table className="detailed-view-table w-full table-fixed border-collapse" >
          {/* HEADER */}
          <thead className="sticky top-0 bg-slate-50 z-20">
            <tr>
              {columns.map((col) => (
                <th style={{ color: "#061644" }}
                  key={col.field}
                  style={{ width: col.width }}
                  onClick={() => onSort && onSort(col.field)}
                  className={`
                     cursor-pointer
                     px-2
                     py-2
                     text-[10px]
                     font-bold
                    
                     bg-slate-50
                     border-b
                     border-slate-200
                     wrap-break-word
                     hover:bg-slate-100
                     ${col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left"
                    }
                   `}
                >
                  {col.label} ▲▼
                </th>
              ))}
            </tr>
          </thead>


          {/* BODY */}

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center text-slate-400 text-sm"
                >
                  No Records Available
                </td>

              </tr>
            ) : (
              data.map((row, index) => (

                <tr
                  key={index}
                  className={`
                    transition-colors
                    duration-150
                    hover:bg-violet-50
                    ${index % 2 === 0
                      ? "bg-white"
                      : "bg-slate-50/40"
                    }
                  `}
                >
                  <td
                    style={{ width: columns[0].width }}
                    className="px-2 py-2 text-[10px] font-semibold text-slate-900 wrap-break-word"
                  >
                    {row.customer_name || "-"}
                  </td>
                  <td className="px-2 py-2 text-[10px] text-slate-700 wrap-break-word">
                    {row.customer_type || "-"}
                  </td>
                  <td className="px-2 py-2 text-[10px] text-center text-slate-700 wrap-break-word">
                    {row.currency || "-"}
                  </td>
                  <td className="px-2 py-2 text-[10px] text-slate-700 wrap-break-word">
                    {row.country || "-"}
                  </td>
                  <td className="px-2 py-2 text-[10px] text-slate-700 wrap-break-word">
                    {row.invoice_number || "-"}
                  </td>
                  <td className="px-2 py-2 text-[10px] text-center text-slate-700 wrap-break-word">
                    {row.invoice_date || "-"}
                  </td>
                  <td className="px-2 py-2 text-[10px] text-center text-slate-700 wrap-break-word">
                    {row.due_date || "-"}
                  </td>
                  <td className="px-2 py-2 text-[10px] text-right font-semibold text-slate-900 wrap-break-word">
                    {formatCurrency(row.outstanding_amount)}
                  </td>
                  <td className="px-2 py-2 text-[10px] text-center text-slate-700 wrap-break-word">
                    {row.aging_bucket || "-"}
                  </td>
                  <td className="px-2 py-2 text-[10px] text-slate-700 wrap-break-word">
                    {row.salesman || "-"}
                  </td>
                  <td className="px-2 py-2 text-[10px] text-slate-700 wrap-break-word">
                    {row.division || "-"}
                  </td>
                  <td className="px-2 py-2 text-[10px] text-slate-700 wrap-break-word">
                    {row.legal_entity || "-"}
                  </td>
                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {showPagination && (

        <div className="h-13.75 flex items-center justify-between px-3 mt-2 border-t border-slate-200 bg-white">

          {/* Left */}
          <span className="text-[12px] text-slate-900 font-bold">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {totalCount === 0 ? 0 : startIndex + 1}
            </span>
            {" - "}
            <span className="font-bold text-slate-700">
              {Math.min(startIndex + pageSize, totalCount)}
            </span>
            {" of "}
            <span className="font-bold text-slate-700">
              {totalCount}
            </span>
            {" records"}
          </span>


          {/* Right */}
          <div className="flex items-center gap-4 mr-5">
            <button
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              className="px-2 py-1 text-[12px] rounded border disabled:opacity-40"
            >
              {"<<"}
            </button>

            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-2 py-1 text-[12px] rounded border disabled:opacity-40"
            >
              {"<"}
            </button>

            <span className="px-3 py-1 rounded bg-slate-100 text-[12px] font-semibold">
              Page {page} / {totalPages}
            </span>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-2 py-1 text-[11px] rounded border disabled:opacity-40"
            >
              {">"}
            </button>

            <button
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
              className="px-2 py-1 text-[12px] rounded border disabled:opacity-40"
            >
              {">>"}
            </button>
          </div>

        </div>
      )}
    </div>
  )
}

