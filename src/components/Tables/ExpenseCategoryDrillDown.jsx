
import React, { useState } from "react";
import { deriveCategoryNaturalAccounts } from "../../data/opexNaturalAccounts";

/* =========================================================
   MONTHS
========================================================= */

const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

/* =========================================================
   FORMAT NUMBER
   No decimal points
========================================================= */

const formatNumber = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const number = Number(
        typeof value === "string"
            ? value.replace(/,/g, "")
            : value
    );

    if (!Number.isFinite(number)) {
        return "—";
    }

    return number.toLocaleString("en-US", {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    });
};

/* =========================================================
   GET NUMBER COLOR
   Negative values = RED
========================================================= */

const getNumberColor = (
    value,
    defaultColor = "#334155"
) => {
    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "-" ||
        value === "—"
    ) {
        return defaultColor;
    }

    const number = Number(
        typeof value === "string"
            ? value.replace(/,/g, "")
            : value
    );

    if (
        Number.isFinite(number) &&
        number < 0
    ) {
        return "#DC2626";
    }

    return defaultColor;
};

/* =========================================================
   FORMAT MONTH VALUE
   AED → AED Millions
========================================================= */

const formatMonthValue = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const number = Number(
        typeof value === "string"
            ? value.replace(/,/g, "")
            : value
    );

    if (!Number.isFinite(number)) {
        return "—";
    }

    const millions = number / 1_000_000;

    return `AED ${millions.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}M`;
};

/* =========================================================
   FORMAT DATA AS OF
========================================================= */

const formatDataAsOf = (value) => {
    if (!value) {
        return "—";
    }

    const valueString = String(value);

    const dateOnlyMatch = valueString.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (dateOnlyMatch) {
        const [, year, month, day] =
            dateOnlyMatch;

        const date = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return valueString;
    }

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

/* =========================================================
   GET MONTH VALUE
========================================================= */

const getMonthValue = (
    monthData,
    month
) => {
    if (!monthData) {
        return null;
    }

    if (Array.isArray(monthData)) {
        const monthItem =
            monthData.find(
                (item) =>
                    item?.month === month ||
                    item?.month_name === month ||
                    item?.monthName === month
            );

        return (
            monthItem?.value ??
            monthItem?.actual ??
            monthItem?.monthly_actual ??
            null
        );
    }

    return (
        monthData?.[month] ??
        monthData?.[month.toLowerCase()] ??
        null
    );
};

/* =========================================================
   GET DETAILS
========================================================= */

const getDetails = (item) => {
    if (!item) {
        return [];
    }

    if (Array.isArray(item.categoryDetails)) {
        return item.categoryDetails;
    }

    if (Array.isArray(item.naturalAccounts)) {
        return item.naturalAccounts;
    }

    if (Array.isArray(item.details)) {
        return item.details;
    }

    return [];
};

/* =========================================================
   NORMALIZE CATEGORY DETAIL API RESPONSE
========================================================= */

const normalizeCategoryDetails = (
    response
) => {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.details)) {
        return response.details;
    }

    if (
        Array.isArray(
            response?.categoryDetails
        )
    ) {
        return response.categoryDetails;
    }

    if (
        Array.isArray(
            response?.naturalAccounts
        )
    ) {
        return response.naturalAccounts;
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
        null
    );
};

/* =========================================================
   GET ACTUAL PTD
========================================================= */

const getActualPTD = (item) => {
    return (
        item?.actualPTD ??
        item?.actual_ptd ??
        item?.actual_ptd_aed ??
        null
    );
};

/* =========================================================
   GET ACTUAL YTD
========================================================= */

const getActualYTD = (item) => {
    return (
        item?.actualYTD ??
        item?.actual_ytd ??
        item?.actual_ytd_aed ??
        null
    );
};

/* =========================================================
   CALCULATE TOTAL ACTUAL
========================================================= */

const getTotalActual = (
    data,
    getter
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
        const value = getter(item);

        if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            value !== "-" &&
            value !== "—"
        ) {
            const number = Number(value);

            if (Number.isFinite(number)) {
                total += number;
                hasValue = true;
            }
        }
    });

    return hasValue ? total : null;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ExpenseCategoryDrillDown({
    data = [],
    totalData = null,
    dataAsOf = null,
    currentMonthPartial = false,
    onExpandCategory,
    detailLoading = {},
    periodName = "Sep-26",
    reportingCurrency = "AED",

    onViewAll,
    onExportExcel,
    onExportPdf,
}) {
    const [expandedRows, setExpandedRows] =
        useState({});

    /* =======================================================
       CATEGORY DETAIL STATE
    ======================================================= */

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

    /* =======================================================
       NEW MENU STATE
    ======================================================= */

    const [menuOpen, setMenuOpen] =
        useState(false);

    /* =======================================================
       TOTAL ACTUALS
    ======================================================= */

    const totalActualPTD =
        getTotalActual(
            data,
            getActualPTD
        );

    const totalActualYTD =
        getTotalActual(
            data,
            getActualYTD
        );

    /* =======================================================
       LOAD CATEGORY DETAIL
    ======================================================= */
    /* =======================================================
       LOAD CATEGORY DETAIL
       Backend response is the primary source.
       Existing fallback logic remains unchanged.
    ======================================================= */

    const loadCategoryDetails = async (
        item
    ) => {
        const category =
            item?.category ||
            (typeof item === "string"
                ? item
                : "");

        if (!category) {
            return;
        }

        if (
            categoryDetails[category] &&
            Array.isArray(
                categoryDetails[category]
            ) &&
            categoryDetails[category].length > 0
        ) {
            return;
        }

        try {
            setCategoryDetailLoading(
                (prev) => ({
                    ...prev,
                    [category]: true,
                })
            );

            setCategoryDetailError(
                (prev) => ({
                    ...prev,
                    [category]: null,
                })
            );

            /* ===================================================
               BACKEND API
               Backend response is used first.
            =================================================== */

            const configuredBaseUrl =
                import.meta.env
                    .VITE_API_BASE_URL || "";

            let baseUrl =
                configuredBaseUrl.replace(
                    /\/+$/,
                    ""
                );

            const apiUrl =
                baseUrl.endsWith("/api")
                    ? `${baseUrl}/opex/category-detail`
                    : `${baseUrl}/api/opex/category-detail`;

            const params =
                new URLSearchParams({
                    category,
                    period_name: periodName,
                    reporting_currency:
                        reportingCurrency,
                });

            const token =
                localStorage.getItem("token") ||
                localStorage.getItem(
                    "finsight_token"
                );

            const response =
                await fetch(
                    `${apiUrl}?${params.toString()}`,
                    {
                        method: "GET",
                        headers: {
                            Accept:
                                "application/json",

                            ...(token
                                ? {
                                    Authorization: `Bearer ${token}`,
                                }
                                : {}),
                        },
                    }
                );

            if (response.ok) {
                const responseData =
                    await response.json();

                const details =
                    normalizeCategoryDetails(
                        responseData
                    );

                /* =================================================
                   USE BACKEND DETAILS DIRECTLY
                ================================================= */

                if (
                    Array.isArray(details) &&
                    details.length > 0
                ) {
                    setCategoryDetails(
                        (prev) => ({
                            ...prev,
                            [category]:
                                details,
                        })
                    );

                    return;
                }
            }

            /* ===================================================
               EXISTING PRELOADED DATA FALLBACK
            =================================================== */

            const preloadedDetails =
                item?.categoryDetails ||
                item?.naturalAccounts ||
                item?.details;

            if (
                Array.isArray(preloadedDetails) &&
                preloadedDetails.length > 0
            ) {
                setCategoryDetails(
                    (prev) => ({
                        ...prev,
                        [category]:
                            preloadedDetails,
                    })
                );

                return;
            }

            /* ===================================================
               EXISTING DERIVED DATA FALLBACK
            =================================================== */

            const fallbackDetails =
                deriveCategoryNaturalAccounts(
                    item,
                    category
                );

            setCategoryDetails(
                (prev) => ({
                    ...prev,
                    [category]:
                        fallbackDetails,
                })
            );
        } catch (error) {
            /* ===================================================
               EXISTING FALLBACK ON API ERROR
            =================================================== */

            const preloadedDetails =
                item?.categoryDetails ||
                item?.naturalAccounts ||
                item?.details;

            if (
                Array.isArray(preloadedDetails) &&
                preloadedDetails.length > 0
            ) {
                setCategoryDetails(
                    (prev) => ({
                        ...prev,
                        [category]:
                            preloadedDetails,
                    })
                );

                return;
            }

            const fallbackDetails =
                deriveCategoryNaturalAccounts(
                    item,
                    category
                );

            if (
                Array.isArray(fallbackDetails) &&
                fallbackDetails.length > 0
            ) {
                setCategoryDetails(
                    (prev) => ({
                        ...prev,
                        [category]:
                            fallbackDetails,
                    })
                );
            } else {
                setCategoryDetailError(
                    (prev) => ({
                        ...prev,
                        [category]:
                            error?.message ||
                            "Unable to load natural-account details.",
                    })
                );

                setCategoryDetails(
                    (prev) => ({
                        ...prev,
                        [category]: [],
                    })
                );
            }
        } finally {
            setCategoryDetailLoading(
                (prev) => ({
                    ...prev,
                    [category]: false,
                })
            );
        }
    };
    /* =======================================================
       TOGGLE
    ======================================================= */

    const toggleRow = async (
        item,
        index
    ) => {
        const rowKey =
            item?.category || index;

        const willExpand =
            !expandedRows[rowKey];

        setExpandedRows((prev) => ({
            ...prev,
            [rowKey]: willExpand,
        }));

        if (!willExpand) {
            return;
        }

        if (
            typeof onExpandCategory ===
            "function"
        ) {
            try {
                await onExpandCategory(item);
            } catch (error) {
                /* Keep local loading independent */
            }
        }

        await loadCategoryDetails(item);
    };

    /* =======================================================
       MENU HANDLERS
    ======================================================= */

    const handleViewAllClick = () => {
        setMenuOpen(false);

        if (
            typeof onViewAll ===
            "function"
        ) {
            onViewAll();
        }
    };

    const handleExportExcelClick = () => {
        setMenuOpen(false);

        if (
            typeof onExportExcel ===
            "function"
        ) {
            onExportExcel();
        }
    };

    const handleExportPdfClick = () => {
        setMenuOpen(false);

        if (
            typeof onExportPdf ===
            "function"
        ) {
            onExportPdf();
        }
    };

    /* =======================================================
       RENDER DETAILS
    ======================================================= */

    const renderNaturalAccountDetails = (
        category,
        parentItem
    ) => {
        let details =
            categoryDetails[category] ||
            parentItem?.categoryDetails ||
            parentItem?.naturalAccounts ||
            parentItem?.details ||
            [];

        if (
            (!details || !details.length) &&
            parentItem
        ) {
            details =
                deriveCategoryNaturalAccounts(
                    parentItem,
                    category
                );
        }

        if (
            categoryDetailLoading[category] &&
            (!details || !details.length)
        ) {
            return (
                <div
                    style={{
                        padding:
                            "16px 20px",
                        fontSize: 12,
                        color: "#64748B",
                    }}
                >
                    Loading natural-account details...
                </div>
            );
        }

        if (
            categoryDetailError[category] &&
            (!details || !details.length)
        ) {
            return (
                <div
                    style={{
                        padding:
                            "16px 20px",
                        fontSize: 12,
                        color: "#DC2626",
                    }}
                >
                    {
                        categoryDetailError[
                        category
                        ]
                    }
                </div>
            );
        }

        if (!details.length) {
            return (
                <div
                    style={{
                        padding:
                            "16px 20px",
                        fontSize: 12,
                        color: "#64748B",
                    }}
                >
                    No natural-account details
                    available.
                </div>
            );
        }

        /* ===================================================
           GET DETAIL VALUE
           Supports both camelCase and backend snake_case.
        =================================================== */

        const getDetailValue = (
            account,
            camelCaseKey,
            snakeCaseKey,
            aedKey = null
        ) => {
            const camelValue =
                account?.[camelCaseKey];

            if (
                camelValue !== undefined &&
                camelValue !== null &&
                camelValue !== ""
            ) {
                return camelValue;
            }

            const snakeValue =
                account?.[snakeCaseKey];

            if (
                snakeValue !== undefined &&
                snakeValue !== null &&
                snakeValue !== ""
            ) {
                return snakeValue;
            }

            if (aedKey) {
                const aedValue =
                    account?.[aedKey];

                if (
                    aedValue !== undefined &&
                    aedValue !== null &&
                    aedValue !== ""
                ) {
                    return aedValue;
                }
            }

            return null;
        };

        /* ===================================================
           FORMAT PERCENT
        =================================================== */

        const formatPercent = (value) => {
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

            return Number.isFinite(number)
                ? `${number.toFixed(1)}%`
                : "—";
        };

        return (
            <div
                style={{
                    width: "100%",
                    overflowX: "auto",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        minWidth: 900,
                        borderCollapse: "collapse",
                        tableLayout: "fixed",
                    }}
                >
                    <colgroup>
                        <col style={{ width: "17%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "8%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "8%" }} />
                    </colgroup>

                    <thead>
                        <tr
                            style={{
                                height: 38,
                                borderBottom: "1px solid #E5E7EB",
                            }}
                        >
                            {[
                                "EXPENSE CATEGORY",
                                "ACTUAL PTD",
                                "TARGET PTD",
                                "VARIANCE PTD",
                                "VARIANCE PTD %",
                                "ACTUAL YTD",
                                "TARGET YTD",
                                "VARIANCE YTD",
                                "VARIANCE YTD %",
                            ].map((heading, index) => (
                                <th
                                    key={`${heading}-${index}`}
                                    style={{
                                        padding: "0 10px",
                                        textAlign:
                                            index === 0 ? "left" : "right",
                                        color: "#1E3A8A",
                                        fontSize: 13,
                                        fontWeight: 700,
                                        whiteSpace: "normal",
                                        lineHeight: "17px",
                                    }}
                                >
                                    {heading}
                                </th>
                            ))}
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

                                const accountName =
                                    getAccountName(
                                        account
                                    );

                                /*
                                 * Backend response:
                                 *
                                 * actual_ptd
                                 * actual_ytd
                                 *
                                 * Also supports:
                                 * actual_ptd_aed
                                 * actual_ytd_aed
                                 */

                                const actualPTD =
                                    getDetailValue(
                                        account,
                                        "actualPTD",
                                        "actual_ptd",
                                        "actual_ptd_aed"
                                    );

                                const targetPTD =
                                    getDetailValue(
                                        account,
                                        "targetPTD",
                                        "target_ptd"
                                    );

                                const variancePTD =
                                    getDetailValue(
                                        account,
                                        "variancePTD",
                                        "variance_ptd"
                                    );

                                const variancePTDPercent =
                                    getDetailValue(
                                        account,
                                        "variancePTDPercent",
                                        "variance_ptd_pct"
                                    );

                                const actualYTD =
                                    getDetailValue(
                                        account,
                                        "actualYTD",
                                        "actual_ytd",
                                        "actual_ytd_aed"
                                    );

                                const targetYTD =
                                    getDetailValue(
                                        account,
                                        "targetYTD",
                                        "target_ytd"
                                    );

                                const varianceYTD =
                                    getDetailValue(
                                        account,
                                        "varianceYTD",
                                        "variance_ytd"
                                    );

                                const varianceYTDPercent =
                                    getDetailValue(
                                        account,
                                        "varianceYTDPercent",
                                        "variance_ytd_pct"
                                    );

                                return (
                                    <tr
                                        key={
                                            accountCode ||
                                            accountIndex
                                        }
                                        style={{
                                            height: 39,
                                            borderBottom:
                                                "1px solid #E5E7EB",
                                        }}
                                    >
                                        {/* NATURAL ACCOUNT */}
                                        <td
                                            style={{
                                                padding:
                                                    "8px",
                                                textAlign:
                                                    "left",
                                                fontSize: 14,
                                                color:
                                                    "#334155",
                                                fontWeight: 500,
                                                whiteSpace:
                                                    "normal",
                                                wordBreak:
                                                    "break-word",
                                                overflowWrap:
                                                    "anywhere",
                                                lineHeight:
                                                    "19px",
                                            }}
                                        >
                                            {accountCode
                                                ? `${accountCode} - ${String(
                                                    accountName ||
                                                    ""
                                                ).replace(
                                                    new RegExp(
                                                        `^${String(
                                                            accountCode
                                                        ).replace(
                                                            /[.*+?^${}()|[\]\\]/g,
                                                            "\\$&"
                                                        )}\\s*-\\s*`,
                                                        "i"
                                                    ),
                                                    ""
                                                )}`
                                                : accountName}
                                        </td>

                                        {/* PTD ACTUAL / TARGET / VARIANCE */}
                                        {[
                                            actualPTD,
                                            targetPTD,
                                            variancePTD,
                                        ].map(
                                            (
                                                value,
                                                valueIndex
                                            ) => (
                                                <td
                                                    key={
                                                        valueIndex
                                                    }
                                                    style={{
                                                        padding:
                                                            "0 6px",
                                                        textAlign:
                                                            "right",
                                                        fontSize: 13,
                                                        color:
                                                            getNumberColor(
                                                                value,
                                                                valueIndex ===
                                                                    0
                                                                    ? "#334155"
                                                                    : "#64748B"
                                                            ),
                                                        fontWeight:
                                                            valueIndex ===
                                                                2
                                                                ? 600
                                                                : 500,
                                                        whiteSpace:
                                                            "nowrap",
                                                    }}
                                                >
                                                    {formatNumber(
                                                        value
                                                    )}
                                                </td>
                                            )
                                        )}

                                        {/* PTD VARIANCE % */}
                                        <td
                                            style={{
                                                padding:
                                                    "0 6px",
                                                textAlign:
                                                    "right",
                                                fontSize: 13,
                                                color:
                                                    getNumberColor(
                                                        variancePTDPercent,
                                                        "#64748B"
                                                    ),
                                                fontWeight: 600,
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {formatPercent(
                                                variancePTDPercent
                                            )}
                                        </td>

                                        {/* YTD ACTUAL / TARGET / VARIANCE */}
                                        {[
                                            actualYTD,
                                            targetYTD,
                                            varianceYTD,
                                        ].map(
                                            (
                                                value,
                                                valueIndex
                                            ) => (
                                                <td
                                                    key={`ytd-${valueIndex}`}
                                                    style={{
                                                        padding:
                                                            "0 6px",
                                                        textAlign:
                                                            "right",
                                                        fontSize: 13,
                                                        color:
                                                            getNumberColor(
                                                                value,
                                                                valueIndex ===
                                                                    0
                                                                    ? "#334155"
                                                                    : "#64748B"
                                                            ),
                                                        fontWeight:
                                                            valueIndex ===
                                                                2
                                                                ? 600
                                                                : 500,
                                                        whiteSpace:
                                                            "nowrap",
                                                    }}
                                                >
                                                    {formatNumber(
                                                        value
                                                    )}
                                                </td>
                                            )
                                        )}

                                        {/* YTD VARIANCE % */}
                                        <td
                                            style={{
                                                padding:
                                                    "0 6px",
                                                textAlign:
                                                    "right",
                                                fontSize: 13,
                                                color:
                                                    getNumberColor(
                                                        varianceYTDPercent,
                                                        "#64748B"
                                                    ),
                                                fontWeight: 600,
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {formatPercent(
                                                varianceYTDPercent
                                            )}
                                        </td>
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div
            style={{
                width: "100%",
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                boxSizing: "border-box",
                overflow: "hidden",
            }}
        >
            {/* HEADER */}

            <div
                style={{
                    height: 42,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "space-between",
                    padding: "0 12px",
                    boxSizing:
                        "border-box",
                }}
            >
                <h3
                    style={{
                        margin: 0,
                        fontSize: 14,
                        lineHeight: "17px",
                        fontWeight: 700,
                        color: "#0F172A",
                    }}
                >
                    Expense Category Drill-Down <span style={{ color: "#6B7280", marginLeft: "6px" }}>(Amounts in {reportingCurrency || "AED"})</span>
                </h3>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        position: "relative",
                    }}
                >
                    {dataAsOf && (
                        <span
                            style={{
                                fontSize: 13,
                                color: "#64748B",
                                whiteSpace:
                                    "nowrap",
                            }}
                        >
                            Data as of{" "}
                            <strong
                                style={{
                                    color:
                                        "#334155",
                                    fontWeight: 600,
                                }}
                            >
                                {formatDataAsOf(
                                    dataAsOf
                                )}
                            </strong>
                        </span>
                    )}

                    {currentMonthPartial && (
                        <span
                            style={{
                                display:
                                    "inline-flex",
                                alignItems:
                                    "center",
                                padding:
                                    "3px 7px",
                                borderRadius:
                                    999,
                                background:
                                    "#FFF7ED",
                                border:
                                    "1px solid #FED7AA",
                                color:
                                    "#C2410C",
                                fontSize: 13,
                                fontWeight: 600,
                                whiteSpace:
                                    "nowrap",
                            }}
                        >
                            Current month partial
                        </span>
                    )}

                    {/* 3 DOT MENU */}

                    <button
                        type="button"
                        onClick={() =>
                            setMenuOpen(
                                (prev) =>
                                    !prev
                            )
                        }
                        aria-label="Expense category actions"
                        aria-expanded={
                            menuOpen
                        }
                        style={{
                            border: "none",
                            background:
                                "transparent",
                            padding:
                                "2px 4px",
                            cursor:
                                "pointer",
                            color:
                                "#64748B",
                            fontSize: 17,
                            lineHeight: 1,
                        }}
                    >
                        ⋮
                    </button>

                    {/* ACTION MENU */}

                    {menuOpen && (
                        <div
                            style={{
                                position:
                                    "absolute",
                                top: 28,
                                right: 0,
                                minWidth: 165,
                                background:
                                    "#FFFFFF",
                                border:
                                    "1px solid #E5E7EB",
                                borderRadius: 8,
                                boxShadow:
                                    "0 8px 24px rgba(15, 23, 42, 0.12)",
                                padding:
                                    "5px 0",
                                zIndex: 100,
                            }}
                        >
                            {/* VIEW ALL */}

                            <button
                                type="button"
                                onClick={
                                    handleViewAllClick
                                }
                                style={{
                                    width: "100%",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: 9,
                                    border:
                                        "none",
                                    background:
                                        "transparent",
                                    padding:
                                        "9px 12px",
                                    cursor:
                                        "pointer",
                                    textAlign:
                                        "left",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color:
                                        "#334155",
                                }}
                                onMouseEnter={(
                                    event
                                ) => {
                                    event.currentTarget.style.background =
                                        "#F8FAFC";
                                }}
                                onMouseLeave={(
                                    event
                                ) => {
                                    event.currentTarget.style.background =
                                        "transparent";
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 14,
                                    }}
                                >
                                    🔍
                                </span>

                                <span>
                                    View All
                                </span>
                            </button>

                            {/* EXPORT EXCEL */}

                            <button
                                type="button"
                                onClick={
                                    handleExportExcelClick
                                }
                                style={{
                                    width: "100%",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: 9,
                                    border:
                                        "none",
                                    background:
                                        "transparent",
                                    padding:
                                        "9px 12px",
                                    cursor:
                                        "pointer",
                                    textAlign:
                                        "left",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color:
                                        "#334155",
                                }}
                                onMouseEnter={(
                                    event
                                ) => {
                                    event.currentTarget.style.background =
                                        "#F8FAFC";
                                }}
                                onMouseLeave={(
                                    event
                                ) => {
                                    event.currentTarget.style.background =
                                        "transparent";
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 14,
                                    }}
                                >
                                    📊
                                </span>

                                <span>
                                    Export Excel
                                </span>
                            </button>

                            {/* EXPORT PDF */}

                            <button
                                type="button"
                                onClick={
                                    handleExportPdfClick
                                }
                                style={{
                                    width: "100%",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: 9,
                                    border:
                                        "none",
                                    background:
                                        "transparent",
                                    padding:
                                        "9px 12px",
                                    cursor:
                                        "pointer",
                                    textAlign:
                                        "left",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color:
                                        "#334155",
                                }}
                                onMouseEnter={(
                                    event
                                ) => {
                                    event.currentTarget.style.background =
                                        "#F8FAFC";
                                }}
                                onMouseLeave={(
                                    event
                                ) => {
                                    event.currentTarget.style.background =
                                        "transparent";
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 14,
                                    }}
                                >
                                    📄
                                </span>

                                <span>
                                    Export PDF
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* TABLE */}

            <div
                style={{
                    width: "100%",
                    overflowX: "auto",
                    padding:
                        "0 8px 10px",
                    boxSizing:
                        "border-box",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        minWidth: 900,
                        borderCollapse:
                            "collapse",
                        tableLayout: "fixed",
                    }}
                >
                    <colgroup>
                        <col
                            style={{
                                width: "17%",
                            }}
                        />
                        <col
                            style={{
                                width: "10%",
                            }}
                        />
                        <col
                            style={{
                                width: "10%",
                            }}
                        />
                        <col
                            style={{
                                width: "10%",
                            }}
                        />
                        <col
                            style={{
                                width: "8%",
                            }}
                        />
                        <col
                            style={{
                                width: "10%",
                            }}
                        />
                        <col
                            style={{
                                width: "10%",
                            }}
                        />
                        <col
                            style={{
                                width: "10%",
                            }}
                        />
                        <col
                            style={{
                                width: "8%",
                            }}
                        />
                    </colgroup>

                    <thead>
                        <tr
                            style={{
                                height: 38,
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
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace:
                                        "nowrap",
                                }}
                            >
                                EXPENSE CATEGORY
                            </th>

                            <th
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "17px",
                                }}
                            >
                                ACTUAL PTD
                            </th>

                            <th
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "17px",
                                }}
                            >
                                TARGET PTD
                            </th>

                            <th
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "17px",
                                }}
                            >
                                VARIANCE PTD
                            </th>

                            <th
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "17px",
                                }}
                            >
                                VARIANCE PTD %
                            </th>

                            <th
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "17px",
                                }}
                            >
                                ACTUAL YTD
                            </th>

                            <th
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "17px",
                                }}
                            >
                                TARGET YTD
                            </th>

                            <th
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "17px",
                                }}
                            >
                                VARIANCE YTD
                            </th>

                            <th
                                style={{
                                    padding:
                                        "0 10px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "17px",
                                }}
                            >
                                VARIANCE YTD %
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map(
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

                                const actualPTD =
                                    item?.actualPTD ??
                                    item?.actual_ptd;

                                const targetPTD =
                                    item?.targetPTD ??
                                    item?.target_ptd;

                                const variancePTD =
                                    item?.variancePTD ??
                                    item?.variance_ptd;

                                const variancePTDPercent =
                                    item?.variancePTDPercent ??
                                    item?.variance_ptd_pct;

                                const actualYTD =
                                    item?.actualYTD ??
                                    item?.actual_ytd;

                                const targetYTD =
                                    item?.targetYTD ??
                                    item?.target_ytd;

                                const varianceYTD =
                                    item?.varianceYTD ??
                                    item?.variance_ytd;

                                const varianceYTDPercent =
                                    item?.varianceYTDPercent ??
                                    item?.variance_ytd_pct;

                                return (
                                    <React.Fragment
                                        key={
                                            rowKey
                                        }
                                    >
                                        {/* MAIN CATEGORY ROW */}

                                        <tr
                                            style={{
                                                height: 39,
                                                borderBottom:
                                                    "1px solid #F1F5F9",
                                            }}
                                        >
                                            <td
                                                style={{
                                                    padding:
                                                        "0 8px",
                                                    textAlign:
                                                        "left",
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
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleRow(
                                                                item,
                                                                index
                                                            )
                                                        }
                                                        style={{
                                                            width: 12,
                                                            height: 12,
                                                            padding: 0,
                                                            border:
                                                                "none",
                                                            background:
                                                                "transparent",
                                                            cursor:
                                                                "pointer",
                                                            color:
                                                                "#000000",
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            fontSize: 12,
                                                            lineHeight: 1,
                                                        }}
                                                    >
                                                        {isExpanded
                                                            ? "▼"
                                                            : "▶"}
                                                    </button>

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
                                                </div>
                                            </td>

                                            {/* PTD ACTUAL */}

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        getNumberColor(
                                                            actualPTD,
                                                            "#334155"
                                                        ),
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {formatNumber(
                                                    actualPTD
                                                )}
                                            </td>

                                            {/* PTD TARGET */}

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        getNumberColor(
                                                            targetPTD,
                                                            "#64748B"
                                                        ),
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {formatNumber(
                                                    targetPTD
                                                )}
                                            </td>

                                            {/* PTD VARIANCE */}

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        getNumberColor(
                                                            variancePTD,
                                                            "#64748B"
                                                        ),
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {formatNumber(
                                                    variancePTD
                                                )}
                                            </td>

                                            {/* PTD VARIANCE % */}

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        getNumberColor(
                                                            variancePTDPercent,
                                                            "#64748B"
                                                        ),
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {variancePTDPercent !==
                                                    null &&
                                                    variancePTDPercent !==
                                                    undefined &&
                                                    variancePTDPercent !==
                                                    ""
                                                    ? `${Number(
                                                        variancePTDPercent
                                                    ).toFixed(
                                                        1
                                                    )}%`
                                                    : "—"}
                                            </td>

                                            {/* YTD ACTUAL */}

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        getNumberColor(
                                                            actualYTD,
                                                            "#334155"
                                                        ),
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {formatNumber(
                                                    actualYTD
                                                )}
                                            </td>

                                            {/* YTD TARGET */}

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        getNumberColor(
                                                            targetYTD,
                                                            "#64748B"
                                                        ),
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {formatNumber(
                                                    targetYTD
                                                )}
                                            </td>

                                            {/* YTD VARIANCE */}

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        getNumberColor(
                                                            varianceYTD,
                                                            "#64748B"
                                                        ),
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {formatNumber(
                                                    varianceYTD
                                                )}
                                            </td>

                                            {/* YTD VARIANCE % */}

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        getNumberColor(
                                                            varianceYTDPercent,
                                                            "#64748B"
                                                        ),
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {varianceYTDPercent !==
                                                    null &&
                                                    varianceYTDPercent !==
                                                    undefined &&
                                                    varianceYTDPercent !==
                                                    ""
                                                    ? `${Number(
                                                        varianceYTDPercent
                                                    ).toFixed(
                                                        1
                                                    )}%`
                                                    : "—"}
                                            </td>
                                        </tr>

                                        {/* EXPANDED ROW */}

                                        {isExpanded && (
                                            <tr>
                                                <td
                                                    colSpan={9}
                                                    style={{
                                                        background: "#FFFFFF",
                                                        padding: "10px 0",
                                                        borderBottom: "1px solid #E5E7EB",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                marginBottom: 8,
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: 13,
                                                                    fontWeight: 600,
                                                                    color:
                                                                        "#334155",
                                                                }}
                                                            >
                                                                Natural-account
                                                                details
                                                                for{" "}
                                                                <strong
                                                                    style={{
                                                                        color:
                                                                            "#0F172A",
                                                                        fontWeight: 700,
                                                                    }}
                                                                >
                                                                    {item?.category ||
                                                                        "—"}
                                                                </strong>
                                                            </div>
                                                        </div>

                                                        {renderNaturalAccountDetails(
                                                            item?.category,
                                                            item
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            }
                        )}

                        {/* TOTAL */}

                        <tr
                            style={{
                                height: 43,
                                background:
                                    "#F4F2FF",
                            }}
                        >
                            <td
                                style={{
                                    padding:
                                        "0 8px",
                                    textAlign:
                                        "left",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color:
                                        "#0F172A",
                                }}
                            >
                                <span
                                    style={{
                                        paddingLeft: 21,
                                    }}
                                >
                                    Total Operating
                                    Expenses
                                </span>
                            </td>

                            {/* TOTAL PTD ACTUAL */}

                            <td
                                style={{
                                    padding:
                                        "0 6px",
                                    textAlign:
                                        "right",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color:
                                        getNumberColor(
                                            totalActualPTD,
                                            "#0F172A"
                                        ),
                                }}
                            >
                                {formatNumber(
                                    totalActualPTD
                                )}
                            </td>

                            {/* TARGET PTD */}

                            <td
                                style={{
                                    padding:
                                        "0 6px",
                                    textAlign:
                                        "right",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color:
                                        "#64748B",
                                }}
                            >
                                {formatNumber(
                                    null
                                )}
                            </td>

                            {/* VARIANCE PTD */}

                            <td
                                style={{
                                    padding:
                                        "0 6px",
                                    textAlign:
                                        "right",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color:
                                        "#64748B",
                                }}
                            >
                                {formatNumber(
                                    null
                                )}
                            </td>

                            {/* VARIANCE PTD % */}

                            <td
                                style={{
                                    padding:
                                        "0 6px",
                                    textAlign:
                                        "right",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color:
                                        "#64748B",
                                }}
                            >
                                —
                            </td>

                            {/* TOTAL YTD ACTUAL */}

                            <td
                                style={{
                                    padding:
                                        "0 6px",
                                    textAlign:
                                        "right",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color:
                                        getNumberColor(
                                            totalActualYTD,
                                            "#0F172A"
                                        ),
                                }}
                            >
                                {formatNumber(
                                    totalActualYTD
                                )}
                            </td>

                            {/* TARGET YTD */}

                            <td
                                style={{
                                    padding:
                                        "0 6px",
                                    textAlign:
                                        "right",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color:
                                        "#64748B",
                                }}
                            >
                                {formatNumber(
                                    null
                                )}
                            </td>

                            {/* VARIANCE YTD */}

                            <td
                                style={{
                                    padding:
                                        "0 6px",
                                    textAlign:
                                        "right",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color:
                                        "#64748B",
                                }}
                            >
                                {formatNumber(
                                    null
                                )}
                            </td>

                            {/* VARIANCE YTD % */}

                            <td
                                style={{
                                    padding:
                                        "0 6px",
                                    textAlign:
                                        "right",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color:
                                        "#64748B",
                                }}
                            >
                                —
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}