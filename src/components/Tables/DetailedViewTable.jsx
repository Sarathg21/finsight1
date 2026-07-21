// import React from 'react';

// const columns = [
//   'Legal Entity', 'Parent Division', 'Sub-Division', 'Business Unit', 
//   'Current (₹ Cr)', '1 - 30 Days (₹ Cr)', '31 - 60 Days (₹ Cr)', 
//   '61 - 90 Days (₹ Cr)', '91 - 120 Days (₹ Cr)', '> 120 Days (₹ Cr)', 
//   'Total (₹ Cr)', 'DPO (Days)'
// ];

// export default function DetailedViewTable({ data }) {
//   return (
//     <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col">
//       <h3 className="text-xs font-bold text-[#081B46] mb-3">Payables Detailed View</h3>
//       <div className="overflow-x-auto border border-gray-100 rounded-lg max-w-full">
//         <table className="w-full text-left text-xs min-w-300 border-collapse">
//           <thead>
//             <tr className="bg-slate-50 border-b border-gray-200 text-gray-500 font-bold">
//               {columns.map((col, i) => (
//                 <th key={i} className={`py-2.5 px-3 ${i >= 4 ? 'text-right' : ''}`}>{col}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
//             {data.map((r, i) => (
//               <tr key={i} className="hover:bg-slate-50/60 transition-all">
//                 <td className="py-2.5 px-3 text-slate-900 font-semibold">{r.entity}</td>
//                 <td className="py-2.5 px-3 text-gray-500">{r.parent}</td>
//                 <td className="py-2.5 px-3 text-gray-500">{r.sub}</td>
//                 <td className="py-2.5 px-3 text-gray-500">{r.bu}</td>
//                 <td className="py-2.5 px-3 text-right font-bold text-gray-900">{r.current.toFixed(2)}</td>
//                 <td className="py-2.5 px-3 text-right text-gray-600">{r.m1.toFixed(2)}</td>
//                 <td className="py-2.5 px-3 text-right text-gray-600">{r.m2.toFixed(2)}</td>
//                 <td className="py-2.5 px-3 text-right text-gray-600">{r.m3.toFixed(2)}</td>
//                 <td className="py-2.5 px-3 text-right text-gray-600">{r.m4.toFixed(2)}</td>
//                 <td className="py-2.5 px-3 text-right text-gray-600">{r.m5.toFixed(2)}</td>
//                 <td className="py-2.5 px-3 text-right font-bold text-blue-600">{r.total.toFixed(2)}</td>
//                 <td className="py-2.5 px-3 text-right font-bold text-slate-800">{r.dpo}</td>
//               </tr>
//             ))}
//             <tr className="bg-slate-50/80 border-t border-gray-200 font-extrabold text-gray-900">
//               <td colSpan={4} className="py-2.5 px-3">Total</td>
//               <td className="py-2.5 px-3 text-right">17.85</td>
//               <td className="py-2.5 px-3 text-right">13.80</td>
//               <td className="py-2.5 px-3 text-right">10.60</td>
//               <td className="py-2.5 px-3 text-right">7.45</td>
//               <td className="py-2.5 px-3 text-right">4.60</td>
//               <td className="py-2.5 px-3 text-right">11.25</td>
//               <td className="py-2.5 px-3 text-right text-blue-600">65.55</td>
//               <td className="py-2.5 px-3 text-right">46</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
import React from 'react';

const columns = [
  'Legal Entity', 'Parent Division', 'Sub-Division', 'Business Unit', 
  'Current (₹ Cr)', '1 - 30 Days (₹ Cr)', '31 - 60 Days (₹ Cr)', 
  '61 - 90 Days (₹ Cr)', '91 - 120 Days (₹ Cr)', '> 120 Days (₹ Cr)', 
  'Total (₹ Cr)', 'DPO (Days)'
];

export default function DetailedViewTable({ data ,title}) {
  return (
 <div className="bg-white border border-gray-200 rounded-lg p-1 shadow-xs">

  {/* TITLE */}
  <h3 className="text-[10px] font-extrabold text-[#081B46] mb-1 leading-none">
    {title}
  </h3>

  {/* SCROLLABLE TABLE WRAPPER */}
  <div className="flex-1 overflow-auto border border-gray-100 rounded-md">

    <table className="w-full text-left text-[9px] min-w-225 border-collapse">

      {/* HEADER */}
      <thead className="sticky top-0 bg-slate-50 z-10">
        <tr className="text-gray-500 font-semibold border-b border-gray-200">

          {columns.map((col, i) => (
            <th
              key={i}
              className={`py-0.5 px-1 ${i >= 4 ? 'text-right' : ''}`}
            >
              {col}
            </th>
          ))}

        </tr>
      </thead>

      {/* BODY */}
      <tbody className="divide-y divide-gray-100 text-gray-700">

        {data.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50/60">

            <td className="py-0.5 px-1 font-semibold text-slate-900">
              {r.entity}
            </td>

            <td className="py-0.5 px-1 text-gray-500">
              {r.parent}
            </td>

            <td className="py-0.5 px-1 text-gray-500">
              {r.sub}
            </td>

            <td className="py-0.5 px-1 text-gray-500">
              {r.bu}
            </td>

            <td className="py-0.5 px-1 text-right font-bold text-gray-900">
              {r.current.toFixed(2)}
            </td>

            <td className="py-0.5 px-1 text-right text-gray-600">
              {r.m1.toFixed(2)}
            </td>

            <td className="py-0.5 px-1 text-right text-gray-600">
              {r.m2.toFixed(2)}
            </td>

            <td className="py-0.5 px-1 text-right text-gray-600">
              {r.m3.toFixed(2)}
            </td>

            <td className="py-0.5 px-1 text-right text-gray-600">
              {r.m4.toFixed(2)}
            </td>

            <td className="py-0.5 px-1 text-right text-gray-600">
              {r.m5.toFixed(2)}
            </td>

            <td className="py-0.5 px-1 text-right font-bold text-blue-600">
              {r.total.toFixed(2)}
            </td>

            <td className="py-0.5 px-1 text-right font-bold text-slate-800">
              {r.dpo}
            </td>

          </tr>
        ))}

      </tbody>
    </table>

  </div>
</div>
  );
}