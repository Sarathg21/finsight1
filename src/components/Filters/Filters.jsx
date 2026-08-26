import React from 'react';

const selectFilters = [
  { label: 'Legal Group', defaultVal: 'FJ Group (Consolidated)' },
  { label: 'Legal Entity', defaultVal: 'All' },
  { label: 'Parent Division', defaultVal: 'All' },
  { label: 'Sub-Division', defaultVal: 'All' },

];

export default function Filters() {
  return (
   <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm flex flex-wrap items-end gap-2">

  {selectFilters.map((f, i) => (
    <div key={i} className="flex-1 min-w-32">

      <label className="block text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
        {f.label}
      </label>

      <select className="w-full h-8 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md px-2 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
        <option>{f.defaultVal}</option>
      </select>

    </div>
  ))}

  {/* DATE */}
  <div className="flex-1 min-w-32">
    <label className="block text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
      As On Date
    </label>

    <input
      type="text"
      defaultValue="30 Apr 2024"
      className="w-full h-8 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md px-2 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>

  {/* BUTTONS */}
  <div className="flex gap-1.5 shrink-0 ml-auto w-full sm:w-auto">

    <button className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold rounded-md transition">
      Apply
    </button>

    <button className="h-8 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[10px] font-semibold rounded-md transition">
      Reset
    </button>

  </div>

</div>
  );
}