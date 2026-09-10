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
========================================================= */

const formatNumber = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "—";
    }

    return number.toLocaleString("en-US");
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
        const [, year, month, day] = dateOnlyMatch;

        const date = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return valueString;
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
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
        const monthItem = monthData.find(
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

const normalizeCategoryDetails = (response) => {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.details)) {
        return response.details;
    }

    if (Array.isArray(response?.categoryDetails)) {
        return response.categoryDetails;
    }

    if (Array.isArray(response?.naturalAccounts)) {
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

    const loadCategoryDetails = async (
        item
    ) => {
        const category =
            item?.category ||
            (typeof item === "string" ? item : "");

        if (!category) {
            return;
        }

        if (
            categoryDetails[category] &&
            Array.isArray(categoryDetails[category]) &&
            categoryDetails[category].length > 0
        ) {
            return;
        }

        const preloadedDetails =
            item?.categoryDetails ||
            item?.naturalAccounts ||
            item?.details;

        if (
            Array.isArray(preloadedDetails) &&
            preloadedDetails.length > 0
        ) {
            setCategoryDetails((prev) => ({
                ...prev,
                [category]: preloadedDetails,
            }));
            return;
        }

        const derived =
            deriveCategoryNaturalAccounts(
                item,
                category
            );

        if (
            Array.isArray(derived) &&
            derived.length > 0
        ) {
            setCategoryDetails((prev) => ({
                ...prev,
                [category]: derived,
            }));
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

            const configuredBaseUrl =
                import.meta.env
                    .VITE_API_BASE_URL || "";

            let baseUrl =
                configuredBaseUrl.replace(
                    /\/+$/,
                    ""
                );

            const apiUrl = baseUrl.endsWith(
                "/api"
            )
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

                if (
                    Array.isArray(details) &&
                    details.length > 0
                ) {
                    setCategoryDetails(
                        (prev) => ({
                            ...prev,
                            [category]: details,
                        })
                    );
                    return;
                }
            }

            const fallbackDetails =
                deriveCategoryNaturalAccounts(
                    item,
                    category
                );

            setCategoryDetails(
                (prev) => ({
                    ...prev,
                    [category]: fallbackDetails,
                })
            );
        } catch (error) {
            const fallbackDetails =
                deriveCategoryNaturalAccounts(
                    item,
                    category
                );

            if (
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
                        padding: "16px 20px",
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
                        padding: "16px 20px",
                        fontSize: 12,
                        color: "#DC2626",
                    }}
                >
                    {categoryDetailError[category]}
                </div>
            );
        }

        if (!details.length) {
            return (
                <div
                    style={{
                        padding: "16px 20px",
                        fontSize: 12,
                        color: "#64748B",
                    }}
                >
                    No natural-account details available.
                </div>
            );
        }

        const getDetailValue = (
            account,
            camelCaseKey,
            snakeCaseKey
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

            return account?.[snakeCaseKey];
        };

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
                        borderCollapse:
                            "collapse",
                        tableLayout: "fixed",
                    }}
                >
                    <colgroup>
                        <col style={{ width: "23%" }} />
                        <col style={{ width: "9%" }} />
                        <col style={{ width: "9%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "9%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "9%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "7%" }} />
                    </colgroup>

                    <thead>
                        <tr
                            style={{
                                height: 44,
                                borderBottom:
                                    "1px solid #E5E7EB",
                            }}
                        >
                            {[
                                "Natural Account",
                                "Actual PTD (AED)",
                                "Target PTD (AED)",
                                "Variance PTD (AED)",
                                "Variance PTD %",
                                "Actual YTD (AED)",
                                "Target YTD (AED)",
                                "Variance YTD (AED)",
                                "Variance YTD %",
                            ].map(
                                (
                                    heading,
                                    index
                                ) => (
                                    <th
                                        key={
                                            heading
                                        }
                                        style={{
                                            padding:
                                                index ===
                                                    0
                                                    ? "0 10px"
                                                    : "0 9px",
                                            textAlign:
                                                index ===
                                                    0
                                                    ? "left"
                                                    : "right",
                                            color:
                                                "#1E3A8A",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            whiteSpace:
                                                "normal",
                                            overflow:
                                                "hidden",
                                            textOverflow:
                                                "ellipsis",
                                            lineHeight:
                                                "16px",
                                        }}
                                    >
                                        {heading}
                                    </th>
                                )
                            )}
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

                                const actualPTD =
                                    getDetailValue(
                                        account,
                                        "actualPTD",
                                        "actual_ptd"
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
                                        "actual_ytd"
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
                                        <td
                                            style={{
                                                padding:
                                                    "8px",
                                                textAlign:
                                                    "left",
                                                fontSize: 13,
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
                                                ? `${accountCode} - ${accountName}`
                                                : accountName}
                                        </td>

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
                                                            valueIndex ===
                                                                0
                                                                ? "#334155"
                                                                : "#64748B",
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

                                        <td
                                            style={{
                                                padding:
                                                    "0 6px",
                                                textAlign:
                                                    "right",
                                                fontSize: 13,
                                                color:
                                                    "#64748B",
                                                fontWeight: 600,
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {formatPercent(
                                                variancePTDPercent
                                            )}
                                        </td>

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
                                                            valueIndex ===
                                                                0
                                                                ? "#334155"
                                                                : "#64748B",
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

                                        <td
                                            style={{
                                                padding:
                                                    "0 6px",
                                                textAlign:
                                                    "right",
                                                fontSize: 13,
                                                color:
                                                    "#64748B",
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
                    Expense Category Drill-Down
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
                                (prev) => !prev
                            )
                        }
                        aria-label="Expense category actions"
                        aria-expanded={menuOpen}
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
                                    padding: "0 10px",
                                    textAlign: "left",
                                    color: "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                Expense Category
                            </th>

                            <th
                                style={{
                                    padding: "0 10px",
                                    textAlign: "right",
                                    color: "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace: "normal",
                                    lineHeight: "17px",
                                }}
                            >
                                Actual PTD (AED)
                            </th>

                            <th
                                style={{
                                    padding: "0 10px",
                                    textAlign: "right",
                                    color: "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace: "normal",
                                    lineHeight: "17px",
                                }}
                            >
                                Target PTD (AED)
                            </th>

                            <th
                                style={{
                                    padding: "0 10px",
                                    textAlign: "right",
                                    color: "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace: "normal",
                                    lineHeight: "17px",
                                }}
                            >
                                Variance PTD (AED)
                            </th>

                            <th
                                style={{
                                    padding: "0 10px",
                                    textAlign: "right",
                                    color: "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace: "normal",
                                    lineHeight: "17px",
                                }}
                            >
                                Variance PTD %
                            </th>

                            <th
                                style={{
                                    padding: "0 10px",
                                    textAlign: "right",
                                    color: "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace: "normal",
                                    lineHeight: "17px",
                                }}
                            >
                                Actual YTD (AED)
                            </th>

                            <th
                                style={{
                                    padding: "0 10px",
                                    textAlign: "right",
                                    color: "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace: "normal",
                                    lineHeight: "17px",
                                }}
                            >
                                Target YTD (AED)
                            </th>

                            <th
                                style={{
                                    padding: "0 10px",
                                    textAlign: "right",
                                    color: "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace: "normal",
                                    lineHeight: "17px",
                                }}
                            >
                                Variance YTD (AED)
                            </th>

                            <th
                                style={{
                                    padding: "0 10px",
                                    textAlign: "right",
                                    color: "#1E3A8A",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    whiteSpace: "normal",
                                    lineHeight: "17px",
                                }}
                            >
                                Variance YTD %
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

                                return (
                                    <React.Fragment
                                        key={
                                            rowKey
                                        }
                                    >
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

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        "#334155",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {formatNumber(
                                                    item?.actualPTD ??
                                                    item?.actual_ptd
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        "#64748B",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {formatNumber(
                                                    item?.targetPTD ??
                                                    item?.target_ptd
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        "#64748B",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {formatNumber(
                                                    item?.variancePTD ??
                                                    item?.variance_ptd
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        "#64748B",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {item?.variancePTDPercent ??
                                                    item?.variance_ptd_pct ??
                                                    null
                                                    ? `${Number(
                                                        item?.variancePTDPercent ??
                                                        item?.variance_ptd_pct
                                                    ).toFixed(
                                                        1
                                                    )}%`
                                                    : "—"}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        "#334155",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {formatNumber(
                                                    item?.actualYTD ??
                                                    item?.actual_ytd
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        "#64748B",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {formatNumber(
                                                    item?.targetYTD ??
                                                    item?.target_ytd
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        "#64748B",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {formatNumber(
                                                    item?.varianceYTD ??
                                                    item?.variance_ytd
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "0 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 13,
                                                    color:
                                                        "#64748B",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {item?.varianceYTDPercent ??
                                                    item?.variance_ytd_pct ??
                                                    null
                                                    ? `${Number(
                                                        item?.varianceYTDPercent ??
                                                        item?.variance_ytd_pct
                                                    ).toFixed(
                                                        1
                                                    )}%`
                                                    : "—"}
                                            </td>
                                        </tr>

                                        {isExpanded && (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        9
                                                    }
                                                    style={{
                                                        background: "#FFFFFF",
                                                        padding:
                                                            "10px 20px",
                                                        borderBottom:
                                                            "1px solid #E5E7EB",
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
                                                                Natural-account details for{" "}
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
                                    padding: "0 8px",
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

                            <td
                                style={{
                                    padding:
                                        "0 6px",
                                    textAlign:
                                        "right",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color:
                                        "#0F172A",
                                }}
                            >
                                {formatNumber(
                                    totalActualPTD
                                )}
                            </td>

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

                            <td
                                style={{
                                    padding:
                                        "0 6px",
                                    textAlign:
                                        "right",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color:
                                        "#0F172A",
                                }}
                            >
                                {formatNumber(
                                    totalActualYTD
                                )}
                            </td>

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