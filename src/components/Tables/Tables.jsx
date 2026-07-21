
import React from 'react';

export function TopVendorsTable({ data, title, tabletitle }) {

  const totalAmount = data.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (

    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex flex-col h-52">
      <h3 className="text-[10px] font-bold text-[#081B46] mb-2">
        {title}
      </h3>

      <div className="flex-1 border border-gray-100 rounded-lg overflow-hidden">
        <table className="compact-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Vendor Name</th>
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
export function BusinessUnitTable({ data, title,tabletitle }) {

  const grandTotal = data.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex flex-col h-52">
      <h3 className="text-[10px] font-bold text-[#081B46] mb-2">
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