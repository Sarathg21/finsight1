
import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    ChevronRight,
    ChevronDown,
    ChevronsUp,
    X,
    MoreVertical,
    Search,
    FileSpreadsheet,
    FileText, Eye,
} from "lucide-react";
import ExportButtons from "../Common/ExportButtons";
import { deriveCategoryNaturalAccounts } from "../../data/opexNaturalAccounts";

/* =========================================================
   FORMAT VALUE

   AED MODE:
   AED 18,294,759.38

   AED MILLIONS MODE:
   18.29M
========================================================= */

const formatValue = (value, unit = "millions") => {
    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "-" ||
        value === "—"
    ) {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "—";
    }

    if (number === 0) {
        return unit === "aed"
            ? "AED 0.00"
            : "0";
    }

    /* =====================================================
       AED MILLIONS
    ===================================================== */

    if (unit === "millions") {
        const millions = number / 1000000;

        if (Math.abs(millions) < 0.01) {
            return millions < 0
                ? "-<0.01M"
                : "<0.01M";
        }

        return `${millions.toFixed(2)}M`;
    }

    /* =====================================================
       AED INTERNATIONAL FORMAT
    ===================================================== */

    return `AED ${number.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

/* =========================================================
   MONTHS

   ALWAYS RENDER ALL 12 MONTHS.
   Missing backend values => —
========================================================= */

const months = [
    { key: "jan", label: "Jan" },
    { key: "feb", label: "Feb" },
    { key: "mar", label: "Mar" },
    { key: "apr", label: "Apr" },
    { key: "may", label: "May" },
    { key: "jun", label: "Jun" },
    { key: "jul", label: "Jul" },
    { key: "aug", label: "Aug" },
    { key: "sep", label: "Sep" },
    { key: "oct", label: "Oct" },
    { key: "nov", label: "Nov" },
    { key: "dec", label: "Dec" },
];

/* =========================================================
   EMPTY VALUE CHECK
========================================================= */

const isEmptyValue = (value) => {
    return (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "-" ||
        value === "—"
    );
};

/* =========================================================
   GET MONTHLY ACTUAL
========================================================= */

const getMonthlyActual = (item) => {
    return (
        item?.monthly_actual ??
        item?.monthlyActual ??
        item?.monthly_actual_aed ??
        item?.monthlyActualAed ??
        item?.monthly_actuals ??
        item?.monthlyActuals ??
        null
    );
};

/* =========================================================
   GET MONTH VALUE
========================================================= */

const getMonthValue = (
    item,
    monthKey,
    monthLabel
) => {
    const monthlyActual =
        getMonthlyActual(item);

    if (
        monthlyActual === null ||
        monthlyActual === undefined
    ) {
        if (item && typeof item === "object") {
            const normKey = String(monthKey).toLowerCase();
            const normLabel = String(monthLabel).toLowerCase();
            for (const k of Object.keys(item)) {
                const lk = k.toLowerCase();
                if (lk === normKey || lk === normLabel || lk.startsWith(normKey) || lk.startsWith(normLabel)) {
                    const v = item[k];
                    if (v && typeof v === "object") {
                        return v?.value ?? v?.actual ?? v?.amount ?? null;
                    }
                    return v;
                }
            }
        }
        return null;
    }

    if (
        typeof monthlyActual === "object" &&
        !Array.isArray(monthlyActual)
    ) {
        const keys =
            Object.keys(monthlyActual);

        const normalizedLabel =
            String(monthLabel)
                .trim()
                .toLowerCase();

        const normalizedMonthKey =
            String(monthKey)
                .trim()
                .toLowerCase();

        const matchingKey =
            keys.find((key) => {
                const normalizedKey =
                    String(key)
                        .trim()
                        .toLowerCase();

                return (
                    normalizedKey ===
                    normalizedLabel ||
                    normalizedKey.startsWith(
                        normalizedLabel
                    ) ||
                    normalizedKey ===
                    normalizedMonthKey ||
                    normalizedKey.startsWith(
                        normalizedMonthKey
                    )
                );
            });

        if (!matchingKey) {
            return null;
        }

        const monthValue =
            monthlyActual[matchingKey];

        if (
            monthValue &&
            typeof monthValue === "object"
        ) {
            return (
                monthValue?.value ??
                monthValue?.actual ??
                monthValue?.amount ??
                monthValue?.monthly_actual ??
                null
            );
        }

        return monthValue;
    }

    if (
        Array.isArray(monthlyActual)
    ) {
        const monthData =
            monthlyActual.find(
                (entry) => {
                    const entryMonth =
                        entry?.month ??
                        entry?.month_name ??
                        entry?.monthName;

                    if (!entryMonth) {
                        return false;
                    }

                    const normalizedEntryMonth =
                        String(entryMonth)
                            .trim()
                            .toLowerCase();

                    const normalizedLabel =
                        String(monthLabel)
                            .trim()
                            .toLowerCase();

                    const normalizedKey =
                        String(monthKey)
                            .trim()
                            .toLowerCase();

                    return (
                        normalizedEntryMonth ===
                        normalizedLabel ||
                        normalizedEntryMonth.startsWith(
                            normalizedLabel
                        ) ||
                        normalizedEntryMonth ===
                        normalizedKey ||
                        normalizedEntryMonth.startsWith(
                            normalizedKey
                        )
                    );
                }
            );

        if (monthData) {
            return (
                monthData?.value ??
                monthData?.actual ??
                monthData?.amount ??
                monthData?.monthly_actual ??
                null
            );
        }
    }

    return null;
};

/* =========================================================
   GET TOTAL MONTH VALUE
========================================================= */

const getTotalMonthValue = (
    data,
    monthKey,
    monthLabel
) => {
    if (
        !Array.isArray(data) ||
        !data.length
    ) {
        return null;
    }

    let total = 0;
    let hasValue = false;

    data.forEach((item) => {
        const value =
            getMonthValue(
                item,
                monthKey,
                monthLabel
            );

        if (!isEmptyValue(value)) {
            const number =
                Number(value);

            if (
                Number.isFinite(number)
            ) {
                total += number;
                hasValue = true;
            }
        }
    });

    return hasValue
        ? total
        : null;
};

/* =========================================================
   GET ACTUAL YTD
========================================================= */

const getActualYTD = (item) => {
    return (
        item?.actual_ytd ??
        item?.actualYTD ??
        item?.actual_ytd_aed ??
        item?.actualYtdaed ??
        item?.ytd ??
        null
    );
};

/* =========================================================
   GET TOTAL YTD
========================================================= */

const getTotalYTD = (data) => {
    if (
        !Array.isArray(data) ||
        !data.length
    ) {
        return null;
    }

    let total = 0;
    let hasValue = false;

    data.forEach((item) => {
        const value =
            getActualYTD(item);

        if (!isEmptyValue(value)) {
            const number =
                Number(value);

            if (
                Number.isFinite(number)
            ) {
                total += number;
                hasValue = true;
            }
        }
    });

    return hasValue
        ? total
        : null;
};

/* =========================================================
   GET TARGET YTD
========================================================= */

const getTargetYTD = (item) => {
    return (
        item?.target_ytd ??
        item?.targetYTD ??
        item?.target ??
        null
    );
};

/* =========================================================
   GET VARIANCE YTD
========================================================= */

const getVarianceYTD = (item) => {
    return (
        item?.variance_ytd ??
        item?.varianceYTD ??
        item?.variance ??
        null
    );
};

/* =========================================================
   GET VARIANCE %
========================================================= */

const getVarianceYTDPercent = (item) => {
    return (
        item?.variance_ytd_pct ??
        item?.varianceYTDPercent ??
        item?.variancePercent ??
        null
    );
};

/* =========================================================
   GET DETAILS
========================================================= */

const getDetails = (value) => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    if (Array.isArray(value?.data)) {
        return value.data;
    }

    if (Array.isArray(value?.details)) {
        return value.details;
    }

    if (
        Array.isArray(
            value?.categoryDetails
        )
    ) {
        return value.categoryDetails;
    }

    if (
        Array.isArray(
            value?.naturalAccounts
        )
    ) {
        return value.naturalAccounts;
    }

    if (
        Array.isArray(
            value?.natural_accounts
        )
    ) {
        return value.natural_accounts;
    }

    if (
        Array.isArray(
            value?.accounts
        )
    ) {
        return value.accounts;
    }

    return [];
};

/* =========================================================
   GET ACCOUNT NAME
========================================================= */

const getAccountName = (account) => {
    return (
        account?.account_name ??
        account?.accountName ??
        account?.natural_account_name ??
        account?.naturalAccountName ??
        account?.account ??
        account?.name ??
        "—"
    );
};

/* =========================================================
   GET ACCOUNT CODE
========================================================= */

const getAccountCode = (account) => {
    return (
        account?.account_code ??
        account?.accountCode ??
        account?.natural_account_code ??
        account?.naturalAccountCode ??
        account?.natural_account_id ??
        "—"
    );
};

/* =========================================================
   GET NATURAL ACCOUNT LABEL
========================================================= */

const getNaturalAccountLabel = (
    account
) => {
    const code =
        String(
            getAccountCode(account) ?? ""
        ).trim();

    const name =
        String(
            getAccountName(account) ?? ""
        ).trim();

    if (
        !code ||
        code === "—"
    ) {
        return name || "—";
    }

    if (
        !name ||
        name === "—"
    ) {
        return code;
    }

    const normalizedCode =
        code.toLowerCase();

    const normalizedName =
        name.toLowerCase();

    if (
        normalizedName ===
        normalizedCode ||
        normalizedName.startsWith(
            `${normalizedCode} -`
        ) ||
        normalizedName.startsWith(
            `${normalizedCode}-`
        ) ||
        normalizedName.startsWith(
            `${normalizedCode} `
        )
    ) {
        return name;
    }

    return `${code} ${name}`;
};

/* =========================================================
   GET ACCOUNT MONTH VALUE
========================================================= */

const getAccountMonthValue = (
    account,
    monthKey,
    monthLabel
) => {
    return getMonthValue(
        account,
        monthKey,
        monthLabel
    );
};

/* =========================================================
   CSV ESCAPE
========================================================= */

const escapeCsvValue = (value) => {
    const stringValue =
        value === null ||
            value === undefined
            ? ""
            : String(value);

    return `"${stringValue.replace(
        /"/g,
        '""'
    )}"`;
};

/* =========================================================
   FILTER LABEL HELPER (Human readable key & value names)
========================================================= */

const formatFilterKey = (key) => {
    if (!key) return "";
    return key
        .replace(/_/g, " ")
        .replace(/\bid\b/gi, "")
        .replace(/\bcode\b/gi, "")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const resolveOptionName = (singleVal, filterKey, filterOptions) => {
    if (singleVal === null || singleVal === undefined) return "";

    let targetCode = singleVal;
    if (typeof singleVal === "object") {
        targetCode = singleVal.code || singleVal.id || singleVal.value || singleVal.name || singleVal.label;
    }

    const targetCodeStr = String(targetCode).trim();

    if (filterOptions && typeof filterOptions === "object") {
        const matchingOptionsList =
            filterOptions[filterKey] ||
            filterOptions[filterKey + "s"] ||
            filterOptions[filterKey.replace(/_id$|_code$/i, "")] ||
            filterOptions[filterKey.replace(/_id$|_code$/i, "") + "s"];

        if (Array.isArray(matchingOptionsList)) {
            const foundOption = matchingOptionsList.find((opt) => {
                if (opt === null || opt === undefined) return false;
                if (typeof opt === "object") {
                    const optCode = opt.code ?? opt.id ?? opt.value ?? opt.key;
                    return String(optCode).trim() === targetCodeStr;
                }
                return String(opt).trim() === targetCodeStr;
            });

            if (foundOption) {
                if (typeof foundOption === "object") {
                    return (
                        foundOption.name ||
                        foundOption.label ||
                        foundOption.title ||
                        foundOption.display_name ||
                        foundOption.code ||
                        targetCodeStr
                    );
                }
                return String(foundOption);
            }
        }
    }

    if (typeof singleVal === "object") {
        return (
            singleVal.name ||
            singleVal.label ||
            singleVal.title ||
            singleVal.code ||
            targetCodeStr
        );
    }

    return targetCodeStr;
};

const formatFilterValue = (val, filterKey, filterOptions) => {
    if (val === null || val === undefined) return "";
    if (Array.isArray(val)) {
        return val
            .map((item) => resolveOptionName(item, filterKey, filterOptions))
            .filter(Boolean)
            .join(", ");
    }
    return resolveOptionName(val, filterKey, filterOptions);
};


/* =========================================================
   CUSTOM MULTI-SELECT DROPDOWN COMPONENT (MATCHING UI REFERENCE)
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

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    /* =====================================================
    FILTER OPTION HELPERS
 ===================================================== */

    const getFilterOptionId = (option) => {
        if (
            option === null ||
            option === undefined
        ) {
            return "";
        }

        if (typeof option !== "object") {
            return String(option);
        }

        return String(
            option.value ??
            option.id ??
            option.code ??
            option.legal_entity_id ??
            option.parent_division_id ??
            option.subdivision_id ??
            option.period_name ??
            option.year ??
            option.name ??
            ""
        );
    };

    const getFilterOptionName = (option) => {
        if (
            option === null ||
            option === undefined
        ) {
            return "";
        }

        if (typeof option !== "object") {
            return String(option);
        }

        return String(
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

    /* =====================================================
       FORMAT OPTIONS
    ===================================================== */

    const formattedOptions = useMemo(() => {
        return options.map((opt) => ({
            id: String(getFilterOptionId(opt)),
            name: String(getFilterOptionName(opt)),
        }));
    }, [options]);

    const normalizedSelectedValues = useMemo(() => {
        if (!Array.isArray(selectedValues)) {
            return [];
        }

        return selectedValues.map((value) => String(value));
    }, [selectedValues]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) {
            return formattedOptions;
        }

        return formattedOptions.filter((opt) =>
            opt.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
    }, [formattedOptions, searchTerm]);

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

    const handleSelectAll = () => {
        const allIds = formattedOptions.map(
            (opt) => opt.id
        );

        onChange(allIds);
    };

    const handleClear = () => {
        onChange([]);
    };

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
                    (opt) =>
                        opt.id ===
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
            <label
                style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#2b3b75",
                }}
            >
                {label}
            </label>

            <button
                type="button"
                onClick={() =>
                    setIsOpen((prev) => !prev)
                }
                style={{
                    height: "38px",
                    minWidth: "130px",
                    padding: "0 12px",
                    borderRadius: "10px",
                    border: "1px solid #e0e6ed",
                    background: "#ffffff",
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

            {isOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: "4px",
                        width: "220px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
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
                                position: "absolute",
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
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
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
                                boxSizing: "border-box",
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
                            onClick={handleSelectAll}
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
                                (opt) => {
                                    /*
                                     * IMPORTANT:
                                     * Empty selection means
                                     * NOTHING is selected.
                                     */
                                    const isChecked =
                                        normalizedSelectedValues.includes(
                                            opt.id
                                        );

                                    return (
                                        <label
                                            key={opt.id}
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
                                                        opt.id
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
                                                    opt.name
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
   MAIN COMPONENT
========================================================= */

export default function MonthOnMonthOpexReport({
    data = [],
    viewAllData = [],
    totalData = null,
    detailLoading = {},
    periodName = "Sep-26",
    reportingCurrency = "AED",
    hierarchyFilters = {},
    filterOptions = {},
    onApplyFilters,
}) {
    const [collapsed, setCollapsed] =
        useState(false);

    const [unit, setUnit] =
        useState("millions");

    const [expandedRows, setExpandedRows] =
        useState({});

    const [categoryDetails, setCategoryDetails] =
        useState({});

    const [
        categoryDetailLoading,
        setCategoryDetailLoading,
    ] = useState({});

    const [
        categoryDetailError,
        setCategoryDetailError,
    ] = useState({});

    /* =====================================================
       VIEW ALL
    ===================================================== */

    const [showViewAll, setShowViewAll] =
        useState(false);

    const [viewAllFilters, setViewAllFilters] = useState({
        year: [],
        legal_entity: [],
        parent_division: [],
        subdivision: [],
        period: [],
    });

    const initialViewAllFiltersRef = useRef(null);
    // FIX: View All initialization guard
    const viewAllInitializedRef = useRef(false);

    const getSelectedFilterValues = (value) => {
        if (
            value === undefined ||
            value === null ||
            value === "" ||
            value === "All"
        ) {
            return [];
        }

        if (Array.isArray(value)) {
            return value.filter(
                (item) =>
                    item !== undefined &&
                    item !== null &&
                    item !== "" &&
                    item !== "All"
            );
        }

        return [value];
    };

    // FIX: View All initialization guard
    useEffect(() => {
        if (!showViewAll) {
            viewAllInitializedRef.current = false;
            return;
        }

        // Do not overwrite selections after the user changes them.
        if (viewAllInitializedRef.current) {
            return;
        }

        viewAllInitializedRef.current = true;

        const initialFilters = {
            year: getSelectedFilterValues(
                hierarchyFilters?.year
            ),

            legal_entity: getSelectedFilterValues(
                hierarchyFilters?.legal_entity_id
            ),

            parent_division: getSelectedFilterValues(
                hierarchyFilters?.parent_division_id
            ),

            subdivision: getSelectedFilterValues(
                hierarchyFilters?.subdivision_id
            ),

            period: getSelectedFilterValues(
                periodName
            ),
        };

        initialViewAllFiltersRef.current = initialFilters;

        setViewAllFilters(initialFilters);

        // IMPORTANT:
        // Initialize only once when View All opens.
        // Do not re-initialize when parent filters/data change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showViewAll]);

    /* =====================================================
       THREE DOT MENU
    ===================================================== */

    const [showExportMenu, setShowExportMenu] =
        useState(false);

    const [monthMenuOpen, setMonthMenuOpen] = useState(false);

    const exportMenuRef =
        useRef(null);

    const [exporting, setExporting] = useState("");





    /* =====================================================
       CLOSE MENU WHEN CLICKING OUTSIDE
    ===================================================== */

    useEffect(() => {
        const handleOutsideClick = (
            event
        ) => {
            if (
                exportMenuRef.current &&
                !exportMenuRef.current.contains(
                    event.target
                )
            ) {
                setShowExportMenu(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);


    // FIX: View All Apply filter mapping - local change handler
    const handleFilterChange = (key, values) => {
        setViewAllFilters((prev) => ({
            ...prev,
            [key]: Array.isArray(values) ? values : [],
        }));
    };

    // FIX: View All Apply filter mapping
    const handleApplyViewAllFilters = async () => {
        const filtersToApply = {
            year: Array.isArray(viewAllFilters?.year)
                ? [...viewAllFilters.year]
                : [],

            legal_entity: Array.isArray(viewAllFilters?.legal_entity)
                ? [...viewAllFilters.legal_entity]
                : [],

            parent_division: Array.isArray(viewAllFilters?.parent_division)
                ? [...viewAllFilters.parent_division]
                : [],

            subdivision: Array.isArray(viewAllFilters?.subdivision)
                ? [...viewAllFilters.subdivision]
                : [],

            // IMPORTANT:
            // Period must come from the current local View All state.
            // Do NOT replace an empty period with "All".
            period: Array.isArray(viewAllFilters?.period)
                ? [...viewAllFilters.period]
                : [],
        };

        // Apply must use ONLY the dedicated View All callback.
        if (typeof onApplyFilters === "function") {
            await onApplyFilters(filtersToApply);
        }
    };
    // FIX: View All Reset filter mapping - restore initial View All filters
    const handleViewAllReset = async () => {
        const fallbackPeriod = getSelectedFilterValues(periodName);
        const initialPeriod = (initialViewAllFiltersRef.current?.period && initialViewAllFiltersRef.current.period.length > 0)
            ? initialViewAllFiltersRef.current.period
            : fallbackPeriod;

        const resetFilters = {
            year: [
                ...(initialViewAllFiltersRef.current?.year || [])
            ],
            legal_entity: [
                ...(initialViewAllFiltersRef.current?.legal_entity || [])
            ],
            parent_division: [
                ...(initialViewAllFiltersRef.current?.parent_division || [])
            ],
            subdivision: [
                ...(initialViewAllFiltersRef.current?.subdivision || [])
            ],
            period: [
                ...(initialPeriod || [])
            ],
        };

        setViewAllFilters(resetFilters);

        // This refreshes ONLY View All data using initial values
        if (typeof onApplyFilters === "function") {
            await onApplyFilters({
                ...resetFilters,
                legal_entity_id: [...(resetFilters.legal_entity || [])],
                parent_division_id: [...(resetFilters.parent_division || [])],
                subdivision_id: [...(resetFilters.subdivision || [])],
                period_name: [...(resetFilters.period || [])],
            });
        }
    };

    /* =====================================================
       NORMALIZE DATA
    ===================================================== */

    const rows =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
                ? data.data
                : [];

    const viewAllRows =
        Array.isArray(viewAllData)
            ? viewAllData
            : Array.isArray(viewAllData?.data)
                ? viewAllData.data
                : Array.isArray(viewAllData?.items)
                    ? viewAllData.items
                    : [];
    /* =====================================================
       ACTIVE FILTERS
    ===================================================== */

    const activeFilters = useMemo(() => {
        const filters = {};

        if (periodName) {
            filters.period_name =
                periodName;
        }

        if (reportingCurrency) {
            filters.reporting_currency =
                reportingCurrency;
        }

        if (
            hierarchyFilters &&
            typeof hierarchyFilters ===
            "object"
        ) {
            Object.entries(
                hierarchyFilters
            ).forEach(
                ([key, value]) => {
                    if (
                        value !== null &&
                        value !== undefined &&
                        value !== "" &&
                        value !== "—"
                    ) {
                        filters[key] =
                            value;
                    }
                }
            );
        }

        return filters;
    }, [
        periodName,
        reportingCurrency,
        hierarchyFilters,
    ]);


    /* =====================================================
       LOAD CATEGORY DETAIL
    ===================================================== */

    const loadCategoryDetails = async (item) => {
        const category = item?.category;

        if (!category) {
            return [];
        }

        if (
            Object.prototype.hasOwnProperty.call(
                categoryDetails,
                category
            )
        ) {
            return categoryDetails[category];
        }

        if (categoryDetailLoading?.[category]) {
            return [];
        }

        const derived = deriveCategoryNaturalAccounts(item, category);
        if (Array.isArray(derived) && derived.length > 0) {
            setCategoryDetails((prev) => ({
                ...prev,
                [category]: derived,
            }));
            return derived;
        }

        setCategoryDetailLoading((prev) => ({
            ...prev,
            [category]: true,
        }));

        setCategoryDetailError((prev) => ({
            ...prev,
            [category]: null,
        }));

        try {
            const configuredBase =
                import.meta.env.VITE_API_BASE_URL || "";

            const base = configuredBase.replace(/\/+$/, "");

            const apiUrl = base.endsWith("/api")
                ? `${base}/opex/category-detail-monthly`
                : `${base}/api/opex/category-detail-monthly`;

            const params = new URLSearchParams();

            params.set("category", String(category));

            if (
                periodName !== null &&
                periodName !== undefined &&
                periodName !== "" &&
                periodName !== "—"
            ) {
                if (Array.isArray(periodName)) {
                    periodName.forEach((period) => {
                        if (
                            period !== null &&
                            period !== undefined &&
                            period !== "" &&
                            period !== "—"
                        ) {
                            params.append(
                                "period_name",
                                String(period)
                            );
                        }
                    });
                } else {
                    params.set(
                        "period_name",
                        String(periodName)
                    );
                }
            }

            if (
                reportingCurrency !== null &&
                reportingCurrency !== undefined &&
                reportingCurrency !== "" &&
                reportingCurrency !== "—"
            ) {
                params.set(
                    "reporting_currency",
                    String(reportingCurrency)
                );
            }

            if (
                hierarchyFilters &&
                typeof hierarchyFilters === "object"
            ) {
                Object.entries(hierarchyFilters).forEach(
                    ([key, value]) => {
                        if (
                            value === null ||
                            value === undefined ||
                            value === "" ||
                            value === "—"
                        ) {
                            return;
                        }

                        if (Array.isArray(value)) {
                            value.forEach((itemValue) => {
                                if (
                                    itemValue !== null &&
                                    itemValue !== undefined &&
                                    itemValue !== "" &&
                                    itemValue !== "—"
                                ) {
                                    params.append(
                                        key,
                                        typeof itemValue === "object"
                                            ? String(itemValue?.code || itemValue?.id || itemValue?.value)
                                            : String(itemValue)
                                    );
                                }
                            });

                            return;
                        }

                        params.set(
                            key,
                            typeof value === "object"
                                ? String(value?.code || value?.id || value?.value)
                                : String(value)
                        );
                    }
                );
            }

            const token =
                localStorage.getItem("token") ||
                localStorage.getItem("finsight_token");

            const requestUrl =
                `${apiUrl}?${params.toString()}`;

            const response = await fetch(
                requestUrl,
                {
                    method: "GET",
                    headers: {
                        Accept:
                            "application/json",

                        ...(token
                            ? {
                                Authorization:
                                    `Bearer ${token}`,
                            }
                            : {}),
                    },
                }
            );

            if (response.ok) {
                const responseData =
                    await response.json();

                const details =
                    getDetails(responseData);

                if (Array.isArray(details) && details.length > 0) {
                    setCategoryDetails((prev) => ({
                        ...prev,
                        [category]: details,
                    }));

                    return details;
                }
            }

            const fallbackDetails = deriveCategoryNaturalAccounts(item, category);
            setCategoryDetails((prev) => ({
                ...prev,
                [category]: fallbackDetails,
            }));
            return fallbackDetails;
        } catch (error) {
            console.error(
                "Failed to load OPEX category monthly details, falling back to derivation:",
                error
            );

            const fallbackDetails = deriveCategoryNaturalAccounts(item, category);
            if (fallbackDetails.length > 0) {
                setCategoryDetails((prev) => ({
                    ...prev,
                    [category]: fallbackDetails,
                }));
                return fallbackDetails;
            }

            setCategoryDetailError((prev) => ({
                ...prev,
                [category]:
                    error?.message ||
                    "Failed to load category monthly details.",
            }));

            return [];
        } finally {
            setCategoryDetailLoading((prev) => ({
                ...prev,
                [category]: false,
            }));
        }
    };

    /* =====================================================
       TOGGLE ROW
    ===================================================== */

    const toggleRow = async (
        item,
        category
    ) => {
        const willExpand =
            !expandedRows[category];

        setExpandedRows(
            (prev) => ({
                ...prev,
                [category]:
                    willExpand,
            })
        );

        if (!willExpand) {
            return;
        }

        await loadCategoryDetails(
            item
        );
    };

    /* =====================================================
       DISPLAY
    ===================================================== */

    const displayValue = (
        value
    ) => {
        return formatValue(
            value,
            unit
        );
    };

    /* =====================================================
       VARIANCE COLOR
    ===================================================== */

    const getVarianceColor = (
        value
    ) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "#94A3B8";
        }

        const number =
            Number(value);

        if (
            Number.isNaN(number)
        ) {
            return "#94A3B8";
        }

        return number < 0
            ? "#DC2626"
            : "#16A34A";
    };

    /* =====================================================
       TARGET
    ===================================================== */

    const displayTarget = (
        value
    ) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        return displayValue(
            value
        );
    };

    /* =====================================================
       VARIANCE
    ===================================================== */

    const displayVariance = (
        value
    ) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        const number =
            Number(value);

        if (
            Number.isNaN(number)
        ) {
            return "—";
        }

        if (number === 0) {
            return unit === "aed"
                ? "AED 0.00"
                : "0";
        }

        if (number < 0) {
            if (
                unit === "millions"
            ) {
                const millions =
                    Math.abs(number) /
                    1000000;

                if (
                    millions < 0.01
                ) {
                    return "(<0.01M)";
                }

                return `(${millions.toFixed(
                    2
                )}M)`;
            }

            return `(AED ${Math.abs(
                number
            ).toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }
            )})`;
        }

        return displayValue(
            number
        );
    };

    /* =====================================================
       VARIANCE %
    ===================================================== */

    const displayVariancePercent =
        (value) => {
            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {
                return "—";
            }

            const number =
                Number(value);

            if (
                Number.isNaN(number)
            ) {
                return "—";
            }

            return `${number.toFixed(
                1
            )}%`;
        };

    /* =====================================================
       TOTAL VALUES
    ===================================================== */

    const totalActualYTD =
        getTotalYTD(rows);

    /* =====================================================
       VIEW ALL
    ===================================================== */

    const handleViewAll = async () => {
        setShowExportMenu(false);

        const filtersToApply = {
            year:
                Array.isArray(hierarchyFilters?.year)
                    ? [...hierarchyFilters.year]
                    : hierarchyFilters?.year
                        ? [hierarchyFilters.year]
                        : [],

            legal_entity:
                Array.isArray(hierarchyFilters?.legal_entity_id)
                    ? [...hierarchyFilters.legal_entity_id]
                    : [],

            parent_division:
                Array.isArray(hierarchyFilters?.parent_division_id)
                    ? [...hierarchyFilters.parent_division_id]
                    : [],

            subdivision:
                Array.isArray(hierarchyFilters?.subdivision_id)
                    ? [...hierarchyFilters.subdivision_id]
                    : [],

            period:
                periodName
                    ? Array.isArray(periodName)
                        ? [...periodName]
                        : [periodName]
                    : [],
        };

        if (typeof onApplyFilters === "function") {
            await onApplyFilters(filtersToApply);
        }

        setShowViewAll(true);
    };
    /* =====================================================
       EXPORT DATA ROWS
    ===================================================== */

    const buildExportRows = () => {
        const exportRows = [];

        exportRows.push([
            "Month-on-Month OPEX Report",
        ]);

        exportRows.push([
            "Period",
            periodName || "—",
        ]);

        exportRows.push([
            "Reporting Currency",
            reportingCurrency || "AED",
        ]);

        Object.entries(
            hierarchyFilters || {}
        ).forEach(
            ([key, value]) => {
                if (
                    value !== null &&
                    value !== undefined &&
                    value !== "" &&
                    value !== "—"
                ) {
                    exportRows.push([
                        formatFilterKey(key),
                        formatFilterValue(value, key, filterOptions),
                    ]);
                }
            }
        );

        exportRows.push([]);

        exportRows.push([
            "Expense Category",
            ...months.map(
                (month) =>
                    month.label
            ),
            "Actual YTD",
            "Target YTD",
            "Variance",
            "Variance %",
        ]);

        rows.forEach((item) => {
            exportRows.push([
                item?.category ||
                "—",

                ...months.map(
                    (month) => {
                        const value =
                            getMonthValue(
                                item,
                                month.key,
                                month.label
                            );

                        return isEmptyValue(
                            value
                        )
                            ? "—"
                            : value;
                    }
                ),

                getActualYTD(item) ??
                "—",

                getTargetYTD(item) ??
                "—",

                getVarianceYTD(item) ??
                "—",

                getVarianceYTDPercent(
                    item
                ) ?? "—",
            ]);
        });

        exportRows.push([
            "Total Operating Expenses",

            ...months.map(
                (month) => {
                    const value =
                        getTotalMonthValue(
                            rows,
                            month.key,
                            month.label
                        );

                    return isEmptyValue(
                        value
                    )
                        ? "—"
                        : value;
                }
            ),

            totalActualYTD ??
            "—",

            "—",
            "—",
            "—",
        ]);

        return exportRows;
    };

    /* =====================================================
       EXPORT EXCEL
    ===================================================== */

    const handleExportExcel = () => {
        setShowExportMenu(false);

        const exportRows = buildExportRows();

        if (!Array.isArray(exportRows) || exportRows.length === 0) {
            console.warn("No data available for CSV export.");
            return;
        }

        const escapeCsvCell = (cell) => {
            const value = String(cell ?? "");

            return `"${value
                .replace(/"/g, '""')
                .replace(/\r?\n/g, " ")}"`;
        };

        const csvContent = exportRows
            .map((row) =>
                row
                    .map((cell) => escapeCsvCell(cell))
                    .join(",")
            )
            .join("\r\n");

        // BOM helps Excel open UTF-8 CSV correctly
        const blob = new Blob(
            ["\ufeff" + csvContent],
            {
                type: "text/csv;charset=utf-8;",
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download =
            `Month-on-Month-OPEX-${Array.isArray(periodName)
                ? periodName.join("-")
                : periodName || "Report"
            }.csv`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };
    /* =====================================================
       EXPORT PDF (DIRECT FILE DOWNLOAD)
    ===================================================== */

    const handleExportPDF = () => {
        setShowExportMenu(false);

        const exportRows = buildExportRows();

        if (!Array.isArray(exportRows) || exportRows.length === 0) {
            console.warn("No data available for PDF export.");
            return;
        }

        const tableRows = exportRows
            .map((row, rowIndex) => {
                const isHeader =
                    rowIndex ===
                    exportRows.findIndex(
                        (r) =>
                            r?.[0] ===
                            "Expense Category"
                    );

                return `
                <tr>
                    ${row
                        .map(
                            (cell) => `
                                <td
                                    ${isHeader
                                    ? 'style="font-weight:700;background:#f1f5f9;"'
                                    : ""
                                }
                                >
                                    ${String(cell ?? "")
                                    .replace(/&/g, "&amp;")
                                    .replace(/</g, "&lt;")
                                    .replace(/>/g, "&gt;")}
                                </td>
                            `
                        )
                        .join("")}
                </tr>
            `;
            })
            .join("");

        const pdfHtml = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8" />

                <title>
                    Month-on-Month OPEX Report
                </title>

                <style>
                    @page {
                        size: landscape;
                        margin: 10mm;
                    }

                    * {
                        box-sizing: border-box;
                    }

                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 10px;
                        color: #0f172a;
                    }

                    h1 {
                        font-size: 18px;
                        margin: 0 0 14px;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        table-layout: fixed;
                        font-size: 8px;
                    }

                    th,
                    td {
                        border: 1px solid #dbe2ea;
                        padding: 5px;
                        text-align: right;
                        white-space: nowrap;
                    }

                    td:first-child,
                    th:first-child {
                        text-align: left;
                        width: 18%;
                    }

                    th {
                        color: #1e3a8a;
                        background: #f8fafc;
                    }

                    tr {
                        page-break-inside: avoid;
                    }
                </style>
            </head>

            <body>
                <h1>
                    Month-on-Month OPEX Report
                </h1>

                <table>
                    ${tableRows}
                </table>
            </body>
        </html>
    `;

        const printWindow = window.open(
            "",
            "_blank",
            "width=1200,height=800"
        );

        if (!printWindow) {
            console.error(
                "Unable to open print window. Please allow pop-ups."
            );
            return;
        }

        printWindow.document.open();

        printWindow.document.write(
            pdfHtml
        );

        printWindow.document.close();

        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
        }, 300);
    };

    const filterOptionKeys = {
        year: "years",
        legal_group_id: "legal_groups",
        legal_entity_id: "legal_entities",
        parent_division_id: "parent_divisions",
        subdivision_id: "subdivisions",
        business_unit_id: "business_units",
        analysis_code_id: "analysis_codes",
        analysis_code: "analysis_codes",
        period_name: "periods",
        reporting_currency: "currencies",
    };

    const getOptionValue = (option) => {
        if (option && typeof option === "object") {
            return (
                option?.value ??
                option?.id ??
                option?.code ??
                option?.key ??
                ""
            );
        }

        return option;
    };

    const getOptionLabel = (option) => {
        if (option && typeof option === "object") {
            return (
                option?.label ??
                option?.name ??
                option?.display_name ??
                option?.displayName ??
                option?.description ??
                option?.title ??
                option?.value ??
                option?.code ??
                option?.id ??
                "—"
            );
        }

        return option;
    };

    const findFilterDisplayName = (key, value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "";
        }

        const options =
            filterOptions?.[filterOptionKeys[key]] || [];

        if (!Array.isArray(options) || options.length === 0) {
            return value;
        }

        const normalizedValue = String(value)
            .trim()
            .toLowerCase();

        const matchedOption = options.find((option) => {
            const optionValue = String(
                getOptionValue(option) ?? ""
            )
                .trim()
                .toLowerCase();

            const optionCode = String(
                option?.code ??
                option?.id ??
                ""
            )
                .trim()
                .toLowerCase();

            return (
                optionValue === normalizedValue ||
                optionCode === normalizedValue
            );
        });

        return matchedOption
            ? getOptionLabel(matchedOption)
            : value;
    };

    const getFilterDisplayValue = (key, value) => {
        const values = Array.isArray(value)
            ? value
            : [value];

        return values
            .map((item) =>
                findFilterDisplayName(key, item)
            )
            .filter(
                (item) =>
                    item !== null &&
                    item !== undefined &&
                    item !== ""
            )
            .join(", ");
    };

    const handleModalExport = (format) => {
        if (format === "excel") {
            handleExportExcel();
        } else if (format === "pdf") {
            handleExportPDF();
        }
    };

    /* =====================================================
       ACTIVE FILTER DISPLAY
    ===================================================== */

    const filterEntries =
        Object.entries(
            activeFilters
        );

    /* =====================================================
       TABLE COMPONENT
    ===================================================== */

    const renderMainTable = (
        tableRows,
        isViewAll = false
    ) => {
        return (
            <div
                style={{
                    width: "100%",
                    maxWidth:
                        "100%",
                    overflowX:
                        "auto",
                    overflowY:
                        "hidden",
                    padding:
                        "0 10px 12px",
                    boxSizing:
                        "border-box",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        minWidth: 2810,
                        borderCollapse:
                            "collapse",
                        tableLayout:
                            "fixed",
                    }}
                >
                    <colgroup>
                        <col style={{ width: 270 }} />
                        {months.map((month) => (
                            <col key={month.key} style={{ width: 150 }} />
                        ))}
                        <col style={{ width: 170 }} />
                        <col style={{ width: 170 }} />
                        <col style={{ width: 170 }} />
                        <col style={{ width: 170 }} />
                    </colgroup>

                    <thead>
                        <tr
                            style={{
                                height: 50,
                                borderBottom:
                                    "1px solid #E5E7EB",
                            }}
                        >
                            <th
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "left",
                                    color:
                                        "#1E3A8A",
                                    fontSize: 14,
                                    lineHeight:
                                        "16px",
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                }}
                            >
                                Expense Category
                            </th>

                            {months.map(
                                (
                                    month
                                ) => (
                                    <th
                                        key={
                                            month.key
                                        }
                                        style={{
                                            padding:
                                                "0 10px",
                                            textAlign:
                                                "right",
                                            color:
                                                "#1E3A8A",
                                            fontSize: 14,
                                            lineHeight:
                                                "16px",
                                            fontWeight: 700,
                                            whiteSpace:
                                                "nowrap",
                                        }}
                                    >
                                        {
                                            month.label
                                        }
                                    </th>
                                )
                            )}

                            <th
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize: 14,
                                    lineHeight:
                                        "16px",
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    borderLeft:
                                        "1px solid #E5E7EB",
                                }}
                            >
                                Actual YTD
                            </th>

                            <th
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize: 14,
                                    lineHeight:
                                        "16px",
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                }}
                            >
                                Target YTD
                            </th>

                            <th
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize: 14,
                                    lineHeight:
                                        "16px",
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                }}
                            >
                                Variance
                            </th>

                            <th
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize: 14,
                                    lineHeight:
                                        "16px",
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                }}
                            >
                                Variance %
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {tableRows.map(
                            (
                                item,
                                index
                            ) => {
                                const rowKey =
                                    item?.category ||
                                    index;

                                const isExpanded =
                                    !!expandedRows[
                                    rowKey
                                    ];

                                const actualYTD =
                                    getActualYTD(
                                        item
                                    );

                                const targetYTD =
                                    getTargetYTD(
                                        item
                                    );

                                const varianceYTD =
                                    getVarianceYTD(
                                        item
                                    );

                                const varianceYTDPercent =
                                    getVarianceYTDPercent(
                                        item
                                    );

                                const rawDetails =
                                    getDetails(
                                        categoryDetails[
                                        rowKey
                                        ]
                                    );

                                const details =
                                    Array.isArray(rawDetails) && rawDetails.length > 0
                                        ? rawDetails
                                        : (item ? deriveCategoryNaturalAccounts(item, item.category || rowKey) : []);

                                const isLoading =
                                    !!categoryDetailLoading[
                                    rowKey
                                    ] ||
                                    !!detailLoading?.[
                                    rowKey
                                    ];

                                const error =
                                    categoryDetailError[
                                    rowKey
                                    ];

                                return (
                                    <React.Fragment
                                        key={
                                            rowKey
                                        }
                                    >
                                        <tr
                                            style={{
                                                minHeight:
                                                    58,
                                                height: 43,
                                                borderBottom:
                                                    "1px solid #F1F5F9",
                                            }}
                                        >
                                            <td
                                                style={{
                                                    padding:
                                                        "0 10px",
                                                    textAlign:
                                                        "left",
                                                    fontSize: 14,
                                                    lineHeight:
                                                        "18px",
                                                    fontWeight: 800,
                                                    color:
                                                        "#000000",
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleRow(
                                                            item,
                                                            rowKey
                                                        )
                                                    }
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap: 7,
                                                        border:
                                                            "none",
                                                        background:
                                                            "transparent",
                                                        padding:
                                                            0,
                                                        cursor:
                                                            "pointer",
                                                        color:
                                                            "#000000",
                                                        width:
                                                            "100%",
                                                        textAlign:
                                                            "left",
                                                    }}
                                                >
                                                    {isExpanded
                                                        ? "▼"
                                                        : "▶"}

                                                    <span
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            color: "#374151",
                                                            whiteSpace:
                                                                "nowrap",
                                                            textTransform:
                                                                "uppercase",
                                                        }}
                                                    >
                                                        {item?.category ||
                                                            "—"}
                                                    </span>
                                                </button>
                                            </td>

                                            {months.map(
                                                (
                                                    month
                                                ) => {
                                                    const value =
                                                        getMonthValue(
                                                            item,
                                                            month.key,
                                                            month.label
                                                        );

                                                    const isEmpty =
                                                        isEmptyValue(
                                                            value
                                                        );

                                                    return (
                                                        <td
                                                            key={
                                                                month.key
                                                            }
                                                            style={{
                                                                padding:
                                                                    "0 10px",
                                                                textAlign:
                                                                    "right",
                                                                fontSize: 14,
                                                                lineHeight:
                                                                    "18px",
                                                                fontWeight: 500,
                                                                color:
                                                                    isEmpty
                                                                        ? "#94A3B8"
                                                                        : "#334155",
                                                                whiteSpace:
                                                                    "nowrap",
                                                                overflow:
                                                                    "hidden",
                                                                textOverflow:
                                                                    "clip",
                                                            }}
                                                        >
                                                            {
                                                                displayValue(
                                                                    value
                                                                )
                                                            }
                                                        </td>
                                                    );
                                                }
                                            )}

                                            <td
                                                style={{
                                                    padding:
                                                        "0 10px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 14,
                                                    lineHeight:
                                                        "18px",
                                                    fontWeight: 600,
                                                    color:
                                                        "#334155",
                                                    whiteSpace:
                                                        "nowrap",
                                                    overflow:
                                                        "hidden",
                                                    textOverflow:
                                                        "clip",
                                                    borderLeft:
                                                        "1px solid #E5E7EB",
                                                }}
                                            >
                                                {
                                                    displayValue(
                                                        actualYTD
                                                    )
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "0 10px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 14,
                                                    lineHeight:
                                                        "18px",
                                                    fontWeight: 500,
                                                    color:
                                                        "#94A3B8",
                                                    whiteSpace:
                                                        "nowrap",
                                                    overflow:
                                                        "hidden",
                                                    textOverflow:
                                                        "clip",
                                                }}
                                            >
                                                {
                                                    displayTarget(
                                                        targetYTD
                                                    )
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "0 10px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 14,
                                                    lineHeight:
                                                        "18px",
                                                    fontWeight: 600,
                                                    color:
                                                        getVarianceColor(
                                                            varianceYTD
                                                        ),
                                                    whiteSpace:
                                                        "nowrap",
                                                    overflow:
                                                        "hidden",
                                                    textOverflow:
                                                        "clip",
                                                }}
                                            >
                                                {
                                                    displayVariance(
                                                        varianceYTD
                                                    )
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "0 10px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 14,
                                                    lineHeight:
                                                        "18px",
                                                    fontWeight: 600,
                                                    color:
                                                        getVarianceColor(
                                                            varianceYTDPercent
                                                        ),
                                                    whiteSpace:
                                                        "nowrap",
                                                    overflow:
                                                        "hidden",
                                                    textOverflow:
                                                        "clip",
                                                }}
                                            >
                                                {
                                                    displayVariancePercent(
                                                        varianceYTDPercent
                                                    )
                                                }
                                            </td>
                                        </tr>

                                        {isExpanded && (
                                            <tr
                                                style={{
                                                    background:
                                                        "#FFFFFF",
                                                }}
                                            >
                                                <td
                                                    colSpan={
                                                        months.length +
                                                        5
                                                    }
                                                    style={{
                                                        padding:
                                                            "16px 0",
                                                    }}
                                                >
                                                    {isLoading ? (
                                                        <div
                                                            style={{
                                                                fontSize: 14,
                                                                lineHeight:
                                                                    "18px",
                                                                color:
                                                                    "#94A3B8",
                                                                paddingLeft: 30,
                                                            }}
                                                        >
                                                            Loading
                                                            natural-account
                                                            details...
                                                        </div>
                                                    ) : (error && (!details || !details.length)) ? (
                                                        <div
                                                            style={{
                                                                fontSize: 13,
                                                                lineHeight:
                                                                    "18px",
                                                                color:
                                                                    "#DC2626",
                                                                paddingLeft: 30,
                                                            }}
                                                        >
                                                            Failed
                                                            to
                                                            load
                                                            natural-account
                                                            details.
                                                        </div>
                                                    ) : !details.length ? (
                                                        <div
                                                            style={{
                                                                fontSize: 13,
                                                                lineHeight:
                                                                    "18px",
                                                                color:
                                                                    "#94A3B8",
                                                                paddingLeft: 30,
                                                            }}
                                                        >
                                                            No
                                                            natural-account
                                                            details
                                                            available.
                                                        </div>
                                                    ) : (
                                                        <div
                                                            style={{
                                                                width:
                                                                    "100%",
                                                                overflowX:
                                                                    "auto",
                                                                overflowY:
                                                                    "hidden",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: 13,
                                                                    lineHeight:
                                                                        "18px",
                                                                    fontWeight: 700,
                                                                    color:
                                                                        "#0F172A",
                                                                    marginBottom:
                                                                        10,
                                                                    paddingLeft: 30,
                                                                }}
                                                            >
                                                                Natural-account
                                                                details
                                                                for{" "}
                                                                {
                                                                    item?.category
                                                                }
                                                            </div>

                                                            <table
                                                                style={{
                                                                    width: "100%",
                                                                    minWidth: 2810,
                                                                    maxWidth: "none",
                                                                    borderCollapse:
                                                                        "collapse",
                                                                    tableLayout:
                                                                        "fixed",
                                                                }}
                                                            >
                                                                <colgroup>
                                                                    <col style={{ width: 270 }} />
                                                                    {months.map((month) => (
                                                                        <col key={month.key} style={{ width: 150 }} />
                                                                    ))}
                                                                    <col style={{ width: 170 }} />
                                                                    <col style={{ width: 170 }} />
                                                                    <col style={{ width: 170 }} />
                                                                    <col style={{ width: 170 }} />
                                                                </colgroup>

                                                                <thead>
                                                                    <tr
                                                                        style={{
                                                                            height: 42,
                                                                            borderBottom:
                                                                                "1px solid #E5E7EB",
                                                                        }}
                                                                    >
                                                                        <th
                                                                            style={{
                                                                                padding:
                                                                                    "0 10px 0 30px",
                                                                                textAlign:
                                                                                    "left",
                                                                                color:
                                                                                    "#1E3A8A",
                                                                                fontSize: 13,
                                                                                lineHeight:
                                                                                    "16px",
                                                                                fontWeight: 700,
                                                                            }}
                                                                        >
                                                                            Natural
                                                                            Account
                                                                        </th>

                                                                        {months.map(
                                                                            (
                                                                                month
                                                                            ) => (
                                                                                <th
                                                                                    key={
                                                                                        month.key
                                                                                    }
                                                                                    style={{
                                                                                        padding:
                                                                                            "0 10px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                        color:
                                                                                            "#1E3A8A",
                                                                                        fontSize: 13,
                                                                                        lineHeight:
                                                                                            "16px",
                                                                                        fontWeight: 700,
                                                                                        whiteSpace:
                                                                                            "nowrap",
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        month.label
                                                                                    }
                                                                                </th>
                                                                            )
                                                                        )}

                                                                        <th
                                                                            style={{
                                                                                padding:
                                                                                    "0 10px",
                                                                                textAlign:
                                                                                    "right",
                                                                                color:
                                                                                    "#1E3A8A",
                                                                                fontSize: 13,
                                                                                lineHeight:
                                                                                    "16px",
                                                                                fontWeight: 700,
                                                                                whiteSpace:
                                                                                    "nowrap",
                                                                                borderLeft:
                                                                                    "1px solid #E5E7EB",
                                                                            }}
                                                                        >
                                                                            Actual
                                                                            YTD
                                                                        </th>
                                                                        <th style={{ padding: "0 10px" }}></th>
                                                                        <th style={{ padding: "0 10px" }}></th>
                                                                        <th style={{ padding: "0 10px" }}></th>
                                                                    </tr>
                                                                </thead>

                                                                <tbody>
                                                                    {details.map(
                                                                        (
                                                                            account,
                                                                            accountIndex
                                                                        ) => {
                                                                            const accountCode =
                                                                                getAccountCode(
                                                                                    account
                                                                                );

                                                                            const accountYTD =
                                                                                getActualYTD(
                                                                                    account
                                                                                );

                                                                            const naturalAccountLabel =
                                                                                getNaturalAccountLabel(
                                                                                    account
                                                                                );

                                                                            return (
                                                                                <tr
                                                                                    key={
                                                                                        accountCode !==
                                                                                            "—"
                                                                                            ? accountCode
                                                                                            : accountIndex
                                                                                    }
                                                                                    style={{
                                                                                        minHeight:
                                                                                            46,
                                                                                        height: 46,
                                                                                        borderBottom:
                                                                                            "1px solid #F1F5F9",
                                                                                    }}
                                                                                >
                                                                                    <td
                                                                                        style={{
                                                                                            padding:
                                                                                                "0 10px 0 30px",
                                                                                            textAlign:
                                                                                                "left",
                                                                                            fontSize: 13,
                                                                                            lineHeight:
                                                                                                "18px",
                                                                                            color:
                                                                                                "#334155",
                                                                                            fontWeight: 500,
                                                                                            whiteSpace:
                                                                                                "normal",
                                                                                            wordBreak:
                                                                                                "break-word",
                                                                                            overflowWrap:
                                                                                                "anywhere",
                                                                                        }}
                                                                                    >
                                                                                        {
                                                                                            naturalAccountLabel
                                                                                        }
                                                                                    </td>

                                                                                    {months.map(
                                                                                        (
                                                                                            month
                                                                                        ) => {
                                                                                            const value =
                                                                                                getAccountMonthValue(
                                                                                                    account,
                                                                                                    month.key,
                                                                                                    month.label
                                                                                                );

                                                                                            const isEmpty =
                                                                                                isEmptyValue(
                                                                                                    value
                                                                                                );

                                                                                            return (
                                                                                                <td
                                                                                                    key={
                                                                                                        month.key
                                                                                                    }
                                                                                                    style={{
                                                                                                        padding:
                                                                                                            "0 10px",
                                                                                                        textAlign:
                                                                                                            "right",
                                                                                                        fontSize: 14,
                                                                                                        lineHeight:
                                                                                                            "18px",
                                                                                                        fontWeight: 500,
                                                                                                        color:
                                                                                                            isEmpty
                                                                                                                ? "#94A3B8"
                                                                                                                : "#334155",
                                                                                                        whiteSpace:
                                                                                                            "nowrap",
                                                                                                        overflow:
                                                                                                            "hidden",
                                                                                                        textOverflow:
                                                                                                            "clip",
                                                                                                    }}
                                                                                                >
                                                                                                    {
                                                                                                        displayValue(
                                                                                                            value
                                                                                                        )
                                                                                                    }
                                                                                                </td>
                                                                                            );
                                                                                        }
                                                                                    )}

                                                                                    <td
                                                                                        style={{
                                                                                            padding:
                                                                                                "0 10px",
                                                                                            textAlign:
                                                                                                "right",
                                                                                            fontSize: 14,
                                                                                            lineHeight:
                                                                                                "18px",
                                                                                            fontWeight: 600,
                                                                                            color:
                                                                                                "#334155",
                                                                                            whiteSpace:
                                                                                                "nowrap",
                                                                                            overflow:
                                                                                                "hidden",
                                                                                            textOverflow:
                                                                                                "clip",
                                                                                            borderLeft:
                                                                                                "1px solid #E5E7EB",
                                                                                        }}
                                                                                    >
                                                                                        {
                                                                                            displayValue(
                                                                                                accountYTD
                                                                                            )
                                                                                        }
                                                                                    </td>
                                                                                    <td style={{ padding: "0 10px" }}></td>
                                                                                    <td style={{ padding: "0 10px" }}></td>
                                                                                    <td style={{ padding: "0 10px" }}></td>
                                                                                </tr>
                                                                            );
                                                                        }
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            }
                        )}

                        <tr
                            style={{
                                height: 60,
                                background:
                                    "#F4F2FF",
                            }}
                        >
                            <td
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "left",
                                    fontSize: 14,
                                    lineHeight:
                                        "18px",
                                    fontWeight: 800,
                                    color:
                                        "#0F172A",
                                }}
                            >
                                <div
                                    style={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        gap: 7,

                                    }}
                                >

                                    <span>
                                        Total Operating
                                        Expenses
                                    </span>
                                </div>
                            </td>

                            {months.map(
                                (month) => {
                                    const value =
                                        getTotalMonthValue(
                                            tableRows,
                                            month.key,
                                            month.label
                                        );

                                    const isEmpty =
                                        isEmptyValue(
                                            value
                                        );

                                    return (
                                        <td
                                            key={
                                                month.key
                                            }
                                            style={{
                                                padding:
                                                    "0 10px",
                                                textAlign:
                                                    "right",
                                                fontSize: 14,
                                                lineHeight:
                                                    "18px",
                                                fontWeight: 700,
                                                color:
                                                    isEmpty
                                                        ? "#94A3B8"
                                                        : "#0F172A",
                                                whiteSpace:
                                                    "nowrap",
                                                overflow:
                                                    "hidden",
                                                textOverflow:
                                                    "clip",
                                            }}
                                        >
                                            {
                                                displayValue(
                                                    value
                                                )
                                            }
                                        </td>
                                    );
                                }
                            )}

                            <td
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    fontSize: 14,
                                    lineHeight:
                                        "18px",
                                    fontWeight: 700,
                                    color:
                                        "#0F172A",
                                    whiteSpace:
                                        "nowrap",
                                    overflow:
                                        "hidden",
                                    textOverflow:
                                        "clip",
                                    borderLeft:
                                        "1px solid #DDD8F7",
                                }}
                            >
                                {
                                    displayValue(
                                        getTotalYTD(
                                            tableRows
                                        )
                                    )
                                }
                            </td>

                            <td
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color:
                                        "#94A3B8",
                                    whiteSpace:
                                        "nowrap",
                                }}
                            >
                                —
                            </td>

                            <td
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color:
                                        "#94A3B8",
                                    whiteSpace:
                                        "nowrap",
                                }}
                            >
                                —
                            </td>

                            <td
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color:
                                        "#94A3B8",
                                    whiteSpace:
                                        "nowrap",
                                }}
                            >
                                —
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    /* =========================================================
       RETURN
    ========================================================= */

    return (
        <>
            <div
                style={{
                    width: "100%",
                    background:
                        "#FFFFFF",
                    border:
                        "1px solid #E5E7EB",
                    borderRadius: 10,
                    boxSizing:
                        "border-box",
                    overflow:
                        "visible",
                    marginTop: 12,
                }}
            >
                <div
                    style={{
                        minHeight: 52,
                        display:
                            "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "space-between",
                        padding:
                            "0 14px",
                        boxSizing:
                            "border-box",
                        borderBottom:
                            collapsed
                                ? "none"
                                : "1px solid #F1F5F9",
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            fontSize: 14,
                            lineHeight:
                                "18px",
                            fontWeight: 700,
                            color:
                                "#0F172A",
                            whiteSpace:
                                "nowrap",
                        }}
                    >
                        Month-on-Month OPEX Report
                    </h3>

                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap: 7,
                        }}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                setCollapsed(
                                    (prev) =>
                                        !prev
                                )
                            }
                            style={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap: 5,
                                border:
                                    "none",
                                background:
                                    "transparent",
                                padding:
                                    "4px 5px",
                                cursor:
                                    "pointer",
                                color:
                                    "#5B3FE4",
                                fontSize: 11,
                                fontWeight: 600,
                            }}
                        >
                            {collapsed ? (
                                <ChevronDown
                                    size={
                                        13
                                    }
                                />
                            ) : (
                                <ChevronsUp
                                    size={
                                        13
                                    }
                                />
                            )}

                            {collapsed
                                ? "Expand"
                                : "Collapse"}
                        </button>

                        <div
                            style={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setMonthMenuOpen((prev) => !prev);
                                }}
                                aria-label="Month-on-Month actions"
                                aria-expanded={monthMenuOpen}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: "2px 6px",
                                    cursor: "pointer",
                                    color: "#64748B",
                                    fontSize: 20,
                                    lineHeight: 1,
                                }}
                            >
                                ⋮
                            </button>

                            {monthMenuOpen && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "100%",
                                        right: 0,
                                        marginTop: 6,
                                        width: 165,
                                        background: "#FFFFFF",
                                        border: "1px solid #E5E7EB",
                                        borderRadius: 8,
                                        boxShadow:
                                            "0 8px 24px rgba(15, 23, 42, 0.12)",
                                        padding: "5px 0",
                                        zIndex: 99999,
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMonthMenuOpen(false);
                                            handleViewAll();
                                        }}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 9,
                                            border: "none",
                                            background: "transparent",
                                            padding: "9px 12px",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: "#334155",
                                        }}
                                        onMouseEnter={(event) => {
                                            event.currentTarget.style.background =
                                                "#F8FAFC";
                                        }}
                                        onMouseLeave={(event) => {
                                            event.currentTarget.style.background =
                                                "transparent";
                                        }}
                                    >
                                        <span style={{ fontSize: 14 }}>
                                            🔍
                                        </span>

                                        <span>View All</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMonthMenuOpen(false);
                                            handleExportExcel();
                                        }}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 9,
                                            border: "none",
                                            background: "transparent",
                                            padding: "9px 12px",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: "#334155",
                                        }}
                                        onMouseEnter={(event) => {
                                            event.currentTarget.style.background =
                                                "#F8FAFC";
                                        }}
                                        onMouseLeave={(event) => {
                                            event.currentTarget.style.background =
                                                "transparent";
                                        }}
                                    >
                                        <span style={{ fontSize: 14 }}>
                                            📊
                                        </span>

                                        <span>Export Excel</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMonthMenuOpen(false);
                                            handleExportPDF();
                                        }}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 9,
                                            border: "none",
                                            background: "transparent",
                                            padding: "9px 12px",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: "#334155",
                                        }}
                                        onMouseEnter={(event) => {
                                            event.currentTarget.style.background =
                                                "#F8FAFC";
                                        }}
                                        onMouseLeave={(event) => {
                                            event.currentTarget.style.background =
                                                "transparent";
                                        }}
                                    >
                                        <span style={{ fontSize: 14 }}>
                                            📄
                                        </span>

                                        <span>Export PDF</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setUnit(
                                    "aed"
                                )
                            }
                            style={{
                                height: 30,
                                minWidth: 42,
                                padding:
                                    "0 10px",
                                borderRadius:
                                    6,
                                border:
                                    "1px solid #E2E8F0",
                                background:
                                    unit ===
                                        "aed"
                                        ? "#5B3FE4"
                                        : "#FFFFFF",
                                color:
                                    unit ===
                                        "aed"
                                        ? "#FFFFFF"
                                        : "#334155",
                                fontSize: 10,
                                fontWeight: 600,
                                cursor:
                                    "pointer",
                            }}
                        >
                            AED
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setUnit(
                                    "millions"
                                )
                            }
                            style={{
                                height: 30,
                                minWidth: 78,
                                padding:
                                    "0 10px",
                                borderRadius:
                                    6,
                                border:
                                    unit ===
                                        "millions"
                                        ? "1px solid #5B3FE4"
                                        : "1px solid #E2E8F0",
                                background:
                                    unit ===
                                        "millions"
                                        ? "#5B3FE4"
                                        : "#FFFFFF",
                                color:
                                    unit ===
                                        "millions"
                                        ? "#FFFFFF"
                                        : "#334155",
                                fontSize: 10,
                                fontWeight: 600,
                                cursor:
                                    "pointer",
                            }}
                        >
                            AED Millions
                        </button>
                    </div>
                </div>

                {!collapsed &&
                    renderMainTable(
                        rows
                    )}
            </div >

            {/* =====================================================
                VIEW ALL MODAL
            ===================================================== */}

            {
                showViewAll && (
                    <div
                        style={{
                            position:
                                "fixed",
                            inset: 0,
                            zIndex: 9999,
                            background:
                                "rgba(15, 23, 42, 0.45)",
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            padding: 24,
                        }}
                    >
                        <div
                            style={{
                                width:
                                    "96vw",
                                maxWidth:
                                    1900,
                                height:
                                    "90vh",
                                background:
                                    "#FFFFFF",
                                borderRadius:
                                    10,
                                boxShadow:
                                    "0 20px 60px rgba(15,23,42,0.20)",
                                display:
                                    "flex",
                                flexDirection:
                                    "column",
                                overflow:
                                    "hidden",
                            }}
                        >
                            <div
                                style={{
                                    minHeight: 58,
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    padding:
                                        "0 18px",
                                    borderBottom:
                                        "1px solid #E5E7EB",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: 15,
                                            fontWeight: 700,
                                            color:
                                                "#0F172A",
                                        }}
                                    >
                                        Month-on-Month OPEX Report
                                    </div>

                                    <div
                                        style={{
                                            marginTop: 3,
                                            fontSize: 11,
                                            color:
                                                "#64748B",
                                        }}
                                    >
                                        View All
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowViewAll(
                                            false
                                        )
                                    }
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius:
                                            6,
                                        border:
                                            "1px solid #E2E8F0",
                                        background:
                                            "#FFFFFF",
                                        color:
                                            "#64748B",
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        cursor:
                                            "pointer",
                                    }}
                                >
                                    <X
                                        size={
                                            17
                                        }
                                    />
                                </button>
                            </div>

                            {/* ==========================================
                                ACTIVE FILTERS & RIGHT-ALIGNED EXPORT BUTTONS
                            ========================================== */}

                            <div
                                style={{
                                    padding:
                                        "10px 18px",
                                    background:
                                        "#F8FAFC",
                                    borderBottom:
                                        "1px solid #E5E7EB",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        flexWrap: "wrap",
                                    }}
                                >

                                    <div
                                        style={{
                                            padding: "16px 22px",
                                            borderBottom: "1px solid #f1f5f9",
                                            display: "flex",
                                            alignItems: "flex-end",
                                            flexWrap: "wrap",
                                            gap: "12px",
                                            background: "#ffffff",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <MultiSelectDropdown
                                            label="Year"
                                            options={filterOptions?.years || []}
                                            selectedValues={viewAllFilters.year}
                                            onChange={(values) => {
                                                setViewAllFilters((prev) => ({
                                                    ...prev,
                                                    year: values,
                                                }));
                                            }}
                                        />

                                        <MultiSelectDropdown
                                            label="Legal Entity"
                                            options={filterOptions?.legal_entities || []}
                                            selectedValues={viewAllFilters.legal_entity}
                                            onChange={(values) => {
                                                setViewAllFilters((prev) => ({
                                                    ...prev,
                                                    legal_entity: values,
                                                }));
                                            }}
                                        />
                                        <MultiSelectDropdown
                                            label="Parent Division"
                                            options={filterOptions?.parent_divisions || []}
                                            selectedValues={viewAllFilters.parent_division}
                                            onChange={(values) => {
                                                setViewAllFilters((prev) => ({
                                                    ...prev,
                                                    parent_division: values,
                                                }));
                                            }}
                                        />

                                        <MultiSelectDropdown
                                            label="Sub-Division"
                                            options={filterOptions?.subdivisions || []}
                                            selectedValues={viewAllFilters.subdivision}
                                            onChange={(values) => {
                                                setViewAllFilters((prev) => ({
                                                    ...prev,
                                                    subdivision: values,
                                                }));
                                            }}
                                        />

                                        <MultiSelectDropdown
                                            label="Period"
                                            options={filterOptions?.periods || []}
                                            selectedValues={viewAllFilters.period}
                                            onChange={(values) => {
                                                setViewAllFilters((prev) => ({
                                                    ...prev,
                                                    period: values,
                                                }));
                                            }}
                                        />
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
                                                    border: "1px solid #e0e6ed",
                                                    background: "#ffffff",
                                                    color: "#2b3b75",
                                                    fontSize: "13px",
                                                    fontWeight: 700,
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Reset
                                            </button>


                                        </div>
                                    </div>
                                    {/* {filterEntries.length >
                                        0 ? (
                                        filterEntries.map(
                                            ([
                                                key,
                                                value,
                                            ]) => (
                                                <div
                                                    key={
                                                        key
                                                    }
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap: 5,
                                                        padding:
                                                            "6px 10px",
                                                        borderRadius:
                                                            5,
                                                        background:
                                                            "#FFFFFF",
                                                        border:
                                                            "1px solid #E2E8F0",
                                                        fontSize: 13,
                                                        color:
                                                            "#475569",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontWeight:
                                                                600,
                                                        }}
                                                    >
                                                        {formatFilterKey(key)}:
                                                    </span>

                                                    <span>
                                                        {formatFilterValue(
                                                            value,
                                                            key,
                                                            filterOptions
                                                        )}
                                                    </span>
                                                </div>
                                            )
                                        )
                                    ) : (
                                        <span
                                            style={{
                                                fontSize: 13,
                                                color:
                                                    "#64748B",
                                            }}
                                        >
                                            No additional hierarchy
                                            filters selected
                                        </span>
                                    )} */}
                                </div>

                                <div
                                    style={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        gap: 8,
                                        flexShrink: 0,
                                    }}
                                >
                                    <ExportButtons
                                        endpoint="month-on-month-opex"
                                        exporting={exporting}
                                        handleExport={handleModalExport}
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    flex: 1,
                                    overflow:
                                        "auto",
                                    padding:
                                        "8px 0 16px",
                                }}
                            >
                                {renderMainTable(
                                    viewAllRows,
                                    true
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}