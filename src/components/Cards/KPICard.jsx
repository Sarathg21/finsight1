

// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import Sparkline from "../Sparkline";
// import { FaArrowUp, FaArrowDown } from "react-icons/fa";

// export default function KPICard({
//   icon: Icon,
//   title,
//   value,
//   trend,
//   trendValue,
//   comparisonText,

//   titleColor = "#475569",
//   iconColor = "#2563EB",
//   iconBackground = "#EFF6FF",

//   sparklineColor = "#2563EB",
//   sparklineData = [],

//   trendColor = "#16A34A",
//   cardBackground = "#FFFFFF", titleBackground = "transparent", isCurrency = true,
//   formatType = "currency", currency = "AED",
// }) {

//   const isUp = trend === "up";
//   const [displayValue, setDisplayValue] = useState(0);

//   useEffect(() => {
//     if (
//       value === null ||
//       value === undefined ||
//       value === ""
//     )
//       return;

//     const number = Number(value);

//     if (isNaN(number)) return;

//     let start = 0;
//     const duration = 1000;
//     const increment = number / (duration / 16);

//     setDisplayValue(0);

//     const timer = setInterval(() => {
//       start += increment;

//       if (start >= number) {
//         start = number;
//         clearInterval(timer);
//       }

//       setDisplayValue(start);
//     }, 16);

//     return () => clearInterval(timer);
//   }, [value]);

//   const formattedValue = (inputValue) => {
//     if (value === null || value === undefined || value === "") {
//       return "-";
//     }


//     const text = String(inputValue);


//     // Number format (Inventory Quantity)
//     if (formatType === "number") {

//       const number = Number(
//         text.replace(/,/g, "")
//       );

//       if (isNaN(number)) return text;

//       return `${Math.round(number).toLocaleString("en-IN")} Nos`;
//     }



//     // Ratio format (Inventory Turnover)
//     if (formatType === "ratio") {

//       const number = Number(text);

//       if (isNaN(number)) return text;

//       return `${number.toFixed(2)}x`;
//     }



//     // Days format
//     if (formatType === "days") {

//       const number = Number(
//         text.replace(/[^0-9.]/g, "")
//       );

//       if (isNaN(number)) return text;

//       return `${number.toFixed(0)} Days`;
//     }



//     // Currency format
//     if (formatType === "currency") {

//       if (text.match(/^[A-Z]{3}/)) {
//         return text;
//       }


//       const number = Number(text);


//       if (isNaN(number)) {
//         return text;
//       }


//       if (number >= 1000000) {
//         return `${currency} ${(number / 1000000).toFixed(2)}M`;
//       }

//       if (number >= 1000) {
//         return `${currency} ${(number / 1000).toFixed(2)}K`;
//       }

//       return `${currency} ${number.toLocaleString("en-US", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       })}`;
//     }
//     return text;
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       whileHover={{
//         y: -2,
//         scale: 1.01,
//         transition: { duration: 0.2 }
//       }}
//       transition={{
//         duration: 0.35,
//         ease: "easeOut"
//       }}
//       className="kpi-card w-full"
//       style={{
//         backgroundColor: cardBackground,
//         borderRadius: 14,
//         padding: "10px 12px",
//         minHeight: 120,
//         boxShadow: "0 2px 8px rgba(15,23,42,.06)",
//       }}
//     >
//       {/* Header */}

//       <div
//         className="kpi-header"
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 10,
//           marginBottom: 8,
//         }}
//       >
//         <div
//           className="kpi-icon"
//           style={{
//             backgroundColor: iconBackground,
//             width: 32,
//             height: 32,
//             borderRadius: "50%",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             flexShrink: 0,
//           }}
//         >
//           {Icon && (
//             <Icon
//               size={16}
//               style={{
//                 color: iconColor,
//               }}
//             />
//           )}
//         </div>

//         <span
//           className="kpi-title"
//           style={{
//             color: titleColor,
//             backgroundColor: titleBackground,
//             fontSize: "11px",
//             fontWeight: 700,
//             lineHeight: "12px",
//             padding: "4px 8px",
//             borderRadius: "6px",
//             display: "inline-block",
//           }}
//         >
//           {title}
//         </span>
//       </div>

//       {/* Value */}

//       <div className="kpi-content">
//         <h2
//           className="kpi-value"
//           style={{
//             fontSize: "clamp(14px, 1.5vw, 18px)",
//             fontWeight: 800,
//             lineHeight: "22px",
//             color: "#0f172a",
//             margin: 0,
//           }}
//         >
//           {formattedValue(
//             displayValue > 0 || Number(value) === 0
//               ? displayValue
//               : value
//           )}
//         </h2>

//         {/* Trend */}

//         <div
//           className="kpi-trend"
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 3,
//             marginTop: 4
//           }}
//         >
//           {isUp ? (
//             <FaArrowUp
//               size={7}
//               style={{ color: trendColor }}
//             />
//           ) : (
//             <FaArrowDown
//               size={7}
//               style={{ color: trendColor }}
//             />
//           )}

//           <span
//             className="kpi-trend-value"
//             style={{
//               color: trendColor,
//               fontSize: "9px",
//               fontWeight: 700,
//             }}
//           >
//             {trendValue}
//           </span>

//           <span
//             className="kpi-comparison"
//             style={{
//               fontSize: "9px",
//               color: "#64748b",
//             }}
//           >
//             {comparisonText}
//           </span>
//         </div>
//       </div>

//       {/* Sparkline */}

//       <div
//         className="kpi-sparkline"
//         style={{
//           marginTop: 8,
//           height: "clamp(18px,3vw,22px)"
//         }}
//       >
//         <Sparkline
//           data={sparklineData}
//           color={sparklineColor}
//         />
//       </div>
//     </motion.div>
//   );
// }


import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sparkline from "../Sparkline";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function KPICard({
  icon: Icon,
  title,
  value,
  trend,
  trendValue,
  comparisonText,

  titleColor = "#475569",
  iconColor = "#2563EB",
  iconBackground = "#EFF6FF",

  sparklineColor = "#2563EB",
  sparklineData = [],

  trendColor = "#16A34A",
  cardBackground = "#FFFFFF",
  titleBackground = "transparent",
  isCurrency = true,
  formatType = "currency",
  currency = "AED",

  /*
   * =========================================================
   * OPERATING EXPENSES ONLY
   *
   * Default = false
   * So existing pages are NOT affected.
   * =========================================================
   */
  isOperatingExpenses = false,
  }) {
  const isUp = trend === "up";

  const [displayValue, setDisplayValue] = useState(0);

  /* =========================================================
     Operating Expenses KPI Colors
     
     These values are used ONLY when
     isOperatingExpenses === true.
  ========================================================= */

  const getOperatingExpenseStyles = () => {
    if (!isOperatingExpenses) {
      return {
        iconSize: 16,
        finalTitleColor: titleColor,
        finalTitleBackground: titleBackground,
      };
    }

    const normalizedTitle = String(title || "").toLowerCase();

    /*
     * Actual PTD / Actual YTD
     * Blue
     */
    if (
      normalizedTitle === "actual ptd" ||
      normalizedTitle === "actual ytd"
    ) {
      return {
        iconSize: 20,
        finalTitleColor: "#2563EB",
        finalTitleBackground: "#EFF6FF",
      };
    }

    /*
     * Target PTD / Target YTD
     * Green
     */
    if (
      normalizedTitle === "target ptd" ||
      normalizedTitle === "target ytd"
    ) {
      return {
        iconSize: 20,
        finalTitleColor: "#16A34A",
        finalTitleBackground: "#F0FDF4",
      };
    }

    /*
     * Variance PTD
     * Orange
     */
    if (normalizedTitle === "variance ptd") {
      return {
        iconSize: 20,
        finalTitleColor: "#F97316",
        finalTitleBackground: "#FFF7ED",
      };
    }

    /*
     * Variance PTD %
     * Red
     */
    if (normalizedTitle === "variance ptd %") {
      return {
        iconSize: 20,
        finalTitleColor: "#E11D48",
        finalTitleBackground: "#FFF1F2",
      };
    }

    /*
     * Fallback for any future Operating Expenses KPI
     */
    return {
      iconSize: 20,
      finalTitleColor: titleColor,
      finalTitleBackground: titleBackground,
    };
  };

  const {
    iconSize,
    finalTitleColor,
    finalTitleBackground,
  } = getOperatingExpenseStyles();

  /* =========================================================
     Value Animation
     ========================================================= */

  useEffect(() => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return;
    }

    const number = Number(value);

    if (isNaN(number)) return;

    let start = 0;
    const duration = 1000;
    const increment = number / (duration / 16);

    setDisplayValue(0);

    const timer = setInterval(() => {
      start += increment;

      if (start >= number) {
        start = number;
        clearInterval(timer);
      }

      setDisplayValue(start);
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  /* =========================================================
     Value Formatting
     ========================================================= */

  const formattedValue = (inputValue) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    const text = String(inputValue);

    /* =======================================================
       Number format
       ======================================================= */

    if (formatType === "number") {
      const number = Number(
        text.replace(/,/g, "")
      );

      if (isNaN(number)) return text;

      return `${Math.round(
        number
      ).toLocaleString("en-IN")} Nos`;
    }

    /* =======================================================
       Ratio format
       ======================================================= */

    if (formatType === "ratio") {
      const number = Number(text);

      if (isNaN(number)) return text;

      return `${number.toFixed(2)}x`;
    }

    /* =======================================================
       Days format
       ======================================================= */

    if (formatType === "days") {
      const number = Number(
        text.replace(/[^0-9.]/g, "")
      );

      if (isNaN(number)) return text;

      return `${number.toFixed(0)} Days`;
    }

    /* =======================================================
       Currency format
       ======================================================= */

    if (formatType === "currency") {
      if (text.match(/^[A-Z]{3}/)) {
        return text;
      }

      const number = Number(text);

      if (isNaN(number)) {
        return text;
      }

      if (number >= 1000000) {
        return `${currency} ${(
          number / 1000000
        ).toFixed(2)}M`;
      }

      if (number >= 1000) {
        return `${currency} ${(
          number / 1000
        ).toFixed(2)}K`;
      }

      return `${currency} ${number.toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;
    }

    return text;
  };

  /* =========================================================
     UI
     ========================================================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -2,
        scale: 1.01,
        transition: {
          duration: 0.2,
        },
      }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      className="kpi-card w-full"
      style={{
        backgroundColor: cardBackground,
        borderRadius: 14,
        padding: "10px 12px",
        minHeight: 120,
        boxShadow:
          "0 2px 8px rgba(15,23,42,.06)",
      }}
    >
      {/* =====================================================
          Header
      ===================================================== */}

      <div
        className="kpi-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        {/* ===================================================
            ICON
        =================================================== */}

        <div
          className="kpi-icon"
          style={{
            backgroundColor: iconBackground,

            /*
             * Existing pages:
             * 32 x 32
             *
             * Operating Expenses:
             * same container, but larger icon
             */
            width: 32,
            height: 32,

            borderRadius: "50%",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            flexShrink: 0,
          }}
        >
          {Icon && (
            <Icon
              size={iconSize}
              style={{
                color: iconColor,
              }}
            />
          )}
        </div>

        {/* ===================================================
            TITLE
        =================================================== */}

        <span
          className="kpi-title"
          style={{
            /*
             * Existing pages keep their original titleColor.
             *
             * Operating Expenses gets:
             * Blue / Green / Orange / Red
             */
            color: finalTitleColor,

            /*
             * Existing pages keep their original
             * titleBackground.
             *
             * Operating Expenses gets a light
             * background behind the title.
             */
            backgroundColor: finalTitleBackground,

            fontSize: "11px",
            fontWeight: 700,
            lineHeight: "12px",

            padding: "4px 8px",

            borderRadius: "6px",

            display: "inline-block",
          }}
        >
          {title}
        </span>
      </div>

      {/* =====================================================
          VALUE
      ===================================================== */}

      <div className="kpi-content">
        <h2
          className="kpi-value"
          style={{
            fontSize:
              "clamp(14px, 1.5vw, 18px)",
            fontWeight: 800,
            lineHeight: "22px",
            color: "#0f172a",
            margin: 0,
          }}
        >
          {formattedValue(
            displayValue > 0 ||
              Number(value) === 0
              ? displayValue
              : value
          )}
        </h2>

        {/* ===================================================
            TREND
        =================================================== */}

        <div
          className="kpi-trend"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            marginTop: 4,
          }}
        >
          {isUp ? (
            <FaArrowUp
              size={7}
              style={{
                color: trendColor,
              }}
            />
          ) : (
            <FaArrowDown
              size={7}
              style={{
                color: trendColor,
              }}
            />
          )}

          <span
            className="kpi-trend-value"
            style={{
              color: trendColor,
              fontSize: "9px",
              fontWeight: 700,
            }}
          >
            {trendValue}
          </span>

          <span
            className="kpi-comparison"
            style={{
              fontSize: "9px",
              color: "#64748b",
            }}
          >
            {comparisonText}
          </span>
        </div>
      </div>

      {/* =====================================================
          SPARKLINE
      ===================================================== */}

      <div
        className="kpi-sparkline"
        style={{
          marginTop: 8,
          height: "clamp(18px,3vw,22px)",
        }}
      >
        <Sparkline
          data={sparklineData}
          color={sparklineColor}
        />
      </div>
    </motion.div>
  );
}