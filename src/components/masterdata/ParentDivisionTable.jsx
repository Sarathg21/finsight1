// import {
//     Pencil,
//     MoreVertical,
//     ChevronsLeft,
//     ChevronsRight,
//     ChevronLeft,
//     ChevronRight,
// } from "lucide-react";

// import { useState, useEffect, useRef } from "react";
// import ConfirmationModel from "../Common/ConfirmationModel";

// export default function ParentDivisionTable({
//     parentDivisions = [],
//     onEdit,
//     onSelect,
//     selectedParentDivision,
//     onStatusToggle,
// }) {
//     const [currentPage, setCurrentPage] = useState(1);
//     const [rowsPerPage] = useState(8);

//     const [showStatusConfirm, setShowStatusConfirm] = useState(false);
//     const [selectedStatusDivision, setSelectedStatusDivision] =
//         useState(null);

//     const [menuPosition, setMenuPosition] = useState({
//         top: 0,
//         left: 0,
//     });

//     const [openMenu, setOpenMenu] = useState(null);

//     const menuRef = useRef(null);

//     const totalRows = parentDivisions.length;

//     const totalPages = Math.ceil(
//         totalRows / rowsPerPage
//     );

//     const startIndex =
//         (currentPage - 1) * rowsPerPage;

//     const endIndex =
//         startIndex + rowsPerPage;

//     const currentRows =
//         parentDivisions.slice(
//             startIndex,
//             endIndex
//         );

//     /* =========================================================
//        PAGINATION
//     ========================================================= */

//     const goFirst = () => {
//         setCurrentPage(1);
//     };

//     const goLast = () => {
//         if (totalPages > 0) {
//             setCurrentPage(totalPages);
//         }
//     };

//     const goPrevious = () => {
//         setCurrentPage((prev) =>
//             Math.max(prev - 1, 1)
//         );
//     };

//     const goNext = () => {
//         setCurrentPage((prev) =>
//             Math.min(prev + 1, totalPages)
//         );
//     };

//     /* =========================================================
//        CLOSE MENU WHEN CLICKING OUTSIDE
//     ========================================================= */

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (
//                 menuRef.current &&
//                 !menuRef.current.contains(event.target)
//             ) {
//                 setOpenMenu(null);
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
//        FIX PAGE WHEN DATA LENGTH CHANGES
//     ========================================================= */

//     useEffect(() => {
//         const newTotalPages = Math.ceil(
//             parentDivisions.length / rowsPerPage
//         );

//         if (newTotalPages === 0) {
//             setCurrentPage(1);
//         } else if (currentPage > newTotalPages) {
//             setCurrentPage(newTotalPages);
//         }
//     }, [
//         parentDivisions.length,
//         currentPage,
//         rowsPerPage,
//     ]);

//     /* =========================================================
//        VIEW DETAILS
//     ========================================================= */

//     const handleViewDetails = (event, division) => {
//         event.preventDefault();
//         event.stopPropagation();

//         console.log(
//             "VIEW PARENT DIVISION:",
//             division
//         );

//         console.log(
//             "VIEW PARENT DIVISION ID:",
//             division?.parent_division_id
//         );

//         if (
//             division?.parent_division_id === undefined ||
//             division?.parent_division_id === null
//         ) {
//             console.error(
//                 "Parent Division ID missing:",
//                 division
//             );
//             return;
//         }

//         // Close menu first
//         setOpenMenu(null);

//         // Send selected division to parent
//         onSelect?.(division);
//     };

//     /* =========================================================
//        ACTIVATE / DEACTIVATE
//     ========================================================= */

//     const handleStatusClick = (event, division) => {
//         event.preventDefault();
//         event.stopPropagation();

//         console.log(
//             "STATUS CLICKED:",
//             division
//         );

//         console.log(
//             "PARENT DIVISION ID:",
//             division?.parent_division_id
//         );

//         if (
//             division?.parent_division_id === undefined ||
//             division?.parent_division_id === null
//         ) {
//             console.error(
//                 "Parent Division ID missing:",
//                 division
//             );
//             return;
//         }

//         // Save selected division
//         setSelectedStatusDivision(division);

//         // Close More menu
//         setOpenMenu(null);

//         // Open confirmation modal
//         setShowStatusConfirm(true);
//     };

//     return (
//         <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">

//             {/* =========================================================
//                 TABLE
//             ========================================================= */}

//             <div className="overflow-x-auto">

//                 <table className="w-full border-collapse">

//                     {/* =====================================================
//                         HEADER
//                     ===================================================== */}

//                     <thead className="border-b border-gray-200 bg-gray-50">

//                         <tr>

//                             <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
//                                 Parent Division Code
//                             </th>

//                             <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
//                                 Parent Division Name
//                             </th>

//                             <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
//                                 Status
//                             </th>

//                             <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
//                                 Action
//                             </th>

//                         </tr>

//                     </thead>

//                     {/* =====================================================
//                         BODY
//                     ===================================================== */}

//                     <tbody>

//                         {currentRows.length > 0 ? (

//                             currentRows.map((division) => (

//                                 <tr
//                                     key={
//                                         division.parent_division_id
//                                     }
//                                     onClick={() =>
//                                         onSelect?.(division)
//                                     }
//                                     className={`cursor-pointer border-b ${
//                                         selectedParentDivision?.parent_division_id ===
//                                         division.parent_division_id
//                                             ? "bg-blue-50"
//                                             : "hover:bg-gray-50"
//                                     }`}
//                                 >

//                                     {/* Parent Division Code */}

//                                     <td className="px-2.5 py-1.5 text-center text-[10px] font-medium leading-tight text-gray-800">

//                                         {
//                                             division.parent_division_code
//                                         }

//                                     </td>

//                                     {/* Parent Division Name */}

//                                     <td className="px-2.5 py-1.5 text-center text-[10px] font-medium leading-tight text-gray-800">

//                                         {
//                                             division.parent_division_name
//                                         }

//                                     </td>

//                                     {/* Status */}

//                                     <td className="px-2.5 py-1.5 text-center">

//                                         <span
//                                             className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-tight ${
//                                                 division.active
//                                                     ? "bg-green-100 text-green-700"
//                                                     : "bg-gray-100 text-gray-600"
//                                             }`}
//                                         >

//                                             {
//                                                 division.active
//                                                     ? "Active"
//                                                     : "Inactive"
//                                             }

//                                         </span>

//                                     </td>

//                                     {/* =================================================
//                                         ACTION
//                                     ================================================= */}

//                                     <td
//                                         className="px-2.5 py-1.5"
//                                         onClick={(e) =>
//                                             e.stopPropagation()
//                                         }
//                                     >

//                                         <div className="flex justify-center gap-1">

//                                             {/* =========================================
//                                                 EDIT
//                                             ========================================= */}

//                                             <button
//                                                 type="button"
//                                                 onClick={(e) => {

//                                                     e.preventDefault();
//                                                     e.stopPropagation();

//                                                     console.log(
//                                                         "EDIT PARENT DIVISION:",
//                                                         division
//                                                     );

//                                                     console.log(
//                                                         "EDIT ID:",
//                                                         division?.parent_division_id
//                                                     );

//                                                     if (
//                                                         division?.parent_division_id ===
//                                                             undefined ||
//                                                         division?.parent_division_id ===
//                                                             null
//                                                     ) {
//                                                         console.error(
//                                                             "Parent Division ID missing:",
//                                                             division
//                                                         );
//                                                         return;
//                                                     }

//                                                     onEdit?.(division);
//                                                 }}
//                                                 className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100"
//                                             >

//                                                 <Pencil
//                                                     size={11}
//                                                     className="text-gray-900"
//                                                 />

//                                             </button>

//                                             {/* =========================================
//                                                 MORE MENU
//                                             ========================================= */}

//                                             <div
//                                                 className="relative"
//                                                 ref={
//                                                     openMenu ===
//                                                     division.parent_division_id
//                                                         ? menuRef
//                                                         : null
//                                                 }
//                                             >

//                                                 <button
//                                                     type="button"
//                                                     onClick={(e) => {

//                                                         e.preventDefault();
//                                                         e.stopPropagation();

//                                                         const rect =
//                                                             e.currentTarget.getBoundingClientRect();

//                                                         console.log(
//                                                             "MORE CLICKED:",
//                                                             division
//                                                         );

//                                                         setMenuPosition({
//                                                             top:
//                                                                 rect.bottom +
//                                                                 5,

//                                                             left:
//                                                                 rect.right -
//                                                                 145,
//                                                         });

//                                                         setOpenMenu(
//                                                             openMenu ===
//                                                                 division.parent_division_id
//                                                                 ? null
//                                                                 : division.parent_division_id
//                                                         );
//                                                     }}
//                                                     className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100"
//                                                 >

//                                                     <MoreVertical
//                                                         size={11}
//                                                         className="text-gray-900"
//                                                     />

//                                                 </button>

//                                                 {/* =================================================
//                                                     DROPDOWN
//                                                 ================================================= */}

//                                                 {openMenu ===
//                                                     division.parent_division_id && (

//                                                     <div
//                                                         className="fixed z-9999 w-36 rounded-md border border-gray-200 bg-white shadow-lg"
//                                                         style={{
//                                                             top:
//                                                                 menuPosition.top,

//                                                             left:
//                                                                 menuPosition.left,
//                                                         }}
//                                                         onMouseDown={(e) =>
//                                                             e.stopPropagation()
//                                                         }
//                                                         onClick={(e) =>
//                                                             e.stopPropagation()
//                                                         }
//                                                     >

//                                                         {/* =====================================
//                                                             VIEW DETAILS
//                                                         ===================================== */}

//                                                         <button
//                                                             type="button"
//                                                             onMouseDown={(e) =>
//                                                                 e.stopPropagation()
//                                                             }
//                                                             onClick={(e) =>
//                                                                 handleViewDetails(
//                                                                     e,
//                                                                     division
//                                                                 )
//                                                             }
//                                                             className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
//                                                         >

//                                                             View Details

//                                                         </button>

//                                                         {/* =====================================
//                                                             ACTIVATE / DEACTIVATE
//                                                         ===================================== */}

//                                                         <button
//                                                             type="button"
//                                                             onMouseDown={(e) =>
//                                                                 e.stopPropagation()
//                                                             }
//                                                             onClick={(e) =>
//                                                                 handleStatusClick(
//                                                                     e,
//                                                                     division
//                                                                 )
//                                                             }
//                                                             className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
//                                                         >

//                                                             {
//                                                                 division.active
//                                                                     ? "Deactivate"
//                                                                     : "Activate"
//                                                             }

//                                                         </button>

//                                                     </div>

//                                                 )}

//                                             </div>

//                                         </div>

//                                     </td>

//                                 </tr>

//                             ))

//                         ) : (

//                             <tr>

//                                 <td
//                                     colSpan={4}
//                                     className="py-6 text-center text-sm text-gray-500"
//                                 >

//                                     No Parent Divisions found.

//                                 </td>

//                             </tr>

//                         )}

//                     </tbody>

//                 </table>

//             </div>

//             {/* =========================================================
//                 PAGINATION
//             ========================================================= */}

//             <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-gray-50/40 px-4 py-2">

//                 {/* Record Info */}

//                 <p className="text-[9px] text-gray-700">

//                     Showing{" "}

//                     {
//                         totalRows === 0
//                             ? 0
//                             : startIndex + 1
//                     }

//                     {" "}to{" "}

//                     {
//                         Math.min(
//                             endIndex,
//                             totalRows
//                         )
//                     }

//                     {" "}of{" "}

//                     {totalRows}

//                     {" "}Parent Divisions

//                 </p>

//                 {/* Pagination Buttons */}

//                 <div className="flex items-center gap-1">

//                     {/* First */}

//                     <button
//                         type="button"
//                         onClick={goFirst}
//                         disabled={
//                             currentPage === 1
//                         }
//                         className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
//                     >

//                         <ChevronsLeft className="h-3.5 w-3.5" />

//                     </button>

//                     {/* Previous */}

//                     <button
//                         type="button"
//                         onClick={goPrevious}
//                         disabled={
//                             currentPage === 1
//                         }
//                         className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
//                     >

//                         <ChevronLeft className="h-3.5 w-3.5" />

//                     </button>

//                     {/* Page Numbers */}

//                     {Array.from(
//                         {
//                             length: totalPages,
//                         },
//                         (_, index) => {

//                             const page =
//                                 index + 1;

//                             return (
//                                 <button
//                                     type="button"
//                                     key={page}
//                                     onClick={() =>
//                                         setCurrentPage(
//                                             page
//                                         )
//                                     }
//                                     className={`h-6 w-6 rounded text-[9px] font-medium ${
//                                         currentPage ===
//                                         page
//                                             ? "bg-blue-600 text-white"
//                                             : "text-gray-600 hover:bg-gray-100"
//                                     }`}
//                                 >

//                                     {page}

//                                 </button>
//                             );
//                         }
//                     )}

//                     {/* Next */}

//                     <button
//                         type="button"
//                         onClick={goNext}
//                         disabled={
//                             currentPage ===
//                                 totalPages ||
//                             totalPages === 0
//                         }
//                         className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
//                     >

//                         <ChevronRight className="h-3.5 w-3.5" />

//                     </button>

//                     {/* Last */}

//                     <button
//                         type="button"
//                         onClick={goLast}
//                         disabled={
//                             currentPage ===
//                                 totalPages ||
//                             totalPages === 0
//                         }
//                         className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
//                     >

//                         <ChevronsRight className="h-3.5 w-3.5" />

//                     </button>

//                 </div>

//             </div>

//             {/* =========================================================
//                 ACTIVATE / DEACTIVATE CONFIRMATION
//             ========================================================= */}

//             <ConfirmationModel
//                 open={
//                     showStatusConfirm
//                 }

//                 title={
//                     selectedStatusDivision?.active
//                         ? "Deactivate Parent Division"
//                         : "Activate Parent Division"
//                 }

//                 message={
//                     selectedStatusDivision?.active
//                         ? `Are you sure you want to deactivate ${selectedStatusDivision?.parent_division_name}?`
//                         : `Are you sure you want to activate ${selectedStatusDivision?.parent_division_name}?`
//                 }

//                 confirmText={
//                     selectedStatusDivision?.active
//                         ? "Deactivate"
//                         : "Activate"
//                 }

//                 cancelText="Cancel"

//                 onCancel={() => {

//                     setShowStatusConfirm(false);

//                     setSelectedStatusDivision(null);

//                 }}

//                 onConfirm={() => {

//                     console.log(
//                         "CONFIRM STATUS:",
//                         selectedStatusDivision
//                     );

//                     onStatusToggle?.(
//                         selectedStatusDivision
//                     );

//                     setShowStatusConfirm(false);

//                     setSelectedStatusDivision(null);

//                 }}
//             />

//         </div>
//     );
// }


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

export default function ParentDivisionTable({
    parentDivisions = [],
    onEdit,
    onSelect,
    selectedParentDivision,
    onStatusToggle,
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(8);

    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [selectedStatusDivision, setSelectedStatusDivision] =
        useState(null);

    const [menuPosition, setMenuPosition] = useState({
        top: 0,
        left: 0,
    });

    const [openMenu, setOpenMenu] = useState(null);

    const menuRef = useRef(null);

    const totalRows = parentDivisions.length;

    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const startIndex = (currentPage - 1) * rowsPerPage;

    const endIndex = startIndex + rowsPerPage;

    const currentRows = parentDivisions.slice(startIndex, endIndex);

    /* =========================================================
       PAGINATION
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
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const goNext = () => {
        setCurrentPage((prev) =>
            Math.min(prev + 1, totalPages)
        );
    };

    /* =========================================================
       CLOSE MENU WHEN CLICKING OUTSIDE
    ========================================================= */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setOpenMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    /* =========================================================
       FIX PAGE WHEN DATA LENGTH CHANGES
    ========================================================= */

    useEffect(() => {
        const newTotalPages = Math.ceil(
            parentDivisions.length / rowsPerPage
        );

        if (newTotalPages === 0) {
            setCurrentPage(1);
        } else if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
        }
    }, [
        parentDivisions.length,
        currentPage,
        rowsPerPage,
    ]);

    /* =========================================================
       VIEW DETAILS
    ========================================================= */

    const handleViewDetails = (event, division) => {
        event.preventDefault();
        event.stopPropagation();

        console.log("VIEW PARENT DIVISION:", division);

        console.log(
            "VIEW PARENT DIVISION ID:",
            division?.parent_division_id
        );

        if (
            division?.parent_division_id === undefined ||
            division?.parent_division_id === null
        ) {
            console.error(
                "Parent Division ID missing:",
                division
            );
            return;
        }

        setOpenMenu(null);

        onSelect?.(division);
    };

    /* =========================================================
       ACTIVATE / DEACTIVATE
    ========================================================= */

    const handleStatusClick = (event, division) => {
        event.preventDefault();
        event.stopPropagation();

        console.log("STATUS CLICKED:", division);

        console.log(
            "PARENT DIVISION ID:",
            division?.parent_division_id
        );

        if (
            division?.parent_division_id === undefined ||
            division?.parent_division_id === null
        ) {
            console.error(
                "Parent Division ID missing:",
                division
            );
            return;
        }

        setSelectedStatusDivision(division);

        setOpenMenu(null);

        setShowStatusConfirm(true);
    };

    return (
        <div
            style={{
                overflow: "hidden",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
                width: "100%",
            }}
        >
            {/* =========================================================
                TABLE
            ========================================================= */}

            <div
                style={{
                    width: "100%",
                    overflowX: "auto",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        tableLayout: "fixed",
                    }}
                >
                    {/* =====================================================
                        HEADER
                    ===================================================== */}

                    <thead
                        style={{
                            backgroundColor: "#f9fafb",
                            borderBottom: "1px solid #e5e7eb",
                        }}
                    >
                        <tr>
                            <th
                                style={{
                                    width: "30%",
                                    padding: "6px 10px",
                                    textAlign: "center",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    letterSpacing: "0.025em",
                                    color: "#4b5563",
                                    verticalAlign: "middle",
                                }}
                            >
                                Parent Division Code
                            </th>

                            <th
                                style={{
                                    width: "30%",
                                    padding: "6px 10px",
                                    textAlign: "center",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    letterSpacing: "0.025em",
                                    color: "#4b5563",
                                    verticalAlign: "middle",
                                }}
                            >
                                Parent Division Name
                            </th>

                            <th
                                style={{
                                    width: "20%",
                                    padding: "6px 10px",
                                    textAlign: "center",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    letterSpacing: "0.025em",
                                    color: "#4b5563",
                                    verticalAlign: "middle",
                                }}
                            >
                                Status
                            </th>

                            <th
                                style={{
                                    width: "20%",
                                    padding: "6px 10px",
                                    textAlign: "center",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    letterSpacing: "0.025em",
                                    color: "#4b5563",
                                    verticalAlign: "middle",
                                }}
                            >
                                Action
                            </th>
                        </tr>
                    </thead>

                    {/* =====================================================
                        BODY
                    ===================================================== */}

                    <tbody>
                        {currentRows.length > 0 ? (
                            currentRows.map((division) => (
                                <tr
                                    key={
                                        division.parent_division_id
                                    }
                                    onClick={() =>
                                        onSelect?.(division)
                                    }
                                    style={{
                                        cursor: "pointer",
                                        borderBottom:
                                            "1px solid #e5e7eb",
                                        backgroundColor:
                                            selectedParentDivision?.parent_division_id ===
                                            division.parent_division_id
                                                ? "#eff6ff"
                                                : "#ffffff",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (
                                            selectedParentDivision?.parent_division_id !==
                                            division.parent_division_id
                                        ) {
                                            e.currentTarget.style.backgroundColor =
                                                "#f9fafb";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (
                                            selectedParentDivision?.parent_division_id !==
                                            division.parent_division_id
                                        ) {
                                            e.currentTarget.style.backgroundColor =
                                                "#ffffff";
                                        }
                                    }}
                                >
                                    {/* Parent Division Code */}

                                    <td
                                        style={{
                                            width: "30%",
                                            padding: "6px 10px",
                                            textAlign: "center",
                                            verticalAlign: "middle",
                                            fontSize: "10px",
                                            fontWeight: 500,
                                            lineHeight: "1.2",
                                            color: "#1f2937",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {
                                            division.parent_division_code
                                        }
                                    </td>

                                    {/* Parent Division Name */}

                                    <td
                                        style={{
                                            width: "30%",
                                            padding: "6px 10px",
                                            textAlign: "center",
                                            verticalAlign: "middle",
                                            fontSize: "10px",
                                            fontWeight: 500,
                                            lineHeight: "1.2",
                                            color: "#1f2937",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {
                                            division.parent_division_name
                                        }
                                    </td>

                                    {/* Status */}

                                    <td
                                        style={{
                                            width: "20%",
                                            padding: "6px 10px",
                                            textAlign: "center",
                                            verticalAlign: "middle",
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
                                                borderRadius:
                                                    "9999px",
                                                padding:
                                                    "2px 7px",
                                                fontSize:
                                                    "9px",
                                                fontWeight: 500,
                                                lineHeight:
                                                    "1.2",
                                                backgroundColor:
                                                    division.active
                                                        ? "#dcfce7"
                                                        : "#f3f4f6",
                                                color:
                                                    division.active
                                                        ? "#15803d"
                                                        : "#4b5563",
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {division.active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>

                                    {/* =================================================
                                        ACTION
                                    ================================================= */}

                                    <td
                                        style={{
                                            width: "20%",
                                            padding: "6px 10px",
                                            textAlign: "center",
                                            verticalAlign: "middle",
                                        }}
                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent:
                                                    "center",
                                                alignItems:
                                                    "center",
                                                gap: "4px",
                                            }}
                                        >
                                            {/* EDIT */}

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();

                                                    console.log(
                                                        "EDIT PARENT DIVISION:",
                                                        division
                                                    );

                                                    console.log(
                                                        "EDIT ID:",
                                                        division?.parent_division_id
                                                    );

                                                    if (
                                                        division?.parent_division_id ===
                                                            undefined ||
                                                        division?.parent_division_id ===
                                                            null
                                                    ) {
                                                        console.error(
                                                            "Parent Division ID missing:",
                                                            division
                                                        );
                                                        return;
                                                    }

                                                    onEdit?.(
                                                        division
                                                    );
                                                }}
                                                style={{
                                                    display: "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    width: "24px",
                                                    height: "24px",
                                                    padding: 0,
                                                    border: "none",
                                                    borderRadius:
                                                        "4px",
                                                    backgroundColor:
                                                        "transparent",
                                                    cursor: "pointer",
                                                }}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                        "#f3f4f6")
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                        "transparent")
                                                }
                                            >
                                                <Pencil
                                                    size={11}
                                                    style={{
                                                        color: "#111827",
                                                    }}
                                                />
                                            </button>

                                            {/* MORE MENU */}

                                            <div
                                                style={{
                                                    position:
                                                        "relative",
                                                }}
                                                ref={
                                                    openMenu ===
                                                    division.parent_division_id
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

                                                        console.log(
                                                            "MORE CLICKED:",
                                                            division
                                                        );

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
                                                                division.parent_division_id
                                                                ? null
                                                                : division.parent_division_id
                                                        );
                                                    }}
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                        width: "24px",
                                                        height: "24px",
                                                        padding: 0,
                                                        border: "none",
                                                        borderRadius:
                                                            "4px",
                                                        backgroundColor:
                                                            "transparent",
                                                        cursor: "pointer",
                                                    }}
                                                    onMouseEnter={(e) =>
                                                        (e.currentTarget.style.backgroundColor =
                                                            "#f3f4f6")
                                                    }
                                                    onMouseLeave={(e) =>
                                                        (e.currentTarget.style.backgroundColor =
                                                            "transparent")
                                                    }
                                                >
                                                    <MoreVertical
                                                        size={11}
                                                        style={{
                                                            color: "#111827",
                                                        }}
                                                    />
                                                </button>

                                                {/* DROPDOWN */}

                                                {openMenu ===
                                                    division.parent_division_id && (
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
                                                            border:
                                                                "1px solid #e5e7eb",
                                                            borderRadius:
                                                                "6px",
                                                            backgroundColor:
                                                                "#ffffff",
                                                            boxShadow:
                                                                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
                                                            overflow:
                                                                "hidden",
                                                        }}
                                                        onMouseDown={(
                                                            e
                                                        ) =>
                                                            e.stopPropagation()
                                                        }
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        {/* VIEW DETAILS */}

                                                        <button
                                                            type="button"
                                                            onMouseDown={(
                                                                e
                                                            ) =>
                                                                e.stopPropagation()
                                                            }
                                                            onClick={(
                                                                e
                                                            ) =>
                                                                handleViewDetails(
                                                                    e,
                                                                    division
                                                                )
                                                            }
                                                            style={{
                                                                display:
                                                                    "block",
                                                                width: "100%",
                                                                padding:
                                                                    "8px 12px",
                                                                border: "none",
                                                                backgroundColor:
                                                                    "#ffffff",
                                                                textAlign:
                                                                    "left",
                                                                fontSize:
                                                                    "12px",
                                                                color:
                                                                    "#374151",
                                                                cursor:
                                                                    "pointer",
                                                            }}
                                                            onMouseEnter={(
                                                                e
                                                            ) =>
                                                                (e.currentTarget.style.backgroundColor =
                                                                    "#f9fafb")
                                                            }
                                                            onMouseLeave={(
                                                                e
                                                            ) =>
                                                                (e.currentTarget.style.backgroundColor =
                                                                    "#ffffff")
                                                            }
                                                        >
                                                            View
                                                            Details
                                                        </button>

                                                        {/* ACTIVATE / DEACTIVATE */}

                                                        <button
                                                            type="button"
                                                            onMouseDown={(
                                                                e
                                                            ) =>
                                                                e.stopPropagation()
                                                            }
                                                            onClick={(
                                                                e
                                                            ) =>
                                                                handleStatusClick(
                                                                    e,
                                                                    division
                                                                )
                                                            }
                                                            style={{
                                                                display:
                                                                    "block",
                                                                width: "100%",
                                                                padding:
                                                                    "8px 12px",
                                                                border: "none",
                                                                backgroundColor:
                                                                    "#ffffff",
                                                                textAlign:
                                                                    "left",
                                                                fontSize:
                                                                    "12px",
                                                                color:
                                                                    "#374151",
                                                                cursor:
                                                                    "pointer",
                                                            }}
                                                            onMouseEnter={(
                                                                e
                                                            ) =>
                                                                (e.currentTarget.style.backgroundColor =
                                                                    "#f9fafb")
                                                            }
                                                            onMouseLeave={(
                                                                e
                                                            ) =>
                                                                (e.currentTarget.style.backgroundColor =
                                                                    "#ffffff")
                                                            }
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
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    style={{
                                        padding: "20px 10px",
                                        textAlign: "center",
                                        fontSize: "14px",
                                        color: "#6b7280",
                                    }}
                                >
                                    No Parent Divisions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* =========================================================
                PAGINATION
            ========================================================= */}

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    borderTop: "1px solid #e5e7eb",
                    backgroundColor: "rgba(249, 250, 251, 0.4)",
                    padding: "8px 16px",
                }}
            >
                {/* Record Info */}

                <p
                    style={{
                        margin: 0,
                        fontSize: "9px",
                        color: "#374151",
                    }}
                >
                    Showing{" "}
                    {totalRows === 0 ? 0 : startIndex + 1} to{" "}
                    {Math.min(endIndex, totalRows)} of{" "}
                    {totalRows} Parent Divisions
                </p>

                {/* Pagination Buttons */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}
                >
                    {/* First */}

                    <button
                        type="button"
                        onClick={goFirst}
                        disabled={currentPage === 1}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px",
                            border: "none",
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                            color: "#6b7280",
                            cursor:
                                currentPage === 1
                                    ? "not-allowed"
                                    : "pointer",
                            opacity:
                                currentPage === 1 ? 0.4 : 1,
                        }}
                    >
                        <ChevronsLeft
                            style={{
                                width: "14px",
                                height: "14px",
                            }}
                        />
                    </button>

                    {/* Previous */}

                    <button
                        type="button"
                        onClick={goPrevious}
                        disabled={currentPage === 1}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px",
                            border: "none",
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                            color: "#6b7280",
                            cursor:
                                currentPage === 1
                                    ? "not-allowed"
                                    : "pointer",
                            opacity:
                                currentPage === 1 ? 0.4 : 1,
                        }}
                    >
                        <ChevronLeft
                            style={{
                                width: "14px",
                                height: "14px",
                            }}
                        />
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
                                    style={{
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        width: "24px",
                                        height: "24px",
                                        padding: 0,
                                        border: "none",
                                        borderRadius: "4px",
                                        fontSize: "9px",
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
                                        cursor: "pointer",
                                    }}
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
                            totalPages === 0
                        }
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px",
                            border: "none",
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                            color: "#6b7280",
                            cursor:
                                currentPage === totalPages ||
                                totalPages === 0
                                    ? "not-allowed"
                                    : "pointer",
                            opacity:
                                currentPage === totalPages ||
                                totalPages === 0
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

                    {/* Last */}

                    <button
                        type="button"
                        onClick={goLast}
                        disabled={
                            currentPage === totalPages ||
                            totalPages === 0
                        }
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px",
                            border: "none",
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                            color: "#6b7280",
                            cursor:
                                currentPage === totalPages ||
                                totalPages === 0
                                    ? "not-allowed"
                                    : "pointer",
                            opacity:
                                currentPage === totalPages ||
                                totalPages === 0
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

            {/* =========================================================
                ACTIVATE / DEACTIVATE CONFIRMATION
            ========================================================= */}

            <ConfirmationModel
                open={showStatusConfirm}
                title={
                    selectedStatusDivision?.active
                        ? "Deactivate Parent Division"
                        : "Activate Parent Division"
                }
                message={
                    selectedStatusDivision?.active
                        ? `Are you sure you want to deactivate ${selectedStatusDivision?.parent_division_name}?`
                        : `Are you sure you want to activate ${selectedStatusDivision?.parent_division_name}?`
                }
                confirmText={
                    selectedStatusDivision?.active
                        ? "Deactivate"
                        : "Activate"
                }
                cancelText="Cancel"
                onCancel={() => {
                    setShowStatusConfirm(false);
                    setSelectedStatusDivision(null);
                }}
                onConfirm={() => {
                    console.log(
                        "CONFIRM STATUS:",
                        selectedStatusDivision
                    );

                    onStatusToggle?.(
                        selectedStatusDivision
                    );

                    setShowStatusConfirm(false);
                    setSelectedStatusDivision(null);
                }}
            />
        </div>
    );
}

