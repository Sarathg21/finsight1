
import React from 'react';
import { useState } from "react";
import { Download } from "lucide-react";

export function TopVendorsTable({ data, title, tabletitle1, tabletitle2 }) {
  const safeData = Array.isArray(data) ? data : [];
  const totalAmount = safeData.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const totalPercentage = safeData.reduce(
    (sum, item) => sum + Number(item.pct || 0),
    0
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex flex-col">
      <h3
        style={{
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: 700,
          color: "#081B46",
        }}
      >
        {title} (AED)
      </h3>

      <div className="flex-1 overflow-auto border border-gray-100 rounded-lg">
        <div className="flex-1 overflow-auto">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              fontSize: "0.74rem",
            }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "#F8FAFC",
                zIndex: 10,
              }}
            >
              <tr>
                <th
                  style={{
                    textAlign: "center",
                    width: "10%",
                    padding: "8px",
                    fontWeight: 700,
                  }}
                >
                  #
                </th>

                <th
                  style={{
                    textAlign: "left",
                    width: "40%",
                    padding: "8px",
                    fontWeight: 700,
                  }}
                >
                  {tabletitle1}
                </th>

                <th
                  style={{
                    textAlign: "right",
                    width: "30%",
                    padding: "8px",
                    fontWeight: 700,
                  }}
                >
                  {tabletitle2} (AED)
                </th>

                <th
                  style={{
                    textAlign: "right",
                    width: "20%",
                    padding: "8px",
                    fontWeight: 700,
                  }}
                >
                  % Share
                </th>
              </tr>
            </thead>

            <tbody>
              {safeData.length > 0 ? (
                <>
                  {safeData.map((v, i) => (
                    <tr
                      key={v.id || i}
                      style={{
                        borderBottom: "1px solid #E2E8F0",
                      }}
                    >
                      <td
                        style={{
                          textAlign: "center",
                          padding: "8px",
                          fontWeight: 600,
                        }}
                      >
                        {i + 1}
                      </td>

                      <td
                        style={{
                          padding: "8px",
                          fontWeight: 600,
                          color: "#0F172A",
                          textTransform: "capitalize",
                          wordBreak: "break-word",
                        }}
                      >
                        {v.name}
                      </td>

                      <td
                        style={{
                          textAlign: "right",
                          padding: "8px",
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {Number(v.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td
                        style={{
                          textAlign: "right",
                          padding: "8px",
                          fontWeight: 600,
                        }}
                      >
                        {Number(v.pct || 0).toFixed(2)}%
                      </td>
                    </tr>
                  ))}

                  {/* Total Row */}

                  <tr
                    style={{
                      background: "#F8FAFC",
                      fontWeight: 800,
                      color: "#1E3A8A",
                    }}
                  >
                    <td
                      colSpan={2}
                      style={{
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      Total
                    </td>

                    <td
                      style={{
                        padding: "8px",
                        textAlign: "right",
                        fontWeight: 700,
                      }}
                    >
                      {Number(totalAmount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td
                      style={{
                        padding: "8px",
                        textAlign: "right",
                        fontWeight: 700,
                      }}
                    >
                      {totalPercentage.toFixed(2)}%
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#64748B",
                    }}
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function BusinessUnitTable({ data = [], title, tabletitle, }) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const grandTotal = data.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  console.log("BUSINESS DATA", data);
  console.log("TOTAL", grandTotal);
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
      <h3
        style={{
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: 700,
          color: "#081B46",
        }}
      >
        {title} (AED)
      </h3>
      <div className="flex-1 border border-gray-100 rounded-lg overflow-hidden">
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <table className="business-unit-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              fontSize: "0.74rem",
            }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "#F8FAFC",
                zIndex: 10,
              }}
            >
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    width: "50%",
                    padding: "8px",
                    fontWeight: 700,
                  }}
                >
                  Business Unit
                </th>

                <th
                  style={{
                    textAlign: "right",
                    width: "30%",
                    padding: "8px",
                    fontWeight: 700,
                  }}
                >
                  {tabletitle} (AED)
                </th>

                <th
                  style={{
                    textAlign: "right",
                    width: "20%",
                    padding: "8px",
                    fontWeight: 700,
                  }}
                >
                  % Share
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((b, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: 600,
                        color: "#0F172A",
                      }}
                    >
                      {b.business_unit || "-"}
                    </td>

                    <td
                      style={{
                        textAlign: "right",
                        padding: "8px",
                        fontWeight: 600,
                      }}
                    >
                      {Number(b.amount).toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td
                      style={{
                        textAlign: "right",
                        padding: "8px",
                        fontWeight: 600,
                      }}
                    >
                      {grandTotal > 0
                        ? ((Number(b.amount) / grandTotal) * 100).toFixed(2)
                        : "0.00"}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "40px" }}>
                    No records found
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot>
              <tr
                style={{
                  position: "sticky",
                  bottom: 0,
                  background: "#F8FAFC",
                  zIndex: 5
                }}
              >
                <td
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    fontWeight: 900, color: "#64748B",
                  }}
                >
                  Total
                </td>

                <td
                  style={{
                    padding: "8px",
                    textAlign: "right",
                    fontWeight: 900, color: "#64748B",
                  }}
                >
                  {Number(grandTotal).toLocaleString("en-GB", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                <td
                  style={{
                    padding: "8px",
                    textAlign: "right",
                    fontWeight: 900, color: "#64748B",
                  }}
                >
                  100.00%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between font-bold text-[12px]">
        <span>
          {data.length > 0
            ? `Showing ${startIndex + 1} - ${Math.min(endIndex, data.length)} of ${data.length}`
            : "Showing 0 of 0"}
        </span>

        <div className="flex items-center gap-2">
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
              className={`w-5 h-5 rounded border text-[10px] ${currentPage === i + 1
                ? "bg-[#081B46] text-white"
                : ""
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


export function SalesmanTable({ data = [], title }) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const [sortField, setSortField] = useState("");
  const [ascending, setAscending] = useState(true);

  const sortedData = [...(Array.isArray(data) ? data : [])].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField] ?? "";
    const bValue = b[sortField] ?? "";

    if (typeof aValue === "number" && typeof bValue === "number") {
      return ascending ? aValue - bValue : bValue - aValue;
    }

    return ascending
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const totalPages = Math.max(
    1,
    Math.ceil(sortedData.length / rowsPerPage)
  );

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-107.5">

      {/* Header */}

      <h3
        style={{
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: 700,
          color: "#081B46",
        }}
      >
        {title} (AED)
      </h3>

      {/* Table */}

      <div
        style={{
          flex: 1,
          overflowX: "auto",
          overflowY: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontSize: "0.74rem",
          }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "#F8FAFC",
              zIndex: 10,
            }}
          >
            <tr>

              <th
                onClick={() => {
                  setSortField("salesman");
                  setAscending(!ascending);
                  setCurrentPage(1);
                }}
                style={{
                  textAlign: "left",
                  padding: "8px",
                  cursor: "pointer",
                  fontWeight: 700,
                  width: "22%",
                }}
              >
                Salesman ▲▼
              </th>

              <th
                onClick={() => {
                  setSortField("no_of_customers");
                  setAscending(!ascending);
                  setCurrentPage(1);
                }}
                style={{
                  textAlign: "center",
                  padding: "8px",
                  cursor: "pointer",
                  fontWeight: 700,
                  width: "13%",
                }}
              >
                Customers ▲▼
              </th>

              <th
                onClick={() => {
                  setSortField("outstanding");
                  setAscending(!ascending);
                  setCurrentPage(1);
                }}
                style={{
                  textAlign: "right",
                  padding: "8px",
                  cursor: "pointer",
                  fontWeight: 700,
                  width: "22%",
                }}
              >
                Outstanding (AED) ▲▼
              </th>

              <th
                onClick={() => {
                  setSortField("overdue");
                  setAscending(!ascending);
                  setCurrentPage(1);
                }}
                style={{
                  textAlign: "right",
                  padding: "8px",
                  cursor: "pointer",
                  fontWeight: 700,
                  width: "20%",
                }}
              >
                Overdue (AED) ▲▼
              </th>

              <th
                onClick={() => {
                  setSortField("collection_pct");
                  setAscending(!ascending);
                  setCurrentPage(1);
                }}
                style={{
                  textAlign: "right",
                  padding: "8px",
                  cursor: "pointer",
                  fontWeight: 700,
                  width: "13%",
                }}
              >
                Collection %
              </th>

              <th
                onClick={() => {
                  setSortField("dso");
                  setAscending(!ascending);
                  setCurrentPage(1);
                }}
                style={{
                  textAlign: "center",
                  padding: "8px",
                  cursor: "pointer",
                  fontWeight: 700,
                  width: "10%",
                }}
              >
                DSO ▲▼
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #E2E8F0",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F8FAFC")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#FFFFFF")
                  }
                >
                  <td
                    style={{
                      padding: "8px",
                      fontWeight: 600,
                      color: "#0F172A",
                    }}
                  >
                    {row.salesman ?? "-"}
                  </td>

                  <td
                    style={{
                      textAlign: "center",
                      padding: "8px",
                      fontWeight: 600,
                    }}
                  >
                    {row.no_of_customers ?? 0}
                  </td>

                  <td
                    style={{
                      textAlign: "right",
                      padding: "8px",
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {Number(row.outstanding ?? 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  <td
                    style={{
                      textAlign: "right",
                      padding: "8px",
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {Number(row.overdue ?? 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  <td
                    style={{
                      textAlign: "right",
                      padding: "8px",
                      fontWeight: 600,
                    }}
                  >
                    {row.collection_pct != null
                      ? `${Number(row.collection_pct).toFixed(1)}%`
                      : "-"}
                  </td>

                  <td
                    style={{
                      textAlign: "center",
                      padding: "8px",
                      fontWeight: 600,
                    }}
                  >
                    {row.dso ?? "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#64748B",
                    fontWeight: 600,
                  }}
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}

      <div
        style={{
          borderTop: "1px solid #E2E8F0",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "10px",
          background: "#FFFFFF",
        }}
      >
        <span
          style={{
            color: "#475569",
            fontWeight: 800,
          }}
        >
          Showing {sortedData.length ? startIndex + 1 : 0} -
          {Math.min(endIndex, sortedData.length)} of {sortedData.length}
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            style={{
              padding: "4px 8px",
              border: "1px solid #CBD5E1",
              borderRadius: 6,
              background: "#fff",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            {"<<"}
          </button>

          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "4px 8px",
              border: "1px solid #CBD5E1",
              borderRadius: 6,
              background: "#fff",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            {"<"}
          </button>

          <span
            style={{
              fontWeight: 600,
              color: "#0F172A",
              padding: "0 8px",
            }}
          >
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: "4px 8px",
              border: "1px solid #CBD5E1",
              borderRadius: 6,
              background: "#fff",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            {">"}
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            style={{
              padding: "4px 8px",
              border: "1px solid #CBD5E1",
              borderRadius: 6,
              background: "#fff",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
}

{/*....... inventory slow moving items table ............*/ }

export function InventoryTable({data = [],title }) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col w-full h-80"
      style={{
       
        boxShadow: "0 1px 4px rgba(15,23,42,.06)",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 42,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          borderBottom: "1px solid #E8EDF5",
          fontSize: 14,
          fontWeight: 700,
          color: "#112B6B",
          background: "#fff",
        }}
      >
        {title}
      </div>

      {/* Table */}
      <div
        className="flex-1"
        style={{
          overflowY: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontSize: 11,
          }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "#F8FAFD",
              zIndex: 5,
            }}
          >
            <tr>
              <th
                style={{
                  width: "7%",
                  padding: "8px 8px",
                  textAlign: "center",
                  color: "#1E3A8A",
                  fontWeight: 700,
                  borderBottom: "1px solid #E8EDF5",
                }}
              >
                #
              </th>

              <th
                style={{
                  width: "34%",
                  padding: "12px 10px",
                  textAlign: "left",
                  color: "#1E3A8A",
                  fontWeight: 700,
                  borderBottom: "1px solid #E8EDF5",
                }}
              >
                Item Description
              </th>

              <th
                style={{
                  width: "17%",
                 padding: "12px 10px",
                  textAlign: "left",
                  color: "#1E3A8A",
                  fontWeight: 700,
                  borderBottom: "1px solid #E8EDF5",
                }}
              >
                Item Code
              </th>

              <th
                style={{
                  width: "14%",
                  padding: "12px 10px",
                  textAlign: "left",
                  color: "#1E3A8A",
                  fontWeight: 700,
                  borderBottom: "1px solid #E8EDF5",
                }}
              >
                Qty 
              </th>

              <th
                style={{
                  width: "17%",
                  padding: "12px 10px",
                  textAlign: "left",
                  color: "#1E3A8A",
                  fontWeight: 700,
                  borderBottom: "1px solid #E8EDF5",
                }}
              >
                Value 
              </th>

              <th
                style={{
                  width: "11%",
                  padding: "12px 10px",
                  textAlign: "left",
                  color: "#1E3A8A",
                  fontWeight: 700,
                  borderBottom: "1px solid #E8EDF5",
                }}
              >
                Days
              </th>
            </tr>
          </thead>

          <tbody>
            {data.length ? (
              data.map((item, index) => (
                <tr
                  key={index}
                  style={{
                    height: 34,
                    background: index % 2 === 0 ? "#FFFFFF" : "#FBFCFE",
                    borderBottom: "1px solid #EEF2F7",
                  }}
                >
                  <td
                    style={{
                      textAlign: "center",
                      color: "#64748B",
                      fontWeight: 600,
                      padding: "6px 8px",
                    }}
                  >
                    {index + 1}
                  </td>

                  <td
                    style={{
                     padding: "10px 10px",
                      color: "#0F172A",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.item}
                  </td>

                  <td
                    style={{
                     padding: "10px 10px",
                      textAlign: "left",
                     color: "#0F172A",
                      fontWeight: 500,
                    }}
                  >
                    {item.code}
                  </td>

                  <td
                    style={{
                    padding: "10px 10px",
                      textAlign: "left",
                      color: "#0F172A",
                      fontWeight: 500,
                    }}
                  >
                    {Number(item.qty).toLocaleString()}
                  </td>

                  <td
                    style={{
                    padding: "10px 10px",
                      textAlign: "left",
                      color: "#0F172A",
                      fontWeight: 500,
                    }}
                  >
                    {Number(item.value).toFixed(2)}
                  </td>

                  <td
                    style={{
                     padding: "10px 10px",
                      textAlign: "left",
                      color: "#0F172A",
                      fontWeight: 500,
                    }}
                  >
                    {item.days}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748B",
                  }}
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/*Inventory Location */
export  function InventoryLocationTable({data = [], title }) {

  const grandTotal = data.reduce(
    (acc, curr) => acc + Number(curr.value || 0),
    0
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-80">
      {/* Header */}
      <h3
        style={{
          padding: "12px 16px",
          fontSize: "13px",
          fontWeight: 700,
          color: "#081B46",
        }}
      >
        {title}
      </h3>

      {/* Table */}
      <div className="flex-1 border border-gray-100 rounded-lg overflow-hidden">
        <div
          style={{
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              fontSize: "0.74rem",
            }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "#F8FAFC",
                zIndex: 10,
              }}
            >
              <tr>
                <th
                  style={{
                    width: "50%",
                    textAlign: "left",
                    padding: "10px",
                    fontWeight: 700,
                    color:"#1E3A8A",
                  }}
                >
                  Location
                </th>

                <th
                  style={{
                    width: "30%",
                    textAlign: "left",
                    padding: "10px",
                    fontWeight: 700, color:"#1E3A8A",
                  }}
                >
                  Value (AED)
                </th>

                <th
                  style={{
                    width: "20%",
                    textAlign: "left",
                    padding: "10px",
                    fontWeight: 700, color:"#1E3A8A",
                  }}
                >
                  % Share
                </th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    <td
                      style={{
                        padding: "10px",
                        fontWeight: 600,
                        color: "#0F172A",
                      }}
                    >
                      {item.location}
                    </td>

                    <td
                      style={{
                        padding: "10px",
                        textAlign: "left",
                        fontWeight: 600,
                      }}
                    >
                      {Number(item.value).toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td
                      style={{
                        padding: "10px",
                        textAlign: "left",
                        fontWeight: 600,
                      }}
                    >
                      {grandTotal > 0
                        ? ((Number(item.value) / grandTotal) * 100).toFixed(2)
                        : "0.00"}
                      %
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                    }}
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot>
              <tr
                style={{
                  position: "sticky",
                  bottom: 0,
                  background: "#F8FAFC",
                  borderTop: "1px solid #E2E8F0",
                  zIndex: 5,
                }}
              >
                <td
                  style={{
                    padding: "10px",
                    fontWeight: 900,
                    color: "#07247b",
                  }}
                >
                  Total
                </td>

                <td
                  style={{
                    padding: "10px",
                    textAlign: "left",
                    fontWeight: 900,
                    color: "#07247b",
                  }}
                >
                  {grandTotal.toLocaleString("en-GB", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                <td
                  style={{
                    padding: "10px",
                    textAlign: "left",
                    fontWeight: 900,
                    color: "#07247b",
                  }}
                >
                  100.00%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}