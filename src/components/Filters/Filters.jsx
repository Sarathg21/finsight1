// import React from 'react';

// const selectFilters = [
//   { label: 'Legal Group', defaultVal: 'FJ Group (Consolidated)' },
//   { label: 'Legal Entity', defaultVal: 'All' },
//   { label: 'Parent Division', defaultVal: 'All' },
//   { label: 'Sub-Division', defaultVal: 'All' },

// ];

// export default function Filters() {
//   return (
//    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm flex flex-wrap items-end gap-2">

//   {selectFilters.map((f, i) => (
//     <div key={i} className="flex-1 min-w-32">

//       <label className="block text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
//         {f.label}
//       </label>

//       <select className="w-full h-8 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md px-2 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
//         <option>{f.defaultVal}</option>
//       </select>

//     </div>
//   ))}

//   {/* DATE */}
//   <div className="flex-1 min-w-32">
//     <label className="block text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
//       As On Date
//     </label>

//     <input
//       type="text"
//       defaultValue="30 Apr 2024"
//       className="w-full h-8 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md px-2 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
//     />
//   </div>

//   {/* BUTTONS */}
//   <div className="flex gap-1.5 shrink-0 ml-auto w-full sm:w-auto">

//     <button className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold rounded-md transition">
//       Apply
//     </button>

//     <button className="h-8 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[10px] font-semibold rounded-md transition">
//       Reset
//     </button>

//   </div>

// </div>
//   );
// }
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { getOpexFilterOptions } from "../../api/opexApi";

/* =========================================================
   Reusable Filter Field
========================================================= */

function FilterField({
  label,
  children,
  isOperatingExpenses = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,

        minWidth: isOperatingExpenses ? 0 : 110,

        flex: isOperatingExpenses
          ? "1 1 0"
          : "1 1 auto",

        overflow: isOperatingExpenses
          ? "visible"
          : "hidden",

        position: "relative",
        zIndex: isOperatingExpenses ? 20 : "auto",
      }}
    >
      <span
        style={{
          fontSize: "0.66rem",
          color: "#1e3a8a",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>

      {children}
    </div>
  );
}

/* =========================================================
   OPEX Multi Select Dropdown

   ONLY used for OPEX hierarchy filters.
========================================================= */

function OpexMultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "All",
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  /* =======================================================
     Close dropdown when clicking outside
  ======================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =======================================================
     Normalize selected values
  ======================================================= */

  const selectedValues = Array.isArray(value)
    ? value.map(String)
    : [];

  /* =======================================================
     Get option value
  ======================================================= */

  const getValue = (item) => {
    if (
      item === null ||
      item === undefined
    ) {
      return "";
    }

    if (typeof item === "object") {
      return (
        item.value ??
        item.id ??
        item.code ??
        item.name ??
        ""
      );
    }

    return item;
  };

  /* =======================================================
     Get option label
  ======================================================= */

  const getLabel = (item) => {
    if (
      item === null ||
      item === undefined
    ) {
      return "";
    }

    if (typeof item === "object") {
      return (
        item.label ??
        item.name ??
        item.currency_code ??
        item.value ??
        item.code ??
        ""
      );
    }

    return item;
  };

  /* =======================================================
     Toggle option
  ======================================================= */

  const handleOptionToggle = (optionValue) => {
    const stringValue = String(optionValue);

    const exists =
      selectedValues.includes(stringValue);

    const nextValues = exists
      ? selectedValues.filter(
          (item) => item !== stringValue
        )
      : [
          ...selectedValues,
          stringValue,
        ];

    onChange(nextValues);
  };

  /* =======================================================
     Select All
  ======================================================= */

  const handleSelectAll = () => {
    const allValues = options
      .map(getValue)
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          value !== ""
      )
      .map(String);

    onChange(allValues);
  };

  /* =======================================================
     Clear All
  ======================================================= */

  const handleClearAll = () => {
    onChange([]);
  };

  /* =======================================================
     Display text
  ======================================================= */

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }

    if (selectedValues.length === 1) {
      const selected = options.find(
        (item) =>
          String(getValue(item)) ===
          selectedValues[0]
      );

      return selected
        ? String(getLabel(selected))
        : selectedValues[0];
    }

    return `${selectedValues.length} selected`;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        zIndex: open ? 1000 : 1,
      }}
    >
      {/* =================================================
          Dropdown Trigger
      ================================================= */}

      <button
        type="button"
        className="filter-select w-full"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        style={{
          minWidth: 0,
          width: "100%",
          height: "32px",

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          textAlign: "left",

          paddingLeft: "8px",
          paddingRight: "8px",

          cursor: "pointer",

          overflow: "hidden",

          boxSizing: "border-box",

          position: "relative",
          zIndex: 1001,
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {getDisplayText()}
        </span>

        {/* =================================================
            ONLY CHANGE:
            Replaced â–¾ with ChevronDown
        ================================================= */}

        <ChevronDown
          size={14}
          strokeWidth={2}
          style={{
            flexShrink: 0,
            marginLeft: "6px",
          }}
        />
      </button>

      {/* =================================================
          Dropdown Menu
      ================================================= */}

      {open && (
        <div
          onClick={(event) =>
            event.stopPropagation()
          }
          style={{
            position: "absolute",

            top: "calc(100% + 4px)",
            left: 0,

            width: "100%",
            minWidth: "180px",

            maxHeight: "240px",
            overflowY: "auto",

            backgroundColor: "#ffffff",

            border: "1px solid #d1d5db",
            borderRadius: "6px",

            boxShadow:
              "0 4px 12px rgba(0, 0, 0, 0.12)",

            zIndex: 99999,

            boxSizing: "border-box",
          }}
        >
          {/* =================================================
              Select All / Clear
          ================================================= */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",

              padding: "7px 8px",

              borderBottom:
                "1px solid #e5e7eb",

              backgroundColor: "#f9fafb",

              position: "sticky",
              top: 0,

              zIndex: 2,
            }}
          >
            <button
              type="button"
              onClick={handleSelectAll}
              style={{
                border: "none",
                background: "transparent",

                padding: 0,

                fontSize: "10px",
                fontWeight: 600,

                color: "#1e3a8a",

                cursor: "pointer",
              }}
            >
              Select All
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              style={{
                border: "none",
                background: "transparent",

                padding: 0,

                fontSize: "10px",
                fontWeight: 600,

                color: "#6b7280",

                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>

          {/* =================================================
              Options
          ================================================= */}

          {options.length === 0 ? (
            <div
              style={{
                padding: "10px 8px",
                fontSize: "10px",
                color: "#6b7280",
              }}
            >
              No options available
            </div>
          ) : (
            options.map((item, index) => {
              const optionValue =
                getValue(item);

              const optionLabel =
                getLabel(item);

              if (
                optionValue === "" ||
                optionValue === null ||
                optionValue === undefined
              ) {
                return null;
              }

              const stringValue =
                String(optionValue);

              const checked =
                selectedValues.includes(
                  stringValue
                );

              return (
                <label
                  key={`${stringValue}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",

                    gap: "7px",

                    padding: "7px 8px",

                    fontSize: "10px",
                    color: "#374151",

                    cursor: "pointer",

                    whiteSpace: "nowrap",

                    boxSizing: "border-box",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      handleOptionToggle(
                        stringValue
                      )
                    }
                    style={{
                      width: "12px",
                      height: "12px",

                      margin: 0,

                      flexShrink: 0,

                      cursor: "pointer",
                    }}
                  />

                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow:
                        "ellipsis",
                    }}
                  >
                    {optionLabel}
                  </span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   Common Select Filters

   DO NOT CHANGE
========================================================= */

const commonSelectFilters = [
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

/* =========================================================
   Operating Expenses Filters
========================================================= */

const operatingSelectFilters = [
  {
    label: "Legal Group",
    optionKey: "legal_groups",
    apiKey: "legal_group",
    multiSelect: true,
  },
  {
    label: "Legal Entity",
    optionKey: "legal_entities",
    apiKey: "legal_entity",
    multiSelect: true,
  },
  {
    label: "Parent Division",
    optionKey: "parent_divisions",
    apiKey: "parent_division",
    multiSelect: true,
  },
  {
    label: "Sub-Division",
    optionKey: "subdivisions",
    apiKey: "subdivision",
    multiSelect: true,
  },
];

/* =========================================================
   Operating Expenses Additional Filters
========================================================= */

const operatingAdditionalFilters = [
  {
    label: "Period",
    optionKey: "periods",
    apiKey: "period",
    multiSelect: false,
  },
  {
    label: "Compare With",
    optionKey: "compare_with",
    apiKey: "compare_with",
    multiSelect: false,
  },
  {
    label: "Reporting Currency",
    optionKey: "currencies",
    apiKey: "reporting_currency",
    multiSelect: false,
  },
];

/* =========================================================
   Default State
========================================================= */

const DEFAULT_FILTERS = {
  legal_group: "",
  legal_entity: "",
  parent_division: "",
  subdivision: "",
  currency: "",
  as_on_date: "",
  period: "",
  compare_with: "",
  reporting_currency: "AED",
};

/* =========================================================
   Helper
========================================================= */

function getOptionValue(option) {
  if (
    option === null ||
    option === undefined
  ) {
    return "";
  }

  if (typeof option === "object") {
    return (
      option.value ??
      option.id ??
      option.code ??
      option.period_name ??
      option.name ??
      option.currency_code ??
      ""
    );
  }

  return option;
}

/* =========================================================
   Helper
========================================================= */

function getOptionLabel(option) {
  if (
    option === null ||
    option === undefined
  ) {
    return "";
  }

  if (typeof option === "object") {
    return (
      option.label ??
      option.name ??
      option.currency_code ??
      option.value ??
      option.code ??
      option.period_name ??
      ""
    );
  }

  return option;
}

/* =========================================================
   Get Latest Period
========================================================= */

function getLatestPeriod(periods = []) {
  if (
    !Array.isArray(periods) ||
    periods.length === 0
  ) {
    return "";
  }

  const latest =
    periods[periods.length - 1];

  return getOptionValue(latest);
}

/* =========================================================
   Normalize OPEX filter-options response
========================================================= */

function normalizeOpexFilterOptions(
  data = {}
) {
  const payload =
    data?.data &&
    typeof data.data === "object" &&
    !Array.isArray(data.data)
      ? data.data
      : data;

  const reportingCurrencies =
    payload?.reporting_currencies ||
    payload?.currencies ||
    [];

  const currencies =
    Array.isArray(reportingCurrencies)
      ? reportingCurrencies.map(
          (item) => {
            if (
              typeof item === "object" &&
              item !== null
            ) {
              const value =
                item.currency_code ??
                item.value ??
                item.code ??
                item.id ??
                "";

              const label =
                item.label ??
                item.currency_code ??
                item.value ??
                item.code ??
                "";

              return {
                value,
                label,
              };
            }

            return {
              value: item,
              label: item,
            };
          }
        )
      : [];

  return {
    legal_groups:
      Array.isArray(
        payload?.legal_groups
      )
        ? payload.legal_groups
        : [],

    legal_entities:
      Array.isArray(
        payload?.legal_entities
      )
        ? payload.legal_entities
        : [],

    parent_divisions:
      Array.isArray(
        payload?.parent_divisions
      )
        ? payload.parent_divisions
        : [],

    subdivisions:
      Array.isArray(
        payload?.subdivisions
      )
        ? payload.subdivisions
        : [],

    periods:
      Array.isArray(
        payload?.periods
      )
        ? payload.periods
        : [],

    currencies,

    ledger_currencies:
      Array.isArray(
        payload?.ledger_currencies
      )
        ? payload.ledger_currencies
        : [],

    reporting_currencies:
      Array.isArray(
        payload?.reporting_currencies
      )
        ? payload.reporting_currencies
        : Array.isArray(
            payload?.currencies
          )
        ? payload.currencies
        : [],

    compare_with:
      Array.isArray(
        payload?.compare_with
      )
        ? payload.compare_with
        : Array.isArray(
            payload?.compare_periods
          )
        ? payload.compare_periods
        : [],

    data_as_of:
      payload?.data_as_of || null,

    default_reporting_currency:
      payload?.default_reporting_currency ||
      "AED",
  };
}

/* =========================================================
   Filters Component
========================================================= */

export default function Filters({
  filterOptions,
  onApply,
  onReset,
  isOperatingExpenses = false,
}) {
  /* =======================================================
     Selected Filters

     Common pages = strings
     OPEX hierarchy = arrays
  ======================================================= */

  const [selectedFilters, setSelectedFilters] =
    useState(() => {
      if (isOperatingExpenses) {
        return {
          ...DEFAULT_FILTERS,

          legal_group: [],
          legal_entity: [],
          parent_division: [],
          subdivision: [],
        };
      }

      return DEFAULT_FILTERS;
    });

  /* =======================================================
     OPEX Filter Options
  ======================================================= */

  const [opexFilterOptions, setOpexFilterOptions] =
    useState({
      legal_groups: [],
      legal_entities: [],
      parent_divisions: [],
      subdivisions: [],
      periods: [],
      currencies: [],
      reporting_currencies: [],
      ledger_currencies: [],
      compare_with: [],
      data_as_of: null,
      default_reporting_currency: "AED",
    });

  /* =======================================================
     OPEX Loading
  ======================================================= */

  const [opexFilterLoading, setOpexFilterLoading] =
    useState(false);
  /* ====================================================
     Auto-apply once after defaults are loaded
  ==================================================== */
  const autoApplied = React.useRef(false);

  /* =======================================================
     Load OPEX Filter Options
  ======================================================= */

  const loadOpexFilterOptions = async (
    currentFilters = {}
  ) => {
    try {
      setOpexFilterLoading(true);

      const apiFilters = {};

      /* ===================================================
         Legal Group
      =================================================== */

      if (
        Array.isArray(
          currentFilters.legal_group
        ) &&
        currentFilters.legal_group.length
      ) {
        apiFilters.legal_group_id =
          currentFilters.legal_group;
      }

      /* ===================================================
         Legal Entity
      =================================================== */

      if (
        Array.isArray(
          currentFilters.legal_entity
        ) &&
        currentFilters.legal_entity.length
      ) {
        apiFilters.legal_entity_id =
          currentFilters.legal_entity;
      }

      /* ===================================================
         Parent Division
      =================================================== */

      if (
        Array.isArray(
          currentFilters.parent_division
        ) &&
        currentFilters.parent_division.length
      ) {
        apiFilters.parent_division_id =
          currentFilters.parent_division;
      }

      /* ===================================================
         Sub-Division
      =================================================== */

      if (
        Array.isArray(
          currentFilters.subdivision
        ) &&
        currentFilters.subdivision.length
      ) {
        apiFilters.subdivision_id =
          currentFilters.subdivision;
      }

      const response =
        await getOpexFilterOptions(
          apiFilters
        );

      const normalized =
        normalizeOpexFilterOptions(
          response || {}
        );

      setOpexFilterOptions(
        normalized
      );

      return normalized;
    } catch (error) {
      console.error(
        "Failed to load OPEX filter options:",
        error
      );

      return null;
    } finally {
      setOpexFilterLoading(false);
    }
  };

  /* =======================================================
     Common Page Date Handling

     UNCHANGED
  ======================================================= */

  useEffect(() => {
    if (isOperatingExpenses) {
      return;
    }

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
  }, [
    filterOptions,
    isOperatingExpenses,
  ]);

  /* =======================================================
     Initial OPEX Options
  ======================================================= */

  useEffect(() => {
    if (!isOperatingExpenses) {
      return;
    }

    loadOpexFilterOptions({});
  }, [isOperatingExpenses]);

  /* =======================================================
     OPEX Default Values
  ======================================================= */

  useEffect(() => {
    if (!isOperatingExpenses) {
      return;
    }

    const periods =
      opexFilterOptions?.periods?.length
        ? opexFilterOptions.periods
        : filterOptions?.periods || [];

    const latestPeriod =
      getLatestPeriod(periods);

    const compareOptions =
      opexFilterOptions
        ?.compare_with?.length
        ? opexFilterOptions.compare_with
        : filterOptions?.compare_with || [];

    const firstCompareWith =
      compareOptions[0];

    const compareWithValue =
      getOptionValue(
        firstCompareWith
      );

    const defaultReportingCurrency =
      opexFilterOptions
        ?.default_reporting_currency ||
      filterOptions
        ?.default_reporting_currency ||
      "AED";

    setSelectedFilters((prev) => ({
      ...prev,

      legal_group:
        Array.isArray(
          prev.legal_group
        )
          ? prev.legal_group
          : [],

      legal_entity:
        Array.isArray(
          prev.legal_entity
        )
          ? prev.legal_entity
          : [],

      parent_division:
        Array.isArray(
          prev.parent_division
        )
          ? prev.parent_division
          : [],

      subdivision:
        Array.isArray(
          prev.subdivision
        )
          ? prev.subdivision
          : [],

      period:
        prev.period ||
        latestPeriod ||
        "",

      compare_with:
        prev.compare_with ||
        compareWithValue ||
        "",

      reporting_currency:
        prev.reporting_currency ||
        defaultReportingCurrency ||
        "AED",
    }));
  }, [
    opexFilterOptions,
    filterOptions,
    isOperatingExpenses,
  ]);

  /* =======================================================
     OPEX Filter Change
  ======================================================= */

  const handleOpexFilterChange = async (
    apiKey,
    value
  ) => {
    let nextFilters = {
      ...selectedFilters,
      [apiKey]: value,
    };

    /* ===================================================
       Legal Group
    =================================================== */

    if (apiKey === "legal_group") {
      nextFilters = {
        ...nextFilters,

        legal_group:
          Array.isArray(value)
            ? value
            : [],

        legal_entity: [],
        parent_division: [],
        subdivision: [],
      };
    }

    /* ===================================================
       Legal Entity
    =================================================== */

    if (apiKey === "legal_entity") {
      nextFilters = {
        ...nextFilters,

        legal_entity:
          Array.isArray(value)
            ? value
            : [],

        parent_division: [],
        subdivision: [],
      };
    }

    /* ===================================================
       Parent Division
    =================================================== */

    if (
      apiKey ===
      "parent_division"
    ) {
      nextFilters = {
        ...nextFilters,

        parent_division:
          Array.isArray(value)
            ? value
            : [],

        subdivision: [],
      };
    }

    /* ===================================================
       Sub-Division
    =================================================== */

    if (
      apiKey ===
      "subdivision"
    ) {
      nextFilters = {
        ...nextFilters,

        subdivision:
          Array.isArray(value)
            ? value
            : [],
      };
    }

    setSelectedFilters(
      nextFilters
    );

    /* ===================================================
       Refresh cascading options
    =================================================== */

    if (
      apiKey === "legal_group" ||
      apiKey === "legal_entity" ||
      apiKey === "parent_division" ||
      apiKey === "subdivision"
    ) {
      await loadOpexFilterOptions(
        nextFilters
      );
    }
  };

  /* =======================================================
     Reset
  ======================================================= */

  const handleReset = async () => {
    let resetFilters = {
      legal_group: "",
      legal_entity: "",
      parent_division: "",
      subdivision: "",
      currency: "",
      as_on_date: "",
      period: "",
      compare_with: "",
      reporting_currency: "AED",
    };

    /* ===================================================
       Existing/Common Pages

       UNCHANGED
    =================================================== */

    if (!isOperatingExpenses) {
      resetFilters = {
        legal_group: "",
        legal_entity: "",
        parent_division: "",
        subdivision: "",
        currency: "",
        as_on_date:
          filterOptions?.as_on_dates?.[0] ||
          filterOptions?.available_dates?.[0] ||
          "",
        period: "",
        compare_with: "",
        reporting_currency: "AED",
      };
    }

    /* ===================================================
       OPEX Reset
    =================================================== */

    if (isOperatingExpenses) {
      const normalized =
        await loadOpexFilterOptions(
          {}
        );

      const periods =
        normalized?.periods ||
        opexFilterOptions?.periods ||
        filterOptions?.periods ||
        [];

      const latestPeriod =
        getLatestPeriod(
          periods
        );

      resetFilters = {
        legal_group: [],
        legal_entity: [],
        parent_division: [],
        subdivision: [],

        currency: "",
        as_on_date: "",

        period:
          latestPeriod || "",

        compare_with: "",

        reporting_currency:
          normalized
            ?.default_reporting_currency ||
          "AED",
      };
    }

    setSelectedFilters(
      resetFilters
    );

    if (onReset) {
      onReset();
    }
  };

  /* =======================================================
     Filters To Display
  ======================================================= */

  const filtersToDisplay =
    isOperatingExpenses
      ? [
          ...operatingSelectFilters,
          ...operatingAdditionalFilters,
        ]
      : commonSelectFilters;

  /* =======================================================
     Active Filter Options
  ======================================================= */

  const activeFilterOptions =
    isOperatingExpenses
      ? {
          ...filterOptions,
          ...opexFilterOptions,
        }
      : filterOptions;

  /* =======================================================
     Render
  ======================================================= */

  return (
    <div
      className="filter-bar"
      style={{
        display: "flex",
        gap: "10px",

        flexWrap:
          isOperatingExpenses
            ? "nowrap"
            : "wrap",

        alignItems: "flex-end",

        width: "100%",

        minWidth: 0,

        position: "relative",

        zIndex: 10,
      }}
    >
      {/* ===================================================
          Dynamic Filters
      =================================================== */}

      {filtersToDisplay.map(
        (f, i) => {
          const isPeriod =
            isOperatingExpenses &&
            f.apiKey ===
              "period";

          const isReportingCurrency =
            isOperatingExpenses &&
            f.apiKey ===
              "reporting_currency";

          const isOpexMultiSelect =
            isOperatingExpenses &&
            f.multiSelect === true;

          return (
            <FilterField
              key={`${f.apiKey}-${i}`}
              label={f.label}
              isOperatingExpenses={
                isOperatingExpenses
              }
            >
              {/* =================================================
                  OPEX MULTI SELECT
              ================================================= */}

              {isOpexMultiSelect ? (
                <OpexMultiSelect
                  options={
                    activeFilterOptions?.[
                      f.optionKey
                    ] || []
                  }
                  value={
                    Array.isArray(
                      selectedFilters[
                        f.apiKey
                      ]
                    )
                      ? selectedFilters[
                          f.apiKey
                        ]
                      : []
                  }
                  onChange={(values) =>
                    handleOpexFilterChange(
                      f.apiKey,
                      values
                    )
                  }
                />
              ) : (
                /* ===============================================
                   ORIGINAL SINGLE SELECT
                =============================================== */

                <select
                  className="filter-select w-full"
                  value={
                    selectedFilters[
                      f.apiKey
                    ] || ""
                  }
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    if (
                      isOperatingExpenses
                    ) {
                      handleOpexFilterChange(
                        f.apiKey,
                        value
                      );
                    } else {
                      setSelectedFilters(
                        (prev) => ({
                          ...prev,
                          [f.apiKey]:
                            value,
                        })
                      );
                    }
                  }}
                  style={{
                    minWidth: 0,
                    width: "100%",
                  }}
                >
                  {!isPeriod && (
                    <option value="">
                      All
                    </option>
                  )}

                  {isReportingCurrency &&
                    !activeFilterOptions
                      ?.currencies
                      ?.length && (
                      <option value="AED">
                        AED
                      </option>
                    )}

                  {activeFilterOptions?.[
                    f.optionKey
                  ]?.map(
                    (
                      item,
                      index
                    ) => {
                      const value =
                        getOptionValue(
                          item
                        );

                      const label =
                        getOptionLabel(
                          item
                        );

                      if (
                        value === "" ||
                        value ===
                          null ||
                        value ===
                          undefined
                      ) {
                        return null;
                      }

                      return (
                        <option
                          key={`${value}-${index}`}
                          value={value}
                        >
                          {label}
                        </option>
                      );
                    }
                  )}
                </select>
              )}
            </FilterField>
          );
        }
      )}

      {/* ===================================================
          Existing Common Page As On Date

          OPEX does NOT render this.
      =================================================== */}

      {!isOperatingExpenses && (
        <FilterField label="As On Date">
          <input
            type="text"
            value={
              selectedFilters.as_on_date
            }
            readOnly
            className="w-full h-8 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md px-2"
          />
        </FilterField>
      )}

      {/* ===================================================
          Buttons
      =================================================== */}

      <div
        style={{
          display: "flex",
          gap: "8px",

          marginLeft: "auto",

          flexShrink: 0,

          position: "relative",
          zIndex: 1,
        }}
      >
        <button
          className="btn btn-primary"
          onClick={() =>
            onApply &&
            onApply(
              selectedFilters
            )
          }
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
