import React from "react";

const columns = [
  {
    label: "Legal Entity",
    field: "legalEntity",
    align: "left",
    width: "13%",
  },
  {
    label: "Parent Division",
    field: "parentDivision",
    align: "left",
    width: "10%",
  },
  {
    label: "Sub-Division",
    field: "subDivision",
    align: "left",
    width: "10%",
  },
  {
    label: "Business Unit",
    field: "businessUnit",
    align: "left",
    width: "9%",
  },
  {
    label: "Total Qty",
    field: "totalQty",
    align: "right",
    width: "9%",
  },
  {
    label: "Inv. Value",
    field: "inventoryValue",
    align: "right",
    width: "8%",
  },
  {
    label: "0-30",
    field: "days0to30",
    align: "right",
    width: "6%",
  },
  {
    label: "31-60",
    field: "days31to60",
    align: "right",
    width: "6%",
  },
  {
    label: "61-90",
    field: "days61to90",
    align: "right",
    width: "6%",
  },
  {
    label: "91-180",
    field: "days91to180",
    align: "right",
    width: "6%",
  },
  {
    label: ">180",
    field: "daysAbove180",
    align: "right",
    width: "6%",
  },
  {
    label: "Slow Moving",
    field: "slowMoving",
    align: "right",
    width: "8%",
  },
];

export default function InventoryDetailedViewTable({
  title = "Inventory Detailed View",
  data = [],
  onSort,
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
      <div className="inventory-head px-4 py-3 border-b border-slate-200">
        <h3 className="text-[13px] font-bold">
          {title}
        </h3>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="inventory-details-table w-full border-collapse text-[10px]">

          {/* Header */}
          <thead className="sticky top-0 bg-[#F8FAFC] z-20">
            <tr>

              {columns.map((col) => (

                <th
                  key={col.field}
                  onClick={() => onSort?.(col.field)}
                  style={{ width: col.width }}
                  className={`
                    px-3
                    py-1.75
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-[#233B74]
                    border-b
                    border-slate-200
                    bg-[#F8FAFC]
                    whitespace-nowrap
                    cursor-pointer
                    hover:bg-slate-100
                    ${
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                        ? "text-center"
                        : "text-left"
                    }
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
                    ${
                      index % 2 === 0
                        ? "bg-white"
                        : "bg-slate-50/40"
                    }
                  `}
                >
                  {columns.map((col) => (
                    <td
                      key={col.field}
                      className={`
                        px-3
                        py-2.25
                        text-[10px]
                        border-b
                        border-slate-100
                        whitespace-nowrap
                        ${
                          col.align === "right"
                            ? "text-right font-medium text-slate-800"
                            : col.align === "center"
                            ? "text-center text-slate-700"
                            : "text-left text-slate-700"
                        }
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

              <td className="px-3 py-2 text-[10px] text-left text-[#081B46]">
                Total
              </td>

              <td></td>
              <td></td>
              <td></td>

              <td className="px-3 py-2 text-[10px] text-right text-[#081B46]">
                {formatNumber("totalQty", totals.totalQty)}
              </td>

              <td className="px-3 py-2 text-[10px] text-right text-[#081B46]">
                {formatNumber("inventoryValue", totals.inventoryValue)}
              </td>

              <td className="px-3 py-2 text-[10px] text-right text-[#081B46]">
                {formatNumber("days0to30", totals.days0to30)}
              </td>

              <td className="px-3 py-2 text-[10px] text-right text-[#081B46]">
                {formatNumber("days31to60", totals.days31to60)}
              </td>

              <td className="px-3 py-2 text-[10px] text-right text-[#081B46]">
                {formatNumber("days61to90", totals.days61to90)}
              </td>

              <td className="px-3 py-2 text-[10px] text-right text-[#081B46]">
                {formatNumber("days91to180", totals.days91to180)}
              </td>

              <td className="px-3 py-2 text-[10px] text-right text-[#081B46]">
                {formatNumber("daysAbove180", totals.daysAbove180)}
              </td>

              <td className="px-3 py-2 text-[10px] text-right text-[#081B46]">
                {formatNumber("slowMoving", totals.slowMoving)}
              </td>

            </tr>
          </tfoot>

        </table>

      </div>

    </div>
  );
}