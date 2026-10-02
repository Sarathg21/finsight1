
// // import React, { useEffect, useMemo, useState } from "react";
// // import { deriveCategoryNaturalAccounts } from "../../data/opexNaturalAccounts";
// // import {
// //     getOpexFilterOptions,
// //     getOpexCategoryBreakdown,
// // } from "../../api/opexApi";

// // /* =========================================================
// //    MONTHS
// // ========================================================= */

// // const MONTHS = [
// //     "Jan",
// //     "Feb",
// //     "Mar",
// //     "Apr",
// //     "May",
// //     "Jun",
// //     "Jul",
// //     "Aug",
// //     "Sep",
// //     "Oct",
// //     "Nov",
// //     "Dec",
// // ];

// // /* =========================================================
// //    FORMAT NUMBER
// //    No decimal points
// // ========================================================= */

// // const formatNumber = (value) => {
// //     if (
// //         value === null ||
// //         value === undefined ||
// //         value === ""
// //     ) {
// //         return "—";
// //     }

// //     const number = Number(
// //         typeof value === "string"
// //             ? value.replace(/,/g, "")
// //             : value
// //     );

// //     if (!Number.isFinite(number)) {
// //         return "—";
// //     }

// //     return number.toLocaleString("en-US", {
// //         maximumFractionDigits: 0,
// //         minimumFractionDigits: 0,
// //     });
// // };

// // /* =========================================================
// //    GET NUMBER COLOR
// //    Negative values = RED
// // ========================================================= */

// // const getNumberColor = (
// //     value,
// //     defaultColor = "#334155"
// // ) => {
// //     if (
// //         value === null ||
// //         value === undefined ||
// //         value === "" ||
// //         value === "-" ||
// //         value === "—"
// //     ) {
// //         return defaultColor;
// //     }

// //     const number = Number(
// //         typeof value === "string"
// //             ? value.replace(/,/g, "")
// //             : value
// //     );

// //     if (
// //         Number.isFinite(number) &&
// //         number < 0
// //     ) {
// //         return "#DC2626";
// //     }

// //     return defaultColor;
// // };

// // /* =========================================================
// //    FORMAT MONTH VALUE
// //    AED → AED Millions
// // ========================================================= */

// // const formatMonthValue = (value) => {
// //     if (
// //         value === null ||
// //         value === undefined ||
// //         value === ""
// //     ) {
// //         return "—";
// //     }

// //     const number = Number(
// //         typeof value === "string"
// //             ? value.replace(/,/g, "")
// //             : value
// //     );

// //     if (!Number.isFinite(number)) {
// //         return "—";
// //     }

// //     const millions = number / 1_000_000;

// //     return `AED ${millions.toLocaleString("en-US", {
// //         minimumFractionDigits: 2,
// //         maximumFractionDigits: 2,
// //     })}M`;
// // };

// // /* =========================================================
// //    FORMAT DATA AS OF
// // ========================================================= */

// // const formatDataAsOf = (value) => {
// //     if (!value) {
// //         return "—";
// //     }

// //     const valueString = String(value);

// //     const dateOnlyMatch = valueString.match(
// //         /^(\d{4})-(\d{2})-(\d{2})$/
// //     );

// //     if (dateOnlyMatch) {
// //         const [, year, month, day] =
// //             dateOnlyMatch;

// //         const date = new Date(
// //             Number(year),
// //             Number(month) - 1,
// //             Number(day)
// //         );

// //         return date.toLocaleDateString(
// //             "en-GB",
// //             {
// //                 day: "2-digit",
// //                 month: "short",
// //                 year: "numeric",
// //             }
// //         );
// //     }

// //     const date = new Date(value);

// //     if (Number.isNaN(date.getTime())) {
// //         return valueString;
// //     }

// //     return date.toLocaleDateString(
// //         "en-GB",
// //         {
// //             day: "2-digit",
// //             month: "short",
// //             year: "numeric",
// //         }
// //     );
// // };

// // /* =========================================================
// //    GET MONTH VALUE
// // ========================================================= */

// // const getMonthValue = (
// //     monthData,
// //     month
// // ) => {
// //     if (!monthData) {
// //         return null;
// //     }

// //     if (Array.isArray(monthData)) {
// //         const monthItem =
// //             monthData.find(
// //                 (item) =>
// //                     item?.month === month ||
// //                     item?.month_name === month ||
// //                     item?.monthName === month
// //             );

// //         return (
// //             monthItem?.value ??
// //             monthItem?.actual ??
// //             monthItem?.monthly_actual ??
// //             null
// //         );
// //     }

// //     return (
// //         monthData?.[month] ??
// //         monthData?.[month.toLowerCase()] ??
// //         null
// //     );
// // };

// // /* =========================================================
// //    GET DETAILS
// // ========================================================= */

// // const getDetails = (item) => {
// //     if (!item) {
// //         return [];
// //     }

// //     if (Array.isArray(item.categoryDetails)) {
// //         return item.categoryDetails;
// //     }

// //     if (Array.isArray(item.naturalAccounts)) {
// //         return item.naturalAccounts;
// //     }

// //     if (Array.isArray(item.details)) {
// //         return item.details;
// //     }

// //     return [];
// // };

// // /* =========================================================
// //    NORMALIZE CATEGORY DETAIL API RESPONSE
// // ========================================================= */

// // const normalizeCategoryDetails = (
// //     response
// // ) => {
// //     if (Array.isArray(response)) {
// //         return response;
// //     }

// //     if (Array.isArray(response?.data)) {
// //         return response.data;
// //     }

// //     if (Array.isArray(response?.details)) {
// //         return response.details;
// //     }

// //     if (
// //         Array.isArray(
// //             response?.categoryDetails
// //         )
// //     ) {
// //         return response.categoryDetails;
// //     }

// //     if (
// //         Array.isArray(
// //             response?.naturalAccounts
// //         )
// //     ) {
// //         return response.naturalAccounts;
// //     }

// //     return [];
// // };

// // /* =========================================================
// //    GET ACCOUNT NAME
// // ========================================================= */

// // const getAccountName = (account) => {
// //     return (
// //         account?.account_name ??
// //         account?.accountName ??
// //         account?.natural_account_name ??
// //         account?.naturalAccountName ??
// //         account?.account ??
// //         account?.name ??
// //         "—"
// //     );
// // };

// // /* =========================================================
// //    GET ACCOUNT CODE
// // ========================================================= */

// // const getAccountCode = (account) => {
// //     return (
// //         account?.account_code ??
// //         account?.accountCode ??
// //         account?.natural_account_code ??
// //         account?.naturalAccountCode ??
// //         account?.natural_account_id ??
// //         null
// //     );
// // };

// // /* =========================================================
// //    GET ACTUAL PTD
// // ========================================================= */

// // const getActualPTD = (item) => {
// //     return (
// //         item?.actualPTD ??
// //         item?.actual_ptd ??
// //         item?.actual_ptd_aed ??
// //         null
// //     );
// // };

// // /* =========================================================
// //    GET ACTUAL YTD
// // ========================================================= */

// // const getActualYTD = (item) => {
// //     return (
// //         item?.actualYTD ??
// //         item?.actual_ytd ??
// //         item?.actual_ytd_aed ??
// //         null
// //     );
// // };

// // /* =========================================================
// //    CALCULATE TOTAL ACTUAL
// // ========================================================= */

// // const getTotalActual = (
// //     data,
// //     getter
// // ) => {
// //     if (
// //         !Array.isArray(data) ||
// //         !data.length
// //     ) {
// //         return null;
// //     }

// //     let total = 0;
// //     let hasValue = false;

// //     data.forEach((item) => {
// //         const value = getter(item);

// //         if (
// //             value !== null &&
// //             value !== undefined &&
// //             value !== "" &&
// //             value !== "-" &&
// //             value !== "—"
// //         ) {
// //             const number = Number(value);

// //             if (Number.isFinite(number)) {
// //                 total += number;
// //                 hasValue = true;
// //             }
// //         }
// //     });

// //     return hasValue ? total : null;
// // };


// // /* =========================================================
// //    FILTER HELPERS
// //    - Multi-select values are kept as arrays.
// //    - Legal Group → Legal Entity → Parent Division →
// //      Sub-Division cascade is applied locally.
// //    - Optional onFilterApply lets the parent/backend refresh
// //      data without changing existing behaviour when omitted.
// // ========================================================= */

// // const asArray = (value) => {
// //     if (Array.isArray(value)) return value;
// //     if (value === null || value === undefined || value === "") {
// //         return [];
// //     }
// //     return [value];
// // };

// // const optionValue = (option) => {
// //     if (option === null || option === undefined) return "";
// //     if (typeof option !== "object") return String(option);

// //     return String(
// //         option.value ??
// //         option.id ??
// //         option.code ??
// //         option.key ??
// //         option.legal_group_id ??
// //         option.legal_entity_id ??
// //         option.parent_division_id ??
// //         option.subdivision_id ??
// //         option.year ??
// //         option.period_name ??
// //         option.currency ??
// //         ""
// //     );
// // };

// // const optionLabel = (option) => {
// //     if (option === null || option === undefined) return "";
// //     if (typeof option !== "object") return String(option);

// //     return String(
// //         option.label ??
// //         option.name ??
// //         option.title ??
// //         option.display_name ??
// //         option.legal_group_name ??
// //         option.legal_entity_name ??
// //         option.parent_division_name ??
// //         option.subdivision_name ??
// //         option.year ??
// //         option.period_name ??
// //         option.currency ??
// //         option.value ??
// //         option.id ??
// //         ""
// //     );
// // };

// // const getRelationValues = (option, keys) => {
// //     for (const key of keys) {
// //         const value = option?.[key];
// //         if (value !== undefined && value !== null && value !== "") {
// //             return asArray(value).map((item) => String(optionValue(item)));
// //         }
// //     }
// //     return [];
// // };

// // const matchesSelected = (option, selected, relationKeys) => {
// //     const values = asArray(selected)
// //         .filter((value) => String(value) !== "All")
// //         .map((value) => String(value));

// //     if (!values.length) return true;

// //     const relationValues = getRelationValues(option, relationKeys);

// //     // If the option does not expose a relation, do not hide it.
// //     // This keeps the filter backward-compatible with older option payloads.
// //     if (!relationValues.length) return true;

// //     return values.some((value) =>
// //         relationValues.includes(value)
// //     );
// // };

// // const cascadeOptions = (
// //     options,
// //     relations = []
// // ) => {
// //     const list = Array.isArray(options) ? options : [];

// //     return list.filter((option) =>
// //         relations.every(({ selected, keys }) =>
// //             matchesSelected(option, selected, keys)
// //         )
// //     );
// // };

// // const uniqueOptionsFromRows = (rows, keys) => {
// //     const map = new Map();

// //     (Array.isArray(rows) ? rows : []).forEach((row) => {
// //         let raw = null;
// //         for (const key of keys) {
// //             if (
// //                 row?.[key] !== undefined &&
// //                 row?.[key] !== null &&
// //                 row?.[key] !== ""
// //             ) {
// //                 raw = row[key];
// //                 break;
// //             }
// //         }

// //         asArray(raw).forEach((item) => {
// //             const value = optionValue(item);
// //             const label = optionLabel(item);
// //             if (value && !map.has(value)) {
// //                 map.set(value, {
// //                     value,
// //                     label: label || value,
// //                 });
// //             }
// //         });
// //     });

// //     return Array.from(map.values());
// // };

// // const getRowFilterValue = (row, keys) => {
// //     for (const key of keys) {
// //         const value = row?.[key];
// //         if (value !== undefined && value !== null && value !== "") {
// //             return asArray(value).map((item) =>
// //                 String(optionValue(item))
// //             );
// //         }
// //     }
// //     return [];
// // };

// // const rowMatchesFilter = (row, selected, keys) => {
// //     const values = asArray(selected)
// //         .filter((value) => String(value) !== "All")
// //         .map((value) => String(value));

// //     if (!values.length) return true;

// //     const rowValues = getRowFilterValue(row, keys);
// //     if (!rowValues.length) return true;

// //     return values.some((value) => rowValues.includes(value));
// // };

// // function CompactMultiSelect({
// //     options = [],
// //     value = ["All"],
// //     onChange,
// //     disabled = false,
// // }) {
// //     const [open, setOpen] = useState(false);
// //     const selected = asArray(value).length
// //         ? asArray(value)
// //         : ["All"];

// //     const displayValue =
// //         selected.includes("All")
// //             ? "All"
// //             : selected.length === 1
// //                 ? (() => {
// //                     const match = options.find(
// //                         (option) =>
// //                             String(optionValue(option)) ===
// //                             String(selected[0])
// //                     );
// //                     return optionLabel(match) || selected[0];
// //                 })()
// //                 : `${selected.length} Selected`;

// //     const toggleValue = (nextValue) => {
// //         const valueString = String(nextValue);

// //         if (valueString === "All") {
// //             onChange?.(["All"]);
// //             return;
// //         }

// //         const current = selected.filter(
// //             (item) => String(item) !== "All"
// //         );

// //         const exists = current.some(
// //             (item) => String(item) === valueString
// //         );

// //         const next = exists
// //             ? current.filter(
// //                 (item) => String(item) !== valueString
// //             )
// //             : [...current, nextValue];

// //         onChange?.(next.length ? next : ["All"]);
// //     };

// //     return (
// //         <div
// //             style={{
// //                 position: "relative",
// //                 width: "100%",
// //             }}
// //         >
// //             <button
// //                 type="button"
// //                 disabled={disabled}
// //                 onClick={() => setOpen((prev) => !prev)}
// //                 style={{
// //                     width: "100%",
// //                     height: 34,
// //                     padding: "0 10px",
// //                     border: "1px solid #E2E8F0",
// //                     borderRadius: 9,
// //                     background: disabled ? "#F1F5F9" : "#F8FAFC",
// //                     color: "#334155",
// //                     display: "flex",
// //                     alignItems: "center",
// //                     justifyContent: "space-between",
// //                     gap: 8,
// //                     cursor: disabled ? "not-allowed" : "pointer",
// //                     fontSize: 12,
// //                     fontWeight: 600,
// //                     textAlign: "left",
// //                     boxSizing: "border-box",
// //                 }}
// //             >
// //                 <span
// //                     style={{
// //                         overflow: "hidden",
// //                         textOverflow: "ellipsis",
// //                         whiteSpace: "nowrap",
// //                     }}
// //                 >
// //                     {displayValue}
// //                 </span>
// //                 <span
// //                     style={{
// //                         fontSize: 12,
// //                         color: "#334155",
// //                         transform: open ? "rotate(180deg)" : "none",
// //                         transition: "transform 140ms ease",
// //                     }}
// //                 >
// //                     ⌄
// //                 </span>
// //             </button>

// //             {open && !disabled && (
// //                 <>
// //                     <div
// //                         onClick={() => setOpen(false)}
// //                         style={{
// //                             position: "fixed",
// //                             inset: 0,
// //                             zIndex: 999,
// //                         }}
// //                     />
// //                     <div
// //                         style={{
// //                             position: "absolute",
// //                             top: "calc(100% + 5px)",
// //                             left: 0,
// //                             right: 0,
// //                             minWidth: 160,
// //                             maxHeight: 230,
// //                             overflowY: "auto",
// //                             padding: 5,
// //                             background: "#FFFFFF",
// //                             border: "1px solid #E2E8F0",
// //                             borderRadius: 9,
// //                             boxShadow: "0 12px 28px rgba(15,23,42,.14)",
// //                             zIndex: 1000,
// //                         }}
// //                     >
// //                         <label
// //                             style={{
// //                                 display: "flex",
// //                                 alignItems: "center",
// //                                 gap: 8,
// //                                 padding: "7px 8px",
// //                                 borderRadius: 7,
// //                                 cursor: "pointer",
// //                                 fontSize: 12,
// //                                 fontWeight: 600,
// //                                 color: "#334155",
// //                             }}
// //                         >
// //                             <input
// //                                 type="checkbox"
// //                                 checked={selected.includes("All")}
// //                                 onChange={() => toggleValue("All")}
// //                             />
// //                             All
// //                         </label>

// //                         {options
// //                             .filter(
// //                                 (option) =>
// //                                     String(optionValue(option)) !== "All"
// //                             )
// //                             .map((option) => {
// //                                 const itemValue = optionValue(option);
// //                                 const checked = selected.some(
// //                                     (item) =>
// //                                         String(item) === String(itemValue)
// //                                 );

// //                                 return (
// //                                     <label
// //                                         key={itemValue}
// //                                         style={{
// //                                             display: "flex",
// //                                             alignItems: "center",
// //                                             gap: 8,
// //                                             padding: "7px 8px",
// //                                             borderRadius: 7,
// //                                             cursor: "pointer",
// //                                             fontSize: 12,
// //                                             color: "#334155",
// //                                             background: checked
// //                                                 ? "#EEF2FF"
// //                                                 : "transparent",
// //                                         }}
// //                                     >
// //                                         <input
// //                                             type="checkbox"
// //                                             checked={checked}
// //                                             onChange={() =>
// //                                                 toggleValue(itemValue)
// //                                             }
// //                                         />
// //                                         <span
// //                                             style={{
// //                                                 overflow: "hidden",
// //                                                 textOverflow: "ellipsis",
// //                                                 whiteSpace: "nowrap",
// //                                             }}
// //                                         >
// //                                             {optionLabel(option)}
// //                                         </span>
// //                                     </label>
// //                                 );
// //                             })}
// //                     </div>
// //                 </>
// //             )}
// //         </div>
// //     );
// // }

// // function FilterField({ label, children }) {
// //     return (
// //         <div
// //             style={{
// //                 minWidth: 0,
// //                 display: "flex",
// //                 flexDirection: "column",
// //                 gap: 4,
// //             }}
// //         >
// //             <span
// //                 style={{
// //                     fontSize: 11,
// //                     color: "#1E3A8A",
// //                     fontWeight: 700,
// //                     lineHeight: 1.2,
// //                 }}
// //             >
// //                 {label}
// //             </span>
// //             {children}
// //         </div>
// //     );
// // }

// // /* =========================================================
// //    NORMALIZE OPEX FILTER OPTIONS
// //    Uses the live getOpexFilterOptions API response.
// // ========================================================= */

// // const normalizeOpexFilterOptions = (response) => {
// //     const source = response?.data ?? response ?? {};

// //     return {
// //         legalGroups: source.legal_groups ?? source.legalGroups ?? [],
// //         legalEntities: source.legal_entities ?? source.legalEntities ?? [],
// //         parentDivisions: source.parent_divisions ?? source.parentDivisions ?? [],
// //         subdivisions: source.subdivisions ?? [],
// //         years: source.years ?? source.fiscal_years ?? source.fiscalYears ?? [],
// //         periods: source.periods ?? [],
// //         currencies: source.currencies ?? source.reporting_currencies ?? source.reportingCurrencies ?? [],
// //     };
// // };

// // /* =========================================================
// //    MAIN COMPONENT
// // ========================================================= */

// // export default function ExpenseCategoryDrillDown({
// //     data = [],
// //     totalData = null,
// //     dataAsOf = null,
// //     currentMonthPartial = false,
// //     onExpandCategory,
// //     detailLoading = {},
// //     periodName = "Sep-26",
// //     reportingCurrency = "AED",

// //     onViewAll,
// //     onExportExcel,
// //     onExportPdf,
// //     filterOptions = {},
// //     onFilterApply,
// // }) {
// //     const [expandedRows, setExpandedRows] =
// //         useState({});

// //     /* =======================================================
// //        CATEGORY DETAIL STATE
// //     ======================================================= */

// //     const [categoryDetails, setCategoryDetails] =
// //         useState({});

// //     const [
// //         categoryDetailLoading,
// //         setCategoryDetailLoading,
// //     ] = useState({});

// //     const [
// //         categoryDetailError,
// //         setCategoryDetailError,
// //     ] = useState({});

// //     /* =======================================================
// //        MENU STATE
// //     ======================================================= */

// //     const [menuOpen, setMenuOpen] =
// //         useState(false);

// //     /* =======================================================
// //        TABLE FILTER STATE
// //     ======================================================= */

// //     const yearMatch = String(periodName || "").match(/(\d{4}|\d{2})$/);
// //     const defaultYear =
// //         filterOptions?.years?.length
// //             ? optionValue(filterOptions.years[0])
// //             : yearMatch?.[1]
// //                 ? (yearMatch[1].length === 2
// //                     ? `20${yearMatch[1]}`
// //                     : yearMatch[1])
// //                 : "2026";

// //     const [tableFilters, setTableFilters] = useState(() => ({
// //         legalGroupId: ["All"],
// //         legalEntityId: ["All"],
// //         parentDivisionId: ["All"],
// //         subdivisionId: ["All"],
// //         year: defaultYear,
// //         periodName: periodName || "Sep-26",
// //         currency: reportingCurrency || "AED",
// //     }));

// //     const [appliedTableFilters, setAppliedTableFilters] =
// //         useState(() => ({
// //             legalGroupId: ["All"],
// //             legalEntityId: ["All"],
// //             parentDivisionId: ["All"],
// //             subdivisionId: ["All"],
// //             year: defaultYear,
// //             periodName: periodName || "Sep-26",
// //             currency: reportingCurrency || "AED",
// //         }));

// //     /* =======================================================
// //        FILTERED TABLE DATA

// //        The category-breakdown endpoint is the source of truth
// //        for the applied hierarchy/year/period/currency filters.
// //        This local state prevents Apply from only changing the
// //        dropdown state while the table continues showing the
// //        previously loaded parent data.
// //     ======================================================= */

// //     const [filteredTableData, setFilteredTableData] =
// //         useState(null);

// //     const [tableFilterLoading, setTableFilterLoading] =
// //         useState(false);

// //     const [tableFilterError, setTableFilterError] =
// //         useState("");

// //     /* =======================================================
// //        LIVE OPEX FILTER OPTIONS
// //     ======================================================= */

// //     const [opexFilterOptions, setOpexFilterOptions] =
// //         useState({});

// //     useEffect(() => {
// //         let cancelled = false;

// //         const loadOpexFilterOptions = async () => {
// //             try {
// //                 const response = await getOpexFilterOptions();
// //                 const normalized = normalizeOpexFilterOptions(response);

// //                 if (!cancelled) {
// //                     setOpexFilterOptions(normalized);
// //                 }
// //             } catch (error) {
// //                 console.error(
// //                     "Failed to load OPEX filter options:",
// //                     error
// //                 );
// //             }
// //         };

// //         loadOpexFilterOptions();

// //         return () => {
// //             cancelled = true;
// //         };
// //     }, []);

// //     const fallbackOptions = useMemo(() => ({
// //         legalGroups: uniqueOptionsFromRows(data, [
// //             "legal_group_id",
// //             "legalGroupId",
// //             "legal_group",
// //             "legalGroup",
// //         ]),
// //         legalEntities: uniqueOptionsFromRows(data, [
// //             "legal_entity_id",
// //             "legalEntityId",
// //             "legal_entity",
// //             "legalEntity",
// //         ]),
// //         parentDivisions: uniqueOptionsFromRows(data, [
// //             "parent_division_id",
// //             "parentDivisionId",
// //             "parent_division",
// //             "parentDivision",
// //         ]),
// //         subdivisions: uniqueOptionsFromRows(data, [
// //             "subdivision_id",
// //             "subdivisionId",
// //             "subdivision",
// //             "subDivision",
// //         ]),
// //         years: uniqueOptionsFromRows(data, [
// //             "year",
// //             "fiscal_year",
// //             "fiscalYear",
// //         ]),
// //         periods: uniqueOptionsFromRows(data, [
// //             "period_name",
// //             "periodName",
// //             "period",
// //         ]),
// //         currencies: uniqueOptionsFromRows(data, [
// //             "currency",
// //             "reporting_currency",
// //             "reportingCurrency",
// //         ]),
// //     }), [data]);

// //     const filterOptionsResolved = useMemo(() => ({
// //         legalGroups: opexFilterOptions.legalGroups?.length
// //             ? opexFilterOptions.legalGroups
// //             : filterOptions?.legalGroups?.length
// //                 ? filterOptions.legalGroups
// //                 : fallbackOptions.legalGroups,
// //         legalEntities: opexFilterOptions.legalEntities?.length
// //             ? opexFilterOptions.legalEntities
// //             : filterOptions?.legalEntities?.length
// //                 ? filterOptions.legalEntities
// //                 : fallbackOptions.legalEntities,
// //         parentDivisions: opexFilterOptions.parentDivisions?.length
// //             ? opexFilterOptions.parentDivisions
// //             : filterOptions?.parentDivisions?.length
// //                 ? filterOptions.parentDivisions
// //                 : fallbackOptions.parentDivisions,
// //         subdivisions: opexFilterOptions.subdivisions?.length
// //             ? opexFilterOptions.subdivisions
// //             : filterOptions?.subdivisions?.length
// //                 ? filterOptions.subdivisions
// //                 : fallbackOptions.subdivisions,
// //         years: opexFilterOptions.years?.length
// //             ? opexFilterOptions.years
// //             : filterOptions?.years?.length
// //                 ? filterOptions.years
// //                 : fallbackOptions.years,
// //         periods: opexFilterOptions.periods?.length
// //             ? opexFilterOptions.periods
// //             : filterOptions?.periods?.length
// //                 ? filterOptions.periods
// //                 : fallbackOptions.periods,
// //         currencies: opexFilterOptions.currencies?.length
// //             ? opexFilterOptions.currencies
// //             : filterOptions?.currencies?.length
// //                 ? filterOptions.currencies
// //                 : fallbackOptions.currencies,
// //     }), [
// //         opexFilterOptions,
// //         filterOptions,
// //         fallbackOptions,
// //     ]);

// //     const cascadingOptions = useMemo(() => ({
// //         legalGroups: filterOptionsResolved.legalGroups || [],
// //         legalEntities: cascadeOptions(
// //             filterOptionsResolved.legalEntities,
// //             [{
// //                 selected: tableFilters.legalGroupId,
// //                 keys: [
// //                     "legal_group_id",
// //                     "legalGroupId",
// //                     "legal_group_ids",
// //                     "legalGroupIds",
// //                     "group_id",
// //                     "groupId",
// //                 ],
// //             }]
// //         ),
// //         parentDivisions: cascadeOptions(
// //             filterOptionsResolved.parentDivisions,
// //             [
// //                 {
// //                     selected: tableFilters.legalGroupId,
// //                     keys: [
// //                         "legal_group_id",
// //                         "legalGroupId",
// //                         "legal_group_ids",
// //                         "legalGroupIds",
// //                         "group_id",
// //                         "groupId",
// //                     ],
// //                 },
// //                 {
// //                     selected: tableFilters.legalEntityId,
// //                     keys: [
// //                         "legal_entity_id",
// //                         "legalEntityId",
// //                         "legal_entity_ids",
// //                         "legalEntityIds",
// //                         "entity_id",
// //                         "entityId",
// //                     ],
// //                 },
// //             ]
// //         ),
// //         subdivisions: cascadeOptions(
// //             filterOptionsResolved.subdivisions,
// //             [
// //                 {
// //                     selected: tableFilters.legalGroupId,
// //                     keys: [
// //                         "legal_group_id",
// //                         "legalGroupId",
// //                         "legal_group_ids",
// //                         "legalGroupIds",
// //                         "group_id",
// //                         "groupId",
// //                     ],
// //                 },
// //                 {
// //                     selected: tableFilters.legalEntityId,
// //                     keys: [
// //                         "legal_entity_id",
// //                         "legalEntityId",
// //                         "legal_entity_ids",
// //                         "legalEntityIds",
// //                         "entity_id",
// //                         "entityId",
// //                     ],
// //                 },
// //                 {
// //                     selected: tableFilters.parentDivisionId,
// //                     keys: [
// //                         "parent_division_id",
// //                         "parentDivisionId",
// //                         "parent_division_ids",
// //                         "parentDivisionIds",
// //                         "division_id",
// //                         "divisionId",
// //                     ],
// //                 },
// //             ]
// //         ),
// //     }), [
// //         filterOptionsResolved,
// //         tableFilters.legalGroupId,
// //         tableFilters.legalEntityId,
// //         tableFilters.parentDivisionId,
// //     ]);

// //     const updateTableMulti = (key, value) => {
// //         setTableFilters((prev) => {
// //             const next = { ...prev, [key]: value };

// //             if (key === "legalGroupId") {
// //                 next.legalEntityId = ["All"];
// //                 next.parentDivisionId = ["All"];
// //                 next.subdivisionId = ["All"];
// //             } else if (key === "legalEntityId") {
// //                 next.parentDivisionId = ["All"];
// //                 next.subdivisionId = ["All"];
// //             } else if (key === "parentDivisionId") {
// //                 next.subdivisionId = ["All"];
// //             }

// //             return next;
// //         });
// //     };

// //     const buildTableApiFilters = (filters) => {
// //         const cleanMulti = (value) => {
// //             const values = asArray(value)
// //                 .filter((item) => String(item) !== "All")
// //                 .map((item) => String(item))
// //                 .filter(Boolean);

// //             return values;
// //         };

// //         const legalGroups = cleanMulti(filters?.legalGroupId);
// //         const legalEntities = cleanMulti(filters?.legalEntityId);
// //         const parentDivisions = cleanMulti(filters?.parentDivisionId);
// //         const subdivisions = cleanMulti(filters?.subdivisionId);

// //         return {
// //             year: filters?.year || undefined,
// //             legal_group_id: legalGroups.length ? legalGroups : undefined,
// //             legal_entity_id: legalEntities.length ? legalEntities : undefined,
// //             parent_division_id: parentDivisions.length ? parentDivisions : undefined,
// //             subdivision_id: subdivisions.length ? subdivisions : undefined,
// //             period_name: filters?.periodName
// //                 ? [String(filters.periodName)]
// //                 : undefined,
// //             reporting_currency: filters?.currency || undefined,
// //         };
// //     };

// //     const normalizeBreakdownResponse = (response) => {
// //         if (Array.isArray(response)) return response;
// //         if (Array.isArray(response?.data)) return response.data;
// //         if (Array.isArray(response?.items)) return response.items;
// //         if (Array.isArray(response?.categories)) return response.categories;
// //         if (Array.isArray(response?.results)) return response.results;
// //         return [];
// //     };

// //     const resetTableFilters = () => {
// //         const reset = {
// //             legalGroupId: ["All"],
// //             legalEntityId: ["All"],
// //             parentDivisionId: ["All"],
// //             subdivisionId: ["All"],
// //             year: defaultYear,
// //             periodName: periodName || "Sep-26",
// //             currency: reportingCurrency || "AED",
// //         };

// //         setTableFilters(reset);
// //         setAppliedTableFilters(reset);
// //         setFilteredTableData(null);
// //         setTableFilterError("");
// //         onFilterApply?.(reset);
// //     };

// //     const applyTableFilters = async () => {
// //         const applied = {
// //             ...tableFilters,
// //             legalGroupId: asArray(tableFilters.legalGroupId),
// //             legalEntityId: asArray(tableFilters.legalEntityId),
// //             parentDivisionId: asArray(tableFilters.parentDivisionId),
// //             subdivisionId: asArray(tableFilters.subdivisionId),
// //         };

// //         setAppliedTableFilters(applied);
// //         setTableFilterLoading(true);
// //         setTableFilterError("");

// //         try {
// //             const apiFilters = buildTableApiFilters(applied);
// //             const response = await getOpexCategoryBreakdown(apiFilters);
// //             const rows = normalizeBreakdownResponse(response);

// //             // Always replace the rows rendered by this table with the
// //             // response for the newly applied filters.
// //             setFilteredTableData(rows);

// //             // Keep the existing parent callback contract intact.
// //             onFilterApply?.(applied);
// //         } catch (error) {
// //             console.error(
// //                 "Failed to apply Expense Category Drill-Down filters:",
// //                 error
// //             );
// //             setFilteredTableData([]);
// //             setTableFilterError(
// //                 error?.response?.data?.detail ||
// //                 error?.message ||
// //                 "Unable to load Expense Category Drill-Down for the selected filters."
// //             );
// //         } finally {
// //             setTableFilterLoading(false);
// //         }
// //     };

// //     const filteredData = useMemo(() => {
// //         const sourceData =
// //             filteredTableData !== null
// //                 ? filteredTableData
// //                 : (Array.isArray(data) ? data : []);

// //         return sourceData.filter((row) => {
// //             const yearMatch = rowMatchesFilter(
// //                 row,
// //                 appliedTableFilters.year,
// //                 ["year", "fiscal_year", "fiscalYear"]
// //             );
// //             const periodMatch = rowMatchesFilter(
// //                 row,
// //                 appliedTableFilters.periodName,
// //                 ["period_name", "periodName", "period"]
// //             );
// //             const currencyMatch = rowMatchesFilter(
// //                 row,
// //                 appliedTableFilters.currency,
// //                 ["currency", "reporting_currency", "reportingCurrency"]
// //             );

// //             return (
// //                 rowMatchesFilter(row, appliedTableFilters.legalGroupId, [
// //                     "legal_group_id",
// //                     "legalGroupId",
// //                     "legal_group",
// //                     "legalGroup",
// //                 ]) &&
// //                 rowMatchesFilter(row, appliedTableFilters.legalEntityId, [
// //                     "legal_entity_id",
// //                     "legalEntityId",
// //                     "legal_entity",
// //                     "legalEntity",
// //                 ]) &&
// //                 rowMatchesFilter(row, appliedTableFilters.parentDivisionId, [
// //                     "parent_division_id",
// //                     "parentDivisionId",
// //                     "parent_division",
// //                     "parentDivision",
// //                 ]) &&
// //                 rowMatchesFilter(row, appliedTableFilters.subdivisionId, [
// //                     "subdivision_id",
// //                     "subdivisionId",
// //                     "subdivision",
// //                     "subDivision",
// //                 ]) &&
// //                 yearMatch &&
// //                 periodMatch &&
// //                 currencyMatch
// //             );
// //         });
// //     }, [data, filteredTableData, appliedTableFilters]);

// //     /* =======================================================
// //        TOTAL ACTUALS
// //     ======================================================= */

// //     const totalActualPTD =
// //         getTotalActual(
// //             filteredData,
// //             getActualPTD
// //         );

// //     const totalActualYTD =
// //         getTotalActual(
// //             filteredData,
// //             getActualYTD
// //         );

// //     /* =======================================================
// //        LOAD CATEGORY DETAIL
// //     ======================================================= */

// //     const loadCategoryDetails = async (
// //         item
// //     ) => {
// //         const category =
// //             item?.category ||
// //             (typeof item === "string"
// //                 ? item
// //                 : "");

// //         if (!category) {
// //             return;
// //         }

// //         if (
// //             categoryDetails[category] &&
// //             Array.isArray(
// //                 categoryDetails[category]
// //             ) &&
// //             categoryDetails[category].length > 0
// //         ) {
// //             return;
// //         }

// //         try {
// //             setCategoryDetailLoading(
// //                 (prev) => ({
// //                     ...prev,
// //                     [category]: true,
// //                 })
// //             );

// //             setCategoryDetailError(
// //                 (prev) => ({
// //                     ...prev,
// //                     [category]: null,
// //                 })
// //             );

// //             /* ===================================================
// //                BACKEND API
// //             =================================================== */

// //             const configuredBaseUrl =
// //                 import.meta.env
// //                     .VITE_API_BASE_URL || "";

// //             let baseUrl =
// //                 configuredBaseUrl.replace(
// //                     /\/+$/,
// //                     ""
// //                 );

// //             const apiUrl =
// //                 baseUrl.endsWith("/api")
// //                     ? `${baseUrl}/opex/category-detail`
// //                     : `${baseUrl}/api/opex/category-detail`;

// //             const params =
// //                 new URLSearchParams({
// //                     category,
// //                     period_name: periodName,
// //                     reporting_currency:
// //                         reportingCurrency,
// //                 });

// //             const token =
// //                 localStorage.getItem("token") ||
// //                 localStorage.getItem(
// //                     "finsight_token"
// //                 );

// //             const response =
// //                 await fetch(
// //                     `${apiUrl}?${params.toString()}`,
// //                     {
// //                         method: "GET",
// //                         headers: {
// //                             Accept:
// //                                 "application/json",

// //                             ...(token
// //                                 ? {
// //                                     Authorization: `Bearer ${token}`,
// //                                 }
// //                                 : {}),
// //                         },
// //                     }
// //                 );

// //             if (response.ok) {
// //                 const responseData =
// //                     await response.json();

// //                 const details =
// //                     normalizeCategoryDetails(
// //                         responseData
// //                     );

// //                 /* =================================================
// //                    USE BACKEND DETAILS DIRECTLY
// //                 ================================================= */

// //                 if (
// //                     Array.isArray(details) &&
// //                     details.length > 0
// //                 ) {
// //                     setCategoryDetails(
// //                         (prev) => ({
// //                             ...prev,
// //                             [category]:
// //                                 details,
// //                         })
// //                     );

// //                     return;
// //                 }
// //             }

// //             /* ===================================================
// //                EXISTING PRELOADED DATA FALLBACK
// //             =================================================== */

// //             const preloadedDetails =
// //                 item?.categoryDetails ||
// //                 item?.naturalAccounts ||
// //                 item?.details;

// //             if (
// //                 Array.isArray(preloadedDetails) &&
// //                 preloadedDetails.length > 0
// //             ) {
// //                 setCategoryDetails(
// //                     (prev) => ({
// //                         ...prev,
// //                         [category]:
// //                             preloadedDetails,
// //                     })
// //                 );

// //                 return;
// //             }

// //             /* ===================================================
// //                EXISTING DERIVED DATA FALLBACK
// //             =================================================== */

// //             const fallbackDetails =
// //                 deriveCategoryNaturalAccounts(
// //                     item,
// //                     category
// //                 );

// //             setCategoryDetails(
// //                 (prev) => ({
// //                     ...prev,
// //                     [category]:
// //                         fallbackDetails,
// //                 })
// //             );
// //         } catch (error) {
// //             /* ===================================================
// //                EXISTING FALLBACK ON API ERROR
// //             =================================================== */

// //             const preloadedDetails =
// //                 item?.categoryDetails ||
// //                 item?.naturalAccounts ||
// //                 item?.details;

// //             if (
// //                 Array.isArray(preloadedDetails) &&
// //                 preloadedDetails.length > 0
// //             ) {
// //                 setCategoryDetails(
// //                     (prev) => ({
// //                         ...prev,
// //                         [category]:
// //                             preloadedDetails,
// //                     })
// //                 );

// //                 return;
// //             }

// //             const fallbackDetails =
// //                 deriveCategoryNaturalAccounts(
// //                     item,
// //                     category
// //                 );

// //             if (
// //                 Array.isArray(fallbackDetails) &&
// //                 fallbackDetails.length > 0
// //             ) {
// //                 setCategoryDetails(
// //                     (prev) => ({
// //                         ...prev,
// //                         [category]:
// //                             fallbackDetails,
// //                     })
// //                 );
// //             } else {
// //                 setCategoryDetailError(
// //                     (prev) => ({
// //                         ...prev,
// //                         [category]:
// //                             error?.message ||
// //                             "Unable to load natural-account details.",
// //                     })
// //                 );

// //                 setCategoryDetails(
// //                     (prev) => ({
// //                         ...prev,
// //                         [category]: [],
// //                     })
// //                 );
// //             }
// //         } finally {
// //             setCategoryDetailLoading(
// //                 (prev) => ({
// //                     ...prev,
// //                     [category]: false,
// //                 })
// //             );
// //         }
// //     };

// //     /* =======================================================
// //        TOGGLE
// //     ======================================================= */

// //     const toggleRow = async (
// //         item,
// //         index
// //     ) => {
// //         const rowKey =
// //             item?.category || index;

// //         const willExpand =
// //             !expandedRows[rowKey];

// //         setExpandedRows((prev) => ({
// //             ...prev,
// //             [rowKey]: willExpand,
// //         }));

// //         if (!willExpand) {
// //             return;
// //         }

// //         if (
// //             typeof onExpandCategory ===
// //             "function"
// //         ) {
// //             try {
// //                 await onExpandCategory(item);
// //             } catch (error) {
// //                 /* Keep local loading independent */
// //             }
// //         }

// //         await loadCategoryDetails(item);
// //     };

// //     /* =======================================================
// //        MENU HANDLERS
// //     ======================================================= */

// //     const handleViewAllClick = () => {
// //         setMenuOpen(false);

// //         if (
// //             typeof onViewAll ===
// //             "function"
// //         ) {
// //             onViewAll();
// //         }
// //     };

// //     const handleExportExcelClick = () => {
// //         setMenuOpen(false);

// //         if (
// //             typeof onExportExcel ===
// //             "function"
// //         ) {
// //             onExportExcel();
// //         }
// //     };

// //     const handleExportPdfClick = () => {
// //         setMenuOpen(false);

// //         if (
// //             typeof onExportPdf ===
// //             "function"
// //         ) {
// //             onExportPdf();
// //         }
// //     };

// //     /* =======================================================
// //        RENDER DETAILS
// //     ======================================================= */

// //     const renderNaturalAccountDetails = (
// //         category,
// //         parentItem
// //     ) => {
// //         let details =
// //             categoryDetails[category] ||
// //             parentItem?.categoryDetails ||
// //             parentItem?.naturalAccounts ||
// //             parentItem?.details ||
// //             [];

// //         if (
// //             (!details || !details.length) &&
// //             parentItem
// //         ) {
// //             details =
// //                 deriveCategoryNaturalAccounts(
// //                     parentItem,
// //                     category
// //                 );
// //         }

// //         if (
// //             categoryDetailLoading[category] &&
// //             (!details || !details.length)
// //         ) {
// //             return (
// //                 <div
// //                     style={{
// //                         padding:
// //                             "16px 20px",
// //                         fontSize: "0.74rem",
// //                         color: "#64748B",
// //                     }}
// //                 >
// //                     Loading natural-account details...
// //                 </div>
// //             );
// //         }

// //         if (
// //             categoryDetailError[category] &&
// //             (!details || !details.length)
// //         ) {
// //             return (
// //                 <div
// //                     style={{
// //                         padding:
// //                             "16px 20px",
// //                         fontSize: "0.74rem",
// //                         color: "#DC2626",
// //                     }}
// //                 >
// //                     {
// //                         categoryDetailError[
// //                         category
// //                         ]
// //                     }
// //                 </div>
// //             );
// //         }

// //         if (!details.length) {
// //             return (
// //                 <div
// //                     style={{
// //                         padding:
// //                             "16px 20px",
// //                         fontSize: "0.74rem",
// //                         color: "#64748B",
// //                     }}
// //                 >
// //                     No natural-account details
// //                     available.
// //                 </div>
// //             );
// //         }

// //         /* ===================================================
// //            GET DETAIL VALUE
// //         =================================================== */

// //         const getDetailValue = (
// //             account,
// //             camelCaseKey,
// //             snakeCaseKey,
// //             aedKey = null
// //         ) => {
// //             const camelValue =
// //                 account?.[camelCaseKey];

// //             if (
// //                 camelValue !== undefined &&
// //                 camelValue !== null &&
// //                 camelValue !== ""
// //             ) {
// //                 return camelValue;
// //             }

// //             const snakeValue =
// //                 account?.[snakeCaseKey];

// //             if (
// //                 snakeValue !== undefined &&
// //                 snakeValue !== null &&
// //                 snakeValue !== ""
// //             ) {
// //                 return snakeValue;
// //             }

// //             if (aedKey) {
// //                 const aedValue =
// //                     account?.[aedKey];

// //                 if (
// //                     aedValue !== undefined &&
// //                     aedValue !== null &&
// //                     aedValue !== ""
// //                 ) {
// //                     return aedValue;
// //                 }
// //             }

// //             return null;
// //         };

// //         /* ===================================================
// //            FORMAT PERCENT
// //         =================================================== */

// //         const formatPercent = (value) => {
// //             if (
// //                 value === null ||
// //                 value === undefined ||
// //                 value === "" ||
// //                 value === "-" ||
// //                 value === "—"
// //             ) {
// //                 return "—";
// //             }

// //             const number = Number(value);

// //             return Number.isFinite(number)
// //                 ? `${number.toFixed(1)}%`
// //                 : "—";
// //         };

// //         return (
// //             <div
// //                 style={{
// //                     width: "100%",
// //                     overflowX: "auto",
// //                 }}
// //             >
// //                 <table
// //                     style={{
// //                         width: "100%",
// //                         minWidth: 760,
// //                         borderCollapse: "collapse",
// //                         tableLayout: "fixed",
// //                         fontSize: "0.74rem",
// //                     }}
// //                 >
// //                     <colgroup>
// //                         <col style={{ width: "18%" }} />
// //                         <col style={{ width: "9%" }} />
// //                         <col style={{ width: "9%" }} />
// //                         <col style={{ width: "10%" }} />
// //                         <col style={{ width: "8%" }} />
// //                         <col style={{ width: "9%" }} />
// //                         <col style={{ width: "9%" }} />
// //                         <col style={{ width: "10%" }} />
// //                         <col style={{ width: "8%" }} />
// //                     </colgroup>

// //                     <thead>
// //                         <tr
// //                             style={{
// //                                 height: 38,
// //                                 borderBottom:
// //                                     "2px solid #E2E8F0",
// //                                 background:
// //                                     "#F8FAFC",
// //                             }}
// //                         >
// //                             {[
// //                                 "EXPENSE CATEGORY",
// //                                 "ACTUAL PTD",
// //                                 "TARGET PTD",
// //                                 "VARIANCE PTD",
// //                                 "VARIANCE PTD %",
// //                                 "ACTUAL YTD",
// //                                 "TARGET YTD",
// //                                 "VARIANCE YTD",
// //                                 "VARIANCE YTD %",
// //                             ].map((heading, index) => (
// //                                 <th
// //                                     key={`${heading}-${index}`}
// //                                     style={{
// //                                         padding:
// //                                             "5px 4px",
// //                                         textAlign:
// //                                             index === 0
// //                                                 ? "left"
// //                                                 : "right",
// //                                         color:
// //                                             "#1E3A8A",
// //                                         fontSize:
// //                                             "0.74rem",
// //                                         fontWeight: 700,
// //                                         whiteSpace:
// //                                             "normal",
// //                                         lineHeight:
// //                                             "16px",
// //                                         background:
// //                                             "#F8FAFC",
// //                                         borderBottom:
// //                                             "2px solid #E2E8F0",
// //                                     }}
// //                                 >
// //                                     {heading === "VARIANCE PTD %" ? (
// //                                         <>
// //                                             <span>VARIANCE PTD</span>
// //                                             <br />
// //                                             <span>%</span>
// //                                         </>
// //                                     ) : heading === "VARIANCE YTD %" ? (
// //                                         <>
// //                                             <span>VARIANCE YTD</span>
// //                                             <br />
// //                                             <span>%</span>
// //                                         </>
// //                                     ) : (
// //                                         heading
// //                                     )}
// //                                 </th>
// //                             ))}
// //                         </tr>
// //                     </thead>

// //                     <tbody>
// //                         {details.map(
// //                             (
// //                                 account,
// //                                 accountIndex
// //                             ) => {
// //                                 const accountCode =
// //                                     getAccountCode(
// //                                         account
// //                                     );

// //                                 const accountName =
// //                                     getAccountName(
// //                                         account
// //                                     );

// //                                 const actualPTD =
// //                                     getDetailValue(
// //                                         account,
// //                                         "actualPTD",
// //                                         "actual_ptd",
// //                                         "actual_ptd_aed"
// //                                     );

// //                                 const targetPTD =
// //                                     getDetailValue(
// //                                         account,
// //                                         "targetPTD",
// //                                         "target_ptd"
// //                                     );

// //                                 const variancePTD =
// //                                     getDetailValue(
// //                                         account,
// //                                         "variancePTD",
// //                                         "variance_ptd"
// //                                     );

// //                                 const variancePTDPercent =
// //                                     getDetailValue(
// //                                         account,
// //                                         "variancePTDPercent",
// //                                         "variance_ptd_pct"
// //                                     );

// //                                 const actualYTD =
// //                                     getDetailValue(
// //                                         account,
// //                                         "actualYTD",
// //                                         "actual_ytd",
// //                                         "actual_ytd_aed"
// //                                     );

// //                                 const targetYTD =
// //                                     getDetailValue(
// //                                         account,
// //                                         "targetYTD",
// //                                         "target_ytd"
// //                                     );

// //                                 const varianceYTD =
// //                                     getDetailValue(
// //                                         account,
// //                                         "varianceYTD",
// //                                         "variance_ytd"
// //                                     );

// //                                 const varianceYTDPercent =
// //                                     getDetailValue(
// //                                         account,
// //                                         "varianceYTDPercent",
// //                                         "variance_ytd_pct"
// //                                     );

// //                                 return (
// //                                     <tr
// //                                         key={
// //                                             accountCode ||
// //                                             accountIndex
// //                                         }
// //                                         style={{
// //                                             height: 39,
// //                                             borderBottom:
// //                                                 "1px solid #F1F5F9",
// //                                         }}
// //                                     >
// //                                         {/* NATURAL ACCOUNT */}

// //                                         <td
// //                                             style={{
// //                                                 padding:
// //                                                     "6px 6px",
// //                                                 textAlign:
// //                                                     "left",
// //                                                 fontSize:
// //                                                     "0.74rem",
// //                                                 color:
// //                                                     "#334155",
// //                                                 fontWeight: 500,
// //                                                 whiteSpace:
// //                                                     "normal",
// //                                                 wordBreak:
// //                                                     "break-word",
// //                                                 overflowWrap:
// //                                                     "anywhere",
// //                                                 lineHeight:
// //                                                     "17px",
// //                                                 borderBottom:
// //                                                     "1px solid #F1F5F9",
// //                                             }}
// //                                         >
// //                                             {accountCode
// //                                                 ? `${accountCode} - ${String(
// //                                                     accountName ||
// //                                                     ""
// //                                                 ).replace(
// //                                                     new RegExp(
// //                                                         `^${String(
// //                                                             accountCode
// //                                                         ).replace(
// //                                                             /[.*+?^${}()|[\]\\]/g,
// //                                                             "\\$&"
// //                                                         )}\\s*-\\s*`,
// //                                                         "i"
// //                                                     ),
// //                                                     ""
// //                                                 )}`
// //                                                 : accountName}
// //                                         </td>

// //                                         {/* PTD ACTUAL / TARGET / VARIANCE */}

// //                                         {[
// //                                             actualPTD,
// //                                             targetPTD,
// //                                             variancePTD,
// //                                         ].map(
// //                                             (
// //                                                 value,
// //                                                 valueIndex
// //                                             ) => (
// //                                                 <td
// //                                                     key={
// //                                                         valueIndex
// //                                                     }
// //                                                     style={{
// //                                                         padding:
// //                                                             "8px 10px",
// //                                                         textAlign:
// //                                                             "right",
// //                                                         fontSize:
// //                                                             "0.74rem",
// //                                                         color:
// //                                                             getNumberColor(
// //                                                                 value,
// //                                                                 valueIndex ===
// //                                                                     0
// //                                                                     ? "#334155"
// //                                                                     : "#64748B"
// //                                                             ),
// //                                                         fontWeight:
// //                                                             valueIndex ===
// //                                                                 2
// //                                                                 ? 600
// //                                                                 : 500,
// //                                                         fontVariantNumeric:
// //                                                             "tabular-nums",
// //                                                         whiteSpace:
// //                                                             "nowrap",
// //                                                         borderBottom:
// //                                                             "1px solid #F1F5F9",
// //                                                     }}
// //                                                 >
// //                                                     {formatNumber(
// //                                                         value
// //                                                     )}
// //                                                 </td>
// //                                             )
// //                                         )}

// //                                         {/* PTD VARIANCE % */}

// //                                         <td
// //                                             style={{
// //                                                 padding:
// //                                                     "6px 6px",
// //                                                 textAlign:
// //                                                     "right",
// //                                                 fontSize:
// //                                                     "0.74rem",
// //                                                 color:
// //                                                     getNumberColor(
// //                                                         variancePTDPercent,
// //                                                         "#64748B"
// //                                                     ),
// //                                                 fontWeight: 600,
// //                                                 fontVariantNumeric:
// //                                                     "tabular-nums",
// //                                                 whiteSpace:
// //                                                     "nowrap",
// //                                                 borderBottom:
// //                                                     "1px solid #F1F5F9",
// //                                             }}
// //                                         >
// //                                             {formatPercent(
// //                                                 variancePTDPercent
// //                                             )}
// //                                         </td>

// //                                         {/* YTD ACTUAL / TARGET / VARIANCE */}

// //                                         {[
// //                                             actualYTD,
// //                                             targetYTD,
// //                                             varianceYTD,
// //                                         ].map(
// //                                             (
// //                                                 value,
// //                                                 valueIndex
// //                                             ) => (
// //                                                 <td
// //                                                     key={`ytd-${valueIndex}`}
// //                                                     style={{
// //                                                         padding:
// //                                                             "8px 10px",
// //                                                         textAlign:
// //                                                             "right",
// //                                                         fontSize:
// //                                                             "0.74rem",
// //                                                         color:
// //                                                             getNumberColor(
// //                                                                 value,
// //                                                                 valueIndex ===
// //                                                                     0
// //                                                                     ? "#334155"
// //                                                                     : "#64748B"
// //                                                             ),
// //                                                         fontWeight:
// //                                                             valueIndex ===
// //                                                                 2
// //                                                                 ? 600
// //                                                                 : 500,
// //                                                         fontVariantNumeric:
// //                                                             "tabular-nums",
// //                                                         whiteSpace:
// //                                                             "nowrap",
// //                                                         borderBottom:
// //                                                             "1px solid #F1F5F9",
// //                                                     }}
// //                                                 >
// //                                                     {formatNumber(
// //                                                         value
// //                                                     )}
// //                                                 </td>
// //                                             )
// //                                         )}

// //                                         {/* YTD VARIANCE % */}

// //                                         <td
// //                                             style={{
// //                                                 padding:
// //                                                     "6px 6px",
// //                                                 textAlign:
// //                                                     "right",
// //                                                 fontSize:
// //                                                     "0.74rem",
// //                                                 color:
// //                                                     getNumberColor(
// //                                                         varianceYTDPercent,
// //                                                         "#64748B"
// //                                                     ),
// //                                                 fontWeight: 600,
// //                                                 fontVariantNumeric:
// //                                                     "tabular-nums",
// //                                                 whiteSpace:
// //                                                     "nowrap",
// //                                                 borderBottom:
// //                                                     "1px solid #F1F5F9",
// //                                             }}
// //                                         >
// //                                             {formatPercent(
// //                                                 varianceYTDPercent
// //                                             )}
// //                                         </td>
// //                                     </tr>
// //                                 );
// //                             }
// //                         )}
// //                     </tbody>
// //                 </table>
// //             </div>
// //         );
// //     };

// //     return (
// //         <div
// //             style={{
// //                 width: "100%",
// //                 background: "#FFFFFF",
// //                 border: "1px solid #E5E7EB",
// //                 borderRadius: 10,
// //                 boxSizing: "border-box",
// //                 overflow: "hidden",
// //             }}
// //         >
// //             {/* HEADER */}

// //             <div
// //                 style={{
// //                     minHeight: 58,
// //                     display: "flex",
// //                     alignItems: "flex-start",
// //                     justifyContent:
// //                         "space-between",
// //                     gap: 12,
// //                     padding: "8px 12px 7px",
// //                     boxSizing:
// //                         "border-box",
// //                 }}
// //             >
// //                 <div
// //                     style={{
// //                         minWidth: 0,
// //                         display: "flex",
// //                         flexDirection: "column",
// //                     }}
// //                 >
// //                     <h3
// //                         style={{
// //                             margin: 0,
// //                             fontSize: 14,
// //                             lineHeight: "17px",
// //                             fontWeight: 700,
// //                             color: "#0F172A",
// //                         }}
// //                     >
// //                         Expense Category Drill-Down{" "}
// //                         <span
// //                             style={{
// //                                 color: "#64748B",
// //                                 marginLeft: "5px",
// //                                 fontSize: 11,
// //                                 fontWeight: 600,
// //                             }}
// //                         >
// //                             (Amounts in {reportingCurrency || "AED"})
// //                         </span>
// //                     </h3>

// //                     <div
// //                         style={{
// //                             marginTop: 3,
// //                             fontSize: 10.5,
// //                             lineHeight: "14px",
// //                             fontWeight: 500,
// //                             color: "#64748B",
// //                         }}
// //                     >
// //                         Detailed PTD and YTD expense category variance analysis
// //                     </div>
// //                 </div>

// //                 <div
// //                     style={{
// //                         display: "flex",
// //                         alignItems: "center",
// //                         gap: 8,
// //                         position: "relative",
// //                         paddingTop: 2,
// //                     }}
// //                 >
// //                     {dataAsOf && (
// //                         <span
// //                             style={{
// //                                 fontSize: 13,
// //                                 color: "#64748B",
// //                                 whiteSpace:
// //                                     "nowrap",
// //                             }}
// //                         >
// //                             Data as of{" "}
// //                             <strong
// //                                 style={{
// //                                     color:
// //                                         "#334155",
// //                                     fontWeight: 600,
// //                                 }}
// //                             >
// //                                 {formatDataAsOf(
// //                                     dataAsOf
// //                                 )}
// //                             </strong>
// //                         </span>
// //                     )}

// //                     {currentMonthPartial && (
// //                         <span
// //                             style={{
// //                                 display:
// //                                     "inline-flex",
// //                                 alignItems:
// //                                     "center",
// //                                 padding:
// //                                     "3px 7px",
// //                                 borderRadius:
// //                                     999,
// //                                 background:
// //                                     "#FFF7ED",
// //                                 border:
// //                                     "1px solid #FED7AA",
// //                                 color:
// //                                     "#C2410C",
// //                                 fontSize: 13,
// //                                 fontWeight: 600,
// //                                 whiteSpace:
// //                                     "nowrap",
// //                             }}
// //                         >
// //                             Current month partial
// //                         </span>
// //                     )}

// //                     {/* 3 DOT MENU */}

// //                     <button
// //                         type="button"
// //                         onClick={() =>
// //                             setMenuOpen(
// //                                 (prev) =>
// //                                     !prev
// //                             )
// //                         }
// //                         aria-label="Expense category actions"
// //                         aria-expanded={
// //                             menuOpen
// //                         }
// //                         style={{
// //                             border: "none",
// //                             background:
// //                                 "transparent",
// //                             padding:
// //                                 "2px 4px",
// //                             cursor:
// //                                 "pointer",
// //                             color:
// //                                 "#64748B",
// //                             fontSize: 17,
// //                             lineHeight: 1,
// //                         }}
// //                     >
// //                         ⋮
// //                     </button>

// //                     {/* ACTION MENU */}

// //                     {menuOpen && (
// //                         <div
// //                             style={{
// //                                 position:
// //                                     "absolute",
// //                                 top: 28,
// //                                 right: 0,
// //                                 minWidth: 165,
// //                                 background:
// //                                     "#FFFFFF",
// //                                 border:
// //                                     "1px solid #E5E7EB",
// //                                 borderRadius: 8,
// //                                 boxShadow:
// //                                     "0 8px 24px rgba(15, 23, 42, 0.12)",
// //                                 padding:
// //                                     "5px 0",
// //                                 zIndex: 100,
// //                             }}
// //                         >
// //                             {/* VIEW ALL */}

// //                             <button
// //                                 type="button"
// //                                 onClick={
// //                                     handleViewAllClick
// //                                 }
// //                                 style={{
// //                                     width: "100%",
// //                                     display:
// //                                         "flex",
// //                                     alignItems:
// //                                         "center",
// //                                     gap: 9,
// //                                     border:
// //                                         "none",
// //                                     background:
// //                                         "transparent",
// //                                     padding:
// //                                         "9px 12px",
// //                                     cursor:
// //                                         "pointer",
// //                                     textAlign:
// //                                         "left",
// //                                     fontSize: 13,
// //                                     fontWeight: 500,
// //                                     color:
// //                                         "#334155",
// //                                 }}
// //                                 onMouseEnter={(
// //                                     event
// //                                 ) => {
// //                                     event.currentTarget.style.background =
// //                                         "#F8FAFC";
// //                                 }}
// //                                 onMouseLeave={(
// //                                     event
// //                                 ) => {
// //                                     event.currentTarget.style.background =
// //                                         "transparent";
// //                                 }}
// //                             >
// //                                 <span
// //                                     style={{
// //                                         fontSize: 14,
// //                                     }}
// //                                 >
// //                                     🔍
// //                                 </span>

// //                                 <span>
// //                                     View All
// //                                 </span>
// //                             </button>

// //                             {/* EXPORT EXCEL */}

// //                             <button
// //                                 type="button"
// //                                 onClick={
// //                                     handleExportExcelClick
// //                                 }
// //                                 style={{
// //                                     width: "100%",
// //                                     display:
// //                                         "flex",
// //                                     alignItems:
// //                                         "center",
// //                                     gap: 9,
// //                                     border:
// //                                         "none",
// //                                     background:
// //                                         "transparent",
// //                                     padding:
// //                                         "9px 12px",
// //                                     cursor:
// //                                         "pointer",
// //                                     textAlign:
// //                                         "left",
// //                                     fontSize: 13,
// //                                     fontWeight: 500,
// //                                     color:
// //                                         "#334155",
// //                                 }}
// //                                 onMouseEnter={(
// //                                     event
// //                                 ) => {
// //                                     event.currentTarget.style.background =
// //                                         "#F8FAFC";
// //                                 }}
// //                                 onMouseLeave={(
// //                                     event
// //                                 ) => {
// //                                     event.currentTarget.style.background =
// //                                         "transparent";
// //                                 }}
// //                             >
// //                                 <span
// //                                     style={{
// //                                         fontSize: 14,
// //                                     }}
// //                                 >
// //                                     📊
// //                                 </span>

// //                                 <span>
// //                                     Export Excel
// //                                 </span>
// //                             </button>

// //                             {/* EXPORT PDF */}

// //                             <button
// //                                 type="button"
// //                                 onClick={
// //                                     handleExportPdfClick
// //                                 }
// //                                 style={{
// //                                     width: "100%",
// //                                     display:
// //                                         "flex",
// //                                     alignItems:
// //                                         "center",
// //                                     gap: 9,
// //                                     border:
// //                                         "none",
// //                                     background:
// //                                         "transparent",
// //                                     padding:
// //                                         "9px 12px",
// //                                     cursor:
// //                                         "pointer",
// //                                     textAlign:
// //                                         "left",
// //                                     fontSize: 13,
// //                                     fontWeight: 500,
// //                                     color:
// //                                         "#334155",
// //                                 }}
// //                                 onMouseEnter={(
// //                                     event
// //                                 ) => {
// //                                     event.currentTarget.style.background =
// //                                         "#F8FAFC";
// //                                 }}
// //                                 onMouseLeave={(
// //                                     event
// //                                 ) => {
// //                                     event.currentTarget.style.background =
// //                                         "transparent";
// //                                 }}
// //                             >
// //                                 <span
// //                                     style={{
// //                                         fontSize: 14,
// //                                     }}
// //                                 >
// //                                     📄
// //                                 </span>

// //                                 <span>
// //                                     Export PDF
// //                                 </span>
// //                             </button>
// //                         </div>
// //                     )}
// //                 </div>
// //             </div>

// //             {/* =================================================
// //                 TABLE FILTER SECTION
// //             ================================================= */}

// //             <div
// //                 style={{
// //                     width: "100%",
// //                     padding: "10px 12px 11px",
// //                     background: "#FFFFFF",
// //                     borderTop: "1px solid #F1F5F9",
// //                     borderBottom: "1px solid #E2E8F0",
// //                     boxSizing: "border-box",
// //                 }}
// //             >
// //                 <div
// //                     style={{
// //                         display: "grid",
// //                         gridTemplateColumns:
// //                             "repeat(8, minmax(105px, 1fr))",
// //                         gap: 9,
// //                         alignItems: "end",
// //                     }}
// //                 >
// //                     <FilterField label="Legal Group">
// //                         <CompactMultiSelect
// //                             options={cascadingOptions.legalGroups}
// //                             value={tableFilters.legalGroupId}
// //                             onChange={(value) =>
// //                                 updateTableMulti("legalGroupId", value)
// //                             }
// //                         />
// //                     </FilterField>

// //                     <FilterField label="Legal Entity">
// //                         <CompactMultiSelect
// //                             options={cascadingOptions.legalEntities}
// //                             value={tableFilters.legalEntityId}
// //                             onChange={(value) =>
// //                                 updateTableMulti("legalEntityId", value)
// //                             }
// //                         />
// //                     </FilterField>

// //                     <FilterField label="Parent Division">
// //                         <CompactMultiSelect
// //                             options={cascadingOptions.parentDivisions}
// //                             value={tableFilters.parentDivisionId}
// //                             onChange={(value) =>
// //                                 updateTableMulti("parentDivisionId", value)
// //                             }
// //                         />
// //                     </FilterField>

// //                     <FilterField label="Sub-Division">
// //                         <CompactMultiSelect
// //                             options={cascadingOptions.subdivisions}
// //                             value={tableFilters.subdivisionId}
// //                             onChange={(value) =>
// //                                 updateTableMulti("subdivisionId", value)
// //                             }
// //                         />
// //                     </FilterField>

// //                     <FilterField label="Year">
// //                         <select
// //                             value={tableFilters.year || ""}
// //                             onChange={(event) =>
// //                                 setTableFilters((prev) => ({
// //                                     ...prev,
// //                                     year: event.target.value,
// //                                 }))
// //                             }
// //                             style={{
// //                                 width: "100%",
// //                                 height: 34,
// //                                 padding: "0 9px",
// //                                 border: "1px solid #E2E8F0",
// //                                 borderRadius: 9,
// //                                 background: "#F8FAFC",
// //                                 color: "#334155",
// //                                 fontSize: 12,
// //                                 fontWeight: 600,
// //                                 outline: "none",
// //                                 boxSizing: "border-box",
// //                             }}
// //                         >
// //                             {(filterOptionsResolved.years?.length
// //                                 ? filterOptionsResolved.years
// //                                 : [tableFilters.year]
// //                             ).map((year) => (
// //                                 <option
// //                                     key={optionValue(year)}
// //                                     value={optionValue(year)}
// //                                 >
// //                                     {optionLabel(year)}
// //                                 </option>
// //                             ))}
// //                         </select>
// //                     </FilterField>

// //                     <FilterField label="Period">
// //                         <select
// //                             value={tableFilters.periodName || ""}
// //                             onChange={(event) =>
// //                                 setTableFilters((prev) => ({
// //                                     ...prev,
// //                                     periodName: event.target.value,
// //                                 }))
// //                             }
// //                             style={{
// //                                 width: "100%",
// //                                 height: 34,
// //                                 padding: "0 9px",
// //                                 border: "1px solid #E2E8F0",
// //                                 borderRadius: 9,
// //                                 background: "#F8FAFC",
// //                                 color: "#334155",
// //                                 fontSize: 12,
// //                                 fontWeight: 600,
// //                                 outline: "none",
// //                                 boxSizing: "border-box",
// //                             }}
// //                         >
// //                             {(filterOptionsResolved.periods?.length
// //                                 ? filterOptionsResolved.periods
// //                                 : [tableFilters.periodName]
// //                             ).map((period) => (
// //                                 <option
// //                                     key={optionValue(period)}
// //                                     value={optionValue(period)}
// //                                 >
// //                                     {optionLabel(period)}
// //                                 </option>
// //                             ))}
// //                         </select>
// //                     </FilterField>

// //                     <FilterField label="Reporting Currency">
// //                         <select
// //                             value={tableFilters.currency || "AED"}
// //                             onChange={(event) =>
// //                                 setTableFilters((prev) => ({
// //                                     ...prev,
// //                                     currency: event.target.value,
// //                                 }))
// //                             }
// //                             style={{
// //                                 width: "100%",
// //                                 height: 34,
// //                                 padding: "0 9px",
// //                                 border: "1px solid #E2E8F0",
// //                                 borderRadius: 9,
// //                                 background: "#F8FAFC",
// //                                 color: "#334155",
// //                                 fontSize: 12,
// //                                 fontWeight: 600,
// //                                 outline: "none",
// //                                 boxSizing: "border-box",
// //                             }}
// //                         >
// //                             {(filterOptionsResolved.currencies?.length
// //                                 ? filterOptionsResolved.currencies
// //                                 : [tableFilters.currency || "AED"]
// //                             ).map((currency) => (
// //                                 <option
// //                                     key={optionValue(currency)}
// //                                     value={optionValue(currency)}
// //                                 >
// //                                     {optionLabel(currency)}
// //                                 </option>
// //                             ))}
// //                         </select>
// //                     </FilterField>

// //                     <div
// //                         style={{
// //                             display: "flex",
// //                             alignItems: "flex-end",
// //                             gap: 7,
// //                             minWidth: 0,
// //                         }}
// //                     >
// //                         <button
// //                             type="button"
// //                             onClick={applyTableFilters}
// //                             disabled={tableFilterLoading}
// //                             style={{
// //                                 height: 34,
// //                                 minWidth: 76,
// //                                 padding: "0 14px",
// //                                 border: "none",
// //                                 borderRadius: 9,
// //                                 background: "#6D5CE7",
// //                                 color: "#FFFFFF",
// //                                 fontSize: 12,
// //                                 fontWeight: 700,
// //                                 cursor: tableFilterLoading ? "not-allowed" : "pointer",
// //                                 opacity: tableFilterLoading ? 0.72 : 1,
// //                                 boxShadow:
// //                                     "0 4px 10px rgba(109,92,231,.18)",
// //                             }}
// //                         >
// //                             {tableFilterLoading ? "Applying..." : "Apply"}
// //                         </button>

// //                         <button
// //                             type="button"
// //                             onClick={resetTableFilters}
// //                             style={{
// //                                 height: 34,
// //                                 minWidth: 68,
// //                                 padding: "0 13px",
// //                                 border: "1px solid #E2E8F0",
// //                                 borderRadius: 9,
// //                                 background: "#FFFFFF",
// //                                 color: "#475569",
// //                                 fontSize: 12,
// //                                 fontWeight: 700,
// //                                 cursor: "pointer",
// //                             }}
// //                         >
// //                             Reset
// //                         </button>
// //                     </div>
// //                 </div>
// //             </div>

// //             {tableFilterError ? (
// //                 <div
// //                     style={{
// //                         margin: "0 8px 8px",
// //                         padding: "8px 10px",
// //                         borderRadius: 8,
// //                         border: "1px solid #FECACA",
// //                         background: "#FEF2F2",
// //                         color: "#B91C1C",
// //                         fontSize: 11,
// //                         fontWeight: 600,
// //                     }}
// //                 >
// //                     {tableFilterError}
// //                 </div>
// //             ) : null}

// //             {/* =================================================
// //                 MAIN EXPENSE CATEGORY TABLE
// //             ================================================= */}

// //             <div
// //                 style={{
// //                     width: "100%",
// //                     overflowX: "auto",
// //                     padding:
// //                         "0 8px 10px",
// //                     boxSizing:
// //                         "border-box",
// //                 }}
// //             >
// //                 <table
// //                     style={{
// //                         width: "100%",
// //                         minWidth: 760,
// //                         borderCollapse:
// //                             "collapse",
// //                         tableLayout: "fixed",
// //                         fontSize: "0.70rem",
// //                     }}
// //                 >
// //                     <colgroup>
// //                         <col style={{ width: "18%" }} />
// //                         <col style={{ width: "9%" }} />
// //                         <col style={{ width: "9%" }} />
// //                         <col style={{ width: "10%" }} />
// //                         <col style={{ width: "8%" }} />
// //                         <col style={{ width: "9%" }} />
// //                         <col style={{ width: "9%" }} />
// //                         <col style={{ width: "10%" }} />
// //                         <col style={{ width: "8%" }} />
// //                     </colgroup>

// //                     <thead>
// //                         <tr
// //                             style={{
// //                                 height: 38,
// //                                 background:
// //                                     "#F8FAFC",
// //                                 borderBottom:
// //                                     "2px solid #E2E8F0",
// //                             }}
// //                         >
// //                             <th
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "left",
// //                                     color:
// //                                         "#1E3A8A",
// //                                     fontSize:
// //                                         "0.74rem",
// //                                     fontWeight: 700,
// //                                     whiteSpace:
// //                                         "normal",
// //                                     lineHeight:
// //                                         "16px",
// //                                     background:
// //                                         "#F8FAFC",
// //                                     borderBottom:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 EXPENSE CATEGORY
// //                             </th>

// //                             <th
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     color:
// //                                         "#1E3A8A",
// //                                     fontSize:
// //                                         "0.68rem",
// //                                     fontWeight: 700,
// //                                     whiteSpace:
// //                                         "normal",
// //                                     lineHeight:
// //                                         "16px",
// //                                     background:
// //                                         "#F8FAFC",
// //                                     borderBottom:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 ACTUAL PTD
// //                             </th>

// //                             <th
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     color:
// //                                         "#1E3A8A",
// //                                     fontSize:
// //                                         "0.68rem",
// //                                     fontWeight: 700,
// //                                     whiteSpace:
// //                                         "normal",
// //                                     lineHeight:
// //                                         "16px",
// //                                     background:
// //                                         "#F8FAFC",
// //                                     borderBottom:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 TARGET PTD
// //                             </th>

// //                             <th
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     color:
// //                                         "#1E3A8A",
// //                                     fontSize:
// //                                         "0.68rem",
// //                                     fontWeight: 700,
// //                                     whiteSpace:
// //                                         "normal",
// //                                     lineHeight:
// //                                         "16px",
// //                                     background:
// //                                         "#F8FAFC",
// //                                     borderBottom:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 VARIANCE PTD
// //                             </th>

// //                             <th
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     color:
// //                                         "#1E3A8A",
// //                                     fontSize:
// //                                         "0.68rem",
// //                                     fontWeight: 700,
// //                                     whiteSpace:
// //                                         "normal",
// //                                     lineHeight:
// //                                         "16px",
// //                                     background:
// //                                         "#F8FAFC",
// //                                     borderBottom:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 VARIANCE <br />PTD%
// //                             </th>

// //                             <th
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     color:
// //                                         "#1E3A8A",
// //                                     fontSize:
// //                                         "0.68rem",
// //                                     fontWeight: 700,
// //                                     whiteSpace:
// //                                         "normal",
// //                                     lineHeight:
// //                                         "16px",
// //                                     background:
// //                                         "#F8FAFC",
// //                                     borderBottom:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 ACTUAL YTD
// //                             </th>

// //                             <th
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     color:
// //                                         "#1E3A8A",
// //                                     fontSize:
// //                                         "0.68rem",
// //                                     fontWeight: 700,
// //                                     whiteSpace:
// //                                         "normal",
// //                                     lineHeight:
// //                                         "16px",
// //                                     background:
// //                                         "#F8FAFC",
// //                                     borderBottom:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 TARGET YTD
// //                             </th>

// //                             <th
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     color:
// //                                         "#1E3A8A",
// //                                     fontSize:
// //                                         "0.68rem",
// //                                     fontWeight: 700,
// //                                     whiteSpace:
// //                                         "normal",
// //                                     lineHeight:
// //                                         "16px",
// //                                     background:
// //                                         "#F8FAFC",
// //                                     borderBottom:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 VARIANCE YTD
// //                             </th>

// //                             <th
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     color:
// //                                         "#1E3A8A",
// //                                     fontSize:
// //                                         "0.68rem",
// //                                     fontWeight: 700,
// //                                     whiteSpace:
// //                                         "normal",
// //                                     lineHeight:
// //                                         "16px",
// //                                     background:
// //                                         "#F8FAFC",
// //                                     borderBottom:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 VARIANCE<br /> YTD%
// //                             </th>
// //                         </tr>
// //                     </thead>

// //                     <tbody>
// //                         {filteredData.map(
// //                             (
// //                                 item,
// //                                 index
// //                             ) => {
// //                                 const rowKey =
// //                                     item?.category ||
// //                                     index;

// //                                 const isExpanded =
// //                                     !!expandedRows[
// //                                     rowKey
// //                                     ];

// //                                 const actualPTD =
// //                                     item?.actualPTD ??
// //                                     item?.actual_ptd;

// //                                 const targetPTD =
// //                                     item?.targetPTD ??
// //                                     item?.target_ptd;

// //                                 const variancePTD =
// //                                     item?.variancePTD ??
// //                                     item?.variance_ptd;

// //                                 const variancePTDPercent =
// //                                     item?.variancePTDPercent ??
// //                                     item?.variance_ptd_pct;

// //                                 const actualYTD =
// //                                     item?.actualYTD ??
// //                                     item?.actual_ytd;

// //                                 const targetYTD =
// //                                     item?.targetYTD ??
// //                                     item?.target_ytd;

// //                                 const varianceYTD =
// //                                     item?.varianceYTD ??
// //                                     item?.variance_ytd;

// //                                 const varianceYTDPercent =
// //                                     item?.varianceYTDPercent ??
// //                                     item?.variance_ytd_pct;

// //                                 return (
// //                                     <React.Fragment
// //                                         key={
// //                                             rowKey
// //                                         }
// //                                     >
// //                                         {/* MAIN CATEGORY ROW */}

// //                                         <tr
// //                                             style={{
// //                                                 height: 39,
// //                                                 borderBottom:
// //                                                     "1px solid #F1F5F9",
// //                                             }}
// //                                         >
// //                                             <td
// //                                                 style={{
// //                                                     padding:
// //                                                         "7px 6px",
// //                                                     textAlign:
// //                                                         "left",
// //                                                     borderBottom:
// //                                                         "1px solid #F1F5F9",
// //                                                 }}
// //                                             >
// //                                                 <div
// //                                                     style={{
// //                                                         display:
// //                                                             "flex",
// //                                                         alignItems:
// //                                                             "center",
// //                                                         gap: 7,
// //                                                     }}
// //                                                 >
// //                                                     <button
// //                                                         type="button"
// //                                                         onClick={() =>
// //                                                             toggleRow(
// //                                                                 item,
// //                                                                 index
// //                                                             )
// //                                                         }
// //                                                         style={{
// //                                                             width: 12,
// //                                                             height: 12,
// //                                                             padding: 0,
// //                                                             border:
// //                                                                 "none",
// //                                                             background:
// //                                                                 "transparent",
// //                                                             cursor:
// //                                                                 "pointer",
// //                                                             color:
// //                                                                 "#000000",
// //                                                             display:
// //                                                                 "flex",
// //                                                             alignItems:
// //                                                                 "center",
// //                                                             justifyContent:
// //                                                                 "center",
// //                                                             fontSize: 11,
// //                                                             lineHeight: 1,
// //                                                         }}
// //                                                     >
// //                                                         {isExpanded
// //                                                             ? "▼"
// //                                                             : "▶"}
// //                                                     </button>

// //                                                     <span
// //                                                         style={{
// //                                                             fontSize:
// //                                                                 "0.74rem",
// //                                                             fontWeight: 700,
// //                                                             color:
// //                                                                 "#334155",
// //                                                             whiteSpace:
// //                                                                 "nowrap",
// //                                                             textTransform:
// //                                                                 "uppercase",
// //                                                         }}
// //                                                     >
// //                                                         {item?.category ||
// //                                                             "—"}
// //                                                     </span>
// //                                                 </div>
// //                                             </td>

// //                                             {/* PTD ACTUAL */}

// //                                             <td
// //                                                 style={{
// //                                                     padding:
// //                                                         "7px 6px",
// //                                                     textAlign:
// //                                                         "right",
// //                                                     fontSize:
// //                                                         "0.74rem",
// //                                                     color:
// //                                                         getNumberColor(
// //                                                             actualPTD,
// //                                                             "#334155"
// //                                                         ),
// //                                                     fontWeight: 500,
// //                                                     fontVariantNumeric:
// //                                                         "tabular-nums",
// //                                                     whiteSpace:
// //                                                         "nowrap",
// //                                                     borderBottom:
// //                                                         "1px solid #F1F5F9",
// //                                                 }}
// //                                             >
// //                                                 {formatNumber(
// //                                                     actualPTD
// //                                                 )}
// //                                             </td>

// //                                             {/* PTD TARGET */}

// //                                             <td
// //                                                 style={{
// //                                                     padding:
// //                                                         "7px 6px",
// //                                                     textAlign:
// //                                                         "right",
// //                                                     fontSize:
// //                                                         "0.74rem",
// //                                                     color:
// //                                                         getNumberColor(
// //                                                             targetPTD,
// //                                                             "#64748B"
// //                                                         ),
// //                                                     fontWeight: 500,
// //                                                     fontVariantNumeric:
// //                                                         "tabular-nums",
// //                                                     whiteSpace:
// //                                                         "nowrap",
// //                                                     borderBottom:
// //                                                         "1px solid #F1F5F9",
// //                                                 }}
// //                                             >
// //                                                 {formatNumber(
// //                                                     targetPTD
// //                                                 )}
// //                                             </td>

// //                                             {/* PTD VARIANCE */}

// //                                             <td
// //                                                 style={{
// //                                                     padding:
// //                                                         "7px 6px",
// //                                                     textAlign:
// //                                                         "right",
// //                                                     fontSize:
// //                                                         "0.74rem",
// //                                                     color:
// //                                                         getNumberColor(
// //                                                             variancePTD,
// //                                                             "#64748B"
// //                                                         ),
// //                                                     fontWeight: 600,
// //                                                     fontVariantNumeric:
// //                                                         "tabular-nums",
// //                                                     whiteSpace:
// //                                                         "nowrap",
// //                                                     borderBottom:
// //                                                         "1px solid #F1F5F9",
// //                                                 }}
// //                                             >
// //                                                 {formatNumber(
// //                                                     variancePTD
// //                                                 )}
// //                                             </td>

// //                                             {/* PTD VARIANCE % */}

// //                                             <td
// //                                                 style={{
// //                                                     padding:
// //                                                         "7px 6px",
// //                                                     textAlign:
// //                                                         "right",
// //                                                     fontSize:
// //                                                         "0.74rem",
// //                                                     color:
// //                                                         getNumberColor(
// //                                                             variancePTDPercent,
// //                                                             "#64748B"
// //                                                         ),
// //                                                     fontWeight: 600,
// //                                                     fontVariantNumeric:
// //                                                         "tabular-nums",
// //                                                     whiteSpace:
// //                                                         "nowrap",
// //                                                     borderBottom:
// //                                                         "1px solid #F1F5F9",
// //                                                 }}
// //                                             >
// //                                                 {variancePTDPercent !==
// //                                                     null &&
// //                                                     variancePTDPercent !==
// //                                                     undefined &&
// //                                                     variancePTDPercent !==
// //                                                     ""
// //                                                     ? `${Number(
// //                                                         variancePTDPercent
// //                                                     ).toFixed(
// //                                                         1
// //                                                     )}%`
// //                                                     : "—"}
// //                                             </td>

// //                                             {/* YTD ACTUAL */}

// //                                             <td
// //                                                 style={{
// //                                                     padding:
// //                                                         "7px 6px",
// //                                                     textAlign:
// //                                                         "right",
// //                                                     fontSize:
// //                                                         "0.74rem",
// //                                                     color:
// //                                                         getNumberColor(
// //                                                             actualYTD,
// //                                                             "#334155"
// //                                                         ),
// //                                                     fontWeight: 500,
// //                                                     fontVariantNumeric:
// //                                                         "tabular-nums",
// //                                                     whiteSpace:
// //                                                         "nowrap",
// //                                                     borderBottom:
// //                                                         "1px solid #F1F5F9",
// //                                                 }}
// //                                             >
// //                                                 {formatNumber(
// //                                                     actualYTD
// //                                                 )}
// //                                             </td>

// //                                             {/* YTD TARGET */}

// //                                             <td
// //                                                 style={{
// //                                                     padding:
// //                                                         "7px 6px",
// //                                                     textAlign:
// //                                                         "right",
// //                                                     fontSize:
// //                                                         "0.74rem",
// //                                                     color:
// //                                                         getNumberColor(
// //                                                             targetYTD,
// //                                                             "#64748B"
// //                                                         ),
// //                                                     fontWeight: 500,
// //                                                     fontVariantNumeric:
// //                                                         "tabular-nums",
// //                                                     whiteSpace:
// //                                                         "nowrap",
// //                                                     borderBottom:
// //                                                         "1px solid #F1F5F9",
// //                                                 }}
// //                                             >
// //                                                 {formatNumber(
// //                                                     targetYTD
// //                                                 )}
// //                                             </td>

// //                                             {/* YTD VARIANCE */}

// //                                             <td
// //                                                 style={{
// //                                                     padding:
// //                                                         "7px 6px",
// //                                                     textAlign:
// //                                                         "right",
// //                                                     fontSize:
// //                                                         "0.74rem",
// //                                                     color:
// //                                                         getNumberColor(
// //                                                             varianceYTD,
// //                                                             "#64748B"
// //                                                         ),
// //                                                     fontWeight: 600,
// //                                                     fontVariantNumeric:
// //                                                         "tabular-nums",
// //                                                     whiteSpace:
// //                                                         "nowrap",
// //                                                     borderBottom:
// //                                                         "1px solid #F1F5F9",
// //                                                 }}
// //                                             >
// //                                                 {formatNumber(
// //                                                     varianceYTD
// //                                                 )}
// //                                             </td>

// //                                             {/* YTD VARIANCE % */}

// //                                             <td
// //                                                 style={{
// //                                                     padding:
// //                                                         "7px 6px",
// //                                                     textAlign:
// //                                                         "right",
// //                                                     fontSize:
// //                                                         "0.74rem",
// //                                                     color:
// //                                                         getNumberColor(
// //                                                             varianceYTDPercent,
// //                                                             "#64748B"
// //                                                         ),
// //                                                     fontWeight: 600,
// //                                                     fontVariantNumeric:
// //                                                         "tabular-nums",
// //                                                     whiteSpace:
// //                                                         "nowrap",
// //                                                     borderBottom:
// //                                                         "1px solid #F1F5F9",
// //                                                 }}
// //                                             >
// //                                                 {varianceYTDPercent !==
// //                                                     null &&
// //                                                     varianceYTDPercent !==
// //                                                     undefined &&
// //                                                     varianceYTDPercent !==
// //                                                     ""
// //                                                     ? `${Number(
// //                                                         varianceYTDPercent
// //                                                     ).toFixed(
// //                                                         1
// //                                                     )}%`
// //                                                     : "—"}
// //                                             </td>
// //                                         </tr>

// //                                         {/* EXPANDED ROW */}

// //                                         {isExpanded && (
// //                                             <tr>
// //                                                 <td
// //                                                     colSpan={9}
// //                                                     style={{
// //                                                         background:
// //                                                             "#FFFFFF",
// //                                                         padding:
// //                                                             "10px 0",
// //                                                         borderBottom:
// //                                                             "1px solid #E5E7EB",
// //                                                     }}
// //                                                 >
// //                                                     <div
// //                                                         style={{
// //                                                             width: "100%",
// //                                                         }}
// //                                                     >
// //                                                         <div
// //                                                             style={{
// //                                                                 marginBottom: 8,
// //                                                                 display:
// //                                                                     "flex",
// //                                                                 alignItems:
// //                                                                     "center",
// //                                                             }}
// //                                                         >
// //                                                             <div
// //                                                                 style={{
// //                                                                     fontSize:
// //                                                                         "0.74rem",
// //                                                                     fontWeight: 600,
// //                                                                     color:
// //                                                                         "#334155",
// //                                                                 }}
// //                                                             >
// //                                                                 Natural-account
// //                                                                 details
// //                                                                 for{" "}
// //                                                                 <strong
// //                                                                     style={{
// //                                                                         color:
// //                                                                             "#0F172A",
// //                                                                         fontWeight: 700,
// //                                                                     }}
// //                                                                 >
// //                                                                     {item?.category ||
// //                                                                         "—"}
// //                                                                 </strong>
// //                                                             </div>
// //                                                         </div>

// //                                                         {renderNaturalAccountDetails(
// //                                                             item?.category,
// //                                                             item
// //                                                         )}
// //                                                     </div>
// //                                                 </td>
// //                                             </tr>
// //                                         )}
// //                                     </React.Fragment>
// //                                 );
// //                             }
// //                         )}

// //                         {/* =================================================
// //                             TOTAL
// //                         ================================================= */}

// //                         <tr
// //                             style={{
// //                                 height: 43,
// //                                 background:
// //                                     "#F8FAFC",
// //                             }}
// //                         >
// //                             <td
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "left",
// //                                     fontSize:
// //                                         "0.74rem",
// //                                     fontWeight: 800,
// //                                     color:
// //                                         "#1E3A8A",
// //                                     borderTop:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 <span
// //                                     style={{
// //                                         paddingLeft: 21,
// //                                     }}
// //                                 >
// //                                     Total Operating
// //                                     Expenses
// //                                 </span>
// //                             </td>

// //                             {/* TOTAL PTD ACTUAL */}

// //                             <td
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     fontSize:
// //                                         "0.74rem",
// //                                     fontWeight: 800,
// //                                     color:
// //                                         getNumberColor(
// //                                             totalActualPTD,
// //                                             "#1E3A8A"
// //                                         ),
// //                                     fontVariantNumeric:
// //                                         "tabular-nums",
// //                                     borderTop:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 {formatNumber(
// //                                     totalActualPTD
// //                                 )}
// //                             </td>

// //                             {/* TARGET PTD */}

// //                             <td
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     fontSize:
// //                                         "0.74rem",
// //                                     fontWeight: 800,
// //                                     color:
// //                                         "#64748B",
// //                                     fontVariantNumeric:
// //                                         "tabular-nums",
// //                                     borderTop:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 {formatNumber(
// //                                     null
// //                                 )}
// //                             </td>

// //                             {/* VARIANCE PTD */}

// //                             <td
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     fontSize:
// //                                         "0.74rem",
// //                                     fontWeight: 800,
// //                                     color:
// //                                         "#64748B",
// //                                     fontVariantNumeric:
// //                                         "tabular-nums",
// //                                     borderTop:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 {formatNumber(
// //                                     null
// //                                 )}
// //                             </td>

// //                             {/* VARIANCE PTD % */}

// //                             <td
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     fontSize:
// //                                         "0.74rem",
// //                                     fontWeight: 800,
// //                                     color:
// //                                         "#64748B",
// //                                     borderTop:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 —
// //                             </td>

// //                             {/* TOTAL YTD ACTUAL */}

// //                             <td
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     fontSize:
// //                                         "0.74rem",
// //                                     fontWeight: 800,
// //                                     color:
// //                                         getNumberColor(
// //                                             totalActualYTD,
// //                                             "#1E3A8A"
// //                                         ),
// //                                     fontVariantNumeric:
// //                                         "tabular-nums",
// //                                     borderTop:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 {formatNumber(
// //                                     totalActualYTD
// //                                 )}
// //                             </td>

// //                             {/* TARGET YTD */}

// //                             <td
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     fontSize:
// //                                         "0.74rem",
// //                                     fontWeight: 800,
// //                                     color:
// //                                         "#64748B",
// //                                     fontVariantNumeric:
// //                                         "tabular-nums",
// //                                     borderTop:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 {formatNumber(
// //                                     null
// //                                 )}
// //                             </td>

// //                             {/* VARIANCE YTD */}

// //                             <td
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     fontSize:
// //                                         "0.74rem",
// //                                     fontWeight: 800,
// //                                     color:
// //                                         "#64748B",
// //                                     fontVariantNumeric:
// //                                         "tabular-nums",
// //                                     borderTop:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 {formatNumber(
// //                                     null
// //                                 )}
// //                             </td>

// //                             {/* VARIANCE YTD % */}

// //                             <td
// //                                 style={{
// //                                     padding:
// //                                         "6px 5px",
// //                                     textAlign:
// //                                         "right",
// //                                     fontSize:
// //                                         "0.74rem",
// //                                     fontWeight: 800,
// //                                     color:
// //                                         "#64748B",
// //                                     borderTop:
// //                                         "2px solid #E2E8F0",
// //                                 }}
// //                             >
// //                                 —
// //                             </td>
// //                         </tr>
// //                     </tbody>
// //                 </table>
// //             </div>
// //         </div>
// //     );
// // }



// import React, { useEffect, useMemo, useState } from "react";
// import { deriveCategoryNaturalAccounts } from "../../data/opexNaturalAccounts";
// import {
//     getOpexFilterOptions,
//     getOpexCategoryBreakdown,
// } from "../../api/opexApi";

// /* =========================================================
//    MONTHS
// ========================================================= */

// const MONTHS = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
// ];

// /* =========================================================
//    FORMAT NUMBER
//    No decimal points
// ========================================================= */

// const formatNumber = (value) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === ""
//     ) {
//         return "—";
//     }

//     const number = Number(
//         typeof value === "string"
//             ? value.replace(/,/g, "")
//             : value
//     );

//     if (!Number.isFinite(number)) {
//         return "—";
//     }

//     return number.toLocaleString("en-US", {
//         maximumFractionDigits: 0,
//         minimumFractionDigits: 0,
//     });
// };

// /* =========================================================
//    GET NUMBER COLOR
//    Negative values = RED
// ========================================================= */

// const getNumberColor = (
//     value,
//     defaultColor = "#334155"
// ) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === "" ||
//         value === "-" ||
//         value === "—"
//     ) {
//         return defaultColor;
//     }

//     const number = Number(
//         typeof value === "string"
//             ? value.replace(/,/g, "")
//             : value
//     );

//     if (
//         Number.isFinite(number) &&
//         number < 0
//     ) {
//         return "#DC2626";
//     }

//     return defaultColor;
// };

// /* =========================================================
//    FORMAT MONTH VALUE
//    AED → AED Millions
// ========================================================= */

// const formatMonthValue = (value) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === ""
//     ) {
//         return "—";
//     }

//     const number = Number(
//         typeof value === "string"
//             ? value.replace(/,/g, "")
//             : value
//     );

//     if (!Number.isFinite(number)) {
//         return "—";
//     }

//     const millions = number / 1_000_000;

//     return `AED ${millions.toLocaleString("en-US", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//     })}M`;
// };

// /* =========================================================
//    FORMAT DATA AS OF
// ========================================================= */

// const formatDataAsOf = (value) => {
//     if (!value) {
//         return "—";
//     }

//     const valueString = String(value);

//     const dateOnlyMatch = valueString.match(
//         /^(\d{4})-(\d{2})-(\d{2})$/
//     );

//     if (dateOnlyMatch) {
//         const [, year, month, day] =
//             dateOnlyMatch;

//         const date = new Date(
//             Number(year),
//             Number(month) - 1,
//             Number(day)
//         );

//         return date.toLocaleDateString(
//             "en-GB",
//             {
//                 day: "2-digit",
//                 month: "short",
//                 year: "numeric",
//             }
//         );
//     }

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//         return valueString;
//     }

//     return date.toLocaleDateString(
//         "en-GB",
//         {
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//         }
//     );
// };

// /* =========================================================
//    GET MONTH VALUE
// ========================================================= */

// const getMonthValue = (
//     monthData,
//     month
// ) => {
//     if (!monthData) {
//         return null;
//     }

//     if (Array.isArray(monthData)) {
//         const monthItem =
//             monthData.find(
//                 (item) =>
//                     item?.month === month ||
//                     item?.month_name === month ||
//                     item?.monthName === month
//             );

//         return (
//             monthItem?.value ??
//             monthItem?.actual ??
//             monthItem?.monthly_actual ??
//             null
//         );
//     }

//     return (
//         monthData?.[month] ??
//         monthData?.[month.toLowerCase()] ??
//         null
//     );
// };

// /* =========================================================
//    GET DETAILS
// ========================================================= */

// const getDetails = (item) => {
//     if (!item) {
//         return [];
//     }

//     if (Array.isArray(item.categoryDetails)) {
//         return item.categoryDetails;
//     }

//     if (Array.isArray(item.naturalAccounts)) {
//         return item.naturalAccounts;
//     }

//     if (Array.isArray(item.details)) {
//         return item.details;
//     }

//     return [];
// };

// /* =========================================================
//    NORMALIZE CATEGORY DETAIL API RESPONSE
// ========================================================= */

// const normalizeCategoryDetails = (
//     response
// ) => {
//     if (Array.isArray(response)) {
//         return response;
//     }

//     if (Array.isArray(response?.data)) {
//         return response.data;
//     }

//     if (Array.isArray(response?.details)) {
//         return response.details;
//     }

//     if (
//         Array.isArray(
//             response?.categoryDetails
//         )
//     ) {
//         return response.categoryDetails;
//     }

//     if (
//         Array.isArray(
//             response?.naturalAccounts
//         )
//     ) {
//         return response.naturalAccounts;
//     }

//     return [];
// };

// /* =========================================================
//    GET ACCOUNT NAME
// ========================================================= */

// const getAccountName = (account) => {
//     return (
//         account?.account_name ??
//         account?.accountName ??
//         account?.natural_account_name ??
//         account?.naturalAccountName ??
//         account?.account ??
//         account?.name ??
//         "—"
//     );
// };

// /* =========================================================
//    GET ACCOUNT CODE
// ========================================================= */

// const getAccountCode = (account) => {
//     return (
//         account?.account_code ??
//         account?.accountCode ??
//         account?.natural_account_code ??
//         account?.naturalAccountCode ??
//         account?.natural_account_id ??
//         null
//     );
// };

// /* =========================================================
//    GET ACTUAL PTD
// ========================================================= */

// const getActualPTD = (item) => {
//     return (
//         item?.actualPTD ??
//         item?.actual_ptd ??
//         item?.actual_ptd_aed ??
//         null
//     );
// };

// /* =========================================================
//    GET ACTUAL YTD
// ========================================================= */

// const getActualYTD = (item) => {
//     return (
//         item?.actualYTD ??
//         item?.actual_ytd ??
//         item?.actual_ytd_aed ??
//         null
//     );
// };

// /* =========================================================
//    GET TARGET / VARIANCE VALUES
// ========================================================= */

// const getTargetPTD = (item) => {
//     return (
//         item?.targetPTD ??
//         item?.target_ptd ??
//         null
//     );
// };

// const getVariancePTD = (item) => {
//     return (
//         item?.variancePTD ??
//         item?.variance_ptd ??
//         null
//     );
// };

// const getTargetYTD = (item) => {
//     return (
//         item?.targetYTD ??
//         item?.target_ytd ??
//         null
//     );
// };

// const getVarianceYTD = (item) => {
//     return (
//         item?.varianceYTD ??
//         item?.variance_ytd ??
//         null
//     );
// };

// /* =========================================================
//    GET VARIANCE STATUS
//    OPEX API status is the source of truth for variance colour.
// ========================================================= */

// const getVariancePTDStatus = (item) => {
//     return (
//         item?.variancePTDStatus ??
//         item?.variance_ptd_status ??
//         null
//     );
// };

// const getVarianceYTDStatus = (item) => {
//     return (
//         item?.varianceYTDStatus ??
//         item?.variance_ytd_status ??
//         null
//     );
// };

// const getVarianceStatusColor = (status, defaultColor = "#64748B") => {
//     const normalized = String(status || "").trim().toUpperCase();

//     if (normalized === "FAVOURABLE") {
//         return "#16A34A";
//     }

//     if (normalized === "UNFAVOURABLE") {
//         return "#DC2626";
//     }

//     return defaultColor;
// };

// /* =========================================================
//    CALCULATE TOTAL VALUE
// ========================================================= */

// const getTotalActual = (
//     data,
//     getter
// ) => {
//     if (
//         !Array.isArray(data) ||
//         !data.length
//     ) {
//         return null;
//     }

//     let total = 0;
//     let hasValue = false;

//     data.forEach((item) => {
//         const value = getter(item);

//         if (
//             value !== null &&
//             value !== undefined &&
//             value !== "" &&
//             value !== "-" &&
//             value !== "—"
//         ) {
//             const number = Number(value);

//             if (Number.isFinite(number)) {
//                 total += number;
//                 hasValue = true;
//             }
//         }
//     });

//     return hasValue ? total : null;
// };


// /* =========================================================
//    FILTER HELPERS
//    - Multi-select values are kept as arrays.
//    - Legal Group → Legal Entity → Parent Division →
//      Sub-Division cascade is applied locally.
//    - Optional onFilterApply lets the parent/backend refresh
//      data without changing existing behaviour when omitted.
// ========================================================= */

// const asArray = (value) => {
//     if (Array.isArray(value)) return value;
//     if (value === null || value === undefined || value === "") {
//         return [];
//     }
//     return [value];
// };

// const optionValue = (option) => {
//     if (option === null || option === undefined) return "";
//     if (typeof option !== "object") return String(option);

//     return String(
//         option.value ??
//         option.id ??
//         option.code ??
//         option.key ??
//         option.legal_group_id ??
//         option.legal_entity_id ??
//         option.parent_division_id ??
//         option.subdivision_id ??
//         option.year ??
//         option.period_name ??
//         option.currency ??
//         ""
//     );
// };

// const optionLabel = (option) => {
//     if (option === null || option === undefined) return "";
//     if (typeof option !== "object") return String(option);

//     return String(
//         option.label ??
//         option.name ??
//         option.title ??
//         option.display_name ??
//         option.legal_group_name ??
//         option.legal_entity_name ??
//         option.parent_division_name ??
//         option.subdivision_name ??
//         option.year ??
//         option.period_name ??
//         option.currency ??
//         option.value ??
//         option.id ??
//         ""
//     );
// };

// const getRelationValues = (option, keys) => {
//     for (const key of keys) {
//         const value = option?.[key];
//         if (value !== undefined && value !== null && value !== "") {
//             return asArray(value).map((item) => String(optionValue(item)));
//         }
//     }
//     return [];
// };

// const matchesSelected = (option, selected, relationKeys) => {
//     const values = asArray(selected)
//         .filter((value) => String(value) !== "All")
//         .map((value) => String(value));

//     if (!values.length) return true;

//     const relationValues = getRelationValues(option, relationKeys);

//     // If the option does not expose a relation, do not hide it.
//     // This keeps the filter backward-compatible with older option payloads.
//     if (!relationValues.length) return true;

//     return values.some((value) =>
//         relationValues.includes(value)
//     );
// };

// const cascadeOptions = (
//     options,
//     relations = []
// ) => {
//     const list = Array.isArray(options) ? options : [];

//     return list.filter((option) =>
//         relations.every(({ selected, keys }) =>
//             matchesSelected(option, selected, keys)
//         )
//     );
// };

// const uniqueOptionsFromRows = (rows, keys) => {
//     const map = new Map();

//     (Array.isArray(rows) ? rows : []).forEach((row) => {
//         let raw = null;
//         for (const key of keys) {
//             if (
//                 row?.[key] !== undefined &&
//                 row?.[key] !== null &&
//                 row?.[key] !== ""
//             ) {
//                 raw = row[key];
//                 break;
//             }
//         }

//         asArray(raw).forEach((item) => {
//             const value = optionValue(item);
//             const label = optionLabel(item);
//             if (value && !map.has(value)) {
//                 map.set(value, {
//                     value,
//                     label: label || value,
//                 });
//             }
//         });
//     });

//     return Array.from(map.values());
// };

// const getRowFilterValue = (row, keys) => {
//     for (const key of keys) {
//         const value = row?.[key];
//         if (value !== undefined && value !== null && value !== "") {
//             return asArray(value).map((item) =>
//                 String(optionValue(item))
//             );
//         }
//     }
//     return [];
// };

// const rowMatchesFilter = (row, selected, keys) => {
//     const values = asArray(selected)
//         .filter((value) => String(value) !== "All")
//         .map((value) => String(value));

//     if (!values.length) return true;

//     const rowValues = getRowFilterValue(row, keys);
//     if (!rowValues.length) return true;

//     return values.some((value) => rowValues.includes(value));
// };

// function CompactMultiSelect({
//     options = [],
//     value = ["All"],
//     onChange,
//     disabled = false,
// }) {
//     const [open, setOpen] = useState(false);
//     const selected = asArray(value).length
//         ? asArray(value)
//         : ["All"];

//     const displayValue =
//         selected.includes("All")
//             ? "All"
//             : selected.length === 1
//                 ? (() => {
//                     const match = options.find(
//                         (option) =>
//                             String(optionValue(option)) ===
//                             String(selected[0])
//                     );
//                     return optionLabel(match) || selected[0];
//                 })()
//                 : `${selected.length} Selected`;

//     const toggleValue = (nextValue) => {
//         const valueString = String(nextValue);

//         if (valueString === "All") {
//             onChange?.(["All"]);
//             return;
//         }

//         const current = selected.filter(
//             (item) => String(item) !== "All"
//         );

//         const exists = current.some(
//             (item) => String(item) === valueString
//         );

//         const next = exists
//             ? current.filter(
//                 (item) => String(item) !== valueString
//             )
//             : [...current, nextValue];

//         onChange?.(next.length ? next : ["All"]);
//     };

//     return (
//         <div
//             style={{
//                 position: "relative",
//                 width: "100%",
//             }}
//         >
//             <button
//                 type="button"
//                 disabled={disabled}
//                 onClick={() => setOpen((prev) => !prev)}
//                 style={{
//                     width: "100%",
//                     height: 34,
//                     padding: "0 10px",
//                     border: "1px solid #E2E8F0",
//                     borderRadius: 9,
//                     background: disabled ? "#F1F5F9" : "#F8FAFC",
//                     color: "#334155",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     gap: 8,
//                     cursor: disabled ? "not-allowed" : "pointer",
//                     fontSize: 12,
//                     fontWeight: 600,
//                     textAlign: "left",
//                     boxSizing: "border-box",
//                 }}
//             >
//                 <span
//                     style={{
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         whiteSpace: "nowrap",
//                     }}
//                 >
//                     {displayValue}
//                 </span>
//                 <span
//                     style={{
//                         fontSize: 12,
//                         color: "#334155",
//                         transform: open ? "rotate(180deg)" : "none",
//                         transition: "transform 140ms ease",
//                     }}
//                 >
//                     ⌄
//                 </span>
//             </button>

//             {open && !disabled && (
//                 <>
//                     <div
//                         onClick={() => setOpen(false)}
//                         style={{
//                             position: "fixed",
//                             inset: 0,
//                             zIndex: 999,
//                         }}
//                     />
//                     <div
//                         style={{
//                             position: "absolute",
//                             top: "calc(100% + 5px)",
//                             left: 0,
//                             right: 0,
//                             minWidth: 160,
//                             maxHeight: 230,
//                             overflowY: "auto",
//                             padding: 5,
//                             background: "#FFFFFF",
//                             border: "1px solid #E2E8F0",
//                             borderRadius: 9,
//                             boxShadow: "0 12px 28px rgba(15,23,42,.14)",
//                             zIndex: 1000,
//                         }}
//                     >
//                         <label
//                             style={{
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: 8,
//                                 padding: "7px 8px",
//                                 borderRadius: 7,
//                                 cursor: "pointer",
//                                 fontSize: 12,
//                                 fontWeight: 600,
//                                 color: "#334155",
//                             }}
//                         >
//                             <input
//                                 type="checkbox"
//                                 checked={selected.includes("All")}
//                                 onChange={() => toggleValue("All")}
//                             />
//                             All
//                         </label>

//                         {options
//                             .filter(
//                                 (option) =>
//                                     String(optionValue(option)) !== "All"
//                             )
//                             .map((option) => {
//                                 const itemValue = optionValue(option);
//                                 const checked = selected.some(
//                                     (item) =>
//                                         String(item) === String(itemValue)
//                                 );

//                                 return (
//                                     <label
//                                         key={itemValue}
//                                         style={{
//                                             display: "flex",
//                                             alignItems: "center",
//                                             gap: 8,
//                                             padding: "7px 8px",
//                                             borderRadius: 7,
//                                             cursor: "pointer",
//                                             fontSize: 12,
//                                             color: "#334155",
//                                             background: checked
//                                                 ? "#EEF2FF"
//                                                 : "transparent",
//                                         }}
//                                     >
//                                         <input
//                                             type="checkbox"
//                                             checked={checked}
//                                             onChange={() =>
//                                                 toggleValue(itemValue)
//                                             }
//                                         />
//                                         <span
//                                             style={{
//                                                 overflow: "hidden",
//                                                 textOverflow: "ellipsis",
//                                                 whiteSpace: "nowrap",
//                                             }}
//                                         >
//                                             {optionLabel(option)}
//                                         </span>
//                                     </label>
//                                 );
//                             })}
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

// function FilterField({ label, children }) {
//     return (
//         <div
//             style={{
//                 minWidth: 0,
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: 4,
//             }}
//         >
//             <span
//                 style={{
//                     fontSize: 11,
//                     color: "#1E3A8A",
//                     fontWeight: 700,
//                     lineHeight: 1.2,
//                 }}
//             >
//                 {label}
//             </span>
//             {children}
//         </div>
//     );
// }

// /* =========================================================
//    NORMALIZE OPEX FILTER OPTIONS
//    Uses the live getOpexFilterOptions API response.
// ========================================================= */

// const normalizeOpexFilterOptions = (response) => {
//     const source = response?.data ?? response ?? {};

//     return {
//         legalGroups: source.legal_groups ?? source.legalGroups ?? [],
//         legalEntities: source.legal_entities ?? source.legalEntities ?? [],
//         parentDivisions: source.parent_divisions ?? source.parentDivisions ?? [],
//         subdivisions: source.subdivisions ?? [],
//         years: source.years ?? source.fiscal_years ?? source.fiscalYears ?? [],
//         periods: source.periods ?? [],
//         currencies: source.currencies ?? source.reporting_currencies ?? source.reportingCurrencies ?? [],
//     };
// };

// /* =========================================================
//    MAIN COMPONENT
// ========================================================= */

// export default function ExpenseCategoryDrillDown({
//     data = [],
//     totalData = null,
//     dataAsOf = null,
//     currentMonthPartial = false,
//     onExpandCategory,
//     detailLoading = {},
//     periodName = "Sep-26",
//     reportingCurrency = "AED",

//     onViewAll,
//     onExportExcel,
//     onExportPdf,
//     filterOptions = {},
//     onFilterApply,
// }) {
//     const [expandedRows, setExpandedRows] =
//         useState({});

//     /* =======================================================
//        CATEGORY DETAIL STATE
//     ======================================================= */

//     const [categoryDetails, setCategoryDetails] =
//         useState({});

//     const [
//         categoryDetailLoading,
//         setCategoryDetailLoading,
//     ] = useState({});

//     const [
//         categoryDetailError,
//         setCategoryDetailError,
//     ] = useState({});

//     /* =======================================================
//        MENU STATE
//     ======================================================= */

//     const [menuOpen, setMenuOpen] =
//         useState(false);

//     /* =======================================================
//        TABLE FILTER STATE
//     ======================================================= */

//     const yearMatch = String(periodName || "").match(/(\d{4}|\d{2})$/);
//     const defaultYear =
//         filterOptions?.years?.length
//             ? optionValue(filterOptions.years[0])
//             : yearMatch?.[1]
//                 ? (yearMatch[1].length === 2
//                     ? `20${yearMatch[1]}`
//                     : yearMatch[1])
//                 : "2026";

//     const [tableFilters, setTableFilters] = useState(() => ({
//         legalGroupId: ["All"],
//         legalEntityId: ["All"],
//         parentDivisionId: ["All"],
//         subdivisionId: ["All"],
//         year: defaultYear,
//         periodName: periodName || "Sep-26",
//         currency: reportingCurrency || "AED",
//     }));

//     const [appliedTableFilters, setAppliedTableFilters] =
//         useState(() => ({
//             legalGroupId: ["All"],
//             legalEntityId: ["All"],
//             parentDivisionId: ["All"],
//             subdivisionId: ["All"],
//             year: defaultYear,
//             periodName: periodName || "Sep-26",
//             currency: reportingCurrency || "AED",
//         }));

//     /* =======================================================
//        FILTERED TABLE DATA

//        The category-breakdown endpoint is the source of truth
//        for the applied hierarchy/year/period/currency filters.
//        This local state prevents Apply from only changing the
//        dropdown state while the table continues showing the
//        previously loaded parent data.
//     ======================================================= */

//     const [filteredTableData, setFilteredTableData] =
//         useState(null);

//     const [tableFilterLoading, setTableFilterLoading] =
//         useState(false);

//     const [tableFilterError, setTableFilterError] =
//         useState("");

//     /* =======================================================
//        LIVE OPEX FILTER OPTIONS
//     ======================================================= */

//     const [opexFilterOptions, setOpexFilterOptions] =
//         useState({});

//     useEffect(() => {
//         let cancelled = false;

//         const loadOpexFilterOptions = async () => {
//             try {
//                 const response = await getOpexFilterOptions();
//                 const normalized = normalizeOpexFilterOptions(response);

//                 if (!cancelled) {
//                     setOpexFilterOptions(normalized);
//                 }
//             } catch (error) {
//                 console.error(
//                     "Failed to load OPEX filter options:",
//                     error
//                 );
//             }
//         };

//         loadOpexFilterOptions();

//         return () => {
//             cancelled = true;
//         };
//     }, []);

//     const fallbackOptions = useMemo(() => ({
//         legalGroups: uniqueOptionsFromRows(data, [
//             "legal_group_id",
//             "legalGroupId",
//             "legal_group",
//             "legalGroup",
//         ]),
//         legalEntities: uniqueOptionsFromRows(data, [
//             "legal_entity_id",
//             "legalEntityId",
//             "legal_entity",
//             "legalEntity",
//         ]),
//         parentDivisions: uniqueOptionsFromRows(data, [
//             "parent_division_id",
//             "parentDivisionId",
//             "parent_division",
//             "parentDivision",
//         ]),
//         subdivisions: uniqueOptionsFromRows(data, [
//             "subdivision_id",
//             "subdivisionId",
//             "subdivision",
//             "subDivision",
//         ]),
//         years: uniqueOptionsFromRows(data, [
//             "year",
//             "fiscal_year",
//             "fiscalYear",
//         ]),
//         periods: uniqueOptionsFromRows(data, [
//             "period_name",
//             "periodName",
//             "period",
//         ]),
//         currencies: uniqueOptionsFromRows(data, [
//             "currency",
//             "reporting_currency",
//             "reportingCurrency",
//         ]),
//     }), [data]);

//     const filterOptionsResolved = useMemo(() => ({
//         legalGroups: opexFilterOptions.legalGroups?.length
//             ? opexFilterOptions.legalGroups
//             : filterOptions?.legalGroups?.length
//                 ? filterOptions.legalGroups
//                 : fallbackOptions.legalGroups,
//         legalEntities: opexFilterOptions.legalEntities?.length
//             ? opexFilterOptions.legalEntities
//             : filterOptions?.legalEntities?.length
//                 ? filterOptions.legalEntities
//                 : fallbackOptions.legalEntities,
//         parentDivisions: opexFilterOptions.parentDivisions?.length
//             ? opexFilterOptions.parentDivisions
//             : filterOptions?.parentDivisions?.length
//                 ? filterOptions.parentDivisions
//                 : fallbackOptions.parentDivisions,
//         subdivisions: opexFilterOptions.subdivisions?.length
//             ? opexFilterOptions.subdivisions
//             : filterOptions?.subdivisions?.length
//                 ? filterOptions.subdivisions
//                 : fallbackOptions.subdivisions,
//         years: opexFilterOptions.years?.length
//             ? opexFilterOptions.years
//             : filterOptions?.years?.length
//                 ? filterOptions.years
//                 : fallbackOptions.years,
//         periods: opexFilterOptions.periods?.length
//             ? opexFilterOptions.periods
//             : filterOptions?.periods?.length
//                 ? filterOptions.periods
//                 : fallbackOptions.periods,
//         currencies: opexFilterOptions.currencies?.length
//             ? opexFilterOptions.currencies
//             : filterOptions?.currencies?.length
//                 ? filterOptions.currencies
//                 : fallbackOptions.currencies,
//     }), [
//         opexFilterOptions,
//         filterOptions,
//         fallbackOptions,
//     ]);

//     const cascadingOptions = useMemo(() => ({
//         legalGroups: filterOptionsResolved.legalGroups || [],
//         legalEntities: cascadeOptions(
//             filterOptionsResolved.legalEntities,
//             [{
//                 selected: tableFilters.legalGroupId,
//                 keys: [
//                     "legal_group_id",
//                     "legalGroupId",
//                     "legal_group_ids",
//                     "legalGroupIds",
//                     "group_id",
//                     "groupId",
//                 ],
//             }]
//         ),
//         parentDivisions: cascadeOptions(
//             filterOptionsResolved.parentDivisions,
//             [
//                 {
//                     selected: tableFilters.legalGroupId,
//                     keys: [
//                         "legal_group_id",
//                         "legalGroupId",
//                         "legal_group_ids",
//                         "legalGroupIds",
//                         "group_id",
//                         "groupId",
//                     ],
//                 },
//                 {
//                     selected: tableFilters.legalEntityId,
//                     keys: [
//                         "legal_entity_id",
//                         "legalEntityId",
//                         "legal_entity_ids",
//                         "legalEntityIds",
//                         "entity_id",
//                         "entityId",
//                     ],
//                 },
//             ]
//         ),
//         subdivisions: cascadeOptions(
//             filterOptionsResolved.subdivisions,
//             [
//                 {
//                     selected: tableFilters.legalGroupId,
//                     keys: [
//                         "legal_group_id",
//                         "legalGroupId",
//                         "legal_group_ids",
//                         "legalGroupIds",
//                         "group_id",
//                         "groupId",
//                     ],
//                 },
//                 {
//                     selected: tableFilters.legalEntityId,
//                     keys: [
//                         "legal_entity_id",
//                         "legalEntityId",
//                         "legal_entity_ids",
//                         "legalEntityIds",
//                         "entity_id",
//                         "entityId",
//                     ],
//                 },
//                 {
//                     selected: tableFilters.parentDivisionId,
//                     keys: [
//                         "parent_division_id",
//                         "parentDivisionId",
//                         "parent_division_ids",
//                         "parentDivisionIds",
//                         "division_id",
//                         "divisionId",
//                     ],
//                 },
//             ]
//         ),
//     }), [
//         filterOptionsResolved,
//         tableFilters.legalGroupId,
//         tableFilters.legalEntityId,
//         tableFilters.parentDivisionId,
//     ]);

//     const updateTableMulti = (key, value) => {
//         setTableFilters((prev) => {
//             const next = { ...prev, [key]: value };

//             if (key === "legalGroupId") {
//                 next.legalEntityId = ["All"];
//                 next.parentDivisionId = ["All"];
//                 next.subdivisionId = ["All"];
//             } else if (key === "legalEntityId") {
//                 next.parentDivisionId = ["All"];
//                 next.subdivisionId = ["All"];
//             } else if (key === "parentDivisionId") {
//                 next.subdivisionId = ["All"];
//             }

//             return next;
//         });
//     };

//     const buildTableApiFilters = (filters) => {
//         const cleanMulti = (value) => {
//             const values = asArray(value)
//                 .filter((item) => String(item) !== "All")
//                 .map((item) => String(item))
//                 .filter(Boolean);

//             return values;
//         };

//         const legalGroups = cleanMulti(filters?.legalGroupId);
//         const legalEntities = cleanMulti(filters?.legalEntityId);
//         const parentDivisions = cleanMulti(filters?.parentDivisionId);
//         const subdivisions = cleanMulti(filters?.subdivisionId);

//         return {
//             year: filters?.year || undefined,
//             legal_group_id: legalGroups.length ? legalGroups : undefined,
//             legal_entity_id: legalEntities.length ? legalEntities : undefined,
//             parent_division_id: parentDivisions.length ? parentDivisions : undefined,
//             subdivision_id: subdivisions.length ? subdivisions : undefined,
//             period_name: filters?.periodName
//                 ? [String(filters.periodName)]
//                 : undefined,
//             reporting_currency: filters?.currency || undefined,
//         };
//     };

//     const normalizeBreakdownResponse = (response) => {
//         if (Array.isArray(response)) return response;
//         if (Array.isArray(response?.data)) return response.data;
//         if (Array.isArray(response?.items)) return response.items;
//         if (Array.isArray(response?.categories)) return response.categories;
//         if (Array.isArray(response?.results)) return response.results;
//         return [];
//     };

//     const resetTableFilters = () => {
//         const reset = {
//             legalGroupId: ["All"],
//             legalEntityId: ["All"],
//             parentDivisionId: ["All"],
//             subdivisionId: ["All"],
//             year: defaultYear,
//             periodName: periodName || "Sep-26",
//             currency: reportingCurrency || "AED",
//         };

//         setTableFilters(reset);
//         setAppliedTableFilters(reset);
//         setFilteredTableData(null);
//         setTableFilterError("");
//         onFilterApply?.(reset);
//     };

//     const applyTableFilters = async () => {
//         const applied = {
//             ...tableFilters,
//             legalGroupId: asArray(tableFilters.legalGroupId),
//             legalEntityId: asArray(tableFilters.legalEntityId),
//             parentDivisionId: asArray(tableFilters.parentDivisionId),
//             subdivisionId: asArray(tableFilters.subdivisionId),
//         };

//         setAppliedTableFilters(applied);
//         setTableFilterLoading(true);
//         setTableFilterError("");

//         try {
//             const apiFilters = buildTableApiFilters(applied);
//             const response = await getOpexCategoryBreakdown(apiFilters);
//             const rows = normalizeBreakdownResponse(response);

//             // Always replace the rows rendered by this table with the
//             // response for the newly applied filters.
//             setFilteredTableData(rows);

//             // Keep the existing parent callback contract intact.
//             onFilterApply?.(applied);
//         } catch (error) {
//             console.error(
//                 "Failed to apply Expense Category Drill-Down filters:",
//                 error
//             );
//             setFilteredTableData([]);
//             setTableFilterError(
//                 error?.response?.data?.detail ||
//                 error?.message ||
//                 "Unable to load Expense Category Drill-Down for the selected filters."
//             );
//         } finally {
//             setTableFilterLoading(false);
//         }
//     };

//     const filteredData = useMemo(() => {
//         const sourceData =
//             filteredTableData !== null
//                 ? filteredTableData
//                 : (Array.isArray(data) ? data : []);

//         return sourceData.filter((row) => {
//             const yearMatch = rowMatchesFilter(
//                 row,
//                 appliedTableFilters.year,
//                 ["year", "fiscal_year", "fiscalYear"]
//             );
//             const periodMatch = rowMatchesFilter(
//                 row,
//                 appliedTableFilters.periodName,
//                 ["period_name", "periodName", "period"]
//             );
//             const currencyMatch = rowMatchesFilter(
//                 row,
//                 appliedTableFilters.currency,
//                 ["currency", "reporting_currency", "reportingCurrency"]
//             );

//             return (
//                 rowMatchesFilter(row, appliedTableFilters.legalGroupId, [
//                     "legal_group_id",
//                     "legalGroupId",
//                     "legal_group",
//                     "legalGroup",
//                 ]) &&
//                 rowMatchesFilter(row, appliedTableFilters.legalEntityId, [
//                     "legal_entity_id",
//                     "legalEntityId",
//                     "legal_entity",
//                     "legalEntity",
//                 ]) &&
//                 rowMatchesFilter(row, appliedTableFilters.parentDivisionId, [
//                     "parent_division_id",
//                     "parentDivisionId",
//                     "parent_division",
//                     "parentDivision",
//                 ]) &&
//                 rowMatchesFilter(row, appliedTableFilters.subdivisionId, [
//                     "subdivision_id",
//                     "subdivisionId",
//                     "subdivision",
//                     "subDivision",
//                 ]) &&
//                 yearMatch &&
//                 periodMatch &&
//                 currencyMatch
//             );
//         });
//     }, [data, filteredTableData, appliedTableFilters]);

//     /* =======================================================
//        TOTAL ACTUALS
//     ======================================================= */

//     const totalActualPTD =
//         getTotalActual(
//             filteredData,
//             getActualPTD
//         );

//     const totalActualYTD =
//         getTotalActual(
//             filteredData,
//             getActualYTD
//         );

//     const totalTargetPTD =
//         getTotalActual(
//             filteredData,
//             getTargetPTD
//         );

//     const totalVariancePTD =
//         getTotalActual(
//             filteredData,
//             getVariancePTD
//         );

//     const totalTargetYTD =
//         getTotalActual(
//             filteredData,
//             getTargetYTD
//         );

//     const totalVarianceYTD =
//         getTotalActual(
//             filteredData,
//             getVarianceYTD
//         );

//     /* =======================================================
//        TOTAL VARIANCE PERCENTAGES
//        Aggregate percentage = total variance / total target.
//        Never sum individual percentages.
//     ======================================================= */

//     const getAggregateVariancePercent = (
//         totalVariance,
//         totalTarget
//     ) => {
//         if (
//             totalVariance === null ||
//             totalVariance === undefined ||
//             totalTarget === null ||
//             totalTarget === undefined
//         ) {
//             return null;
//         }

//         const variance = Number(totalVariance);
//         const target = Number(totalTarget);

//         if (
//             !Number.isFinite(variance) ||
//             !Number.isFinite(target) ||
//             target === 0
//         ) {
//             return null;
//         }

//         return (variance / target) * 100;
//     };

//     const totalVariancePTDPercent =
//         getAggregateVariancePercent(
//             totalVariancePTD,
//             totalTargetPTD
//         );

//     const totalVarianceYTDPercent =
//         getAggregateVariancePercent(
//             totalVarianceYTD,
//             totalTargetYTD
//         );

//     /* =======================================================
//        TOTAL VARIANCE STATUS
//        Prefer backend-provided total status when available.
//        If the category-breakdown response has no total-status
//        field, use the OPEX variance direction for the aggregate row.
//     ======================================================= */

//     const getAggregateVarianceStatus = (
//         explicitStatus,
//         totalVariance
//     ) => {
//         const normalized = String(explicitStatus || "")
//             .trim()
//             .toUpperCase();

//         if (
//             normalized === "FAVOURABLE" ||
//             normalized === "UNFAVOURABLE"
//         ) {
//             return normalized;
//         }

//         const variance = Number(totalVariance);

//         if (!Number.isFinite(variance)) {
//             return null;
//         }

//         if (variance < 0) return "FAVOURABLE";
//         if (variance > 0) return "UNFAVOURABLE";
//         return null;
//     };

//     const totalVariancePTDStatus =
//         getAggregateVarianceStatus(
//             totalData?.variancePTDStatus ??
//                 totalData?.variance_ptd_status,
//             totalVariancePTD
//         );

//     const totalVarianceYTDStatus =
//         getAggregateVarianceStatus(
//             totalData?.varianceYTDStatus ??
//                 totalData?.variance_ytd_status,
//             totalVarianceYTD
//         );

//     /* =======================================================
//        LOAD CATEGORY DETAIL
//     ======================================================= */

//     const loadCategoryDetails = async (
//         item
//     ) => {
//         const category =
//             item?.category ||
//             (typeof item === "string"
//                 ? item
//                 : "");

//         if (!category) {
//             return;
//         }

//         if (
//             categoryDetails[category] &&
//             Array.isArray(
//                 categoryDetails[category]
//             ) &&
//             categoryDetails[category].length > 0
//         ) {
//             return;
//         }

//         try {
//             setCategoryDetailLoading(
//                 (prev) => ({
//                     ...prev,
//                     [category]: true,
//                 })
//             );

//             setCategoryDetailError(
//                 (prev) => ({
//                     ...prev,
//                     [category]: null,
//                 })
//             );

//             /* ===================================================
//                BACKEND API
//             =================================================== */

//             const configuredBaseUrl =
//                 import.meta.env
//                     .VITE_API_BASE_URL || "";

//             let baseUrl =
//                 configuredBaseUrl.replace(
//                     /\/+$/,
//                     ""
//                 );

//             const apiUrl =
//                 baseUrl.endsWith("/api")
//                     ? `${baseUrl}/opex/category-detail`
//                     : `${baseUrl}/api/opex/category-detail`;

//             const params =
//                 new URLSearchParams({
//                     category,
//                     period_name: periodName,
//                     reporting_currency:
//                         reportingCurrency,
//                 });

//             const token =
//                 localStorage.getItem("token") ||
//                 localStorage.getItem(
//                     "finsight_token"
//                 );

//             const response =
//                 await fetch(
//                     `${apiUrl}?${params.toString()}`,
//                     {
//                         method: "GET",
//                         headers: {
//                             Accept:
//                                 "application/json",

//                             ...(token
//                                 ? {
//                                     Authorization: `Bearer ${token}`,
//                                 }
//                                 : {}),
//                         },
//                     }
//                 );

//             if (response.ok) {
//                 const responseData =
//                     await response.json();

//                 const details =
//                     normalizeCategoryDetails(
//                         responseData
//                     );

//                 /* =================================================
//                    USE BACKEND DETAILS DIRECTLY
//                 ================================================= */

//                 if (
//                     Array.isArray(details) &&
//                     details.length > 0
//                 ) {
//                     setCategoryDetails(
//                         (prev) => ({
//                             ...prev,
//                             [category]:
//                                 details,
//                         })
//                     );

//                     return;
//                 }
//             }

//             /* ===================================================
//                EXISTING PRELOADED DATA FALLBACK
//             =================================================== */

//             const preloadedDetails =
//                 item?.categoryDetails ||
//                 item?.naturalAccounts ||
//                 item?.details;

//             if (
//                 Array.isArray(preloadedDetails) &&
//                 preloadedDetails.length > 0
//             ) {
//                 setCategoryDetails(
//                     (prev) => ({
//                         ...prev,
//                         [category]:
//                             preloadedDetails,
//                     })
//                 );

//                 return;
//             }

//             /* ===================================================
//                EXISTING DERIVED DATA FALLBACK
//             =================================================== */

//             const fallbackDetails =
//                 deriveCategoryNaturalAccounts(
//                     item,
//                     category
//                 );

//             setCategoryDetails(
//                 (prev) => ({
//                     ...prev,
//                     [category]:
//                         fallbackDetails,
//                 })
//             );
//         } catch (error) {
//             /* ===================================================
//                EXISTING FALLBACK ON API ERROR
//             =================================================== */

//             const preloadedDetails =
//                 item?.categoryDetails ||
//                 item?.naturalAccounts ||
//                 item?.details;

//             if (
//                 Array.isArray(preloadedDetails) &&
//                 preloadedDetails.length > 0
//             ) {
//                 setCategoryDetails(
//                     (prev) => ({
//                         ...prev,
//                         [category]:
//                             preloadedDetails,
//                     })
//                 );

//                 return;
//             }

//             const fallbackDetails =
//                 deriveCategoryNaturalAccounts(
//                     item,
//                     category
//                 );

//             if (
//                 Array.isArray(fallbackDetails) &&
//                 fallbackDetails.length > 0
//             ) {
//                 setCategoryDetails(
//                     (prev) => ({
//                         ...prev,
//                         [category]:
//                             fallbackDetails,
//                     })
//                 );
//             } else {
//                 setCategoryDetailError(
//                     (prev) => ({
//                         ...prev,
//                         [category]:
//                             error?.message ||
//                             "Unable to load natural-account details.",
//                     })
//                 );

//                 setCategoryDetails(
//                     (prev) => ({
//                         ...prev,
//                         [category]: [],
//                     })
//                 );
//             }
//         } finally {
//             setCategoryDetailLoading(
//                 (prev) => ({
//                     ...prev,
//                     [category]: false,
//                 })
//             );
//         }
//     };

//     /* =======================================================
//        TOGGLE
//     ======================================================= */

//     const toggleRow = async (
//         item,
//         index
//     ) => {
//         const rowKey =
//             item?.category || index;

//         const willExpand =
//             !expandedRows[rowKey];

//         setExpandedRows((prev) => ({
//             ...prev,
//             [rowKey]: willExpand,
//         }));

//         if (!willExpand) {
//             return;
//         }

//         if (
//             typeof onExpandCategory ===
//             "function"
//         ) {
//             try {
//                 await onExpandCategory(item);
//             } catch (error) {
//                 /* Keep local loading independent */
//             }
//         }

//         await loadCategoryDetails(item);
//     };

//     /* =======================================================
//        MENU HANDLERS
//     ======================================================= */

//     const handleViewAllClick = () => {
//         setMenuOpen(false);

//         if (
//             typeof onViewAll ===
//             "function"
//         ) {
//             onViewAll();
//         }
//     };

//     const handleExportExcelClick = () => {
//         setMenuOpen(false);

//         if (
//             typeof onExportExcel ===
//             "function"
//         ) {
//             onExportExcel();
//         }
//     };

//     const handleExportPdfClick = () => {
//         setMenuOpen(false);

//         if (
//             typeof onExportPdf ===
//             "function"
//         ) {
//             onExportPdf();
//         }
//     };

//     /* =======================================================
//        RENDER DETAILS
//     ======================================================= */

//     const renderNaturalAccountDetails = (
//         category,
//         parentItem
//     ) => {
//         let details =
//             categoryDetails[category] ||
//             parentItem?.categoryDetails ||
//             parentItem?.naturalAccounts ||
//             parentItem?.details ||
//             [];

//         if (
//             (!details || !details.length) &&
//             parentItem
//         ) {
//             details =
//                 deriveCategoryNaturalAccounts(
//                     parentItem,
//                     category
//                 );
//         }

//         if (
//             categoryDetailLoading[category] &&
//             (!details || !details.length)
//         ) {
//             return (
//                 <div
//                     style={{
//                         padding:
//                             "16px 20px",
//                         fontSize: "0.74rem",
//                         color: "#64748B",
//                     }}
//                 >
//                     Loading natural-account details...
//                 </div>
//             );
//         }

//         if (
//             categoryDetailError[category] &&
//             (!details || !details.length)
//         ) {
//             return (
//                 <div
//                     style={{
//                         padding:
//                             "16px 20px",
//                         fontSize: "0.74rem",
//                         color: "#DC2626",
//                     }}
//                 >
//                     {
//                         categoryDetailError[
//                         category
//                         ]
//                     }
//                 </div>
//             );
//         }

//         if (!details.length) {
//             return (
//                 <div
//                     style={{
//                         padding:
//                             "16px 20px",
//                         fontSize: "0.74rem",
//                         color: "#64748B",
//                     }}
//                 >
//                     No natural-account details
//                     available.
//                 </div>
//             );
//         }

//         /* ===================================================
//            GET DETAIL VALUE
//         =================================================== */

//         const getDetailValue = (
//             account,
//             camelCaseKey,
//             snakeCaseKey,
//             aedKey = null
//         ) => {
//             const camelValue =
//                 account?.[camelCaseKey];

//             if (
//                 camelValue !== undefined &&
//                 camelValue !== null &&
//                 camelValue !== ""
//             ) {
//                 return camelValue;
//             }

//             const snakeValue =
//                 account?.[snakeCaseKey];

//             if (
//                 snakeValue !== undefined &&
//                 snakeValue !== null &&
//                 snakeValue !== ""
//             ) {
//                 return snakeValue;
//             }

//             if (aedKey) {
//                 const aedValue =
//                     account?.[aedKey];

//                 if (
//                     aedValue !== undefined &&
//                     aedValue !== null &&
//                     aedValue !== ""
//                 ) {
//                     return aedValue;
//                 }
//             }

//             return null;
//         };

//         /* ===================================================
//            FORMAT PERCENT
//         =================================================== */

//         const formatPercent = (value) => {
//             if (
//                 value === null ||
//                 value === undefined ||
//                 value === "" ||
//                 value === "-" ||
//                 value === "—"
//             ) {
//                 return "—";
//             }

//             const number = Number(value);

//             return Number.isFinite(number)
//                 ? `${number.toFixed(1)}%`
//                 : "—";
//         };

//         return (
//             <div
//                 style={{
//                     width: "100%",
//                     overflowX: "auto",
//                 }}
//             >
//                 <table
//                     style={{
//                         width: "100%",
//                         minWidth: 760,
//                         borderCollapse: "collapse",
//                         tableLayout: "fixed",
//                         fontSize: "0.74rem",
//                     }}
//                 >
//                     <colgroup>
//                         <col style={{ width: "18%" }} />
//                         <col style={{ width: "9%" }} />
//                         <col style={{ width: "9%" }} />
//                         <col style={{ width: "10%" }} />
//                         <col style={{ width: "8%" }} />
//                         <col style={{ width: "9%" }} />
//                         <col style={{ width: "9%" }} />
//                         <col style={{ width: "10%" }} />
//                         <col style={{ width: "8%" }} />
//                     </colgroup>

//                     <thead>
//                         <tr
//                             style={{
//                                 height: 38,
//                                 borderBottom:
//                                     "2px solid #E2E8F0",
//                                 background:
//                                     "#F8FAFC",
//                             }}
//                         >
//                             {[
//                                 "EXPENSE CATEGORY",
//                                 "ACTUAL PTD",
//                                 "TARGET PTD",
//                                 "VARIANCE PTD",
//                                 "VARIANCE PTD %",
//                                 "ACTUAL YTD",
//                                 "TARGET YTD",
//                                 "VARIANCE YTD",
//                                 "VARIANCE YTD %",
//                             ].map((heading, index) => (
//                                 <th
//                                     key={`${heading}-${index}`}
//                                     style={{
//                                         padding:
//                                             "5px 4px",
//                                         textAlign:
//                                             index === 0
//                                                 ? "left"
//                                                 : "right",
//                                         color:
//                                             "#1E3A8A",
//                                         fontSize:
//                                             "0.74rem",
//                                         fontWeight: 700,
//                                         whiteSpace:
//                                             "normal",
//                                         lineHeight:
//                                             "16px",
//                                         background:
//                                             "#F8FAFC",
//                                         borderBottom:
//                                             "2px solid #E2E8F0",
//                                     }}
//                                 >
//                                     {heading === "VARIANCE PTD %" ? (
//                                         <>
//                                             <span>VARIANCE PTD</span>
//                                             <br />
//                                             <span>%</span>
//                                         </>
//                                     ) : heading === "VARIANCE YTD %" ? (
//                                         <>
//                                             <span>VARIANCE YTD</span>
//                                             <br />
//                                             <span>%</span>
//                                         </>
//                                     ) : (
//                                         heading
//                                     )}
//                                 </th>
//                             ))}
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {details.map(
//                             (
//                                 account,
//                                 accountIndex
//                             ) => {
//                                 const accountCode =
//                                     getAccountCode(
//                                         account
//                                     );

//                                 const accountName =
//                                     getAccountName(
//                                         account
//                                     );

//                                 const actualPTD =
//                                     getDetailValue(
//                                         account,
//                                         "actualPTD",
//                                         "actual_ptd",
//                                         "actual_ptd_aed"
//                                     );

//                                 const targetPTD =
//                                     getDetailValue(
//                                         account,
//                                         "targetPTD",
//                                         "target_ptd"
//                                     );

//                                 const variancePTD =
//                                     getDetailValue(
//                                         account,
//                                         "variancePTD",
//                                         "variance_ptd"
//                                     );

//                                 const variancePTDPercent =
//                                     getDetailValue(
//                                         account,
//                                         "variancePTDPercent",
//                                         "variance_ptd_pct"
//                                     );

//                                 const actualYTD =
//                                     getDetailValue(
//                                         account,
//                                         "actualYTD",
//                                         "actual_ytd",
//                                         "actual_ytd_aed"
//                                     );

//                                 const targetYTD =
//                                     getDetailValue(
//                                         account,
//                                         "targetYTD",
//                                         "target_ytd"
//                                     );

//                                 const varianceYTD =
//                                     getDetailValue(
//                                         account,
//                                         "varianceYTD",
//                                         "variance_ytd"
//                                     );

//                                 const varianceYTDPercent =
//                                     getDetailValue(
//                                         account,
//                                         "varianceYTDPercent",
//                                         "variance_ytd_pct"
//                                     );

//                                 const variancePTDStatus =
//                                     getVariancePTDStatus(account);

//                                 const varianceYTDStatus =
//                                     getVarianceYTDStatus(account);

//                                 return (
//                                     <tr
//                                         key={
//                                             accountCode ||
//                                             accountIndex
//                                         }
//                                         style={{
//                                             height: 39,
//                                             borderBottom:
//                                                 "1px solid #F1F5F9",
//                                         }}
//                                     >
//                                         {/* NATURAL ACCOUNT */}

//                                         <td
//                                             style={{
//                                                 padding:
//                                                     "6px 6px",
//                                                 textAlign:
//                                                     "left",
//                                                 fontSize:
//                                                     "0.74rem",
//                                                 color:
//                                                     "#334155",
//                                                 fontWeight: 500,
//                                                 whiteSpace:
//                                                     "normal",
//                                                 wordBreak:
//                                                     "break-word",
//                                                 overflowWrap:
//                                                     "anywhere",
//                                                 lineHeight:
//                                                     "17px",
//                                                 borderBottom:
//                                                     "1px solid #F1F5F9",
//                                             }}
//                                         >
//                                             {accountCode
//                                                 ? `${accountCode} - ${String(
//                                                     accountName ||
//                                                     ""
//                                                 ).replace(
//                                                     new RegExp(
//                                                         `^${String(
//                                                             accountCode
//                                                         ).replace(
//                                                             /[.*+?^${}()|[\]\\]/g,
//                                                             "\\$&"
//                                                         )}\\s*-\\s*`,
//                                                         "i"
//                                                     ),
//                                                     ""
//                                                 )}`
//                                                 : accountName}
//                                         </td>

//                                         {/* PTD ACTUAL / TARGET / VARIANCE */}

//                                         {[
//                                             actualPTD,
//                                             targetPTD,
//                                             variancePTD,
//                                         ].map(
//                                             (
//                                                 value,
//                                                 valueIndex
//                                             ) => (
//                                                 <td
//                                                     key={
//                                                         valueIndex
//                                                     }
//                                                     style={{
//                                                         padding:
//                                                             "8px 10px",
//                                                         textAlign:
//                                                             "right",
//                                                         fontSize:
//                                                             "0.74rem",
//                                                         color:
//                                                             valueIndex === 2
//                                                                 ? getVarianceStatusColor(
//                                                                     variancePTDStatus,
//                                                                     "#64748B"
//                                                                 )
//                                                                 : getNumberColor(
//                                                                     value,
//                                                                     valueIndex === 0
//                                                                         ? "#334155"
//                                                                         : "#64748B"
//                                                                 ),
//                                                         fontWeight:
//                                                             valueIndex ===
//                                                                 2
//                                                                 ? 600
//                                                                 : 500,
//                                                         fontVariantNumeric:
//                                                             "tabular-nums",
//                                                         whiteSpace:
//                                                             "nowrap",
//                                                         borderBottom:
//                                                             "1px solid #F1F5F9",
//                                                     }}
//                                                 >
//                                                     {formatNumber(
//                                                         value
//                                                     )}
//                                                 </td>
//                                             )
//                                         )}

//                                         {/* PTD VARIANCE % */}

//                                         <td
//                                             style={{
//                                                 padding:
//                                                     "6px 6px",
//                                                 textAlign:
//                                                     "right",
//                                                 fontSize:
//                                                     "0.74rem",
//                                                 color:
//                                                     getVarianceStatusColor(
//                                                         variancePTDStatus,
//                                                         "#64748B"
//                                                     ),
//                                                 fontWeight: 600,
//                                                 fontVariantNumeric:
//                                                     "tabular-nums",
//                                                 whiteSpace:
//                                                     "nowrap",
//                                                 borderBottom:
//                                                     "1px solid #F1F5F9",
//                                             }}
//                                         >
//                                             {formatPercent(
//                                                 variancePTDPercent
//                                             )}
//                                         </td>

//                                         {/* YTD ACTUAL / TARGET / VARIANCE */}

//                                         {[
//                                             actualYTD,
//                                             targetYTD,
//                                             varianceYTD,
//                                         ].map(
//                                             (
//                                                 value,
//                                                 valueIndex
//                                             ) => (
//                                                 <td
//                                                     key={`ytd-${valueIndex}`}
//                                                     style={{
//                                                         padding:
//                                                             "8px 10px",
//                                                         textAlign:
//                                                             "right",
//                                                         fontSize:
//                                                             "0.74rem",
//                                                         color:
//                                                             valueIndex === 2
//                                                                 ? getVarianceStatusColor(
//                                                                     varianceYTDStatus,
//                                                                     "#64748B"
//                                                                 )
//                                                                 : getNumberColor(
//                                                                     value,
//                                                                     valueIndex === 0
//                                                                         ? "#334155"
//                                                                         : "#64748B"
//                                                                 ),
//                                                         fontWeight:
//                                                             valueIndex ===
//                                                                 2
//                                                                 ? 600
//                                                                 : 500,
//                                                         fontVariantNumeric:
//                                                             "tabular-nums",
//                                                         whiteSpace:
//                                                             "nowrap",
//                                                         borderBottom:
//                                                             "1px solid #F1F5F9",
//                                                     }}
//                                                 >
//                                                     {formatNumber(
//                                                         value
//                                                     )}
//                                                 </td>
//                                             )
//                                         )}

//                                         {/* YTD VARIANCE % */}

//                                         <td
//                                             style={{
//                                                 padding:
//                                                     "6px 6px",
//                                                 textAlign:
//                                                     "right",
//                                                 fontSize:
//                                                     "0.74rem",
//                                                 color:
//                                                     getVarianceStatusColor(
//                                                         varianceYTDStatus,
//                                                         "#64748B"
//                                                     ),
//                                                 fontWeight: 600,
//                                                 fontVariantNumeric:
//                                                     "tabular-nums",
//                                                 whiteSpace:
//                                                     "nowrap",
//                                                 borderBottom:
//                                                     "1px solid #F1F5F9",
//                                             }}
//                                         >
//                                             {formatPercent(
//                                                 varianceYTDPercent
//                                             )}
//                                         </td>
//                                     </tr>
//                                 );
//                             }
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         );
//     };

//     return (
//         <div
//             style={{
//                 width: "100%",
//                 background: "#FFFFFF",
//                 border: "1px solid #E5E7EB",
//                 borderRadius: 10,
//                 boxSizing: "border-box",
//                 overflow: "hidden",
//             }}
//         >
//             {/* HEADER */}

//             <div
//                 style={{
//                     minHeight: 58,
//                     display: "flex",
//                     alignItems: "flex-start",
//                     justifyContent:
//                         "space-between",
//                     gap: 12,
//                     padding: "8px 12px 7px",
//                     boxSizing:
//                         "border-box",
//                 }}
//             >
//                 <div
//                     style={{
//                         minWidth: 0,
//                         display: "flex",
//                         flexDirection: "column",
//                     }}
//                 >
//                     <h3
//                         style={{
//                             margin: 0,
//                             fontSize: 14,
//                             lineHeight: "17px",
//                             fontWeight: 700,
//                             color: "#0F172A",
//                         }}
//                     >
//                         Expense Category Drill-Down{" "}
//                         <span
//                             style={{
//                                 color: "#64748B",
//                                 marginLeft: "5px",
//                                 fontSize: 11,
//                                 fontWeight: 600,
//                             }}
//                         >
//                             (Amounts in {reportingCurrency || "AED"})
//                         </span>
//                     </h3>

//                     <div
//                         style={{
//                             marginTop: 3,
//                             fontSize: 10.5,
//                             lineHeight: "14px",
//                             fontWeight: 500,
//                             color: "#64748B",
//                         }}
//                     >
//                         Detailed PTD and YTD expense category variance analysis
//                     </div>
//                 </div>

//                 <div
//                     style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 8,
//                         position: "relative",
//                         paddingTop: 2,
//                     }}
//                 >
//                     {dataAsOf && (
//                         <span
//                             style={{
//                                 fontSize: 13,
//                                 color: "#64748B",
//                                 whiteSpace:
//                                     "nowrap",
//                             }}
//                         >
//                             Data as of{" "}
//                             <strong
//                                 style={{
//                                     color:
//                                         "#334155",
//                                     fontWeight: 600,
//                                 }}
//                             >
//                                 {formatDataAsOf(
//                                     dataAsOf
//                                 )}
//                             </strong>
//                         </span>
//                     )}

//                     {currentMonthPartial && (
//                         <span
//                             style={{
//                                 display:
//                                     "inline-flex",
//                                 alignItems:
//                                     "center",
//                                 padding:
//                                     "3px 7px",
//                                 borderRadius:
//                                     999,
//                                 background:
//                                     "#FFF7ED",
//                                 border:
//                                     "1px solid #FED7AA",
//                                 color:
//                                     "#C2410C",
//                                 fontSize: 13,
//                                 fontWeight: 600,
//                                 whiteSpace:
//                                     "nowrap",
//                             }}
//                         >
//                             Current month partial
//                         </span>
//                     )}

//                     {/* 3 DOT MENU */}

//                     <button
//                         type="button"
//                         onClick={() =>
//                             setMenuOpen(
//                                 (prev) =>
//                                     !prev
//                             )
//                         }
//                         aria-label="Expense category actions"
//                         aria-expanded={
//                             menuOpen
//                         }
//                         style={{
//                             border: "none",
//                             background:
//                                 "transparent",
//                             padding:
//                                 "2px 4px",
//                             cursor:
//                                 "pointer",
//                             color:
//                                 "#64748B",
//                             fontSize: 17,
//                             lineHeight: 1,
//                         }}
//                     >
//                         ⋮
//                     </button>

//                     {/* ACTION MENU */}

//                     {menuOpen && (
//                         <div
//                             style={{
//                                 position:
//                                     "absolute",
//                                 top: 28,
//                                 right: 0,
//                                 minWidth: 165,
//                                 background:
//                                     "#FFFFFF",
//                                 border:
//                                     "1px solid #E5E7EB",
//                                 borderRadius: 8,
//                                 boxShadow:
//                                     "0 8px 24px rgba(15, 23, 42, 0.12)",
//                                 padding:
//                                     "5px 0",
//                                 zIndex: 100,
//                             }}
//                         >
//                             {/* VIEW ALL */}

//                             <button
//                                 type="button"
//                                 onClick={
//                                     handleViewAllClick
//                                 }
//                                 style={{
//                                     width: "100%",
//                                     display:
//                                         "flex",
//                                     alignItems:
//                                         "center",
//                                     gap: 9,
//                                     border:
//                                         "none",
//                                     background:
//                                         "transparent",
//                                     padding:
//                                         "9px 12px",
//                                     cursor:
//                                         "pointer",
//                                     textAlign:
//                                         "left",
//                                     fontSize: 13,
//                                     fontWeight: 500,
//                                     color:
//                                         "#334155",
//                                 }}
//                                 onMouseEnter={(
//                                     event
//                                 ) => {
//                                     event.currentTarget.style.background =
//                                         "#F8FAFC";
//                                 }}
//                                 onMouseLeave={(
//                                     event
//                                 ) => {
//                                     event.currentTarget.style.background =
//                                         "transparent";
//                                 }}
//                             >
//                                 <span
//                                     style={{
//                                         fontSize: 14,
//                                     }}
//                                 >
//                                     🔍
//                                 </span>

//                                 <span>
//                                     View All
//                                 </span>
//                             </button>

//                             {/* EXPORT EXCEL */}

//                             <button
//                                 type="button"
//                                 onClick={
//                                     handleExportExcelClick
//                                 }
//                                 style={{
//                                     width: "100%",
//                                     display:
//                                         "flex",
//                                     alignItems:
//                                         "center",
//                                     gap: 9,
//                                     border:
//                                         "none",
//                                     background:
//                                         "transparent",
//                                     padding:
//                                         "9px 12px",
//                                     cursor:
//                                         "pointer",
//                                     textAlign:
//                                         "left",
//                                     fontSize: 13,
//                                     fontWeight: 500,
//                                     color:
//                                         "#334155",
//                                 }}
//                                 onMouseEnter={(
//                                     event
//                                 ) => {
//                                     event.currentTarget.style.background =
//                                         "#F8FAFC";
//                                 }}
//                                 onMouseLeave={(
//                                     event
//                                 ) => {
//                                     event.currentTarget.style.background =
//                                         "transparent";
//                                 }}
//                             >
//                                 <span
//                                     style={{
//                                         fontSize: 14,
//                                     }}
//                                 >
//                                     📊
//                                 </span>

//                                 <span>
//                                     Export Excel
//                                 </span>
//                             </button>

//                             {/* EXPORT PDF */}

//                             <button
//                                 type="button"
//                                 onClick={
//                                     handleExportPdfClick
//                                 }
//                                 style={{
//                                     width: "100%",
//                                     display:
//                                         "flex",
//                                     alignItems:
//                                         "center",
//                                     gap: 9,
//                                     border:
//                                         "none",
//                                     background:
//                                         "transparent",
//                                     padding:
//                                         "9px 12px",
//                                     cursor:
//                                         "pointer",
//                                     textAlign:
//                                         "left",
//                                     fontSize: 13,
//                                     fontWeight: 500,
//                                     color:
//                                         "#334155",
//                                 }}
//                                 onMouseEnter={(
//                                     event
//                                 ) => {
//                                     event.currentTarget.style.background =
//                                         "#F8FAFC";
//                                 }}
//                                 onMouseLeave={(
//                                     event
//                                 ) => {
//                                     event.currentTarget.style.background =
//                                         "transparent";
//                                 }}
//                             >
//                                 <span
//                                     style={{
//                                         fontSize: 14,
//                                     }}
//                                 >
//                                     📄
//                                 </span>

//                                 <span>
//                                     Export PDF
//                                 </span>
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* =================================================
//                 TABLE FILTER SECTION
//             ================================================= */}

//             <div
//                 style={{
//                     width: "100%",
//                     padding: "10px 12px 11px",
//                     background: "#FFFFFF",
//                     borderTop: "1px solid #F1F5F9",
//                     borderBottom: "1px solid #E2E8F0",
//                     boxSizing: "border-box",
//                 }}
//             >
//                 <div
//                     style={{
//                         display: "grid",
//                         gridTemplateColumns:
//                             "repeat(8, minmax(105px, 1fr))",
//                         gap: 9,
//                         alignItems: "end",
//                     }}
//                 >
//                     <FilterField label="Legal Group">
//                         <CompactMultiSelect
//                             options={cascadingOptions.legalGroups}
//                             value={tableFilters.legalGroupId}
//                             onChange={(value) =>
//                                 updateTableMulti("legalGroupId", value)
//                             }
//                         />
//                     </FilterField>

//                     <FilterField label="Legal Entity">
//                         <CompactMultiSelect
//                             options={cascadingOptions.legalEntities}
//                             value={tableFilters.legalEntityId}
//                             onChange={(value) =>
//                                 updateTableMulti("legalEntityId", value)
//                             }
//                         />
//                     </FilterField>

//                     <FilterField label="Parent Division">
//                         <CompactMultiSelect
//                             options={cascadingOptions.parentDivisions}
//                             value={tableFilters.parentDivisionId}
//                             onChange={(value) =>
//                                 updateTableMulti("parentDivisionId", value)
//                             }
//                         />
//                     </FilterField>

//                     <FilterField label="Sub-Division">
//                         <CompactMultiSelect
//                             options={cascadingOptions.subdivisions}
//                             value={tableFilters.subdivisionId}
//                             onChange={(value) =>
//                                 updateTableMulti("subdivisionId", value)
//                             }
//                         />
//                     </FilterField>

//                     <FilterField label="Year">
//                         <select
//                             value={tableFilters.year || ""}
//                             onChange={(event) =>
//                                 setTableFilters((prev) => ({
//                                     ...prev,
//                                     year: event.target.value,
//                                 }))
//                             }
//                             style={{
//                                 width: "100%",
//                                 height: 34,
//                                 padding: "0 9px",
//                                 border: "1px solid #E2E8F0",
//                                 borderRadius: 9,
//                                 background: "#F8FAFC",
//                                 color: "#334155",
//                                 fontSize: 12,
//                                 fontWeight: 600,
//                                 outline: "none",
//                                 boxSizing: "border-box",
//                             }}
//                         >
//                             {(filterOptionsResolved.years?.length
//                                 ? filterOptionsResolved.years
//                                 : [tableFilters.year]
//                             ).map((year) => (
//                                 <option
//                                     key={optionValue(year)}
//                                     value={optionValue(year)}
//                                 >
//                                     {optionLabel(year)}
//                                 </option>
//                             ))}
//                         </select>
//                     </FilterField>

//                     <FilterField label="Period">
//                         <select
//                             value={tableFilters.periodName || ""}
//                             onChange={(event) =>
//                                 setTableFilters((prev) => ({
//                                     ...prev,
//                                     periodName: event.target.value,
//                                 }))
//                             }
//                             style={{
//                                 width: "100%",
//                                 height: 34,
//                                 padding: "0 9px",
//                                 border: "1px solid #E2E8F0",
//                                 borderRadius: 9,
//                                 background: "#F8FAFC",
//                                 color: "#334155",
//                                 fontSize: 12,
//                                 fontWeight: 600,
//                                 outline: "none",
//                                 boxSizing: "border-box",
//                             }}
//                         >
//                             {(filterOptionsResolved.periods?.length
//                                 ? filterOptionsResolved.periods
//                                 : [tableFilters.periodName]
//                             ).map((period) => (
//                                 <option
//                                     key={optionValue(period)}
//                                     value={optionValue(period)}
//                                 >
//                                     {optionLabel(period)}
//                                 </option>
//                             ))}
//                         </select>
//                     </FilterField>

//                     <FilterField label="Reporting Currency">
//                         <select
//                             value={tableFilters.currency || "AED"}
//                             onChange={(event) =>
//                                 setTableFilters((prev) => ({
//                                     ...prev,
//                                     currency: event.target.value,
//                                 }))
//                             }
//                             style={{
//                                 width: "100%",
//                                 height: 34,
//                                 padding: "0 9px",
//                                 border: "1px solid #E2E8F0",
//                                 borderRadius: 9,
//                                 background: "#F8FAFC",
//                                 color: "#334155",
//                                 fontSize: 12,
//                                 fontWeight: 600,
//                                 outline: "none",
//                                 boxSizing: "border-box",
//                             }}
//                         >
//                             {(filterOptionsResolved.currencies?.length
//                                 ? filterOptionsResolved.currencies
//                                 : [tableFilters.currency || "AED"]
//                             ).map((currency) => (
//                                 <option
//                                     key={optionValue(currency)}
//                                     value={optionValue(currency)}
//                                 >
//                                     {optionLabel(currency)}
//                                 </option>
//                             ))}
//                         </select>
//                     </FilterField>

//                     <div
//                         style={{
//                             display: "flex",
//                             alignItems: "flex-end",
//                             gap: 7,
//                             minWidth: 0,
//                         }}
//                     >
//                         <button
//                             type="button"
//                             onClick={applyTableFilters}
//                             disabled={tableFilterLoading}
//                             style={{
//                                 height: 34,
//                                 minWidth: 76,
//                                 padding: "0 14px",
//                                 border: "none",
//                                 borderRadius: 9,
//                                 background: "#6D5CE7",
//                                 color: "#FFFFFF",
//                                 fontSize: 12,
//                                 fontWeight: 700,
//                                 cursor: tableFilterLoading ? "not-allowed" : "pointer",
//                                 opacity: tableFilterLoading ? 0.72 : 1,
//                                 boxShadow:
//                                     "0 4px 10px rgba(109,92,231,.18)",
//                             }}
//                         >
//                             {tableFilterLoading ? "Applying..." : "Apply"}
//                         </button>

//                         <button
//                             type="button"
//                             onClick={resetTableFilters}
//                             style={{
//                                 height: 34,
//                                 minWidth: 68,
//                                 padding: "0 13px",
//                                 border: "1px solid #E2E8F0",
//                                 borderRadius: 9,
//                                 background: "#FFFFFF",
//                                 color: "#475569",
//                                 fontSize: 12,
//                                 fontWeight: 700,
//                                 cursor: "pointer",
//                             }}
//                         >
//                             Reset
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {tableFilterError ? (
//                 <div
//                     style={{
//                         margin: "0 8px 8px",
//                         padding: "8px 10px",
//                         borderRadius: 8,
//                         border: "1px solid #FECACA",
//                         background: "#FEF2F2",
//                         color: "#B91C1C",
//                         fontSize: 11,
//                         fontWeight: 600,
//                     }}
//                 >
//                     {tableFilterError}
//                 </div>
//             ) : null}

//             {/* =================================================
//                 MAIN EXPENSE CATEGORY TABLE
//             ================================================= */}

//             <div
//                 style={{
//                     width: "100%",
//                     overflowX: "auto",
//                     padding:
//                         "0 8px 10px",
//                     boxSizing:
//                         "border-box",
//                 }}
//             >
//                 <table
//                     style={{
//                         width: "100%",
//                         minWidth: 760,
//                         borderCollapse:
//                             "collapse",
//                         tableLayout: "fixed",
//                         fontSize: "0.70rem",
//                     }}
//                 >
//                     <colgroup>
//                         <col style={{ width: "18%" }} />
//                         <col style={{ width: "9%" }} />
//                         <col style={{ width: "9%" }} />
//                         <col style={{ width: "10%" }} />
//                         <col style={{ width: "8%" }} />
//                         <col style={{ width: "9%" }} />
//                         <col style={{ width: "9%" }} />
//                         <col style={{ width: "10%" }} />
//                         <col style={{ width: "8%" }} />
//                     </colgroup>

//                     <thead>
//                         <tr
//                             style={{
//                                 height: 38,
//                                 background:
//                                     "#F8FAFC",
//                                 borderBottom:
//                                     "2px solid #E2E8F0",
//                             }}
//                         >
//                             <th
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "left",
//                                     color:
//                                         "#1E3A8A",
//                                     fontSize:
//                                         "0.74rem",
//                                     fontWeight: 700,
//                                     whiteSpace:
//                                         "normal",
//                                     lineHeight:
//                                         "16px",
//                                     background:
//                                         "#F8FAFC",
//                                     borderBottom:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 EXPENSE CATEGORY
//                             </th>

//                             <th
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     color:
//                                         "#1E3A8A",
//                                     fontSize:
//                                         "0.68rem",
//                                     fontWeight: 700,
//                                     whiteSpace:
//                                         "normal",
//                                     lineHeight:
//                                         "16px",
//                                     background:
//                                         "#F8FAFC",
//                                     borderBottom:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 ACTUAL PTD
//                             </th>

//                             <th
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     color:
//                                         "#1E3A8A",
//                                     fontSize:
//                                         "0.68rem",
//                                     fontWeight: 700,
//                                     whiteSpace:
//                                         "normal",
//                                     lineHeight:
//                                         "16px",
//                                     background:
//                                         "#F8FAFC",
//                                     borderBottom:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 TARGET PTD
//                             </th>

//                             <th
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     color:
//                                         "#1E3A8A",
//                                     fontSize:
//                                         "0.68rem",
//                                     fontWeight: 700,
//                                     whiteSpace:
//                                         "normal",
//                                     lineHeight:
//                                         "16px",
//                                     background:
//                                         "#F8FAFC",
//                                     borderBottom:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 VARIANCE PTD
//                             </th>

//                             <th
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     color:
//                                         "#1E3A8A",
//                                     fontSize:
//                                         "0.68rem",
//                                     fontWeight: 700,
//                                     whiteSpace:
//                                         "normal",
//                                     lineHeight:
//                                         "16px",
//                                     background:
//                                         "#F8FAFC",
//                                     borderBottom:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 VARIANCE <br />PTD%
//                             </th>

//                             <th
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     color:
//                                         "#1E3A8A",
//                                     fontSize:
//                                         "0.68rem",
//                                     fontWeight: 700,
//                                     whiteSpace:
//                                         "normal",
//                                     lineHeight:
//                                         "16px",
//                                     background:
//                                         "#F8FAFC",
//                                     borderBottom:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 ACTUAL YTD
//                             </th>

//                             <th
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     color:
//                                         "#1E3A8A",
//                                     fontSize:
//                                         "0.68rem",
//                                     fontWeight: 700,
//                                     whiteSpace:
//                                         "normal",
//                                     lineHeight:
//                                         "16px",
//                                     background:
//                                         "#F8FAFC",
//                                     borderBottom:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 TARGET YTD
//                             </th>

//                             <th
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     color:
//                                         "#1E3A8A",
//                                     fontSize:
//                                         "0.68rem",
//                                     fontWeight: 700,
//                                     whiteSpace:
//                                         "normal",
//                                     lineHeight:
//                                         "16px",
//                                     background:
//                                         "#F8FAFC",
//                                     borderBottom:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 VARIANCE YTD
//                             </th>

//                             <th
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     color:
//                                         "#1E3A8A",
//                                     fontSize:
//                                         "0.68rem",
//                                     fontWeight: 700,
//                                     whiteSpace:
//                                         "normal",
//                                     lineHeight:
//                                         "16px",
//                                     background:
//                                         "#F8FAFC",
//                                     borderBottom:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 VARIANCE<br /> YTD%
//                             </th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {filteredData.map(
//                             (
//                                 item,
//                                 index
//                             ) => {
//                                 const rowKey =
//                                     item?.category ||
//                                     index;

//                                 const isExpanded =
//                                     !!expandedRows[
//                                     rowKey
//                                     ];

//                                 const actualPTD =
//                                     item?.actualPTD ??
//                                     item?.actual_ptd;

//                                 const targetPTD =
//                                     item?.targetPTD ??
//                                     item?.target_ptd;

//                                 const variancePTD =
//                                     item?.variancePTD ??
//                                     item?.variance_ptd;

//                                 const variancePTDPercent =
//                                     item?.variancePTDPercent ??
//                                     item?.variance_ptd_pct;

//                                 const actualYTD =
//                                     item?.actualYTD ??
//                                     item?.actual_ytd;

//                                 const targetYTD =
//                                     item?.targetYTD ??
//                                     item?.target_ytd;

//                                 const varianceYTD =
//                                     item?.varianceYTD ??
//                                     item?.variance_ytd;

//                                 const varianceYTDPercent =
//                                     item?.varianceYTDPercent ??
//                                     item?.variance_ytd_pct;

//                                 const variancePTDStatus =
//                                     getVariancePTDStatus(item);

//                                 const varianceYTDStatus =
//                                     getVarianceYTDStatus(item);

//                                 return (
//                                     <React.Fragment
//                                         key={
//                                             rowKey
//                                         }
//                                     >
//                                         {/* MAIN CATEGORY ROW */}

//                                         <tr
//                                             style={{
//                                                 height: 39,
//                                                 borderBottom:
//                                                     "1px solid #F1F5F9",
//                                             }}
//                                         >
//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "7px 6px",
//                                                     textAlign:
//                                                         "left",
//                                                     borderBottom:
//                                                         "1px solid #F1F5F9",
//                                                 }}
//                                             >
//                                                 <div
//                                                     style={{
//                                                         display:
//                                                             "flex",
//                                                         alignItems:
//                                                             "center",
//                                                         gap: 7,
//                                                     }}
//                                                 >
//                                                     <button
//                                                         type="button"
//                                                         onClick={() =>
//                                                             toggleRow(
//                                                                 item,
//                                                                 index
//                                                             )
//                                                         }
//                                                         style={{
//                                                             width: 12,
//                                                             height: 12,
//                                                             padding: 0,
//                                                             border:
//                                                                 "none",
//                                                             background:
//                                                                 "transparent",
//                                                             cursor:
//                                                                 "pointer",
//                                                             color:
//                                                                 "#000000",
//                                                             display:
//                                                                 "flex",
//                                                             alignItems:
//                                                                 "center",
//                                                             justifyContent:
//                                                                 "center",
//                                                             fontSize: 11,
//                                                             lineHeight: 1,
//                                                         }}
//                                                     >
//                                                         {isExpanded
//                                                             ? "▼"
//                                                             : "▶"}
//                                                     </button>

//                                                     <span
//                                                         style={{
//                                                             fontSize:
//                                                                 "0.74rem",
//                                                             fontWeight: 700,
//                                                             color:
//                                                                 "#334155",
//                                                             whiteSpace:
//                                                                 "nowrap",
//                                                             textTransform:
//                                                                 "uppercase",
//                                                         }}
//                                                     >
//                                                         {item?.category ||
//                                                             "—"}
//                                                     </span>
//                                                 </div>
//                                             </td>

//                                             {/* PTD ACTUAL */}

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "7px 6px",
//                                                     textAlign:
//                                                         "right",
//                                                     fontSize:
//                                                         "0.74rem",
//                                                     color:
//                                                         getNumberColor(
//                                                             actualPTD,
//                                                             "#334155"
//                                                         ),
//                                                     fontWeight: 500,
//                                                     fontVariantNumeric:
//                                                         "tabular-nums",
//                                                     whiteSpace:
//                                                         "nowrap",
//                                                     borderBottom:
//                                                         "1px solid #F1F5F9",
//                                                 }}
//                                             >
//                                                 {formatNumber(
//                                                     actualPTD
//                                                 )}
//                                             </td>

//                                             {/* PTD TARGET */}

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "7px 6px",
//                                                     textAlign:
//                                                         "right",
//                                                     fontSize:
//                                                         "0.74rem",
//                                                     color:
//                                                         getNumberColor(
//                                                             targetPTD,
//                                                             "#64748B"
//                                                         ),
//                                                     fontWeight: 500,
//                                                     fontVariantNumeric:
//                                                         "tabular-nums",
//                                                     whiteSpace:
//                                                         "nowrap",
//                                                     borderBottom:
//                                                         "1px solid #F1F5F9",
//                                                 }}
//                                             >
//                                                 {formatNumber(
//                                                     targetPTD
//                                                 )}
//                                             </td>

//                                             {/* PTD VARIANCE */}

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "7px 6px",
//                                                     textAlign:
//                                                         "right",
//                                                     fontSize:
//                                                         "0.74rem",
//                                                     color:
//                                                         getVarianceStatusColor(
//                                                             variancePTDStatus,
//                                                             "#64748B"
//                                                         ),
//                                                     fontWeight: 600,
//                                                     fontVariantNumeric:
//                                                         "tabular-nums",
//                                                     whiteSpace:
//                                                         "nowrap",
//                                                     borderBottom:
//                                                         "1px solid #F1F5F9",
//                                                 }}
//                                             >
//                                                 {formatNumber(
//                                                     variancePTD
//                                                 )}
//                                             </td>

//                                             {/* PTD VARIANCE % */}

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "7px 6px",
//                                                     textAlign:
//                                                         "right",
//                                                     fontSize:
//                                                         "0.74rem",
//                                                     color:
//                                                         getVarianceStatusColor(
//                                                             variancePTDStatus,
//                                                             "#64748B"
//                                                         ),
//                                                     fontWeight: 600,
//                                                     fontVariantNumeric:
//                                                         "tabular-nums",
//                                                     whiteSpace:
//                                                         "nowrap",
//                                                     borderBottom:
//                                                         "1px solid #F1F5F9",
//                                                 }}
//                                             >
//                                                 {variancePTDPercent !==
//                                                     null &&
//                                                     variancePTDPercent !==
//                                                     undefined &&
//                                                     variancePTDPercent !==
//                                                     ""
//                                                     ? `${Number(
//                                                         variancePTDPercent
//                                                     ).toFixed(
//                                                         1
//                                                     )}%`
//                                                     : "—"}
//                                             </td>

//                                             {/* YTD ACTUAL */}

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "7px 6px",
//                                                     textAlign:
//                                                         "right",
//                                                     fontSize:
//                                                         "0.74rem",
//                                                     color:
//                                                         getNumberColor(
//                                                             actualYTD,
//                                                             "#334155"
//                                                         ),
//                                                     fontWeight: 500,
//                                                     fontVariantNumeric:
//                                                         "tabular-nums",
//                                                     whiteSpace:
//                                                         "nowrap",
//                                                     borderBottom:
//                                                         "1px solid #F1F5F9",
//                                                 }}
//                                             >
//                                                 {formatNumber(
//                                                     actualYTD
//                                                 )}
//                                             </td>

//                                             {/* YTD TARGET */}

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "7px 6px",
//                                                     textAlign:
//                                                         "right",
//                                                     fontSize:
//                                                         "0.74rem",
//                                                     color:
//                                                         getNumberColor(
//                                                             targetYTD,
//                                                             "#64748B"
//                                                         ),
//                                                     fontWeight: 500,
//                                                     fontVariantNumeric:
//                                                         "tabular-nums",
//                                                     whiteSpace:
//                                                         "nowrap",
//                                                     borderBottom:
//                                                         "1px solid #F1F5F9",
//                                                 }}
//                                             >
//                                                 {formatNumber(
//                                                     targetYTD
//                                                 )}
//                                             </td>

//                                             {/* YTD VARIANCE */}

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "7px 6px",
//                                                     textAlign:
//                                                         "right",
//                                                     fontSize:
//                                                         "0.74rem",
//                                                     color:
//                                                         getVarianceStatusColor(
//                                                             varianceYTDStatus,
//                                                             "#64748B"
//                                                         ),
//                                                     fontWeight: 600,
//                                                     fontVariantNumeric:
//                                                         "tabular-nums",
//                                                     whiteSpace:
//                                                         "nowrap",
//                                                     borderBottom:
//                                                         "1px solid #F1F5F9",
//                                                 }}
//                                             >
//                                                 {formatNumber(
//                                                     varianceYTD
//                                                 )}
//                                             </td>

//                                             {/* YTD VARIANCE % */}

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "7px 6px",
//                                                     textAlign:
//                                                         "right",
//                                                     fontSize:
//                                                         "0.74rem",
//                                                     color:
//                                                         getVarianceStatusColor(
//                                                             varianceYTDStatus,
//                                                             "#64748B"
//                                                         ),
//                                                     fontWeight: 600,
//                                                     fontVariantNumeric:
//                                                         "tabular-nums",
//                                                     whiteSpace:
//                                                         "nowrap",
//                                                     borderBottom:
//                                                         "1px solid #F1F5F9",
//                                                 }}
//                                             >
//                                                 {varianceYTDPercent !==
//                                                     null &&
//                                                     varianceYTDPercent !==
//                                                     undefined &&
//                                                     varianceYTDPercent !==
//                                                     ""
//                                                     ? `${Number(
//                                                         varianceYTDPercent
//                                                     ).toFixed(
//                                                         1
//                                                     )}%`
//                                                     : "—"}
//                                             </td>
//                                         </tr>

//                                         {/* EXPANDED ROW */}

//                                         {isExpanded && (
//                                             <tr>
//                                                 <td
//                                                     colSpan={9}
//                                                     style={{
//                                                         background:
//                                                             "#FFFFFF",
//                                                         padding:
//                                                             "10px 0",
//                                                         borderBottom:
//                                                             "1px solid #E5E7EB",
//                                                     }}
//                                                 >
//                                                     <div
//                                                         style={{
//                                                             width: "100%",
//                                                         }}
//                                                     >
//                                                         <div
//                                                             style={{
//                                                                 marginBottom: 8,
//                                                                 display:
//                                                                     "flex",
//                                                                 alignItems:
//                                                                     "center",
//                                                             }}
//                                                         >
//                                                             <div
//                                                                 style={{
//                                                                     fontSize:
//                                                                         "0.74rem",
//                                                                     fontWeight: 600,
//                                                                     color:
//                                                                         "#334155",
//                                                                 }}
//                                                             >
//                                                                 Natural-account
//                                                                 details
//                                                                 for{" "}
//                                                                 <strong
//                                                                     style={{
//                                                                         color:
//                                                                             "#0F172A",
//                                                                         fontWeight: 700,
//                                                                     }}
//                                                                 >
//                                                                     {item?.category ||
//                                                                         "—"}
//                                                                 </strong>
//                                                             </div>
//                                                         </div>

//                                                         {renderNaturalAccountDetails(
//                                                             item?.category,
//                                                             item
//                                                         )}
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </React.Fragment>
//                                 );
//                             }
//                         )}

//                         {/* =================================================
//                             TOTAL
//                         ================================================= */}

//                         <tr
//                             style={{
//                                 height: 43,
//                                 background:
//                                     "#F8FAFC",
//                             }}
//                         >
//                             <td
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "left",
//                                     fontSize:
//                                         "0.74rem",
//                                     fontWeight: 800,
//                                     color:
//                                         "#1E3A8A",
//                                     borderTop:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 <span
//                                     style={{
//                                         paddingLeft: 21,
//                                     }}
//                                 >
//                                     Total Operating
//                                     Expenses
//                                 </span>
//                             </td>

//                             {/* TOTAL PTD ACTUAL */}

//                             <td
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     fontSize:
//                                         "0.74rem",
//                                     fontWeight: 800,
//                                     color:
//                                         getNumberColor(
//                                             totalActualPTD,
//                                             "#1E3A8A"
//                                         ),
//                                     fontVariantNumeric:
//                                         "tabular-nums",
//                                     borderTop:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 {formatNumber(
//                                     totalActualPTD
//                                 )}
//                             </td>

//                             {/* TARGET PTD */}

//                             <td
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     fontSize:
//                                         "0.74rem",
//                                     fontWeight: 800,
//                                     color:
//                                         "#64748B",
//                                     fontVariantNumeric:
//                                         "tabular-nums",
//                                     borderTop:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 {formatNumber(
//                                     totalTargetPTD
//                                 )}
//                             </td>

//                             {/* VARIANCE PTD */}

//                             <td
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     fontSize:
//                                         "0.74rem",
//                                     fontWeight: 800,
//                                     color:
//                                         getVarianceStatusColor(
//                                             totalVariancePTDStatus,
//                                             "#64748B"
//                                         ),
//                                     fontVariantNumeric:
//                                         "tabular-nums",
//                                     borderTop:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 {formatNumber(
//                                     totalVariancePTD
//                                 )}
//                             </td>

//                             {/* VARIANCE PTD % */}

//                             <td
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     fontSize:
//                                         "0.74rem",
//                                     fontWeight: 800,
//                                     color:
//                                         getVarianceStatusColor(
//                                             totalVariancePTDStatus,
//                                             "#64748B"
//                                         ),
//                                     borderTop:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 {totalVariancePTDPercent !==
//                                     null &&
//                                     totalVariancePTDPercent !==
//                                     undefined
//                                     ? `${Number(
//                                         totalVariancePTDPercent
//                                     ).toFixed(1)}%`
//                                     : "—"}
//                             </td>

//                             {/* TOTAL YTD ACTUAL */}

//                             <td
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     fontSize:
//                                         "0.74rem",
//                                     fontWeight: 800,
//                                     color:
//                                         getNumberColor(
//                                             totalActualYTD,
//                                             "#1E3A8A"
//                                         ),
//                                     fontVariantNumeric:
//                                         "tabular-nums",
//                                     borderTop:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 {formatNumber(
//                                     totalActualYTD
//                                 )}
//                             </td>

//                             {/* TARGET YTD */}

//                             <td
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     fontSize:
//                                         "0.74rem",
//                                     fontWeight: 800,
//                                     color:
//                                         "#64748B",
//                                     fontVariantNumeric:
//                                         "tabular-nums",
//                                     borderTop:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 {formatNumber(
//                                     totalTargetYTD
//                                 )}
//                             </td>

//                             {/* VARIANCE YTD */}

//                             <td
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     fontSize:
//                                         "0.74rem",
//                                     fontWeight: 800,
//                                     color:
//                                         getVarianceStatusColor(
//                                             totalVarianceYTDStatus,
//                                             "#64748B"
//                                         ),
//                                     fontVariantNumeric:
//                                         "tabular-nums",
//                                     borderTop:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 {formatNumber(
//                                     totalVarianceYTD
//                                 )}
//                             </td>

//                             {/* VARIANCE YTD % */}

//                             <td
//                                 style={{
//                                     padding:
//                                         "6px 5px",
//                                     textAlign:
//                                         "right",
//                                     fontSize:
//                                         "0.74rem",
//                                     fontWeight: 800,
//                                     color:
//                                         "#64748B",
//                                     borderTop:
//                                         "2px solid #E2E8F0",
//                                 }}
//                             >
//                                 {totalVarianceYTDPercent !==
//                                     null &&
//                                     totalVarianceYTDPercent !==
//                                     undefined
//                                     ? `${Number(
//                                         totalVarianceYTDPercent
//                                     ).toFixed(1)}%`
//                                     : "—"}
//                             </td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }




import React, { useEffect, useMemo, useState } from "react";
import { deriveCategoryNaturalAccounts } from "../../data/opexNaturalAccounts";
import {
    getOpexFilterOptions,
    getOpexCategoryBreakdown,
} from "../../api/opexApi";

/* =========================================================
   MONTHS
========================================================= */

const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

/* =========================================================
   FORMAT NUMBER
   No decimal points
========================================================= */

const formatNumber = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const number = Number(
        typeof value === "string"
            ? value.replace(/,/g, "")
            : value
    );

    if (!Number.isFinite(number)) {
        return "—";
    }

    return number.toLocaleString("en-US", {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    });
};

/* =========================================================
   GET NUMBER COLOR
   Negative values = RED
========================================================= */

const getNumberColor = (
    value,
    defaultColor = "#334155"
) => {
    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "-" ||
        value === "—"
    ) {
        return defaultColor;
    }

    const number = Number(
        typeof value === "string"
            ? value.replace(/,/g, "")
            : value
    );

    if (
        Number.isFinite(number) &&
        number < 0
    ) {
        return "#DC2626";
    }

    return defaultColor;
};

/* =========================================================
   FORMAT MONTH VALUE
   AED → AED Millions
========================================================= */

const formatMonthValue = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const number = Number(
        typeof value === "string"
            ? value.replace(/,/g, "")
            : value
    );

    if (!Number.isFinite(number)) {
        return "—";
    }

    const millions = number / 1_000_000;

    return `AED ${millions.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}M`;
};

/* =========================================================
   FORMAT DATA AS OF
========================================================= */

const formatDataAsOf = (value) => {
    if (!value) {
        return "—";
    }

    const valueString = String(value);

    const dateOnlyMatch = valueString.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (dateOnlyMatch) {
        const [, year, month, day] =
            dateOnlyMatch;

        const date = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return valueString;
    }

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

/* =========================================================
   GET MONTH VALUE
========================================================= */

const getMonthValue = (
    monthData,
    month
) => {
    if (!monthData) {
        return null;
    }

    if (Array.isArray(monthData)) {
        const monthItem =
            monthData.find(
                (item) =>
                    item?.month === month ||
                    item?.month_name === month ||
                    item?.monthName === month
            );

        return (
            monthItem?.value ??
            monthItem?.actual ??
            monthItem?.monthly_actual ??
            null
        );
    }

    return (
        monthData?.[month] ??
        monthData?.[month.toLowerCase()] ??
        null
    );
};

/* =========================================================
   GET DETAILS
========================================================= */

const getDetails = (item) => {
    if (!item) {
        return [];
    }

    if (Array.isArray(item.categoryDetails)) {
        return item.categoryDetails;
    }

    if (Array.isArray(item.naturalAccounts)) {
        return item.naturalAccounts;
    }

    if (Array.isArray(item.details)) {
        return item.details;
    }

    return [];
};

/* =========================================================
   NORMALIZE CATEGORY DETAIL API RESPONSE
========================================================= */

const normalizeCategoryDetails = (
    response
) => {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.details)) {
        return response.details;
    }

    if (
        Array.isArray(
            response?.categoryDetails
        )
    ) {
        return response.categoryDetails;
    }

    if (
        Array.isArray(
            response?.naturalAccounts
        )
    ) {
        return response.naturalAccounts;
    }

    return [];
};

/* =========================================================
   GET ACCOUNT NAME
========================================================= */

const getAccountName = (account) => {
    return (
        account?.account_name ??
        account?.accountName ??
        account?.natural_account_name ??
        account?.naturalAccountName ??
        account?.account ??
        account?.name ??
        "—"
    );
};

/* =========================================================
   GET ACCOUNT CODE
========================================================= */

const getAccountCode = (account) => {
    return (
        account?.account_code ??
        account?.accountCode ??
        account?.natural_account_code ??
        account?.naturalAccountCode ??
        account?.natural_account_id ??
        null
    );
};

/* =========================================================
   GET ACTUAL PTD
========================================================= */

const getActualPTD = (item) => {
    return (
        item?.actualPTD ??
        item?.actual_ptd ??
        item?.actual_ptd_aed ??
        null
    );
};

/* =========================================================
   GET ACTUAL YTD
========================================================= */

const getActualYTD = (item) => {
    return (
        item?.actualYTD ??
        item?.actual_ytd ??
        item?.actual_ytd_aed ??
        null
    );
};

/* =========================================================
   GET TARGET / VARIANCE VALUES
========================================================= */

const getTargetPTD = (item) => {
    return (
        item?.targetPTD ??
        item?.target_ptd ??
        null
    );
};

const getVariancePTD = (item) => {
    return (
        item?.variancePTD ??
        item?.variance_ptd ??
        null
    );
};

const getTargetYTD = (item) => {
    return (
        item?.targetYTD ??
        item?.target_ytd ??
        null
    );
};

const getVarianceYTD = (item) => {
    return (
        item?.varianceYTD ??
        item?.variance_ytd ??
        null
    );
};

/* =========================================================
   GET VARIANCE STATUS
   OPEX API status is the source of truth for variance colour.
========================================================= */

const getVariancePTDStatus = (item) => {
    return (
        item?.variancePTDStatus ??
        item?.variance_ptd_status ??
        null
    );
};

const getVarianceYTDStatus = (item) => {
    return (
        item?.varianceYTDStatus ??
        item?.variance_ytd_status ??
        null
    );
};

const getVarianceStatusColor = (status, defaultColor = "#64748B") => {
    const normalized = String(status || "").trim().toUpperCase();

    if (normalized === "FAVOURABLE") {
        return "#16A34A";
    }

    if (normalized === "UNFAVOURABLE") {
        return "#DC2626";
    }

    return defaultColor;
};

/* =========================================================
   CALCULATE TOTAL VALUE
========================================================= */

const getTotalActual = (
    data,
    getter
) => {
    if (
        !Array.isArray(data) ||
        !data.length
    ) {
        return null;
    }

    let total = 0;
    let hasValue = false;

    data.forEach((item) => {
        const value = getter(item);

        if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            value !== "-" &&
            value !== "—"
        ) {
            const number = Number(value);

            if (Number.isFinite(number)) {
                total += number;
                hasValue = true;
            }
        }
    });

    return hasValue ? total : null;
};


/* =========================================================
   FILTER HELPERS
   - Multi-select values are kept as arrays.
   - Legal Group → Legal Entity → Parent Division →
     Sub-Division cascade is applied locally.
   - Optional onFilterApply lets the parent/backend refresh
     data without changing existing behaviour when omitted.
========================================================= */

const asArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined || value === "") {
        return [];
    }
    return [value];
};

const optionValue = (option) => {
    if (option === null || option === undefined) return "";
    if (typeof option !== "object") return String(option);

    return String(
        option.value ??
        option.id ??
        option.code ??
        option.key ??
        option.legal_group_id ??
        option.legal_entity_id ??
        option.parent_division_id ??
        option.subdivision_id ??
        option.year ??
        option.period_name ??
        option.currency ??
        ""
    );
};

const optionLabel = (option) => {
    if (option === null || option === undefined) return "";
    if (typeof option !== "object") return String(option);

    return String(
        option.label ??
        option.name ??
        option.title ??
        option.display_name ??
        option.legal_group_name ??
        option.legal_entity_name ??
        option.parent_division_name ??
        option.subdivision_name ??
        option.year ??
        option.period_name ??
        option.currency ??
        option.value ??
        option.id ??
        ""
    );
};

const getRelationValues = (option, keys) => {
    for (const key of keys) {
        const value = option?.[key];
        if (value !== undefined && value !== null && value !== "") {
            return asArray(value).map((item) => String(optionValue(item)));
        }
    }
    return [];
};

const matchesSelected = (option, selected, relationKeys) => {
    const values = asArray(selected)
        .filter((value) => String(value) !== "All")
        .map((value) => String(value));

    if (!values.length) return true;

    const relationValues = getRelationValues(option, relationKeys);

    // If the option does not expose a relation, do not hide it.
    // This keeps the filter backward-compatible with older option payloads.
    if (!relationValues.length) return true;

    return values.some((value) =>
        relationValues.includes(value)
    );
};

const cascadeOptions = (
    options,
    relations = []
) => {
    const list = Array.isArray(options) ? options : [];

    return list.filter((option) =>
        relations.every(({ selected, keys }) =>
            matchesSelected(option, selected, keys)
        )
    );
};

const uniqueOptionsFromRows = (rows, keys) => {
    const map = new Map();

    (Array.isArray(rows) ? rows : []).forEach((row) => {
        let raw = null;
        for (const key of keys) {
            if (
                row?.[key] !== undefined &&
                row?.[key] !== null &&
                row?.[key] !== ""
            ) {
                raw = row[key];
                break;
            }
        }

        asArray(raw).forEach((item) => {
            const value = optionValue(item);
            const label = optionLabel(item);
            if (value && !map.has(value)) {
                map.set(value, {
                    value,
                    label: label || value,
                });
            }
        });
    });

    return Array.from(map.values());
};

const getRowFilterValue = (row, keys) => {
    for (const key of keys) {
        const value = row?.[key];
        if (value !== undefined && value !== null && value !== "") {
            return asArray(value).map((item) =>
                String(optionValue(item))
            );
        }
    }
    return [];
};

const rowMatchesFilter = (row, selected, keys) => {
    const values = asArray(selected)
        .filter((value) => String(value) !== "All")
        .map((value) => String(value));

    if (!values.length) return true;

    const rowValues = getRowFilterValue(row, keys);
    if (!rowValues.length) return true;

    return values.some((value) => rowValues.includes(value));
};

function CompactMultiSelect({
    options = [],
    value = ["All"],
    onChange,
    disabled = false,
    searchPlaceholder = "Search...",
}) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const selected = asArray(value).length
        ? asArray(value)
        : ["All"];

    // "All" is kept internally for the existing filter/API behaviour,
    // but it is intentionally NOT rendered as a dropdown option.
    const availableOptions = options.filter(
        (option) => String(optionValue(option)) !== "All"
    );

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filteredOptions = normalizedSearch
        ? availableOptions.filter((option) =>
            optionLabel(option)
                .toLowerCase()
                .includes(normalizedSearch)
        )
        : availableOptions;

    const displayValue =
        selected.includes("All") || selected.length === 0
            ? "All"
            : selected.length === 1
                ? (() => {
                    const match = options.find(
                        (option) =>
                            String(optionValue(option)) ===
                            String(selected[0])
                    );
                    return optionLabel(match) || selected[0];
                })()
                : `${selected.length} Selected`;

    const closeDropdown = () => {
        setOpen(false);
        setSearchTerm("");
    };

    const toggleDropdown = () => {
        if (disabled) return;

        setOpen((prev) => {
            const next = !prev;
            if (!next) {
                setSearchTerm("");
            }
            return next;
        });
    };

    const toggleValue = (nextValue) => {
        const valueString = String(nextValue);

        const current = selected.filter(
            (item) => String(item) !== "All"
        );

        const exists = current.some(
            (item) => String(item) === valueString
        );

        const next = exists
            ? current.filter(
                (item) => String(item) !== valueString
            )
            : [...current, nextValue];

        // Keep the existing internal "All" state when nothing is selected.
        // The "All" option itself is never shown in the dropdown.
        onChange?.(next.length ? next : ["All"]);
    };

    const selectAll = () => {
        const allValues = availableOptions
            .map((option) => optionValue(option))
            .filter((item) => String(item) !== "");

        onChange?.(allValues.length ? allValues : ["All"]);
        setSearchTerm("");
    };

    const clearSelection = () => {
        // Empty selection is represented internally as "All" so the
        // existing cascade/API logic remains unchanged.
        onChange?.(["All"]);
        setSearchTerm("");
    };

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
            }}
        >
            <button
                type="button"
                disabled={disabled}
                onClick={toggleDropdown}
                style={{
                    width: "100%",
                    height: 34,
                    padding: "0 10px",
                    border: "1px solid #E2E8F0",
                    borderRadius: 9,
                    background: disabled ? "#F1F5F9" : "#F8FAFC",
                    color: "#334155",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    cursor: disabled ? "not-allowed" : "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: "left",
                    boxSizing: "border-box",
                }}
            >
                <span
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {displayValue}
                </span>
                <span
                    style={{
                        fontSize: 12,
                        color: "#334155",
                        transform: open ? "rotate(180deg)" : "none",
                        transition: "transform 140ms ease",
                    }}
                >
                    ⌄
                </span>
            </button>

            {open && !disabled && (
                <>
                    <div
                        onClick={closeDropdown}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 999,
                        }}
                    />

                    <div
                        style={{
                            position: "absolute",
                            top: "calc(100% + 5px)",
                            left: 0,
                            width: 188,
                            minWidth: 188,
                            padding: 6,
                            background: "#FFFFFF",
                            border: "1px solid #E2E8F0",
                            borderRadius: 9,
                            boxShadow: "0 12px 28px rgba(15,23,42,.14)",
                            zIndex: 1000,
                            boxSizing: "border-box",
                        }}
                    >
                        {/* SEARCH */}
                        <div
                            style={{
                                position: "relative",
                                width: "100%",
                                height: 30,
                                marginBottom: 5,
                            }}
                        >
                            <span
                                style={{
                                    position: "absolute",
                                    left: 8,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: 14,
                                    lineHeight: 1,
                                    color: "#475569",
                                    pointerEvents: "none",
                                    zIndex: 1,
                                }}
                            >
                                🔍
                            </span>

                            <input
                                type="text"
                                value={searchTerm}
                                autoFocus
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder={searchPlaceholder}
                                onClick={(event) =>
                                    event.stopPropagation()
                                }
                                style={{
                                    width: "100%",
                                    height: 30,
                                    padding: "0 8px 0 27px",
                                    border: "1px solid #A5B4FC",
                                    borderRadius: 7,
                                    background: "#FFFFFF",
                                    color: "#334155",
                                    fontSize: 11.5,
                                    fontWeight: 500,
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        {/* SELECT ALL / CLEAR */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "2px 3px 5px",
                                borderBottom: "1px solid #F1F5F9",
                            }}
                        >
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    selectAll();
                                }}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    color: "#4F46E5",
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                }}
                            >
                                Select All
                            </button>

                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    clearSelection();
                                }}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    color: "#64748B",
                                    fontSize: 10.5,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                Clear
                            </button>
                        </div>

                        {/* OPTIONS */}
                        <div
                            style={{
                                maxHeight: 230,
                                overflowY: "auto",
                                paddingTop: 3,
                                paddingRight: 1,
                                scrollbarWidth: "thin",
                                scrollbarColor: "#CBD5E1 transparent",
                            }}
                        >
                            {filteredOptions.length ? (
                                filteredOptions.map((option) => {
                                    const itemValue = optionValue(option);
                                    const checked = selected.some(
                                        (item) =>
                                            String(item) ===
                                            String(itemValue)
                                    );

                                    return (
                                        <label
                                            key={itemValue}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                                minHeight: 24,
                                                padding: "2px 6px",
                                                borderRadius: 6,
                                                cursor: "pointer",
                                                fontSize: 11.5,
                                                color: "#334155",
                                                background: checked
                                                    ? "#EEF2FF"
                                                    : "transparent",
                                                boxSizing: "border-box",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    toggleValue(itemValue)
                                                }
                                                style={{
                                                    width: 14,
                                                    height: 14,
                                                    margin: 0,
                                                    accentColor: "#4F46E5",
                                                    flex: "0 0 auto",
                                                }}
                                            />
                                            <span
                                                style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    minWidth: 0,
                                                }}
                                            >
                                                {optionLabel(option)}
                                            </span>
                                        </label>
                                    );
                                })
                            ) : (
                                <div
                                    style={{
                                        padding: "10px 7px",
                                        color: "#94A3B8",
                                        fontSize: 11,
                                        textAlign: "center",
                                    }}
                                >
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function FilterField({ label, children }) {
    return (
        <div
            style={{
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 4,
            }}
        >
            <span
                style={{
                    fontSize: 11,
                    color: "#1E3A8A",
                    fontWeight: 700,
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
   NORMALIZE OPEX FILTER OPTIONS
   Uses the live getOpexFilterOptions API response.
========================================================= */

const normalizeOpexFilterOptions = (response) => {
    const source = response?.data ?? response ?? {};

    return {
        legalGroups: source.legal_groups ?? source.legalGroups ?? [],
        legalEntities: source.legal_entities ?? source.legalEntities ?? [],
        parentDivisions: source.parent_divisions ?? source.parentDivisions ?? [],
        subdivisions: source.subdivisions ?? [],
        years: source.years ?? source.fiscal_years ?? source.fiscalYears ?? [],
        periods: source.periods ?? [],
        currencies: source.currencies ?? source.reporting_currencies ?? source.reportingCurrencies ?? [],
    };
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ExpenseCategoryDrillDown({
    data = [],
    totalData = null,
    dataAsOf = null,
    currentMonthPartial = false,
    onExpandCategory,
    detailLoading = {},
    periodName = "Sep-26",
    reportingCurrency = "AED",

    onViewAll,
    onExportExcel,
    onExportPdf,
    filterOptions = {},
    onFilterApply,
}) {
    const [expandedRows, setExpandedRows] =
        useState({});

    /* =======================================================
       CATEGORY DETAIL STATE
    ======================================================= */

    const [categoryDetails, setCategoryDetails] =
        useState({});

    const [
        categoryDetailLoading,
        setCategoryDetailLoading,
    ] = useState({});

    const [
        categoryDetailError,
        setCategoryDetailError,
    ] = useState({});

    /* =======================================================
       MENU STATE
    ======================================================= */

    const [menuOpen, setMenuOpen] =
        useState(false);

    /* =======================================================
       TABLE FILTER STATE
    ======================================================= */

    const yearMatch = String(periodName || "").match(/(\d{4}|\d{2})$/);
    const defaultYear =
        filterOptions?.years?.length
            ? optionValue(filterOptions.years[0])
            : yearMatch?.[1]
                ? (yearMatch[1].length === 2
                    ? `20${yearMatch[1]}`
                    : yearMatch[1])
                : "2026";

    const [tableFilters, setTableFilters] = useState(() => ({
        legalGroupId: ["All"],
        legalEntityId: ["All"],
        parentDivisionId: ["All"],
        subdivisionId: ["All"],
        year: defaultYear,
        periodName: periodName || "Sep-26",
        currency: reportingCurrency || "AED",
    }));

    const [appliedTableFilters, setAppliedTableFilters] =
        useState(() => ({
            legalGroupId: ["All"],
            legalEntityId: ["All"],
            parentDivisionId: ["All"],
            subdivisionId: ["All"],
            year: defaultYear,
            periodName: periodName || "Sep-26",
            currency: reportingCurrency || "AED",
        }));

    /* =======================================================
       FILTERED TABLE DATA

       The category-breakdown endpoint is the source of truth
       for the applied hierarchy/year/period/currency filters.
       This local state prevents Apply from only changing the
       dropdown state while the table continues showing the
       previously loaded parent data.
    ======================================================= */

    const [filteredTableData, setFilteredTableData] =
        useState(null);

    const [tableFilterLoading, setTableFilterLoading] =
        useState(false);

    const [tableFilterError, setTableFilterError] =
        useState("");

    /* =======================================================
       LIVE OPEX FILTER OPTIONS
    ======================================================= */

    const [opexFilterOptions, setOpexFilterOptions] =
        useState({});

    useEffect(() => {
        let cancelled = false;

        const loadOpexFilterOptions = async () => {
            try {
                const response = await getOpexFilterOptions();
                const normalized = normalizeOpexFilterOptions(response);

                if (!cancelled) {
                    setOpexFilterOptions(normalized);
                }
            } catch (error) {
                console.error(
                    "Failed to load OPEX filter options:",
                    error
                );
            }
        };

        loadOpexFilterOptions();

        return () => {
            cancelled = true;
        };
    }, []);

    const fallbackOptions = useMemo(() => ({
        legalGroups: uniqueOptionsFromRows(data, [
            "legal_group_id",
            "legalGroupId",
            "legal_group",
            "legalGroup",
        ]),
        legalEntities: uniqueOptionsFromRows(data, [
            "legal_entity_id",
            "legalEntityId",
            "legal_entity",
            "legalEntity",
        ]),
        parentDivisions: uniqueOptionsFromRows(data, [
            "parent_division_id",
            "parentDivisionId",
            "parent_division",
            "parentDivision",
        ]),
        subdivisions: uniqueOptionsFromRows(data, [
            "subdivision_id",
            "subdivisionId",
            "subdivision",
            "subDivision",
        ]),
        years: uniqueOptionsFromRows(data, [
            "year",
            "fiscal_year",
            "fiscalYear",
        ]),
        periods: uniqueOptionsFromRows(data, [
            "period_name",
            "periodName",
            "period",
        ]),
        currencies: uniqueOptionsFromRows(data, [
            "currency",
            "reporting_currency",
            "reportingCurrency",
        ]),
    }), [data]);

    const filterOptionsResolved = useMemo(() => ({
        legalGroups: opexFilterOptions.legalGroups?.length
            ? opexFilterOptions.legalGroups
            : filterOptions?.legalGroups?.length
                ? filterOptions.legalGroups
                : fallbackOptions.legalGroups,
        legalEntities: opexFilterOptions.legalEntities?.length
            ? opexFilterOptions.legalEntities
            : filterOptions?.legalEntities?.length
                ? filterOptions.legalEntities
                : fallbackOptions.legalEntities,
        parentDivisions: opexFilterOptions.parentDivisions?.length
            ? opexFilterOptions.parentDivisions
            : filterOptions?.parentDivisions?.length
                ? filterOptions.parentDivisions
                : fallbackOptions.parentDivisions,
        subdivisions: opexFilterOptions.subdivisions?.length
            ? opexFilterOptions.subdivisions
            : filterOptions?.subdivisions?.length
                ? filterOptions.subdivisions
                : fallbackOptions.subdivisions,
        years: opexFilterOptions.years?.length
            ? opexFilterOptions.years
            : filterOptions?.years?.length
                ? filterOptions.years
                : fallbackOptions.years,
        periods: opexFilterOptions.periods?.length
            ? opexFilterOptions.periods
            : filterOptions?.periods?.length
                ? filterOptions.periods
                : fallbackOptions.periods,
        currencies: opexFilterOptions.currencies?.length
            ? opexFilterOptions.currencies
            : filterOptions?.currencies?.length
                ? filterOptions.currencies
                : fallbackOptions.currencies,
    }), [
        opexFilterOptions,
        filterOptions,
        fallbackOptions,
    ]);

    const cascadingOptions = useMemo(() => ({
        legalGroups: filterOptionsResolved.legalGroups || [],
        legalEntities: cascadeOptions(
            filterOptionsResolved.legalEntities,
            [{
                selected: tableFilters.legalGroupId,
                keys: [
                    "legal_group_id",
                    "legalGroupId",
                    "legal_group_ids",
                    "legalGroupIds",
                    "group_id",
                    "groupId",
                ],
            }]
        ),
        parentDivisions: cascadeOptions(
            filterOptionsResolved.parentDivisions,
            [
                {
                    selected: tableFilters.legalGroupId,
                    keys: [
                        "legal_group_id",
                        "legalGroupId",
                        "legal_group_ids",
                        "legalGroupIds",
                        "group_id",
                        "groupId",
                    ],
                },
                {
                    selected: tableFilters.legalEntityId,
                    keys: [
                        "legal_entity_id",
                        "legalEntityId",
                        "legal_entity_ids",
                        "legalEntityIds",
                        "entity_id",
                        "entityId",
                    ],
                },
            ]
        ),
        subdivisions: cascadeOptions(
            filterOptionsResolved.subdivisions,
            [
                {
                    selected: tableFilters.legalGroupId,
                    keys: [
                        "legal_group_id",
                        "legalGroupId",
                        "legal_group_ids",
                        "legalGroupIds",
                        "group_id",
                        "groupId",
                    ],
                },
                {
                    selected: tableFilters.legalEntityId,
                    keys: [
                        "legal_entity_id",
                        "legalEntityId",
                        "legal_entity_ids",
                        "legalEntityIds",
                        "entity_id",
                        "entityId",
                    ],
                },
                {
                    selected: tableFilters.parentDivisionId,
                    keys: [
                        "parent_division_id",
                        "parentDivisionId",
                        "parent_division_ids",
                        "parentDivisionIds",
                        "division_id",
                        "divisionId",
                    ],
                },
            ]
        ),
    }), [
        filterOptionsResolved,
        tableFilters.legalGroupId,
        tableFilters.legalEntityId,
        tableFilters.parentDivisionId,
    ]);

    const updateTableMulti = (key, value) => {
        setTableFilters((prev) => {
            const next = { ...prev, [key]: value };

            if (key === "legalGroupId") {
                next.legalEntityId = ["All"];
                next.parentDivisionId = ["All"];
                next.subdivisionId = ["All"];
            } else if (key === "legalEntityId") {
                next.parentDivisionId = ["All"];
                next.subdivisionId = ["All"];
            } else if (key === "parentDivisionId") {
                next.subdivisionId = ["All"];
            }

            return next;
        });
    };

    const buildTableApiFilters = (filters) => {
        const cleanMulti = (value) => {
            const values = asArray(value)
                .filter((item) => String(item) !== "All")
                .map((item) => String(item))
                .filter(Boolean);

            return values;
        };

        const legalGroups = cleanMulti(filters?.legalGroupId);
        const legalEntities = cleanMulti(filters?.legalEntityId);
        const parentDivisions = cleanMulti(filters?.parentDivisionId);
        const subdivisions = cleanMulti(filters?.subdivisionId);

        return {
            year: filters?.year || undefined,
            legal_group_id: legalGroups.length ? legalGroups : undefined,
            legal_entity_id: legalEntities.length ? legalEntities : undefined,
            parent_division_id: parentDivisions.length ? parentDivisions : undefined,
            subdivision_id: subdivisions.length ? subdivisions : undefined,
            period_name: filters?.periodName
                ? [String(filters.periodName)]
                : undefined,
            reporting_currency: filters?.currency || undefined,
        };
    };

    const normalizeBreakdownResponse = (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.items)) return response.items;
        if (Array.isArray(response?.categories)) return response.categories;
        if (Array.isArray(response?.results)) return response.results;
        return [];
    };

    const resetTableFilters = () => {
        const reset = {
            legalGroupId: ["All"],
            legalEntityId: ["All"],
            parentDivisionId: ["All"],
            subdivisionId: ["All"],
            year: defaultYear,
            periodName: periodName || "Sep-26",
            currency: reportingCurrency || "AED",
        };

        setTableFilters(reset);
        setAppliedTableFilters(reset);
        setFilteredTableData(null);
        setTableFilterError("");
        onFilterApply?.(reset);
    };

    const applyTableFilters = async () => {
        const applied = {
            ...tableFilters,
            legalGroupId: asArray(tableFilters.legalGroupId),
            legalEntityId: asArray(tableFilters.legalEntityId),
            parentDivisionId: asArray(tableFilters.parentDivisionId),
            subdivisionId: asArray(tableFilters.subdivisionId),
        };

        setAppliedTableFilters(applied);
        setTableFilterLoading(true);
        setTableFilterError("");

        try {
            const apiFilters = buildTableApiFilters(applied);
            const response = await getOpexCategoryBreakdown(apiFilters);
            const rows = normalizeBreakdownResponse(response);

            // Always replace the rows rendered by this table with the
            // response for the newly applied filters.
            setFilteredTableData(rows);

            // Keep the existing parent callback contract intact.
            onFilterApply?.(applied);
        } catch (error) {
            console.error(
                "Failed to apply Expense Category Drill-Down filters:",
                error
            );
            setFilteredTableData([]);
            setTableFilterError(
                error?.response?.data?.detail ||
                error?.message ||
                "Unable to load Expense Category Drill-Down for the selected filters."
            );
        } finally {
            setTableFilterLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        const sourceData =
            filteredTableData !== null
                ? filteredTableData
                : (Array.isArray(data) ? data : []);

        return sourceData.filter((row) => {
            const yearMatch = rowMatchesFilter(
                row,
                appliedTableFilters.year,
                ["year", "fiscal_year", "fiscalYear"]
            );
            const periodMatch = rowMatchesFilter(
                row,
                appliedTableFilters.periodName,
                ["period_name", "periodName", "period"]
            );
            const currencyMatch = rowMatchesFilter(
                row,
                appliedTableFilters.currency,
                ["currency", "reporting_currency", "reportingCurrency"]
            );

            return (
                rowMatchesFilter(row, appliedTableFilters.legalGroupId, [
                    "legal_group_id",
                    "legalGroupId",
                    "legal_group",
                    "legalGroup",
                ]) &&
                rowMatchesFilter(row, appliedTableFilters.legalEntityId, [
                    "legal_entity_id",
                    "legalEntityId",
                    "legal_entity",
                    "legalEntity",
                ]) &&
                rowMatchesFilter(row, appliedTableFilters.parentDivisionId, [
                    "parent_division_id",
                    "parentDivisionId",
                    "parent_division",
                    "parentDivision",
                ]) &&
                rowMatchesFilter(row, appliedTableFilters.subdivisionId, [
                    "subdivision_id",
                    "subdivisionId",
                    "subdivision",
                    "subDivision",
                ]) &&
                yearMatch &&
                periodMatch &&
                currencyMatch
            );
        });
    }, [data, filteredTableData, appliedTableFilters]);

    /* =======================================================
       TOTAL ACTUALS
    ======================================================= */

    const totalActualPTD =
        getTotalActual(
            filteredData,
            getActualPTD
        );

    const totalActualYTD =
        getTotalActual(
            filteredData,
            getActualYTD
        );

    const totalTargetPTD =
        getTotalActual(
            filteredData,
            getTargetPTD
        );

    const totalVariancePTD =
        getTotalActual(
            filteredData,
            getVariancePTD
        );

    const totalTargetYTD =
        getTotalActual(
            filteredData,
            getTargetYTD
        );

    const totalVarianceYTD =
        getTotalActual(
            filteredData,
            getVarianceYTD
        );

    /* =======================================================
       TOTAL VARIANCE PERCENTAGES
       Aggregate percentage = total variance / total target.
       Never sum individual percentages.
    ======================================================= */

    const getAggregateVariancePercent = (
        totalVariance,
        totalTarget
    ) => {
        if (
            totalVariance === null ||
            totalVariance === undefined ||
            totalTarget === null ||
            totalTarget === undefined
        ) {
            return null;
        }

        const variance = Number(totalVariance);
        const target = Number(totalTarget);

        if (
            !Number.isFinite(variance) ||
            !Number.isFinite(target) ||
            target === 0
        ) {
            return null;
        }

        return (variance / target) * 100;
    };

    const totalVariancePTDPercent =
        getAggregateVariancePercent(
            totalVariancePTD,
            totalTargetPTD
        );

    const totalVarianceYTDPercent =
        getAggregateVariancePercent(
            totalVarianceYTD,
            totalTargetYTD
        );

    /* =======================================================
       TOTAL VARIANCE STATUS
       Prefer backend-provided total status when available.
       If the category-breakdown response has no total-status
       field, use the OPEX variance direction for the aggregate row.
    ======================================================= */

    const getAggregateVarianceStatus = (
        explicitStatus,
        totalVariance
    ) => {
        const normalized = String(explicitStatus || "")
            .trim()
            .toUpperCase();

        if (
            normalized === "FAVOURABLE" ||
            normalized === "UNFAVOURABLE"
        ) {
            return normalized;
        }

        const variance = Number(totalVariance);

        if (!Number.isFinite(variance)) {
            return null;
        }

        if (variance < 0) return "FAVOURABLE";
        if (variance > 0) return "UNFAVOURABLE";
        return null;
    };

    const totalVariancePTDStatus =
        getAggregateVarianceStatus(
            totalData?.variancePTDStatus ??
                totalData?.variance_ptd_status,
            totalVariancePTD
        );

    const totalVarianceYTDStatus =
        getAggregateVarianceStatus(
            totalData?.varianceYTDStatus ??
                totalData?.variance_ytd_status,
            totalVarianceYTD
        );

    /* =======================================================
       LOAD CATEGORY DETAIL
    ======================================================= */

    const loadCategoryDetails = async (
        item
    ) => {
        const category =
            item?.category ||
            (typeof item === "string"
                ? item
                : "");

        if (!category) {
            return;
        }

        if (
            categoryDetails[category] &&
            Array.isArray(
                categoryDetails[category]
            ) &&
            categoryDetails[category].length > 0
        ) {
            return;
        }

        try {
            setCategoryDetailLoading(
                (prev) => ({
                    ...prev,
                    [category]: true,
                })
            );

            setCategoryDetailError(
                (prev) => ({
                    ...prev,
                    [category]: null,
                })
            );

            /* ===================================================
               BACKEND API
            =================================================== */

            const configuredBaseUrl =
                import.meta.env
                    .VITE_API_BASE_URL || "";

            let baseUrl =
                configuredBaseUrl.replace(
                    /\/+$/,
                    ""
                );

            const apiUrl =
                baseUrl.endsWith("/api")
                    ? `${baseUrl}/opex/category-detail`
                    : `${baseUrl}/api/opex/category-detail`;

            const params =
                new URLSearchParams({
                    category,
                    period_name: periodName,
                    reporting_currency:
                        reportingCurrency,
                });

            const token =
                localStorage.getItem("token") ||
                localStorage.getItem(
                    "finsight_token"
                );

            const response =
                await fetch(
                    `${apiUrl}?${params.toString()}`,
                    {
                        method: "GET",
                        headers: {
                            Accept:
                                "application/json",

                            ...(token
                                ? {
                                    Authorization: `Bearer ${token}`,
                                }
                                : {}),
                        },
                    }
                );

            if (response.ok) {
                const responseData =
                    await response.json();

                const details =
                    normalizeCategoryDetails(
                        responseData
                    );

                /* =================================================
                   USE BACKEND DETAILS DIRECTLY
                ================================================= */

                if (
                    Array.isArray(details) &&
                    details.length > 0
                ) {
                    setCategoryDetails(
                        (prev) => ({
                            ...prev,
                            [category]:
                                details,
                        })
                    );

                    return;
                }
            }

            /* ===================================================
               EXISTING PRELOADED DATA FALLBACK
            =================================================== */

            const preloadedDetails =
                item?.categoryDetails ||
                item?.naturalAccounts ||
                item?.details;

            if (
                Array.isArray(preloadedDetails) &&
                preloadedDetails.length > 0
            ) {
                setCategoryDetails(
                    (prev) => ({
                        ...prev,
                        [category]:
                            preloadedDetails,
                    })
                );

                return;
            }

            /* ===================================================
               EXISTING DERIVED DATA FALLBACK
            =================================================== */

            const fallbackDetails =
                deriveCategoryNaturalAccounts(
                    item,
                    category
                );

            setCategoryDetails(
                (prev) => ({
                    ...prev,
                    [category]:
                        fallbackDetails,
                })
            );
        } catch (error) {
            /* ===================================================
               EXISTING FALLBACK ON API ERROR
            =================================================== */

            const preloadedDetails =
                item?.categoryDetails ||
                item?.naturalAccounts ||
                item?.details;

            if (
                Array.isArray(preloadedDetails) &&
                preloadedDetails.length > 0
            ) {
                setCategoryDetails(
                    (prev) => ({
                        ...prev,
                        [category]:
                            preloadedDetails,
                    })
                );

                return;
            }

            const fallbackDetails =
                deriveCategoryNaturalAccounts(
                    item,
                    category
                );

            if (
                Array.isArray(fallbackDetails) &&
                fallbackDetails.length > 0
            ) {
                setCategoryDetails(
                    (prev) => ({
                        ...prev,
                        [category]:
                            fallbackDetails,
                    })
                );
            } else {
                setCategoryDetailError(
                    (prev) => ({
                        ...prev,
                        [category]:
                            error?.message ||
                            "Unable to load natural-account details.",
                    })
                );

                setCategoryDetails(
                    (prev) => ({
                        ...prev,
                        [category]: [],
                    })
                );
            }
        } finally {
            setCategoryDetailLoading(
                (prev) => ({
                    ...prev,
                    [category]: false,
                })
            );
        }
    };

    /* =======================================================
       TOGGLE
    ======================================================= */

    const toggleRow = async (
        item,
        index
    ) => {
        const rowKey =
            item?.category || index;

        const willExpand =
            !expandedRows[rowKey];

        setExpandedRows((prev) => ({
            ...prev,
            [rowKey]: willExpand,
        }));

        if (!willExpand) {
            return;
        }

        if (
            typeof onExpandCategory ===
            "function"
        ) {
            try {
                await onExpandCategory(item);
            } catch (error) {
                /* Keep local loading independent */
            }
        }

        await loadCategoryDetails(item);
    };

    /* =======================================================
       MENU HANDLERS
    ======================================================= */

    const handleViewAllClick = () => {
        setMenuOpen(false);

        if (
            typeof onViewAll ===
            "function"
        ) {
            onViewAll();
        }
    };

    const handleExportExcelClick = () => {
        setMenuOpen(false);

        if (
            typeof onExportExcel ===
            "function"
        ) {
            onExportExcel();
        }
    };

    const handleExportPdfClick = () => {
        setMenuOpen(false);

        if (
            typeof onExportPdf ===
            "function"
        ) {
            onExportPdf();
        }
    };

    /* =======================================================
       RENDER DETAILS
    ======================================================= */

    const renderNaturalAccountDetails = (
        category,
        parentItem
    ) => {
        let details =
            categoryDetails[category] ||
            parentItem?.categoryDetails ||
            parentItem?.naturalAccounts ||
            parentItem?.details ||
            [];

        if (
            (!details || !details.length) &&
            parentItem
        ) {
            details =
                deriveCategoryNaturalAccounts(
                    parentItem,
                    category
                );
        }

        if (
            categoryDetailLoading[category] &&
            (!details || !details.length)
        ) {
            return (
                <div
                    style={{
                        padding:
                            "16px 20px",
                        fontSize: "0.74rem",
                        color: "#64748B",
                    }}
                >
                    Loading natural-account details...
                </div>
            );
        }

        if (
            categoryDetailError[category] &&
            (!details || !details.length)
        ) {
            return (
                <div
                    style={{
                        padding:
                            "16px 20px",
                        fontSize: "0.74rem",
                        color: "#DC2626",
                    }}
                >
                    {
                        categoryDetailError[
                        category
                        ]
                    }
                </div>
            );
        }

        if (!details.length) {
            return (
                <div
                    style={{
                        padding:
                            "16px 20px",
                        fontSize: "0.74rem",
                        color: "#64748B",
                    }}
                >
                    No natural-account details
                    available.
                </div>
            );
        }

        /* ===================================================
           GET DETAIL VALUE
        =================================================== */

        const getDetailValue = (
            account,
            camelCaseKey,
            snakeCaseKey,
            aedKey = null
        ) => {
            const camelValue =
                account?.[camelCaseKey];

            if (
                camelValue !== undefined &&
                camelValue !== null &&
                camelValue !== ""
            ) {
                return camelValue;
            }

            const snakeValue =
                account?.[snakeCaseKey];

            if (
                snakeValue !== undefined &&
                snakeValue !== null &&
                snakeValue !== ""
            ) {
                return snakeValue;
            }

            if (aedKey) {
                const aedValue =
                    account?.[aedKey];

                if (
                    aedValue !== undefined &&
                    aedValue !== null &&
                    aedValue !== ""
                ) {
                    return aedValue;
                }
            }

            return null;
        };

        /* ===================================================
           FORMAT PERCENT
        =================================================== */

        const formatPercent = (value) => {
            if (
                value === null ||
                value === undefined ||
                value === "" ||
                value === "-" ||
                value === "—"
            ) {
                return "—";
            }

            const number = Number(value);

            return Number.isFinite(number)
                ? `${number.toFixed(1)}%`
                : "—";
        };

        return (
            <div
                style={{
                    width: "100%",
                    overflowX: "auto",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        minWidth: 760,
                        borderCollapse: "collapse",
                        tableLayout: "fixed",
                        fontSize: "0.74rem",
                    }}
                >
                    <colgroup>
                        <col style={{ width: "18%" }} />
                        <col style={{ width: "9%" }} />
                        <col style={{ width: "9%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "8%" }} />
                        <col style={{ width: "9%" }} />
                        <col style={{ width: "9%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "8%" }} />
                    </colgroup>

                    <thead>
                        <tr
                            style={{
                                height: 38,
                                borderBottom:
                                    "2px solid #E2E8F0",
                                background:
                                    "#F8FAFC",
                            }}
                        >
                            {[
                                "EXPENSE CATEGORY",
                                "ACTUAL PTD",
                                "TARGET PTD",
                                "VARIANCE PTD",
                                "VARIANCE PTD %",
                                "ACTUAL YTD",
                                "TARGET YTD",
                                "VARIANCE YTD",
                                "VARIANCE YTD %",
                            ].map((heading, index) => (
                                <th
                                    key={`${heading}-${index}`}
                                    style={{
                                        padding:
                                            "5px 4px",
                                        textAlign:
                                            index === 0
                                                ? "left"
                                                : "right",
                                        color:
                                            "#1E3A8A",
                                        fontSize:
                                            "0.74rem",
                                        fontWeight: 700,
                                        whiteSpace:
                                            "normal",
                                        lineHeight:
                                            "16px",
                                        background:
                                            "#F8FAFC",
                                        borderBottom:
                                            "2px solid #E2E8F0",
                                    }}
                                >
                                    {heading === "VARIANCE PTD %" ? (
                                        <>
                                            <span>VARIANCE PTD</span>
                                            <br />
                                            <span>%</span>
                                        </>
                                    ) : heading === "VARIANCE YTD %" ? (
                                        <>
                                            <span>VARIANCE YTD</span>
                                            <br />
                                            <span>%</span>
                                        </>
                                    ) : (
                                        heading
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {details.map(
                            (
                                account,
                                accountIndex
                            ) => {
                                const accountCode =
                                    getAccountCode(
                                        account
                                    );

                                const accountName =
                                    getAccountName(
                                        account
                                    );

                                const actualPTD =
                                    getDetailValue(
                                        account,
                                        "actualPTD",
                                        "actual_ptd",
                                        "actual_ptd_aed"
                                    );

                                const targetPTD =
                                    getDetailValue(
                                        account,
                                        "targetPTD",
                                        "target_ptd"
                                    );

                                const variancePTD =
                                    getDetailValue(
                                        account,
                                        "variancePTD",
                                        "variance_ptd"
                                    );

                                const variancePTDPercent =
                                    getDetailValue(
                                        account,
                                        "variancePTDPercent",
                                        "variance_ptd_pct"
                                    );

                                const actualYTD =
                                    getDetailValue(
                                        account,
                                        "actualYTD",
                                        "actual_ytd",
                                        "actual_ytd_aed"
                                    );

                                const targetYTD =
                                    getDetailValue(
                                        account,
                                        "targetYTD",
                                        "target_ytd"
                                    );

                                const varianceYTD =
                                    getDetailValue(
                                        account,
                                        "varianceYTD",
                                        "variance_ytd"
                                    );

                                const varianceYTDPercent =
                                    getDetailValue(
                                        account,
                                        "varianceYTDPercent",
                                        "variance_ytd_pct"
                                    );

                                const variancePTDStatus =
                                    getVariancePTDStatus(account);

                                const varianceYTDStatus =
                                    getVarianceYTDStatus(account);

                                return (
                                    <tr
                                        key={
                                            accountCode ||
                                            accountIndex
                                        }
                                        style={{
                                            height: 39,
                                            borderBottom:
                                                "1px solid #F1F5F9",
                                        }}
                                    >
                                        {/* NATURAL ACCOUNT */}

                                        <td
                                            style={{
                                                padding:
                                                    "6px 6px",
                                                textAlign:
                                                    "left",
                                                fontSize:
                                                    "0.74rem",
                                                color:
                                                    "#334155",
                                                fontWeight: 500,
                                                whiteSpace:
                                                    "normal",
                                                wordBreak:
                                                    "break-word",
                                                overflowWrap:
                                                    "anywhere",
                                                lineHeight:
                                                    "17px",
                                                borderBottom:
                                                    "1px solid #F1F5F9",
                                            }}
                                        >
                                            {accountCode
                                                ? `${accountCode} - ${String(
                                                    accountName ||
                                                    ""
                                                ).replace(
                                                    new RegExp(
                                                        `^${String(
                                                            accountCode
                                                        ).replace(
                                                            /[.*+?^${}()|[\]\\]/g,
                                                            "\\$&"
                                                        )}\\s*-\\s*`,
                                                        "i"
                                                    ),
                                                    ""
                                                )}`
                                                : accountName}
                                        </td>

                                        {/* PTD ACTUAL / TARGET / VARIANCE */}

                                        {[
                                            actualPTD,
                                            targetPTD,
                                            variancePTD,
                                        ].map(
                                            (
                                                value,
                                                valueIndex
                                            ) => (
                                                <td
                                                    key={
                                                        valueIndex
                                                    }
                                                    style={{
                                                        padding:
                                                            "8px 10px",
                                                        textAlign:
                                                            "right",
                                                        fontSize:
                                                            "0.74rem",
                                                        color:
                                                            valueIndex === 2
                                                                ? getVarianceStatusColor(
                                                                    variancePTDStatus,
                                                                    "#64748B"
                                                                )
                                                                : getNumberColor(
                                                                    value,
                                                                    valueIndex === 0
                                                                        ? "#334155"
                                                                        : "#64748B"
                                                                ),
                                                        fontWeight:
                                                            valueIndex ===
                                                                2
                                                                ? 600
                                                                : 500,
                                                        fontVariantNumeric:
                                                            "tabular-nums",
                                                        whiteSpace:
                                                            "nowrap",
                                                        borderBottom:
                                                            "1px solid #F1F5F9",
                                                    }}
                                                >
                                                    {formatNumber(
                                                        value
                                                    )}
                                                </td>
                                            )
                                        )}

                                        {/* PTD VARIANCE % */}

                                        <td
                                            style={{
                                                padding:
                                                    "6px 6px",
                                                textAlign:
                                                    "right",
                                                fontSize:
                                                    "0.74rem",
                                                color:
                                                    getVarianceStatusColor(
                                                        variancePTDStatus,
                                                        "#64748B"
                                                    ),
                                                fontWeight: 600,
                                                fontVariantNumeric:
                                                    "tabular-nums",
                                                whiteSpace:
                                                    "nowrap",
                                                borderBottom:
                                                    "1px solid #F1F5F9",
                                            }}
                                        >
                                            {formatPercent(
                                                variancePTDPercent
                                            )}
                                        </td>

                                        {/* YTD ACTUAL / TARGET / VARIANCE */}

                                        {[
                                            actualYTD,
                                            targetYTD,
                                            varianceYTD,
                                        ].map(
                                            (
                                                value,
                                                valueIndex
                                            ) => (
                                                <td
                                                    key={`ytd-${valueIndex}`}
                                                    style={{
                                                        padding:
                                                            "8px 10px",
                                                        textAlign:
                                                            "right",
                                                        fontSize:
                                                            "0.74rem",
                                                        color:
                                                            valueIndex === 2
                                                                ? getVarianceStatusColor(
                                                                    varianceYTDStatus,
                                                                    "#64748B"
                                                                )
                                                                : getNumberColor(
                                                                    value,
                                                                    valueIndex === 0
                                                                        ? "#334155"
                                                                        : "#64748B"
                                                                ),
                                                        fontWeight:
                                                            valueIndex ===
                                                                2
                                                                ? 600
                                                                : 500,
                                                        fontVariantNumeric:
                                                            "tabular-nums",
                                                        whiteSpace:
                                                            "nowrap",
                                                        borderBottom:
                                                            "1px solid #F1F5F9",
                                                    }}
                                                >
                                                    {formatNumber(
                                                        value
                                                    )}
                                                </td>
                                            )
                                        )}

                                        {/* YTD VARIANCE % */}

                                        <td
                                            style={{
                                                padding:
                                                    "6px 6px",
                                                textAlign:
                                                    "right",
                                                fontSize:
                                                    "0.74rem",
                                                color:
                                                    getVarianceStatusColor(
                                                        varianceYTDStatus,
                                                        "#64748B"
                                                    ),
                                                fontWeight: 600,
                                                fontVariantNumeric:
                                                    "tabular-nums",
                                                whiteSpace:
                                                    "nowrap",
                                                borderBottom:
                                                    "1px solid #F1F5F9",
                                            }}
                                        >
                                            {formatPercent(
                                                varianceYTDPercent
                                            )}
                                        </td>
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div
            style={{
                width: "100%",
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                boxSizing: "border-box",
                overflow: "hidden",
            }}
        >
            {/* HEADER */}

            <div
                style={{
                    minHeight: 58,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent:
                        "space-between",
                    gap: 12,
                    padding: "8px 12px 7px",
                    boxSizing:
                        "border-box",
                }}
            >
                <div
                    style={{
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            fontSize: 14,
                            lineHeight: "17px",
                            fontWeight: 700,
                            color: "#0F172A",
                        }}
                    >
                        Expense Category Drill-Down{" "}
                        <span
                            style={{
                                color: "#64748B",
                                marginLeft: "5px",
                                fontSize: 11,
                                fontWeight: 600,
                            }}
                        >
                            (Amounts in {reportingCurrency || "AED"})
                        </span>
                    </h3>

                    <div
                        style={{
                            marginTop: 3,
                            fontSize: 10.5,
                            lineHeight: "14px",
                            fontWeight: 500,
                            color: "#64748B",
                        }}
                    >
                        Detailed PTD and YTD expense category variance analysis
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        position: "relative",
                        paddingTop: 2,
                    }}
                >
                    {dataAsOf && (
                        <span
                            style={{
                                fontSize: 13,
                                color: "#64748B",
                                whiteSpace:
                                    "nowrap",
                            }}
                        >
                            Data as of{" "}
                            <strong
                                style={{
                                    color:
                                        "#334155",
                                    fontWeight: 600,
                                }}
                            >
                                {formatDataAsOf(
                                    dataAsOf
                                )}
                            </strong>
                        </span>
                    )}

                    {currentMonthPartial && (
                        <span
                            style={{
                                display:
                                    "inline-flex",
                                alignItems:
                                    "center",
                                padding:
                                    "3px 7px",
                                borderRadius:
                                    999,
                                background:
                                    "#FFF7ED",
                                border:
                                    "1px solid #FED7AA",
                                color:
                                    "#C2410C",
                                fontSize: 13,
                                fontWeight: 600,
                                whiteSpace:
                                    "nowrap",
                            }}
                        >
                            Current month partial
                        </span>
                    )}

                    {/* 3 DOT MENU */}

                    <button
                        type="button"
                        onClick={() =>
                            setMenuOpen(
                                (prev) =>
                                    !prev
                            )
                        }
                        aria-label="Expense category actions"
                        aria-expanded={
                            menuOpen
                        }
                        style={{
                            border: "none",
                            background:
                                "transparent",
                            padding:
                                "2px 4px",
                            cursor:
                                "pointer",
                            color:
                                "#64748B",
                            fontSize: 17,
                            lineHeight: 1,
                        }}
                    >
                        ⋮
                    </button>

                    {/* ACTION MENU */}

                    {menuOpen && (
                        <div
                            style={{
                                position:
                                    "absolute",
                                top: 28,
                                right: 0,
                                minWidth: 165,
                                background:
                                    "#FFFFFF",
                                border:
                                    "1px solid #E5E7EB",
                                borderRadius: 8,
                                boxShadow:
                                    "0 8px 24px rgba(15, 23, 42, 0.12)",
                                padding:
                                    "5px 0",
                                zIndex: 100,
                            }}
                        >
                            {/* VIEW ALL */}

                            <button
                                type="button"
                                onClick={
                                    handleViewAllClick
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
                                        "pointer",
                                    textAlign:
                                        "left",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color:
                                        "#334155",
                                }}
                                onMouseEnter={(
                                    event
                                ) => {
                                    event.currentTarget.style.background =
                                        "#F8FAFC";
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

                            {/* EXPORT EXCEL */}

                            <button
                                type="button"
                                onClick={
                                    handleExportExcelClick
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
                                        "pointer",
                                    textAlign:
                                        "left",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color:
                                        "#334155",
                                }}
                                onMouseEnter={(
                                    event
                                ) => {
                                    event.currentTarget.style.background =
                                        "#F8FAFC";
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

                            {/* EXPORT PDF */}

                            <button
                                type="button"
                                onClick={
                                    handleExportPdfClick
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
                                        "pointer",
                                    textAlign:
                                        "left",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color:
                                        "#334155",
                                }}
                                onMouseEnter={(
                                    event
                                ) => {
                                    event.currentTarget.style.background =
                                        "#F8FAFC";
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

            {/* =================================================
                TABLE FILTER SECTION
            ================================================= */}

            <div
                style={{
                    width: "100%",
                    padding: "10px 12px 11px",
                    background: "#FFFFFF",
                    borderTop: "1px solid #F1F5F9",
                    borderBottom: "1px solid #E2E8F0",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(8, minmax(105px, 1fr))",
                        gap: 9,
                        alignItems: "end",
                    }}
                >
                    <FilterField label="Legal Group">
                        <CompactMultiSelect
                            options={cascadingOptions.legalGroups}
                            searchPlaceholder="Search Legal Group"
                            value={tableFilters.legalGroupId}
                            onChange={(value) =>
                                updateTableMulti("legalGroupId", value)
                            }
                        />
                    </FilterField>

                    <FilterField label="Legal Entity">
                        <CompactMultiSelect
                            options={cascadingOptions.legalEntities}
                            searchPlaceholder="Search Legal Entity"
                            value={tableFilters.legalEntityId}
                            onChange={(value) =>
                                updateTableMulti("legalEntityId", value)
                            }
                        />
                    </FilterField>

                    <FilterField label="Parent Division">
                        <CompactMultiSelect
                            options={cascadingOptions.parentDivisions}
                            searchPlaceholder="Search Parent Division"
                            value={tableFilters.parentDivisionId}
                            onChange={(value) =>
                                updateTableMulti("parentDivisionId", value)
                            }
                        />
                    </FilterField>

                    <FilterField label="Sub-Division">
                        <CompactMultiSelect
                            options={cascadingOptions.subdivisions}
                            searchPlaceholder="Search Sub-Division"
                            value={tableFilters.subdivisionId}
                            onChange={(value) =>
                                updateTableMulti("subdivisionId", value)
                            }
                        />
                    </FilterField>

                    <FilterField label="Year">
                        <select
                            value={tableFilters.year || ""}
                            onChange={(event) =>
                                setTableFilters((prev) => ({
                                    ...prev,
                                    year: event.target.value,
                                }))
                            }
                            style={{
                                width: "100%",
                                height: 34,
                                padding: "0 9px",
                                border: "1px solid #E2E8F0",
                                borderRadius: 9,
                                background: "#F8FAFC",
                                color: "#334155",
                                fontSize: 12,
                                fontWeight: 600,
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        >
                            {(filterOptionsResolved.years?.length
                                ? filterOptionsResolved.years
                                : [tableFilters.year]
                            ).map((year) => (
                                <option
                                    key={optionValue(year)}
                                    value={optionValue(year)}
                                >
                                    {optionLabel(year)}
                                </option>
                            ))}
                        </select>
                    </FilterField>

                    <FilterField label="Period">
                        <select
                            value={tableFilters.periodName || ""}
                            onChange={(event) =>
                                setTableFilters((prev) => ({
                                    ...prev,
                                    periodName: event.target.value,
                                }))
                            }
                            style={{
                                width: "100%",
                                height: 34,
                                padding: "0 9px",
                                border: "1px solid #E2E8F0",
                                borderRadius: 9,
                                background: "#F8FAFC",
                                color: "#334155",
                                fontSize: 12,
                                fontWeight: 600,
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        >
                            {(filterOptionsResolved.periods?.length
                                ? filterOptionsResolved.periods
                                : [tableFilters.periodName]
                            ).map((period) => (
                                <option
                                    key={optionValue(period)}
                                    value={optionValue(period)}
                                >
                                    {optionLabel(period)}
                                </option>
                            ))}
                        </select>
                    </FilterField>

                    <FilterField label="Reporting Currency">
                        <select
                            value={tableFilters.currency || "AED"}
                            onChange={(event) =>
                                setTableFilters((prev) => ({
                                    ...prev,
                                    currency: event.target.value,
                                }))
                            }
                            style={{
                                width: "100%",
                                height: 34,
                                padding: "0 9px",
                                border: "1px solid #E2E8F0",
                                borderRadius: 9,
                                background: "#F8FAFC",
                                color: "#334155",
                                fontSize: 12,
                                fontWeight: 600,
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        >
                            {(filterOptionsResolved.currencies?.length
                                ? filterOptionsResolved.currencies
                                : [tableFilters.currency || "AED"]
                            ).map((currency) => (
                                <option
                                    key={optionValue(currency)}
                                    value={optionValue(currency)}
                                >
                                    {optionLabel(currency)}
                                </option>
                            ))}
                        </select>
                    </FilterField>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: 7,
                            minWidth: 0,
                        }}
                    >
                        <button
                            type="button"
                            onClick={applyTableFilters}
                            disabled={tableFilterLoading}
                            style={{
                                height: 34,
                                minWidth: 76,
                                padding: "0 14px",
                                border: "none",
                                borderRadius: 9,
                                background: "#6D5CE7",
                                color: "#FFFFFF",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: tableFilterLoading ? "not-allowed" : "pointer",
                                opacity: tableFilterLoading ? 0.72 : 1,
                                boxShadow:
                                    "0 4px 10px rgba(109,92,231,.18)",
                            }}
                        >
                            {tableFilterLoading ? "Applying..." : "Apply"}
                        </button>

                        <button
                            type="button"
                            onClick={resetTableFilters}
                            style={{
                                height: 34,
                                minWidth: 68,
                                padding: "0 13px",
                                border: "1px solid #E2E8F0",
                                borderRadius: 9,
                                background: "#FFFFFF",
                                color: "#475569",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {tableFilterError ? (
                <div
                    style={{
                        margin: "0 8px 8px",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid #FECACA",
                        background: "#FEF2F2",
                        color: "#B91C1C",
                        fontSize: 11,
                        fontWeight: 600,
                    }}
                >
                    {tableFilterError}
                </div>
            ) : null}

            {/* =================================================
                MAIN EXPENSE CATEGORY TABLE
            ================================================= */}

            <div
                style={{
                    width: "100%",
                    overflowX: "auto",
                    padding:
                        "0 8px 10px",
                    boxSizing:
                        "border-box",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        minWidth: 760,
                        borderCollapse:
                            "collapse",
                        tableLayout: "fixed",
                        fontSize: "0.70rem",
                    }}
                >
                    <colgroup>
                        <col style={{ width: "18%" }} />
                        <col style={{ width: "9%" }} />
                        <col style={{ width: "9%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "8%" }} />
                        <col style={{ width: "9%" }} />
                        <col style={{ width: "9%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "8%" }} />
                    </colgroup>

                    <thead>
                        <tr
                            style={{
                                height: 38,
                                background:
                                    "#F8FAFC",
                                borderBottom:
                                    "2px solid #E2E8F0",
                            }}
                        >
                            <th
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "left",
                                    color:
                                        "#1E3A8A",
                                    fontSize:
                                        "0.74rem",
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "16px",
                                    background:
                                        "#F8FAFC",
                                    borderBottom:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                EXPENSE CATEGORY
                            </th>

                            <th
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize:
                                        "0.68rem",
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "16px",
                                    background:
                                        "#F8FAFC",
                                    borderBottom:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                ACTUAL PTD
                            </th>

                            <th
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize:
                                        "0.68rem",
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "16px",
                                    background:
                                        "#F8FAFC",
                                    borderBottom:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                TARGET PTD
                            </th>

                            <th
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize:
                                        "0.68rem",
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "16px",
                                    background:
                                        "#F8FAFC",
                                    borderBottom:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                VARIANCE PTD
                            </th>

                            <th
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize:
                                        "0.68rem",
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "16px",
                                    background:
                                        "#F8FAFC",
                                    borderBottom:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                VARIANCE <br />PTD%
                            </th>

                            <th
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize:
                                        "0.68rem",
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "16px",
                                    background:
                                        "#F8FAFC",
                                    borderBottom:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                ACTUAL YTD
                            </th>

                            <th
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize:
                                        "0.68rem",
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "16px",
                                    background:
                                        "#F8FAFC",
                                    borderBottom:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                TARGET YTD
                            </th>

                            <th
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize:
                                        "0.68rem",
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "16px",
                                    background:
                                        "#F8FAFC",
                                    borderBottom:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                VARIANCE YTD
                            </th>

                            <th
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    color:
                                        "#1E3A8A",
                                    fontSize:
                                        "0.68rem",
                                    fontWeight: 700,
                                    whiteSpace:
                                        "normal",
                                    lineHeight:
                                        "16px",
                                    background:
                                        "#F8FAFC",
                                    borderBottom:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                VARIANCE<br /> YTD%
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.map(
                            (
                                item,
                                index
                            ) => {
                                const rowKey =
                                    item?.category ||
                                    index;

                                const isExpanded =
                                    !!expandedRows[
                                    rowKey
                                    ];

                                const actualPTD =
                                    item?.actualPTD ??
                                    item?.actual_ptd;

                                const targetPTD =
                                    item?.targetPTD ??
                                    item?.target_ptd;

                                const variancePTD =
                                    item?.variancePTD ??
                                    item?.variance_ptd;

                                const variancePTDPercent =
                                    item?.variancePTDPercent ??
                                    item?.variance_ptd_pct;

                                const actualYTD =
                                    item?.actualYTD ??
                                    item?.actual_ytd;

                                const targetYTD =
                                    item?.targetYTD ??
                                    item?.target_ytd;

                                const varianceYTD =
                                    item?.varianceYTD ??
                                    item?.variance_ytd;

                                const varianceYTDPercent =
                                    item?.varianceYTDPercent ??
                                    item?.variance_ytd_pct;

                                const variancePTDStatus =
                                    getVariancePTDStatus(item);

                                const varianceYTDStatus =
                                    getVarianceYTDStatus(item);

                                return (
                                    <React.Fragment
                                        key={
                                            rowKey
                                        }
                                    >
                                        {/* MAIN CATEGORY ROW */}

                                        <tr
                                            style={{
                                                height: 39,
                                                borderBottom:
                                                    "1px solid #F1F5F9",
                                            }}
                                        >
                                            <td
                                                style={{
                                                    padding:
                                                        "7px 6px",
                                                    textAlign:
                                                        "left",
                                                    borderBottom:
                                                        "1px solid #F1F5F9",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap: 7,
                                                    }}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleRow(
                                                                item,
                                                                index
                                                            )
                                                        }
                                                        style={{
                                                            width: 12,
                                                            height: 12,
                                                            padding: 0,
                                                            border:
                                                                "none",
                                                            background:
                                                                "transparent",
                                                            cursor:
                                                                "pointer",
                                                            color:
                                                                "#000000",
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            fontSize: 11,
                                                            lineHeight: 1,
                                                        }}
                                                    >
                                                        {isExpanded
                                                            ? "▼"
                                                            : "▶"}
                                                    </button>

                                                    <span
                                                        style={{
                                                            fontSize:
                                                                "0.74rem",
                                                            fontWeight: 700,
                                                            color:
                                                                "#334155",
                                                            whiteSpace:
                                                                "nowrap",
                                                            textTransform:
                                                                "uppercase",
                                                        }}
                                                    >
                                                        {item?.category ||
                                                            "—"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* PTD ACTUAL */}

                                            <td
                                                style={{
                                                    padding:
                                                        "7px 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize:
                                                        "0.74rem",
                                                    color:
                                                        getNumberColor(
                                                            actualPTD,
                                                            "#334155"
                                                        ),
                                                    fontWeight: 500,
                                                    fontVariantNumeric:
                                                        "tabular-nums",
                                                    whiteSpace:
                                                        "nowrap",
                                                    borderBottom:
                                                        "1px solid #F1F5F9",
                                                }}
                                            >
                                                {formatNumber(
                                                    actualPTD
                                                )}
                                            </td>

                                            {/* PTD TARGET */}

                                            <td
                                                style={{
                                                    padding:
                                                        "7px 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize:
                                                        "0.74rem",
                                                    color:
                                                        getNumberColor(
                                                            targetPTD,
                                                            "#64748B"
                                                        ),
                                                    fontWeight: 500,
                                                    fontVariantNumeric:
                                                        "tabular-nums",
                                                    whiteSpace:
                                                        "nowrap",
                                                    borderBottom:
                                                        "1px solid #F1F5F9",
                                                }}
                                            >
                                                {formatNumber(
                                                    targetPTD
                                                )}
                                            </td>

                                            {/* PTD VARIANCE */}

                                            <td
                                                style={{
                                                    padding:
                                                        "7px 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize:
                                                        "0.74rem",
                                                    color:
                                                        getVarianceStatusColor(
                                                            variancePTDStatus,
                                                            "#64748B"
                                                        ),
                                                    fontWeight: 600,
                                                    fontVariantNumeric:
                                                        "tabular-nums",
                                                    whiteSpace:
                                                        "nowrap",
                                                    borderBottom:
                                                        "1px solid #F1F5F9",
                                                }}
                                            >
                                                {formatNumber(
                                                    variancePTD
                                                )}
                                            </td>

                                            {/* PTD VARIANCE % */}

                                            <td
                                                style={{
                                                    padding:
                                                        "7px 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize:
                                                        "0.74rem",
                                                    color:
                                                        getVarianceStatusColor(
                                                            variancePTDStatus,
                                                            "#64748B"
                                                        ),
                                                    fontWeight: 600,
                                                    fontVariantNumeric:
                                                        "tabular-nums",
                                                    whiteSpace:
                                                        "nowrap",
                                                    borderBottom:
                                                        "1px solid #F1F5F9",
                                                }}
                                            >
                                                {variancePTDPercent !==
                                                    null &&
                                                    variancePTDPercent !==
                                                    undefined &&
                                                    variancePTDPercent !==
                                                    ""
                                                    ? `${Number(
                                                        variancePTDPercent
                                                    ).toFixed(
                                                        1
                                                    )}%`
                                                    : "—"}
                                            </td>

                                            {/* YTD ACTUAL */}

                                            <td
                                                style={{
                                                    padding:
                                                        "7px 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize:
                                                        "0.74rem",
                                                    color:
                                                        getNumberColor(
                                                            actualYTD,
                                                            "#334155"
                                                        ),
                                                    fontWeight: 500,
                                                    fontVariantNumeric:
                                                        "tabular-nums",
                                                    whiteSpace:
                                                        "nowrap",
                                                    borderBottom:
                                                        "1px solid #F1F5F9",
                                                }}
                                            >
                                                {formatNumber(
                                                    actualYTD
                                                )}
                                            </td>

                                            {/* YTD TARGET */}

                                            <td
                                                style={{
                                                    padding:
                                                        "7px 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize:
                                                        "0.74rem",
                                                    color:
                                                        getNumberColor(
                                                            targetYTD,
                                                            "#64748B"
                                                        ),
                                                    fontWeight: 500,
                                                    fontVariantNumeric:
                                                        "tabular-nums",
                                                    whiteSpace:
                                                        "nowrap",
                                                    borderBottom:
                                                        "1px solid #F1F5F9",
                                                }}
                                            >
                                                {formatNumber(
                                                    targetYTD
                                                )}
                                            </td>

                                            {/* YTD VARIANCE */}

                                            <td
                                                style={{
                                                    padding:
                                                        "7px 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize:
                                                        "0.74rem",
                                                    color:
                                                        getVarianceStatusColor(
                                                            varianceYTDStatus,
                                                            "#64748B"
                                                        ),
                                                    fontWeight: 600,
                                                    fontVariantNumeric:
                                                        "tabular-nums",
                                                    whiteSpace:
                                                        "nowrap",
                                                    borderBottom:
                                                        "1px solid #F1F5F9",
                                                }}
                                            >
                                                {formatNumber(
                                                    varianceYTD
                                                )}
                                            </td>

                                            {/* YTD VARIANCE % */}

                                            <td
                                                style={{
                                                    padding:
                                                        "7px 6px",
                                                    textAlign:
                                                        "right",
                                                    fontSize:
                                                        "0.74rem",
                                                    color:
                                                        getVarianceStatusColor(
                                                            varianceYTDStatus,
                                                            "#64748B"
                                                        ),
                                                    fontWeight: 600,
                                                    fontVariantNumeric:
                                                        "tabular-nums",
                                                    whiteSpace:
                                                        "nowrap",
                                                    borderBottom:
                                                        "1px solid #F1F5F9",
                                                }}
                                            >
                                                {varianceYTDPercent !==
                                                    null &&
                                                    varianceYTDPercent !==
                                                    undefined &&
                                                    varianceYTDPercent !==
                                                    ""
                                                    ? `${Number(
                                                        varianceYTDPercent
                                                    ).toFixed(
                                                        1
                                                    )}%`
                                                    : "—"}
                                            </td>
                                        </tr>

                                        {/* EXPANDED ROW */}

                                        {isExpanded && (
                                            <tr>
                                                <td
                                                    colSpan={9}
                                                    style={{
                                                        background:
                                                            "#FFFFFF",
                                                        padding:
                                                            "10px 0",
                                                        borderBottom:
                                                            "1px solid #E5E7EB",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                marginBottom: 8,
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "0.74rem",
                                                                    fontWeight: 600,
                                                                    color:
                                                                        "#334155",
                                                                }}
                                                            >
                                                                Natural-account
                                                                details
                                                                for{" "}
                                                                <strong
                                                                    style={{
                                                                        color:
                                                                            "#0F172A",
                                                                        fontWeight: 700,
                                                                    }}
                                                                >
                                                                    {item?.category ||
                                                                        "—"}
                                                                </strong>
                                                            </div>
                                                        </div>

                                                        {renderNaturalAccountDetails(
                                                            item?.category,
                                                            item
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            }
                        )}

                        {/* =================================================
                            TOTAL
                        ================================================= */}

                        <tr
                            style={{
                                height: 43,
                                background:
                                    "#F8FAFC",
                            }}
                        >
                            <td
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "left",
                                    fontSize:
                                        "0.74rem",
                                    fontWeight: 800,
                                    color:
                                        "#1E3A8A",
                                    borderTop:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                <span
                                    style={{
                                        paddingLeft: 21,
                                    }}
                                >
                                    Total Operating
                                    Expenses
                                </span>
                            </td>

                            {/* TOTAL PTD ACTUAL */}

                            <td
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    fontSize:
                                        "0.74rem",
                                    fontWeight: 800,
                                    color:
                                        getNumberColor(
                                            totalActualPTD,
                                            "#1E3A8A"
                                        ),
                                    fontVariantNumeric:
                                        "tabular-nums",
                                    borderTop:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                {formatNumber(
                                    totalActualPTD
                                )}
                            </td>

                            {/* TARGET PTD */}

                            <td
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    fontSize:
                                        "0.74rem",
                                    fontWeight: 800,
                                    color:
                                        "#64748B",
                                    fontVariantNumeric:
                                        "tabular-nums",
                                    borderTop:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                {formatNumber(
                                    totalTargetPTD
                                )}
                            </td>

                            {/* VARIANCE PTD */}

                            <td
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    fontSize:
                                        "0.74rem",
                                    fontWeight: 800,
                                    color:
                                        getVarianceStatusColor(
                                            totalVariancePTDStatus,
                                            "#64748B"
                                        ),
                                    fontVariantNumeric:
                                        "tabular-nums",
                                    borderTop:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                {formatNumber(
                                    totalVariancePTD
                                )}
                            </td>

                            {/* VARIANCE PTD % */}

                            <td
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    fontSize:
                                        "0.74rem",
                                    fontWeight: 800,
                                    color:
                                        getVarianceStatusColor(
                                            totalVariancePTDStatus,
                                            "#64748B"
                                        ),
                                    borderTop:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                {totalVariancePTDPercent !==
                                    null &&
                                    totalVariancePTDPercent !==
                                    undefined
                                    ? `${Number(
                                        totalVariancePTDPercent
                                    ).toFixed(1)}%`
                                    : "—"}
                            </td>

                            {/* TOTAL YTD ACTUAL */}

                            <td
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    fontSize:
                                        "0.74rem",
                                    fontWeight: 800,
                                    color:
                                        getNumberColor(
                                            totalActualYTD,
                                            "#1E3A8A"
                                        ),
                                    fontVariantNumeric:
                                        "tabular-nums",
                                    borderTop:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                {formatNumber(
                                    totalActualYTD
                                )}
                            </td>

                            {/* TARGET YTD */}

                            <td
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    fontSize:
                                        "0.74rem",
                                    fontWeight: 800,
                                    color:
                                        "#64748B",
                                    fontVariantNumeric:
                                        "tabular-nums",
                                    borderTop:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                {formatNumber(
                                    totalTargetYTD
                                )}
                            </td>

                            {/* VARIANCE YTD */}

                            <td
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    fontSize:
                                        "0.74rem",
                                    fontWeight: 800,
                                    color:
                                        getVarianceStatusColor(
                                            totalVarianceYTDStatus,
                                            "#64748B"
                                        ),
                                    fontVariantNumeric:
                                        "tabular-nums",
                                    borderTop:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                {formatNumber(
                                    totalVarianceYTD
                                )}
                            </td>

                            {/* VARIANCE YTD % */}

                            <td
                                style={{
                                    padding:
                                        "6px 5px",
                                    textAlign:
                                        "right",
                                    fontSize:
                                        "0.74rem",
                                    fontWeight: 800,
                                    color:
                                        "#64748B",
                                    borderTop:
                                        "2px solid #E2E8F0",
                                }}
                            >
                                {totalVarianceYTDPercent !==
                                    null &&
                                    totalVarianceYTDPercent !==
                                    undefined
                                    ? `${Number(
                                        totalVarianceYTDPercent
                                    ).toFixed(1)}%`
                                    : "—"}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}