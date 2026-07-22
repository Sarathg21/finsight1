import React from 'react';
import { useState } from 'react';

const selectFilters = [
  {
    label: "Legal Group",
    key: "legal_groups",
  },
  {
    label: "Legal Entity",
    key: "legal_entities",
  },
  {
    label: "Parent Division",
    key: "parent_divisions",
  },
  {
    label: "Sub-Division",
    key: "subdivisions",
  },
  {
    label: "Currency",
    key: "currencies",
  },
];

export default function Filters({ filterOptions }) {
  const [selectedFilters, setSelectedFilters] = useState({
    legal_group: "",
    legal_entity: "",
    parent_division: "",
    subdivision: "", currencies: "",
  });
  return (
    <div className="filter-bar">

      {selectFilters.map((f, i) => (
        <div key={i} className="flex-1 min-w-32">

          <label className="block text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
            {f.label}
          </label>

          <select
            className="filter-select w-full"
            value={selectedFilters[f.key] || ""}
            onChange={(e) =>
              setSelectedFilters({
                ...selectedFilters,
                [f.key]: e.target.value,
              })
            }
          >
            <option value="">All</option>
            {filterOptions?.[f.key]?.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
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
        <button className="btn btn-primary" onClick={() => onApply(selectedFilters)}>Apply</button>
        <button className="btn btn-ghost">Reset </button>
      </div>
    </div>
  );
}