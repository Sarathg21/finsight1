
import React, { useMemo, useState, useEffect, useRef } from "react";
import ExportButtons from "../Common/ExportButtons";
import { deriveCategoryNaturalAccounts } from "../../data/opexNaturalAccounts";

/* =========================================================
   FORMAT NUMBER
========================================================= */

const formatNumber = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "-"
    ) {
        return "—";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return number.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
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

    if (!Number.isFinite(number)) {
        return "—";
    }

    return `${number.toFixed(2)}%`;
};

/* =========================================================
   GET VALUE
========================================================= */

const getValue = (row, keys = []) => {
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
   HAS VALUE
========================================================= */

const hasValue = (value) => {
    return (
        value !== null &&
        value !== undefined &&
        value !== ""
    );
};

/* =========================================================
   FILTER OPTION HELPERS
========================================================= */

const getFilterOptionId = (option) => {
    if (option === null || option === undefined) {
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
        option.year ??
        option.name ??
        ""
    );
};

const getFilterOptionName = (option) => {
    if (option === null || option === undefined) {
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

const normalizeMultiValue = (value) => {
    if (value === null || value === undefined || value === "") {
        return [];
    }

    if (Array.isArray(value)) {
        return value.map((v) => (typeof v === "object" ? getFilterOptionId(v) : String(v)));
    }

    if (typeof value === "object") {
        return [getFilterOptionId(value)];
    }

    return [String(value)];
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
   EXPENSE CATEGORY DRILL-DOWN MODAL
========================================================= */

export default function ExpenseCategoryDrillDownModal({
    open,
    onClose,
    data = [],
    loading = false,
    activeFilters = {},
    reportingCurrency = "AED",

    /* =====================================================
       FILTER OPTIONS & REFRESH CALLBACKS
    ===================================================== */

    filterOptions = {},
    onApplyFilters,
    onRefresh,

    onExpandCategory,
}) {
    /* =====================================================
       EXPANDED CATEGORIES & LOCAL FILTER STATE
    ===================================================== */

    const [expandedCategories, setExpandedCategories] = useState({});
    const [detailData, setDetailData] = useState({});
    const [detailLoading, setDetailLoading] = useState({});

    const [viewAllFilters, setViewAllFilters] = useState({
        year: [],
        legal_entity: [],
        parent_division: [],
        subdivision: [],
        period: [],
    });
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

    useEffect(() => {
        if (!open) return;

        setViewAllFilters({
            year: Array.isArray(activeFilters?.year)
                ? activeFilters.year.map((v) => String(v))
                : activeFilters?.year
                    ? [String(activeFilters.year)]
                    : [],

            legal_entity: Array.isArray(
                activeFilters?.legal_entity
            )
                ? activeFilters.legal_entity.map((v) =>
                    String(v)
                )
                : activeFilters?.legal_entity
                    ? [String(activeFilters.legal_entity)]
                    : [],

            parent_division: Array.isArray(
                activeFilters?.parent_division
            )
                ? activeFilters.parent_division.map(
                    (v) => String(v)
                )
                : activeFilters?.parent_division
                    ? [
                        String(
                            activeFilters.parent_division
                        ),
                    ]
                    : [],

            subdivision: Array.isArray(
                activeFilters?.subdivision
            )
                ? activeFilters.subdivision.map((v) =>
                    String(v)
                )
                : activeFilters?.subdivision
                    ? [String(activeFilters.subdivision)]
                    : [],

            period: Array.isArray(
                activeFilters?.period
            )
                ? activeFilters.period.map((v) =>
                    String(v)
                )
                : activeFilters?.period
                    ? [String(activeFilters.period)]
                    : [],
        });
    }, [open]);

    const handleFilterChange = (key, values) => {
        setViewAllFilters((prev) => ({
            ...prev,
            [key]: Array.isArray(values)
                ? values.map((value) =>
                    String(value)
                )
                : [],
        }));
    };
    const cleanFilterValues = (values) => {
        if (!Array.isArray(values)) return [];

        return values.filter(
            (value) =>
                value !== undefined &&
                value !== null &&
                value !== "" &&
                value !== "All"
        );
    };

    const handleApplyFilters = async () => {
        if (typeof onApplyFilters !== "function") {
            return;
        }

        const selectedFilters = {
            year: viewAllFilters.year,
            legal_entity:
                viewAllFilters.legal_entity,
            parent_division:
                viewAllFilters.parent_division,
            subdivision:
                viewAllFilters.subdivision,
            period: viewAllFilters.period,
        };

        if (
            !Array.isArray(selectedFilters.period) ||
            selectedFilters.period.length === 0
        ) {
            return;
        }

        await onApplyFilters(selectedFilters);
    };


    const handleResetFilters = async () => {
        /*
         * RESET should return to the default OPEX filter state,
         * NOT the filters that were present when the modal opened.
         *
         * Default:
         * - Year = first/default available year
         * - Period = latest available period
         * - Legal Entity = empty
         * - Parent Division = empty
         * - Sub-Division = empty
         */

        const defaultYear =
            filterOptions?.years?.length > 0
                ? getFilterOptionId(
                    filterOptions.years[0]
                )
                : "";

        const latestPeriod =
            filterOptions?.periods?.length > 0
                ? getFilterOptionId(
                    filterOptions.periods[
                    filterOptions.periods.length - 1
                    ]
                )
                : "";

        const resetFilters = {
            year: defaultYear
                ? [String(defaultYear)]
                : [],

            legal_entity: [],

            parent_division: [],

            subdivision: [],

            period: latestPeriod
                ? [String(latestPeriod)]
                : [],
        };

        /*
         * Immediately update dropdowns.
         */
        setViewAllFilters(resetFilters);

        /*
         * Refresh the View All table using
         * the reset/default filters.
         */
        if (
            typeof onApplyFilters === "function"
        ) {
            await onApplyFilters(resetFilters);
        }
    };
    /* =====================================================
       NORMALIZE CATEGORY DATA
    ===================================================== */

    const rows = useMemo(() => {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.items)) {
            return data.items;
        }

        if (Array.isArray(data?.categories)) {
            return data.categories;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        if (Array.isArray(data?.results)) {
            return data.results;
        }

        return [];
    }, [data]);

    /* =====================================================
       CURRENCY
    ===================================================== */

    const currency =
        rows?.[0]?.reporting_currency ||
        activeFilters?.reporting_currency ||
        reportingCurrency ||
        "AED";

    /* =====================================================
       TOTALS
    ===================================================== */

    const totals = useMemo(() => {
        let actualPTD = 0;
        let targetPTD = 0;
        let variancePTD = 0;

        let actualYTD = 0;
        let targetYTD = 0;
        let varianceYTD = 0;

        let hasTargetPTD = false;
        let hasVariancePTD = false;

        let hasTargetYTD = false;
        let hasVarianceYTD = false;

        rows.forEach((row) => {
            const rowActualPTD = getValue(row, [
                "actual_ptd_aed",
                "actual_ptd",
            ]);

            const rowTargetPTD = getValue(row, [
                "target_ptd_aed",
                "target_ptd",
            ]);

            const rowVariancePTD = getValue(row, [
                "variance_ptd_aed",
                "variance_ptd",
            ]);

            const rowActualYTD = getValue(row, [
                "actual_ytd_aed",
                "actual_ytd",
            ]);

            const rowTargetYTD = getValue(row, [
                "target_ytd_aed",
                "target_ytd",
            ]);

            const rowVarianceYTD = getValue(row, [
                "variance_ytd_aed",
                "variance_ytd",
            ]);

            if (hasValue(rowActualPTD)) {
                actualPTD += Number(rowActualPTD) || 0;
            }

            if (hasValue(rowTargetPTD)) {
                targetPTD += Number(rowTargetPTD) || 0;
                hasTargetPTD = true;
            }

            if (hasValue(rowVariancePTD)) {
                variancePTD +=
                    Number(rowVariancePTD) || 0;
                hasVariancePTD = true;
            }

            if (hasValue(rowActualYTD)) {
                actualYTD += Number(rowActualYTD) || 0;
            }

            if (hasValue(rowTargetYTD)) {
                targetYTD += Number(rowTargetYTD) || 0;
                hasTargetYTD = true;
            }

            if (hasValue(rowVarianceYTD)) {
                varianceYTD +=
                    Number(rowVarianceYTD) || 0;
                hasVarianceYTD = true;
            }
        });

        return {
            actualPTD,
            targetPTD: hasTargetPTD
                ? targetPTD
                : null,
            variancePTD: hasVariancePTD
                ? variancePTD
                : null,

            actualYTD,
            targetYTD: hasTargetYTD
                ? targetYTD
                : null,
            varianceYTD: hasVarianceYTD
                ? varianceYTD
                : null,
        };
    }, [rows]);

    /* =====================================================
       TOTAL VARIANCE %
    ===================================================== */

    const totalVariancePTDPercent =
        hasValue(totals.targetPTD) &&
            Number(totals.targetPTD) !== 0 &&
            hasValue(totals.variancePTD)
            ? (Number(totals.variancePTD) /
                Number(totals.targetPTD)) *
            100
            : null;

    const totalVarianceYTDPercent =
        hasValue(totals.targetYTD) &&
            Number(totals.targetYTD) !== 0 &&
            hasValue(totals.varianceYTD)
            ? (Number(totals.varianceYTD) /
                Number(totals.targetYTD)) *
            100
            : null;

    /* =====================================================
       NORMALIZE DETAIL RESPONSE
    ===================================================== */

    const normalizeDetailRows = (response) => {
        if (Array.isArray(response)) {
            return response;
        }

        if (Array.isArray(response?.items)) {
            return response.items;
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (Array.isArray(response?.results)) {
            return response.results;
        }

        return [];
    };

    /* =====================================================
       EXPAND CATEGORY
    ===================================================== */

    const handleToggleCategory = async (category, row) => {
        if (!category) {
            return;
        }

        const isExpanded =
            expandedCategories[category];

        if (isExpanded) {
            setExpandedCategories((previous) => ({
                ...previous,
                [category]: false,
            }));

            return;
        }

        if (
            Array.isArray(detailData[category]) &&
            detailData[category].length > 0
        ) {
            setExpandedCategories((previous) => ({
                ...previous,
                [category]: true,
            }));

            return;
        }

        if (!onExpandCategory) {
            const fallbackRows = row ? deriveCategoryNaturalAccounts(row, category) : [];
            setDetailData((previous) => ({
                ...previous,
                [category]: fallbackRows,
            }));
            setExpandedCategories((previous) => ({
                ...previous,
                [category]: true,
            }));

            return;
        }

        try {
            setDetailLoading((previous) => ({
                ...previous,
                [category]: true,
            }));

            const response =
                await onExpandCategory(category, row);

            let detailRows =
                normalizeDetailRows(response);

            if ((!detailRows || detailRows.length === 0) && row) {
                detailRows = deriveCategoryNaturalAccounts(row, category);
            }

            setDetailData((previous) => ({
                ...previous,
                [category]: detailRows,
            }));

            setExpandedCategories((previous) => ({
                ...previous,
                [category]: true,
            }));
        } catch (error) {
            console.error(
                `Failed to load natural account details for ${category}:`,
                error
            );

            const fallbackRows = row ? deriveCategoryNaturalAccounts(row, category) : [];

            setDetailData((previous) => ({
                ...previous,
                [category]: fallbackRows,
            }));

            setExpandedCategories((previous) => ({
                ...previous,
                [category]: true,
            }));
        } finally {
            setDetailLoading((previous) => ({
                ...previous,
                [category]: false,
            }));
        }
    };

    /* =====================================================
       RESET DETAILS WHEN MODAL CLOSES
    ===================================================== */

    const handleClose = () => {
        setExpandedCategories({});
        setDetailData({});
        setDetailLoading({});
        onClose?.();
    };

    /* =====================================================
       COMMON EXPORT HANDLER
    ===================================================== */

    const handleExport = (type) => {
        if (!rows.length) {
            return;
        }

        const exportRows = [];

        rows.forEach((row) => {
            const category = getValue(row, [
                "category",
                "name",
            ]);

            exportRows.push({
                "Expense Category": category || "—",
                [`Actual PTD (${currency})`]:
                    getValue(row, [
                        "actual_ptd_aed",
                        "actual_ptd",
                    ]) ?? "",
                [`Target PTD (${currency})`]:
                    getValue(row, [
                        "target_ptd_aed",
                        "target_ptd",
                    ]) ?? "",
                [`Variance PTD (${currency})`]:
                    getValue(row, [
                        "variance_ptd_aed",
                        "variance_ptd",
                    ]) ?? "",
                "Variance PTD %":
                    getValue(row, [
                        "variance_ptd_pct",
                    ]) ?? "",
                [`Actual YTD (${currency})`]:
                    getValue(row, [
                        "actual_ytd_aed",
                        "actual_ytd",
                    ]) ?? "",
                [`Target YTD (${currency})`]:
                    getValue(row, [
                        "target_ytd_aed",
                        "target_ytd",
                    ]) ?? "",
                [`Variance YTD (${currency})`]:
                    getValue(row, [
                        "variance_ytd_aed",
                        "variance_ytd",
                    ]) ?? "",
                "Variance YTD %":
                    getValue(row, [
                        "variance_ytd_pct",
                    ]) ?? "",
            });

            const accounts =
                detailData[category] || [];

            accounts.forEach((account) => {
                exportRows.push({
                    "Expense Category":
                        `${category || "—"} - Natural Account`,
                    "Natural Account":
                        account.account_code || "—",
                    "Account Name":
                        account.account_name || "—",
                    [`Actual PTD (${currency})`]:
                        getValue(account, [
                            "actual_ptd_aed",
                            "actual_ptd",
                        ]) ?? "",
                    [`Actual YTD (${currency})`]:
                        getValue(account, [
                            "actual_ytd_aed",
                            "actual_ytd",
                        ]) ?? "",
                });
            });
        });

        if (type === "excel") {
            const headers = Object.keys(
                exportRows[0] || {}
            );

            const csvRows = [
                headers.join(","),
                ...exportRows.map((row) =>
                    headers
                        .map((header) => {
                            const value =
                                row[header] ?? "";

                            return `"${String(value).replace(
                                /"/g,
                                '""'
                            )}"`;
                        })
                        .join(",")
                ),
            ];

            const blob = new Blob(
                [csvRows.join("\n")],
                {
                    type: "text/csv;charset=utf-8;",
                }
            );

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;
            link.download =
                "expense-category-drill-down.csv";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            return;
        }

        if (type === "pdf") {
            const printWindow =
                window.open(
                    "",
                    "_blank",
                    "width=1200,height=800"
                );

            if (!printWindow) {
                return;
            }

            const filterRows = [
                ["Year", viewAllFilters.year.join(", ")],
                ["Period", viewAllFilters.period.join(", ")],
                ["Currency", currency],
                ["Legal Entity", viewAllFilters.legal_entity.join(", ")],
                ["Parent Division", viewAllFilters.parent_division.join(", ")],
                ["Subdivision", viewAllFilters.subdivision.join(", ")],
            ].filter(
                ([, value]) =>
                    value !== null &&
                    value !== undefined &&
                    value !== ""
            );

            const tableRows = exportRows
                .map(
                    (row) => `
                        <tr>
                            <td>${row["Expense Category"] || "—"}</td>
                            <td>${row["Natural Account"] || "—"}</td>
                            <td>${row["Account Name"] || "—"}</td>
                            <td>${row[`Actual PTD (${currency})`] || "—"}</td>
                            <td>${row[`Target PTD (${currency})`] || "—"}</td>
                            <td>${row[`Variance PTD (${currency})`] || "—"}</td>
                            <td>${row["Variance PTD %"] || "—"}</td>
                            <td>${row[`Actual YTD (${currency})`] || "—"}</td>
                            <td>${row[`Target YTD (${currency})`] || "—"}</td>
                            <td>${row[`Variance YTD (${currency})`] || "—"}</td>
                            <td>${row["Variance YTD %"] || "—"}</td>
                        </tr>
                    `
                )
                .join("");

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Expense Category Drill-Down</title>

                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                padding: 24px;
                                color: #111827;
                            }

                            h1 {
                                font-size: 20px;
                                margin-bottom: 5px;
                            }

                            .subtitle {
                                color: #64748b;
                                font-size: 12px;
                                margin-bottom: 16px;
                            }

                            .filters {
                                display: flex;
                                flex-wrap: wrap;
                                gap: 6px;
                                margin-bottom: 16px;
                            }

                            .filter {
                                padding: 5px 8px;
                                border: 1px solid #e2e8f0;
                                border-radius: 5px;
                                font-size: 10px;
                            }

                            table {
                                width: 100%;
                                border-collapse: collapse;
                                font-size: 9px;
                            }

                            th,
                            td {
                                border: 1px solid #d1d5db;
                                padding: 6px;
                                text-align: right;
                            }

                            th:first-child,
                            td:first-child {
                                text-align: left;
                            }

                            th {
                                background: #f8fafc;
                                font-weight: 700;
                            }

                            @media print {
                                body {
                                    padding: 10px;
                                }
                            }
                        </style>
                    </head>

                    <body>
                        <h1>
                            Expense Category Drill-Down
                        </h1>

                        <div class="subtitle">
                            Detailed PTD and YTD expense category analysis
                        </div>

                        <div class="filters">
                            ${filterRows
                    .map(
                        ([label, value]) =>
                            `<div class="filter"><strong>${label}:</strong> ${value}</div>`
                    )
                    .join("")}
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Expense Category</th>
                                    <th>Natural Account</th>
                                    <th>Account Name</th>
                                    <th>Actual PTD</th>
                                    <th>Target PTD</th>
                                    <th>Variance PTD</th>
                                    <th>Variance PTD %</th>
                                    <th>Actual YTD</th>
                                    <th>Target YTD</th>
                                    <th>Variance YTD</th>
                                    <th>Variance YTD %</th>
                                </tr>
                            </thead>

                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </body>
                </html>
            `);

            printWindow.document.close();

            printWindow.focus();

            setTimeout(() => {
                printWindow.print();
            }, 300);
        }
    };

    /* =====================================================
       DON'T RENDER
    ===================================================== */

    if (!open) {
        return null;
    }

    /* =====================================================
       RENDER OPTIONS PREPARATION
    ===================================================== */

    const yearOptions = filterOptions?.years || filterOptions?.fiscal_years || [];
    const legalEntityOptions = filterOptions?.legal_entities || [];
    const parentDivisionOptions = filterOptions?.parent_divisions || [];
    const subdivisionOptions = filterOptions?.subdivisions || [];
    const periodOptions = filterOptions?.periods || [];

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                background: "rgba(15, 23, 42, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    handleClose();
                }
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "1400px",
                    maxHeight: "92vh",
                    background: "#ffffff",
                    borderRadius: "10px",
                    boxShadow:
                        "0 20px 50px rgba(15, 23, 42, 0.20)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    style={{
                        padding: "18px 22px 14px",
                        borderBottom:
                            "1px solid #e5e7eb",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "16px",
                        flexShrink: 0,
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: "18px",
                                fontWeight: 700,
                                color: "#111827",
                                lineHeight: 1.3,
                            }}
                        >
                            Expense Category Drill-Down
                        </div>

                        <div
                            style={{
                                marginTop: "4px",
                                fontSize: "12px",
                                color: "#6b7280",
                            }}
                        >
                            Detailed PTD and YTD expense
                            category analysis
                        </div>
                    </div>

                    {/* =================================================
                        CLOSE BUTTON
                    ================================================= */}

                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close"
                        style={{
                            width: "32px",
                            height: "32px",
                            border: "none",
                            background: "transparent",
                            borderRadius: "6px",
                            cursor: "pointer",
                            color: "#64748b",
                            fontSize: "24px",
                            lineHeight: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* =================================================
                    INTERACTIVE MULTI-SELECT FILTERS SECTION (REFERENCE IMAGE COMPATIBLE)
                ================================================= */}

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
                    {/* Year Filter */}
                    <MultiSelectDropdown
                        label="Year"
                        options={yearOptions}
                        selectedValues={viewAllFilters.year}
                        onChange={(vals) => handleFilterChange("year", vals)}
                    />

                    {/* Legal Entity Filter */}
                    <MultiSelectDropdown
                        label="Legal Entity"
                        options={legalEntityOptions}
                        selectedValues={viewAllFilters.legal_entity}
                        onChange={(vals) => handleFilterChange("legal_entity", vals)}
                    />

                    {/* Parent Division Filter */}
                    <MultiSelectDropdown
                        label="Parent Division"
                        options={parentDivisionOptions}
                        selectedValues={viewAllFilters.parent_division}
                        onChange={(vals) => handleFilterChange("parent_division", vals)}
                    />

                    {/* Sub-Division Filter */}
                    <MultiSelectDropdown
                        label="Sub-Division"
                        options={subdivisionOptions}
                        selectedValues={viewAllFilters.subdivision}
                        onChange={(vals) => handleFilterChange("subdivision", vals)}
                    />

                    {/* Period Filter */}
                    <MultiSelectDropdown
                        label="Period"
                        options={periodOptions}
                        selectedValues={viewAllFilters.period}
                        onChange={(vals) => handleFilterChange("period", vals)}
                    />

                    {/* Apply / Reset & Export Controls */}
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
                            onClick={handleApplyFilters}
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
                            onClick={handleResetFilters}
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
                                outline: "none",
                            }}
                        >
                            Reset
                        </button>

                        <ExportButtons
                            endpoint="expense-category-drill-down"
                            exporting={
                                loading || rows.length === 0 ? "disabled" : false
                            }
                            handleExport={handleExport}
                        />
                    </div>
                </div>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div
                    style={{
                        flex: 1,
                        minHeight: 0,
                        overflow: "auto",
                        padding: "18px 22px",
                    }}
                >
                    {loading ? (
                        <div
                            style={{
                                minHeight: "300px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#64748b",
                                fontSize: "13px",
                            }}
                        >
                            Loading expense category
                            details...
                        </div>
                    ) : rows.length === 0 ? (
                        <div
                            style={{
                                minHeight: "300px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#64748b",
                                fontSize: "13px",
                                textAlign: "center",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "#334155",
                                    marginBottom: "5px",
                                }}
                            >
                                No expense category data
                            </div>

                            <div>
                                No records are available
                                for the selected filters.
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* =================================================
                                SUMMARY CARDS
                            ================================================= */}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(4, minmax(0, 1fr))",
                                    gap: "10px",
                                    marginBottom: "16px",
                                }}
                            >
                                {[
                                    {
                                        label: "PTD Actual",
                                        value: `${currency} ${formatNumber(
                                            totals.actualPTD
                                        )}`,
                                    },
                                    {
                                        label: "PTD Target",
                                        value: hasValue(
                                            totals.targetPTD
                                        )
                                            ? `${currency} ${formatNumber(
                                                totals.targetPTD
                                            )}`
                                            : "—",
                                    },
                                    {
                                        label: "YTD Actual",
                                        value: `${currency} ${formatNumber(
                                            totals.actualYTD
                                        )}`,
                                    },
                                    {
                                        label: "YTD Target",
                                        value: hasValue(
                                            totals.targetYTD
                                        )
                                            ? `${currency} ${formatNumber(
                                                totals.targetYTD
                                            )}`
                                            : "—",
                                    },
                                ].map(
                                    (
                                        card
                                    ) => (
                                        <div
                                            key={
                                                card.label
                                            }
                                            style={{
                                                border:
                                                    "1px solid #e5e7eb",
                                                borderRadius:
                                                    "8px",
                                                padding:
                                                    "12px 14px",
                                                background:
                                                    "#ffffff",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize:
                                                        "10px",
                                                    fontWeight:
                                                        600,
                                                    color:
                                                        "#64748b",
                                                    textTransform:
                                                        "uppercase",
                                                    letterSpacing:
                                                        "0.04em",
                                                }}
                                            >
                                                {
                                                    card.label
                                                }
                                            </div>

                                            <div
                                                style={{
                                                    marginTop:
                                                        "5px",
                                                    fontSize:
                                                        "17px",
                                                    fontWeight:
                                                        700,
                                                    color:
                                                        "#111827",
                                                }}
                                            >
                                                {
                                                    card.value
                                                }
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* =================================================
                                TABLE
                            ================================================= */}

                            <div
                                style={{
                                    width: "100%",
                                    overflowX: "auto",
                                    overflowY: "visible",
                                    border:
                                        "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                }}
                            >
                                <table
                                    style={{
                                        width: "100%",
                                        minWidth:
                                            "1250px",
                                        borderCollapse:
                                            "separate",
                                        borderSpacing:
                                            0,
                                        fontSize:
                                            "12px",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                rowSpan={
                                                    2
                                                }
                                                style={{
                                                    position:
                                                        "sticky",
                                                    left: 0,
                                                    zIndex: 4,
                                                    minWidth:
                                                        "300px",
                                                    padding:
                                                        "10px 12px",
                                                    textAlign:
                                                        "left",
                                                    background:
                                                        "#f8fafc",
                                                    borderBottom:
                                                        "1px solid #e5e7eb",
                                                    borderRight:
                                                        "1px solid #e5e7eb",
                                                    color:
                                                        "#475569",
                                                    fontWeight:
                                                        700,
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                Expense Category
                                            </th>

                                            <th
                                                colSpan={
                                                    4
                                                }
                                                style={{
                                                    padding:
                                                        "9px 12px",
                                                    textAlign:
                                                        "center",
                                                    background:
                                                        "#f8fafc",
                                                    borderBottom:
                                                        "1px solid #e5e7eb",
                                                    borderRight:
                                                        "1px solid #e5e7eb",
                                                    color:
                                                        "#334155",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                PTD
                                            </th>

                                            <th
                                                colSpan={
                                                    4
                                                }
                                                style={{
                                                    padding:
                                                        "9px 12px",
                                                    textAlign:
                                                        "center",
                                                    background:
                                                        "#f8fafc",
                                                    borderBottom:
                                                        "1px solid #e5e7eb",
                                                    color:
                                                        "#334155",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                YTD
                                            </th>
                                        </tr>

                                        <tr>
                                            {[
                                                `Actual (${currency})`,
                                                `Target (${currency})`,
                                                `Variance (${currency})`,
                                                "Variance %",
                                                `Actual (${currency})`,
                                                `Target (${currency})`,
                                                `Variance (${currency})`,
                                                "Variance %",
                                            ].map((heading, index) => (
                                                <th
                                                    key={`${heading}-${index}`}
                                                    style={{
                                                        padding: "9px 12px",
                                                        textAlign: "right",
                                                        background: "#f8fafc",
                                                        borderBottom: "1px solid #e5e7eb",
                                                        borderRight:
                                                            index === 3
                                                                ? "1px solid #e5e7eb"
                                                                : "none",
                                                        color: "#64748b",
                                                        fontWeight: 600,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {rows.map(
                                            (
                                                row,
                                                index
                                            ) => {
                                                const category =
                                                    getValue(
                                                        row,
                                                        [
                                                            "category",
                                                            "name",
                                                        ]
                                                    );

                                                const actualPTD =
                                                    getValue(
                                                        row,
                                                        [
                                                            "actual_ptd_aed",
                                                            "actual_ptd",
                                                        ]
                                                    );

                                                const targetPTD =
                                                    getValue(
                                                        row,
                                                        [
                                                            "target_ptd_aed",
                                                            "target_ptd",
                                                        ]
                                                    );

                                                const variancePTD =
                                                    getValue(
                                                        row,
                                                        [
                                                            "variance_ptd_aed",
                                                            "variance_ptd",
                                                        ]
                                                    );

                                                const variancePTDPercent =
                                                    getValue(
                                                        row,
                                                        [
                                                            "variance_ptd_pct",
                                                        ]
                                                    );

                                                const actualYTD =
                                                    getValue(
                                                        row,
                                                        [
                                                            "actual_ytd_aed",
                                                            "actual_ytd",
                                                        ]
                                                    );

                                                const targetYTD =
                                                    getValue(
                                                        row,
                                                        [
                                                            "target_ytd_aed",
                                                            "target_ytd",
                                                        ]
                                                    );

                                                const varianceYTD =
                                                    getValue(
                                                        row,
                                                        [
                                                            "variance_ytd_aed",
                                                            "variance_ytd",
                                                        ]
                                                    );

                                                const varianceYTDPercent =
                                                    getValue(
                                                        row,
                                                        [
                                                            "variance_ytd_pct",
                                                        ]
                                                    );

                                                const isExpanded =
                                                    !!expandedCategories[
                                                    category
                                                    ];

                                                const categoryLoading =
                                                    !!detailLoading[
                                                    category
                                                    ];

                                                const accounts =
                                                    (Array.isArray(detailData[category]) && detailData[category].length > 0)
                                                        ? detailData[category]
                                                        : (row ? deriveCategoryNaturalAccounts(row, category) : []);

                                                return (
                                                    <React.Fragment
                                                        key={`${category}-${index}`}
                                                    >
                                                        {/* =================================================
                                                            CATEGORY ROW
                                                        ================================================= */}

                                                        <tr>
                                                            <td
                                                                style={{
                                                                    position:
                                                                        "sticky",
                                                                    left: 0,
                                                                    zIndex: 2,
                                                                    minWidth:
                                                                        "300px",
                                                                    padding:
                                                                        "10px 12px",
                                                                    background:
                                                                        "#ffffff",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    borderRight:
                                                                        "1px solid #e5e7eb",
                                                                    color:
                                                                        "#1e293b",
                                                                    fontWeight:
                                                                        600,
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleToggleCategory(
                                                                            category,
                                                                            row
                                                                        )
                                                                    }
                                                                    style={{
                                                                        width:
                                                                            "24px",
                                                                        height:
                                                                            "24px",
                                                                        marginRight:
                                                                            "7px",
                                                                        border:
                                                                            "none",
                                                                        background:
                                                                            "transparent",
                                                                        cursor:
                                                                            "pointer",
                                                                        color:
                                                                            "#64748b",
                                                                        fontSize:
                                                                            "12px",
                                                                        padding:
                                                                            0,
                                                                        verticalAlign:
                                                                            "middle",
                                                                    }}
                                                                    aria-label={
                                                                        isExpanded
                                                                            ? `Collapse ${category}`
                                                                            : `Expand ${category}`
                                                                    }
                                                                >
                                                                    {isExpanded
                                                                        ? "▼"
                                                                        : "▶"}
                                                                </button>

                                                                {category ||
                                                                    "—"}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatNumber(
                                                                    actualPTD
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatNumber(
                                                                    targetPTD
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatNumber(
                                                                    variancePTD
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    borderRight:
                                                                        "1px solid #e5e7eb",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatPercentage(
                                                                    variancePTDPercent
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatNumber(
                                                                    actualYTD
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatNumber(
                                                                    targetYTD
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatNumber(
                                                                    varianceYTD
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatPercentage(
                                                                    varianceYTDPercent
                                                                )}
                                                            </td>
                                                        </tr>

                                                        {/* =================================================
                                                            NATURAL ACCOUNT LOADING ROW
                                                        ================================================= */}

                                                        {isExpanded &&
                                                            categoryLoading && (
                                                                <tr>
                                                                    <td
                                                                        colSpan={
                                                                            9
                                                                        }
                                                                        style={{
                                                                            padding:
                                                                                "14px 20px",
                                                                            background:
                                                                                "#f8fafc",
                                                                            borderBottom:
                                                                                "1px solid #e5e7eb",
                                                                            color:
                                                                                "#64748b",
                                                                            fontSize:
                                                                                "11px",
                                                                        }}
                                                                    >
                                                                        Loading natural account details...
                                                                    </td>
                                                                </tr>
                                                            )}

                                                        {/* =================================================
                                                            NATURAL ACCOUNT ROWS
                                                        ================================================= */}

                                                        {isExpanded &&
                                                            !categoryLoading &&
                                                            accounts.length >
                                                            0 &&
                                                            accounts.map(
                                                                (
                                                                    account,
                                                                    accountIndex
                                                                ) => (
                                                                    <tr
                                                                        key={`${category}-${account.account_code}-${accountIndex}`}
                                                                    >
                                                                        <td
                                                                            style={{
                                                                                position:
                                                                                    "sticky",
                                                                                left: 0,
                                                                                zIndex: 1,
                                                                                minWidth:
                                                                                    "300px",
                                                                                padding:
                                                                                    "9px 12px 9px 45px",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                borderRight:
                                                                                    "1px solid #e5e7eb",
                                                                                color:
                                                                                    "#475569",
                                                                                fontWeight:
                                                                                    500,
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    fontSize:
                                                                                        "11px",
                                                                                    color:
                                                                                        "#64748b",
                                                                                    fontWeight:
                                                                                        600,
                                                                                }}
                                                                            >
                                                                                {account.account_code ||
                                                                                    "—"}
                                                                            </div>

                                                                            <div
                                                                                style={{
                                                                                    marginTop:
                                                                                        "2px",
                                                                                    fontSize:
                                                                                        "11px",
                                                                                    color:
                                                                                        "#334155",
                                                                                    fontWeight:
                                                                                        500,
                                                                                    whiteSpace:
                                                                                        "normal",
                                                                                    lineHeight:
                                                                                        1.4,
                                                                                }}
                                                                            >
                                                                                {account.account_name ||
                                                                                    "—"}
                                                                            </div>
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                color:
                                                                                    "#475569",
                                                                                whiteSpace:
                                                                                    "nowrap",
                                                                            }}
                                                                        >
                                                                            {formatNumber(
                                                                                getValue(
                                                                                    account,
                                                                                    [
                                                                                        "actual_ptd_aed",
                                                                                        "actual_ptd",
                                                                                    ]
                                                                                )
                                                                            )}
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                color:
                                                                                    "#94a3b8",
                                                                            }}
                                                                        >
                                                                            —
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                color:
                                                                                    "#94a3b8",
                                                                            }}
                                                                        >
                                                                            —
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                borderRight:
                                                                                    "1px solid #e5e7eb",
                                                                                color:
                                                                                    "#94a3b8",
                                                                            }}
                                                                        >
                                                                            —
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                color:
                                                                                    "#475569",
                                                                                whiteSpace:
                                                                                    "nowrap",
                                                                            }}
                                                                        >
                                                                            {formatNumber(
                                                                                getValue(
                                                                                    account,
                                                                                    [
                                                                                        "actual_ytd_aed",
                                                                                        "actual_ytd",
                                                                                    ]
                                                                                )
                                                                            )}
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                color:
                                                                                    "#94a3b8",
                                                                            }}
                                                                        >
                                                                            —
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                color:
                                                                                    "#94a3b8",
                                                                            }}
                                                                        >
                                                                            —
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #e5e7eb",
                                                                                color:
                                                                                    "#94a3b8",
                                                                            }}
                                                                        >
                                                                            —
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}

                                                        {/* =================================================
                                                            NO ACCOUNT DATA
                                                        ================================================= */}

                                                        {isExpanded &&
                                                            !categoryLoading &&
                                                            accounts.length ===
                                                            0 && (
                                                                <tr>
                                                                    <td
                                                                        colSpan={
                                                                            9
                                                                        }
                                                                        style={{
                                                                            padding:
                                                                                "12px 20px 12px 45px",
                                                                            background:
                                                                                "#f8fafc",
                                                                            borderBottom:
                                                                                "1px solid #e5e7eb",
                                                                            color:
                                                                                "#64748b",
                                                                            fontSize:
                                                                                "11px",
                                                                        }}
                                                                    >
                                                                        No natural account details available for{" "}
                                                                        <strong>
                                                                            {
                                                                                category
                                                                            }
                                                                        </strong>
                                                                        .
                                                                    </td>
                                                                </tr>
                                                            )}
                                                    </React.Fragment>
                                                );
                                            }
                                        )}

                                        {/* =================================================
                                            TOTAL ROW
                                        ================================================= */}

                                        <tr>
                                            <td
                                                style={{
                                                    position:
                                                        "sticky",
                                                    left: 0,
                                                    zIndex: 3,
                                                    padding:
                                                        "11px 12px",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    borderRight:
                                                        "1px solid #e5e7eb",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                Total
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatNumber(
                                                    totals.actualPTD
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatNumber(
                                                    totals.targetPTD
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatNumber(
                                                    totals.variancePTD
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    borderRight:
                                                        "1px solid #e5e7eb",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatPercentage(
                                                    totalVariancePTDPercent
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatNumber(
                                                    totals.actualYTD
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatNumber(
                                                    totals.targetYTD
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatNumber(
                                                    totals.varianceYTD
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatPercentage(
                                                    totalVarianceYTDPercent
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                    style={{
                        padding: "12px 22px",
                        borderTop:
                            "1px solid #e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        background: "#ffffff",
                        flexShrink: 0,
                    }}
                >
                    <button
                        type="button"
                        onClick={handleClose}
                        style={{
                            padding: "8px 18px",
                            borderRadius: "6px",
                            border:
                                "1px solid #d1d5db",
                            background: "#ffffff",
                            color: "#374151",
                            fontSize: "12px",
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
}