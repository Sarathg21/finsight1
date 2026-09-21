
import {
    Pencil,
    MoreVertical,
    ChevronsLeft,
    ChevronsRight,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";
import ConfirmationModel from "../Common/ConfirmationModel";

export default function SubDivisionTable({
    subDivisions = [],
    onEdit,
    onSelect,
    selectedSubDivision,
    onStatusToggle,
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(9);

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
            {/* =====================================================
                TABLE
            ===================================================== */}

            <div
                style={{
                    width: "100%",
                    overflowX: "auto",
                    overflowY: "visible",
                    boxSizing: "border-box",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        minWidth: "720px",
                        tableLayout: "fixed",
                        borderCollapse: "collapse",
                        borderSpacing: 0,
                        height: "auto",
                        margin: 0,
                    }}
                >
                    {/* =================================================
                        FIXED COLUMN WIDTHS
                    ================================================= */}

                    <colgroup>
                        <col
                            style={{
                                width: "17%",
                            }}
                        />

                        <col
                            style={{
                                width: "23%",
                            }}
                        />

                        <col
                            style={{
                                width: "27%",
                            }}
                        />

                        <col
                            style={{
                                width: "15%",
                            }}
                        />

                        <col
                            style={{
                                width: "18%",
                            }}
                        />
                    </colgroup>

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <thead
                        style={{
                            backgroundColor: "#f9fafb",
                        }}
                    >
                        <tr
                            style={{
                                height: "30px",
                                borderBottom:
                                    "1px solid #e5e7eb",
                            }}
                        >
                            <th
                                style={{
                                    height: "30px",
                                    padding: "4px 8px",
                                    verticalAlign: "middle",
                                    textAlign: "center",
                                    fontSize: "9px",
                                    fontWeight: 700,
                                    lineHeight: "12px",
                                    letterSpacing:
                                        "0.02em",
                                    color: "#4b5563",
                                    whiteSpace:
                                        "nowrap",
                                    overflow: "hidden",
                                    textOverflow:
                                        "ellipsis",
                                    borderRight:
                                        "1px solid #e5e7eb",
                                    boxSizing:
                                        "border-box",
                                }}
                            >
                                Sub Division Code
                            </th>

                            <th
                                style={{
                                    height: "30px",
                                    padding: "4px 8px",
                                    verticalAlign: "middle",
                                    textAlign: "center",
                                    fontSize: "9px",
                                    fontWeight: 700,
                                    lineHeight: "12px",
                                    letterSpacing:
                                        "0.02em",
                                    color: "#4b5563",
                                    whiteSpace:
                                        "nowrap",
                                    overflow: "hidden",
                                    textOverflow:
                                        "ellipsis",
                                    borderRight:
                                        "1px solid #e5e7eb",
                                    boxSizing:
                                        "border-box",
                                }}
                            >
                                Sub Division Name
                            </th>

                            <th
                                style={{
                                    height: "30px",
                                    padding: "4px 8px",
                                    verticalAlign: "middle",
                                    textAlign: "center",
                                    fontSize: "9px",
                                    fontWeight: 700,
                                    lineHeight: "12px",
                                    letterSpacing:
                                        "0.02em",
                                    color: "#4b5563",
                                    whiteSpace:
                                        "nowrap",
                                    overflow: "hidden",
                                    textOverflow:
                                        "ellipsis",
                                    borderRight:
                                        "1px solid #e5e7eb",
                                    boxSizing:
                                        "border-box",
                                }}
                            >
                                Parent Division Name
                            </th>

                            <th
                                style={{
                                    height: "30px",
                                    padding: "4px 8px",
                                    verticalAlign: "middle",
                                    textAlign: "center",
                                    fontSize: "9px",
                                    fontWeight: 700,
                                    lineHeight: "12px",
                                    letterSpacing:
                                        "0.02em",
                                    color: "#4b5563",
                                    whiteSpace:
                                        "nowrap",
                                    overflow: "hidden",
                                    textOverflow:
                                        "ellipsis",
                                    borderRight:
                                        "1px solid #e5e7eb",
                                    boxSizing:
                                        "border-box",
                                }}
                            >
                                Status
                            </th>

                            <th
                                style={{
                                    height: "30px",
                                    padding: "4px 8px",
                                    verticalAlign: "middle",
                                    textAlign: "center",
                                    fontSize: "9px",
                                    fontWeight: 700,
                                    lineHeight: "12px",
                                    letterSpacing:
                                        "0.02em",
                                    color: "#4b5563",
                                    whiteSpace:
                                        "nowrap",
                                    overflow: "hidden",
                                    textOverflow:
                                        "ellipsis",
                                    boxSizing:
                                        "border-box",
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
                                        style={{
                                            height: "32px",
                                            borderBottom:
                                                "1px solid #f3f4f6",
                                            cursor: "pointer",
                                            backgroundColor:
                                                selectedSubDivision?.subdivision_id ===
                                                division.subdivision_id
                                                    ? "#eff6ff"
                                                    : "#ffffff",
                                        }}
                                        onMouseEnter={(
                                            e
                                        ) => {
                                            if (
                                                selectedSubDivision?.subdivision_id !==
                                                division.subdivision_id
                                            ) {
                                                e.currentTarget.style.backgroundColor =
                                                    "#f9fafb";
                                            }
                                        }}
                                        onMouseLeave={(
                                            e
                                        ) => {
                                            if (
                                                selectedSubDivision?.subdivision_id !==
                                                division.subdivision_id
                                            ) {
                                                e.currentTarget.style.backgroundColor =
                                                    "#ffffff";
                                            }
                                        }}
                                    >
                                        {/* =================================
                                            CODE
                                        ================================= */}

                                        <td
                                            style={{
                                                height: "32px",
                                                padding: "4px 8px",
                                                verticalAlign:
                                                    "middle",
                                                textAlign:
                                                    "center",
                                                fontSize:
                                                    "10px",
                                                fontWeight:
                                                    500,
                                                lineHeight:
                                                    "14px",
                                                color: "#1f2937",
                                                whiteSpace:
                                                    "nowrap",
                                                overflow:
                                                    "hidden",
                                                textOverflow:
                                                    "ellipsis",
                                                boxSizing:
                                                    "border-box",
                                            }}
                                        >
                                            {
                                                division.subdivision_code
                                            }
                                        </td>

                                        {/* =================================
                                            NAME
                                        ================================= */}

                                        <td
                                            style={{
                                                height: "32px",
                                                padding: "4px 8px",
                                                verticalAlign:
                                                    "middle",
                                                textAlign:
                                                    "center",
                                                fontSize:
                                                    "10px",
                                                fontWeight:
                                                    500,
                                                lineHeight:
                                                    "14px",
                                                color: "#1f2937",
                                                whiteSpace:
                                                    "nowrap",
                                                overflow:
                                                    "hidden",
                                                textOverflow:
                                                    "ellipsis",
                                                boxSizing:
                                                    "border-box",
                                            }}
                                        >
                                            {
                                                division.subdivision_name
                                            }
                                        </td>

                                        {/* =================================
                                            PARENT DIVISION
                                        ================================= */}

                                        <td
                                            style={{
                                                height: "32px",
                                                padding: "4px 8px",
                                                verticalAlign:
                                                    "middle",
                                                textAlign:
                                                    "center",
                                                fontSize:
                                                    "10px",
                                                fontWeight:
                                                    500,
                                                lineHeight:
                                                    "14px",
                                                color: "#1f2937",
                                                whiteSpace:
                                                    "nowrap",
                                                overflow:
                                                    "hidden",
                                                textOverflow:
                                                    "ellipsis",
                                                boxSizing:
                                                    "border-box",
                                            }}
                                        >
                                            {
                                                division.parent_division_name
                                            }
                                        </td>

                                        {/* =================================
                                            STATUS
                                        ================================= */}

                                        <td
                                            style={{
                                                height: "32px",
                                                padding: "4px 8px",
                                                verticalAlign:
                                                    "middle",
                                                textAlign:
                                                    "center",
                                                boxSizing:
                                                    "border-box",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display:
                                                        "inline-flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    minWidth:
                                                        "48px",
                                                    height:
                                                        "18px",
                                                    padding:
                                                        "0 6px",
                                                    borderRadius:
                                                        "9999px",
                                                    fontSize:
                                                        "8px",
                                                    fontWeight:
                                                        500,
                                                    lineHeight:
                                                        "18px",
                                                    whiteSpace:
                                                        "nowrap",
                                                    backgroundColor:
                                                        division.active
                                                            ? "#dcfce7"
                                                            : "#f3f4f6",
                                                    color:
                                                        division.active
                                                            ? "#15803d"
                                                            : "#4b5563",
                                                    boxSizing:
                                                        "border-box",
                                                }}
                                            >
                                                {division.active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        {/* =================================
                                            ACTIONS
                                        ================================= */}

                                        <td
                                            style={{
                                                height: "32px",
                                                padding: "4px 8px",
                                                verticalAlign:
                                                    "middle",
                                                textAlign:
                                                    "center",
                                                boxSizing:
                                                    "border-box",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "100%",
                                                    height: "24px",
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    gap: "2px",
                                                }}
                                            >
                                                {/* =========================
                                                    EDIT
                                                ========================= */}

                                                <button
                                                    onClick={(
                                                        e
                                                    ) => {
                                                        e.stopPropagation();

                                                        onEdit?.(
                                                            division
                                                        );
                                                    }}
                                                    style={{
                                                        width: "21px",
                                                        height: "21px",
                                                        padding: 0,
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                        border:
                                                            "none",
                                                        borderRadius:
                                                            "4px",
                                                        backgroundColor:
                                                            "transparent",
                                                        cursor:
                                                            "pointer",
                                                    }}
                                                    onMouseEnter={(
                                                        e
                                                    ) => {
                                                        e.currentTarget.style.backgroundColor =
                                                            "#f3f4f6";
                                                    }}
                                                    onMouseLeave={(
                                                        e
                                                    ) => {
                                                        e.currentTarget.style.backgroundColor =
                                                            "transparent";
                                                    }}
                                                >
                                                    <Pencil
                                                        size={
                                                            11
                                                        }
                                                        style={{
                                                            color: "#111827",
                                                        }}
                                                    />
                                                </button>

                                                {/* =========================
                                                    MORE MENU
                                                ========================= */}

                                                <div
                                                    style={{
                                                        position:
                                                            "relative",
                                                    }}
                                                >
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
                                                        style={{
                                                            width: "21px",
                                                            height: "21px",
                                                            padding: 0,
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            border:
                                                                "none",
                                                            borderRadius:
                                                                "4px",
                                                            backgroundColor:
                                                                "transparent",
                                                            cursor:
                                                                "pointer",
                                                        }}
                                                        onMouseEnter={(
                                                            e
                                                        ) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                "#f3f4f6";
                                                        }}
                                                        onMouseLeave={(
                                                            e
                                                        ) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                "transparent";
                                                        }}
                                                    >
                                                        <MoreVertical
                                                            size={
                                                                11
                                                            }
                                                            style={{
                                                                color: "#111827",
                                                            }}
                                                        />
                                                    </button>

                                                    {/* =====================
                                                        MENU
                                                    ===================== */}

                                                    {openMenu ===
                                                        division.subdivision_id && (
                                                        <div
                                                            style={{
                                                                position:
                                                                    "fixed",
                                                                zIndex: 9999,
                                                                width: "144px",
                                                                top:
                                                                    menuPosition.top,
                                                                left:
                                                                    menuPosition.left,
                                                                border: "1px solid #e5e7eb",
                                                                borderRadius:
                                                                    "6px",
                                                                backgroundColor:
                                                                    "#ffffff",
                                                                boxShadow:
                                                                    "0 10px 25px rgba(0,0,0,0.10)",
                                                                overflow:
                                                                    "hidden",
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
                                                                style={{
                                                                    display:
                                                                        "block",
                                                                    width: "100%",
                                                                    padding:
                                                                        "8px 12px",
                                                                    border:
                                                                        "none",
                                                                    backgroundColor:
                                                                        "transparent",
                                                                    textAlign:
                                                                        "left",
                                                                    fontSize:
                                                                        "12px",
                                                                    lineHeight:
                                                                        "16px",
                                                                    color: "#374151",
                                                                    cursor:
                                                                        "pointer",
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
                                                                style={{
                                                                    display:
                                                                        "block",
                                                                    width: "100%",
                                                                    padding:
                                                                        "8px 12px",
                                                                    border:
                                                                        "none",
                                                                    backgroundColor:
                                                                        "transparent",
                                                                    textAlign:
                                                                        "left",
                                                                    fontSize:
                                                                        "12px",
                                                                    lineHeight:
                                                                        "16px",
                                                                    color: "#374151",
                                                                    cursor:
                                                                        "pointer",
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
                                    style={{
                                        height: "60px",
                                        padding: "8px",
                                        textAlign:
                                            "center",
                                        verticalAlign:
                                            "middle",
                                        fontSize: "12px",
                                        color: "#6b7280",
                                    }}
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
                Immediately after table
            ===================================================== */}

            <div
                style={{
                    width: "100%",
                    height: "36px",
                    minHeight: "36px",
                    flex: "0 0 36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    padding: "0 12px",
                    borderTop:
                        "1px solid #e5e7eb",
                    backgroundColor:
                        "rgba(249,250,251,0.4)",
                    boxSizing: "border-box",
                }}
            >
                {/* RECORD INFO */}

                <p
                    style={{
                        margin: 0,
                        fontSize: "9px",
                        lineHeight: "12px",
                        color: "#374151",
                        whiteSpace:
                            "nowrap",
                    }}
                >
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

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                    }}
                >
                    {/* FIRST */}

                    <button
                        onClick={goFirst}
                        disabled={
                            currentPage === 1 ||
                            totalPages === 0
                        }
                        style={{
                            width: "22px",
                            height: "22px",
                            padding: 0,
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            border: "none",
                            borderRadius: "4px",
                            backgroundColor:
                                "transparent",
                            color: "#6b7280",
                            cursor:
                                currentPage ===
                                    1 ||
                                totalPages === 0
                                    ? "not-allowed"
                                    : "pointer",
                            opacity:
                                currentPage ===
                                    1 ||
                                totalPages === 0
                                    ? 0.4
                                    : 1,
                        }}
                    >
                        <ChevronsLeft
                            style={{
                                width: "14px",
                                height: "14px",
                            }}
                        />
                    </button>

                    {/* PREVIOUS */}

                    <button
                        onClick={goPrevious}
                        disabled={
                            currentPage === 1 ||
                            totalPages === 0
                        }
                        style={{
                            width: "22px",
                            height: "22px",
                            padding: 0,
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            border: "none",
                            borderRadius: "4px",
                            backgroundColor:
                                "transparent",
                            color: "#6b7280",
                            cursor:
                                currentPage ===
                                    1 ||
                                totalPages === 0
                                    ? "not-allowed"
                                    : "pointer",
                            opacity:
                                currentPage ===
                                    1 ||
                                totalPages === 0
                                    ? 0.4
                                    : 1,
                        }}
                    >
                        <ChevronLeft
                            style={{
                                width: "14px",
                                height: "14px",
                            }}
                        />
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
                                    style={{
                                        width: "22px",
                                        height: "22px",
                                        padding: 0,
                                        border: "none",
                                        borderRadius:
                                            "4px",
                                        fontSize:
                                            "9px",
                                        lineHeight:
                                            "22px",
                                        fontWeight: 500,
                                        backgroundColor:
                                            currentPage ===
                                            page
                                                ? "#2563eb"
                                                : "transparent",
                                        color:
                                            currentPage ===
                                            page
                                                ? "#ffffff"
                                                : "#4b5563",
                                        cursor:
                                            "pointer",
                                    }}
                                    onMouseEnter={(
                                        e
                                    ) => {
                                        if (
                                            currentPage !==
                                            page
                                        ) {
                                            e.currentTarget.style.backgroundColor =
                                                "#f3f4f6";
                                        }
                                    }}
                                    onMouseLeave={(
                                        e
                                    ) => {
                                        if (
                                            currentPage !==
                                            page
                                        ) {
                                            e.currentTarget.style.backgroundColor =
                                                "transparent";
                                        }
                                    }}
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
                        style={{
                            width: "22px",
                            height: "22px",
                            padding: 0,
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            border: "none",
                            borderRadius: "4px",
                            backgroundColor:
                                "transparent",
                            color: "#6b7280",
                            cursor:
                                totalPages ===
                                    0 ||
                                currentPage ===
                                    totalPages
                                    ? "not-allowed"
                                    : "pointer",
                            opacity:
                                totalPages ===
                                    0 ||
                                currentPage ===
                                    totalPages
                                    ? 0.4
                                    : 1,
                        }}
                    >
                        <ChevronRight
                            style={{
                                width: "14px",
                                height: "14px",
                            }}
                        />
                    </button>

                    {/* LAST */}

                    <button
                        onClick={goLast}
                        disabled={
                            totalPages === 0 ||
                            currentPage ===
                                totalPages
                        }
                        style={{
                            width: "22px",
                            height: "22px",
                            padding: 0,
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            border: "none",
                            borderRadius: "4px",
                            backgroundColor:
                                "transparent",
                            color: "#6b7280",
                            cursor:
                                totalPages ===
                                    0 ||
                                currentPage ===
                                    totalPages
                                    ? "not-allowed"
                                    : "pointer",
                            opacity:
                                totalPages ===
                                    0 ||
                                currentPage ===
                                    totalPages
                                    ? 0.4
                                    : 1,
                        }}
                    >
                        <ChevronsRight
                            style={{
                                width: "14px",
                                height: "14px",
                            }}
                        />
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