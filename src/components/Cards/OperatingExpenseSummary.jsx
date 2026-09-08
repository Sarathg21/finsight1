

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
//    KPI CARD
//    UI ONLY
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

// }) {
//     return (
//         <div
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

//                     overflow: "hidden",
//                 }}
//             >

//                 {/* =================================================
//                     TITLE
//                     Reference style:
//                     Colored text, no pill
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
//                     VALUE
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
//                     UNFAVORABLE

//                     Existing functionality retained.
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
//     data = {}, reportingCurrency = "AED",
// }) {

//     /* =========================================================
//        API RESPONSE MAPPING

//        API:

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

//                 {/* TITLE */}

//                 <h3
//                     style={{
//                         margin: 0,

//                         fontSize: 12,

//                         lineHeight: "15px",

//                         fontWeight: 700,

//                         color: "#0F172A",

//                         whiteSpace: "nowrap",
//                     }}
//                 >
//                     Operating Expense Summary
//                 </h3>


//                 {/* THREE DOT */}

//                 {/* <button
//                     type="button"
//                     style={{
//                         border: "none",

//                         background: "transparent",

//                         padding: "2px 3px",

//                         cursor: "pointer",

//                         color: "#64748B",

//                         fontSize: 17,

//                         lineHeight: 1,
//                     }}
//                 >
//                     ⋮
//                 </button> */}

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
//                 />


//                 {/* =================================================
//                     5. ACTUAL YTD
//                 ================================================= */}

//                 <OpexKpiCard
//                     title="Actual YTD"
//                     value={kpiData.actualYTD}

//                     Icon={BarChart3}

//                     iconColor="#2563EB"
//                     iconBackground="#DCE8FF"

//                     titleColor="#2563EB"
//                     titleBackground="#EFF4FF"
//                     reportingCurrency={reportingCurrency}
//                 />


//                 {/* =================================================
//                     6. TARGET YTD
//                 ================================================= */}

//                 <OpexKpiCard
//                     title="Target YTD"
//                     value={kpiData.targetYTD}

//                     Icon={Target}

//                     iconColor="#16A34A"
//                     iconBackground="#D9F7E2"

//                     titleColor="#16A34A"
//                     titleBackground="#F0FBF3"
//                     reportingCurrency={reportingCurrency}
//                 />


//                 {/* =================================================
//                     7. VARIANCE YTD

//                     KEPT COMMENTED — NO FUNCTIONALITY CHANGED
//                 ================================================= */}

//                 {/* <OpexKpiCard
//                     title="Variance YTD"
//                     value={kpiData.varianceYTD}
//                     Icon={TrendingUp}
//                     iconColor="#F97316"
//                     iconBackground="#FFEEDB"
//                     titleColor="#F97316"
//                     titleBackground="#FFF5E9"
//                 /> */}


//                 {/* =================================================
//                     8. VARIANCE YTD %

//                     KEPT COMMENTED — NO FUNCTIONALITY CHANGED
//                 ================================================= */}

//                 {/* <OpexKpiCard
//                     title="Variance YTD %"
//                     value={kpiData.varianceYTDPercent}
//                     Icon={Percent}
//                     iconColor="#E11D48"
//                     iconBackground="#FFE7EC"
//                     titleColor="#E11D48"
//                     titleBackground="#FFF1F4"
//                     isPercentage
//                 /> */}

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
   KPI CARD
   UI ONLY
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

}) {

    /* =========================================================
       HOVER EFFECT ONLY

       No existing functionality is changed.
    ========================================================= */

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}

            style={{
                flex: "1 1 0",
                minWidth: 0,

                height: 106,

                background: titleBackground,

                border: "none",

                borderRadius: 10,

                boxSizing: "border-box",

                padding: "10px 12px",

                display: "flex",
                alignItems: "center",

                overflow: "hidden",

                /* =================================================
                   HOVER FORWARD / RETURN EFFECT
                ================================================= */

                transform: isHovered
                    ? "translateY(-6px) scale(1.025)"
                    : "translateY(0) scale(1)",

                boxShadow: isHovered
                    ? "0 10px 24px rgba(15, 23, 42, 0.18)"
                    : "0 2px 6px rgba(15, 23, 42, 0.06)",

                transition:
                    "transform 220ms ease, box-shadow 220ms ease",

                position: "relative",

                /* Makes hovered card appear above neighboring cards */
                zIndex: isHovered ? 10 : 1,

                cursor: "default",
            }}
        >

            {/* =================================================
                ICON
            ================================================= */}

            <div
                style={{
                    width: 42,
                    height: 42,

                    minWidth: 42,

                    borderRadius: "50%",

                    background: iconBackground,

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    marginRight: 11,

                    boxSizing: "border-box",
                }}
            >
                <Icon
                    size={22}
                    strokeWidth={2.2}
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

                    overflow: "hidden",
                }}
            >

                {/* =================================================
                    TITLE
                    Reference style:
                    Colored text, no pill
                ================================================= */}

                <div
                    style={{
                        color: titleColor,

                        fontSize: 11,

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


                {/* =================================================
                    VALUE
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

                        letterSpacing: "-0.2px",
                    }}
                >
                    <AnimatedNumber
                        value={value}
                        formatter={
                            isPercentage
                                ? formatPercentage
                                : (value) =>
                                    formatCurrency(
                                        value,
                                        reportingCurrency
                                    )
                        }
                    />
                </div>


                {/* =================================================
                    UNFAVORABLE

                    Existing functionality retained.
                ================================================= */}

                {showUnfavorable && (
                    <div
                        style={{
                            marginTop: 3,

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

       API:

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

                overflow: "hidden",
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

                {/* TITLE */}

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


                {/* THREE DOT */}

                {/* <button
                    type="button"
                    style={{
                        border: "none",

                        background: "transparent",

                        padding: "2px 3px",

                        cursor: "pointer",

                        color: "#64748B",

                        fontSize: 17,

                        lineHeight: 1,
                    }}
                >
                    ⋮
                </button> */}

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

                    overflowY: "hidden",

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
                    iconBackground="#DCE8FF"

                    titleColor="#2563EB"
                    titleBackground="#EFF4FF"
                    reportingCurrency={reportingCurrency}
                />


                {/* =================================================
                    2. TARGET PTD
                ================================================= */}

                <OpexKpiCard
                    title="Target PTD"
                    value={kpiData.targetPTD}

                    Icon={Target}

                    iconColor="#16A34A"
                    iconBackground="#D9F7E2"

                    titleColor="#16A34A"
                    titleBackground="#F0FBF3"
                    reportingCurrency={reportingCurrency}
                />


                {/* =================================================
                    3. VARIANCE PTD
                ================================================= */}

                <OpexKpiCard
                    title="Variance PTD"
                    value={kpiData.variancePTD}

                    Icon={TrendingUp}

                    iconColor="#F97316"
                    iconBackground="#FFE3C2"

                    titleColor="#EA580C"
                    titleBackground="#FFF6E9"
                    reportingCurrency={reportingCurrency}
                />


                {/* =================================================
                    4. VARIANCE PTD %
                ================================================= */}

                <OpexKpiCard
                    title="Variance PTD %"
                    value={kpiData.variancePTDPercent}

                    Icon={Percent}

                    iconColor="#E11D48"
                    iconBackground="#FFDDE5"

                    titleColor="#E11D48"
                    titleBackground="#FFF1F5"

                    isPercentage
                    reportingCurrency={reportingCurrency}
                />


                {/* =================================================
                    5. ACTUAL YTD
                ================================================= */}
                <OpexKpiCard
                    title="Actual YTD"
                    value={kpiData.actualYTD}

                    Icon={BarChart3}

                    iconColor="#3FAFC1"
                    iconBackground="#DDF4F7"

                    titleColor="#3FAFC1"
                    titleBackground="#EFFBFC"

                    reportingCurrency={reportingCurrency}
                />
                {/* =================================================
                    6. TARGET YTD
                ================================================= */}

                <OpexKpiCard
                    title="Target YTD"
                    value={kpiData.targetYTD}

                    Icon={Target}

                    iconColor="#6D28D9"
                    iconBackground="#EDE9FE"

                    titleColor="#6D28D9"
                    titleBackground="#F5F3FF"

                    reportingCurrency={reportingCurrency}
                />



                {/* =================================================
                    7. VARIANCE YTD

                    KEPT COMMENTED — NO FUNCTIONALITY CHANGED
                ================================================= */}

                {/* <OpexKpiCard
                    title="Variance YTD"
                    value={kpiData.varianceYTD}
                    Icon={TrendingUp}
                    iconColor="#F97316"
                    iconBackground="#FFEEDB"
                    titleColor="#F97316"
                    titleBackground="#FFF5E9"
                /> */}


                {/* =================================================
                    8. VARIANCE YTD %

                    KEPT COMMENTED — NO FUNCTIONALITY CHANGED
                ================================================= */}

                {/* <OpexKpiCard
                    title="Variance YTD %"
                    value={kpiData.varianceYTDPercent}
                    Icon={Percent}
                    iconColor="#E11D48"
                    iconBackground="#FFE7EC"
                    titleColor="#E11D48"
                    titleBackground="#FFF1F4"
                    isPercentage
                /> */}

            </div>

        </div>
    );
}

