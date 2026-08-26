
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
        <div className="h-full overflow-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-xs">

                {/* =================================================
                    HEADER
                ================================================= */}

                <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr className="border-b border-gray-200">

                        <th className="px-3 py-2 font-semibold text-gray-600">
                            Currency Code
                        </th>

                        <th className="px-3 py-2 font-semibold text-gray-600">
                            Currency Name
                        </th>

                        <th className="px-3 py-2 font-semibold text-gray-600">
                            Conversion Rate to AED
                        </th>

                        <th className="px-3 py-2 font-semibold text-gray-600">
                            Status
                        </th>

                        <th className="w-20 px-3 py-2 text-center font-semibold text-gray-600">
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
                                className={`
                                    cursor-pointer
                                    border-b
                                    border-gray-100
                                    ${selected
                                        ? "bg-blue-50"
                                        : "hover:bg-gray-50"
                                    }
                                `}
                            >

                                {/* =================================================
                                    CURRENCY CODE
                                ================================================= */}

                                <td className="px-3 py-2 font-medium text-gray-800">
                                    {currency.currency_code || "-"}
                                </td>

                                {/* =================================================
                                    CURRENCY NAME
                                ================================================= */}

                                <td className="px-3 py-2 text-gray-700">
                                    {currency.currency_name || "-"}
                                </td>

                                {/* =================================================
                                    CONVERSION RATE
                                ================================================= */}

                                <td className="px-3 py-2 text-gray-700">
                                    {currency.conversion_rate_to_aed !== null &&
                                        currency.conversion_rate_to_aed !== undefined
                                        ? Number(
                                            currency.conversion_rate_to_aed
                                        ).toFixed(6)
                                        : "-"}
                                </td>

                                {/* =================================================
                                    STATUS
                                ================================================= */}

                                <td className="px-3 py-2">
                                    <StatusBadge
                                        status={isActive ? "Active" : "Inactive"}
                                    />
                                </td>

                                {/* =================================================
                                    ACTION
                                ================================================= */}

                                <td
                                    className="relative w-20 px-3 py-2"
                                    onClick={(e) =>
                                        e.stopPropagation()
                                    }
                                >
                                    <div
                                        className="relative flex items-center justify-center gap-1"
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
                                            className="
                                                flex
                                                h-6
                                                w-6
                                                items-center
                                                justify-center
                                                rounded
                                                hover:bg-gray-100
                                            "
                                            title="Edit"
                                        >
                                            <Pencil
                                                size={12}
                                                className="text-gray-700"
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
                                            className="
                                                flex
                                                h-6
                                                w-6
                                                items-center
                                                justify-center
                                                rounded
                                                hover:bg-gray-100
                                            "
                                            title="More actions"
                                        >
                                            <MoreVertical
                                                size={13}
                                                className="text-gray-700"
                                            />
                                        </button>

                                        {/* =================================================
                                            DROPDOWN
                                        ================================================= */}

                                        {menuOpen && (
                                            <div
                                                className="
                                                    absolute
                                                    right-0
                                                    top-7
                                                    z-50
                                                    w-36
                                                    overflow-hidden
                                                    rounded-md
                                                    border
                                                    border-gray-200
                                                    bg-white
                                                    py-1
                                                    shadow-lg
                                                "
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
                                                    className="
                                                        flex
                                                        w-full
                                                        items-center
                                                        gap-2
                                                        px-3
                                                        py-2
                                                        text-left
                                                        text-xs
                                                        text-gray-700
                                                        hover:bg-gray-50
                                                    "
                                                >
                                                    <Eye
                                                        size={13}
                                                        className="text-gray-500"
                                                    />

                                                    <span>
                                                        View Details
                                                    </span>
                                                </button>

                                                {/* =================================================
                                                    DIVIDER
                                                ================================================= */}

                                                <div className="my-1 border-t border-gray-100" />

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
                                                    className={`
                                                        flex
                                                        w-full
                                                        items-center
                                                        gap-2
                                                        px-3
                                                        py-2
                                                        text-left
                                                        text-xs
                                                        ${isActive
                                                            ? "text-red-600 hover:bg-red-50"
                                                            : "text-green-600 hover:bg-green-50"
                                                        }
                                                    `}
                                                >
                                                    <Power size={13} />

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
                                className="
                                    px-3
                                    py-8
                                    text-center
                                    text-gray-400
                                "
                            >
                                No currencies found
                            </td>
                        </tr>
                    )}

                </tbody>
            </table>

            {/* =========================================================
                PAGINATION
            ========================================================= */}

            {currencies.length > 0 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 py-2">

                    {/* Showing items */}

                    <div className="text-[11px] text-gray-500">
                        Showing{" "}
                        <span className="font-medium text-gray-700">
                            {startIndex + 1}
                        </span>
                        {" - "}
                        <span className="font-medium text-gray-700">
                            {Math.min(endIndex, currencies.length)}
                        </span>
                        {" of "}
                        <span className="font-medium text-gray-700">
                            {currencies.length} Currencies
                        </span>
                    </div>

                    {/* Pagination controls */}

                    <div className="flex items-center gap-1">

                        {/* Previous */}

                        <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="
                                flex
                                h-7
                                w-7
                                items-center
                                justify-center
                                rounded
                                border
                                border-gray-200
                                text-gray-600
                                hover:bg-gray-50
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                            title="Previous"
                        >
                            <ChevronLeft size={14} />
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
                                className={`
                                    flex
                                    h-7
                                    min-w-7
                                    items-center
                                    justify-center
                                    rounded
                                    border
                                    px-2
                                    text-[11px]
                                    ${currentPage === page
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }
                                `}
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
                            className="
                                flex
                                h-7
                                w-7
                                items-center
                                justify-center
                                rounded
                                border
                                border-gray-200
                                text-gray-600
                                hover:bg-gray-50
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                            title="Next"
                        >
                            <ChevronRight size={14} />
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
}