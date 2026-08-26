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

export default function SubDivisionTable({
    subDivisions = [],
    onEdit,
    onSelect,
    selectedSubDivision,
    onStatusToggle,
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(8);

    const [showStatusConfirm, setShowStatusConfirm] =
        useState(false);

    const [selectedStatusDivision, setSelectedStatusDivision] =
        useState(null);

    const [openMenu, setOpenMenu] = useState(null);

    const [menuPosition, setMenuPosition] = useState({
        top: 0,
        left: 0,
    });

    const menuRef = useRef(null);

    /* =========================================================
       PAGINATION
    ========================================================= */

    const totalRows = Array.isArray(subDivisions)
        ? subDivisions.length
        : 0;

    const totalPages =
        totalRows === 0
            ? 0
            : Math.ceil(totalRows / rowsPerPage);

    const startIndex =
        (currentPage - 1) * rowsPerPage;

    const endIndex =
        startIndex + rowsPerPage;

    const currentRows = subDivisions.slice(
        startIndex,
        endIndex
    );

    /* =========================================================
       PAGINATION HANDLERS
    ========================================================= */

    const goFirst = () => {
        setCurrentPage(1);
    };

    const goLast = () => {
        if (totalPages > 0) {
            setCurrentPage(totalPages);
        }
    };

    const goPrevious = () => {
        setCurrentPage((prev) =>
            Math.max(prev - 1, 1)
        );
    };

    const goNext = () => {
        setCurrentPage((prev) =>
            Math.min(
                prev + 1,
                totalPages || 1
            )
        );
    };

    /* =========================================================
       IMPORTANT:
       When Active / Inactive filter changes, the number of
       records can change.

       Reset page if current page no longer exists.
    ========================================================= */

    useEffect(() => {
        if (totalPages === 0) {
            setCurrentPage(1);
            return;
        }

        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [
        totalRows,
        totalPages,
        currentPage,
    ]);

    /* =========================================================
       CLOSE MENU WHEN CLICKING OUTSIDE
    ========================================================= */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target
                )
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

    /* =========================================================
       OPEN STATUS CONFIRMATION
    ========================================================= */

    const handleStatusClick = (division) => {
        if (!division) return;

        /*
         * Make sure we keep the complete row object.
         * This is important because the parent needs
         * subdivision_id and current active status.
         */
        setSelectedStatusDivision(division);

        setShowStatusConfirm(true);

        setOpenMenu(null);
    };

    /* =========================================================
       CONFIRM STATUS CHANGE
    ========================================================= */

    const handleStatusConfirm = () => {
        if (!selectedStatusDivision) {
            return;
        }

        /*
         * Pass the complete division object to parent.
         *
         * Parent should use:
         *
         * division.subdivision_id
         *
         * and:
         *
         * { active: !division.active }
         */
        onStatusToggle?.(
            selectedStatusDivision
        );

        setShowStatusConfirm(false);
        setSelectedStatusDivision(null);
    };

    /* =========================================================
       CANCEL STATUS CHANGE
    ========================================================= */

    const handleStatusCancel = () => {
        setShowStatusConfirm(false);
        setSelectedStatusDivision(null);
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div
            ref={menuRef}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white"
        >
            {/* =====================================================
                TABLE
            ===================================================== */}

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
                                Sub Division Code
                            </th>

                            <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
                                Sub Division Name
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

                    {/* =================================================
                        BODY
                    ================================================= */}

                    <tbody>
                        {currentRows.length > 0 ? (
                            currentRows.map(
                                (division) => (
                                    <tr
                                        key={
                                            division.subdivision_id
                                        }
                                        onClick={() =>
                                            onSelect?.(
                                                division
                                            )
                                        }
                                        className={`cursor-pointer border-b ${
                                            selectedSubDivision?.subdivision_id ===
                                            division.subdivision_id
                                                ? "bg-blue-50"
                                                : "hover:bg-gray-50"
                                        }`}
                                    >
                                        {/* =================================
                                            CODE
                                        ================================= */}

                                        <td className="px-2.5 py-1.5 text-center text-[10px] font-medium leading-tight text-gray-800">
                                            {
                                                division.subdivision_code
                                            }
                                        </td>

                                        {/* =================================
                                            NAME
                                        ================================= */}

                                        <td className="px-2.5 py-1.5 text-center text-[10px] font-medium leading-tight text-gray-800">
                                            {
                                                division.subdivision_name
                                            }
                                        </td>

                                        {/* =================================
                                            PARENT DIVISION
                                        ================================= */}

                                        <td className="px-2.5 py-1.5 text-center text-[10px] font-medium leading-tight text-gray-800">
                                            {
                                                division.parent_division_name
                                            }
                                        </td>

                                        {/* =================================
                                            STATUS
                                        ================================= */}

                                        <td className="px-2.5 py-1.5 text-center">
                                            <span
                                                className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-tight ${
                                                    division.active
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {division.active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        {/* =================================
                                            ACTIONS
                                        ================================= */}

                                        <td className="px-2.5 py-1.5">
                                            <div className="flex justify-center gap-1">
                                                {/* =========================
                                                    EDIT
                                                ========================= */}

                                                <button
                                                    onClick={(
                                                        e
                                                    ) => {
                                                        e.stopPropagation();

                                                        /*
                                                         * Keep complete
                                                         * division object.
                                                         */
                                                        onEdit?.(
                                                            division
                                                        );
                                                    }}
                                                    className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100"
                                                >
                                                    <Pencil
                                                        size={
                                                            11
                                                        }
                                                        className="text-gray-900"
                                                    />
                                                </button>

                                                {/* =========================
                                                    MORE MENU
                                                ========================= */}

                                                <div className="relative">
                                                    <button
                                                        onClick={(
                                                            e
                                                        ) => {
                                                            e.stopPropagation();

                                                            const rect =
                                                                e.currentTarget.getBoundingClientRect();

                                                            setMenuPosition(
                                                                {
                                                                    top:
                                                                        rect.bottom +
                                                                        5,
                                                                    left:
                                                                        rect.right -
                                                                        145,
                                                                }
                                                            );

                                                            setOpenMenu(
                                                                openMenu ===
                                                                    division.subdivision_id
                                                                    ? null
                                                                    : division.subdivision_id
                                                            );
                                                        }}
                                                        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100"
                                                    >
                                                        <MoreVertical
                                                            size={
                                                                11
                                                            }
                                                            className="text-gray-900"
                                                        />
                                                    </button>

                                                    {/* =====================
                                                        MENU
                                                    ===================== */}

                                                    {openMenu ===
                                                        division.subdivision_id && (
                                                        <div
                                                            className="fixed z-9999 w-36 rounded-md border border-gray-200 bg-white shadow-lg"
                                                            style={{
                                                                top:
                                                                    menuPosition.top,
                                                                left:
                                                                    menuPosition.left,
                                                            }}
                                                        >
                                                            {/* VIEW DETAILS */}

                                                            <button
                                                                onClick={() => {
                                                                    onSelect?.(
                                                                        division
                                                                    );

                                                                    setOpenMenu(
                                                                        null
                                                                    );
                                                                }}
                                                                className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                                                            >
                                                                View
                                                                Details
                                                            </button>

                                                            {/* ACTIVATE /
                                                                DEACTIVATE */}

                                                            <button
                                                                onClick={() =>
                                                                    handleStatusClick(
                                                                        division
                                                                    )
                                                                }
                                                                className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                                                            >
                                                                {division.active
                                                                    ? "Deactivate"
                                                                    : "Activate"}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )
                        ) : (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="py-6 text-center text-sm text-gray-500"
                                >
                                    No Sub Divisions
                                    found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* =====================================================
                PAGINATION
            ===================================================== */}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-gray-50/40 px-4 py-2">
                {/* RECORD INFO */}

                <p className="text-[9px] text-gray-700">
                    Showing{" "}
                    {totalRows === 0
                        ? 0
                        : startIndex + 1}{" "}
                    to{" "}
                    {Math.min(
                        endIndex,
                        totalRows
                    )}{" "}
                    of {totalRows} Sub Divisions
                </p>

                {/* PAGINATION BUTTONS */}

                <div className="flex items-center gap-1">
                    {/* FIRST */}

                    <button
                        onClick={goFirst}
                        disabled={
                            currentPage === 1 ||
                            totalPages === 0
                        }
                        className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                    >
                        <ChevronsLeft className="h-3.5 w-3.5" />
                    </button>

                    {/* PREVIOUS */}

                    <button
                        onClick={goPrevious}
                        disabled={
                            currentPage === 1 ||
                            totalPages === 0
                        }
                        className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </button>

                    {/* PAGE NUMBERS */}

                    {Array.from(
                        {
                            length: totalPages,
                        },
                        (_, index) => {
                            const page =
                                index + 1;

                            return (
                                <button
                                    key={page}
                                    onClick={() =>
                                        setCurrentPage(
                                            page
                                        )
                                    }
                                    className={`h-6 w-6 rounded text-[9px] font-medium ${
                                        currentPage ===
                                        page
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        }
                    )}

                    {/* NEXT */}

                    <button
                        onClick={goNext}
                        disabled={
                            totalPages === 0 ||
                            currentPage ===
                                totalPages
                        }
                        className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    {/* LAST */}

                    <button
                        onClick={goLast}
                        disabled={
                            totalPages === 0 ||
                            currentPage ===
                                totalPages
                        }
                        className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                    >
                        <ChevronsRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* =====================================================
                ACTIVATE / DEACTIVATE CONFIRMATION
            ===================================================== */}

            <ConfirmationModel
                open={showStatusConfirm}
                title={
                    selectedStatusDivision?.active
                        ? "Deactivate Sub Division"
                        : "Activate Sub Division"
                }
                message={
                    selectedStatusDivision?.active
                        ? `Are you sure you want to deactivate ${selectedStatusDivision?.subdivision_name}?`
                        : `Are you sure you want to activate ${selectedStatusDivision?.subdivision_name}?`
                }
                confirmText={
                    selectedStatusDivision?.active
                        ? "Deactivate"
                        : "Activate"
                }
                cancelText="Cancel"
                onCancel={
                    handleStatusCancel
                }
                onConfirm={
                    handleStatusConfirm
                }
            />
        </div>
    );
}