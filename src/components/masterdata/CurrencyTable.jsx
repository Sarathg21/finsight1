
// import React, { useEffect, useRef, useState } from "react";
// import {
//     Pencil,
//     MoreVertical,
//     Eye,
//     Power,
//     ChevronLeft,
//     ChevronRight,
// } from "lucide-react";

// import StatusBadge from "../StatusBadge";

// export default function CurrencyTable({
//     currencies = [],
//     selectedCurrency,
//     onSelect,
//     onEdit,
//     onStatusToggle,
// }) {
//     const menuRef = useRef(null);

//     const [openMenuId, setOpenMenuId] = useState(null);

//     /* =========================================================
//        PAGINATION
//     ========================================================= */

//     const [currentPage, setCurrentPage] = useState(1);
//     const pageSize = 7;

//     const totalPages = Math.ceil(currencies.length / pageSize);

//     const startIndex = (currentPage - 1) * pageSize;
//     const endIndex = startIndex + pageSize;

//     const paginatedCurrencies = currencies.slice(
//         startIndex,
//         endIndex
//     );

//     useEffect(() => {
//         if (currentPage > totalPages && totalPages > 0) {
//             setCurrentPage(totalPages);
//         }

//         if (totalPages === 0 && currentPage !== 1) {
//             setCurrentPage(1);
//         }
//     }, [currencies.length, currentPage, totalPages]);

//     /* =========================================================
//        CLOSE MENU WHEN CLICKING OUTSIDE
//     ========================================================= */

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (
//                 menuRef.current &&
//                 !menuRef.current.contains(event.target)
//             ) {
//                 setOpenMenuId(null);
//             }
//         };

//         document.addEventListener(
//             "mousedown",
//             handleClickOutside
//         );

//         return () => {
//             document.removeEventListener(
//                 "mousedown",
//                 handleClickOutside
//             );
//         };
//     }, []);

//     /* =========================================================
//        MENU TOGGLE
//     ========================================================= */

//     const handleMenuToggle = (e, currencyId) => {
//         e.stopPropagation();

//         setOpenMenuId((prev) =>
//             prev === currencyId
//                 ? null
//                 : currencyId
//         );
//     };

//     /* =========================================================
//        VIEW DETAILS
//     ========================================================= */

//     const handleViewDetails = (e, currency) => {
//         e.stopPropagation();

//         setOpenMenuId(null);

//         onSelect?.(currency);
//     };

//     /* =========================================================
//        EDIT
//     ========================================================= */

//     const handleEdit = (e, currency) => {
//         e.stopPropagation();

//         setOpenMenuId(null);

//         onEdit?.(currency);
//     };

//     /* =========================================================
//        ACTIVATE / DEACTIVATE
//     ========================================================= */

//     const handleStatusChange = (e, currency) => {
//         e.stopPropagation();

//         setOpenMenuId(null);

//         onStatusToggle?.(currency);
//     };

//     /* =========================================================
//        PAGINATION HANDLERS
//     ========================================================= */

//     const handlePrevious = () => {
//         if (currentPage > 1) {
//             setCurrentPage((prev) => prev - 1);
//         }
//     };

//     const handleNext = () => {
//         if (currentPage < totalPages) {
//             setCurrentPage((prev) => prev + 1);
//         }
//     };

//     const handlePageChange = (page) => {
//         setCurrentPage(page);
//     };

//     return (
//         <div className="h-full overflow-auto rounded-lg border border-gray-200 bg-white">
//             <table className="w-full text-left text-xs">

//                 {/* =================================================
//                     HEADER
//                 ================================================= */}

//                 <thead className="sticky top-0 z-10 bg-gray-50">
//                     <tr className="border-b border-gray-200">

//                         <th className="px-3 py-2 font-semibold text-gray-600">
//                             Currency Code
//                         </th>

//                         <th className="px-3 py-2 font-semibold text-gray-600">
//                             Currency Name
//                         </th>

//                         <th className="px-3 py-2 font-semibold text-gray-600">
//                             Conversion Rate to AED
//                         </th>

//                         <th className="px-3 py-2 font-semibold text-gray-600">
//                             Status
//                         </th>

//                         <th className="w-20 px-3 py-2 text-center font-semibold text-gray-600">
//                             Action
//                         </th>

//                     </tr>
//                 </thead>

//                 {/* =================================================
//                     BODY
//                 ================================================= */}

//                 <tbody>
//                     {paginatedCurrencies.map((currency) => {
//                         const selected =
//                             selectedCurrency?.currency_id ===
//                             currency.currency_id;

//                         const menuOpen =
//                             openMenuId ===
//                             currency.currency_id;

//                         console.log(
//                             "CURRENCY STATUS:",
//                             currency.currency_code,
//                             currency.active,
//                             typeof currency.active
//                         );


//                         const isActive =
//                             currency.active === true ||
//                             currency.active === 1 ||
//                             currency.active === "1" ||
//                             currency.active === "true";

//                         return (
//                             <tr
//                                 key={currency.currency_id}
//                                 onClick={() =>
//                                     onSelect?.(currency)
//                                 }
//                                 className={`
//                                     cursor-pointer
//                                     border-b
//                                     border-gray-100
//                                     ${selected
//                                         ? "bg-blue-50"
//                                         : "hover:bg-gray-50"
//                                     }
//                                 `}
//                             >

//                                 {/* =================================================
//                                     CURRENCY CODE
//                                 ================================================= */}

//                                 <td className="px-3 py-2 font-medium text-gray-800">
//                                     {currency.currency_code || "-"}
//                                 </td>

//                                 {/* =================================================
//                                     CURRENCY NAME
//                                 ================================================= */}

//                                 <td className="px-3 py-2 text-gray-700">
//                                     {currency.currency_name || "-"}
//                                 </td>

//                                 {/* =================================================
//                                     CONVERSION RATE
//                                 ================================================= */}

//                                 <td className="px-3 py-2 text-gray-700">
//                                     {currency.conversion_rate_to_aed !== null &&
//                                         currency.conversion_rate_to_aed !== undefined
//                                         ? Number(
//                                             currency.conversion_rate_to_aed
//                                         ).toFixed(6)
//                                         : "-"}
//                                 </td>

//                                 {/* =================================================
//                                     STATUS
//                                 ================================================= */}

//                                 <td className="px-3 py-2">
//                                     <StatusBadge
//                                         status={isActive ? "Active" : "Inactive"}
//                                     />
//                                 </td>

//                                 {/* =================================================
//                                     ACTION
//                                 ================================================= */}

//                                 <td
//                                     className="relative w-20 px-3 py-2"
//                                     onClick={(e) =>
//                                         e.stopPropagation()
//                                     }
//                                 >
//                                     <div
//                                         className="relative flex items-center justify-center gap-1"
//                                         ref={
//                                             menuOpen
//                                                 ? menuRef
//                                                 : null
//                                         }
//                                     >

//                                         {/* =================================================
//                                             EDIT
//                                         ================================================= */}

//                                         <button
//                                             type="button"
//                                             onClick={(e) =>
//                                                 handleEdit(
//                                                     e,
//                                                     currency
//                                                 )
//                                             }
//                                             className="
//                                                 flex
//                                                 h-6
//                                                 w-6
//                                                 items-center
//                                                 justify-center
//                                                 rounded
//                                                 hover:bg-gray-100
//                                             "
//                                             title="Edit"
//                                         >
//                                             <Pencil
//                                                 size={12}
//                                                 className="text-gray-700"
//                                             />
//                                         </button>

//                                         {/* =================================================
//                                             MORE VERTICAL
//                                         ================================================= */}

//                                         <button
//                                             type="button"
//                                             onClick={(e) =>
//                                                 handleMenuToggle(
//                                                     e,
//                                                     currency.currency_id
//                                                 )
//                                             }
//                                             className="
//                                                 flex
//                                                 h-6
//                                                 w-6
//                                                 items-center
//                                                 justify-center
//                                                 rounded
//                                                 hover:bg-gray-100
//                                             "
//                                             title="More actions"
//                                         >
//                                             <MoreVertical
//                                                 size={13}
//                                                 className="text-gray-700"
//                                             />
//                                         </button>

//                                         {/* =================================================
//                                             DROPDOWN
//                                         ================================================= */}

//                                         {menuOpen && (
//                                             <div
//                                                 className="
//                                                     absolute
//                                                     right-0
//                                                     top-7
//                                                     z-50
//                                                     w-36
//                                                     overflow-hidden
//                                                     rounded-md
//                                                     border
//                                                     border-gray-200
//                                                     bg-white
//                                                     py-1
//                                                     shadow-lg
//                                                 "
//                                             >

//                                                 {/* =================================================
//                                                     VIEW DETAILS
//                                                 ================================================= */}

//                                                 <button
//                                                     type="button"
//                                                     onClick={(e) =>
//                                                         handleViewDetails(
//                                                             e,
//                                                             currency
//                                                         )
//                                                     }
//                                                     className="
//                                                         flex
//                                                         w-full
//                                                         items-center
//                                                         gap-2
//                                                         px-3
//                                                         py-2
//                                                         text-left
//                                                         text-xs
//                                                         text-gray-700
//                                                         hover:bg-gray-50
//                                                     "
//                                                 >
//                                                     <Eye
//                                                         size={13}
//                                                         className="text-gray-500"
//                                                     />

//                                                     <span>
//                                                         View Details
//                                                     </span>
//                                                 </button>

//                                                 {/* =================================================
//                                                     DIVIDER
//                                                 ================================================= */}

//                                                 <div className="my-1 border-t border-gray-100" />

//                                                 {/* =================================================
//                                                     ACTIVATE / DEACTIVATE
//                                                 ================================================= */}

//                                                 <button
//                                                     type="button"
//                                                     onClick={(e) =>
//                                                         handleStatusChange(
//                                                             e,
//                                                             currency
//                                                         )
//                                                     }
//                                                     className={`
//                                                         flex
//                                                         w-full
//                                                         items-center
//                                                         gap-2
//                                                         px-3
//                                                         py-2
//                                                         text-left
//                                                         text-xs
//                                                         ${isActive
//                                                             ? "text-red-600 hover:bg-red-50"
//                                                             : "text-green-600 hover:bg-green-50"
//                                                         }
//                                                     `}
//                                                 >
//                                                     <Power size={13} />

//                                                     <span>
//                                                         {isActive
//                                                             ? "Deactivate"
//                                                             : "Activate"}
//                                                     </span>
//                                                 </button>

//                                             </div>
//                                         )}

//                                     </div>
//                                 </td>

//                             </tr>
//                         );
//                     })}

//                     {/* =================================================
//                         EMPTY STATE
//                     ================================================= */}

//                     {!currencies.length && (
//                         <tr>
//                             <td
//                                 colSpan={5}
//                                 className="
//                                     px-3
//                                     py-8
//                                     text-center
//                                     text-gray-400
//                                 "
//                             >
//                                 No currencies found
//                             </td>
//                         </tr>
//                     )}

//                 </tbody>
//             </table>

//             {/* =========================================================
//                 PAGINATION
//             ========================================================= */}

//             {currencies.length > 0 && (
//                 <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 py-2">

//                     {/* Showing items */}

//                     <div className="text-[11px] text-gray-500">
//                         Showing{" "}
//                         <span className="font-medium text-gray-700">
//                             {startIndex + 1}
//                         </span>
//                         {" - "}
//                         <span className="font-medium text-gray-700">
//                             {Math.min(endIndex, currencies.length)}
//                         </span>
//                         {" of "}
//                         <span className="font-medium text-gray-700">
//                             {currencies.length} Currencies
//                         </span>
//                     </div>

//                     {/* Pagination controls */}

//                     <div className="flex items-center gap-1">

//                         {/* Previous */}

//                         <button
//                             type="button"
//                             onClick={handlePrevious}
//                             disabled={currentPage === 1}
//                             className="
//                                 flex
//                                 h-7
//                                 w-7
//                                 items-center
//                                 justify-center
//                                 rounded
//                                 border
//                                 border-gray-200
//                                 text-gray-600
//                                 hover:bg-gray-50
//                                 disabled:cursor-not-allowed
//                                 disabled:opacity-40
//                             "
//                             title="Previous"
//                         >
//                             <ChevronLeft size={14} />
//                         </button>

//                         {/* Page Numbers */}

//                         {Array.from(
//                             { length: totalPages },
//                             (_, index) => index + 1
//                         ).map((page) => (
//                             <button
//                                 key={page}
//                                 type="button"
//                                 onClick={() =>
//                                     handlePageChange(page)
//                                 }
//                                 className={`
//                                     flex
//                                     h-7
//                                     min-w-7
//                                     items-center
//                                     justify-center
//                                     rounded
//                                     border
//                                     px-2
//                                     text-[11px]
//                                     ${currentPage === page
//                                         ? "border-blue-600 bg-blue-600 text-white"
//                                         : "border-gray-200 text-gray-600 hover:bg-gray-50"
//                                     }
//                                 `}
//                             >
//                                 {page}
//                             </button>
//                         ))}

//                         {/* Next */}

//                         <button
//                             type="button"
//                             onClick={handleNext}
//                             disabled={
//                                 currentPage === totalPages
//                             }
//                             className="
//                                 flex
//                                 h-7
//                                 w-7
//                                 items-center
//                                 justify-center
//                                 rounded
//                                 border
//                                 border-gray-200
//                                 text-gray-600
//                                 hover:bg-gray-50
//                                 disabled:cursor-not-allowed
//                                 disabled:opacity-40
//                             "
//                             title="Next"
//                         >
//                             <ChevronRight size={14} />
//                         </button>

//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

import React, { useEffect, useRef, useState } from "react";
import {
    Pencil,
    MoreVertical,
    Eye,
    Power,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import StatusBadge from "../StatusBadge";

export default function CurrencyTable({
    currencies = [],
    selectedCurrency,
    onSelect,
    onEdit,
    onStatusToggle,
}) {
    const menuRef = useRef(null);

    const [openMenuId, setOpenMenuId] = useState(null);

    /* =========================================================
       PAGINATION
    ========================================================= */

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 7;

    const totalPages = Math.ceil(currencies.length / pageSize);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedCurrencies = currencies.slice(
        startIndex,
        endIndex
    );

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }

        if (totalPages === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [currencies.length, currentPage, totalPages]);

    /* =========================================================
       CLOSE MENU WHEN CLICKING OUTSIDE
    ========================================================= */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    /* =========================================================
       MENU TOGGLE
    ========================================================= */

    const handleMenuToggle = (e, currencyId) => {
        e.stopPropagation();

        setOpenMenuId((prev) =>
            prev === currencyId
                ? null
                : currencyId
        );
    };

    /* =========================================================
       VIEW DETAILS
    ========================================================= */

    const handleViewDetails = (e, currency) => {
        e.stopPropagation();

        setOpenMenuId(null);

        onSelect?.(currency);
    };

    /* =========================================================
       EDIT
    ========================================================= */

    const handleEdit = (e, currency) => {
        e.stopPropagation();

        setOpenMenuId(null);

        onEdit?.(currency);
    };

    /* =========================================================
       ACTIVATE / DEACTIVATE
    ========================================================= */

    const handleStatusChange = (e, currency) => {
        e.stopPropagation();

        setOpenMenuId(null);

        onStatusToggle?.(currency);
    };

    /* =========================================================
       PAGINATION HANDLERS
    ========================================================= */

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div
            style={{
                width: "100%",
                height: "auto",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "visible",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                boxSizing: "border-box",
            }}
        >
            {/* =================================================
                TABLE
            ================================================= */}

            <div
                style={{
                    width: "100%",
                    overflowX: "hidden",
                    overflowY: "visible",
                    boxSizing: "border-box",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        minWidth: 0,
                        tableLayout: "fixed",
                        borderCollapse: "collapse",
                        borderSpacing: 0,
                        margin: 0,
                    }}
                >
                    {/* =================================================
                        COLUMN WIDTHS
                    ================================================= */}

                    <colgroup>
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "25%" }} />
                        <col style={{ width: "25%" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "15%" }} />
                    </colgroup>

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <thead>
                        <tr
                            style={{
                                height: "32px",
                                backgroundColor: "#f9fafb",
                                borderBottom:
                                    "1px solid #e5e7eb",
                            }}
                        >
                            <th
                                style={{
                                    padding: "4px 5px",
                                    fontSize: "9px",
                                    lineHeight: "12px",
                                    fontWeight: 600,
                                    color: "#4b5563",
                                    textAlign: "center",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    borderRight:
                                        "1px solid #f3f4f6",
                                }}
                            >
                                Currency Code
                            </th>

                            <th
                                style={{
                                    padding: "4px 5px",
                                    fontSize: "9px",
                                    lineHeight: "12px",
                                    fontWeight: 600,
                                    color: "#4b5563",
                                    textAlign: "center",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    borderRight:
                                        "1px solid #f3f4f6",
                                }}
                            >
                                Currency Name
                            </th>

                            <th
                                style={{
                                    padding: "4px 5px",
                                    fontSize: "9px",
                                    lineHeight: "12px",
                                    fontWeight: 600,
                                    color: "#4b5563",
                                    textAlign: "center",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    borderRight:
                                        "1px solid #f3f4f6",
                                }}
                            >
                                Conversion Rate to AED
                            </th>

                            <th
                                style={{
                                    padding: "4px 5px",
                                    fontSize: "9px",
                                    lineHeight: "12px",
                                    fontWeight: 600,
                                    color: "#4b5563",
                                    textAlign: "center",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    borderRight:
                                        "1px solid #f3f4f6",
                                }}
                            >
                                Status
                            </th>

                            <th
                                style={{
                                    padding: "4px 5px",
                                    fontSize: "9px",
                                    lineHeight: "12px",
                                    fontWeight: 600,
                                    color: "#4b5563",
                                    textAlign: "center",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                Action
                            </th>
                        </tr>
                    </thead>

                    {/* =================================================
                        BODY
                    ================================================= */}

                    <tbody>
                        {paginatedCurrencies.map((currency) => {
                            const selected =
                                selectedCurrency?.currency_id ===
                                currency.currency_id;

                            const menuOpen =
                                openMenuId ===
                                currency.currency_id;

                            console.log(
                                "CURRENCY STATUS:",
                                currency.currency_code,
                                currency.active,
                                typeof currency.active
                            );

                            const isActive =
                                currency.active === true ||
                                currency.active === 1 ||
                                currency.active === "1" ||
                                currency.active === "true";

                            return (
                                <tr
                                    key={currency.currency_id}
                                    onClick={() =>
                                        onSelect?.(currency)
                                    }
                                    style={{
                                        height: "36px",
                                        cursor: "pointer",
                                        backgroundColor: selected
                                            ? "#eff6ff"
                                            : "#ffffff",
                                        borderBottom:
                                            "1px solid #f3f4f6",
                                        transition:
                                            "background-color 0.15s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!selected) {
                                            e.currentTarget.style.backgroundColor =
                                                "#f9fafb";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!selected) {
                                            e.currentTarget.style.backgroundColor =
                                                "#ffffff";
                                        }
                                    }}
                                >
                                    {/* =================================================
                                        CURRENCY CODE
                                    ================================================= */}

                                    <td
                                        style={{
                                            padding: "5px 5px",
                                            fontSize: "10px",
                                            lineHeight: "14px",
                                            fontWeight: 500,
                                            color: "#1f2937",
                                            textAlign: "center",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            borderRight:
                                                "1px solid #f9fafb",
                                        }}
                                    >
                                        {currency.currency_code || "-"}
                                    </td>

                                    {/* =================================================
                                        CURRENCY NAME
                                    ================================================= */}

                                    <td
                                        style={{
                                            padding: "5px 5px",
                                            fontSize: "10px",
                                            lineHeight: "14px",
                                            color: "#374151",
                                            textAlign: "center",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            borderRight:
                                                "1px solid #f9fafb",
                                        }}
                                    >
                                        {currency.currency_name || "-"}
                                    </td>

                                    {/* =================================================
                                        CONVERSION RATE
                                    ================================================= */}

                                    <td
                                        style={{
                                            padding: "5px 5px",
                                            fontSize: "10px",
                                            lineHeight: "14px",
                                            color: "#374151",
                                            textAlign: "center",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            borderRight:
                                                "1px solid #f9fafb",
                                        }}
                                    >
                                        {currency.conversion_rate_to_aed !==
                                            null &&
                                        currency.conversion_rate_to_aed !==
                                            undefined
                                            ? Number(
                                                  currency.conversion_rate_to_aed
                                              ).toFixed(6)
                                            : "-"}
                                    </td>

                                    {/* =================================================
                                        STATUS
                                    ================================================= */}

                                    <td
                                        style={{
                                            padding: "5px 4px",
                                            fontSize: "10px",
                                            lineHeight: "14px",
                                            textAlign: "center",
                                            whiteSpace: "nowrap",
                                            borderRight:
                                                "1px solid #f9fafb",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent:
                                                    "center",
                                            }}
                                        >
                                            <StatusBadge
                                                status={
                                                    isActive
                                                        ? "Active"
                                                        : "Inactive"
                                                }
                                            />
                                        </div>
                                    </td>

                                    {/* =================================================
                                        ACTION
                                    ================================================= */}

                                    <td
                                        style={{
                                            position: "relative",
                                            padding: "5px 4px",
                                            width: "15%",
                                            textAlign: "center",
                                        }}
                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
                                    >
                                        <div
                                            style={{
                                                position: "relative",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent:
                                                    "center",
                                                gap: "1px",
                                            }}
                                            ref={
                                                menuOpen
                                                    ? menuRef
                                                    : null
                                            }
                                        >
                                            {/* =================================================
                                                EDIT
                                            ================================================= */}

                                            <button
                                                type="button"
                                                onClick={(e) =>
                                                    handleEdit(
                                                        e,
                                                        currency
                                                    )
                                                }
                                                style={{
                                                    display: "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    width: "22px",
                                                    height: "22px",
                                                    padding: 0,
                                                    border: "none",
                                                    borderRadius:
                                                        "4px",
                                                    backgroundColor:
                                                        "transparent",
                                                    cursor: "pointer",
                                                }}
                                                title="Edit"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor =
                                                        "#f3f4f6";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor =
                                                        "transparent";
                                                }}
                                            >
                                                <Pencil
                                                    size={12}
                                                    style={{
                                                        color: "#374151",
                                                    }}
                                                />
                                            </button>

                                            {/* =================================================
                                                MORE VERTICAL
                                            ================================================= */}

                                            <button
                                                type="button"
                                                onClick={(e) =>
                                                    handleMenuToggle(
                                                        e,
                                                        currency.currency_id
                                                    )
                                                }
                                                style={{
                                                    display: "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    width: "22px",
                                                    height: "22px",
                                                    padding: 0,
                                                    border: "none",
                                                    borderRadius:
                                                        "4px",
                                                    backgroundColor:
                                                        "transparent",
                                                    cursor: "pointer",
                                                }}
                                                title="More actions"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor =
                                                        "#f3f4f6";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor =
                                                        "transparent";
                                                }}
                                            >
                                                <MoreVertical
                                                    size={13}
                                                    style={{
                                                        color: "#374151",
                                                    }}
                                                />
                                            </button>

                                            {/* =================================================
                                                DROPDOWN
                                            ================================================= */}

                                            {menuOpen && (
                                                <div
                                                    style={{
                                                        position:
                                                            "absolute",
                                                        right: 0,
                                                        top: "27px",
                                                        zIndex: 50,
                                                        width: "145px",
                                                        overflow:
                                                            "hidden",
                                                        border:
                                                            "1px solid #e5e7eb",
                                                        borderRadius:
                                                            "6px",
                                                        backgroundColor:
                                                            "#ffffff",
                                                        padding:
                                                            "4px 0",
                                                        boxShadow:
                                                            "0 4px 12px rgba(0, 0, 0, 0.10)",
                                                    }}
                                                >
                                                    {/* =================================================
                                                        VIEW DETAILS
                                                    ================================================= */}

                                                    <button
                                                        type="button"
                                                        onClick={(e) =>
                                                            handleViewDetails(
                                                                e,
                                                                currency
                                                            )
                                                        }
                                                        style={{
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            width: "100%",
                                                            height: "30px",
                                                            gap: "7px",
                                                            padding:
                                                                "0 10px",
                                                            border: "none",
                                                            backgroundColor:
                                                                "transparent",
                                                            color: "#374151",
                                                            fontSize:
                                                                "11px",
                                                            textAlign:
                                                                "left",
                                                            cursor: "pointer",
                                                        }}
                                                        onMouseEnter={(
                                                            e
                                                        ) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                "#f9fafb";
                                                        }}
                                                        onMouseLeave={(
                                                            e
                                                        ) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                "transparent";
                                                        }}
                                                    >
                                                        <Eye
                                                            size={13}
                                                            style={{
                                                                color: "#6b7280",
                                                            }}
                                                        />

                                                        <span>
                                                            View Details
                                                        </span>
                                                    </button>

                                                    {/* =================================================
                                                        DIVIDER
                                                    ================================================= */}

                                                    <div
                                                        style={{
                                                            margin:
                                                                "3px 0",
                                                            borderTop:
                                                                "1px solid #f3f4f6",
                                                        }}
                                                    />

                                                    {/* =================================================
                                                        ACTIVATE / DEACTIVATE
                                                    ================================================= */}

                                                    <button
                                                        type="button"
                                                        onClick={(e) =>
                                                            handleStatusChange(
                                                                e,
                                                                currency
                                                            )
                                                        }
                                                        style={{
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            width: "100%",
                                                            height: "30px",
                                                            gap: "7px",
                                                            padding:
                                                                "0 10px",
                                                            border: "none",
                                                            backgroundColor:
                                                                "transparent",
                                                            color: isActive
                                                                ? "#dc2626"
                                                                : "#16a34a",
                                                            fontSize:
                                                                "11px",
                                                            textAlign:
                                                                "left",
                                                            cursor: "pointer",
                                                        }}
                                                        onMouseEnter={(
                                                            e
                                                        ) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                isActive
                                                                    ? "#fef2f2"
                                                                    : "#f0fdf4";
                                                        }}
                                                        onMouseLeave={(
                                                            e
                                                        ) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                "transparent";
                                                        }}
                                                    >
                                                        <Power
                                                            size={13}
                                                        />

                                                        <span>
                                                            {isActive
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                        </span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {/* =================================================
                            EMPTY STATE
                        ================================================= */}

                        {!currencies.length && (
                            <tr>
                                <td
                                    colSpan={5}
                                    style={{
                                        padding: "32px 10px",
                                        textAlign: "center",
                                        fontSize: "10px",
                                        color: "#9ca3af",
                                    }}
                                >
                                    No currencies found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* =========================================================
                PAGINATION
            ========================================================= */}

            {currencies.length > 0 && (
                <div
                    style={{
                        width: "100%",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 10px",
                        borderTop: "1px solid #e5e7eb",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box",
                    }}
                >
                    {/* Showing items */}

                    <div
                        style={{
                            fontSize: "10px",
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Showing{" "}
                        <span
                            style={{
                                fontWeight: 500,
                                color: "#374151",
                            }}
                        >
                            {startIndex + 1}
                        </span>
                        {" - "}
                        <span
                            style={{
                                fontWeight: 500,
                                color: "#374151",
                            }}
                        >
                            {Math.min(
                                endIndex,
                                currencies.length
                            )}
                        </span>
                        {" of "}
                        <span
                            style={{
                                fontWeight: 500,
                                color: "#374151",
                            }}
                        >
                            {currencies.length} Currencies
                        </span>
                    </div>

                    {/* Pagination controls */}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1px",
                        }}
                    >
                        {/* Previous */}

                        <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "22px",
                                height: "22px",
                                padding: 0,
                                border: "1px solid #e5e7eb",
                                borderRadius: "4px",
                                backgroundColor: "#ffffff",
                                color: "#4b5563",
                                cursor:
                                    currentPage === 1
                                        ? "not-allowed"
                                        : "pointer",
                                opacity:
                                    currentPage === 1
                                        ? 0.4
                                        : 1,
                            }}
                            title="Previous"
                        >
                            <ChevronLeft size={13} />
                        </button>

                        {/* Page Numbers */}

                        {Array.from(
                            { length: totalPages },
                            (_, index) => index + 1
                        ).map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() =>
                                    handlePageChange(page)
                                }
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent:
                                        "center",
                                    minWidth: "22px",
                                    height: "22px",
                                    padding: "0 5px",
                                    border: `1px solid ${
                                        currentPage === page
                                            ? "#2563eb"
                                            : "#e5e7eb"
                                    }`,
                                    borderRadius: "4px",
                                    backgroundColor:
                                        currentPage === page
                                            ? "#2563eb"
                                            : "#ffffff",
                                    color:
                                        currentPage === page
                                            ? "#ffffff"
                                            : "#4b5563",
                                    fontSize: "10px",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    if (
                                        currentPage !== page
                                    ) {
                                        e.currentTarget.style.backgroundColor =
                                            "#f9fafb";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (
                                        currentPage !== page
                                    ) {
                                        e.currentTarget.style.backgroundColor =
                                            "#ffffff";
                                    }
                                }}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next */}

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={
                                currentPage === totalPages
                            }
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "22px",
                                height: "22px",
                                padding: 0,
                                border: "1px solid #e5e7eb",
                                borderRadius: "4px",
                                backgroundColor: "#ffffff",
                                color: "#4b5563",
                                cursor:
                                    currentPage === totalPages
                                        ? "not-allowed"
                                        : "pointer",
                                opacity:
                                    currentPage === totalPages
                                        ? 0.4
                                        : 1,
                            }}
                            title="Next"
                        >
                            <ChevronRight size={13} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}