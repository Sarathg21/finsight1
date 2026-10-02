
// // // // // import React, {
// // // // //   useEffect,
// // // // //   useRef,
// // // // //   useState,
// // // // // } from "react";

// // // // // import { Search } from "lucide-react";

// // // // // import {
// // // // //   getOpexFilterOptions,
// // // // // } from "../../api/opexApi";

// // // // // /* =========================================================
// // // // //    DEFAULT FILTERS
// // // // // ========================================================= */

// // // // // const DEFAULT_FILTERS = {
// // // // //   legal_group: [],
// // // // //   legal_entity: [],
// // // // //   parent_division: [],
// // // // //   subdivision: [],
// // // // //   currency: "",
// // // // //   as_on_date: "",
// // // // //   period: [],
// // // // //   compare_with: "",
// // // // //   reporting_currency: "AED",
// // // // //   year: "",
// // // // // };

// // // // // /* =========================================================
// // // // //    FIELD WIDTHS

// // // // //    Keep the existing compact filter widths.
// // // // // ========================================================= */

// // // // // const FIELD_WIDTHS = {
// // // // //   legal_group: 128,
// // // // //   legal_entity: 128,
// // // // //   parent_division: 128,
// // // // //   subdivision: 128,
// // // // //   year: 128,
// // // // //   period: 128,
// // // // //   reporting_currency: 128,
// // // // // };

// // // // // /* =========================================================
// // // // //    OPTION VALUE
// // // // // ========================================================= */

// // // // // const getOptionValue = (option) => {
// // // // //   if (
// // // // //     option === null ||
// // // // //     option === undefined
// // // // //   ) {
// // // // //     return "";
// // // // //   }

// // // // //   if (
// // // // //     typeof option === "object"
// // // // //   ) {
// // // // //     return (
// // // // //       option.value ??
// // // // //       option.id ??
// // // // //       option.code ??
// // // // //       option.period_name ??
// // // // //       option.year ??
// // // // //       option.name ??
// // // // //       option.currency_code ??
// // // // //       ""
// // // // //     );
// // // // //   }

// // // // //   return option;
// // // // // };

// // // // // /* =========================================================
// // // // //    OPTION LABEL
// // // // // ========================================================= */

// // // // // const getOptionLabel = (option) => {
// // // // //   if (
// // // // //     option === null ||
// // // // //     option === undefined
// // // // //   ) {
// // // // //     return "";
// // // // //   }

// // // // //   if (
// // // // //     typeof option === "object"
// // // // //   ) {
// // // // //     return (
// // // // //       option.label ??
// // // // //       option.name ??
// // // // //       option.period_name ??
// // // // //       option.year ??
// // // // //       option.currency_name ??
// // // // //       option.currency_code ??
// // // // //       option.value ??
// // // // //       option.code ??
// // // // //       ""
// // // // //     );
// // // // //   }

// // // // //   return option;
// // // // // };

// // // // // /* =========================================================
// // // // //    LATEST PERIOD
// // // // // ========================================================= */

// // // // // function getLatestPeriod(
// // // // //   periods = []
// // // // // ) {
// // // // //   if (
// // // // //     !Array.isArray(periods) ||
// // // // //     periods.length === 0
// // // // //   ) {
// // // // //     return "";
// // // // //   }

// // // // //   return getOptionValue(
// // // // //     periods[periods.length - 1]
// // // // //   );
// // // // // }

// // // // // /* =========================================================
// // // // //    NORMALIZE YEARS
// // // // // ========================================================= */

// // // // // function normalizeYears(
// // // // //   payload = {},
// // // // //   periods = []
// // // // // ) {
// // // // //   const rawYears =
// // // // //     payload?.years ||
// // // // //     payload?.fiscal_years ||
// // // // //     payload?.accounting_years ||
// // // // //     [];

// // // // //   if (
// // // // //     Array.isArray(rawYears) &&
// // // // //     rawYears.length
// // // // //   ) {
// // // // //     return rawYears;
// // // // //   }

// // // // //   const derived = [];

// // // // //   if (
// // // // //     Array.isArray(periods)
// // // // //   ) {
// // // // //     periods.forEach(
// // // // //       (period) => {
// // // // //         if (
// // // // //           !period ||
// // // // //           typeof period !== "object"
// // // // //         ) {
// // // // //           return;
// // // // //         }

// // // // //         const year =
// // // // //           period.year ??
// // // // //           period.fiscal_year ??
// // // // //           period.accounting_year ??
// // // // //           null;

// // // // //         if (
// // // // //           year === null ||
// // // // //           year === undefined ||
// // // // //           year === ""
// // // // //         ) {
// // // // //           return;
// // // // //         }

// // // // //         const exists =
// // // // //           derived.some(
// // // // //             (item) =>
// // // // //               String(
// // // // //                 getOptionValue(
// // // // //                   item
// // // // //                 )
// // // // //               ) ===
// // // // //               String(year)
// // // // //           );

// // // // //         if (!exists) {
// // // // //           derived.push({
// // // // //             value: year,
// // // // //             label: year,
// // // // //           });
// // // // //         }
// // // // //       }
// // // // //     );
// // // // //   }

// // // // //   return derived;
// // // // // }

// // // // // /* =========================================================
// // // // //    NORMALIZE CURRENCY
// // // // // ========================================================= */

// // // // // function normalizeCurrencyOptions(
// // // // //   rawCurrencies
// // // // // ) {
// // // // //   if (
// // // // //     rawCurrencies === null ||
// // // // //     rawCurrencies === undefined ||
// // // // //     rawCurrencies === ""
// // // // //   ) {
// // // // //     return [];
// // // // //   }

// // // // //   if (
// // // // //     typeof rawCurrencies ===
// // // // //     "string" ||
// // // // //     typeof rawCurrencies ===
// // // // //     "number"
// // // // //   ) {
// // // // //     const value =
// // // // //       String(rawCurrencies);

// // // // //     return [
// // // // //       {
// // // // //         value,
// // // // //         label: value,
// // // // //       },
// // // // //     ];
// // // // //   }

// // // // //   if (
// // // // //     Array.isArray(
// // // // //       rawCurrencies
// // // // //     )
// // // // //   ) {
// // // // //     return rawCurrencies
// // // // //       .map((item) => {
// // // // //         if (
// // // // //           item === null ||
// // // // //           item === undefined ||
// // // // //           item === ""
// // // // //         ) {
// // // // //           return null;
// // // // //         }

// // // // //         if (
// // // // //           typeof item ===
// // // // //           "string" ||
// // // // //           typeof item ===
// // // // //           "number"
// // // // //         ) {
// // // // //           const value =
// // // // //             String(item);

// // // // //           return {
// // // // //             value,
// // // // //             label: value,
// // // // //           };
// // // // //         }

// // // // //         if (
// // // // //           typeof item === "object"
// // // // //         ) {
// // // // //           const value =
// // // // //             item.currency_code ??
// // // // //             item.currencyCode ??
// // // // //             item.currency ??
// // // // //             item.value ??
// // // // //             item.code ??
// // // // //             item.id ??
// // // // //             "";

// // // // //           const label =
// // // // //             item.label ??
// // // // //             item.name ??
// // // // //             item.currency_name ??
// // // // //             item.currency_code ??
// // // // //             item.currencyCode ??
// // // // //             item.currency ??
// // // // //             item.value ??
// // // // //             item.code ??
// // // // //             value;

// // // // //           if (
// // // // //             !value
// // // // //           ) {
// // // // //             return null;
// // // // //           }

// // // // //           return {
// // // // //             value:
// // // // //               String(value),
// // // // //             label:
// // // // //               String(label),
// // // // //           };
// // // // //         }

// // // // //         return null;
// // // // //       })
// // // // //       .filter(Boolean);
// // // // //   }

// // // // //   if (
// // // // //     typeof rawCurrencies ===
// // // // //     "object"
// // // // //   ) {
// // // // //     const directValue =
// // // // //       rawCurrencies.currency_code ??
// // // // //       rawCurrencies.currencyCode ??
// // // // //       rawCurrencies.currency ??
// // // // //       rawCurrencies.value ??
// // // // //       rawCurrencies.code ??
// // // // //       rawCurrencies.id;

// // // // //     if (
// // // // //       directValue !== null &&
// // // // //       directValue !== undefined &&
// // // // //       directValue !== ""
// // // // //     ) {
// // // // //       const value =
// // // // //         String(directValue);

// // // // //       const label =
// // // // //         rawCurrencies.label ??
// // // // //         rawCurrencies.name ??
// // // // //         rawCurrencies.currency_name ??
// // // // //         rawCurrencies.currency_code ??
// // // // //         rawCurrencies.currencyCode ??
// // // // //         rawCurrencies.currency ??
// // // // //         rawCurrencies.value ??
// // // // //         rawCurrencies.code ??
// // // // //         value;

// // // // //       return [
// // // // //         {
// // // // //           value,
// // // // //           label:
// // // // //             String(label),
// // // // //         },
// // // // //       ];
// // // // //     }

// // // // //     return Object.entries(
// // // // //       rawCurrencies
// // // // //     )
// // // // //       .map(
// // // // //         ([key, item]) => {
// // // // //           if (
// // // // //             item === null ||
// // // // //             item === undefined ||
// // // // //             item === ""
// // // // //           ) {
// // // // //             return {
// // // // //               value:
// // // // //                 String(key),
// // // // //               label:
// // // // //                 String(key),
// // // // //             };
// // // // //           }

// // // // //           if (
// // // // //             typeof item ===
// // // // //             "string" ||
// // // // //             typeof item ===
// // // // //             "number"
// // // // //           ) {
// // // // //             return {
// // // // //               value:
// // // // //                 String(item),
// // // // //               label:
// // // // //                 String(item),
// // // // //             };
// // // // //           }

// // // // //           if (
// // // // //             typeof item ===
// // // // //             "object"
// // // // //           ) {
// // // // //             const value =
// // // // //               item.currency_code ??
// // // // //               item.currencyCode ??
// // // // //               item.currency ??
// // // // //               item.value ??
// // // // //               item.code ??
// // // // //               key;

// // // // //             const label =
// // // // //               item.label ??
// // // // //               item.name ??
// // // // //               item.currency_name ??
// // // // //               item.currency_code ??
// // // // //               item.currencyCode ??
// // // // //               item.currency ??
// // // // //               item.value ??
// // // // //               item.code ??
// // // // //               value;

// // // // //             return {
// // // // //               value:
// // // // //                 String(value),
// // // // //               label:
// // // // //                 String(label),
// // // // //             };
// // // // //           }

// // // // //           return {
// // // // //             value:
// // // // //               String(key),
// // // // //             label:
// // // // //               String(key),
// // // // //           };
// // // // //         }
// // // // //       )
// // // // //       .filter(
// // // // //         (item) =>
// // // // //           item.value !== ""
// // // // //       );
// // // // //   }

// // // // //   return [];
// // // // // }

// // // // // /* =========================================================
// // // // //    NORMALIZE API OPTIONS
// // // // // ========================================================= */

// // // // // function normalizeOpexFilterOptions(
// // // // //   data = {}
// // // // // ) {
// // // // //   const payload =
// // // // //     data?.data &&
// // // // //       typeof data.data ===
// // // // //       "object" &&
// // // // //       !Array.isArray(
// // // // //         data.data
// // // // //       )
// // // // //       ? data.data
// // // // //       : data;

// // // // //   const rawCurrencies =
// // // // //     payload?.reporting_currencies ??
// // // // //     payload?.currencies ??
// // // // //     payload?.currency_options ??
// // // // //     payload?.ledger_currencies ??
// // // // //     payload?.reporting_currency ??
// // // // //     [];

// // // // //   let currencies =
// // // // //     normalizeCurrencyOptions(
// // // // //       rawCurrencies
// // // // //     );

// // // // //   if (
// // // // //     !currencies.length &&
// // // // //     payload?.default_reporting_currency
// // // // //   ) {
// // // // //     currencies =
// // // // //       normalizeCurrencyOptions(
// // // // //         payload.default_reporting_currency
// // // // //       );
// // // // //   }

// // // // //   const periods =
// // // // //     Array.isArray(
// // // // //       payload?.periods
// // // // //     )
// // // // //       ? payload.periods
// // // // //       : [];

// // // // //   return {
// // // // //     legal_groups:
// // // // //       Array.isArray(
// // // // //         payload?.legal_groups
// // // // //       )
// // // // //         ? payload.legal_groups
// // // // //         : [],

// // // // //     legal_entities:
// // // // //       Array.isArray(
// // // // //         payload?.legal_entities
// // // // //       )
// // // // //         ? payload.legal_entities
// // // // //         : [],

// // // // //     parent_divisions:
// // // // //       Array.isArray(
// // // // //         payload?.parent_divisions
// // // // //       )
// // // // //         ? payload.parent_divisions
// // // // //         : [],

// // // // //     subdivisions:
// // // // //       Array.isArray(
// // // // //         payload?.subdivisions
// // // // //       )
// // // // //         ? payload.subdivisions
// // // // //         : [],

// // // // //     periods,

// // // // //     years:
// // // // //       normalizeYears(
// // // // //         payload,
// // // // //         periods
// // // // //       ),

// // // // //     reporting_currencies:
// // // // //       currencies,

// // // // //     currencies,

// // // // //     compare_with:
// // // // //       Array.isArray(
// // // // //         payload?.compare_with
// // // // //       )
// // // // //         ? payload.compare_with
// // // // //         : Array.isArray(
// // // // //           payload?.compare_periods
// // // // //         )
// // // // //           ? payload.compare_periods
// // // // //           : [],

// // // // //     data_as_of:
// // // // //       payload?.data_as_of ||
// // // // //       null,

// // // // //     default_reporting_currency:
// // // // //       payload?.default_reporting_currency ||
// // // // //       "AED",
// // // // //   };
// // // // // }

// // // // // /* =========================================================
// // // // //    CLOSED SELECT STYLE
// // // // // ========================================================= */

// // // // // const selectStyle = {
// // // // //   appearance: "none",

// // // // //   padding:
// // // // //     "6px 28px 6px 10px",

// // // // //   fontSize:
// // // // //     "0.78rem",

// // // // //   fontWeight: 500,

// // // // //   color:
// // // // //     "#334155",

// // // // //   backgroundColor:
// // // // //     "#fff",

// // // // //   border:
// // // // //     "1px solid #e2e8f0",

// // // // //   borderRadius: 7,

// // // // //   cursor:
// // // // //     "pointer",

// // // // //   outline:
// // // // //     "none",

// // // // //   width:
// // // // //     "100%",

// // // // //   height:
// // // // //     34,

// // // // //   boxSizing:
// // // // //     "border-box",

// // // // //   backgroundImage:
// // // // //     "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",

// // // // //   backgroundRepeat:
// // // // //     "no-repeat",

// // // // //   backgroundPosition:
// // // // //     "right 8px center",
// // // // // };

// // // // // /* =========================================================
// // // // //    FILTER FIELD
// // // // // ========================================================= */

// // // // // function FilterField({
// // // // //   label,
// // // // //   children,
// // // // //   width,
// // // // // }) {
// // // // //   return (
// // // // //     <div
// // // // //       style={{
// // // // //         display:
// // // // //           "flex",

// // // // //         flexDirection:
// // // // //           "column",

// // // // //         gap: 4,

// // // // //         minWidth:
// // // // //           width,

// // // // //         width,

// // // // //         flex:
// // // // //           "0 0 auto",
// // // // //       }}
// // // // //     >
// // // // //       <span
// // // // //         style={{
// // // // //           fontSize:
// // // // //             "0.66rem",

// // // // //           color:
// // // // //             "#1e3a8a",

// // // // //           fontWeight:
// // // // //             700,

// // // // //           letterSpacing:
// // // // //             "-0.02em",

// // // // //           whiteSpace:
// // // // //             "nowrap",

// // // // //           lineHeight:
// // // // //             1.2,
// // // // //         }}
// // // // //       >
// // // // //         {label}
// // // // //       </span>

// // // // //       {children}
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /* =========================================================
// // // // //    MULTI SELECT

// // // // //    IMPORTANT:
// // // // //    Compact row spacing based on the video reference.
// // // // // ========================================================= */

// // // // // function OpexMultiSelect({
// // // // //   options = [],
// // // // //   value = [],
// // // // //   onChange,
// // // // //   placeholder = "All",
// // // // //   searchPlaceholder = "Search...",
// // // // //   width = 128,
// // // // // }) {
// // // // //   const [
// // // // //     open,
// // // // //     setOpen,
// // // // //   ] = useState(false);

// // // // //   const [
// // // // //     searchQuery,
// // // // //     setSearchQuery,
// // // // //   ] = useState("");

// // // // //   const ref =
// // // // //     useRef(null);

// // // // //   const searchRef =
// // // // //     useRef(null);

// // // // //   const triggerRef =
// // // // //     useRef(null);

// // // // //   const dropdownRef =
// // // // //     useRef(null);

// // // // //   const [
// // // // //     menuPosition,
// // // // //     setMenuPosition,
// // // // //   ] = useState({
// // // // //     top: 0,
// // // // //     left: 0,
// // // // //     width: Math.max(width, 225),
// // // // //     maxHeight: 300,
// // // // //   });

// // // // //   const updateMenuPosition = () => {
// // // // //     const trigger = triggerRef.current;

// // // // //     if (!trigger) {
// // // // //       return;
// // // // //     }

// // // // //     const rect =
// // // // //       trigger.getBoundingClientRect();

// // // // //     const menuWidth =
// // // // //       Math.max(width, 225);

// // // // //     const viewportPadding = 8;
// // // // //     const preferredHeight = 300;
// // // // //     const spaceBelow =
// // // // //       window.innerHeight -
// // // // //       rect.bottom -
// // // // //       viewportPadding;
// // // // //     const spaceAbove =
// // // // //       rect.top -
// // // // //       viewportPadding;

// // // // //     const openAbove =
// // // // //       spaceBelow < 180 &&
// // // // //       spaceAbove > spaceBelow;

// // // // //     const availableHeight =
// // // // //       Math.max(120,
// // // // //         Math.min(
// // // // //           preferredHeight,
// // // // //           openAbove
// // // // //             ? spaceAbove
// // // // //             : spaceBelow
// // // // //         )
// // // // //       );

// // // // //     const top =
// // // // //       openAbove
// // // // //         ? Math.max(
// // // // //           viewportPadding,
// // // // //           rect.top -
// // // // //           availableHeight -
// // // // //           3
// // // // //         )
// // // // //         : rect.bottom + 3;

// // // // //     const maxLeft =
// // // // //       Math.max(
// // // // //         viewportPadding,
// // // // //         window.innerWidth -
// // // // //         menuWidth -
// // // // //         viewportPadding
// // // // //       );

// // // // //     setMenuPosition({
// // // // //       top,
// // // // //       left: Math.min(
// // // // //         Math.max(
// // // // //           rect.left,
// // // // //           viewportPadding
// // // // //         ),
// // // // //         maxLeft
// // // // //       ),
// // // // //       width: menuWidth,
// // // // //       maxHeight: availableHeight,
// // // // //     });
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     if (!open) {
// // // // //       return undefined;
// // // // //     }

// // // // //     updateMenuPosition();

// // // // //     const handleViewportChange = () => {
// // // // //       updateMenuPosition();
// // // // //     };

// // // // //     window.addEventListener(
// // // // //       "resize",
// // // // //       handleViewportChange
// // // // //     );

// // // // //     window.addEventListener(
// // // // //       "scroll",
// // // // //       handleViewportChange,
// // // // //       true
// // // // //     );

// // // // //     return () => {
// // // // //       window.removeEventListener(
// // // // //         "resize",
// // // // //         handleViewportChange
// // // // //       );

// // // // //       window.removeEventListener(
// // // // //         "scroll",
// // // // //         handleViewportChange,
// // // // //         true
// // // // //       );
// // // // //     };
// // // // //   }, [
// // // // //     open,
// // // // //     width,
// // // // //     value,
// // // // //     options.length,
// // // // //   ]);

// // // // //   /* -------------------------------------------------------
// // // // //      CLOSE OUTSIDE
// // // // //   ------------------------------------------------------- */

// // // // //   useEffect(() => {
// // // // //     const handleOutside =
// // // // //       (event) => {
// // // // //         if (
// // // // //           ref.current &&
// // // // //           !ref.current.contains(
// // // // //             event.target
// // // // //           ) &&
// // // // //           !dropdownRef.current?.contains(
// // // // //             event.target
// // // // //           )
// // // // //         ) {
// // // // //           setOpen(false);
// // // // //           setSearchQuery("");
// // // // //         }
// // // // //       };

// // // // //     document.addEventListener(
// // // // //       "mousedown",
// // // // //       handleOutside
// // // // //     );

// // // // //     return () => {
// // // // //       document.removeEventListener(
// // // // //         "mousedown",
// // // // //         handleOutside
// // // // //       );
// // // // //     };
// // // // //   }, []);

// // // // //   /* -------------------------------------------------------
// // // // //      FOCUS SEARCH
// // // // //   ------------------------------------------------------- */

// // // // //   useEffect(() => {
// // // // //     if (
// // // // //       open &&
// // // // //       searchRef.current
// // // // //     ) {
// // // // //       requestAnimationFrame(
// // // // //         () => {
// // // // //           searchRef.current?.focus();
// // // // //         }
// // // // //       );
// // // // //     }

// // // // //     if (!open) {
// // // // //       setSearchQuery("");
// // // // //     }
// // // // //   }, [open]);

// // // // //   /* -------------------------------------------------------
// // // // //      NORMALIZE
// // // // //   ------------------------------------------------------- */

// // // // //   const normalized =
// // // // //     (options || [])
// // // // //       .map((option) => {
// // // // //         if (
// // // // //           option === null ||
// // // // //           option === undefined
// // // // //         ) {
// // // // //           return null;
// // // // //         }

// // // // //         if (
// // // // //           typeof option ===
// // // // //           "string" ||
// // // // //           typeof option ===
// // // // //           "number"
// // // // //         ) {
// // // // //           return {
// // // // //             id:
// // // // //               String(option),
// // // // //             name:
// // // // //               String(option),
// // // // //           };
// // // // //         }

// // // // //         const id =
// // // // //           option.value !==
// // // // //             undefined
// // // // //             ? option.value
// // // // //             : option.id !==
// // // // //               undefined
// // // // //               ? option.id
// // // // //               : option.code !==
// // // // //                 undefined
// // // // //                 ? option.code
// // // // //                 : "";

// // // // //         const name =
// // // // //           option.label !==
// // // // //             undefined
// // // // //             ? option.label
// // // // //             : option.name !==
// // // // //               undefined
// // // // //               ? option.name
// // // // //               : option.period_name !==
// // // // //                 undefined
// // // // //                 ? option.period_name
// // // // //                 : String(id);

// // // // //         if (
// // // // //           id === null ||
// // // // //           id === undefined ||
// // // // //           id === ""
// // // // //         ) {
// // // // //           return null;
// // // // //         }

// // // // //         return {
// // // // //           id:
// // // // //             String(id),
// // // // //           name:
// // // // //             String(name),
// // // // //         };
// // // // //       })
// // // // //       .filter(Boolean);

// // // // //   const currentValues =
// // // // //     Array.isArray(value)
// // // // //       ? value.map(String)
// // // // //       : [];

// // // // //   /* -------------------------------------------------------
// // // // //      SEARCH
// // // // //   ------------------------------------------------------- */

// // // // //   const query =
// // // // //     searchQuery
// // // // //       .trim()
// // // // //       .toLowerCase();

// // // // //   const visibleOptions =
// // // // //     query
// // // // //       ? normalized.filter(
// // // // //         (option) =>
// // // // //           option.name
// // // // //             .toLowerCase()
// // // // //             .includes(
// // // // //               query
// // // // //             ) ||
// // // // //           option.id
// // // // //             .toLowerCase()
// // // // //             .includes(
// // // // //               query
// // // // //             )
// // // // //       )
// // // // //       : normalized;

// // // // //   /* -------------------------------------------------------
// // // // //      DISPLAY
// // // // //   ------------------------------------------------------- */

// // // // //   const isAll =
// // // // //     currentValues.length ===
// // // // //     0;

// // // // //   const isAllSelected =
// // // // //     normalized.length > 0 &&
// // // // //     currentValues.length ===
// // // // //     normalized.length &&
// // // // //     normalized.every(
// // // // //       (option) =>
// // // // //         currentValues.includes(
// // // // //           option.id
// // // // //         )
// // // // //     );

// // // // //   const selectedOptions =
// // // // //     normalized.filter(
// // // // //       (option) =>
// // // // //         currentValues.includes(
// // // // //           option.id
// // // // //         )
// // // // //     );

// // // // //   const displayText =
// // // // //     isAll
// // // // //       ? placeholder
// // // // //       : isAllSelected
// // // // //         ? "All"
// // // // //         : selectedOptions.length ===
// // // // //           1
// // // // //           ? selectedOptions[0]
// // // // //             .name
// // // // //           : `${selectedOptions.length} selected`;

// // // // //   /* -------------------------------------------------------
// // // // //      TOGGLE
// // // // //   ------------------------------------------------------- */

// // // // //   const toggleValue =
// // // // //     (id) => {
// // // // //       const stringId =
// // // // //         String(id);

// // // // //       if (
// // // // //         currentValues.includes(
// // // // //           stringId
// // // // //         )
// // // // //       ) {
// // // // //         onChange?.(
// // // // //           currentValues.filter(
// // // // //             (item) =>
// // // // //               item !==
// // // // //               stringId
// // // // //           )
// // // // //         );
// // // // //       } else {
// // // // //         onChange?.([
// // // // //           ...currentValues,
// // // // //           stringId,
// // // // //         ]);
// // // // //       }
// // // // //     };

// // // // //   /* -------------------------------------------------------
// // // // //      SELECT ALL
// // // // //   ------------------------------------------------------- */

// // // // //   const handleSelectAll =
// // // // //     () => {
// // // // //       onChange?.(
// // // // //         normalized.map(
// // // // //           (option) =>
// // // // //             option.id
// // // // //         )
// // // // //       );
// // // // //     };

// // // // //   /* -------------------------------------------------------
// // // // //      CLEAR
// // // // //   ------------------------------------------------------- */

// // // // //   const handleClear =
// // // // //     () => {
// // // // //       onChange?.([]);
// // // // //     };

// // // // //   return (
// // // // //     <div
// // // // //       ref={ref}
// // // // //       style={{
// // // // //         position:
// // // // //           "relative",

// // // // //         width,
// // // // //       }}
// // // // //     >
// // // // //       {/* CLOSED */}

// // // // //       <button
// // // // //         ref={triggerRef}
// // // // //         type="button"
// // // // //         onClick={() =>
// // // // //           setOpen(
// // // // //             (previous) =>
// // // // //               !previous
// // // // //           )
// // // // //         }
// // // // //         style={{
// // // // //           ...selectStyle,

// // // // //           textAlign:
// // // // //             "left",

// // // // //           overflow:
// // // // //             "hidden",

// // // // //           textOverflow:
// // // // //             "ellipsis",

// // // // //           whiteSpace:
// // // // //             "nowrap",
// // // // //         }}
// // // // //         title={
// // // // //           displayText
// // // // //         }
// // // // //       >
// // // // //         {displayText}
// // // // //       </button>

// // // // //       {/* DROPDOWN */}

// // // // //       {open && (
// // // // //         <div
// // // // //           ref={dropdownRef}
// // // // //           style={{
// // // // //             position:
// // // // //               "fixed",

// // // // //             top:
// // // // //               menuPosition.top,

// // // // //             left:
// // // // //               menuPosition.left,

// // // // //             width:
// // // // //               menuPosition.width,

// // // // //             maxHeight:
// // // // //               menuPosition.maxHeight,

// // // // //             overflowY:
// // // // //               "auto",

// // // // //             overflowX:
// // // // //               "hidden",

// // // // //             background:
// // // // //               "#fff",

// // // // //             border:
// // // // //               "1px solid #e2e8f0",

// // // // //             borderRadius:
// // // // //               7,

// // // // //             boxShadow:
// // // // //               "0 8px 22px rgba(15,23,42,0.14)",

// // // // //             zIndex:
// // // // //               9999,

// // // // //             padding:
// // // // //               6,

// // // // //             boxSizing:
// // // // //               "border-box",

// // // // //             scrollbarWidth:
// // // // //               "thin",

// // // // //             scrollbarColor:
// // // // //               "#64748b #f1f5f9",
// // // // //           }}
// // // // //         >
// // // // //           {/* SEARCH */}

// // // // //           <div
// // // // //             style={{
// // // // //               position:
// // // // //                 "relative",

// // // // //               marginBottom:
// // // // //                 4,
// // // // //             }}
// // // // //           >
// // // // //             <Search
// // // // //               size={13}
// // // // //               style={{
// // // // //                 position:
// // // // //                   "absolute",

// // // // //                 left: 8,

// // // // //                 top: 8,

// // // // //                 color:
// // // // //                   "#94a3b8",

// // // // //                 pointerEvents:
// // // // //                   "none",
// // // // //               }}
// // // // //             />

// // // // //             <input
// // // // //               ref={searchRef}
// // // // //               type="text"
// // // // //               value={
// // // // //                 searchQuery
// // // // //               }
// // // // //               onChange={(
// // // // //                 event
// // // // //               ) =>
// // // // //                 setSearchQuery(
// // // // //                   event.target
// // // // //                     .value
// // // // //                 )
// // // // //               }
// // // // //               placeholder={
// // // // //                 searchPlaceholder
// // // // //               }
// // // // //               style={{
// // // // //                 width:
// // // // //                   "100%",

// // // // //                 height:
// // // // //                   30,

// // // // //                 boxSizing:
// // // // //                   "border-box",

// // // // //                 border:
// // // // //                   "1px solid #dbe3ef",

// // // // //                 borderRadius:
// // // // //                   6,

// // // // //                 padding:
// // // // //                   "0 8px 0 26px",

// // // // //                 outline:
// // // // //                   "none",

// // // // //                 fontSize:
// // // // //                   "0.72rem",

// // // // //                 color:
// // // // //                   "#334155",

// // // // //                 background:
// // // // //                   "#fff",
// // // // //               }}
// // // // //             />
// // // // //           </div>

// // // // //           {/* SELECT ALL / CLEAR */}

// // // // //           <div
// // // // //             style={{
// // // // //               display:
// // // // //                 "flex",

// // // // //               alignItems:
// // // // //                 "center",

// // // // //               justifyContent:
// // // // //                 "space-between",

// // // // //               height:
// // // // //                 25,

// // // // //               padding:
// // // // //                 "0 6px",

// // // // //               marginBottom:
// // // // //                 1,
// // // // //             }}
// // // // //           >
// // // // //             <button
// // // // //               type="button"
// // // // //               onClick={
// // // // //                 handleSelectAll
// // // // //               }
// // // // //               style={{
// // // // //                 border:
// // // // //                   "none",

// // // // //                 background:
// // // // //                   "transparent",

// // // // //                 padding: 0,

// // // // //                 margin: 0,

// // // // //                 cursor:
// // // // //                   "pointer",

// // // // //                 fontSize:
// // // // //                   "0.68rem",

// // // // //                 lineHeight:
// // // // //                   "18px",

// // // // //                 fontWeight:
// // // // //                   600,

// // // // //                 color:
// // // // //                   "#4f46e5",
// // // // //               }}
// // // // //             >
// // // // //               Select All
// // // // //             </button>

// // // // //             <button
// // // // //               type="button"
// // // // //               onClick={
// // // // //                 handleClear
// // // // //               }
// // // // //               style={{
// // // // //                 border:
// // // // //                   "none",

// // // // //                 background:
// // // // //                   "transparent",

// // // // //                 padding: 0,

// // // // //                 margin: 0,

// // // // //                 cursor:
// // // // //                   "pointer",

// // // // //                 fontSize:
// // // // //                   "0.68rem",

// // // // //                 lineHeight:
// // // // //                   "18px",

// // // // //                 fontWeight:
// // // // //                   500,

// // // // //                 color:
// // // // //                   "#64748b",
// // // // //               }}
// // // // //             >
// // // // //               Clear
// // // // //             </button>
// // // // //           </div>

// // // // //           {/* VALUES */}

// // // // //           {visibleOptions.map(
// // // // //             (option) => {
// // // // //               const checked =
// // // // //                 currentValues.includes(
// // // // //                   option.id
// // // // //                 );

// // // // //               return (
// // // // //                 <label
// // // // //                   key={
// // // // //                     option.id
// // // // //                   }
// // // // //                   style={{
// // // // //                     display:
// // // // //                       "flex",

// // // // //                     alignItems:
// // // // //                       "center",

// // // // //                     gap: 6,

// // // // //                     width:
// // // // //                       "100%",

// // // // //                     height:
// // // // //                       27,

// // // // //                     minHeight:
// // // // //                       27,

// // // // //                     boxSizing:
// // // // //                       "border-box",

// // // // //                     padding:
// // // // //                       "2px 6px",

// // // // //                     margin:
// // // // //                       0,

// // // // //                     borderRadius:
// // // // //                       4,

// // // // //                     cursor:
// // // // //                       "pointer",

// // // // //                     fontSize:
// // // // //                       "0.72rem",

// // // // //                     lineHeight:
// // // // //                       "18px",

// // // // //                     fontWeight:
// // // // //                       checked
// // // // //                         ? 600
// // // // //                         : 500,

// // // // //                     color:
// // // // //                       "#334155",

// // // // //                     background:
// // // // //                       checked
// // // // //                         ? "#f5f7ff"
// // // // //                         : "#fff",
// // // // //                   }}
// // // // //                 >
// // // // //                   <input
// // // // //                     type="checkbox"
// // // // //                     checked={
// // // // //                       checked
// // // // //                     }
// // // // //                     onChange={() =>
// // // // //                       toggleValue(
// // // // //                         option.id
// // // // //                       )
// // // // //                     }
// // // // //                     style={{
// // // // //                       margin:
// // // // //                         0,

// // // // //                       padding:
// // // // //                         0,

// // // // //                       width:
// // // // //                         14,

// // // // //                       height:
// // // // //                         14,

// // // // //                       flexShrink:
// // // // //                         0,

// // // // //                       accentColor:
// // // // //                         "#4f46e5",

// // // // //                       cursor:
// // // // //                         "pointer",
// // // // //                     }}
// // // // //                   />

// // // // //                   <span
// // // // //                     style={{
// // // // //                       display:
// // // // //                         "block",

// // // // //                       minWidth:
// // // // //                         0,

// // // // //                       overflow:
// // // // //                         "hidden",

// // // // //                       textOverflow:
// // // // //                         "ellipsis",

// // // // //                       whiteSpace:
// // // // //                         "nowrap",

// // // // //                       lineHeight:
// // // // //                         "18px",
// // // // //                     }}
// // // // //                     title={
// // // // //                       option.name
// // // // //                     }
// // // // //                   >
// // // // //                     {
// // // // //                       option.name
// // // // //                     }
// // // // //                   </span>
// // // // //                 </label>
// // // // //               );
// // // // //             }
// // // // //           )}

// // // // //           {!visibleOptions.length && (
// // // // //             <div
// // // // //               style={{
// // // // //                 padding:
// // // // //                   "10px 6px",

// // // // //                 textAlign:
// // // // //                   "center",

// // // // //                 fontSize:
// // // // //                   "0.7rem",

// // // // //                 color:
// // // // //                   "#94a3b8",
// // // // //               }}
// // // // //             >
// // // // //               No options found
// // // // //             </div>
// // // // //           )}
// // // // //         </div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /* =========================================================
// // // // //    SINGLE SELECT
// // // // // ========================================================= */

// // // // // function OpexSingleSelect({
// // // // //   options = [],
// // // // //   value = "",
// // // // //   onChange,
// // // // //   placeholder = "Select",
// // // // //   searchPlaceholder = "Search...",
// // // // //   width = 128,
// // // // //   searchable = true,
// // // // // }) {
// // // // //   const [
// // // // //     open,
// // // // //     setOpen,
// // // // //   ] = useState(false);

// // // // //   const [
// // // // //     searchQuery,
// // // // //     setSearchQuery,
// // // // //   ] = useState("");

// // // // //   const ref =
// // // // //     useRef(null);

// // // // //   const searchRef =
// // // // //     useRef(null);

// // // // //   useEffect(() => {
// // // // //     const handleOutside =
// // // // //       (event) => {
// // // // //         if (
// // // // //           ref.current &&
// // // // //           !ref.current.contains(
// // // // //             event.target
// // // // //           )
// // // // //         ) {
// // // // //           setOpen(false);
// // // // //           setSearchQuery("");
// // // // //         }
// // // // //       };

// // // // //     document.addEventListener(
// // // // //       "mousedown",
// // // // //       handleOutside
// // // // //     );

// // // // //     return () => {
// // // // //       document.removeEventListener(
// // // // //         "mousedown",
// // // // //         handleOutside
// // // // //       );
// // // // //     };
// // // // //   }, []);

// // // // //   useEffect(() => {
// // // // //     if (
// // // // //       open &&
// // // // //       searchable &&
// // // // //       searchRef.current
// // // // //     ) {
// // // // //       requestAnimationFrame(
// // // // //         () => {
// // // // //           searchRef.current?.focus();
// // // // //         }
// // // // //       );
// // // // //     }

// // // // //     if (!open) {
// // // // //       setSearchQuery("");
// // // // //     }
// // // // //   }, [
// // // // //     open,
// // // // //     searchable,
// // // // //   ]);

// // // // //   const normalized =
// // // // //     (options || [])
// // // // //       .map((option) => {
// // // // //         if (
// // // // //           option === null ||
// // // // //           option === undefined
// // // // //         ) {
// // // // //           return null;
// // // // //         }

// // // // //         if (
// // // // //           typeof option ===
// // // // //           "string" ||
// // // // //           typeof option ===
// // // // //           "number"
// // // // //         ) {
// // // // //           return {
// // // // //             id:
// // // // //               String(option),
// // // // //             name:
// // // // //               String(option),
// // // // //           };
// // // // //         }

// // // // //         const id =
// // // // //           option.value !==
// // // // //             undefined
// // // // //             ? option.value
// // // // //             : option.id !==
// // // // //               undefined
// // // // //               ? option.id
// // // // //               : option.code !==
// // // // //                 undefined
// // // // //                 ? option.code
// // // // //                 : "";

// // // // //         const name =
// // // // //           option.label !==
// // // // //             undefined
// // // // //             ? option.label
// // // // //             : option.name !==
// // // // //               undefined
// // // // //               ? option.name
// // // // //               : option.period_name !==
// // // // //                 undefined
// // // // //                 ? option.period_name
// // // // //                 : String(id);

// // // // //         if (
// // // // //           id === null ||
// // // // //           id === undefined ||
// // // // //           id === ""
// // // // //         ) {
// // // // //           return null;
// // // // //         }

// // // // //         return {
// // // // //           id:
// // // // //             String(id),
// // // // //           name:
// // // // //             String(name),
// // // // //         };
// // // // //       })
// // // // //       .filter(Boolean);

// // // // //   const currentValue =
// // // // //     value === null ||
// // // // //       value === undefined
// // // // //       ? ""
// // // // //       : String(value);

// // // // //   const currentOption =
// // // // //     normalized.find(
// // // // //       (option) =>
// // // // //         option.id ===
// // // // //         currentValue
// // // // //     );

// // // // //   const query =
// // // // //     searchQuery
// // // // //       .trim()
// // // // //       .toLowerCase();

// // // // //   const visibleOptions =
// // // // //     searchable && query
// // // // //       ? normalized.filter(
// // // // //         (option) =>
// // // // //           option.name
// // // // //             .toLowerCase()
// // // // //             .includes(
// // // // //               query
// // // // //             ) ||
// // // // //           option.id
// // // // //             .toLowerCase()
// // // // //             .includes(
// // // // //               query
// // // // //             )
// // // // //       )
// // // // //       : normalized;

// // // // //   const displayText =
// // // // //     currentOption?.name ||
// // // // //     placeholder;

// // // // //   const handleSelect =
// // // // //     (option) => {
// // // // //       onChange?.(
// // // // //         option.id
// // // // //       );

// // // // //       setOpen(false);
// // // // //       setSearchQuery("");
// // // // //     };

// // // // //   return (
// // // // //     <div
// // // // //       ref={ref}
// // // // //       style={{
// // // // //         position:
// // // // //           "relative",

// // // // //         width,
// // // // //       }}
// // // // //     >
// // // // //       <button
// // // // //         type="button"
// // // // //         onClick={() =>
// // // // //           setOpen(
// // // // //             (previous) =>
// // // // //               !previous
// // // // //           )
// // // // //         }
// // // // //         style={{
// // // // //           ...selectStyle,

// // // // //           textAlign:
// // // // //             "left",

// // // // //           overflow:
// // // // //             "hidden",

// // // // //           textOverflow:
// // // // //             "ellipsis",

// // // // //           whiteSpace:
// // // // //             "nowrap",
// // // // //         }}
// // // // //         title={
// // // // //           displayText
// // // // //         }
// // // // //       >
// // // // //         {displayText}
// // // // //       </button>

// // // // //       {open && (
// // // // //         <div
// // // // //           style={{
// // // // //             position:
// // // // //               "absolute",

// // // // //             top:
// // // // //               "calc(100% + 3px)",

// // // // //             left: 0,

// // // // //             width:
// // // // //               Math.max(
// // // // //                 width,
// // // // //                 225
// // // // //               ),

// // // // //             maxHeight:
// // // // //               300,

// // // // //             overflowY:
// // // // //               "auto",

// // // // //             overflowX:
// // // // //               "hidden",

// // // // //             background:
// // // // //               "#fff",

// // // // //             border:
// // // // //               "1px solid #e2e8f0",

// // // // //             borderRadius:
// // // // //               7,

// // // // //             boxShadow:
// // // // //               "0 8px 22px rgba(15,23,42,0.14)",

// // // // //             zIndex:
// // // // //               9999,

// // // // //             padding:
// // // // //               6,

// // // // //             boxSizing:
// // // // //               "border-box",

// // // // //             scrollbarWidth:
// // // // //               "thin",

// // // // //             scrollbarColor:
// // // // //               "#64748b #f1f5f9",
// // // // //           }}
// // // // //         >
// // // // //           {searchable && (
// // // // //             <div
// // // // //               style={{
// // // // //                 position:
// // // // //                   "relative",

// // // // //                 marginBottom:
// // // // //                   4,
// // // // //               }}
// // // // //             >
// // // // //               <Search
// // // // //                 size={13}
// // // // //                 style={{
// // // // //                   position:
// // // // //                     "absolute",

// // // // //                   left: 8,

// // // // //                   top: 8,

// // // // //                   color:
// // // // //                     "#94a3b8",

// // // // //                   pointerEvents:
// // // // //                     "none",
// // // // //                 }}
// // // // //               />

// // // // //               <input
// // // // //                 ref={searchRef}
// // // // //                 type="text"
// // // // //                 value={
// // // // //                   searchQuery
// // // // //                 }
// // // // //                 onChange={(
// // // // //                   event
// // // // //                 ) =>
// // // // //                   setSearchQuery(
// // // // //                     event.target
// // // // //                       .value
// // // // //                   )
// // // // //                 }
// // // // //                 placeholder={
// // // // //                   searchPlaceholder
// // // // //                 }
// // // // //                 style={{
// // // // //                   width:
// // // // //                     "100%",

// // // // //                   height:
// // // // //                     30,

// // // // //                   boxSizing:
// // // // //                     "border-box",

// // // // //                   border:
// // // // //                     "1px solid #dbe3ef",

// // // // //                   borderRadius:
// // // // //                     6,

// // // // //                   padding:
// // // // //                     "0 8px 0 26px",

// // // // //                   outline:
// // // // //                     "none",

// // // // //                   fontSize:
// // // // //                     "0.72rem",

// // // // //                   color:
// // // // //                     "#334155",
// // // // //                 }}
// // // // //               />
// // // // //             </div>
// // // // //           )}

// // // // //           {visibleOptions.map(
// // // // //             (option) => {
// // // // //               const selected =
// // // // //                 option.id ===
// // // // //                 currentValue;

// // // // //               return (
// // // // //                 <button
// // // // //                   key={
// // // // //                     option.id
// // // // //                   }
// // // // //                   type="button"
// // // // //                   onClick={() =>
// // // // //                     handleSelect(
// // // // //                       option
// // // // //                     )
// // // // //                   }
// // // // //                   style={{
// // // // //                     width:
// // // // //                       "100%",

// // // // //                     height:
// // // // //                       27,

// // // // //                     minHeight:
// // // // //                       27,

// // // // //                     boxSizing:
// // // // //                       "border-box",

// // // // //                     border:
// // // // //                       "none",

// // // // //                     background:
// // // // //                       selected
// // // // //                         ? "#f5f7ff"
// // // // //                         : "#fff",

// // // // //                     textAlign:
// // // // //                       "left",

// // // // //                     padding:
// // // // //                       "2px 8px",

// // // // //                     margin:
// // // // //                       0,

// // // // //                     borderRadius:
// // // // //                       4,

// // // // //                     cursor:
// // // // //                       "pointer",

// // // // //                     fontSize:
// // // // //                       "0.72rem",

// // // // //                     lineHeight:
// // // // //                       "18px",

// // // // //                     fontWeight:
// // // // //                       selected
// // // // //                         ? 600
// // // // //                         : 500,

// // // // //                     color:
// // // // //                       "#334155",

// // // // //                     overflow:
// // // // //                       "hidden",

// // // // //                     textOverflow:
// // // // //                       "ellipsis",

// // // // //                     whiteSpace:
// // // // //                       "nowrap",
// // // // //                   }}
// // // // //                   title={
// // // // //                     option.name
// // // // //                   }
// // // // //                 >
// // // // //                   {
// // // // //                     option.name
// // // // //                   }
// // // // //                 </button>
// // // // //               );
// // // // //             }
// // // // //           )}

// // // // //           {!visibleOptions.length && (
// // // // //             <div
// // // // //               style={{
// // // // //                 padding:
// // // // //                   "10px 6px",

// // // // //                 textAlign:
// // // // //                   "center",

// // // // //                 fontSize:
// // // // //                   "0.7rem",

// // // // //                 color:
// // // // //                   "#94a3b8",
// // // // //               }}
// // // // //             >
// // // // //               No options found
// // // // //             </div>
// // // // //           )}
// // // // //         </div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // /* =========================================================
// // // // //    OPEX FILTERS
// // // // // ========================================================= */

// // // // // export default function OpexFilters({
// // // // //   filterOptions = {},
// // // // //   selectedFilters:
// // // // //   externalSelectedFilters,
// // // // //   onChange,
// // // // //   onApply,
// // // // //   onReset,
// // // // // }) {
// // // // //   const [
// // // // //     opexFilterOptions,
// // // // //     setOpexFilterOptions,
// // // // //   ] = useState(
// // // // //     normalizeOpexFilterOptions(
// // // // //       filterOptions
// // // // //     )
// // // // //   );

// // // // //   const [
// // // // //     selectedFilters,
// // // // //     setSelectedFilters,
// // // // //   ] = useState(() => {
// // // // //     const normalized =
// // // // //       normalizeOpexFilterOptions(
// // // // //         filterOptions
// // // // //       );

// // // // //     const years =
// // // // //       normalized.years ||
// // // // //       [];

// // // // //     const periods =
// // // // //       normalized.periods ||
// // // // //       [];

// // // // //     const firstYear =
// // // // //       years.length
// // // // //         ? getOptionValue(
// // // // //           years[0]
// // // // //         )
// // // // //         : "";

// // // // //     const latestPeriod =
// // // // //       periods.length
// // // // //         ? getLatestPeriod(
// // // // //           periods
// // // // //         )
// // // // //         : "";

// // // // //     return {
// // // // //       ...DEFAULT_FILTERS,

// // // // //       ...(externalSelectedFilters ||
// // // // //         {}),

// // // // //       year:
// // // // //         externalSelectedFilters?.year ||
// // // // //         (firstYear
// // // // //           ? String(
// // // // //             firstYear
// // // // //           )
// // // // //           : ""),

// // // // //       period:
// // // // //         externalSelectedFilters?.period ||
// // // // //         (latestPeriod
// // // // //           ? [
// // // // //             String(
// // // // //               latestPeriod
// // // // //             ),
// // // // //           ]
// // // // //           : []),

// // // // //       reporting_currency:
// // // // //         externalSelectedFilters?.reporting_currency ||
// // // // //         normalized.default_reporting_currency ||
// // // // //         "AED",
// // // // //     };
// // // // //   });

// // // // //   const [
// // // // //     loading,
// // // // //     setLoading,
// // // // //   ] = useState(false);

// // // // //   /* =======================================================
// // // // //      SYNC EXTERNAL FILTERS
// // // // //   ======================================================= */

// // // // //   useEffect(() => {
// // // // //     if (
// // // // //       !externalSelectedFilters
// // // // //     ) {
// // // // //       return;
// // // // //     }

// // // // //     setSelectedFilters(
// // // // //       (previous) => ({
// // // // //         ...previous,
// // // // //         ...externalSelectedFilters,
// // // // //       })
// // // // //     );
// // // // //   }, [
// // // // //     externalSelectedFilters,
// // // // //   ]);

// // // // //   /* =======================================================
// // // // //      LOAD FILTER OPTIONS
// // // // //   ======================================================= */

// // // // //   const loadOpexFilterOptions =
// // // // //     async (
// // // // //       currentFilters = {},
// // // // //       preserveOptionKey = null
// // // // //     ) => {
// // // // //       try {
// // // // //         setLoading(true);

// // // // //         const response =
// // // // //           await getOpexFilterOptions(
// // // // //             currentFilters
// // // // //           );

// // // // //         const normalized =
// // // // //           normalizeOpexFilterOptions(
// // // // //             response
// // // // //           );

// // // // //         setOpexFilterOptions(
// // // // //           (previous) => {
// // // // //             if (
// // // // //               preserveOptionKey
// // // // //             ) {
// // // // //               return {
// // // // //                 ...previous,
// // // // //                 ...normalized,

// // // // //                 [preserveOptionKey]:
// // // // //                   normalized[
// // // // //                   preserveOptionKey
// // // // //                   ] ??
// // // // //                   previous[
// // // // //                   preserveOptionKey
// // // // //                   ] ??
// // // // //                   [],
// // // // //               };
// // // // //             }

// // // // //             return {
// // // // //               ...previous,
// // // // //               ...normalized,
// // // // //             };
// // // // //           }
// // // // //         );

// // // // //         return normalized;
// // // // //       } catch (error) {
// // // // //         console.error(
// // // // //           "Failed to load OPEX filter options:",
// // // // //           error
// // // // //         );

// // // // //         return null;
// // // // //       } finally {
// // // // //         setLoading(false);
// // // // //       }
// // // // //     };

// // // // //   /* =======================================================
// // // // //      INITIAL OPTIONS
// // // // //   ======================================================= */

// // // // //   useEffect(() => {
// // // // //     void loadOpexFilterOptions(
// // // // //       {}
// // // // //     );
// // // // //   }, []);

// // // // //   /* =======================================================
// // // // //      DEFAULT VALUES
// // // // //   ======================================================= */

// // // // //   useEffect(() => {
// // // // //     if (
// // // // //       !opexFilterOptions
// // // // //     ) {
// // // // //       return;
// // // // //     }

// // // // //     setSelectedFilters(
// // // // //       (previous) => {
// // // // //         const next = {
// // // // //           ...previous,
// // // // //         };

// // // // //         if (
// // // // //           !next.year &&
// // // // //           opexFilterOptions
// // // // //             .years?.length
// // // // //         ) {
// // // // //           next.year =
// // // // //             String(
// // // // //               getOptionValue(
// // // // //                 opexFilterOptions
// // // // //                   .years[0]
// // // // //               )
// // // // //             );
// // // // //         }

// // // // //         if (
// // // // //           (!Array.isArray(
// // // // //             next.period
// // // // //           ) ||
// // // // //             next.period.length ===
// // // // //             0) &&
// // // // //           opexFilterOptions
// // // // //             .periods?.length
// // // // //         ) {
// // // // //           const latestPeriod =
// // // // //             getLatestPeriod(
// // // // //               opexFilterOptions
// // // // //                 .periods
// // // // //             );

// // // // //           if (
// // // // //             latestPeriod
// // // // //           ) {
// // // // //             next.period = [
// // // // //               String(
// // // // //                 latestPeriod
// // // // //               ),
// // // // //             ];
// // // // //           }
// // // // //         }

// // // // //         if (
// // // // //           !next.reporting_currency
// // // // //         ) {
// // // // //           next.reporting_currency =
// // // // //             opexFilterOptions
// // // // //               .default_reporting_currency ||
// // // // //             "AED";
// // // // //         }

// // // // //         return next;
// // // // //       }
// // // // //     );
// // // // //   }, [
// // // // //     opexFilterOptions,
// // // // //   ]);

// // // // //   /* =======================================================
// // // // //      FILTER CHANGE

// // // // //      IMPORTANT FIX:
// // // // //      The previous code created apiKeyMap but never used it.
// // // // //      We now construct the actual API filter parameters.

// // // // //      This fixes:
// // // // //        Legal Group
// // // // //           -> Legal Entity

// // // // //        Legal Entity
// // // // //           -> Parent Division

// // // // //        Parent Division
// // // // //           -> Sub-Division
// // // // //   ======================================================= */

// // // // //   const handleFilterChange = (
// // // // //     key,
// // // // //     value
// // // // //   ) => {
// // // // //     const nextFilters = {
// // // // //       ...selectedFilters,
// // // // //       [key]: value,
// // // // //     };

// // // // //     setSelectedFilters(
// // // // //       nextFilters
// // // // //     );

// // // // //     /* -----------------------------------------------------
// // // // //        Dependent dropdown mapping
// // // // //     ----------------------------------------------------- */

// // // // //     const optionKeyMap = {
// // // // //       legal_group:
// // // // //         "legal_entities",

// // // // //       legal_entity:
// // // // //         "parent_divisions",

// // // // //       parent_division:
// // // // //         "subdivisions",
// // // // //     };

// // // // //     const apiKeyMap = {
// // // // //       legal_group:
// // // // //         "legal_group_id",

// // // // //       legal_entity:
// // // // //         "legal_entity_id",

// // // // //       parent_division:
// // // // //         "parent_division_id",
// // // // //     };

// // // // //     const dependentKey =
// // // // //       optionKeyMap[key];

// // // // //     const apiKey =
// // // // //       apiKeyMap[key];

// // // // //     if (
// // // // //       dependentKey &&
// // // // //       apiKey
// // // // //     ) {
// // // // //       /* -----------------------------------------------
// // // // //          IMPORTANT:

// // // // //          Convert the local filter name to the API
// // // // //          parameter name.

// // // // //          Example:

// // // // //          legal_group
// // // // //              =>
// // // // //          legal_group_id
// // // // //       ------------------------------------------------ */

// // // // //       const apiFilters = {
// // // // //         year:
// // // // //           nextFilters.year ||
// // // // //           undefined,

// // // // //         period_name:
// // // // //           nextFilters.period ||
// // // // //           undefined,

// // // // //         reporting_currency:
// // // // //           nextFilters.reporting_currency ||
// // // // //           "AED",

// // // // //         [apiKey]:
// // // // //           Array.isArray(value)
// // // // //             ? value
// // // // //             : value
// // // // //               ? [value]
// // // // //               : [],
// // // // //       };

// // // // //       /* -----------------------------------------------
// // // // //          Clear lower-level selections locally.

// // // // //          This prevents stale entity/division/subdivision
// // // // //          values from remaining after parent changes.
// // // // //       ------------------------------------------------ */

// // // // //       const clearedFilters = {
// // // // //         ...nextFilters,
// // // // //       };

// // // // //       if (
// // // // //         key ===
// // // // //         "legal_group"
// // // // //       ) {
// // // // //         clearedFilters.legal_entity =
// // // // //           [];

// // // // //         clearedFilters.parent_division =
// // // // //           [];

// // // // //         clearedFilters.subdivision =
// // // // //           [];
// // // // //       }

// // // // //       if (
// // // // //         key ===
// // // // //         "legal_entity"
// // // // //       ) {
// // // // //         clearedFilters.parent_division =
// // // // //           [];

// // // // //         clearedFilters.subdivision =
// // // // //           [];
// // // // //       }

// // // // //       if (
// // // // //         key ===
// // // // //         "parent_division"
// // // // //       ) {
// // // // //         clearedFilters.subdivision =
// // // // //           [];
// // // // //       }

// // // // //       setSelectedFilters(
// // // // //         clearedFilters
// // // // //       );

// // // // //       void loadOpexFilterOptions(
// // // // //         apiFilters,
// // // // //         dependentKey
// // // // //       );
// // // // //     }
// // // // //   };

// // // // //   /* =======================================================
// // // // //      RESET
// // // // //   ======================================================= */

// // // // //   const handleReset = () => {
// // // // //     const years =
// // // // //       opexFilterOptions
// // // // //         .years?.length
// // // // //         ? opexFilterOptions.years
// // // // //         : filterOptions?.years ||
// // // // //         [];

// // // // //     const periods =
// // // // //       opexFilterOptions
// // // // //         .periods?.length
// // // // //         ? opexFilterOptions
// // // // //           .periods
// // // // //         : filterOptions?.periods ||
// // // // //         [];

// // // // //     const firstYear =
// // // // //       years.length
// // // // //         ? getOptionValue(
// // // // //           years[0]
// // // // //         )
// // // // //         : "";

// // // // //     const latestPeriod =
// // // // //       periods.length
// // // // //         ? getLatestPeriod(
// // // // //           periods
// // // // //         )
// // // // //         : "";

// // // // //     const resetFilters = {
// // // // //       ...DEFAULT_FILTERS,

// // // // //       legal_group: [],
// // // // //       legal_entity: [],
// // // // //       parent_division: [],
// // // // //       subdivision: [],

// // // // //       period:
// // // // //         latestPeriod
// // // // //           ? [
// // // // //             String(
// // // // //               latestPeriod
// // // // //             ),
// // // // //           ]
// // // // //           : [],

// // // // //       year:
// // // // //         firstYear
// // // // //           ? String(
// // // // //             firstYear
// // // // //           )
// // // // //           : "",

// // // // //       reporting_currency:
// // // // //         opexFilterOptions
// // // // //           .default_reporting_currency ||
// // // // //         filterOptions
// // // // //           ?.default_reporting_currency ||
// // // // //         "AED",
// // // // //     };

// // // // //     setSelectedFilters(
// // // // //       resetFilters
// // // // //     );

// // // // //     onChange?.(
// // // // //       resetFilters
// // // // //     );

// // // // //     onReset?.();

// // // // //     void loadOpexFilterOptions(
// // // // //       {}
// // // // //     );
// // // // //   };

// // // // //   const options = {
// // // // //     ...filterOptions,
// // // // //     ...opexFilterOptions,
// // // // //   };

// // // // //   /* =======================================================
// // // // //      UI
// // // // //   ======================================================= */

// // // // //   return (
// // // // //     <div
// // // // //       className="card"
// // // // //       style={{
// // // // //         width:
// // // // //           "100%",

// // // // //         maxWidth:
// // // // //           "100%",

// // // // //         padding:
// // // // //           "10px 16px",

// // // // //         marginBottom:
// // // // //           16,

// // // // //         display:
// // // // //           "flex",

// // // // //         alignItems:
// // // // //           "flex-end",

// // // // //         gap:
// // // // //           10,

// // // // //         flexWrap:
// // // // //           "wrap",

// // // // //         boxSizing:
// // // // //           "border-box",

// // // // //         overflow:
// // // // //           "visible",

// // // // //         position:
// // // // //           "relative",

// // // // //         zIndex:
// // // // //           20,

// // // // //         fontFamily:
// // // // //           "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
// // // // //       }}
// // // // //     >
// // // // //       {/* ===================================================
// // // // //           LEGAL GROUP
// // // // //       =================================================== */}

// // // // //       <FilterField
// // // // //         label="Legal Group"
// // // // //         width={
// // // // //           FIELD_WIDTHS.legal_group
// // // // //         }
// // // // //       >
// // // // //         <OpexMultiSelect
// // // // //           options={
// // // // //             options.legal_groups ||
// // // // //             []
// // // // //           }
// // // // //           value={
// // // // //             selectedFilters
// // // // //               .legal_group ||
// // // // //             []
// // // // //           }
// // // // //           onChange={(value) =>
// // // // //             handleFilterChange(
// // // // //               "legal_group",
// // // // //               value
// // // // //             )
// // // // //           }
// // // // //           placeholder="All"
// // // // //           searchPlaceholder="Search Legal Group"
// // // // //           width={
// // // // //             FIELD_WIDTHS.legal_group
// // // // //           }
// // // // //         />
// // // // //       </FilterField>

// // // // //       {/* ===================================================
// // // // //           LEGAL ENTITY
// // // // //       =================================================== */}

// // // // //       <FilterField
// // // // //         label="Legal Entity"
// // // // //         width={
// // // // //           FIELD_WIDTHS.legal_entity
// // // // //         }
// // // // //       >
// // // // //         <OpexMultiSelect
// // // // //           options={
// // // // //             options.legal_entities ||
// // // // //             []
// // // // //           }
// // // // //           value={
// // // // //             selectedFilters
// // // // //               .legal_entity ||
// // // // //             []
// // // // //           }
// // // // //           onChange={(value) =>
// // // // //             handleFilterChange(
// // // // //               "legal_entity",
// // // // //               value
// // // // //             )
// // // // //           }
// // // // //           placeholder="All"
// // // // //           searchPlaceholder="Search Legal Entity"
// // // // //           width={
// // // // //             FIELD_WIDTHS.legal_entity
// // // // //           }
// // // // //         />
// // // // //       </FilterField>

// // // // //       {/* ===================================================
// // // // //           PARENT DIVISION
// // // // //       =================================================== */}

// // // // //       <FilterField
// // // // //         label="Parent Division"
// // // // //         width={
// // // // //           FIELD_WIDTHS.parent_division
// // // // //         }
// // // // //       >
// // // // //         <OpexMultiSelect
// // // // //           options={
// // // // //             options.parent_divisions ||
// // // // //             []
// // // // //           }
// // // // //           value={
// // // // //             selectedFilters
// // // // //               .parent_division ||
// // // // //             []
// // // // //           }
// // // // //           onChange={(value) =>
// // // // //             handleFilterChange(
// // // // //               "parent_division",
// // // // //               value
// // // // //             )
// // // // //           }
// // // // //           placeholder="All"
// // // // //           searchPlaceholder="Search Parent Division"
// // // // //           width={
// // // // //             FIELD_WIDTHS.parent_division
// // // // //           }
// // // // //         />
// // // // //       </FilterField>

// // // // //       {/* ===================================================
// // // // //           SUB-DIVISION
// // // // //       =================================================== */}

// // // // //       <FilterField
// // // // //         label="Sub-Division"
// // // // //         width={
// // // // //           FIELD_WIDTHS.subdivision
// // // // //         }
// // // // //       >
// // // // //         <OpexMultiSelect
// // // // //           options={
// // // // //             options.subdivisions ||
// // // // //             []
// // // // //           }
// // // // //           value={
// // // // //             selectedFilters
// // // // //               .subdivision ||
// // // // //             []
// // // // //           }
// // // // //           onChange={(value) =>
// // // // //             handleFilterChange(
// // // // //               "subdivision",
// // // // //               value
// // // // //             )
// // // // //           }
// // // // //           placeholder="All"
// // // // //           searchPlaceholder="Search Sub-Division"
// // // // //           width={
// // // // //             FIELD_WIDTHS.subdivision
// // // // //           }
// // // // //         />
// // // // //       </FilterField>

// // // // //       {/* ===================================================
// // // // //           YEAR
// // // // //       =================================================== */}

// // // // //       <FilterField
// // // // //         label="Year"
// // // // //         width={
// // // // //           FIELD_WIDTHS.year
// // // // //         }
// // // // //       >
// // // // //         <OpexSingleSelect
// // // // //           options={
// // // // //             options.years ||
// // // // //             []
// // // // //           }
// // // // //           value={
// // // // //             selectedFilters.year ||
// // // // //             ""
// // // // //           }
// // // // //           onChange={(value) =>
// // // // //             handleFilterChange(
// // // // //               "year",
// // // // //               value
// // // // //             )
// // // // //           }
// // // // //           placeholder="Select Year"
// // // // //           searchPlaceholder="Search Year"
// // // // //           width={
// // // // //             FIELD_WIDTHS.year
// // // // //           }
// // // // //         />
// // // // //       </FilterField>

// // // // //       {/* ===================================================
// // // // //           PERIOD
// // // // //       =================================================== */}

// // // // //       <FilterField
// // // // //         label="Period"
// // // // //         width={
// // // // //           FIELD_WIDTHS.period
// // // // //         }
// // // // //       >
// // // // //         <OpexMultiSelect
// // // // //           options={
// // // // //             options.periods ||
// // // // //             []
// // // // //           }
// // // // //           value={
// // // // //             selectedFilters.period ||
// // // // //             []
// // // // //           }
// // // // //           onChange={(value) =>
// // // // //             handleFilterChange(
// // // // //               "period",
// // // // //               value
// // // // //             )
// // // // //           }
// // // // //           placeholder="All"
// // // // //           searchPlaceholder="Search Period"
// // // // //           width={
// // // // //             FIELD_WIDTHS.period
// // // // //           }
// // // // //         />
// // // // //       </FilterField>

// // // // //       {/* ===================================================
// // // // //           REPORTING CURRENCY
// // // // //       =================================================== */}

// // // // //       <FilterField
// // // // //         label="Reporting Currency"
// // // // //         width={
// // // // //           FIELD_WIDTHS.reporting_currency
// // // // //         }
// // // // //       >
// // // // //         <OpexSingleSelect
// // // // //           options={
// // // // //             options
// // // // //               .reporting_currencies
// // // // //               ?.length
// // // // //               ? options.reporting_currencies
// // // // //               : [
// // // // //                 {
// // // // //                   value:
// // // // //                     options.default_reporting_currency ||
// // // // //                     "AED",

// // // // //                   label:
// // // // //                     options.default_reporting_currency ||
// // // // //                     "AED",
// // // // //                 },
// // // // //               ]
// // // // //           }
// // // // //           value={
// // // // //             selectedFilters
// // // // //               .reporting_currency ||
// // // // //             options.default_reporting_currency ||
// // // // //             "AED"
// // // // //           }
// // // // //           onChange={(value) =>
// // // // //             handleFilterChange(
// // // // //               "reporting_currency",
// // // // //               value
// // // // //             )
// // // // //           }
// // // // //           placeholder="AED"
// // // // //           searchable={false}
// // // // //           width={
// // // // //             FIELD_WIDTHS.reporting_currency
// // // // //           }
// // // // //         />
// // // // //       </FilterField>

// // // // //       {/* ===================================================
// // // // //           APPLY / RESET
// // // // //       =================================================== */}

// // // // //       <div
// // // // //         style={{
// // // // //           display:
// // // // //             "flex",

// // // // //           alignItems:
// // // // //             "center",

// // // // //           gap:
// // // // //             8,

// // // // //           alignSelf:
// // // // //             "flex-end",

// // // // //           flexShrink:
// // // // //             0,

// // // // //           paddingBottom:
// // // // //             1,

// // // // //           marginLeft:
// // // // //             6,
// // // // //         }}
// // // // //       >
// // // // //         <button
// // // // //           id="btn-apply-opex-filter"
// // // // //           type="button"
// // // // //           onClick={() =>
// // // // //             onApply?.(
// // // // //               selectedFilters
// // // // //             )
// // // // //           }
// // // // //           style={{
// // // // //             height:
// // // // //               34,

// // // // //             padding:
// // // // //               "0 16px",

// // // // //             background:
// // // // //               "#6366f1",

// // // // //             color:
// // // // //               "#fff",

// // // // //             border:
// // // // //               "none",

// // // // //             borderRadius:
// // // // //               8,

// // // // //             fontSize:
// // // // //               "0.78rem",

// // // // //             fontWeight:
// // // // //               700,

// // // // //             cursor:
// // // // //               "pointer",

// // // // //             whiteSpace:
// // // // //               "nowrap",

// // // // //             display:
// // // // //               "inline-flex",

// // // // //             alignItems:
// // // // //               "center",

// // // // //             justifyContent:
// // // // //               "center",
// // // // //           }}
// // // // //         >
// // // // //           Apply
// // // // //         </button>

// // // // //         <button
// // // // //           id="btn-reset-opex-filter"
// // // // //           type="button"
// // // // //           onClick={
// // // // //             handleReset
// // // // //           }
// // // // //           style={{
// // // // //             height:
// // // // //               34,

// // // // //             padding:
// // // // //               "0 10px",

// // // // //             background:
// // // // //               "#fff",

// // // // //             border:
// // // // //               "1px solid #e2e8f0",

// // // // //             color:
// // // // //               "#64748b",

// // // // //             borderRadius:
// // // // //               8,

// // // // //             fontWeight:
// // // // //               600,

// // // // //             fontSize:
// // // // //               "0.78rem",

// // // // //             cursor:
// // // // //               "pointer",

// // // // //             whiteSpace:
// // // // //               "nowrap",

// // // // //             display:
// // // // //               "inline-flex",

// // // // //             alignItems:
// // // // //               "center",

// // // // //             justifyContent:
// // // // //               "center",
// // // // //           }}
// // // // //         >
// // // // //           Reset
// // // // //         </button>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }


// // // // import React, {
// // // //   useEffect,
// // // //   useRef,
// // // //   useState,
// // // // } from "react";

// // // // import { Search } from "lucide-react";

// // // // import {
// // // //   getOpexFilterOptions,
// // // // } from "../../api/opexApi";

// // // // /* =========================================================
// // // //    DEFAULT FILTERS
// // // // ========================================================= */

// // // // const DEFAULT_FILTERS = {
// // // //   legal_group: [],
// // // //   legal_entity: [],
// // // //   parent_division: [],
// // // //   subdivision: [],
// // // //   currency: "",
// // // //   as_on_date: "",
// // // //   period: [],
// // // //   compare_with: "",
// // // //   reporting_currency: "AED",
// // // //   year: "",
// // // // };

// // // // /* =========================================================
// // // //    FIELD WIDTHS
// // // // ========================================================= */

// // // // const FIELD_WIDTHS = {
// // // //   legal_group: 128,
// // // //   legal_entity: 128,
// // // //   parent_division: 128,
// // // //   subdivision: 128,
// // // //   year: 128,
// // // //   period: 128,
// // // //   reporting_currency: 128,
// // // // };

// // // // /* =========================================================
// // // //    OPTION VALUE
// // // // ========================================================= */

// // // // const getOptionValue = (option) => {
// // // //   if (
// // // //     option === null ||
// // // //     option === undefined
// // // //   ) {
// // // //     return "";
// // // //   }

// // // //   if (
// // // //     typeof option === "object"
// // // //   ) {
// // // //     return (
// // // //       option.value ??
// // // //       option.id ??
// // // //       option.code ??
// // // //       option.period_name ??
// // // //       option.year ??
// // // //       option.name ??
// // // //       option.currency_code ??
// // // //       ""
// // // //     );
// // // //   }

// // // //   return option;
// // // // };

// // // // /* =========================================================
// // // //    OPTION LABEL
// // // // ========================================================= */

// // // // const getOptionLabel = (option) => {
// // // //   if (
// // // //     option === null ||
// // // //     option === undefined
// // // //   ) {
// // // //     return "";
// // // //   }

// // // //   if (
// // // //     typeof option === "object"
// // // //   ) {
// // // //     return (
// // // //       option.label ??
// // // //       option.name ??
// // // //       option.period_name ??
// // // //       option.year ??
// // // //       option.currency_name ??
// // // //       option.currency_code ??
// // // //       option.value ??
// // // //       option.code ??
// // // //       ""
// // // //     );
// // // //   }

// // // //   return option;
// // // // };

// // // // /* =========================================================
// // // //    LATEST PERIOD
// // // // ========================================================= */

// // // // function getLatestPeriod(
// // // //   periods = []
// // // // ) {
// // // //   if (
// // // //     !Array.isArray(periods) ||
// // // //     periods.length === 0
// // // //   ) {
// // // //     return "";
// // // //   }

// // // //   return getOptionValue(
// // // //     periods[periods.length - 1]
// // // //   );
// // // // }

// // // // /* =========================================================
// // // //    NORMALIZE YEARS
// // // // ========================================================= */

// // // // function normalizeYears(
// // // //   payload = {},
// // // //   periods = []
// // // // ) {
// // // //   const rawYears =
// // // //     payload?.years ||
// // // //     payload?.fiscal_years ||
// // // //     payload?.accounting_years ||
// // // //     [];

// // // //   if (
// // // //     Array.isArray(rawYears) &&
// // // //     rawYears.length
// // // //   ) {
// // // //     return rawYears;
// // // //   }

// // // //   const derived = [];

// // // //   if (
// // // //     Array.isArray(periods)
// // // //   ) {
// // // //     periods.forEach(
// // // //       (period) => {
// // // //         if (
// // // //           !period ||
// // // //           typeof period !== "object"
// // // //         ) {
// // // //           return;
// // // //         }

// // // //         const year =
// // // //           period.year ??
// // // //           period.fiscal_year ??
// // // //           period.accounting_year ??
// // // //           null;

// // // //         if (
// // // //           year === null ||
// // // //           year === undefined ||
// // // //           year === ""
// // // //         ) {
// // // //           return;
// // // //         }

// // // //         const exists =
// // // //           derived.some(
// // // //             (item) =>
// // // //               String(
// // // //                 getOptionValue(item)
// // // //               ) ===
// // // //               String(year)
// // // //           );

// // // //         if (!exists) {
// // // //           derived.push({
// // // //             value: year,
// // // //             label: year,
// // // //           });
// // // //         }
// // // //       }
// // // //     );
// // // //   }

// // // //   return derived;
// // // // }

// // // // /* =========================================================
// // // //    NORMALIZE CURRENCY
// // // // ========================================================= */

// // // // function normalizeCurrencyOptions(
// // // //   rawCurrencies
// // // // ) {
// // // //   if (
// // // //     rawCurrencies === null ||
// // // //     rawCurrencies === undefined ||
// // // //     rawCurrencies === ""
// // // //   ) {
// // // //     return [];
// // // //   }

// // // //   if (
// // // //     typeof rawCurrencies === "string" ||
// // // //     typeof rawCurrencies === "number"
// // // //   ) {
// // // //     const value =
// // // //       String(rawCurrencies);

// // // //     return [
// // // //       {
// // // //         value,
// // // //         label: value,
// // // //       },
// // // //     ];
// // // //   }

// // // //   if (
// // // //     Array.isArray(rawCurrencies)
// // // //   ) {
// // // //     return rawCurrencies
// // // //       .map((item) => {
// // // //         if (
// // // //           item === null ||
// // // //           item === undefined ||
// // // //           item === ""
// // // //         ) {
// // // //           return null;
// // // //         }

// // // //         if (
// // // //           typeof item === "string" ||
// // // //           typeof item === "number"
// // // //         ) {
// // // //           const value =
// // // //             String(item);

// // // //           return {
// // // //             value,
// // // //             label: value,
// // // //           };
// // // //         }

// // // //         if (
// // // //           typeof item === "object"
// // // //         ) {
// // // //           const value =
// // // //             item.currency_code ??
// // // //             item.currencyCode ??
// // // //             item.currency ??
// // // //             item.value ??
// // // //             item.code ??
// // // //             item.id ??
// // // //             "";

// // // //           const label =
// // // //             item.label ??
// // // //             item.name ??
// // // //             item.currency_name ??
// // // //             item.currency_code ??
// // // //             item.currencyCode ??
// // // //             item.currency ??
// // // //             item.value ??
// // // //             item.code ??
// // // //             value;

// // // //           if (!value) {
// // // //             return null;
// // // //           }

// // // //           return {
// // // //             value:
// // // //               String(value),
// // // //             label:
// // // //               String(label),
// // // //           };
// // // //         }

// // // //         return null;
// // // //       })
// // // //       .filter(Boolean);
// // // //   }

// // // //   if (
// // // //     typeof rawCurrencies === "object"
// // // //   ) {
// // // //     const directValue =
// // // //       rawCurrencies.currency_code ??
// // // //       rawCurrencies.currencyCode ??
// // // //       rawCurrencies.currency ??
// // // //       rawCurrencies.value ??
// // // //       rawCurrencies.code ??
// // // //       rawCurrencies.id;

// // // //     if (
// // // //       directValue !== null &&
// // // //       directValue !== undefined &&
// // // //       directValue !== ""
// // // //     ) {
// // // //       const value =
// // // //         String(directValue);

// // // //       const label =
// // // //         rawCurrencies.label ??
// // // //         rawCurrencies.name ??
// // // //         rawCurrencies.currency_name ??
// // // //         rawCurrencies.currency_code ??
// // // //         rawCurrencies.currencyCode ??
// // // //         rawCurrencies.currency ??
// // // //         rawCurrencies.value ??
// // // //         rawCurrencies.code ??
// // // //         value;

// // // //       return [
// // // //         {
// // // //           value,
// // // //           label:
// // // //             String(label),
// // // //         },
// // // //       ];
// // // //     }

// // // //     return Object.entries(
// // // //       rawCurrencies
// // // //     )
// // // //       .map(
// // // //         ([key, item]) => {
// // // //           if (
// // // //             item === null ||
// // // //             item === undefined ||
// // // //             item === ""
// // // //           ) {
// // // //             return {
// // // //               value:
// // // //                 String(key),
// // // //               label:
// // // //                 String(key),
// // // //             };
// // // //           }

// // // //           if (
// // // //             typeof item === "string" ||
// // // //             typeof item === "number"
// // // //           ) {
// // // //             return {
// // // //               value:
// // // //                 String(item),
// // // //               label:
// // // //                 String(item),
// // // //             };
// // // //           }

// // // //           if (
// // // //             typeof item === "object"
// // // //           ) {
// // // //             const value =
// // // //               item.currency_code ??
// // // //               item.currencyCode ??
// // // //               item.currency ??
// // // //               item.value ??
// // // //               item.code ??
// // // //               key;

// // // //             const label =
// // // //               item.label ??
// // // //               item.name ??
// // // //               item.currency_name ??
// // // //               item.currency_code ??
// // // //               item.currencyCode ??
// // // //               item.currency ??
// // // //               item.value ??
// // // //               item.code ??
// // // //               value;

// // // //             return {
// // // //               value:
// // // //                 String(value),
// // // //               label:
// // // //                 String(label),
// // // //             };
// // // //           }

// // // //           return {
// // // //             value:
// // // //               String(key),
// // // //             label:
// // // //               String(key),
// // // //           };
// // // //         }
// // // //       )
// // // //       .filter(
// // // //         (item) =>
// // // //           item.value !== ""
// // // //       );
// // // //   }

// // // //   return [];
// // // // }

// // // // /* =========================================================
// // // //    NORMALIZE API OPTIONS
// // // // ========================================================= */

// // // // function normalizeOpexFilterOptions(
// // // //   data = {}
// // // // ) {
// // // //   const payload =
// // // //     data?.data &&
// // // //     typeof data.data === "object" &&
// // // //     !Array.isArray(data.data)
// // // //       ? data.data
// // // //       : data;

// // // //   const rawCurrencies =
// // // //     payload?.reporting_currencies ??
// // // //     payload?.currencies ??
// // // //     payload?.currency_options ??
// // // //     payload?.ledger_currencies ??
// // // //     payload?.reporting_currency ??
// // // //     [];

// // // //   let currencies =
// // // //     normalizeCurrencyOptions(
// // // //       rawCurrencies
// // // //     );

// // // //   if (
// // // //     !currencies.length &&
// // // //     payload?.default_reporting_currency
// // // //   ) {
// // // //     currencies =
// // // //       normalizeCurrencyOptions(
// // // //         payload.default_reporting_currency
// // // //       );
// // // //   }

// // // //   const periods =
// // // //     Array.isArray(
// // // //       payload?.periods
// // // //     )
// // // //       ? payload.periods
// // // //       : [];

// // // //   return {
// // // //     legal_groups:
// // // //       Array.isArray(
// // // //         payload?.legal_groups
// // // //       )
// // // //         ? payload.legal_groups
// // // //         : [],

// // // //     legal_entities:
// // // //       Array.isArray(
// // // //         payload?.legal_entities
// // // //       )
// // // //         ? payload.legal_entities
// // // //         : [],

// // // //     parent_divisions:
// // // //       Array.isArray(
// // // //         payload?.parent_divisions
// // // //       )
// // // //         ? payload.parent_divisions
// // // //         : [],

// // // //     subdivisions:
// // // //       Array.isArray(
// // // //         payload?.subdivisions
// // // //       )
// // // //         ? payload.subdivisions
// // // //         : [],

// // // //     periods,

// // // //     years:
// // // //       normalizeYears(
// // // //         payload,
// // // //         periods
// // // //       ),

// // // //     reporting_currencies:
// // // //       currencies,

// // // //     currencies,

// // // //     compare_with:
// // // //       Array.isArray(
// // // //         payload?.compare_with
// // // //       )
// // // //         ? payload.compare_with
// // // //         : Array.isArray(
// // // //           payload?.compare_periods
// // // //         )
// // // //           ? payload.compare_periods
// // // //           : [],

// // // //     data_as_of:
// // // //       payload?.data_as_of ||
// // // //       null,

// // // //     default_reporting_currency:
// // // //       payload?.default_reporting_currency ||
// // // //       "AED",
// // // //   };
// // // // }

// // // // /* =========================================================
// // // //    CLOSED SELECT STYLE
// // // // ========================================================= */

// // // // const selectStyle = {
// // // //   appearance: "none",

// // // //   padding:
// // // //     "6px 28px 6px 10px",

// // // //   fontSize:
// // // //     "0.78rem",

// // // //   fontWeight: 500,

// // // //   color:
// // // //     "#334155",

// // // //   backgroundColor:
// // // //     "#fff",

// // // //   border:
// // // //     "1px solid #e2e8f0",

// // // //   borderRadius: 7,

// // // //   cursor:
// // // //     "pointer",

// // // //   outline:
// // // //     "none",

// // // //   width:
// // // //     "100%",

// // // //   height:
// // // //     34,

// // // //   boxSizing:
// // // //     "border-box",

// // // //   backgroundImage:
// // // //     "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",

// // // //   backgroundRepeat:
// // // //     "no-repeat",

// // // //   backgroundPosition:
// // // //     "right 8px center",
// // // // };

// // // // /* =========================================================
// // // //    FILTER FIELD
// // // // ========================================================= */

// // // // function FilterField({
// // // //   label,
// // // //   children,
// // // //   width,
// // // // }) {
// // // //   return (
// // // //     <div
// // // //       style={{
// // // //         display:
// // // //           "flex",

// // // //         flexDirection:
// // // //           "column",

// // // //         gap: 4,

// // // //         minWidth:
// // // //           width,

// // // //         width,

// // // //         flex:
// // // //           "0 0 auto",
// // // //       }}
// // // //     >
// // // //       <span
// // // //         style={{
// // // //           fontSize:
// // // //             "0.66rem",

// // // //           color:
// // // //             "#1e3a8a",

// // // //           fontWeight:
// // // //             700,

// // // //           letterSpacing:
// // // //             "-0.02em",

// // // //           whiteSpace:
// // // //             "nowrap",

// // // //           lineHeight:
// // // //             1.2,
// // // //         }}
// // // //       >
// // // //         {label}
// // // //       </span>

// // // //       {children}
// // // //     </div>
// // // //   );
// // // // }

// // // // /* =========================================================
// // // //    MULTI SELECT

// // // //    FIXES:
// // // //    1. Dropdown position remains stable after selection.
// // // //    2. Dropdown does not jump/recalculate on every value change.
// // // //    3. Click outside closes dropdown.
// // // //    4. Click inside does not close dropdown.
// // // //    5. Dropdown is fixed to viewport to avoid parent clipping.
// // // // ========================================================= */

// // // // function OpexMultiSelect({
// // // //   options = [],
// // // //   value = [],
// // // //   onChange,
// // // //   placeholder = "All",
// // // //   searchPlaceholder = "Search...",
// // // //   width = 128,
// // // // }) {
// // // //   const [
// // // //     open,
// // // //     setOpen,
// // // //   ] = useState(false);

// // // //   const [
// // // //     searchQuery,
// // // //     setSearchQuery,
// // // //   ] = useState("");

// // // //   const ref =
// // // //     useRef(null);

// // // //   const searchRef =
// // // //     useRef(null);

// // // //   const triggerRef =
// // // //     useRef(null);

// // // //   const dropdownRef =
// // // //     useRef(null);

// // // //   const [
// // // //     menuPosition,
// // // //     setMenuPosition,
// // // //   ] = useState({
// // // //     top: 0,
// // // //     left: 0,
// // // //     width: Math.max(
// // // //       width,
// // // //       225
// // // //     ),
// // // //     maxHeight: 300,
// // // //   });

// // // //   /* =======================================================
// // // //      UPDATE DROPDOWN POSITION

// // // //      IMPORTANT:
// // // //      This is deliberately independent from selected value.
// // // //      Therefore selecting a checkbox cannot make the dropdown
// // // //      jump, move, or become clipped.
// // // //   ======================================================= */

// // // //   const updateMenuPosition =
// // // //     () => {
// // // //       const trigger =
// // // //         triggerRef.current;

// // // //       if (!trigger) {
// // // //         return;
// // // //       }

// // // //       const rect =
// // // //         trigger.getBoundingClientRect();

// // // //       const menuWidth =
// // // //         Math.max(
// // // //           width,
// // // //           225
// // // //         );

// // // //       const viewportPadding =
// // // //         8;

// // // //       const preferredHeight =
// // // //         300;

// // // //       const spaceBelow =
// // // //         window.innerHeight -
// // // //         rect.bottom -
// // // //         viewportPadding;

// // // //       const spaceAbove =
// // // //         rect.top -
// // // //         viewportPadding;

// // // //       const openAbove =
// // // //         spaceBelow < 180 &&
// // // //         spaceAbove > spaceBelow;

// // // //       const availableHeight =
// // // //         Math.max(
// // // //           120,
// // // //           Math.min(
// // // //             preferredHeight,
// // // //             openAbove
// // // //               ? spaceAbove
// // // //               : spaceBelow
// // // //           )
// // // //         );

// // // //       const top =
// // // //         openAbove
// // // //           ? Math.max(
// // // //             viewportPadding,
// // // //             rect.top -
// // // //             availableHeight -
// // // //             3
// // // //           )
// // // //           : rect.bottom + 3;

// // // //       const maxLeft =
// // // //         Math.max(
// // // //           viewportPadding,
// // // //           window.innerWidth -
// // // //           menuWidth -
// // // //           viewportPadding
// // // //         );

// // // //       const left =
// // // //         Math.min(
// // // //           Math.max(
// // // //             rect.left,
// // // //             viewportPadding
// // // //           ),
// // // //           maxLeft
// // // //         );

// // // //       setMenuPosition({
// // // //         top,
// // // //         left,
// // // //         width: menuWidth,
// // // //         maxHeight:
// // // //           availableHeight,
// // // //       });
// // // //     };

// // // //   /* =======================================================
// // // //      POSITION ONLY WHEN OPEN / RESIZE / SCROLL

// // // //      IMPORTANT:
// // // //      DO NOT put `value` here.
// // // //   ======================================================= */

// // // //   useEffect(() => {
// // // //     if (!open) {
// // // //       return undefined;
// // // //     }

// // // //     updateMenuPosition();

// // // //     const handleViewportChange =
// // // //       () => {
// // // //         updateMenuPosition();
// // // //       };

// // // //     window.addEventListener(
// // // //       "resize",
// // // //       handleViewportChange
// // // //     );

// // // //     window.addEventListener(
// // // //       "scroll",
// // // //       handleViewportChange,
// // // //       true
// // // //     );

// // // //     return () => {
// // // //       window.removeEventListener(
// // // //         "resize",
// // // //         handleViewportChange
// // // //       );

// // // //       window.removeEventListener(
// // // //         "scroll",
// // // //         handleViewportChange,
// // // //         true
// // // //       );
// // // //     };
// // // //   }, [
// // // //     open,
// // // //     width,
// // // //   ]);

// // // //   /* =======================================================
// // // //      CLOSE ON OUTSIDE CLICK

// // // //      The dropdown itself is excluded from this check.
// // // //   ======================================================= */

// // // //   useEffect(() => {
// // // //     const handleOutside =
// // // //       (event) => {
// // // //         const target =
// // // //           event.target;

// // // //         const clickedTrigger =
// // // //           ref.current?.contains(
// // // //             target
// // // //           );

// // // //         const clickedDropdown =
// // // //           dropdownRef.current?.contains(
// // // //             target
// // // //           );

// // // //         if (
// // // //           !clickedTrigger &&
// // // //           !clickedDropdown
// // // //         ) {
// // // //           setOpen(false);
// // // //           setSearchQuery("");
// // // //         }
// // // //       };

// // // //     document.addEventListener(
// // // //       "mousedown",
// // // //       handleOutside
// // // //     );

// // // //     return () => {
// // // //       document.removeEventListener(
// // // //         "mousedown",
// // // //         handleOutside
// // // //       );
// // // //     };
// // // //   }, []);

// // // //   /* =======================================================
// // // //      FOCUS SEARCH
// // // //   ======================================================= */

// // // //   useEffect(() => {
// // // //     if (
// // // //       open &&
// // // //       searchRef.current
// // // //     ) {
// // // //       requestAnimationFrame(
// // // //         () => {
// // // //           searchRef.current?.focus();
// // // //         }
// // // //       );
// // // //     }

// // // //     if (!open) {
// // // //       setSearchQuery("");
// // // //     }
// // // //   }, [open]);

// // // //   /* =======================================================
// // // //      NORMALIZE OPTIONS
// // // //   ======================================================= */

// // // //   const normalized =
// // // //     (options || [])
// // // //       .map((option) => {
// // // //         if (
// // // //           option === null ||
// // // //           option === undefined
// // // //         ) {
// // // //           return null;
// // // //         }

// // // //         if (
// // // //           typeof option === "string" ||
// // // //           typeof option === "number"
// // // //         ) {
// // // //           return {
// // // //             id:
// // // //               String(option),

// // // //             name:
// // // //               String(option),
// // // //           };
// // // //         }

// // // //         const id =
// // // //           option.value !==
// // // //             undefined
// // // //             ? option.value
// // // //             : option.id !==
// // // //               undefined
// // // //               ? option.id
// // // //               : option.code !==
// // // //                 undefined
// // // //                 ? option.code
// // // //                 : "";

// // // //         const name =
// // // //           option.label !==
// // // //             undefined
// // // //             ? option.label
// // // //             : option.name !==
// // // //               undefined
// // // //               ? option.name
// // // //               : option.period_name !==
// // // //                 undefined
// // // //                 ? option.period_name
// // // //                 : String(id);

// // // //         if (
// // // //           id === null ||
// // // //           id === undefined ||
// // // //           id === ""
// // // //         ) {
// // // //           return null;
// // // //         }

// // // //         return {
// // // //           id:
// // // //             String(id),

// // // //           name:
// // // //             String(name),
// // // //         };
// // // //       })
// // // //       .filter(Boolean);

// // // //   const currentValues =
// // // //     Array.isArray(value)
// // // //       ? value.map(String)
// // // //       : [];

// // // //   /* =======================================================
// // // //      SEARCH
// // // //   ======================================================= */

// // // //   const query =
// // // //     searchQuery
// // // //       .trim()
// // // //       .toLowerCase();

// // // //   const visibleOptions =
// // // //     query
// // // //       ? normalized.filter(
// // // //         (option) =>
// // // //           option.name
// // // //             .toLowerCase()
// // // //             .includes(query) ||
// // // //           option.id
// // // //             .toLowerCase()
// // // //             .includes(query)
// // // //       )
// // // //       : normalized;

// // // //   /* =======================================================
// // // //      DISPLAY
// // // //   ======================================================= */

// // // //   const isAll =
// // // //     currentValues.length === 0;

// // // //   const isAllSelected =
// // // //     normalized.length > 0 &&
// // // //     currentValues.length ===
// // // //       normalized.length &&
// // // //     normalized.every(
// // // //       (option) =>
// // // //         currentValues.includes(
// // // //           option.id
// // // //         )
// // // //     );

// // // //   const selectedOptions =
// // // //     normalized.filter(
// // // //       (option) =>
// // // //         currentValues.includes(
// // // //           option.id
// // // //         )
// // // //     );

// // // //   const displayText =
// // // //     isAll
// // // //       ? placeholder
// // // //       : isAllSelected
// // // //         ? "All"
// // // //         : selectedOptions.length ===
// // // //           1
// // // //           ? selectedOptions[0]
// // // //             .name
// // // //           : `${selectedOptions.length} selected`;

// // // //   /* =======================================================
// // // //      TOGGLE VALUE

// // // //      IMPORTANT:
// // // //      Dropdown remains OPEN after selection.
// // // //      This allows multi-select without reopening.
// // // //   ======================================================= */

// // // //   const toggleValue =
// // // //     (id) => {
// // // //       const stringId =
// // // //         String(id);

// // // //       if (
// // // //         currentValues.includes(
// // // //           stringId
// // // //         )
// // // //       ) {
// // // //         onChange?.(
// // // //           currentValues.filter(
// // // //             (item) =>
// // // //               item !==
// // // //               stringId
// // // //           )
// // // //         );
// // // //       } else {
// // // //         onChange?.([
// // // //           ...currentValues,
// // // //           stringId,
// // // //         ]);
// // // //       }

// // // //       /*
// // // //        * DO NOT close dropdown here.
// // // //        * User can continue selecting values.
// // // //        */
// // // //     };

// // // //   /* =======================================================
// // // //      SELECT ALL
// // // //   ======================================================= */

// // // //   const handleSelectAll =
// // // //     () => {
// // // //       onChange?.(
// // // //         normalized.map(
// // // //           (option) =>
// // // //             option.id
// // // //         )
// // // //       );
// // // //     };

// // // //   /* =======================================================
// // // //      CLEAR
// // // //   ======================================================= */

// // // //   const handleClear =
// // // //     () => {
// // // //       onChange?.([]);
// // // //     };

// // // //   /* =======================================================
// // // //      RENDER
// // // //   ======================================================= */

// // // //   return (
// // // //     <div
// // // //       ref={ref}
// // // //       style={{
// // // //         position:
// // // //           "relative",

// // // //         width,
// // // //       }}
// // // //     >
// // // //       {/* =================================================
// // // //           CLOSED TRIGGER
// // // //       ================================================= */}

// // // //       <button
// // // //         ref={triggerRef}
// // // //         type="button"
// // // //         onClick={() =>
// // // //           setOpen(
// // // //             (previous) =>
// // // //               !previous
// // // //           )
// // // //         }
// // // //         style={{
// // // //           ...selectStyle,

// // // //           textAlign:
// // // //             "left",

// // // //           overflow:
// // // //             "hidden",

// // // //           textOverflow:
// // // //             "ellipsis",

// // // //           whiteSpace:
// // // //             "nowrap",
// // // //         }}
// // // //         title={
// // // //           displayText
// // // //         }
// // // //       >
// // // //         {displayText}
// // // //       </button>

// // // //       {/* =================================================
// // // //           DROPDOWN
// // // //       ================================================= */}

// // // //       {open && (
// // // //         <div
// // // //           ref={dropdownRef}
// // // //           onMouseDown={(event) => {
// // // //             /*
// // // //              * Keep clicks inside the dropdown from
// // // //              * being interpreted as outside clicks.
// // // //              */
// // // //             event.stopPropagation();
// // // //           }}
// // // //           style={{
// // // //             position:
// // // //               "fixed",

// // // //             top:
// // // //               menuPosition.top,

// // // //             left:
// // // //               menuPosition.left,

// // // //             width:
// // // //               menuPosition.width,

// // // //             maxHeight:
// // // //               menuPosition.maxHeight,

// // // //             overflowY:
// // // //               "auto",

// // // //             overflowX:
// // // //               "hidden",

// // // //             background:
// // // //               "#fff",

// // // //             border:
// // // //               "1px solid #e2e8f0",

// // // //             borderRadius:
// // // //               7,

// // // //             boxShadow:
// // // //               "0 8px 22px rgba(15,23,42,0.14)",

// // // //             zIndex:
// // // //               99999,

// // // //             padding:
// // // //               6,

// // // //             boxSizing:
// // // //               "border-box",

// // // //             scrollbarWidth:
// // // //               "thin",

// // // //             scrollbarColor:
// // // //               "#64748b #f1f5f9",
// // // //           }}
// // // //         >
// // // //           {/* =================================================
// // // //               SEARCH
// // // //           ================================================= */}

// // // //           <div
// // // //             style={{
// // // //               position:
// // // //                 "relative",

// // // //               marginBottom:
// // // //                 4,
// // // //             }}
// // // //           >
// // // //             <Search
// // // //               size={13}
// // // //               style={{
// // // //                 position:
// // // //                   "absolute",

// // // //                 left: 8,

// // // //                 top: 8,

// // // //                 color:
// // // //                   "#94a3b8",

// // // //                 pointerEvents:
// // // //                   "none",
// // // //               }}
// // // //             />

// // // //             <input
// // // //               ref={searchRef}
// // // //               type="text"
// // // //               value={
// // // //                 searchQuery
// // // //               }
// // // //               onChange={(
// // // //                 event
// // // //               ) =>
// // // //                 setSearchQuery(
// // // //                   event.target
// // // //                     .value
// // // //                 )
// // // //               }
// // // //               placeholder={
// // // //                 searchPlaceholder
// // // //               }
// // // //               onMouseDown={(
// // // //                 event
// // // //               ) => {
// // // //                 event.stopPropagation();
// // // //               }}
// // // //               style={{
// // // //                 width:
// // // //                   "100%",

// // // //                 height:
// // // //                   30,

// // // //                 boxSizing:
// // // //                   "border-box",

// // // //                 border:
// // // //                   "1px solid #dbe3ef",

// // // //                 borderRadius:
// // // //                   6,

// // // //                 padding:
// // // //                   "0 8px 0 26px",

// // // //                 outline:
// // // //                   "none",

// // // //                 fontSize:
// // // //                   "0.72rem",

// // // //                 color:
// // // //                   "#334155",

// // // //                 background:
// // // //                   "#fff",
// // // //               }}
// // // //             />
// // // //           </div>

// // // //           {/* =================================================
// // // //               SELECT ALL / CLEAR
// // // //           ================================================= */}

// // // //           <div
// // // //             style={{
// // // //               display:
// // // //                 "flex",

// // // //               alignItems:
// // // //                 "center",

// // // //               justifyContent:
// // // //                 "space-between",

// // // //               height:
// // // //                 25,

// // // //               padding:
// // // //                 "0 6px",

// // // //               marginBottom:
// // // //                 1,
// // // //             }}
// // // //           >
// // // //             <button
// // // //               type="button"
// // // //               onMouseDown={(
// // // //                 event
// // // //               ) => {
// // // //                 event.stopPropagation();
// // // //               }}
// // // //               onClick={
// // // //                 handleSelectAll
// // // //               }
// // // //               style={{
// // // //                 border:
// // // //                   "none",

// // // //                 background:
// // // //                   "transparent",

// // // //                 padding: 0,

// // // //                 margin: 0,

// // // //                 cursor:
// // // //                   "pointer",

// // // //                 fontSize:
// // // //                   "0.68rem",

// // // //                 lineHeight:
// // // //                   "18px",

// // // //                 fontWeight:
// // // //                   600,

// // // //                 color:
// // // //                   "#4f46e5",
// // // //               }}
// // // //             >
// // // //               Select All
// // // //             </button>

// // // //             <button
// // // //               type="button"
// // // //               onMouseDown={(
// // // //                 event
// // // //               ) => {
// // // //                 event.stopPropagation();
// // // //               }}
// // // //               onClick={
// // // //                 handleClear
// // // //               }
// // // //               style={{
// // // //                 border:
// // // //                   "none",

// // // //                 background:
// // // //                   "transparent",

// // // //                 padding: 0,

// // // //                 margin: 0,

// // // //                 cursor:
// // // //                   "pointer",

// // // //                 fontSize:
// // // //                   "0.68rem",

// // // //                 lineHeight:
// // // //                   "18px",

// // // //                 fontWeight:
// // // //                   500,

// // // //                 color:
// // // //                   "#64748b",
// // // //               }}
// // // //             >
// // // //               Clear
// // // //             </button>
// // // //           </div>

// // // //           {/* =================================================
// // // //               VALUES
// // // //           ================================================= */}

// // // //           {visibleOptions.map(
// // // //             (option) => {
// // // //               const checked =
// // // //                 currentValues.includes(
// // // //                   option.id
// // // //                 );

// // // //               return (
// // // //                 <label
// // // //                   key={
// // // //                     option.id
// // // //                   }
// // // //                   onMouseDown={(
// // // //                     event
// // // //                   ) => {
// // // //                     event.stopPropagation();
// // // //                   }}
// // // //                   style={{
// // // //                     display:
// // // //                       "flex",

// // // //                     alignItems:
// // // //                       "center",

// // // //                     gap: 6,

// // // //                     width:
// // // //                       "100%",

// // // //                     height:
// // // //                       27,

// // // //                     minHeight:
// // // //                       27,

// // // //                     boxSizing:
// // // //                       "border-box",

// // // //                     padding:
// // // //                       "2px 6px",

// // // //                     margin:
// // // //                       0,

// // // //                     borderRadius:
// // // //                       4,

// // // //                     cursor:
// // // //                       "pointer",

// // // //                     fontSize:
// // // //                       "0.72rem",

// // // //                     lineHeight:
// // // //                       "18px",

// // // //                     fontWeight:
// // // //                       checked
// // // //                         ? 600
// // // //                         : 500,

// // // //                     color:
// // // //                       "#334155",

// // // //                     background:
// // // //                       checked
// // // //                         ? "#f5f7ff"
// // // //                         : "#fff",
// // // //                   }}
// // // //                 >
// // // //                   <input
// // // //                     type="checkbox"
// // // //                     checked={
// // // //                       checked
// // // //                     }
// // // //                     onChange={() =>
// // // //                       toggleValue(
// // // //                         option.id
// // // //                       )
// // // //                     }
// // // //                     onClick={(
// // // //                       event
// // // //                     ) => {
// // // //                       event.stopPropagation();
// // // //                     }}
// // // //                     style={{
// // // //                       margin:
// // // //                         0,

// // // //                       padding:
// // // //                         0,

// // // //                       width:
// // // //                         14,

// // // //                       height:
// // // //                         14,

// // // //                       flexShrink:
// // // //                         0,

// // // //                       accentColor:
// // // //                         "#4f46e5",

// // // //                       cursor:
// // // //                         "pointer",
// // // //                     }}
// // // //                   />

// // // //                   <span
// // // //                     style={{
// // // //                       display:
// // // //                         "block",

// // // //                       minWidth:
// // // //                         0,

// // // //                       overflow:
// // // //                         "hidden",

// // // //                       textOverflow:
// // // //                         "ellipsis",

// // // //                       whiteSpace:
// // // //                         "nowrap",

// // // //                       lineHeight:
// // // //                         "18px",
// // // //                     }}
// // // //                     title={
// // // //                       option.name
// // // //                     }
// // // //                   >
// // // //                     {
// // // //                       option.name
// // // //                     }
// // // //                   </span>
// // // //                 </label>
// // // //               );
// // // //             }
// // // //           )}

// // // //           {!visibleOptions.length && (
// // // //             <div
// // // //               style={{
// // // //                 padding:
// // // //                   "10px 6px",

// // // //                 textAlign:
// // // //                   "center",

// // // //                 fontSize:
// // // //                   "0.7rem",

// // // //                 color:
// // // //                   "#94a3b8",
// // // //               }}
// // // //             >
// // // //               No options found
// // // //             </div>
// // // //           )}
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }

// // // // /* =========================================================
// // // //    SINGLE SELECT
// // // // ========================================================= */

// // // // function OpexSingleSelect({
// // // //   options = [],
// // // //   value = "",
// // // //   onChange,
// // // //   placeholder = "Select",
// // // //   searchPlaceholder = "Search...",
// // // //   width = 128,
// // // //   searchable = true,
// // // // }) {
// // // //   const [
// // // //     open,
// // // //     setOpen,
// // // //   ] = useState(false);

// // // //   const [
// // // //     searchQuery,
// // // //     setSearchQuery,
// // // //   ] = useState("");

// // // //   const ref =
// // // //     useRef(null);

// // // //   const searchRef =
// // // //     useRef(null);

// // // //   const triggerRef =
// // // //     useRef(null);

// // // //   const dropdownRef =
// // // //     useRef(null);

// // // //   const [
// // // //     menuPosition,
// // // //     setMenuPosition,
// // // //   ] = useState({
// // // //     top: 0,
// // // //     left: 0,
// // // //     width: Math.max(
// // // //       width,
// // // //       225
// // // //     ),
// // // //     maxHeight: 300,
// // // //   });

// // // //   /* =======================================================
// // // //      POSITION
// // // //   ======================================================= */

// // // //   const updateMenuPosition =
// // // //     () => {
// // // //       const trigger =
// // // //         triggerRef.current;

// // // //       if (!trigger) {
// // // //         return;
// // // //       }

// // // //       const rect =
// // // //         trigger.getBoundingClientRect();

// // // //       const menuWidth =
// // // //         Math.max(
// // // //           width,
// // // //           225
// // // //         );

// // // //       const viewportPadding =
// // // //         8;

// // // //       const preferredHeight =
// // // //         300;

// // // //       const spaceBelow =
// // // //         window.innerHeight -
// // // //         rect.bottom -
// // // //         viewportPadding;

// // // //       const spaceAbove =
// // // //         rect.top -
// // // //         viewportPadding;

// // // //       const openAbove =
// // // //         spaceBelow < 180 &&
// // // //         spaceAbove > spaceBelow;

// // // //       const availableHeight =
// // // //         Math.max(
// // // //           120,
// // // //           Math.min(
// // // //             preferredHeight,
// // // //             openAbove
// // // //               ? spaceAbove
// // // //               : spaceBelow
// // // //           )
// // // //         );

// // // //       const top =
// // // //         openAbove
// // // //           ? Math.max(
// // // //             viewportPadding,
// // // //             rect.top -
// // // //             availableHeight -
// // // //             3
// // // //           )
// // // //           : rect.bottom + 3;

// // // //       const maxLeft =
// // // //         Math.max(
// // // //           viewportPadding,
// // // //           window.innerWidth -
// // // //           menuWidth -
// // // //           viewportPadding
// // // //         );

// // // //       const left =
// // // //         Math.min(
// // // //           Math.max(
// // // //             rect.left,
// // // //             viewportPadding
// // // //           ),
// // // //           maxLeft
// // // //         );

// // // //       setMenuPosition({
// // // //         top,
// // // //         left,
// // // //         width:
// // // //           menuWidth,
// // // //         maxHeight:
// // // //           availableHeight,
// // // //       });
// // // //     };

// // // //   /* =======================================================
// // // //      POSITION ONLY WHEN OPEN
// // // //   ======================================================= */

// // // //   useEffect(() => {
// // // //     if (!open) {
// // // //       return undefined;
// // // //     }

// // // //     updateMenuPosition();

// // // //     const handleViewportChange =
// // // //       () => {
// // // //         updateMenuPosition();
// // // //       };

// // // //     window.addEventListener(
// // // //       "resize",
// // // //       handleViewportChange
// // // //     );

// // // //     window.addEventListener(
// // // //       "scroll",
// // // //       handleViewportChange,
// // // //       true
// // // //     );

// // // //     return () => {
// // // //       window.removeEventListener(
// // // //         "resize",
// // // //         handleViewportChange
// // // //       );

// // // //       window.removeEventListener(
// // // //         "scroll",
// // // //         handleViewportChange,
// // // //         true
// // // //       );
// // // //     };
// // // //   }, [
// // // //     open,
// // // //     width,
// // // //   ]);

// // // //   /* =======================================================
// // // //      CLOSE OUTSIDE
// // // //   ======================================================= */

// // // //   useEffect(() => {
// // // //     const handleOutside =
// // // //       (event) => {
// // // //         const target =
// // // //           event.target;

// // // //         const clickedTrigger =
// // // //           ref.current?.contains(
// // // //             target
// // // //           );

// // // //         const clickedDropdown =
// // // //           dropdownRef.current?.contains(
// // // //             target
// // // //           );

// // // //         if (
// // // //           !clickedTrigger &&
// // // //           !clickedDropdown
// // // //         ) {
// // // //           setOpen(false);
// // // //           setSearchQuery("");
// // // //         }
// // // //       };

// // // //     document.addEventListener(
// // // //       "mousedown",
// // // //       handleOutside
// // // //     );

// // // //     return () => {
// // // //       document.removeEventListener(
// // // //         "mousedown",
// // // //         handleOutside
// // // //       );
// // // //     };
// // // //   }, []);

// // // //   /* =======================================================
// // // //      SEARCH FOCUS
// // // //   ======================================================= */

// // // //   useEffect(() => {
// // // //     if (
// // // //       open &&
// // // //       searchable &&
// // // //       searchRef.current
// // // //     ) {
// // // //       requestAnimationFrame(
// // // //         () => {
// // // //           searchRef.current?.focus();
// // // //         }
// // // //       );
// // // //     }

// // // //     if (!open) {
// // // //       setSearchQuery("");
// // // //     }
// // // //   }, [
// // // //     open,
// // // //     searchable,
// // // //   ]);

// // // //   /* =======================================================
// // // //      NORMALIZE
// // // //   ======================================================= */

// // // //   const normalized =
// // // //     (options || [])
// // // //       .map((option) => {
// // // //         if (
// // // //           option === null ||
// // // //           option === undefined
// // // //         ) {
// // // //           return null;
// // // //         }

// // // //         if (
// // // //           typeof option === "string" ||
// // // //           typeof option === "number"
// // // //         ) {
// // // //           return {
// // // //             id:
// // // //               String(option),

// // // //             name:
// // // //               String(option),
// // // //           };
// // // //         }

// // // //         const id =
// // // //           option.value !==
// // // //             undefined
// // // //             ? option.value
// // // //             : option.id !==
// // // //               undefined
// // // //               ? option.id
// // // //               : option.code !==
// // // //                 undefined
// // // //                 ? option.code
// // // //                 : "";

// // // //         const name =
// // // //           option.label !==
// // // //             undefined
// // // //             ? option.label
// // // //             : option.name !==
// // // //               undefined
// // // //               ? option.name
// // // //               : option.period_name !==
// // // //                 undefined
// // // //                 ? option.period_name
// // // //                 : String(id);

// // // //         if (
// // // //           id === null ||
// // // //           id === undefined ||
// // // //           id === ""
// // // //         ) {
// // // //           return null;
// // // //         }

// // // //         return {
// // // //           id:
// // // //             String(id),

// // // //           name:
// // // //             String(name),
// // // //         };
// // // //       })
// // // //       .filter(Boolean);

// // // //   const currentValue =
// // // //     value === null ||
// // // //     value === undefined
// // // //       ? ""
// // // //       : String(value);

// // // //   const currentOption =
// // // //     normalized.find(
// // // //       (option) =>
// // // //         option.id ===
// // // //         currentValue
// // // //     );

// // // //   const query =
// // // //     searchQuery
// // // //       .trim()
// // // //       .toLowerCase();

// // // //   const visibleOptions =
// // // //     searchable && query
// // // //       ? normalized.filter(
// // // //         (option) =>
// // // //           option.name
// // // //             .toLowerCase()
// // // //             .includes(query) ||
// // // //           option.id
// // // //             .toLowerCase()
// // // //             .includes(query)
// // // //       )
// // // //       : normalized;

// // // //   const displayText =
// // // //     currentOption?.name ||
// // // //     placeholder;

// // // //   /* =======================================================
// // // //      SELECT
// // // //   ======================================================= */

// // // //   const handleSelect =
// // // //     (option) => {
// // // //       onChange?.(
// // // //         option.id
// // // //       );

// // // //       setOpen(false);
// // // //       setSearchQuery("");
// // // //     };

// // // //   /* =======================================================
// // // //      RENDER
// // // //   ======================================================= */

// // // //   return (
// // // //     <div
// // // //       ref={ref}
// // // //       style={{
// // // //         position:
// // // //           "relative",

// // // //         width,
// // // //       }}
// // // //     >
// // // //       <button
// // // //         ref={triggerRef}
// // // //         type="button"
// // // //         onClick={() =>
// // // //           setOpen(
// // // //             (previous) =>
// // // //               !previous
// // // //           )
// // // //         }
// // // //         style={{
// // // //           ...selectStyle,

// // // //           textAlign:
// // // //             "left",

// // // //           overflow:
// // // //             "hidden",

// // // //           textOverflow:
// // // //             "ellipsis",

// // // //           whiteSpace:
// // // //             "nowrap",
// // // //         }}
// // // //         title={
// // // //           displayText
// // // //         }
// // // //       >
// // // //         {displayText}
// // // //       </button>

// // // //       {open && (
// // // //         <div
// // // //           ref={dropdownRef}
// // // //           onMouseDown={(event) => {
// // // //             event.stopPropagation();
// // // //           }}
// // // //           style={{
// // // //             position:
// // // //               "fixed",

// // // //             top:
// // // //               menuPosition.top,

// // // //             left:
// // // //               menuPosition.left,

// // // //             width:
// // // //               menuPosition.width,

// // // //             maxHeight:
// // // //               menuPosition.maxHeight,

// // // //             overflowY:
// // // //               "auto",

// // // //             overflowX:
// // // //               "hidden",

// // // //             background:
// // // //               "#fff",

// // // //             border:
// // // //               "1px solid #e2e8f0",

// // // //             borderRadius:
// // // //               7,

// // // //             boxShadow:
// // // //               "0 8px 22px rgba(15,23,42,0.14)",

// // // //             zIndex:
// // // //               99999,

// // // //             padding:
// // // //               6,

// // // //             boxSizing:
// // // //               "border-box",

// // // //             scrollbarWidth:
// // // //               "thin",

// // // //             scrollbarColor:
// // // //               "#64748b #f1f5f9",
// // // //           }}
// // // //         >
// // // //           {searchable && (
// // // //             <div
// // // //               style={{
// // // //                 position:
// // // //                   "relative",

// // // //                 marginBottom:
// // // //                   4,
// // // //               }}
// // // //             >
// // // //               <Search
// // // //                 size={13}
// // // //                 style={{
// // // //                   position:
// // // //                     "absolute",

// // // //                   left: 8,

// // // //                   top: 8,

// // // //                   color:
// // // //                     "#94a3b8",

// // // //                   pointerEvents:
// // // //                     "none",
// // // //                 }}
// // // //               />

// // // //               <input
// // // //                 ref={searchRef}
// // // //                 type="text"
// // // //                 value={
// // // //                   searchQuery
// // // //                 }
// // // //                 onChange={(
// // // //                   event
// // // //                 ) =>
// // // //                   setSearchQuery(
// // // //                     event.target
// // // //                       .value
// // // //                   )
// // // //                 }
// // // //                 placeholder={
// // // //                   searchPlaceholder
// // // //                 }
// // // //                 onMouseDown={(
// // // //                   event
// // // //                 ) => {
// // // //                   event.stopPropagation();
// // // //                 }}
// // // //                 style={{
// // // //                   width:
// // // //                     "100%",

// // // //                   height:
// // // //                     30,

// // // //                   boxSizing:
// // // //                     "border-box",

// // // //                   border:
// // // //                     "1px solid #dbe3ef",

// // // //                   borderRadius:
// // // //                     6,

// // // //                   padding:
// // // //                     "0 8px 0 26px",

// // // //                   outline:
// // // //                     "none",

// // // //                   fontSize:
// // // //                     "0.72rem",

// // // //                   color:
// // // //                     "#334155",

// // // //                   background:
// // // //                     "#fff",
// // // //                 }}
// // // //               />
// // // //             </div>
// // // //           )}

// // // //           {visibleOptions.map(
// // // //             (option) => {
// // // //               const selected =
// // // //                 option.id ===
// // // //                 currentValue;

// // // //               return (
// // // //                 <button
// // // //                   key={
// // // //                     option.id
// // // //                   }
// // // //                   type="button"
// // // //                   onMouseDown={(
// // // //                     event
// // // //                   ) => {
// // // //                     event.stopPropagation();
// // // //                   }}
// // // //                   onClick={() =>
// // // //                     handleSelect(
// // // //                       option
// // // //                     )
// // // //                   }
// // // //                   style={{
// // // //                     width:
// // // //                       "100%",

// // // //                     height:
// // // //                       27,

// // // //                     minHeight:
// // // //                       27,

// // // //                     boxSizing:
// // // //                       "border-box",

// // // //                     border:
// // // //                       "none",

// // // //                     background:
// // // //                       selected
// // // //                         ? "#f5f7ff"
// // // //                         : "#fff",

// // // //                     textAlign:
// // // //                       "left",

// // // //                     padding:
// // // //                       "2px 8px",

// // // //                     margin:
// // // //                       0,

// // // //                     borderRadius:
// // // //                       4,

// // // //                     cursor:
// // // //                       "pointer",

// // // //                     fontSize:
// // // //                       "0.72rem",

// // // //                     lineHeight:
// // // //                       "18px",

// // // //                     fontWeight:
// // // //                       selected
// // // //                         ? 600
// // // //                         : 500,

// // // //                     color:
// // // //                       "#334155",

// // // //                     overflow:
// // // //                       "hidden",

// // // //                     textOverflow:
// // // //                       "ellipsis",

// // // //                     whiteSpace:
// // // //                       "nowrap",
// // // //                   }}
// // // //                   title={
// // // //                     option.name
// // // //                   }
// // // //                 >
// // // //                   {
// // // //                     option.name
// // // //                   }
// // // //                 </button>
// // // //               );
// // // //             }
// // // //           )}

// // // //           {!visibleOptions.length && (
// // // //             <div
// // // //               style={{
// // // //                 padding:
// // // //                   "10px 6px",

// // // //                 textAlign:
// // // //                   "center",

// // // //                 fontSize:
// // // //                   "0.7rem",

// // // //                 color:
// // // //                   "#94a3b8",
// // // //               }}
// // // //             >
// // // //               No options found
// // // //             </div>
// // // //           )}
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }

// // // // /* =========================================================
// // // //    OPEX FILTERS
// // // // ========================================================= */

// // // // export default function OpexFilters({
// // // //   filterOptions = {},
// // // //   selectedFilters:
// // // //     externalSelectedFilters,
// // // //   onChange,
// // // //   onApply,
// // // //   onReset,
// // // // }) {
// // // //   const [
// // // //     opexFilterOptions,
// // // //     setOpexFilterOptions,
// // // //   ] = useState(
// // // //     normalizeOpexFilterOptions(
// // // //       filterOptions
// // // //     )
// // // //   );

// // // //   const [
// // // //     selectedFilters,
// // // //     setSelectedFilters,
// // // //   ] = useState(() => {
// // // //     const normalized =
// // // //       normalizeOpexFilterOptions(
// // // //         filterOptions
// // // //       );

// // // //     const years =
// // // //       normalized.years ||
// // // //       [];

// // // //     const periods =
// // // //       normalized.periods ||
// // // //       [];

// // // //     const firstYear =
// // // //       years.length
// // // //         ? getOptionValue(
// // // //           years[0]
// // // //         )
// // // //         : "";

// // // //     const latestPeriod =
// // // //       periods.length
// // // //         ? getLatestPeriod(
// // // //           periods
// // // //         )
// // // //         : "";

// // // //     return {
// // // //       ...DEFAULT_FILTERS,

// // // //       ...(externalSelectedFilters ||
// // // //         {}),

// // // //       year:
// // // //         externalSelectedFilters?.year ||
// // // //         (firstYear
// // // //           ? String(
// // // //             firstYear
// // // //           )
// // // //           : ""),

// // // //       period:
// // // //         externalSelectedFilters?.period ||
// // // //         (latestPeriod
// // // //           ? [
// // // //             String(
// // // //               latestPeriod
// // // //             ),
// // // //           ]
// // // //           : []),

// // // //       reporting_currency:
// // // //         externalSelectedFilters?.reporting_currency ||
// // // //         normalized.default_reporting_currency ||
// // // //         "AED",
// // // //     };
// // // //   });

// // // //   const [
// // // //     loading,
// // // //     setLoading,
// // // //   ] = useState(false);

// // // //   /* =======================================================
// // // //      SYNC EXTERNAL FILTERS
// // // //   ======================================================= */

// // // //   useEffect(() => {
// // // //     if (
// // // //       !externalSelectedFilters
// // // //     ) {
// // // //       return;
// // // //     }

// // // //     setSelectedFilters(
// // // //       (previous) => ({
// // // //         ...previous,
// // // //         ...externalSelectedFilters,
// // // //       })
// // // //     );
// // // //   }, [
// // // //     externalSelectedFilters,
// // // //   ]);

// // // //   /* =======================================================
// // // //      LOAD FILTER OPTIONS
// // // //   ======================================================= */

// // // //   const loadOpexFilterOptions =
// // // //     async (
// // // //       currentFilters = {},
// // // //       preserveOptionKey = null
// // // //     ) => {
// // // //       try {
// // // //         setLoading(true);

// // // //         const response =
// // // //           await getOpexFilterOptions(
// // // //             currentFilters
// // // //           );

// // // //         const normalized =
// // // //           normalizeOpexFilterOptions(
// // // //             response
// // // //           );

// // // //         setOpexFilterOptions(
// // // //           (previous) => {
// // // //             if (
// // // //               preserveOptionKey
// // // //             ) {
// // // //               return {
// // // //                 ...previous,
// // // //                 ...normalized,

// // // //                 [preserveOptionKey]:
// // // //                   normalized[
// // // //                     preserveOptionKey
// // // //                   ] ??
// // // //                   previous[
// // // //                     preserveOptionKey
// // // //                   ] ??
// // // //                   [],
// // // //               };
// // // //             }

// // // //             return {
// // // //               ...previous,
// // // //               ...normalized,
// // // //             };
// // // //           }
// // // //         );

// // // //         return normalized;
// // // //       } catch (error) {
// // // //         console.error(
// // // //           "Failed to load OPEX filter options:",
// // // //           error
// // // //         );

// // // //         return null;
// // // //       } finally {
// // // //         setLoading(false);
// // // //       }
// // // //     };

// // // //   /* =======================================================
// // // //      INITIAL OPTIONS
// // // //   ======================================================= */

// // // //   useEffect(() => {
// // // //     void loadOpexFilterOptions(
// // // //       {}
// // // //     );
// // // //   }, []);

// // // //   /* =======================================================
// // // //      DEFAULT VALUES
// // // //   ======================================================= */

// // // //   useEffect(() => {
// // // //     if (
// // // //       !opexFilterOptions
// // // //     ) {
// // // //       return;
// // // //     }

// // // //     setSelectedFilters(
// // // //       (previous) => {
// // // //         const next = {
// // // //           ...previous,
// // // //         };

// // // //         if (
// // // //           !next.year &&
// // // //           opexFilterOptions
// // // //             .years?.length
// // // //         ) {
// // // //           next.year =
// // // //             String(
// // // //               getOptionValue(
// // // //                 opexFilterOptions
// // // //                   .years[0]
// // // //               )
// // // //             );
// // // //         }

// // // //         if (
// // // //           (!Array.isArray(
// // // //             next.period
// // // //           ) ||
// // // //             next.period.length ===
// // // //             0) &&
// // // //           opexFilterOptions
// // // //             .periods?.length
// // // //         ) {
// // // //           const latestPeriod =
// // // //             getLatestPeriod(
// // // //               opexFilterOptions
// // // //                 .periods
// // // //             );

// // // //           if (
// // // //             latestPeriod
// // // //           ) {
// // // //             next.period = [
// // // //               String(
// // // //                 latestPeriod
// // // //               ),
// // // //             ];
// // // //           }
// // // //         }

// // // //         if (
// // // //           !next.reporting_currency
// // // //         ) {
// // // //           next.reporting_currency =
// // // //             opexFilterOptions
// // // //               .default_reporting_currency ||
// // // //             "AED";
// // // //         }

// // // //         return next;
// // // //       }
// // // //     );
// // // //   }, [
// // // //     opexFilterOptions,
// // // //   ]);

// // // //   /* =======================================================
// // // //      FILTER CHANGE
// // // //   ======================================================= */

// // // //   const handleFilterChange = (
// // // //     key,
// // // //     value
// // // //   ) => {
// // // //     const nextFilters = {
// // // //       ...selectedFilters,
// // // //       [key]: value,
// // // //     };

// // // //     setSelectedFilters(
// // // //       nextFilters
// // // //     );

// // // //     /* -----------------------------------------------------
// // // //        Dependent dropdown mapping
// // // //     ----------------------------------------------------- */

// // // //     const optionKeyMap = {
// // // //       legal_group:
// // // //         "legal_entities",

// // // //       legal_entity:
// // // //         "parent_divisions",

// // // //       parent_division:
// // // //         "subdivisions",
// // // //     };

// // // //     const apiKeyMap = {
// // // //       legal_group:
// // // //         "legal_group_id",

// // // //       legal_entity:
// // // //         "legal_entity_id",

// // // //       parent_division:
// // // //         "parent_division_id",
// // // //     };

// // // //     const dependentKey =
// // // //       optionKeyMap[key];

// // // //     const apiKey =
// // // //       apiKeyMap[key];

// // // //     if (
// // // //       dependentKey &&
// // // //       apiKey
// // // //     ) {
// // // //       const apiFilters = {
// // // //         year:
// // // //           nextFilters.year ||
// // // //           undefined,

// // // //         period_name:
// // // //           nextFilters.period ||
// // // //           undefined,

// // // //         reporting_currency:
// // // //           nextFilters.reporting_currency ||
// // // //           "AED",

// // // //         [apiKey]:
// // // //           Array.isArray(value)
// // // //             ? value
// // // //             : value
// // // //               ? [value]
// // // //               : [],
// // // //       };

// // // //       /* ---------------------------------------------------
// // // //          Clear lower-level selections
// // // //       --------------------------------------------------- */

// // // //       const clearedFilters = {
// // // //         ...nextFilters,
// // // //       };

// // // //       if (
// // // //         key ===
// // // //         "legal_group"
// // // //       ) {
// // // //         clearedFilters.legal_entity =
// // // //           [];

// // // //         clearedFilters.parent_division =
// // // //           [];

// // // //         clearedFilters.subdivision =
// // // //           [];
// // // //       }

// // // //       if (
// // // //         key ===
// // // //         "legal_entity"
// // // //       ) {
// // // //         clearedFilters.parent_division =
// // // //           [];

// // // //         clearedFilters.subdivision =
// // // //           [];
// // // //       }

// // // //       if (
// // // //         key ===
// // // //         "parent_division"
// // // //       ) {
// // // //         clearedFilters.subdivision =
// // // //           [];
// // // //       }

// // // //       setSelectedFilters(
// // // //         clearedFilters
// // // //       );

// // // //       void loadOpexFilterOptions(
// // // //         apiFilters,
// // // //         dependentKey
// // // //       );
// // // //     }
// // // //   };

// // // //   /* =======================================================
// // // //      RESET
// // // //   ======================================================= */

// // // //   const handleReset = () => {
// // // //     const years =
// // // //       opexFilterOptions
// // // //         .years?.length
// // // //         ? opexFilterOptions.years
// // // //         : filterOptions?.years ||
// // // //         [];

// // // //     const periods =
// // // //       opexFilterOptions
// // // //         .periods?.length
// // // //         ? opexFilterOptions
// // // //           .periods
// // // //         : filterOptions?.periods ||
// // // //         [];

// // // //     const firstYear =
// // // //       years.length
// // // //         ? getOptionValue(
// // // //           years[0]
// // // //         )
// // // //         : "";

// // // //     const latestPeriod =
// // // //       periods.length
// // // //         ? getLatestPeriod(
// // // //           periods
// // // //         )
// // // //         : "";

// // // //     const resetFilters = {
// // // //       ...DEFAULT_FILTERS,

// // // //       legal_group: [],
// // // //       legal_entity: [],
// // // //       parent_division: [],
// // // //       subdivision: [],

// // // //       period:
// // // //         latestPeriod
// // // //           ? [
// // // //             String(
// // // //               latestPeriod
// // // //             ),
// // // //           ]
// // // //           : [],

// // // //       year:
// // // //         firstYear
// // // //           ? String(
// // // //             firstYear
// // // //           )
// // // //           : "",

// // // //       reporting_currency:
// // // //         opexFilterOptions
// // // //           .default_reporting_currency ||
// // // //         filterOptions
// // // //           ?.default_reporting_currency ||
// // // //         "AED",
// // // //     };

// // // //     setSelectedFilters(
// // // //       resetFilters
// // // //     );

// // // //     onChange?.(
// // // //       resetFilters
// // // //     );

// // // //     onReset?.();

// // // //     void loadOpexFilterOptions(
// // // //       {}
// // // //     );
// // // //   };

// // // //   const options = {
// // // //     ...filterOptions,
// // // //     ...opexFilterOptions,
// // // //   };

// // // //   /* =======================================================
// // // //      UI
// // // //   ======================================================= */

// // // //   return (
// // // //     <div
// // // //       className="card"
// // // //       style={{
// // // //         width:
// // // //           "100%",

// // // //         maxWidth:
// // // //           "100%",

// // // //         padding:
// // // //           "10px 16px",

// // // //         marginBottom:
// // // //           16,

// // // //         display:
// // // //           "flex",

// // // //         alignItems:
// // // //           "flex-end",

// // // //         gap:
// // // //           10,

// // // //         flexWrap:
// // // //           "wrap",

// // // //         boxSizing:
// // // //           "border-box",

// // // //         /*
// // // //          * IMPORTANT:
// // // //          * Dropdowns are fixed to the viewport,
// // // //          * therefore they will not be clipped by
// // // //          * this card.
// // // //          */
// // // //         overflow:
// // // //           "visible",

// // // //         position:
// // // //           "relative",

// // // //         zIndex:
// // // //           20,

// // // //         fontFamily:
// // // //           "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
// // // //       }}
// // // //     >
// // // //       {/* ===================================================
// // // //           LEGAL GROUP
// // // //       =================================================== */}

// // // //       <FilterField
// // // //         label="Legal Group"
// // // //         width={
// // // //           FIELD_WIDTHS.legal_group
// // // //         }
// // // //       >
// // // //         <OpexMultiSelect
// // // //           options={
// // // //             options.legal_groups ||
// // // //             []
// // // //           }
// // // //           value={
// // // //             selectedFilters
// // // //               .legal_group ||
// // // //             []
// // // //           }
// // // //           onChange={(value) =>
// // // //             handleFilterChange(
// // // //               "legal_group",
// // // //               value
// // // //             )
// // // //           }
// // // //           placeholder="All"
// // // //           searchPlaceholder="Search Legal Group"
// // // //           width={
// // // //             FIELD_WIDTHS.legal_group
// // // //           }
// // // //         />
// // // //       </FilterField>

// // // //       {/* ===================================================
// // // //           LEGAL ENTITY
// // // //       =================================================== */}

// // // //       <FilterField
// // // //         label="Legal Entity"
// // // //         width={
// // // //           FIELD_WIDTHS.legal_entity
// // // //         }
// // // //       >
// // // //         <OpexMultiSelect
// // // //           options={
// // // //             options.legal_entities ||
// // // //             []
// // // //           }
// // // //           value={
// // // //             selectedFilters
// // // //               .legal_entity ||
// // // //             []
// // // //           }
// // // //           onChange={(value) =>
// // // //             handleFilterChange(
// // // //               "legal_entity",
// // // //               value
// // // //             )
// // // //           }
// // // //           placeholder="All"
// // // //           searchPlaceholder="Search Legal Entity"
// // // //           width={
// // // //             FIELD_WIDTHS.legal_entity
// // // //           }
// // // //         />
// // // //       </FilterField>

// // // //       {/* ===================================================
// // // //           PARENT DIVISION
// // // //       =================================================== */}

// // // //       <FilterField
// // // //         label="Parent Division"
// // // //         width={
// // // //           FIELD_WIDTHS.parent_division
// // // //         }
// // // //       >
// // // //         <OpexMultiSelect
// // // //           options={
// // // //             options.parent_divisions ||
// // // //             []
// // // //           }
// // // //           value={
// // // //             selectedFilters
// // // //               .parent_division ||
// // // //             []
// // // //           }
// // // //           onChange={(value) =>
// // // //             handleFilterChange(
// // // //               "parent_division",
// // // //               value
// // // //             )
// // // //           }
// // // //           placeholder="All"
// // // //           searchPlaceholder="Search Parent Division"
// // // //           width={
// // // //             FIELD_WIDTHS.parent_division
// // // //           }
// // // //         />
// // // //       </FilterField>

// // // //       {/* ===================================================
// // // //           SUB-DIVISION
// // // //       =================================================== */}

// // // //       <FilterField
// // // //         label="Sub-Division"
// // // //         width={
// // // //           FIELD_WIDTHS.subdivision
// // // //         }
// // // //       >
// // // //         <OpexMultiSelect
// // // //           options={
// // // //             options.subdivisions ||
// // // //             []
// // // //           }
// // // //           value={
// // // //             selectedFilters
// // // //               .subdivision ||
// // // //             []
// // // //           }
// // // //           onChange={(value) =>
// // // //             handleFilterChange(
// // // //               "subdivision",
// // // //               value
// // // //             )
// // // //           }
// // // //           placeholder="All"
// // // //           searchPlaceholder="Search Sub-Division"
// // // //           width={
// // // //             FIELD_WIDTHS.subdivision
// // // //           }
// // // //         />
// // // //       </FilterField>

// // // //       {/* ===================================================
// // // //           YEAR
// // // //       =================================================== */}

// // // //       <FilterField
// // // //         label="Year"
// // // //         width={
// // // //           FIELD_WIDTHS.year
// // // //         }
// // // //       >
// // // //         <OpexSingleSelect
// // // //           options={
// // // //             options.years ||
// // // //             []
// // // //           }
// // // //           value={
// // // //             selectedFilters.year ||
// // // //             ""
// // // //           }
// // // //           onChange={(value) =>
// // // //             handleFilterChange(
// // // //               "year",
// // // //               value
// // // //             )
// // // //           }
// // // //           placeholder="Select Year"
// // // //           searchPlaceholder="Search Year"
// // // //           width={
// // // //             FIELD_WIDTHS.year
// // // //           }
// // // //         />
// // // //       </FilterField>

// // // //       {/* ===================================================
// // // //           PERIOD
// // // //       =================================================== */}

// // // //       <FilterField
// // // //         label="Period"
// // // //         width={
// // // //           FIELD_WIDTHS.period
// // // //         }
// // // //       >
// // // //         <OpexMultiSelect
// // // //           options={
// // // //             options.periods ||
// // // //             []
// // // //           }
// // // //           value={
// // // //             selectedFilters.period ||
// // // //             []
// // // //           }
// // // //           onChange={(value) =>
// // // //             handleFilterChange(
// // // //               "period",
// // // //               value
// // // //             )
// // // //           }
// // // //           placeholder="All"
// // // //           searchPlaceholder="Search Period"
// // // //           width={
// // // //             FIELD_WIDTHS.period
// // // //           }
// // // //         />
// // // //       </FilterField>

// // // //       {/* ===================================================
// // // //           REPORTING CURRENCY
// // // //       =================================================== */}

// // // //       <FilterField
// // // //         label="Reporting Currency"
// // // //         width={
// // // //           FIELD_WIDTHS.reporting_currency
// // // //         }
// // // //       >
// // // //         <OpexSingleSelect
// // // //           options={
// // // //             options
// // // //               .reporting_currencies
// // // //               ?.length
// // // //               ? options.reporting_currencies
// // // //               : [
// // // //                 {
// // // //                   value:
// // // //                     options.default_reporting_currency ||
// // // //                     "AED",

// // // //                   label:
// // // //                     options.default_reporting_currency ||
// // // //                     "AED",
// // // //                 },
// // // //               ]
// // // //           }
// // // //           value={
// // // //             selectedFilters
// // // //               .reporting_currency ||
// // // //             options.default_reporting_currency ||
// // // //             "AED"
// // // //           }
// // // //           onChange={(value) =>
// // // //             handleFilterChange(
// // // //               "reporting_currency",
// // // //               value
// // // //             )
// // // //           }
// // // //           placeholder="AED"
// // // //           searchable={false}
// // // //           width={
// // // //             FIELD_WIDTHS.reporting_currency
// // // //           }
// // // //         />
// // // //       </FilterField>

// // // //       {/* ===================================================
// // // //           APPLY / RESET
// // // //       =================================================== */}

// // // //       <div
// // // //         style={{
// // // //           display:
// // // //             "flex",

// // // //           alignItems:
// // // //             "center",

// // // //           gap:
// // // //             8,

// // // //           alignSelf:
// // // //             "flex-end",

// // // //           flexShrink:
// // // //             0,

// // // //           paddingBottom:
// // // //             1,

// // // //           marginLeft:
// // // //             6,
// // // //         }}
// // // //       >
// // // //         <button
// // // //           id="btn-apply-opex-filter"
// // // //           type="button"
// // // //           onClick={() =>
// // // //             onApply?.(
// // // //               selectedFilters
// // // //             )
// // // //           }
// // // //           style={{
// // // //             height:
// // // //               34,

// // // //             padding:
// // // //               "0 16px",

// // // //             background:
// // // //               "#6366f1",

// // // //             color:
// // // //               "#fff",

// // // //             border:
// // // //               "none",

// // // //             borderRadius:
// // // //               8,

// // // //             fontSize:
// // // //               "0.78rem",

// // // //             fontWeight:
// // // //               700,

// // // //             cursor:
// // // //               "pointer",

// // // //             whiteSpace:
// // // //               "nowrap",

// // // //             display:
// // // //               "inline-flex",

// // // //             alignItems:
// // // //               "center",

// // // //             justifyContent:
// // // //               "center",
// // // //           }}
// // // //         >
// // // //           Apply
// // // //         </button>

// // // //         <button
// // // //           id="btn-reset-opex-filter"
// // // //           type="button"
// // // //           onClick={
// // // //             handleReset
// // // //           }
// // // //           style={{
// // // //             height:
// // // //               34,

// // // //             padding:
// // // //               "0 10px",

// // // //             background:
// // // //               "#fff",

// // // //             border:
// // // //               "1px solid #e2e8f0",

// // // //             color:
// // // //               "#64748b",

// // // //             borderRadius:
// // // //               8,

// // // //             fontWeight:
// // // //               600,

// // // //             fontSize:
// // // //               "0.78rem",

// // // //             cursor:
// // // //               "pointer",

// // // //             whiteSpace:
// // // //               "nowrap",

// // // //             display:
// // // //               "inline-flex",

// // // //             alignItems:
// // // //               "center",

// // // //             justifyContent:
// // // //               "center",
// // // //           }}
// // // //         >
// // // //           Reset
// // // //         </button>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }


// // // import React, {
// // //   useEffect,
// // //   useRef,
// // //   useState,
// // // } from "react";

// // // import { Search } from "lucide-react";

// // // import {
// // //   getOpexFilterOptions,
// // // } from "../../api/opexApi";

// // // /* =========================================================
// // //    DEFAULT FILTERS
// // // ========================================================= */

// // // const DEFAULT_FILTERS = {
// // //   legal_group: [],
// // //   legal_entity: [],
// // //   parent_division: [],
// // //   subdivision: [],
// // //   currency: "",
// // //   as_on_date: "",
// // //   period: [],
// // //   compare_with: "",
// // //   reporting_currency: "AED",
// // //   year: "",
// // // };

// // // /* =========================================================
// // //    FIELD WIDTHS
// // // ========================================================= */

// // // const FIELD_WIDTHS = {
// // //   legal_group: 128,
// // //   legal_entity: 128,
// // //   parent_division: 128,
// // //   subdivision: 128,
// // //   year: 128,
// // //   period: 128,
// // //   reporting_currency: 128,
// // // };

// // // /* =========================================================
// // //    OPTION VALUE
// // // ========================================================= */

// // // const getOptionValue = (option) => {
// // //   if (
// // //     option === null ||
// // //     option === undefined
// // //   ) {
// // //     return "";
// // //   }

// // //   if (
// // //     typeof option === "object"
// // //   ) {
// // //     return (
// // //       option.value ??
// // //       option.id ??
// // //       option.code ??
// // //       option.period_name ??
// // //       option.year ??
// // //       option.name ??
// // //       option.currency_code ??
// // //       ""
// // //     );
// // //   }

// // //   return option;
// // // };

// // // /* =========================================================
// // //    OPTION LABEL
// // // ========================================================= */

// // // const getOptionLabel = (option) => {
// // //   if (
// // //     option === null ||
// // //     option === undefined
// // //   ) {
// // //     return "";
// // //   }

// // //   if (
// // //     typeof option === "object"
// // //   ) {
// // //     return (
// // //       option.label ??
// // //       option.name ??
// // //       option.period_name ??
// // //       option.year ??
// // //       option.currency_name ??
// // //       option.currency_code ??
// // //       option.value ??
// // //       option.code ??
// // //       ""
// // //     );
// // //   }

// // //   return option;
// // // };

// // // /* =========================================================
// // //    LATEST PERIOD
// // // ========================================================= */

// // // function getLatestPeriod(periods = []) {
// // //   if (
// // //     !Array.isArray(periods) ||
// // //     periods.length === 0
// // //   ) {
// // //     return "";
// // //   }

// // //   return getOptionValue(
// // //     periods[periods.length - 1]
// // //   );
// // // }

// // // /* =========================================================
// // //    NORMALIZE YEARS
// // // ========================================================= */

// // // function normalizeYears(
// // //   payload = {},
// // //   periods = []
// // // ) {
// // //   const rawYears =
// // //     payload?.years ||
// // //     payload?.fiscal_years ||
// // //     payload?.accounting_years ||
// // //     [];

// // //   if (
// // //     Array.isArray(rawYears) &&
// // //     rawYears.length
// // //   ) {
// // //     return rawYears;
// // //   }

// // //   const derived = [];

// // //   if (
// // //     Array.isArray(periods)
// // //   ) {
// // //     periods.forEach(
// // //       (period) => {
// // //         if (
// // //           !period ||
// // //           typeof period !== "object"
// // //         ) {
// // //           return;
// // //         }

// // //         const year =
// // //           period.year ??
// // //           period.fiscal_year ??
// // //           period.accounting_year ??
// // //           null;

// // //         if (
// // //           year === null ||
// // //           year === undefined ||
// // //           year === ""
// // //         ) {
// // //           return;
// // //         }

// // //         const exists =
// // //           derived.some(
// // //             (item) =>
// // //               String(
// // //                 getOptionValue(item)
// // //               ) === String(year)
// // //           );

// // //         if (!exists) {
// // //           derived.push({
// // //             value: year,
// // //             label: year,
// // //           });
// // //         }
// // //       }
// // //     );
// // //   }

// // //   return derived;
// // // }

// // // /* =========================================================
// // //    NORMALIZE CURRENCY
// // // ========================================================= */

// // // function normalizeCurrencyOptions(
// // //   rawCurrencies
// // // ) {
// // //   if (
// // //     rawCurrencies === null ||
// // //     rawCurrencies === undefined ||
// // //     rawCurrencies === ""
// // //   ) {
// // //     return [];
// // //   }

// // //   if (
// // //     typeof rawCurrencies === "string" ||
// // //     typeof rawCurrencies === "number"
// // //   ) {
// // //     const value =
// // //       String(rawCurrencies);

// // //     return [
// // //       {
// // //         value,
// // //         label: value,
// // //       },
// // //     ];
// // //   }

// // //   if (
// // //     Array.isArray(rawCurrencies)
// // //   ) {
// // //     return rawCurrencies
// // //       .map((item) => {
// // //         if (
// // //           item === null ||
// // //           item === undefined ||
// // //           item === ""
// // //         ) {
// // //           return null;
// // //         }

// // //         if (
// // //           typeof item === "string" ||
// // //           typeof item === "number"
// // //         ) {
// // //           const value =
// // //             String(item);

// // //           return {
// // //             value,
// // //             label: value,
// // //           };
// // //         }

// // //         if (
// // //           typeof item === "object"
// // //         ) {
// // //           const value =
// // //             item.currency_code ??
// // //             item.currencyCode ??
// // //             item.currency ??
// // //             item.value ??
// // //             item.code ??
// // //             item.id ??
// // //             "";

// // //           const label =
// // //             item.label ??
// // //             item.name ??
// // //             item.currency_name ??
// // //             item.currency_code ??
// // //             item.currencyCode ??
// // //             item.currency ??
// // //             item.value ??
// // //             item.code ??
// // //             value;

// // //           if (!value) {
// // //             return null;
// // //           }

// // //           return {
// // //             value: String(value),
// // //             label: String(label),
// // //           };
// // //         }

// // //         return null;
// // //       })
// // //       .filter(Boolean);
// // //   }

// // //   if (
// // //     typeof rawCurrencies === "object"
// // //   ) {
// // //     const directValue =
// // //       rawCurrencies.currency_code ??
// // //       rawCurrencies.currencyCode ??
// // //       rawCurrencies.currency ??
// // //       rawCurrencies.value ??
// // //       rawCurrencies.code ??
// // //       rawCurrencies.id;

// // //     if (
// // //       directValue !== null &&
// // //       directValue !== undefined &&
// // //       directValue !== ""
// // //     ) {
// // //       const value =
// // //         String(directValue);

// // //       const label =
// // //         rawCurrencies.label ??
// // //         rawCurrencies.name ??
// // //         rawCurrencies.currency_name ??
// // //         rawCurrencies.currency_code ??
// // //         rawCurrencies.currencyCode ??
// // //         rawCurrencies.currency ??
// // //         rawCurrencies.value ??
// // //         rawCurrencies.code ??
// // //         value;

// // //       return [
// // //         {
// // //           value,
// // //           label: String(label),
// // //         },
// // //       ];
// // //     }

// // //     return Object.entries(
// // //       rawCurrencies
// // //     )
// // //       .map(
// // //         ([key, item]) => {
// // //           if (
// // //             item === null ||
// // //             item === undefined ||
// // //             item === ""
// // //           ) {
// // //             return {
// // //               value: String(key),
// // //               label: String(key),
// // //             };
// // //           }

// // //           if (
// // //             typeof item === "string" ||
// // //             typeof item === "number"
// // //           ) {
// // //             return {
// // //               value: String(item),
// // //               label: String(item),
// // //             };
// // //           }

// // //           if (
// // //             typeof item === "object"
// // //           ) {
// // //             const value =
// // //               item.currency_code ??
// // //               item.currencyCode ??
// // //               item.currency ??
// // //               item.value ??
// // //               item.code ??
// // //               key;

// // //             const label =
// // //               item.label ??
// // //               item.name ??
// // //               item.currency_name ??
// // //               item.currency_code ??
// // //               item.currencyCode ??
// // //               item.currency ??
// // //               item.value ??
// // //               item.code ??
// // //               value;

// // //             return {
// // //               value: String(value),
// // //               label: String(label),
// // //             };
// // //           }

// // //           return {
// // //             value: String(key),
// // //             label: String(key),
// // //           };
// // //         }
// // //       )
// // //       .filter(
// // //         (item) =>
// // //           item.value !== ""
// // //       );
// // //   }

// // //   return [];
// // // }

// // // /* =========================================================
// // //    NORMALIZE API OPTIONS
// // // ========================================================= */

// // // function normalizeOpexFilterOptions(
// // //   data = {}
// // // ) {
// // //   const payload =
// // //     data?.data &&
// // //       typeof data.data === "object" &&
// // //       !Array.isArray(data.data)
// // //       ? data.data
// // //       : data;

// // //   const rawCurrencies =
// // //     payload?.reporting_currencies ??
// // //     payload?.currencies ??
// // //     payload?.currency_options ??
// // //     payload?.ledger_currencies ??
// // //     payload?.reporting_currency ??
// // //     [];

// // //   let currencies =
// // //     normalizeCurrencyOptions(
// // //       rawCurrencies
// // //     );

// // //   if (
// // //     !currencies.length &&
// // //     payload?.default_reporting_currency
// // //   ) {
// // //     currencies =
// // //       normalizeCurrencyOptions(
// // //         payload.default_reporting_currency
// // //       );
// // //   }

// // //   const periods =
// // //     Array.isArray(
// // //       payload?.periods
// // //     )
// // //       ? payload.periods
// // //       : [];

// // //   return {
// // //     legal_groups:
// // //       Array.isArray(
// // //         payload?.legal_groups
// // //       )
// // //         ? payload.legal_groups
// // //         : [],

// // //     legal_entities:
// // //       Array.isArray(
// // //         payload?.legal_entities
// // //       )
// // //         ? payload.legal_entities
// // //         : [],

// // //     parent_divisions:
// // //       Array.isArray(
// // //         payload?.parent_divisions
// // //       )
// // //         ? payload.parent_divisions
// // //         : [],

// // //     subdivisions:
// // //       Array.isArray(
// // //         payload?.subdivisions
// // //       )
// // //         ? payload.subdivisions
// // //         : [],

// // //     periods,

// // //     years:
// // //       normalizeYears(
// // //         payload,
// // //         periods
// // //       ),

// // //     reporting_currencies:
// // //       currencies,

// // //     currencies,

// // //     compare_with:
// // //       Array.isArray(
// // //         payload?.compare_with
// // //       )
// // //         ? payload.compare_with
// // //         : Array.isArray(
// // //           payload?.compare_periods
// // //         )
// // //           ? payload.compare_periods
// // //           : [],

// // //     data_as_of:
// // //       payload?.data_as_of ||
// // //       null,

// // //     default_reporting_currency:
// // //       payload?.default_reporting_currency ||
// // //       "AED",
// // //   };
// // // }

// // // /* =========================================================
// // //    CLOSED SELECT STYLE
// // // ========================================================= */

// // // const selectStyle = {
// // //   appearance: "none",

// // //   padding:
// // //     "6px 28px 6px 10px",

// // //   fontSize:
// // //     "0.78rem",

// // //   fontWeight: 500,

// // //   color:
// // //     "#334155",

// // //   backgroundColor:
// // //     "#fff",

// // //   border:
// // //     "1px solid #e2e8f0",

// // //   borderRadius: 7,

// // //   cursor: "pointer",

// // //   outline: "none",

// // //   width: "100%",

// // //   height: 34,

// // //   boxSizing: "border-box",

// // //   backgroundImage:
// // //     "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",

// // //   backgroundRepeat:
// // //     "no-repeat",

// // //   backgroundPosition:
// // //     "right 8px center",
// // // };

// // // /* =========================================================
// // //    FILTER FIELD
// // // ========================================================= */

// // // function FilterField({
// // //   label,
// // //   children,
// // //   width,
// // // }) {
// // //   return (
// // //     <div
// // //       style={{
// // //         display: "flex",
// // //         flexDirection: "column",
// // //         gap: 4,
// // //         minWidth: width,
// // //         width,
// // //         flex: "0 0 auto",
// // //       }}
// // //     >
// // //       <span
// // //         style={{
// // //           fontSize: "0.66rem",
// // //           color: "#1e3a8a",
// // //           fontWeight: 700,
// // //           letterSpacing: "-0.02em",
// // //           whiteSpace: "nowrap",
// // //           lineHeight: 1.2,
// // //         }}
// // //       >
// // //         {label}
// // //       </span>

// // //       {children}
// // //     </div>
// // //   );
// // // }

// // // /* =========================================================
// // //    MULTI SELECT
// // // ========================================================= */

// // // function OpexMultiSelect({
// // //   options = [],
// // //   value = [],
// // //   onChange,
// // //   placeholder = "All",
// // //   searchPlaceholder = "Search...",
// // //   width = 128,
// // // }) {
// // //   const [open, setOpen] =
// // //     useState(false);

// // //   const [
// // //     searchQuery,
// // //     setSearchQuery,
// // //   ] = useState("");

// // //   const ref =
// // //     useRef(null);

// // //   const searchRef =
// // //     useRef(null);

// // //   const triggerRef =
// // //     useRef(null);

// // //   const dropdownRef =
// // //     useRef(null);

// // //   /*
// // //    * IMPORTANT:
// // //    * Position is stored separately and is NOT
// // //    * recalculated when the selected values change.
// // //    *
// // //    * This prevents the dropdown from jumping/clipping
// // //    * when the user selects multiple values.
// // //    */
// // //   const [
// // //     menuPosition,
// // //     setMenuPosition,
// // //   ] = useState({
// // //     top: 0,
// // //     left: 0,
// // //     width: Math.max(width, 225),
// // //     maxHeight: 300,
// // //   });

// // //   /* =======================================================
// // //      UPDATE POSITION
// // //   ======================================================= */

// // //   const updateMenuPosition = () => {
// // //     const trigger =
// // //       triggerRef.current;

// // //     if (!trigger) {
// // //       return;
// // //     }

// // //     const rect =
// // //       trigger.getBoundingClientRect();

// // //     const menuWidth =
// // //       Math.max(width, 225);

// // //     const viewportPadding = 8;

// // //     const preferredHeight = 300;

// // //     const spaceBelow =
// // //       window.innerHeight -
// // //       rect.bottom -
// // //       viewportPadding;

// // //     const spaceAbove =
// // //       rect.top -
// // //       viewportPadding;

// // //     const openAbove =
// // //       spaceBelow < 180 &&
// // //       spaceAbove > spaceBelow;

// // //     const availableHeight =
// // //       Math.max(
// // //         120,
// // //         Math.min(
// // //           preferredHeight,
// // //           openAbove
// // //             ? spaceAbove
// // //             : spaceBelow
// // //         )
// // //       );

// // //     const top =
// // //       openAbove
// // //         ? Math.max(
// // //           viewportPadding,
// // //           rect.top -
// // //           availableHeight -
// // //           3
// // //         )
// // //         : rect.bottom + 3;

// // //     const maxLeft =
// // //       Math.max(
// // //         viewportPadding,
// // //         window.innerWidth -
// // //         menuWidth -
// // //         viewportPadding
// // //       );

// // //     const left =
// // //       Math.min(
// // //         Math.max(
// // //           rect.left,
// // //           viewportPadding
// // //         ),
// // //         maxLeft
// // //       );

// // //     setMenuPosition({
// // //       top,
// // //       left,
// // //       width: menuWidth,
// // //       maxHeight: availableHeight,
// // //     });
// // //   };

// // //   /* =======================================================
// // //      POSITION ONLY WHEN OPEN
     
// // //      IMPORTANT:
// // //      DO NOT ADD `value` HERE.
// // //   ======================================================= */

// // //   useEffect(() => {
// // //     if (!open) {
// // //       return undefined;
// // //     }

// // //     /*
// // //      * Calculate once when opening.
// // //      */
// // //     requestAnimationFrame(() => {
// // //       updateMenuPosition();
// // //     });

// // //     const handleViewportChange = () => {
// // //       updateMenuPosition();
// // //     };

// // //     window.addEventListener(
// // //       "resize",
// // //       handleViewportChange
// // //     );

// // //     window.addEventListener(
// // //       "scroll",
// // //       handleViewportChange,
// // //       true
// // //     );

// // //     return () => {
// // //       window.removeEventListener(
// // //         "resize",
// // //         handleViewportChange
// // //       );

// // //       window.removeEventListener(
// // //         "scroll",
// // //         handleViewportChange,
// // //         true
// // //       );
// // //     };
// // //   }, [
// // //     open,
// // //     width,
// // //   ]);

// // //   /* =======================================================
// // //      CLOSE WHEN CLICKING ANYWHERE OUTSIDE
// // //   ======================================================= */

// // //   useEffect(() => {
// // //     const handleOutside = (event) => {
// // //       const target =
// // //         event.target;

// // //       const clickedTrigger =
// // //         ref.current?.contains(
// // //           target
// // //         );

// // //       const clickedDropdown =
// // //         dropdownRef.current?.contains(
// // //           target
// // //         );

// // //       if (
// // //         !clickedTrigger &&
// // //         !clickedDropdown
// // //       ) {
// // //         setOpen(false);
// // //         setSearchQuery("");
// // //       }
// // //     };

// // //     document.addEventListener(
// // //       "mousedown",
// // //       handleOutside
// // //     );

// // //     return () => {
// // //       document.removeEventListener(
// // //         "mousedown",
// // //         handleOutside
// // //       );
// // //     };
// // //   }, []);

// // //   /* =======================================================
// // //      FOCUS SEARCH
// // //   ======================================================= */

// // //   useEffect(() => {
// // //     if (
// // //       open &&
// // //       searchRef.current
// // //     ) {
// // //       requestAnimationFrame(() => {
// // //         searchRef.current?.focus();
// // //       });
// // //     }

// // //     if (!open) {
// // //       setSearchQuery("");
// // //     }
// // //   }, [open]);

// // //   /* =======================================================
// // //      NORMALIZE
// // //   ======================================================= */

// // //   const normalized =
// // //     (options || [])
// // //       .map((option) => {
// // //         if (
// // //           option === null ||
// // //           option === undefined
// // //         ) {
// // //           return null;
// // //         }

// // //         if (
// // //           typeof option === "string" ||
// // //           typeof option === "number"
// // //         ) {
// // //           return {
// // //             id: String(option),
// // //             name: String(option),
// // //           };
// // //         }

// // //         const id =
// // //           option.value !== undefined
// // //             ? option.value
// // //             : option.id !== undefined
// // //               ? option.id
// // //               : option.code !== undefined
// // //                 ? option.code
// // //                 : "";

// // //         const name =
// // //           option.label !== undefined
// // //             ? option.label
// // //             : option.name !== undefined
// // //               ? option.name
// // //               : option.period_name !== undefined
// // //                 ? option.period_name
// // //                 : String(id);

// // //         if (
// // //           id === null ||
// // //           id === undefined ||
// // //           id === ""
// // //         ) {
// // //           return null;
// // //         }

// // //         return {
// // //           id: String(id),
// // //           name: String(name),
// // //         };
// // //       })
// // //       .filter(Boolean);

// // //   const currentValues =
// // //     Array.isArray(value)
// // //       ? value.map(String)
// // //       : [];

// // //   /* =======================================================
// // //      SEARCH
// // //   ======================================================= */

// // //   const query =
// // //     searchQuery
// // //       .trim()
// // //       .toLowerCase();

// // //   const visibleOptions =
// // //     query
// // //       ? normalized.filter(
// // //         (option) =>
// // //           option.name
// // //             .toLowerCase()
// // //             .includes(query) ||
// // //           option.id
// // //             .toLowerCase()
// // //             .includes(query)
// // //       )
// // //       : normalized;

// // //   /* =======================================================
// // //      DISPLAY
// // //   ======================================================= */

// // //   const isAll =
// // //     currentValues.length === 0;

// // //   const isAllSelected =
// // //     normalized.length > 0 &&
// // //     currentValues.length ===
// // //     normalized.length &&
// // //     normalized.every(
// // //       (option) =>
// // //         currentValues.includes(
// // //           option.id
// // //         )
// // //     );

// // //   const selectedOptions =
// // //     normalized.filter(
// // //       (option) =>
// // //         currentValues.includes(
// // //           option.id
// // //         )
// // //     );

// // //   const displayText =
// // //     isAll
// // //       ? placeholder
// // //       : isAllSelected
// // //         ? "All"
// // //         : selectedOptions.length === 1
// // //           ? selectedOptions[0].name
// // //           : `${selectedOptions.length} selected`;

// // //   /* =======================================================
// // //      TOGGLE
     
// // //      IMPORTANT:
// // //      Dropdown remains open after selection.
// // //   ======================================================= */

// // //   const toggleValue = (id) => {
// // //     const stringId =
// // //       String(id);

// // //     if (
// // //       currentValues.includes(
// // //         stringId
// // //       )
// // //     ) {
// // //       onChange?.(
// // //         currentValues.filter(
// // //           (item) =>
// // //             item !== stringId
// // //         )
// // //       );
// // //     } else {
// // //       onChange?.([
// // //         ...currentValues,
// // //         stringId,
// // //       ]);
// // //     }

// // //     /*
// // //      * DO NOT close here.
// // //      *
// // //      * User can select multiple values.
// // //      * Clicking outside will close it.
// // //      */
// // //   };

// // //   /* =======================================================
// // //      SELECT ALL
// // //   ======================================================= */

// // //   const handleSelectAll = () => {
// // //     onChange?.(
// // //       normalized.map(
// // //         (option) =>
// // //           option.id
// // //       )
// // //     );
// // //   };

// // //   /* =======================================================
// // //      CLEAR
// // //   ======================================================= */

// // //   const handleClear = () => {
// // //     onChange?.([]);
// // //   };

// // //   /* =======================================================
// // //      RENDER
// // //   ======================================================= */

// // //   return (
// // //     <div
// // //       ref={ref}
// // //       style={{
// // //         position: "relative",
// // //         width,
// // //       }}
// // //     >
// // //       {/* CLOSED SELECT */}

// // //       <button
// // //         ref={triggerRef}
// // //         type="button"
// // //         onClick={() => {
// // //           setOpen(
// // //             (previous) =>
// // //               !previous
// // //           );
// // //         }}
// // //         style={{
// // //           ...selectStyle,
// // //           textAlign: "left",
// // //           overflow: "hidden",
// // //           textOverflow: "ellipsis",
// // //           whiteSpace: "nowrap",
// // //         }}
// // //         title={displayText}
// // //       >
// // //         {displayText}
// // //       </button>

// // //       {/* DROPDOWN */}

// // //       {open && (
// // //         <div
// // //           ref={dropdownRef}
// // //           style={{
// // //             position: "fixed",

// // //             top:
// // //               menuPosition.top,

// // //             left:
// // //               menuPosition.left,

// // //             width:
// // //               menuPosition.width,

// // //             maxHeight:
// // //               menuPosition.maxHeight,

// // //             overflowY: "auto",

// // //             overflowX: "hidden",

// // //             background: "#fff",

// // //             border:
// // //               "1px solid #e2e8f0",

// // //             borderRadius: 7,

// // //             boxShadow:
// // //               "0 8px 22px rgba(15,23,42,0.14)",

// // //             zIndex: 99999,

// // //             padding: 6,

// // //             boxSizing: "border-box",

// // //             scrollbarWidth: "thin",

// // //             scrollbarColor:
// // //               "#64748b #f1f5f9",
// // //           }}
// // //         >
// // //           {/* SEARCH */}

// // //           <div
// // //             style={{
// // //               position: "relative",
// // //               marginBottom: 4,
// // //             }}
// // //           >
// // //             <Search
// // //               size={13}
// // //               style={{
// // //                 position:
// // //                   "absolute",

// // //                 left: 8,

// // //                 top: 8,

// // //                 color:
// // //                   "#94a3b8",

// // //                 pointerEvents:
// // //                   "none",
// // //               }}
// // //             />

// // //             <input
// // //               ref={searchRef}
// // //               type="text"
// // //               value={searchQuery}
// // //               onChange={(event) =>
// // //                 setSearchQuery(
// // //                   event.target.value
// // //                 )
// // //               }
// // //               placeholder={
// // //                 searchPlaceholder
// // //               }
// // //               style={{
// // //                 width: "100%",

// // //                 height: 30,

// // //                 boxSizing:
// // //                   "border-box",

// // //                 border:
// // //                   "1px solid #dbe3ef",

// // //                 borderRadius: 6,

// // //                 padding:
// // //                   "0 8px 0 26px",

// // //                 outline: "none",

// // //                 fontSize:
// // //                   "0.72rem",

// // //                 color:
// // //                   "#334155",

// // //                 background:
// // //                   "#fff",
// // //               }}
// // //             />
// // //           </div>

// // //           {/* SELECT ALL / CLEAR */}

// // //           <div
// // //             style={{
// // //               display: "flex",

// // //               alignItems:
// // //                 "center",

// // //               justifyContent:
// // //                 "space-between",

// // //               height: 25,

// // //               padding:
// // //                 "0 6px",

// // //               marginBottom: 1,
// // //             }}
// // //           >
// // //             <button
// // //               type="button"
// // //               onClick={
// // //                 handleSelectAll
// // //               }
// // //               style={{
// // //                 border: "none",

// // //                 background:
// // //                   "transparent",

// // //                 padding: 0,

// // //                 margin: 0,

// // //                 cursor:
// // //                   "pointer",

// // //                 fontSize:
// // //                   "0.68rem",

// // //                 lineHeight:
// // //                   "18px",

// // //                 fontWeight: 600,

// // //                 color:
// // //                   "#4f46e5",
// // //               }}
// // //             >
// // //               Select All
// // //             </button>

// // //             <button
// // //               type="button"
// // //               onClick={
// // //                 handleClear
// // //               }
// // //               style={{
// // //                 border: "none",

// // //                 background:
// // //                   "transparent",

// // //                 padding: 0,

// // //                 margin: 0,

// // //                 cursor:
// // //                   "pointer",

// // //                 fontSize:
// // //                   "0.68rem",

// // //                 lineHeight:
// // //                   "18px",

// // //                 fontWeight: 500,

// // //                 color:
// // //                   "#64748b",
// // //               }}
// // //             >
// // //               Clear
// // //             </button>
// // //           </div>

// // //           {/* VALUES */}

// // //           {visibleOptions.map(
// // //             (option) => {
// // //               const checked =
// // //                 currentValues.includes(
// // //                   option.id
// // //                 );

// // //               return (
// // //                 <label
// // //                   key={option.id}
// // //                   style={{
// // //                     display: "flex",

// // //                     alignItems:
// // //                       "center",

// // //                     gap: 6,

// // //                     width: "100%",

// // //                     height: 27,

// // //                     minHeight: 27,

// // //                     boxSizing:
// // //                       "border-box",

// // //                     padding:
// // //                       "2px 6px",

// // //                     margin: 0,

// // //                     borderRadius: 4,

// // //                     cursor:
// // //                       "pointer",

// // //                     fontSize:
// // //                       "0.72rem",

// // //                     lineHeight:
// // //                       "18px",

// // //                     fontWeight:
// // //                       checked
// // //                         ? 600
// // //                         : 500,

// // //                     color:
// // //                       "#334155",

// // //                     background:
// // //                       checked
// // //                         ? "#f5f7ff"
// // //                         : "#fff",
// // //                   }}
// // //                 >
// // //                   <input
// // //                     type="checkbox"
// // //                     checked={
// // //                       checked
// // //                     }
// // //                     onChange={() =>
// // //                       toggleValue(
// // //                         option.id
// // //                       )
// // //                     }
// // //                     style={{
// // //                       margin: 0,

// // //                       padding: 0,

// // //                       width: 14,

// // //                       height: 14,

// // //                       flexShrink: 0,

// // //                       accentColor:
// // //                         "#4f46e5",

// // //                       cursor:
// // //                         "pointer",
// // //                     }}
// // //                   />

// // //                   <span
// // //                     style={{
// // //                       display:
// // //                         "block",

// // //                       minWidth: 0,

// // //                       overflow:
// // //                         "hidden",

// // //                       textOverflow:
// // //                         "ellipsis",

// // //                       whiteSpace:
// // //                         "nowrap",

// // //                       lineHeight:
// // //                         "18px",
// // //                     }}
// // //                     title={
// // //                       option.name
// // //                     }
// // //                   >
// // //                     {option.name}
// // //                   </span>
// // //                 </label>
// // //               );
// // //             }
// // //           )}

// // //           {!visibleOptions.length && (
// // //             <div
// // //               style={{
// // //                 padding:
// // //                   "10px 6px",

// // //                 textAlign:
// // //                   "center",

// // //                 fontSize:
// // //                   "0.7rem",

// // //                 color:
// // //                   "#94a3b8",
// // //               }}
// // //             >
// // //               No options found
// // //             </div>
// // //           )}
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // /* =========================================================
// // //    SINGLE SELECT
// // // ========================================================= */

// // // function OpexSingleSelect({
// // //   options = [],
// // //   value = "",
// // //   onChange,
// // //   placeholder = "Select",
// // //   searchPlaceholder = "Search...",
// // //   width = 128,
// // //   searchable = true,
// // // }) {
// // //   const [open, setOpen] =
// // //     useState(false);

// // //   const [
// // //     searchQuery,
// // //     setSearchQuery,
// // //   ] = useState("");

// // //   const ref =
// // //     useRef(null);

// // //   const searchRef =
// // //     useRef(null);

// // //   const triggerRef =
// // //     useRef(null);

// // //   const dropdownRef =
// // //     useRef(null);

// // //   const [
// // //     menuPosition,
// // //     setMenuPosition,
// // //   ] = useState({
// // //     top: 0,
// // //     left: 0,
// // //     width: Math.max(width, 225),
// // //     maxHeight: 300,
// // //   });

// // //   /* =======================================================
// // //      UPDATE POSITION
// // //   ======================================================= */

// // //   const updateMenuPosition = () => {
// // //     const trigger =
// // //       triggerRef.current;

// // //     if (!trigger) {
// // //       return;
// // //     }

// // //     const rect =
// // //       trigger.getBoundingClientRect();

// // //     const menuWidth =
// // //       Math.max(width, 225);

// // //     const viewportPadding = 8;

// // //     const preferredHeight = 300;

// // //     const spaceBelow =
// // //       window.innerHeight -
// // //       rect.bottom -
// // //       viewportPadding;

// // //     const spaceAbove =
// // //       rect.top -
// // //       viewportPadding;

// // //     const openAbove =
// // //       spaceBelow < 180 &&
// // //       spaceAbove > spaceBelow;

// // //     const availableHeight =
// // //       Math.max(
// // //         120,
// // //         Math.min(
// // //           preferredHeight,
// // //           openAbove
// // //             ? spaceAbove
// // //             : spaceBelow
// // //         )
// // //       );

// // //     const top =
// // //       openAbove
// // //         ? Math.max(
// // //           viewportPadding,
// // //           rect.top -
// // //           availableHeight -
// // //           3
// // //         )
// // //         : rect.bottom + 3;

// // //     const maxLeft =
// // //       Math.max(
// // //         viewportPadding,
// // //         window.innerWidth -
// // //         menuWidth -
// // //         viewportPadding
// // //       );

// // //     const left =
// // //       Math.min(
// // //         Math.max(
// // //           rect.left,
// // //           viewportPadding
// // //         ),
// // //         maxLeft
// // //       );

// // //     setMenuPosition({
// // //       top,
// // //       left,
// // //       width: menuWidth,
// // //       maxHeight:
// // //         availableHeight,
// // //     });
// // //   };

// // //   /* =======================================================
// // //      POSITION ONLY WHILE OPEN
// // //   ======================================================= */

// // //   useEffect(() => {
// // //     if (!open) {
// // //       return undefined;
// // //     }

// // //     requestAnimationFrame(() => {
// // //       updateMenuPosition();
// // //     });

// // //     const handleViewportChange =
// // //       () => {
// // //         updateMenuPosition();
// // //       };

// // //     window.addEventListener(
// // //       "resize",
// // //       handleViewportChange
// // //     );

// // //     window.addEventListener(
// // //       "scroll",
// // //       handleViewportChange,
// // //       true
// // //     );

// // //     return () => {
// // //       window.removeEventListener(
// // //         "resize",
// // //         handleViewportChange
// // //       );

// // //       window.removeEventListener(
// // //         "scroll",
// // //         handleViewportChange,
// // //         true
// // //       );
// // //     };
// // //   }, [
// // //     open,
// // //     width,
// // //   ]);

// // //   /* =======================================================
// // //      CLOSE ANYWHERE OUTSIDE
// // //   ======================================================= */

// // //   useEffect(() => {
// // //     const handleOutside =
// // //       (event) => {
// // //         const target =
// // //           event.target;

// // //         const clickedTrigger =
// // //           ref.current?.contains(
// // //             target
// // //           );

// // //         const clickedDropdown =
// // //           dropdownRef.current?.contains(
// // //             target
// // //           );

// // //         if (
// // //           !clickedTrigger &&
// // //           !clickedDropdown
// // //         ) {
// // //           setOpen(false);
// // //           setSearchQuery("");
// // //         }
// // //       };

// // //     document.addEventListener(
// // //       "mousedown",
// // //       handleOutside
// // //     );

// // //     return () => {
// // //       document.removeEventListener(
// // //         "mousedown",
// // //         handleOutside
// // //       );
// // //     };
// // //   }, []);

// // //   /* =======================================================
// // //      FOCUS SEARCH
// // //   ======================================================= */

// // //   useEffect(() => {
// // //     if (
// // //       open &&
// // //       searchable &&
// // //       searchRef.current
// // //     ) {
// // //       requestAnimationFrame(() => {
// // //         searchRef.current?.focus();
// // //       });
// // //     }

// // //     if (!open) {
// // //       setSearchQuery("");
// // //     }
// // //   }, [
// // //     open,
// // //     searchable,
// // //   ]);

// // //   /* =======================================================
// // //      NORMALIZE
// // //   ======================================================= */

// // //   const normalized =
// // //     (options || [])
// // //       .map((option) => {
// // //         if (
// // //           option === null ||
// // //           option === undefined
// // //         ) {
// // //           return null;
// // //         }

// // //         if (
// // //           typeof option === "string" ||
// // //           typeof option === "number"
// // //         ) {
// // //           return {
// // //             id: String(option),
// // //             name: String(option),
// // //           };
// // //         }

// // //         const id =
// // //           option.value !== undefined
// // //             ? option.value
// // //             : option.id !== undefined
// // //               ? option.id
// // //               : option.code !== undefined
// // //                 ? option.code
// // //                 : "";

// // //         const name =
// // //           option.label !== undefined
// // //             ? option.label
// // //             : option.name !== undefined
// // //               ? option.name
// // //               : option.period_name !== undefined
// // //                 ? option.period_name
// // //                 : String(id);

// // //         if (
// // //           id === null ||
// // //           id === undefined ||
// // //           id === ""
// // //         ) {
// // //           return null;
// // //         }

// // //         return {
// // //           id: String(id),
// // //           name: String(name),
// // //         };
// // //       })
// // //       .filter(Boolean);

// // //   const currentValue =
// // //     value === null ||
// // //     value === undefined
// // //       ? ""
// // //       : String(value);

// // //   const currentOption =
// // //     normalized.find(
// // //       (option) =>
// // //         option.id ===
// // //         currentValue
// // //     );

// // //   /* =======================================================
// // //      SEARCH
// // //   ======================================================= */

// // //   const query =
// // //     searchQuery
// // //       .trim()
// // //       .toLowerCase();

// // //   const visibleOptions =
// // //     searchable && query
// // //       ? normalized.filter(
// // //         (option) =>
// // //           option.name
// // //             .toLowerCase()
// // //             .includes(query) ||
// // //           option.id
// // //             .toLowerCase()
// // //             .includes(query)
// // //       )
// // //       : normalized;

// // //   const displayText =
// // //     currentOption?.name ||
// // //     placeholder;

// // //   /* =======================================================
// // //      SELECT
// // //   ======================================================= */

// // //   const handleSelect =
// // //     (option) => {
// // //       onChange?.(
// // //         option.id
// // //       );

// // //       /*
// // //        * Single select closes after selection.
// // //        * This is intentional.
// // //        */
// // //       setOpen(false);
// // //       setSearchQuery("");
// // //     };

// // //   /* =======================================================
// // //      RENDER
// // //   ======================================================= */

// // //   return (
// // //     <div
// // //       ref={ref}
// // //       style={{
// // //         position: "relative",
// // //         width,
// // //       }}
// // //     >
// // //       <button
// // //         ref={triggerRef}
// // //         type="button"
// // //         onClick={() =>
// // //           setOpen(
// // //             (previous) =>
// // //               !previous
// // //           )
// // //         }
// // //         style={{
// // //           ...selectStyle,
// // //           textAlign: "left",
// // //           overflow: "hidden",
// // //           textOverflow:
// // //             "ellipsis",
// // //           whiteSpace:
// // //             "nowrap",
// // //         }}
// // //         title={displayText}
// // //       >
// // //         {displayText}
// // //       </button>

// // //       {open && (
// // //         <div
// // //           ref={dropdownRef}
// // //           style={{
// // //             position: "fixed",

// // //             top:
// // //               menuPosition.top,

// // //             left:
// // //               menuPosition.left,

// // //             width:
// // //               menuPosition.width,

// // //             maxHeight:
// // //               menuPosition.maxHeight,

// // //             overflowY: "auto",

// // //             overflowX: "hidden",

// // //             background: "#fff",

// // //             border:
// // //               "1px solid #e2e8f0",

// // //             borderRadius: 7,

// // //             boxShadow:
// // //               "0 8px 22px rgba(15,23,42,0.14)",

// // //             zIndex: 99999,

// // //             padding: 6,

// // //             boxSizing:
// // //               "border-box",

// // //             scrollbarWidth:
// // //               "thin",

// // //             scrollbarColor:
// // //               "#64748b #f1f5f9",
// // //           }}
// // //         >
// // //           {searchable && (
// // //             <div
// // //               style={{
// // //                 position:
// // //                   "relative",

// // //                 marginBottom: 4,
// // //               }}
// // //             >
// // //               <Search
// // //                 size={13}
// // //                 style={{
// // //                   position:
// // //                     "absolute",

// // //                   left: 8,

// // //                   top: 8,

// // //                   color:
// // //                     "#94a3b8",

// // //                   pointerEvents:
// // //                     "none",
// // //                 }}
// // //               />

// // //               <input
// // //                 ref={searchRef}
// // //                 type="text"
// // //                 value={
// // //                   searchQuery
// // //                 }
// // //                 onChange={(
// // //                   event
// // //                 ) =>
// // //                   setSearchQuery(
// // //                     event.target.value
// // //                   )
// // //                 }
// // //                 placeholder={
// // //                   searchPlaceholder
// // //                 }
// // //                 style={{
// // //                   width: "100%",

// // //                   height: 30,

// // //                   boxSizing:
// // //                     "border-box",

// // //                   border:
// // //                     "1px solid #dbe3ef",

// // //                   borderRadius: 6,

// // //                   padding:
// // //                     "0 8px 0 26px",

// // //                   outline: "none",

// // //                   fontSize:
// // //                     "0.72rem",

// // //                   color:
// // //                     "#334155",

// // //                   background:
// // //                     "#fff",
// // //                 }}
// // //               />
// // //             </div>
// // //           )}

// // //           {visibleOptions.map(
// // //             (option) => {
// // //               const selected =
// // //                 option.id ===
// // //                 currentValue;

// // //               return (
// // //                 <button
// // //                   key={
// // //                     option.id
// // //                   }
// // //                   type="button"
// // //                   onClick={() =>
// // //                     handleSelect(
// // //                       option
// // //                     )
// // //                   }
// // //                   style={{
// // //                     width: "100%",

// // //                     height: 27,

// // //                     minHeight: 27,

// // //                     boxSizing:
// // //                       "border-box",

// // //                     border: "none",

// // //                     background:
// // //                       selected
// // //                         ? "#f5f7ff"
// // //                         : "#fff",

// // //                     textAlign:
// // //                       "left",

// // //                     padding:
// // //                       "2px 8px",

// // //                     margin: 0,

// // //                     borderRadius: 4,

// // //                     cursor:
// // //                       "pointer",

// // //                     fontSize:
// // //                       "0.72rem",

// // //                     lineHeight:
// // //                       "18px",

// // //                     fontWeight:
// // //                       selected
// // //                         ? 600
// // //                         : 500,

// // //                     color:
// // //                       "#334155",

// // //                     overflow:
// // //                       "hidden",

// // //                     textOverflow:
// // //                       "ellipsis",

// // //                     whiteSpace:
// // //                       "nowrap",
// // //                   }}
// // //                   title={
// // //                     option.name
// // //                   }
// // //                 >
// // //                   {option.name}
// // //                 </button>
// // //               );
// // //             }
// // //           )}

// // //           {!visibleOptions.length && (
// // //             <div
// // //               style={{
// // //                 padding:
// // //                   "10px 6px",

// // //                 textAlign:
// // //                   "center",

// // //                 fontSize:
// // //                   "0.7rem",

// // //                 color:
// // //                   "#94a3b8",
// // //               }}
// // //             >
// // //               No options found
// // //             </div>
// // //           )}
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // /* =========================================================
// // //    OPEX FILTERS
// // // ========================================================= */

// // // export default function OpexFilters({
// // //   filterOptions = {},
// // //   selectedFilters:
// // //     externalSelectedFilters,
// // //   onChange,
// // //   onApply,
// // //   onReset,
// // // }) {
// // //   const [
// // //     opexFilterOptions,
// // //     setOpexFilterOptions,
// // //   ] = useState(
// // //     normalizeOpexFilterOptions(
// // //       filterOptions
// // //     )
// // //   );

// // //   const [
// // //     selectedFilters,
// // //     setSelectedFilters,
// // //   ] = useState(() => {
// // //     const normalized =
// // //       normalizeOpexFilterOptions(
// // //         filterOptions
// // //       );

// // //     const years =
// // //       normalized.years || [];

// // //     const periods =
// // //       normalized.periods || [];

// // //     const firstYear =
// // //       years.length
// // //         ? getOptionValue(
// // //           years[0]
// // //         )
// // //         : "";

// // //     const latestPeriod =
// // //       periods.length
// // //         ? getLatestPeriod(
// // //           periods
// // //         )
// // //         : "";

// // //     return {
// // //       ...DEFAULT_FILTERS,

// // //       ...(externalSelectedFilters ||
// // //         {}),

// // //       year:
// // //         externalSelectedFilters?.year ||
// // //         (firstYear
// // //           ? String(firstYear)
// // //           : ""),

// // //       period:
// // //         externalSelectedFilters?.period ||
// // //         (latestPeriod
// // //           ? [
// // //             String(
// // //               latestPeriod
// // //             ),
// // //           ]
// // //           : []),

// // //       reporting_currency:
// // //         externalSelectedFilters
// // //           ?.reporting_currency ||
// // //         normalized.default_reporting_currency ||
// // //         "AED",
// // //     };
// // //   });

// // //   const [
// // //     loading,
// // //     setLoading,
// // //   ] = useState(false);

// // //   /* =======================================================
// // //      SYNC EXTERNAL FILTERS
// // //   ======================================================= */

// // //   useEffect(() => {
// // //     if (
// // //       !externalSelectedFilters
// // //     ) {
// // //       return;
// // //     }

// // //     setSelectedFilters(
// // //       (previous) => ({
// // //         ...previous,
// // //         ...externalSelectedFilters,
// // //       })
// // //     );
// // //   }, [
// // //     externalSelectedFilters,
// // //   ]);

// // //   /* =======================================================
// // //      LOAD FILTER OPTIONS
// // //   ======================================================= */

// // //   const loadOpexFilterOptions =
// // //     async (
// // //       currentFilters = {},
// // //       preserveOptionKey = null
// // //     ) => {
// // //       try {
// // //         setLoading(true);

// // //         const response =
// // //           await getOpexFilterOptions(
// // //             currentFilters
// // //           );

// // //         const normalized =
// // //           normalizeOpexFilterOptions(
// // //             response
// // //           );

// // //         setOpexFilterOptions(
// // //           (previous) => {
// // //             if (
// // //               preserveOptionKey
// // //             ) {
// // //               return {
// // //                 ...previous,
// // //                 ...normalized,

// // //                 [preserveOptionKey]:
// // //                   normalized[
// // //                     preserveOptionKey
// // //                   ] ??
// // //                   previous[
// // //                     preserveOptionKey
// // //                   ] ??
// // //                   [],
// // //               };
// // //             }

// // //             return {
// // //               ...previous,
// // //               ...normalized,
// // //             };
// // //           }
// // //         );

// // //         return normalized;
// // //       } catch (error) {
// // //         console.error(
// // //           "Failed to load OPEX filter options:",
// // //           error
// // //         );

// // //         return null;
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //   /* =======================================================
// // //      INITIAL OPTIONS
// // //   ======================================================= */

// // //   useEffect(() => {
// // //     void loadOpexFilterOptions(
// // //       {}
// // //     );
// // //   }, []);

// // //   /* =======================================================
// // //      DEFAULT VALUES
// // //   ======================================================= */

// // //   useEffect(() => {
// // //     if (
// // //       !opexFilterOptions
// // //     ) {
// // //       return;
// // //     }

// // //     setSelectedFilters(
// // //       (previous) => {
// // //         const next = {
// // //           ...previous,
// // //         };

// // //         if (
// // //           !next.year &&
// // //           opexFilterOptions
// // //             .years?.length
// // //         ) {
// // //           next.year =
// // //             String(
// // //               getOptionValue(
// // //                 opexFilterOptions
// // //                   .years[0]
// // //               )
// // //             );
// // //         }

// // //         if (
// // //           (!Array.isArray(
// // //             next.period
// // //           ) ||
// // //             next.period.length ===
// // //             0) &&
// // //           opexFilterOptions
// // //             .periods?.length
// // //         ) {
// // //           const latestPeriod =
// // //             getLatestPeriod(
// // //               opexFilterOptions
// // //                 .periods
// // //             );

// // //           if (
// // //             latestPeriod
// // //           ) {
// // //             next.period = [
// // //               String(
// // //                 latestPeriod
// // //               ),
// // //             ];
// // //           }
// // //         }

// // //         if (
// // //           !next.reporting_currency
// // //         ) {
// // //           next.reporting_currency =
// // //             opexFilterOptions
// // //               .default_reporting_currency ||
// // //             "AED";
// // //         }

// // //         return next;
// // //       }
// // //     );
// // //   }, [
// // //     opexFilterOptions,
// // //   ]);

// // //   /* =======================================================
// // //      FILTER CHANGE
// // //   ======================================================= */

// // //   const handleFilterChange = (
// // //     key,
// // //     value
// // //   ) => {
// // //     const nextFilters = {
// // //       ...selectedFilters,
// // //       [key]: value,
// // //     };

// // //     /*
// // //      * Update immediately.
// // //      */
// // //     setSelectedFilters(
// // //       nextFilters
// // //     );

// // //     /* =====================================================
// // //        DEPENDENT DROPDOWN MAPPING
// // //     ===================================================== */

// // //     const optionKeyMap = {
// // //       legal_group:
// // //         "legal_entities",

// // //       legal_entity:
// // //         "parent_divisions",

// // //       parent_division:
// // //         "subdivisions",
// // //     };

// // //     const apiKeyMap = {
// // //       legal_group:
// // //         "legal_group_id",

// // //       legal_entity:
// // //         "legal_entity_id",

// // //       parent_division:
// // //         "parent_division_id",
// // //     };

// // //     const dependentKey =
// // //       optionKeyMap[key];

// // //     const apiKey =
// // //       apiKeyMap[key];

// // //     if (
// // //       dependentKey &&
// // //       apiKey
// // //     ) {
// // //       const apiFilters = {
// // //         year:
// // //           nextFilters.year ||
// // //           undefined,

// // //         period_name:
// // //           nextFilters.period ||
// // //           undefined,

// // //         reporting_currency:
// // //           nextFilters
// // //             .reporting_currency ||
// // //           "AED",

// // //         [apiKey]:
// // //           Array.isArray(value)
// // //             ? value
// // //             : value
// // //               ? [value]
// // //               : [],
// // //       };

// // //       /* =================================================
// // //          CLEAR LOWER LEVEL FILTERS
// // //       ================================================= */

// // //       const clearedFilters = {
// // //         ...nextFilters,
// // //       };

// // //       if (
// // //         key ===
// // //         "legal_group"
// // //       ) {
// // //         clearedFilters.legal_entity =
// // //           [];

// // //         clearedFilters.parent_division =
// // //           [];

// // //         clearedFilters.subdivision =
// // //           [];
// // //       }

// // //       if (
// // //         key ===
// // //         "legal_entity"
// // //       ) {
// // //         clearedFilters.parent_division =
// // //           [];

// // //         clearedFilters.subdivision =
// // //           [];
// // //       }

// // //       if (
// // //         key ===
// // //         "parent_division"
// // //       ) {
// // //         clearedFilters.subdivision =
// // //           [];
// // //       }

// // //       setSelectedFilters(
// // //         clearedFilters
// // //       );

// // //       void loadOpexFilterOptions(
// // //         apiFilters,
// // //         dependentKey
// // //       );
// // //     }
// // //   };

// // //   /* =======================================================
// // //      RESET
// // //   ======================================================= */

// // //   const handleReset = () => {
// // //     const years =
// // //       opexFilterOptions
// // //         .years?.length
// // //         ? opexFilterOptions.years
// // //         : filterOptions?.years ||
// // //         [];

// // //     const periods =
// // //       opexFilterOptions
// // //         .periods?.length
// // //         ? opexFilterOptions
// // //           .periods
// // //         : filterOptions?.periods ||
// // //         [];

// // //     const firstYear =
// // //       years.length
// // //         ? getOptionValue(
// // //           years[0]
// // //         )
// // //         : "";

// // //     const latestPeriod =
// // //       periods.length
// // //         ? getLatestPeriod(
// // //           periods
// // //         )
// // //         : "";

// // //     const resetFilters = {
// // //       ...DEFAULT_FILTERS,

// // //       legal_group: [],
// // //       legal_entity: [],
// // //       parent_division: [],
// // //       subdivision: [],

// // //       period:
// // //         latestPeriod
// // //           ? [
// // //             String(
// // //               latestPeriod
// // //             ),
// // //           ]
// // //           : [],

// // //       year:
// // //         firstYear
// // //           ? String(
// // //             firstYear
// // //           )
// // //           : "",

// // //       reporting_currency:
// // //         opexFilterOptions
// // //           .default_reporting_currency ||
// // //         filterOptions
// // //           ?.default_reporting_currency ||
// // //         "AED",
// // //     };

// // //     setSelectedFilters(
// // //       resetFilters
// // //     );

// // //     onChange?.(
// // //       resetFilters
// // //     );

// // //     onReset?.();

// // //     void loadOpexFilterOptions(
// // //       {}
// // //     );
// // //   };

// // //   const options = {
// // //     ...filterOptions,
// // //     ...opexFilterOptions,
// // //   };

// // //   /* =======================================================
// // //      UI
// // //   ======================================================= */

// // //   return (
// // //     <div
// // //       className="card"
// // //       style={{
// // //         width: "100%",

// // //         maxWidth: "100%",

// // //         padding:
// // //           "10px 16px",

// // //         marginBottom: 16,

// // //         display: "flex",

// // //         alignItems:
// // //           "flex-end",

// // //         gap: 10,

// // //         flexWrap: "wrap",

// // //         boxSizing:
// // //           "border-box",

// // //         /*
// // //          * IMPORTANT:
// // //          * Must remain visible so fixed dropdown
// // //          * is never clipped by this filter card.
// // //          */
// // //         overflow: "visible",

// // //         position: "relative",

// // //         zIndex: 20,

// // //         fontFamily:
// // //           "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
// // //       }}
// // //     >
// // //       {/* ===================================================
// // //           LEGAL GROUP
// // //       =================================================== */}

// // //       <FilterField
// // //         label="Legal Group"
// // //         width={
// // //           FIELD_WIDTHS.legal_group
// // //         }
// // //       >
// // //         <OpexMultiSelect
// // //           options={
// // //             options.legal_groups ||
// // //             []
// // //           }
// // //           value={
// // //             selectedFilters
// // //               .legal_group ||
// // //             []
// // //           }
// // //           onChange={(value) =>
// // //             handleFilterChange(
// // //               "legal_group",
// // //               value
// // //             )
// // //           }
// // //           placeholder="All"
// // //           searchPlaceholder="Search Legal Group"
// // //           width={
// // //             FIELD_WIDTHS.legal_group
// // //           }
// // //         />
// // //       </FilterField>

// // //       {/* ===================================================
// // //           LEGAL ENTITY
// // //       =================================================== */}

// // //       <FilterField
// // //         label="Legal Entity"
// // //         width={
// // //           FIELD_WIDTHS.legal_entity
// // //         }
// // //       >
// // //         <OpexMultiSelect
// // //           options={
// // //             options.legal_entities ||
// // //             []
// // //           }
// // //           value={
// // //             selectedFilters
// // //               .legal_entity ||
// // //             []
// // //           }
// // //           onChange={(value) =>
// // //             handleFilterChange(
// // //               "legal_entity",
// // //               value
// // //             )
// // //           }
// // //           placeholder="All"
// // //           searchPlaceholder="Search Legal Entity"
// // //           width={
// // //             FIELD_WIDTHS.legal_entity
// // //           }
// // //         />
// // //       </FilterField>

// // //       {/* ===================================================
// // //           PARENT DIVISION
// // //       =================================================== */}

// // //       <FilterField
// // //         label="Parent Division"
// // //         width={
// // //           FIELD_WIDTHS.parent_division
// // //         }
// // //       >
// // //         <OpexMultiSelect
// // //           options={
// // //             options.parent_divisions ||
// // //             []
// // //           }
// // //           value={
// // //             selectedFilters
// // //               .parent_division ||
// // //             []
// // //           }
// // //           onChange={(value) =>
// // //             handleFilterChange(
// // //               "parent_division",
// // //               value
// // //             )
// // //           }
// // //           placeholder="All"
// // //           searchPlaceholder="Search Parent Division"
// // //           width={
// // //             FIELD_WIDTHS.parent_division
// // //           }
// // //         />
// // //       </FilterField>

// // //       {/* ===================================================
// // //           SUB-DIVISION
// // //       =================================================== */}

// // //       <FilterField
// // //         label="Sub-Division"
// // //         width={
// // //           FIELD_WIDTHS.subdivision
// // //         }
// // //       >
// // //         <OpexMultiSelect
// // //           options={
// // //             options.subdivisions ||
// // //             []
// // //           }
// // //           value={
// // //             selectedFilters
// // //               .subdivision ||
// // //             []
// // //           }
// // //           onChange={(value) =>
// // //             handleFilterChange(
// // //               "subdivision",
// // //               value
// // //             )
// // //           }
// // //           placeholder="All"
// // //           searchPlaceholder="Search Sub-Division"
// // //           width={
// // //             FIELD_WIDTHS.subdivision
// // //           }
// // //         />
// // //       </FilterField>

// // //       {/* ===================================================
// // //           YEAR
// // //       =================================================== */}

// // //       <FilterField
// // //         label="Year"
// // //         width={
// // //           FIELD_WIDTHS.year
// // //         }
// // //       >
// // //         <OpexSingleSelect
// // //           options={
// // //             options.years ||
// // //             []
// // //           }
// // //           value={
// // //             selectedFilters.year ||
// // //             ""
// // //           }
// // //           onChange={(value) =>
// // //             handleFilterChange(
// // //               "year",
// // //               value
// // //             )
// // //           }
// // //           placeholder="Select Year"
// // //           searchPlaceholder="Search Year"
// // //           width={
// // //             FIELD_WIDTHS.year
// // //           }
// // //         />
// // //       </FilterField>

// // //       {/* ===================================================
// // //           PERIOD
// // //       =================================================== */}

// // //       <FilterField
// // //         label="Period"
// // //         width={
// // //           FIELD_WIDTHS.period
// // //         }
// // //       >
// // //         <OpexMultiSelect
// // //           options={
// // //             options.periods ||
// // //             []
// // //           }
// // //           value={
// // //             selectedFilters.period ||
// // //             []
// // //           }
// // //           onChange={(value) =>
// // //             handleFilterChange(
// // //               "period",
// // //               value
// // //             )
// // //           }
// // //           placeholder="All"
// // //           searchPlaceholder="Search Period"
// // //           width={
// // //             FIELD_WIDTHS.period
// // //           }
// // //         />
// // //       </FilterField>

// // //       {/* ===================================================
// // //           REPORTING CURRENCY
// // //       =================================================== */}

// // //       <FilterField
// // //         label="Reporting Currency"
// // //         width={
// // //           FIELD_WIDTHS.reporting_currency
// // //         }
// // //       >
// // //         <OpexSingleSelect
// // //           options={
// // //             options
// // //               .reporting_currencies
// // //               ?.length
// // //               ? options.reporting_currencies
// // //               : [
// // //                 {
// // //                   value:
// // //                     options
// // //                       .default_reporting_currency ||
// // //                     "AED",

// // //                   label:
// // //                     options
// // //                       .default_reporting_currency ||
// // //                     "AED",
// // //                 },
// // //               ]
// // //           }
// // //           value={
// // //             selectedFilters
// // //               .reporting_currency ||
// // //             options
// // //               .default_reporting_currency ||
// // //             "AED"
// // //           }
// // //           onChange={(value) =>
// // //             handleFilterChange(
// // //               "reporting_currency",
// // //               value
// // //             )
// // //           }
// // //           placeholder="AED"
// // //           searchable={false}
// // //           width={
// // //             FIELD_WIDTHS.reporting_currency
// // //           }
// // //         />
// // //       </FilterField>

// // //       {/* ===================================================
// // //           APPLY / RESET
// // //       =================================================== */}

// // //       <div
// // //         style={{
// // //           display: "flex",

// // //           alignItems:
// // //             "center",

// // //           gap: 8,

// // //           alignSelf:
// // //             "flex-end",

// // //           flexShrink: 0,

// // //           paddingBottom: 1,

// // //           marginLeft: 6,
// // //         }}
// // //       >
// // //         <button
// // //           id="btn-apply-opex-filter"
// // //           type="button"
// // //           onClick={() =>
// // //             onApply?.(
// // //               selectedFilters
// // //             )
// // //           }
// // //           style={{
// // //             height: 34,

// // //             padding:
// // //               "0 16px",

// // //             background:
// // //               "#6366f1",

// // //             color: "#fff",

// // //             border: "none",

// // //             borderRadius: 8,

// // //             fontSize:
// // //               "0.78rem",

// // //             fontWeight: 700,

// // //             cursor:
// // //               "pointer",

// // //             whiteSpace:
// // //               "nowrap",

// // //             display:
// // //               "inline-flex",

// // //             alignItems:
// // //               "center",

// // //             justifyContent:
// // //               "center",
// // //           }}
// // //         >
// // //           Apply
// // //         </button>

// // //         <button
// // //           id="btn-reset-opex-filter"
// // //           type="button"
// // //           onClick={
// // //             handleReset
// // //           }
// // //           style={{
// // //             height: 34,

// // //             padding:
// // //               "0 10px",

// // //             background:
// // //               "#fff",

// // //             border:
// // //               "1px solid #e2e8f0",

// // //             color:
// // //               "#64748b",

// // //             borderRadius: 8,

// // //             fontWeight: 600,

// // //             fontSize:
// // //               "0.78rem",

// // //             cursor:
// // //               "pointer",

// // //             whiteSpace:
// // //               "nowrap",

// // //             display:
// // //               "inline-flex",

// // //             alignItems:
// // //               "center",

// // //             justifyContent:
// // //               "center",
// // //           }}
// // //         >
// // //           Reset
// // //         </button>
// // //       </div>
// // //     </div>
// // //   );
// // // }


// // import React, {
// //   useEffect,
// //   useRef,
// //   useState,
// // } from "react";

// // import { Search } from "lucide-react";

// // import {
// //   getOpexFilterOptions,
// // } from "../../api/opexApi";

// // /* =========================================================
// //    DEFAULT FILTERS
// // ========================================================= */

// // const DEFAULT_FILTERS = {
// //   legal_group: [],
// //   legal_entity: [],
// //   parent_division: [],
// //   subdivision: [],
// //   currency: "",
// //   as_on_date: "",
// //   period: [],
// //   compare_with: "",
// //   reporting_currency: "AED",
// //   year: "",
// // };

// // /* =========================================================
// //    FIELD WIDTHS
// // ========================================================= */

// // const FIELD_WIDTHS = {
// //   legal_group: 128,
// //   legal_entity: 128,
// //   parent_division: 128,
// //   subdivision: 128,
// //   year: 128,
// //   period: 128,
// //   reporting_currency: 128,
// // };

// // /* =========================================================
// //    OPTION VALUE
// // ========================================================= */

// // const getOptionValue = (option) => {
// //   if (
// //     option === null ||
// //     option === undefined
// //   ) {
// //     return "";
// //   }

// //   if (
// //     typeof option === "object"
// //   ) {
// //     return (
// //       option.value ??
// //       option.id ??
// //       option.code ??
// //       option.period_name ??
// //       option.year ??
// //       option.name ??
// //       option.currency_code ??
// //       ""
// //     );
// //   }

// //   return option;
// // };

// // /* =========================================================
// //    OPTION LABEL
// // ========================================================= */

// // const getOptionLabel = (option) => {
// //   if (
// //     option === null ||
// //     option === undefined
// //   ) {
// //     return "";
// //   }

// //   if (
// //     typeof option === "object"
// //   ) {
// //     return (
// //       option.label ??
// //       option.name ??
// //       option.period_name ??
// //       option.year ??
// //       option.currency_name ??
// //       option.currency_code ??
// //       option.value ??
// //       option.code ??
// //       ""
// //     );
// //   }

// //   return option;
// // };

// // /* =========================================================
// //    LATEST PERIOD
// // ========================================================= */

// // function getLatestPeriod(periods = []) {
// //   if (
// //     !Array.isArray(periods) ||
// //     periods.length === 0
// //   ) {
// //     return "";
// //   }

// //   return getOptionValue(
// //     periods[periods.length - 1]
// //   );
// // }

// // /* =========================================================
// //    NORMALIZE YEARS
// // ========================================================= */

// // function normalizeYears(
// //   payload = {},
// //   periods = []
// // ) {
// //   const rawYears =
// //     payload?.years ||
// //     payload?.fiscal_years ||
// //     payload?.accounting_years ||
// //     [];

// //   if (
// //     Array.isArray(rawYears) &&
// //     rawYears.length
// //   ) {
// //     return rawYears;
// //   }

// //   const derived = [];

// //   if (
// //     Array.isArray(periods)
// //   ) {
// //     periods.forEach(
// //       (period) => {
// //         if (
// //           !period ||
// //           typeof period !== "object"
// //         ) {
// //           return;
// //         }

// //         const year =
// //           period.year ??
// //           period.fiscal_year ??
// //           period.accounting_year ??
// //           null;

// //         if (
// //           year === null ||
// //           year === undefined ||
// //           year === ""
// //         ) {
// //           return;
// //         }

// //         const exists =
// //           derived.some(
// //             (item) =>
// //               String(
// //                 getOptionValue(item)
// //               ) === String(year)
// //           );

// //         if (!exists) {
// //           derived.push({
// //             value: year,
// //             label: year,
// //           });
// //         }
// //       }
// //     );
// //   }

// //   return derived;
// // }

// // /* =========================================================
// //    NORMALIZE CURRENCY
// // ========================================================= */

// // function normalizeCurrencyOptions(
// //   rawCurrencies
// // ) {
// //   if (
// //     rawCurrencies === null ||
// //     rawCurrencies === undefined ||
// //     rawCurrencies === ""
// //   ) {
// //     return [];
// //   }

// //   if (
// //     typeof rawCurrencies === "string" ||
// //     typeof rawCurrencies === "number"
// //   ) {
// //     const value =
// //       String(rawCurrencies);

// //     return [
// //       {
// //         value,
// //         label: value,
// //       },
// //     ];
// //   }

// //   if (
// //     Array.isArray(rawCurrencies)
// //   ) {
// //     return rawCurrencies
// //       .map((item) => {
// //         if (
// //           item === null ||
// //           item === undefined ||
// //           item === ""
// //         ) {
// //           return null;
// //         }

// //         if (
// //           typeof item === "string" ||
// //           typeof item === "number"
// //         ) {
// //           const value =
// //             String(item);

// //           return {
// //             value,
// //             label: value,
// //           };
// //         }

// //         if (
// //           typeof item === "object"
// //         ) {
// //           const value =
// //             item.currency_code ??
// //             item.currencyCode ??
// //             item.currency ??
// //             item.value ??
// //             item.code ??
// //             item.id ??
// //             "";

// //           const label =
// //             item.label ??
// //             item.name ??
// //             item.currency_name ??
// //             item.currency_code ??
// //             item.currencyCode ??
// //             item.currency ??
// //             item.value ??
// //             item.code ??
// //             value;

// //           if (!value) {
// //             return null;
// //           }

// //           return {
// //             value: String(value),
// //             label: String(label),
// //           };
// //         }

// //         return null;
// //       })
// //       .filter(Boolean);
// //   }

// //   if (
// //     typeof rawCurrencies === "object"
// //   ) {
// //     const directValue =
// //       rawCurrencies.currency_code ??
// //       rawCurrencies.currencyCode ??
// //       rawCurrencies.currency ??
// //       rawCurrencies.value ??
// //       rawCurrencies.code ??
// //       rawCurrencies.id;

// //     if (
// //       directValue !== null &&
// //       directValue !== undefined &&
// //       directValue !== ""
// //     ) {
// //       const value =
// //         String(directValue);

// //       const label =
// //         rawCurrencies.label ??
// //         rawCurrencies.name ??
// //         rawCurrencies.currency_name ??
// //         rawCurrencies.currency_code ??
// //         rawCurrencies.currencyCode ??
// //         rawCurrencies.currency ??
// //         rawCurrencies.value ??
// //         rawCurrencies.code ??
// //         value;

// //       return [
// //         {
// //           value,
// //           label: String(label),
// //         },
// //       ];
// //     }

// //     return Object.entries(
// //       rawCurrencies
// //     )
// //       .map(
// //         ([key, item]) => {
// //           if (
// //             item === null ||
// //             item === undefined ||
// //             item === ""
// //           ) {
// //             return {
// //               value: String(key),
// //               label: String(key),
// //             };
// //           }

// //           if (
// //             typeof item === "string" ||
// //             typeof item === "number"
// //           ) {
// //             return {
// //               value: String(item),
// //               label: String(item),
// //             };
// //           }

// //           if (
// //             typeof item === "object"
// //           ) {
// //             const value =
// //               item.currency_code ??
// //               item.currencyCode ??
// //               item.currency ??
// //               item.value ??
// //               item.code ??
// //               key;

// //             const label =
// //               item.label ??
// //               item.name ??
// //               item.currency_name ??
// //               item.currency_code ??
// //               item.currencyCode ??
// //               item.currency ??
// //               item.value ??
// //               item.code ??
// //               value;

// //             return {
// //               value: String(value),
// //               label: String(label),
// //             };
// //           }

// //           return {
// //             value: String(key),
// //             label: String(key),
// //           };
// //         }
// //       )
// //       .filter(
// //         (item) =>
// //           item.value !== ""
// //       );
// //   }

// //   return [];
// // }

// // /* =========================================================
// //    NORMALIZE API OPTIONS
// // ========================================================= */

// // function normalizeOpexFilterOptions(
// //   data = {}
// // ) {
// //   const payload =
// //     data?.data &&
// //       typeof data.data === "object" &&
// //       !Array.isArray(data.data)
// //       ? data.data
// //       : data;

// //   const rawCurrencies =
// //     payload?.reporting_currencies ??
// //     payload?.currencies ??
// //     payload?.currency_options ??
// //     payload?.ledger_currencies ??
// //     payload?.reporting_currency ??
// //     [];

// //   let currencies =
// //     normalizeCurrencyOptions(
// //       rawCurrencies
// //     );

// //   if (
// //     !currencies.length &&
// //     payload?.default_reporting_currency
// //   ) {
// //     currencies =
// //       normalizeCurrencyOptions(
// //         payload.default_reporting_currency
// //       );
// //   }

// //   const periods =
// //     Array.isArray(
// //       payload?.periods
// //     )
// //       ? payload.periods
// //       : [];

// //   return {
// //     legal_groups:
// //       Array.isArray(
// //         payload?.legal_groups
// //       )
// //         ? payload.legal_groups
// //         : [],

// //     legal_entities:
// //       Array.isArray(
// //         payload?.legal_entities
// //       )
// //         ? payload.legal_entities
// //         : [],

// //     parent_divisions:
// //       Array.isArray(
// //         payload?.parent_divisions
// //       )
// //         ? payload.parent_divisions
// //         : [],

// //     subdivisions:
// //       Array.isArray(
// //         payload?.subdivisions
// //       )
// //         ? payload.subdivisions
// //         : [],

// //     periods,

// //     years:
// //       normalizeYears(
// //         payload,
// //         periods
// //       ),

// //     reporting_currencies:
// //       currencies,

// //     currencies,

// //     compare_with:
// //       Array.isArray(
// //         payload?.compare_with
// //       )
// //         ? payload.compare_with
// //         : Array.isArray(
// //           payload?.compare_periods
// //         )
// //           ? payload.compare_periods
// //           : [],

// //     data_as_of:
// //       payload?.data_as_of ||
// //       null,

// //     default_reporting_currency:
// //       payload?.default_reporting_currency ||
// //       "AED",
// //   };
// // }

// // /* =========================================================
// //    CLOSED SELECT STYLE
// // ========================================================= */

// // const selectStyle = {
// //   appearance: "none",

// //   padding:
// //     "6px 28px 6px 10px",

// //   fontSize:
// //     "0.78rem",

// //   fontWeight: 500,

// //   color:
// //     "#334155",

// //   backgroundColor:
// //     "#fff",

// //   border:
// //     "1px solid #e2e8f0",

// //   borderRadius: 7,

// //   cursor: "pointer",

// //   outline: "none",

// //   width: "100%",

// //   height: 34,

// //   boxSizing: "border-box",

// //   backgroundImage:
// //     "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",

// //   backgroundRepeat:
// //     "no-repeat",

// //   backgroundPosition:
// //     "right 8px center",
// // };

// // /* =========================================================
// //    FILTER FIELD
// // ========================================================= */

// // function FilterField({
// //   label,
// //   children,
// //   width,
// // }) {
// //   return (
// //     <div
// //       style={{
// //         display: "flex",
// //         flexDirection: "column",
// //         gap: 4,
// //         minWidth: width,
// //         width,
// //         flex: "0 0 auto",
// //       }}
// //     >
// //       <span
// //         style={{
// //           fontSize: "0.66rem",
// //           color: "#1e3a8a",
// //           fontWeight: 700,
// //           letterSpacing: "-0.02em",
// //           whiteSpace: "nowrap",
// //           lineHeight: 1.2,
// //         }}
// //       >
// //         {label}
// //       </span>

// //       {children}
// //     </div>
// //   );
// // }

// // /* =========================================================
// //    MULTI SELECT
// // ========================================================= */

// // function OpexMultiSelect({
// //   options = [],
// //   value = [],
// //   onChange,
// //   placeholder = "All",
// //   searchPlaceholder = "Search...",
// //   width = 128,
// // }) {
// //   const [open, setOpen] =
// //     useState(false);

// //   const [
// //     searchQuery,
// //     setSearchQuery,
// //   ] = useState("");

// //   const ref =
// //     useRef(null);

// //   const searchRef =
// //     useRef(null);

// //   const triggerRef =
// //     useRef(null);

// //   const dropdownRef =
// //     useRef(null);

// //   /*
// //    * IMPORTANT:
// //    *
// //    * `menuReady` prevents the dropdown from being
// //    * rendered temporarily at top: 0 / left: 0.
// //    *
// //    * This was the source of the visible blinking/
// //    * disappearing effect while opening and rerendering.
// //    */
// //   const [
// //     menuReady,
// //     setMenuReady,
// //   ] = useState(false);

// //   const [
// //     menuPosition,
// //     setMenuPosition,
// //   ] = useState({
// //     top: 0,
// //     left: 0,
// //     width: Math.max(width, 225),
// //     maxHeight: 300,
// //   });

// //   /* =======================================================
// //      UPDATE POSITION
// //   ======================================================= */

// //   const updateMenuPosition = () => {
// //     const trigger =
// //       triggerRef.current;

// //     if (!trigger) {
// //       return;
// //     }

// //     const rect =
// //       trigger.getBoundingClientRect();

// //     const menuWidth =
// //       Math.max(width, 225);

// //     const viewportPadding = 8;

// //     const preferredHeight = 300;

// //     const spaceBelow =
// //       window.innerHeight -
// //       rect.bottom -
// //       viewportPadding;

// //     const spaceAbove =
// //       rect.top -
// //       viewportPadding;

// //     const openAbove =
// //       spaceBelow < 180 &&
// //       spaceAbove > spaceBelow;

// //     const availableHeight =
// //       Math.max(
// //         120,
// //         Math.min(
// //           preferredHeight,
// //           openAbove
// //             ? spaceAbove
// //             : spaceBelow
// //         )
// //       );

// //     const top =
// //       openAbove
// //         ? Math.max(
// //           viewportPadding,
// //           rect.top -
// //           availableHeight -
// //           3
// //         )
// //         : rect.bottom + 3;

// //     const maxLeft =
// //       Math.max(
// //         viewportPadding,
// //         window.innerWidth -
// //         menuWidth -
// //         viewportPadding
// //       );

// //     const left =
// //       Math.min(
// //         Math.max(
// //           rect.left,
// //           viewportPadding
// //         ),
// //         maxLeft
// //       );

// //     setMenuPosition({
// //       top,
// //       left,
// //       width: menuWidth,
// //       maxHeight: availableHeight,
// //     });

// //     setMenuReady(true);
// //   };

// //   /* =======================================================
// //      OPEN DROPDOWN
     
// //      IMPORTANT:
// //      Calculate the position BEFORE setting open=true.
// //      This prevents the first render from appearing at
// //      top: 0 / left: 0.
// //   ======================================================= */

// //   const openDropdown = () => {
// //     updateMenuPosition();
// //     setOpen(true);
// //   };

// //   /* =======================================================
// //      POSITION WHILE OPEN
     
// //      IMPORTANT:
// //      `value` is intentionally NOT included.
     
// //      Selecting an item must not cause the menu to
// //      recalculate or disappear.
// //   ======================================================= */

// //   useEffect(() => {
// //     if (!open) {
// //       return undefined;
// //     }

// //     /*
// //      * Recheck once after the browser has completed
// //      * the opening render. This handles layout changes
// //      * without causing an initial visible jump.
// //      */
// //     const frame =
// //       requestAnimationFrame(() => {
// //         updateMenuPosition();
// //       });

// //     const handleViewportChange = () => {
// //       updateMenuPosition();
// //     };

// //     window.addEventListener(
// //       "resize",
// //       handleViewportChange
// //     );

// //     window.addEventListener(
// //       "scroll",
// //       handleViewportChange,
// //       true
// //     );

// //     return () => {
// //       cancelAnimationFrame(frame);

// //       window.removeEventListener(
// //         "resize",
// //         handleViewportChange
// //       );

// //       window.removeEventListener(
// //         "scroll",
// //         handleViewportChange,
// //         true
// //       );
// //     };
// //   }, [
// //     open,
// //     width,
// //   ]);

// //   /* =======================================================
// //      CLOSE WHEN CLICKING ANYWHERE OUTSIDE
// //   ======================================================= */

// //   useEffect(() => {
// //     const handleOutside = (event) => {
// //       const target =
// //         event.target;

// //       const clickedTrigger =
// //         ref.current?.contains(
// //           target
// //         );

// //       const clickedDropdown =
// //         dropdownRef.current?.contains(
// //           target
// //         );

// //       if (
// //         !clickedTrigger &&
// //         !clickedDropdown
// //       ) {
// //         setOpen(false);
// //         setMenuReady(false);
// //         setSearchQuery("");
// //       }
// //     };

// //     document.addEventListener(
// //       "mousedown",
// //       handleOutside
// //     );

// //     return () => {
// //       document.removeEventListener(
// //         "mousedown",
// //         handleOutside
// //       );
// //     };
// //   }, []);

// //   /* =======================================================
// //      FOCUS SEARCH
// //   ======================================================= */

// //   useEffect(() => {
// //     if (
// //       open &&
// //       searchRef.current
// //     ) {
// //       requestAnimationFrame(() => {
// //         searchRef.current?.focus();
// //       });
// //     }

// //     if (!open) {
// //       setSearchQuery("");
// //     }
// //   }, [open]);

// //   /* =======================================================
// //      NORMALIZE
// //   ======================================================= */

// //   const normalized =
// //     (options || [])
// //       .map((option) => {
// //         if (
// //           option === null ||
// //           option === undefined
// //         ) {
// //           return null;
// //         }

// //         if (
// //           typeof option === "string" ||
// //           typeof option === "number"
// //         ) {
// //           return {
// //             id: String(option),
// //             name: String(option),
// //           };
// //         }

// //         const id =
// //           option.value !== undefined
// //             ? option.value
// //             : option.id !== undefined
// //               ? option.id
// //               : option.code !== undefined
// //                 ? option.code
// //                 : "";

// //         const name =
// //           option.label !== undefined
// //             ? option.label
// //             : option.name !== undefined
// //               ? option.name
// //               : option.period_name !== undefined
// //                 ? option.period_name
// //                 : String(id);

// //         if (
// //           id === null ||
// //           id === undefined ||
// //           id === ""
// //         ) {
// //           return null;
// //         }

// //         return {
// //           id: String(id),
// //           name: String(name),
// //         };
// //       })
// //       .filter(Boolean);

// //   const currentValues =
// //     Array.isArray(value)
// //       ? value.map(String)
// //       : [];

// //   /* =======================================================
// //      SEARCH
// //   ======================================================= */

// //   const query =
// //     searchQuery
// //       .trim()
// //       .toLowerCase();

// //   const visibleOptions =
// //     query
// //       ? normalized.filter(
// //         (option) =>
// //           option.name
// //             .toLowerCase()
// //             .includes(query) ||
// //           option.id
// //             .toLowerCase()
// //             .includes(query)
// //       )
// //       : normalized;

// //   /* =======================================================
// //      DISPLAY
// //   ======================================================= */

// //   const isAll =
// //     currentValues.length === 0;

// //   const isAllSelected =
// //     normalized.length > 0 &&
// //     currentValues.length ===
// //     normalized.length &&
// //     normalized.every(
// //       (option) =>
// //         currentValues.includes(
// //           option.id
// //         )
// //     );

// //   const selectedOptions =
// //     normalized.filter(
// //       (option) =>
// //         currentValues.includes(
// //           option.id
// //         )
// //     );

// //   const displayText =
// //     isAll
// //       ? placeholder
// //       : isAllSelected
// //         ? "All"
// //         : selectedOptions.length === 1
// //           ? selectedOptions[0].name
// //           : `${selectedOptions.length} selected`;

// //   /* =======================================================
// //      TOGGLE
     
// //      IMPORTANT:
// //      Dropdown stays open.
// //   ======================================================= */

// //   const toggleValue = (id) => {
// //     const stringId =
// //       String(id);

// //     if (
// //       currentValues.includes(
// //         stringId
// //       )
// //     ) {
// //       onChange?.(
// //         currentValues.filter(
// //           (item) =>
// //             item !== stringId
// //         )
// //       );
// //     } else {
// //       onChange?.([
// //         ...currentValues,
// //         stringId,
// //       ]);
// //     }

// //     /*
// //      * DO NOT close.
// //      *
// //      * DO NOT update menu position here.
// //      *
// //      * The dropdown remains exactly where
// //      * it was while the parent/API updates.
// //      */
// //   };

// //   /* =======================================================
// //      SELECT ALL
// //   ======================================================= */

// //   const handleSelectAll = () => {
// //     onChange?.(
// //       normalized.map(
// //         (option) =>
// //           option.id
// //       )
// //     );
// //   };

// //   /* =======================================================
// //      CLEAR
// //   ======================================================= */

// //   const handleClear = () => {
// //     onChange?.([]);
// //   };

// //   /* =======================================================
// //      RENDER
// //   ======================================================= */

// //   return (
// //     <div
// //       ref={ref}
// //       style={{
// //         position: "relative",
// //         width,
// //       }}
// //     >
// //       {/* CLOSED SELECT */}

// //       <button
// //         ref={triggerRef}
// //         type="button"
// //         onClick={() => {
// //           if (open) {
// //             setOpen(false);
// //             setMenuReady(false);
// //             setSearchQuery("");
// //           } else {
// //             openDropdown();
// //           }
// //         }}
// //         style={{
// //           ...selectStyle,
// //           textAlign: "left",
// //           overflow: "hidden",
// //           textOverflow: "ellipsis",
// //           whiteSpace: "nowrap",
// //         }}
// //         title={displayText}
// //       >
// //         {displayText}
// //       </button>

// //       {/* DROPDOWN */}

// //       {open && menuReady && (
// //         <div
// //           ref={dropdownRef}
// //           style={{
// //             position: "fixed",

// //             top:
// //               menuPosition.top,

// //             left:
// //               menuPosition.left,

// //             width:
// //               menuPosition.width,

// //             maxHeight:
// //               menuPosition.maxHeight,

// //             overflowY: "auto",

// //             overflowX: "hidden",

// //             background: "#fff",

// //             border:
// //               "1px solid #e2e8f0",

// //             borderRadius: 7,

// //             boxShadow:
// //               "0 8px 22px rgba(15,23,42,0.14)",

// //             zIndex: 99999,

// //             padding: 6,

// //             boxSizing: "border-box",

// //             scrollbarWidth: "thin",

// //             scrollbarColor:
// //               "#64748b #f1f5f9",
// //           }}
// //         >
// //           {/* SEARCH */}

// //           <div
// //             style={{
// //               position: "relative",
// //               marginBottom: 4,
// //             }}
// //           >
// //             <Search
// //               size={13}
// //               style={{
// //                 position:
// //                   "absolute",

// //                 left: 8,

// //                 top: 8,

// //                 color:
// //                   "#94a3b8",

// //                 pointerEvents:
// //                   "none",
// //               }}
// //             />

// //             <input
// //               ref={searchRef}
// //               type="text"
// //               value={searchQuery}
// //               onChange={(event) =>
// //                 setSearchQuery(
// //                   event.target.value
// //                 )
// //               }
// //               placeholder={
// //                 searchPlaceholder
// //               }
// //               style={{
// //                 width: "100%",

// //                 height: 30,

// //                 boxSizing:
// //                   "border-box",

// //                 border:
// //                   "1px solid #dbe3ef",

// //                 borderRadius: 6,

// //                 padding:
// //                   "0 8px 0 26px",

// //                 outline: "none",

// //                 fontSize:
// //                   "0.72rem",

// //                 color:
// //                   "#334155",

// //                 background:
// //                   "#fff",
// //               }}
// //             />
// //           </div>

// //           {/* SELECT ALL / CLEAR */}

// //           <div
// //             style={{
// //               display: "flex",

// //               alignItems:
// //                 "center",

// //               justifyContent:
// //                 "space-between",

// //               height: 25,

// //               padding:
// //                 "0 6px",

// //               marginBottom: 1,
// //             }}
// //           >
// //             <button
// //               type="button"
// //               onClick={
// //                 handleSelectAll
// //               }
// //               style={{
// //                 border: "none",

// //                 background:
// //                   "transparent",

// //                 padding: 0,

// //                 margin: 0,

// //                 cursor:
// //                   "pointer",

// //                 fontSize:
// //                   "0.68rem",

// //                 lineHeight:
// //                   "18px",

// //                 fontWeight: 600,

// //                 color:
// //                   "#4f46e5",
// //               }}
// //             >
// //               Select All
// //             </button>

// //             <button
// //               type="button"
// //               onClick={
// //                 handleClear
// //               }
// //               style={{
// //                 border: "none",

// //                 background:
// //                   "transparent",

// //                 padding: 0,

// //                 margin: 0,

// //                 cursor:
// //                   "pointer",

// //                 fontSize:
// //                   "0.68rem",

// //                 lineHeight:
// //                   "18px",

// //                 fontWeight: 500,

// //                 color:
// //                   "#64748b",
// //               }}
// //             >
// //               Clear
// //             </button>
// //           </div>

// //           {/* VALUES */}

// //           {visibleOptions.map(
// //             (option) => {
// //               const checked =
// //                 currentValues.includes(
// //                   option.id
// //                 );

// //               return (
// //                 <label
// //                   key={option.id}
// //                   style={{
// //                     display: "flex",

// //                     alignItems:
// //                       "center",

// //                     gap: 6,

// //                     width: "100%",

// //                     height: 27,

// //                     minHeight: 27,

// //                     boxSizing:
// //                       "border-box",

// //                     padding:
// //                       "2px 6px",

// //                     margin: 0,

// //                     borderRadius: 4,

// //                     cursor:
// //                       "pointer",

// //                     fontSize:
// //                       "0.72rem",

// //                     lineHeight:
// //                       "18px",

// //                     fontWeight:
// //                       checked
// //                         ? 600
// //                         : 500,

// //                     color:
// //                       "#334155",

// //                     background:
// //                       checked
// //                         ? "#f5f7ff"
// //                         : "#fff",
// //                   }}
// //                 >
// //                   <input
// //                     type="checkbox"
// //                     checked={
// //                       checked
// //                     }
// //                     onChange={() =>
// //                       toggleValue(
// //                         option.id
// //                       )
// //                     }
// //                     style={{
// //                       margin: 0,

// //                       padding: 0,

// //                       width: 14,

// //                       height: 14,

// //                       flexShrink: 0,

// //                       accentColor:
// //                         "#4f46e5",

// //                       cursor:
// //                         "pointer",
// //                     }}
// //                   />

// //                   <span
// //                     style={{
// //                       display:
// //                         "block",

// //                       minWidth: 0,

// //                       overflow:
// //                         "hidden",

// //                       textOverflow:
// //                         "ellipsis",

// //                       whiteSpace:
// //                         "nowrap",

// //                       lineHeight:
// //                         "18px",
// //                     }}
// //                     title={
// //                       option.name
// //                     }
// //                   >
// //                     {option.name}
// //                   </span>
// //                 </label>
// //               );
// //             }
// //           )}

// //           {!visibleOptions.length && (
// //             <div
// //               style={{
// //                 padding:
// //                   "10px 6px",

// //                 textAlign:
// //                   "center",

// //                 fontSize:
// //                   "0.7rem",

// //                 color:
// //                   "#94a3b8",
// //               }}
// //             >
// //               No options found
// //             </div>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // /* =========================================================
// //    SINGLE SELECT
// // ========================================================= */

// // function OpexSingleSelect({
// //   options = [],
// //   value = "",
// //   onChange,
// //   placeholder = "Select",
// //   searchPlaceholder = "Search...",
// //   width = 128,
// //   searchable = true,
// // }) {
// //   const [open, setOpen] =
// //     useState(false);

// //   const [
// //     searchQuery,
// //     setSearchQuery,
// //   ] = useState("");

// //   const ref =
// //     useRef(null);

// //   const searchRef =
// //     useRef(null);

// //   const triggerRef =
// //     useRef(null);

// //   const dropdownRef =
// //     useRef(null);

// //   const [
// //     menuReady,
// //     setMenuReady,
// //   ] = useState(false);

// //   const [
// //     menuPosition,
// //     setMenuPosition,
// //   ] = useState({
// //     top: 0,
// //     left: 0,
// //     width: Math.max(width, 225),
// //     maxHeight: 300,
// //   });

// //   /* =======================================================
// //      UPDATE POSITION
// //   ======================================================= */

// //   const updateMenuPosition = () => {
// //     const trigger =
// //       triggerRef.current;

// //     if (!trigger) {
// //       return;
// //     }

// //     const rect =
// //       trigger.getBoundingClientRect();

// //     const menuWidth =
// //       Math.max(width, 225);

// //     const viewportPadding = 8;

// //     const preferredHeight = 300;

// //     const spaceBelow =
// //       window.innerHeight -
// //       rect.bottom -
// //       viewportPadding;

// //     const spaceAbove =
// //       rect.top -
// //       viewportPadding;

// //     const openAbove =
// //       spaceBelow < 180 &&
// //       spaceAbove > spaceBelow;

// //     const availableHeight =
// //       Math.max(
// //         120,
// //         Math.min(
// //           preferredHeight,
// //           openAbove
// //             ? spaceAbove
// //             : spaceBelow
// //         )
// //       );

// //     const top =
// //       openAbove
// //         ? Math.max(
// //           viewportPadding,
// //           rect.top -
// //           availableHeight -
// //           3
// //         )
// //         : rect.bottom + 3;

// //     const maxLeft =
// //       Math.max(
// //         viewportPadding,
// //         window.innerWidth -
// //         menuWidth -
// //         viewportPadding
// //       );

// //     const left =
// //       Math.min(
// //         Math.max(
// //           rect.left,
// //           viewportPadding
// //         ),
// //         maxLeft
// //       );

// //     setMenuPosition({
// //       top,
// //       left,
// //       width: menuWidth,
// //       maxHeight:
// //         availableHeight,
// //     });

// //     setMenuReady(true);
// //   };

// //   /* =======================================================
// //      OPEN DROPDOWN
// //   ======================================================= */

// //   const openDropdown = () => {
// //     updateMenuPosition();
// //     setOpen(true);
// //   };

// //   /* =======================================================
// //      POSITION ONLY WHILE OPEN
// //   ======================================================= */

// //   useEffect(() => {
// //     if (!open) {
// //       return undefined;
// //     }

// //     const frame =
// //       requestAnimationFrame(() => {
// //         updateMenuPosition();
// //       });

// //     const handleViewportChange =
// //       () => {
// //         updateMenuPosition();
// //       };

// //     window.addEventListener(
// //       "resize",
// //       handleViewportChange
// //     );

// //     window.addEventListener(
// //       "scroll",
// //       handleViewportChange,
// //       true
// //     );

// //     return () => {
// //       cancelAnimationFrame(frame);

// //       window.removeEventListener(
// //         "resize",
// //         handleViewportChange
// //       );

// //       window.removeEventListener(
// //         "scroll",
// //         handleViewportChange,
// //         true
// //       );
// //     };
// //   }, [
// //     open,
// //     width,
// //   ]);

// //   /* =======================================================
// //      CLOSE ANYWHERE OUTSIDE
// //   ======================================================= */

// //   useEffect(() => {
// //     const handleOutside =
// //       (event) => {
// //         const target =
// //           event.target;

// //         const clickedTrigger =
// //           ref.current?.contains(
// //             target
// //           );

// //         const clickedDropdown =
// //           dropdownRef.current?.contains(
// //             target
// //           );

// //         if (
// //           !clickedTrigger &&
// //           !clickedDropdown
// //         ) {
// //           setOpen(false);
// //           setMenuReady(false);
// //           setSearchQuery("");
// //         }
// //       };

// //     document.addEventListener(
// //       "mousedown",
// //       handleOutside
// //     );

// //     return () => {
// //       document.removeEventListener(
// //         "mousedown",
// //         handleOutside
// //       );
// //     };
// //   }, []);

// //   /* =======================================================
// //      FOCUS SEARCH
// //   ======================================================= */

// //   useEffect(() => {
// //     if (
// //       open &&
// //       searchable &&
// //       searchRef.current
// //     ) {
// //       requestAnimationFrame(() => {
// //         searchRef.current?.focus();
// //       });
// //     }

// //     if (!open) {
// //       setSearchQuery("");
// //     }
// //   }, [
// //     open,
// //     searchable,
// //   ]);

// //   /* =======================================================
// //      NORMALIZE
// //   ======================================================= */

// //   const normalized =
// //     (options || [])
// //       .map((option) => {
// //         if (
// //           option === null ||
// //           option === undefined
// //         ) {
// //           return null;
// //         }

// //         if (
// //           typeof option === "string" ||
// //           typeof option === "number"
// //         ) {
// //           return {
// //             id: String(option),
// //             name: String(option),
// //           };
// //         }

// //         const id =
// //           option.value !== undefined
// //             ? option.value
// //             : option.id !== undefined
// //               ? option.id
// //               : option.code !== undefined
// //                 ? option.code
// //                 : "";

// //         const name =
// //           option.label !== undefined
// //             ? option.label
// //             : option.name !== undefined
// //               ? option.name
// //               : option.period_name !== undefined
// //                 ? option.period_name
// //                 : String(id);

// //         if (
// //           id === null ||
// //           id === undefined ||
// //           id === ""
// //         ) {
// //           return null;
// //         }

// //         return {
// //           id: String(id),
// //           name: String(name),
// //         };
// //       })
// //       .filter(Boolean);

// //   const currentValue =
// //     value === null ||
// //       value === undefined
// //       ? ""
// //       : String(value);

// //   const currentOption =
// //     normalized.find(
// //       (option) =>
// //         option.id ===
// //         currentValue
// //     );

// //   /* =======================================================
// //      SEARCH
// //   ======================================================= */

// //   const query =
// //     searchQuery
// //       .trim()
// //       .toLowerCase();

// //   const visibleOptions =
// //     searchable && query
// //       ? normalized.filter(
// //         (option) =>
// //           option.name
// //             .toLowerCase()
// //             .includes(query) ||
// //           option.id
// //             .toLowerCase()
// //             .includes(query)
// //       )
// //       : normalized;

// //   const displayText =
// //     currentOption?.name ||
// //     placeholder;

// //   /* =======================================================
// //      SELECT
// //   ======================================================= */

// //   const handleSelect =
// //     (option) => {
// //       onChange?.(
// //         option.id
// //       );

// //       setOpen(false);
// //       setMenuReady(false);
// //       setSearchQuery("");
// //     };

// //   /* =======================================================
// //      RENDER
// //   ======================================================= */

// //   return (
// //     <div
// //       ref={ref}
// //       style={{
// //         position: "relative",
// //         width,
// //       }}
// //     >
// //       <button
// //         ref={triggerRef}
// //         type="button"
// //         onClick={() => {
// //           if (open) {
// //             setOpen(false);
// //             setMenuReady(false);
// //             setSearchQuery("");
// //           } else {
// //             openDropdown();
// //           }
// //         }}
// //         style={{
// //           ...selectStyle,
// //           textAlign: "left",
// //           overflow: "hidden",
// //           textOverflow:
// //             "ellipsis",
// //           whiteSpace:
// //             "nowrap",
// //         }}
// //         title={displayText}
// //       >
// //         {displayText}
// //       </button>

// //       {open && menuReady && (
// //         <div
// //           ref={dropdownRef}
// //           style={{
// //             position: "fixed",

// //             top:
// //               menuPosition.top,

// //             left:
// //               menuPosition.left,

// //             width:
// //               menuPosition.width,

// //             maxHeight:
// //               menuPosition.maxHeight,

// //             overflowY: "auto",

// //             overflowX: "hidden",

// //             background: "#fff",

// //             border:
// //               "1px solid #e2e8f0",

// //             borderRadius: 7,

// //             boxShadow:
// //               "0 8px 22px rgba(15,23,42,0.14)",

// //             zIndex: 99999,

// //             padding: 6,

// //             boxSizing:
// //               "border-box",

// //             scrollbarWidth:
// //               "thin",

// //             scrollbarColor:
// //               "#64748b #f1f5f9",
// //           }}
// //         >
// //           {searchable && (
// //             <div
// //               style={{
// //                 position:
// //                   "relative",

// //                 marginBottom: 4,
// //               }}
// //             >
// //               <Search
// //                 size={13}
// //                 style={{
// //                   position:
// //                     "absolute",

// //                   left: 8,

// //                   top: 8,

// //                   color:
// //                     "#94a3b8",

// //                   pointerEvents:
// //                     "none",
// //                 }}
// //               />

// //               <input
// //                 ref={searchRef}
// //                 type="text"
// //                 value={
// //                   searchQuery
// //                 }
// //                 onChange={(
// //                   event
// //                 ) =>
// //                   setSearchQuery(
// //                     event.target.value
// //                   )
// //                 }
// //                 placeholder={
// //                   searchPlaceholder
// //                 }
// //                 style={{
// //                   width: "100%",

// //                   height: 30,

// //                   boxSizing:
// //                     "border-box",

// //                   border:
// //                     "1px solid #dbe3ef",

// //                   borderRadius: 6,

// //                   padding:
// //                     "0 8px 0 26px",

// //                   outline: "none",

// //                   fontSize:
// //                     "0.72rem",

// //                   color:
// //                     "#334155",

// //                   background:
// //                     "#fff",
// //                 }}
// //               />
// //             </div>
// //           )}

// //           {visibleOptions.map(
// //             (option) => {
// //               const selected =
// //                 option.id ===
// //                 currentValue;

// //               return (
// //                 <button
// //                   key={
// //                     option.id
// //                   }
// //                   type="button"
// //                   onClick={() =>
// //                     handleSelect(
// //                       option
// //                     )
// //                   }
// //                   style={{
// //                     width: "100%",

// //                     height: 27,

// //                     minHeight: 27,

// //                     boxSizing:
// //                       "border-box",

// //                     border: "none",

// //                     background:
// //                       selected
// //                         ? "#f5f7ff"
// //                         : "#fff",

// //                     textAlign:
// //                       "left",

// //                     padding:
// //                       "2px 8px",

// //                     margin: 0,

// //                     borderRadius: 4,

// //                     cursor:
// //                       "pointer",

// //                     fontSize:
// //                       "0.72rem",

// //                     lineHeight:
// //                       "18px",

// //                     fontWeight:
// //                       selected
// //                         ? 600
// //                         : 500,

// //                     color:
// //                       "#334155",

// //                     overflow:
// //                       "hidden",

// //                     textOverflow:
// //                       "ellipsis",

// //                     whiteSpace:
// //                       "nowrap",
// //                   }}
// //                   title={
// //                     option.name
// //                   }
// //                 >
// //                   {option.name}
// //                 </button>
// //               );
// //             }
// //           )}

// //           {!visibleOptions.length && (
// //             <div
// //               style={{
// //                 padding:
// //                   "10px 6px",

// //                 textAlign:
// //                   "center",

// //                 fontSize:
// //                   "0.7rem",

// //                 color:
// //                   "#94a3b8",
// //               }}
// //             >
// //               No options found
// //             </div>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // /* =========================================================
// //    OPEX FILTERS
// // ========================================================= */

// // export default function OpexFilters({
// //   filterOptions = {},
// //   selectedFilters:
// //     externalSelectedFilters,
// //   onChange,
// //   onApply,
// //   onReset,
// // }) {
// //   const [
// //     opexFilterOptions,
// //     setOpexFilterOptions,
// //   ] = useState(
// //     normalizeOpexFilterOptions(
// //       filterOptions
// //     )
// //   );

// //   const [
// //     selectedFilters,
// //     setSelectedFilters,
// //   ] = useState(() => {
// //     const normalized =
// //       normalizeOpexFilterOptions(
// //         filterOptions
// //       );

// //     const years =
// //       normalized.years || [];

// //     const periods =
// //       normalized.periods || [];

// //     const firstYear =
// //       years.length
// //         ? getOptionValue(
// //           years[0]
// //         )
// //         : "";

// //     const latestPeriod =
// //       periods.length
// //         ? getLatestPeriod(
// //           periods
// //         )
// //         : "";

// //     return {
// //       ...DEFAULT_FILTERS,

// //       ...(externalSelectedFilters ||
// //         {}),

// //       year:
// //         externalSelectedFilters?.year ||
// //         (firstYear
// //           ? String(firstYear)
// //           : ""),

// //       period:
// //         externalSelectedFilters?.period ||
// //         (latestPeriod
// //           ? [
// //             String(
// //               latestPeriod
// //             ),
// //           ]
// //           : []),

// //       reporting_currency:
// //         externalSelectedFilters
// //           ?.reporting_currency ||
// //         normalized.default_reporting_currency ||
// //         "AED",
// //     };
// //   });

// //   const [
// //     loading,
// //     setLoading,
// //   ] = useState(false);

// //   /* =======================================================
// //      SYNC EXTERNAL FILTERS
// //   ======================================================= */

// //   useEffect(() => {
// //     if (
// //       !externalSelectedFilters
// //     ) {
// //       return;
// //     }

// //     setSelectedFilters(
// //       (previous) => ({
// //         ...previous,
// //         ...externalSelectedFilters,
// //       })
// //     );
// //   }, [
// //     externalSelectedFilters,
// //   ]);

// //   /* =======================================================
// //      LOAD FILTER OPTIONS
// //   ======================================================= */

// //   const loadOpexFilterOptions =
// //     async (
// //       currentFilters = {},
// //       preserveOptionKey = null
// //     ) => {
// //       try {
// //         setLoading(true);

// //         const response =
// //           await getOpexFilterOptions(
// //             currentFilters
// //           );

// //         const normalized =
// //           normalizeOpexFilterOptions(
// //             response
// //           );

// //         setOpexFilterOptions(
// //           (previous) => {
// //             if (
// //               preserveOptionKey
// //             ) {
// //               return {
// //                 ...previous,
// //                 ...normalized,

// //                 [preserveOptionKey]:
// //                   normalized[
// //                     preserveOptionKey
// //                   ] ??
// //                   previous[
// //                     preserveOptionKey
// //                   ] ??
// //                   [],
// //               };
// //             }

// //             return {
// //               ...previous,
// //               ...normalized,
// //             };
// //           }
// //         );

// //         return normalized;
// //       } catch (error) {
// //         console.error(
// //           "Failed to load OPEX filter options:",
// //           error
// //         );

// //         return null;
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //   /* =======================================================
// //      INITIAL OPTIONS
// //   ======================================================= */

// //   useEffect(() => {
// //     void loadOpexFilterOptions(
// //       {}
// //     );
// //   }, []);

// //   /* =======================================================
// //      DEFAULT VALUES
// //   ======================================================= */

// //   useEffect(() => {
// //     if (
// //       !opexFilterOptions
// //     ) {
// //       return;
// //     }

// //     setSelectedFilters(
// //       (previous) => {
// //         const next = {
// //           ...previous,
// //         };

// //         if (
// //           !next.year &&
// //           opexFilterOptions
// //             .years?.length
// //         ) {
// //           next.year =
// //             String(
// //               getOptionValue(
// //                 opexFilterOptions
// //                   .years[0]
// //               )
// //             );
// //         }

// //         if (
// //           (!Array.isArray(
// //             next.period
// //           ) ||
// //             next.period.length ===
// //             0) &&
// //           opexFilterOptions
// //             .periods?.length
// //         ) {
// //           const latestPeriod =
// //             getLatestPeriod(
// //               opexFilterOptions
// //                 .periods
// //             );

// //           if (
// //             latestPeriod
// //           ) {
// //             next.period = [
// //               String(
// //                 latestPeriod
// //               ),
// //             ];
// //           }
// //         }

// //         if (
// //           !next.reporting_currency
// //         ) {
// //           next.reporting_currency =
// //             opexFilterOptions
// //               .default_reporting_currency ||
// //             "AED";
// //         }

// //         return next;
// //       }
// //     );
// //   }, [
// //     opexFilterOptions,
// //   ]);

// //   /* =======================================================
// //      FILTER CHANGE
// //   ======================================================= */

// //   const handleFilterChange = (
// //     key,
// //     value
// //   ) => {
// //     const nextFilters = {
// //       ...selectedFilters,
// //       [key]: value,
// //     };

// //     /*
// //      * Update immediately.
// //      */
// //     setSelectedFilters(
// //       nextFilters
// //     );

// //     /* =====================================================
// //        DEPENDENT DROPDOWN MAPPING
// //     ===================================================== */

// //     const optionKeyMap = {
// //       legal_group:
// //         "legal_entities",

// //       legal_entity:
// //         "parent_divisions",

// //       parent_division:
// //         "subdivisions",
// //     };

// //     const apiKeyMap = {
// //       legal_group:
// //         "legal_group_id",

// //       legal_entity:
// //         "legal_entity_id",

// //       parent_division:
// //         "parent_division_id",
// //     };

// //     const dependentKey =
// //       optionKeyMap[key];

// //     const apiKey =
// //       apiKeyMap[key];

// //     if (
// //       dependentKey &&
// //       apiKey
// //     ) {
// //       const apiFilters = {
// //         year:
// //           nextFilters.year ||
// //           undefined,

// //         period_name:
// //           nextFilters.period ||
// //           undefined,

// //         reporting_currency:
// //           nextFilters
// //             .reporting_currency ||
// //           "AED",

// //         [apiKey]:
// //           Array.isArray(value)
// //             ? value
// //             : value
// //               ? [value]
// //               : [],
// //       };

// //       /* ===================================================
// //          CLEAR LOWER LEVEL FILTERS
// //       =================================================== */

// //       const clearedFilters = {
// //         ...nextFilters,
// //       };

// //       if (
// //         key ===
// //         "legal_group"
// //       ) {
// //         clearedFilters.legal_entity =
// //           [];

// //         clearedFilters.parent_division =
// //           [];

// //         clearedFilters.subdivision =
// //           [];
// //       }

// //       if (
// //         key ===
// //         "legal_entity"
// //       ) {
// //         clearedFilters.parent_division =
// //           [];

// //         clearedFilters.subdivision =
// //           [];
// //       }

// //       if (
// //         key ===
// //         "parent_division"
// //       ) {
// //         clearedFilters.subdivision =
// //           [];
// //       }

// //       setSelectedFilters(
// //         clearedFilters
// //       );

// //       /*
// //        * IMPORTANT:
// //        *
// //        * The currently opened dropdown is NOT
// //        * touched here.
// //        *
// //        * Therefore the dropdown remains open
// //        * while dependent API options load.
// //        */
// //       void loadOpexFilterOptions(
// //         apiFilters,
// //         dependentKey
// //       );
// //     }
// //   };

// //   /* =======================================================
// //      RESET
// //   ======================================================= */

// //   const handleReset = () => {
// //     const years =
// //       opexFilterOptions
// //         .years?.length
// //         ? opexFilterOptions.years
// //         : filterOptions?.years ||
// //         [];

// //     const periods =
// //       opexFilterOptions
// //         .periods?.length
// //         ? opexFilterOptions
// //           .periods
// //         : filterOptions?.periods ||
// //         [];

// //     const firstYear =
// //       years.length
// //         ? getOptionValue(
// //           years[0]
// //         )
// //         : "";

// //     const latestPeriod =
// //       periods.length
// //         ? getLatestPeriod(
// //           periods
// //         )
// //         : "";

// //     const resetFilters = {
// //       ...DEFAULT_FILTERS,

// //       legal_group: [],
// //       legal_entity: [],
// //       parent_division: [],
// //       subdivision: [],

// //       period:
// //         latestPeriod
// //           ? [
// //             String(
// //               latestPeriod
// //             ),
// //           ]
// //           : [],

// //       year:
// //         firstYear
// //           ? String(
// //             firstYear
// //           )
// //           : "",

// //       reporting_currency:
// //         opexFilterOptions
// //           .default_reporting_currency ||
// //         filterOptions
// //           ?.default_reporting_currency ||
// //         "AED",
// //     };

// //     setSelectedFilters(
// //       resetFilters
// //     );

// //     onChange?.(
// //       resetFilters
// //     );

// //     onReset?.();

// //     void loadOpexFilterOptions(
// //       {}
// //     );
// //   };

// //   const options = {
// //     ...filterOptions,
// //     ...opexFilterOptions,
// //   };

// //   /* =======================================================
// //      UI
// //   ======================================================= */

// //   return (
// //     <div
// //       className="card"
// //       style={{
// //         width: "100%",

// //         maxWidth: "100%",

// //         padding:
// //           "10px 16px",

// //         marginBottom: 16,

// //         display: "flex",

// //         alignItems:
// //           "flex-end",

// //         gap: 10,

// //         flexWrap: "wrap",

// //         boxSizing:
// //           "border-box",

// //         overflow: "visible",

// //         position: "relative",

// //         zIndex: 20,

// //         fontFamily:
// //           "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
// //       }}
// //     >
// //       {/* ===================================================
// //           LEGAL GROUP
// //       =================================================== */}

// //       <FilterField
// //         label="Legal Group"
// //         width={
// //           FIELD_WIDTHS.legal_group
// //         }
// //       >
// //         <OpexMultiSelect
// //           options={
// //             options.legal_groups ||
// //             []
// //           }
// //           value={
// //             selectedFilters
// //               .legal_group ||
// //             []
// //           }
// //           onChange={(value) =>
// //             handleFilterChange(
// //               "legal_group",
// //               value
// //             )
// //           }
// //           placeholder="All"
// //           searchPlaceholder="Search Legal Group"
// //           width={
// //             FIELD_WIDTHS.legal_group
// //           }
// //         />
// //       </FilterField>

// //       {/* ===================================================
// //           LEGAL ENTITY
// //       =================================================== */}

// //       <FilterField
// //         label="Legal Entity"
// //         width={
// //           FIELD_WIDTHS.legal_entity
// //         }
// //       >
// //         <OpexMultiSelect
// //           options={
// //             options.legal_entities ||
// //             []
// //           }
// //           value={
// //             selectedFilters
// //               .legal_entity ||
// //             []
// //           }
// //           onChange={(value) =>
// //             handleFilterChange(
// //               "legal_entity",
// //               value
// //             )
// //           }
// //           placeholder="All"
// //           searchPlaceholder="Search Legal Entity"
// //           width={
// //             FIELD_WIDTHS.legal_entity
// //           }
// //         />
// //       </FilterField>

// //       {/* ===================================================
// //           PARENT DIVISION
// //       =================================================== */}

// //       <FilterField
// //         label="Parent Division"
// //         width={
// //           FIELD_WIDTHS.parent_division
// //         }
// //       >
// //         <OpexMultiSelect
// //           options={
// //             options.parent_divisions ||
// //             []
// //           }
// //           value={
// //             selectedFilters
// //               .parent_division ||
// //             []
// //           }
// //           onChange={(value) =>
// //             handleFilterChange(
// //               "parent_division",
// //               value
// //             )
// //           }
// //           placeholder="All"
// //           searchPlaceholder="Search Parent Division"
// //           width={
// //             FIELD_WIDTHS.parent_division
// //           }
// //         />
// //       </FilterField>

// //       {/* ===================================================
// //           SUB-DIVISION
// //       =================================================== */}

// //       <FilterField
// //         label="Sub-Division"
// //         width={
// //           FIELD_WIDTHS.subdivision
// //         }
// //       >
// //         <OpexMultiSelect
// //           options={
// //             options.subdivisions ||
// //             []
// //           }
// //           value={
// //             selectedFilters
// //               .subdivision ||
// //             []
// //           }
// //           onChange={(value) =>
// //             handleFilterChange(
// //               "subdivision",
// //               value
// //             )
// //           }
// //           placeholder="All"
// //           searchPlaceholder="Search Sub-Division"
// //           width={
// //             FIELD_WIDTHS.subdivision
// //           }
// //         />
// //       </FilterField>

// //       {/* ===================================================
// //           YEAR
// //       =================================================== */}

// //       <FilterField
// //         label="Year"
// //         width={
// //           FIELD_WIDTHS.year
// //         }
// //       >
// //         <OpexSingleSelect
// //           options={
// //             options.years ||
// //             []
// //           }
// //           value={
// //             selectedFilters.year ||
// //             ""
// //           }
// //           onChange={(value) =>
// //             handleFilterChange(
// //               "year",
// //               value
// //             )
// //           }
// //           placeholder="Select Year"
// //           searchPlaceholder="Search Year"
// //           width={
// //             FIELD_WIDTHS.year
// //           }
// //         />
// //       </FilterField>

// //       {/* ===================================================
// //           PERIOD
// //       =================================================== */}

// //       <FilterField
// //         label="Period"
// //         width={
// //           FIELD_WIDTHS.period
// //         }
// //       >
// //         <OpexMultiSelect
// //           options={
// //             options.periods ||
// //             []
// //           }
// //           value={
// //             selectedFilters.period ||
// //             []
// //           }
// //           onChange={(value) =>
// //             handleFilterChange(
// //               "period",
// //               value
// //             )
// //           }
// //           placeholder="All"
// //           searchPlaceholder="Search Period"
// //           width={
// //             FIELD_WIDTHS.period
// //           }
// //         />
// //       </FilterField>

// //       {/* ===================================================
// //           REPORTING CURRENCY
// //       =================================================== */}

// //       <FilterField
// //         label="Reporting Currency"
// //         width={
// //           FIELD_WIDTHS.reporting_currency
// //         }
// //       >
// //         <OpexSingleSelect
// //           options={
// //             options
// //               .reporting_currencies
// //               ?.length
// //               ? options.reporting_currencies
// //               : [
// //                 {
// //                   value:
// //                     options
// //                       .default_reporting_currency ||
// //                     "AED",

// //                   label:
// //                     options
// //                       .default_reporting_currency ||
// //                     "AED",
// //                 },
// //               ]
// //           }
// //           value={
// //             selectedFilters
// //               .reporting_currency ||
// //             options
// //               .default_reporting_currency ||
// //             "AED"
// //           }
// //           onChange={(value) =>
// //             handleFilterChange(
// //               "reporting_currency",
// //               value
// //             )
// //           }
// //           placeholder="AED"
// //           searchable={false}
// //           width={
// //             FIELD_WIDTHS.reporting_currency
// //           }
// //         />
// //       </FilterField>

// //       {/* ===================================================
// //           APPLY / RESET
// //       =================================================== */}

// //       <div
// //         style={{
// //           display: "flex",

// //           alignItems:
// //             "center",

// //           gap: 8,

// //           alignSelf:
// //             "flex-end",

// //           flexShrink: 0,

// //           paddingBottom: 1,

// //           marginLeft: 6,
// //         }}
// //       >
// //         <button
// //           id="btn-apply-opex-filter"
// //           type="button"
// //           onClick={() =>
// //             onApply?.(
// //               selectedFilters
// //             )
// //           }
// //           style={{
// //             height: 34,

// //             padding:
// //               "0 16px",

// //             background:
// //               "#6366f1",

// //             color: "#fff",

// //             border: "none",

// //             borderRadius: 8,

// //             fontSize:
// //               "0.78rem",

// //             fontWeight: 700,

// //             cursor:
// //               "pointer",

// //             whiteSpace:
// //               "nowrap",

// //             display:
// //               "inline-flex",

// //             alignItems:
// //               "center",

// //             justifyContent:
// //               "center",
// //           }}
// //         >
// //           Apply
// //         </button>

// //         <button
// //           id="btn-reset-opex-filter"
// //           type="button"
// //           onClick={
// //             handleReset
// //           }
// //           style={{
// //             height: 34,

// //             padding:
// //               "0 10px",

// //             background:
// //               "#fff",

// //             border:
// //               "1px solid #e2e8f0",

// //             color:
// //               "#64748b",

// //             borderRadius: 8,

// //             fontWeight: 600,

// //             fontSize:
// //               "0.78rem",

// //             cursor:
// //               "pointer",

// //             whiteSpace:
// //               "nowrap",

// //             display:
// //               "inline-flex",

// //             alignItems:
// //               "center",

// //             justifyContent:
// //               "center",
// //           }}
// //         >
// //           Reset
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }


// import React, {
//   useEffect,
//   useRef,
//   useState,
// } from "react";

// import { Search } from "lucide-react";

// import {
//   getOpexFilterOptions,
// } from "../../api/opexApi";

// /* =========================================================
//    DEFAULT FILTERS
// ========================================================= */

// const DEFAULT_FILTERS = {
//   legal_group: [],
//   legal_entity: [],
//   parent_division: [],
//   subdivision: [],
//   currency: "",
//   as_on_date: "",
//   period: [],
//   compare_with: "",
//   reporting_currency: "AED",
//   year: "",
// };

// /* =========================================================
//    FIELD WIDTHS
// ========================================================= */

// const FIELD_WIDTHS = {
//   legal_group: 128,
//   legal_entity: 128,
//   parent_division: 128,
//   subdivision: 128,
//   year: 128,
//   period: 128,
//   reporting_currency: 128,
// };

// /* =========================================================
//    OPTION VALUE
// ========================================================= */

// const getOptionValue = (option) => {
//   if (
//     option === null ||
//     option === undefined
//   ) {
//     return "";
//   }

//   if (
//     typeof option === "object"
//   ) {
//     return (
//       option.value ??
//       option.id ??
//       option.code ??
//       option.period_name ??
//       option.year ??
//       option.name ??
//       option.currency_code ??
//       ""
//     );
//   }

//   return option;
// };

// /* =========================================================
//    OPTION LABEL
// ========================================================= */

// const getOptionLabel = (option) => {
//   if (
//     option === null ||
//     option === undefined
//   ) {
//     return "";
//   }

//   if (
//     typeof option === "object"
//   ) {
//     return (
//       option.label ??
//       option.name ??
//       option.period_name ??
//       option.year ??
//       option.currency_name ??
//       option.currency_code ??
//       option.value ??
//       option.code ??
//       ""
//     );
//   }

//   return option;
// };

// /* =========================================================
//    LATEST PERIOD
// ========================================================= */

// function getLatestPeriod(periods = []) {
//   if (
//     !Array.isArray(periods) ||
//     periods.length === 0
//   ) {
//     return "";
//   }

//   return getOptionValue(
//     periods[periods.length - 1]
//   );
// }

// /* =========================================================
//    NORMALIZE YEARS
// ========================================================= */

// function normalizeYears(
//   payload = {},
//   periods = []
// ) {
//   const rawYears =
//     payload?.years ||
//     payload?.fiscal_years ||
//     payload?.accounting_years ||
//     [];

//   if (
//     Array.isArray(rawYears) &&
//     rawYears.length
//   ) {
//     return rawYears;
//   }

//   const derived = [];

//   if (
//     Array.isArray(periods)
//   ) {
//     periods.forEach(
//       (period) => {
//         if (
//           !period ||
//           typeof period !== "object"
//         ) {
//           return;
//         }

//         const year =
//           period.year ??
//           period.fiscal_year ??
//           period.accounting_year ??
//           null;

//         if (
//           year === null ||
//           year === undefined ||
//           year === ""
//         ) {
//           return;
//         }

//         const exists =
//           derived.some(
//             (item) =>
//               String(
//                 getOptionValue(item)
//               ) === String(year)
//           );

//         if (!exists) {
//           derived.push({
//             value: year,
//             label: year,
//           });
//         }
//       }
//     );
//   }

//   return derived;
// }

// /* =========================================================
//    NORMALIZE CURRENCY
// ========================================================= */

// function normalizeCurrencyOptions(
//   rawCurrencies
// ) {
//   if (
//     rawCurrencies === null ||
//     rawCurrencies === undefined ||
//     rawCurrencies === ""
//   ) {
//     return [];
//   }

//   if (
//     typeof rawCurrencies === "string" ||
//     typeof rawCurrencies === "number"
//   ) {
//     const value =
//       String(rawCurrencies);

//     return [
//       {
//         value,
//         label: value,
//       },
//     ];
//   }

//   if (
//     Array.isArray(rawCurrencies)
//   ) {
//     return rawCurrencies
//       .map((item) => {
//         if (
//           item === null ||
//           item === undefined ||
//           item === ""
//         ) {
//           return null;
//         }

//         if (
//           typeof item === "string" ||
//           typeof item === "number"
//         ) {
//           const value =
//             String(item);

//           return {
//             value,
//             label: value,
//           };
//         }

//         if (
//           typeof item === "object"
//         ) {
//           const value =
//             item.currency_code ??
//             item.currencyCode ??
//             item.currency ??
//             item.value ??
//             item.code ??
//             item.id ??
//             "";

//           const label =
//             item.label ??
//             item.name ??
//             item.currency_name ??
//             item.currency_code ??
//             item.currencyCode ??
//             item.currency ??
//             item.value ??
//             item.code ??
//             value;

//           if (!value) {
//             return null;
//           }

//           return {
//             value: String(value),
//             label: String(label),
//           };
//         }

//         return null;
//       })
//       .filter(Boolean);
//   }

//   if (
//     typeof rawCurrencies === "object"
//   ) {
//     const directValue =
//       rawCurrencies.currency_code ??
//       rawCurrencies.currencyCode ??
//       rawCurrencies.currency ??
//       rawCurrencies.value ??
//       rawCurrencies.code ??
//       rawCurrencies.id;

//     if (
//       directValue !== null &&
//       directValue !== undefined &&
//       directValue !== ""
//     ) {
//       const value =
//         String(directValue);

//       const label =
//         rawCurrencies.label ??
//         rawCurrencies.name ??
//         rawCurrencies.currency_name ??
//         rawCurrencies.currency_code ??
//         rawCurrencies.currencyCode ??
//         rawCurrencies.currency ??
//         rawCurrencies.value ??
//         rawCurrencies.code ??
//         value;

//       return [
//         {
//           value,
//           label: String(label),
//         },
//       ];
//     }

//     return Object.entries(
//       rawCurrencies
//     )
//       .map(
//         ([key, item]) => {
//           if (
//             item === null ||
//             item === undefined ||
//             item === ""
//           ) {
//             return {
//               value: String(key),
//               label: String(key),
//             };
//           }

//           if (
//             typeof item === "string" ||
//             typeof item === "number"
//           ) {
//             return {
//               value: String(item),
//               label: String(item),
//             };
//           }

//           if (
//             typeof item === "object"
//           ) {
//             const value =
//               item.currency_code ??
//               item.currencyCode ??
//               item.currency ??
//               item.value ??
//               item.code ??
//               key;

//             const label =
//               item.label ??
//               item.name ??
//               item.currency_name ??
//               item.currency_code ??
//               item.currencyCode ??
//               item.currency ??
//               item.value ??
//               item.code ??
//               value;

//             return {
//               value: String(value),
//               label: String(label),
//             };
//           }

//           return {
//             value: String(key),
//             label: String(key),
//           };
//         }
//       )
//       .filter(
//         (item) =>
//           item.value !== ""
//       );
//   }

//   return [];
// }

// /* =========================================================
//    NORMALIZE API OPTIONS
// ========================================================= */

// function normalizeOpexFilterOptions(
//   data = {}
// ) {
//   const payload =
//     data?.data &&
//       typeof data.data === "object" &&
//       !Array.isArray(data.data)
//       ? data.data
//       : data;

//   const rawCurrencies =
//     payload?.reporting_currencies ??
//     payload?.currencies ??
//     payload?.currency_options ??
//     payload?.ledger_currencies ??
//     payload?.reporting_currency ??
//     [];

//   let currencies =
//     normalizeCurrencyOptions(
//       rawCurrencies
//     );

//   if (
//     !currencies.length &&
//     payload?.default_reporting_currency
//   ) {
//     currencies =
//       normalizeCurrencyOptions(
//         payload.default_reporting_currency
//       );
//   }

//   const periods =
//     Array.isArray(
//       payload?.periods
//     )
//       ? payload.periods
//       : [];

//   return {
//     legal_groups:
//       Array.isArray(
//         payload?.legal_groups
//       )
//         ? payload.legal_groups
//         : [],

//     legal_entities:
//       Array.isArray(
//         payload?.legal_entities
//       )
//         ? payload.legal_entities
//         : [],

//     parent_divisions:
//       Array.isArray(
//         payload?.parent_divisions
//       )
//         ? payload.parent_divisions
//         : [],

//     subdivisions:
//       Array.isArray(
//         payload?.subdivisions
//       )
//         ? payload.subdivisions
//         : [],

//     periods,

//     years:
//       normalizeYears(
//         payload,
//         periods
//       ),

//     reporting_currencies:
//       currencies,

//     currencies,

//     compare_with:
//       Array.isArray(
//         payload?.compare_with
//       )
//         ? payload.compare_with
//         : Array.isArray(
//           payload?.compare_periods
//         )
//           ? payload.compare_periods
//           : [],

//     data_as_of:
//       payload?.data_as_of ||
//       null,

//     default_reporting_currency:
//       payload?.default_reporting_currency ||
//       "AED",
//   };
// }

// /* =========================================================
//    CLOSED SELECT STYLE
// ========================================================= */

// const selectStyle = {
//   appearance: "none",

//   padding:
//     "6px 28px 6px 10px",

//   fontSize:
//     "0.78rem",

//   fontWeight: 500,

//   color:
//     "#334155",

//   backgroundColor:
//     "#fff",

//   border:
//     "1px solid #e2e8f0",

//   borderRadius: 7,

//   cursor: "pointer",

//   outline: "none",

//   width: "100%",

//   height: 34,

//   boxSizing: "border-box",

//   backgroundImage:
//     "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",

//   backgroundRepeat:
//     "no-repeat",

//   backgroundPosition:
//     "right 8px center",
// };

// /* =========================================================
//    FILTER FIELD
// ========================================================= */

// function FilterField({
//   label,
//   children,
//   width,
// }) {
//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         gap: 4,
//         minWidth: width,
//         width,
//         flex: "0 0 auto",
//       }}
//     >
//       <span
//         style={{
//           fontSize: "0.66rem",
//           color: "#1e3a8a",
//           fontWeight: 700,
//           letterSpacing: "-0.02em",
//           whiteSpace: "nowrap",
//           lineHeight: 1.2,
//         }}
//       >
//         {label}
//       </span>

//       {children}
//     </div>
//   );
// }

// /* =========================================================
//    MULTI SELECT
// ========================================================= */

// function OpexMultiSelect({
//   options = [],
//   value = [],
//   onChange,
//   placeholder = "All",
//   searchPlaceholder = "Search...",
//   width = 128,
// }) {
//   const [open, setOpen] =
//     useState(false);

//   const [
//     searchQuery,
//     setSearchQuery,
//   ] = useState("");

//   const ref =
//     useRef(null);

//   const searchRef =
//     useRef(null);

//   const triggerRef =
//     useRef(null);

//   const dropdownRef =
//     useRef(null);

//   const [
//     menuReady,
//     setMenuReady,
//   ] = useState(false);

//   const [
//     menuPosition,
//     setMenuPosition,
//   ] = useState({
//     top: 0,
//     left: 0,
//     width: Math.max(width, 225),
//     maxHeight: 300,
//   });

//   /* =======================================================
//      UPDATE POSITION
//   ======================================================= */

//   const updateMenuPosition = () => {
//     const trigger =
//       triggerRef.current;

//     if (!trigger) {
//       return;
//     }

//     const rect =
//       trigger.getBoundingClientRect();

//     const menuWidth =
//       Math.max(width, 225);

//     const viewportPadding = 8;

//     const preferredHeight = 300;

//     const spaceBelow =
//       window.innerHeight -
//       rect.bottom -
//       viewportPadding;

//     const spaceAbove =
//       rect.top -
//       viewportPadding;

//     const openAbove =
//       spaceBelow < 180 &&
//       spaceAbove > spaceBelow;

//     const availableHeight =
//       Math.max(
//         120,
//         Math.min(
//           preferredHeight,
//           openAbove
//             ? spaceAbove
//             : spaceBelow
//         )
//       );

//     const top =
//       openAbove
//         ? Math.max(
//           viewportPadding,
//           rect.top -
//           availableHeight -
//           3
//         )
//         : rect.bottom + 3;

//     const maxLeft =
//       Math.max(
//         viewportPadding,
//         window.innerWidth -
//         menuWidth -
//         viewportPadding
//       );

//     const left =
//       Math.min(
//         Math.max(
//           rect.left,
//           viewportPadding
//         ),
//         maxLeft
//       );

//     setMenuPosition({
//       top,
//       left,
//       width: menuWidth,
//       maxHeight: availableHeight,
//     });

//     setMenuReady(true);
//   };

//   /* =======================================================
//      OPEN DROPDOWN
//   ======================================================= */

//   const openDropdown = () => {
//     updateMenuPosition();
//     setOpen(true);
//   };

//   /* =======================================================
//      POSITION ONLY WHEN OPEN
//   ======================================================= */

//   useEffect(() => {
//     if (!open) {
//       return undefined;
//     }

//     const frame =
//       requestAnimationFrame(() => {
//         updateMenuPosition();
//       });

//     const handleViewportChange = () => {
//       updateMenuPosition();
//     };

//     window.addEventListener(
//       "resize",
//       handleViewportChange
//     );

//     window.addEventListener(
//       "scroll",
//       handleViewportChange,
//       true
//     );

//     return () => {
//       cancelAnimationFrame(frame);

//       window.removeEventListener(
//         "resize",
//         handleViewportChange
//       );

//       window.removeEventListener(
//         "scroll",
//         handleViewportChange,
//         true
//       );
//     };
//   }, [
//     open,
//     width,
//   ]);

//   /* =======================================================
//      CLOSE OUTSIDE
//   ======================================================= */

//   useEffect(() => {
//     const handleOutside = (event) => {
//       const target =
//         event.target;

//       const clickedTrigger =
//         ref.current?.contains(
//           target
//         );

//       const clickedDropdown =
//         dropdownRef.current?.contains(
//           target
//         );

//       if (
//         !clickedTrigger &&
//         !clickedDropdown
//       ) {
//         setOpen(false);
//         setMenuReady(false);
//         setSearchQuery("");
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleOutside
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleOutside
//       );
//     };
//   }, []);

//   /* =======================================================
//      FOCUS SEARCH
//   ======================================================= */

//   useEffect(() => {
//     if (
//       open &&
//       searchRef.current
//     ) {
//       requestAnimationFrame(() => {
//         searchRef.current?.focus();
//       });
//     }

//     if (!open) {
//       setSearchQuery("");
//     }
//   }, [open]);

//   /* =======================================================
//      NORMALIZE
//   ======================================================= */

//   const normalized =
//     (options || [])
//       .map((option) => {
//         if (
//           option === null ||
//           option === undefined
//         ) {
//           return null;
//         }

//         if (
//           typeof option === "string" ||
//           typeof option === "number"
//         ) {
//           return {
//             id: String(option),
//             name: String(option),
//           };
//         }

//         const id =
//           option.value !== undefined
//             ? option.value
//             : option.id !== undefined
//               ? option.id
//               : option.code !== undefined
//                 ? option.code
//                 : "";

//         const name =
//           option.label !== undefined
//             ? option.label
//             : option.name !== undefined
//               ? option.name
//               : option.period_name !== undefined
//                 ? option.period_name
//                 : String(id);

//         if (
//           id === null ||
//           id === undefined ||
//           id === ""
//         ) {
//           return null;
//         }

//         return {
//           id: String(id),
//           name: String(name),
//         };
//       })
//       .filter(Boolean);

//   const currentValues =
//     Array.isArray(value)
//       ? value.map(String)
//       : [];

//   /* =======================================================
//      SEARCH
//   ======================================================= */

//   const query =
//     searchQuery
//       .trim()
//       .toLowerCase();

//   const visibleOptions =
//     query
//       ? normalized.filter(
//         (option) =>
//           option.name
//             .toLowerCase()
//             .includes(query) ||
//           option.id
//             .toLowerCase()
//             .includes(query)
//       )
//       : normalized;

//   /* =======================================================
//      DISPLAY
//   ======================================================= */

//   const isAll =
//     currentValues.length === 0;

//   const isAllSelected =
//     normalized.length > 0 &&
//     currentValues.length ===
//     normalized.length &&
//     normalized.every(
//       (option) =>
//         currentValues.includes(
//           option.id
//         )
//     );

//   const selectedOptions =
//     normalized.filter(
//       (option) =>
//         currentValues.includes(
//           option.id
//         )
//     );

//   const displayText =
//     isAll
//       ? placeholder
//       : isAllSelected
//         ? "All"
//         : selectedOptions.length === 1
//           ? selectedOptions[0].name
//           : `${selectedOptions.length} selected`;

//   /* =======================================================
//      TOGGLE
//   ======================================================= */

//   const toggleValue = (id) => {
//     const stringId =
//       String(id);

//     if (
//       currentValues.includes(
//         stringId
//       )
//     ) {
//       onChange?.(
//         currentValues.filter(
//           (item) =>
//             item !== stringId
//         )
//       );
//     } else {
//       onChange?.([
//         ...currentValues,
//         stringId,
//       ]);
//     }
//   };

//   /* =======================================================
//      SELECT ALL
//   ======================================================= */

//   const handleSelectAll = () => {
//     onChange?.(
//       normalized.map(
//         (option) =>
//           option.id
//       )
//     );
//   };

//   /* =======================================================
//      CLEAR
//   ======================================================= */

//   const handleClear = () => {
//     onChange?.([]);
//   };

//   /* =======================================================
//      RENDER
//   ======================================================= */

//   return (
//     <div
//       ref={ref}
//       style={{
//         position: "relative",
//         width,
//       }}
//     >
//       <button
//         ref={triggerRef}
//         type="button"
//         onClick={() => {
//           if (open) {
//             setOpen(false);
//             setMenuReady(false);
//             setSearchQuery("");
//           } else {
//             openDropdown();
//           }
//         }}
//         style={{
//           ...selectStyle,
//           textAlign: "left",
//           overflow: "hidden",
//           textOverflow: "ellipsis",
//           whiteSpace: "nowrap",
//         }}
//         title={displayText}
//       >
//         {displayText}
//       </button>

//       {open && menuReady && (
//         <div
//           ref={dropdownRef}
//           style={{
//             position: "fixed",

//             top:
//               menuPosition.top,

//             left:
//               menuPosition.left,

//             width:
//               menuPosition.width,

//             maxHeight:
//               menuPosition.maxHeight,

//             overflowY: "auto",

//             overflowX: "hidden",

//             background: "#fff",

//             border:
//               "1px solid #e2e8f0",

//             borderRadius: 7,

//             boxShadow:
//               "0 8px 22px rgba(15,23,42,0.14)",

//             zIndex: 99999,

//             padding: 6,

//             boxSizing: "border-box",

//             scrollbarWidth: "thin",

//             scrollbarColor:
//               "#64748b #f1f5f9",
//           }}
//         >
//           <div
//             style={{
//               position: "relative",
//               marginBottom: 4,
//             }}
//           >
//             <Search
//               size={13}
//               style={{
//                 position:
//                   "absolute",

//                 left: 8,

//                 top: 8,

//                 color:
//                   "#94a3b8",

//                 pointerEvents:
//                   "none",
//               }}
//             />

//             <input
//               ref={searchRef}
//               type="text"
//               value={searchQuery}
//               onChange={(event) =>
//                 setSearchQuery(
//                   event.target.value
//                 )
//               }
//               placeholder={
//                 searchPlaceholder
//               }
//               style={{
//                 width: "100%",

//                 height: 30,

//                 boxSizing:
//                   "border-box",

//                 border:
//                   "1px solid #dbe3ef",

//                 borderRadius: 6,

//                 padding:
//                   "0 8px 0 26px",

//                 outline: "none",

//                 fontSize:
//                   "0.72rem",

//                 color:
//                   "#334155",

//                 background:
//                   "#fff",
//               }}
//             />
//           </div>

//           <div
//             style={{
//               display: "flex",

//               alignItems:
//                 "center",

//               justifyContent:
//                 "space-between",

//               height: 25,

//               padding:
//                 "0 6px",

//               marginBottom: 1,
//             }}
//           >
//             <button
//               type="button"
//               onClick={
//                 handleSelectAll
//               }
//               style={{
//                 border: "none",

//                 background:
//                   "transparent",

//                 padding: 0,

//                 margin: 0,

//                 cursor:
//                   "pointer",

//                 fontSize:
//                   "0.68rem",

//                 lineHeight:
//                   "18px",

//                 fontWeight: 600,

//                 color:
//                   "#4f46e5",
//               }}
//             >
//               Select All
//             </button>

//             <button
//               type="button"
//               onClick={
//                 handleClear
//               }
//               style={{
//                 border: "none",

//                 background:
//                   "transparent",

//                 padding: 0,

//                 margin: 0,

//                 cursor:
//                   "pointer",

//                 fontSize:
//                   "0.68rem",

//                 lineHeight:
//                   "18px",

//                 fontWeight: 500,

//                 color:
//                   "#64748b",
//               }}
//             >
//               Clear
//             </button>
//           </div>

//           {visibleOptions.map(
//             (option) => {
//               const checked =
//                 currentValues.includes(
//                   option.id
//                 );

//               return (
//                 <label
//                   key={option.id}
//                   style={{
//                     display: "flex",

//                     alignItems:
//                       "center",

//                     gap: 6,

//                     width: "100%",

//                     height: 27,

//                     minHeight: 27,

//                     boxSizing:
//                       "border-box",

//                     padding:
//                       "2px 6px",

//                     margin: 0,

//                     borderRadius: 4,

//                     cursor:
//                       "pointer",

//                     fontSize:
//                       "0.72rem",

//                     lineHeight:
//                       "18px",

//                     fontWeight:
//                       checked
//                         ? 600
//                         : 500,

//                     color:
//                       "#334155",

//                     background:
//                       checked
//                         ? "#f5f7ff"
//                         : "#fff",
//                   }}
//                 >
//                   <input
//                     type="checkbox"
//                     checked={
//                       checked
//                     }
//                     onChange={() =>
//                       toggleValue(
//                         option.id
//                       )
//                     }
//                     style={{
//                       margin: 0,

//                       padding: 0,

//                       width: 14,

//                       height: 14,

//                       flexShrink: 0,

//                       accentColor:
//                         "#4f46e5",

//                       cursor:
//                         "pointer",
//                     }}
//                   />

//                   <span
//                     style={{
//                       display:
//                         "block",

//                       minWidth: 0,

//                       overflow:
//                         "hidden",

//                       textOverflow:
//                         "ellipsis",

//                       whiteSpace:
//                         "nowrap",

//                       lineHeight:
//                         "18px",
//                     }}
//                     title={
//                       option.name
//                     }
//                   >
//                     {option.name}
//                   </span>
//                 </label>
//               );
//             }
//           )}

//           {!visibleOptions.length && (
//             <div
//               style={{
//                 padding:
//                   "10px 6px",

//                 textAlign:
//                   "center",

//                 fontSize:
//                   "0.7rem",

//                 color:
//                   "#94a3b8",
//               }}
//             >
//               No options found
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// /* =========================================================
//    SINGLE SELECT
// ========================================================= */

// function OpexSingleSelect({
//   options = [],
//   value = "",
//   onChange,
//   placeholder = "Select",
//   searchPlaceholder = "Search...",
//   width = 128,
//   searchable = true,
// }) {
//   const [open, setOpen] =
//     useState(false);

//   const [
//     searchQuery,
//     setSearchQuery,
//   ] = useState("");

//   const ref =
//     useRef(null);

//   const searchRef =
//     useRef(null);

//   const triggerRef =
//     useRef(null);

//   const dropdownRef =
//     useRef(null);

//   const [
//     menuReady,
//     setMenuReady,
//   ] = useState(false);

//   const [
//     menuPosition,
//     setMenuPosition,
//   ] = useState({
//     top: 0,
//     left: 0,
//     width: Math.max(width, 225),
//     maxHeight: 300,
//   });

//   /* =======================================================
//      UPDATE POSITION
//   ======================================================= */

//   const updateMenuPosition = () => {
//     const trigger =
//       triggerRef.current;

//     if (!trigger) {
//       return;
//     }

//     const rect =
//       trigger.getBoundingClientRect();

//     const menuWidth =
//       Math.max(width, 225);

//     const viewportPadding = 8;

//     const preferredHeight = 300;

//     const spaceBelow =
//       window.innerHeight -
//       rect.bottom -
//       viewportPadding;

//     const spaceAbove =
//       rect.top -
//       viewportPadding;

//     const openAbove =
//       spaceBelow < 180 &&
//       spaceAbove > spaceBelow;

//     const availableHeight =
//       Math.max(
//         120,
//         Math.min(
//           preferredHeight,
//           openAbove
//             ? spaceAbove
//             : spaceBelow
//         )
//       );

//     const top =
//       openAbove
//         ? Math.max(
//           viewportPadding,
//           rect.top -
//           availableHeight -
//           3
//         )
//         : rect.bottom + 3;

//     const maxLeft =
//       Math.max(
//         viewportPadding,
//         window.innerWidth -
//         menuWidth -
//         viewportPadding
//       );

//     const left =
//       Math.min(
//         Math.max(
//           rect.left,
//           viewportPadding
//         ),
//         maxLeft
//       );

//     setMenuPosition({
//       top,
//       left,
//       width: menuWidth,
//       maxHeight:
//         availableHeight,
//     });

//     setMenuReady(true);
//   };

//   /* =======================================================
//      OPEN DROPDOWN
//   ======================================================= */

//   const openDropdown = () => {
//     updateMenuPosition();
//     setOpen(true);
//   };

//   /* =======================================================
//      POSITION ONLY WHILE OPEN
//   ======================================================= */

//   useEffect(() => {
//     if (!open) {
//       return undefined;
//     }

//     const frame =
//       requestAnimationFrame(() => {
//         updateMenuPosition();
//       });

//     const handleViewportChange =
//       () => {
//         updateMenuPosition();
//       };

//     window.addEventListener(
//       "resize",
//       handleViewportChange
//     );

//     window.addEventListener(
//       "scroll",
//       handleViewportChange,
//       true
//     );

//     return () => {
//       cancelAnimationFrame(frame);

//       window.removeEventListener(
//         "resize",
//         handleViewportChange
//       );

//       window.removeEventListener(
//         "scroll",
//         handleViewportChange,
//         true
//       );
//     };
//   }, [
//     open,
//     width,
//   ]);

//   /* =======================================================
//      CLOSE OUTSIDE
//   ======================================================= */

//   useEffect(() => {
//     const handleOutside =
//       (event) => {
//         const target =
//           event.target;

//         const clickedTrigger =
//           ref.current?.contains(
//             target
//           );

//         const clickedDropdown =
//           dropdownRef.current?.contains(
//             target
//           );

//         if (
//           !clickedTrigger &&
//           !clickedDropdown
//         ) {
//           setOpen(false);
//           setMenuReady(false);
//           setSearchQuery("");
//         }
//       };

//     document.addEventListener(
//       "mousedown",
//       handleOutside
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleOutside
//       );
//     };
//   }, []);

//   /* =======================================================
//      FOCUS SEARCH
//   ======================================================= */

//   useEffect(() => {
//     if (
//       open &&
//       searchable &&
//       searchRef.current
//     ) {
//       requestAnimationFrame(() => {
//         searchRef.current?.focus();
//       });
//     }

//     if (!open) {
//       setSearchQuery("");
//     }
//   }, [
//     open,
//     searchable,
//   ]);

//   /* =======================================================
//      NORMALIZE
//   ======================================================= */

//   const normalized =
//     (options || [])
//       .map((option) => {
//         if (
//           option === null ||
//           option === undefined
//         ) {
//           return null;
//         }

//         if (
//           typeof option === "string" ||
//           typeof option === "number"
//         ) {
//           return {
//             id: String(option),
//             name: String(option),
//           };
//         }

//         const id =
//           option.value !== undefined
//             ? option.value
//             : option.id !== undefined
//               ? option.id
//               : option.code !== undefined
//                 ? option.code
//                 : "";

//         const name =
//           option.label !== undefined
//             ? option.label
//             : option.name !== undefined
//               ? option.name
//               : option.period_name !== undefined
//                 ? option.period_name
//                 : String(id);

//         if (
//           id === null ||
//           id === undefined ||
//           id === ""
//         ) {
//           return null;
//         }

//         return {
//           id: String(id),
//           name: String(name),
//         };
//       })
//       .filter(Boolean);

//   const currentValue =
//     value === null ||
//       value === undefined
//       ? ""
//       : String(value);

//   const currentOption =
//     normalized.find(
//       (option) =>
//         option.id ===
//         currentValue
//     );

//   /* =======================================================
//      SEARCH
//   ======================================================= */

//   const query =
//     searchQuery
//       .trim()
//       .toLowerCase();

//   const visibleOptions =
//     searchable && query
//       ? normalized.filter(
//         (option) =>
//           option.name
//             .toLowerCase()
//             .includes(query) ||
//           option.id
//             .toLowerCase()
//             .includes(query)
//       )
//       : normalized;

//   const displayText =
//     currentOption?.name ||
//     placeholder;

//   /* =======================================================
//      SELECT
//   ======================================================= */

//   const handleSelect =
//     (option) => {
//       onChange?.(
//         option.id
//       );

//       setOpen(false);
//       setMenuReady(false);
//       setSearchQuery("");
//     };

//   /* =======================================================
//      RENDER
//   ======================================================= */

//   return (
//     <div
//       ref={ref}
//       style={{
//         position: "relative",
//         width,
//       }}
//     >
//       <button
//         ref={triggerRef}
//         type="button"
//         onClick={() => {
//           if (open) {
//             setOpen(false);
//             setMenuReady(false);
//             setSearchQuery("");
//           } else {
//             openDropdown();
//           }
//         }}
//         style={{
//           ...selectStyle,
//           textAlign: "left",
//           overflow: "hidden",
//           textOverflow:
//             "ellipsis",
//           whiteSpace:
//             "nowrap",
//         }}
//         title={displayText}
//       >
//         {displayText}
//       </button>

//       {open && menuReady && (
//         <div
//           ref={dropdownRef}
//           style={{
//             position: "fixed",

//             top:
//               menuPosition.top,

//             left:
//               menuPosition.left,

//             width:
//               menuPosition.width,

//             maxHeight:
//               menuPosition.maxHeight,

//             overflowY: "auto",

//             overflowX: "hidden",

//             background: "#fff",

//             border:
//               "1px solid #e2e8f0",

//             borderRadius: 7,

//             boxShadow:
//               "0 8px 22px rgba(15,23,42,0.14)",

//             zIndex: 99999,

//             padding: 6,

//             boxSizing:
//               "border-box",

//             scrollbarWidth:
//               "thin",

//             scrollbarColor:
//               "#64748b #f1f5f9",
//           }}
//         >
//           {searchable && (
//             <div
//               style={{
//                 position:
//                   "relative",

//                 marginBottom: 4,
//               }}
//             >
//               <Search
//                 size={13}
//                 style={{
//                   position:
//                     "absolute",

//                   left: 8,

//                   top: 8,

//                   color:
//                     "#94a3b8",

//                   pointerEvents:
//                     "none",
//                 }}
//               />

//               <input
//                 ref={searchRef}
//                 type="text"
//                 value={
//                   searchQuery
//                 }
//                 onChange={(
//                   event
//                 ) =>
//                   setSearchQuery(
//                     event.target.value
//                   )
//                 }
//                 placeholder={
//                   searchPlaceholder
//                 }
//                 style={{
//                   width: "100%",

//                   height: 30,

//                   boxSizing:
//                     "border-box",

//                   border:
//                     "1px solid #dbe3ef",

//                   borderRadius: 6,

//                   padding:
//                     "0 8px 0 26px",

//                   outline: "none",

//                   fontSize:
//                     "0.72rem",

//                   color:
//                     "#334155",

//                   background:
//                     "#fff",
//                 }}
//               />
//             </div>
//           )}

//           {visibleOptions.map(
//             (option) => {
//               const selected =
//                 option.id ===
//                 currentValue;

//               return (
//                 <button
//                   key={
//                     option.id
//                   }
//                   type="button"
//                   onClick={() =>
//                     handleSelect(
//                       option
//                     )
//                   }
//                   style={{
//                     width: "100%",

//                     height: 27,

//                     minHeight: 27,

//                     boxSizing:
//                       "border-box",

//                     border: "none",

//                     background:
//                       selected
//                         ? "#f5f7ff"
//                         : "#fff",

//                     textAlign:
//                       "left",

//                     padding:
//                       "2px 8px",

//                     margin: 0,

//                     borderRadius: 4,

//                     cursor:
//                       "pointer",

//                     fontSize:
//                       "0.72rem",

//                     lineHeight:
//                       "18px",

//                     fontWeight:
//                       selected
//                         ? 600
//                         : 500,

//                     color:
//                       "#334155",

//                     overflow:
//                       "hidden",

//                     textOverflow:
//                       "ellipsis",

//                     whiteSpace:
//                       "nowrap",
//                   }}
//                   title={
//                     option.name
//                   }
//                 >
//                   {option.name}
//                 </button>
//               );
//             }
//           )}

//           {!visibleOptions.length && (
//             <div
//               style={{
//                 padding:
//                   "10px 6px",

//                 textAlign:
//                   "center",

//                 fontSize:
//                   "0.7rem",

//                 color:
//                   "#94a3b8",
//               }}
//             >
//               No options found
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// /* =========================================================
//    OPEX FILTERS
// ========================================================= */

// export default function OpexFilters({
//   filterOptions = {},
//   selectedFilters:
//     externalSelectedFilters,
//   onChange,
//   onApply,
//   onReset,
// }) {
//   const [
//     opexFilterOptions,
//     setOpexFilterOptions,
//   ] = useState(
//     normalizeOpexFilterOptions(
//       filterOptions
//     )
//   );

//   const [
//     selectedFilters,
//     setSelectedFilters,
//   ] = useState(() => {
//     const normalized =
//       normalizeOpexFilterOptions(
//         filterOptions
//       );

//     const years =
//       normalized.years || [];

//     const periods =
//       normalized.periods || [];

//     const firstYear =
//       years.length
//         ? getOptionValue(
//           years[0]
//         )
//         : "";

//     const latestPeriod =
//       periods.length
//         ? getLatestPeriod(
//           periods
//         )
//         : "";

//     return {
//       ...DEFAULT_FILTERS,

//       ...(externalSelectedFilters ||
//         {}),

//       year:
//         externalSelectedFilters?.year ||
//         (firstYear
//           ? String(firstYear)
//           : ""),

//       period:
//         externalSelectedFilters?.period ||
//         (latestPeriod
//           ? [
//             String(
//               latestPeriod
//             ),
//           ]
//           : []),

//       reporting_currency:
//         externalSelectedFilters
//           ?.reporting_currency ||
//         normalized.default_reporting_currency ||
//         "AED",
//     };
//   });

//   const [
//     loading,
//     setLoading,
//   ] = useState(false);

//   /*
//    * IMPORTANT:
//    * Prevent older API responses from replacing
//    * newer filter-option results.
//    */
//   const requestSequenceRef =
//     useRef(0);

//   /*
//    * Prevent duplicate initial API request
//    * in React Strict Mode development.
//    */
//   const initialLoadRef =
//     useRef(false);

//   /* =======================================================
//      SYNC EXTERNAL FILTERS
//   ======================================================= */

//   useEffect(() => {
//     if (
//       !externalSelectedFilters
//     ) {
//       return;
//     }

//     setSelectedFilters(
//       (previous) => {
//         let changed = false;

//         const next = {
//           ...previous,
//         };

//         Object.keys(
//           externalSelectedFilters
//         ).forEach((key) => {
//           const previousValue =
//             previous[key];

//           const nextValue =
//             externalSelectedFilters[
//               key
//             ];

//           if (
//             Array.isArray(
//               previousValue
//             ) &&
//             Array.isArray(
//               nextValue
//             )
//           ) {
//             if (
//               previousValue.length !==
//               nextValue.length ||
//               previousValue.some(
//                 (item, index) =>
//                   String(item) !==
//                   String(
//                     nextValue[index]
//                   )
//               )
//             ) {
//               changed = true;
//               next[key] =
//                 nextValue;
//             }
//           } else if (
//             previousValue !==
//             nextValue
//           ) {
//             changed = true;
//             next[key] =
//               nextValue;
//           }
//         });

//         return changed
//           ? next
//           : previous;
//       }
//     );
//   }, [
//     externalSelectedFilters,
//   ]);

//   /* =======================================================
//      LOAD FILTER OPTIONS
//   ======================================================= */

//   const loadOpexFilterOptions =
//     async (
//       currentFilters = {},
//       preserveOptionKey = null
//     ) => {
//       const requestId =
//         ++requestSequenceRef.current;

//       try {
//         setLoading(true);

//         const response =
//           await getOpexFilterOptions(
//             currentFilters
//           );

//         /*
//          * Ignore stale responses.
//          *
//          * Example:
//          * request A starts
//          * request B starts
//          * B finishes first
//          * A finishes later
//          *
//          * A must NOT overwrite B.
//          */
//         if (
//           requestId !==
//           requestSequenceRef.current
//         ) {
//           return null;
//         }

//         const normalized =
//           normalizeOpexFilterOptions(
//             response
//           );

//         setOpexFilterOptions(
//           (previous) => {
//             if (
//               preserveOptionKey
//             ) {
//               return {
//                 ...previous,
//                 ...normalized,

//                 [preserveOptionKey]:
//                   normalized[
//                     preserveOptionKey
//                   ]?.length
//                     ? normalized[
//                       preserveOptionKey
//                     ]
//                     : previous[
//                       preserveOptionKey
//                     ] ??
//                       [],
//               };
//             }

//             return {
//               ...previous,
//               ...normalized,
//             };
//           }
//         );

//         return normalized;
//       } catch (error) {
//         /*
//          * Ignore errors from stale requests.
//          */
//         if (
//           requestId !==
//           requestSequenceRef.current
//         ) {
//           return null;
//         }

//         console.error(
//           "Failed to load OPEX filter options:",
//           error
//         );

//         return null;
//       } finally {
//         if (
//           requestId ===
//           requestSequenceRef.current
//         ) {
//           setLoading(false);
//         }
//       }
//     };

//   /* =======================================================
//      INITIAL OPTIONS
//   ======================================================= */

//   useEffect(() => {
//     if (
//       initialLoadRef.current
//     ) {
//       return;
//     }

//     initialLoadRef.current =
//       true;

//     void loadOpexFilterOptions(
//       {}
//     );
//   }, []);

//   /* =======================================================
//      DEFAULT VALUES
//   ======================================================= */

//   useEffect(() => {
//     if (
//       !opexFilterOptions
//     ) {
//       return;
//     }

//     setSelectedFilters(
//       (previous) => {
//         let changed = false;

//         const next = {
//           ...previous,
//         };

//         if (
//           !next.year &&
//           opexFilterOptions
//             .years?.length
//         ) {
//           next.year =
//             String(
//               getOptionValue(
//                 opexFilterOptions
//                   .years[0]
//               )
//             );

//           changed = true;
//         }

//         if (
//           (!Array.isArray(
//             next.period
//           ) ||
//             next.period.length ===
//             0) &&
//           opexFilterOptions
//             .periods?.length
//         ) {
//           const latestPeriod =
//             getLatestPeriod(
//               opexFilterOptions
//                 .periods
//             );

//           if (
//             latestPeriod
//           ) {
//             next.period = [
//               String(
//                 latestPeriod
//               ),
//             ];

//             changed = true;
//           }
//         }

//         if (
//           !next.reporting_currency
//         ) {
//           next.reporting_currency =
//             opexFilterOptions
//               .default_reporting_currency ||
//             "AED";

//           changed = true;
//         }

//         return changed
//           ? next
//           : previous;
//       }
//     );
//   }, [
//     opexFilterOptions,
//   ]);

//   /* =======================================================
//      FILTER CHANGE
//   ======================================================= */

//   const handleFilterChange = (
//     key,
//     value
//   ) => {
//     /*
//      * Build the final filter state FIRST.
//      *
//      * IMPORTANT:
//      * There is now only ONE setSelectedFilters()
//      * call per filter change.
//      *
//      * This removes the intermediate render that
//      * caused the filter/dropdown blinking.
//      */

//     const nextFilters = {
//       ...selectedFilters,
//       [key]: value,
//     };

//     /* =====================================================
//        DEPENDENT DROPDOWN MAPPING
//     ===================================================== */

//     const optionKeyMap = {
//       legal_group:
//         "legal_entities",

//       legal_entity:
//         "parent_divisions",

//       parent_division:
//         "subdivisions",
//     };

//     const apiKeyMap = {
//       legal_group:
//         "legal_group_id",

//       legal_entity:
//         "legal_entity_id",

//       parent_division:
//         "parent_division_id",
//     };

//     const dependentKey =
//       optionKeyMap[key];

//     const apiKey =
//       apiKeyMap[key];

//     /* =====================================================
//        CLEAR LOWER LEVEL FILTERS
//     ===================================================== */

//     if (
//       dependentKey &&
//       apiKey
//     ) {
//       if (
//         key ===
//         "legal_group"
//       ) {
//         nextFilters.legal_entity =
//           [];

//         nextFilters.parent_division =
//           [];

//         nextFilters.subdivision =
//           [];
//       }

//       if (
//         key ===
//         "legal_entity"
//       ) {
//         nextFilters.parent_division =
//           [];

//         nextFilters.subdivision =
//           [];
//       }

//       if (
//         key ===
//         "parent_division"
//       ) {
//         nextFilters.subdivision =
//           [];
//       }

//       /*
//        * API receives the newly selected value,
//        * not the intermediate state.
//        */
//       const apiFilters = {
//         year:
//           nextFilters.year ||
//           undefined,

//         period_name:
//           nextFilters.period ||
//           undefined,

//         reporting_currency:
//           nextFilters
//             .reporting_currency ||
//           "AED",

//         [apiKey]:
//           Array.isArray(value)
//             ? value
//             : value
//               ? [value]
//               : [],
//       };

//       /*
//        * ONE state update only.
//        */
//       setSelectedFilters(
//         nextFilters
//       );

//       /*
//        * Load dependent options.
//        *
//        * The request sequence guard prevents
//        * an older request from making the
//        * filter blink/disappear.
//        */
//       void loadOpexFilterOptions(
//         apiFilters,
//         dependentKey
//       );

//       return;
//     }

//     /*
//      * Non-dependent filters also use exactly
//      * one state update.
//      */
//     setSelectedFilters(
//       nextFilters
//     );
//   };

//   /* =======================================================
//      RESET
//   ======================================================= */

//   const handleReset = () => {
//     /*
//      * Invalidate any currently running API request.
//      *
//      * This prevents a previous dependent-filter
//      * response from coming back after Reset and
//      * changing the filter options again.
//      */
//     ++requestSequenceRef.current;

//     const years =
//       opexFilterOptions
//         .years?.length
//         ? opexFilterOptions.years
//         : filterOptions?.years ||
//         [];

//     const periods =
//       opexFilterOptions
//         .periods?.length
//         ? opexFilterOptions
//           .periods
//         : filterOptions?.periods ||
//         [];

//     const firstYear =
//       years.length
//         ? getOptionValue(
//           years[0]
//         )
//         : "";

//     const latestPeriod =
//       periods.length
//         ? getLatestPeriod(
//           periods
//         )
//         : "";

//     const resetFilters = {
//       ...DEFAULT_FILTERS,

//       legal_group: [],
//       legal_entity: [],
//       parent_division: [],
//       subdivision: [],

//       period:
//         latestPeriod
//           ? [
//             String(
//               latestPeriod
//             ),
//           ]
//           : [],

//       year:
//         firstYear
//           ? String(
//             firstYear
//           )
//           : "",

//       reporting_currency:
//         opexFilterOptions
//           .default_reporting_currency ||
//         filterOptions
//           ?.default_reporting_currency ||
//         "AED",
//     };

//     setSelectedFilters(
//       resetFilters
//     );

//     onChange?.(
//       resetFilters
//     );

//     onReset?.();

//     void loadOpexFilterOptions(
//       {}
//     );
//   };

//   const options = {
//     ...filterOptions,
//     ...opexFilterOptions,
//   };

//   /* =======================================================
//      UI
//   ======================================================= */

//   return (
//     <div
//       className="card"
//       style={{
//         width: "100%",

//         maxWidth: "100%",

//         padding:
//           "10px 16px",

//         marginBottom: 16,

//         display: "flex",

//         alignItems:
//           "flex-end",

//         gap: 10,

//         flexWrap: "wrap",

//         boxSizing:
//           "border-box",

//         overflow: "visible",

//         position: "relative",

//         zIndex: 20,

//         fontFamily:
//           "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//       }}
//     >
//       {/* ===================================================
//           LEGAL GROUP
//       =================================================== */}

//       <FilterField
//         label="Legal Group"
//         width={
//           FIELD_WIDTHS.legal_group
//         }
//       >
//         <OpexMultiSelect
//           options={
//             options.legal_groups ||
//             []
//           }
//           value={
//             selectedFilters
//               .legal_group ||
//             []
//           }
//           onChange={(value) =>
//             handleFilterChange(
//               "legal_group",
//               value
//             )
//           }
//           placeholder="All"
//           searchPlaceholder="Search Legal Group"
//           width={
//             FIELD_WIDTHS.legal_group
//           }
//         />
//       </FilterField>

//       {/* ===================================================
//           LEGAL ENTITY
//       =================================================== */}

//       <FilterField
//         label="Legal Entity"
//         width={
//           FIELD_WIDTHS.legal_entity
//         }
//       >
//         <OpexMultiSelect
//           options={
//             options.legal_entities ||
//             []
//           }
//           value={
//             selectedFilters
//               .legal_entity ||
//             []
//           }
//           onChange={(value) =>
//             handleFilterChange(
//               "legal_entity",
//               value
//             )
//           }
//           placeholder="All"
//           searchPlaceholder="Search Legal Entity"
//           width={
//             FIELD_WIDTHS.legal_entity
//           }
//         />
//       </FilterField>

//       {/* ===================================================
//           PARENT DIVISION
//       =================================================== */}

//       <FilterField
//         label="Parent Division"
//         width={
//           FIELD_WIDTHS.parent_division
//         }
//       >
//         <OpexMultiSelect
//           options={
//             options.parent_divisions ||
//             []
//           }
//           value={
//             selectedFilters
//               .parent_division ||
//             []
//           }
//           onChange={(value) =>
//             handleFilterChange(
//               "parent_division",
//               value
//             )
//           }
//           placeholder="All"
//           searchPlaceholder="Search Parent Division"
//           width={
//             FIELD_WIDTHS.parent_division
//           }
//         />
//       </FilterField>

//       {/* ===================================================
//           SUB-DIVISION
//       =================================================== */}

//       <FilterField
//         label="Sub-Division"
//         width={
//           FIELD_WIDTHS.subdivision
//         }
//       >
//         <OpexMultiSelect
//           options={
//             options.subdivisions ||
//             []
//           }
//           value={
//             selectedFilters
//               .subdivision ||
//             []
//           }
//           onChange={(value) =>
//             handleFilterChange(
//               "subdivision",
//               value
//             )
//           }
//           placeholder="All"
//           searchPlaceholder="Search Sub-Division"
//           width={
//             FIELD_WIDTHS.subdivision
//           }
//         />
//       </FilterField>

//       {/* ===================================================
//           YEAR
//       =================================================== */}

//       <FilterField
//         label="Year"
//         width={
//           FIELD_WIDTHS.year
//         }
//       >
//         <OpexSingleSelect
//           options={
//             options.years ||
//             []
//           }
//           value={
//             selectedFilters.year ||
//             ""
//           }
//           onChange={(value) =>
//             handleFilterChange(
//               "year",
//               value
//             )
//           }
//           placeholder="Select Year"
//           searchPlaceholder="Search Year"
//           width={
//             FIELD_WIDTHS.year
//           }
//         />
//       </FilterField>

//       {/* ===================================================
//           PERIOD
//       =================================================== */}

//       <FilterField
//         label="Period"
//         width={
//           FIELD_WIDTHS.period
//         }
//       >
//         <OpexMultiSelect
//           options={
//             options.periods ||
//             []
//           }
//           value={
//             selectedFilters.period ||
//             []
//           }
//           onChange={(value) =>
//             handleFilterChange(
//               "period",
//               value
//             )
//           }
//           placeholder="All"
//           searchPlaceholder="Search Period"
//           width={
//             FIELD_WIDTHS.period
//           }
//         />
//       </FilterField>

//       {/* ===================================================
//           REPORTING CURRENCY
//       =================================================== */}

//       <FilterField
//         label="Reporting Currency"
//         width={
//           FIELD_WIDTHS.reporting_currency
//         }
//       >
//         <OpexSingleSelect
//           options={
//             options
//               .reporting_currencies
//               ?.length
//               ? options.reporting_currencies
//               : [
//                 {
//                   value:
//                     options
//                       .default_reporting_currency ||
//                     "AED",

//                   label:
//                     options
//                       .default_reporting_currency ||
//                     "AED",
//                 },
//               ]
//           }
//           value={
//             selectedFilters
//               .reporting_currency ||
//             options
//               .default_reporting_currency ||
//             "AED"
//           }
//           onChange={(value) =>
//             handleFilterChange(
//               "reporting_currency",
//               value
//             )
//           }
//           placeholder="AED"
//           searchable={false}
//           width={
//             FIELD_WIDTHS.reporting_currency
//           }
//         />
//       </FilterField>

//       {/* ===================================================
//           APPLY / RESET
//       =================================================== */}

//       <div
//         style={{
//           display: "flex",

//           alignItems:
//             "center",

//           gap: 8,

//           alignSelf:
//             "flex-end",

//           flexShrink: 0,

//           paddingBottom: 1,

//           marginLeft: 6,
//         }}
//       >
//         <button
//           id="btn-apply-opex-filter"
//           type="button"
//           onClick={() =>
//             onApply?.(
//               selectedFilters
//             )
//           }
//           style={{
//             height: 34,

//             padding:
//               "0 16px",

//             background:
//               "#6366f1",

//             color: "#fff",

//             border: "none",

//             borderRadius: 8,

//             fontSize:
//               "0.78rem",

//             fontWeight: 700,

//             cursor:
//               "pointer",

//             whiteSpace:
//               "nowrap",

//             display:
//               "inline-flex",

//             alignItems:
//               "center",

//             justifyContent:
//               "center",
//           }}
//         >
//           Apply
//         </button>

//         <button
//           id="btn-reset-opex-filter"
//           type="button"
//           onClick={
//             handleReset
//           }
//           style={{
//             height: 34,

//             padding:
//               "0 10px",

//             background:
//               "#fff",

//             border:
//               "1px solid #e2e8f0",

//             color:
//               "#64748b",

//             borderRadius: 8,

//             fontWeight: 600,

//             fontSize:
//               "0.78rem",

//             cursor:
//               "pointer",

//             whiteSpace:
//               "nowrap",

//             display:
//               "inline-flex",

//             alignItems:
//               "center",

//             justifyContent:
//               "center",
//           }}
//         >
//           Reset
//         </button>
//       </div>
//     </div>
//   );
// }


import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { Search } from "lucide-react";

import {
  getOpexFilterOptions,
} from "../../api/opexApi";

/* =========================================================
   DEFAULT FILTERS
========================================================= */

const DEFAULT_FILTERS = {
  legal_group: [],
  legal_entity: [],
  parent_division: [],
  subdivision: [],
  currency: "",
  as_on_date: "",
  period: [],
  compare_with: "",
  reporting_currency: "AED",
  year: "",
};

/* =========================================================
   FIELD WIDTHS
========================================================= */

const FIELD_WIDTHS = {
  legal_group: 128,
  legal_entity: 128,
  parent_division: 128,
  subdivision: 128,
  year: 128,
  period: 128,
  reporting_currency: 128,
};

/* =========================================================
   OPTION VALUE
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
      option.year ??
      option.name ??
      option.currency_code ??
      ""
    );
  }

  return option;
};

/* =========================================================
   OPTION LABEL
========================================================= */

const getOptionLabel = (option) => {
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
      option.label ??
      option.name ??
      option.period_name ??
      option.year ??
      option.currency_name ??
      option.currency_code ??
      option.value ??
      option.code ??
      ""
    );
  }

  return option;
};

/* =========================================================
   LATEST PERIOD
========================================================= */

function getLatestPeriod(periods = []) {
  if (
    !Array.isArray(periods) ||
    periods.length === 0
  ) {
    return "";
  }

  return getOptionValue(
    periods[periods.length - 1]
  );
}

/* =========================================================
   NORMALIZE YEARS
========================================================= */

function normalizeYears(
  payload = {},
  periods = []
) {
  const rawYears =
    payload?.years ||
    payload?.fiscal_years ||
    payload?.accounting_years ||
    [];

  if (
    Array.isArray(rawYears) &&
    rawYears.length
  ) {
    return rawYears;
  }

  const derived = [];

  if (
    Array.isArray(periods)
  ) {
    periods.forEach(
      (period) => {
        if (
          !period ||
          typeof period !== "object"
        ) {
          return;
        }

        const year =
          period.year ??
          period.fiscal_year ??
          period.accounting_year ??
          null;

        if (
          year === null ||
          year === undefined ||
          year === ""
        ) {
          return;
        }

        const exists =
          derived.some(
            (item) =>
              String(
                getOptionValue(item)
              ) === String(year)
          );

        if (!exists) {
          derived.push({
            value: year,
            label: year,
          });
        }
      }
    );
  }

  return derived;
}

/* =========================================================
   NORMALIZE CURRENCY
========================================================= */

function normalizeCurrencyOptions(
  rawCurrencies
) {
  if (
    rawCurrencies === null ||
    rawCurrencies === undefined ||
    rawCurrencies === ""
  ) {
    return [];
  }

  if (
    typeof rawCurrencies === "string" ||
    typeof rawCurrencies === "number"
  ) {
    const value =
      String(rawCurrencies);

    return [
      {
        value,
        label: value,
      },
    ];
  }

  if (
    Array.isArray(rawCurrencies)
  ) {
    return rawCurrencies
      .map((item) => {
        if (
          item === null ||
          item === undefined ||
          item === ""
        ) {
          return null;
        }

        if (
          typeof item === "string" ||
          typeof item === "number"
        ) {
          const value =
            String(item);

          return {
            value,
            label: value,
          };
        }

        if (
          typeof item === "object"
        ) {
          const value =
            item.currency_code ??
            item.currencyCode ??
            item.currency ??
            item.value ??
            item.code ??
            item.id ??
            "";

          const label =
            item.label ??
            item.name ??
            item.currency_name ??
            item.currency_code ??
            item.currencyCode ??
            item.currency ??
            item.value ??
            item.code ??
            value;

          if (!value) {
            return null;
          }

          return {
            value: String(value),
            label: String(label),
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  if (
    typeof rawCurrencies === "object"
  ) {
    const directValue =
      rawCurrencies.currency_code ??
      rawCurrencies.currencyCode ??
      rawCurrencies.currency ??
      rawCurrencies.value ??
      rawCurrencies.code ??
      rawCurrencies.id;

    if (
      directValue !== null &&
      directValue !== undefined &&
      directValue !== ""
    ) {
      const value =
        String(directValue);

      const label =
        rawCurrencies.label ??
        rawCurrencies.name ??
        rawCurrencies.currency_name ??
        rawCurrencies.currency_code ??
        rawCurrencies.currencyCode ??
        rawCurrencies.currency ??
        rawCurrencies.value ??
        rawCurrencies.code ??
        value;

      return [
        {
          value,
          label: String(label),
        },
      ];
    }

    return Object.entries(
      rawCurrencies
    )
      .map(
        ([key, item]) => {
          if (
            item === null ||
            item === undefined ||
            item === ""
          ) {
            return {
              value: String(key),
              label: String(key),
            };
          }

          if (
            typeof item === "string" ||
            typeof item === "number"
          ) {
            return {
              value: String(item),
              label: String(item),
            };
          }

          if (
            typeof item === "object"
          ) {
            const value =
              item.currency_code ??
              item.currencyCode ??
              item.currency ??
              item.value ??
              item.code ??
              key;

            const label =
              item.label ??
              item.name ??
              item.currency_name ??
              item.currency_code ??
              item.currencyCode ??
              item.currency ??
              item.value ??
              item.code ??
              value;

            return {
              value: String(value),
              label: String(label),
            };
          }

          return {
            value: String(key),
            label: String(key),
          };
        }
      )
      .filter(
        (item) =>
          item.value !== ""
      );
  }

  return [];
}

/* =========================================================
   NORMALIZE API OPTIONS
========================================================= */

function normalizeOpexFilterOptions(
  data = {}
) {
  const payload =
    data?.data &&
      typeof data.data === "object" &&
      !Array.isArray(data.data)
      ? data.data
      : data;

  const rawCurrencies =
    payload?.reporting_currencies ??
    payload?.currencies ??
    payload?.currency_options ??
    payload?.ledger_currencies ??
    payload?.reporting_currency ??
    [];

  let currencies =
    normalizeCurrencyOptions(
      rawCurrencies
    );

  if (
    !currencies.length &&
    payload?.default_reporting_currency
  ) {
    currencies =
      normalizeCurrencyOptions(
        payload.default_reporting_currency
      );
  }

  const periods =
    Array.isArray(
      payload?.periods
    )
      ? payload.periods
      : [];

  return {
    legal_groups:
      Array.isArray(
        payload?.legal_groups
      )
        ? payload.legal_groups
        : [],

    legal_entities:
      Array.isArray(
        payload?.legal_entities
      )
        ? payload.legal_entities
        : [],

    parent_divisions:
      Array.isArray(
        payload?.parent_divisions
      )
        ? payload.parent_divisions
        : [],

    subdivisions:
      Array.isArray(
        payload?.subdivisions
      )
        ? payload.subdivisions
        : [],

    periods,

    years:
      normalizeYears(
        payload,
        periods
      ),

    reporting_currencies:
      currencies,

    currencies,

    compare_with:
      Array.isArray(
        payload?.compare_with
      )
        ? payload.compare_with
        : Array.isArray(
          payload?.compare_periods
        )
          ? payload.compare_periods
          : [],

    data_as_of:
      payload?.data_as_of ||
      null,

    default_reporting_currency:
      payload?.default_reporting_currency ||
      "AED",
  };
}

/* =========================================================
   CLOSED SELECT STYLE
========================================================= */

const selectStyle = {
  appearance: "none",

  padding:
    "6px 28px 6px 10px",

  fontSize:
    "0.78rem",

  fontWeight: 500,

  color:
    "#334155",

  backgroundColor:
    "#fff",

  border:
    "1px solid #e2e8f0",

  borderRadius: 7,

  cursor: "pointer",

  outline: "none",

  width: "100%",

  height: 34,

  boxSizing: "border-box",

  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",

  backgroundRepeat:
    "no-repeat",

  backgroundPosition:
    "right 8px center",
};

/* =========================================================
   FILTER FIELD
========================================================= */

function FilterField({
  label,
  children,
  width,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: width,
        width,
        flex: "0 0 auto",
      }}
    >
      <span
        style={{
          fontSize: "0.66rem",
          color: "#1e3a8a",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>

      {children}
    </div>
  );
}

/* =========================================================
   MULTI SELECT
========================================================= */

function OpexMultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "All",
  searchPlaceholder = "Search...",
  width = 128,
}) {
  const [open, setOpen] =
    useState(false);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const ref =
    useRef(null);

  const searchRef =
    useRef(null);

  const triggerRef =
    useRef(null);

  const dropdownRef =
    useRef(null);

  const [
    menuReady,
    setMenuReady,
  ] = useState(false);

  const [
    menuPosition,
    setMenuPosition,
  ] = useState({
    top: 0,
    left: 0,
    width: Math.max(width, 225),
    maxHeight: 300,
  });

  /* =======================================================
     UPDATE POSITION
  ======================================================= */

  const updateMenuPosition = () => {
    const trigger =
      triggerRef.current;

    if (!trigger) {
      return;
    }

    const rect =
      trigger.getBoundingClientRect();

    const menuWidth =
      Math.max(width, 225);

    const viewportPadding = 8;

    const preferredHeight = 300;

    const spaceBelow =
      window.innerHeight -
      rect.bottom -
      viewportPadding;

    const spaceAbove =
      rect.top -
      viewportPadding;

    const openAbove =
      spaceBelow < 180 &&
      spaceAbove > spaceBelow;

    const availableHeight =
      Math.max(
        120,
        Math.min(
          preferredHeight,
          openAbove
            ? spaceAbove
            : spaceBelow
        )
      );

    const top =
      openAbove
        ? Math.max(
          viewportPadding,
          rect.top -
          availableHeight -
          3
        )
        : rect.bottom + 3;

    const maxLeft =
      Math.max(
        viewportPadding,
        window.innerWidth -
        menuWidth -
        viewportPadding
      );

    const left =
      Math.min(
        Math.max(
          rect.left,
          viewportPadding
        ),
        maxLeft
      );

    setMenuPosition({
      top,
      left,
      width: menuWidth,
      maxHeight:
        availableHeight,
    });

    setMenuReady(true);
  };

  /* =======================================================
     OPEN DROPDOWN
  ======================================================= */

  const openDropdown = () => {
    updateMenuPosition();
    setOpen(true);
  };

  /* =======================================================
     POSITION ONLY WHEN OPEN
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const frame =
      requestAnimationFrame(() => {
        updateMenuPosition();
      });

    const handleViewportChange =
      () => {
        updateMenuPosition();
      };

    window.addEventListener(
      "resize",
      handleViewportChange
    );

    window.addEventListener(
      "scroll",
      handleViewportChange,
      true
    );

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener(
        "resize",
        handleViewportChange
      );

      window.removeEventListener(
        "scroll",
        handleViewportChange,
        true
      );
    };
  }, [
    open,
    width,
  ]);

  /* =======================================================
     CLOSE OUTSIDE
  ======================================================= */

  useEffect(() => {
    const handleOutside = (event) => {
      const target =
        event.target;

      const clickedTrigger =
        ref.current?.contains(
          target
        );

      const clickedDropdown =
        dropdownRef.current?.contains(
          target
        );

      if (
        !clickedTrigger &&
        !clickedDropdown
      ) {
        setOpen(false);
        setMenuReady(false);
        setSearchQuery("");
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, []);

  /* =======================================================
     FOCUS SEARCH
  ======================================================= */

  useEffect(() => {
    if (
      open &&
      searchRef.current
    ) {
      requestAnimationFrame(() => {
        searchRef.current?.focus();
      });
    }

    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  /* =======================================================
     NORMALIZE
  ======================================================= */

  const normalized =
    (options || [])
      .map((option) => {
        if (
          option === null ||
          option === undefined
        ) {
          return null;
        }

        if (
          typeof option === "string" ||
          typeof option === "number"
        ) {
          return {
            id: String(option),
            name: String(option),
          };
        }

        const id =
          option.value !== undefined
            ? option.value
            : option.id !== undefined
              ? option.id
              : option.code !== undefined
                ? option.code
                : "";

        const name =
          option.label !== undefined
            ? option.label
            : option.name !== undefined
              ? option.name
              : option.period_name !== undefined
                ? option.period_name
                : String(id);

        if (
          id === null ||
          id === undefined ||
          id === ""
        ) {
          return null;
        }

        return {
          id: String(id),
          name: String(name),
        };
      })
      .filter(Boolean);

  const currentValues =
    Array.isArray(value)
      ? value.map(String)
      : [];

  /* =======================================================
     SEARCH
  ======================================================= */

  const query =
    searchQuery
      .trim()
      .toLowerCase();

  const visibleOptions =
    query
      ? normalized.filter(
        (option) =>
          option.name
            .toLowerCase()
            .includes(query) ||
          option.id
            .toLowerCase()
            .includes(query)
      )
      : normalized;

  /* =======================================================
     DISPLAY
  ======================================================= */

  const isAll =
    currentValues.length === 0;

  const isAllSelected =
    normalized.length > 0 &&
    currentValues.length ===
    normalized.length &&
    normalized.every(
      (option) =>
        currentValues.includes(
          option.id
        )
    );

  const selectedOptions =
    normalized.filter(
      (option) =>
        currentValues.includes(
          option.id
        )
    );

  const displayText =
    isAll
      ? placeholder
      : isAllSelected
        ? "All"
        : selectedOptions.length === 1
          ? selectedOptions[0].name
          : `${selectedOptions.length} selected`;

  /* =======================================================
     TOGGLE
  ======================================================= */

  const toggleValue = (id) => {
    const stringId =
      String(id);

    if (
      currentValues.includes(
        stringId
      )
    ) {
      onChange?.(
        currentValues.filter(
          (item) =>
            item !== stringId
        )
      );
    } else {
      onChange?.([
        ...currentValues,
        stringId,
      ]);
    }
  };

  /* =======================================================
     SELECT ALL
  ======================================================= */

  const handleSelectAll = () => {
    onChange?.(
      normalized.map(
        (option) =>
          option.id
      )
    );
  };

  /* =======================================================
     CLEAR
  ======================================================= */

  const handleClear = () => {
    onChange?.([]);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width,
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) {
            setOpen(false);
            setMenuReady(false);
            setSearchQuery("");
          } else {
            openDropdown();
          }
        }}
        style={{
          ...selectStyle,
          textAlign: "left",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={displayText}
      >
        {displayText}
      </button>

      {open && menuReady && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",

            top:
              menuPosition.top,

            left:
              menuPosition.left,

            width:
              menuPosition.width,

            maxHeight:
              menuPosition.maxHeight,

            overflowY: "auto",

            overflowX: "hidden",

            background: "#fff",

            border:
              "1px solid #e2e8f0",

            borderRadius: 7,

            boxShadow:
              "0 8px 22px rgba(15,23,42,0.14)",

            zIndex: 99999,

            padding: 6,

            boxSizing: "border-box",

            scrollbarWidth: "thin",

            scrollbarColor:
              "#64748b #f1f5f9",
          }}
        >
          <div
            style={{
              position: "relative",
              marginBottom: 4,
            }}
          >
            <Search
              size={13}
              style={{
                position:
                  "absolute",

                left: 8,

                top: 8,

                color:
                  "#94a3b8",

                pointerEvents:
                  "none",
              }}
            />

            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder={
                searchPlaceholder
              }
              style={{
                width: "100%",

                height: 30,

                boxSizing:
                  "border-box",

                border:
                  "1px solid #dbe3ef",

                borderRadius: 6,

                padding:
                  "0 8px 0 26px",

                outline: "none",

                fontSize:
                  "0.72rem",

                color:
                  "#334155",

                background:
                  "#fff",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              height: 25,

              padding:
                "0 6px",

              marginBottom: 1,
            }}
          >
            <button
              type="button"
              onClick={
                handleSelectAll
              }
              style={{
                border: "none",

                background:
                  "transparent",

                padding: 0,

                margin: 0,

                cursor:
                  "pointer",

                fontSize:
                  "0.68rem",

                lineHeight:
                  "18px",

                fontWeight: 600,

                color:
                  "#4f46e5",
              }}
            >
              Select All
            </button>

            <button
              type="button"
              onClick={
                handleClear
              }
              style={{
                border: "none",

                background:
                  "transparent",

                padding: 0,

                margin: 0,

                cursor:
                  "pointer",

                fontSize:
                  "0.68rem",

                lineHeight:
                  "18px",

                fontWeight: 500,

                color:
                  "#64748b",
              }}
            >
              Clear
            </button>
          </div>

          {visibleOptions.map(
            (option) => {
              const checked =
                currentValues.includes(
                  option.id
                );

              return (
                <label
                  key={option.id}
                  style={{
                    display: "flex",

                    alignItems:
                      "center",

                    gap: 6,

                    width: "100%",

                    height: 27,

                    minHeight: 27,

                    boxSizing:
                      "border-box",

                    padding:
                      "2px 6px",

                    margin: 0,

                    borderRadius: 4,

                    cursor:
                      "pointer",

                    fontSize:
                      "0.72rem",

                    lineHeight:
                      "18px",

                    fontWeight:
                      checked
                        ? 600
                        : 500,

                    color:
                      "#334155",

                    background:
                      checked
                        ? "#f5f7ff"
                        : "#fff",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      checked
                    }
                    onChange={() =>
                      toggleValue(
                        option.id
                      )
                    }
                    style={{
                      margin: 0,

                      padding: 0,

                      width: 14,

                      height: 14,

                      flexShrink: 0,

                      accentColor:
                        "#4f46e5",

                      cursor:
                        "pointer",
                    }}
                  />

                  <span
                    style={{
                      display:
                        "block",

                      minWidth: 0,

                      overflow:
                        "hidden",

                      textOverflow:
                        "ellipsis",

                      whiteSpace:
                        "nowrap",

                      lineHeight:
                        "18px",
                    }}
                    title={
                      option.name
                    }
                  >
                    {option.name}
                  </span>
                </label>
              );
            }
          )}

          {!visibleOptions.length && (
            <div
              style={{
                padding:
                  "10px 6px",

                textAlign:
                  "center",

                fontSize:
                  "0.7rem",

                color:
                  "#94a3b8",
              }}
            >
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SINGLE SELECT
========================================================= */

function OpexSingleSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Select",
  searchPlaceholder = "Search...",
  width = 128,
  searchable = true,
}) {
  const [open, setOpen] =
    useState(false);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const ref =
    useRef(null);

  const searchRef =
    useRef(null);

  const triggerRef =
    useRef(null);

  const dropdownRef =
    useRef(null);

  const [
    menuReady,
    setMenuReady,
  ] = useState(false);

  const [
    menuPosition,
    setMenuPosition,
  ] = useState({
    top: 0,
    left: 0,
    width: Math.max(width, 225),
    maxHeight: 300,
  });

  /* =======================================================
     UPDATE POSITION
  ======================================================= */

  const updateMenuPosition = () => {
    const trigger =
      triggerRef.current;

    if (!trigger) {
      return;
    }

    const rect =
      trigger.getBoundingClientRect();

    const menuWidth =
      Math.max(width, 225);

    const viewportPadding = 8;

    const preferredHeight = 300;

    const spaceBelow =
      window.innerHeight -
      rect.bottom -
      viewportPadding;

    const spaceAbove =
      rect.top -
      viewportPadding;

    const openAbove =
      spaceBelow < 180 &&
      spaceAbove > spaceBelow;

    const availableHeight =
      Math.max(
        120,
        Math.min(
          preferredHeight,
          openAbove
            ? spaceAbove
            : spaceBelow
        )
      );

    const top =
      openAbove
        ? Math.max(
          viewportPadding,
          rect.top -
          availableHeight -
          3
        )
        : rect.bottom + 3;

    const maxLeft =
      Math.max(
        viewportPadding,
        window.innerWidth -
        menuWidth -
        viewportPadding
      );

    const left =
      Math.min(
        Math.max(
          rect.left,
          viewportPadding
        ),
        maxLeft
      );

    setMenuPosition({
      top,
      left,
      width: menuWidth,
      maxHeight:
        availableHeight,
    });

    setMenuReady(true);
  };

  /* =======================================================
     OPEN DROPDOWN
  ======================================================= */

  const openDropdown = () => {
    updateMenuPosition();
    setOpen(true);
  };

  /* =======================================================
     POSITION ONLY WHILE OPEN
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const frame =
      requestAnimationFrame(() => {
        updateMenuPosition();
      });

    const handleViewportChange =
      () => {
        updateMenuPosition();
      };

    window.addEventListener(
      "resize",
      handleViewportChange
    );

    window.addEventListener(
      "scroll",
      handleViewportChange,
      true
    );

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener(
        "resize",
        handleViewportChange
      );

      window.removeEventListener(
        "scroll",
        handleViewportChange,
        true
      );
    };
  }, [
    open,
    width,
  ]);

  /* =======================================================
     CLOSE OUTSIDE
  ======================================================= */

  useEffect(() => {
    const handleOutside =
      (event) => {
        const target =
          event.target;

        const clickedTrigger =
          ref.current?.contains(
            target
          );

        const clickedDropdown =
          dropdownRef.current?.contains(
            target
          );

        if (
          !clickedTrigger &&
          !clickedDropdown
        ) {
          setOpen(false);
          setMenuReady(false);
          setSearchQuery("");
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, []);

  /* =======================================================
     FOCUS SEARCH
  ======================================================= */

  useEffect(() => {
    if (
      open &&
      searchable &&
      searchRef.current
    ) {
      requestAnimationFrame(() => {
        searchRef.current?.focus();
      });
    }

    if (!open) {
      setSearchQuery("");
    }
  }, [
    open,
    searchable,
  ]);

  /* =======================================================
     NORMALIZE
  ======================================================= */

  const normalized =
    (options || [])
      .map((option) => {
        if (
          option === null ||
          option === undefined
        ) {
          return null;
        }

        if (
          typeof option === "string" ||
          typeof option === "number"
        ) {
          return {
            id: String(option),
            name: String(option),
          };
        }

        const id =
          option.value !== undefined
            ? option.value
            : option.id !== undefined
              ? option.id
              : option.code !== undefined
                ? option.code
                : "";

        const name =
          option.label !== undefined
            ? option.label
            : option.name !== undefined
              ? option.name
              : option.period_name !== undefined
                ? option.period_name
                : String(id);

        if (
          id === null ||
          id === undefined ||
          id === ""
        ) {
          return null;
        }

        return {
          id: String(id),
          name: String(name),
        };
      })
      .filter(Boolean);

  const currentValue =
    value === null ||
      value === undefined
      ? ""
      : String(value);

  const currentOption =
    normalized.find(
      (option) =>
        option.id ===
        currentValue
    );

  /* =======================================================
     SEARCH
  ======================================================= */

  const query =
    searchQuery
      .trim()
      .toLowerCase();

  const visibleOptions =
    searchable && query
      ? normalized.filter(
        (option) =>
          option.name
            .toLowerCase()
            .includes(query) ||
          option.id
            .toLowerCase()
            .includes(query)
      )
      : normalized;

  const displayText =
    currentOption?.name ||
    placeholder;

  /* =======================================================
     SELECT
  ======================================================= */

  const handleSelect =
    (option) => {
      onChange?.(
        option.id
      );

      setOpen(false);
      setMenuReady(false);
      setSearchQuery("");
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width,
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) {
            setOpen(false);
            setMenuReady(false);
            setSearchQuery("");
          } else {
            openDropdown();
          }
        }}
        style={{
          ...selectStyle,
          textAlign: "left",
          overflow: "hidden",
          textOverflow:
            "ellipsis",
          whiteSpace:
            "nowrap",
        }}
        title={displayText}
      >
        {displayText}
      </button>

      {open && menuReady && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",

            top:
              menuPosition.top,

            left:
              menuPosition.left,

            width:
              menuPosition.width,

            maxHeight:
              menuPosition.maxHeight,

            overflowY: "auto",

            overflowX: "hidden",

            background: "#fff",

            border:
              "1px solid #e2e8f0",

            borderRadius: 7,

            boxShadow:
              "0 8px 22px rgba(15,23,42,0.14)",

            zIndex: 99999,

            padding: 6,

            boxSizing:
              "border-box",

            scrollbarWidth:
              "thin",

            scrollbarColor:
              "#64748b #f1f5f9",
          }}
        >
          {searchable && (
            <div
              style={{
                position:
                  "relative",

                marginBottom: 4,
              }}
            >
              <Search
                size={13}
                style={{
                  position:
                    "absolute",

                  left: 8,

                  top: 8,

                  color:
                    "#94a3b8",

                  pointerEvents:
                    "none",
                }}
              />

              <input
                ref={searchRef}
                type="text"
                value={
                  searchQuery
                }
                onChange={(
                  event
                ) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder={
                  searchPlaceholder
                }
                style={{
                  width: "100%",

                  height: 30,

                  boxSizing:
                    "border-box",

                  border:
                    "1px solid #dbe3ef",

                  borderRadius: 6,

                  padding:
                    "0 8px 0 26px",

                  outline: "none",

                  fontSize:
                    "0.72rem",

                  color:
                    "#334155",

                  background:
                    "#fff",
                }}
              />
            </div>
          )}

          {visibleOptions.map(
            (option) => {
              const selected =
                option.id ===
                currentValue;

              return (
                <button
                  key={
                    option.id
                  }
                  type="button"
                  onClick={() =>
                    handleSelect(
                      option
                    )
                  }
                  style={{
                    width: "100%",

                    height: 27,

                    minHeight: 27,

                    boxSizing:
                      "border-box",

                    border: "none",

                    background:
                      selected
                        ? "#f5f7ff"
                        : "#fff",

                    textAlign:
                      "left",

                    padding:
                      "2px 8px",

                    margin: 0,

                    borderRadius: 4,

                    cursor:
                      "pointer",

                    fontSize:
                      "0.72rem",

                    lineHeight:
                      "18px",

                    fontWeight:
                      selected
                        ? 600
                        : 500,

                    color:
                      "#334155",

                    overflow:
                      "hidden",

                    textOverflow:
                      "ellipsis",

                    whiteSpace:
                      "nowrap",
                  }}
                  title={
                    option.name
                  }
                >
                  {option.name}
                </button>
              );
            }
          )}

          {!visibleOptions.length && (
            <div
              style={{
                padding:
                  "10px 6px",

                textAlign:
                  "center",

                fontSize:
                  "0.7rem",

                color:
                  "#94a3b8",
              }}
            >
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   OPEX FILTERS
========================================================= */

export default function OpexFilters({
  filterOptions = {},
  selectedFilters:
    externalSelectedFilters,
  onChange,
  onApply,
  onReset,
}) {
  const [
    opexFilterOptions,
    setOpexFilterOptions,
  ] = useState(
    normalizeOpexFilterOptions(
      filterOptions
    )
  );

  const [
    selectedFilters,
    setSelectedFilters,
  ] = useState(() => {
    const normalized =
      normalizeOpexFilterOptions(
        filterOptions
      );

    const years =
      normalized.years || [];

    const periods =
      normalized.periods || [];

    const firstYear =
      years.length
        ? getOptionValue(
          years[0]
        )
        : "";

    const latestPeriod =
      periods.length
        ? getLatestPeriod(
          periods
        )
        : "";

    return {
      ...DEFAULT_FILTERS,

      ...(externalSelectedFilters ||
        {}),

      year:
        externalSelectedFilters?.year ||
        (firstYear
          ? String(firstYear)
          : ""),

      period:
        externalSelectedFilters?.period ||
        (latestPeriod
          ? [
            String(
              latestPeriod
            ),
          ]
          : []),

      reporting_currency:
        externalSelectedFilters
          ?.reporting_currency ||
        normalized.default_reporting_currency ||
        "AED",
    };
  });

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =======================================================
     REQUEST CONTROL
  ======================================================= */

  const requestSequenceRef =
    useRef(0);

  const initialLoadRef =
    useRef(false);

  /* =======================================================
     SYNC EXTERNAL FILTERS
  ======================================================= */

  useEffect(() => {
    if (
      !externalSelectedFilters
    ) {
      return;
    }

    setSelectedFilters(
      (previous) => {
        let changed = false;

        const next = {
          ...previous,
        };

        Object.keys(
          externalSelectedFilters
        ).forEach((key) => {
          const previousValue =
            previous[key];

          const nextValue =
            externalSelectedFilters[
              key
            ];

          if (
            Array.isArray(
              previousValue
            ) &&
            Array.isArray(
              nextValue
            )
          ) {
            if (
              previousValue.length !==
              nextValue.length ||
              previousValue.some(
                (item, index) =>
                  String(item) !==
                  String(
                    nextValue[index]
                  )
              )
            ) {
              changed = true;
              next[key] =
                nextValue;
            }
          } else if (
            previousValue !==
            nextValue
          ) {
            changed = true;
            next[key] =
              nextValue;
          }
        });

        return changed
          ? next
          : previous;
      }
    );
  }, [
    externalSelectedFilters,
  ]);

  /* =======================================================
     LOAD FILTER OPTIONS
     
     IMPORTANT:
     A dependent request is now allowed to
     update ONLY its dependent option list.
     
     This is the main stability fix.
  ======================================================= */

  const loadOpexFilterOptions =
    async (
      currentFilters = {},
      preserveOptionKey = null
    ) => {
      const requestId =
        ++requestSequenceRef.current;

      try {
        setLoading(true);

        const response =
          await getOpexFilterOptions(
            currentFilters
          );

        /*
         * Ignore stale responses.
         */
        if (
          requestId !==
          requestSequenceRef.current
        ) {
          return null;
        }

        const normalized =
          normalizeOpexFilterOptions(
            response
          );

        setOpexFilterOptions(
          (previous) => {
            /*
             * =================================================
             * DEPENDENT REQUEST
             *
             * Do NOT replace the complete filter-option
             * object.
             *
             * Only replace the dropdown that this request
             * was specifically made for.
             *
             * This keeps the other filters completely stable.
             * =================================================
             */
            if (
              preserveOptionKey
            ) {
              const newOptions =
                normalized[
                  preserveOptionKey
                ];

              /*
               * If API returned a real array for the
               * requested dependent field, use it.
               *
               * If the API did not return that field,
               * keep the existing options.
               */
              if (
                Array.isArray(
                  newOptions
                )
              ) {
                return {
                  ...previous,

                  [preserveOptionKey]:
                    newOptions,
                };
              }

              return previous;
            }

            /*
             * =================================================
             * INITIAL / FULL REQUEST
             *
             * Full option response is allowed to replace
             * the complete option set.
             * =================================================
             */
            return {
              ...previous,
              ...normalized,
            };
          }
        );

        return normalized;
      } catch (error) {
        if (
          requestId !==
          requestSequenceRef.current
        ) {
          return null;
        }

        console.error(
          "Failed to load OPEX filter options:",
          error
        );

        return null;
      } finally {
        if (
          requestId ===
          requestSequenceRef.current
        ) {
          setLoading(false);
        }
      }
    };

  /* =======================================================
     INITIAL OPTIONS
  ======================================================= */

  useEffect(() => {
    if (
      initialLoadRef.current
    ) {
      return;
    }

    initialLoadRef.current =
      true;

    void loadOpexFilterOptions(
      {}
    );
  }, []);

  /* =======================================================
     DEFAULT VALUES
  ======================================================= */

  useEffect(() => {
    if (
      !opexFilterOptions
    ) {
      return;
    }

    setSelectedFilters(
      (previous) => {
        let changed = false;

        const next = {
          ...previous,
        };

        if (
          !next.year &&
          opexFilterOptions
            .years?.length
        ) {
          const firstYear =
            String(
              getOptionValue(
                opexFilterOptions
                  .years[0]
              )
            );

          if (
            firstYear !==
            next.year
          ) {
            next.year =
              firstYear;

            changed = true;
          }
        }

        if (
          (!Array.isArray(
            next.period
          ) ||
            next.period.length ===
            0) &&
          opexFilterOptions
            .periods?.length
        ) {
          const latestPeriod =
            getLatestPeriod(
              opexFilterOptions
                .periods
            );

          if (
            latestPeriod
          ) {
            const nextPeriod = [
              String(
                latestPeriod
              ),
            ];

            const samePeriod =
              Array.isArray(
                next.period
              ) &&
              next.period.length ===
                nextPeriod.length &&
              next.period.every(
                (
                  item,
                  index
                ) =>
                  String(item) ===
                  String(
                    nextPeriod[
                      index
                    ]
                  )
              );

            if (
              !samePeriod
            ) {
              next.period =
                nextPeriod;

              changed = true;
            }
          }
        }

        if (
          !next.reporting_currency
        ) {
          next.reporting_currency =
            opexFilterOptions
              .default_reporting_currency ||
            "AED";

          changed = true;
        }

        return changed
          ? next
          : previous;
      }
    );
  }, [
    opexFilterOptions,
  ]);

  /* =======================================================
     FILTER CHANGE
  ======================================================= */

  const handleFilterChange = (
    key,
    value
  ) => {
    /*
     * Create the FINAL filter state first.
     *
     * Only ONE setSelectedFilters call.
     */
    const nextFilters = {
      ...selectedFilters,
      [key]: value,
    };

    const optionKeyMap = {
      legal_group:
        "legal_entities",

      legal_entity:
        "parent_divisions",

      parent_division:
        "subdivisions",
    };

    const apiKeyMap = {
      legal_group:
        "legal_group_id",

      legal_entity:
        "legal_entity_id",

      parent_division:
        "parent_division_id",
    };

    const dependentKey =
      optionKeyMap[key];

    const apiKey =
      apiKeyMap[key];

    /* =====================================================
       CLEAR LOWER LEVEL FILTERS
    ===================================================== */

    if (
      key ===
      "legal_group"
    ) {
      nextFilters.legal_entity =
        [];

      nextFilters.parent_division =
        [];

      nextFilters.subdivision =
        [];
    }

    if (
      key ===
      "legal_entity"
    ) {
      nextFilters.parent_division =
        [];

      nextFilters.subdivision =
        [];
    }

    if (
      key ===
      "parent_division"
    ) {
      nextFilters.subdivision =
        [];
    }

    /*
     * Update local state exactly once.
     */
    setSelectedFilters(
      nextFilters
    );

    /*
     * Load ONLY the dependent options.
     */
    if (
      dependentKey &&
      apiKey
    ) {
      const apiFilters = {
        year:
          nextFilters.year ||
          undefined,

        period_name:
          nextFilters.period ||
          undefined,

        reporting_currency:
          nextFilters
            .reporting_currency ||
          "AED",

        [apiKey]:
          Array.isArray(value)
            ? value
            : value
              ? [value]
              : [],
      };

      void loadOpexFilterOptions(
        apiFilters,
        dependentKey
      );
    }
  };

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = () => {
    /*
     * Invalidate every currently running request.
     */
    ++requestSequenceRef.current;

    const years =
      opexFilterOptions
        .years?.length
        ? opexFilterOptions.years
        : filterOptions?.years ||
        [];

    const periods =
      opexFilterOptions
        .periods?.length
        ? opexFilterOptions
          .periods
        : filterOptions?.periods ||
        [];

    const firstYear =
      years.length
        ? getOptionValue(
          years[0]
        )
        : "";

    const latestPeriod =
      periods.length
        ? getLatestPeriod(
          periods
        )
        : "";

    const resetFilters = {
      ...DEFAULT_FILTERS,

      legal_group: [],
      legal_entity: [],
      parent_division: [],
      subdivision: [],

      period:
        latestPeriod
          ? [
            String(
              latestPeriod
            ),
          ]
          : [],

      year:
        firstYear
          ? String(
            firstYear
          )
          : "",

      reporting_currency:
        opexFilterOptions
          .default_reporting_currency ||
        filterOptions
          ?.default_reporting_currency ||
        "AED",
    };

    setSelectedFilters(
      resetFilters
    );

    onChange?.(
      resetFilters
    );

    onReset?.();

    /*
     * Fresh full options request.
     */
    void loadOpexFilterOptions(
      {}
    );
  };

  const options = {
    ...filterOptions,
    ...opexFilterOptions,
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="card"
      style={{
        width: "100%",

        maxWidth: "100%",

        padding:
          "10px 16px",

        marginBottom: 16,

        display: "flex",

        alignItems:
          "flex-end",

        gap: 10,

        flexWrap: "wrap",

        boxSizing:
          "border-box",

        overflow: "visible",

        position: "relative",

        zIndex: 20,

        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* ===================================================
          LEGAL GROUP
      =================================================== */}

      <FilterField
        label="Legal Group"
        width={
          FIELD_WIDTHS.legal_group
        }
      >
        <OpexMultiSelect
          options={
            options.legal_groups ||
            []
          }
          value={
            selectedFilters
              .legal_group ||
            []
          }
          onChange={(value) =>
            handleFilterChange(
              "legal_group",
              value
            )
          }
          placeholder="All"
          searchPlaceholder="Search Legal Group"
          width={
            FIELD_WIDTHS.legal_group
          }
        />
      </FilterField>

      {/* ===================================================
          LEGAL ENTITY
      =================================================== */}

      <FilterField
        label="Legal Entity"
        width={
          FIELD_WIDTHS.legal_entity
        }
      >
        <OpexMultiSelect
          options={
            options.legal_entities ||
            []
          }
          value={
            selectedFilters
              .legal_entity ||
            []
          }
          onChange={(value) =>
            handleFilterChange(
              "legal_entity",
              value
            )
          }
          placeholder="All"
          searchPlaceholder="Search Legal Entity"
          width={
            FIELD_WIDTHS.legal_entity
          }
        />
      </FilterField>

      {/* ===================================================
          PARENT DIVISION
      =================================================== */}

      <FilterField
        label="Parent Division"
        width={
          FIELD_WIDTHS.parent_division
        }
      >
        <OpexMultiSelect
          options={
            options.parent_divisions ||
            []
          }
          value={
            selectedFilters
              .parent_division ||
            []
          }
          onChange={(value) =>
            handleFilterChange(
              "parent_division",
              value
            )
          }
          placeholder="All"
          searchPlaceholder="Search Parent Division"
          width={
            FIELD_WIDTHS.parent_division
          }
        />
      </FilterField>

      {/* ===================================================
          SUB-DIVISION
      =================================================== */}

      <FilterField
        label="Sub-Division"
        width={
          FIELD_WIDTHS.subdivision
        }
      >
        <OpexMultiSelect
          options={
            options.subdivisions ||
            []
          }
          value={
            selectedFilters
              .subdivision ||
            []
          }
          onChange={(value) =>
            handleFilterChange(
              "subdivision",
              value
            )
          }
          placeholder="All"
          searchPlaceholder="Search Sub-Division"
          width={
            FIELD_WIDTHS.subdivision
          }
        />
      </FilterField>

      {/* ===================================================
          YEAR
      =================================================== */}

      <FilterField
        label="Year"
        width={
          FIELD_WIDTHS.year
        }
      >
        <OpexSingleSelect
          options={
            options.years ||
            []
          }
          value={
            selectedFilters.year ||
            ""
          }
          onChange={(value) =>
            handleFilterChange(
              "year",
              value
            )
          }
          placeholder="Select Year"
          searchPlaceholder="Search Year"
          width={
            FIELD_WIDTHS.year
          }
        />
      </FilterField>

      {/* ===================================================
          PERIOD
      =================================================== */}

      <FilterField
        label="Period"
        width={
          FIELD_WIDTHS.period
        }
      >
        <OpexMultiSelect
          options={
            options.periods ||
            []
          }
          value={
            selectedFilters.period ||
            []
          }
          onChange={(value) =>
            handleFilterChange(
              "period",
              value
            )
          }
          placeholder="All"
          searchPlaceholder="Search Period"
          width={
            FIELD_WIDTHS.period
          }
        />
      </FilterField>

      {/* ===================================================
          REPORTING CURRENCY
      =================================================== */}

      <FilterField
        label="Reporting Currency"
        width={
          FIELD_WIDTHS.reporting_currency
        }
      >
        <OpexSingleSelect
          options={
            options
              .reporting_currencies
              ?.length
              ? options.reporting_currencies
              : [
                {
                  value:
                    options
                      .default_reporting_currency ||
                    "AED",

                  label:
                    options
                      .default_reporting_currency ||
                    "AED",
                },
              ]
          }
          value={
            selectedFilters
              .reporting_currency ||
            options
              .default_reporting_currency ||
            "AED"
          }
          onChange={(value) =>
            handleFilterChange(
              "reporting_currency",
              value
            )
          }
          placeholder="AED"
          searchable={false}
          width={
            FIELD_WIDTHS.reporting_currency
          }
        />
      </FilterField>

      {/* ===================================================
          APPLY / RESET
      =================================================== */}

      <div
        style={{
          display: "flex",

          alignItems:
            "center",

          gap: 8,

          alignSelf:
            "flex-end",

          flexShrink: 0,

          paddingBottom: 1,

          marginLeft: 6,
        }}
      >
        <button
          id="btn-apply-opex-filter"
          type="button"
          onClick={() =>
            onApply?.(
              selectedFilters
            )
          }
          style={{
            height: 34,

            padding:
              "0 16px",

            background:
              "#6366f1",

            color: "#fff",

            border: "none",

            borderRadius: 8,

            fontSize:
              "0.78rem",

            fontWeight: 700,

            cursor:
              "pointer",

            whiteSpace:
              "nowrap",

            display:
              "inline-flex",

            alignItems:
              "center",

            justifyContent:
              "center",
          }}
        >
          Apply
        </button>

        <button
          id="btn-reset-opex-filter"
          type="button"
          onClick={
            handleReset
          }
          style={{
            height: 34,

            padding:
              "0 10px",

            background:
              "#fff",

            border:
              "1px solid #e2e8f0",

            color:
              "#64748b",

            borderRadius: 8,

            fontWeight: 600,

            fontSize:
              "0.78rem",

            cursor:
              "pointer",

            whiteSpace:
              "nowrap",

            display:
              "inline-flex",

            alignItems:
              "center",

            justifyContent:
              "center",
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}