import {
    Pencil,
    MoreVertical,
    ChevronsLeft,
    ChevronsRight,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";
import ConfirmationModel from "../common/ConfirmationModel";

export default function BusinessUnitTable({
    businessUnits = [],
    onEdit,
    onSelect,
    selectedBusinessUnit,
    onStatusToggle,
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(8);

    const [showStatusConfirm, setShowStatusConfirm] =
        useState(false);

    const [selectedStatusBusinessUnit, setSelectedStatusBusinessUnit] =
        useState(null);

    const [openMenu, setOpenMenu] = useState(null);

    const [menuPosition, setMenuPosition] = useState({
        top: 0,
        left: 0,
    });

    /*
     * IMPORTANT:
     * Use a single ref for the menu wrapper.
     * This prevents the outside-click handler from
     * conflicting between multiple table rows.
     */
    const menuRef = useRef(null);

    /* =========================================================
       PAGINATION
    ========================================================= */

    const totalRows = businessUnits.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalRows / rowsPerPage)
    );

    const startIndex =
        (currentPage - 1) * rowsPerPage;

    const endIndex =
        startIndex + rowsPerPage;

    const currentRows = businessUnits.slice(
        startIndex,
        endIndex
    );

    const goFirst = () => {
        setCurrentPage(1);
    };

    const goLast = () => {
        setCurrentPage(totalPages);
    };

    const goPrevious = () => {
        setCurrentPage((prev) =>
            Math.max(prev - 1, 1)
        );
    };

    const goNext = () => {
        setCurrentPage((prev) =>
            Math.min(prev + 1, totalPages)
        );
    };

    /*
     * IMPORTANT:
     * When Active / Inactive filter changes,
     * make sure current page remains valid.
     */
    useEffect(() => {
        const pages = Math.ceil(
            businessUnits.length / rowsPerPage
        );

        if (pages === 0) {
            setCurrentPage(1);
        } else if (currentPage > pages) {
            setCurrentPage(pages);
        }
    }, [
        businessUnits.length,
        currentPage,
        rowsPerPage,
    ]);

    /*
     * Close menu when clicking outside.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setOpenMenu(null);
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

    /*
     * Close menu if the data changes.
     */
    useEffect(() => {
        setOpenMenu(null);
    }, [businessUnits]);

    /* =========================================================
       VIEW DETAILS
    ========================================================= */

    const handleViewDetails = (e, unit) => {
        e.preventDefault();
        e.stopPropagation();

        console.log(
            "View Business Unit Details:",
            unit
        );

        /*
         * Parent component controls the actual details panel.
         */
        if (onSelect) {
            onSelect(unit);
        }

        setOpenMenu(null);
    };

    /* =========================================================
       STATUS MENU
    ========================================================= */

    const handleStatusClick = (e, unit) => {
        e.preventDefault();
        e.stopPropagation();

        console.log(
            "Business Unit status selected:",
            unit
        );

        setSelectedStatusBusinessUnit(unit);
        setShowStatusConfirm(true);
        setOpenMenu(null);
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">

                    {/* ================= HEADER ================= */}

                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>

                            <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
                                Business Unit Name
                            </th>

                            <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
                                Sub Division Code
                            </th>

                            <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
                                Sub Division Name
                            </th>

                            <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
                                Parent Division Code
                            </th>

                            <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
                                Parent Division Name
                            </th>

                            <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
                                Status
                            </th>

                            <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
                                Action
                            </th>

                        </tr>
                    </thead>

                    {/* ================= BODY ================= */}

                    <tbody>

                        {currentRows.length > 0 ? (

                            currentRows.map((unit) => (

                                <tr
                                    key={unit.business_unit_id}
                                    onClick={() => {
                                        onSelect?.(unit);
                                    }}
                                    className={`cursor-pointer border-b ${selectedBusinessUnit?.business_unit_id ===
                                            unit.business_unit_id
                                            ? "bg-blue-50"
                                            : "hover:bg-gray-50"
                                        }`}
                                >

                                    {/* Business Unit Name */}

                                    <td className="px-2.5 py-1.5 text-center text-[10px] font-medium leading-tight text-gray-800">
                                        {unit.business_unit_name}
                                    </td>

                                    {/* Sub Division Code */}

                                    <td className="px-2.5 py-1.5 text-center text-[10px] font-medium leading-tight text-gray-800">
                                        {unit.subdivision_code}
                                    </td>

                                    {/* Sub Division Name */}

                                    <td className="px-2.5 py-1.5 text-center text-[10px] font-medium leading-tight text-gray-800">
                                        {unit.subdivision_name}
                                    </td>

                                    {/* Parent Division Code */}

                                    <td className="px-2.5 py-1.5 text-center text-[10px] font-medium leading-tight text-gray-800">
                                        {unit.parent_division_code}
                                    </td>

                                    {/* Parent Division Name */}

                                    <td className="px-2.5 py-1.5 text-center text-[10px] font-medium leading-tight text-gray-800">
                                        {unit.parent_division_name}
                                    </td>

                                    {/* Status */}

                                    <td className="px-2.5 py-1.5 text-center">
                                        <span
                                            className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-tight ${unit.active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {unit.active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>

                                    {/* =================================================
                                        ACTION
                                    ================================================= */}

                                    <td className="px-2.5 py-1.5">
                                        <div className="flex justify-center gap-1">

                                            {/* ================= EDIT ================= */}

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();

                                                    console.log(
                                                        "Edit clicked:",
                                                        unit
                                                    );

                                                    onEdit?.(unit);
                                                }}
                                                className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100"
                                            >
                                                <Pencil
                                                    size={11}
                                                    className="text-gray-900"
                                                />
                                            </button>

                                            {/* ================= MORE ================= */}

                                            <div
                                                className="relative"
                                                ref={
                                                    openMenu ===
                                                        unit.business_unit_id
                                                        ? menuRef
                                                        : null
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();

                                                        const rect =
                                                            e.currentTarget.getBoundingClientRect();

                                                        const menuWidth = 145;

                                                        setMenuPosition({
                                                            top:
                                                                rect.bottom +
                                                                5,
                                                            left:
                                                                rect.right -
                                                                menuWidth,
                                                        });

                                                        setOpenMenu(
                                                            openMenu ===
                                                                unit.business_unit_id
                                                                ? null
                                                                : unit.business_unit_id
                                                        );
                                                    }}
                                                    className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100"
                                                >
                                                    <MoreVertical
                                                        size={11}
                                                        className="text-gray-900"
                                                    />
                                                </button>

                                                {/* ================= MENU ================= */}

                                                {openMenu ===
                                                    unit.business_unit_id && (

                                                        <div
                                                            className="fixed z-9999 w-36 rounded-md border border-gray-200 bg-white shadow-lg"
                                                            style={{
                                                                top:
                                                                    menuPosition.top,
                                                                left:
                                                                    menuPosition.left,
                                                            }}
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        >

                                                            {/* VIEW DETAILS */}

                                                            <button
                                                                type="button"
                                                                onClick={(e) =>
                                                                    handleViewDetails(
                                                                        e,
                                                                        unit
                                                                    )
                                                                }
                                                                className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                                                            >
                                                                View Details
                                                            </button>

                                                            {/* ACTIVATE / DEACTIVATE */}

                                                            <button
                                                                type="button"
                                                                onClick={(e) =>
                                                                    handleStatusClick(
                                                                        e,
                                                                        unit
                                                                    )
                                                                }
                                                                className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                                                            >
                                                                {unit.active
                                                                    ? "Deactivate"
                                                                    : "Activate"}
                                                            </button>

                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </td>

                                </tr>
                            ))

                        ) : (

                            <tr>
                                <td
                                    colSpan={7}
                                    className="py-6 text-center text-sm text-gray-500"
                                >
                                    No Business Units found.
                                </td>
                            </tr>

                        )}

                    </tbody>
                </table>
            </div>

            {/* =================================================
                PAGINATION
            ================================================= */}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-gray-50/40 px-4 py-2">

                {/* Record Info */}

                <p className="text-[9px] text-gray-700">
                    Showing{" "}
                    {totalRows === 0
                        ? 0
                        : startIndex + 1}
                    {" "}to{" "}
                    {Math.min(
                        endIndex,
                        totalRows
                    )}
                    {" "}of{" "}
                    {totalRows}
                    {" "}Business Units
                </p>

                {/* Pagination Buttons */}

                <div className="flex items-center gap-1">

                    {/* First */}

                    <button
                        type="button"
                        onClick={goFirst}
                        disabled={currentPage === 1}
                        className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                    >
                        <ChevronsLeft className="h-3.5 w-3.5" />
                    </button>

                    {/* Previous */}

                    <button
                        type="button"
                        onClick={goPrevious}
                        disabled={currentPage === 1}
                        className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </button>

                    {/* Page Numbers */}

                    {Array.from(
                        {
                            length: totalPages,
                        },
                        (_, index) => {
                            const page = index + 1;

                            return (
                                <button
                                    type="button"
                                    key={page}
                                    onClick={() =>
                                        setCurrentPage(page)
                                    }
                                    className={`h-6 w-6 rounded text-[9px] font-medium ${currentPage === page
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        }
                    )}

                    {/* Next */}

                    <button
                        type="button"
                        onClick={goNext}
                        disabled={
                            currentPage === totalPages ||
                            totalRows === 0
                        }
                        className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    {/* Last */}

                    <button
                        type="button"
                        onClick={goLast}
                        disabled={
                            currentPage === totalPages ||
                            totalRows === 0
                        }
                        className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                    >
                        <ChevronsRight className="h-3.5 w-3.5" />
                    </button>

                </div>
            </div>

            {/* =================================================
                ACTIVATE / DEACTIVATE CONFIRMATION
            ================================================= */}

            <ConfirmationModel
                open={showStatusConfirm}

                title={
                    selectedStatusBusinessUnit?.active
                        ? "Deactivate Business Unit"
                        : "Activate Business Unit"
                }

                message={
                    selectedStatusBusinessUnit?.active
                        ? `Are you sure you want to deactivate ${selectedStatusBusinessUnit?.business_unit_name}?`
                        : `Are you sure you want to activate ${selectedStatusBusinessUnit?.business_unit_name}?`
                }

                confirmText={
                    selectedStatusBusinessUnit?.active
                        ? "Deactivate"
                        : "Activate"
                }

                cancelText="Cancel"

                onCancel={() => {
                    setShowStatusConfirm(false);
                    setSelectedStatusBusinessUnit(null);
                }}

                onConfirm={() => {
                    if (selectedStatusBusinessUnit) {
                        onStatusToggle?.(
                            selectedStatusBusinessUnit
                        );
                    }

                    setShowStatusConfirm(false);
                    setSelectedStatusBusinessUnit(null);
                }}
            />

        </div>
    );
}