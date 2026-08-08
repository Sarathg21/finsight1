// import React from 'react';
// import { useState, useEffect } from 'react';

// const selectFilters = [
//   {
//     label: "Legal Group",
//     optionKey: "legal_groups",
//     apiKey: "legal_group",
//   },
//   {
//     label: "Legal Entity",
//     optionKey: "legal_entities",
//     apiKey: "legal_entity",
//   },
//   {
//     label: "Parent Division",
//     optionKey: "parent_divisions",
//     apiKey: "parent_division",
//   },
//   {
//     label: "Sub-Division",
//     optionKey: "subdivisions",
//     apiKey: "subdivision",
//   },
//   {
//     label: "Currency",
//     optionKey: "currencies",
//     apiKey: "currency",
//   },
// ];

// export default function Filters({ filterOptions, onApply, onReset, }) {
//   const [selectedFilters, setSelectedFilters] = useState({
//     legal_group: "",
//     legal_entity: "",
//     parent_division: "",
//     subdivision: "",
//     currency: "",
//     as_on_date: "",
//   });

//   useEffect(() => {
//     if (filterOptions?.as_on_dates?.length) {
//       setSelectedFilters(prev => ({
//         ...prev,
//         as_on_date: filterOptions.as_on_dates[0]
//       }));
//     }
//   }, [filterOptions]);

//   return (
//     <div className="filter-bar">

//       {selectFilters.map((f, i) => (
//         <div key={i} className="flex-1 min-w-32">

//           <label className="block text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
//             {f.label}
//           </label>

//           <select
//             className="filter-select w-full"
//             value={selectedFilters[f.apiKey] || ""}
//             onChange={(e) =>
//               setSelectedFilters(prev => ({
//                 ...prev,
//                 [f.apiKey]: e.target.value
//               }))
//             }
//           >
//             <option value="">All</option>
//             {filterOptions?.[f.optionKey]?.map((item) => (
//               <option key={item} value={item}>
//                 {item}
//               </option>
//             ))}
//           </select>

//         </div>
//       ))}

//       {/* DATE */}
//       <div className="flex-1 min-w-32">
//         <label className="block text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
//           As On Date
//         </label>

//         <input
//           type="text"
//           value={selectedFilters.as_on_date}
//           readOnly
//           className="w-full h-8 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md px-2"
//         />
//       </div>

//       {/* BUTTONS */}
//       <div className="flex gap-1.5 shrink-0 ml-auto w-full sm:w-auto">
//         <button className="btn btn-primary" onClick={() => onApply(selectedFilters)}>Apply</button>
//         <button className="btn btn-ghost" onClick={() => {
//           const resetFilters = {
//             legal_group: "",
//             legal_entity: "",
//             parent_division: "",
//             subdivision: "",
//             currency: "",
//             as_on_date: "",
//           };
//           setSelectedFilters(resetFilters);
//           if (onReset) { onReset(); }
//         }}>Reset</button>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";

/* ---------- Reusable Filter Field ---------- */
function FilterField({ label, children }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: 110,
        flex: "1 1 auto",
      }}
    >
      <span
        style={{
          fontSize: "0.66rem",
          color: "#1e3a8a",
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </span>

      {children}
    </div>
  );
}

/* ---------- Filter Configuration ---------- */
const selectFilters = [
  {
    label: "Legal Group",
    optionKey: "legal_groups",
    apiKey: "legal_group",
  },
  {
    label: "Legal Entity",
    optionKey: "legal_entities",
    apiKey: "legal_entity",
  },
  {
    label: "Parent Division",
    optionKey: "parent_divisions",
    apiKey: "parent_division",
  },
  {
    label: "Sub-Division",
    optionKey: "subdivisions",
    apiKey: "subdivision",
  },
  {
    label: "Currency",
    optionKey: "currencies",
    apiKey: "currency",
  },
];

export default function Filters({
  filterOptions,
  onApply,
  onReset,
}) {
  const [selectedFilters, setSelectedFilters] = useState({
    legal_group: "",
    legal_entity: "",
    parent_division: "",
    subdivision: "",
    currency: "",
    as_on_date: "",
  });

  useEffect(() => {

    const dates =
      filterOptions?.available_dates ||
      filterOptions?.as_on_dates ||
      [];


    if (dates.length) {
      setSelectedFilters((prev) => ({
        ...prev,
        as_on_date: dates[0],
      }));
    }

  }, [filterOptions]);

  const handleReset = () => {
    const resetFilters = {
      legal_group: "",
      legal_entity: "",
      parent_division: "",
      subdivision: "",
      currency: "",
      as_on_date:
        filterOptions?.as_on_dates?.[0] ||
        filterOptions?.available_dates?.[0] ||
        "",
    };

    setSelectedFilters(resetFilters);

    if (onReset) {
      onReset();
    }
  };

  return (
    <div
      className="filter-bar"
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        alignItems: "flex-end",
      }}
    >
      {/* Dynamic Filters */}
      {selectFilters.map((f, i) => (
        <FilterField
          key={i}
          label={f.label}
        >
          <select
            className="filter-select w-full"
            value={selectedFilters[f.apiKey] || ""}
            onChange={(e) =>
              setSelectedFilters((prev) => ({
                ...prev,
                [f.apiKey]: e.target.value,
              }))
            }
          >
            <option value="">All</option>

            {filterOptions?.[f.optionKey]?.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>
        </FilterField>
      ))}

      {/* As On Date */}
      <FilterField label="As On Date">
        <input
          type="text"
          value={selectedFilters.as_on_date}
          readOnly
          className="w-full h-8 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md px-2"
        />
      </FilterField>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginLeft: "auto",
        }}
      >
        <button
          className="btn btn-primary"
          onClick={() => onApply(selectedFilters)}
        >
          Apply
        </button>

        <button
          className="btn btn-ghost"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}