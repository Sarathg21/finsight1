

// import React, { useEffect, useRef, useState } from "react";
// import {
//     LineChart,
//     Target,
//     TrendingUp,
//     Percent,
//     BarChart3,
// } from "lucide-react";

// /* =========================================================
//    ANIMATED NUMBER
// ========================================================= */

// const AnimatedNumber = ({
//     value,
//     formatter,
//     duration = 900,
// }) => {
//     const [displayValue, setDisplayValue] = useState(0);

//     const animationFrameRef = useRef(null);
//     const previousValueRef = useRef(null);

//     useEffect(() => {
//         /* =====================================================
//            NULL / EMPTY VALUE
//         ===================================================== */

//         if (
//             value === null ||
//             value === undefined ||
//             value === ""
//         ) {
//             setDisplayValue(null);
//             previousValueRef.current = null;

//             return;
//         }

//         const numericValue = Number(value);

//         if (Number.isNaN(numericValue)) {
//             setDisplayValue(null);
//             previousValueRef.current = null;

//             return;
//         }

//         /* =====================================================
//            CANCEL PREVIOUS ANIMATION
//         ===================================================== */

//         if (animationFrameRef.current) {
//             cancelAnimationFrame(
//                 animationFrameRef.current
//             );
//         }

//         /* =====================================================
//            START VALUE
//         ===================================================== */

//         const startValue =
//             previousValueRef.current !== null &&
//                 !Number.isNaN(
//                     Number(previousValueRef.current)
//                 )
//                 ? Number(previousValueRef.current)
//                 : 0;

//         const endValue = numericValue;

//         const startTime = performance.now();

//         const animate = (currentTime) => {
//             const elapsed = currentTime - startTime;

//             const progress = Math.min(
//                 elapsed / duration,
//                 1
//             );

//             /* =================================================
//                EASE OUT
//             ================================================= */

//             const easedProgress =
//                 1 - Math.pow(1 - progress, 3);

//             const currentValue =
//                 startValue +
//                 (endValue - startValue) *
//                 easedProgress;

//             setDisplayValue(currentValue);

//             if (progress < 1) {
//                 animationFrameRef.current =
//                     requestAnimationFrame(animate);
//             } else {
//                 setDisplayValue(endValue);
//                 previousValueRef.current = endValue;
//             }
//         };

//         animationFrameRef.current =
//             requestAnimationFrame(animate);

//         return () => {
//             if (animationFrameRef.current) {
//                 cancelAnimationFrame(
//                     animationFrameRef.current
//                 );
//             }
//         };
//     }, [value, duration]);

//     /* =========================================================
//        NULL DISPLAY
//     ========================================================= */

//     if (
//         displayValue === null ||
//         displayValue === undefined
//     ) {
//         return <>—</>;
//     }

//     return <>{formatter(displayValue)}</>;
// };


// /* =========================================================
//    FORMAT CURRENCY
// ========================================================= */

// const formatCurrency = (value, currency = "AED") => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === ""
//     ) {
//         return "—";
//     }

//     const number = Number(value);

//     if (Number.isNaN(number)) {
//         return "—";
//     }

//     const millions = number / 1000000;

//     return `${currency} ${millions.toLocaleString("en-US", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//     })}M`;
// };


// /* =========================================================
//    FORMAT PERCENTAGE
// ========================================================= */

// const formatPercentage = (value) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === ""
//     ) {
//         return "—";
//     }

//     const number = Number(value);

//     if (Number.isNaN(number)) {
//         return "—";
//     }

//     return `${number.toFixed(1)}%`;
// };


// /* =========================================================
//    FORMAT VARIANCE
//    Uses backend variance percentage directly.

//    IMPORTANT:
//    No variance calculation is performed here.
// ========================================================= */

// const formatVariance = (value) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === ""
//     ) {
//         return "▲ 0.00%";
//     }

//     const number = Number(value);

//     if (Number.isNaN(number)) {
//         return "—";
//     }

//     const arrow = number < 0 ? "▼" : "▲";

//     return `${arrow} ${Math.abs(number).toFixed(2)}%`;
// };


// /* =========================================================
//    FORMAT RAW TOOLTIP VALUE
// ========================================================= */

// const formatRawValue = (value) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === ""
//     ) {
//         return "—";
//     }

//     const number = Number(value);

//     if (Number.isNaN(number)) {
//         return String(value);
//     }

//     return number.toLocaleString("en-US", {
//         maximumFractionDigits: 2,
//     });
// };


// /* =========================================================
//    KPI CARD
// ========================================================= */

// function OpexKpiCard({
//     title,
//     value,
//     Icon,

//     iconColor,
//     iconBackground,

//     titleColor,
//     titleBackground,

//     showUnfavorable = false,
//     isPercentage = false,
//     reportingCurrency = "AED",

//     /* =====================================================
//        TARGET / VARIANCE
//     ===================================================== */

//     targetValue = null,
//     varianceValue = null,

// }) {

//     /* =========================================================
//        CARD HOVER
//     ========================================================= */

//     const [isHovered, setIsHovered] = useState(false);

//     /* =========================================================
//        TARGET / VARIANCE TOOLTIP HOVER
//     ========================================================= */

//     const [isTargetVarianceHovered, setIsTargetVarianceHovered] =
//         useState(false);

//     const hasTarget =
//         targetValue !== null &&
//         targetValue !== undefined &&
//         targetValue !== "";

//     const hasVariance =
//         varianceValue !== null &&
//         varianceValue !== undefined &&
//         varianceValue !== "";

//     const numericVariance = Number(varianceValue);

//     const varianceIsPositive =
//         hasVariance &&
//         !Number.isNaN(numericVariance) &&
//         numericVariance >= 0;

//     const targetTooltipValue =
//         !hasTarget
//             ? "—"
//             : `${reportingCurrency} ${formatRawValue(targetValue)}`;

//     const varianceTooltipValue =
//         !hasVariance
//             ? "—"
//             : `${formatRawValue(varianceValue)}%`;

//     return (
//         <div
//             onMouseEnter={() => setIsHovered(true)}
//             onMouseLeave={() => setIsHovered(false)}
//             style={{
//                 flex: "1 1 0",
//                 minWidth: 0,

//                 height: 82,

//                 background: `linear-gradient(
//                     145deg,
//                     #FFFFFF 0%,
//                     ${iconBackground} 100%
//                 )`,

//                 border:
//                     `1px solid ${isHovered
//                         ? `${iconColor}55`
//                         : "rgba(15, 23, 42, 0.05)"
//                     }`,

//                 borderRadius: 12,

//                 boxSizing: "border-box",

//                 padding: "10px 12px",

//                 display: "flex",
//                 alignItems: "center",

//                 overflow: "visible",

//                 /* =================================================
//                    KPI CARD HOVER EFFECT
//                    Subtle lift + stronger shadow
//                 ================================================= */

//                 transform: isHovered
//                     ? "translateY(-3px)"
//                     : "translateY(0)",

//                 boxShadow: isHovered
//                     ? `0 10px 24px ${iconColor}25`
//                     : "0 2px 8px rgba(15, 23, 42, 0.05)",

//                 transition:
//                     "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",

//                 position: "relative",

//                 zIndex: isHovered ? 20 : 1,

//                 cursor: "default",
//             }}
//         >

//             {/* =================================================
//                 ICON
//             ================================================= */}

//             <div
//                 style={{
//                     width: 44,
//                     height: 44,

//                     minWidth: 44,

//                     borderRadius: "50%",

//                     background: iconBackground,

//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",

//                     marginRight: 10,

//                     boxSizing: "border-box",

//                     color: iconColor,
//                 }}
//             >
//                 <Icon
//                     size={22}
//                     strokeWidth={2.35}
//                     color={iconColor}
//                 />
//             </div>


//             {/* =================================================
//                 CONTENT
//             ================================================= */}

//             <div
//                 style={{
//                     minWidth: 0,

//                     flex: 1,

//                     display: "flex",
//                     flexDirection: "column",

//                     justifyContent: "center",

//                     overflow: "visible",
//                 }}
//             >

//                 {/* =================================================
//                     TITLE
//                 ================================================= */}

//                 <div
//                     style={{
//                         color: titleColor,

//                         fontSize: 10.5,

//                         lineHeight: "12px",

//                         fontWeight: 700,

//                         whiteSpace: "nowrap",

//                         overflow: "hidden",

//                         textOverflow: "ellipsis",

//                         marginBottom: 2,
//                     }}
//                 >
//                     {title}
//                 </div>


//                 {/* =================================================
//                     MAIN VALUE
//                 ================================================= */}

//                 <div
//                     style={{
//                         fontSize: 15,

//                         lineHeight: "20px",

//                         fontWeight: 800,

//                         color: "#0F172A",

//                         whiteSpace: "nowrap",

//                         overflow: "hidden",

//                         textOverflow: "ellipsis",

//                         letterSpacing: "-0.25px",
//                     }}
//                 >
//                     <AnimatedNumber
//                         value={value}
//                         formatter={
//                             isPercentage
//                                 ? formatPercentage
//                                 : (animatedValue) =>
//                                     formatCurrency(
//                                         animatedValue,
//                                         reportingCurrency
//                                     )
//                         }
//                     />
//                 </div>


//                 {/* =================================================
//                     TARGET / VARIANCE
//                 ================================================= */}

//                 <div
//                     onMouseEnter={() =>
//                         setIsTargetVarianceHovered(true)
//                     }
//                     onMouseLeave={() =>
//                         setIsTargetVarianceHovered(false)
//                     }
//                     style={{
//                         position: "relative",

//                         display: "inline-flex",

//                         alignItems: "center",

//                         alignSelf: "flex-start",

//                         gap: 5,

//                         marginTop: 2,

//                         padding: "3px 6px",

//                         borderRadius: 5,

//                         background: "#EEF2F7",

//                         fontSize: 9.5,

//                         lineHeight: "11px",

//                         fontWeight: 600,

//                         whiteSpace: "nowrap",

//                         minWidth: 0,

//                         maxWidth: "100%",

//                         boxSizing: "border-box",

//                         cursor: "help",
//                     }}
//                 >

//                     {/* =================================================
//                         TARGET
//                     ================================================= */}

//                     <span
//                         style={{
//                             color: "#64748B",

//                             minWidth: 0,

//                             overflow: "hidden",

//                             textOverflow: "ellipsis",

//                             fontSize: 9.5,

//                             fontWeight: 600,
//                         }}
//                     >
//                         Target:{" "}
//                         {hasTarget
//                             ? formatCurrency(
//                                 targetValue,
//                                 reportingCurrency
//                             )
//                             : "—"}
//                     </span>


//                     {/* =================================================
//                         VARIANCE
//                     ================================================= */}

//                     <span
//                         style={{
//                             color:
//                                 !hasVariance || varianceIsPositive
//                                     ? "#16A34A"
//                                     : "#DC2626",

//                             fontWeight: 700,

//                             flexShrink: 0,

//                             fontSize: 9.5,
//                         }}
//                     >
//                         {formatVariance(
//                             varianceValue
//                         )}
//                     </span>


//                     {/* =================================================
//                         NEW TARGET / VARIANCE TOOLTIP

//                         Different style:
//                         Dark floating information card
//                     ================================================= */}

//                     {isTargetVarianceHovered && (
//                         <div
//                             style={{
//                                 position: "absolute",

//                                 left: "50%",

//                                 bottom: "calc(100% + 9px)",

//                                 transform: "translateX(-50%)",

//                                 background: "#1E293B",

//                                 color: "#FFFFFF",

//                                 padding: "9px 11px",

//                                 borderRadius: 8,

//                                 fontSize: 10,

//                                 lineHeight: "15px",

//                                 fontWeight: 500,

//                                 whiteSpace: "nowrap",

//                                 boxShadow:
//                                     "0 8px 20px rgba(15, 23, 42, 0.28)",

//                                 zIndex: 9999,

//                                 minWidth: 155,

//                                 boxSizing: "border-box",

//                                 pointerEvents: "none",
//                             }}
//                         >

//                             {/* =================================================
//                                 TOOLTIP HEADER
//                             ================================================= */}

//                             <div
//                                 style={{
//                                     fontSize: 9,

//                                     fontWeight: 700,

//                                     color: "#CBD5E1",

//                                     textTransform: "uppercase",

//                                     letterSpacing: "0.4px",

//                                     marginBottom: 5,
//                                 }}
//                             >
//                                 Backend Values
//                             </div>


//                             {/* =================================================
//                                 TARGET VALUE
//                             ================================================= */}

//                             <div
//                                 style={{
//                                     display: "flex",

//                                     justifyContent: "space-between",

//                                     gap: 14,

//                                     marginBottom: 3,
//                                 }}
//                             >
//                                 <span
//                                     style={{
//                                         color: "#CBD5E1",
//                                     }}
//                                 >
//                                     Target
//                                 </span>

//                                 <span
//                                     style={{
//                                         color: "#FFFFFF",

//                                         fontWeight: 700,
//                                     }}
//                                 >
//                                     {targetTooltipValue}
//                                 </span>
//                             </div>


//                             {/* =================================================
//                                 VARIANCE VALUE
//                             ================================================= */}

//                             <div
//                                 style={{
//                                     display: "flex",

//                                     justifyContent: "space-between",

//                                     gap: 14,
//                                 }}
//                             >
//                                 <span
//                                     style={{
//                                         color: "#CBD5E1",
//                                     }}
//                                 >
//                                     Variance
//                                 </span>

//                                 <span
//                                     style={{
//                                         color:
//                                             !hasVariance ||
//                                                 varianceIsPositive
//                                                 ? "#86EFAC"
//                                                 : "#FCA5A5",

//                                         fontWeight: 700,
//                                     }}
//                                 >
//                                     {varianceTooltipValue}
//                                 </span>
//                             </div>

//                         </div>
//                     )}

//                 </div>


//                 {/* =================================================
//                     UNFAVORABLE
//                 ================================================= */}

//                 {showUnfavorable && (
//                     <div
//                         style={{
//                             marginTop: 2,

//                             fontSize: 9,

//                             lineHeight: "11px",

//                             fontWeight: 600,

//                             color: "#DC2626",

//                             whiteSpace: "nowrap",
//                         }}
//                     >
//                         Unfavorable
//                     </div>
//                 )}

//             </div>

//         </div>
//     );
// }


// /* =========================================================
//    MAIN COMPONENT
// ========================================================= */

// export default function OperatingExpenseSummary({
//     data = {},
//     reportingCurrency = "AED",
// }) {

//     /* =========================================================
//        API RESPONSE MAPPING
//     ========================================================= */

//     const kpiData = {
//         actualPTD: null,
//         targetPTD: null,
//         variancePTD: null,
//         variancePTDPercent: null,

//         actualYTD: null,
//         targetYTD: null,
//         varianceYTD: null,
//         varianceYTDPercent: null,
//     };


//     /* =========================================================
//        PTD VALUES
//     ========================================================= */

//     kpiData.actualPTD =
//         data.actual_ptd ??
//         data.actual_ptd_aed ??
//         data.actualPTD ??
//         null;

//     kpiData.targetPTD =
//         data.target_ptd ??
//         data.target_ptd_aed ??
//         data.targetPTD ??
//         null;

//     kpiData.variancePTD =
//         data.variance_ptd ??
//         data.variance_ptd_aed ??
//         data.variancePTD ??
//         null;


//     /* =========================================================
//        BACKEND PROVIDES PERCENTAGE DIRECTLY

//        No calculation.
//     ========================================================= */

//     kpiData.variancePTDPercent =
//         data.variance_ptd_pct ??
//         data.variancePTDPercent ??
//         null;


//     /* =========================================================
//        YTD VALUES
//     ========================================================= */

//     kpiData.actualYTD =
//         data.actual_ytd ??
//         data.actual_ytd_aed ??
//         data.actualYTD ??
//         null;

//     kpiData.targetYTD =
//         data.target_ytd ??
//         data.target_ytd_aed ??
//         data.targetYTD ??
//         null;

//     kpiData.varianceYTD =
//         data.variance_ytd ??
//         data.variance_ytd_aed ??
//         data.varianceYTD ??
//         null;


//     /* =========================================================
//        BACKEND PROVIDES PERCENTAGE DIRECTLY

//        No calculation.
//     ========================================================= */

//     kpiData.varianceYTDPercent =
//         data.variance_ytd_pct ??
//         data.varianceYTDPercent ??
//         null;


//     return (
//         <div
//             style={{
//                 width: "100%",

//                 background: "#F8FAFC",

//                 border: "none",

//                 borderRadius: 10,

//                 boxSizing: "border-box",

//                 overflow: "visible",
//             }}
//         >

//             {/* ===================================================
//                 HEADER
//             =================================================== */}

//             <div
//                 style={{
//                     height: 38,

//                     display: "flex",

//                     alignItems: "center",

//                     justifyContent: "space-between",

//                     padding: "0 9px",

//                     boxSizing: "border-box",

//                     background: "#F8FAFC",
//                 }}
//             >

//                 <h3
//                     style={{
//                         margin: 0,

//                         fontSize: 13,

//                         lineHeight: "15px",

//                         fontWeight: 700,

//                         color: "#0F172A",

//                         whiteSpace: "nowrap",
//                     }}
//                 >
//                     Operating Expense Summary
//                 </h3>

//             </div>


//             {/* ===================================================
//                 KPI CARDS CONTAINER
//             =================================================== */}

//             <div
//                 style={{
//                     width: "100%",

//                     display: "flex",

//                     alignItems: "stretch",

//                     gap: 8,

//                     padding: "7px",

//                     boxSizing: "border-box",

//                     overflowX: "auto",

//                     overflowY: "visible",

//                     background: "#F8FAFC",

//                     scrollbarWidth: "thin",
//                 }}
//             >

//                 {/* =================================================
//                     1. ACTUAL PTD
//                 ================================================= */}

//                 <OpexKpiCard
//                     title="Actual PTD"
//                     value={kpiData.actualPTD}

//                     Icon={LineChart}

//                     iconColor="#2563EB"
//                     iconBackground="#EFF6FF"

//                     titleColor="#2563EB"
//                     titleBackground="#EFF4FF"

//                     reportingCurrency={reportingCurrency}

//                     targetValue={kpiData.targetPTD}

//                     varianceValue={
//                         kpiData.variancePTDPercent
//                     }
//                 />


//                 {/* =================================================
//                     2. TARGET PTD
//                 ================================================= */}

//                 <OpexKpiCard
//                     title="Target PTD"
//                     value={kpiData.targetPTD}

//                     Icon={Target}

//                     iconColor="#16A34A"
//                     iconBackground="#ECFDF3"

//                     titleColor="#16A34A"
//                     titleBackground="#F0FBF3"

//                     reportingCurrency={reportingCurrency}

//                     targetValue={kpiData.targetPTD}

//                     varianceValue={
//                         kpiData.variancePTDPercent
//                     }
//                 />


//                 {/* =================================================
//                     3. VARIANCE PTD
//                 ================================================= */}

//                 <OpexKpiCard
//                     title="Variance PTD"
//                     value={kpiData.variancePTD}

//                     Icon={TrendingUp}

//                     iconColor="#F97316"
//                     iconBackground="#FFF7ED"

//                     titleColor="#EA580C"
//                     titleBackground="#FFF6E9"

//                     reportingCurrency={reportingCurrency}

//                     targetValue={kpiData.targetPTD}

//                     varianceValue={
//                         kpiData.variancePTDPercent
//                     }
//                 />


//                 {/* =================================================
//                     4. VARIANCE PTD %
//                 ================================================= */}

//                 <OpexKpiCard
//                     title="Variance PTD %"
//                     value={kpiData.variancePTDPercent}

//                     Icon={Percent}

//                     iconColor="#DB2777"
//                     iconBackground="#FDF2F8"

//                     titleColor="#DB2777"
//                     titleBackground="#FFF1F5"

//                     isPercentage

//                     reportingCurrency={reportingCurrency}

//                     targetValue={null}

//                     varianceValue={
//                         kpiData.variancePTDPercent
//                     }
//                 />


//                 {/* =================================================
//                     5. ACTUAL YTD
//                 ================================================= */}

//                 <OpexKpiCard
//                     title="Actual YTD"
//                     value={kpiData.actualYTD}

//                     Icon={BarChart3}

//                     iconColor="#0891B2"
//                     iconBackground="#ECFEFF"

//                     titleColor="#0891B2"
//                     titleBackground="#EFFBFC"

//                     reportingCurrency={reportingCurrency}

//                     targetValue={kpiData.targetYTD}

//                     varianceValue={
//                         kpiData.varianceYTDPercent
//                     }
//                 />


//                 {/* =================================================
//                     6. TARGET YTD
//                 ================================================= */}

//                 <OpexKpiCard
//                     title="Target YTD"
//                     value={kpiData.targetYTD}

//                     Icon={Target}

//                     iconColor="#7C3AED"
//                     iconBackground="#F5F3FF"

//                     titleColor="#7C3AED"
//                     titleBackground="#F5F3FF"

//                     reportingCurrency={reportingCurrency}

//                     targetValue={kpiData.targetYTD}

//                     varianceValue={
//                         kpiData.varianceYTDPercent
//                     }
//                 />

//             </div>

//         </div>
//     );
// }


import React, {
    useEffect,
    useRef,
    useState,
} from "react";

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

const AnimatedNumber = ({
    value,
    formatter,
    duration = 900,
}) => {
    const [displayValue, setDisplayValue] =
        useState(0);

    const animationFrameRef =
        useRef(null);

    const previousValueRef =
        useRef(null);

    useEffect(() => {
        /* =====================================================
           NULL / EMPTY VALUE
        ===================================================== */

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            setDisplayValue(null);
            previousValueRef.current = null;

            return;
        }

        const numericValue = Number(value);

        if (Number.isNaN(numericValue)) {
            setDisplayValue(null);
            previousValueRef.current = null;

            return;
        }

        /* =====================================================
           CANCEL PREVIOUS ANIMATION
        ===================================================== */

        if (animationFrameRef.current) {
            cancelAnimationFrame(
                animationFrameRef.current
            );
        }

        /* =====================================================
           START VALUE
        ===================================================== */

        const startValue =
            previousValueRef.current !== null &&
            !Number.isNaN(
                Number(previousValueRef.current)
            )
                ? Number(previousValueRef.current)
                : 0;

        const endValue = numericValue;

        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed =
                currentTime - startTime;

            const progress = Math.min(
                elapsed / duration,
                1
            );

            /* =================================================
               EASE OUT
            ================================================= */

            const easedProgress =
                1 -
                Math.pow(
                    1 - progress,
                    3
                );

            const currentValue =
                startValue +
                (endValue - startValue) *
                    easedProgress;

            setDisplayValue(currentValue);

            if (progress < 1) {
                animationFrameRef.current =
                    requestAnimationFrame(
                        animate
                    );
            } else {
                setDisplayValue(endValue);

                previousValueRef.current =
                    endValue;
            }
        };

        animationFrameRef.current =
            requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(
                    animationFrameRef.current
                );
            }
        };
    }, [value, duration]);

    /* =========================================================
       NULL DISPLAY
    ========================================================= */

    if (
        displayValue === null ||
        displayValue === undefined
    ) {
        return <>—</>;
    }

    return <>{formatter(displayValue)}</>;
};


/* =========================================================
   FORMAT CURRENCY
========================================================= */

const formatCurrency = (
    value,
    currency = "AED"
) => {
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

    const millions = number / 1000000;

    return `${currency} ${millions.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}M`;
};


/* =========================================================
   FORMAT PERCENTAGE
========================================================= */

const formatPercentage = (value) => {
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

    return `${number.toFixed(1)}%`;
};


/* =========================================================
   FORMAT VARIANCE

   Uses backend variance percentage directly.

   IMPORTANT:
   No variance calculation is performed here.
========================================================= */

const formatVariance = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "▲ 0.00%";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "—";
    }

    const arrow =
        number < 0
            ? "▼"
            : "▲";

    return `${arrow} ${Math.abs(number).toFixed(2)}%`;
};


/* =========================================================
   FORMAT RAW TOOLTIP VALUE
========================================================= */

const formatRawValue = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return String(value);
    }

    return number.toLocaleString(
        "en-US",
        {
            maximumFractionDigits: 2,
        }
    );
};


/* =========================================================
   GET VARIANCE STATUS COLOR

   OPEX BUSINESS RULE:

   FAVOURABLE
   = Actual below Target
   = GREEN

   UNFAVOURABLE
   = Actual above Target
   = RED

   The API status is authoritative.

   If the API status is unavailable, fallback to the
   OPEX variance-sign rule:
   negative = favourable/green
   positive = unfavourable/red
========================================================= */

const getVarianceStatusColor = (
    varianceStatus,
    varianceValue
) => {
    const status = String(
        varianceStatus ?? ""
    )
        .trim()
        .toUpperCase();

    if (status === "FAVOURABLE") {
        return "#16A34A";
    }

    if (status === "UNFAVOURABLE") {
        return "#DC2626";
    }

    /* =====================================================
       FALLBACK ONLY WHEN API STATUS IS NOT AVAILABLE
    ===================================================== */

    const numericVariance = Number(
        varianceValue
    );

    if (
        !Number.isNaN(numericVariance) &&
        numericVariance < 0
    ) {
        return "#16A34A";
    }

    if (
        !Number.isNaN(numericVariance) &&
        numericVariance > 0
    ) {
        return "#DC2626";
    }

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

    /* =====================================================
       TARGET / VARIANCE
    ===================================================== */

    targetValue = null,
    varianceValue = null,

    /* =====================================================
       API VARIANCE STATUS

       Example:
       FAVOURABLE
       UNFAVOURABLE
    ===================================================== */

    varianceStatus = null,
}) {

    /* =========================================================
       CARD HOVER
    ========================================================= */

    const [isHovered, setIsHovered] =
        useState(false);


    /* =========================================================
       KPI CARD REF
    ========================================================= */

    const cardRef = useRef(null);


    /* =========================================================
       MODERN TOOLTIP POSITION

       Tooltip is positioned ABOVE the KPI card.
    ========================================================= */

    const [
        tooltipPosition,
        setTooltipPosition,
    ] = useState({
        top: 0,
        left: 0,
    });


    /* =========================================================
       UPDATE TOOLTIP POSITION
    ========================================================= */

    const updateTooltipPosition = () => {
        if (!cardRef.current) {
            return;
        }

        const rect =
            cardRef.current.getBoundingClientRect();

        setTooltipPosition({
            bottom:
                window.innerHeight -
                rect.top +
                10,

            left:
                rect.left +
                rect.width / 2,
        });
    };


    /* =========================================================
       UPDATE POSITION WHEN HOVERED
    ========================================================= */

    useEffect(() => {
        if (!isHovered) {
            return undefined;
        }

        updateTooltipPosition();

        const handlePositionUpdate = () => {
            updateTooltipPosition();
        };

        window.addEventListener(
            "resize",
            handlePositionUpdate
        );

        window.addEventListener(
            "scroll",
            handlePositionUpdate,
            true
        );

        return () => {
            window.removeEventListener(
                "resize",
                handlePositionUpdate
            );

            window.removeEventListener(
                "scroll",
                handlePositionUpdate,
                true
            );
        };
    }, [isHovered]);


    /* =========================================================
       HAS TARGET
    ========================================================= */

    const hasTarget =
        targetValue !== null &&
        targetValue !== undefined &&
        targetValue !== "";


    /* =========================================================
       HAS VARIANCE
    ========================================================= */

    const hasVariance =
        varianceValue !== null &&
        varianceValue !== undefined &&
        varianceValue !== "";


    /* =========================================================
       API STATUS COLOUR

       Backend status controls the colour.
    ========================================================= */

    const varianceColor =
        getVarianceStatusColor(
            varianceStatus,
            varianceValue
        );


    /* =========================================================
       MODERN TOOLTIP VALUES
    ========================================================= */

    const modernCurrentValue =
        isPercentage
            ? formatPercentage(value)
            : formatCurrency(
                  value,
                  reportingCurrency
              );


    const modernTargetValue =
        hasTarget
            ? formatCurrency(
                  targetValue,
                  reportingCurrency
              )
            : "—";


    const modernVarianceValue =
        hasVariance
            ? formatVariance(
                  varianceValue
              )
            : "—";


    /* =========================================================
       STATUS FOR VISUAL INDICATOR ONLY

       Backend status is NOT displayed as text.
    ========================================================= */

    const normalizedStatus =
        String(
            varianceStatus ?? ""
        )
            .trim()
            .toUpperCase();


    const hasFavourableStatus =
        normalizedStatus ===
        "FAVOURABLE";


    const hasUnfavourableStatus =
        normalizedStatus ===
        "UNFAVOURABLE";


    const statusIndicatorColor =
        hasFavourableStatus
            ? "#22C55E"
            : hasUnfavourableStatus
            ? "#EF4444"
            : varianceColor;


    return (
        <>
            {/* =====================================================
                KPI CARD
            ===================================================== */}

            <div
                ref={cardRef}

                onMouseEnter={() => {
                    updateTooltipPosition();

                    setIsHovered(true);
                }}

                onMouseLeave={() => {
                    setIsHovered(false);
                }}

                style={{
                    flex: "1 1 0",

                    minWidth: 0,

                    height: 82,

                    background:
                        `linear-gradient(
                            145deg,
                            #FFFFFF 0%,
                            ${iconBackground} 100%
                        )`,

                    border:
                        `1px solid ${
                            isHovered
                                ? `${iconColor}55`
                                : "rgba(15, 23, 42, 0.05)"
                        }`,

                    borderRadius: 12,

                    boxSizing:
                        "border-box",

                    padding:
                        "10px 12px",

                    display:
                        "flex",

                    alignItems:
                        "center",

                    overflow:
                        "visible",

                    /* =================================================
                       KPI CARD HOVER EFFECT
                    ================================================= */

                    transform:
                        isHovered
                            ? "translateY(-3px)"
                            : "translateY(0)",

                    boxShadow:
                        isHovered
                            ? `0 10px 24px ${iconColor}25`
                            : "0 2px 8px rgba(15, 23, 42, 0.05)",

                    transition:
                        "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",

                    position:
                        "relative",

                    zIndex:
                        isHovered
                            ? 20
                            : 1,

                    cursor:
                        "default",
                }}
            >

                {/* =================================================
                    ICON
                ================================================= */}

                <div
                    style={{
                        width: 44,

                        height: 44,

                        minWidth: 44,

                        borderRadius:
                            "50%",

                        background:
                            iconBackground,

                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        marginRight: 10,

                        boxSizing:
                            "border-box",

                        color:
                            iconColor,
                    }}
                >
                    <Icon
                        size={22}

                        strokeWidth={
                            2.35
                        }

                        color={
                            iconColor
                        }
                    />
                </div>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <div
                    style={{
                        minWidth: 0,

                        flex: 1,

                        display:
                            "flex",

                        flexDirection:
                            "column",

                        justifyContent:
                            "center",

                        overflow:
                            "visible",
                    }}
                >

                    {/* =================================================
                        TITLE
                    ================================================= */}

                    <div
                        style={{
                            color:
                                titleColor,

                            fontSize:
                                10.5,

                            lineHeight:
                                "12px",

                            fontWeight:
                                700,

                            whiteSpace:
                                "nowrap",

                            overflow:
                                "hidden",

                            textOverflow:
                                "ellipsis",

                            marginBottom: 2,
                        }}
                    >
                        {title}
                    </div>


                    {/* =================================================
                        MAIN VALUE
                    ================================================= */}

                    <div
                        style={{
                            fontSize: 15,

                            lineHeight:
                                "20px",

                            fontWeight:
                                800,

                            color:
                                "#0F172A",

                            whiteSpace:
                                "nowrap",

                            overflow:
                                "hidden",

                            textOverflow:
                                "ellipsis",

                            letterSpacing:
                                "-0.25px",
                        }}
                    >
                        <AnimatedNumber
                            value={value}

                            formatter={
                                isPercentage
                                    ? formatPercentage
                                    : (
                                        animatedValue
                                    ) =>
                                        formatCurrency(
                                            animatedValue,
                                            reportingCurrency
                                        )
                            }
                        />
                    </div>


                    {/* =================================================
                        TARGET / VARIANCE DISPLAY

                        The old hover tooltip has been removed.

                        This remains only as the small inline
                        Target + Variance information.
                    ================================================= */}

                    <div
                        style={{
                            display:
                                "inline-flex",

                            alignItems:
                                "center",

                            alignSelf:
                                "flex-start",

                            gap: 5,

                            marginTop: 2,

                            padding:
                                "3px 6px",

                            borderRadius: 5,

                            background:
                                "#EEF2F7",

                            fontSize:
                                9.5,

                            lineHeight:
                                "11px",

                            fontWeight:
                                600,

                            whiteSpace:
                                "nowrap",

                            minWidth: 0,

                            maxWidth:
                                "100%",

                            boxSizing:
                                "border-box",
                        }}
                    >

                        {/* =================================================
                            TARGET
                        ================================================= */}

                        <span
                            style={{
                                color:
                                    "#64748B",

                                minWidth: 0,

                                overflow:
                                    "hidden",

                                textOverflow:
                                    "ellipsis",

                                fontSize:
                                    9.5,

                                fontWeight:
                                    600,
                            }}
                        >
                            Target:{" "}

                            {hasTarget
                                ? formatCurrency(
                                      targetValue,
                                      reportingCurrency
                                  )
                                : "—"}
                        </span>


                        {/* =================================================
                            VARIANCE

                            Colour is still controlled by API status.
                        ================================================= */}

                        <span
                            style={{
                                color:
                                    varianceColor,

                                fontWeight:
                                    700,

                                flexShrink: 0,

                                fontSize:
                                    9.5,
                            }}
                        >
                            {formatVariance(
                                varianceValue
                            )}
                        </span>

                    </div>


                    {/* =================================================
                        UNFAVORABLE
                    ================================================= */}

                    {showUnfavorable && (
                        <div
                            style={{
                                marginTop: 2,

                                fontSize: 9,

                                lineHeight:
                                    "11px",

                                fontWeight:
                                    600,

                                color:
                                    varianceColor,

                                whiteSpace:
                                    "nowrap",
                            }}
                        >
                            Unfavorable
                        </div>
                    )}

                </div>

            </div>


            {/* =========================================================
                MODERN KPI HOVER TOOLTIP

                IMPORTANT:

                - Only ONE tooltip is shown.
                - Appears ABOVE the KPI card.
                - No Backend Status section.
                - No "No backend status available".
                - Backend status is used ONLY for colour.
                - Rendered through portal to avoid clipping.
            ========================================================= */}

            {typeof document !==
                "undefined" &&
                createPortal(
                    <div
                        style={{
                            position:
                                "fixed",

                            bottom:
                                tooltipPosition.bottom,

                            left:
                                tooltipPosition.left,

                            transform:
                                isHovered
                                    ? "translate(-50%, 0)"
                                    : "translate(-50%, 8px)",

                            width: 255,

                            padding: 14,

                            borderRadius: 13,

                            background:
                                "linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))",

                            border:
                                "1px solid rgba(255, 255, 255, 0.10)",

                            boxShadow:
                                "0 20px 45px rgba(15, 23, 42, 0.32), 0 5px 15px rgba(15, 23, 42, 0.18)",

                            backdropFilter:
                                "blur(12px)",

                            WebkitBackdropFilter:
                                "blur(12px)",

                            color:
                                "#FFFFFF",

                            opacity:
                                isHovered
                                    ? 1
                                    : 0,

                            visibility:
                                isHovered
                                    ? "visible"
                                    : "hidden",

                            pointerEvents:
                                "none",

                            transition:
                                "opacity 180ms ease, transform 180ms ease, visibility 180ms ease",

                            zIndex:
                                100000,

                            boxSizing:
                                "border-box",

                            fontFamily:
                                "inherit",
                        }}
                    >

                        {/* =================================================
                            SMALL TOP ACCENT
                        ================================================= */}

                        <div
                            style={{
                                position:
                                    "absolute",

                                top: 0,

                                left: 16,

                                right: 16,

                                height: 2,

                                borderRadius:
                                    "0 0 4px 4px",

                                background:
                                    `linear-gradient(
                                        90deg,
                                        ${iconColor},
                                        ${statusIndicatorColor}
                                    )`,
                            }}
                        />


                        {/* =================================================
                            TOOLTIP HEADER
                        ================================================= */}

                        <div
                            style={{
                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                gap: 9,

                                marginBottom:
                                    11,

                                paddingTop: 2,
                            }}
                        >

                            {/* KPI ICON */}

                            <div
                                style={{
                                    width: 28,

                                    height: 28,

                                    minWidth: 28,

                                    borderRadius:
                                        8,

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    background:
                                        `${iconColor}20`,

                                    border:
                                        `1px solid ${iconColor}35`,

                                    color:
                                        iconColor,
                                }}
                            >
                                <Icon
                                    size={15}

                                    strokeWidth={
                                        2.3
                                    }

                                    color={
                                        iconColor
                                    }
                                />
                            </div>


                            {/* KPI NAME */}

                            <div
                                style={{
                                    minWidth:
                                        0,

                                    flex: 1,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize:
                                            11.5,

                                        lineHeight:
                                            "15px",

                                        fontWeight:
                                            800,

                                        color:
                                            "#FFFFFF",

                                        whiteSpace:
                                            "nowrap",

                                        overflow:
                                            "hidden",

                                        textOverflow:
                                            "ellipsis",
                                    }}
                                >
                                    {title}
                                </div>

                               
                            </div>


                            {/* STATUS DOT */}

                            <div
                                style={{
                                    width: 8,

                                    height: 8,

                                    minWidth: 8,

                                    borderRadius:
                                        "50%",

                                    background:
                                        statusIndicatorColor,

                                    boxShadow:
                                        `0 0 0 4px ${statusIndicatorColor}20`,
                                }}
                            />

                        </div>


                        {/* =================================================
                            CURRENT VALUE
                        ================================================= */}

                        <div
                            style={{
                                padding:
                                    "10px 11px",

                                marginBottom:
                                    8,

                                borderRadius:
                                    9,

                                background:
                                    "rgba(255, 255, 255, 0.07)",

                                border:
                                    "1px solid rgba(255, 255, 255, 0.07)",
                            }}
                        >

                            <div
                                style={{
                                    fontSize:
                                        8.5,

                                    fontWeight:
                                        700,

                                    color:
                                        "#94A3B8",

                                    textTransform:
                                        "uppercase",

                                    letterSpacing:
                                        "0.5px",

                                    marginBottom:
                                        3,
                                }}
                            >
                                Current Value
                            </div>

                            <div
                                style={{
                                    fontSize:
                                        17,

                                    lineHeight:
                                        "21px",

                                    fontWeight:
                                        800,

                                    color:
                                        "#FFFFFF",

                                    letterSpacing:
                                        "-0.3px",
                                }}
                            >
                                {
                                    modernCurrentValue
                                }
                            </div>

                        </div>


                        {/* =================================================
                            TARGET + VARIANCE
                        ================================================= */}

                        <div
                            style={{
                                display:
                                    "grid",

                                gridTemplateColumns:
                                    "1fr 1fr",

                                gap: 7,

                                marginBottom:
                                    8,
                            }}
                        >

                            {/* =================================================
                                TARGET
                            ================================================= */}

                            <div
                                style={{
                                    padding:
                                        "8px 9px",

                                    borderRadius:
                                        8,

                                    background:
                                        "rgba(255, 255, 255, 0.045)",

                                    border:
                                        "1px solid rgba(255, 255, 255, 0.055)",
                                }}
                            >

                                <div
                                    style={{
                                        fontSize:
                                            8,

                                        fontWeight:
                                            700,

                                        color:
                                            "#94A3B8",

                                        textTransform:
                                            "uppercase",

                                        letterSpacing:
                                            "0.4px",

                                        marginBottom:
                                            4,
                                    }}
                                >
                                    Target
                                </div>

                                <div
                                    style={{
                                        fontSize:
                                            10.5,

                                        fontWeight:
                                            700,

                                        color:
                                            "#E2E8F0",

                                        whiteSpace:
                                            "nowrap",

                                        overflow:
                                            "hidden",

                                        textOverflow:
                                            "ellipsis",
                                    }}
                                >
                                    {
                                        modernTargetValue
                                    }
                                </div>

                            </div>


                            {/* =================================================
                                VARIANCE
                            ================================================= */}

                            <div
                                style={{
                                    padding:
                                        "8px 9px",

                                    borderRadius:
                                        8,

                                    background:
                                        `${varianceColor}12`,

                                    border:
                                        `1px solid ${varianceColor}25`,
                                }}
                            >

                                <div
                                    style={{
                                        fontSize:
                                            8,

                                        fontWeight:
                                            700,

                                        color:
                                            "#94A3B8",

                                        textTransform:
                                            "uppercase",

                                        letterSpacing:
                                            "0.4px",

                                        marginBottom:
                                            4,
                                    }}
                                >
                                    Variance
                                </div>

                                <div
                                    style={{
                                        fontSize:
                                            10.5,

                                        fontWeight:
                                            800,

                                        color:
                                            varianceColor,

                                        whiteSpace:
                                            "nowrap",
                                    }}
                                >
                                    {
                                        modernVarianceValue
                                    }
                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            BOTTOM STATUS INDICATOR

                            No status text is shown.
                            Only a subtle contextual indicator remains.
                        ================================================= */}

                        {/* <div
                            style={{
                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                gap: 7,

                                padding:
                                    "7px 9px",

                                borderRadius:
                                    8,

                                background:
                                    `${statusIndicatorColor}10`,

                                border:
                                    `1px solid ${statusIndicatorColor}20`,
                            }}
                        >

                            <span
                                style={{
                                    width: 6,

                                    height: 6,

                                    minWidth: 6,

                                    borderRadius:
                                        "50%",

                                    background:
                                        statusIndicatorColor,
                                }}
                            />

                            <span
                                style={{
                                    fontSize:
                                        8.5,

                                    fontWeight:
                                        600,

                                    color:
                                        "#CBD5E1",
                                }}
                            >
                                Variance indicator
                            </span>

                        </div> */}

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

    /* =========================================================
       API RESPONSE MAPPING
    ========================================================= */

    const kpiData = {
        actualPTD: null,
        targetPTD: null,
        variancePTD: null,
        variancePTDPercent: null,
        variancePTDStatus: null,

        actualYTD: null,
        targetYTD: null,
        varianceYTD: null,
        varianceYTDPercent: null,
        varianceYTDStatus: null,
    };


    /* =========================================================
       PTD VALUES
    ========================================================= */

    kpiData.actualPTD =
        data.actual_ptd ??
        data.actual_ptd_aed ??
        data.actualPTD ??
        null;


    kpiData.targetPTD =
        data.target_ptd ??
        data.target_ptd_aed ??
        data.targetPTD ??
        null;


    kpiData.variancePTD =
        data.variance_ptd ??
        data.variance_ptd_aed ??
        data.variancePTD ??
        null;


    /* =========================================================
       BACKEND PROVIDES PERCENTAGE DIRECTLY

       No calculation.
    ========================================================= */

    kpiData.variancePTDPercent =
        data.variance_ptd_pct ??
        data.variancePTDPercent ??
        null;


    /* =========================================================
       PTD VARIANCE STATUS

       IMPORTANT:
       This comes directly from the API.

       Example:
       "FAVOURABLE"
       "UNFAVOURABLE"
    ========================================================= */

    kpiData.variancePTDStatus =
        data.variance_ptd_status ??
        data.variancePTDStatus ??
        null;


    /* =========================================================
       YTD VALUES
    ========================================================= */

    kpiData.actualYTD =
        data.actual_ytd ??
        data.actual_ytd_aed ??
        data.actualYTD ??
        null;


    kpiData.targetYTD =
        data.target_ytd ??
        data.target_ytd_aed ??
        data.targetYTD ??
        null;


    kpiData.varianceYTD =
        data.variance_ytd ??
        data.variance_ytd_aed ??
        data.varianceYTD ??
        null;


    /* =========================================================
       BACKEND PROVIDES PERCENTAGE DIRECTLY

       No calculation.
    ========================================================= */

    kpiData.varianceYTDPercent =
        data.variance_ytd_pct ??
        data.varianceYTDPercent ??
        null;


    /* =========================================================
       YTD VARIANCE STATUS

       IMPORTANT:
       This comes directly from the API.
    ========================================================= */

    kpiData.varianceYTDStatus =
        data.variance_ytd_status ??
        data.varianceYTDStatus ??
        null;


    return (
        <div
            style={{
                width: "100%",

                background:
                    "#F8FAFC",

                border: "none",

                borderRadius: 10,

                boxSizing:
                    "border-box",

                overflow:
                    "visible",
            }}
        >

            {/* ===================================================
                HEADER
            =================================================== */}

            <div
                style={{
                    height: 38,

                    display:
                        "flex",

                    alignItems:
                        "center",

                    justifyContent:
                        "space-between",

                    padding:
                        "0 9px",

                    boxSizing:
                        "border-box",

                    background:
                        "#F8FAFC",
                }}
            >

                <h3
                    style={{
                        margin: 0,

                        fontSize: 13,

                        lineHeight:
                            "15px",

                        fontWeight: 700,

                        color:
                            "#0F172A",

                        whiteSpace:
                            "nowrap",
                    }}
                >
                    Operating Expense Summary
                </h3>

            </div>


            {/* ===================================================
                KPI CARDS CONTAINER
            =================================================== */}

            <div
                style={{
                    width: "100%",

                    display:
                        "flex",

                    alignItems:
                        "stretch",

                    gap: 8,

                    padding:
                        "7px",

                    boxSizing:
                        "border-box",

                    overflowX:
                        "auto",

                    overflowY:
                        "visible",

                    background:
                        "#F8FAFC",

                    scrollbarWidth:
                        "thin",
                }}
            >

                {/* =================================================
                    1. ACTUAL PTD
                ================================================= */}

                <OpexKpiCard
                    title="Actual PTD"

                    value={
                        kpiData.actualPTD
                    }

                    Icon={LineChart}

                    iconColor="#2563EB"

                    iconBackground="#EFF6FF"

                    titleColor="#2563EB"

                    titleBackground="#EFF4FF"

                    reportingCurrency={
                        reportingCurrency
                    }

                    targetValue={
                        kpiData.targetPTD
                    }

                    varianceValue={
                        kpiData.variancePTDPercent
                    }

                    varianceStatus={
                        kpiData.variancePTDStatus
                    }
                />


                {/* =================================================
                    2. TARGET PTD
                ================================================= */}

                <OpexKpiCard
                    title="Target PTD"

                    value={
                        kpiData.targetPTD
                    }

                    Icon={Target}

                    iconColor="#16A34A"

                    iconBackground="#ECFDF3"

                    titleColor="#16A34A"

                    titleBackground="#F0FBF3"

                    reportingCurrency={
                        reportingCurrency
                    }

                    targetValue={
                        kpiData.targetPTD
                    }

                    varianceValue={
                        kpiData.variancePTDPercent
                    }

                    varianceStatus={
                        kpiData.variancePTDStatus
                    }
                />


                {/* =================================================
                    3. VARIANCE PTD
                ================================================= */}

                <OpexKpiCard
                    title="Variance PTD"

                    value={
                        kpiData.variancePTD
                    }

                    Icon={TrendingUp}

                    iconColor="#F97316"

                    iconBackground="#FFF7ED"

                    titleColor="#EA580C"

                    titleBackground="#FFF6E9"

                    reportingCurrency={
                        reportingCurrency
                    }

                    targetValue={
                        kpiData.targetPTD
                    }

                    varianceValue={
                        kpiData.variancePTDPercent
                    }

                    varianceStatus={
                        kpiData.variancePTDStatus
                    }
                />


                {/* =================================================
                    4. VARIANCE PTD %
                ================================================= */}

                <OpexKpiCard
                    title="Variance PTD %"

                    value={
                        kpiData.variancePTDPercent
                    }

                    Icon={Percent}

                    iconColor="#DB2777"

                    iconBackground="#FDF2F8"

                    titleColor="#DB2777"

                    titleBackground="#FFF1F5"

                    isPercentage

                    reportingCurrency={
                        reportingCurrency
                    }

                    targetValue={null}

                    varianceValue={
                        kpiData.variancePTDPercent
                    }

                    varianceStatus={
                        kpiData.variancePTDStatus
                    }
                />


                {/* =================================================
                    5. ACTUAL YTD
                ================================================= */}

                <OpexKpiCard
                    title="Actual YTD"

                    value={
                        kpiData.actualYTD
                    }

                    Icon={BarChart3}

                    iconColor="#0891B2"

                    iconBackground="#ECFEFF"

                    titleColor="#0891B2"

                    titleBackground="#EFFBFC"

                    reportingCurrency={
                        reportingCurrency
                    }

                    targetValue={
                        kpiData.targetYTD
                    }

                    varianceValue={
                        kpiData.varianceYTDPercent
                    }

                    varianceStatus={
                        kpiData.varianceYTDStatus
                    }
                />


                {/* =================================================
                    6. TARGET YTD
                ================================================= */}

                <OpexKpiCard
                    title="Target YTD"

                    value={
                        kpiData.targetYTD
                    }

                    Icon={Target}

                    iconColor="#7C3AED"

                    iconBackground="#F5F3FF"

                    titleColor="#7C3AED"

                    titleBackground="#F5F3FF"

                    reportingCurrency={
                        reportingCurrency
                    }

                    targetValue={
                        kpiData.targetYTD
                    }

                    varianceValue={
                        kpiData.varianceYTDPercent
                    }

                    varianceStatus={
                        kpiData.varianceYTDStatus
                    }
                />

            </div>

        </div>
    );
}