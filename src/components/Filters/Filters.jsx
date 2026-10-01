

import React, { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { getOpexFilterOptions } from "../../api/opexApi";

/* =========================================================
   SALES REVENUE STYLE — OPEX FILTERS ONLY

   This component intentionally contains only OPEX behaviour.
   It does not modify the existing Common / Receivables filter
   component or its handlers.
========================================================= */

const DEFAULT_FILTERS = {
  legal_group: [],
  legal_entity: [],
  parent_division: [],
  subdivision: [],
  currency: "",
  as_on_date: "",
  period: [],
  compare_with: "",
  reporting_currency: "AED",
  year: "",
};

/* =========================================================
   Filter widths
========================================================= */

const FIELD_WIDTHS = {
  legal_group: 128,
  legal_entity: 128,
  parent_division: 128,
  subdivision: 128,
  year: 128,
  period: 128,
  reporting_currency: 128,
};

/* =========================================================
   OPTION HELPERS
========================================================= */

const getOptionValue = (option) => {
  if (option === null || option === undefined) {
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
};

const getOptionLabel = (option) => {
  if (option === null || option === undefined) {
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
};

/* =========================================================
   GET LATEST PERIOD

   Operating Analysis uses the last period returned by the API
   as the default selected Period.
========================================================= */

function getLatestPeriod(periods = []) {
  if (!Array.isArray(periods) || periods.length === 0) {
    return "";
  }

  return getOptionValue(periods[periods.length - 1]);
}

/* =========================================================
   NORMALIZE YEARS
========================================================= */

function normalizeYears(payload = {}, periods = []) {
  const rawYears =
    payload?.years ||
    payload?.fiscal_years ||
    payload?.accounting_years ||
    [];

  if (Array.isArray(rawYears) && rawYears.length) {
    return rawYears;
  }

  const derived = [];

  if (Array.isArray(periods)) {
    periods.forEach((period) => {
      if (!period || typeof period !== "object") {
        return;
      }

      const year =
        period.year ??
        period.fiscal_year ??
        period.accounting_year ??
        null;

      if (
        year === null ||
        year === undefined ||
        year === ""
      ) {
        return;
      }

      if (
        !derived.some(
          (item) =>
            String(getOptionValue(item)) ===
            String(year)
        )
      ) {
        derived.push({
          value: year,
          label: year,
        });
      }
    });
  }

  return derived;
}

/* =========================================================
   NORMALIZE REPORTING CURRENCIES

   Supports common API response formats:
   - reporting_currencies: [...]
   - currencies: [...]
   - currency_options: [...]
   - ledger_currencies: [...]
   - reporting_currency: "AED"
   - reporting_currency: { value: "AED", label: "AED" }
   - object maps such as { AED: "AED", USD: "USD" }
========================================================= */

function normalizeCurrencyOptions(rawCurrencies) {
  if (
    rawCurrencies === null ||
    rawCurrencies === undefined ||
    rawCurrencies === ""
  ) {
    return [];
  }

  /* -------------------------------------------------------
     String / number
  ------------------------------------------------------- */

  if (
    typeof rawCurrencies === "string" ||
    typeof rawCurrencies === "number"
  ) {
    const value = String(rawCurrencies);

    return [
      {
        value,
        label: value,
      },
    ];
  }

  /* -------------------------------------------------------
     Array
  ------------------------------------------------------- */

  if (Array.isArray(rawCurrencies)) {
    return rawCurrencies
      .map((item) => {
        if (
          item === null ||
          item === undefined ||
          item === ""
        ) {
          return null;
        }

        if (
          typeof item === "string" ||
          typeof item === "number"
        ) {
          const value = String(item);

          return {
            value,
            label: value,
          };
        }

        if (typeof item === "object") {
          const value =
            item.currency_code ??
            item.currencyCode ??
            item.currency ??
            item.value ??
            item.code ??
            item.id ??
            "";

          const label =
            item.label ??
            item.name ??
            item.currency_name ??
            item.currency_code ??
            item.currencyCode ??
            item.currency ??
            item.value ??
            item.code ??
            value;

          if (
            value === null ||
            value === undefined ||
            value === ""
          ) {
            return null;
          }

          return {
            value: String(value),
            label: String(label),
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  /* -------------------------------------------------------
     Single object:
       { value: "AED", label: "AED" }
       { currency_code: "AED" }
  ------------------------------------------------------- */

  if (
    typeof rawCurrencies === "object"
  ) {
    const directValue =
      rawCurrencies.currency_code ??
      rawCurrencies.currencyCode ??
      rawCurrencies.currency ??
      rawCurrencies.value ??
      rawCurrencies.code ??
      rawCurrencies.id;

    if (
      directValue !== null &&
      directValue !== undefined &&
      directValue !== ""
    ) {
      const value = String(directValue);

      const label =
        rawCurrencies.label ??
        rawCurrencies.name ??
        rawCurrencies.currency_name ??
        rawCurrencies.currency_code ??
        rawCurrencies.currencyCode ??
        rawCurrencies.currency ??
        rawCurrencies.value ??
        rawCurrencies.code ??
        value;

      return [
        {
          value,
          label: String(label),
        },
      ];
    }

    /* -----------------------------------------------------
       Object map:
       {
         AED: "AED",
         USD: "USD"
       }
    ----------------------------------------------------- */

    return Object.entries(rawCurrencies)
      .map(([key, item]) => {
        if (
          item === null ||
          item === undefined ||
          item === ""
        ) {
          return {
            value: String(key),
            label: String(key),
          };
        }

        if (
          typeof item === "string" ||
          typeof item === "number"
        ) {
          return {
            value: String(item),
            label: String(item),
          };
        }

        if (typeof item === "object") {
          const value =
            item.currency_code ??
            item.currencyCode ??
            item.currency ??
            item.value ??
            item.code ??
            key;

          const label =
            item.label ??
            item.name ??
            item.currency_name ??
            item.currency_code ??
            item.currencyCode ??
            item.currency ??
            item.value ??
            item.code ??
            value;

          return {
            value: String(value),
            label: String(label),
          };
        }

        return {
          value: String(key),
          label: String(key),
        };
      })
      .filter(
        (item) =>
          item.value !== ""
      );
  }

  return [];
}

/* =========================================================
   NORMALIZE OPEX FILTER OPTIONS
========================================================= */

function normalizeOpexFilterOptions(data = {}) {
  const payload =
    data?.data &&
      typeof data.data === "object" &&
      !Array.isArray(data.data)
      ? data.data
      : data;

  /* =======================================================
     REPORTING CURRENCY

     Try all common API keys so the dropdown does not remain
     stuck on the fallback AED when the backend returns the
     currency list under a different supported key.
  ======================================================= */

  const rawReportingCurrencies =
    payload?.reporting_currencies ??
    payload?.currencies ??
    payload?.currency_options ??
    payload?.ledger_currencies ??
    payload?.reporting_currency ??
    [];

  let currencies =
    normalizeCurrencyOptions(
      rawReportingCurrencies
    );

  /* =======================================================
     If no currency list was returned but the backend provides
     a default reporting currency, expose that as an option.
  ======================================================= */

  if (
    !currencies.length &&
    payload?.default_reporting_currency
  ) {
    currencies =
      normalizeCurrencyOptions(
        payload.default_reporting_currency
      );
  }

  const periods = Array.isArray(
    payload?.periods
  )
    ? payload.periods
    : [];

  return {
    legal_groups: Array.isArray(
      payload?.legal_groups
    )
      ? payload.legal_groups
      : [],

    legal_entities: Array.isArray(
      payload?.legal_entities
    )
      ? payload.legal_entities
      : [],

    parent_divisions: Array.isArray(
      payload?.parent_divisions
    )
      ? payload.parent_divisions
      : [],

    subdivisions: Array.isArray(
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

    /*
     * IMPORTANT:
     * Use the normalized currency options here.
     * This fixes the Reporting Currency dropdown when
     * the API returns currency objects in different formats.
     */
    reporting_currencies:
      currencies,

    compare_with: Array.isArray(
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
   SELECT STYLE
========================================================= */

const selectStyle = {
  appearance: "none",
  padding: "6px 28px 6px 10px",
  fontSize: "0.78rem",
  fontWeight: 500,
  color: "#334155",
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 7,
  cursor: "pointer",
  outline: "none",
  width: "100%",
  height: 34,
  boxSizing: "border-box",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 8px center",
};

/* =========================================================
   FILTER FIELD
========================================================= */

function FilterField({
  label,
  children,
  width,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: width,
        width,
        flex: "0 0 auto",
      }}
    >
      <span
        style={{
          fontSize: "0.66rem",
          color: "#1e3a8a",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>

      {children}
    </div>
  );
}

/* =========================================================
   OPEX MULTI SELECT
========================================================= */

function OpexMultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "All",
  width = 128,
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] =
    useState("");

  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (
        ref.current &&
        !ref.current.contains(event.target)
      ) {
        setOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, []);

  useEffect(() => {
    if (
      open &&
      searchRef.current
    ) {
      setTimeout(
        () =>
          searchRef.current?.focus(),
        0
      );
    }

    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const normalized = (options || [])
    .map((option) => {
      if (
        option === null ||
        option === undefined
      ) {
        return {
          id: "",
          name: "",
        };
      }

      if (
        typeof option === "string" ||
        typeof option === "number"
      ) {
        return {
          id: String(option),
          name: String(option),
        };
      }

      const id =
        option.value !== undefined
          ? option.value
          : option.id !== undefined
            ? option.id
            : option.code !== undefined
              ? option.code
              : "";

      const name =
        option.label !== undefined
          ? option.label
          : option.name !== undefined
            ? option.name
            : option.period_name !==
              undefined
              ? option.period_name
              : String(id);

      return {
        id: String(id),
        name: String(name),
      };
    })
    .filter(
      (option) => option.id !== ""
    );

  const currentValues =
    Array.isArray(value)
      ? value.map(String)
      : [];

  const query =
    searchQuery
      .trim()
      .toLowerCase();

  const visibleOptions = query
    ? normalized.filter(
      (option) =>
        option.name
          .toLowerCase()
          .includes(query) ||
        option.id
          .toLowerCase()
          .includes(query)
    )
    : normalized;

  const isAll =
    currentValues.length === 0;

  const isAllSelected =
    normalized.length > 0 &&
    currentValues.length ===
    normalized.length &&
    normalized.every(
      (option) =>
        currentValues.includes(
          option.id
        )
    );

  const selectedOptions =
    normalized.filter((option) =>
      currentValues.includes(
        option.id
      )
    );

  const displayText = isAll
    ? placeholder
    : isAllSelected
      ? "All selected"
      : selectedOptions.length === 1
        ? selectedOptions[0].name
        : `${selectedOptions.length} selected`;

  const toggleValue = (id) => {
    const stringId = String(id);

    let nextValues;

    if (
      currentValues.includes(
        stringId
      )
    ) {
      nextValues =
        currentValues.filter(
          (item) =>
            item !== stringId
        );
    } else {
      nextValues = [
        ...currentValues,
        stringId,
      ];
    }

    onChange?.(nextValues);
  };

  /* =======================================================
     SELECT ALL

     Selects every available option.
  ======================================================= */

  const handleSelectAll = () => {
    onChange?.(
      normalized.map(
        (option) => option.id
      )
    );
  };

  /* =======================================================
     CLEAR

     Clears all selected values.
     Empty array keeps the existing "All / no filter"
     behaviour used by this component.
  ======================================================= */

  const handleClear = () => {
    onChange?.([]);
  };

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width,
      }}
    >
      <button
        type="button"
        onClick={() =>
          setOpen((previous) =>
            !previous
          )
        }
        style={{
          ...selectStyle,
          textAlign: "left",
          overflow: "hidden",
          textOverflow:
            "ellipsis",
          whiteSpace:
            "nowrap",
        }}
        title={displayText}
      >
        {displayText}
      </button>

      {open && (
        <div
          style={{
            position:
              "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            width:
              Math.max(
                width,
                220
              ),
            maxHeight: 300,
            overflowY:
              "auto",
            background:
              "#fff",
            border:
              "1px solid #e2e8f0",
            borderRadius: 8,
            boxShadow:
              "0 10px 25px rgba(15,23,42,0.12)",
            zIndex: 1000,
            padding: 8,
          }}
        >
          <div
            style={{
              position:
                "relative",
              marginBottom: 6,
            }}
          >
            <Search
              size={13}
              style={{
                position:
                  "absolute",
                left: 8,
                top: 9,
                color:
                  "#94a3b8",
              }}
            />

            <input
              ref={searchRef}
              type="text"
              value={
                searchQuery
              }
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search..."
              style={{
                width: "100%",
                height: 30,
                boxSizing:
                  "border-box",
                border:
                  "1px solid #e2e8f0",
                borderRadius: 6,
                padding:
                  "0 8px 0 26px",
                outline: "none",
                fontSize:
                  "0.74rem",
                color:
                  "#334155",
              }}
            />
          </div>

          {/* =================================================
              SELECT ALL / CLEAR
          ================================================= */}

          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <button
              type="button"
              onClick={
                handleSelectAll
              }
              style={{
                flex: 1,
                border:
                  "1px solid #e2e8f0",
                background:
                  isAllSelected
                    ? "#f1f5f9"
                    : "#fff",
                textAlign:
                  "center",
                padding:
                  "5px 6px",
                borderRadius: 5,
                cursor:
                  "pointer",
                fontSize:
                  "0.72rem",
                fontWeight:
                  600,
                color:
                  "#334155",
              }}
            >
              Select All
            </button>

            <button
              type="button"
              onClick={
                handleClear
              }
              style={{
                flex: 1,
                border:
                  "1px solid #e2e8f0",
                background:
                  isAll
                    ? "#f1f5f9"
                    : "#fff",
                textAlign:
                  "center",
                padding:
                  "5px 6px",
                borderRadius: 5,
                cursor:
                  "pointer",
                fontSize:
                  "0.72rem",
                fontWeight:
                  600,
                color:
                  "#64748b",
              }}
            >
              Clear
            </button>
          </div>

          {visibleOptions.map(
            (option) => {
              const checked =
                currentValues.includes(
                  option.id
                );

              return (
                <label
                  key={
                    option.id
                  }
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: 5,
                    padding:
                      "2px 8px",
                    borderRadius: 5,
                    cursor:
                      "pointer",
                    fontSize:
                      "0.74rem",
                    color:
                      "#334155",
                    background:
                      checked
                        ? "#f8fafc"
                        : "#fff",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      checked
                    }
                    onChange={() =>
                      toggleValue(
                        option.id
                      )
                    }
                    style={{
                      margin: 0,
                    }}
                  />

                  <span
                    style={{
                      overflow:
                        "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace:
                        "nowrap",
                    }}
                    title={
                      option.name
                    }
                  >
                    {
                      option.name
                    }
                  </span>
                </label>
              );
            }
          )}

          {!visibleOptions.length && (
            <div
              style={{
                padding:
                  "12px 8px",
                textAlign:
                  "center",
                fontSize:
                  "0.72rem",
                color:
                  "#94a3b8",
              }}
            >
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   OPEX SINGLE SELECT
========================================================= */

function OpexSingleSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Select",
  width = 128,
  searchable = true,
}) {
  const [open, setOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (
        ref.current &&
        !ref.current.contains(
          event.target
        )
      ) {
        setOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, []);

  useEffect(() => {
    if (
      open &&
      searchable &&
      searchRef.current
    ) {
      setTimeout(
        () =>
          searchRef.current?.focus(),
        0
      );
    }

    if (!open) {
      setSearchQuery("");
    }
  }, [
    open,
    searchable,
  ]);

  const normalized = (options || [])
    .map((option) => {
      if (
        option === null ||
        option === undefined
      ) {
        return null;
      }

      if (
        typeof option === "string" ||
        typeof option === "number"
      ) {
        return {
          id: String(option),
          name: String(option),
        };
      }

      const id =
        option.value !== undefined
          ? option.value
          : option.id !== undefined
            ? option.id
            : option.code !== undefined
              ? option.code
              : "";

      const name =
        option.label !== undefined
          ? option.label
          : option.name !== undefined
            ? option.name
            : option.period_name !==
              undefined
              ? option.period_name
              : String(id);

      return {
        id: String(id),
        name: String(name),
      };
    })
    .filter(Boolean)
    .filter(
      (option) =>
        option.id !== ""
    );

  const currentValue =
    value === null ||
      value === undefined
      ? ""
      : String(value);

  const currentOption =
    normalized.find(
      (option) =>
        option.id ===
        currentValue
    );

  const query =
    searchQuery
      .trim()
      .toLowerCase();

  const visibleOptions =
    searchable && query
      ? normalized.filter(
        (option) =>
          option.name
            .toLowerCase()
            .includes(query) ||
          option.id
            .toLowerCase()
            .includes(query)
      )
      : normalized;

  const displayText =
    currentOption?.name ||
    placeholder;

  const handleSelect = (
    option
  ) => {
    onChange?.(
      option.id
    );
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <div
      ref={ref}
      style={{
        position:
          "relative",
        width,
      }}
    >
      <button
        type="button"
        onClick={() =>
          setOpen((previous) =>
            !previous
          )
        }
        style={{
          ...selectStyle,
          textAlign:
            "left",
          overflow:
            "hidden",
          textOverflow:
            "ellipsis",
          whiteSpace:
            "nowrap",
        }}
        title={displayText}
      >
        {displayText}
      </button>

      {open && (
        <div
          style={{
            position:
              "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            width:
              Math.max(
                width,
                220
              ),
            maxHeight: 300,
            overflowY:
              "auto",
            background:
              "#fff",
            border:
              "1px solid #e2e8f0",
            borderRadius: 8,
            boxShadow:
              "0 10px 25px rgba(15,23,42,0.12)",
            zIndex: 1000,
            padding: 8,
          }}
        >
          {searchable && (
            <div
              style={{
                position:
                  "relative",
                marginBottom:
                  6,
              }}
            >
              <Search
                size={13}
                style={{
                  position:
                    "absolute",
                  left: 8,
                  top: 9,
                  color:
                    "#94a3b8",
                }}
              />

              <input
                ref={searchRef}
                type="text"
                value={
                  searchQuery
                }
                onChange={(
                  event
                ) =>
                  setSearchQuery(
                    event.target
                      .value
                  )
                }
                placeholder="Search..."
                style={{
                  width:
                    "100%",
                  height: 30,
                  boxSizing:
                    "border-box",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: 6,
                  padding:
                    "0 8px 0 26px",
                  outline:
                    "none",
                  fontSize:
                    "0.74rem",
                  color:
                    "#334155",
                }}
              />
            </div>
          )}

          {visibleOptions.map(
            (option) => {
              const selected =
                option.id ===
                currentValue;

              return (
                <button
                  key={
                    option.id
                  }
                  type="button"
                  onClick={() =>
                    handleSelect(
                      option
                    )
                  }
                  style={{
                    width:
                      "100%",
                    border:
                      "none",
                    background:
                      selected
                        ? "#f1f5f9"
                        : "#fff",
                    textAlign:
                      "left",
                    padding:
                      "7px 8px",
                    borderRadius: 5,
                    cursor:
                      "pointer",
                    fontSize:
                      "0.74rem",
                    fontWeight:
                      selected
                        ? 600
                        : 500,
                    color:
                      "#334155",
                    overflow:
                      "hidden",
                    textOverflow:
                      "ellipsis",
                    whiteSpace:
                      "nowrap",
                  }}
                  title={
                    option.name
                  }
                >
                  {
                    option.name
                  }
                </button>
              );
            }
          )}

          {!visibleOptions.length && (
            <div
              style={{
                padding:
                  "12px 8px",
                textAlign:
                  "center",
                fontSize:
                  "0.72rem",
                color:
                  "#94a3b8",
              }}
            >
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   OPEX FILTERS
========================================================= */

export default function OpexFilters({
  filterOptions = {},
  selectedFilters: externalSelectedFilters,
  onChange,
  onApply,
  onReset,
}) {
  const [
    opexFilterOptions,
    setOpexFilterOptions,
  ] = useState(
    normalizeOpexFilterOptions(
      filterOptions
    )
  );

  const [
    selectedFilters,
    setSelectedFilters,
  ] = useState(() => {
    const normalized =
      normalizeOpexFilterOptions(
        filterOptions
      );

    const years =
      normalized.years || [];

    const periods =
      normalized.periods || [];

    const firstYear =
      years.length
        ? getOptionValue(
          years[0]
        )
        : "";

    const latestPeriod =
      periods.length
        ? getLatestPeriod(
          periods
        )
        : "";

    return {
      ...DEFAULT_FILTERS,
      ...(externalSelectedFilters ||
        {}),
      year:
        externalSelectedFilters
          ?.year ||
        (firstYear
          ? String(firstYear)
          : ""),
      period:
        externalSelectedFilters
          ?.period ||
        (latestPeriod
          ? [
            String(
              latestPeriod
            ),
          ]
          : []),
      reporting_currency:
        externalSelectedFilters
          ?.reporting_currency ||
        normalized.default_reporting_currency ||
        "AED",
    };
  });

  const [loading, setLoading] =
    useState(false);

  /* =========================================================
     KEEP LOCAL FILTER STATE IN SYNC WITH EXTERNAL FILTERS
  ========================================================= */

  useEffect(() => {
    if (
      !externalSelectedFilters
    ) {
      return;
    }

    setSelectedFilters(
      externalSelectedFilters
    );
  }, [
    externalSelectedFilters,
  ]);

  /* =========================================================
     LOAD OPEX FILTER OPTIONS
  ========================================================= */

  const loadOpexFilterOptions =
    async (
      currentFilters = {},
      preserveOptionKey = null
    ) => {
      try {
        setLoading(true);

        const response =
          await getOpexFilterOptions(
            currentFilters
          );

        const normalized =
          normalizeOpexFilterOptions(
            response
          );

        setOpexFilterOptions(
          (previous) => {
            if (
              preserveOptionKey
            ) {
              return {
                ...previous,
                ...normalized,
                [
                  preserveOptionKey
                ]:
                  normalized[
                  preserveOptionKey
                  ] ??
                  previous[
                  preserveOptionKey
                  ],
              };
            }

            return {
              ...previous,
              ...normalized,
            };
          }
        );

        return normalized;
      } catch (error) {
        console.error(
          "Failed to load OPEX filter options:",
          error
        );

        return null;
      } finally {
        setLoading(false);
      }
    };

  /* =========================================================
     INITIAL FILTER OPTIONS
  ========================================================= */

  useEffect(() => {
    loadOpexFilterOptions(
      {}
    );
  }, []);

  /* =========================================================
     UPDATE DEFAULT VALUES AFTER OPTIONS LOAD
  ========================================================= */

  useEffect(() => {
    if (
      !opexFilterOptions
    ) {
      return;
    }

    setSelectedFilters(
      (previous) => {
        const next = {
          ...previous,
        };

        if (
          !next.year &&
          opexFilterOptions
            .years?.length
        ) {
          next.year =
            String(
              getOptionValue(
                opexFilterOptions
                  .years[0]
              )
            );
        }

        if (
          (!Array.isArray(
            next.period
          ) ||
            next.period.length ===
            0) &&
          opexFilterOptions
            .periods?.length
        ) {
          const latestPeriod =
            getLatestPeriod(
              opexFilterOptions
                .periods
            );

          if (
            latestPeriod
          ) {
            next.period = [
              String(
                latestPeriod
              ),
            ];
          }
        }

        if (
          !next.reporting_currency
        ) {
          next.reporting_currency =
            opexFilterOptions
              .default_reporting_currency ||
            "AED";
        }

        return next;
      }
    );
  }, [
    opexFilterOptions,
  ]);

  /* =========================================================
     FILTER CHANGE

     IMPORTANT:
     Dropdown changes are LOCAL ONLY.

     The parent page is NOT notified here.
     Parent components/data update only when Apply is clicked.
  ========================================================= */

  const handleFilterChange = (
    key,
    value
  ) => {
    const nextFilters = {
      ...selectedFilters,
      [key]: value,
    };

    /*
     * Keep dropdown changes local.
     *
     * DO NOT call onChange here.
     *
     * The selected values are only applied to the
     * parent page when the user clicks Apply.
     */
    setSelectedFilters(
      nextFilters
    );

    /* =======================================================
       CASCADING FILTER OPTIONS

       Keep the existing dependent-option API behaviour.
       This only refreshes dropdown options; it does NOT
       update the parent page data.
    ======================================================= */

    const optionKeyMap = {
      legal_group:
        "legal_entities",

      legal_entity:
        "parent_divisions",

      parent_division:
        "subdivisions",
    };

    const apiKeyMap = {
      legal_group:
        "legal_group_id",

      legal_entity:
        "legal_entity_id",

      parent_division:
        "parent_division_id",
    };

    if (
      optionKeyMap[key]
    ) {
      void loadOpexFilterOptions(
        nextFilters,
        optionKeyMap[key]
      );
    }
  };

  /* =========================================================
     RESET

     IMPORTANT:
     Reset no longer waits for the filter-options API.

     1. Reset UI immediately.
     2. Notify parent immediately.
     3. Refresh filter options in the background.
  ========================================================= */

  const handleReset =
    () => {
      const years =
        opexFilterOptions.years?.length
          ? opexFilterOptions.years
          : filterOptions?.years || [];

      const periods =
        opexFilterOptions.periods?.length
          ? opexFilterOptions.periods
          : filterOptions?.periods || [];

      const firstYear =
        years.length
          ? getOptionValue(
            years[0]
          )
          : "";

      const latestPeriod =
        periods.length
          ? getLatestPeriod(
            periods
          )
          : "";

      const resetFilters = {
        ...DEFAULT_FILTERS,

        legal_group: [],
        legal_entity: [],
        parent_division: [],
        subdivision: [],

        period:
          latestPeriod
            ? [
              String(
                latestPeriod
              ),
            ]
            : [],

        year:
          firstYear
            ? String(
              firstYear
            )
            : "",

        reporting_currency:
          opexFilterOptions
            .default_reporting_currency ||
          filterOptions?.default_reporting_currency ||
          "AED",
      };

      /*
       * Reset the local dropdown state immediately.
       */
      setSelectedFilters(
        resetFilters
      );

      /*
       * Notify the parent immediately so the applied
       * components/data reset.
       */
      onChange?.(
        resetFilters
      );

      onReset?.();

      /*
       * Refresh available filter options in the background.
       *
       * Do not await this request.
       */
      void loadOpexFilterOptions(
        {}
      );
    };

  const options = {
    ...filterOptions,
    ...opexFilterOptions,
  };

  return (
    <div
      className="card"
      style={{
        width: "100%",
        maxWidth: "100%",
        padding:
          "10px 16px",
        marginBottom: 16,

        display: "flex",
        alignItems:
          "flex-end",

        gap: 10,

        flexWrap: "wrap",

        boxSizing:
          "border-box",
        overflow: "visible",
        position: "relative",
        zIndex: 20,

        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* =====================================================
          Legal Group
      ===================================================== */}

      <FilterField
        label="Legal Group"
        width={
          FIELD_WIDTHS.legal_group
        }
      >
        <OpexMultiSelect
          options={
            options.legal_groups ||
            []
          }
          value={
            selectedFilters.legal_group
          }
          onChange={(value) =>
            handleFilterChange(
              "legal_group",
              value
            )
          }
          width={
            FIELD_WIDTHS.legal_group
          }
        />
      </FilterField>

      {/* =====================================================
          Legal Entity
      ===================================================== */}

      <FilterField
        label="Legal Entity"
        width={
          FIELD_WIDTHS.legal_entity
        }
      >
        <OpexMultiSelect
          options={
            options.legal_entities ||
            []
          }
          value={
            selectedFilters.legal_entity
          }
          onChange={(value) =>
            handleFilterChange(
              "legal_entity",
              value
            )
          }
          width={
            FIELD_WIDTHS.legal_entity
          }
        />
      </FilterField>

      {/* =====================================================
          Parent Division
      ===================================================== */}

      <FilterField
        label="Parent Division"
        width={
          FIELD_WIDTHS.parent_division
        }
      >
        <OpexMultiSelect
          options={
            options.parent_divisions ||
            []
          }
          value={
            selectedFilters.parent_division
          }
          onChange={(value) =>
            handleFilterChange(
              "parent_division",
              value
            )
          }
          width={
            FIELD_WIDTHS.parent_division
          }
        />
      </FilterField>

      {/* =====================================================
          Sub-Division
      ===================================================== */}

      <FilterField
        label="Sub-Division"
        width={
          FIELD_WIDTHS.subdivision
        }
      >
        <OpexMultiSelect
          options={
            options.subdivisions ||
            []
          }
          value={
            selectedFilters.subdivision
          }
          onChange={(value) =>
            handleFilterChange(
              "subdivision",
              value
            )
          }
          width={
            FIELD_WIDTHS.subdivision
          }
        />
      </FilterField>

      {/* =====================================================
          Year
      ===================================================== */}

      <FilterField
        label="Year"
        width={
          FIELD_WIDTHS.year
        }
      >
        <OpexSingleSelect
          options={
            options.years || []
          }
          value={
            selectedFilters.year
          }
          onChange={(value) =>
            handleFilterChange(
              "year",
              value
            )
          }
          placeholder="Select Year"
          width={
            FIELD_WIDTHS.year
          }
        />
      </FilterField>

      {/* =====================================================
          Period

          Multiselect.
          Latest period is selected initially.
      ===================================================== */}

      <FilterField
        label="Period"
        width={
          FIELD_WIDTHS.period
        }
      >
        <OpexMultiSelect
          options={
            options.periods || []
          }
          value={
            selectedFilters.period
          }
          onChange={(value) =>
            handleFilterChange(
              "period",
              value
            )
          }
          placeholder="All"
          width={
            FIELD_WIDTHS.period
          }
        />
      </FilterField>

      {/* =====================================================
          Reporting Currency
      ===================================================== */}

      <FilterField
        label="Reporting Currency"
        width={
          FIELD_WIDTHS.reporting_currency
        }
      >
        <OpexSingleSelect
          options={
            options
              .reporting_currencies
              ?.length
              ? options.reporting_currencies
              : [
                {
                  value:
                    options.default_reporting_currency ||
                    "AED",
                  label:
                    options.default_reporting_currency ||
                    "AED",
                },
              ]
          }
          value={
            selectedFilters.reporting_currency ||
            options.default_reporting_currency ||
            "AED"
          }
          onChange={(value) =>
            handleFilterChange(
              "reporting_currency",
              value
            )
          }
          placeholder="AED"
          searchable={false}
          width={
            FIELD_WIDTHS.reporting_currency
          }
        />
      </FilterField>

      {/* =====================================================
          Apply / Reset

          Apply remains clickable even while filter options
          are loading.

          Dropdown changes are local until Apply is clicked.
      ===================================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          alignSelf: "flex-end",
          flexShrink: 0,
          paddingBottom: 1,
          marginLeft: 6,
        }}
      >
        <button
          id="btn-apply-opex-filter"
          type="button"
          disabled={false}
          onClick={() =>
            onApply?.(
              selectedFilters
            )
          }
          style={{
            height: 34,
            padding:
              "0 16px",
            background:
              "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize:
              "0.78rem",
            fontWeight: 700,
            cursor:
              "pointer",
            opacity: 1,
            whiteSpace:
              "nowrap",
            display:
              "inline-flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            transition:
              "all 0.18s",
          }}
        >
          Apply
        </button>

        <button
          id="btn-reset-opex-filter"
          type="button"
          disabled={false}
          onClick={
            handleReset
          }
          style={{
            height: 34,
            padding:
              "0 10px",
            background: "#fff",
            border:
              "1px solid #e2e8f0",
            color:
              "#64748b",
            borderRadius: 8,
            fontWeight: 600,
            fontSize:
              "0.78rem",
            cursor: "pointer",
            whiteSpace:
              "nowrap",
            display:
              "inline-flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            opacity: 1,
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}