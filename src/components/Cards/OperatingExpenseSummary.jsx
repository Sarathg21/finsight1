

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
//         return "—";
//     }

//     const number = Number(value);

//     if (Number.isNaN(number)) {
//         return "—";
//     }

//     const arrow = number < 0 ? "▼" : "▲";

//     return `${arrow}${Math.abs(number).toFixed(1)}%`;
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
//        HOVER EFFECT ONLY
//     ========================================================= */

//     const [isHovered, setIsHovered] = useState(false);

//     const targetTooltipValue =
//         targetValue === null ||
//             targetValue === undefined ||
//             targetValue === ""
//             ? "—"
//             : `${reportingCurrency} ${formatRawValue(targetValue)}`;

//     const varianceTooltipValue =
//         varianceValue === null ||
//             varianceValue === undefined ||
//             varianceValue === ""
//             ? "—"
//             : `${formatRawValue(varianceValue)}%`;


//     return (
//         <div
//             onMouseEnter={() => setIsHovered(true)}
//             onMouseLeave={() => setIsHovered(false)}

//             style={{
//                 flex: "1 1 0",
//                 minWidth: 0,

//                 height: 106,

//                 background: titleBackground,

//                 border: "none",

//                 borderRadius: 10,

//                 boxSizing: "border-box",

//                 padding: "10px 12px",

//                 display: "flex",
//                 alignItems: "center",

//                 overflow: "hidden",

//                 transform: isHovered
//                     ? "translateY(-6px) scale(1.025)"
//                     : "translateY(0) scale(1)",

//                 boxShadow: isHovered
//                     ? "0 10px 24px rgba(15, 23, 42, 0.18)"
//                     : "0 2px 6px rgba(15, 23, 42, 0.06)",

//                 transition:
//                     "transform 220ms ease, box-shadow 220ms ease",

//                 position: "relative",

//                 zIndex: isHovered ? 10 : 1,

//                 cursor: "default",
//             }}
//         >

//             {/* =================================================
//                 ICON
//             ================================================= */}

//             <div
//                 style={{
//                     width: 42,
//                     height: 42,

//                     minWidth: 42,

//                     borderRadius: "50%",

//                     background: iconBackground,

//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",

//                     marginRight: 11,

//                     boxSizing: "border-box",
//                 }}
//             >
//                 <Icon
//                     size={22}
//                     strokeWidth={2.2}
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

//                         fontSize: 11,

//                         lineHeight: "14px",

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
//                         fontSize: 17,

//                         lineHeight: "20px",

//                         fontWeight: 800,

//                         color: "#0F172A",

//                         whiteSpace: "nowrap",

//                         overflow: "hidden",

//                         textOverflow: "ellipsis",

//                         letterSpacing: "-0.2px",
//                     }}
//                 >
//                     <AnimatedNumber
//                         value={value}
//                         formatter={
//                             isPercentage
//                                 ? formatPercentage
//                                 : (value) =>
//                                     formatCurrency(
//                                         value,
//                                         reportingCurrency
//                                     )
//                         }
//                     />
//                 </div>


//                 {/* =================================================
//                     TARGET + VARIANCE

//                     DISPLAY:

//                     Target: AED 98.90M ▼74.8%

//                     Target has light grey background.

//                     Hovering over this area shows backend values.
//                 ================================================= */}

//                 <div
//                     style={{
//                         position: "relative",

//                         display: "inline-flex",

//                         alignItems: "center",  background: "#E5E7EB",

//                         gap: 7,

//                         marginTop: 3,

//                         fontSize: 10,

//                         lineHeight: "12px",

//                         fontWeight: 600,

//                         whiteSpace: "nowrap",

//                         minWidth: 0,

//                         width: "fit-content",

//                         maxWidth: "100%",

//                         cursor: "help",
//                     }}
//                 >

//                     {/* =================================================
//                         TARGET
//                     ================================================= */}

//                     <span
//                         style={{
//                             color: "#64748B",

//                             borderRadius: 4,

//                             padding: "2px 5px",

//                             minWidth: 0,

//                             overflow: "hidden",

//                             textOverflow: "ellipsis",

//                             fontSize: 10,

//                             fontWeight: 600,

//                             boxSizing: "border-box",
//                         }}
//                     >
//                         Target:{" "}
//                         {formatCurrency(
//                             targetValue,
//                             reportingCurrency
//                         )}
//                     </span>


//                     {/* =================================================
//                         VARIANCE %
//                     ================================================= */}

//                     <span
//                         style={{
//                             color:
//                                 varianceValue !== null &&
//                                     varianceValue !== undefined &&
//                                     varianceValue !== "" &&
//                                     Number(varianceValue) >= 0
//                                     ? "#16A34A"
//                                     : "#DC2626",

//                             fontWeight: 700,

//                             flexShrink: 0,

//                             fontSize: 10,
//                         }}
//                     >
//                         {formatVariance(
//                             varianceValue
//                         )}
//                     </span>


//                     {/* =================================================
//                         BACKEND VALUE TOOLTIP
//                     ================================================= */}

//                     <div
//                         style={{
//                             position: "absolute",

//                             left: 0,

//                             bottom: "calc(100% + 8px)",

//                               background: "#FFFFFF",
                            
//                             color: "#0F172A",

//                             padding: "8px 10px",

//                             borderRadius: 6,

//                             fontSize: 10,

//                             lineHeight: "15px",

//                             fontWeight: 500,

//                             whiteSpace: "nowrap",

//                             boxShadow:
//                                 "0 6px 18px rgba(15, 23, 42, 0.22)",

//                             opacity: 0,

//                             visibility: "hidden",

//                             pointerEvents: "none",

//                             transform: "translateY(3px)",

//                             transition:
//                                 "opacity 160ms ease, transform 160ms ease, visibility 160ms ease",

//                             zIndex: 100,

//                             minWidth: 145,
//                         }}

//                         className="opex-kpi-backend-tooltip"
//                     >
//                         <div
//                             style={{
//                                 fontWeight: 700,
//                                 marginBottom: 3,
//                             }}
//                         >
                          
//                         </div>

//                         <div>
//                             Target: {targetTooltipValue}
//                         </div>

//                         <div>
//                             Variance: {varianceTooltipValue}
//                         </div>

//                     </div>

//                 </div>


//                 {/* =================================================
//                     TOOLTIP HOVER CSS
//                 ================================================= */}

//                 <style>
//                     {`
//                         .opex-kpi-backend-tooltip {
//                             opacity: 0;
//                             visibility: hidden;
//                             transform: translateY(3px);
//                         }

//                         div:hover > .opex-kpi-backend-tooltip {
//                             opacity: 1 !important;
//                             visibility: visible !important;
//                             transform: translateY(0) !important;
//                         }
//                     `}
//                 </style>


//                 {/* =================================================
//                     UNFAVORABLE
//                 ================================================= */}

//                 {showUnfavorable && (
//                     <div
//                         style={{
//                             marginTop: 3,

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

//        Backend response:

//        actual_ptd_aed
//        target_ptd_aed
//        variance_ptd_aed
//        variance_ptd_pct

//        actual_ytd_aed
//        target_ytd_aed
//        variance_ytd_aed
//        variance_ytd_pct

//        Reporting currency:

//        actual_ptd
//        target_ptd
//        variance_ptd

//        actual_ytd
//        target_ytd
//        variance_ytd
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

//                 overflow: "hidden",
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

//                     overflowY: "hidden",

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
//                     iconBackground="#DCE8FF"

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
//                     iconBackground="#D9F7E2"

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
//                     iconBackground="#FFE3C2"

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

//                     iconColor="#E11D48"
//                     iconBackground="#FFDDE5"

//                     titleColor="#E11D48"
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

//                     iconColor="#3FAFC1"
//                     iconBackground="#DDF4F7"

//                     titleColor="#3FAFC1"
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

//                     iconColor="#6D28D9"
//                     iconBackground="#EDE9FE"

//                     titleColor="#6D28D9"
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

import React, { useEffect, useRef, useState } from "react";
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
    const [displayValue, setDisplayValue] = useState(0);

    const animationFrameRef = useRef(null);
    const previousValueRef = useRef(null);

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
            const elapsed = currentTime - startTime;

            const progress = Math.min(
                elapsed / duration,
                1
            );

            /* =================================================
               EASE OUT
            ================================================= */

            const easedProgress =
                1 - Math.pow(1 - progress, 3);

            const currentValue =
                startValue +
                (endValue - startValue) *
                easedProgress;

            setDisplayValue(currentValue);

            if (progress < 1) {
                animationFrameRef.current =
                    requestAnimationFrame(animate);
            } else {
                setDisplayValue(endValue);
                previousValueRef.current = endValue;
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

const formatCurrency = (value, currency = "AED") => {
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

    return `${currency} ${millions.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}M`;
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

    const arrow = number < 0 ? "▼" : "▲";

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

    return number.toLocaleString("en-US", {
        maximumFractionDigits: 2,
    });
};


/* =========================================================
   KPI CARD
   Screenshot-style presentation only.
   Data / target / variance behavior is unchanged.
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

}) {

    /* =========================================================
       HOVER EFFECT ONLY
    ========================================================= */

    const [isHovered, setIsHovered] = useState(false);

    const hasTarget =
        targetValue !== null &&
        targetValue !== undefined &&
        targetValue !== "";

    const hasVariance =
        varianceValue !== null &&
        varianceValue !== undefined &&
        varianceValue !== "";

    const numericVariance = Number(varianceValue);

    const varianceIsPositive =
        hasVariance &&
        !Number.isNaN(numericVariance) &&
        numericVariance >= 0;

    const targetTooltipValue =
        !hasTarget
            ? "—"
            : `${reportingCurrency} ${formatRawValue(targetValue)}`;

    const varianceTooltipValue =
        !hasVariance
            ? "—"
            : `${formatRawValue(varianceValue)}%`;

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                flex: "1 1 0",
                minWidth: 0,

                height: 82,

                background: `linear-gradient(
                    145deg,
                    #FFFFFF 0%,
                    ${iconBackground} 100%
                )`,

                border:
                    `1px solid ${isHovered
                        ? `${iconColor}35`
                        : "rgba(15, 23, 42, 0.05)"
                    }`,

                borderRadius: 12,

                boxSizing: "border-box",

                padding: "10px 12px",

                display: "flex",
                alignItems: "center",

                overflow: "visible",

                transform: isHovered
                    ? "translateY(-2px)"
                    : "translateY(0)",

                boxShadow: isHovered
                    ? `0 8px 20px ${iconColor}20`
                    : "0 2px 8px rgba(15, 23, 42, 0.05)",

                transition:
                    "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",

                position: "relative",

                zIndex: isHovered ? 20 : 1,

                cursor: "default",
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

                    borderRadius: "50%",

                    background: iconBackground,

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    marginRight: 10,

                    boxSizing: "border-box",

                    color: iconColor,
                }}
            >
                <Icon
                    size={22}
                    strokeWidth={2.35}
                    color={iconColor}
                />
            </div>


            {/* =================================================
                CONTENT
            ================================================= */}

            <div
                style={{
                    minWidth: 0,

                    flex: 1,

                    display: "flex",
                    flexDirection: "column",

                    justifyContent: "center",

                    overflow: "visible",
                }}
            >

                {/* =================================================
                    TITLE
                ================================================= */}

                <div
                    style={{
                        color: titleColor,

                        fontSize: 10.5,

                        lineHeight: "12px",

                        fontWeight: 700,

                        whiteSpace: "nowrap",

                        overflow: "hidden",

                        textOverflow: "ellipsis",

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
                        fontSize: 17,

                        lineHeight: "20px",

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
                                : (animatedValue) =>
                                    formatCurrency(
                                        animatedValue,
                                        reportingCurrency
                                    )
                        }
                    />
                </div>


                {/* =================================================
                    TARGET / VARIANCE PILL

                    Matches reference:
                    Target: AED 98.90M  ▼74.5%

                    The pill is compact and sits below the
                    main KPI value.
                ================================================= */}

                <div
                    style={{
                        position: "relative",

                        display: "inline-flex",

                        alignItems: "center",

                        alignSelf: "flex-start",

                        gap: 5,

                        marginTop: 2,

                        padding: "3px 6px",

                        borderRadius: 5,

                        background: "#EEF2F7",

                        fontSize: 9.5,

                        lineHeight: "11px",

                        fontWeight: 600,

                        whiteSpace: "nowrap",

                        minWidth: 0,

                        maxWidth: "100%",

                        boxSizing: "border-box",

                        cursor: "help",
                    }}
                >

                    {/* =================================================
                        TARGET
                    ================================================= */}

                    <span
                        style={{
                            color: "#64748B",

                            minWidth: 0,

                            overflow: "hidden",

                            textOverflow: "ellipsis",

                            fontSize: 9.5,

                            fontWeight: 600,
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
                    ================================================= */}

                    <span
                        style={{
                            color:
                                !hasVariance || varianceIsPositive
                                    ? "#16A34A"
                                    : "#DC2626",

                            fontWeight: 700,

                            flexShrink: 0,

                            fontSize: 9.5,
                        }}
                    >
                        {formatVariance(
                            varianceValue
                        )}
                    </span>


                    {/* =================================================
                        BACKEND VALUE TOOLTIP
                    ================================================= */}

                    <div
                        style={{
                            position: "absolute",

                            left: 0,

                            bottom: "calc(100% + 7px)",

                            background: "#FFFFFF",

                            color: "#0F172A",

                            padding: "8px 10px",

                            borderRadius: 6,

                            fontSize: 10,

                            lineHeight: "15px",

                            fontWeight: 500,

                            whiteSpace: "nowrap",

                            boxShadow:
                                "0 6px 18px rgba(15, 23, 42, 0.22)",

                            opacity: 0,

                            visibility: "hidden",

                            pointerEvents: "none",

                            transform: "translateY(3px)",

                            transition:
                                "opacity 160ms ease, transform 160ms ease, visibility 160ms ease",

                            zIndex: 100,

                            minWidth: 145,
                        }}

                        className="opex-kpi-backend-tooltip"
                    >
                        <div>
                            Target: {targetTooltipValue}
                        </div>

                        <div>
                            Variance: {varianceTooltipValue}
                        </div>
                    </div>

                </div>


                {/* =================================================
                    UNFAVORABLE
                ================================================= */}

                {showUnfavorable && (
                    <div
                        style={{
                            marginTop: 2,

                            fontSize: 9,

                            lineHeight: "11px",

                            fontWeight: 600,

                            color: "#DC2626",

                            whiteSpace: "nowrap",
                        }}
                    >
                        Unfavorable
                    </div>
                )}

            </div>


            {/* =====================================================
                TOOLTIP HOVER CSS
            ===================================================== */}

            <style>
                {`
                    .opex-kpi-backend-tooltip {
                        opacity: 0;
                        visibility: hidden;
                        transform: translateY(3px);
                    }

                    div:hover > .opex-kpi-backend-tooltip {
                        opacity: 1 !important;
                        visibility: visible !important;
                        transform: translateY(0) !important;
                    }
                `}
            </style>

        </div>
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

       Backend response:

       actual_ptd_aed
       target_ptd_aed
       variance_ptd_aed
       variance_ptd_pct

       actual_ytd_aed
       target_ytd_aed
       variance_ytd_aed
       variance_ytd_pct

       Reporting currency:

       actual_ptd
       target_ptd
       variance_ptd

       actual_ytd
       target_ytd
       variance_ytd
    ========================================================= */

    const kpiData = {
        actualPTD: null,
        targetPTD: null,
        variancePTD: null,
        variancePTDPercent: null,

        actualYTD: null,
        targetYTD: null,
        varianceYTD: null,
        varianceYTDPercent: null,
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


    return (
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

            {/* ===================================================
                HEADER
            =================================================== */}

            <div
                style={{
                    height: 38,

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


            {/* ===================================================
                KPI CARDS CONTAINER
            =================================================== */}

            <div
                style={{
                    width: "100%",

                    display: "flex",

                    alignItems: "stretch",

                    gap: 8,

                    padding: "7px",

                    boxSizing: "border-box",

                    overflowX: "auto",

                    overflowY: "visible",

                    background: "#F8FAFC",

                    scrollbarWidth: "thin",
                }}
            >

                {/* =================================================
                    1. ACTUAL PTD
                ================================================= */}

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

                    varianceValue={
                        kpiData.variancePTDPercent
                    }
                />


                {/* =================================================
                    2. TARGET PTD
                ================================================= */}

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

                    varianceValue={
                        kpiData.variancePTDPercent
                    }
                />


                {/* =================================================
                    3. VARIANCE PTD
                ================================================= */}

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

                    varianceValue={
                        kpiData.variancePTDPercent
                    }
                />


                {/* =================================================
                    4. VARIANCE PTD %
                ================================================= */}

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

                    varianceValue={
                        kpiData.variancePTDPercent
                    }
                />


                {/* =================================================
                    5. ACTUAL YTD
                ================================================= */}

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

                    varianceValue={
                        kpiData.varianceYTDPercent
                    }
                />


                {/* =================================================
                    6. TARGET YTD
                ================================================= */}

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

                    varianceValue={
                        kpiData.varianceYTDPercent
                    }
                />

            </div>

        </div>
    );
}
