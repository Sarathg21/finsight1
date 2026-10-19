
import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";

import {
    ChevronRight,
    ChevronDown,
    ChevronsUp,
    MoreVertical,
    Search,
    FileSpreadsheet,
    FileText, Eye, X,
} from "lucide-react";
import {
    getOpexFilterOptions,
    getOpexMonthly,
} from "../../api/opexApi";
// Share the unscoped initial OPEX filter-options request with OperatingAnalysis
// and the other OPEX widgets. Scoped requests continue to use their own filters.
const getOpexFilterOptionsShared = async (filters = {}) => {
    const stable = Object.keys(filters || {}).sort().reduce((acc, key) => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== "" &&
            !(Array.isArray(value) && value.length === 0)) acc[key] = value;
        return acc;
    }, {});
    const requestKey = Object.keys(stable).length
        ? JSON.stringify(stable)
        : "reporting_currency=AED";
    const host = typeof window !== "undefined" ? window : globalThis;
    const registryKey = "__finsightOpexFilterOptionsRequests_v1";
    if (!host[registryKey]) host[registryKey] = { cache: new Map(), inFlight: new Map() };
    const registry = host[registryKey];
    const now = Date.now();
    const cached = registry.cache.get(requestKey);
    if (cached && now - cached.timestamp < 60 * 1000) return cached.data;
    const pending = registry.inFlight.get(requestKey);
    if (pending) return pending;
    const request = Promise.resolve()
        .then(() => getOpexFilterOptions(stable))
        .then((response) => {
            const data = response || {};
            registry.cache.set(requestKey, { timestamp: Date.now(), data });
            return data;
        })
        .finally(() => {
            if (registry.inFlight.get(requestKey) === request) registry.inFlight.delete(requestKey);
        });
    registry.inFlight.set(requestKey, request);
    return request;
};

import { deriveCategoryNaturalAccounts } from "../../data/opexNaturalAccounts";
import ExportButtons from "../Common/ExportButtons";

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
        return "0";
    }

    /* ===================================================== 
       AED MILLIONS 
    ===================================================== */

    if (unit === "millions") {
        const millions = number / 1000000;

        if (Math.abs(millions) < 0.01) {
            return "<0.01M";
        }

        return `${millions.toFixed(2)}M`;
    }

    /* ===================================================== 
       AED FORMAT 
       No currency prefix on individual values. 
       Chart title identifies the report as "(in AED)". 
    ===================================================== */

    return Math.round(number).toLocaleString("en-US");
};

/* ========================================================= 
   MONTHS
   The month definitions are only labels/keys. The visible
   range is derived from the selected backend filter period;
   no month cutoff is hardcoded.
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

const monthNameToIndex = {
    jan: 0, january: 0, feb: 1, february: 1,
    mar: 2, march: 2, apr: 3, april: 3,
    may: 4, jun: 5, june: 5, jul: 6, july: 6,
    aug: 7, august: 7, sep: 8, sept: 8, september: 8,
    oct: 9, october: 9, nov: 10, november: 10,
    dec: 11, december: 11,
};

const getPeriodMonthIndex = (periodValue) => {
    if (periodValue === null || periodValue === undefined || periodValue === "") {
        return -1;
    }

    const raw =
        typeof periodValue === "object"
            ? periodValue?.value ??
            periodValue?.id ??
            periodValue?.code ??
            periodValue?.period_name ??
            periodValue?.name ??
            periodValue?.label
            : periodValue;

    const text = String(raw ?? "").trim().toLowerCase();
    if (!text) return -1;

    const namedMonthMatch = text.match(
        /(?:^|[\s\-_\/])([a-z]{3,9})(?:[\s\-_\/]|$)/
    );

    if (namedMonthMatch) {
        const monthIndex = monthNameToIndex[namedMonthMatch[1]];
        if (Number.isInteger(monthIndex)) return monthIndex;
    }

    const numericMonthMatch = text.match(
        /(?:^|[\s\-_\/])(0?[1-9]|1[0-2])(?:[\s\-_\/]|$)/
    );

    if (numericMonthMatch) {
        return Number(numericMonthMatch[1]) - 1;
    }

    return -1;
};

const getSelectedPeriodValues = (value) => {
    if (value === null || value === undefined || value === "" || value === "All") {
        return [];
    }

    const values = Array.isArray(value) ? value : [value];

    return values.filter(
        (item) =>
            item !== null &&
            item !== undefined &&
            item !== "" &&
            item !== "All"
    );
};

const hasBackendMonthValue = (row, month) => {
    if (!row || typeof row !== "object") return false;
    const value = getMonthValue(row, month.key, month.label);
    return !isEmptyValue(value);
};

const getVisibleMonths = (selectedPeriod, backendRows = []) => {
    const periods = getSelectedPeriodValues(selectedPeriod);

    if (periods.length > 0) {
        const periodIndexes = periods
            .map(getPeriodMonthIndex)
            .filter((index) => index >= 0);

        if (periodIndexes.length > 0) {
            return months.slice(0, Math.max(...periodIndexes) + 1);
        }
    }

    const backendMonths = months.filter((month) =>
        Array.isArray(backendRows)
            ? backendRows.some((row) => hasBackendMonthValue(row, month))
            : false
    );

    return backendMonths.length > 0 ? backendMonths : months;
};

/* ========================================================= 
   MONTH HEADER LABEL 
   2026 => Jan26, Feb26, ... Dec26 
   No single year selected => Jan, Feb, ... Dec 
========================================================= */

const getMonthHeaderLabel = (month, yearValue) => {
    const values = Array.isArray(yearValue)
        ? yearValue
        : yearValue !== null &&
            yearValue !== undefined &&
            yearValue !== ""
            ? [yearValue]
            : [];

    if (values.length !== 1) {
        return month.label;
    }

    const selectedYear = values[0];
    const year =
        typeof selectedYear === "object"
            ? selectedYear?.value ??
            selectedYear?.id ??
            selectedYear?.code ??
            selectedYear?.year ??
            selectedYear?.name
            : selectedYear;

    const yearString = String(year ?? "").trim();

    if (!/^\d{4}$/.test(yearString)) {
        return month.label;
    }

    return `${month.label}-${yearString.slice(-2)}`;
};

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
    // Prefer the full-precision AED field for calculations.
    // The *_ytd fields are display-rounded API values.
    return (
        item?.actual_ytd_aed ??
        item?.actualYtdaed ??
        item?.actual_ytd ??
        item?.actualYTD ??
        item?.ytd ??
        null
    );
};

/* ========================================================= 
   GET TOTAL YTD 
========================================================= */

const isOpexTotalRow = (item) => {
    const category = String(item?.category ?? item?.name ?? "").trim().toLowerCase();
    return category === "total operating expenses" ||
        category === "total operating expense" ||
        category === "total opex" ||
        category === "total opex expenses";
};

const getOpexCategoryRows = (data) =>
    (Array.isArray(data) ? data : []).filter((item) => !isOpexTotalRow(item));

const sumYTDField = (data, getter) => {
    // A total is only valid when every displayed category has a usable value.
    // Do not silently produce a partial total when an API category is missing.
    const rows = getOpexCategoryRows(data);
    if (!rows.length) return null;

    let total = 0;

    for (const item of rows) {
        const value = getter(item);
        if (isEmptyValue(value)) return null;

        // Preserve API precision; rounding is handled only by display formatters.
        const number = typeof value === "number"
            ? value
            : Number(String(value).replace(/,/g, "").trim());

        if (!Number.isFinite(number)) return null;
        total += number;
    }

    return total;
};

const getTotalYTD = (data) => sumYTDField(data, getActualYTD);

/* ========================================================= 
   GET TARGET YTD 
========================================================= */

const getTargetYTD = (item) => {
    // Prefer the full-precision AED field for calculations.
    // The *_ytd fields are display-rounded API values.
    return (
        item?.target_ytd_aed ??
        item?.targetYtdaed ??
        item?.target_ytd ??
        item?.targetYTD ??
        item?.ytd_target ??
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
    singleSelect = false,
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
            option.key ??
            option.legal_group_id ??
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
        const currentValues = normalizedSelectedValues.filter(Boolean);

        if (singleSelect) {
            onChange(currentValues.includes(normalizedId) ? [] : [normalizedId]);
            setIsOpen(false);
            return;
        }

        if (currentValues.includes(normalizedId)) {
            onChange(currentValues.filter((value) => value !== normalizedId));
            return;
        }

        onChange([...currentValues, normalizedId]);
    };

    const handleSelectAll = () => {
        onChange(formattedOptions.map((opt) => opt.id));
    };

    const handleClear = () => {
        onChange([]);
    };

    const allSelected =
        formattedOptions.length > 0 &&
        formattedOptions.every((opt) => normalizedSelectedValues.includes(opt.id));

    const displayLabel = useMemo(() => {
        if (allSelected) return "All";
        if (normalizedSelectedValues.length === 0) return "All";

        if (normalizedSelectedValues.length === 1) {
            const found = formattedOptions.find(
                (opt) => opt.id === normalizedSelectedValues[0]
            );
            return found ? found.name : "1 Selected";
        }

        return `${normalizedSelectedValues.length} Selected`;
    }, [normalizedSelectedValues, formattedOptions, allSelected]);

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
            {label ? (
                <label
                    style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#2b3b75",
                    }}
                >
                    {label}
                </label>
            ) : null}

            <button
                type="button"
                onClick={() =>
                    setIsOpen((prev) => !prev)
                }
                style={{
                    width: "100%",
                    height: "34px",
                    minWidth: 0,
                    padding: "0 10px",
                    borderRadius: "9px",
                    border: "1px solid #E2E8F0",
                    background: "#F1F5F9",
                    color: "#1E293B",
                    fontSize: "12px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
                }}
                onFocus={(event) => {
                    event.currentTarget.style.borderColor = "#818CF8";
                    event.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,.10)";
                }}
                onBlur={(event) => {
                    event.currentTarget.style.borderColor = "#E2E8F0";
                    event.currentTarget.style.boxShadow = "none";
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

                <ChevronDown
                    size={14}
                    strokeWidth={2}
                    style={{
                        flexShrink: 0,
                        color: "#334155",
                    }}
                />
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


                    {!singleSelect && (
                        <div
                            data-filter-all-option="true"
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                padding:
                                    "2px 4px 8px 4px",
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
                    )}

                    {/* OPTIONS */}
                    <div
                        style={{
                            maxHeight: "160px",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection:
                                "column",
                            gap: "0px",
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
                                    const isChecked = normalizedSelectedValues.includes(opt.id);

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
                                                type={singleSelect ? "radio" : "checkbox"}
                                                checked={isChecked}
                                                onChange={() =>
                                                    handleToggle(opt.id)
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


const getOptionId = (option) => {
    if (option === null || option === undefined) return "";
    if (typeof option !== "object") return String(option);

    return String(
        option?.value ??
        option?.id ??
        option?.code ??
        option?.key ??
        option?.legal_group_id ??
        option?.legal_entity_id ??
        option?.parent_division_id ??
        option?.subdivision_id ??
        option?.period_name ??
        option?.year ??
        option?.name ??
        ""
    );
};

const getOptionLabel = (option) => {
    if (option === null || option === undefined) return "";
    if (typeof option !== "object") return String(option);

    return String(
        option?.label ??
        option?.name ??
        option?.display_name ??
        option?.displayName ??
        option?.description ??
        option?.title ??
        option?.text ??
        option?.period_name ??
        option?.value ??
        option?.code ??
        option?.id ??
        ""
    );
};

const optionRelationValues = (option, keys) => {
    if (!option || typeof option !== "object") return [];

    const source = option?.meta && typeof option.meta === "object"
        ? { ...option, ...option.meta }
        : option;

    for (const key of keys) {
        const value = source?.[key];

        if (Array.isArray(value)) {
            return value
                .map((item) => getOptionId(item))
                .filter(Boolean);
        }

        if (value !== null && value !== undefined && value !== "") {
            return [String(value)];
        }
    }

    return [];
};

const cascadeOptions = (options, selected, relationKeys) => {
    const list = Array.isArray(options) ? options : [];
    const selectedValues = Array.isArray(selected)
        ? selected.filter(Boolean).map(String)
        : [];

    if (!selectedValues.length || !relationKeys.length) return list;

    let relationFound = false;

    const filtered = list.filter((option) => {
        const relations = optionRelationValues(option, relationKeys);

        if (!relations.length) return true;

        relationFound = true;
        return selectedValues.some((value) => relations.includes(String(value)));
    });

    return relationFound ? filtered : list;
};

const allIds = (options) =>
    (Array.isArray(options) ? options : [])
        .map(getOptionId)
        .filter(Boolean);

const normalizeFilterState = (filters = {}) => ({
    year: Array.isArray(filters?.year) ? filters.year.map(String) : [],
    legal_group: Array.isArray(filters?.legal_group) ? filters.legal_group.map(String) : [],
    legal_entity: Array.isArray(filters?.legal_entity) ? filters.legal_entity.map(String) : [],
    parent_division: Array.isArray(filters?.parent_division) ? filters.parent_division.map(String) : [],
    subdivision: Array.isArray(filters?.subdivision) ? filters.subdivision.map(String) : [],
    period: Array.isArray(filters?.period) ? filters.period.map(String) : [],
    reporting_currency: Array.isArray(filters?.reporting_currency)
        ? filters.reporting_currency.map(String)
        : [],
});

function MultiSelectFilter({
    label,
    options = [],
    selectedValues = [],
    onChange,
    disabled = false,
    singleSelect = false,
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef(null);

    const formatted = useMemo(
        () => (Array.isArray(options) ? options : []).map((option) => ({
            id: getOptionId(option),
            label: getOptionLabel(option),
        })).filter((option) => option.id),
        [options]
    );

    const selected = useMemo(
        () => (Array.isArray(selectedValues) ? selectedValues : []).map(String),
        [selectedValues]
    );

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return formatted;
        return formatted.filter((option) => option.label.toLowerCase().includes(query));
    }, [formatted, search]);

    const allSelected = formatted.length > 0 && formatted.every((option) => selected.includes(option.id));

    useEffect(() => {
        const handleOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    const toggle = (id) => {
        if (singleSelect) {
            onChange(selected.includes(id) ? [] : [id]);
            setOpen(false);
            return;
        }

        if (selected.includes(id)) {
            onChange(selected.filter((value) => value !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    const displayValue = allSelected
        ? "All"
        : selected.length === 0
            ? "All"
            : selected.length === 1
                ? (formatted.find((option) => option.id === selected[0])?.label || "1 Selected")
                : `${selected.length} Selected`;

    return (
        <div ref={ref} style={{ position: "relative", minWidth: 0 }}>
            <div
                style={{
                    fontSize: "0.68rem",
                    lineHeight: 1.2,
                    fontWeight: 700,
                    color: "#1E3A8A",
                    marginBottom: 5,
                }}
            >
                {label}
            </div>

            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((value) => !value)}
                style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    borderRadius: 9,
                    border: "1px solid #E2E8F0",
                    background: disabled ? "#F8FAFC" : "#F1F5F9",
                    color: selected.length ? "#1E293B" : "#64748B",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: disabled ? "not-allowed" : "pointer",
                    boxSizing: "border-box",
                }}
            >
                <span
                    style={{
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginRight: 8,
                    }}
                >
                    {displayValue}
                </span>
                <ChevronDown size={14} color="#334155" />
            </button>

            {open && !disabled && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 5px)",
                        left: 0,
                        width: 235,
                        maxWidth: "min(235px, calc(100vw - 30px))",
                        padding: 8,
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: 10,
                        boxShadow: "0 12px 30px rgba(15,23,42,0.14)",
                        zIndex: 10020,
                        boxSizing: "border-box",
                    }}
                >
                    <div style={{ position: "relative", marginBottom: 7 }}>
                        <Search
                            size={13}
                            style={{
                                position: "absolute",
                                left: 9,
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#94A3B8",
                            }}
                        />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search..."
                            style={{
                                width: "100%",
                                height: 31,
                                padding: "0 8px 0 29px",
                                border: "1px solid #E2E8F0",
                                borderRadius: 7,
                                outline: "none",
                                fontSize: "0.7rem",
                                color: "#334155",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {!singleSelect && (
                        <div
                            data-filter-all-option="true"
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "2px 4px 7px",
                                borderBottom: "1px solid #F1F5F9",
                                marginBottom: 4,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => onChange(formatted.map((option) => option.id))}
                                style={{
                                    border: 0,
                                    background: "transparent",
                                    padding: 0,
                                    color: "#5B3FE4",
                                    fontSize: "0.68rem",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                }}
                            >
                                Select All
                            </button>
                            <button
                                type="button"
                                onClick={() => onChange([])}
                                style={{
                                    border: 0,
                                    background: "transparent",
                                    padding: 0,
                                    color: "#64748B",
                                    fontSize: "0.68rem",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    )}

                    <div style={{ maxHeight: 210, overflowY: "auto" }}>
                        {filtered.length === 0 ? (
                            <div style={{ padding: "8px 4px", color: "#94A3B8", fontSize: "0.7rem" }}>
                                No options
                            </div>
                        ) : (
                            filtered.map((option) => {
                                const checked = selected.includes(option.id);
                                return (
                                    <label
                                        key={option.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            minHeight: 29,
                                            padding: "3px 4px",
                                            borderRadius: 6,
                                            cursor: "pointer",
                                            fontSize: "0.7rem",
                                            fontWeight: checked ? 700 : 500,
                                            color: checked ? "#1E293B" : "#475569",
                                        }}
                                    >
                                        <input
                                            type={singleSelect ? "radio" : "checkbox"}
                                            checked={checked}
                                            onChange={() => toggle(option.id)}
                                            style={{ accentColor: "#5B3FE4", cursor: "pointer" }}
                                        />
                                        <span
                                            style={{
                                                minWidth: 0,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {option.label}
                                        </span>
                                    </label>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Shared, short-lived cache and in-flight request registry for OPEX filter options.
// This is intentionally limited to this module and does not change the API contract.
const opexFilterOptionsCache = new Map();
const opexFilterOptionsInFlight = new Map();
const OPEX_FILTER_CACHE_TTL_MS = 60 * 1000;

const normalizeModalOpexOptions = (response) => {
    const root = response?.data ?? response ?? {};
    const source = root?.data ?? root?.options ?? root?.filter_options ?? root;
    const pick = (...keys) => {
        for (const key of keys) {
            if (Array.isArray(source?.[key])) return source[key];
            if (Array.isArray(root?.[key])) return root[key];
        }
        return [];
    };
    return {
        ...source,
        default_legal_group_id:
            source?.default_legal_group_id ??
            source?.defaultLegalGroupId ??
            root?.default_legal_group_id ??
            root?.defaultLegalGroupId ??
            null,
        legal_groups: pick("legal_groups", "legalGroups", "legal_group_options", "legalGroupOptions"),
        legal_entities: pick("legal_entities", "legalEntities", "legal_entity_options", "legalEntityOptions"),
        parent_divisions: pick("parent_divisions", "parentDivisions", "parent_division_options", "parentDivisionOptions"),
        subdivisions: pick("subdivisions", "sub_divisions", "subDivisions", "subdivision_options", "subDivisionOptions"),
        years: pick("years", "fiscal_years", "fiscalYears"),
        periods: pick("periods", "period", "period_options"),
        currencies: pick("currencies", "reporting_currencies", "reportingCurrencies"),
    };
};

const requestOpexFilterOptionsCached = async (filters = {}) => {
    const stable = Object.keys(filters || {}).sort().reduce((acc, key) => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== "" &&
            !(Array.isArray(value) && value.length === 0)) acc[key] = value;
        return acc;
    }, {});
    const key = JSON.stringify(stable);
    const cached = opexFilterOptionsCache.get(key);
    if (cached && Date.now() - cached.time < OPEX_FILTER_CACHE_TTL_MS) return cached.value;
    if (opexFilterOptionsInFlight.has(key)) return opexFilterOptionsInFlight.get(key);

    const promise = getOpexFilterOptions(stable)
        .then((response) => {
            const normalized = normalizeModalOpexOptions(response);
            opexFilterOptionsCache.set(key, { time: Date.now(), value: normalized });
            return normalized;
        })
        .finally(() => opexFilterOptionsInFlight.delete(key));
    opexFilterOptionsInFlight.set(key, promise);
    return promise;
};

const resolveModalDefaultLegalGroupId = (options) => {
    const explicit = options?.default_legal_group_id;
    if (explicit !== null && explicit !== undefined && explicit !== "") return String(explicit);
    const groups = Array.isArray(options?.legal_groups) ? options.legal_groups : [];
    const fj = groups.find((option) => {
        const label = String(getOptionLabel(option) || "").trim().toLowerCase();
        return label === "fj group" || label.includes("fj group");
    });
    return fj ? getOptionId(fj) : "";
};

function MonthOnMonthOpexViewAllModal({
    open,
    reportingCurrency = "AED",
    viewAllUnit = "millions",
    setViewAllUnit,
    exporting = "",
    handleExport,
    rows = [],
    renderTable,
    filterOptions = {},
    initialFilters = {},
    onApplyFilters,
    onResetFilters,
    applyingFilters = false,
    onClose,
}) {
    const [filters, setFilters] = useState(() => normalizeFilterState(initialFilters));
    const [modalFilterOptions, setModalFilterOptions] = useState(() => normalizeModalOpexOptions(filterOptions));
    const [modalOptionsLoading, setModalOptionsLoading] = useState(false);
    const [modalOptionsError, setModalOptionsError] = useState("");
    const initializedRef = useRef(false);
    const optionRequestSequenceRef = useRef(0);
    const defaultGroupIdRef = useRef("");

    // Keep the modal's option state separate from the main dashboard's options.
    useEffect(() => {
        setModalFilterOptions((previous) => {
            const incoming = normalizeModalOpexOptions(filterOptions);
            return {
                ...previous,
                legal_groups: incoming.legal_groups.length ? incoming.legal_groups : previous.legal_groups,
                years: incoming.years.length ? incoming.years : previous.years,
                periods: incoming.periods.length ? incoming.periods : previous.periods,
                currencies: incoming.currencies.length ? incoming.currencies : previous.currencies,
            };
        });
    }, [filterOptions]);

    const fetchModalOptions = async (requestedFilters = {}, { showLoading = true } = {}) => {
        const requestId = ++optionRequestSequenceRef.current;
        if (showLoading) setModalOptionsLoading(true);
        setModalOptionsError("");
        try {
            const normalized = await requestOpexFilterOptionsCached({
                reporting_currency: reportingCurrency || "AED",
                ...requestedFilters,
            });
            if (requestId !== optionRequestSequenceRef.current) return normalized;

            setModalFilterOptions((previous) => ({
                ...previous,
                ...normalized,
                // Keep stable global lists if a scoped response omits them.
                legal_groups: normalized.legal_groups.length ? normalized.legal_groups : previous.legal_groups,
                years: normalized.years.length ? normalized.years : previous.years,
                periods: normalized.periods.length ? normalized.periods : previous.periods,
                currencies: normalized.currencies.length ? normalized.currencies : previous.currencies,
            }));
            return normalized;
        } catch (error) {
            if (requestId === optionRequestSequenceRef.current) {
                console.error("Failed to load Month-on-Month OPEX View All filters:", error);
                setModalOptionsError("Unable to refresh filter options. Please try again.");
            }
            return null;
        } finally {
            if (requestId === optionRequestSequenceRef.current && showLoading) setModalOptionsLoading(false);
        }
    };

    useEffect(() => {
        if (!open) {
            initializedRef.current = false;
            return;
        }
        if (initializedRef.current) return;
        initializedRef.current = true;
        let cancelled = false;

        const initialize = async () => {
            // Show options already supplied by the parent immediately; refresh in parallel.
            const baseOptions = normalizeModalOpexOptions(filterOptions);
            setModalFilterOptions((previous) => ({
                ...previous,
                ...baseOptions,
                legal_groups: baseOptions.legal_groups.length ? baseOptions.legal_groups : previous.legal_groups,
            }));

            let groupsOptions = baseOptions;
            if (!groupsOptions.legal_groups.length) {
                groupsOptions = await requestOpexFilterOptionsCached({ reporting_currency: reportingCurrency || "AED" });
            }
            if (cancelled) return;

            const defaultGroupId = resolveModalDefaultLegalGroupId(groupsOptions);
            defaultGroupIdRef.current = defaultGroupId;
            const initial = normalizeFilterState(initialFilters);
            const selectedGroup = initial.legal_group.length ? initial.legal_group : (defaultGroupId ? [defaultGroupId] : []);
            setFilters({
                ...initial,
                legal_group: selectedGroup,
                legal_entity: [...initial.legal_entity],
                parent_division: [...initial.parent_division],
                subdivision: [...initial.subdivision],
            });

            if (selectedGroup.length) {
                const scoped = await requestOpexFilterOptionsCached({
                    reporting_currency: reportingCurrency || "AED",
                    legal_group_id: selectedGroup,
                });
                if (cancelled) return;
                setModalFilterOptions((previous) => ({
                    ...previous,
                    ...scoped,
                    legal_groups: scoped.legal_groups.length ? scoped.legal_groups : previous.legal_groups,
                    years: scoped.years.length ? scoped.years : previous.years,
                    periods: scoped.periods.length ? scoped.periods : previous.periods,
                    currencies: scoped.currencies.length ? scoped.currencies : previous.currencies,
                }));
            }
        };

        setModalOptionsLoading(true);
        initialize()
            .catch((error) => {
                if (!cancelled) {
                    console.error("Failed to initialize OPEX View All filters:", error);
                    setModalOptionsError("Unable to load filter options. Please try again.");
                }
            })
            .finally(() => {
                if (!cancelled) setModalOptionsLoading(false);
            });
        return () => { cancelled = true; };
    }, [open]);

    const cascaded = useMemo(() => {
        const legalGroups = modalFilterOptions?.legal_groups || [];
        const legalEntities = cascadeOptions(
            modalFilterOptions?.legal_entities || [],
            filters.legal_group,
            ["legal_group_id", "legalGroupId", "group_id", "legal_group", "groupId"]
        );
        const parentDivisions = cascadeOptions(
            cascadeOptions(
                modalFilterOptions?.parent_divisions || [],
                filters.legal_group,
                ["legal_group_id", "legalGroupId", "group_id", "legal_group", "groupId"]
            ),
            filters.legal_entity,
            ["legal_entity_id", "legalEntityId", "entity_id", "legal_entity", "entityId"]
        );
        const subdivisions = cascadeOptions(
            cascadeOptions(
                cascadeOptions(
                    modalFilterOptions?.subdivisions || [],
                    filters.legal_group,
                    ["legal_group_id", "legalGroupId", "group_id", "legal_group", "groupId"]
                ),
                filters.legal_entity,
                ["legal_entity_id", "legalEntityId", "entity_id", "legal_entity", "entityId"]
            ),
            filters.parent_division,
            ["parent_division_id", "parentDivisionId", "division_id", "parent_division", "divisionId"]
        );
        return { legalGroups, legalEntities, parentDivisions, subdivisions };
    }, [modalFilterOptions, filters]);

    const updateCascade = async (key, values) => {
        const selected = Array.isArray(values) ? values.map(String) : [];
        const next = { ...filters, [key]: selected };
        if (key === "legal_group") {
            next.legal_entity = [];
            next.parent_division = [];
            next.subdivision = [];
        } else if (key === "legal_entity") {
            next.parent_division = [];
            next.subdivision = [];
        } else if (key === "parent_division") {
            next.subdivision = [];
        }
        setFilters(next);

        // Fetch options for the changed parent scope; child options are replaced only by this modal.
        if (key === "legal_group") {
            if (!selected.length) {
                setModalFilterOptions((previous) => ({
                    ...previous, legal_entities: [], parent_divisions: [], subdivisions: [],
                }));
                return;
            }
            setModalFilterOptions((previous) => ({
                ...previous, legal_entities: [], parent_divisions: [], subdivisions: [],
            }));
            await fetchModalOptions({ legal_group_id: selected });
        } else if (key === "legal_entity") {
            setModalFilterOptions((previous) => ({ ...previous, parent_divisions: [], subdivisions: [] }));
            if (selected.length) await fetchModalOptions({ legal_group_id: next.legal_group, legal_entity_id: selected });
        } else if (key === "parent_division") {
            setModalFilterOptions((previous) => ({ ...previous, subdivisions: [] }));
            if (selected.length) await fetchModalOptions({
                legal_group_id: next.legal_group,
                legal_entity_id: next.legal_entity,
                parent_division_id: selected,
            });
        }
    };

    const setSimpleFilter = (key, values) => {
        setFilters((previous) => ({
            ...previous,
            [key]: Array.isArray(values) ? values.map(String) : [],
        }));
    };

    const apply = async () => {
        if (typeof onApplyFilters !== "function") return;
        await onApplyFilters(filters);
    };

    const reset = async () => {
        const groupId = defaultGroupIdRef.current || resolveModalDefaultLegalGroupId(modalFilterOptions);
        const resetFilters = {
            year: [],
            legal_group: groupId ? [String(groupId)] : [],
            legal_entity: [],
            parent_division: [],
            subdivision: [],
            period: [],
            reporting_currency: [],
        };
        setFilters(resetFilters);
        setModalFilterOptions((previous) => ({
            ...previous, legal_entities: [], parent_divisions: [], subdivisions: [],
        }));
        if (groupId) await fetchModalOptions({ legal_group_id: [String(groupId)] });
        if (typeof onResetFilters === "function") {
            await onResetFilters();
            return;
        }
        if (typeof onApplyFilters === "function") await onApplyFilters(resetFilters);
    };

    /* =========================================================
       VIEW ALL BACKGROUND BLUR — SCOPED TO THIS MODAL ONLY
       Keep the main page visible, dark and blurred while the
       View All modal itself remains sharp.
    ========================================================= */
    useEffect(() => {
        if (typeof document === "undefined") return undefined;

        const appRoot =
            document.getElementById("root") ||
            document.getElementById("app") ||
            document.querySelector("[data-reactroot]");

        if (!appRoot) return undefined;

        if (open) {
            appRoot.classList.add("mom-opex-viewall-page-blur");
            document.body.classList.add("mom-opex-viewall-open");
            document.body.style.overflow = "hidden";
        } else {
            appRoot.classList.remove("mom-opex-viewall-page-blur");
            document.body.classList.remove("mom-opex-viewall-open");
            document.body.style.overflow = "";
        }

        return () => {
            appRoot.classList.remove("mom-opex-viewall-page-blur");
            document.body.classList.remove("mom-opex-viewall-open");
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    const modalScrollbarStyles = `
        #root.mom-opex-viewall-page-blur,
        #app.mom-opex-viewall-page-blur,
        [data-reactroot].mom-opex-viewall-page-blur {
            filter: blur(8px);
            transition: filter 0.15s ease;
        }

        .mom-opex-viewall-overlay {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            min-height: 100vh !important;
            z-index: 2147483647 !important;
            background: rgba(15, 23, 42, 0.58) !important;
            display: flex !important;
            align-items: stretch !important;
            justify-content: center !important;
            padding: 0 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
        }

        .mom-opex-viewall-overlay > .mom-opex-viewall-container {
            width: calc(100vw - 32px);
            max-width: 1600px;
            height: 100vh;
            min-height: 100vh;
            max-height: 100vh;
            margin: 0;
            box-sizing: border-box;
        }

        .mom-opex-viewall-scroll, .mom-opex-viewall-table-scroll, .mom-opex-viewall-scroll * {
            scrollbar-width: auto;
            scrollbar-color: #334155 #E2E8F0;
        }
        .mom-opex-viewall-scroll::-webkit-scrollbar, .mom-opex-viewall-table-scroll::-webkit-scrollbar, .mom-opex-viewall-scroll *::-webkit-scrollbar {
            width: 14px; height: 14px;
        }
        .mom-opex-viewall-scroll::-webkit-scrollbar-track, .mom-opex-viewall-table-scroll::-webkit-scrollbar-track, .mom-opex-viewall-scroll *::-webkit-scrollbar-track {
            background: #E2E8F0; border-radius: 8px;
        }
        .mom-opex-viewall-scroll::-webkit-scrollbar-thumb, .mom-opex-viewall-table-scroll::-webkit-scrollbar-thumb, .mom-opex-viewall-scroll *::-webkit-scrollbar-thumb {
            background: #334155; border-radius: 8px; border: 2px solid #E2E8F0;
        }
        .mom-opex-viewall-scroll::-webkit-scrollbar-thumb:hover, .mom-opex-viewall-table-scroll::-webkit-scrollbar-thumb:hover, .mom-opex-viewall-scroll *::-webkit-scrollbar-thumb:hover {
            background: #1E293B;
        }
    `;

    const modalContent = (
        <div className="mom-opex-viewall-overlay">
            <style>{modalScrollbarStyles}</style>
            <div
                className="mom-opex-viewall-container"
                style={{
                    width: "calc(100vw - 32px)",
                    maxWidth: "1600px",
                    height: "100vh",
                    minHeight: "100vh",
                    maxHeight: "100vh",
                    background: "#FFFFFF",
                    borderRadius: 14,
                    boxShadow: "0 24px 70px rgba(15,23,42,0.30)",
                    position: "relative",
                    zIndex: 2147483647,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    border: "1px solid #E2E8F0",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        minHeight: 70,
                        padding: "0 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #E5E7EB",
                        flexShrink: 0,
                    }}
                >
                    <div style={{ minWidth: 0 }}>
                        <div
                            style={{
                                fontSize: "1rem",
                                lineHeight: 1.2,
                                fontWeight: 800,
                                color: "#1E293B",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            Month-on-Month OPEX Report — View All
                        </div>
                        <div
                            style={{
                                marginTop: 3,
                                fontSize: "0.72rem",
                                lineHeight: 1.35,
                                color: "#64748B",
                                fontWeight: 500,
                            }}
                        >
                            Detailed monthly operating expense performance and YTD variance analysis
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close View All"
                        style={{
                            width: 32,
                            height: 32,
                            flexShrink: 0,
                            border: "1px solid #E2E8F0",
                            background: "#FFFFFF",
                            color: "#64748B",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            borderRadius: 8,
                            padding: 0,
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div
                    style={{
                        padding: "10px 14px 11px",
                        background: "#FFFFFF",
                        borderBottom: "1px solid #E5E7EB",
                        flexShrink: 0,
                        boxSizing: "border-box",
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, minmax(125px, 1fr)) auto",
                            gap: 8,
                            alignItems: "end",
                        }}
                    >
                        <MultiSelectFilter
                            label="Legal Group"
                            options={cascaded.legalGroups}
                            selectedValues={filters.legal_group}
                            onChange={(values) => updateCascade("legal_group", values)}
                        />
                        <MultiSelectFilter
                            label="Legal Entity"
                            options={cascaded.legalEntities}
                            selectedValues={filters.legal_entity}
                            onChange={(values) => updateCascade("legal_entity", values)}
                        />
                        <MultiSelectFilter
                            label="Parent Division"
                            options={cascaded.parentDivisions}
                            selectedValues={filters.parent_division}
                            onChange={(values) => updateCascade("parent_division", values)}
                        />
                        <MultiSelectFilter
                            label="Sub-Division"
                            options={cascaded.subdivisions}
                            selectedValues={filters.subdivision}
                            onChange={(values) => setSimpleFilter("subdivision", values)}
                        />
                        <MultiSelectFilter
                            label="Year"
                            options={modalFilterOptions?.years || []}
                            selectedValues={filters.year}
                            onChange={(values) => setSimpleFilter("year", values)}
                        />
                        <MultiSelectFilter
                            label="Period"
                            options={modalFilterOptions?.periods || []}
                            selectedValues={filters.period}
                            onChange={(values) => setSimpleFilter("period", values)}
                        />
                        <MultiSelectFilter
                            label="Reporting Currency"
                            options={modalFilterOptions?.currencies || []}
                            selectedValues={filters.reporting_currency}
                            singleSelect
                            onChange={(values) => setSimpleFilter("reporting_currency", values)}
                        />

                        <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
                            <button
                                type="button"
                                onClick={apply}
                                disabled={applyingFilters}
                                style={{
                                    height: 34,
                                    padding: "0 15px",
                                    borderRadius: 9,
                                    border: "1px solid #6D63E8",
                                    background: applyingFilters ? "#A5A7F8" : "#6D63E8",
                                    color: "#FFFFFF",
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    cursor: applyingFilters ? "not-allowed" : "pointer",
                                    whiteSpace: "nowrap",
                                    boxShadow: "0 2px 5px rgba(91,63,228,0.16)",
                                }}
                            >
                                {applyingFilters ? "Applying…" : "Apply"}
                            </button>
                            <button
                                type="button"
                                onClick={reset}
                                disabled={applyingFilters}
                                style={{
                                    height: 34,
                                    padding: "0 14px",
                                    borderRadius: 9,
                                    border: "1px solid #E2E8F0",
                                    background: "#FFFFFF",
                                    color: "#475569",
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    cursor: applyingFilters ? "not-allowed" : "pointer",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        minHeight: 52,
                        padding: "7px 18px",
                        background: "#FFFFFF",
                        borderBottom: "1px solid #E5E7EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 8,
                        flexShrink: 0,
                        boxSizing: "border-box",
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setViewAllUnit("aed")}
                        style={{
                            height: 30,
                            minWidth: 42,
                            padding: "0 10px",
                            borderRadius: 7,
                            border: "1px solid #E2E8F0",
                            background: viewAllUnit === "aed" ? "#5B3FE4" : "#FFFFFF",
                            color: viewAllUnit === "aed" ? "#FFFFFF" : "#334155",
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        AED
                    </button>

                    <button
                        type="button"
                        onClick={() => setViewAllUnit("millions")}
                        style={{
                            height: 30,
                            minWidth: 78,
                            padding: "0 10px",
                            borderRadius: 7,
                            border: viewAllUnit === "millions" ? "1px solid #5B3FE4" : "1px solid #E2E8F0",
                            background: viewAllUnit === "millions" ? "#5B3FE4" : "#FFFFFF",
                            color: viewAllUnit === "millions" ? "#FFFFFF" : "#334155",
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        AED Millions
                    </button>

                    <ExportButtons
                        endpoint="month-on-month-opex"
                        exporting={exporting}
                        handleExport={(format) => handleExport?.(format, filters)}
                    />
                </div>

                <div
                    className="mom-opex-viewall-scroll"
                    style={{
                        flex: 1,
                        minHeight: 0,
                        overflow: "auto",
                        padding: "0 16px 14px",
                        background: "#FFFFFF",
                        boxSizing: "border-box",
                    }}
                >
                    {renderTable(rows, true)}
                </div>

                <div
                    style={{
                        minHeight: 54,
                        padding: "0 18px",
                        background: "#FFFFFF",
                        borderTop: "1px solid #E5E7EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        flexShrink: 0,
                        boxSizing: "border-box",
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            height: 32,
                            padding: "0 16px",
                            borderRadius: 7,
                            border: "1px solid #D8E0EA",
                            background: "#FFFFFF",
                            color: "#334155",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    return typeof document !== "undefined"
        ? createPortal(modalContent, document.body)
        : null;
}


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
    onFilterApply,
    onExportExcel,
    onExportPdf,
}) {
    const [collapsed, setCollapsed] =
        useState(false);

    const [mainUnit, setMainUnit] =
        useState("millions");

    const [viewAllUnit, setViewAllUnit] =
        useState("millions");

    // Keep Main table and View All expansion state completely independent. 
    const [expandedRows, setExpandedRows] =
        useState({});

    const [viewAllExpandedRows, setViewAllExpandedRows] =
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
       MONTH-ON-MONTH BACKEND EXPORT

       Backend contract: GET /api/opex/{report_name}/export
       Month-on-Month report name: monthly
       The response is downloaded as the backend-generated file.
    ===================================================== */
    const handleBackendExport = async (format, filtersOverride = null) => {
        setShowExportMenu(false);

        const sourceFilters = filtersOverride || appliedMainFilters || {};
        const cleanArray = (value) => {
            if (value === null || value === undefined || value === "" || value === "All") return [];
            const values = Array.isArray(value) ? value : [value];
            return values
                .filter((item) => item !== null && item !== undefined && item !== "" && item !== "All")
                .map((item) => typeof item === "object"
                    ? String(item?.value ?? item?.id ?? item?.code ?? item?.name ?? "")
                    : String(item))
                .filter(Boolean);
        };

        const params = new URLSearchParams();
        params.set("format", format === "excel" ? "excel" : "pdf");

        const appendArray = (key, value) => {
            cleanArray(value).forEach((item) => params.append(key, item));
        };

        appendArray("year", sourceFilters?.year);
        appendArray("legal_group_id", sourceFilters?.legal_group_id ?? sourceFilters?.legal_group);
        appendArray("legal_entity_id", sourceFilters?.legal_entity_id ?? sourceFilters?.legal_entity);
        appendArray("parent_division_id", sourceFilters?.parent_division_id ?? sourceFilters?.parent_division);
        appendArray("subdivision_id", sourceFilters?.subdivision_id ?? sourceFilters?.subdivision);
        appendArray("period_name", sourceFilters?.period_name ?? sourceFilters?.period);

        const currency = cleanArray(sourceFilters?.reporting_currency)[0] || reportingCurrency || "AED";
        if (currency) params.set("reporting_currency", currency);

        const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
        const apiUrl = configuredBaseUrl.endsWith("/api")
            ? `${configuredBaseUrl}/opex/monthly/export`
            : `${configuredBaseUrl}/api/opex/monthly/export`;

        setExporting(format);
        setMainFilterError("");

        try {
            const token = localStorage.getItem("finsight_token") || localStorage.getItem("token") || "";
            const response = await fetch(`${apiUrl}?${params.toString()}`, {
                method: "GET",
                headers: {
                    Accept: "application/octet-stream, application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!response.ok) {
                let message = `Export failed (${response.status})`;
                try {
                    const body = await response.json();
                    message = body?.detail || body?.message || message;
                } catch (_) { }
                throw new Error(message);
            }

            const blob = await response.blob();
            const disposition = response.headers.get("content-disposition") || "";
            const filenameMatch = disposition.match(/filename[^;=]*=(?:UTF-8''|\")?([^;\"]+)/i);
            const extension = format === "excel" ? "xlsx" : "pdf";
            const fallbackName = `Month-on-Month-OPEX.${extension}`;
            const fileName = filenameMatch?.[1]
                ? decodeURIComponent(filenameMatch[1].replace(/^\"|\"$/g, ""))
                : fallbackName;

            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error(`Failed to export Month-on-Month OPEX as ${format}:`, error);
            setMainFilterError(error?.message || `Failed to export Month-on-Month OPEX as ${format.toUpperCase()}.`);
        } finally {
            setExporting("");
        }
    };

    const handleExportExcel = (filtersOverride = null) => handleBackendExport("excel", filtersOverride);
    const handleExportPdf = (filtersOverride = null) => handleBackendExport("pdf", filtersOverride);

    /* ===================================================== 
       VIEW ALL 
    ===================================================== */

    const [showViewAll, setShowViewAll] =
        useState(false);

    const [viewAllFilters, setViewAllFilters] = useState({
        year: [],
        legal_group: [],
        legal_entity: [],
        parent_division: [],
        subdivision: [],
        period: [],
        reporting_currency: [],
    });

    // View All data is kept separate from the main-table filtered data.
    // This prevents View All Apply/Reset from changing the main table.
    const [viewAllFilteredData, setViewAllFilteredData] = useState(null);

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
       MAIN TABLE FILTERS
       Live options are loaded from getOpexFilterOptions().
       Hierarchy filters are cascade + multi-select.
    ===================================================== */
    const normalizeFilterArray = (value, fallback = []) => {
        if (Array.isArray(value)) {
            return value
                .filter((item) => item !== null && item !== undefined && item !== "" && item !== "All")
                .map((item) =>
                    typeof item === "object"
                        ? String(item?.value ?? item?.id ?? item?.code ?? item?.name ?? "")
                        : String(item)
                )
                .filter(Boolean);
        }

        if (value !== null && value !== undefined && value !== "" && value !== "All") {
            return [String(value)];
        }

        return [...fallback];
    };

    const initialMainFilterState = useMemo(() => ({
        year: normalizeFilterArray(
            hierarchyFilters?.year,
            periodName ? [String(periodName).match(/(\d{4})/)?.[1] || ""] : []
        ),
        legal_group: normalizeFilterArray(hierarchyFilters?.legal_group_id),
        legal_entity: normalizeFilterArray(hierarchyFilters?.legal_entity_id),
        parent_division: normalizeFilterArray(hierarchyFilters?.parent_division_id),
        subdivision: normalizeFilterArray(hierarchyFilters?.subdivision_id),
        period: normalizeFilterArray(periodName),
        reporting_currency: normalizeFilterArray(reportingCurrency || "AED"),
    }), [periodName, reportingCurrency, hierarchyFilters]);

    const [mainFilterOptions, setMainFilterOptions] = useState({
        legal_groups: [],
        legal_entities: [],
        parent_divisions: [],
        subdivisions: [],
        years: [],
        periods: [],
        currencies: [],
    });

    const [mainFilters, setMainFilters] = useState(initialMainFilterState);
    const [appliedMainFilters, setAppliedMainFilters] = useState(initialMainFilterState);
    const [filteredMainData, setFilteredMainData] = useState(null);
    const [mainFilterLoading, setMainFilterLoading] = useState(false);
    const [mainFilterError, setMainFilterError] = useState("");
    const mainFiltersInitializedRef = useRef(false);

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
            ...(appliedMainFilters || {}),
        };

        initialViewAllFiltersRef.current = initialFilters;

        setViewAllFilters(initialFilters);

        // IMPORTANT: 
        // Initialize only once when View All opens. 
        // Do not re-initialize when parent filters/data change. 
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [showViewAll, appliedMainFilters]);


    useEffect(() => {
        let cancelled = false;

        const loadFilterOptions = async () => {
            try {
                const response = await getOpexFilterOptionsShared();
                const source = response?.data ?? response ?? {};

                if (!cancelled) {
                    setMainFilterOptions({
                        legal_groups: source.legal_groups ?? source.legalGroups ?? [],
                        legal_entities: source.legal_entities ?? source.legalEntities ?? [],
                        parent_divisions: source.parent_divisions ?? source.parentDivisions ?? [],
                        subdivisions: source.subdivisions ?? source.subdivisions ?? [],
                        years: source.years ?? source.fiscal_years ?? source.fiscalYears ?? [],
                        periods: source.periods ?? [],
                        currencies: source.currencies ?? source.reporting_currencies ?? source.reportingCurrencies ?? [],
                    });
                }
            } catch (error) {
                console.error("Failed to load OPEX filter options:", error);
            }
        };

        loadFilterOptions();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (mainFiltersInitializedRef.current) return;
        setMainFilters(initialMainFilterState);
        setAppliedMainFilters(initialMainFilterState);
        mainFiltersInitializedRef.current = true;
    }, [initialMainFilterState]);

    const resolvedMainFilterOptions = useMemo(() => ({
        legal_groups: mainFilterOptions.legal_groups?.length
            ? mainFilterOptions.legal_groups
            : filterOptions?.legal_groups || [],
        legal_entities: mainFilterOptions.legal_entities?.length
            ? mainFilterOptions.legal_entities
            : filterOptions?.legal_entities || [],
        parent_divisions: mainFilterOptions.parent_divisions?.length
            ? mainFilterOptions.parent_divisions
            : filterOptions?.parent_divisions || [],
        subdivisions: mainFilterOptions.subdivisions?.length
            ? mainFilterOptions.subdivisions
            : filterOptions?.subdivisions || [],
        years: mainFilterOptions.years?.length
            ? mainFilterOptions.years
            : filterOptions?.years || [],
        periods: mainFilterOptions.periods?.length
            ? mainFilterOptions.periods
            : filterOptions?.periods || [],
        currencies: mainFilterOptions.currencies?.length
            ? mainFilterOptions.currencies
            : filterOptions?.currencies || [],
    }), [mainFilterOptions, filterOptions]);

    const getResolvedOptionId = (option) => {
        if (option === null || option === undefined) return "";
        if (typeof option !== "object") return String(option);
        return String(
            option?.value ??
            option?.id ??
            option?.code ??
            option?.legal_group_id ??
            option?.legal_entity_id ??
            option?.parent_division_id ??
            option?.subdivision_id ??
            option?.period_name ??
            option?.year ??
            option?.name ??
            ""
        );
    };

    const getAllResolvedIds = (options) =>
        (Array.isArray(options) ? options : [])
            .map(getResolvedOptionId)
            .filter(Boolean);

    const getRelationValue = (option, keys) => {
        if (option === null || option === undefined || typeof option !== "object") return [];

        const source = option?.meta && typeof option.meta === "object"
            ? { ...option, ...option.meta }
            : option;

        for (const key of keys) {
            const value = source?.[key];
            if (Array.isArray(value)) {
                return value.map((item) =>
                    typeof item === "object"
                        ? String(item?.value ?? item?.id ?? item?.code ?? item?.name ?? "")
                        : String(item)
                ).filter(Boolean);
            }
            if (value !== undefined && value !== null && value !== "") {
                return [String(value)];
            }
        }

        return [];
    };

    const cascadeMainOptions = (options, selected, relationKeys) => {
        const selectedValues = normalizeFilterArray(selected).filter((value) => value !== "All");
        if (!selectedValues.length) return Array.isArray(options) ? options : [];

        const list = Array.isArray(options) ? options : [];
        let relationFound = false;
        const filtered = list.filter((option) => {
            const relationValues = getRelationValue(option, relationKeys);
            if (!relationValues.length) return true;
            relationFound = true;
            return selectedValues.some((value) => relationValues.includes(String(value)));
        });

        return relationFound ? filtered : list;
    };

    const cascadingMainOptions = useMemo(() => ({
        legal_groups: resolvedMainFilterOptions.legal_groups || [],
        legal_entities: cascadeMainOptions(
            resolvedMainFilterOptions.legal_entities,
            mainFilters.legal_group,
            ["legal_group_id", "legalGroupId", "legal_group", "group_id", "groupId"]
        ),
        parent_divisions: cascadeMainOptions(
            cascadeMainOptions(
                resolvedMainFilterOptions.parent_divisions,
                mainFilters.legal_group,
                ["legal_group_id", "legalGroupId", "legal_group", "group_id", "groupId"]
            ),
            mainFilters.legal_entity,
            ["legal_entity_id", "legalEntityId", "legal_entity", "entity_id", "entityId"]
        ),
        subdivisions: cascadeMainOptions(
            cascadeMainOptions(
                cascadeMainOptions(
                    resolvedMainFilterOptions.subdivisions,
                    mainFilters.legal_group,
                    ["legal_group_id", "legalGroupId", "legal_group", "group_id", "groupId"]
                ),
                mainFilters.legal_entity,
                ["legal_entity_id", "legalEntityId", "legal_entity", "entity_id", "entityId"]
            ),
            mainFilters.parent_division,
            ["parent_division_id", "parentDivisionId", "parent_division", "division_id", "divisionId"]
        ),
    }), [resolvedMainFilterOptions, mainFilters]);

    /* Filter options never select themselves. Checkbox state is derived only from mainFilters. */

    const cascadeMainOptionsForSelection = (options, selected, relationKeys) => {
        const selectedValues = normalizeFilterArray(selected);
        if (!selectedValues.length) return Array.isArray(options) ? options : [];
        const list = Array.isArray(options) ? options : [];
        let relationFound = false;
        const filtered = list.filter((option) => {
            const relationValues = getRelationValue(option, relationKeys);
            if (!relationValues.length) return true;
            relationFound = true;
            return selectedValues.some((value) => relationValues.includes(String(value)));
        });
        return relationFound ? filtered : list;
    };

    const updateMainCascadeFilter = (key, values) => {
        const selected = Array.isArray(values) ? values : [];

        setMainFilters((prev) => {
            const next = { ...prev, [key]: selected };

            if (key === "legal_group") {
                next.legal_entity = [];
                next.parent_division = [];
                next.subdivision = [];
            } else if (key === "legal_entity") {
                next.parent_division = [];
                next.subdivision = [];
            } else if (key === "parent_division") {
                next.subdivision = [];
            }

            return next;
        });
    };

    const buildMainApiFilters = (filters) => {
        const clean = (value) => normalizeFilterArray(value).filter((item) => item !== "All");

        const year = clean(filters?.year);
        const legalGroup = clean(filters?.legal_group);
        const legalEntity = clean(filters?.legal_entity);
        const parentDivision = clean(filters?.parent_division);
        const subdivision = clean(filters?.subdivision);
        const period = clean(filters?.period);
        const currency = clean(filters?.reporting_currency);

        return {
            year: year.length ? year : undefined,
            legal_group_id: legalGroup.length ? legalGroup : undefined,
            legal_entity_id: legalEntity.length ? legalEntity : undefined,
            parent_division_id: parentDivision.length ? parentDivision : undefined,
            subdivision_id: subdivision.length ? subdivision : undefined,
            period_name: period.length ? period : undefined,
            reporting_currency: currency[0] || reportingCurrency || "AED",
        };
    };

    const normalizeMonthlyResponse = (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.items)) return response.items;
        if (Array.isArray(response?.months)) return response.months;
        if (Array.isArray(response?.results)) return response.results;
        return [];
    };

    const applyMainFilters = async () => {
        const nextApplied = {
            ...mainFilters,
            legal_group: normalizeFilterArray(mainFilters.legal_group),
            legal_entity: normalizeFilterArray(mainFilters.legal_entity),
            parent_division: normalizeFilterArray(mainFilters.parent_division),
            subdivision: normalizeFilterArray(mainFilters.subdivision),
            year: normalizeFilterArray(mainFilters.year),
            period: normalizeFilterArray(mainFilters.period),
            reporting_currency: normalizeFilterArray(mainFilters.reporting_currency),
        };

        setAppliedMainFilters(nextApplied);
        // Natural-account values depend on the applied filters. Clear cached
        // details and collapse expanded rows so old-filter data is never shown.
        setCategoryDetails({});
        setCategoryDetailLoading({});
        setCategoryDetailError({});
        setExpandedRows({});
        setViewAllExpandedRows({});
        setMainFilterLoading(true);
        setMainFilterError("");

        try {
            const response = await getOpexMonthly(buildMainApiFilters(nextApplied));
            setFilteredMainData(normalizeMonthlyResponse(response));

            if (typeof onFilterApply === "function") {
                await onFilterApply(nextApplied);
            }
        } catch (error) {
            console.error("Failed to apply Month-on-Month OPEX filters:", error);
            setFilteredMainData([]);
            setMainFilterError(
                error?.response?.data?.detail ||
                error?.message ||
                "Unable to load Month-on-Month OPEX for the selected filters."
            );
        } finally {
            setMainFilterLoading(false);
        }
    };

    const resetMainFilters = async () => {
        const reset = {
            ...initialMainFilterState,
            legal_group: [],
            legal_entity: [],
            parent_division: [],
            subdivision: [],
        };
        setMainFilters(reset);
        setAppliedMainFilters(reset);
        setCategoryDetails({});
        setCategoryDetailLoading({});
        setCategoryDetailError({});
        setExpandedRows({});
        setViewAllExpandedRows({});
        setFilteredMainData(null);
        setMainFilterError("");

        if (typeof onFilterApply === "function") {
            await onFilterApply(reset);
        }
    };

    const [applyingViewAllFilters, setApplyingViewAllFilters] = useState(false);





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

    // APPLY View All filters and wait for the parent to refresh backend data.
    const handleApplyViewAllFilters = async (selectedFilters = viewAllFilters) => {
        const filtersToApply = {
            year: getSelectedFilterValues(selectedFilters?.year),
            legal_group: getSelectedFilterValues(selectedFilters?.legal_group),
            legal_entity: getSelectedFilterValues(selectedFilters?.legal_entity),
            parent_division: getSelectedFilterValues(selectedFilters?.parent_division),
            subdivision: getSelectedFilterValues(selectedFilters?.subdivision),
            period: getSelectedFilterValues(selectedFilters?.period),
            reporting_currency: getSelectedFilterValues(selectedFilters?.reporting_currency),
        };

        // Period is optional: the API should receive the selected filters even
        // when the user intentionally clears Period to view the full range.
        try {
            setApplyingViewAllFilters(true);
            setViewAllFilters(filtersToApply);
            setViewAllExpandedRows({});

            const response = await getOpexMonthly(
                buildMainApiFilters(filtersToApply)
            );

            // IMPORTANT: only View All receives this response.
            // The main table state is never touched here.
            setViewAllFilteredData(
                normalizeMonthlyResponse(response)
            );
        } catch (error) {
            console.error(
                "Failed to apply Month-on-Month View All filters:",
                error
            );
            setViewAllFilteredData([]);
        } finally {
            setApplyingViewAllFilters(false);
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
            legal_group: [
                ...(initialViewAllFiltersRef.current?.legal_group || [])
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
            reporting_currency: [
                ...(initialViewAllFiltersRef.current?.reporting_currency || [reportingCurrency || "AED"])
            ],
        };

        setViewAllFilters(resetFilters);
        setViewAllExpandedRows({});

        // Reset only the View All data; do not call the parent/main-table filter.
        try {
            setApplyingViewAllFilters(true);

            const response = await getOpexMonthly(
                buildMainApiFilters(resetFilters)
            );

            setViewAllFilteredData(
                normalizeMonthlyResponse(response)
            );
        } catch (error) {
            console.error(
                "Failed to reset Month-on-Month View All filters:",
                error
            );
            setViewAllFilteredData([]);
        } finally {
            setApplyingViewAllFilters(false);
        }
    };

    /* =====================================================
       CASCADE FILTER HELPERS
    ===================================================== */

    const optionValue = (option, keys = []) => {
        if (option === null || option === undefined) return "";
        if (typeof option !== "object") return String(option);
        for (const key of keys) {
            const value = option?.[key];
            if (value !== undefined && value !== null && value !== "") {
                return String(value);
            }
        }
        return String(
            option?.value ?? option?.id ?? option?.code ?? option?.name ?? ""
        );
    };

    const optionBelongsTo = (option, selected, keys) => {
        if (!Array.isArray(selected) || selected.length === 0) return true;
        const parentValue = optionValue(option, keys);
        return selected.map(String).includes(parentValue);
    };

    const cascadedLegalEntities = useMemo(() => {
        const options = filterOptions?.legal_entities || [];
        return options.filter((option) =>
            optionBelongsTo(
                option,
                viewAllFilters.legal_group,
                ["legal_group_id", "legalGroupId", "group_id", "legal_group", "groupId"]
            )
        );
    }, [filterOptions, viewAllFilters.legal_group]);

    const cascadedParentDivisions = useMemo(() => {
        const options = filterOptions?.parent_divisions || [];
        return options.filter((option) =>
            optionBelongsTo(
                option,
                viewAllFilters.legal_entity,
                ["legal_entity_id", "legalEntityId", "entity_id", "legal_entity", "entityId"]
            )
        );
    }, [filterOptions, viewAllFilters.legal_entity]);

    const cascadedSubdivisions = useMemo(() => {
        const options = filterOptions?.subdivisions || [];
        return options.filter((option) =>
            optionBelongsTo(
                option,
                viewAllFilters.parent_division,
                ["parent_division_id", "parentDivisionId", "division_id", "parent_division", "divisionId"]
            )
        );
    }, [filterOptions, viewAllFilters.parent_division]);

    const updateCascadeFilter = (key, values) => {
        setViewAllFilters((prev) => {
            const next = { ...prev, [key]: Array.isArray(values) ? values : [] };

            if (key === "legal_group") {
                next.legal_entity = [];
                next.parent_division = [];
                next.subdivision = [];
            } else if (key === "legal_entity") {
                next.parent_division = [];
                next.subdivision = [];
            } else if (key === "parent_division") {
                next.subdivision = [];
            }

            return next;
        });
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

    const mainTableRows =
        filteredMainData !== null
            ? filteredMainData
            : rows;

    const effectiveViewAllRows =
        viewAllFilteredData !== null
            ? viewAllFilteredData
            : (
                viewAllRows.length > 0
                    ? viewAllRows
                    : mainTableRows
            );
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

    const loadCategoryDetails = async (item, isViewAll = false) => {
        const category = item?.category;

        if (!category) {
            return [];
        }

        // Main report and View All have independent applied filter contexts.
        const detailFilterState = isViewAll ? viewAllFilters : appliedMainFilters;
        const appliedApiFilters = buildMainApiFilters(detailFilterState);
        const cacheKey = JSON.stringify({ category, filters: appliedApiFilters });

        if (Array.isArray(categoryDetails[cacheKey])) {
            return categoryDetails[cacheKey];
        }

        if (categoryDetailLoading?.[cacheKey]) {
            return [];
        }

        // Always request monthly natural-account details from the backend on
        // the first expansion. Local derived rows must not short-circuit the API.

        setCategoryDetailLoading((prev) => ({
            ...prev,
            [cacheKey]: true,
        }));

        setCategoryDetailError((prev) => ({
            ...prev,
            [cacheKey]: null,
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

            // Use the filters that were actually applied to the main report,
            // not stale parent props or the un-applied filter controls.
            Object.entries(appliedApiFilters).forEach(([key, value]) => {
                if (value === null || value === undefined || value === "" || value === "—") return;
                if (Array.isArray(value)) {
                    value.forEach((entry) => {
                        if (entry !== null && entry !== undefined && entry !== "" && entry !== "—") {
                            params.append(key, String(entry));
                        }
                    });
                } else {
                    params.set(key, String(value));
                }
            });

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

                const details = Array.isArray(responseData)
                    ? responseData
                    : Array.isArray(responseData?.items)
                        ? responseData.items
                        : Array.isArray(responseData?.accounts)
                            ? responseData.accounts
                            : Array.isArray(responseData?.natural_accounts)
                                ? responseData.natural_accounts
                                : Array.isArray(responseData?.naturalAccounts)
                                    ? responseData.naturalAccounts
                                    : Array.isArray(responseData?.details)
                                        ? responseData.details
                                        : Array.isArray(responseData?.data)
                                            ? responseData.data
                                            : [];

                setCategoryDetails((prev) => ({
                    ...prev,
                    [cacheKey]: details,
                }));

                // An empty API response is still authoritative for these filters;
                // do not replace it with stale locally-derived natural accounts.
                return details;
            }

            throw new Error(`Monthly category details request failed (${response.status}).`);
        } catch (error) {
            console.error(
                "Failed to load OPEX category monthly details, falling back to derivation:",
                error
            );

            setCategoryDetails((prev) => ({
                ...prev,
                [cacheKey]: [],
            }));

            setCategoryDetailError((prev) => ({
                ...prev,
                [cacheKey]:
                    error?.message ||
                    "Failed to load category monthly details.",
            }));

            return [];
        } finally {
            setCategoryDetailLoading((prev) => ({
                ...prev,
                [cacheKey]: false,
            }));
        }
    };

    /* ===================================================== 
       TOGGLE ROW 
    ===================================================== */

    const toggleRow = async (
        item,
        category,
        isViewAll = false
    ) => {
        const currentExpandedRows = isViewAll
            ? viewAllExpandedRows
            : expandedRows;

        const setExpandedState = isViewAll
            ? setViewAllExpandedRows
            : setExpandedRows;

        const willExpand =
            !currentExpandedRows[category];

        setExpandedState(
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
            item,
            isViewAll
        );
    };

    /* ===================================================== 
       DISPLAY 
    ===================================================== */

    const displayValue = (
        value,
        displayUnit = mainUnit
    ) => {
        return formatValue(
            value,
            displayUnit
        );
    };

    /* ===================================================== 
       NEGATIVE VALUE COLOR 
    ===================================================== */

    const getValueColor = (
        value,
        emptyColor = "#94A3B8",
        positiveColor = "#334155"
    ) => {
        if (isEmptyValue(value)) {
            return emptyColor;
        }

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return emptyColor;
        }

        return number < 0
            ? "#DC2626"
            : positiveColor;
    };

    /* ===================================================== 
       VARIANCE STATUS / COLOR
       Colour is driven by the status returned by the OPEX API.
       No frontend sign calculation is used for variance colour.
    ===================================================== */

    const normalizeVarianceStatus = (status) => {
        if (status === null || status === undefined || status === "") {
            return "";
        }

        if (typeof status === "object") {
            status =
                status?.status ??
                status?.value ??
                status?.code ??
                status?.name ??
                status?.label ??
                "";
        }

        return String(status).trim().toUpperCase();
    };

    const getVarianceStatus = (item, scope = "ytd") => {
        if (!item || typeof item !== "object") return "";

        const candidates =
            scope === "ytd"
                ? [
                    item?.variance_ytd_status,
                    item?.varianceYTDStatus,
                    item?.ytd_variance_status,
                    item?.ytdVarianceStatus,
                    item?.variance_ytd_variance_status,
                    item?.varianceYTDVarianceStatus,
                    item?.variance_ytd?.status,
                    item?.varianceYTD?.status,
                    item?.variance_pct_ytd_status,
                    item?.varianceYTDPercentStatus,
                    item?.variance_status,
                    item?.varianceStatus,
                    item?.variance?.status,
                ]
                : [
                    item?.variance_status,
                    item?.varianceStatus,
                    item?.variance_ptd_status,
                    item?.variancePTDStatus,
                    item?.variance_ptd?.status,
                    item?.variancePTD?.status,
                ];

        for (const candidate of candidates) {
            const normalized = normalizeVarianceStatus(candidate);
            if (normalized) return normalized;
        }

        return "";
    };

    const getVarianceStatusColor = (status) => {
        const normalized = normalizeVarianceStatus(status);

        if (normalized === "FAVOURABLE" || normalized === "FAVORABLE") {
            return "#16A34A";
        }

        if (normalized === "UNFAVOURABLE" || normalized === "UNFAVORABLE") {
            return "#DC2626";
        }

        return "#94A3B8";
    };

    /* ===================================================== 
       TARGET 
    ===================================================== */

    const displayTarget = (
        value,
        displayUnit = mainUnit
    ) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        return displayValue(
            value,
            displayUnit
        );
    };

    /* ===================================================== 
       VARIANCE 
    ===================================================== */

    const displayVariance = (
        value,
        displayUnit = mainUnit
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
            return "0";
        }

        if (number < 0) {
            if (
                displayUnit === "millions"
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

            return `(${Math.round(
                Math.abs(number)
            ).toLocaleString("en-US")})`;
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

            return `${Math.round(number)}%`;
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
            ...appliedMainFilters,
        };

        setViewAllFilters(filtersToApply);
        initialViewAllFiltersRef.current = filtersToApply;

        // Open the dedicated modal immediately.
        setViewAllFilteredData(null);
        setShowViewAll(true);

        // Refresh only View All with the same API/filter mapping used by
        // the working main-table filter. Do not update main-table state.
        try {
            setApplyingViewAllFilters(true);
            const response = await getOpexMonthly(
                buildMainApiFilters(filtersToApply)
            );
            setViewAllFilteredData(
                normalizeMonthlyResponse(response)
            );
        } catch (error) {
            console.error(
                "Failed to refresh Month-on-Month View All data:",
                error
            );
            setViewAllFilteredData([]);
        } finally {
            setApplyingViewAllFilters(false);
        }
    };
    const handleModalExport = async (format, filtersOverride = null) => {
        await handleBackendExport(format, filtersOverride || viewAllFilters);
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
        const tableUnit = isViewAll
            ? viewAllUnit
            : mainUnit;

        const tableYear = isViewAll
            ? viewAllFilters?.year
            : appliedMainFilters?.year;

        const tableExpandedRows = isViewAll
            ? viewAllExpandedRows
            : expandedRows;

        const selectedPeriod = isViewAll
            ? viewAllFilters?.period
            : appliedMainFilters?.period;

        const visibleMonths = getVisibleMonths(
            selectedPeriod,
            tableRows
        );

        // Monthly OPEX total row is derived from category-level values only.
        // Exclude any API-supplied total row to avoid double counting.
        const opexCategoryRows = getOpexCategoryRows(tableRows);
        const totalActualYTDValue = sumYTDField(opexCategoryRows, getActualYTD);
        const totalTargetYTDValue = sumYTDField(opexCategoryRows, getTargetYTD);
        const totalVarianceYTDValue =
            totalActualYTDValue !== null && totalTargetYTDValue !== null
                ? totalActualYTDValue - totalTargetYTDValue
                : null;
        const totalVarianceYTDPercentValue =
            totalVarianceYTDValue !== null &&
                totalTargetYTDValue !== null &&
                Number.isFinite(totalTargetYTDValue) &&
                totalTargetYTDValue !== 0
                ? (totalVarianceYTDValue / Math.abs(totalTargetYTDValue)) * 100
                : null;
        const totalVarianceColor =
            totalVarianceYTDValue === null
                ? "#94A3B8"
                : totalVarianceYTDValue < 0
                    ? "#16A34A"
                    : totalVarianceYTDValue > 0
                        ? "#DC2626"
                        : "#64748B";

        // Match the compact Sales Revenue table typography.
        // Keep the main table and View All behavior unchanged.
        const tableHeaderFontSize = '0.74rem';
        const tableBodyFontSize = '0.74rem';
        const detailHeaderFontSize = '0.70rem';
        const detailBodyFontSize = '0.74rem';

        return (
            <div
                className={isViewAll ? "mom-opex-viewall-table-scroll" : "mom-opex-main-table-scroll"}
                style={{
                    width: "100%",
                    maxWidth:
                        "100%",
                    overflowX:
                        "auto",
                    overflowY:
                        "hidden",
                    padding:
                        "0 8px 12px",
                    boxSizing:
                        "border-box",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        minWidth: 1400,
                        fontFamily: "inherit",
                        fontSize: tableBodyFontSize,
                        color: "#334155",
                        borderCollapse:
                            "collapse",
                        tableLayout:
                            "fixed",
                    }}
                >
                    <colgroup>
                        <col style={{ width: 200 }} />
                        {visibleMonths.map((month) => (
                            <col key={month.key} style={{ width: 65 }} />
                        ))}
                        <col style={{ width: 80 }} />
                        <col style={{ width: 80 }} />
                        <col style={{ width: 80 }} />
                        <col style={{ width: 80 }} />
                    </colgroup>

                    <thead>
                        <tr
                            style={{
                                height: 44,
                                background: "#F8FAFC",
                                borderBottom:
                                    "2px solid #E2E8F0",
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
                                    fontSize: tableHeaderFontSize,
                                    lineHeight:
                                        "16px",
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    position: "sticky",
                                    left: 0,
                                    zIndex: 5,
                                    background: "#FFFFFF",
                                    boxShadow: "1px 0 0 #E5E7EB",
                                }}
                            >
                                Expense Category
                            </th>

                            {visibleMonths.map(
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
                                            fontSize: tableBodyFontSize,
                                            lineHeight:
                                                "16px",
                                            fontWeight: 700,
                                            whiteSpace:
                                                "nowrap",
                                        }}
                                    >
                                        {
                                            getMonthHeaderLabel(
                                                month,
                                                tableYear
                                            )
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
                                    fontSize: tableHeaderFontSize,
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
                                    fontSize: tableHeaderFontSize,
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
                                    fontSize: tableHeaderFontSize,
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
                                    fontSize: tableHeaderFontSize,
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
                                    !!tableExpandedRows[
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

                                const varianceYTDStatus =
                                    getVarianceStatus(
                                        item,
                                        "ytd"
                                    );

                                const detailFilterState = isViewAll
                                    ? viewAllFilters
                                    : appliedMainFilters;
                                const detailCacheKey = JSON.stringify({
                                    category: item?.category || rowKey,
                                    filters: buildMainApiFilters(detailFilterState),
                                });

                                const rawDetails =
                                    getDetails(
                                        categoryDetails[detailCacheKey]
                                    );

                                const details =
                                    Array.isArray(rawDetails)
                                        ? rawDetails
                                        : [];

                                const isLoading =
                                    !!categoryDetailLoading[detailCacheKey] ||
                                    !!detailLoading?.[rowKey];

                                const error =
                                    categoryDetailError[detailCacheKey];

                                return (
                                    <React.Fragment
                                        key={
                                            rowKey
                                        }
                                    >
                                        <tr
                                            style={{
                                                minHeight:
                                                    42,
                                                height: 42,
                                                background:
                                                    index % 2 === 0 ? "#FFFFFF" : "#FAFBFD",
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
                                                    fontSize: tableBodyFontSize,
                                                    lineHeight:
                                                        "18px",
                                                    fontWeight: 800,
                                                    color:
                                                        "#000000",
                                                    position: "sticky",
                                                    left: 0,
                                                    zIndex: 3,
                                                    background: index % 2 === 0 ? "#FFFFFF" : "#FAFBFD",
                                                    boxShadow: "1px 0 0 #F1F5F9",
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleRow(
                                                            item,
                                                            rowKey,
                                                            isViewAll
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
                                                            fontSize: tableBodyFontSize,
                                                            fontWeight: 600,
                                                            color: "#1E1B4B",
                                                            whiteSpace:
                                                                "nowrap",
                                                        }}
                                                    >
                                                        {item?.category?.toUpperCase() ||
                                                            "—"}
                                                    </span>
                                                </button>
                                            </td>

                                            {visibleMonths.map(
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
                                                                fontSize: tableBodyFontSize,
                                                                lineHeight:
                                                                    "18px",
                                                                fontWeight: 500,
                                                                color:
                                                                    getValueColor(
                                                                        value,
                                                                        "#94A3B8",
                                                                        "#334155"
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
                                                                displayValue(
                                                                    value,
                                                                    tableUnit
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
                                                    fontSize: tableBodyFontSize,
                                                    lineHeight:
                                                        "18px",
                                                    fontWeight: 600,
                                                    color:
                                                        getValueColor(
                                                            actualYTD,
                                                            "#94A3B8",
                                                            "#334155"
                                                        ),
                                                    whiteSpace:
                                                        "nowrap",
                                                    overflow:
                                                        "visible",
                                                    textOverflow:
                                                        "clip",
                                                    borderLeft:
                                                        "1px solid #E5E7EB",
                                                }}
                                            >
                                                {
                                                    displayValue(
                                                        actualYTD,
                                                        tableUnit
                                                    )
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "0 10px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: tableBodyFontSize,
                                                    lineHeight:
                                                        "18px",
                                                    fontWeight: 500,
                                                    color:
                                                        getValueColor(
                                                            targetYTD,
                                                            "#94A3B8",
                                                            "#0F172A"
                                                        ),
                                                    whiteSpace:
                                                        "nowrap",
                                                    overflow:
                                                        "visible",
                                                    textOverflow:
                                                        "clip",
                                                }}
                                            >
                                                {
                                                    displayTarget(
                                                        targetYTD,
                                                        tableUnit
                                                    )
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "0 10px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: tableBodyFontSize,
                                                    lineHeight:
                                                        "18px",
                                                    fontWeight: 600,
                                                    color:
                                                        getVarianceStatusColor(
                                                            varianceYTDStatus
                                                        ),
                                                    whiteSpace:
                                                        "nowrap",
                                                    overflow:
                                                        "visible",
                                                    textOverflow:
                                                        "clip",
                                                }}
                                            >
                                                {
                                                    displayVariance(
                                                        varianceYTD,
                                                        tableUnit
                                                    )
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "0 10px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: tableBodyFontSize,
                                                    lineHeight:
                                                        "18px",
                                                    fontWeight: 600,
                                                    color:
                                                        getVarianceStatusColor(
                                                            varianceYTDStatus
                                                        ),
                                                    whiteSpace:
                                                        "nowrap",
                                                    overflow:
                                                        "visible",
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
                                                        visibleMonths.length +
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
                                                                fontSize: tableBodyFontSize,
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
                                                            className="mom-opex-drilldown-table-scroll"
                                                            style={{
                                                                width:
                                                                    "100%",
                                                                maxHeight:
                                                                    360,
                                                                overflowX:
                                                                    "visible",
                                                                overflowY:
                                                                    "auto",
                                                                border:
                                                                    "1px solid #E2E8F0",
                                                                borderRadius:
                                                                    8,
                                                                boxSizing:
                                                                    "border-box",
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
                                                                    minWidth: 1400,
                                                                    maxWidth: "none",
                                                                    borderCollapse:
                                                                        "collapse",
                                                                    tableLayout:
                                                                        "fixed",
                                                                }}
                                                            >
                                                                <colgroup>
                                                                    <col style={{ width: 200 }} />
                                                                    {visibleMonths.map((month) => (
                                                                        <col key={month.key} style={{ width: 65 }} />
                                                                    ))}
                                                                    <col style={{ width: 80 }} />
                                                                    <col style={{ width: 80 }} />
                                                                    <col style={{ width: 80 }} />
                                                                    <col style={{ width: 80 }} />
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
                                                                                fontSize: detailHeaderFontSize,
                                                                                lineHeight:
                                                                                    "16px",
                                                                                fontWeight: 700,
                                                                            }}
                                                                        >
                                                                            Natural
                                                                            Account
                                                                        </th>

                                                                        {visibleMonths.map(
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
                                                                                        fontSize: detailHeaderFontSize,
                                                                                        lineHeight:
                                                                                            "16px",
                                                                                        fontWeight: 700,
                                                                                        whiteSpace:
                                                                                            "nowrap",
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        getMonthHeaderLabel(
                                                                                            month,
                                                                                            tableYear
                                                                                        )
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
                                                                                fontSize: detailHeaderFontSize,
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
                                                                                            fontSize: detailBodyFontSize,
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

                                                                                    {visibleMonths.map(
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
                                                                                                        fontSize: detailBodyFontSize,
                                                                                                        lineHeight:
                                                                                                            "18px",
                                                                                                        fontWeight: 500,
                                                                                                        color:
                                                                                                            getValueColor(
                                                                                                                value,
                                                                                                                "#94A3B8",
                                                                                                                "#334155"
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
                                                                                                        displayValue(
                                                                                                            value,
                                                                                                            tableUnit
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
                                                                                            fontSize: detailBodyFontSize,
                                                                                            lineHeight:
                                                                                                "18px",
                                                                                            fontWeight: 600,
                                                                                            color:
                                                                                                getValueColor(
                                                                                                    accountYTD,
                                                                                                    "#94A3B8",
                                                                                                    "#334155"
                                                                                                ),
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
                                                                                                accountYTD,
                                                                                                tableUnit
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
                                    "#F8FAFC",
                            }}
                        >
                            <td
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "left",
                                    fontSize: tableBodyFontSize,
                                    lineHeight:
                                        "18px",
                                    fontWeight: 800,
                                    color:
                                        "#0F172A",
                                    position: "sticky",
                                    left: 0,
                                    zIndex: 4,
                                    background: "#F4F2FF",
                                    boxShadow: "1px 0 0 #DDD8F7",
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

                            {visibleMonths.map(
                                (month) => {
                                    const value =
                                        getTotalMonthValue(
                                            opexCategoryRows,
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
                                                fontSize: tableBodyFontSize,
                                                lineHeight:
                                                    "18px",
                                                fontWeight: 700,
                                                color:
                                                    getValueColor(
                                                        value,
                                                        "#94A3B8",
                                                        "#0F172A"
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
                                                displayValue(
                                                    value,
                                                    tableUnit
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
                                    fontSize: tableBodyFontSize,
                                    lineHeight:
                                        "18px",
                                    fontWeight: 700,
                                    color:
                                        getValueColor(
                                            totalActualYTDValue,
                                            "#94A3B8",
                                            "#0F172A"
                                        ),
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
                                        totalActualYTDValue,
                                        tableUnit
                                    )
                                }
                            </td>

                            <td
                                style={{
                                    padding: "0 10px",
                                    textAlign: "right",
                                    fontSize: tableBodyFontSize,
                                    fontWeight: 700,
                                    color: totalTargetYTDValue === null ? "#94A3B8" : "#0F172A",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {displayTarget(totalTargetYTDValue, tableUnit)}
                            </td>

                            <td
                                style={{
                                    padding: "0 10px",
                                    textAlign: "right",
                                    fontSize: tableBodyFontSize,
                                    fontWeight: 700,
                                    color: totalVarianceColor,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {displayVariance(totalVarianceYTDValue, tableUnit)}
                            </td>

                            <td
                                style={{
                                    padding: "0 10px",
                                    textAlign: "right",
                                    fontSize: tableBodyFontSize,
                                    fontWeight: 700,
                                    color: totalVarianceColor,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {totalTargetYTDValue === null ||
                                    !Number.isFinite(totalTargetYTDValue) ||
                                    totalTargetYTDValue === 0 ||
                                    totalVarianceYTDPercentValue === null
                                    ? "—"
                                    : displayVariancePercent(totalVarianceYTDPercentValue)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    /* =========================================================
       SCOPED TABLE SCROLLBARS
    ========================================================= */
    const monthOnMonthOpexScrollbarStyles = `
        .mom-opex-main-table-scroll,
        .mom-opex-viewall-table-scroll,
        .mom-opex-viewall-scroll {
            scrollbar-width: auto;
            scrollbar-color: #334155 #E2E8F0;
        }
        .mom-opex-main-table-scroll::-webkit-scrollbar,
        .mom-opex-viewall-table-scroll::-webkit-scrollbar,
        .mom-opex-viewall-scroll::-webkit-scrollbar {
            width: 14px;
            height: 14px;
        }
        .mom-opex-main-table-scroll::-webkit-scrollbar-track,
        .mom-opex-viewall-table-scroll::-webkit-scrollbar-track,
        .mom-opex-viewall-scroll::-webkit-scrollbar-track {
            background: #E2E8F0;
            border-radius: 8px;
        }
        .mom-opex-main-table-scroll::-webkit-scrollbar-thumb,
        .mom-opex-viewall-table-scroll::-webkit-scrollbar-thumb,
        .mom-opex-viewall-scroll::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 8px;
            border: 2px solid #E2E8F0;
        }
        .mom-opex-main-table-scroll::-webkit-scrollbar-thumb:hover,
        .mom-opex-viewall-table-scroll::-webkit-scrollbar-thumb:hover,
        .mom-opex-viewall-scroll::-webkit-scrollbar-thumb:hover,
        .mom-opex-drilldown-table-scroll::-webkit-scrollbar-thumb:hover {
            background: #1E293B;
        }

        .mom-opex-drilldown-table-scroll {
            scrollbar-width: auto;
            scrollbar-color: #334155 #E2E8F0;
        }

        .mom-opex-drilldown-table-scroll::-webkit-scrollbar {
            width: 12px;
            height: 12px;
        }

        .mom-opex-drilldown-table-scroll::-webkit-scrollbar-track {
            background: #E2E8F0;
            border-radius: 8px;
        }

        .mom-opex-drilldown-table-scroll::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 8px;
            border: 2px solid #E2E8F0;
        }
    `;

    /* ========================================================= 
       RETURN 
    ========================================================= */

    return (
        <>
            <style>{monthOnMonthOpexScrollbarStyles}</style>
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
                    <div style={{ minWidth: 0 }}>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: "1rem",
                                lineHeight: 1.2,
                                fontWeight: 800,
                                color: "#1E293B",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            Month-on-Month OPEX Report
                            <span
                                style={{
                                    color: "#64748B",
                                    marginLeft: 6,
                                    fontSize: "0.68rem",
                                    fontWeight: 600,
                                }}
                            >
                                (Amounts in {reportingCurrency || "AED"})
                            </span>
                        </h3>
                        <div
                            style={{
                                marginTop: 3,
                                fontSize: "0.72rem",
                                lineHeight: 1.35,
                                color: "#64748B",
                                fontWeight: 500,
                            }}
                        >
                            Monthly operating expense performance and YTD variance analysis
                        </div>
                    </div>

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
                                            handleBackendExport("excel");
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
                                            handleBackendExport("pdf");
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
                                setMainUnit(
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
                                    mainUnit ===
                                        "aed"
                                        ? "#5B3FE4"
                                        : "#FFFFFF",
                                color:
                                    mainUnit ===
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
                                setMainUnit(
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
                                    mainUnit ===
                                        "millions"
                                        ? "1px solid #5B3FE4"
                                        : "1px solid #E2E8F0",
                                background:
                                    mainUnit ===
                                        "millions"
                                        ? "#5B3FE4"
                                        : "#FFFFFF",
                                color:
                                    mainUnit ===
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

                {!collapsed && (
                    <div
                        style={{
                            margin: "10px 8px 12px",
                            padding: "10px 10px 11px",
                            background: "#FFFFFF",
                            border: "1px solid #E2E8F0",
                            borderRadius: 11,
                            boxShadow: "0 3px 12px rgba(15, 23, 42, 0.05)",
                            boxSizing: "border-box",
                        }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(7, minmax(120px, 1fr)) auto",
                                gap: 9,
                                alignItems: "end",
                                width: "100%",
                            }}
                        >
                            <div>
                                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1E3A8A", marginBottom: 5 }}>
                                    Legal Group
                                </div>
                                <MultiSelectDropdown
                                    label=""
                                    options={cascadingMainOptions.legal_groups || []}
                                    selectedValues={mainFilters.legal_group}
                                    onChange={(values) => updateMainCascadeFilter("legal_group", values)}
                                />
                            </div>

                            <div>
                                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1E3A8A", marginBottom: 5 }}>
                                    Legal Entity
                                </div>
                                <MultiSelectDropdown
                                    label=""
                                    options={cascadingMainOptions.legal_entities || []}
                                    selectedValues={mainFilters.legal_entity}
                                    onChange={(values) => updateMainCascadeFilter("legal_entity", values)}
                                />
                            </div>

                            <div>
                                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1E3A8A", marginBottom: 5 }}>
                                    Parent Division
                                </div>
                                <MultiSelectDropdown
                                    label=""
                                    options={cascadingMainOptions.parent_divisions || []}
                                    selectedValues={mainFilters.parent_division}
                                    onChange={(values) => updateMainCascadeFilter("parent_division", values)}
                                />
                            </div>

                            <div>
                                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1E3A8A", marginBottom: 5 }}>
                                    Sub-Division
                                </div>
                                <MultiSelectDropdown
                                    label=""
                                    options={cascadingMainOptions.subdivisions || []}
                                    selectedValues={mainFilters.subdivision}
                                    onChange={(values) => updateMainCascadeFilter("subdivision", values)}
                                />
                            </div>

                            <div>
                                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1E3A8A", marginBottom: 5 }}>
                                    Year
                                </div>
                                <MultiSelectDropdown
                                    label=""
                                    options={resolvedMainFilterOptions.years || []}
                                    selectedValues={mainFilters.year}
                                    onChange={(values) =>
                                        setMainFilters((prev) => ({
                                            ...prev,
                                            year: values?.length ? values : [],
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1E3A8A", marginBottom: 5 }}>
                                    Period
                                </div>
                                <MultiSelectDropdown
                                    label=""
                                    options={resolvedMainFilterOptions.periods || []}
                                    selectedValues={mainFilters.period}
                                    onChange={(values) =>
                                        setMainFilters((prev) => ({
                                            ...prev,
                                            period: values?.length ? values : [],
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1E3A8A", marginBottom: 5 }}>
                                    Reporting Currency
                                </div>
                                <MultiSelectDropdown
                                    label=""
                                    options={resolvedMainFilterOptions.currencies || [reportingCurrency || "AED"]}
                                    selectedValues={mainFilters.reporting_currency}
                                    singleSelect
                                    onChange={(values) =>
                                        setMainFilters((prev) => ({
                                            ...prev,
                                            reporting_currency: values?.length ? [values[0]] : [],
                                        }))
                                    }
                                />
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 7,
                                    alignItems: "flex-end",
                                    paddingBottom: 0,
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={applyMainFilters}
                                    disabled={mainFilterLoading}
                                    style={{
                                        height: 34,
                                        padding: "0 15px",
                                        borderRadius: 9,
                                        border: "1px solid #6D63E8",
                                        background: mainFilterLoading ? "#A5A7F8" : "#6D63E8",
                                        color: "#FFFFFF",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        cursor: mainFilterLoading ? "not-allowed" : "pointer",
                                        whiteSpace: "nowrap",
                                        boxShadow: "0 2px 5px rgba(91, 63, 228, 0.16)",
                                    }}
                                >
                                    {mainFilterLoading ? "Applying…" : "Apply"}
                                </button>

                                <button
                                    type="button"
                                    onClick={resetMainFilters}
                                    disabled={mainFilterLoading}
                                    style={{
                                        height: 34,
                                        padding: "0 14px",
                                        borderRadius: 9,
                                        border: "1px solid #E2E8F0",
                                        background: "#FFFFFF",
                                        color: "#475569",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        cursor: mainFilterLoading ? "not-allowed" : "pointer",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {mainFilterError && (
                            <div
                                style={{
                                    marginTop: 8,
                                    padding: "7px 10px",
                                    borderRadius: 7,
                                    background: "#FEF2F2",
                                    border: "1px solid #FECACA",
                                    color: "#B91C1C",
                                    fontSize: 11,
                                    fontWeight: 600,
                                }}
                            >
                                {mainFilterError}
                            </div>
                        )}
                    </div>
                )}

                {!collapsed &&
                    renderMainTable(
                        mainTableRows
                    )}
            </div >

            <MonthOnMonthOpexViewAllModal
                open={showViewAll}
                reportingCurrency={reportingCurrency}
                viewAllUnit={viewAllUnit}
                setViewAllUnit={setViewAllUnit}
                exporting={exporting}
                handleExport={handleModalExport}
                rows={effectiveViewAllRows}
                renderTable={renderMainTable}
                filterOptions={resolvedMainFilterOptions}
                initialFilters={viewAllFilters}
                onApplyFilters={handleApplyViewAllFilters}
                onResetFilters={handleViewAllReset}
                onExportBackend={handleModalExport}
                applyingFilters={applyingViewAllFilters}
                onClose={() => setShowViewAll(false)}
            />
        </>
    );
} 