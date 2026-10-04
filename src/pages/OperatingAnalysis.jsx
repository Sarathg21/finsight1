
import React, { useEffect, useState, } from "react";

import ExportButtons from "../components/Common/ExportButtons";
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
    exportOpexCategoryBreakdown, getOpexReconciliation,
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
   OPERATING ANALYSIS — SALES REVENUE VISUAL SYSTEM
   Presentation-only helpers. No API/data behavior is changed.
========================================================= */

const OperatingAnalysisSkeleton = () => (
    <div className="oa-page-skeleton" aria-label="Loading Operating Analysis">
        <div className="oa-skeleton-filter">
            {Array.from({ length: 7 }).map((_, index) => (
                <div className="oa-skeleton-field" key={index}>
                    <span className="oa-skeleton-label" />
                    <span className="oa-skeleton-control" />
                </div>
            ))}
            <div className="oa-skeleton-actions">
                <span />
                <span />
            </div>
        </div>

        <div className="oa-skeleton-kpis">
            {Array.from({ length: 6 }).map((_, index) => (
                <div className="oa-skeleton-card oa-skeleton-kpi" key={index}>
                    <span className="oa-skeleton-line short" />
                    <span className="oa-skeleton-line value" />
                    <span className="oa-skeleton-line tiny" />
                </div>
            ))}
        </div>

        <div className="oa-skeleton-chart-grid">
            {Array.from({ length: 2 }).map((_, index) => (
                <div className="oa-skeleton-card oa-skeleton-chart" key={index}>
                    <div className="oa-skeleton-chart-head">
                        <span className="oa-skeleton-line medium" />
                        <span className="oa-skeleton-menu" />
                    </div>
                    <div className="oa-skeleton-chart-body">
                        {Array.from({ length: 7 }).map((__, barIndex) => (
                            <span
                                key={barIndex}
                                className="oa-skeleton-bar"
                                style={{ height: `${35 + ((barIndex * 11) % 48)}%` }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>

        <div className="oa-skeleton-wide">
            <div className="oa-skeleton-card oa-skeleton-table">
                <span className="oa-skeleton-line medium" />
                {Array.from({ length: 6 }).map((_, index) => (
                    <div className="oa-skeleton-row" key={index}>
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const operatingAnalysisUniformStyles = `
    /* =========================================================
       SALES REVENUE VISUAL SYSTEM
       Presentation-only styles. No API/state/handler behavior.
    ========================================================= */

    .operating-analysis-page {
        --oa-bg: #f8fafc;
        --oa-surface: #ffffff;
        --oa-navy: #1e1b4b;
        --oa-blue: #1e3a8a;
        --oa-primary: #4f46e5;
        --oa-primary-soft: #eef2ff;
        --oa-text: #0f172a;
        --oa-text-muted: #64748b;
        --oa-text-dim: #94a3b8;
        --oa-border: #e2e8f0;
        --oa-border-soft: #e2e8f0;
        --oa-shadow: 0 4px 16px rgba(15, 23, 42, 0.045);
        --oa-shadow-hover: 0 12px 30px rgba(15, 23, 42, 0.08);
        --oa-radius: 14px;

        width: 100%;
        min-height: 100%;
        padding: 20px 0 32px;
        margin: 0;
        overflow-x: hidden;

        background: var(--oa-bg);
        color: var(--oa-text);

        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
    }

    .operating-analysis-page,
    .operating-analysis-page * {
        box-sizing: border-box;
    }

    /* ─────────────────────────────────────────────────────────
       PAGE HEADER
    ───────────────────────────────────────────────────────── */

    .operating-analysis-page .oa-header-wrap {
        width: 100%;
        margin: 0 0 16px;
        animation: oaFadeSlideUp 0.32s ease both;
    }

    .operating-analysis-page .oa-direct-header {
        width: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
    }

    .operating-analysis-page .oa-direct-header-content {
        min-width: 0;
        flex: 1 1 auto;
    }

    .operating-analysis-page .oa-direct-title {
        margin: 0;
        color: var(--oa-navy);
        font-size: 1.45rem;
        line-height: 1.2;
        font-weight: 800;
        letter-spacing: -0.025em;
    }

    .operating-analysis-page .oa-direct-subtitle {
        margin: 4px 0 0;
        color: var(--oa-text-muted);
        font-size: 0.76rem;
        line-height: 1.45;
        font-weight: 500;
    }

    .operating-analysis-page .oa-direct-meta {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 6px;
        color: var(--oa-text-muted);
        font-size: 0.72rem;
        line-height: 1.4;
    }

    .operating-analysis-page .oa-direct-meta strong {
        color: #334155;
        font-weight: 700;
    }

    .operating-analysis-page .oa-direct-meta-divider {
        color: #cbd5e1;
        font-weight: 400;
    }

    .operating-analysis-page .oa-direct-header-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-shrink: 0;
        padding-top: 1px;
    }

    .operating-analysis-page .oa-direct-header-actions button {
        font-family: inherit;
        transition: transform 0.15s ease, box-shadow 0.15s ease,
            opacity 0.15s ease;
    }

    .operating-analysis-page .oa-direct-header-actions button:hover {
        transform: translateY(-1px);
    }

    /* ─────────────────────────────────────────────────────────
       FILTER AREA
       Same compact language as Sales Revenue.
    ───────────────────────────────────────────────────────── */

    .operating-analysis-page .oa-filter-wrap {
        position: relative;
        z-index: 30;
        width: 100%;
        max-width: none;
        min-width: 0;
        margin: 0 0 16px;
        padding: 10px 12px;

        background: #ffffff;
        border: 1px solid var(--oa-border);
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(15, 23, 42, 0.025);

        display: block;
    }

    .operating-analysis-page .oa-filter-wrap > div,
    .operating-analysis-page .oa-filter-wrap > div > div,
    .operating-analysis-page .oa-filter-wrap form {
        width: 100%;
        max-width: none;
        min-width: 0;
    }

    .operating-analysis-page .oa-filter-wrap > div > div > * {
        max-width: none;
    }

    /* Make the existing Filters component visually compact,
       while leaving its values and handlers untouched. */
    .operating-analysis-page .oa-filter-wrap label {
        color: #475569;
        font-size: 0.70rem;
        font-weight: 600;
    }

    .operating-analysis-page .oa-filter-wrap input,
    .operating-analysis-page .oa-filter-wrap select,
    .operating-analysis-page .oa-filter-wrap button {
        font-family: inherit;
    }

    .operating-analysis-page .oa-filter-wrap input,
    .operating-analysis-page .oa-filter-wrap select {
        min-height: 32px;
        border-color: #cbd5e1;
        border-radius: 7px;
        font-size: 0.74rem;
        color: #334155;
        background: #ffffff;
    }

    .operating-analysis-page .oa-filter-wrap input:focus,
    .operating-analysis-page .oa-filter-wrap select:focus {
        outline: none;
        border-color: #818cf8;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.10);
    }

    .operating-analysis-page .oa-filter-wrap button {
        font-size: 0.72rem;
    }

    /* ─────────────────────────────────────────────────────────
       ERROR
    ───────────────────────────────────────────────────────── */

    .operating-analysis-page .oa-error {
        width: 100%;
        margin: 0 0 16px;
        padding: 9px 13px !important;

        border: 1px solid #fed7aa !important;
        border-radius: 8px !important;
        background: #fff7ed !important;
        color: #c2410c !important;

        font-size: 0.72rem !important;
        font-weight: 600;
        line-height: 1.45;
    }

    /* ─────────────────────────────────────────────────────────
       SECTION RHYTHM
    ───────────────────────────────────────────────────────── */

    .operating-analysis-page .oa-section {
        width: 100%;
        min-width: 0;
        margin: 0 0 16px;
        animation: oaFadeSlideUp 0.38s ease both;
    }

    .operating-analysis-page .oa-summary {
        animation-delay: 0.04s;
    }

    .operating-analysis-page .oa-data-shell {
        width: 100%;
        min-width: 0;
        animation: oaFadeSlideUp 0.42s ease both;
    }

    .operating-analysis-page .oa-data-shell + .oa-data-shell {
        animation-delay: 0.06s;
    }

    /* ─────────────────────────────────────────────────────────
       CHILD CARD SURFACES
       Covers existing OPEX child components without changing
       their data, props, APIs, or event handlers.
    ───────────────────────────────────────────────────────── */

    .operating-analysis-page .card,
    .operating-analysis-page [class*="card"] {
        font-family: inherit;
    }

    .operating-analysis-page .card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        box-shadow: 0 4px 16px rgba(15, 23, 42, 0.045);
    }

    .operating-analysis-page .card:hover {
        box-shadow: 0 10px 26px rgba(15, 23, 42, 0.065);
    }

    /* Keep card headings consistent with Sales Revenue. */
    .operating-analysis-page .card h1,
    .operating-analysis-page .card h2,
    .operating-analysis-page .card h3,
    .operating-analysis-page .card h4 {
        font-family: inherit;
        color: var(--oa-navy);
        letter-spacing: -0.01em;
    }

    .operating-analysis-page .card table {
        width: 100%;
        border-collapse: collapse;
        font-family: inherit;
        font-size: 0.74rem;
    }

    .operating-analysis-page .card th {
        color: #475569;
        font-size: 0.68rem;
        font-weight: 700;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
    }

    .operating-analysis-page .card td {
        color: #334155;
        border-bottom: 1px solid #f1f5f9;
        font-size: 0.72rem;
    }

    .operating-analysis-page .card tr:last-child td {
        border-bottom: 0;
    }

    /* ─────────────────────────────────────────────────────────
       KPI AREA
    ───────────────────────────────────────────────────────── */

    .operating-analysis-page .oa-summary > * {
        min-width: 0;
    }

    .operating-analysis-page .oa-summary [class*="grid"] {
        gap: 10px !important;
    }

    .operating-analysis-page .oa-summary [class*="kpi"],
    .operating-analysis-page .oa-summary [class*="KPI"] {
        min-width: 0;
        border-radius: 14px;
    }

    /* ─────────────────────────────────────────────────────────
       CHARTS
    ───────────────────────────────────────────────────────── */

    .operating-analysis-page .oa-chart-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        width: 100%;
        min-width: 0;
        margin: 0 0 16px;
    }

    .operating-analysis-page .oa-chart-shell {
        position: relative;
        min-width: 0;
        min-height: 0;
        padding: 0;
        border-radius: 14px;

        animation: oaChartEnter 0.42s ease both;
        transition: transform 0.22s ease, filter 0.22s ease;
    }

    .operating-analysis-page .oa-chart-shell:nth-child(2) {
        animation-delay: 0.06s;
    }

    .operating-analysis-page .oa-chart-shell:hover {
        transform: translateY(-2px);
        filter: drop-shadow(0 8px 16px rgba(15, 23, 42, 0.055));
    }

    .operating-analysis-page .oa-chart-shell > * {
        min-width: 0;
    }

    .operating-analysis-page .oa-chart-shell svg {
        overflow: visible;
    }

    .operating-analysis-page .oa-chart-shell .recharts-cartesian-grid line {
        stroke: #e2e8f0;
        stroke-opacity: 0.58;
    }

    .operating-analysis-page .oa-chart-shell .recharts-text {
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        fill: #64748b;
        font-size: 10px;
    }

    .operating-analysis-page .oa-chart-shell .recharts-tooltip-wrapper {
        font-family: inherit;
    }

    .operating-analysis-page .oa-chart-shell .recharts-bar-rectangle path,
    .operating-analysis-page .oa-chart-shell .recharts-bar-rectangle rect {
        transition: opacity 0.2s ease, filter 0.2s ease;
    }

    .operating-analysis-page .oa-chart-shell .recharts-bar-rectangle:hover path,
    .operating-analysis-page .oa-chart-shell .recharts-bar-rectangle:hover rect {
        filter: drop-shadow(0 4px 7px rgba(79, 70, 229, 0.18));
    }

    /* ─────────────────────────────────────────────────────────
       TABLE / DATA SECTIONS
    ───────────────────────────────────────────────────────── */

    .operating-analysis-page .oa-data-shell > * {
        min-width: 0;
    }

    .operating-analysis-page .oa-data-shell .card {
        width: 100%;
        overflow: hidden;
    }

    .operating-analysis-page .oa-data-shell table {
        table-layout: auto;
    }

    .operating-analysis-page .oa-data-shell thead th {
        padding: 8px 10px;
        white-space: nowrap;
        line-height: 1.25;
    }

    .operating-analysis-page .oa-data-shell tbody td {
        padding: 7px 10px;
        line-height: 1.3;
        vertical-align: middle;
    }

    .operating-analysis-page .oa-data-shell tbody tr:hover {
        background: #f8fafc;
    }

    /* ─────────────────────────────────────────────────────────
       MODAL / VIEW ALL
       Scoped so existing modal behavior remains unchanged.
    ───────────────────────────────────────────────────────── */

    .operating-analysis-page [role="dialog"] {
        font-family: inherit;
    }

    .operating-analysis-page .modal-table-scroll,
    .operating-analysis-page .sr-table-scroll {
        font-family: inherit;
    }

    .operating-analysis-page .modal-table-scroll::-webkit-scrollbar,
    .operating-analysis-page .sr-table-scroll::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }

    .operating-analysis-page .modal-table-scroll::-webkit-scrollbar-track,
    .operating-analysis-page .sr-table-scroll::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 6px;
    }

    .operating-analysis-page .modal-table-scroll::-webkit-scrollbar-thumb,
    .operating-analysis-page .sr-table-scroll::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 6px;
        border: 2px solid #f1f5f9;
    }

    .operating-analysis-page .modal-table-scroll::-webkit-scrollbar-thumb:hover,
    .operating-analysis-page .sr-table-scroll::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }

    /* ─────────────────────────────────────────────────────────
       FOOTER
    ───────────────────────────────────────────────────────── */

    .operating-analysis-page .oa-footer {
        position: relative;

          display: flex;
         align-items: center;
         width: 100%;
        left: auto;
        right: auto;
        bottom: auto;
        z-index: 10;

        width: 100%;
        margin-top: 0;
        padding: 4px 0 0;

        background: transparent;
        border-top: 0;
    }

    /* ─────────────────────────────────────────────────────────
       LOADING SKELETON
    ───────────────────────────────────────────────────────── */

    .operating-analysis-page .oa-page-skeleton {
        width: 100%;
        animation: oaFadeIn 0.2s ease both;
    }

    .operating-analysis-page .oa-skeleton-filter {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 10px;

        padding: 12px;
        margin-bottom: 16px;

        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(15, 23, 42, 0.025);
    }

    .operating-analysis-page .oa-skeleton-field,
    .operating-analysis-page .oa-skeleton-actions {
        min-width: 0;
    }

    .operating-analysis-page .oa-skeleton-label,
    .operating-analysis-page .oa-skeleton-control,
    .operating-analysis-page .oa-skeleton-line,
    .operating-analysis-page .oa-skeleton-menu,
    .operating-analysis-page .oa-skeleton-row span {
        display: block;
        background: linear-gradient(
            90deg,
            #e2e8f0 25%,
            #f1f5f9 50%,
            #e2e8f0 75%
        );
        background-size: 200% 100%;
        animation: oaShimmer 1.4s infinite;
    }

    .operating-analysis-page .oa-skeleton-label {
        width: 52px;
        height: 8px;
        margin: 0 0 6px;
        border-radius: 999px;
    }

    .operating-analysis-page .oa-skeleton-control {
        width: 100%;
        height: 32px;
        border-radius: 7px;
    }

    .operating-analysis-page .oa-skeleton-actions {
        display: flex;
        align-items: flex-end;
        gap: 6px;
    }

    .operating-analysis-page .oa-skeleton-actions span {
        flex: 1;
        height: 32px;
        border-radius: 7px;
        background: linear-gradient(
            90deg,
            #e2e8f0 25%,
            #f1f5f9 50%,
            #e2e8f0 75%
        );
        background-size: 200% 100%;
        animation: oaShimmer 1.4s infinite;
    }

    .operating-analysis-page .oa-skeleton-kpis {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 10px;
        margin-bottom: 16px;
    }

    .operating-analysis-page .oa-skeleton-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        box-shadow: 0 4px 16px rgba(15, 23, 42, 0.045);
        padding: 14px;
    }

    .operating-analysis-page .oa-skeleton-kpi {
        min-height: 104px;
    }

    .operating-analysis-page .oa-skeleton-line {
        height: 9px;
        border-radius: 999px;
        margin-bottom: 10px;
    }

    .operating-analysis-page .oa-skeleton-line.short {
        width: 42%;
    }

    .operating-analysis-page .oa-skeleton-line.medium {
        width: 46%;
    }

    .operating-analysis-page .oa-skeleton-line.value {
        width: 66%;
        height: 18px;
        margin-bottom: 11px;
    }

    .operating-analysis-page .oa-skeleton-line.tiny {
        width: 30%;
        height: 7px;
    }

    .operating-analysis-page .oa-skeleton-chart-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 16px;
    }

    .operating-analysis-page .oa-skeleton-chart {
        min-height: 300px;
    }

    .operating-analysis-page .oa-skeleton-chart-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 18px;
    }

    .operating-analysis-page .oa-skeleton-menu {
        width: 24px;
        height: 24px;
        border-radius: 6px;
    }

    .operating-analysis-page .oa-skeleton-chart-body {
        height: 220px;
        display: flex;
        align-items: flex-end;
        gap: 12px;
        padding: 8px 12px 0;
        border-bottom: 1px solid #e2e8f0;
    }

    .operating-analysis-page .oa-skeleton-bar {
        flex: 1;
        min-width: 10px;
        max-width: 44px;
        border-radius: 7px 7px 0 0;
        background: linear-gradient(180deg, #c7d2fe 0%, #e2e8f0 100%);
        opacity: 0.8;
        animation: oaBarPulse 1.35s ease-in-out infinite alternate;
    }

    .operating-analysis-page .oa-skeleton-bar:nth-child(2) {
        animation-delay: 0.08s;
    }

    .operating-analysis-page .oa-skeleton-bar:nth-child(3) {
        animation-delay: 0.16s;
    }

    .operating-analysis-page .oa-skeleton-bar:nth-child(4) {
        animation-delay: 0.24s;
    }

    .operating-analysis-page .oa-skeleton-bar:nth-child(5) {
        animation-delay: 0.32s;
    }

    .operating-analysis-page .oa-skeleton-bar:nth-child(6) {
        animation-delay: 0.40s;
    }

    .operating-analysis-page .oa-skeleton-bar:nth-child(7) {
        animation-delay: 0.48s;
    }

    .operating-analysis-page .oa-skeleton-wide {
        margin-bottom: 16px;
    }

    .operating-analysis-page .oa-skeleton-table {
        min-height: 250px;
    }

    .operating-analysis-page .oa-skeleton-row {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 0.8fr;
        gap: 12px;
        padding: 11px 0;
        border-bottom: 1px solid #f1f5f9;
    }

    .operating-analysis-page .oa-skeleton-row span {
        height: 9px;
        border-radius: 999px;
    }

    /* ─────────────────────────────────────────────────────────
       ANIMATION
    ───────────────────────────────────────────────────────── */

    @keyframes oaFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes oaFadeSlideUp {
        from {
            opacity: 0;
            transform: translateY(8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes oaChartEnter {
        from {
            opacity: 0;
            transform: translateY(8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes oaShimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }

    @keyframes oaBarPulse {
        from {
            opacity: 0.52;
            transform: scaleY(0.96);
        }
        to {
            opacity: 0.92;
            transform: scaleY(1);
        }
    }

    /* ─────────────────────────────────────────────────────────
       RESPONSIVE
    ───────────────────────────────────────────────────────── */

    @media (max-width: 1200px) {
        .operating-analysis-page .oa-skeleton-kpis {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .operating-analysis-page .oa-skeleton-filter {
            grid-template-columns: repeat(4, minmax(0, 1fr));
        }
    }

    @media (max-width: 900px) {
        .operating-analysis-page {
            padding-top: 16px;
        }

        .operating-analysis-page .oa-chart-grid,
        .operating-analysis-page .oa-skeleton-chart-grid {
            grid-template-columns: 1fr;
        }

        .operating-analysis-page .oa-skeleton-kpis {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .operating-analysis-page .oa-skeleton-filter {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @media (max-width: 768px) {
        .operating-analysis-page .oa-direct-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
        }

        .operating-analysis-page .oa-direct-header-actions {
            width: 100%;
            justify-content: flex-start;
        }

        .operating-analysis-page .oa-direct-title {
            font-size: 1.30rem;
        }

        .operating-analysis-page .oa-direct-meta {
            font-size: 0.70rem;
        }
    }

    @media (max-width: 600px) {
        .operating-analysis-page {
            padding-left: 0;
            padding-right: 0;
        }

        .operating-analysis-page .oa-skeleton-kpis,
        .operating-analysis-page .oa-skeleton-filter {
            grid-template-columns: 1fr;
        }

        .operating-analysis-page .oa-filter-wrap {
            padding: 8px;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .operating-analysis-page *,
        .operating-analysis-page *::before,
        .operating-analysis-page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
`;

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

       This is derived from the backend data-as-of date and the
       selected period. It is NOT hardcoded.
    ===================================================== */

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

        const normalizedFormat =
            format === "excel" ? "excel" : "pdf";

        try {
            setError("");
            setExporting(`full-opex-${normalizedFormat}`);

            /*
             * Header Excel / PDF export uses the SAME MONTHLY
             * export API used by the Month-on-Month report.
             *
             * Only the Header export behavior is changed here.
             * The dashboard APIs, filters, View All, charts,
             * tables and other exports remain unchanged.
             */
            const sourceFilters = activeOpexFilters || {};

            const cleanArray = (value) => {
                if (
                    value === null ||
                    value === undefined ||
                    value === "" ||
                    value === "All"
                ) {
                    return [];
                }

                const values =
                    Array.isArray(value)
                        ? value
                        : [value];

                return values
                    .filter(
                        (item) =>
                            item !== null &&
                            item !== undefined &&
                            item !== "" &&
                            item !== "All"
                    )
                    .map((item) =>
                        typeof item === "object"
                            ? String(
                                item?.value ??
                                item?.id ??
                                item?.code ??
                                item?.period_name ??
                                item?.name ??
                                ""
                            )
                            : String(item)
                    )
                    .filter(Boolean);
            };

            const params = new URLSearchParams();

            params.set(
                "format",
                normalizedFormat
            );

            const appendArray = (
                key,
                value
            ) => {
                cleanArray(value).forEach(
                    (item) =>
                        params.append(
                            key,
                            item
                        )
                );
            };

            appendArray(
                "year",
                sourceFilters?.year
            );

            appendArray(
                "legal_group_id",
                sourceFilters?.legal_group_id ??
                sourceFilters?.legal_group
            );

            appendArray(
                "legal_entity_id",
                sourceFilters?.legal_entity_id ??
                sourceFilters?.legal_entity
            );

            appendArray(
                "parent_division_id",
                sourceFilters?.parent_division_id ??
                sourceFilters?.parent_division
            );

            appendArray(
                "subdivision_id",
                sourceFilters?.subdivision_id ??
                sourceFilters?.subdivision
            );

            appendArray(
                "period_name",
                sourceFilters?.period_name ??
                sourceFilters?.period
            );

            const currency =
                cleanArray(
                    sourceFilters?.reporting_currency
                )[0] ||
                reportingCurrency ||
                "AED";

            if (currency) {
                params.set(
                    "reporting_currency",
                    currency
                );
            }

            /*
             * Match the existing Month-on-Month API URL pattern,
             * including support for VITE_API_BASE_URL.
             */
            const configuredBaseUrl =
                (
                    import.meta.env.VITE_API_BASE_URL ||
                    ""
                ).replace(
                    /\/+$/,
                    ""
                );

            const apiUrl =
                configuredBaseUrl.endsWith("/api")
                    ? `${configuredBaseUrl}/opex/monthly/export`
                    : `${configuredBaseUrl}/api/opex/monthly/export`;

            const token =
                localStorage.getItem(
                    "finsight_token"
                ) ||
                localStorage.getItem(
                    "token"
                ) ||
                "";

            const response =
                await fetch(
                    `${apiUrl}?${params.toString()}`,
                    {
                        method: "GET",
                        headers: {
                            Accept:
                                "application/octet-stream, application/json",
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
                let message =
                    `Export failed (${response.status})`;

                try {
                    const body =
                        await response.json();

                    message =
                        body?.detail ||
                        body?.message ||
                        message;
                } catch {
                    try {
                        const textResponse =
                            await response.text();

                        if (textResponse) {
                            message =
                                textResponse;
                        }
                    } catch {
                        // Keep HTTP status message.
                    }
                }

                throw new Error(message);
            }

            const blob =
                await response.blob();

            const disposition =
                response.headers.get(
                    "content-disposition"
                ) || "";

            const filenameMatch =
                disposition.match(
                    /filename[^;=]*=(?:UTF-8''|")?([^;"]+)/i
                );

            const extension =
                normalizedFormat === "excel"
                    ? "xlsx"
                    : "pdf";

            const periodForFileName =
                getPeriodDisplayValue(
                    activeOpexFilters?.period
                )
                    .replace(
                        /,\s*/g,
                        "-"
                    )
                    .replace(
                        /\s+/g,
                        "-"
                    );

            const fallbackName =
                `Operating-Expenses-Analysis-${periodForFileName || "Report"}.${extension}`;

            const fileName =
                filenameMatch?.[1]
                    ? decodeURIComponent(
                        filenameMatch[1]
                            .replace(
                                /^"|"$|^'|'$/g,
                                ""
                            )
                    )
                    : fallbackName;

            downloadBlob(
                blob,
                fileName
            );
        } catch (error) {
            console.error(
                `Failed to export complete OPEX report to ${normalizedFormat}:`,
                error
            );

            setError(
                error?.message ||
                `Failed to export complete OPEX report to ${normalizedFormat.toUpperCase()}.`
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


    const formatDateDDMMYYYY = (date) => {
        if (!date) return "—";

        const d = new Date(date);

        if (Number.isNaN(d.getTime())) return "—";

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}-${month}-${year}`;
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
       CURRENT MONTH PARTIAL — DERIVED FROM DATA AS OF

       A month is partial only when the backend data-as-of date
       is before the end of the selected period's month.
       Example: the last day of Sep-26 => false.
    ===================================================== */

    const getPeriodMonthYear = (periodValue) => {
        const value = getOptionValue(periodValue);

        if (!value) {
            return null;
        }

        const text = String(value).trim();

        // YYYY-MM / YYYY-MM-DD
        let match = text.match(/^(\d{4})[-\/](\d{1,2})/);
        if (match) {
            return {
                year: Number(match[1]),
                month: Number(match[2]) - 1,
            };
        }

        // Mon-YY / Month YYYY / Mon YYYY
        match = text.match(/^([A-Za-z]{3,9})[-\s]+(\d{2}|\d{4})$/);
        if (!match) {
            return null;
        }

        const monthNames = [
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "august",
            "september",
            "october",
            "november",
            "december",
        ];

        const monthText = match[1].toLowerCase();
        const monthIndex = monthNames.findIndex((name) =>
            name.startsWith(monthText)
        );

        if (monthIndex < 0) {
            return null;
        }

        const rawYear = Number(match[2]);
        const year = rawYear < 100 ? 2000 + rawYear : rawYear;

        return {
            year,
            month: monthIndex,
        };
    };

    const isSelectedPeriodPartial = (asOfValue, selectedPeriod) => {
        if (!asOfValue || !selectedPeriod) {
            return false;
        }

        const asOfDate = new Date(asOfValue);

        if (Number.isNaN(asOfDate.getTime())) {
            return false;
        }

        const period = getPeriodMonthYear(
            Array.isArray(selectedPeriod)
                ? selectedPeriod[0]
                : selectedPeriod
        );

        if (!period) {
            return false;
        }

        // A prior/future period is never treated as the current partial month.
        if (
            asOfDate.getFullYear() !== period.year ||
            asOfDate.getMonth() !== period.month
        ) {
            return false;
        }

        const lastDayOfPeriod = new Date(
            period.year,
            period.month + 1,
            0
        ).getDate();

        return asOfDate.getDate() < lastDayOfPeriod;
    };

    const currentMonthPartial = isSelectedPeriodPartial(
        dataAsOf,
        activeOpexFilters?.period
    );

    /* =====================================================
       HEADER AS-ON DATE

       Prefer the currently selected filter date. If the
       Filters component does not expose it, fall back to
       the backend data-as-of date already used by this page.
    ===================================================== */

    const formatHeaderAsOnDate = (value) => {
        const rawValue = Array.isArray(value)
            ? value[0]
            : value;

        if (!rawValue) {
            return "—";
        }

        const parsedDate = new Date(rawValue);

        if (Number.isNaN(parsedDate.getTime())) {
            return String(rawValue);
        }

        const day = String(parsedDate.getDate()).padStart(2, "0");
        const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
        const year = parsedDate.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const selectedAsOnDate =
        activeOpexFilters?.as_on_date ||
        activeOpexFilters?.as_on_dates ||
        dataAsOf ||
        null;

    const headerAsOnDate =
        formatHeaderAsOnDate(selectedAsOnDate);

    /* =====================================================
       RETURN
    ===================================================== */

    return (
        <div className="page-content relative operating-analysis-page">
            <style>{operatingAnalysisUniformStyles}</style>

            <div className="oa-header-wrap">
                <div className="oa-direct-header">
                    <div className="oa-direct-header-content">
                        <h1 className="oa-direct-title">
                            Operating Expenses Analysis
                        </h1>

                        <p className="oa-direct-subtitle">
                            Detailed Operating expense performance and variance analysis across divisions.
                        </p>

                        <div className="oa-direct-meta">
                            <span>
                                <strong>As On Date:</strong>{" "}
                                {headerAsOnDate}
                            </span>

                            <span className="oa-direct-meta-divider">|</span>

                            <span className="currency-display">
                                <strong>Currency:</strong>{" "}
                                {reportingCurrency || "AED"}
                            </span>
                        </div>
                    </div>

                    <div className="oa-direct-header-actions">
                        <ExportButtons
                            exporting={
                                exporting === "expense-category-excel"
                                    ? "excel"
                                    : exporting === "expense-category-pdf"
                                        ? "pdf"
                                        : null
                            }
                            handleExport={handleExpenseCategoryExport}
                        />
                    </div>
                </div>
            </div>

            <div className="oa-filter-wrap">
                <div className="flex flex-col gap-2">

                    {/* =================================================
                    FILTERS
                ================================================= */}

                    <div>

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
                </div>

                {/* =================================================
                ERROR
            ================================================= */}

                {error && (

                    <div
                        className="oa-error"
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
                    DASHBOARD CONTENT
                ================================================= */}

                {(loading || dashboardLoading) ? (
                    <OperatingAnalysisSkeleton />
                ) : (
                    <>
                        {/* =================================================
                            SUMMARY
                        ================================================= */}

                        <div className="oa-section oa-summary">
                            <OperatingExpenseSummary
                                data={
                                    summaryData
                                }

                                reportingCurrency={
                                    reportingCurrency
                                }
                            />
                        </div>

                        {/* =================================================
                            CHARTS
                        ================================================= */}

                        <div className="oa-chart-grid">

                            <div className="oa-chart-shell">

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

                            <div className="oa-chart-shell">

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

                        <div className="oa-section oa-data-shell">
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
                        </div>

                        {/* =================================================
                            MONTH ON MONTH
                        ================================================= */}
                        <div className="oa-section oa-data-shell">
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
                    </>
                )}

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
                        ? `Detailed actual versus target expense category analysis — Amounts in ${reportingCurrency || "AED"}`
                        : `Detailed operating expense composition by category — Amounts in ${reportingCurrency || "AED"}`
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

            <div className="oa-footer">
                <FooterNote
                    title="Note:"
                    message={`All values are in ${reportingCurrency}, | Last Updated On ${formatDateDDMMYYYY(dataAsOf)}`}
                    showRefresh={false}
                />

                <span
                    style={{
                        marginLeft: "auto",
                        whiteSpace: "nowrap",
                        fontSize: 12,
                        color: "#64748B",
                    }}
                >
                    ☁️ Source: Oracle Fusion Cloud
                </span>
            </div>
        </div>
    );
}