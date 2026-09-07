
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

   Supports:

   {
       "Jan-26": 8364319.95,
       "Feb-26": 8417330,
       "Sep-26": 664
   }

   OR

   {
       jan: 100,
       feb: 200
   }

   Missing month => null => displayed as —
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
        return null;
    }

    /* =====================================================
       OBJECT
    ===================================================== */

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

    /* =====================================================
       ARRAY
    ===================================================== */

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
   MAIN COMPONENT
========================================================= */

export default function MonthOnMonthOpexReport({
    data = [],
    totalData = null,

    detailLoading = {},
    periodName = "Sep-26",
    reportingCurrency = "AED",

    hierarchyFilters = {},
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

    /* =====================================================
       THREE DOT MENU
    ===================================================== */

    const [showExportMenu, setShowExportMenu] =
        useState(false);

    const exportMenuRef =
        useRef(null);

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

    /* =====================================================
       NORMALIZE DATA
    ===================================================== */

    const rows =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
                ? data.data
                : [];

    /* =====================================================
       ACTIVE FILTERS

       Same filters are used by:
       - category detail API
       - View All
       - Excel
       - PDF
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

    const loadCategoryDetails = async (
        item
    ) => {
        const category =
            item?.category;

        if (!category) {
            return [];
        }

        if (
            Object.prototype.hasOwnProperty.call(
                categoryDetails,
                category
            )
        ) {
            return categoryDetails[
                category
            ];
        }

        if (
            categoryDetailLoading?.[
            category
            ]
        ) {
            return [];
        }

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

        try {
            const configuredBase =
                import.meta.env
                    .VITE_API_BASE_URL ||
                "";

            const base =
                configuredBase.replace(
                    /\/+$/,
                    ""
                );

            const apiUrl =
                base.endsWith("/api")
                    ? `${base}/opex/category-detail-monthly`
                    : `${base}/api/opex/category-detail-monthly`;

            const params =
                new URLSearchParams();

            params.set(
                "category",
                category
            );

            params.set(
                "period_name",
                periodName
            );

            params.set(
                "reporting_currency",
                reportingCurrency
            );

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
                            params.set(
                                key,
                                String(value)
                            );
                        }
                    }
                );
            }

            const token =
                localStorage.getItem(
                    "token"
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
                                    Authorization:
                                        `Bearer ${token}`,
                                }
                                : {}),
                        },
                    }
                );

            if (!response.ok) {
                throw new Error(
                    `Category detail monthly request failed: ${response.status}`
                );
            }

            const responseData =
                await response.json();

            const details =
                getDetails(
                    responseData
                );

            setCategoryDetails(
                (prev) => ({
                    ...prev,
                    [category]:
                        details,
                })
            );

            return details;
        } catch (error) {
            console.error(
                "Failed to load OPEX category monthly details:",
                error
            );

            setCategoryDetailError(
                (prev) => ({
                    ...prev,
                    [category]:
                        error?.message ||
                        "Failed to load category monthly details.",
                })
            );

            return [];
        } finally {
            setCategoryDetailLoading(
                (prev) => ({
                    ...prev,
                    [category]: false,
                })
            );
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

    const handleViewAll = () => {
        setShowExportMenu(false);
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
                        key,
                        Array.isArray(value)
                            ? value.join(", ")
                            : value,
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

       Uses an Excel-readable HTML workbook.
       No additional package required.
    ===================================================== */

    const handleExportExcel = () => {
        setShowExportMenu(false);

        const exportRows =
            buildExportRows();

        const tableRows =
            exportRows
                .map(
                    (row) => `
                        <tr>
                            ${row
                            .map(
                                (cell) =>
                                    `<td>${String(
                                        cell ??
                                        ""
                                    )
                                        .replace(
                                            /&/g,
                                            "&amp;"
                                        )
                                        .replace(
                                            /</g,
                                            "&lt;"
                                        )
                                        .replace(
                                            />/g,
                                            "&gt;"
                                        )}</td>`
                            )
                            .join("")}
                        </tr>
                    `
                )
                .join("");

        const excelHtml = `
            <html>
                <head>
                    <meta charset="UTF-8" />
                </head>
                <body>
                    <table border="1">
                        ${tableRows}
                    </table>
                </body>
            </html>
        `;

        const blob =
            new Blob(
                [excelHtml],
                {
                    type:
                        "application/vnd.ms-excel;charset=utf-8;",
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href = url;

        link.download =
            `Month-on-Month-OPEX-${periodName || "Report"}.xls`;

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );

        URL.revokeObjectURL(
            url
        );
    };

    /* =====================================================
       EXPORT PDF

       Opens print dialog with all Jan-Dec columns.
    ===================================================== */

    const handleExportPDF = () => {
        setShowExportMenu(false);

        const exportRows =
            buildExportRows();

        const tableRows =
            exportRows
                .map(
                    (row, rowIndex) => {
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
                                    (cell) =>
                                        `<td ${isHeader
                                            ? 'style="font-weight:700;background:#f1f5f9;"'
                                            : ""
                                        }>${String(
                                            cell ??
                                            ""
                                        )
                                            .replace(
                                                /&/g,
                                                "&amp;"
                                            )
                                            .replace(
                                                /</g,
                                                "&lt;"
                                            )
                                            .replace(
                                                />/g,
                                                "&gt;"
                                            )}</td>`
                                )
                                .join("")}
                            </tr>
                        `;
                    }
                )
                .join("");

        const printWindow =
            window.open(
                "",
                "_blank",
                "width=1400,height=900"
            );

        if (!printWindow) {
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
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
                            font-family:
                                Arial,
                                sans-serif;
                            margin: 0;
                            padding: 20px;
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
                            font-size: 9px;
                        }

                        th,
                        td {
                            border: 1px solid #dbe2ea;
                            padding: 6px;
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
        `);

        printWindow.document.close();

        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
        }, 300);
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
                        /*
                         * IMPORTANT:
                         * Fixed minimum width prevents
                         * AED values from overwriting.
                         */
                        minWidth: 2220,
                        borderCollapse:
                            "collapse",
                        tableLayout:
                            "fixed",
                    }}
                >
                    <colgroup>
                        {/* CATEGORY */}

                        <col
                            style={{
                                width: 270,
                            }}
                        />

                        {/* JAN - DEC */}

                        {months.map(
                            (month) => (
                                <col
                                    key={
                                        month.key
                                    }
                                    style={{
                                        width: 115,
                                    }}
                                />
                            )
                        )}

                        {/* YTD / TARGET / VARIANCE */}

                        <col
                            style={{
                                width: 145,
                            }}
                        />

                        <col
                            style={{
                                width: 145,
                            }}
                        />

                        <col
                            style={{
                                width: 145,
                            }}
                        />

                        <col
                            style={{
                                width: 150,
                            }}
                        />
                    </colgroup>

                    {/* =================================================
                        HEADER
                    ================================================= */}

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
                                    fontSize: 12,
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
                                            fontSize: 12,
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
                                    fontSize: 12,
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
                                    fontSize: 12,
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
                                    fontSize: 12,
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
                                    fontSize: 12,
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

                    {/* =================================================
                        BODY
                    ================================================= */}

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

                                const details =
                                    getDetails(
                                        categoryDetails[
                                        rowKey
                                        ]
                                    );

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
                                        {/* =================================
                                            CATEGORY ROW
                                        ================================= */}

                                        <tr
                                            style={{
                                                minHeight:
                                                    58,
                                                height: 58,
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
                                                    fontSize: 13,
                                                    lineHeight:
                                                        "18px",
                                                    fontWeight: 500,
                                                    color:
                                                        "#334155",
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
                                                            "inherit",
                                                        width:
                                                            "100%",
                                                        textAlign:
                                                            "left",
                                                    }}
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown
                                                            size={
                                                                14
                                                            }
                                                            strokeWidth={
                                                                1.8
                                                            }
                                                            color="#64748B"
                                                        />
                                                    ) : (
                                                        <ChevronRight
                                                            size={
                                                                14
                                                            }
                                                            strokeWidth={
                                                                1.8
                                                            }
                                                            color="#64748B"
                                                        />
                                                    )}

                                                    <span
                                                        style={{
                                                            fontSize: 13,
                                                            lineHeight:
                                                                "18px",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {
                                                            item?.category
                                                        }
                                                    </span>
                                                </button>
                                            </td>

                                            {/* =================================
                                                JAN - DEC
                                            ================================= */}

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
                                                                fontSize: 12,
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

                                            {/* ACTUAL YTD */}

                                            <td
                                                style={{
                                                    padding:
                                                        "0 10px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 12,
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

                                            {/* TARGET */}

                                            <td
                                                style={{
                                                    padding:
                                                        "0 10px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 12,
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

                                            {/* VARIANCE */}

                                            <td
                                                style={{
                                                    padding:
                                                        "0 10px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 12,
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

                                            {/* VARIANCE % */}

                                            <td
                                                style={{
                                                    padding:
                                                        "0 10px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 12,
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

                                        {/* =================================
                                            EXPANDED NATURAL ACCOUNT DETAILS
                                        ================================= */}

                                        {isExpanded && (
                                            <tr
                                                style={{
                                                    background:
                                                        "#FAFAFC",
                                                }}
                                            >
                                                <td
                                                    colSpan={
                                                        months.length +
                                                        5
                                                    }
                                                    style={{
                                                        padding:
                                                            "16px 30px",
                                                    }}
                                                >
                                                    {isLoading ? (
                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                lineHeight:
                                                                    "18px",
                                                                color:
                                                                    "#94A3B8",
                                                            }}
                                                        >
                                                            Loading
                                                            natural-account
                                                            details...
                                                        </div>
                                                    ) : error ? (
                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                lineHeight:
                                                                    "18px",
                                                                color:
                                                                    "#DC2626",
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
                                                                fontSize: 12,
                                                                lineHeight:
                                                                    "18px",
                                                                color:
                                                                    "#94A3B8",
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
                                                            {/* DETAIL TITLE */}

                                                            <div
                                                                style={{
                                                                    fontSize: 12,
                                                                    lineHeight:
                                                                        "18px",
                                                                    fontWeight: 700,
                                                                    color:
                                                                        "#0F172A",
                                                                    marginBottom:
                                                                        10,
                                                                }}
                                                            >
                                                                Natural-account
                                                                details
                                                                for{" "}
                                                                {
                                                                    item?.category
                                                                }
                                                            </div>

                                                            {/* =========================================
                                                                NATURAL ACCOUNT TABLE

                                                                FIXED WIDTHS:
                                                                Prevent AED values from
                                                                overlapping.

                                                                12 months ALWAYS rendered.
                                                            ========================================= */}

                                                            <table
                                                                style={{
                                                                    width: 2120,
                                                                    minWidth: 2120,
                                                                    maxWidth: "none",
                                                                    borderCollapse:
                                                                        "collapse",
                                                                    tableLayout:
                                                                        "fixed",
                                                                }}
                                                            >
                                                                <colgroup>
                                                                    {/* NATURAL ACCOUNT */}

                                                                    <col
                                                                        style={{
                                                                            width: 380,
                                                                        }}
                                                                    />

                                                                    {/* JAN - DEC */}

                                                                    {months.map(
                                                                        (
                                                                            month
                                                                        ) => (
                                                                            <col
                                                                                key={
                                                                                    month.key
                                                                                }
                                                                                style={{
                                                                                    width: 130,
                                                                                }}
                                                                            />
                                                                        )
                                                                    )}

                                                                    {/* ACTUAL YTD */}

                                                                    <col
                                                                        style={{
                                                                            width: 180,
                                                                        }}
                                                                    />
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
                                                                                    "0 9px",
                                                                                textAlign:
                                                                                    "left",
                                                                                color:
                                                                                    "#1E3A8A",
                                                                                fontSize: 11,
                                                                                lineHeight:
                                                                                    "16px",
                                                                                fontWeight: 700,
                                                                            }}
                                                                        >
                                                                            Natural
                                                                            Account
                                                                        </th>

                                                                        {/* JAN - DEC */}

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
                                                                                            "0 9px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                        color:
                                                                                            "#1E3A8A",
                                                                                        fontSize: 11,
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
                                                                                    "0 9px",
                                                                                textAlign:
                                                                                    "right",
                                                                                color:
                                                                                    "#1E3A8A",
                                                                                fontSize: 11,
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
                                                                                    {/* NATURAL ACCOUNT */}

                                                                                    <td
                                                                                        style={{
                                                                                            padding:
                                                                                                "0 9px",
                                                                                            textAlign:
                                                                                                "left",
                                                                                            fontSize: 11,
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

                                                                                    {/* =================================
                                                                                        JAN - DEC

                                                                                        ALWAYS SHOW ALL MONTHS.

                                                                                        Backend missing:
                                                                                        —
                                                                                    ================================= */}

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
                                                                                                            "0 9px",
                                                                                                        textAlign:
                                                                                                            "right",
                                                                                                        fontSize: 11,
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

                                                                                    {/* ACCOUNT YTD */}

                                                                                    <td
                                                                                        style={{
                                                                                            padding:
                                                                                                "0 9px",
                                                                                            textAlign:
                                                                                                "right",
                                                                                            fontSize: 11,
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

                        {/* =============================================
                            TOTAL OPERATING EXPENSES
                        ============================================= */}

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
                                    fontSize: 13,
                                    lineHeight:
                                        "18px",
                                    fontWeight: 700,
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
                                    <ChevronRight
                                        size={
                                            14
                                        }
                                        strokeWidth={
                                            1.8
                                        }
                                        color="#64748B"
                                    />

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
                                                fontSize: 12,
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
                                    fontSize: 12,
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
                                    fontSize: 12,
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
                                    fontSize: 12,
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
                                    fontSize: 12,
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
                {/* =================================================
                    HEADER
                ================================================= */}

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
                        {/* =============================================
                            COLLAPSE
                        ============================================= */}

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

                        {/* =============================================
                            THREE DOT MENU
                        ============================================= */}
                        {/* =============================================
    THREE DOT MENU
============================================= */}
                        <div
                            ref={exportMenuRef}
                            style={{
                                position: "relative",
                                zIndex: 100000,
                            }}
                        >
                            <button
                                type="button"
                                aria-label="More options"
                                onClick={() =>
                                    setShowExportMenu((prev) => !prev)
                                }
                                style={{
                                    width: 32,
                                    height: 32,
                                    padding: 0,
                                    border: "none",
                                    borderRadius: 7,
                                    background: "#EEF4FB",
                                    color: "#64748B",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                }}
                            >
                                <MoreVertical
                                    size={18}
                                    strokeWidth={2}
                                />
                            </button>

                            {showExportMenu && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 36,
                                        right: 0,
                                        width: 160,
                                        background: "#FFFFFF",
                                        border: "1px solid #E2E8F0",
                                        borderRadius: 9,
                                        boxShadow:
                                            "0 8px 20px rgba(15, 23, 42, 0.14)",
                                        zIndex: 100001,
                                        overflow: "hidden",
                                    }}
                                >
                                    {/* VIEW ALL */}
                                    <button
                                        type="button"
                                        onClick={handleViewAll}
                                        style={{
                                            width: "100%",
                                            height: 40,
                                            padding: "0 12px",
                                            border: "none",
                                            borderBottom:
                                                "1px solid #E5E7EB",
                                            background: "#FFFFFF",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            color: "#475569",
                                            fontSize: 12,
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}
                                    >
                                        <Search
                                            size={15}
                                            strokeWidth={1.8}
                                            color="#64748B"
                                        />

                                        <span>View All</span>
                                    </button>

                                    {/* EXPORT EXCEL */}
                                    <button
                                        type="button"
                                        onClick={handleExportExcel}
                                        style={{
                                            width: "100%",
                                            height: 40,
                                            padding: "0 12px",
                                            border: "none",
                                            borderBottom:
                                                "1px solid #E5E7EB",
                                            background: "#FFFFFF",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            color: "#475569",
                                            fontSize: 12,
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}
                                    >
                                        <FileSpreadsheet
                                            size={15}
                                            strokeWidth={1.8}
                                            color="#64748B"
                                        />

                                        <span>Export Excel</span>
                                    </button>

                                    {/* EXPORT PDF */}
                                    <button
                                        type="button"
                                        onClick={handleExportPDF}
                                        style={{
                                            width: "100%",
                                            height: 40,
                                            padding: "0 12px",
                                            border: "none",
                                            background: "#FFFFFF",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            color: "#475569",
                                            fontSize: 12,
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}
                                    >
                                        <FileText
                                            size={15}
                                            strokeWidth={1.8}
                                            color="#64748B"
                                        />

                                        <span>Export PDF</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* =============================================
                            AED
                        ============================================= */}

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

                        {/* =============================================
                            AED MILLIONS
                        ============================================= */}

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
                            {/* ==========================================
                            MODAL HEADER
                        ========================================== */}

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

                                <div
                                    style={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        gap: 8,
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={
                                            handleExportExcel
                                        }
                                        style={{
                                            height: 32,
                                            padding:
                                                "0 12px",
                                            borderRadius:
                                                6,
                                            border:
                                                "1px solid #E2E8F0",
                                            background:
                                                "#FFFFFF",
                                            color:
                                                "#334155",
                                            fontSize: 11,
                                            fontWeight: 600,
                                            cursor:
                                                "pointer",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap: 6,
                                        }}
                                    >
                                        <FileSpreadsheet
                                            size={
                                                14
                                            }
                                        />

                                        Export Excel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            handleExportPDF
                                        }
                                        style={{
                                            height: 32,
                                            padding:
                                                "0 12px",
                                            borderRadius:
                                                6,
                                            border:
                                                "1px solid #E2E8F0",
                                            background:
                                                "#FFFFFF",
                                            color:
                                                "#334155",
                                            fontSize: 11,
                                            fontWeight: 600,
                                            cursor:
                                                "pointer",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap: 6,
                                        }}
                                    >
                                        <FileText
                                            size={
                                                14
                                            }
                                        />

                                        Export PDF
                                    </button>

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
                            </div>

                            {/* ==========================================
                            ACTIVE FILTERS
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
                                    gap: 8,
                                    flexWrap:
                                        "wrap",
                                }}
                            >
                                {filterEntries.length >
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
                                                        "5px 9px",
                                                    borderRadius:
                                                        5,
                                                    background:
                                                        "#FFFFFF",
                                                    border:
                                                        "1px solid #E2E8F0",
                                                    fontSize: 10,
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
                                                    {key}:
                                                </span>

                                                <span>
                                                    {Array.isArray(
                                                        value
                                                    )
                                                        ? value.join(
                                                            ", "
                                                        )
                                                        : String(
                                                            value
                                                        )}
                                                </span>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <span
                                        style={{
                                            fontSize: 10,
                                            color:
                                                "#64748B",
                                        }}
                                    >
                                        No additional hierarchy
                                        filters selected
                                    </span>
                                )}
                            </div>

                            {/* ==========================================
                            VIEW ALL TABLE
                        ========================================== */}

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
                                    rows,
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