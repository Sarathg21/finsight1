// import React from 'react';

// export function TopVendorsTable({ data }) {
//   return (
//     <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col h-85">
//       <h3 className="text-xs font-bold text-[#081B46] mb-3">Top 10 Vendors by Payables (₹ Cr)</h3>
//       <div className="flex-1 overflow-y-auto border border-gray-100 rounded-lg">
//         <table className="w-full text-left text-xs border-collapse">
//           <thead>
//             <tr className="bg-slate-50 border-b border-gray-200 text-gray-500 font-bold sticky top-0">
//               <th className="py-2 px-3 w-12">#</th>
//               <th className="py-2 px-3">Vendor Name</th>
//               <th className="py-2 px-3 text-right">Payables (₹ Cr)</th>
//               <th className="py-2 px-3 text-right">% of Total</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
//             {data.map((v, i) => (
//               <tr key={v.id} className="hover:bg-slate-50/80 transition-all">
//                 <td className="py-2 px-3 text-gray-400 font-normal">{i + 1}</td>
//                 <td className="py-2 px-3 font-semibold text-gray-800">{v.name}</td>
//                 <td className="py-2 px-3 text-right font-bold">{v.amount.toFixed(2)}</td>
//                 <td className="py-2 px-3 text-right text-gray-500">{v.pct}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export function BusinessUnitTable({ data }) {
//   const grandTotal = data.reduce((acc, curr) => acc + curr.amount, 0);
//   return (
//     <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col h-85">
//       <h3 className="text-xs font-bold text-[#081B46] mb-3">Payables by Business Unit (₹ Cr)</h3>
//       <div className="flex-1 overflow-y-auto border border-gray-100 rounded-lg">
//         <table className="w-full text-left text-xs border-collapse">
//           <thead>
//             <tr className="bg-slate-50 border-b border-gray-200 text-gray-500 font-bold sticky top-0">
//               <th className="py-2 px-3">Business Unit</th>
//               <th className="py-2 px-3 text-right">Payables (₹ Cr)</th>
//               <th className="py-2 px-3 text-right">% of Total</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
//             {data.map((b, i) => (
//               <tr key={i} className="hover:bg-slate-50/80 transition-all">
//                 <td className="py-2 px-3 font-semibold text-gray-800">{b.unit}</td>
//                 <td className="py-2 px-3 text-right font-bold">{b.amount.toFixed(2)}</td>
//                 <td className="py-2 px-3 text-right text-gray-500">{b.pct}</td>
//               </tr>
//             ))}
//             <tr className="bg-slate-50 border-t border-gray-200 font-bold text-gray-900 sticky bottom-0">
//               <td className="py-2 px-3">Total</td>
//               <td className="py-2 px-3 text-right">{grandTotal.toFixed(2)}</td>
//               <td className="py-2 px-3 text-right">100.00%</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
import React from 'react';

export function TopVendorsTable({ data,title }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex flex-col h-52">

      <h3 className="text-[11px] font-bold text-[#081B46] mb-2">
        {title}
      </h3>

      <div className="flex-1 border border-gray-100 rounded-lg">

        <table className="w-full text-left text-[8px] border-collapse">

          <thead>
            <tr className="bg-slate-50 border-b border-gray-200 text-gray-500 font-bold sticky top-0">

              <th className="py-1 px-1 w-10">#</th>
              <th className="py-1 px-1">Vendor Name</th>
              <th className="py-1 px- 1 text-right">Payables (₹ Cr)</th>
              <th className="py-1 px-1 text-right">% of Total</th>

            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-[9px] font-medium text-gray-700 leading-none">

            {data.map((v, i) => (
              <tr key={v.id} className="hover:bg-slate-50/60 transition-all">

                <td className="py-0.5 px-1 text-gray-400 w-6">
                  {i + 1}
                </td>

                <td className="py-0.5 px-1 font-semibold text-gray-800 truncate max-w-27.5">
                  {v.name}
                </td>

                <td className="py-0.5 px-1 text-right font-bold">
                  {v.amount.toFixed(2)}
                </td>

                <td className="py-0.5 px-1 text-right text-gray-500">
                  {v.pct}
                </td>

              </tr>
            ))}

            {/* ✅ TOTAL ROW */}
            {(() => {
              const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

              return (
                <tr className="bg-slate-50 font-bold text-gray-900 border-t border-gray-200">

                  <td className="py-0.5 px-1">#</td>
                  <td className="py-0.5 px-1">Total</td>

                  <td className="py-0.5 px-1 text-right">
                    {totalAmount.toFixed(2)}
                  </td>

                  <td className="py-0.5 px-1 text-right">
                    100%
                  </td>

                </tr>
              );
            })()}

          </tbody>
        </table>
      </div>
    </div>
  );
}
export function BusinessUnitTable({ data ,title}) {
  const grandTotal = data.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex flex-col h-52">

      <h3 className="text-[11px] font-bold text-[#081B46] mb-2">
       {title}
      </h3>

      <div className="flex-1 overflow-y-auto border border-gray-100 rounded-lg">

        <table className="w-full text-left text-[11px] border-collapse">

          <thead>
            <tr className="bg-slate-50 border-b border-gray-200 text-gray-500 font-bold sticky top-0">

              <th className="py-1.5 px-2">Business Unit</th>
              <th className="py-1.5 px-2 text-right">Payables (₹ Cr)</th>
              <th className="py-1.5 px-2 text-right">% of Total</th>

            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-[10px] font-medium text-gray-700">

            {data.map((b, i) => (
              <tr key={i} className="hover:bg-slate-50/60 transition-all leading-none">

                <td className="py-0.5 px-2 font-semibold text-gray-800">
                  {b.unit}
                </td>

                <td className="py-0.5 px-2 text-right font-bold">
                  {b.amount.toFixed(2)}
                </td>

                <td className="py-0.5 px-2 text-right text-gray-500">
                  {b.pct}
                </td>

              </tr>
            ))}

            {/* TOTAL ROW */}
            <tr className="bg-slate-50 border-t border-gray-200 font-bold text-gray-900 leading-none">

              <td className="py-0.5 px-2">Total</td>

              <td className="py-0.5 px-2 text-right">
                {grandTotal.toFixed(2)}
              </td>

              <td className="py-0.5 px-2 text-right">100.00%</td>

            </tr>

          </tbody>

        </table>
      </div>
    </div>
  );
}