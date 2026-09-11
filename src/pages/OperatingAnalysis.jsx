
import React, { useEffect, useState, } from "react";

import ExportButtons from "../components/Common/ExportButtons";
import PageHeader from "../components/Common/PageHeader";
import FooterNote from "../components/FooterNote";
import Filters from "../components/Filters/Filters";

import ActualVsTargetChart from "../components/Charts/ActualvsTargetChart";
import OpexCompositionChart from "../components/Charts/OpexCompositionChart";

import ExpenseCategoryDrillDown from "../components/Tables/ExpenseCategoryDrillDown";
import MonthOnMonthOpexReport from "../components/Tables/MonthOnMonthOpexReport";

import OperatingExpenseSummary from "../components/Cards/OperatingExpenseSummary";

import OperatingAnalysisViewAllModal from "../components/Modals/OperatingAnalysisViewAllModal";
import ExpenseCategoryDrillDownModal from "../components/Modals/ExpenseCategoryDrillDownModal";

import {
    getOpexFilterOptions,
    getOpexSummary,
    getOpexCategoryComparison,
    getOpexComposition,
    getOpexCategoryBreakdown,
    getOpexMonthly,
    getOpexCategoryDetail,
    getOpexCategoryDetailMonthly,
    getOpexCompositionViewAll,
    getOpexCategoryBreakdownViewAll,
    exportOpexComposition,
    exportOpexCategoryComparison,
    exportOpexCategoryBreakdown, getOpexReconciliation, exportOpexFullReport,
} from "../api/opexApi";

/* =========================================================
   GET OPTION VALUE
========================================================= */

const getOptionValue = (option) => {
    if (
        option === null ||
        option === undefined
    ) {
        return "";
    }

    if (
        typeof option === "object"
    ) {
        return (
            option.value ??
            option.id ??
            option.code ??
            option.period_name ??
            option.name ??
            ""
        );
    }

    return option;
};

/* =========================================================
   GET LATEST PERIOD
========================================================= */

const getLatestPeriod = (
    periods = []
) => {
    if (
        !Array.isArray(periods) ||
        periods.length === 0
    ) {
        return "";
    }

    return getOptionValue(
        periods[periods.length - 1]
    );
};

/* =========================================================
   PERIOD VALUE HELPER

   Period is a multi-select filter, so it is stored
   internally as an array.
========================================================= */

const getPeriodDisplayValue = (
    period
) => {
    if (Array.isArray(period)) {
        return period.join(", ");
    }

    return period || "";
};

/* =========================================================
   BUILD API FILTERS
========================================================= */

const buildApiFilters = (
    selectedFilters = {}
) => {
    return {
        year:
            selectedFilters.year ||
            undefined,

        legal_group_id:
            selectedFilters.legal_group ||
            undefined,

        legal_entity_id:
            selectedFilters.legal_entity ||
            undefined,

        parent_division_id:
            selectedFilters.parent_division ||
            undefined,

        subdivision_id:
            selectedFilters.subdivision ||
            undefined,

        period_name:
            selectedFilters.period ||
            undefined,

        compare_period_name:
            selectedFilters.compare_with ||
            undefined,

        reporting_currency:
            selectedFilters.reporting_currency ||
            "AED",
    };
};

/* =========================================================
   DOWNLOAD BLOB
========================================================= */

const downloadBlob = (
    response,
    fileName
) => {
    if (!response) {
        return;
    }

    const blob =
        response?.data instanceof Blob
            ? response.data
            : response instanceof Blob
                ? response
                : new Blob([
                    response?.data ??
                    response,
                ]);

    const url =
        window.URL.createObjectURL(
            blob
        );

    const link =
        document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
};

/* =========================================================
   GET DOWNLOAD FILE NAME
========================================================= */

const getDownloadFileName = (
    response,
    fallback
) => {
    const disposition =
        response?.headers?.[
        "content-disposition"
        ];

    if (disposition) {
        const match =
            disposition.match(
                /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i
            );

        if (match?.[1]) {
            return decodeURIComponent(
                match[1]
            );
        }
    }

    return fallback;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function OperatingAnalysis() {

    /* =====================================================
       DATA AS OF
    ===================================================== */

    const [
        dataAsOf,
        setDataAsOf,
    ] = useState(null);

    /* =====================================================
       CURRENT MONTH PARTIAL
    ===================================================== */

    const [
        currentMonthPartial,
    ] = useState(true);

    /* =====================================================
       FILTER OPTIONS
    ===================================================== */

    const [
        filterOptions,
        setFilterOptions,
    ] = useState({
        as_on_dates: [],
        currencies: [],
        legal_groups: [],
        legal_entities: [],
        parent_divisions: [],
        subdivisions: [],
        periods: [],
        compare_with: [],
        years: [],
        default_reporting_currency:
            "AED",
    });

    const [
        viewAllType,
        setViewAllType,
    ] = useState(null);

    /* =====================================================
       SUMMARY
    ===================================================== */

    const [
        summaryData,
        setSummaryData,
    ] = useState({
        actualPTD: null,
        targetPTD: null,
        variancePTD: null,
        variancePTDPercent: null,

        actualYTD: null,
        targetYTD: null,
        varianceYTD: null,
        varianceYTDPercent: null,
    });

    /* =====================================================
       DASHBOARD DATA
    ===================================================== */

    const [
        actualVsTargetData,
        setActualVsTargetData,
    ] = useState([]);

    const [
        opexCompositionData,
        setOpexCompositionData,
    ] = useState([]);

    const [
        expenseCategoryDrilldownData,
        setExpenseCategoryDrilldownData,
    ] = useState([]);

    const [
        monthOnMonthOpexData,
        setMonthOnMonthOpexData,
    ] = useState([]);

    const [reconciliationData, setReconciliationData] = useState(null);

    /* =====================================================
       UI STATE
    ===================================================== */

    const [
        exporting,
        setExporting,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        dashboardLoading,
        setDashboardLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    /* =====================================================
       CATEGORY DETAIL
    ===================================================== */

    const [
        detailLoading,
        setDetailLoading,
    ] = useState({});

    /* =====================================================
       ACTIVE FILTERS
    ===================================================== */

    const [
        activeOpexFilters,
        setActiveOpexFilters,
    ] = useState({});

    /* =====================================================
       VIEW ALL STATE
    ===================================================== */

    const [
        compositionViewAllData,
        setCompositionViewAllData,
    ] = useState([]);

    const [
        compositionViewAllOpen,
        setCompositionViewAllOpen,
    ] = useState(false);

    const [
        compositionViewAllLoading,
        setCompositionViewAllLoading,
    ] = useState(false);

    const [
        viewAllAppliedFilters,
        setViewAllAppliedFilters,
    ] = useState({});

    const [monthOnMonthViewAllData, setMonthOnMonthViewAllData] = useState([]);
    const [monthOnMonthViewAllLoading, setMonthOnMonthViewAllLoading] = useState(false);

    /* =====================================================
       ACTIVE API FILTERS

       Same filter object used by:
       - Dashboard APIs
       - View All API
       - Excel export
       - PDF export
       - Category detail API
    ===================================================== */

    const compositionApiFilters =
        buildApiFilters(
            activeOpexFilters
        );

    /* =====================================================
       COMMON EXPORT

       Common export function used by:
       - PageHeader ExportButtons
       - Actual Vs Target chart buttons
       - OPEX Composition chart buttons
    ===================================================== */

    const handleExport = async (
        type,
        format
    ) => {

        const hasSelectedPeriod =
            Array.isArray(
                activeOpexFilters?.period
            )
                ? activeOpexFilters.period.length > 0
                : Boolean(
                    activeOpexFilters?.period
                );

        if (!hasSelectedPeriod) {
            setError(
                "Please select a Period before exporting."
            );
            return;
        }

        try {
            setError("");

            setExporting(format);

            const response =
                type === "actual-vs-target"
                    ? await exportOpexCategoryComparison(
                        compositionApiFilters,
                        format
                    )
                    : await exportOpexComposition(
                        compositionApiFilters,
                        format
                    );

            const extension =
                format === "excel"
                    ? "xlsx"
                    : "pdf";

            const sectionName =
                type === "actual-vs-target"
                    ? "Actual-vs-Target"
                    : "OPEX-Composition";

            const periodForFileName =
                getPeriodDisplayValue(
                    activeOpexFilters?.period
                ).replace(
                    /,\s*/g,
                    "-"
                );

            const fallbackName =
                `${sectionName}-${periodForFileName}.${extension}`;

            const fileName =
                getDownloadFileName(
                    response,
                    fallbackName
                );

            downloadBlob(
                response,
                fileName
            );

        } catch (error) {

            console.error(
                `Failed to export ${type} to ${format}:`,
                error
            );

            setError(
                error?.message ||
                `Failed to export ${type} to ${format.toUpperCase()}.`
            );

        } finally {
            setExporting("");
        }
    };


    /* =====================================================
   COMPLETE OPEX PAGE EXPORT

   Header Excel / PDF buttons use this function.

   IMPORTANT:
   This exports the COMPLETE OPEX report from backend,
   not OPEX Composition only.
===================================================== */

    const handleFullOpexExport = async (format) => {
        const hasSelectedPeriod =
            Array.isArray(activeOpexFilters?.period)
                ? activeOpexFilters.period.length > 0
                : Boolean(activeOpexFilters?.period);

        if (!hasSelectedPeriod) {
            setError(
                "Please select a Period before exporting."
            );
            return;
        }

        try {
            setError("");

            setExporting(
                `full-opex-${format}`
            );

            const response =
                await exportOpexFullReport(
                    compositionApiFilters,
                    format
                );

            const extension =
                format === "excel"
                    ? "xlsx"
                    : "pdf";

            const periodForFileName =
                getPeriodDisplayValue(
                    activeOpexFilters?.period
                ).replace(
                    /,\s*/g,
                    "-"
                );

            const fallbackName =
                `Operating-Expenses-Analysis-${periodForFileName}.${extension}`;

            const fileName =
                getDownloadFileName(
                    response,
                    fallbackName
                );

            downloadBlob(
                response,
                fileName
            );

        } catch (error) {
            console.error(
                `Failed to export complete OPEX report to ${format}:`,
                error
            );

            setError(
                error?.message ||
                `Failed to export complete OPEX report to ${format.toUpperCase()}.`
            );

        } finally {
            setExporting("");
        }
    };

    /* =====================================================
       EXPENSE CATEGORY DETAIL

       Used by:
       - Expense Category Drill-Down
       - Composition drill-down
    ===================================================== */

    const handleExpandCategory =
        async (item) => {

            const category =
                typeof item === "string"
                    ? item
                    : item?.category;

            if (!category) {
                return;
            }

            const existingDetails =
                item?.categoryDetails ||
                item?.naturalAccounts ||
                item?.details;

            if (
                Array.isArray(
                    existingDetails
                )
            ) {
                return;
            }

            try {

                setDetailLoading(
                    (prev) => ({
                        ...prev,
                        [category]: true,
                    })
                );

                const apiFilters =
                    buildApiFilters(
                        activeOpexFilters
                    );

                const response =
                    await getOpexCategoryDetail({
                        category,
                        item,
                        ...apiFilters,
                    });

                const details =
                    Array.isArray(response)
                        ? response
                        : response?.items ||
                        response?.accounts ||
                        response?.natural_accounts ||
                        response?.details ||
                        [];

                setExpenseCategoryDrilldownData(
                    (prev) =>
                        prev.map(
                            (row) =>
                                row?.category ===
                                    category
                                    ? {
                                        ...row,
                                        categoryDetails:
                                            details,
                                    }
                                    : row
                        )
                );

            } catch (error) {

                console.error(
                    `Failed to load category details for ${category}:`,
                    error
                );

                setError(
                    error?.message ||
                    `Failed to load details for ${category}.`
                );

            } finally {

                setDetailLoading(
                    (prev) => ({
                        ...prev,
                        [category]: false,
                    })
                );
            }
        };

    /* =====================================================
       MONTH-ON-MONTH CATEGORY DETAIL

       IMPORTANT:
       Month-on-Month uses the dedicated
       /opex/category-detail-monthly endpoint.
    ===================================================== */

    const handleExpandMonthlyCategory =
        async (item) => {

            const category =
                typeof item === "string"
                    ? item
                    : item?.category;

            if (!category) {
                return [];
            }

            try {

                setDetailLoading(
                    (prev) => ({
                        ...prev,
                        [`monthly-${category}`]: true,
                    })
                );

                const apiFilters =
                    buildApiFilters(
                        activeOpexFilters
                    );

                const response =
                    await getOpexCategoryDetailMonthly({
                        ...apiFilters,
                        category,
                        item,
                    });

                const details =
                    Array.isArray(response)
                        ? response
                        : response?.items ||
                        response?.accounts ||
                        response?.natural_accounts ||
                        response?.details ||
                        response?.data ||
                        [];

                return details;

            } catch (error) {

                console.error(
                    `Failed to load monthly details for ${category}:`,
                    error
                );

                setError(
                    error?.message ||
                    `Failed to load monthly details for ${category}.`
                );

                return [];

            } finally {

                setDetailLoading(
                    (prev) => ({
                        ...prev,
                        [`monthly-${category}`]: false,
                    })
                );
            }
        };

    /* =====================================================
       COMPOSITION DRILL DOWN
    ===================================================== */

    const handleCompositionDrillDown =
        (item) => {

            const category =
                item?.name ||
                item?.category;

            if (!category) {
                return;
            }

            handleExpandCategory({
                category,
            });
        };

    /* =====================================================
       VIEW ALL - OPEX COMPOSITION
    ===================================================== */

    const handleCompositionViewAll =
        async () => {

            const hasSelectedPeriod =
                Array.isArray(
                    activeOpexFilters?.period
                )
                    ? activeOpexFilters.period.length > 0
                    : Boolean(
                        activeOpexFilters?.period
                    );

            if (!hasSelectedPeriod) {
                setError(
                    "Please select a Period before opening View All."
                );
                return;
            }

            try {

                setError("");

                setCompositionViewAllLoading(
                    true
                );

                const response =
                    await getOpexCompositionViewAll(
                        compositionApiFilters
                    );

                const rows =
                    Array.isArray(response)
                        ? response
                        : response?.items ||
                        response?.categories ||
                        response?.data ||
                        [];

                setCompositionViewAllData(
                    rows
                );

                setViewAllAppliedFilters(
                    activeOpexFilters
                );

                setViewAllType(
                    "composition"
                );

                setCompositionViewAllOpen(
                    true
                );
            } catch (error) {

                console.error(
                    "Failed to load OPEX Composition View All:",
                    error
                );

                setError(
                    error?.message ||
                    "Failed to load OPEX Composition View All."
                );

            } finally {

                setCompositionViewAllLoading(
                    false
                );
            }
        };

    /* =====================================================
       ACTUAL VS TARGET VIEW ALL

       Uses the same category-comparison API
       as the chart.
    ===================================================== */

    const handleActualVsTargetViewAll =
        async () => {

            const hasSelectedPeriod =
                Array.isArray(
                    activeOpexFilters?.period
                )
                    ? activeOpexFilters.period.length > 0
                    : Boolean(
                        activeOpexFilters?.period
                    );

            if (!hasSelectedPeriod) {
                setError(
                    "Please select a Period before opening View All."
                );
                return;
            }

            try {

                setError("");

                setCompositionViewAllLoading(
                    true
                );

                const response =
                    await getOpexCategoryComparison(
                        compositionApiFilters
                    );

                const rows =
                    Array.isArray(response)
                        ? response
                        : Array.isArray(
                            response?.items
                        )
                            ? response.items
                            : Array.isArray(
                                response?.categories
                            )
                                ? response.categories
                                : Array.isArray(
                                    response?.data
                                )
                                    ? response.data
                                    : Array.isArray(
                                        response?.results
                                    )
                                        ? response.results
                                        : [];

                const normalizedRows =
                    rows.map(
                        (item) => ({
                            category:
                                item?.category ??
                                "",

                            actual:
                                item?.actual_ptd_aed ??
                                item?.actual_ptd ??
                                null,

                            target:
                                item?.target_ptd_aed ??
                                item?.target_ptd ??
                                null,

                            variance:
                                item?.variance_ptd_aed ??
                                item?.variance_ptd ??
                                null,

                            variance_pct:
                                item?.variance_ptd_pct ??
                                null,

                            actual_ptd_aed:
                                item?.actual_ptd_aed ??
                                null,

                            target_ptd_aed:
                                item?.target_ptd_aed ??
                                null,

                            variance_ptd_aed:
                                item?.variance_ptd_aed ??
                                null,

                            variance_ptd_pct:
                                item?.variance_ptd_pct ??
                                null,

                            reporting_currency:
                                item?.reporting_currency ??
                                activeOpexFilters?.reporting_currency ??
                                "AED",
                        })
                    );

                setCompositionViewAllData(
                    normalizedRows
                );

                setViewAllAppliedFilters(
                    activeOpexFilters
                );

                setViewAllType(
                    "actual-vs-target"
                );

                setCompositionViewAllOpen(
                    true
                );

            } catch (error) {

                console.error(
                    "Failed to load Actual vs Target View All:",
                    error
                );

                setError(
                    error?.message ||
                    "Failed to load Actual vs Target View All."
                );

            } finally {

                setCompositionViewAllLoading(
                    false
                );
            }
        };

    /* =====================================================
       EXPENSE CATEGORY DRILL-DOWN VIEW ALL

       GET:
       /api/opex/category-breakdown/view-all
    ===================================================== */

    const handleExpenseCategoryViewAll =
        async () => {

            const hasSelectedPeriod =
                Array.isArray(
                    activeOpexFilters?.period
                )
                    ? activeOpexFilters.period.length > 0
                    : Boolean(
                        activeOpexFilters?.period
                    );

            if (!hasSelectedPeriod) {
                setError(
                    "Please select a Period before opening View All."
                );
                return;
            }

            try {

                setError("");

                setCompositionViewAllLoading(
                    true
                );

                const response =
                    await getOpexCategoryBreakdownViewAll(
                        compositionApiFilters
                    );

                const rows =
                    Array.isArray(response)
                        ? response
                        : response?.items ||
                        response?.categories ||
                        response?.data ||
                        response?.results ||
                        [];

                setCompositionViewAllData(
                    rows
                );

                setViewAllAppliedFilters(
                    activeOpexFilters
                );

                setViewAllType(
                    "expense-category"
                );

                setCompositionViewAllOpen(
                    true
                );

            } catch (error) {

                console.error(
                    "Failed to load Expense Category Drill-Down View All:",
                    error
                );

                setError(
                    error?.message ||
                    "Failed to load Expense Category Drill-Down View All."
                );

            } finally {

                setCompositionViewAllLoading(
                    false
                );
            }
        };


    /* =========================================================
APPLY VIEW ALL FILTERS

Filters changed inside View All are sent back here.

IMPORTANT:
These filters do NOT change the main dashboard filters.
Only the View All API is refreshed.
========================================================= */

    const handleApplyViewAllFilters = async (
        selectedFilters
    ) => {
        try {
            setError("");
            setCompositionViewAllLoading(true);

            /* ---------------------------------------------
               NORMALIZE VIEW ALL FILTERS
            --------------------------------------------- */

            const normalizedFilters = {
                ...selectedFilters,

                year: Array.isArray(selectedFilters?.year)
                    ? selectedFilters.year
                    : selectedFilters?.year
                        ? [selectedFilters.year]
                        : [],

                legal_group: Array.isArray(
                    selectedFilters?.legal_group
                )
                    ? selectedFilters.legal_group
                    : selectedFilters?.legal_group
                        ? [selectedFilters.legal_group]
                        : [],

                legal_entity: Array.isArray(
                    selectedFilters?.legal_entity
                )
                    ? selectedFilters.legal_entity
                    : selectedFilters?.legal_entity
                        ? [selectedFilters.legal_entity]
                        : [],

                parent_division: Array.isArray(
                    selectedFilters?.parent_division
                )
                    ? selectedFilters.parent_division
                    : selectedFilters?.parent_division
                        ? [selectedFilters.parent_division]
                        : [],

                subdivision: Array.isArray(
                    selectedFilters?.subdivision
                )
                    ? selectedFilters.subdivision
                    : selectedFilters?.subdivision
                        ? [selectedFilters.subdivision]
                        : [],

                period: Array.isArray(
                    selectedFilters?.period
                )
                    ? selectedFilters.period
                    : selectedFilters?.period
                        ? [String(selectedFilters.period)]
                        : [],

                reporting_currency:
                    selectedFilters?.reporting_currency ||
                    activeOpexFilters?.reporting_currency ||
                    "AED",
            };

            /* ---------------------------------------------
               PERIOD VALIDATION
            --------------------------------------------- */

            if (
                !Array.isArray(normalizedFilters.period) ||
                normalizedFilters.period.length === 0
            ) {
                setError(
                    "Please select at least one Period."
                );

                return;
            }

            /* ---------------------------------------------
               SAVE VIEW ALL FILTERS
            --------------------------------------------- */

            setViewAllAppliedFilters(
                normalizedFilters
            );

            /* ---------------------------------------------
               BUILD API FILTERS
            --------------------------------------------- */

            const apiFilters =
                buildApiFilters(
                    normalizedFilters
                );

            let response;

            /* ---------------------------------------------
               CALL API BASED ON VIEW TYPE
            --------------------------------------------- */

            if (
                viewAllType === "composition"
            ) {
                response =
                    await getOpexCompositionViewAll(
                        apiFilters
                    );

            } else if (
                viewAllType === "actual-vs-target"
            ) {
                response =
                    await getOpexCategoryComparison(
                        apiFilters
                    );

            } else if (
                viewAllType === "expense-category"
            ) {
                response =
                    await getOpexCategoryBreakdownViewAll(
                        apiFilters
                    );

            } else {
                return;
            }

            /* ---------------------------------------------
               NORMALIZE RESPONSE
            --------------------------------------------- */

            const rows =
                Array.isArray(response)
                    ? response
                    : response?.items ||
                    response?.categories ||
                    response?.data ||
                    response?.results ||
                    [];

            /* ---------------------------------------------
               ACTUAL VS TARGET NORMALIZATION
            --------------------------------------------- */

            if (
                viewAllType ===
                "actual-vs-target"
            ) {
                const normalizedRows =
                    rows.map(
                        (item) => ({
                            category:
                                item?.category ?? "",

                            actual:
                                item?.actual_ptd_aed ??
                                item?.actual_ptd ??
                                null,

                            target:
                                item?.target_ptd_aed ??
                                item?.target_ptd ??
                                null,

                            variance:
                                item?.variance_ptd_aed ??
                                item?.variance_ptd ??
                                null,

                            variance_pct:
                                item?.variance_ptd_pct ??
                                null,

                            actual_ptd_aed:
                                item?.actual_ptd_aed ??
                                null,

                            target_ptd_aed:
                                item?.target_ptd_aed ??
                                null,

                            variance_ptd_aed:
                                item?.variance_ptd_aed ??
                                null,

                            variance_ptd_pct:
                                item?.variance_ptd_pct ??
                                null,

                            reporting_currency:
                                item?.reporting_currency ??
                                normalizedFilters.reporting_currency ??
                                "AED",
                        })
                    );

                setCompositionViewAllData(
                    normalizedRows
                );

            } else {
                setCompositionViewAllData(
                    rows
                );
            }

        } catch (error) {
            console.error(
                "Failed to apply View All filters:",
                error
            );

            setError(
                error?.message ||
                "Failed to refresh View All data."
            );

        } finally {
            setCompositionViewAllLoading(
                false
            );
        }
    };


    // FIX: View All Apply filter mapping
    // FIX: Apply View All filters and update ONLY Month-on-Month View All data
    const handleMonthOnMonthViewAllFilters = async (filters) => {
        try {
            setMonthOnMonthViewAllLoading(true);

            const apiFilters = {
                year: Array.isArray(filters?.year)
                    ? filters.year
                    : filters?.year
                        ? [filters.year]
                        : [],

                legal_entity_id: Array.isArray(filters?.legal_entity)
                    ? filters.legal_entity
                    : filters?.legal_entity
                        ? [filters.legal_entity]
                        : [],

                parent_division_id: Array.isArray(filters?.parent_division)
                    ? filters.parent_division
                    : filters?.parent_division
                        ? [filters.parent_division]
                        : [],

                subdivision_id: Array.isArray(filters?.subdivision)
                    ? filters.subdivision
                    : filters?.subdivision
                        ? [filters.subdivision]
                        : [],

                period_name: Array.isArray(filters?.period)
                    ? filters.period
                    : filters?.period
                        ? [filters.period]
                        : [],

                reporting_currency:
                    activeOpexFilters?.reporting_currency || "AED",
            };

            // FIX: Backend requires at least one period
            if (!apiFilters.period_name.length) {
                console.warn(
                    "Month-on-Month View All requires at least one period_name."
                );
                return;
            }

            console.log(
                "Month-on-Month View All APPLY:",
                apiFilters
            );

            const response = await getOpexMonthly(apiFilters);

            console.log(
                "Month-on-Month View All RESPONSE:",
                response
            );

            // FIX: Normalize the API response before updating View All data
            const filteredData =
                Array.isArray(response)
                    ? response
                    : Array.isArray(response?.data)
                        ? response.data
                        : Array.isArray(response?.items)
                            ? response.items
                            : [];

            console.log(
                "Month-on-Month View All FILTERED DATA:",
                filteredData
            );

            // FIX: This is the data rendered by View All
            setMonthOnMonthViewAllData(filteredData);

        } catch (error) {
            console.error(
                "Failed to load Month-on-Month View All:",
                error
            );
        } finally {
            setMonthOnMonthViewAllLoading(false);
        }
    };
    /* =====================================================
       ACTUAL VS TARGET EXPORT
    ===================================================== */

    const handleActualVsTargetExportExcel =
        () =>
            handleExport(
                "actual-vs-target",
                "excel"
            );

    const handleActualVsTargetExportPdf =
        () =>
            handleExport(
                "actual-vs-target",
                "pdf"
            );

    /* =====================================================
       CLOSE VIEW ALL
    ===================================================== */

    const handleCloseViewAll = () => {

        setCompositionViewAllOpen(
            false
        );

        setCompositionViewAllData(
            []
        );

        setCompositionViewAllLoading(
            false
        );

        setViewAllAppliedFilters(
            {}
        );

        setViewAllType(null);
    };
    /* =====================================================
       OPEX COMPOSITION EXPORT
    ===================================================== */

    const handleCompositionExportExcel =
        () =>
            handleExport(
                "composition",
                "excel"
            );

    const handleCompositionExportPdf =
        () =>
            handleExport(
                "composition",
                "pdf"
            );

    /* =====================================================
       EXPENSE CATEGORY DRILL-DOWN EXPORT
    ===================================================== */

    const handleExpenseCategoryExport =
        async (format) => {

            const hasSelectedPeriod =
                Array.isArray(
                    activeOpexFilters?.period
                )
                    ? activeOpexFilters.period.length > 0
                    : Boolean(
                        activeOpexFilters?.period
                    );

            if (!hasSelectedPeriod) {
                setError(
                    "Please select a Period before exporting."
                );
                return;
            }

            try {

                setError("");

                setExporting(
                    `expense-category-${format}`
                );

                const response =
                    await exportOpexCategoryBreakdown(
                        compositionApiFilters,
                        format
                    );

                const extension =
                    format === "excel"
                        ? "xlsx"
                        : "pdf";

                const periodForFileName =
                    getPeriodDisplayValue(
                        activeOpexFilters?.period
                    ).replace(
                        /,\s*/g,
                        "-"
                    );

                const fallbackName =
                    `Expense-Category-Drill-Down-${periodForFileName}.${extension}`;

                const fileName =
                    getDownloadFileName(
                        response,
                        fallbackName
                    );

                downloadBlob(
                    response,
                    fileName
                );

            } catch (error) {

                console.error(
                    `Failed to export Expense Category Drill-Down to ${format}:`,
                    error
                );

                setError(
                    error?.message ||
                    `Failed to export Expense Category Drill-Down to ${format.toUpperCase()}.`
                );

            } finally {

                setExporting("");
            }
        };

    const handleExpenseCategoryExportExcel =
        () =>
            handleExpenseCategoryExport(
                "excel"
            );

    const handleExpenseCategoryExportPdf =
        () =>
            handleExpenseCategoryExport(
                "pdf"
            );

    /* =====================================================
       LOAD DASHBOARD DATA
    ===================================================== */

    const loadDashboardData =
        async (
            selectedFilters
        ) => {

            const hasSelectedPeriod =
                Array.isArray(
                    selectedFilters?.period
                )
                    ? selectedFilters.period.length > 0
                    : Boolean(
                        selectedFilters?.period
                    );

            if (!hasSelectedPeriod) {
                return;
            }

            try {

                setDashboardLoading(
                    true
                );

                setError("");

                const apiFilters =
                    buildApiFilters(
                        selectedFilters
                    );

                const [
                    summaryResponse,
                    categoryComparisonResponse,
                    compositionResponse,
                    categoryBreakdownResponse,
                    monthlyResponse, reconciliationResponse,
                ] =
                    await Promise.all([
                        getOpexSummary(
                            apiFilters
                        ),

                        getOpexCategoryComparison(
                            apiFilters
                        ),

                        getOpexComposition(
                            apiFilters
                        ),

                        getOpexCategoryBreakdown(
                            apiFilters
                        ),

                        getOpexMonthly(
                            apiFilters
                        ),

                        getOpexReconciliation(apiFilters),
                    ]);

                /* =================================================
                   SUMMARY

                   Values come directly from backend.
                   No PTD/YTD/variance calculation in frontend.
                ================================================= */

                const summary =
                    summaryResponse || {};

                setSummaryData({

                    actualPTD:
                        summary.actual_ptd_aed ??
                        summary.actual_ptd ??
                        null,

                    targetPTD:
                        summary.target_ptd_aed ??
                        summary.target_ptd ??
                        null,

                    variancePTD:
                        summary.variance_ptd_aed ??
                        summary.variance_ptd ??
                        null,

                    variancePTDPercent:
                        summary.variance_ptd_pct ??
                        null,

                    actualYTD:
                        summary.actual_ytd_aed ??
                        summary.actual_ytd ??
                        null,

                    targetYTD:
                        summary.target_ytd_aed ??
                        summary.target_ytd ??
                        null,

                    varianceYTD:
                        summary.variance_ytd_aed ??
                        summary.variance_ytd ??
                        null,

                    varianceYTDPercent:
                        summary.variance_ytd_pct ??
                        null,
                });

                /* =================================================
                   ACTUAL VS TARGET
                ================================================= */

                const comparison =
                    Array.isArray(
                        categoryComparisonResponse
                    )
                        ? categoryComparisonResponse
                        : categoryComparisonResponse?.items ||
                        categoryComparisonResponse?.categories ||
                        [];

                setActualVsTargetData(
                    comparison.map(
                        (item) => ({
                            category:
                                item?.category ??
                                "",

                            actual:
                                item?.actual_ptd_aed !=
                                    null
                                    ? Number(
                                        item.actual_ptd_aed
                                    )
                                    : null,

                            target:
                                item?.target_ptd_aed !=
                                    null
                                    ? Number(
                                        item.target_ptd_aed
                                    )
                                    : null,
                        })
                    )
                );

                /* =================================================
                   OPEX COMPOSITION
                ================================================= */

                const composition =
                    Array.isArray(
                        compositionResponse
                    )
                        ? compositionResponse
                        : compositionResponse?.items ||
                        compositionResponse?.categories ||
                        [];

                setOpexCompositionData(
                    composition.map(
                        (item) => ({
                            name:
                                item?.category ??
                                "",

                            value:
                                item?.amount_aed !=
                                    null
                                    ? Number(
                                        item.amount_aed
                                    )
                                    : item?.amount !=
                                        null
                                        ? Number(
                                            item.amount
                                        )
                                        : null,

                            percentage:
                                item?.percentage !=
                                    null
                                    ? Number(
                                        item.percentage
                                    )
                                    : null,
                        })
                    )
                );

                /* =================================================
                   CATEGORY BREAKDOWN
                ================================================= */

                const breakdown =
                    Array.isArray(
                        categoryBreakdownResponse
                    )
                        ? categoryBreakdownResponse
                        : categoryBreakdownResponse?.items ||
                        categoryBreakdownResponse?.categories ||
                        [];

                setExpenseCategoryDrilldownData(
                    breakdown
                );

                /* =================================================
                   MONTHLY
                ================================================= */

                const monthly =
                    Array.isArray(
                        monthlyResponse
                    )
                        ? monthlyResponse
                        : monthlyResponse?.items ||
                        monthlyResponse?.months ||
                        [];

                setMonthOnMonthOpexData(
                    monthly
                );

                setReconciliationData(reconciliationResponse || null);
                /* =================================================
                   DATA AS OF
                ================================================= */

                if (
                    summary.data_as_of
                ) {
                    setDataAsOf(
                        summary.data_as_of
                    );
                }

            } catch (error) {

                console.error(
                    "Failed to load OPEX dashboard data:",
                    error
                );

                setError(
                    error?.message ||
                    "Failed to load OPEX dashboard data."
                );

            } finally {

                setDashboardLoading(
                    false
                );
            }
        };

    /* =====================================================
       FOOTER DATE
    ===================================================== */

    const formatDataAsOf = (
        date
    ) => {

        if (!date) {
            return "";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    /* =====================================================
       LOAD FILTER OPTIONS
    ===================================================== */

    const loadFilterOptions =
        async () => {

            try {

                setLoading(true);

                setError("");

                const response =
                    await getOpexFilterOptions();

                const data =
                    response || {};

                const periods =
                    data.periods || [];

                const years =
                    data.years ||
                    data.fiscal_years ||
                    [];

                const latestPeriod =
                    getLatestPeriod(
                        periods
                    );

                const defaultCurrency =
                    data.default_reporting_currency ||
                    data.reporting_currency ||
                    "AED";

                setFilterOptions({

                    as_on_dates:
                        data.as_on_dates || [],

                    currencies:
                        data.currencies || [],

                    legal_groups:
                        data.legal_groups || [],

                    legal_entities:
                        data.legal_entities || [],

                    parent_divisions:
                        data.parent_divisions || [],

                    subdivisions:
                        data.subdivisions || [],

                    periods,

                    compare_with:
                        data.compare_with ||
                        data.compare_periods ||
                        [],

                    years,

                    default_reporting_currency:
                        defaultCurrency,
                });

                setDataAsOf(
                    data.data_as_of ||
                    null
                );

                /* =================================================
                   INITIAL FILTERS

                   Year = single value
                   Period = array
                   Hierarchy filters = arrays
                ================================================= */

                if (
                    latestPeriod
                ) {

                    const initialFilters = {

                        year:
                            getOptionValue(
                                years?.[0]
                            ) || "",

                        legal_group:
                            [],

                        legal_entity:
                            [],

                        parent_division:
                            [],

                        subdivision:
                            [],

                        period:
                            [
                                String(
                                    latestPeriod
                                ),
                            ],

                        compare_with:
                            "",

                        reporting_currency:
                            defaultCurrency,
                    };

                    setActiveOpexFilters(
                        initialFilters
                    );

                    await loadDashboardData(
                        initialFilters
                    );
                }

            } catch (error) {

                console.error(
                    "Failed to load OPEX filter options:",
                    error
                );

                setError(
                    error?.message ||
                    "Failed to load OPEX filter options."
                );

            } finally {

                setLoading(false);
            }
        };

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        loadFilterOptions();
    }, []);

    /* =====================================================
       APPLY FILTERS
    ===================================================== */

    const handleApplyFilters =
        async (
            selectedFilters
        ) => {

            /*
             * Normalize the filter structure before
             * storing it as active filters.
             *
             * This keeps:
             * - Year as single value
             * - Period as array
             * - Hierarchy filters as arrays
             */

            const normalizedFilters = {

                ...selectedFilters,

                year:
                    selectedFilters?.year ??
                    "",

                legal_group:
                    Array.isArray(
                        selectedFilters?.legal_group
                    )
                        ? selectedFilters.legal_group
                        : selectedFilters?.legal_group
                            ? [
                                selectedFilters.legal_group,
                            ]
                            : [],

                legal_entity:
                    Array.isArray(
                        selectedFilters?.legal_entity
                    )
                        ? selectedFilters.legal_entity
                        : selectedFilters?.legal_entity
                            ? [
                                selectedFilters.legal_entity,
                            ]
                            : [],

                parent_division:
                    Array.isArray(
                        selectedFilters?.parent_division
                    )
                        ? selectedFilters.parent_division
                        : selectedFilters?.parent_division
                            ? [
                                selectedFilters.parent_division,
                            ]
                            : [],

                subdivision:
                    Array.isArray(
                        selectedFilters?.subdivision
                    )
                        ? selectedFilters.subdivision
                        : selectedFilters?.subdivision
                            ? [
                                selectedFilters.subdivision,
                            ]
                            : [],

                period:
                    Array.isArray(
                        selectedFilters?.period
                    )
                        ? selectedFilters.period
                        : selectedFilters?.period
                            ? [
                                String(
                                    selectedFilters.period
                                ),
                            ]
                            : [],

                reporting_currency:
                    selectedFilters?.reporting_currency ||
                    "AED",
            };

            setActiveOpexFilters(
                normalizedFilters
            );

            /* Clear old View All data */

            setCompositionViewAllOpen(
                false
            );

            setCompositionViewAllData(
                []
            );

            setViewAllType(null);

            setDetailLoading({});
            setReconciliationData(null);

            await loadDashboardData(
                normalizedFilters
            );
        };

    /* =====================================================
       RESET FILTERS
    ===================================================== */

    const handleResetFilters =
        async () => {

            const latestPeriod =
                getLatestPeriod(
                    filterOptions.periods
                );

            if (!latestPeriod) {
                return;
            }

            const resetFilters = {

                year:
                    getOptionValue(
                        filterOptions.years?.[0]
                    ) || "",

                legal_group:
                    [],

                legal_entity:
                    [],

                parent_division:
                    [],

                subdivision:
                    [],

                period:
                    [
                        String(
                            latestPeriod
                        ),
                    ],

                compare_with:
                    "",

                reporting_currency:
                    filterOptions.default_reporting_currency ||
                    "AED",
            };

            setActiveOpexFilters(
                resetFilters
            );

            setDetailLoading({});

            setViewAllType(null);

            setCompositionViewAllOpen(
                false
            );

            setCompositionViewAllData(
                []
            );

            setReconciliationData(null);
            await loadDashboardData(
                resetFilters
            );
        };

    /* =====================================================
       REPORTING CURRENCY
    ===================================================== */

    const reportingCurrency =
        activeOpexFilters?.reporting_currency ||
        "AED";

    /* =====================================================
       PERIOD DISPLAY VALUE
    ===================================================== */

    const periodDisplayValue =
        getPeriodDisplayValue(
            activeOpexFilters?.period
        );

    /* =====================================================
       RETURN
    ===================================================== */

    return (
        <div className="page-content relative">

            <PageHeader
                title="Operating Expenses Analysis"
                subtitle="Detailed Operating expense performance and variance analysis across divisions."
            >

                <ExportButtons
                    endpoint="operatinganalysis"
                    exporting={exporting}
                    handleExport={handleFullOpexExport}
                />

            </PageHeader>

            <div className="flex flex-col gap-2">

                {/* =================================================
                    FILTERS
                ================================================= */}

                <div className="top-0 z-30 bg-white py-2">

                    <Filters
                        filterOptions={
                            filterOptions
                        }

                        onApply={
                            handleApplyFilters
                        }

                        onReset={
                            handleResetFilters
                        }

                        /*
                         * IMPORTANT:
                         * Do NOT load dashboard data here.
                         *
                         * Filters are applied only after
                         * clicking Apply.
                         */

                        onChange={(filters) => {
                            // Keep local/active filter state
                            // updated without triggering APIs.
                            setActiveOpexFilters(
                                filters
                            );
                        }}

                        isOperatingExpenses={
                            true
                        }
                    />

                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        style={{
                            padding:
                                "8px 12px",

                            borderRadius:
                                "6px",

                            background:
                                "#fff7ed",

                            border:
                                "1px solid #fed7aa",

                            color:
                                "#c2410c",

                            fontSize:
                                "12px",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* =================================================
                    SUMMARY
                ================================================= */}

                <OperatingExpenseSummary
                    data={
                        summaryData
                    }

                    reportingCurrency={
                        reportingCurrency
                    }
                />

                {/* =================================================
                    CHARTS
                ================================================= */}

                <div className="grid grid-cols-16 gap-3 mt-3">

                    <div className="col-span-8">

                        <ActualVsTargetChart
                            data={
                                actualVsTargetData
                            }

                            total={
                                summaryData?.actualYTD
                            }

                            activeFilters={
                                activeOpexFilters
                            }

                            reportingCurrency={
                                activeOpexFilters?.reporting_currency ||
                                "AED"
                            }

                            onDrillDown={
                                handleCompositionDrillDown
                            }

                            onViewAll={
                                handleActualVsTargetViewAll
                            }

                            onExportExcel={
                                handleActualVsTargetExportExcel
                            }

                            onExportPdf={
                                handleActualVsTargetExportPdf
                            }

                            exporting={
                                exporting
                            }
                        />

                    </div>

                    <div className="col-span-8">

                        <OpexCompositionChart
                            data={
                                opexCompositionData
                            }

                            total={
                                summaryData?.actualYTD
                            }

                            activeFilters={
                                activeOpexFilters
                            }

                            reportingCurrency={
                                activeOpexFilters?.reporting_currency ||
                                "AED"
                            }

                            onDrillDown={
                                handleCompositionDrillDown
                            }

                            onViewAll={
                                handleCompositionViewAll
                            }

                            onExportExcel={
                                handleCompositionExportExcel
                            }

                            onExportPdf={
                                handleCompositionExportPdf
                            }

                            exporting={
                                exporting
                            }
                        />

                    </div>

                </div>

                {/* =================================================
                    EXPENSE CATEGORY DRILL DOWN
                ================================================= */}

                <ExpenseCategoryDrillDown
                    data={
                        expenseCategoryDrilldownData
                    }

                    totalData={
                        summaryData
                    }

                    dataAsOf={
                        dataAsOf
                    }

                    currentMonthPartial={
                        currentMonthPartial
                    }

                    onExpandCategory={
                        handleExpandCategory
                    }

                    detailLoading={
                        detailLoading
                    }

                    periodName={
                        periodDisplayValue
                    }

                    reportingCurrency={
                        activeOpexFilters?.reporting_currency ||
                        "AED"
                    }

                    onViewAll={
                        handleExpenseCategoryViewAll
                    }

                    onExportExcel={
                        handleExpenseCategoryExportExcel
                    }

                    onExportPdf={
                        handleExpenseCategoryExportPdf
                    }
                />

                {/* =================================================
                    MONTH ON MONTH
                ================================================= */}
                <MonthOnMonthOpexReport
                    data={monthOnMonthOpexData}

                    viewAllData={
                        monthOnMonthViewAllData
                    }

                    viewAllLoading={
                        monthOnMonthViewAllLoading
                    }

                    onApplyFilters={
                        handleMonthOnMonthViewAllFilters
                    }

                    onExpandCategory={
                        handleExpandMonthlyCategory
                    }

                    detailLoading={
                        detailLoading
                    }

                    periodName={
                        periodDisplayValue
                    }

                    reportingCurrency={
                        activeOpexFilters?.reporting_currency ||
                        "AED"
                    }

                    filterOptions={
                        filterOptions
                    }

                    hierarchyFilters={{
                        year:
                            activeOpexFilters?.year ||
                            "",

                        legal_group_id:
                            activeOpexFilters?.legal_group ||
                            [],

                        legal_entity_id:
                            activeOpexFilters?.legal_entity ||
                            [],

                        parent_division_id:
                            activeOpexFilters?.parent_division ||
                            [],

                        subdivision_id:
                            activeOpexFilters?.subdivision ||
                            [],
                    }}
                />

            </div>

            {/* =====================================================
    COMMON VIEW ALL MODAL
===================================================== */}
            <OperatingAnalysisViewAllModal
                open={
                    compositionViewAllOpen &&
                    viewAllType !== "expense-category"
                }

                onClose={
                    handleCloseViewAll
                }

                data={
                    compositionViewAllData
                }

                loading={
                    compositionViewAllLoading
                }

                activeFilters={
                    Object.keys(viewAllAppliedFilters).length > 0
                        ? viewAllAppliedFilters
                        : activeOpexFilters
                }

                filterOptions={
                    filterOptions
                }

                reportingCurrency={
                    activeOpexFilters?.reporting_currency ||
                    "AED"
                }

                viewAllType={
                    viewAllType
                }

                title={
                    viewAllType === "actual-vs-target"
                        ? "Actual vs Target by Expense Category"
                        : "OPEX Composition"
                }

                subtitle={
                    viewAllType === "actual-vs-target"
                        ? "Detailed actual versus target expense category analysis"
                        : "Detailed operating expense composition by category"
                }

                onApplyFilters={
                    handleApplyViewAllFilters
                }

                onExportExcel={
                    viewAllType === "actual-vs-target"
                        ? handleActualVsTargetExportExcel
                        : handleCompositionExportExcel
                }

                onExportPdf={
                    viewAllType === "actual-vs-target"
                        ? handleActualVsTargetExportPdf
                        : handleCompositionExportPdf
                }

                exporting={
                    exporting
                }
            />

            {/* =====================================================
    EXPENSE CATEGORY DRILL-DOWN MODAL
===================================================== */}
            <ExpenseCategoryDrillDownModal
                open={
                    compositionViewAllOpen &&
                    viewAllType === "expense-category"
                }

                onClose={handleCloseViewAll}

                data={compositionViewAllData}

                loading={compositionViewAllLoading}

                activeFilters={
                    Object.keys(
                        viewAllAppliedFilters || {}
                    ).length > 0
                        ? viewAllAppliedFilters
                        : activeOpexFilters
                }

                filterOptions={filterOptions}

                reportingCurrency={
                    viewAllAppliedFilters?.reporting_currency ||
                    activeOpexFilters?.reporting_currency ||
                    "AED"
                }

                onApplyFilters={
                    handleApplyViewAllFilters
                }

                onExpandCategory={
                    async (category) => {
                        const filtersForDetail =
                            Object.keys(
                                viewAllAppliedFilters || {}
                            ).length > 0
                                ? viewAllAppliedFilters
                                : activeOpexFilters;

                        const response =
                            await getOpexCategoryDetail({
                                category,
                                ...buildApiFilters(
                                    filtersForDetail
                                ),
                            });

                        return response;
                    }
                }
            />
            {/* =====================================================
                FOOTER
            ===================================================== */}

            <div
                className="
                    fixed
                    bottom-0
                    left-58
                    right-2
                    z-50
                    bg-white
                    border-t
                    border-gray-200
                    p-2
                "
            >

                <FooterNote
                    title="Note:"
                    message={`All values are in ${reportingCurrency}, | Data as of ${formatDataAsOf(dataAsOf)}`}
                    showRefresh={false}
                />

            </div>

        </div>
    );
}