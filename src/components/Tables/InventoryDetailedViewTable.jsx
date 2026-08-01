import React from "react";
import ChartMenu from "../ChartMenu";
const columns = [
  {
    label: "Legal Entity",
    field: "legalEntity",
    align: "left",
    width: "220px",
  },
  {
    label: "Parent Division",
    field: "parentDivision",
    align: "left",
    width: "180px",
  },
  {
    label: "Sub-Division",
    field: "subDivision",
    align: "left",
    width: "180px",
  },
  {
    label: "Business Unit",
    field: "businessUnit",
    align: "left",
    width: "150px",
  },
  {
    label: "Total Qty",
    field: "totalQty",
    align: "right",
    width: "120px",
  },
  {
    label: "Inv. Value",
    field: "inventoryValue",
    align: "right",
    width: "100px",
  },
  {
    label: "0-30",
    field: "days0to30",
    align: "right",
    width: "85px",
  },
  {
    label: "31-60",
    field: "days31to60",
    align: "right",
    width: "85px",
  },
  {
    label: "61-90",
    field: "days61to90",
    align: "right",
    width: "85px",
  },
  {
    label: "91-180",
    field: "days91to180",
    align: "right",
    width: "90px",
  },
  {
    label: ">180",
    field: "daysAbove180",
    align: "right",
    width: "80px",
  },
  {
    label: "Slow Moving",
    field: "slowMoving",
    align: "right",
    width: "110px",
  },
];

export default function InventoryDetailedViewTable({
  title = "Inventory Detailed View",
  data = [],
  onSort,
  showHeader = true,
  onViewAll,
  onExportExcel,
  onExportPdf,
}) {

  const totals = data.reduce(
    (acc, row) => ({
      totalQty: acc.totalQty + Number(row.totalQty || 0),
      inventoryValue:
        acc.inventoryValue + Number(row.inventoryValue || 0),
      days0to30:
        acc.days0to30 + Number(row.days0to30 || 0),
      days31to60:
        acc.days31to60 + Number(row.days31to60 || 0),
      days61to90:
        acc.days61to90 + Number(row.days61to90 || 0),
      days91to180:
        acc.days91to180 + Number(row.days91to180 || 0),
      daysAbove180:
        acc.daysAbove180 + Number(row.daysAbove180 || 0),
      slowMoving:
        acc.slowMoving + Number(row.slowMoving || 0),
    }),
    {
      totalQty: 0,
      inventoryValue: 0,
      days0to30: 0,
      days31to60: 0,
      days61to90: 0,
      days91to180: 0,
      daysAbove180: 0,
      slowMoving: 0,
    }
  );

  const formatNumber = (field, value) => {
    if (value == null) return "-";

    if (field === "totalQty") {
      return Number(value).toLocaleString("en-GB");
    }

    return Number(value).toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">

      {/* Header */}
      {showHeader && (
      <div className="inventory-head flex shrink-0 items-center justify-between px-4 py-3 border-b border-slate-200">

        <h3 className="text-[15px] font-bold text-[#081B46]">
          {title}
        </h3>

        <ChartMenu
          onViewAll={onViewAll}
          onExportExcel={onExportExcel}
          onExportPdf={onExportPdf}
        />
      </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">

        <div className="h-[calc(100%-55px)] overflow-y-auto border border-slate-200 rounded-lg"
          style={{
            padding: "10px 14px",
          }}
          >
          <table
            className="inventory-details-table w-full border-collapse text-[10px]"
          >
            {/* Header */}
            <thead className="sticky top-0 bg-[#F8FAFC] z-20">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.field}
                    onClick={() => onSort?.(col.field)}
                    style={{
                      width: col.width,
                      left:
                        col.field === "legalEntity"
                          ? 0
                          : col.field === "parentDivision"
                            ? 220
                            : col.field === "subDivision"
                              ? 400
                              : col.field === "businessUnit"
                                ? 580
                                : undefined,
                    }}
                    className={`
                     ${[
                        "legalEntity",
                        "parentDivision",
                        "subDivision",
                        "businessUnit",
                      ].includes(col.field)
                        ? "sticky-col"
                        : ""
                      }

                        ${col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                          ? "text-center"
                          : "text-left"
                      }

                      px-3 py-1.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-[#233B74]
                      border-b
                      border-slate-200
                      bg-[#F8FAFC]
                      whitespace-nowrap
                    `}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}

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
                    {columns.map((col) => (
                      <td
                        key={col.field}
                        style={{
                          left:
                            col.field === "legalEntity"
                              ? 0
                              : col.field === "parentDivision"
                                ? 220
                                : col.field === "subDivision"
                                  ? 400
                                  : col.field === "businessUnit"
                                    ? 580
                                    : undefined,
                        }}
                        className={`
                             ${[
                            "legalEntity",
                            "parentDivision",
                            "subDivision",
                            "businessUnit",
                          ].includes(col.field)
                            ? "sticky-col"
                            : ""
                          }

                            ${col.align === "right"
                            ? "text-right font-medium text-slate-800"
                            : col.align === "center"
                              ? "text-center"
                              : "text-left text-slate-700"
                          }

                           px-3 py-2
                           border-b
                           border-slate-100
                           whitespace-nowrap
                         `}
                      >
                        {col.align === "right"
                          ? formatNumber(col.field, row[col.field])
                          : row[col.field] || "-"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>

            {/* Footer */}
            <tfoot>
              <tr className="sticky bottom-0 bg-[#F8FAFC] border-t border-slate-300 font-bold">

                <td
                  className="sticky-col px-3 py-2 text-left text-[10px] font-bold bg-[#F8FAFC]"
                  style={{ left: 0, width: "220px" }}
                >
                  Total
                </td>

                <td
                  className="sticky-col bg-[#F8FAFC]"
                  style={{ left: 220, width: "180px" }}
                />

                <td
                  className="sticky-col bg-[#F8FAFC]"
                  style={{ left: 400, width: "180px" }}
                />

                <td
                  className="sticky-col bg-[#F8FAFC]"
                  style={{ left: 580, width: "150px" }}
                />

                <td className="px-3 py-2 text-right font-bold">
                  {formatNumber("totalQty", totals.totalQty)}
                </td>

                <td className="px-3 py-2 text-right font-bold">
                  {formatNumber("inventoryValue", totals.inventoryValue)}
                </td>

                <td className="px-3 py-2 text-right font-bold">
                  {formatNumber("days0to30", totals.days0to30)}
                </td>

                <td className="px-3 py-2 text-right font-bold">
                  {formatNumber("days31to60", totals.days31to60)}
                </td>

                <td className="px-3 py-2 text-right font-bold">
                  {formatNumber("days61to90", totals.days61to90)}
                </td>

                <td className="px-3 py-2 text-right font-bold">
                  {formatNumber("days91to180", totals.days91to180)}
                </td>

                <td className="px-3 py-2 text-right font-bold">
                  {formatNumber("daysAbove180", totals.daysAbove180)}
                </td>

                <td className="px-3 py-2 text-right font-bold">
                  {formatNumber("slowMoving", totals.slowMoving)}
                </td>

              </tr>
            </tfoot>

          </table>
        </div>

      </div>

    </div>
  );
}