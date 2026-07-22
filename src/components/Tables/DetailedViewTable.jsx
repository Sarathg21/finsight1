import React from "react";

const columns = [
  "Customer",
  "Customer Type",
  "Currency",
  "Country",
  "Invoice No",
  "Invoice Date",
  "Due Date",
  "Outstanding",
  "Aging Bucket",
  "Salesman",
  "Division",
  "Legal Entity",
];


export default function DetailedViewTable({ data, title }) {

  return (
    <div className="card">

      {/* TITLE */}
      <h3 className="text-[10px] font-extrabold text-[#081B46] mb-1">
        {title}
      </h3>

      {/* TABLE WRAPPER */}
      <div className="flex-1 overflow-auto border border-gray-100 rounded-md">
        <table className="compact-table min-w-225">
          {/* HEADER */}
          <thead>
            <tr>
              {
                columns.map((col, i) => (
                  <th
                    key={i}
                    className={i >= 4 ? "text-right" : ""}
                  >
                    {col}
                  </th>
                ))
              }
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {data.map((r, i) => (
              <tr key={i}>
                <td>{r.customer_name}</td>

                <td>{r.customer_type || "-"}</td>

                <td>{r.currency}</td>

                <td>{r.country || "-"}</td>

                <td>{r.invoice_number || "-"}</td>

                <td>{r.invoice_date || "-"}</td>

                <td>{r.due_date || "-"}</td>

                <td className="text-right font-bold">
                  {r.outstanding_amount != null
                    ? Number(r.outstanding_amount).toFixed(2)
                    : "-"}
                </td>

                <td>{r.aging_bucket}</td>

                <td>{r.salesman || "-"}</td>

                <td>{r.division || "-"}</td>

                <td>{r.legal_entity || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>

  );
}