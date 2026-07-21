import React from 'react';

const selectFilters = [
  { label: 'Legal Group', defaultVal: 'FJ Group (Consolidated)' },
  { label: 'Legal Entity', defaultVal: 'All' },
  { label: 'Parent Division', defaultVal: 'All' },
  { label: 'Sub-Division', defaultVal: 'All' },
  
];

export default function Filters() {
  return (
   <div className="filter-bar">

  {selectFilters.map((f, i) => (
    <div key={i} className="flex-1 min-w-32">

      <label className="block text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
        {f.label}
      </label>

      <select className="filter-select w-full">
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

    <button className="btn btn-primary">
      Apply
    </button>

    <button className="btn btn-ghost">
      Reset
    </button>

  </div>

</div>
  );
}