import React from "react";
import ChartMenu from "../ChartMenu";

const baseColumns = [
  { label: "Legal Entity", field: "legalEntity", width: 220, sticky: true },
  { label: "Subdivision", field: "subDivision", width: 180, sticky: true },
  { label: "Warehouse", field: "warehouse", width: 140, sticky: true },
  { label: "Category", field: "category", width: 120, sticky: true },

  { label: "Item Code", field: "itemCode", width: 140 },
  { label: "Description", field: "description", width: 320 },
  { label: "Quantity", field: "quantity", align: "right", width: 90 },
  { label: "Inv. Value", field: "inventoryValue", align: "right", width: 110 },
  { label: "0-30", field: "days0to30", align: "right", width: 90 },
  { label: "31-60", field: "days31to60", align: "right", width: 90 },
  { label: "61-90", field: "days61to90", align: "right", width: 90 },
  { label: "91-120", field: "days91to120", align: "right", width: 90 },
  { label: "121-180", field: "days121to180", align: "right", width: 90 },
  { label: "181-365", field: "days181to365", align: "right", width: 90 },
  { label: "366-730", field: "days366to730", align: "right", width: 90 },
  { label: ">730", field: "daysAbove730", align: "right", width: 90 },
];


export default function InventoryDetailedViewTable({
  title = "Inventory Detailed View",
  data = [],
  onSort,
  showHeader = true,
  onViewAll,
  onExportExcel,
  onExportPdf, currency = "AED",
}) {

  const amountColumns = [
    "inventoryValue",
    "days0to30",
    "days31to60",
    "days61to90",
    "days91to120",
    "days121to180",
    "days181to365",
    "days366to730",
    "daysAbove730",
  ];

  const columns = baseColumns.map((col) =>
    amountColumns.includes(col.field)
      ? {
        ...col,
        label:
          col.field === "inventoryValue"
            ? `Inv. Value (${currency})`
            : `${col.label} (${currency})`,
      }
      : col
  );

  let leftOffset = 0;

  const stickyOffsets = {};

  columns.forEach((col) => {
    if (col.sticky) {
      stickyOffsets[col.field] = leftOffset;
      leftOffset += col.width;
    }
  });

  const displayData = data.slice(0, 10);

  const totals = displayData.reduce(
    (acc, row) => ({
      quantity: acc.quantity + Number(row.quantity || 0),
      inventoryValue: acc.inventoryValue + Number(row.inventoryValue || 0),
      days0to30: acc.days0to30 + Number(row.days0to30 || 0),
      days31to60: acc.days31to60 + Number(row.days31to60 || 0),
      days61to90: acc.days61to90 + Number(row.days61to90 || 0),
      days91to120: acc.days91to120 + Number(row.days91to120 || 0),
      days121to180: acc.days121to180 + Number(row.days121to180 || 0),
      days181to365: acc.days181to365 + Number(row.days181to365 || 0),
      days366to730: acc.days366to730 + Number(row.days366to730 || 0),
      daysAbove730: acc.daysAbove730 + Number(row.daysAbove730 || 0),
    }),
    {
      quantity: 0,
      inventoryValue: 0,
      days0to30: 0,
      days31to60: 0,
      days61to90: 0,
      days91to120: 0,
      days121to180: 0,
      days181to365: 0,
      days366to730: 0,
      daysAbove730: 0,
    }
  );

  const formatNumber = (field, value) => {
    if (value == null) return "-";

    const amount = Number(value);

    if (field === "quantity") {
      return amount.toLocaleString("en-GB");
    }

    if (amount >= 1_000_000) {
      return `${currency} ${(amount / 1_000_000).toFixed(2)}M`;
    }

    if (amount >= 1_000) {
      return `${currency} ${(amount / 1_000).toFixed(2)}K`;
    }

    return `${currency} ${amount.toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">

      {showHeader && (
        <div className="inventory-head flex items-center justify-between px-4 py-3 border-b border-slate-200">
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

      <div className="overflow-x-auto overflow-y-auto">

        <table className="inventory-details-table border-collapse text-[10px] min-w-max">

          <thead className="sticky top-0 z-40 bg-[#F8FAFC]">

            <tr>

              {columns.map((col) => (
                <th
                  key={col.field}
                  onClick={() => onSort?.(col.field)}
                  style={{
                    width: col.width,
                    minWidth: col.width,
                    left: col.sticky ? stickyOffsets[col.field] : undefined,
                    position: col.sticky ? "sticky" : "static",
                    zIndex: col.sticky ? 50 : 10,
                  }}
                  className={`
                    ${col.align === "right"
                      ? "text-right"
                      : "text-left"}

                    px-3
                    py-2
                    font-bold
                    uppercase
                    tracking-wide
                     text-[#081B46]
                    border-b
                    border-slate-200
                    bg-[#F8FAFC]
                    whitespace-nowrap
                  `}
                >
                  <span
                    style={{
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      lineHeight: "13px",
                      display: "block",
                    }}
                  >
                    {col.label}
                  </span>
                </th>
              ))}

            </tr>

          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center text-slate-400 text-sm"
                >
                  No Records Available
                </td>
              </tr>
            ) : (
              displayData.map((row, index) => (
                <tr
                  key={index}
                  className={`transition-colors duration-150 hover:bg-violet-50 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.field}
                      style={{
                        width: col.width,
                        minWidth: col.width,
                        left: col.sticky
                          ? stickyOffsets[col.field]
                          : undefined,
                        position: col.sticky ? "sticky" : "static",
                        zIndex: col.sticky ? 20 : 1,
                        background: col.sticky
                          ? index % 2 === 0
                            ? "#ffffff"
                            : "#f8fafc"
                          : undefined,
                      }}
                      className={`
                        ${col.align === "right"
                          ? "text-right font-medium text-slate-800"
                          : "text-left text-slate-700"
                        }
                        px-3
                        py-2
                        border-b
                        border-slate-100
                        whitespace-nowrap
                      `}
                    >
                      {col.align === "right"
                        ? formatNumber(col.field, row[col.field])
                        : row[col.field] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

          <tfoot>
            <tr className="sticky bottom-0 bg-[#F8FAFC] border-t border-slate-300">

              {columns.map((col, index) => {
                let value = "";

                if (index === 0) value = "Total";
                else if (col.field === "quantity")
                  value = formatNumber("quantity", totals.quantity);
                else if (col.field === "inventoryValue")
                  value = formatNumber(
                    "inventoryValue",
                    totals.inventoryValue
                  );
                else if (col.field === "days0to30")
                  value = formatNumber("days0to30", totals.days0to30);
                else if (col.field === "days31to60")
                  value = formatNumber("days31to60", totals.days31to60);
                else if (col.field === "days61to90")
                  value = formatNumber("days61to90", totals.days61to90);
                else if (col.field === "days91to120")
                  value = formatNumber("days91to120", totals.days91to120);
                else if (col.field === "days121to180")
                  value = formatNumber("days121to180", totals.days121to180);
                else if (col.field === "days181to365")
                  value = formatNumber("days181to365", totals.days181to365);
                else if (col.field === "days366to730")
                  value = formatNumber("days366to730", totals.days366to730);
                else if (col.field === "daysAbove730")
                  value = formatNumber("daysAbove730", totals.daysAbove730);

                return (
                  <td
                    key={col.field}
                    style={{
                      width: col.width,
                      minWidth: col.width,
                      left: col.sticky
                        ? stickyOffsets[col.field]
                        : undefined,
                      position: col.sticky ? "sticky" : "static",
                      zIndex: col.sticky ? 40 : 10,
                      background: "#F8FAFC",
                    }}
                    className={`
                      ${col.align === "right"
                        ? "text-right"
                        : "text-left"
                      }
                      px-3
                      py-2
                      font-bold
                      border-t
                      border-slate-300
                      whitespace-nowrap
                    `}
                  >
                    {value}
                  </td>
                );
              })}

            </tr>
          </tfoot>

        </table>

      </div>

    </div>
  );
}