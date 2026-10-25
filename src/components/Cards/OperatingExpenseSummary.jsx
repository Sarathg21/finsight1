

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    LineChart,
    Target,
    TrendingUp,
    Percent,
    BarChart3,
} from "lucide-react";

/* =========================================================
   ANIMATED NUMBER
========================================================= */
const AnimatedNumber = ({ value, formatter, duration = 900 }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const animationFrameRef = useRef(null);
    const previousValueRef = useRef(null);

    useEffect(() => {
        if (value === null || value === undefined || value === "") {
            setDisplayValue(null);
            previousValueRef.current = null;
            return undefined;
        }

        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
            setDisplayValue(null);
            previousValueRef.current = null;
            return undefined;
        }

        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        const startValue =
            previousValueRef.current !== null &&
                Number.isFinite(Number(previousValueRef.current))
                ? Number(previousValueRef.current)
                : 0;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue =
                startValue + (numericValue - startValue) * easedProgress;

            setDisplayValue(currentValue);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayValue(numericValue);
                previousValueRef.current = numericValue;
                animationFrameRef.current = null;
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [value, duration]);

    if (displayValue === null || displayValue === undefined) {
        return <>—</>;
    }

    return <>{formatter(displayValue)}</>;
};

/* =========================================================
   FORMATTERS
   Currency inputs are expected to be raw amounts; display in millions.
========================================================= */
const formatCurrency = (value, currency = "AED") => {
    if (value === null || value === undefined || value === "") return "—";

    const number = Number(value);
    if (!Number.isFinite(number)) return "—";

    return `${currency} ${(number / 1000000).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}M`;
};

const formatCompactTarget = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    return `${(number / 1000000).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}M`;
};

const formatPercentage = (value) => {
    if (value === null || value === undefined || value === "") return "—";

    const number = Number(value);
    if (!Number.isFinite(number)) return "—";

    return `${number.toFixed(1)}%`;
};

/* Backend percentage is displayed directly; no variance is calculated here. */
const formatVariance = (value) => {
    if (value === null || value === undefined || value === "") return "—";

    const number = Number(value);
    if (!Number.isFinite(number)) return "—";

    const arrow = number < 0 ? "▼" : "▲";
    return `${arrow} ${Math.abs(number).toFixed(2)}%`;
};

const formatRawValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";

    const number = Number(value);
    if (!Number.isFinite(number)) return String(value);

    return number.toLocaleString("en-US", { maximumFractionDigits: 2 });
};

/* API status is authoritative. Sign is only the fallback. */
const getVarianceStatusColor = (varianceStatus, varianceValue) => {
    const status = String(varianceStatus ?? "").trim().toUpperCase();

    if (status === "FAVOURABLE") return "#16A34A";
    if (status === "UNFAVOURABLE") return "#DC2626";

    if (varianceValue === null || varianceValue === undefined || varianceValue === "") {
        return "#64748B";
    }

    const numericVariance = Number(varianceValue);
    if (!Number.isFinite(numericVariance)) return "#64748B";
    if (numericVariance < 0) return "#16A34A";
    if (numericVariance > 0) return "#DC2626";

    return "#64748B";
};

/* =========================================================
   KPI CARD
========================================================= */
function OpexKpiCard({
    title,
    value,
    Icon,
    iconColor,
    iconBackground,
    titleColor,
    titleBackground,
    showUnfavorable = false,
    isPercentage = false,
    reportingCurrency = "AED",
    targetValue = null,
    varianceValue = null,
    varianceStatus = null,
    showTargetVarianceRow = true,
    showTooltip = true,
    tooltipValueOnly = false,
}) {
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef(null);
    const tooltipRef = useRef(null);
    const [tooltipPosition, setTooltipPosition] = useState({ bottom: 0, left: 0 });

    const hasTarget =
        targetValue !== null && targetValue !== undefined && targetValue !== "";
    const hasVariance =
        varianceValue !== null && varianceValue !== undefined && varianceValue !== "";

    const varianceColor = getVarianceStatusColor(varianceStatus, varianceValue);
    const normalizedStatus = String(varianceStatus ?? "").trim().toUpperCase();
    const statusIndicatorColor =
        normalizedStatus === "FAVOURABLE"
            ? "#22C55E"
            : normalizedStatus === "UNFAVOURABLE"
                ? "#EF4444"
                : varianceColor;

    const modernCurrentValue = isPercentage
        ? formatPercentage(value)
        : formatCurrency(value, reportingCurrency);
    const modernTargetValue = hasTarget
        ? formatCurrency(targetValue, reportingCurrency)
        : "—";
    const modernVarianceValue = hasVariance
        ? formatVariance(varianceValue)
        : "—";

    const updateTooltipPosition = () => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const tooltipWidth = 255;
        const horizontalPadding = 12;
        const halfWidth = tooltipWidth / 2;
        const left = Math.max(
            horizontalPadding + halfWidth,
            Math.min(
                rect.left + rect.width / 2,
                window.innerWidth - horizontalPadding - halfWidth
            )
        );

        setTooltipPosition({
            bottom: Math.max(12, window.innerHeight - rect.top + 10),
            left,
        });
    };

    useEffect(() => {
        if (!isHovered) return undefined;

        updateTooltipPosition();

        const handlePositionUpdate = () => updateTooltipPosition();
        window.addEventListener("resize", handlePositionUpdate);
        window.addEventListener("scroll", handlePositionUpdate, true);

        return () => {
            window.removeEventListener("resize", handlePositionUpdate);
            window.removeEventListener("scroll", handlePositionUpdate, true);
        };
    }, [isHovered]);

    return (
        <>
            <div
                ref={cardRef}
                onMouseEnter={() => {
                    if (!showTooltip) return;
                    updateTooltipPosition();
                    setIsHovered(true);
                }}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    flex: "1 1 0",
                    minWidth: 0,
                    height: 94,
                    minWidth: 0,
                    background: iconBackground,
                    border: `1px solid ${isHovered ? `${iconColor}35` : "transparent"}`,
                    borderRadius: 12,
                    boxSizing: "border-box",
                    padding: "10px 11px",
                    display: "flex",
                    alignItems: "center",
                    overflow: "visible",
                    transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                    boxShadow: isHovered
                        ? `0 10px 24px ${iconColor}25`
                        : "0 2px 8px rgba(15, 23, 42, 0.05)",
                    transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
                    position: "relative",
                    zIndex: isHovered ? 20 : 1,
                    cursor: "default",
                }}
            >
                <div
                    style={{
                        width: 38,
                        height: 38,
                        minWidth: 38,
                        borderRadius: "50%",
                        background: iconBackground,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 9,
                        boxSizing: "border-box",
                        color: iconColor,
                    }}
                >
                    <Icon size={21} strokeWidth={2.35} color={iconColor} />
                </div>

                <div
                    style={{
                        minWidth: 0,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        overflow: "hidden",
                    }}
                >
                    <div
                        title={title}
                        style={{
                            color: titleColor,
                            fontSize: 11.5,
                            lineHeight: "14px",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            marginBottom: 2,
                        }}
                    >
                        {title}
                    </div>

                    <div
                        title={isPercentage ? formatPercentage(value) : formatCurrency(value, reportingCurrency)}
                        style={{
                            fontSize: 17,
                            lineHeight: "21px",
                            fontWeight: 800,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            letterSpacing: "-0.25px",
                        }}
                    >
                        <AnimatedNumber
                            value={value}
                            formatter={
                                isPercentage
                                    ? formatPercentage
                                    : (animatedValue) => formatCurrency(animatedValue, reportingCurrency)
                            }
                        />
                    </div>

                    {/* Target/variance strip is optional for target-only KPI cards. */}
                    {showTargetVarianceRow && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                marginTop: 3,
                                padding: "3px 5px",
                                borderRadius: 5,
                                background: "rgba(255,255,255,0.68)",
                                fontSize: 9.5,
                                lineHeight: "12px",
                                fontWeight: 600,
                                width: "100%",
                                minWidth: 0,
                                maxWidth: "100%",
                                boxSizing: "border-box",
                                overflow: "hidden",
                            }}
                        >
                            <span
                                title={hasTarget ? `Target: ${formatCurrency(targetValue, reportingCurrency)}` : "Target: —"}
                                style={{
                                    color: "#64748B",
                                    flex: "1 1 auto",
                                    minWidth: 0,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    fontSize: 9.5,
                                    fontWeight: 600,
                                }}
                            >
                                Target: {hasTarget ? formatCompactTarget(targetValue) : "—"}
                            </span>

                            <span
                                title={hasVariance ? `Variance: ${formatVariance(varianceValue)}` : "Variance: —"}
                                style={{
                                    color: varianceColor,
                                    fontWeight: 700,
                                    flex: "0 0 auto",
                                    whiteSpace: "nowrap",
                                    fontSize: 9.5,
                                }}
                            >
                                {formatVariance(varianceValue)}
                            </span>
                        </div>
                    )}

                    {showUnfavorable && (
                        <div
                            style={{
                                marginTop: 2,
                                fontSize: 9,
                                lineHeight: "11px",
                                fontWeight: 600,
                                color: varianceColor,
                                whiteSpace: "nowrap",
                            }}
                        >
                            Unfavorable
                        </div>
                    )}
                </div>
            </div>

            {showTooltip && typeof document !== "undefined" &&
                createPortal(
                    <div
                        ref={tooltipRef}
                        style={{
                            position: "fixed",
                            bottom: tooltipPosition.bottom,
                            left: tooltipPosition.left,
                            transform: isHovered
                                ? "translate(-50%, 0)"
                                : "translate(-50%, 8px)",
                            width: 255,
                            maxWidth: "calc(100vw - 24px)",
                            padding: 14,
                            borderRadius: 13,
                            background: "linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))",
                            border: "1px solid rgba(255, 255, 255, 0.10)",
                            boxShadow: "0 20px 45px rgba(15, 23, 42, 0.32), 0 5px 15px rgba(15, 23, 42, 0.18)",
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                            color: "#FFFFFF",
                            opacity: isHovered ? 1 : 0,
                            visibility: isHovered ? "visible" : "hidden",
                            pointerEvents: "none",
                            transition: "opacity 180ms ease, transform 180ms ease, visibility 180ms ease",
                            zIndex: 100000,
                            boxSizing: "border-box",
                            fontFamily: "inherit",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 16,
                                right: 16,
                                height: 2,
                                borderRadius: "0 0 4px 4px",
                                background: `linear-gradient(90deg, ${iconColor}, ${statusIndicatorColor})`,
                            }}
                        />

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 9,
                                marginBottom: 11,
                                paddingTop: 2,
                            }}
                        >
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    minWidth: 28,
                                    borderRadius: 8,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: `${iconColor}20`,
                                    border: `1px solid ${iconColor}35`,
                                    color: iconColor,
                                }}
                            >
                                <Icon size={15} strokeWidth={2.3} color={iconColor} />
                            </div>

                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div
                                    style={{
                                        fontSize: 11.5,
                                        lineHeight: "15px",
                                        fontWeight: 800,
                                        color: "#FFFFFF",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {title}
                                </div>
                            </div>

                            <div
                                style={{
                                    width: 8,
                                    height: 8,
                                    minWidth: 8,
                                    borderRadius: "50%",
                                    background: statusIndicatorColor,
                                    boxShadow: `0 0 0 4px ${statusIndicatorColor}20`,
                                }}
                            />
                        </div>

                        <div
                            style={{
                                padding: "10px 11px",
                                marginBottom: 8,
                                borderRadius: 9,
                                background: "rgba(255, 255, 255, 0.07)",
                                border: "1px solid rgba(255, 255, 255, 0.07)",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 8.5,
                                    fontWeight: 700,
                                    color: "#94A3B8",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    marginBottom: 3,
                                }}
                            >
                                Current Value
                            </div>
                            <div
                                style={{
                                    fontSize: 17,
                                    lineHeight: "21px",
                                    fontWeight: 800,
                                    color: "#FFFFFF",
                                    letterSpacing: "-0.3px",
                                    overflowWrap: "anywhere",
                                }}
                            >
                                {modernCurrentValue}
                            </div>
                        </div>

                        {!tooltipValueOnly && (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                                    gap: 7,
                                    marginBottom: 8,
                                }}
                            >
                                <div
                                    style={{
                                        padding: "8px 9px",
                                        borderRadius: 8,
                                        background: "rgba(255, 255, 255, 0.045)",
                                        border: "1px solid rgba(255, 255, 255, 0.055)",
                                        minWidth: 0,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 8,
                                            fontWeight: 700,
                                            color: "#94A3B8",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.4px",
                                            marginBottom: 4,
                                        }}
                                    >
                                        Target
                                    </div>
                                    <div
                                        title={modernTargetValue}
                                        style={{
                                            fontSize: 10.5,
                                            fontWeight: 700,
                                            color: "#E2E8F0",
                                            whiteSpace: "normal",
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {modernTargetValue}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        padding: "8px 9px",
                                        borderRadius: 8,
                                        background: `${varianceColor}12`,
                                        border: `1px solid ${varianceColor}25`,
                                        minWidth: 0,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 8,
                                            fontWeight: 700,
                                            color: "#94A3B8",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.4px",
                                            marginBottom: 4,
                                        }}
                                    >
                                        Variance
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10.5,
                                            fontWeight: 800,
                                            color: varianceColor,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {modernVarianceValue}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>,
                    document.body
                )}
        </>
    );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function OperatingExpenseSummary({
    data = {},
    reportingCurrency = "AED",
}) {
    const kpiData = {
        actualPTD:
            data.actual_ptd ??
            data.actual_ptd_aed ??
            data.actualPTD ??
            null,

        targetPTD:
            data.target_ptd ??
            data.target_ptd_aed ??
            data.targetPTD ??
            null,

        variancePTD:
            data.variance_ptd ??
            data.variance_ptd_aed ??
            data.variancePTD ??
            null,

        /* API percentage is used directly; no frontend calculation. */
        variancePTDPercent:
            data.variance_ptd_pct ??
            data.variancePTDPercent ??
            null,

        variancePTDStatus:
            data.variance_ptd_status ??
            data.variancePTDStatus ??
            null,

        actualYTD:
            data.actual_ytd ??
            data.actual_ytd_aed ??
            data.actualYTD ??
            null,

        targetYTD:
            data.target_ytd ??
            data.target_ytd_aed ??
            data.targetYTD ??
            null,

        varianceYTD:
            data.variance_ytd ??
            data.variance_ytd_aed ??
            data.varianceYTD ??
            null,

        /* API percentage is used directly; no frontend calculation. */
        varianceYTDPercent:
            data.variance_ytd_pct ??
            data.varianceYTDPercent ??
            null,

        varianceYTDStatus:
            data.variance_ytd_status ??
            data.varianceYTDStatus ??
            null,

        actualOpexRatioYTD:
            data.actual_opex_ratio_ytd ?? data.actual_opex_ratio_ytd_pct ??
            data.actualOpexRatioYTD ?? data.actualOpexRatioYtd ?? null,
        targetOpexRatioYTD:
            data.target_opex_ratio_ytd ?? data.target_opex_ratio_ytd_pct ??
            data.targetOpexRatioYTD ?? data.targetOpexRatioYtd ?? null,
        actualOpexRatioYTDVariance:
            data.actual_opex_ratio_ytd_variance_pct ?? data.opex_ratio_ytd_variance_pct ??
            data.actualOpexRatioYTDVariance ?? null,
        targetOpexRatioYTDVariance:
            data.target_opex_ratio_ytd_variance_pct ?? data.targetOpexRatioYTDVariance ?? null,
    };

    return (
        <>
            <style>{`
          @media (max-width: 1180px) { .opex-summary-kpi-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; } }
          @media (max-width: 760px) { .opex-summary-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
          @media (max-width: 480px) { .opex-summary-kpi-grid { grid-template-columns: minmax(0, 1fr) !important; } }
        `}</style>
            <div
                style={{
                    width: "100%",
                    background: "#F8FAFC",
                    border: "none",
                    borderRadius: 10,
                    boxSizing: "border-box",
                    overflow: "visible",
                }}
            >
                <div
                    style={{
                        minHeight: 38,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 9px",
                        boxSizing: "border-box",
                        background: "#F8FAFC",
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            fontSize: 13,
                            lineHeight: "15px",
                            fontWeight: 700,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Operating Expense Summary
                    </h3>
                </div>


                <div
                    className="opex-summary-kpi-grid"
                    style={{
                        width: "100%",
                        display: "grid",
                        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                        alignItems: "stretch",
                        gap: 9,
                        padding: 7,
                        boxSizing: "border-box",
                        overflow: "visible",
                        background: "#F8FAFC",
                    }}
                >
                    {/* Row 1 — Actual PTD, Actual YTD, Variance PTD,
        Variance PTD %, Actual OPEX Ratio YTD */}
                    <OpexKpiCard
                        title="Actual PTD"
                        value={kpiData.actualPTD}
                        Icon={LineChart}
                        iconColor="#2563EB"
                        iconBackground="#EFF6FF"
                        titleColor="#2563EB"
                        titleBackground="#EFF4FF"
                        reportingCurrency={reportingCurrency}
                        targetValue={kpiData.targetPTD}
                        varianceValue={kpiData.variancePTDPercent}
                        varianceStatus={kpiData.variancePTDStatus}
                    />

                    <OpexKpiCard
                        title="Actual YTD"
                        value={kpiData.actualYTD}
                        Icon={BarChart3}
                        iconColor="#0891B2"
                        iconBackground="#ECFEFF"
                        titleColor="#0891B2"
                        titleBackground="#EFFBFC"
                        reportingCurrency={reportingCurrency}
                        targetValue={kpiData.targetYTD}
                        varianceValue={kpiData.varianceYTDPercent}
                        varianceStatus={kpiData.varianceYTDStatus}
                    />

                    <OpexKpiCard
                        title="Variance PTD"
                        value={kpiData.variancePTD}
                        Icon={TrendingUp}
                        iconColor="#F97316"
                        iconBackground="#FFF7ED"
                        titleColor="#EA580C"
                        titleBackground="#FFF6E9"
                        reportingCurrency={reportingCurrency}
                        targetValue={kpiData.targetPTD}
                        varianceValue={kpiData.variancePTDPercent}
                        varianceStatus={kpiData.variancePTDStatus}
                    />

                    <OpexKpiCard
                        title="Variance PTD %"
                        value={kpiData.variancePTDPercent}
                        Icon={Percent}
                        iconColor="#DB2777"
                        iconBackground="#FDF2F8"
                        titleColor="#DB2777"
                        titleBackground="#FFF1F5"
                        isPercentage
                        reportingCurrency={reportingCurrency}
                        targetValue={null}
                        varianceValue={kpiData.variancePTDPercent}
                        varianceStatus={kpiData.variancePTDStatus}
                    />

                    <OpexKpiCard
                        title="Actual OPEX Ratio YTD"
                        value={kpiData.actualOpexRatioYTD}
                        Icon={BarChart3}
                        iconColor="#6D28D9"
                        iconBackground="#F5F3FF"
                        titleColor="#6D28D9"
                        titleBackground="#F5F3FF"
                        isPercentage
                        reportingCurrency={reportingCurrency}
                        targetValue={kpiData.targetOpexRatioYTD}
                        varianceValue={kpiData.actualOpexRatioYTDVariance}
                    />

                    {/* Target-only cards: intentionally hide the lower Target/Variance strip
        and the custom hover tooltip on these three cards only. */}
                    {/* Row 2 — Target PTD, Target YTD, Variance YTD,
        Variance YTD %, Target OPEX Ratio YTD */}
                    <OpexKpiCard
                        title="Target PTD"
                        value={kpiData.targetPTD}
                        Icon={Target}
                        iconColor="#16A34A"
                        iconBackground="#ECFDF3"
                        titleColor="#16A34A"
                        titleBackground="#F0FBF3"
                        reportingCurrency={reportingCurrency}
                        targetValue={kpiData.targetPTD}
                        varianceValue={kpiData.variancePTDPercent}
                        varianceStatus={kpiData.variancePTDStatus}
                        showTargetVarianceRow={false}
                        tooltipValueOnly={true}
                    />

                    <OpexKpiCard
                        title="Target YTD"
                        value={kpiData.targetYTD}
                        Icon={Target}
                        iconColor="#7C3AED"
                        iconBackground="#F5F3FF"
                        titleColor="#7C3AED"
                        titleBackground="#F5F3FF"
                        reportingCurrency={reportingCurrency}
                        targetValue={kpiData.targetYTD}
                        varianceValue={kpiData.varianceYTDPercent}
                        varianceStatus={kpiData.varianceYTDStatus}
                        showTargetVarianceRow={false}
                        tooltipValueOnly={true}
                    />

                    <OpexKpiCard
                        title="Variance YTD"
                        value={kpiData.varianceYTD}
                        Icon={TrendingUp}
                        iconColor="#F97316"
                        iconBackground="#FFF7ED"
                        titleColor="#EA580C"
                        titleBackground="#FFF6E9"
                        reportingCurrency={reportingCurrency}
                        targetValue={kpiData.targetYTD}
                        varianceValue={kpiData.varianceYTDPercent}
                        varianceStatus={kpiData.varianceYTDStatus}
                    />

                    <OpexKpiCard
                        title="Variance YTD %"
                        value={kpiData.varianceYTDPercent}
                        Icon={Percent}
                        iconColor="#DB2777"
                        iconBackground="#FDF2F8"
                        titleColor="#DB2777"
                        titleBackground="#FFF1F5"
                        isPercentage
                        reportingCurrency={reportingCurrency}
                        targetValue={null}
                        varianceValue={kpiData.varianceYTDPercent}
                        varianceStatus={kpiData.varianceYTDStatus}
                    />

                    <OpexKpiCard
                        title="Target OPEX Ratio YTD"
                        value={kpiData.targetOpexRatioYTD}
                        Icon={BarChart3}
                        iconColor="#7C3AED"
                        iconBackground="#F5F3FF"
                        titleColor="#7C3AED"
                        titleBackground="#F5F3FF"
                        isPercentage
                        reportingCurrency={reportingCurrency}
                        targetValue={kpiData.targetOpexRatioYTD}
                        varianceValue={kpiData.targetOpexRatioYTDVariance}
                        showTargetVarianceRow={false}
                        tooltipValueOnly={true}
                    />
                </div>

            </div>
        </>
    );
}
