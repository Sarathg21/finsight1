import React, { useMemo, useState, useEffect, useRef } from "react";
import ExportButtons from "../Common/ExportButtons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================================================
   FORMAT AMOUNT
========================================================= */

const formatAmount = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "-"
  ) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
};


/* =========================================================
   FORMAT PERCENTAGE
========================================================= */

const formatPercentage = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "-"
  ) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "—";
  }

  return `${number.toFixed(2)}%`;
};


/* =========================================================
   CHECK VALUE
========================================================= */

const hasValue = (value) => {
  return !(
    value === null ||
    value === undefined ||
    value === "" ||
    value === "-"
  );
};


/* =========================================================
   CHECK "ALL" / EMPTY VALUE
========================================================= */

const isEmptyOrAll = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return (
      value.length === 0 ||
      value.every((item) =>
        isEmptyOrAll(item)
      )
    );
  }

  const text = String(value)
    .trim()
    .toLowerCase();

  return (
    text === "" ||
    text === "all" ||
    text === "all values" ||
    text === "all value" ||
    text === "all options" ||
    text === "-" ||
    text === "*"
  );
};


/* =========================================================
   CHECK "ALL" VALUE
========================================================= */

const isAllValue = (value) => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    return (
      normalized === "" ||
      normalized === "all" ||
      normalized === "all values" ||
      normalized === "all options" ||
      normalized === "-"
    );
  }

  return false;
};


/* =========================================================
   GET DISPLAY NAME FROM FILTER OBJECT
========================================================= */

const getFilterObjectDisplayValue = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  /* -------------------------------------------------------
     ARRAY
  ------------------------------------------------------- */

  if (Array.isArray(value)) {
    const values = value
      .map((item) =>
        getFilterObjectDisplayValue(item)
      )
      .filter(
        (item) =>
          item !== null &&
          item !== undefined &&
          item !== ""
      );

    if (!values.length) {
      return null;
    }

    return values.join(", ");
  }


  /* -------------------------------------------------------
     OBJECT
  ------------------------------------------------------- */

  if (typeof value === "object") {

    /*
     * Prefer human-readable fields.
     * IDs / codes are deliberately lower priority.
     */

    const displayKeys = [
      "name",
      "label",
      "display_name",
      "displayName",
      "description",
      "title",
      "text",
      "period_name",
      "value",
    ];

    for (const key of displayKeys) {
      const displayValue = value?.[key];

      if (
        hasValue(displayValue) &&
        !isAllValue(displayValue)
      ) {
        return String(displayValue);
      }
    }


    /*
     * If the object itself only contains an ID/code,
     * don't show the internal identifier.
     */

    const codeKeys = [
      "id",
      "code",
      "key",
      "uuid",
      "value_id",
      "value_code",
    ];

    const hasOnlyCodeValue = codeKeys.some(
      (key) =>
        hasValue(value?.[key]) &&
        !hasValue(
          value?.name ||
          value?.label ||
          value?.display_name ||
          value?.displayName
        )
    );

    if (hasOnlyCodeValue) {
      return null;
    }

    return null;
  }


  /* -------------------------------------------------------
     STRING / NUMBER
  ------------------------------------------------------- */

  if (isAllValue(value)) {
    return null;
  }

  return String(value);
};


/* =========================================================
   GET OPTION DISPLAY NAME
========================================================= */

const getOptionDisplayName = (option) => {
  if (
    option === null ||
    option === undefined
  ) {
    return "";
  }

  if (typeof option !== "object") {
    return String(option);
  }

  return (
    option.name ??
    option.label ??
    option.display_name ??
    option.displayName ??
    option.description ??
    option.title ??
    option.text ??
    option.period_name ??
    option.value ??
    option.code ??
    option.id ??
    ""
  );
};


/* =========================================================
   GET OPTION ID / VALUE
========================================================= */

const getOptionId = (option) => {
  if (
    option === null ||
    option === undefined
  ) {
    return "";
  }

  if (typeof option !== "object") {
    return String(option);
  }

  return (
    option.value ??
    option.id ??
    option.code ??
    option.legal_group_id ??
    option.legal_entity_id ??
    option.parent_division_id ??
    option.subdivision_id ??
    option.period_name ??
    option.name ??
    ""
  );
};


/* =========================================================
   FIND SELECTED VALUE DISPLAY NAME
========================================================= */

const findFilterOptionName = (
  selectedValue,
  options = []
) => {
  if (
    selectedValue === null ||
    selectedValue === undefined ||
    selectedValue === ""
  ) {
    return "";
  }


  /* -------------------------------------------------------
     ARRAY
  ------------------------------------------------------- */

  if (Array.isArray(selectedValue)) {
    const names = selectedValue
      .filter(
        (value) =>
          !isEmptyOrAll(value)
      )
      .map((value) =>
        findFilterOptionName(
          value,
          options
        )
      )
      .filter(Boolean);

    return [
      ...new Set(names),
    ].join(", ");
  }


  /* -------------------------------------------------------
     OBJECT
  ------------------------------------------------------- */

  /*
   * If the selected value itself is an object,
   * use its human-readable name.
   */

  if (
    typeof selectedValue === "object"
  ) {
    return getOptionDisplayName(
      selectedValue
    );
  }


  /* -------------------------------------------------------
     STRING / NUMBER
  ------------------------------------------------------- */

  const selectedText = String(
    selectedValue
  ).trim();

  if (
    !selectedText ||
    isEmptyOrAll(selectedText)
  ) {
    return "";
  }


  /*
   * Find the selected ID/code in the
   * corresponding filter options.
   */

  const matchedOption =
    Array.isArray(options)
      ? options.find((option) => {

        const optionId =
          String(
            getOptionId(
              option
            )
          ).trim();

        return (
          optionId ===
          selectedText
        );
      })
      : null;


  if (matchedOption) {
    return getOptionDisplayName(
      matchedOption
    );
  }


  /*
   * If backend/filter already supplied
   * a display value, keep it.
   */

  return selectedText;
};


/* =========================================================
   GET SELECTED FILTER DISPLAY VALUE
========================================================= */

const getSelectedFilterValue = (
  activeFilters,
  key,
  aliases = []
) => {

  /*
   * First check the requested key.
   */

  const directValue =
    activeFilters?.[key];

  const directDisplay =
    getFilterObjectDisplayValue(
      directValue
    );

  if (directDisplay) {
    return directDisplay;
  }


  /*
   * Then check possible name/label fields.
   *
   * Example:
   * legal_group
   * legal_group_name
   * legal_group_label
   */

  const possibleKeys = [
    ...aliases,

    `${key}_name`,
    `${key}_label`,
    `${key}_display_name`,
    `${key}_displayName`,
    `${key}Name`,
    `${key}Label`,
  ];


  for (const possibleKey of possibleKeys) {

    const value =
      activeFilters?.[possibleKey];

    const displayValue =
      getFilterObjectDisplayValue(
        value
      );

    if (displayValue) {
      return displayValue;
    }
  }


  return null;
};


/* =========================================================
   GET FILTER DISPLAY VALUE FROM OPTIONS
========================================================= */

const getFilterDisplayValue = (
  filters,
  filterOptions,
  filterKey
) => {

  const selectedValue =
    filters?.[filterKey];


  if (isEmptyOrAll(selectedValue)) {
    return "";
  }


  const optionMap = {

    legal_group:
      filterOptions?.legal_groups || [],

    legal_entity:
      filterOptions?.legal_entities || [],

    parent_division:
      filterOptions?.parent_divisions || [],

    subdivision:
      filterOptions?.subdivisions || [],

    period:
      filterOptions?.periods || [],

    year:
      filterOptions?.years ||
      filterOptions?.fiscal_years ||
      [],
  };


  return findFilterOptionName(
    selectedValue,
    optionMap[filterKey] || []
  );
};


/* =========================================================
   FILTER CHIP
========================================================= */

const FilterChip = ({
  label,
  value,
}) => {

  const displayValue =
    getFilterObjectDisplayValue(
      value
    );


  /*
   * Do not show:
   * - null
   * - undefined
   * - empty
   * - "-"
   * - All
   */

  if (!displayValue) {
    return null;
  }


  return (
    <div className="finsight-detail-filter-chip">

      <span className="finsight-detail-filter-chip-label">
        {label}:
      </span>

      <span>
        {displayValue}
      </span>

    </div>
  );
};


/* =========================================================
   MULTI SELECT FILTER
========================================================= */
/* =========================================================
   CUSTOM MULTI-SELECT DROPDOWN
   STYLE COPIED FROM ExpenseCategoryDrillDownModal.jsx
========================================================= */

const MultiSelectDropdown = ({
    label,
    options = [],
    selectedValues = [],
    onChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
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

    /* ---------------------------------------------------------
       FORMAT OPTIONS
    --------------------------------------------------------- */

    const formattedOptions = useMemo(() => {
        return options.map((option) => ({
            id: String(getOptionId(option)),
            name: String(getOptionDisplayName(option)),
        }));
    }, [options]);

    /* ---------------------------------------------------------
       NORMALIZE SELECTED VALUES
    --------------------------------------------------------- */

    const normalizedSelectedValues = useMemo(() => {
        if (!Array.isArray(selectedValues)) {
            return [];
        }

        return selectedValues.map((value) => {
            if (typeof value === "object") {
                return String(getOptionId(value));
            }

            return String(value);
        });
    }, [selectedValues]);

    /* ---------------------------------------------------------
       SEARCH
    --------------------------------------------------------- */

    const filteredOptions = useMemo(() => {
        const keyword = searchTerm
            .trim()
            .toLowerCase();

        if (!keyword) {
            return formattedOptions;
        }

        return formattedOptions.filter(
            (option) =>
                option.name
                    .toLowerCase()
                    .includes(keyword) ||
                option.id
                    .toLowerCase()
                    .includes(keyword)
        );
    }, [
        formattedOptions,
        searchTerm,
    ]);

    /* ---------------------------------------------------------
       TOGGLE OPTION
    --------------------------------------------------------- */

    const handleToggle = (id) => {
        const normalizedId = String(id);

        if (
            normalizedSelectedValues.includes(
                normalizedId
            )
        ) {
            onChange(
                normalizedSelectedValues.filter(
                    (value) =>
                        value !== normalizedId
                )
            );
        } else {
            onChange([
                ...normalizedSelectedValues,
                normalizedId,
            ]);
        }
    };

    /* ---------------------------------------------------------
       SELECT ALL
    --------------------------------------------------------- */

    const handleSelectAll = () => {
        onChange(
            formattedOptions.map(
                (option) => option.id
            )
        );
    };

    /* ---------------------------------------------------------
       CLEAR
    --------------------------------------------------------- */

    const handleClear = () => {
        onChange([]);
    };

    /* ---------------------------------------------------------
       DISPLAY LABEL
    --------------------------------------------------------- */

    const displayLabel = useMemo(() => {
        if (
            normalizedSelectedValues.length === 0
        ) {
            return "Select";
        }

        if (
            normalizedSelectedValues.length === 1
        ) {
            const found =
                formattedOptions.find(
                    (option) =>
                        option.id ===
                        normalizedSelectedValues[0]
                );

            return found
                ? found.name
                : "1 Selected";
        }

        return `${normalizedSelectedValues.length} Selected`;
    }, [
        normalizedSelectedValues,
        formattedOptions,
    ]);

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
            }}
        >
            {/* LABEL */}

            <label
                style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#2b3b75",
                }}
            >
                {label}
            </label>

            {/* DROPDOWN BUTTON */}

            <button
                type="button"
                onClick={() => {
                    setIsOpen(
                        (previous) => !previous
                    );

                    if (isOpen) {
                        setSearchTerm("");
                    }
                }}
                style={{
                    height: "38px",
                    minWidth: "130px",
                    padding: "0 12px",
                    borderRadius: "10px",
                    border:
                        "1px solid #e0e6ed",
                    background: "#f4f6fc",
                    color: "#2b3b75",
                    fontSize: "13px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "space-between",
                    cursor: "pointer",
                    outline: "none",
                }}
            >
                <span
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginRight: "8px",
                    }}
                >
                    {displayLabel}
                </span>

                <span
                    style={{
                        fontSize: "10px",
                        color: "#2b3b75",
                    }}
                >
                    ▼
                </span>
            </button>

            {/* DROPDOWN MENU */}

            {isOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: "4px",
                        width: "220px",
                        background: "#ffffff",
                        border:
                            "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow:
                            "0 10px 25px rgba(0,0,0,0.1)",
                        zIndex: 1050,
                        padding: "8px",
                    }}
                >
                    {/* SEARCH */}

                    <div
                        style={{
                            position: "relative",
                            marginBottom: "8px",
                        }}
                    >
                        <span
                            style={{
                                position:
                                    "absolute",
                                left: "10px",
                                top: "50%",
                                transform:
                                    "translateY(-50%)",
                                color: "#94a3b8",
                                fontSize: "12px",
                            }}
                        >
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                            style={{
                                width: "100%",
                                height: "32px",
                                paddingLeft: "30px",
                                paddingRight: "8px",
                                borderRadius: "6px",
                                border:
                                    "1px solid #e2e8f0",
                                fontSize: "12px",
                                outline: "none",
                                boxSizing:
                                    "border-box",
                            }}
                        />
                    </div>

                    {/* SELECT ALL / CLEAR */}

                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            padding:
                                "4px 4px 8px 4px",
                            fontSize: "12px",
                            fontWeight: 700,
                        }}
                    >
                        <span
                            onClick={
                                handleSelectAll
                            }
                            style={{
                                color: "#2b3b75",
                                cursor: "pointer",
                            }}
                        >
                            Select All
                        </span>

                        <span
                            onClick={handleClear}
                            style={{
                                color: "#64748b",
                                cursor: "pointer",
                            }}
                        >
                            Clear
                        </span>
                    </div>

                    {/* OPTIONS */}

                    <div
                        style={{
                            maxHeight: "160px",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection:
                                "column",
                            gap: "6px",
                        }}
                    >
                        {filteredOptions.length ===
                        0 ? (
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "#94a3b8",
                                    padding:
                                        "6px 4px",
                                }}
                            >
                                No options
                            </div>
                        ) : (
                            filteredOptions.map(
                                (option) => {
                                    const isChecked =
                                        normalizedSelectedValues.includes(
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
                                                gap: "8px",
                                                fontSize:
                                                    "12px",
                                                color:
                                                    "#2b3b75",
                                                fontWeight:
                                                    600,
                                                cursor:
                                                    "pointer",
                                                padding:
                                                    "2px 4px",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    isChecked
                                                }
                                                onChange={() =>
                                                    handleToggle(
                                                        option.id
                                                    )
                                                }
                                                style={{
                                                    accentColor:
                                                        "#5c60f5",
                                                    cursor:
                                                        "pointer",
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
                                            >
                                                {
                                                    option.name
                                                }
                                            </span>
                                        </label>
                                    );
                                }
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


/* =========================================================
   GET ROW VALUE
========================================================= */

const getRowValue = (
  row,
  keys = []
) => {

  for (const key of keys) {

    if (
      row?.[key] !== null &&
      row?.[key] !== undefined &&
      row?.[key] !== ""
    ) {
      return row[key];
    }
  }

  return null;
};


/* =========================================================
   ACTUAL VS TARGET TABLE
========================================================= */

const ActualVsTargetTable = ({
  rows,
  currency,
}) => {

  const totalActual =
    rows.reduce(
      (sum, row) => {

        const value =
          getRowValue(
            row,
            [
              "actual_ptd_aed",
              "actual_ptd",
              "actual",
            ]
          );

        if (!hasValue(value)) {
          return sum;
        }

        const number =
          Number(value);

        return Number.isNaN(number)
          ? sum
          : sum + number;

      },
      0
    );


  const targetValuesExist =
    rows.some(
      (row) => {

        const value =
          getRowValue(
            row,
            [
              "target_ptd_aed",
              "target_ptd",
              "target",
            ]
          );

        return hasValue(value);
      }
    );


  const totalTarget =
    rows.reduce(
      (sum, row) => {

        const value =
          getRowValue(
            row,
            [
              "target_ptd_aed",
              "target_ptd",
              "target",
            ]
          );

        if (!hasValue(value)) {
          return sum;
        }

        const number =
          Number(value);

        return Number.isNaN(number)
          ? sum
          : sum + number;

      },
      0
    );


  return (
    <div className="finsight-detail-table-wrapper">

      <table className="finsight-detail-table">

        <thead>
          <tr>

            <th className="text-left">
              Expense Category
            </th>

            <th className="text-right">
              Actual PTD ({currency})
            </th>

            <th className="text-right">
              Target PTD ({currency})
            </th>

          </tr>
        </thead>


        <tbody>

          {rows.map(
            (
              row,
              index
            ) => {

              const category =
                getRowValue(
                  row,
                  [
                    "category",
                    "name",
                  ]
                );


              const actual =
                getRowValue(
                  row,
                  [
                    "actual_ptd_aed",
                    "actual_ptd",
                    "actual",
                  ]
                );


              const target =
                getRowValue(
                  row,
                  [
                    "target_ptd_aed",
                    "target_ptd",
                    "target",
                  ]
                );


              return (
                <tr
                  key={
                    `${category || "row"}-${index}`
                  }
                >

                  <td>
                    {category || "—"}
                  </td>


                  <td className="text-right">
                    {hasValue(actual)
                      ? `${currency} ${formatAmount(actual)}`
                      : "—"}
                  </td>


                  <td className="text-right">
                    {hasValue(target)
                      ? `${currency} ${formatAmount(target)}`
                      : "—"}
                  </td>

                </tr>
              );
            }
          )}

        </tbody>


        <tfoot>
          <tr>

            <td>
              Total
            </td>

            <td className="text-right">
              {currency}{" "}
              {formatAmount(totalActual)}
            </td>

            <td className="text-right">
              {targetValuesExist
                ? `${currency} ${formatAmount(
                  totalTarget
                )}`
                : "—"}
            </td>

          </tr>
        </tfoot>

      </table>

    </div>
  );
};


/* =========================================================
   GENERIC TABLE
========================================================= */

const GenericTable = ({
  rows,
  currency,
  categoryLabel,
  firstMetricLabel,
  secondMetricLabel,
  firstMetricType,
  secondMetricType,
  firstMetricKeys,
  secondMetricKeys,
  categoryKeys,
  totalLabel,
}) => {

  const totalAmount =
    rows.reduce(
      (sum, row) => {

        const value =
          getRowValue(
            row,
            firstMetricKeys
          );

        const number =
          Number(value);

        return Number.isNaN(number)
          ? sum
          : sum + number;

      },
      0
    );


  const totalPercentage =
    rows.reduce(
      (sum, row) => {

        const value =
          getRowValue(
            row,
            secondMetricKeys
          );

        const number =
          Number(value);

        return Number.isNaN(number)
          ? sum
          : sum + number;

      },
      0
    );


  const formatFirstMetric = (row) => {

    const value =
      getRowValue(
        row,
        firstMetricKeys
      );


    if (
      firstMetricType ===
      "amount"
    ) {
      return formatAmount(value);
    }


    if (
      firstMetricType ===
      "percentage"
    ) {
      return formatPercentage(value);
    }


    if (!hasValue(value)) {
      return "—";
    }


    return value;
  };


  const formatSecondMetric = (row) => {

    const value =
      getRowValue(
        row,
        secondMetricKeys
      );


    if (
      secondMetricType ===
      "amount"
    ) {
      return formatAmount(value);
    }


    if (
      secondMetricType ===
      "percentage"
    ) {
      return formatPercentage(value);
    }


    if (!hasValue(value)) {
      return "—";
    }


    return value;
  };


  return (
    <div className="finsight-detail-table-wrapper">

      <table className="finsight-detail-table">

        <thead>
          <tr>

            <th className="text-left">
              {categoryLabel}
            </th>

            <th className="text-right">

              {firstMetricLabel}

              {firstMetricType ===
                "amount"
                ? ` (${currency})`
                : ""}

            </th>

            <th className="text-right">
              {secondMetricLabel}
            </th>

          </tr>
        </thead>


        <tbody>

          {rows.map(
            (
              row,
              index
            ) => {

              const category =
                getRowValue(
                  row,
                  categoryKeys
                );


              return (
                <tr
                  key={
                    `${category || "row"}-${index}`
                  }
                >

                  <td>
                    {category || "—"}
                  </td>

                  <td className="text-right">
                    {formatFirstMetric(
                      row
                    )}
                  </td>

                  <td className="text-right">
                    {formatSecondMetric(
                      row
                    )}
                  </td>

                </tr>
              );
            }
          )}

        </tbody>


        <tfoot>
          <tr>

            <td>
              {totalLabel}
            </td>


            <td className="text-right">

              {currency}{" "}

              {formatAmount(
                totalAmount
              )}

            </td>


            <td className="text-right">

              {formatPercentage(
                totalPercentage
              )}

            </td>

          </tr>
        </tfoot>

      </table>

    </div>
  );
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function OperatingAnalysisViewAllModal({

  open,

  onClose,

  data = [],

  loading = false,

  activeFilters = {}, onApplyFilters,

  /*
   * IMPORTANT:
   * filterOptions contains the human-readable
   * names corresponding to active filter IDs.
   *
   * This is display-only and does not modify
   * activeFilters or API filters.
   */
  filterOptions = {},

  reportingCurrency = "AED",


  /* =====================================================
     COMMON CONFIGURATION
  ===================================================== */

  title = "Detailed View",

  subtitle = "",

  categoryLabel = "Category",

  firstMetricLabel = "Amount",

  secondMetricLabel = "Percentage",

  firstMetricType = "amount",

  secondMetricType = "percentage",

  firstMetricKeys = [
    "amount",
    "amount_aed",
  ],

  secondMetricKeys = [
    "percentage",
  ],

  categoryKeys = [
    "category",
    "name",
  ],

  totalLabel = "Total",


  /* =====================================================
     VIEW TYPE
  ===================================================== */

  viewAllType = "",

}) {

  /* =====================================================
     ALL HOOKS MUST BE BEFORE EARLY RETURN
  ===================================================== */

  const [searchTerm, setSearchTerm] =
    useState("");

  const [exporting, setExporting] = useState("");

  const [viewAllFilters, setViewAllFilters] = useState({
    year: [],
    legal_entity: [],
    parent_division: [],
    subdivision: [],
    period: [],
  });

  const initialViewAllFiltersRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const initialFilters = {
      year: activeFilters?.year
        ? Array.isArray(activeFilters.year)
          ? [...activeFilters.year]
          : [activeFilters.year]
        : [],

      legal_entity: activeFilters?.legal_entity
        ? Array.isArray(activeFilters.legal_entity)
          ? [...activeFilters.legal_entity]
          : [activeFilters.legal_entity]
        : [],

      parent_division: activeFilters?.parent_division
        ? Array.isArray(activeFilters.parent_division)
          ? [...activeFilters.parent_division]
          : [activeFilters.parent_division]
        : [],

      subdivision: activeFilters?.subdivision
        ? Array.isArray(activeFilters.subdivision)
          ? [...activeFilters.subdivision]
          : [activeFilters.subdivision]
        : [],

      period: activeFilters?.period
        ? Array.isArray(activeFilters.period)
          ? [...activeFilters.period]
          : [activeFilters.period]
        : [],
    };

    // Save the filters that existed when View All was opened.
    // Reset will return to these values.
    initialViewAllFiltersRef.current = initialFilters;

    setViewAllFilters(initialFilters);
  }, [open]);
  /* =====================================================
     NORMALIZE DATA
  ===================================================== */

  const rows =
    Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.results)
            ? data.results
            : [];


  /* =====================================================
     SEARCH FILTER
  ===================================================== */

  const filteredRows =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      if (!search) {
        return rows;
      }


      return rows.filter((row) => {

        if (!row) {
          return false;
        }


        return Object.values(row).some(
          (value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(search)
        );

      });

    }, [rows, searchTerm]);


  /* =====================================================
     CURRENCY
  ===================================================== */

  const currency =
    rows?.[0]?.reporting_currency ||
    activeFilters?.reporting_currency ||
    reportingCurrency ||
    "AED";


  /* =====================================================
     VIEW TYPE
  ===================================================== */

  const isActualVsTarget =
    viewAllType ===
    "actual-vs-target";


  const isExpenseCategory =
    viewAllType ===
    "expense-category";


  /* =====================================================
     GENERIC TOTAL
  ===================================================== */

  const genericTotalAmount =
    filteredRows.reduce(
      (sum, row) => {

        const value =
          getRowValue(
            row,
            firstMetricKeys
          );

        const number =
          Number(value);

        return Number.isNaN(number)
          ? sum
          : sum + number;

      },
      0
    );

  const handleExport = async (type) => {
    try {
      setExporting(type);

      if (type === "excel") {
        await exportToExcel();
      } else if (type === "pdf") {
        await exportToPDF();
      }
    } finally {
      setExporting("");
    }
  };

  /* =====================================================
     ACTUAL VS TARGET TOTAL
  ===================================================== */

  const actualVsTargetTotal =
    filteredRows.reduce(
      (sum, row) => {

        const value =
          getRowValue(
            row,
            [
              "actual_ptd_aed",
              "actual_ptd",
              "actual",
            ]
          );


        if (!hasValue(value)) {
          return sum;
        }


        const number =
          Number(value);


        return Number.isNaN(number)
          ? sum
          : sum + number;

      },
      0
    );


  const summaryTotal =
    isActualVsTarget
      ? actualVsTargetTotal
      : genericTotalAmount;


  /* =====================================================
     GENERIC TOTAL PERCENTAGE
  ===================================================== */

  const totalPercentage =
    filteredRows.reduce(
      (sum, row) => {

        const value =
          getRowValue(
            row,
            secondMetricKeys
          );

        const number =
          Number(value);

        return Number.isNaN(number)
          ? sum
          : sum + number;

      },
      0
    );


  /* =====================================================
     FILTER DISPLAY VALUES
     
     IMPORTANT:
     These values are ONLY for displaying the selected
     filter names in the chips.
     
     They do NOT modify API/data filtering.
  ===================================================== */

  const selectedYear =
    getFilterDisplayValue(
      activeFilters,
      filterOptions,
      "year"
    );


  const selectedPeriod =
    getFilterDisplayValue(
      activeFilters,
      filterOptions,
      "period"
    );


  const selectedCurrency =
    currency;


  const selectedLegalGroup =
    getFilterDisplayValue(
      activeFilters,
      filterOptions,
      "legal_group"
    );


  const selectedLegalEntity =
    getFilterDisplayValue(
      activeFilters,
      filterOptions,
      "legal_entity"
    );


  const selectedParentDivision =
    getFilterDisplayValue(
      activeFilters,
      filterOptions,
      "parent_division"
    );


  const selectedSubdivision =
    getFilterDisplayValue(
      activeFilters,
      filterOptions,
      "subdivision"
    );

  const handleApplyViewAllFilters = () => {
    if (typeof onApplyFilters !== "function") {
      return;
    }

    onApplyFilters(viewAllFilters);
  };

  const handleViewAllReset = async () => {
    const resetFilters = {
      ...(initialViewAllFiltersRef.current || {
        year: [],
        legal_entity: [],
        parent_division: [],
        subdivision: [],
        period: [],
      }),
    };

    setViewAllFilters({
      year: [...(resetFilters.year || [])],
      legal_entity: [...(resetFilters.legal_entity || [])],
      parent_division: [...(resetFilters.parent_division || [])],
      subdivision: [...(resetFilters.subdivision || [])],
      period: [...(resetFilters.period || [])],
    });

    // IMPORTANT:
    // This tells the parent OPEX page to fetch the data again.
    if (typeof onApplyFilters === "function") {
      await onApplyFilters(resetFilters);
    }
  };

  /* =====================================================
     EXCEL EXPORT
  ===================================================== */

  const exportToExcel = () => {

    if (!filteredRows.length) {
      return;
    }


    let headers = [];
    let tableRows = [];


    if (isActualVsTarget) {

      headers = [
        "Expense Category",
        `Actual PTD (${currency})`,
        `Target PTD (${currency})`,
      ];


      tableRows =
        filteredRows.map((row) => {

          const category =
            getRowValue(
              row,
              [
                "category",
                "name",
              ]
            );


          const actual =
            getRowValue(
              row,
              [
                "actual_ptd_aed",
                "actual_ptd",
                "actual",
              ]
            );


          const target =
            getRowValue(
              row,
              [
                "target_ptd_aed",
                "target_ptd",
                "target",
              ]
            );


          return [
            category || "—",

            hasValue(actual)
              ? `${currency} ${formatAmount(actual)}`
              : "—",

            hasValue(target)
              ? `${currency} ${formatAmount(target)}`
              : "—",
          ];
        });


      tableRows.push([
        "Total",
        `${currency} ${formatAmount(
          actualVsTargetTotal
        )}`,
        "",
      ]);

    } else {

      headers = [
        categoryLabel,

        `${firstMetricLabel}${firstMetricType === "amount"
          ? ` (${currency})`
          : ""
        }`,

        secondMetricLabel,
      ];


      tableRows =
        filteredRows.map((row) => {

          const category =
            getRowValue(
              row,
              categoryKeys
            );


          const firstValue =
            getRowValue(
              row,
              firstMetricKeys
            );


          const secondValue =
            getRowValue(
              row,
              secondMetricKeys
            );


          let formattedFirst = "—";
          let formattedSecond = "—";


          if (
            firstMetricType ===
            "amount"
          ) {

            formattedFirst =
              formatAmount(
                firstValue
              );

          } else if (
            firstMetricType ===
            "percentage"
          ) {

            formattedFirst =
              formatPercentage(
                firstValue
              );

          } else if (
            hasValue(firstValue)
          ) {

            formattedFirst =
              firstValue;
          }


          if (
            secondMetricType ===
            "amount"
          ) {

            formattedSecond =
              formatAmount(
                secondValue
              );

          } else if (
            secondMetricType ===
            "percentage"
          ) {

            formattedSecond =
              formatPercentage(
                secondValue
              );

          } else if (
            hasValue(secondValue)
          ) {

            formattedSecond =
              secondValue;
          }


          return [
            category || "—",

            firstMetricType ===
              "amount"
              ? `${currency} ${formattedFirst}`
              : formattedFirst,

            formattedSecond,
          ];
        });


      tableRows.push([
        totalLabel,

        `${currency} ${formatAmount(
          genericTotalAmount
        )}`,

        formatPercentage(
          totalPercentage
        ),
      ]);
    }


    const escapeExcelValue = (value) => {

      const stringValue =
        String(value ?? "");


      return `"${stringValue.replace(
        /"/g,
        '""'
      )}"`;
    };


    const excelContent = [

      headers
        .map(escapeExcelValue)
        .join("\t"),

      ...tableRows.map(
        (row) =>
          row
            .map(escapeExcelValue)
            .join("\t")
      ),

    ].join("\n");


    const blob =
      new Blob(
        [
          "\uFEFF" +
          excelContent,
        ],
        {
          type:
            "application/vnd.ms-excel;charset=utf-8;",
        }
      );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href = url;


    link.download =
      `${title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_details.xls`;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  /* =====================================================
     PDF EXPORT
  ===================================================== */

  /* =====================================================
    PDF EXPORT - DIRECT DOWNLOAD
 ===================================================== */

  const exportToPDF = () => {
    if (!filteredRows.length) {
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      /* =====================================================
         TITLE
      ===================================================== */

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(16, 42, 67);

      doc.text(
        String(title || "Detailed View"),
        14,
        15
      );

      let currentY = 22;

      /* =====================================================
         SUBTITLE
      ===================================================== */

      if (subtitle) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);

        doc.text(
          String(subtitle),
          14,
          currentY
        );

        currentY += 6;
      }

      /* =====================================================
         FILTERS
         Uses DISPLAY VALUES
      ===================================================== */

      const filterEntries = [
        ["Year", selectedYear],
        ["Period", selectedPeriod],
        ["Currency", selectedCurrency],
        ["Legal Group", selectedLegalGroup],
        ["Legal Entity", selectedLegalEntity],
        ["Parent Division", selectedParentDivision],
        ["Subdivision", selectedSubdivision],
      ].filter(
        ([, value]) =>
          value !== null &&
          value !== undefined &&
          value !== ""
      );

      if (filterEntries.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);

        const filterText = filterEntries
          .map(
            ([label, value]) =>
              `${label}: ${value}`
          )
          .join("   |   ");

        const filterLines = doc.splitTextToSize(
          filterText,
          268
        );

        doc.text(
          filterLines,
          14,
          currentY
        );

        currentY +=
          filterLines.length * 4 + 4;
      }

      /* =====================================================
         TABLE HEADERS + ROWS
      ===================================================== */

      let headers = [];
      let tableRows = [];

      /* =====================================================
         ACTUAL VS TARGET
      ===================================================== */

      if (isActualVsTarget) {
        headers = [
          "Expense Category",
          `Actual PTD (${currency})`,
          `Target PTD (${currency})`,
        ];

        tableRows = filteredRows.map((row) => {
          const category = getRowValue(
            row,
            [
              "category",
              "name",
            ]
          );

          const actual = getRowValue(
            row,
            [
              "actual_ptd_aed",
              "actual_ptd",
              "actual",
            ]
          );

          const target = getRowValue(
            row,
            [
              "target_ptd_aed",
              "target_ptd",
              "target",
            ]
          );

          return [
            category || "—",

            hasValue(actual)
              ? `${currency} ${formatAmount(actual)}`
              : "—",

            hasValue(target)
              ? `${currency} ${formatAmount(target)}`
              : "—",
          ];
        });

        /* TOTAL ROW */

        tableRows.push([
          "Total",

          `${currency} ${formatAmount(
            actualVsTargetTotal
          )}`,

          "",
        ]);
      }

      /* =====================================================
         OTHER VIEW ALL TYPES
      ===================================================== */

      else {
        headers = [
          categoryLabel,

          `${firstMetricLabel}${firstMetricType === "amount"
            ? ` (${currency})`
            : ""
          }`,

          secondMetricLabel,
        ];

        tableRows = filteredRows.map((row) => {
          const category = getRowValue(
            row,
            categoryKeys
          );

          const firstValue = getRowValue(
            row,
            firstMetricKeys
          );

          const secondValue = getRowValue(
            row,
            secondMetricKeys
          );

          let formattedFirst = "—";
          let formattedSecond = "—";

          /* FIRST METRIC */

          if (
            firstMetricType === "amount"
          ) {
            formattedFirst = hasValue(firstValue)
              ? `${currency} ${formatAmount(
                firstValue
              )}`
              : "—";
          }

          else if (
            firstMetricType === "percentage"
          ) {
            formattedFirst = hasValue(firstValue)
              ? formatPercentage(firstValue)
              : "—";
          }

          else if (
            hasValue(firstValue)
          ) {
            formattedFirst = String(
              firstValue
            );
          }

          /* SECOND METRIC */

          if (
            secondMetricType === "amount"
          ) {
            formattedSecond = hasValue(
              secondValue
            )
              ? `${currency} ${formatAmount(
                secondValue
              )}`
              : "—";
          }

          else if (
            secondMetricType === "percentage"
          ) {
            formattedSecond = hasValue(
              secondValue
            )
              ? formatPercentage(
                secondValue
              )
              : "—";
          }

          else if (
            hasValue(secondValue)
          ) {
            formattedSecond = String(
              secondValue
            );
          }

          return [
            category || "—",
            formattedFirst,
            formattedSecond,
          ];
        });

        /* TOTAL ROW */

        tableRows.push([
          totalLabel,

          `${currency} ${formatAmount(
            genericTotalAmount
          )}`,

          formatPercentage(
            totalPercentage
          ),
        ]);
      }

      /* =====================================================
         CREATE PDF TABLE
      ===================================================== */

      autoTable(doc, {
        startY: currentY + 4,

        head: [headers],

        body: tableRows,

        theme: "grid",

        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 3,
          textColor: [51, 65, 85],
          lineColor: [226, 232, 240],
          lineWidth: 0.2,
        },

        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [18, 58, 105],
          fontStyle: "bold",
          fontSize: 8,
          halign: "left",
        },

        bodyStyles: {
          fontSize: 8,
        },

        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },

        columnStyles: {
          0: {
            halign: "left",
          },

          1: {
            halign: "right",
          },

          2: {
            halign: "right",
          },
        },

        didParseCell: (data) => {
          const totalRowIndex =
            tableRows.length - 1;

          if (
            data.section === "body" &&
            data.row.index === totalRowIndex
          ) {
            data.cell.styles.fontStyle =
              "bold";

            data.cell.styles.fillColor = [
              243,
              246,
              249,
            ];
          }
        },
      });

      /* =====================================================
         RECORD COUNT
      ===================================================== */

      const finalY =
        doc.lastAutoTable?.finalY ||
        currentY + 20;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      doc.text(
        `${filteredRows.length} ${filteredRows.length === 1
          ? "record"
          : "records"
        }`,
        14,
        finalY + 8
      );

      /* =====================================================
         FILE NAME
      ===================================================== */

      const safeTitle = String(
        title || "detailed-view"
      )
        .replace(/[^a-z0-9]+/gi, "_")
        .replace(/^_+|_+$/g, "")
        .toLowerCase();

      /* =====================================================
         DIRECT PDF DOWNLOAD
      ===================================================== */

      doc.save(
        `${safeTitle}.pdf`
      );

    } catch (error) {
      console.error("PDF export failed:", error);
      alert(`PDF export failed: ${error?.message || error}`);
    }

  };
  /* =====================================================
     EARLY RETURN
  ===================================================== */

  if (!open) {
    return null;
  }


  /* =====================================================
     MODAL
  ===================================================== */

  return (
    <>
      <style>{`
        .finsight-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 20px 16px 28px;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .finsight-modal-container {
          width: 100%;
          max-width: 1300px;
          max-height: calc(100vh - 40px);
          background: #ffffff;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          border: 1px solid #e2e8f0;
          margin-top: 0;
          flex-shrink: 0;
        }

                .finsight-detail-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 1000;
                    background:
                        rgba(15, 23, 42, 0.42);
                    backdrop-filter:
                        blur(5px);
                    -webkit-backdrop-filter:
                        blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 28px;
                    box-sizing: border-box;
                }


                .finsight-detail-modal {
                    width: 100%;
                    max-width: 1520px;
                    height:
                        min(82vh, 730px);
                    min-height: 520px;
                    background: #ffffff;
                    border-radius: 14px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-sizing: border-box;
                    border:
                        1px solid #e1e7ee;
                    box-shadow:
                        0 24px 60px
                        rgba(15, 23, 42, 0.24);
                }


                .finsight-detail-header {
                    min-height: 68px;
                    padding:
                        14px 20px 13px;
                    box-sizing: border-box;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 20px;
                    border-bottom:
                        1px solid #e7edf3;
                    flex-shrink: 0;
                }


                .finsight-detail-title {
                    color: #102a43;
                    font-size: 15px;
                    line-height: 20px;
                    font-weight: 700;
                    letter-spacing:
                        -0.05px;
                }


                .finsight-detail-subtitle {
                    margin-top: 2px;
                    color: #55708d;
                    font-size: 11px;
                    line-height: 16px;
                }


                .finsight-detail-close {
                    width: 30px;
                    height: 30px;
                    padding: 0;
                    border: 0;
                    background:
                        transparent;
                    color: #718096;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 22px;
                    line-height: 30px;
                    font-weight: 300;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition:
                        background 0.15s ease,
                        color 0.15s ease;
                }


                .finsight-detail-close:hover {
                    background:
                        #f1f5f9;
                    color:
                        #334155;
                }


             /* =========================================================
   TOOLBAR
========================================================= */

.finsight-detail-toolbar {
    padding: 12px 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #f8fafc;
    border-bottom: 1px solid #e5ebf2;
    flex-shrink: 0;
}

/* =========================================================
   FILTER ROW
========================================================= */

.finsight-detail-toolbar-left {
    width: 100%;
    min-width: 0;
}

.finsight-view-filters {
    width: 100%;
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 10px;
}

/* Individual filter */

.finsight-view-filter {
    position: relative;
    width: 165px;
    min-width: 150px;
}

.finsight-view-filter-label {
    display: block;
    margin-bottom: 5px;
    color: #64748b;
    font-size: 10px;
    line-height: 14px;
    font-weight: 600;
}

/* Dropdown button */

.finsight-view-filter-button {
    width: 100%;
    height: 34px;
    padding: 0 10px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    border: 1px solid #d5dee8;
    border-radius: 6px;

    background: #ffffff;
    color: #334155;

    font-size: 11px;
    line-height: 16px;

    cursor: pointer;
    box-sizing: border-box;
}

.finsight-view-filter-button:hover {
    border-color: #b8c7d6;
}

.finsight-view-filter-button:focus {
    outline: none;
    border-color: #9db7d2;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.08);
}

/* Dropdown */

.finsight-view-filter-menu {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;

    z-index: 1100;

    width: 240px;

    background: #ffffff;

    border: 1px solid #d5dee8;
    border-radius: 7px;

    box-shadow:
        0 10px 30px rgba(15, 23, 42, 0.15);

    overflow: hidden;
}

.finsight-view-filter-search {
    width: 100%;
    height: 34px;

    padding: 0 10px;

    border: 0;
    border-bottom: 1px solid #e5ebf2;

    outline: none;

    color: #334155;
    background: #ffffff;

    font-size: 11px;

    box-sizing: border-box;
}

.finsight-view-filter-options {
    max-height: 220px;
    overflow-y: auto;
}

.finsight-view-filter-option {
    min-height: 32px;

    padding: 6px 10px;

    display: flex;
    align-items: center;
    gap: 7px;

    cursor: pointer;

    color: #334155;
    font-size: 11px;

    box-sizing: border-box;
}

.finsight-view-filter-option:hover {
    background: #f8fafc;
}

.finsight-view-filter-option input {
    margin: 0;
    flex-shrink: 0;
}

.finsight-view-filter-empty {
    padding: 12px;

    color: #94a3b8;
    font-size: 11px;
    text-align: center;
}

/* =========================================================
   FILTER ACTIONS
========================================================= */

.finsight-view-filter-actions {
    display: flex;
    align-items: flex-end;
    gap: 7px;

    height: 53px;
    flex-shrink: 0;
}

.finsight-view-filter-reset,
.finsight-view-filter-apply {
    height: 34px;

    padding: 0 14px;

    border-radius: 6px;

    font-size: 11px;
    font-weight: 600;

    cursor: pointer;
    box-sizing: border-box;
}

.finsight-view-filter-reset {
    border: 1px solid #d5dee8;
    background: #ffffff;
    color: #475569;
}

.finsight-view-filter-reset:hover {
    background: #f1f5f9;
}

.finsight-view-filter-apply {
    background: #2563EB;
    color: #FFFFFF;
    border: 1px solid #2563EB;
}

.finsight-view-filter-apply:hover {
    background: #1D4ED8;
}

/* =========================================================
   ACTION ROW
========================================================= */

.finsight-detail-toolbar-right {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: flex-end;

    gap: 7px;

    min-width: 0;
}

/* Search */

.finsight-detail-search {
    position: relative;

    width: 260px;
    height: 34px;

    flex-shrink: 0;
}

.finsight-detail-search-icon {
    position: absolute;

    left: 10px;
    top: 50%;

    transform: translateY(-50%);

    color: #94a3b8;

    font-size: 13px;
    line-height: 1;

    pointer-events: none;
}

.finsight-detail-search-input {
    width: 100%;
    height: 34px;

    padding: 0 10px 0 30px;

    border: 1px solid #d5dee8;
    border-radius: 6px;

    outline: none;

    background: #ffffff;
    color: #334155;

    font-size: 11px;

    box-sizing: border-box;
}

.finsight-detail-search-input::placeholder {
    color: #94a3b8;
}

.finsight-detail-search-input:focus {
    border-color: #9db7d2;

    box-shadow:
        0 0 0 2px rgba(59, 130, 246, 0.08);
}

/* Export buttons */

.finsight-detail-export-button {
    height: 34px;

    padding: 0 12px;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;

    border: 1px solid #d5dee8;
    border-radius: 6px;

    background: #ffffff;
    color: #475569;

    font-size: 11px;
    line-height: 16px;
    font-weight: 600;

    cursor: pointer;
    white-space: nowrap;

    box-sizing: border-box;
}

.finsight-detail-export-button:hover {
    background: #f1f5f9;
    border-color: #c5d1dd;
    color: #26384d;
}

.finsight-detail-export-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

/* Record count */

.finsight-detail-records {
    margin-left: 4px;

    white-space: nowrap;

    color: #8aa0b7;

    font-size: 11px;
}

                .finsight-detail-filters {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 5px;
                    min-width: 0;
                }


                .finsight-detail-filter-chip {
                    min-height: 32px;
                    padding:
                        0 10px;
                    box-sizing: border-box;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    white-space: nowrap;
                    background:
                        #ffffff;
                    border:
                        1px solid #d9e2eb;
                    border-radius:
                        6px;
                    color:
                        #475569;
                    font-size:
                        11px;
                    line-height:
                        16px;
                }


                .finsight-detail-filter-chip-label {
                    color:
                        #64748b;
                    font-weight:
                        600;
                }


                .finsight-detail-toolbar-right {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 6px;
                    flex-shrink: 0;
                }


                .finsight-detail-search {
                    position: relative;
                    width: 190px;
                    height: 32px;
                    flex-shrink: 0;
                }


                .finsight-detail-search-icon {
                    position: absolute;
                    left: 9px;
                    top: 50%;
                    transform:
                        translateY(-50%);
                    color:
                        #94a3b8;
                    font-size: 14px;
                    line-height: 1;
                    pointer-events: none;
                }


                .finsight-detail-search-input {
                    width: 100%;
                    height: 32px;
                    padding:
                        0 10px 0 29px;
                    border:
                        1px solid #d5dee8;
                    border-radius:
                        6px;
                    outline: none;
                    background:
                        #ffffff;
                    color:
                        #334155;
                    font-size:
                        11px;
                    box-sizing:
                        border-box;
                    transition:
                        border-color 0.15s ease,
                        box-shadow 0.15s ease;
                }


                .finsight-detail-search-input::placeholder {
                    color:
                        #94a3b8;
                }


                .finsight-detail-search-input:focus {
                    border-color:
                        #9db7d2;
                    box-shadow:
                        0 0 0 2px
                        rgba(59, 130, 246, 0.08);
                }


                .finsight-detail-export-button {
                    height: 32px;
                    padding:
                        0 10px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    border:
                        1px solid #d5dee8;
                    border-radius:
                        6px;
                    background:
                        #ffffff;
                    color:
                        #475569;
                    font-size:
                        11px;
                    line-height:
                        16px;
                    font-weight:
                        600;
                    cursor:
                        pointer;
                    white-space:
                        nowrap;
                    transition:
                        background 0.15s ease,
                        border-color 0.15s ease,
                        color 0.15s ease;
                }


                .finsight-detail-export-button:hover {
                    background:
                        #f1f5f9;
                    border-color:
                        #c5d1dd;
                    color:
                        #26384d;
                }


                .finsight-detail-export-button:disabled {
                    opacity:
                        0.45;
                    cursor:
                        not-allowed;
                }


                .finsight-detail-export-icon {
                    font-size:
                        13px;
                    line-height:
                        1;
                }


                .finsight-detail-records {
                    margin-left: 3px;
                    white-space: nowrap;
                    color:
                        #8aa0b7;
                    font-size:
                        11px;
                }


                .finsight-detail-content {
                    flex: 1;
                    min-height: 0;
                    overflow: hidden;
                    padding:
                        0 16px 8px;
                    background:
                        #ffffff;
                    box-sizing:
                        border-box;
                }


                .finsight-detail-table-scroll {
                    width: 100%;
                    height: 100%;
                    overflow:
                        auto;
                    scrollbar-width:
                        thin;
                    scrollbar-color:
                        #cbd5e1 transparent;
                }


                .finsight-detail-table-scroll::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }


                .finsight-detail-table-scroll::-webkit-scrollbar-track {
                    background:
                        transparent;
                }


                .finsight-detail-table-scroll::-webkit-scrollbar-thumb {
                    background:
                        #cbd5e1;
                    border-radius:
                        8px;
                }


                .finsight-detail-table-scroll::-webkit-scrollbar-thumb:hover {
                    background:
                        #94a3b8;
                }


                .finsight-detail-table-wrapper {
                    width: 100%;
                    min-width: 100%;
                    overflow: hidden;
                    border:
                        1px solid #dce4ec;
                    border-top: 0;
                    box-sizing: border-box;
                }


                .finsight-detail-table {
                    width: 100%;
                    min-width: 720px;
                    border-collapse:
                        separate;
                    border-spacing: 0;
                    font-family:
                        inherit;
                    table-layout:
                        auto;
                }


                .finsight-detail-table thead th {
                    position: sticky;
                    top: 0;
                    z-index: 3;
                    padding:
                        10px 9px;
                    background:
                        #f1f5f9;
                    color:
                        #123a69;
                    border-bottom:
                        1px solid #cbd7e4;
                    border-right:
                        1px solid #d5dee8;
                    font-size:
                        11px;
                    line-height:
                        16px;
                    font-weight:
                        700;
                    letter-spacing:
                        0.35px;
                    text-transform:
                        uppercase;
                    white-space:
                        nowrap;
                    box-sizing:
                        border-box;
                }


                .finsight-detail-table thead th:first-child {
                    padding-left:
                        9px;
                }


                .finsight-detail-table thead th:last-child {
                    border-right:
                        0;
                }


                .finsight-detail-table tbody td {
                    padding:
                        8px 9px;
                    color:
                        #334155;
                    border-bottom:
                        1px solid #edf1f5;
                    border-right:
                        1px solid #edf1f5;
                    font-size:
                        12px;
                    line-height:
                        17px;
                    white-space:
                        nowrap;
                    box-sizing:
                        border-box;
                }


                .finsight-detail-table tbody tr:nth-child(even) td {
                    background:
                        #f8fafc;
                }


                .finsight-detail-table tbody tr:hover td {
                    background:
                        #f2f6fa;
                }


                .finsight-detail-table tbody td:first-child {
                    color:
                        #26384d;
                    font-weight:
                        600;
                }


                .finsight-detail-table tbody td:last-child {
                    border-right:
                        0;
                }


                .finsight-detail-table tfoot td {
                    position: sticky;
                    bottom: 0;
                    z-index: 2;
                    padding:
                        9px;
                    background:
                        #f3f6f9;
                    color:
                        #1e2f43;
                    border-top:
                        1px solid #d3dde7;
                    border-right:
                        1px solid #dfe6ed;
                    font-size:
                        12px;
                    line-height:
                        17px;
                    font-weight:
                        700;
                    white-space:
                        nowrap;
                    box-sizing:
                        border-box;
                }


                .finsight-detail-table tfoot td:last-child {
                    border-right:
                        0;
                }


                .finsight-detail-table .text-left {
                    text-align:
                        left;
                }


                .finsight-detail-table .text-right {
                    text-align:
                        right;
                }


                .finsight-detail-loading {
                    min-height:
                        280px;
                    height:
                        100%;
                    display:
                        flex;
                    align-items:
                        center;
                    justify-content:
                        center;
                    color:
                        #64748b;
                    font-size:
                        13px;
                }


                .finsight-detail-empty {
                    min-height:
                        280px;
                    height:
                        100%;
                    display:
                        flex;
                    flex-direction:
                        column;
                    align-items:
                        center;
                    justify-content:
                        center;
                    color:
                        #64748b;
                    text-align:
                        center;
                }


                .finsight-detail-empty-title {
                    color:
                        #334155;
                    font-size:
                        14px;
                    font-weight:
                        600;
                }


                .finsight-detail-empty-message {
                    margin-top:
                        5px;
                    font-size:
                        12px;
                }


                .finsight-detail-footer {
                    min-height:
                        64px;
                    padding:
                        12px 20px;
                    box-sizing:
                        border-box;
                    display:
                        flex;
                    align-items:
                        center;
                    justify-content:
                        flex-end;
                    background:
                        #ffffff;
                    border-top:
                        1px solid #e5ebf2;
                    flex-shrink:
                        0;
                }


                .finsight-detail-footer-button {
                    min-width:
                        70px;
                    height:
                        31px;
                    padding:
                        0 16px;
                    border:
                        1px solid #d4dce5;
                    border-radius:
                        7px;
                    background:
                        #f1f5f9;
                    color:
                        #41566d;
                    font-size:
                        12px;
                    font-weight:
                        600;
                    cursor:
                        pointer;
                    transition:
                        background 0.15s ease;
                }


                .finsight-detail-footer-button:hover {
                    background:
                        #e8eef5;
                }


                @media (max-width: 1100px) {

                    .finsight-detail-toolbar {
                        align-items:
                            flex-start;
                    }

                    .finsight-detail-toolbar-right {
                        width:
                            100%;
                        justify-content:
                            flex-start;
                    }

                    .finsight-detail-records {
                        margin-left:
                            auto;
                    }

                }


                @media (max-width: 900px) {

                    .finsight-detail-backdrop {
                        padding:
                            14px;
                    }

                    .finsight-detail-modal {
                        height:
                            calc(100vh - 28px);
                        min-height:
                            420px;
                        border-radius:
                            10px;
                    }

                    .finsight-detail-toolbar {
                        align-items:
                            flex-start;
                    }

                    .finsight-detail-toolbar-left {
                        width:
                            100%;
                    }

                    .finsight-detail-toolbar-right {
                        width:
                            100%;
                        justify-content:
                            flex-start;
                    }

                    .finsight-detail-search {
                        flex:
                            1 1 180px;
                    }

                    .finsight-detail-records {
                        margin-left:
                            3px;
                    }

                }


                @media (max-width: 600px) {

                    .finsight-detail-search {
                        width:
                            100%;
                    }

                    .finsight-detail-export-button {
                        flex:
                            1 1 auto;
                    }

                }

            `}</style>


      {/* =====================================================
                BACKDROP
            ===================================================== */}

      <div
        className="finsight-detail-backdrop"
        onClick={(event) => {

          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }

        }}
      >


        {/* =================================================
                    MODAL
                ================================================= */}

        <div className="finsight-detail-modal">


          {/* =================================================
                        HEADER
                    ================================================= */}

          <div className="finsight-detail-header">

            <div>

              <div className="finsight-detail-title">
                {title}
              </div>


              {subtitle && (
                <div className="finsight-detail-subtitle">
                  {subtitle}
                </div>
              )}

            </div>


            <button
              type="button"
              className="finsight-detail-close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>

          </div>
          <div className="finsight-detail-toolbar">

            {/* =====================================================
        FILTER ROW
    ===================================================== */}

     <div
    style={{
        padding: "16px 22px",
        borderBottom:
            "1px solid #f1f5f9",
        display: "flex",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: "12px",
        background: "#ffffff",
        flexShrink: 0,
    }}
>
    {/* Year Filter */}

    <MultiSelectDropdown
        label="Year"
        options={
            filterOptions?.years ||
            filterOptions?.fiscal_years ||
            []
        }
        selectedValues={
            viewAllFilters.year
        }
        onChange={(values) =>
            setViewAllFilters(
                (previous) => ({
                    ...previous,
                    year: values,
                })
            )
        }
    />

    {/* Legal Entity Filter */}

    <MultiSelectDropdown
        label="Legal Entity"
        options={
            filterOptions?.legal_entities ||
            []
        }
        selectedValues={
            viewAllFilters.legal_entity
        }
        onChange={(values) =>
            setViewAllFilters(
                (previous) => ({
                    ...previous,
                    legal_entity: values,
                })
            )
        }
    />

    {/* Parent Division Filter */}

    <MultiSelectDropdown
        label="Parent Division"
        options={
            filterOptions?.parent_divisions ||
            []
        }
        selectedValues={
            viewAllFilters.parent_division
        }
        onChange={(values) =>
            setViewAllFilters(
                (previous) => ({
                    ...previous,
                    parent_division: values,
                })
            )
        }
    />

    {/* Sub-Division Filter */}

    <MultiSelectDropdown
        label="Sub-Division"
        options={
            filterOptions?.subdivisions ||
            []
        }
        selectedValues={
            viewAllFilters.subdivision
        }
        onChange={(values) =>
            setViewAllFilters(
                (previous) => ({
                    ...previous,
                    subdivision: values,
                })
            )
        }
    />

    {/* Period Filter */}

    <MultiSelectDropdown
        label="Period"
        options={
            filterOptions?.periods ||
            []
        }
        selectedValues={
            viewAllFilters.period
        }
        onChange={(values) =>
            setViewAllFilters(
                (previous) => ({
                    ...previous,
                    period: values,
                })
            )
        }
    />

    {/* Apply / Reset / Export */}

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginLeft: "auto",
        }}
    >
        <button
            type="button"
            onClick={handleApplyViewAllFilters}
            style={{
                height: "38px",
                padding: "0 22px",
                borderRadius: "10px",
                border: "none",
                background: "#5c60f5",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                outline: "none",
            }}
        >
            Apply
        </button>

        <button
            type="button"
            onClick={handleViewAllReset}
            style={{
                height: "38px",
                padding: "0 18px",
                borderRadius: "10px",
                border:
                    "1px solid #e0e6ed",
                background: "#ffffff",
                color: "#2b3b75",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                outline: "none",
            }}
        >
            Reset
        </button>

        
    </div>
</div>


            {/* =====================================================
        SEARCH + EXPORT ROW
    ===================================================== */}

            <div className="finsight-detail-toolbar-right">

              {/* SEARCH */}

              <div className="finsight-detail-search">

                <span
                  className="finsight-detail-search-icon"
                  aria-hidden="true"
                >
                  🔍
                </span>

                <input
                  type="text"
                  className="finsight-detail-search-input"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search..."
                  aria-label="Search detailed data"
                />

              </div>


              <ExportButtons
                endpoint={`view-all-${viewAllType}`}
                exporting={exporting}
                handleExport={handleExport}
              />


              {/* RECORD COUNT */}

              <div className="finsight-detail-records">

                {filteredRows.length}{" "}

                {filteredRows.length === 1
                  ? "record"
                  : "records"}

              </div>

            </div>

          </div>


          {/* =================================================
                        CONTENT
                    ================================================= */}

          <div className="finsight-detail-content">

            {loading ? (

              <div className="finsight-detail-loading">
                Loading detailed data...
              </div>

            ) : filteredRows.length === 0 ? (

              <div className="finsight-detail-empty">

                <div className="finsight-detail-empty-title">

                  {searchTerm.trim()
                    ? "No matching records"
                    : "No data available"}

                </div>


                <div className="finsight-detail-empty-message">

                  {searchTerm.trim()
                    ? "Try changing your search."
                    : "Try changing the selected filters."}

                </div>

              </div>

            ) : (

              <div className="finsight-detail-table-scroll">

                {isActualVsTarget ? (

                  <ActualVsTargetTable
                    rows={filteredRows}
                    currency={currency}
                  />

                ) : (

                  <GenericTable
                    rows={filteredRows}
                    currency={currency}
                    categoryLabel={
                      categoryLabel
                    }
                    firstMetricLabel={
                      firstMetricLabel
                    }
                    secondMetricLabel={
                      secondMetricLabel
                    }
                    firstMetricType={
                      firstMetricType
                    }
                    secondMetricType={
                      secondMetricType
                    }
                    firstMetricKeys={
                      firstMetricKeys
                    }
                    secondMetricKeys={
                      secondMetricKeys
                    }
                    categoryKeys={
                      categoryKeys
                    }
                    totalLabel={
                      totalLabel
                    }
                  />

                )}

              </div>

            )}

          </div>


          {/* =================================================
                        FOOTER
                    ================================================= */}

          <div className="finsight-detail-footer">

            <button
              type="button"
              className="finsight-detail-footer-button"
              onClick={onClose}
            >
              Close
            </button>

          </div>

        </div>

      </div>

    </>
  );
}
