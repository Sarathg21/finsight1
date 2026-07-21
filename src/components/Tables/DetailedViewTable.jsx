import React from "react";

const columns = [
  "Legal Entity",
  "Parent Division",
  "Sub-Division",
  "Business Unit",
  "Current (₹ Cr)",
  "1 - 30 Days (₹ Cr)",
  "31 - 60 Days (₹ Cr)",
  "61 - 90 Days (₹ Cr)",
  "91 - 120 Days (₹ Cr)",
  "> 120 Days (₹ Cr)",
  "Total (₹ Cr)",
  "DPO (Days)",
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
                columns.map((col, i)=>(
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
            {
              data.map((r,i)=>(
                <tr key={i}>
                  <td className="font-semibold text-slate-900">
                    {r.entity}
                  </td>
                  <td>
                    {r.parent}
                  </td>
                  <td>
                    {r.sub}
                  </td>
                  <td>
                    {r.bu}
                  </td>
                  <td className="text-left font-bold">
                    {r.current.toFixed(2)}
                  </td>
                  <td className="text-left">
                    {r.m1.toFixed(2)}
                  </td>
                  <td className="text-left">
                    {r.m2.toFixed(2)}
                  </td>
                  <td className="text-left">
                    {r.m3.toFixed(2)}
                  </td>
                  <td className="text-left">
                    {r.m4.toFixed(2)}
                  </td>

                  <td className="text-left">
                    {r.m5.toFixed(2)}
                  </td>

                  <td className="text-left font-bold text-blue-600">
                    {r.total.toFixed(2)}
                  </td>

                  <td className="text-left font-bold">
                    {r.dpo}
                  </td>
                </tr>

              ))
            }
          </tbody>
        </table>

      </div>
    </div>

  );
}