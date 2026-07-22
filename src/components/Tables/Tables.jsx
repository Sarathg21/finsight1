
import React from 'react';
import { useState } from "react";
import { Download } from "lucide-react";

export function TopVendorsTable({ data, title, tabletitle1, tabletitle2 }) {

  const totalAmount = data.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex flex-col h-52">
      <h3 className="text-[10px] font-bold text-[#081B46] mb-2" style={{ paddingLeft: "14px" }}>
        {title}
      </h3>

      <div className="flex-1 border border-gray-100 rounded-lg overflow-hidden">
        <table className="compact-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{tabletitle1}</th>
              <th className="text-right">
                {tabletitle2} (₹ Cr)
              </th>
              <th className="text-right">
                % of Total
              </th>
            </tr>
          </thead>
          <tbody>
            {
              data.map((v, i) => (
                <tr key={v.id}>
                  <td>
                    {i + 1}
                  </td>
                  <td className="font-semibold">
                    {v.name}
                  </td>
                  <td className="text-left font-bold">
                    {v.amount.toFixed(2)}
                  </td>
                  <td className="text-left">
                    {v.pct}
                  </td>
                </tr>
              ))
            }

            {/* TOTAL */}
            <tr className="bg-slate-50 font-bold">
              <td> # </td>
              <td> Total  </td>
              <td className="text-left">
                {totalAmount.toFixed(2)}
              </td>
              <td className="text-left">
                100%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BusinessUnitTable({ data, title, tabletitle }) {

  const grandTotal = data.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex flex-col h-52">
      <h3 className="text-[10px] font-bold text-[#081B46] mb-2" style={{ paddingLeft: "14px" }}>
        {title}
      </h3>
      <div className="flex-1 border border-gray-100 rounded-lg overflow-hidden">
        <div className="business-table">
          <table className="compact-table">
            <thead>
              <tr>
                <th>
                  Business Unit
                </th>
                <th className="text-right">
                  {tabletitle} (₹ Cr)
                </th>
                <th className="text-right">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody>
              {
                data.map((b, i) => (
                  <tr key={i}>
                    <td className="font-semibold">
                      {b.unit}
                    </td>

                    <td className="text-left font-bold">
                      {b.amount.toFixed(2)}
                    </td>

                    <td className="text-left">
                      {b.pct}
                    </td>

                  </tr>

                ))
              }
              <tr className="bg-slate-50 font-bold">
                <td>
                  Total
                </td>
                <td className="text-left">
                  {grandTotal.toFixed(2)}
                </td>
                <td className="text-left">
                  100%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SalesmanTable({ data, title }) {

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [sortField, setSortField] = useState("");
  const [ascending, setAscending] = useState(true);

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;

    if (ascending)
      return a[sortField] > b[sortField] ? 1 : -1;

    return a[sortField] < b[sortField] ? 1 : -1;
  });

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);


  const handleExport = async () => {
    try {
      const response = await getReceivableExport();

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Receivables_Report.xlsx");

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-2 mb-2" style={{ paddingLeft: "20px" }}>
        <h3 className="text-[10px] font-bold text-[#081B46]">
          {title}
        </h3>

        {/* <button
          onClick={handleExport}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[9px] px-4 py-3 rounded-md h-5"
        >
          <Download size={9} />
          Export
        </button> */}
      </div>


      <div className="flex-1 border border-gray-100 rounded-lg overflow-auto">
        <div className="salesman_table">
          <table className="compact-table w-full">
            <thead>
              <tr>
                <th
                  onClick={() => {
                    setSortField("salesman");
                    setAscending(!ascending); setCurrentPage(1);
                  }} className="cursor-pointer">Salesman ▲▼</th>
                <th
                  onClick={() => {
                    setSortField("no_of_customers");
                    setAscending(!ascending); setCurrentPage(1);
                  }} className="cursor-pointer">No: Of Customers ▲▼</th>
                <th
                  onClick={() => {
                    setSortField("outstanding");
                    setAscending(!ascending); setCurrentPage(1);
                  }} className="cursor-pointer">Outstanding Amount ▲▼</th>

                <th
                  onClick={() => {
                    setSortField("overdue");
                    setAscending(!ascending); setCurrentPage(1);
                  }} className="cursor-pointer">Overdue Amount ▲▼</th>

                <th
                  onClick={() => {
                    setSortField("collection_pct");
                    setAscending(!ascending); setCurrentPage(1);
                  }} className="cursor-pointer">Collection % ▲▼</th>

                <th
                  onClick={() => {
                    setSortField("dso");
                    setAscending(!ascending); setCurrentPage(1);
                  }} className="cursor-pointer">DSO ▲▼</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((row, index) => (
                <tr key={index}>
                  <td>{row.salesman}</td>

                  <td>{row.customer_count}</td>

                  <td className="text-left">
                    {Number(row.outstanding_amount || 0).toFixed(2)}
                  </td>

                  <td className="text-left">
                    {Number(row.overdue_amount || 0).toFixed(2)}
                  </td>

                  <td className="text-left">
                    {Number(row.collection_percentage || 0).toFixed(1)}%
                  </td>

                  <td className="text-left">
                    {row.dso}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between text-[10px]">
        <span style={{ paddingLeft: "30px" }}>
          Showing {startIndex + 1} -
          {Math.min(endIndex, sortedData.length)} of {sortedData.length}
        </span>

        <div className="flex items-center gap-2 text-[10px] font-bold" style={{ paddingRight: "40px" }}>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-4 h-4 flex items-center justify-center rounded border text-[10px] font-medium ${currentPage === i + 1
                ? "bg-[#081B46] text-white"
                : "border"
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}