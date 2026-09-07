// import {
//   Pencil,
//   MoreVertical,
//   ArrowUpDown,
//   ChevronsLeft,
//   ChevronsRight,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";

// import { useState, useEffect, useRef } from "react";

// import ConfirmationModel from "../Common/ConfirmationModel";


// export default function AnalysisCodeTable({
//   analysisCodes = [],
//   onEdit,
//   onSelect,
//   selectedAnalysisCode,
//   onStatusToggle,
// }) {

//   const tableRef = useRef(null);
//   const menuRef = useRef(null);
//   const [openMenu, setOpenMenu] = useState(null);

//   const [showStatusConfirm, setShowStatusConfirm] = useState(false);
//   const [selectedStatusCode, setSelectedStatusCode] = useState(null);


//   /* Pagination */
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize,] = useState(8);

//   const totalRows = analysisCodes.length;
//   const totalPages = Math.ceil(totalRows / pageSize);

//   const startIndex = (currentPage - 1) * pageSize;
//   const endIndex = startIndex + pageSize;

//   const currentRows = analysisCodes.slice(startIndex, endIndex);

//   /* Close menu */
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         menuRef.current &&
//         !menuRef.current.contains(event.target)
//       ) {
//         setOpenMenu(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     const pages = Math.ceil(analysisCodes.length / pageSize);

//     if (pages === 0) {
//       setCurrentPage(1);
//     } else if (currentPage > pages) {
//       setCurrentPage(pages);
//     }
//   }, [analysisCodes.length, currentPage, pageSize]);


//   /* Pagination handlers */
//   const goFirst = () => {
//     setCurrentPage(1);
//     tableRef.current?.scrollTo({
//       top: 0,
//       behavior: "smooth"
//     });

//   };

//   const goLast = () => {
//     setCurrentPage(totalPages);
//     tableRef.current?.scrollTo({
//       top: 0,
//       behavior: "smooth"
//     });

//   };

//   const goPrevious = () => {
//     setCurrentPage((prev) =>
//       Math.max(prev - 1, 1)
//     );

//     tableRef.current?.scrollTo({
//       top: 0,
//       behavior: "smooth"
//     });

//   };


//   const goNext = () => {
//     setCurrentPage((prev) =>
//       Math.min(prev + 1, totalPages)
//     );

//     tableRef.current?.scrollTo({
//       top: 0,
//       behavior: "smooth"
//     });
//   };

//   return (
//     <div
//       className="
//         overflow-hidden
//         rounded-lg
//         border
//         border-gray-200
//         bg-white
//       ">

//       {/* Table */}
//       <div
//         ref={tableRef}
//         className="
//         max-h-105
//         overflow-y-auto
//         overflow-x-hidden
//       " >

//         <table className="w-full border-collapse">
//           {/* Header */}
//           <thead
//             className="
//               sticky
//               top-0
//               z-10
//               border-b
//               border-gray-200
//               bg-gray-50
//             " >


//             <tr>
//               <th
//                 className="
//                   px-3
//                   py-2
//                   text-left
//                   text-[9px]
//                   font-bold
//                   text-gray-600
//                 "
//               >

//                 <span className="flex items-center gap-1">
//                   Analysis Code
//                   <ArrowUpDown
//                     size={10}
//                     className="opacity-40"
//                   />
//                 </span>
//               </th>

//               <th
//                 className="
//                   px-3
//                   py-2
//                   text-left
//                   text-[9px]
//                   font-bold
//                   text-gray-600
//                 "
//               >
//                 <span className="flex items-center gap-1">
//                   Analysis Name
//                   <ArrowUpDown
//                     size={10}
//                     className="opacity-40"
//                   />
//                 </span>
//               </th>

//               <th
//                 className="
//                   px-3
//                   py-2
//                   text-left
//                   text-[9px]
//                   font-bold
//                   text-gray-600
//                 "
//               >
//                 <span className="flex items-center gap-1">
//                   SubDivision Name
//                   <ArrowUpDown
//                     size={10}
//                     className="opacity-40"
//                   />
//                 </span>
//               </th>

//               <th
//                 className="
//                   px-3
//                   py-2
//                   text-left
//                   text-[9px]
//                   font-bold
//                   text-gray-600
//                 "
//               >
//                 Status
//               </th>

//               <th
//                 className="
//                   px-3
//                   py-2
//                   text-center
//                   text-[9px]
//                   font-bold
//                   text-gray-600
//                 "
//               >
//                 Action
//               </th>
//             </tr>
//           </thead>


//           {/* Body */}
//           <tbody>
//             {
//               currentRows.length > 0 ? (
//                 currentRows.map((code, index) => {
//                   // Last 3 rows → dropdown opens upward
//                   const openUp = index >= currentRows.length - 3;

//                   return (
//                     <tr
//                       key={code.analysis_code_id}
//                       onClick={() => onSelect?.(code)}
//                       className={`
//                            cursor-pointer
//                            border-b
//                            border-gray-100
//                            ${selectedAnalysisCode?.analysis_code_id ===
//                           code.analysis_code_id
//                           ? "bg-blue-50"
//                           : "hover:bg-gray-50"
//                         }`}
//                     >
//                       <td
//                         className="
//                            px-3
//                            py-1.5
//                            text-[10px]
//                            font-medium
//                            text-gray-800
//                          "
//                       >
//                         {code.analysis_code}
//                       </td>

//                       <td
//                         className="
//                             px-3
//                             py-1.5
//                             text-[10px]
//                             text-gray-800
//                           "
//                       >
//                         {code.analysis_name}
//                       </td>

//                       <td
//                         className="
//                             px-3
//                             py-1.5
//                             text-[10px]
//                             text-gray-800
//                           "
//                       >
//                         {code.subdivision_name}
//                       </td>

//                       <td className="px-3 py-1.5">
//                         <span
//                           className={`
//                               rounded-full
//                               px-2
//                               py-0.5
//                               text-[9px]
//                               ${code.active
//                               ? "bg-green-100 text-green-700"
//                               : "bg-gray-100 text-gray-600"
//                             }`}
//                         >
//                           {code.active ? "Active" : "Inactive"}
//                         </span>
//                       </td>

//                       {/* Action */}
//                       <td
//                         className="relative w-17.5 px-3 py-1.5"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         <div
//                           className="relative flex justify-center gap-1"
//                           ref={
//                             openMenu === code.analysis_code_id
//                               ? menuRef
//                               : null
//                           }
//                         >
//                           {/* Edit */}
//                           <button
//                             onClick={() => onEdit?.(code)}
//                             className="
//                                flex
//                                h-6
//                                w-6
//                                items-center
//                                justify-center
//                                rounded
//                                hover:bg-gray-100
//                              "
//                           >
//                             <Pencil
//                               size={11}
//                               className="text-gray-700"
//                             />
//                           </button>

//                           {/* More */}
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();

//                               setOpenMenu(
//                                 openMenu === code.analysis_code_id
//                                   ? null
//                                   : code.analysis_code_id
//                               );
//                             }}
//                             className="
//                                   flex
//                                   h-6
//                                   w-6
//                                   items-center
//                                   justify-center
//                                   rounded
//                                   hover:bg-gray-100
//                                 "
//                           >
//                             <MoreVertical
//                               size={11}
//                               className="text-gray-700"
//                             />
//                           </button>

//                           {/* Dropdown */}
//                           {openMenu === code.analysis_code_id && (
//                             <div
//                               className={`
//                                     absolute
//                                     right-2
//                                     z-100
//                                     w-32
//                                     overflow-hidden
//                                     rounded-md
//                                     border
//                                     border-gray-200
//                                     bg-white
//                                     shadow-lg
//                                     ${openUp
//                                   ? "bottom-7"
//                                   : "top-7"
//                                 } `}
//                             >
//                               {/* View Details */}
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   onSelect?.(code);
//                                   setOpenMenu(null);
//                                 }}
//                                 className="
//                                     block
//                                     w-full
//                                     px-3
//                                     py-2
//                                     text-left
//                                     text-xs
//                                     hover:bg-gray-50
//                                   "
//                               >
//                                 View Details
//                               </button>

//                               {/* Activate / Deactivate */}
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();

//                                   setSelectedStatusCode(code);
//                                   setShowStatusConfirm(true);
//                                   setOpenMenu(null);
//                                 }}
//                                 className="
//                                    block
//                                    w-full
//                                    px-3
//                                    py-2
//                                    text-left
//                                    text-xs
//                                    hover:bg-gray-50
//                                  "
//                               >
//                                 {code.active
//                                   ? "Deactivate"
//                                   : "Activate"}
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td
//                     colSpan={4}
//                     className="
//                       py-10
//                       text-center
//                       text-sm
//                       text-gray-500
//                     "
//                   >
//                     No Analysis Codes found.
//                   </td>
//                 </tr>
//               )
//             }

//           </tbody>
//         </table>
//       </div>


//       {/* Pagination - UserTable Style */}
//       <div
//         className="
//           flex
//           flex-wrap
//           items-center
//           justify-between
//           gap-2
//           border-t
//           border-gray-200
//           bg-gray-50/40
//           px-4
//           py-2
//         "
//       >

//         {/* Record Info */}
//         <p
//           className="
//             text-[9px]
//             text-gray-700
//           "
//         >
//           Showing{" "}
//           {
//             totalRows === 0
//               ?
//               0
//               :
//               startIndex + 1
//           }

//           {" "}to{" "}

//           {
//             Math.min(
//               endIndex,
//               totalRows
//             )
//           }

//           {" "}of{" "}

//           {totalRows}

//           {" "}Analysis Codes
//         </p>

//         {/* Pagination Buttons */}
//         <div
//           className="
//             flex
//             items-center
//             gap-1
//           "
//         >

//           {/* First */}
//           <button
//             onClick={goFirst}
//             disabled={
//               currentPage === 1
//             }
//             className="
//               rounded
//               p-1
//               text-gray-500
//               hover:bg-gray-100
//               disabled:opacity-40
//             "

//           >
//             <ChevronsLeft
//               className="h-3.5 w-3.5"
//             />
//           </button>



//           {/* Previous */}
//           <button

//             onClick={goPrevious}

//             disabled={
//               currentPage === 1
//             }


//             className="
//               rounded
//               p-1
//               text-gray-500
//               hover:bg-gray-100
//               disabled:opacity-40
//             "

//           >

//             <ChevronLeft
//               className="h-3.5 w-3.5"
//             />


//           </button>






//           {/* Page Numbers */}


//           {

//             Array.from(
//               {
//                 length: totalPages
//               },

//               (_, index) => {

//                 const page = index + 1;


//                 return (

//                   <button

//                     key={page}


//                     onClick={() => {

//                       setCurrentPage(page);


//                       tableRef.current?.scrollTo({

//                         top: 0,

//                         behavior: "smooth"

//                       });


//                     }}


//                     className={`

//                       h-6
//                       w-6
//                       rounded
//                       text-[9px]
//                       font-medium

//                       ${currentPage === page

//                         ?

//                         "bg-blue-600 text-white"

//                         :

//                         "text-gray-600 hover:bg-gray-100"

//                       }

//                     `}

//                   >

//                     {page}


//                   </button>

//                 );


//               }

//             )

//           }







//           {/* Next */}


//           <button

//             onClick={goNext}

//             disabled={

//               currentPage === totalPages ||
//               totalPages === 0

//             }


//             className="
//               rounded
//               p-1
//               text-gray-500
//               hover:bg-gray-100
//               disabled:opacity-40
//             "

//           >

//             <ChevronRight
//               className="h-3.5 w-3.5"
//             />

//           </button>







//           {/* Last */}


//           <button

//             onClick={goLast}

//             disabled={

//               currentPage === totalPages ||
//               totalPages === 0

//             }


//             className="
//               rounded
//               p-1
//               text-gray-500
//               hover:bg-gray-100
//               disabled:opacity-40
//             "

//           >

//             <ChevronsRight
//               className="h-3.5 w-3.5"
//             />

//           </button>



//         </div>


//       </div>







//       {/* Confirmation Modal */}


//       <ConfirmationModel

//         open={showStatusConfirm}


//         title={
//           selectedStatusCode?.active
//             ?
//             "Deactivate Analysis Code"
//             :
//             "Activate Analysis Code"
//         }


//         message={
//           selectedStatusCode?.active
//             ?

//             `Are you sure you want to deactivate ${selectedStatusCode?.analysis_name}?`

//             :

//             `Are you sure you want to activate ${selectedStatusCode?.analysis_name}?`
//         }


//         confirmText={
//           selectedStatusCode?.active
//             ?
//             "Deactivate"
//             :
//             "Activate"
//         }


//         cancelText="Cancel"



//         onCancel={() => {

//           setShowStatusConfirm(false);

//           setSelectedStatusCode(null);

//         }}




//         onConfirm={() => {


//           onStatusToggle?.(
//             selectedStatusCode
//           );


//           setShowStatusConfirm(false);


//           setSelectedStatusCode(null);

//         }}

//       />

//     </div>

//   );

// }


import {
    Pencil,
    MoreVertical,
    ArrowUpDown,
    ChevronsLeft,
    ChevronsRight,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";

import ConfirmationModel from "../Common/ConfirmationModel";

export default function AnalysisCodeTable({
    analysisCodes = [],
    onEdit,
    onSelect,
    selectedAnalysisCode,
    onStatusToggle,
}) {
    const tableRef = useRef(null);
    const menuRef = useRef(null);
    const [openMenu, setOpenMenu] = useState(null);

    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [selectedStatusCode, setSelectedStatusCode] = useState(null);

    /* Pagination */
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(8);

    const totalRows = analysisCodes.length;
    const totalPages = Math.ceil(totalRows / pageSize);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const currentRows = analysisCodes.slice(startIndex, endIndex);

    /* Close menu */
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

    useEffect(() => {
        const pages = Math.ceil(
            analysisCodes.length / pageSize
        );

        if (pages === 0) {
            setCurrentPage(1);
        } else if (currentPage > pages) {
            setCurrentPage(pages);
        }
    }, [
        analysisCodes.length,
        currentPage,
        pageSize,
    ]);

    /* Pagination handlers */
    const goFirst = () => {
        setCurrentPage(1);

        tableRef.current?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const goLast = () => {
        setCurrentPage(totalPages);

        tableRef.current?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const goPrevious = () => {
        setCurrentPage((prev) =>
            Math.max(prev - 1, 1)
        );

        tableRef.current?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const goNext = () => {
        setCurrentPage((prev) =>
            Math.min(prev + 1, totalPages)
        );

        tableRef.current?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div
            style={{
                width: "100%",
                height: "auto",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
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
                ref={tableRef}
                style={{
                    width: "100%",
                    maxHeight: "420px",
                    overflowY: "auto",
                    overflowX: "hidden",
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
                        <col style={{ width: "24%" }} />
                        <col style={{ width: "27%" }} />
                        <col style={{ width: "14%" }} />
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
                            {/* Analysis Code */}

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
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "3px",
                                        width: "100%",
                                    }}
                                >
                                    <span
                                        style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Analysis Code
                                    </span>

                                    <ArrowUpDown
                                        size={9}
                                        style={{
                                            opacity: 0.4,
                                            flexShrink: 0,
                                        }}
                                    />
                                </span>
                            </th>

                            {/* Analysis Name */}

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
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "3px",
                                        width: "100%",
                                    }}
                                >
                                    <span
                                        style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Analysis Name
                                    </span>

                                    <ArrowUpDown
                                        size={9}
                                        style={{
                                            opacity: 0.4,
                                            flexShrink: 0,
                                        }}
                                    />
                                </span>
                            </th>

                            {/* SubDivision Name */}

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
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "3px",
                                        width: "100%",
                                    }}
                                >
                                    <span
                                        style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        SubDivision Name
                                    </span>

                                    <ArrowUpDown
                                        size={9}
                                        style={{
                                            opacity: 0.4,
                                            flexShrink: 0,
                                        }}
                                    />
                                </span>
                            </th>

                            {/* Status */}

                            <th
                                style={{
                                    padding: "4px 5px",
                                    fontSize: "9px",
                                    lineHeight: "12px",
                                    fontWeight: 600,
                                    color: "#4b5563",
                                    textAlign: "center",
                                    whiteSpace: "nowrap",
                                    borderRight:
                                        "1px solid #f3f4f6",
                                }}
                            >
                                Status
                            </th>

                            {/* Action */}

                            <th
                                style={{
                                    padding: "4px 4px",
                                    fontSize: "9px",
                                    lineHeight: "12px",
                                    fontWeight: 600,
                                    color: "#4b5563",
                                    textAlign: "center",
                                    whiteSpace: "nowrap",
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
                            currentRows.map((code, index) => {
                                // Last 3 rows → dropdown opens upward
                                const openUp =
                                    index >=
                                    currentRows.length - 3;

                                const selected =
                                    selectedAnalysisCode?.analysis_code_id ===
                                    code.analysis_code_id;

                                const menuOpen =
                                    openMenu ===
                                    code.analysis_code_id;

                                return (
                                    <tr
                                        key={
                                            code.analysis_code_id
                                        }
                                        onClick={() =>
                                            onSelect?.(code)
                                        }
                                        style={{
                                            height: "36px",
                                            cursor: "pointer",
                                            backgroundColor:
                                                selected
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
                                            ANALYSIS CODE
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
                                            {code.analysis_code ||
                                                "-"}
                                        </td>

                                        {/* =================================================
                                            ANALYSIS NAME
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
                                            {code.analysis_name ||
                                                "-"}
                                        </td>

                                        {/* =================================================
                                            SUBDIVISION NAME
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
                                            {code.subdivision_name ||
                                                "-"}
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
                                                    fontSize: "9px",
                                                    lineHeight:
                                                        "12px",
                                                    fontWeight: 500,
                                                    backgroundColor:
                                                        code.active
                                                            ? "#dcfce7"
                                                            : "#f3f4f6",
                                                    color: code.active
                                                        ? "#15803d"
                                                        : "#4b5563",
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                {code.active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        {/* =================================================
                                            ACTION
                                        ================================================= */}

                                        <td
                                            style={{
                                                position:
                                                    "relative",
                                                padding: "5px 4px",
                                                textAlign:
                                                    "center",
                                            }}
                                            onClick={(e) =>
                                                e.stopPropagation()
                                            }
                                        >
                                            <div
                                                style={{
                                                    position:
                                                        "relative",
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
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
                                                {/* Edit */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onEdit?.(
                                                            code
                                                        )
                                                    }
                                                    style={{
                                                        display:
                                                            "flex",
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
                                                        size={11}
                                                        style={{
                                                            color: "#374151",
                                                        }}
                                                    />
                                                </button>

                                                {/* More */}

                                                <button
                                                    type="button"
                                                    onClick={(
                                                        e
                                                    ) => {
                                                        e.stopPropagation();

                                                        setOpenMenu(
                                                            openMenu ===
                                                                code.analysis_code_id
                                                                ? null
                                                                : code.analysis_code_id
                                                        );
                                                    }}
                                                    style={{
                                                        display:
                                                            "flex",
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
                                                        size={11}
                                                        style={{
                                                            color: "#374151",
                                                        }}
                                                    />
                                                </button>

                                                {/* Dropdown */}

                                                {menuOpen && (
                                                    <div
                                                        style={{
                                                            position:
                                                                "absolute",
                                                            right: "2px",
                                                            zIndex: 100,
                                                            width: "128px",
                                                            overflow:
                                                                "hidden",
                                                            border:
                                                                "1px solid #e5e7eb",
                                                            borderRadius:
                                                                "6px",
                                                            backgroundColor:
                                                                "#ffffff",
                                                            boxShadow:
                                                                "0 4px 12px rgba(0, 0, 0, 0.10)",
                                                            ...(openUp
                                                                ? {
                                                                      bottom: "27px",
                                                                  }
                                                                : {
                                                                      top: "27px",
                                                                  }),
                                                        }}
                                                    >
                                                        {/* View Details */}

                                                        <button
                                                            type="button"
                                                            onClick={(
                                                                e
                                                            ) => {
                                                                e.stopPropagation();

                                                                onSelect?.(
                                                                    code
                                                                );

                                                                setOpenMenu(
                                                                    null
                                                                );
                                                            }}
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                width: "100%",
                                                                height: "30px",
                                                                padding:
                                                                    "0 9px",
                                                                border: "none",
                                                                backgroundColor:
                                                                    "transparent",
                                                                color: "#374151",
                                                                fontSize:
                                                                    "10px",
                                                                lineHeight:
                                                                    "13px",
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
                                                            View Details
                                                        </button>

                                                        {/* Activate / Deactivate */}

                                                        <button
                                                            type="button"
                                                            onClick={(
                                                                e
                                                            ) => {
                                                                e.stopPropagation();

                                                                setSelectedStatusCode(
                                                                    code
                                                                );

                                                                setShowStatusConfirm(
                                                                    true
                                                                );

                                                                setOpenMenu(
                                                                    null
                                                                );
                                                            }}
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                width: "100%",
                                                                height: "30px",
                                                                padding:
                                                                    "0 9px",
                                                                border: "none",
                                                                backgroundColor:
                                                                    "transparent",
                                                                color: "#374151",
                                                                fontSize:
                                                                    "10px",
                                                                lineHeight:
                                                                    "13px",
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
                                                            {code.active
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    style={{
                                        padding: "32px 10px",
                                        textAlign: "center",
                                        fontSize: "11px",
                                        color: "#6b7280",
                                    }}
                                >
                                    No Analysis Codes found.
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
                    width: "100%",
                    minHeight: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    padding: "0 10px",
                    borderTop: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb66",
                    boxSizing: "border-box",
                }}
            >
                {/* Record Info */}

                <p
                    style={{
                        margin: 0,
                        fontSize: "9px",
                        lineHeight: "12px",
                        color: "#374151",
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
                        {totalRows === 0
                            ? 0
                            : startIndex + 1}
                    </span>
                    {" "}to{" "}
                    <span
                        style={{
                            fontWeight: 500,
                            color: "#374151",
                        }}
                    >
                        {Math.min(
                            endIndex,
                            totalRows
                        )}
                    </span>
                    {" "}of{" "}
                    <span
                        style={{
                            fontWeight: 500,
                            color: "#374151",
                        }}
                    >
                        {totalRows}
                    </span>
                    {" "}Analysis Codes
                </p>

                {/* Pagination Buttons */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1px",
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
                            width: "22px",
                            height: "22px",
                            padding: 0,
                            border: "1px solid #e5e7eb",
                            borderRadius: "4px",
                            backgroundColor: "#ffffff",
                            color: "#6b7280",
                            cursor:
                                currentPage === 1
                                    ? "not-allowed"
                                    : "pointer",
                            opacity:
                                currentPage === 1
                                    ? 0.4
                                    : 1,
                        }}
                        title="First"
                    >
                        <ChevronsLeft size={13} />
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
                            width: "22px",
                            height: "22px",
                            padding: 0,
                            border: "1px solid #e5e7eb",
                            borderRadius: "4px",
                            backgroundColor: "#ffffff",
                            color: "#6b7280",
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
                        {
                            length: totalPages,
                        },
                        (_, index) => {
                            const page = index + 1;

                            return (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => {
                                        setCurrentPage(
                                            page
                                        );

                                        tableRef.current?.scrollTo(
                                            {
                                                top: 0,
                                                behavior:
                                                    "smooth",
                                            }
                                        );
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        width: "22px",
                                        height: "22px",
                                        padding: 0,
                                        border: `1px solid ${
                                            currentPage ===
                                            page
                                                ? "#2563eb"
                                                : "#e5e7eb"
                                        }`,
                                        borderRadius:
                                            "4px",
                                        backgroundColor:
                                            currentPage ===
                                            page
                                                ? "#2563eb"
                                                : "#ffffff",
                                        color:
                                            currentPage ===
                                            page
                                                ? "#ffffff"
                                                : "#4b5563",
                                        fontSize: "9px",
                                        lineHeight:
                                            "12px",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (
                                            currentPage !==
                                            page
                                        ) {
                                            e.currentTarget.style.backgroundColor =
                                                "#f9fafb";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (
                                            currentPage !==
                                            page
                                        ) {
                                            e.currentTarget.style.backgroundColor =
                                                "#ffffff";
                                        }
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
                            width: "22px",
                            height: "22px",
                            padding: 0,
                            border: "1px solid #e5e7eb",
                            borderRadius: "4px",
                            backgroundColor: "#ffffff",
                            color: "#6b7280",
                            cursor:
                                currentPage ===
                                    totalPages ||
                                totalPages === 0
                                    ? "not-allowed"
                                    : "pointer",
                            opacity:
                                currentPage ===
                                    totalPages ||
                                totalPages === 0
                                    ? 0.4
                                    : 1,
                        }}
                        title="Next"
                    >
                        <ChevronRight size={13} />
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
                            width: "22px",
                            height: "22px",
                            padding: 0,
                            border: "1px solid #e5e7eb",
                            borderRadius: "4px",
                            backgroundColor: "#ffffff",
                            color: "#6b7280",
                            cursor:
                                currentPage ===
                                    totalPages ||
                                totalPages === 0
                                    ? "not-allowed"
                                    : "pointer",
                            opacity:
                                currentPage ===
                                    totalPages ||
                                totalPages === 0
                                    ? 0.4
                                    : 1,
                        }}
                        title="Last"
                    >
                        <ChevronsRight size={13} />
                    </button>
                </div>
            </div>

            {/* =========================================================
                CONFIRMATION MODAL
            ========================================================= */}

            <ConfirmationModel
                open={showStatusConfirm}
                title={
                    selectedStatusCode?.active
                        ? "Deactivate Analysis Code"
                        : "Activate Analysis Code"
                }
                message={
                    selectedStatusCode?.active
                        ? `Are you sure you want to deactivate ${selectedStatusCode?.analysis_name}?`
                        : `Are you sure you want to activate ${selectedStatusCode?.analysis_name}?`
                }
                confirmText={
                    selectedStatusCode?.active
                        ? "Deactivate"
                        : "Activate"
                }
                cancelText="Cancel"
                onCancel={() => {
                    setShowStatusConfirm(false);
                    setSelectedStatusCode(null);
                }}
                onConfirm={() => {
                    onStatusToggle?.(
                        selectedStatusCode
                    );

                    setShowStatusConfirm(false);
                    setSelectedStatusCode(null);
                }}
            />
        </div>
    );
}