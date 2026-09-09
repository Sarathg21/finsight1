
import React, {
    useMemo,
    useState,
    useRef,
    useEffect,
} from "react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

import {
    MoreVertical,
    Eye,
} from "lucide-react";

import ExportButtons from "../Common/ExportButtons";


/* =========================================================
   FORMAT VALUE
========================================================= */

const formatValue = (value) => {
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

    return number.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};


/* =========================================================
   NORMALIZE CHART DATA
========================================================= */

const normalizeChartData = (data = []) => {
    if (!Array.isArray(data)) {
        return [];
    }

    return data.map((item) => {
        const actual =
            item?.actual !== undefined
                ? item.actual
                : item?.actual_ptd_aed;

        const target =
            item?.target !== undefined
                ? item.target
                : item?.target_ptd_aed;

        return {
            category: item?.category ?? "—",

            actual:
                actual !== null &&
                    actual !== undefined &&
                    actual !== ""
                    ? Number(actual)
                    : null,

            target:
                target !== null &&
                    target !== undefined &&
                    target !== ""
                    ? Number(target)
                    : null,
        };
    });
};


/* =========================================================
   CUSTOM TOOLTIP
========================================================= */

function CustomTooltip({
    active,
    payload,
    label,
    reportingCurrency = "AED",
}) {
    if (
        !active ||
        !payload ||
        !payload.length
    ) {
        return null;
    }

    return (
        <div
            style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 7,
                padding: "9px 11px",
                boxShadow:
                    "0 4px 12px rgba(15, 23, 42, 0.10)",
                minWidth: 165,
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 7,
                }}
            >
                {label}
            </div>

            {payload.map((item) => {
                const value = item?.value;

                return (
                    <div
                        key={item.dataKey}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                                "space-between",
                            gap: 15,
                            marginTop: 5,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <span
                                style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "2px",
                                    backgroundColor:
                                        item.color,
                                    display:
                                        "inline-block",
                                }}
                            />

                            <span
                                style={{
                                    fontSize: 12,
                                    color: "#64748B",
                                }}
                            >
                                {item.name}
                            </span>
                        </div>

                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#0F172A",
                            }}
                        >
                            {formatValue(value) === "—"
                                ? "—"
                                : `${reportingCurrency} ${formatValue(value)}`}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}


/* =========================================================
   CUSTOM Y AXIS LABEL
========================================================= */

function CustomYAxisTick({
    x,
    y,
    payload,
}) {
    const text = payload.value;

    return (
        <g
            transform={`translate(${x},${y})`}
        >
            <text
                x={-165}
                y={0}
                textAnchor="start"
                dominantBaseline="middle"
                fill="#1E293B"
                fontSize={12}
                fontWeight={700}
            >
                {text}
            </text>
        </g>
    );
}


/* =========================================================
   CUSTOM BAR LABEL
========================================================= */

function CustomBarLabel({
    x,
    y,
    width,
    value,
}) {
    const formatted =
        formatValue(value);

    if (formatted === "—") {
        return null;
    }

    return (
        <text
            x={x + width + 5}
            y={y + 3}
            fill="#475569"
            fontSize={12}
            fontWeight={700}
            textAnchor="start"
        >
            {formatted}
        </text>
    );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ActualVsTargetChart({
    data = [],

    /* Parent page handlers */
    total,
    activeFilters,
    reportingCurrency = "AED",
    onDrillDown,
    onViewAll,
    onExportExcel,
    onExportPdf,
    exporting = "",
}) {
    /* =======================================================
       MENU STATE
    ======================================================= */

    const [menuOpen, setMenuOpen] = useState(false);

    const menuRef = useRef(null);


    /* =======================================================
       CLOSE MENU WHEN CLICKING OUTSIDE
    ======================================================= */

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener(
                "mousedown",
                handleOutsideClick
            );
        }

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, [menuOpen]);


    /* =======================================================
       MENU HANDLERS
    ======================================================= */

    const handleViewAll = async () => {
        setMenuOpen(false);

        if (typeof onViewAll === "function") {
            await onViewAll();
        }
    };


    const handleExportExcel = async () => {
        setMenuOpen(false);

        if (typeof onExportExcel === "function") {
            await onExportExcel();
        }
    };


    const handleExportPdf = async () => {
        setMenuOpen(false);

        if (typeof onExportPdf === "function") {
            await onExportPdf();
        }
    };


    /* =======================================================
       COMMON EXPORT HANDLER
    ======================================================= */

    const handleExport = async (type) => {
        if (type === "excel") {
            await handleExportExcel();
            return;
        }

        if (type === "pdf") {
            await handleExportPdf();
        }
    };


    /* =======================================================
       EXPORTING STATE FOR COMMON COMPONENT
    ======================================================= */

    const commonExporting =
        exporting === "composition-excel"
            ? "excel"
            : exporting === "composition-pdf"
                ? "pdf"
                : "";


    /* =======================================================
       NORMALIZED DATA
    ======================================================= */

    const chartData = useMemo(
        () => normalizeChartData(data),
        [data]
    );


    /* =======================================================
       X AXIS MAXIMUM
    ======================================================= */

    const xAxisMax = useMemo(() => {
        const values = chartData
            .flatMap((item) => [
                item.actual,
                item.target,
            ])
            .filter(
                (value) =>
                    value !== null &&
                    value !== undefined &&
                    !Number.isNaN(value)
            );

        if (!values.length) {
            return 1000;
        }

        const maxValue = Math.max(...values);

        const calculatedMax =
            maxValue * 1.2;

        if (calculatedMax <= 1000) {
            return 1000;
        }

        if (calculatedMax <= 5000) {
            return 5000;
        }

        if (calculatedMax <= 10000) {
            return 10000;
        }

        if (calculatedMax <= 25000) {
            return 25000;
        }

        if (calculatedMax <= 50000) {
            return 50000;
        }

        if (calculatedMax <= 100000) {
            return 100000;
        }

        if (calculatedMax <= 250000) {
            return 250000;
        }

        if (calculatedMax <= 500000) {
            return 500000;
        }

        if (calculatedMax <= 1000000) {
            return 1000000;
        }

        return (
            Math.ceil(
                calculatedMax / 1000000
            ) * 1000000
        );
    }, [chartData]);


    /* =========================================================
       X AXIS TICK FORMAT
    ========================================================= */

    const formatXAxis = (value) => {
        if (value === 0) {
            return "0";
        }

        if (value >= 1000000) {
            return `${(
                value / 1000000
            ).toFixed(
                value % 1000000 === 0 ? 0 : 1
            )}M`;
        }

        if (value >= 1000) {
            return `${Math.round(
                value / 1000
            )}K`;
        }

        return `${Math.round(value)}`;
    };


    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                minHeight: 275,
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                padding: "12px 12px 8px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
            }}
        >

            {/* ===================================================
                HEADER
            =================================================== */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "space-between",
                    marginBottom: 2,
                    position: "relative",
                }}
            >

                <h3
                    style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: "18px",
                        fontWeight: 700,
                        color: "#0F172A",
                    }}
                >
                    Actual vs Target by Expense Category
                </h3>


                {/* =================================================
                    THREE DOT MENU
                ================================================= */}

                <div
                    ref={menuRef}
                    style={{
                        position: "relative",
                    }}
                >

                    <button
                        type="button"
                        onClick={() =>
                            setMenuOpen(
                                (prev) => !prev
                            )
                        }
                        aria-label="Chart options"
                        aria-expanded={menuOpen}
                        style={{
                            border: "none",
                            background:
                                "transparent",
                            padding: "4px",
                            cursor: "pointer",
                            color: "#64748B",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 5,
                        }}
                    >
                        <MoreVertical
                            size={17}
                            strokeWidth={2}
                        />
                    </button>


                    {/* =================================================
                        ACTION MENU
                    ================================================= */}

                    {menuOpen && (
                        <div
                            style={{
                                position: "absolute",
                                top: 28,
                                right: 0,
                                minWidth: 165,
                                background: "#FFFFFF",
                                border:
                                    "1px solid #E5E7EB",
                                borderRadius: 8,
                                boxShadow:
                                    "0 8px 24px rgba(15, 23, 42, 0.12)",
                                padding: "5px 0",
                                zIndex: 100,
                            }}
                        >

                            {/* =================================================
                                VIEW ALL
                            ================================================= */}

                            <button
                                type="button"
                                onClick={
                                    handleViewAll
                                }
                                disabled={
                                    !onViewAll
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
                                        onViewAll
                                            ? "pointer"
                                            : "not-allowed",
                                    textAlign:
                                        "left",
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color:
                                        "#334155",
                                    opacity:
                                        onViewAll
                                            ? 1
                                            : 0.5,
                                }}
                                onMouseEnter={(
                                    event
                                ) => {
                                    if (onViewAll) {
                                        event.currentTarget.style.background =
                                            "#F8FAFC";
                                    }
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


                            {/* =================================================
                                EXPORT EXCEL
                            ================================================= */}

                            <button
                                type="button"
                                onClick={
                                    handleExportExcel
                                }
                                disabled={
                                    commonExporting ===
                                    "excel"
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
                                        commonExporting ===
                                            "excel"
                                            ? "not-allowed"
                                            : "pointer",
                                    textAlign:
                                        "left",
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color:
                                        "#334155",
                                    opacity:
                                        commonExporting ===
                                            "excel"
                                            ? 0.6
                                            : 1,
                                }}
                                onMouseEnter={(
                                    event
                                ) => {
                                    if (
                                        commonExporting !==
                                        "excel"
                                    ) {
                                        event.currentTarget.style.background =
                                            "#F8FAFC";
                                    }
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


                            {/* =================================================
                                EXPORT PDF
                            ================================================= */}

                            <button
                                type="button"
                                onClick={
                                    handleExportPdf
                                }
                                disabled={
                                    commonExporting ===
                                    "pdf"
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
                                        commonExporting ===
                                            "pdf"
                                            ? "not-allowed"
                                            : "pointer",
                                    textAlign:
                                        "left",
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color:
                                        "#334155",
                                    opacity:
                                        commonExporting ===
                                            "pdf"
                                            ? 0.6
                                            : 1,
                                }}
                                onMouseEnter={(
                                    event
                                ) => {
                                    if (
                                        commonExporting !==
                                        "pdf"
                                    ) {
                                        event.currentTarget.style.background =
                                            "#F8FAFC";
                                    }
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


            {/* ===================================================
                CHART
            =================================================== */}

            <div
                style={{
                    flex: 1,
                    minHeight: 235,
                    width: "100%",
                }}
            >

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{
                            top: 20,
                            right: 50,
                            left: 25,
                            bottom: 20,
                        }}
                        barGap={2}
                        barCategoryGap="25%"
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                            stroke="#E5E7EB"
                        />


                        {/* =================================================
                            X AXIS
                        ================================================= */}

                        <XAxis
                            type="number"
                            domain={[
                                0,
                                xAxisMax,
                            ]}
                            axisLine={{
                                stroke: "#CBD5E1",
                            }}
                            tickLine={false}
                            tick={{
                                fill: "#475569",
                                fontSize: 11,
                                fontWeight: 700,
                            }}
                            tickFormatter={
                                formatXAxis
                            }
                        />


                        {/* =================================================
                            Y AXIS
                        ================================================= */}

                        <YAxis
                            type="category"
                            dataKey="category"
                            width={175}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            tick={
                                <CustomYAxisTick />
                            }
                        />


                        {/* =================================================
                            TOOLTIP
                        ================================================= */}

                        <Tooltip
                            content={
                                <CustomTooltip
                                    reportingCurrency={
                                        reportingCurrency
                                    }
                                />
                            }
                            cursor={{
                                fill:
                                    "rgba(148, 163, 184, 0.08)",
                            }}
                        />


                        {/* =================================================
                            LEGEND
                        ================================================= */}

                        <Legend
                            verticalAlign="top"
                            align="center"
                            height={27}
                            iconType="square"
                            iconSize={8}
                            wrapperStyle={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#334155",
                                paddingLeft: 125,
                                paddingBottom: 2,
                            }}
                        />


                        {/* =================================================
                            ACTUAL
                        ================================================= */}

                        <Bar
                            dataKey="actual"
                            name={`Actual PTD (${reportingCurrency})`}
                            fill="#5B3FE4"
                            radius={[
                                0,
                                3,
                                3,
                                0,
                            ]}
                            maxBarSize={9}
                            label={
                                <CustomBarLabel />
                            }
                        />


                        {/* =================================================
                            TARGET
                        ================================================= */}

                        <Bar
                            dataKey="target"
                            name={`Target PTD (${reportingCurrency})`}
                            fill="#B8AEEC"
                            radius={[
                                0,
                                3,
                                3,
                                0,
                            ]}
                            maxBarSize={9}
                            label={
                                <CustomBarLabel />
                            }
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>


            {/* ===================================================
                X AXIS TITLE
            =================================================== */}

            <div
                style={{
                    textAlign: "center",
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#334155",
                    marginTop: -2,
                }}
            >
                Amount ({reportingCurrency})
            </div>

        </div>
    );
}
