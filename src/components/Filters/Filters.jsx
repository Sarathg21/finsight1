
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";
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

        fontWeight: 600,
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
========================================================= */

function OpexMultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "All",
  searchable = true,
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
        setSearchTerm("");
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

  useEffect(() => {
    if (open && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [open, searchable]);

  const selectedValues = Array.isArray(value)
    ? value.map(String)
    : [];

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
        item.period_name ??
        item.name ??
        item.currency_code ??
        ""
      );
    }

    return item;
  };

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
        item.period_name ??
        item.currency_code ??
        item.value ??
        item.code ??
        ""
      );
    }

    return item;
  };

  const filteredOptions = options.filter((item) => {
    const label = String(getLabel(item)).toLowerCase();
    const value = String(getValue(item)).toLowerCase();
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      label.includes(search) ||
      value.includes(search)
    );
  });

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

  const handleSelectAll = () => {
    const visibleValues = filteredOptions
      .map(getValue)
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          value !== ""
      )
      .map(String);

    const mergedValues = [
      ...new Set([
        ...selectedValues,
        ...visibleValues,
      ]),
    ];

    onChange(mergedValues);
  };

  const handleClearAll = () => {
    onChange([]);
  };

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
        fontWeight: 600,
      }}
    >
      <button
        type="button"
        className="filter-select w-full"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);

          if (open) {
            setSearchTerm("");
          }
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

          fontWeight: 600,
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
            fontWeight: 600,
          }}
        >
          {getDisplayText()}
        </span>

        <ChevronDown
          size={14}
          strokeWidth={2}
          style={{
            flexShrink: 0,
            marginLeft: "6px",
          }}
        />
      </button>

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
            minWidth: "190px",

            maxHeight: "280px",
            overflowY: "auto",

            backgroundColor: "#ffffff",

            border: "1px solid #d1d5db",
            borderRadius: "6px",

            boxShadow:
              "0 4px 12px rgba(0, 0, 0, 0.12)",

            zIndex: 99999,

            boxSizing: "border-box",

            fontWeight: 600,
          }}
        >
          {searchable && (
            <div
              style={{
                padding: "7px 8px",

                borderBottom:
                  "1px solid #e5e7eb",

                backgroundColor: "#ffffff",

                position: "sticky",
                top: 0,

                zIndex: 4,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <Search
                  size={13}
                  strokeWidth={2}
                  style={{
                    position: "absolute",
                    left: "7px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    color: "#9ca3af",
                    pointerEvents: "none",
                  }}
                />

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  placeholder="Search..."
                  style={{
                    width: "100%",
                    height: "27px",

                    boxSizing: "border-box",

                    border:
                      "1px solid #d1d5db",
                    borderRadius: "4px",

                    paddingLeft: "26px",
                    paddingRight:
                      searchTerm
                        ? "24px"
                        : "7px",

                    outline: "none",

                    fontSize: "10px",
                    color: "#374151",

                    backgroundColor:
                      "#ffffff",

                    fontWeight: 600,
                  }}
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchTerm("")
                    }
                    style={{
                      position:
                        "absolute",
                      right: "5px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",

                      border: "none",
                      background:
                        "transparent",

                      padding: 0,

                      cursor: "pointer",

                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <X
                      size={12}
                      color="#9ca3af"
                    />
                  </button>
                )}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",

              padding: "7px 8px",

              borderBottom:
                "1px solid #e5e7eb",

              backgroundColor:
                "#f9fafb",

              position: "sticky",
              top: searchable
                ? "41px"
                : 0,

              zIndex: 3,
            }}
          >
            <button
              type="button"
              onClick={handleSelectAll}
              style={{
                border: "none",
                background:
                  "transparent",

                padding: 0,

                fontSize: "10px",
                fontWeight: 700,

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
                background:
                  "transparent",

                padding: 0,

                fontSize: "10px",
                fontWeight: 700,

                color: "#6b7280",

                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>

          {filteredOptions.length === 0 ? (
            <div
              style={{
                padding: "10px 8px",
                fontSize: "10px",
                color: "#6b7280",
                fontWeight: 600,
              }}
            >
              {searchTerm
                ? "No matching options"
                : "No options available"}
            </div>
          ) : (
            filteredOptions.map(
              (item, index) => {
                const optionValue =
                  getValue(item);

                const optionLabel =
                  getLabel(item);

                if (
                  optionValue === "" ||
                  optionValue === null ||
                  optionValue ===
                  undefined
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
                      alignItems:
                        "center",

                      gap: "7px",

                      padding: "7px 8px",

                      fontSize: "10px",
                      color: "#374151",

                      cursor: "pointer",

                      whiteSpace:
                        "nowrap",

                      boxSizing:
                        "border-box",

                      fontWeight: 600,
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
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        fontWeight: 600,
                      }}
                    >
                      {optionLabel}
                    </span>
                  </label>
                );
              }
            )
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   OPEX Single Select Dropdown
========================================================= */

function OpexSingleSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Select",
  searchable = true,
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] =
    useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
        setSearchTerm("");
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

  useEffect(() => {
    if (
      open &&
      searchable &&
      searchInputRef.current
    ) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [open, searchable]);

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
        item.year ??
        item.name ??
        item.currency_code ??
        ""
      );
    }

    return item;
  };

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
        item.year ??
        item.currency_code ??
        item.value ??
        item.code ??
        ""
      );
    }

    return item;
  };

  const filteredOptions =
    options.filter((item) => {
      const label = String(
        getLabel(item)
      ).toLowerCase();

      const optionValue = String(
        getValue(item)
      ).toLowerCase();

      const search =
        searchTerm
          .trim()
          .toLowerCase();

      if (!search) {
        return true;
      }

      return (
        label.includes(search) ||
        optionValue.includes(search)
      );
    });

  const selectedOption = options.find(
    (item) =>
      String(getValue(item)) ===
      String(value)
  );

  const displayText = selectedOption
    ? String(getLabel(selectedOption))
    : value
      ? String(value)
      : placeholder;

  const handleChange = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        zIndex: open ? 1000 : 1,
        fontWeight: 600,
      }}
    >
      <button
        type="button"
        className="filter-select w-full"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);

          if (open) {
            setSearchTerm("");
          }
        }}
        style={{
          minWidth: 0,
          width: "100%",
          height: "32px",

          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",

          textAlign: "left",

          paddingLeft: "8px",
          paddingRight: "8px",

          cursor: "pointer",

          overflow: "hidden",

          boxSizing: "border-box",

          position: "relative",
          zIndex: 1001,

          fontWeight: 600,
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow:
              "ellipsis",
            whiteSpace:
              "nowrap",
            minWidth: 0,
            fontWeight: 600,
          }}
        >
          {displayText}
        </span>

        <ChevronDown
          size={14}
          strokeWidth={2}
          style={{
            flexShrink: 0,
            marginLeft: "6px",
          }}
        />
      </button>

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

            maxHeight: "280px",
            overflowY: "auto",

            backgroundColor:
              "#ffffff",

            border:
              "1px solid #d1d5db",
            borderRadius: "6px",

            boxShadow:
              "0 4px 12px rgba(0, 0, 0, 0.12)",

            zIndex: 99999,

            boxSizing:
              "border-box",

            fontWeight: 600,
          }}
        >
          {searchable && (
            <div
              style={{
                padding: "7px 8px",

                borderBottom:
                  "1px solid #e5e7eb",

                backgroundColor:
                  "#ffffff",

                position: "sticky",
                top: 0,

                zIndex: 4,
              }}
            >
              <div
                style={{
                  position:
                    "relative",
                  width: "100%",
                }}
              >
                <Search
                  size={13}
                  strokeWidth={2}
                  style={{
                    position:
                      "absolute",
                    left: "7px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    color:
                      "#9ca3af",
                    pointerEvents:
                      "none",
                  }}
                />

                <input
                  ref={
                    searchInputRef
                  }
                  type="text"
                  value={
                    searchTerm
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchTerm(
                      event.target
                        .value
                    )
                  }
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  placeholder="Search..."
                  style={{
                    width:
                      "100%",
                    height:
                      "27px",

                    boxSizing:
                      "border-box",

                    border:
                      "1px solid #d1d5db",
                    borderRadius:
                      "4px",

                    paddingLeft:
                      "26px",
                    paddingRight:
                      searchTerm
                        ? "24px"
                        : "7px",

                    outline:
                      "none",

                    fontSize:
                      "10px",
                    color:
                      "#374151",

                    backgroundColor:
                      "#ffffff",

                    fontWeight:
                      600,
                  }}
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchTerm(
                        ""
                      )
                    }
                    style={{
                      position:
                        "absolute",
                      right: "5px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",

                      border:
                        "none",
                      background:
                        "transparent",

                      padding: 0,

                      cursor:
                        "pointer",

                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <X
                      size={12}
                      color="#9ca3af"
                    />
                  </button>
                )}
              </div>
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div
              style={{
                padding:
                  "10px 8px",
                fontSize:
                  "10px",
                color:
                  "#6b7280",
                fontWeight: 600,
              }}
            >
              {searchTerm
                ? "No matching options"
                : "No options available"}
            </div>
          ) : (
            filteredOptions.map(
              (item, index) => {
                const optionValue =
                  getValue(item);

                const optionLabel =
                  getLabel(item);

                if (
                  optionValue ===
                  "" ||
                  optionValue ===
                  null ||
                  optionValue ===
                  undefined
                ) {
                  return null;
                }

                const isSelected =
                  String(
                    optionValue
                  ) ===
                  String(value);

                return (
                  <button
                    key={`${optionValue}-${index}`}
                    type="button"
                    onClick={() =>
                      handleChange(
                        String(
                          optionValue
                        )
                      )
                    }
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",

                      width:
                        "100%",

                      padding:
                        "7px 8px",

                      border:
                        "none",

                      backgroundColor:
                        isSelected
                          ? "#eff6ff"
                          : "#ffffff",

                      fontSize:
                        "10px",

                      color:
                        isSelected
                          ? "#1e3a8a"
                          : "#374151",

                      fontWeight:
                        600,

                      cursor:
                        "pointer",

                      textAlign:
                        "left",

                      whiteSpace:
                        "nowrap",

                      boxSizing:
                        "border-box",
                    }}
                  >
                    <span
                      style={{
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        fontWeight:
                          600,
                      }}
                    >
                      {optionLabel}
                    </span>
                  </button>
                );
              }
            )
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   Common Select Filters
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
    label: "Year",
    optionKey: "years",
    apiKey: "year",
    multiSelect: false,
    type: "year",
  },
  {
    label: "Period",
    optionKey: "periods",
    apiKey: "period",
    multiSelect: true,
    type: "period",
  },
  {
    label: "Reporting Currency",
    optionKey: "reporting_currencies",
    apiKey: "reporting_currency",
    multiSelect: false,
    type: "reporting_currency",
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
  year: "",
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
      option.year ??
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
      option.period_name ??
      option.year ??
      option.currency_code ??
      option.value ??
      option.code ??
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
   Normalize Year Options
========================================================= */

function normalizeYears(
  payload = {},
  periods = []
) {
  const rawYears =
    payload?.years ||
    payload?.fiscal_years ||
    payload?.accounting_years ||
    [];

  if (
    Array.isArray(rawYears) &&
    rawYears.length
  ) {
    return rawYears;
  }

  if (Array.isArray(periods)) {
    const derivedYears = [];

    periods.forEach((period) => {
      if (
        period &&
        typeof period === "object"
      ) {
        const year =
          period.year ??
          period.fiscal_year ??
          period.accounting_year ??
          null;

        if (
          year !== null &&
          year !== undefined &&
          year !== ""
        ) {
          if (
            !derivedYears.some(
              (item) =>
                String(
                  getOptionValue(item)
                ) === String(year)
            )
          ) {
            derivedYears.push({
              value: year,
              label: year,
            });
          }
        }
      }
    });

    return derivedYears;
  }

  return [];
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
    Array.isArray(
      reportingCurrencies
    )
      ? reportingCurrencies.map(
        (item) => {
          if (
            typeof item ===
            "object" &&
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

  const periods =
    Array.isArray(
      payload?.periods
    )
      ? payload.periods
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

    periods,

    years: normalizeYears(
      payload,
      periods
    ),

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

  // NEW:
  // Called immediately whenever any filter changes.
  onChange,

  isOperatingExpenses = false,
}) {
  /* =======================================================
     Selected Filters
  ======================================================= */

  const [
    selectedFilters,
    setSelectedFilters,
  ] = useState(() => {
    if (isOperatingExpenses) {
      return {
        ...DEFAULT_FILTERS,

        legal_group: [],
        legal_entity: [],
        parent_division: [],
        subdivision: [],

        period: [],

        year: "",

        reporting_currency:
          "AED",
      };
    }

    return DEFAULT_FILTERS;
  });

  /* =======================================================
     OPEX Filter Options
  ======================================================= */

  const [
    opexFilterOptions,
    setOpexFilterOptions,
  ] = useState({
    legal_groups: [],
    legal_entities: [],
    parent_divisions: [],
    subdivisions: [],

    periods: [],
    years: [],

    currencies: [],
    reporting_currencies: [],
    ledger_currencies: [],
    compare_with: [],

    data_as_of: null,

    default_reporting_currency:
      "AED",
  });

  /* =======================================================
     OPEX Loading
  ======================================================= */

  const [
    opexFilterLoading,
    setOpexFilterLoading,
  ] = useState(false);

  /* =======================================================
     Load OPEX Filter Options
  ======================================================= */

  /* =========================================================
   Load OPEX Filter Options
========================================================= */

  const loadOpexFilterOptions = async (
    currentFilters = {},
    preserveOptionKey = null
  ) => {
    try {
      setOpexFilterLoading(true);

      const apiFilters = {};

      if (
        Array.isArray(currentFilters.legal_group) &&
        currentFilters.legal_group.length
      ) {
        apiFilters.legal_group_id =
          currentFilters.legal_group;
      }

      if (
        Array.isArray(currentFilters.legal_entity) &&
        currentFilters.legal_entity.length
      ) {
        apiFilters.legal_entity_id =
          currentFilters.legal_entity;
      }

      if (
        Array.isArray(currentFilters.parent_division) &&
        currentFilters.parent_division.length
      ) {
        apiFilters.parent_division_id =
          currentFilters.parent_division;
      }

      if (
        Array.isArray(currentFilters.subdivision) &&
        currentFilters.subdivision.length
      ) {
        apiFilters.subdivision_id =
          currentFilters.subdivision;
      }

      const response = await getOpexFilterOptions(
        apiFilters
      );

      const normalized =
        normalizeOpexFilterOptions(
          response || {}
        );

      /*
        IMPORTANT:
        Keep the complete option list for the dropdown
        that the user is currently changing.
  
        Example:
        User selects Alpha Ducts LLC.
        Legal Entity options should still contain
        FJ Industries WLL, Alpha Ducts LLC, etc.
      */
      if (preserveOptionKey) {
        setOpexFilterOptions((previous) => ({
          ...normalized,
          [preserveOptionKey]:
            Array.isArray(
              previous?.[preserveOptionKey]
            )
              ? previous[preserveOptionKey]
              : normalized[preserveOptionKey],
        }));

        return {
          ...normalized,
          [preserveOptionKey]:
            Array.isArray(
              opexFilterOptions?.[preserveOptionKey]
            )
              ? opexFilterOptions[
              preserveOptionKey
              ]
              : normalized[preserveOptionKey],
        };
      }

      setOpexFilterOptions(normalized);

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
      setSelectedFilters(
        (prev) => ({
          ...prev,
          as_on_date:
            dates[0],
        })
      );
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
  }, [
    isOperatingExpenses,
  ]);

  /* =======================================================
     OPEX Default Values
  ======================================================= */

  useEffect(() => {
    if (!isOperatingExpenses) {
      return;
    }

    const periods =
      opexFilterOptions
        ?.periods?.length
        ? opexFilterOptions.periods
        : filterOptions?.periods ||
        [];

    const latestPeriod =
      getLatestPeriod(periods);

    const years =
      opexFilterOptions
        ?.years?.length
        ? opexFilterOptions.years
        : filterOptions?.years ||
        [];

    const firstYear =
      years.length
        ? getOptionValue(
          years[0]
        )
        : "";

    const defaultReportingCurrency =
      opexFilterOptions
        ?.default_reporting_currency ||
      filterOptions
        ?.default_reporting_currency ||
      "AED";

    setSelectedFilters(
      (prev) => ({
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
          Array.isArray(
            prev.period
          )
            ? prev.period.length
              ? prev.period
              : latestPeriod
                ? [
                  String(
                    latestPeriod
                  ),
                ]
                : []
            : prev.period
              ? [
                String(
                  prev.period
                ),
              ]
              : latestPeriod
                ? [
                  String(
                    latestPeriod
                  ),
                ]
                : [],

        year:
          prev.year ||
          firstYear ||
          "",

        reporting_currency:
          prev.reporting_currency ||
          defaultReportingCurrency ||
          "AED",
      })
    );
  }, [
    opexFilterOptions,
    filterOptions,
    isOperatingExpenses,
  ]);

  /* =======================================================
     OPEX Filter Change
  ======================================================= */

  const handleOpexFilterChange =
    async (
      apiKey,
      value
    ) => {
      let nextFilters = {
        ...selectedFilters,
        [apiKey]: value,
      };

      if (
        apiKey ===
        "legal_group"
      ) {
        nextFilters = {
          ...nextFilters,

          legal_group:
            Array.isArray(
              value
            )
              ? value
              : [],

          legal_entity: [],
          parent_division: [],
          subdivision: [],
        };
      }

      if (
        apiKey ===
        "legal_entity"
      ) {
        nextFilters = {
          ...nextFilters,

          legal_entity:
            Array.isArray(
              value
            )
              ? value
              : [],

          parent_division: [],
          subdivision: [],
        };
      }

      if (
        apiKey ===
        "parent_division"
      ) {
        nextFilters = {
          ...nextFilters,

          parent_division:
            Array.isArray(
              value
            )
              ? value
              : [],

          subdivision: [],
        };
      }

      if (
        apiKey ===
        "subdivision"
      ) {
        nextFilters = {
          ...nextFilters,

          subdivision:
            Array.isArray(
              value
            )
              ? value
              : [],
        };
      }

      if (
        apiKey === "period"
      ) {
        nextFilters = {
          ...nextFilters,

          period:
            Array.isArray(
              value
            )
              ? value
              : value
                ? [
                  String(value),
                ]
                : [],
        };
      }

      if (
        apiKey === "year"
      ) {
        nextFilters = {
          ...nextFilters,

          year:
            value === null ||
              value === undefined
              ? ""
              : String(value),
        };
      }

      if (
        apiKey ===
        "reporting_currency"
      ) {
        nextFilters = {
          ...nextFilters,

          reporting_currency:
            value ||
            opexFilterOptions
              ?.default_reporting_currency ||
            "AED",
        };
      }

      /* ===================================================
         UPDATE INTERNAL STATE
      =================================================== */

      setSelectedFilters(
        nextFilters
      );

      /* ===================================================
         NEW onChange CALLBACK

         This fires immediately when the user changes
         a filter. Apply is NOT required for this callback.
      =================================================== */

      if (onChange) {
        onChange(nextFilters);
      }

      /* ===================================================
         Refresh cascading options
      =================================================== */

      if (
        apiKey ===
        "legal_group" ||
        apiKey ===
        "legal_entity" ||
        apiKey ===
        "parent_division" ||
        apiKey ===
        "subdivision"
      ) {
        const optionKeyMap = {
          legal_group: "legal_groups",
          legal_entity: "legal_entities",
          parent_division: "parent_divisions",
          subdivision: "subdivisions",
        };

        await loadOpexFilterOptions(
          nextFilters,
          optionKeyMap[apiKey]
        );
      }
    };

  /* =======================================================
     Reset
  ======================================================= */

  const handleReset =
    async () => {
      let resetFilters = {
        legal_group: "",
        legal_entity: "",
        parent_division: "",
        subdivision: "",
        currency: "",
        as_on_date: "",
        period: "",
        compare_with: "",
        reporting_currency:
          "AED",
        year: "",
      };

      if (
        !isOperatingExpenses
      ) {
        resetFilters = {
          legal_group: "",
          legal_entity: "",
          parent_division:
            "",
          subdivision: "",
          currency: "",
          as_on_date:
            filterOptions
              ?.as_on_dates?.[0] ||
            filterOptions
              ?.available_dates?.[0] ||
            "",
          period: "",
          compare_with: "",
          reporting_currency:
            "AED",
        };
      }

      if (
        isOperatingExpenses
      ) {
        const normalized =
          await loadOpexFilterOptions(
            {}
          );

        const periods =
          normalized?.periods ||
          opexFilterOptions?.periods ||
          filterOptions?.periods ||
          [];

        const years =
          normalized?.years ||
          opexFilterOptions?.years ||
          filterOptions?.years ||
          [];

        const latestPeriod =
          getLatestPeriod(
            periods
          );

        const firstYear =
          years.length
            ? getOptionValue(
              years[0]
            )
            : "";

        resetFilters = {
          legal_group: [],
          legal_entity: [],
          parent_division:
            [],
          subdivision: [],

          currency: "",
          as_on_date: "",

          period:
            latestPeriod
              ? [
                String(
                  latestPeriod
                ),
              ]
              : [],

          year:
            firstYear || "",

          reporting_currency:
            normalized
              ?.default_reporting_currency ||
            opexFilterOptions
              ?.default_reporting_currency ||
            "AED",
        };
      }

      setSelectedFilters(
        resetFilters
      );

      /* NEW:
         Notify parent about reset */
      if (onChange) {
        onChange(resetFilters);
      }

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

        alignItems:
          "flex-end",

        width: "100%",

        minWidth: 0,

        position: "relative",

        zIndex: 10,

        fontWeight: 600,
      }}
    >
      {filtersToDisplay.map(
        (f, i) => {
          const isPeriod =
            isOperatingExpenses &&
            f.apiKey ===
            "period";

          const isYear =
            isOperatingExpenses &&
            f.apiKey ===
            "year";

          const isReportingCurrency =
            isOperatingExpenses &&
            f.apiKey ===
            "reporting_currency";

          const isOpexMultiSelect =
            isOperatingExpenses &&
            f.multiSelect === true;

          const options =
            activeFilterOptions?.[
            f.optionKey
            ] || [];

          return (
            <FilterField
              key={`${f.apiKey}-${i}`}
              label={f.label}
              isOperatingExpenses={
                isOperatingExpenses
              }
            >
              {isOpexMultiSelect ? (
                <OpexMultiSelect
                  options={options}
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
                  onChange={(
                    values
                  ) =>
                    handleOpexFilterChange(
                      f.apiKey,
                      values
                    )
                  }
                  placeholder={
                    isPeriod
                      ? "Select Period"
                      : "All"
                  }
                  searchable={
                    true
                  }
                />
              ) : isYear ? (
                <OpexSingleSelect
                  options={options}
                  value={
                    selectedFilters
                      .year || ""
                  }
                  onChange={(
                    value
                  ) =>
                    handleOpexFilterChange(
                      "year",
                      value
                    )
                  }
                  placeholder="Select Year"
                  searchable={
                    true
                  }
                />
              ) : isReportingCurrency ? (
                <OpexSingleSelect
                  options={
                    options.length
                      ? options
                      : [
                        {
                          value:
                            "AED",
                          label:
                            "AED",
                        },
                      ]
                  }
                  value={
                    selectedFilters
                      .reporting_currency ||
                    opexFilterOptions
                      ?.default_reporting_currency ||
                    "AED"
                  }
                  onChange={(
                    value
                  ) =>
                    handleOpexFilterChange(
                      "reporting_currency",
                      value
                    )
                  }
                  placeholder="Select Currency"
                  searchable={
                    true
                  }
                  required={
                    true
                  }
                />
              ) : (
                <select
                  className="filter-select w-full"
                  value={
                    selectedFilters[
                    f.apiKey
                    ] || ""
                  }
                  onChange={(e) => {
                    const value =
                      e.target
                        .value;

                    if (
                      isOperatingExpenses
                    ) {
                      handleOpexFilterChange(
                        f.apiKey,
                        value
                      );
                    } else {
                      const nextFilters = {
                        ...selectedFilters,
                        [f.apiKey]:
                          value,
                      };

                      setSelectedFilters(
                        nextFilters
                      );

                      /* NEW:
                         Common filter onChange */
                      if (onChange) {
                        onChange(
                          nextFilters
                        );
                      }
                    }
                  }}
                  style={{
                    minWidth: 0,
                    width: "100%",
                    fontWeight: 600,
                  }}
                >
                  {!isPeriod && (
                    <option value="">
                      All
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
                        value ===
                        "" ||
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
                          style={{
                            fontWeight:
                              600,
                          }}
                        >
                          {
                            label
                          }
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

      {!isOperatingExpenses && (
        <FilterField label="As On Date">
          <input
            type="text"
            value={
              selectedFilters
                .as_on_date
            }
            readOnly
            className="w-full h-8 text-[10px] font-semibold text-gray-700 bg-gray-50 border border-gray-300 rounded-md px-2"
          />
        </FilterField>
      )}

      <div
        style={{
          display: "flex",
          gap: "8px",

          marginLeft: "auto",

          flexShrink: 0,

          position: "relative",
          zIndex: 1,

          fontWeight: 600,
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
          style={{
            fontWeight: 700,
          }}
        >
          Apply
        </button>

        <button
          className="btn btn-ghost"
          onClick={
            handleReset
          }
          style={{
            fontWeight: 700,
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}




