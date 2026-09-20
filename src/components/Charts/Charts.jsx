
import React, { useState, useRef, useEffect } from "react";
import {
  ResponsiveContainer, BarChart, Bar, Line, LineChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, LabelList, ComposedChart, ReferenceLine, Label,
} from 'recharts';
import { Clock3, PackageOpen, CircleDollarSign, RefreshCw, CircleCheck, MoreVertical, Eye, FileSpreadsheet, FileText, } from "lucide-react";

import { createPortal } from "react-dom";

/* =========================================================
   RECEIVABLES AGING SUMMARY CARD

   UI:
   - Donut LEFT
   - Aging Bucket / % / Amount RIGHT
   - Total inside donut
   - As-on date below donut
   - 3-dot action menu
   - Hover fade interaction
   - Existing callbacks remain optional
========================================================= */

export function AgingSummaryCard({
  title,
  data,
  legendData = [],
  total,
  date,
  showSummaryHeader = false,
  wideLegend = false,
  currency = "AED",

  /* =========================================================
     OPTIONAL ACTION CALLBACKS
     Existing functions are NOT affected
  ========================================================= */
  onViewAll,
  onExportExcel,
  onExportPdf,

  /* =========================================================
     OPTIONAL COMMON EXPORT STATE
  ========================================================= */
  commonExporting = null,
}) {

  /* =========================================================
     HOVER STATE
  ========================================================= */

  const [activeIndex, setActiveIndex] =
    useState(null);


  /* =========================================================
     ACTION MENU STATE
  ========================================================= */

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [menuPosition, setMenuPosition] =
    useState({
      top: 0,
      right: 0,
    });


  const menuRef = useRef(null);

  const buttonRef = useRef(null);


  /* =========================================================
     UPDATE MENU POSITION

     Menu is rendered through portal so it will not be
     clipped by dashboard/card containers.
  ========================================================= */

  const updateMenuPosition = () => {

    if (!buttonRef.current) {
      return;
    }

    const rect =
      buttonRef.current.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + 6,

      right: Math.max(
        8,
        window.innerWidth - rect.right
      ),
    });
  };


  /* =========================================================
     MENU POSITION EFFECT
  ========================================================= */

  useEffect(() => {

    if (!menuOpen) {
      return;
    }

    updateMenuPosition();

    const handleResize = () => {
      updateMenuPosition();
    };

    const handleScroll = () => {
      updateMenuPosition();
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    window.addEventListener(
      "scroll",
      handleScroll,
      true
    );

    return () => {

      window.removeEventListener(
        "resize",
        handleResize
      );

      window.removeEventListener(
        "scroll",
        handleScroll,
        true
      );
    };

  }, [menuOpen]);


  /* =========================================================
     CLOSE MENU WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {

    if (!menuOpen) {
      return;
    }

    const handleOutsideClick = (event) => {

      const clickedMenu =
        menuRef.current &&
        menuRef.current.contains(
          event.target
        );

      const clickedButton =
        buttonRef.current &&
        buttonRef.current.contains(
          event.target
        );

      if (
        !clickedMenu &&
        !clickedButton
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };

  }, [menuOpen]);


  /* =========================================================
     FORMAT AMOUNT

     Center / Tooltip:
       AED 740.41M

     Table:
       740.41M
  ========================================================= */

  const formatAmount = (
    value,
    withCurrency = false
  ) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    const amount = Number(value);

    if (Number.isNaN(amount)) {
      return "-";
    }

    let formattedValue;

    if (
      Math.abs(amount) >=
      1_000_000_000
    ) {

      formattedValue =
        `${(
          amount / 1_000_000_000
        ).toFixed(2)}B`;

    } else if (
      Math.abs(amount) >=
      1_000_000
    ) {

      formattedValue =
        `${(
          amount / 1_000_000
        ).toFixed(2)}M`;

    } else if (
      Math.abs(amount) >=
      1_000
    ) {

      formattedValue =
        `${(
          amount / 1_000
        ).toFixed(2)}K`;

    } else {

      formattedValue =
        amount.toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        );
    }

    return withCurrency
      ? `${currency} ${formattedValue}`
      : formattedValue;
  };


  /* =========================================================
     SAFE DATA
  ========================================================= */

  const safeData =
    Array.isArray(data)
      ? data
      : [];


  const safeLegendData =
    Array.isArray(legendData)
      ? legendData
      : [];


  /* =========================================================
     CUSTOM TOOLTIP
  ========================================================= */

  const AgingTooltip = ({
    active,
    payload,
  }) => {

    if (
      !active ||
      !payload ||
      !payload.length
    ) {
      return null;
    }

    const item =
      payload[0]?.payload;

    if (!item) {
      return null;
    }

    return (
      <div
        style={{
          background: "#FFFFFF",
          border:
            "1px solid #E2E8F0",
          borderRadius: "8px",
          padding: "10px 12px",
          minWidth: "185px",
          boxShadow:
            "0 8px 24px rgba(15, 23, 42, 0.14)",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          pointerEvents: "none",
        }}
      >

        {/* TOOLTIP HEADER */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            paddingBottom: "7px",
            marginBottom: "7px",
            borderBottom:
              "1px solid #E2E8F0",
          }}
        >

          <span
            style={{
              width: "8px",
              height: "8px",
              minWidth: "8px",
              borderRadius: "50%",
              background:
                item.color ||
                "#2563EB",
              display: "inline-block",
            }}
          />

          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#081B46",
              whiteSpace: "nowrap",
            }}
          >
            {item.name}
          </span>

        </div>


        {/* AMOUNT */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "18px",
            marginBottom: "5px",
          }}
        >

          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#64748B",
            }}
          >
            Amount
          </span>

          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              color: "#081B46",
              whiteSpace: "nowrap",
            }}
          >
            {formatAmount(
              item.value,
              true
            )}
          </span>

        </div>


        {/* PERCENTAGE */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "18px",
          }}
        >

          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#64748B",
            }}
          >
            Percentage
          </span>

          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              color: "#081B46",
            }}
          >
            {Number(
              item.percentage || 0
            ).toFixed(2)}
            %
          </span>

        </div>

      </div>
    );
  };


  /* =========================================================
     MENU HANDLERS
  ========================================================= */

  const handleViewAll = () => {

    setMenuOpen(false);

    if (typeof onViewAll === "function") {
      onViewAll();
    }
  };


  const handleExportExcel = () => {

    if (
      commonExporting === "excel"
    ) {
      return;
    }

    setMenuOpen(false);

    if (
      typeof onExportExcel ===
      "function"
    ) {
      onExportExcel();
    }
  };


  const handleExportPdf = () => {

    if (
      commonExporting === "pdf"
    ) {
      return;
    }

    setMenuOpen(false);

    if (
      typeof onExportPdf ===
      "function"
    ) {
      onExportPdf();
    }
  };


  /* =========================================================
     PORTAL ACTION MENU

     IMPORTANT:
     - Always renders the 3 actions
     - Does not affect export functions
     - Appears above all cards
  ========================================================= */

  const actionMenu =
    menuOpen &&
      typeof document !== "undefined"
      ? createPortal(

        <div
          ref={menuRef}
          role="menu"
          style={{
            position: "fixed",

            top:
              `${menuPosition.top}px`,

            right:
              `${menuPosition.right}px`,

            width: "175px",

            minWidth: "175px",

            background:
              "#FFFFFF",

            border:
              "1px solid #E5E7EB",

            borderRadius: "8px",

            boxShadow:
              "0 8px 24px rgba(15, 23, 42, 0.14)",

            padding: "5px 0",

            zIndex: 999999,

            boxSizing:
              "border-box",

            overflow: "hidden",
          }}
        >

          {/* =================================================
                VIEW ALL
            ================================================= */}

          <button
            type="button"
            role="menuitem"
            onClick={
              handleViewAll
            }
            disabled={
              !onViewAll
            }
            style={{
              width: "100%",

              height: "36px",

              display: "flex",

              alignItems:
                "center",

              gap: "10px",

              border: "none",

              background:
                "transparent",

              padding:
                "0 12px",

              cursor:
                onViewAll
                  ? "pointer"
                  : "not-allowed",

              textAlign: "left",

              fontFamily:
                "Inter, ui-sans-serif, system-ui, sans-serif",

              fontSize: "12px",

              fontWeight: 600,

              color:
                "#334155",

              opacity:
                onViewAll
                  ? 1
                  : 0.5,

              boxSizing:
                "border-box",
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
                width: "20px",
                fontSize: "14px",
                textAlign: "center",
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
            role="menuitem"
            onClick={
              handleExportExcel
            }
            disabled={
              !onExportExcel ||
              commonExporting ===
              "excel"
            }
            style={{
              width: "100%",

              height: "36px",

              display: "flex",

              alignItems:
                "center",

              gap: "10px",

              border: "none",

              background:
                "transparent",

              padding:
                "0 12px",

              cursor:
                onExportExcel &&
                  commonExporting !==
                  "excel"
                  ? "pointer"
                  : "not-allowed",

              textAlign: "left",

              fontFamily:
                "Inter, ui-sans-serif, system-ui, sans-serif",

              fontSize: "12px",

              fontWeight: 600,

              color:
                "#334155",

              opacity:
                !onExportExcel ||
                  commonExporting ===
                  "excel"
                  ? 0.5
                  : 1,

              boxSizing:
                "border-box",
            }}

            onMouseEnter={(
              event
            ) => {

              if (
                onExportExcel &&
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
                width: "20px",
                fontSize: "14px",
                textAlign: "center",
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
            role="menuitem"
            onClick={
              handleExportPdf
            }
            disabled={
              !onExportPdf ||
              commonExporting ===
              "pdf"
            }
            style={{
              width: "100%",

              height: "36px",

              display: "flex",

              alignItems:
                "center",

              gap: "10px",

              border: "none",

              background:
                "transparent",

              padding:
                "0 12px",

              cursor:
                onExportPdf &&
                  commonExporting !==
                  "pdf"
                  ? "pointer"
                  : "not-allowed",

              textAlign: "left",

              fontFamily:
                "Inter, ui-sans-serif, system-ui, sans-serif",

              fontSize: "12px",

              fontWeight: 600,

              color:
                "#334155",

              opacity:
                !onExportPdf ||
                  commonExporting ===
                  "pdf"
                  ? 0.5
                  : 1,

              boxSizing:
                "border-box",
            }}

            onMouseEnter={(
              event
            ) => {

              if (
                onExportPdf &&
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
                width: "20px",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              📄
            </span>

            <span>
              Export PDF
            </span>

          </button>

        </div>,

        document.body
      )
      : null;


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>

      <div
        className="card flex flex-col w-full min-w-0"
        style={{
          position: "relative",

          width: "100%",

          /*
             Increased enough to show all 9 aging buckets.
          */
          height: "320px",

          minHeight: "320px",

          background:
            "#FFFFFF",

          border:
            "1px solid #E2E8F0",

          borderRadius:
            "10px",

          padding:
            "12px 12px 9px 12px",

          boxSizing:
            "border-box",

          overflow:
            "visible",

          boxShadow:
            "0 1px 3px rgba(15, 23, 42, 0.04)",
        }}
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          style={{
            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "space-between",

            width: "100%",

            height: "22px",

            minHeight: "22px",

            marginBottom:
              "3px",

            flexShrink: 0,

            position: "relative",

            zIndex: 10,
          }}
        >

          {/* TITLE */}

          <h3
            style={{
              margin: 0,

              padding: 0,

              fontSize:
                "12px",

              lineHeight:
                "16px",

              fontWeight:
                800,

              color:
                "#081B46",

              letterSpacing:
                "-0.15px",

              whiteSpace:
                "nowrap",

              overflow:
                "hidden",

              textOverflow:
                "ellipsis",

              flex: 1,

              minWidth: 0,
            }}
          >
            {title} ({currency})
          </h3>


          {/* RIGHT SIDE */}

          <div
            style={{
              display: "flex",

              alignItems:
                "center",

              gap: "5px",

              flexShrink: 0,
            }}
          >

            {/* DATE */}

            {date && (
              <span
                style={{
                  fontSize:
                    "8px",

                  lineHeight:
                    "11px",

                  fontWeight:
                    600,

                  color:
                    "#94A3B8",

                  whiteSpace:
                    "nowrap",
                }}
              >
                {date}
              </span>
            )}


            {/* =================================================
                THREE DOT BUTTON
            ================================================= */}

            <button
              ref={buttonRef}
              type="button"

              aria-label="More options"
              aria-haspopup="menu"
              aria-expanded={
                menuOpen
              }

              onClick={(event) => {

                event.stopPropagation();

                if (!menuOpen) {
                  updateMenuPosition();
                }

                setMenuOpen(
                  (previous) =>
                    !previous
                );
              }}

              style={{
                width:
                  "24px",

                height:
                  "24px",

                minWidth:
                  "24px",

                border:
                  "none",

                background:
                  menuOpen
                    ? "#F1F5F9"
                    : "transparent",

                borderRadius:
                  "6px",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                cursor:
                  "pointer",

                color:
                  menuOpen
                    ? "#081B46"
                    : "#64748B",

                padding: 0,

                fontSize:
                  "19px",

                fontWeight:
                  900,

                lineHeight: 1,

                transition:
                  "all 150ms ease",
              }}

              onMouseEnter={(
                event
              ) => {

                event.currentTarget.style.background =
                  "#F1F5F9";

                event.currentTarget.style.color =
                  "#081B46";
              }}

              onMouseLeave={(
                event
              ) => {

                event.currentTarget.style.background =
                  menuOpen
                    ? "#F1F5F9"
                    : "transparent";

                event.currentTarget.style.color =
                  menuOpen
                    ? "#081B46"
                    : "#64748B";
              }}
            >
              ⋮
            </button>

          </div>

        </div>


        {/* =====================================================
            PORTAL ACTION MENU
        ===================================================== */}

        {actionMenu}


        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {safeData.length === 0 ? (

          <div
            style={{
              flex: 1,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              fontSize:
                "11px",

              fontWeight:
                600,

              color:
                "#94A3B8",
            }}
          >
            No Data Available
          </div>

        ) : (

          /* ===================================================
             MAIN CONTENT

             LEFT  = DONUT
             RIGHT = AGING TABLE
          =================================================== */

          <div
            style={{
              flex: 1,

              minHeight: 0,

              display:
                "grid",

              /*
                 Slightly more room for the table.
                 This also brings the columns closer.
              */
              gridTemplateColumns:
                "43% minmax(0, 57%)",

              columnGap:
                "4px",

              width:
                "100%",
            }}
          >

            {/* =================================================
                LEFT SIDE
                DONUT + DATE
            ================================================= */}

            <div
              style={{
                minWidth: 0,

                minHeight: 0,

                display:
                  "flex",

                flexDirection:
                  "column",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                position:
                  "relative",

                overflow:
                  "visible",
              }}
            >

              {/* =================================================
                  DONUT CONTAINER

                  Fixed height + smaller radius keeps donut
                  perfectly centered and prevents clipping.
              ================================================= */}

              <div
                style={{
                  width:
                    "100%",

                  height: "165px",
                  minHeight: "165px",

                  position:
                    "relative",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",
                }}
              >

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={1}
                  minHeight={1}
                >

                  <PieChart>

                    <Pie
                      data={
                        safeData
                      }

                      dataKey="value"

                      nameKey="name"

                      cx="50%"

                      cy="50%"

                      /*
                         FIXED:

                         Previous:
                           innerRadius = 60
                           outerRadius = 85

                         This was too large for the chart.

                         New:
                           innerRadius = 40
                           outerRadius = 58

                         This keeps the donut smaller,
                         centered and completely visible.
                      */
                      innerRadius={45}
                      outerRadius={80}

                      paddingAngle={1}

                      stroke="#FFFFFF"

                      strokeWidth={2}

                      isAnimationActive={
                        true
                      }

                      animationDuration={
                        650
                      }

                      animationEasing={
                        "ease-out"
                      }

                      onMouseEnter={(
                        _,
                        index
                      ) => {

                        setActiveIndex(
                          index
                        );
                      }}

                      onMouseLeave={() => {

                        setActiveIndex(
                          null
                        );
                      }}
                    >

                      {safeData.map(
                        (
                          entry,
                          idx
                        ) => {

                          const isActive =
                            activeIndex ===
                            idx;

                          const hasActive =
                            activeIndex !==
                            null;

                          return (
                            <Cell
                              key={
                                `aging-cell-${idx}`
                              }

                              fill={
                                entry.color ||
                                "#2563EB"
                              }

                              style={{
                                cursor:
                                  "pointer",

                                outline:
                                  "none",

                                opacity:
                                  hasActive &&
                                    !isActive
                                    ? 0.20
                                    : 1,

                                transition:
                                  "opacity 180ms ease, filter 180ms ease",

                                filter:
                                  isActive
                                    ? "brightness(1.06)"
                                    : "none",
                              }}
                            />
                          );
                        }
                      )}

                    </Pie>


                    {/* TOOLTIP */}

                    <Tooltip
                      content={
                        <AgingTooltip />
                      }

                      cursor={
                        false
                      }

                      wrapperStyle={{
                        outline:
                          "none",

                        zIndex:
                          100000,
                      }}
                    />

                  </PieChart>

                </ResponsiveContainer>


                {/* =================================================
                    CENTER TOTAL

                    Hidden when hovering.
                ================================================= */}

                {activeIndex === null && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "100px",
                      textAlign: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >

                      {/* CURRENCY */}
                      <div
                        style={{
                          marginTop: "2px",
                          fontSize: "14px",
                          lineHeight: "14px",
                          fontWeight: 900,
                          color: "#00000",
                          whiteSpace: "nowrap",
                          textTransform: "uppercase",
                        }}
                      >
                        {currency}
                      </div>

                      {/* VALUE */}
                      <div
                        style={{
                          fontSize: "14px",
                          lineHeight: "14px",
                          fontWeight: 900,
                          color: "#00000",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatAmount(total, false)}
                      </div>


                    </div>
                  </div>
                )}

              </div>


              {/* =================================================
                  AS ON DATE
              ================================================= */}

              {date && (
                <div
                  style={{
                    marginTop:
                      "-2px",

                    fontSize:
                      "8px",

                    lineHeight:
                      "11px",

                    fontWeight:
                      600,

                    color:
                      "#64748B",

                    whiteSpace:
                      "nowrap",

                    textAlign:
                      "center",
                  }}
                >
                  As on {date}
                </div>
              )}

            </div>


            {/* =================================================
    RIGHT SIDE

    AGING BUCKET / % / AMOUNT
================================================= */}

            <div
              style={{
                minWidth: 0,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",

                // MOVES HEADER + ROWS DOWN
                padding: "9px 0 2px 0",
                boxSizing: "border-box",
              }}
            >

              {/* =================================================
      HEADER ROW
  ================================================= */}

              <div
                style={{
                  display: "grid",

                  // KEEP COLUMNS ALIGNED
                  gridTemplateColumns: "minmax(0, 1fr) 43px 72px",

                  // SMALL HORIZONTAL GAP
                  columnGap: "3px",

                  alignItems: "center",

                  // VERY SMALL BOTTOM SPACE
                  padding: "0 1px 1px 1px",

                  // REDUCED GAP BETWEEN HEADER & FIRST ROW
                  marginBottom: "0px",

                  borderBottom: "1px solid #E2E8F0",

                  flexShrink: 0,
                }}
              >

                {/* AGING BUCKET */}

                <span
                  style={{
                    fontSize: "11px",
                    lineHeight: "12px",
                    fontWeight: 900,
                    color: "#081B46",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Aging Bucket
                </span>


                {/* % */}

                <span
                  style={{
                    fontSize: "11px",
                    lineHeight: "12px",
                    fontWeight: 900,
                    color: "#081B46",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  %
                </span>


                {/* AMOUNT */}

                <span
                  style={{
                    fontSize: "11px",
                    lineHeight: "12px",
                    fontWeight: 900,
                    color: "#081B46",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  Amount
                </span>

              </div>


              {/* =================================================
      AGING ROWS
  ================================================= */}

              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  width: "100%",

                  display: "flex",
                  flexDirection: "column",

                  // KEEP ROW GROUP CENTERED
                  justifyContent: "center",

                  // INCREASE GAP BETWEEN ROWS
                  gap: "6px",

                  overflow: "hidden",
                }}
              >

                {safeLegendData.map((item, idx) => {

                  const isActive =
                    activeIndex === idx;

                  const hasActive =
                    activeIndex !== null;

                  return (
                    <div
                      key={`aging-legend-${idx}`}
                      style={{
                        display: "grid",

                        // SAME COLUMNS AS HEADER
                        gridTemplateColumns:
                          "minmax(0, 1fr) 43px 72px",

                        columnGap: "3px",

                        alignItems: "center",

                        width: "100%",

                        // ROW HEIGHT
                        minHeight: "17px",

                        padding: "0 1px",

                        boxSizing: "border-box",

                        opacity:
                          hasActive && !isActive
                            ? 0.40
                            : 1,

                        transition:
                          "opacity 180ms ease",
                      }}
                    >

                      {/* =================================================
              BUCKET NAME
          ================================================= */}

                      <div
                        style={{
                          minWidth: 0,
                          display: "flex",
                          alignItems: "center",

                          // SMALL GAP BETWEEN DOT & TEXT
                          gap: "6px",
                        }}
                      >

                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            minWidth: "6px",

                            borderRadius: "50%",

                            background:
                              item.color || "#2563EB",

                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />

                        <span
                          style={{
                            minWidth: 0,

                            fontSize: "11px",
                            lineHeight: "14px",
                            fontWeight: 800,

                           color: "#081B46",

                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={item.name}
                        >
                          {item.name}
                        </span>

                      </div>


                      {/* =================================================
              PERCENTAGE
          ================================================= */}

                      <span
                        style={{
                          textAlign: "right",

                          fontSize: "11px",
                          lineHeight: "14px",
                          fontWeight: 800,

                          color: "#081B46",

                          whiteSpace: "nowrap",
                        }}
                      >
                        {Number(
                          item.percentage || 0
                        ).toFixed(2)}
                        %
                      </span>


                      {/* =================================================
              AMOUNT
          ================================================= */}

                      <span
                        style={{
                          textAlign: "right",

                          fontSize: "11px",
                          lineHeight: "14px",
                          fontWeight: 800,

                          color: "#081B46",

                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={formatAmount(item.value)}
                      >
                        {formatAmount(item.value)}
                      </span>

                    </div>
                  );
                })}

              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


export function OverDueSummaryCard({ title, data, total, Centerlabel, currency = "AED", }) {

  const formatAmount = (value) => {
    const amount = Number(value);

    if (isNaN(amount)) return "-";

    if (amount >= 1_000_000) {
      return `${currency} ${(amount / 1_000_000).toFixed(2)}M`;
    }

    if (amount >= 1_000) {
      return `${currency} ${(amount / 1_000).toFixed(2)}K`;
    }

    return `${currency} ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="card flex flex-col ">

      <h3 className="text-[14px] font-bold text-[#081B46] tracking-tight mb-2 flex items-center justify-between">
        <span>{title}</span>
      </h3>

      {data.length === 0 ? (
        <div
          className="
            flex
            h-57.5
            items-center
            justify-center
            text-sm
            font-medium
            text-slate-400
        "
        >
          No Data Available
        </div>
      ) : (

        <div className="flex-1 flex items-center justify-between gap-1">

          {/* PIE */}
          <div className="w-1/2 h-full relative flex items-center justify-center">
            <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {data.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, name, props) => [
                    formatAmount(value),
                    props.payload.name,
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute text-center">
              <p className="text-[13px] font-extrabold text-gray-900 leading-none">
                {formatAmount(total)}
              </p>
              <span className="text-[8px] font-extrabold text-gray-600 uppercase tracking-wider">
                {Centerlabel}
              </span>
            </div>
          </div>


          {/* LEGEND */}
          <div className="w-1/2 flex flex-col justify-center gap-3">

            {data.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-[10px] font-medium py-1"
              >

                <div className="flex items-center gap-2">

                  <span
                    className="w-2 h-2 rounded-sm shrink-0"
                    style={{ backgroundColor: item.color }}
                  />

                  <span className="text-gray-500 text-[10px] truncate max-w-20">
                    {item.name}
                  </span>

                </div>
                <span className="text-gray-900 font-semibold text-[10px]">
                  {item.percentage}% ({formatAmount(item.value)})
                </span>
              </div>
            ))}

          </div>

        </div>
      )}

    </div>
  );
}

export function PayablesTrendCard({ data, title, charttitle, daysname, currency = "AED", datakey, }) {
  const formatAmount = (value) => {
    if (value == null) return "";

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }

    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="card flex flex-col h-80 w-full min-w-0">
      {/* Header */}
      <h3 className="text-[14px] font-bold text-[#081B46] mb-3">
        {title}
      </h3>

      {/* Chart */}
      <div className="flex-1 pt-0">

        <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: -5,
              right: 10,
              left: -12,
              bottom: 0,
            }}
            barCategoryGap="28%"
          >

            {/* Grid */}
            <CartesianGrid
              stroke="#EEF2F7"
              strokeDasharray="3 3"
              vertical={false}
            />

            {/* X Axis */}
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#64748B", fontWeight: 800,
              }}
            />

            {/* Left Axis */}
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#64748B", fontWeight: 800,
              }}
              tickFormatter={formatAmount}
              label={{
                value: currency,
                angle: 0,
                position: "insideTopLeft",
                dx: 10,
                dy: -18,
                style: {
                  fontSize: 9,
                  fill: "#64748B",
                  fontWeight: 900,
                },
              }}
            />

            {/* Right Axis */}
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#64748B", fontWeight: 800,
              }}
              label={{
                value: "Days",
                angle: 0,
                position: "insideTopRight",
                dx: 0,
                dy: -20,
                style: {
                  fontSize: 9,
                  fill: "#64748B",
                  fontWeight: 900,
                },
              }}
            />

            {/* Tooltip */}
            <Tooltip
              formatter={(value, name) => [
                formatAmount(value),
                name,
              ]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E2E8F0",
                fontSize: 11,
              }}
            />

            {/* Legend */}
            <Legend
              verticalAlign="top"
              align="center"
              iconSize={8}
              wrapperStyle={{
                fontSize: 10,
                paddingBottom: 12,
              }}
            />

            {/* Bar */}
            <Bar
              yAxisId="left"
              dataKey="payables"
              fill="#2563EB"
              radius={[4, 4, 0, 0]}
              barSize={20}
              name={charttitle}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill="#2563EB"
                />
              ))}

              <LabelList
                dataKey="payables"
                position="top"
                formatter={formatAmount}
                style={{
                  fontSize: 9,
                  fill: "#0F172A",
                  fontWeight: 600,
                }}
              />
            </Bar>

            {/* Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="dpo"
              stroke="#10B981"
              strokeWidth={2}
              dot={{
                r: 3,
                fill: "#10B981",
              }}
              activeDot={{
                r: 4,
              }}
              name={daysname}
            />

          </BarChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}

export function ParentDivisionCard({ data = [], title, currency = "AED", }) {

  const formatCurrency = (value) => {
    if (value == null) return "-";

    const amount = Number(value);

    if (isNaN(amount)) return "-";

    if (amount >= 1_000_000) {
      return `${currency} ${(amount / 1_000_000).toFixed(2)}M`;
    }

    if (amount >= 1_000) {
      return `${currency} ${(amount / 1_000).toFixed(2)}K`;
    }

    return `${currency} ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
  const hasData = data && data.length > 0;

  return (
    <div className="card flex flex-col h-80 w-full min-w-0">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-[14px] font-extrabold text-[#081B46]">
          {title} ({currency})
        </h3>
      </div>
      {!hasData ? (
        <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-slate-400">
          No Records Found
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="flex-1">
            <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 70,
                  left: 15,
                  bottom: 5,
                }}
                barCategoryGap="28%"
              >
                <CartesianGrid
                  stroke="#EEF2F7"
                  strokeDasharray="3 3"
                  horizontal={false}
                />

                {/* X Axis */}
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#64748B", fontWeight: 800,
                  }}
                  tickFormatter={(value) => {
                    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
                    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
                    return value;
                  }}
                />

                {/* Y Axis */}
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#334155", fontWeight: 800,
                  }}
                />

                {/* Tooltip */}
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(value),
                    "Amount",
                  ]}

                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #E2E8F0",
                    fontSize: 11,
                  }}
                />

                {/* Bars */}
                <Bar
                  dataKey="value"
                  fill="#2563EB"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                >
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(value) => formatCurrency(value)}
                    style={{
                      fontSize: 10,
                      fill: "#0F172A",
                      fontWeight: 600,
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}


export function InventoryValueTrend({ title, data, currency = "AED", }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-80"
      style={{ padding: "18px 20px" }}>
      <h3 className="text-[13px] font-bold text-[#081B46] mb-4" style={{ marginBottom: "18px" }}>
        {title}
      </h3>

      {data.length === 0 ? (
        <div className="
                h-57.5
                flex
                items-center
                justify-center
                text-sm
                text-slate-400
                font-medium
            ">
          No Data Available
        </div>
      ) : (

        <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="90%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 15,
              bottom: 20,
            }}
          >
            <CartesianGrid
              stroke="#EEF2F7"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              padding={{ left: 20, right: 20 }}
              tick={{
                fontSize: 11,
                fill: "#64748B",
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              dx={-8}
              tick={{
                fontSize: 12,
                fontWeight: 700,
                fill: "#081B46",
              }}
              tickFormatter={(value) =>
                `${(value / 1000000).toFixed(0)}M`
              }
            >
              <Label
                value={currency}
                position="top"
                offset={10}
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  fill: "#081B46",
                }}
              />
            </YAxis>

            <Legend
              verticalAlign="top"
              align="center"
              wrapperStyle={{
                fontSize: 12,
                paddingBottom: 10,
              }}
            />

            <Line
              type="monotone"
              dataKey="inventoryValue"
              name="Inventory Value"
              stroke="#2563EB"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/*    Working Capital trend Card Chart    */
export function WorkingCapitalTrendCard({
  data,
  title,
  chartTitle = "Net Working Capital",
  ratioTitle = "Working Capital Ratio",
  currency = "AED",
}) {
  const formatAmount = (value) => {
    if (value == null) return "";

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }

    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="card flex flex-col h-80 w-full min-w-0">
      {/* Header */}
      <h3 className="text-[14px] font-bold text-[#081B46] mb-3">
        {title}
      </h3>

      <div className="flex-1">
        <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: -5,
              right: 10,
              left: -12,
              bottom: 0,
            }}
          >
            <CartesianGrid
              stroke="#EEF2F7"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#64748B",
                fontWeight: 800,
              }}
            />

            {/* Left Axis */}
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tickFormatter={formatAmount}
              tick={{
                fontSize: 9,
                fill: "#64748B",
                fontWeight: 800,
              }}
              label={{
                value: currency,
                angle: 0,
                position: "insideTopLeft",
                dx: 10,
                dy: -18,
                style: {
                  fontSize: 9,
                  fill: "#64748B",
                  fontWeight: 900,
                },
              }}
            />

            {/* Right Axis */}
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              domain={[0, 2]}
              tick={{
                fontSize: 9,
                fill: "#64748B",
                fontWeight: 800,
              }}
              label={{
                value: "",
                angle: 0,
                position: "insideTopRight",
                dx: 0,
                dy: -20,
                style: {
                  fontSize: 9,
                  fill: "#64748B",
                  fontWeight: 900,
                },
              }}
            />

            <Tooltip
              formatter={(value, name) => {
                if (name === chartTitle) {
                  return [`AED ${formatAmount(value)}`, name];
                }

                return [value, name];
              }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E2E8F0",
                fontSize: 11,
              }}
            />

            <Legend
              verticalAlign="top"
              align="center"
              iconSize={8}
              wrapperStyle={{
                fontSize: 10,
                paddingBottom: 12,
              }}
            />

            {/* Blue Bar */}
            <Bar
              yAxisId="left"
              dataKey="nwc"
              fill="#2563EB"
              radius={[4, 4, 0, 0]}
              barSize={20}
              name={chartTitle}
            >
              <LabelList
                dataKey="nwc"
                position="top"
                formatter={(value) => `AED ${formatAmount(value)}`}
                style={{
                  fontSize: 9,
                  fill: "#0F172A",
                  fontWeight: 600,
                }}
              />
            </Bar>

            {/* Green Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ratio"
              stroke="#10B981"
              strokeWidth={2}
              dot={{
                r: 3,
                fill: "#10B981",
              }}
              activeDot={{
                r: 4,
              }}
              name={ratioTitle}
            >
              <LabelList
                dataKey="ratio"
                position="top"
                formatter={(value) => value.toFixed(2)}
                style={{
                  fontSize: 9,
                  fill: "#10B981",
                  fontWeight: 600,
                }}
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/*    Working Capital Components(AED)  */
/* =========================================================
   CUSTOM WATERFALL BAR
   ========================================================= */

const WaterfallBar = (props) => {
  const {
    x,
    y,
    width,
    height,
    payload,
    index,
  } = props;

  if (!payload) {
    return null;
  }

  return (
    <g>
      {/* Main bar */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={payload.color}
        rx={1}
        ry={1}
      />

      {/* -------------------------------------------------
          Connector: Current Assets → Current Liabilities
          ------------------------------------------------- */}
      {index === 0 && (
        <line
          x1={x + width}
          y1={y}
          x2={x + width + 25}
          y2={y}
          stroke="#C7CEDB"
          strokeWidth={1}
        />
      )}

      {/* -------------------------------------------------
          Connector: Current Liabilities → Net Working Capital
          ------------------------------------------------- */}
      {index === 1 && (
        <line
          x1={x + width}
          y1={y + height}
          x2={x + width + 25}
          y2={y + height}
          stroke="#C7CEDB"
          strokeWidth={1}
        />
      )}
    </g>
  );
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export function WorkingCapitalComponents({
  title = "Working Capital Components (AED)",
  data = workingCapitalComponents,
  currency = "AED",
}) {
  /* -------------------------------------------------------
      Format amount
      ------------------------------------------------------- */

  const formatAmount = (value) => {
    const num = Number(value || 0);

    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /* -------------------------------------------------------
     Tooltip
     ------------------------------------------------------- */

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const item = payload[0]?.payload;

    if (!item) {
      return null;
    }

    return (
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          padding: "7px 10px",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div
          style={{
            color: "#081B46",
            fontSize: "11px",
            fontWeight: 700,
            marginBottom: "3px",
          }}
        >
          {item.name}
        </div>

        <div
          style={{
            color: "#475569",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          {currency} {formatAmount(item.originalAmount)}
        </div>
      </div>
    );
  };

  return (
    <div
      className="
        card
        flex
        flex-col
        h-80
        w-full
        min-w-0
        overflow-hidden
      "
    >
      {/* =================================================
          HEADER
          ================================================= */}

      <h3
        className="
          text-[14px]
          font-bold
          text-[#081B46]
          mb-3
          shrink-0
        "
      >
        {title}
      </h3>

      {/* =================================================
          CHART
          ================================================= */}

      <div className="flex-1 min-h-0">
        <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 30,
              right: 15,
              left: -10,
              bottom: 5,
            }}
          >
            {/* =================================================
                GRID
                ================================================= */}

            <CartesianGrid
              stroke="#EEF2F7"
              strokeWidth={1}
              vertical={false}
            />

            {/* =================================================
                X AXIS
                ================================================= */}

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              interval={0}
              height={30}
              tick={{
                fontSize: 9,
                fill: "#334155",
                fontWeight: 600,
              }}
            />

            {/* =================================================
                Y AXIS
                ================================================= */}

            <YAxis
              domain={[0, 1400]}
              ticks={[0, 400, 800, 1200, 1400]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                if (value === 0) {
                  return "0";
                }
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(2)}K`;
                }
                return value;
              }}
              tick={{
                fontSize: 10,
                fill: "#64748B",
                fontWeight: 800,
              }}
              label={{
                value: currency,
                angle: 0,
                position: "insideTopLeft",
                dx: 10,
                dy: -18,
                style: {
                  fontSize: 9,
                  fill: "#64748B",
                  fontWeight: 900,
                },
              }}
            />

            {/* =================================================
                TOOLTIP
                ================================================= */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: "rgba(226, 232, 240, 0.18)",
              }}
            />
            {/* =================================================
                ZERO BASELINE
                ================================================= */}
            <ReferenceLine
              y={0}
              stroke="#CBD5E1"
              strokeWidth={1}
            />

            {/* =================================================
                INVISIBLE OFFSET BAR

                This creates the waterfall positioning.

                Current Assets:
                  offset = 0

                Current Liabilities:
                  offset = 186.45

                Net Working Capital:
                  offset = 0
                ================================================= */}

            <Bar
              dataKey="offset"
              stackId="waterfall"
              fill="transparent"
              stroke="transparent"
              barSize={58}
              isAnimationActive={false}
            />

            {/* =================================================
                ACTUAL WATERFALL BAR
                ================================================= */}

            <Bar
              dataKey="amount"
              stackId="waterfall"
              barSize={58}
              shape={<WaterfallBar />}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`waterfall-cell-${index}`}
                  fill={entry.color}
                />
              ))}

              {/* =================================================
                  VALUE LABEL
                  ================================================= */}

              <LabelList
                dataKey="displayValue"
                position="top"
                offset={8}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  fill: "#334155",
                }}
              />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CurrentAssetsVsLiabilities({
  title = "Current Assets vs Current Liabilities (AED)",
  data = currentAssetsVsLiabilitiesData,
  currency = "AED",
}) {
  const formatAmount = (value) => {
    return Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    return (
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          padding: "8px 10px",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#081B46",
            marginBottom: "5px",
          }}
        >
          {label}
        </div>

        {payload.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "15px",
              fontSize: "10px",
              marginBottom: "3px",
            }}
          >
            <span style={{ color: "#64748B" }}>
              {item.name}
            </span>

            <span
              style={{
                color: "#1E293B",
                fontWeight: 700,
              }}
            >
              {currency} {formatAmount(item.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card flex flex-col h-80 w-full min-w-0 overflow-hidden">

      {/* Header */}
      <h3
        className="
          text-[14px]
          font-bold
          text-[#081B46]
          mb-2
          shrink-0
        "
      >
        {title}
      </h3>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer minWidth={1} minHeight={1} width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 35,
              right: 15,
              left: -10,
              bottom: 5,
            }}
            barGap={6}
            barCategoryGap="28%"
          >
            {/* Grid */}
            <CartesianGrid
              stroke="#EEF2F7"
              strokeWidth={1}
              vertical={false}
            />

            {/* X Axis */}
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{
                fontSize: 9,
                fill: "#334155",
                fontWeight: 600,
              }}
            />

            {/* Y Axis */}
            <YAxis
              domain={[0, 1600]}
              ticks={[0, 300, 600, 900, 1200, 1500]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                if (value === 0) {
                  return "0";
                }

                if (value >= 1000) {
                  return `${(value / 1000).toFixed(2)}K`;
                }

                return value;
              }}
              tick={{
                fontSize: 9,
                fill: "#64748B",
                fontWeight: 600,
              }}
              label={{
                value: currency,
                angle: 0,
                position: "insideTopLeft",
                dx: 10,
                dy: -18,
                style: {
                  fontSize: 9,
                  fill: "#64748B",
                  fontWeight: 900,
                },
              }}
            />

            {/* Tooltip */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: "rgba(226, 232, 240, 0.2)",
              }}
            />

            {/* Legend */}
            <Legend
              verticalAlign="top"
              align="center"
              height={28}
              iconType="square"
              iconSize={8}
              wrapperStyle={{
                fontSize: "9px",
                fontWeight: 600,
                color: "#475569",
              }}
            />

            {/* =================================================
                31 MAR 2024 - BLUE
                ================================================= */}

            <Bar
              dataKey="31 Mar 2024"
              fill="#2962FF"
              barSize={32}
              radius={[1, 1, 0, 0]}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="31 Mar 2024"
                position="top"
                offset={6}
                formatter={(value) => formatAmount(value)}
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  fill: "#334155",
                }}
              />
            </Bar>

            {/* =================================================
                30 APR 2024 - GREEN
                ================================================= */}

            <Bar
              dataKey="30 Apr 2024"
              fill="#16A765"
              barSize={32}
              radius={[1, 1, 0, 0]}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="30 Apr 2024"
                position="top"
                offset={6}
                formatter={(value) => formatAmount(value)}
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  fill: "#334155",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const ICONS = {
  clock: Clock3,
  inventory: PackageOpen,
  payment: CircleDollarSign,
  cycle: RefreshCw,
};

export function CashConversionCycle({
  title = "Cash Conversion Cycle (Days)",
  data = [],
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "7px 9px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* =========================================
                TITLE
            ========================================= */}
      <div
        style={{
          fontSize: "13px",
          lineHeight: "15px",
          fontWeight: 700,
          color: "#000000",
          marginBottom: "6px",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </div>

      {/* =========================================
                CARDS
            ========================================= */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          width: "100%",
          height: "calc(100% - 21px)",
          minWidth: 0,
        }}
      >
        {data.map((item, index) => {
          const Icon = ICONS[item.icon];

          return (
            <React.Fragment key={item.key}>
              {/* CARD */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: "100%",
                  background: item.cardBg,
                  border: "1px solid #edf1f5",
                  borderRadius: "8px",
                  padding: "5px 3px",
                  boxSizing: "border-box",

                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* ICON */}
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: item.iconBg,

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    marginBottom: "3px",
                  }}
                >
                  {Icon && (
                    <Icon
                      size={15}
                      strokeWidth={2}
                      color={item.iconColor}
                    />
                  )}
                </div>

                {/* LABEL */}
                <div
                  style={{
                    fontSize: "9px",
                    lineHeight: "10px",
                    color: "#334155",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </div>

                {/* VALUE */}
                <div
                  style={{
                    fontSize: "15px",
                    lineHeight: "17px",
                    color: "#111827",
                    fontWeight: 700,
                    marginTop: "3px",
                  }}
                >
                  {item.value}
                </div>

                {/* VARIANCE */}
                <div
                  style={{
                    fontSize: "7px",
                    lineHeight: "9px",
                    fontWeight: 500,
                    color:
                      item.direction === "down"
                        ? "#ef4444"
                        : "#159447",
                    marginTop: "3px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      marginRight: "2px",
                    }}
                  >
                    {item.direction === "down"
                      ? "▼"
                      : "▲"}
                  </span>

                  {item.variance} vs 31 Mar 2024
                </div>
              </div>

              {/* =========================================
                                OPERATOR
                            ========================================= */}
              {index < data.length - 1 && (
                <div
                  style={{
                    width: "13px",
                    flexShrink: 0,

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    color: "#07247b",
                    fontSize: "13px",
                    lineHeight: "13px",
                    fontWeight: 700,
                  }}
                >
                  {index === 0 && "−"}
                  {index === 1 && "+"}
                  {index === 2 && "="}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}


export function CashConversionTrend({
  title,
  data = [],
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "7px 9px 5px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* TITLE */}
      <div
        style={{
          fontSize: "13px",
          lineHeight: "15px",
          fontWeight: 700,
          color: "#000000",
          marginBottom: "2px",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </div>

      {/* DAYS LABEL */}
      <div
        style={{
          fontSize: "9px",
          lineHeight: "10px",
          color: "#334155",
          fontWeight: 700,
        }}
      >
        Days
      </div>

      {/* CHART */}
      <div
        style={{
          width: "100%",
          height: "calc(100% - 27px)",
        }}
      >
        <ResponsiveContainer minWidth={1} minHeight={1}
          width="100%"
          height="100%"
        >
          <LineChart
            data={data}
            margin={{
              top: 12,
              right: 8,
              left: -12,
              bottom: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#eef2f6"
              strokeDasharray="3 3"
            />

            {/* MONTH LABELS */}
            <XAxis
              dataKey="month"
              tick={{
                fontSize: 8,
                fill: "#475569",
                fontWeight: 600,
              }}
              axisLine={{
                stroke: "#e5e7eb",
              }}
              tickLine={false}
            />

            {/* Y AXIS VALUES */}
            <YAxis
              domain={[0, 60]}
              ticks={[0, 10, 20, 30, 40, 50, 60]}
              tick={{
                fontSize: 8, fontWeight: 700,
                fill: "#64748b",
              }}
              axisLine={false}
              tickLine={false}
            />
            {/* TOOLTIP */}
            <Tooltip
              contentStyle={{
                fontSize: "9px",
                borderRadius: "5px",
                border: "1px solid #e5e7eb",
                padding: "4px 6px",
              }}
            />

            {/* BLUE LINE */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{
                r: 3,
                fill: "#2563eb",
                strokeWidth: 0,
              }}
              activeDot={{
                r: 4,
              }}
            >
              {/* VALUE ABOVE EACH DOT */}
              <LabelList
                dataKey="value"
                position="top"
                offset={5}
                style={{
                  fontSize: "8px",
                  fontWeight: 600,
                  fill: "#334155",
                }}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function WorkingCapitalInsights({
  title,
  data = [],
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "7px 9px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* TITLE */}
      <div
        style={{
          fontSize: "13px",
          lineHeight: "15px",
          fontWeight: 700,
          color: "#000000",
          marginBottom: "7px",
        }}
      >
        {title}
      </div>

      {/* INSIGHTS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "5px",
            }}
          >
            {/* CHECK */}
            <CircleCheck
              size={14}
              strokeWidth={2}
              color="#16a34a"
              fill="#e4f7eb"
              style={{
                flexShrink: 0,
                marginTop: "1px",
              }}
            />

            {/* TEXT */}
            <div
              style={{
                fontSize: "9px",
                lineHeight: "12px",
                color: "#374151",
                fontWeight: 800,
              }}
            >
              {item.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}