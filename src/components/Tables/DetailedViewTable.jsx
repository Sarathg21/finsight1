import React, { useState } from "react";

const columns = [
  {
    label: "Customer",
    field: "customer_name"
  },
  {
    label: "Customer Type",
    field: "customer_type"
  },
  {
    label: "Currency",
    field: "currency"
  },
  {
    label: "Country",
    field: "country"
  },
  {
    label: "Invoice No",
    field: "invoice_number"
  },
  {
    label: "Invoice Date",
    field: "invoice_date"
  },
  {
    label: "Due Date",
    field: "due_date"
  },
  {
    label: "Outstanding (AED)",
    field: "outstanding_amount"
  },
  {
    label: "Aging Bucket",
    field: "aging_bucket"
  },
  {
    label: "Salesman",
    field: "salesman"
  },
  {
    label: "Division",
    field: "division"
  },
  {
    label: "Legal Entity",
    field: "legal_entity"
  }
];


export default function DetailedViewTable({
  data = [],
  title,
  currency = "AED",
  page,
  pageSize,
  totalCount,
  onPageChange,
  onSort
}) {



  const totalPages = Math.ceil(
    totalCount / pageSize
  );
 const startIndex =
  ((page || 1) - 1) * pageSize;
  const currentData = data;
  const handlePrevious = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  const handleFirst = () => {
    onPageChange(1);
  };

  const handleLast = () => {
    onPageChange(totalPages);
  };

  return (
    <div className="card">

      {/* TITLE */}
      <h3 className="text-[11px] font-extrabold text-[#081B46] mb-1">
        {title}
      </h3>

      {/* TABLE */}
     <div className="overflow-x-auto overflow-y-auto max-w-fullborder border-gray-100 rounded-md">

        <table className="compact-table detailed-table min-w-300">
          <thead>
            <tr>

              {columns.map((col, i) => (
                <th
                  key={i}
                  onClick={() => onSort(col.field)}
                  className={`cursor-pointer ${i >= 4 ? "text-right" : ""
                    } px-4 py-4 text-[13px] font-bold text-[#081B46] bg-slate-50`}
                >
                  {col.label} ▲▼
                </th>
              ))}

            </tr>
          </thead>

          <tbody className="text-[35px] font-semibold">
            {currentData.length > 0 ? (
              currentData.map((r, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors">


                  <td className="px-4 py-4 text-[13px] font-semibold text-slate-900">{r.customer_name}</td>

                  <td className="px-4 py-4 text-[13px] font-semibold text-slate-900">
                    {r.customer_type || "-"}
                  </td>

                  <td className="px-4 py-4 text-[13px] font-semibold text-slate-900">
                    {r.currency || "-"}
                  </td>

                  <td className="px-4 py-4 text-[13px] font-semibold text-slate-900">
                    {r.country || "-"}
                  </td>

                  <td className="px-4 py-4 text-[13px] font-semibold text-slate-900">
                    {r.invoice_number || "-"}
                  </td>

                  <td className="px-4 py-4 text-[13px] font-semibold text-slate-900">
                    {r.invoice_date || "-"}
                  </td>

                  <td className="px-4 py-4 text-[13px] font-semibold text-slate-900">
                    {r.due_date || "-"}
                  </td>

                  <td className="px-4 py-4 text-[13px] font-semibold text-left whitespace-nowrap">
                    {r.outstanding_amount != null
                      ? `${currency} ${Number(r.outstanding_amount).toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                      : "-"}
                  </td>

                  <td className="px-4 py-4 text-[13px] font-semibold text-slate-900">
                    {r.aging_bucket || "-"}
                  </td>

                  <td className="px-4 py-4 text-[13px] font-semibold text-slate-900">
                    {r.salesman || "-"}
                  </td>

                  <td className="px-4 py-4 text-[13px] font-semibold text-slate-900">
                    {r.division || "-"}
                  </td>

                  <td className="px-4 py-4 text-[13px] font-semibold text-slate-900">
                    {r.legal_entity || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-[11px] text-gray-500 font-medium"
                >
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      <div className="flex items-center justify-between mt-2 px-2">

        <span className="text-[11px] font-medium text-gray-700">
          Showing {startIndex + 1} -
          {Math.min(startIndex + pageSize, totalCount)}of {totalCount}
        </span>
        <div className="flex items-center gap-2">

          {/* First Page */}
          <button
            onClick={handleFirst}
           disabled={page === 1}
            className="px-2 py-1 text-[10px] font-extrabold border rounded disabled:opacity-40"
          >
            {"<<"}
          </button>

          {/* Previous */}
          <button
            onClick={handlePrevious}
           disabled={page === 1}
            className="px-2 py-1 text-[10px] font-extrabold border rounded disabled:opacity-40"
          >
            {"<"}
          </button>

          <span className="text-[11px] px-3 py-2 font-bold">
             Page {page} / {totalPages || 1}
          </span>

          {/* Next */}
          <button
            onClick={handleNext}
           disabled={page === totalPages || totalPages === 0}
            className="px-2 py-1 text-[10px] font-extrabold border rounded disabled:opacity-40"
          >
            {">"}
          </button>

          {/* Last Page */}
          <button
            onClick={handleLast}
           disabled={page === totalPages || totalPages === 0}
            className="px-2 py-1 text-[10px] border rounded disabled:opacity-40"
          >
            {">>"}
          </button>

        </div>
      </div>
    </div>
  );
}