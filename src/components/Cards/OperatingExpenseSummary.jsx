

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

//            IMPORTANT:
//            Do NOT animate null to 0.

//            Target / variance values should remain —
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

//            First API value:
//            0 → actual value

//            When API value changes:
//            previous value → new value
//         ===================================================== */

//         const startValue =
//             previousValueRef.current !== null &&
//             !Number.isNaN(
//                 Number(previousValueRef.current)
//             )
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

//                Smooth start and smooth finish
//             ================================================= */

//             const easedProgress =
//                 1 - Math.pow(1 - progress, 3);

//             const currentValue =
//                 startValue +
//                 (endValue - startValue) *
//                     easedProgress;

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

// const formatCurrency = (value) => {
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

//     /* =====================================================
//        AED MILLIONS DISPLAY

//        Backend:
//        123224.59 AED

//        Display:
//        AED 0.12M
//     ===================================================== */

//     const millions = number / 1000000;

//     return `AED ${millions.toLocaleString("en-US", {
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
// }) {
//     return (
//         <div
//             style={{
//                 flex: "1 1 0",
//                 minWidth: 0,

//                 height: 66,

//                 /* =================================================
//                    PASTEL BACKGROUND
//                 ================================================= */

//                 background: titleBackground,

//                 /* No border */
//                 border: "none",

//                 borderRadius: 7,

//                 boxSizing: "border-box",

//                 padding: "7px 8px",

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
//                     width: 29,
//                     height: 29,

//                     minWidth: 29,

//                     borderRadius: "60%",

//                     background: iconBackground,

//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",

//                     marginRight: 7,
//                 }}
//             >
//                 <Icon
//                     size={25}
//                     strokeWidth={2}
//                     color={iconColor}
//                 />
//             </div>


//             {/* =================================================
//                 CONTENT
//             ================================================= */}

//             <div
//                 style={{
//                     minWidth: 0,

//                     display: "flex",
//                     flexDirection: "column",

//                     justifyContent: "center",

//                     flex: 1,
//                 }}
//             >

//                 {/* =================================================
//                     TITLE
//                 ================================================= */}

//                 <div
//                     style={{
//                         display: "inline-flex",

//                         alignItems: "center",

//                         alignSelf: "flex-start",

//                         minHeight: 17,

//                         padding: "2px 6px",

//                         borderRadius: 4,

//                         background:
//                             "rgba(255, 255, 255, 0.45)",

//                         color: titleColor,

//                         fontSize: 12,

//                         lineHeight: "12px",

//                         fontWeight: 600,

//                         whiteSpace: "nowrap",

//                         marginBottom: 3,
//                     }}
//                 >
//                     {title}
//                 </div>


//                 {/* =================================================
//                     VALUE
//                 ================================================= */}

//                 <div
//                     style={{
//                         fontSize: 16,

//                         lineHeight: "15px",

//                         fontWeight: 800,

//                         color: "#0F172A",

//                         whiteSpace: "nowrap",
//                     }}
//                 >
//                     <AnimatedNumber
//                         value={value}
//                         formatter={
//                             isPercentage
//                                 ? formatPercentage
//                                 : formatCurrency
//                         }
//                     />
//                 </div>


//                 {/* =================================================
//                     UNFAVORABLE
//                 ================================================= */}

//                 {showUnfavorable && (
//                     <div
//                         style={{
//                             marginTop: 2,

//                             fontSize: 10,

//                             lineHeight: "10px",

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

//                 /* =================================================
//                    PASTEL SUMMARY BACKGROUND
//                 ================================================= */

//                 background: "#F8FAFC",

//                 /* No border */
//                 border: "none",

//                 borderRadius: 8,

//                 boxSizing: "border-box",

//                 overflow: "hidden",
//             }}
//         >

//             {/* ===================================================
//                 HEADER
//             =================================================== */}

//             <div
//                 style={{
//                     height: 39,

//                     display: "flex",

//                     alignItems: "center",

//                     justifyContent: "space-between",

//                     padding: "0 9px",

//                     boxSizing: "border-box",

//                     borderBottom: "none",

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

//                 <button
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
//                 </button>

//             </div>


//             {/* ===================================================
//                 KPI CARDS CONTAINER
//             =================================================== */}

//             <div
//                 style={{
//                     width: "100%",

//                     display: "flex",

//                     alignItems: "stretch",

//                     gap: 6,

//                     padding: "7px",

//                     boxSizing: "border-box",

//                     overflowX: "auto",

//                     background: "#F8FAFC",
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
//                     iconBackground="#E8EDFF"
//                     titleColor="#2563EB"
//                     titleBackground="#F0F3FF"
//                 />


//                 {/* =================================================
//                     2. TARGET PTD
//                 ================================================= */}

//                 <OpexKpiCard
//                     title="Target PTD"
//                     value={kpiData.targetPTD}
//                     Icon={Target}
//                     iconColor="#16A34A"
//                     iconBackground="#E4F8E8"
//                     titleColor="#16A34A"
//                     titleBackground="#EFFBF1"
//                 />


//                 {/* =================================================
//                     3. VARIANCE PTD
//                 ================================================= */}

//                 <OpexKpiCard
//                     title="Variance PTD"
//                     value={kpiData.variancePTD}
//                     Icon={TrendingUp}
//                     iconColor="#F97316"
//                     iconBackground="#FFEEDB"
//                     titleColor="#F97316"
//                     titleBackground="#FFF5E9"
//                 />


//                 {/* =================================================
//                     4. VARIANCE PTD %
//                 ================================================= */}

//                 <OpexKpiCard
//                     title="Variance PTD %"
//                     value={kpiData.variancePTDPercent}
//                     Icon={Percent}
//                     iconColor="#E11D48"
//                     iconBackground="#FFE7EC"
//                     titleColor="#E11D48"
//                     titleBackground="#FFF1F4"
//                     isPercentage
//                 />


//                 {/* =================================================
//                     5. ACTUAL YTD
//                 ================================================= */}

//                 <OpexKpiCard
//                     title="Actual YTD"
//                     value={kpiData.actualYTD}
//                     Icon={BarChart3}
//                     iconColor="#2563EB"
//                     iconBackground="#E8EDFF"
//                     titleColor="#2563EB"
//                     titleBackground="#F0F3FF"
//                 />


//                 {/* =================================================
//                     6. TARGET YTD
//                 ================================================= */}

//                 <OpexKpiCard
//                     title="Target YTD"
//                     value={kpiData.targetYTD}
//                     Icon={Target}
//                     iconColor="#16A34A"
//                     iconBackground="#E4F8E8"
//                     titleColor="#16A34A"
//                     titleBackground="#EFFBF1"
//                 />


//                 {/* =================================================
//                     7. VARIANCE YTD
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

           IMPORTANT:
           Do NOT animate null to 0.

           Target / variance values should remain —
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

           First API value:
           0 → actual value

           When API value changes:
           previous value → new value
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

               Smooth start and smooth finish
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

const formatCurrency = (value) => {
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

    /* =====================================================
       AED MILLIONS DISPLAY

       Backend:
       123224.59 AED

       Display:
       AED 0.12M
    ===================================================== */

    const millions = number / 1000000;

    return `AED ${millions.toLocaleString("en-US", {
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
========================================================= */

function OpexKpiCard({
    title,
    value,
    Icon,

    iconColor,
    iconBackground,

    titleColor,
    titleBackground,

    /* =====================================================
       STATUS
       
       Status will only be displayed when:
       1. value exists
       2. status exists
    ===================================================== */

    status = null,

    isPercentage = false,
}) {
    return (
        <div
            style={{
                flex: "1 1 0",
                minWidth: 0,

                height: 66,

                /* =================================================
                   PASTEL BACKGROUND
                ================================================= */

                background: titleBackground,

                /* No border */
                border: "none",

                borderRadius: 7,

                boxSizing: "border-box",

                padding: "7px 8px",

                display: "flex",
                alignItems: "center",

                overflow: "hidden",
            }}
        >

            {/* =================================================
                ICON
            ================================================= */}

            <div
                style={{
                    width: 29,
                    height: 29,

                    minWidth: 29,

                    borderRadius: "60%",

                    background: iconBackground,

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    marginRight: 7,
                }}
            >
                <Icon
                    size={25}
                    strokeWidth={2}
                    color={iconColor}
                />
            </div>


            {/* =================================================
                CONTENT
            ================================================= */}

            <div
                style={{
                    minWidth: 0,

                    display: "flex",
                    flexDirection: "column",

                    justifyContent: "center",

                    flex: 1,
                }}
            >

                {/* =================================================
                    TITLE
                ================================================= */}

                <div
                    style={{
                        display: "inline-flex",

                        alignItems: "center",

                        alignSelf: "flex-start",

                        minHeight: 17,

                        padding: "2px 6px",

                        borderRadius: 4,

                        background:
                            "rgba(255, 255, 255, 0.45)",

                        color: titleColor,

                        fontSize: 12,

                        lineHeight: "12px",

                        fontWeight: 600,

                        whiteSpace: "nowrap",

                        marginBottom: 3,
                    }}
                >
                    {title}
                </div>


                {/* =================================================
                    VALUE
                ================================================= */}

                <div
                    style={{
                        fontSize: 16,

                        lineHeight: "15px",

                        fontWeight: 800,

                        color: "#0F172A",

                        whiteSpace: "nowrap",
                    }}
                >
                    <AnimatedNumber
                        value={value}
                        formatter={
                            isPercentage
                                ? formatPercentage
                                : formatCurrency
                        }
                    />
                </div>


                {/* =================================================
                    STATUS

                    IMPORTANT:
                    Status is displayed ONLY when the value
                    is actually available.

                    If variance_ptd_pct is null:
                        Value  → —
                        Status → hidden
                ================================================= */}

                {value !== null &&
                    value !== undefined &&
                    value !== "" &&
                    !Number.isNaN(Number(value)) &&
                    status && (
                        <div
                            style={{
                                marginTop: 2,

                                fontSize: 10,

                                lineHeight: "10px",

                                fontWeight: 600,

                                color:
                                    String(status).toLowerCase() ===
                                    "favourable"
                                        ? "#16A34A"
                                        : "#DC2626",

                                whiteSpace: "nowrap",
                            }}
                        >
                            {status}
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

                /* =================================================
                   PASTEL SUMMARY BACKGROUND
                ================================================= */

                background: "#F8FAFC",

                /* No border */
                border: "none",

                borderRadius: 8,

                boxSizing: "border-box",

                overflow: "hidden",
            }}
        >

            {/* ===================================================
                HEADER
            =================================================== */}

            <div
                style={{
                    height: 39,

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "space-between",

                    padding: "0 9px",

                    boxSizing: "border-box",

                    borderBottom: "none",

                    background: "#F8FAFC",
                }}
            >

                {/* TITLE */}

                <h3
                    style={{
                        margin: 0,

                        fontSize: 12,

                        lineHeight: "15px",

                        fontWeight: 700,

                        color: "#0F172A",

                        whiteSpace: "nowrap",
                    }}
                >
                    Operating Expense Summary
                </h3>


                {/* THREE DOT */}

                <button
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
                </button>

            </div>


            {/* ===================================================
                KPI CARDS CONTAINER
            =================================================== */}

            <div
                style={{
                    width: "100%",

                    display: "flex",

                    alignItems: "stretch",

                    gap: 6,

                    padding: "7px",

                    boxSizing: "border-box",

                    overflowX: "auto",

                    background: "#F8FAFC",
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
                    iconBackground="#E8EDFF"
                    titleColor="#2563EB"
                    titleBackground="#F0F3FF"
                />


                {/* =================================================
                    2. TARGET PTD
                ================================================= */}

                <OpexKpiCard
                    title="Target PTD"
                    value={kpiData.targetPTD}
                    Icon={Target}
                    iconColor="#16A34A"
                    iconBackground="#E4F8E8"
                    titleColor="#16A34A"
                    titleBackground="#EFFBF1"
                />


                {/* =================================================
                    3. VARIANCE PTD
                ================================================= */}

                <OpexKpiCard
                    title="Variance PTD"
                    value={kpiData.variancePTD}
                    Icon={TrendingUp}
                    iconColor="#F97316"
                    iconBackground="#FFEEDB"
                    titleColor="#F97316"
                    titleBackground="#FFF5E9"
                />


                {/* =================================================
                    4. VARIANCE PTD %
                ================================================= */}

                <OpexKpiCard
                    title="Variance PTD %"
                    value={kpiData.variancePTDPercent}
                    Icon={Percent}
                    iconColor="#E11D48"
                    iconBackground="#FFE7EC"
                    titleColor="#E11D48"
                    titleBackground="#FFF1F4"
                    isPercentage
                    status={data.variance_ptd_status}
                />


                {/* =================================================
                    5. ACTUAL YTD
                ================================================= */}

                <OpexKpiCard
                    title="Actual YTD"
                    value={kpiData.actualYTD}
                    Icon={BarChart3}
                    iconColor="#2563EB"
                    iconBackground="#E8EDFF"
                    titleColor="#2563EB"
                    titleBackground="#F0F3FF"
                />


                {/* =================================================
                    6. TARGET YTD
                ================================================= */}

                <OpexKpiCard
                    title="Target YTD"
                    value={kpiData.targetYTD}
                    Icon={Target}
                    iconColor="#16A34A"
                    iconBackground="#E4F8E8"
                    titleColor="#16A34A"
                    titleBackground="#EFFBF1"
                />


                {/* =================================================
                    7. VARIANCE YTD
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