import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    WalletCards,
    CircleDollarSign,
    Hourglass,
    AlertCircle,
    CalendarClock,
    RefreshCw,
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
                    Number(
                        previousValueRef.current
                    )
                )
                ? Number(
                    previousValueRef.current
                )
                : 0;


        const endValue = numericValue;

        const startTime =
            performance.now();


        /* =====================================================
           ANIMATION
        ===================================================== */

        const animate = (currentTime) => {

            const elapsed =
                currentTime - startTime;


            const progress =
                Math.min(
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


            setDisplayValue(
                currentValue
            );


            if (progress < 1) {

                animationFrameRef.current =
                    requestAnimationFrame(
                        animate
                    );

            } else {

                setDisplayValue(
                    endValue
                );

                previousValueRef.current =
                    endValue;
            }
        };


        animationFrameRef.current =
            requestAnimationFrame(
                animate
            );


        return () => {

            if (
                animationFrameRef.current
            ) {

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

        return <>N/A</>;
    }


    return (
        <>
            {formatter(displayValue)}
        </>
    );
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

        return "N/A";
    }


    const number = Number(value);


    if (Number.isNaN(number)) {

        return "N/A";
    }


    const absoluteNumber =
        Math.abs(number);


    /* =====================================================
       MILLIONS
    ===================================================== */

    if (
        absoluteNumber >=
        1_000_000
    ) {

        return `${currency} ${(
            number / 1_000_000
        ).toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}M`;
    }


    /* =====================================================
       THOUSANDS
    ===================================================== */

    if (
        absoluteNumber >=
        1_000
    ) {

        return `${currency} ${(
            number / 1_000
        ).toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}K`;
    }


    /* =====================================================
       NORMAL VALUE
    ===================================================== */

    return `${currency} ${number.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
};


/* =========================================================
   FORMAT DAYS
========================================================= */

const formatDays = (value) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "N/A";
    }


    const number = Number(value);


    if (Number.isNaN(number)) {

        return "N/A";
    }


    return `${number.toFixed(1)} days`;
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

        return "N/A";
    }


    const number = Number(value);


    if (Number.isNaN(number)) {

        return "N/A";
    }


    return `${number.toFixed(1)}%`;
};


/* =========================================================
   PAYABLE KPI CARD
========================================================= */

function PayableKpiCard({

    title,

    value,

    Icon,

    iconColor,

    iconBackground,

    titleColor,

    formatter,

}) {

    /* =====================================================
       CARD HOVER
    ===================================================== */

    const [isHovered, setIsHovered] =
        useState(false);


    return (

        <div

            onMouseEnter={() =>
                setIsHovered(true)
            }

            onMouseLeave={() =>
                setIsHovered(false)
            }

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
                    `1px solid ${isHovered
                        ? `${iconColor}55`
                        : "rgba(15, 23, 42, 0.05)"
                    }`,

                borderRadius: 12,

                boxSizing:
                    "border-box",

                padding:
                    "10px 12px",

                display: "flex",

                alignItems:
                    "center",

                overflow:
                    "visible",

                /* =================================================
                   HOVER
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

                    strokeWidth={2.35}

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

                        marginBottom:
                            2,
                    }}
                >

                    {title}

                </div>


                {/* =================================================
                    VALUE
                ================================================= */}

                <div

                    style={{

                        fontSize:
                            15,

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

                        value={
                            value
                        }

                        formatter={
                            formatter
                        }

                    />

                </div>

            </div>

        </div>
    );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PayablesSummary({

    data = {},

    reportingCurrency = "AED",

}) {

    const summaryData = data ?? {};


    /* =========================================================
       API RESPONSE MAPPING

       Values are passed from the parent.

       No frontend calculations are performed.
    ========================================================= */

    const totalPayables =
        summaryData.total_payables ??
        summaryData.totalPayables ??
        summaryData.total_ap ??
        null;

    const currentPayables =
        summaryData.current_payables ??
        summaryData.currentPayables ??
        summaryData.current_not_due ??
        null;

    const overduePayables =
        summaryData.overdue_payables ??
        summaryData.overduePayables ??
        summaryData.overdue_ap ??
        null;

    const overdue90Days =
        summaryData.overdue_gt_90 ??
        summaryData.overdueAbove90 ??
        summaryData.above_90_ap ??
        null;

    const dpoDays =
        summaryData.dpo ??
        summaryData.dpo_days ??
        null;


    return (

        <div

            style={{

                width: "100%",

                background:
                    "#F8FAFC",

                border:
                    "none",

                borderRadius:
                    10,

                boxSizing:
                    "border-box",

                overflow:
                    "visible",
                   
            }}
        >

            {/* ===================================================
                HEADER
            =================================================== */}
{/* 
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

                        fontSize:
                            14,

                        lineHeight:
                            "15px",

                        fontWeight:
                            700,

                        color:
                            "#0F172A",

                        whiteSpace:
                            "nowrap",
                    }}
                >

                    Payables Summary

                </h3>

            </div> */}


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
                    1. TOTAL PAYABLES
                ================================================= */}

                <PayableKpiCard

                    title="Total Payables"

                    value={
                        totalPayables
                    }

                    Icon={
                        WalletCards
                    }

                    iconColor="#2563EB"

                    iconBackground="#EFF6FF"

                    titleColor="#2563EB"

                    formatter={(
                        value
                    ) =>
                        formatCurrency(
                            value,
                            reportingCurrency
                        )
                    }

                />


                {/* =================================================
                    2. CURRENT PAYABLES
                ================================================= */}

                <PayableKpiCard

                    title="Current Payables"

                    value={
                        currentPayables
                    }

                    Icon={
                        CircleDollarSign
                    }

                    iconColor="#16A34A"

                    iconBackground="#ECFDF3"

                    titleColor="#16A34A"

                    formatter={(
                        value
                    ) =>
                        formatCurrency(
                            value,
                            reportingCurrency
                        )
                    }

                />


                {/* =================================================
                    3. OVERDUE PAYABLES
                ================================================= */}

                <PayableKpiCard

                    title="Overdue Payables"

                    value={
                        overduePayables
                    }

                    Icon={
                        Hourglass
                    }

                    iconColor="#F97316"

                    iconBackground="#FFF7ED"

                    titleColor="#EA580C"

                    formatter={(
                        value
                    ) =>
                        formatCurrency(
                            value,
                            reportingCurrency
                        )
                    }

                />


                {/* =================================================
                    4. OVERDUE > 90 DAYS
                ================================================= */}

                <PayableKpiCard

                    title="Overdue > 90 Days"

                    value={
                        overdue90Days
                    }

                    Icon={
                        AlertCircle
                    }

                    iconColor="#DB2777"

                    iconBackground="#FDF2F8"

                    titleColor="#DB2777"

                    formatter={(
                        value
                    ) =>
                        formatCurrency(
                            value,
                            reportingCurrency
                        )
                    }

                />


                {/* =================================================
                    5. DPO
                ================================================= */}

                <PayableKpiCard

                    title="DPO (Days)"

                    value={
                        dpoDays
                    }

                    Icon={
                        CalendarClock
                    }

                    iconColor="#0891B2"

                    iconBackground="#ECFEFF"

                    titleColor="#0891B2"

                    formatter={() =>
                        "N/A"
                    }

                />



            </div>

        </div>
    );
}