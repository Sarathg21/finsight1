
// import {
//   Pencil,
//   MoreVertical,
//   ChevronsLeft,
//   ChevronsRight,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { useState, useEffect, useRef } from "react";
// import ConfirmationModel from "../Common/ConfirmationModel";

// export default function LegalEntitiesMasterTable({
//   legalEntities = [],
//   onEdit,
//   onSelect,
//   selectedEntity,
//   onStatusToggle,
// }) {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage] = useState(7);

//   const [showStatusConfirm, setShowStatusConfirm] = useState(false);

//   const [selectedStatusEntity, setSelectedStatusEntity] = useState(null);

//   const [menuPosition, setMenuPosition] = useState({
//     top: 0,
//     left: 0,
//   });

//   const [openMenu, setOpenMenu] = useState(null);

//   const menuRef = useRef(null);

//   const totalRows = legalEntities.length;

//   const totalPages = Math.max(
//     1,
//     Math.ceil(totalRows / rowsPerPage)
//   );

//   const startIndex = (currentPage - 1) * rowsPerPage;
//   const endIndex = startIndex + rowsPerPage;

//   const currentRows = legalEntities.slice(
//     startIndex,
//     endIndex
//   );

//   const goFirst = () => {
//     setCurrentPage(1);
//   };

//   const goLast = () => {
//     setCurrentPage(totalPages);
//   };

//   const goPrevious = () => {
//     setCurrentPage((prev) =>
//       Math.max(prev - 1, 1)
//     );
//   };

//   const goNext = () => {
//     setCurrentPage((prev) =>
//       Math.min(prev + 1, totalPages)
//     );
//   };

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [legalEntities]);

//   /* Close menu when clicking outside */
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         menuRef.current &&
//         !menuRef.current.contains(event.target)
//       ) {
//         setOpenMenu(null);
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleClickOutside
//     );

//     return () =>
//       document.removeEventListener(
//         "mousedown",
//         handleClickOutside
//       );
//   }, []);

//   return (
//     <div
//       style={{
//         width: "100%",
//         height: "100%",
//         minHeight: 0,
//         display: "flex",
//         flexDirection: "column",
//         overflow: "hidden",
//         border: "1px solid #e5e7eb",
//         borderRadius: "8px",
//         backgroundColor: "#ffffff",
//         boxSizing: "border-box",
//       }}
//     >
//       {/* =========================================================
//           TABLE SECTION
//       ========================================================= */}

//       <div
//         style={{
//           flex: "1 1 auto",
//           minHeight: 0,
//           width: "100%",
//           overflow: "hidden",
//           boxSizing: "border-box",
//         }}
//       >
//         <table
//           style={{
//             width: "100%",
//             height: "100%",
//             tableLayout: "fixed",
//             borderCollapse: "collapse",
//             borderSpacing: 0,
//           }}
//         >
//           {/* FIXED COLUMN WIDTHS */}

//           <colgroup>
//             <col style={{ width: "24%" }} />
//             <col style={{ width: "38%" }} />
//             <col style={{ width: "18%" }} />
//             <col style={{ width: "20%" }} />
//           </colgroup>

//           {/* =====================================================
//               HEADER
//           ===================================================== */}

//           <thead
//             style={{
//               backgroundColor: "#f9fafb",
//             }}
//           >
//             <tr
//               style={{
//                 height: "26px",
//                 borderBottom: "1px solid #e5e7eb",
//               }}
//             >
//               {/* LegalEntityCode */}

//               <th
//                 scope="col"
//                 style={{
//                   width: "24%",
//                   height: "26px",
//                   padding: "3px 10px",
//                   textAlign: "center",
//                   verticalAlign: "middle",
//                   borderRight: "1px solid #e5e7eb",
//                   color: "#4b5563",
//                   fontSize: "10px",
//                   fontWeight: 700,
//                   lineHeight: "12px",
//                   whiteSpace: "nowrap",
//                   boxSizing: "border-box",
//                 }}
//               >
//                 LegalEntityCode
//               </th>

//               {/* LegalEntityName */}

//               <th
//                 scope="col"
//                 style={{
//                   width: "38%",
//                   height: "26px",
//                   padding: "3px 10px",
//                   textAlign: "center",
//                   verticalAlign: "middle",
//                   borderRight: "1px solid #e5e7eb",
//                   color: "#4b5563",
//                   fontSize: "10px",
//                   fontWeight: 700,
//                   lineHeight: "12px",
//                   whiteSpace: "nowrap",
//                   boxSizing: "border-box",
//                 }}
//               >
//                 LegalEntityName
//               </th>

//               {/* Status */}

//               <th
//                 scope="col"
//                 style={{
//                   width: "18%",
//                   height: "26px",
//                   padding: "3px 10px",
//                   textAlign: "center",
//                   verticalAlign: "middle",
//                   borderRight: "1px solid #e5e7eb",
//                   color: "#4b5563",
//                   fontSize: "10px",
//                   fontWeight: 700,
//                   lineHeight: "12px",
//                   whiteSpace: "nowrap",
//                   boxSizing: "border-box",
//                 }}
//               >
//                 Status
//               </th>

//               {/* Action */}

//               <th
//                 scope="col"
//                 style={{
//                   width: "20%",
//                   height: "26px",
//                   padding: "3px 10px",
//                   textAlign: "center",
//                   verticalAlign: "middle",
//                   color: "#4b5563",
//                   fontSize: "10px",
//                   fontWeight: 700,
//                   lineHeight: "12px",
//                   whiteSpace: "nowrap",
//                   boxSizing: "border-box",
//                 }}
//               >
//                 Action
//               </th>
//             </tr>
//           </thead>

//           {/* =====================================================
//               BODY
//           ===================================================== */}

//           <tbody
//             style={{
//               height: "100%",
//             }}
//           >
//             {currentRows.length > 0 ? (
//               currentRows.map((entity) => (
//                 <tr
//                   key={entity.legal_entity_id}
//                   onClick={() => onSelect(entity)}
//                   style={{
//                     height: "23px",
//                     borderBottom: "1px solid #f3f4f6",
//                     cursor: "pointer",
//                     backgroundColor:
//                       selectedEntity?.legal_entity_id ===
//                         entity.legal_entity_id
//                         ? "#eff6ff"
//                         : "#ffffff",
//                   }}
//                   onMouseEnter={(e) => {
//                     if (
//                       selectedEntity?.legal_entity_id !==
//                       entity.legal_entity_id
//                     ) {
//                       e.currentTarget.style.backgroundColor =
//                         "#f9fafb";
//                     }
//                   }}
//                   onMouseLeave={(e) => {
//                     if (
//                       selectedEntity?.legal_entity_id !==
//                       entity.legal_entity_id
//                     ) {
//                       e.currentTarget.style.backgroundColor =
//                         "#ffffff";
//                     }
//                   }}
//                 >
//                   {/* =================================================
//                       CODE
//                   ================================================= */}

//                   <td
//                     style={{
//                       width: "24%",
//                       height: "23px",
//                       padding: "1px 10px",
//                       textAlign: "center",
//                       verticalAlign: "middle",
//                       overflow: "hidden",
//                       boxSizing: "border-box",
//                     }}
//                   >
//                     <div
//                       style={{
//                         width: "100%",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         whiteSpace: "nowrap",
//                         color: "#1f2937",
//                         fontSize: "10px",
//                         fontWeight: 500,
//                         lineHeight: "12px",
//                       }}
//                       title={entity.legal_entity_code}
//                     >
//                       {entity.legal_entity_code}
//                     </div>
//                   </td>

//                   {/* =================================================
//                       NAME
//                   ================================================= */}

//                   <td
//                     style={{
//                       width: "38%",
//                       height: "23px",
//                       padding: "1px 10px",
//                       textAlign: "center",
//                       verticalAlign: "middle",
//                       overflow: "hidden",
//                       boxSizing: "border-box",
//                     }}
//                   >
//                     <div
//                       style={{
//                         width: "100%",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         whiteSpace: "nowrap",
//                         color: "#1f2937",
//                         fontSize: "10px",
//                         fontWeight: 500,
//                         lineHeight: "12px",
//                       }}
//                       title={entity.legal_entity_name}
//                     >
//                       {entity.legal_entity_name}
//                     </div>
//                   </td>

//                   {/* =================================================
//                       STATUS
//                   ================================================= */}

//                   <td
//                     style={{
//                       width: "18%",
//                       height: "23px",
//                       padding: "1px 10px",
//                       textAlign: "center",
//                       verticalAlign: "middle",
//                       boxSizing: "border-box",
//                     }}
//                   >
//                     <span
//                       style={{
//                         display: "inline-flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         minWidth: "48px",
//                         height: "15px",
//                         padding: "0 6px",
//                         borderRadius: "9999px",
//                         fontSize: "9px",
//                         fontWeight: 500,
//                         lineHeight: "15px",
//                         backgroundColor: entity.active
//                           ? "#dcfce7"
//                           : "#f3f4f6",
//                         color: entity.active
//                           ? "#15803d"
//                           : "#4b5563",
//                         whiteSpace: "nowrap",
//                       }}
//                     >
//                       {entity.active
//                         ? "Active"
//                         : "Inactive"}
//                     </span>
//                   </td>

//                   {/* =================================================
//                       ACTIONS
//                   ================================================= */}

//                   <td
//                     style={{
//                       width: "20%",
//                       height: "23px",
//                       padding: "1px 10px",
//                       textAlign: "center",
//                       verticalAlign: "middle",
//                       boxSizing: "border-box",
//                     }}
//                   >
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         gap: "2px",
//                         height: "100%",
//                       }}
//                     >
//                       {/* Edit */}

//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.stopPropagation();

//                           console.log(
//                             "Edit clicked:",
//                             entity
//                           );

//                           onEdit?.(entity);
//                         }}
//                         style={{
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           width: "20px",
//                           height: "20px",
//                           padding: 0,
//                           border: "none",
//                           borderRadius: "5px",
//                           background: "transparent",
//                           color: "#4b5563",
//                           cursor: "pointer",
//                         }}
//                         title="Edit"
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.backgroundColor =
//                             "#f3f4f6";
//                           e.currentTarget.style.color =
//                             "#111827";
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.backgroundColor =
//                             "transparent";
//                           e.currentTarget.style.color =
//                             "#4b5563";
//                         }}
//                       >
//                         <Pencil
//                           size={11}
//                           strokeWidth={2}
//                         />
//                       </button>

//                       {/* More */}

//                       <div
//                         className="relative"
//                         ref={menuRef}
//                         style={{
//                           display: "flex",
//                           alignItems: "center",
//                         }}
//                       >
//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();

//                             const rect =
//                               e.currentTarget.getBoundingClientRect();

//                             setMenuPosition({
//                               top: rect.bottom + 5,
//                               left: rect.right - 145,
//                             });

//                             setOpenMenu(
//                               openMenu ===
//                                 entity.legal_entity_id
//                                 ? null
//                                 : entity.legal_entity_id
//                             );
//                           }}
//                           style={{
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             width: "20px",
//                             height: "20px",
//                             padding: 0,
//                             border: "none",
//                             borderRadius: "5px",
//                             background: "transparent",
//                             color: "#4b5563",
//                             cursor: "pointer",
//                           }}
//                           title="More actions"
//                           onMouseEnter={(e) => {
//                             e.currentTarget.style.backgroundColor =
//                               "#f3f4f6";
//                             e.currentTarget.style.color =
//                               "#111827";
//                           }}
//                           onMouseLeave={(e) => {
//                             e.currentTarget.style.backgroundColor =
//                               "transparent";
//                             e.currentTarget.style.color =
//                               "#4b5563";
//                           }}
//                         >
//                           <MoreVertical
//                             size={12}
//                             strokeWidth={2}
//                           />
//                         </button>

//                         {openMenu ===
//                           entity.legal_entity_id && (
//                             <div
//                               className="fixed z-9999"
//                               style={{
//                                 top: menuPosition.top,
//                                 left: menuPosition.left,
//                                 width: "144px",
//                                 overflow: "hidden",
//                                 border: "1px solid #e5e7eb",
//                                 borderRadius: "6px",
//                                 backgroundColor: "#ffffff",
//                                 boxShadow:
//                                   "0 8px 20px rgba(0,0,0,0.12)",
//                               }}
//                             >
//                               {/* View Details */}

//                               <button
//                                 type="button"
//                                 onClick={() => {
//                                   onSelect(entity);
//                                   setOpenMenu(null);
//                                 }}
//                                 style={{
//                                   display: "block",
//                                   width: "100%",
//                                   padding: "7px 10px",
//                                   border: "none",
//                                   borderBottom:
//                                     "1px solid #f3f4f6",
//                                   backgroundColor:
//                                     "#ffffff",
//                                   color: "#374151",
//                                   fontSize: "11px",
//                                   fontWeight: 500,
//                                   textAlign: "left",
//                                   cursor: "pointer",
//                                 }}
//                                 onMouseEnter={(e) => {
//                                   e.currentTarget.style.backgroundColor =
//                                     "#f9fafb";
//                                 }}
//                                 onMouseLeave={(e) => {
//                                   e.currentTarget.style.backgroundColor =
//                                     "#ffffff";
//                                 }}
//                               >
//                                 View details
//                               </button>

//                               {/* Activate / Deactivate */}

//                               <button
//                                 type="button"
//                                 onClick={() => {
//                                   setSelectedStatusEntity(
//                                     entity
//                                   );

//                                   setShowStatusConfirm(
//                                     true
//                                   );

//                                   setOpenMenu(null);
//                                 }}
//                                 style={{
//                                   display: "block",
//                                   width: "100%",
//                                   padding: "7px 10px",
//                                   border: "none",
//                                   backgroundColor:
//                                     "#ffffff",
//                                   color: "#374151",
//                                   fontSize: "11px",
//                                   fontWeight: 500,
//                                   textAlign: "left",
//                                   cursor: "pointer",
//                                 }}
//                                 onMouseEnter={(e) => {
//                                   e.currentTarget.style.backgroundColor =
//                                     "#f9fafb";
//                                 }}
//                                 onMouseLeave={(e) => {
//                                   e.currentTarget.style.backgroundColor =
//                                     "#ffffff";
//                                 }}
//                               >
//                                 {entity.active
//                                   ? "Deactivate"
//                                   : "Activate"}
//                               </button>
//                             </div>
//                           )}
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td
//                   colSpan={4}
//                   style={{
//                     height: "70px",
//                     padding: "8px 10px",
//                     textAlign: "center",
//                     verticalAlign: "middle",
//                     color: "#6b7280",
//                     fontSize: "11px",
//                   }}
//                 >
//                   No Legal entities found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* =========================================================
//           PAGINATION — FIXED AT BOTTOM
//       ========================================================= */}

//       <div
//         style={{
//           flex: "0 0 36px",
//           width: "100%",
//           height: "36px",
//           minHeight: "36px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           padding: "0 10px",
//           borderTop: "1px solid #e5e7eb",
//           backgroundColor: "#fafafa",
//           boxSizing: "border-box",
//         }}
//       >
//         {/* RECORD INFO */}

//         <p
//           style={{
//             margin: 0,
//             whiteSpace: "nowrap",
//             color: "#6b7280",
//             fontSize: "9px",
//             fontWeight: 500,
//             lineHeight: "12px",
//           }}
//         >
//           Showing{" "}
//           <span
//             style={{
//               color: "#1f2937",
//               fontWeight: 600,
//             }}
//           >
//             {totalRows === 0
//               ? 0
//               : startIndex + 1}
//           </span>{" "}
//           to{" "}
//           <span
//             style={{
//               color: "#1f2937",
//               fontWeight: 600,
//             }}
//           >
//             {Math.min(
//               endIndex,
//               totalRows
//             )}
//           </span>{" "}
//           of{" "}
//           <span
//             style={{
//               color: "#1f2937",
//               fontWeight: 600,
//             }}
//           >
//             {totalRows}
//           </span>{" "}
//           Legal entities
//         </p>

//         {/* PAGINATION CONTROLS */}

//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: "2px",
//             height: "24px",
//             flexShrink: 0,
//           }}
//         >
//           {/* First */}

//           <button
//             type="button"
//             onClick={goFirst}
//             disabled={currentPage === 1}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               width: "22px",
//               height: "22px",
//               padding: 0,
//               border: "none",
//               borderRadius: "4px",
//               backgroundColor: "transparent",
//               color:
//                 currentPage === 1
//                   ? "#d1d5db"
//                   : "#6b7280",
//               cursor:
//                 currentPage === 1
//                   ? "not-allowed"
//                   : "pointer",
//             }}
//             title="First page"
//           >
//             <ChevronsLeft size={14} />
//           </button>

//           {/* Previous */}

//           <button
//             type="button"
//             onClick={goPrevious}
//             disabled={currentPage === 1}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               width: "22px",
//               height: "22px",
//               padding: 0,
//               border: "none",
//               borderRadius: "4px",
//               backgroundColor: "transparent",
//               color:
//                 currentPage === 1
//                   ? "#d1d5db"
//                   : "#6b7280",
//               cursor:
//                 currentPage === 1
//                   ? "not-allowed"
//                   : "pointer",
//             }}
//             title="Previous page"
//           >
//             <ChevronLeft size={14} />
//           </button>

//           {/* Page Numbers */}

//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "2px",
//               margin: "0 2px",
//             }}
//           >
//             {Array.from(
//               {
//                 length: totalPages,
//               },
//               (_, index) => {
//                 const page = index + 1;

//                 return (
//                   <button
//                     key={page}
//                     type="button"
//                     onClick={() =>
//                       setCurrentPage(page)
//                     }
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       width: "22px",
//                       height: "22px",
//                       padding: 0,
//                       border: "none",
//                       borderRadius: "4px",
//                       backgroundColor:
//                         currentPage === page
//                           ? "#2563eb"
//                           : "transparent",
//                       color:
//                         currentPage === page
//                           ? "#ffffff"
//                           : "#4b5563",
//                       fontSize: "9px",
//                       fontWeight: 500,
//                       cursor: "pointer",
//                     }}
//                   >
//                     {page}
//                   </button>
//                 );
//               }
//             )}
//           </div>

//           {/* Next */}

//           <button
//             type="button"
//             onClick={goNext}
//             disabled={
//               currentPage === totalPages ||
//               totalPages === 0
//             }
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               width: "22px",
//               height: "22px",
//               padding: 0,
//               border: "none",
//               borderRadius: "4px",
//               backgroundColor: "transparent",
//               color:
//                 currentPage === totalPages ||
//                   totalPages === 0
//                   ? "#d1d5db"
//                   : "#6b7280",
//               cursor:
//                 currentPage === totalPages ||
//                   totalPages === 0
//                   ? "not-allowed"
//                   : "pointer",
//             }}
//             title="Next page"
//           >
//             <ChevronRight size={14} />
//           </button>

//           {/* Last */}

//           <button
//             type="button"
//             onClick={goLast}
//             disabled={
//               currentPage === totalPages ||
//               totalPages === 0
//             }
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               width: "22px",
//               height: "22px",
//               padding: 0,
//               border: "none",
//               borderRadius: "4px",
//               backgroundColor: "transparent",
//               color:
//                 currentPage === totalPages ||
//                   totalPages === 0
//                   ? "#d1d5db"
//                   : "#6b7280",
//               cursor:
//                 currentPage === totalPages ||
//                   totalPages === 0
//                   ? "not-allowed"
//                   : "pointer",
//             }}
//             title="Last page"
//           >
//             <ChevronsRight size={14} />
//           </button>
//         </div>
//       </div>

//       {/* =========================================================
//           ACTIVATE / DEACTIVATE CONFIRMATION
//       ========================================================= */}

//       <ConfirmationModel
//         open={showStatusConfirm}
//         title={
//           selectedStatusEntity?.active
//             ? "Deactivate legal entity"
//             : "Activate legal entity"
//         }
//         message={
//           selectedStatusEntity?.active
//             ? `Are you sure you want to deactivate ${selectedStatusEntity?.legal_entity_name}?`
//             : `Are you sure you want to activate ${selectedStatusEntity?.legal_entity_name}?`
//         }
//         confirmText={
//           selectedStatusEntity?.active
//             ? "Deactivate"
//             : "Activate"
//         }
//         cancelText="Cancel"
//         onCancel={() => {
//           setShowStatusConfirm(false);
//           setSelectedStatusEntity(null);
//         }}
//         onConfirm={() => {
//           onStatusToggle?.(
//             selectedStatusEntity
//           );

//           setShowStatusConfirm(false);
//           setSelectedStatusEntity(null);
//         }}
//       />
//     </div>
//   );
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

export default function LegalEntitiesMasterTable({
    legalEntities = [],
    onEdit,
    onSelect,
    selectedEntity,
    onStatusToggle,
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(9);

    const [showStatusConfirm, setShowStatusConfirm] = useState(false);

    const [selectedStatusEntity, setSelectedStatusEntity] =
        useState(null);

    const [menuPosition, setMenuPosition] = useState({
        top: 0,
        left: 0,
    });

    const [openMenu, setOpenMenu] = useState(null);

    const menuRef = useRef(null);

    const totalRows = legalEntities.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalRows / rowsPerPage)
    );

    const startIndex =
        (currentPage - 1) * rowsPerPage;

    const endIndex = startIndex + rowsPerPage;

    const currentRows = legalEntities.slice(
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

    useEffect(() => {
        setCurrentPage(1);
    }, [legalEntities]);

    /* Close menu when clicking outside */
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

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
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
            {/* =========================================================
                TABLE SECTION
            ========================================================= */}

            <div
                style={{
                    flex: "0 0 auto",
                    width: "100%",
                    minHeight: 0,
                    overflow: "hidden",
                    boxSizing: "border-box",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        minWidth: 0,
                        height: "auto",
                        tableLayout: "fixed",
                        borderCollapse: "collapse",
                        borderSpacing: 0,
                        margin: 0,
                    }}
                >
                    <colgroup>
                        <col style={{ width: "23%" }} />
                        <col style={{ width: "39%" }} />
                        <col style={{ width: "18%" }} />
                        <col style={{ width: "20%" }} />
                    </colgroup>

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <thead>
                        <tr
                            style={{
                                height: "28px",
                                backgroundColor: "#f9fafb",
                                borderBottom:
                                    "1px solid #e5e7eb",
                            }}
                        >
                            <th
                                scope="col"
                                style={{
                                    width: "23%",
                                    height: "28px",
                                    padding: "2px 5px",
                                    textAlign: "center",
                                    verticalAlign: "middle",
                                    borderRight:
                                        "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    fontSize: "9px",
                                    fontWeight: 600,
                                    lineHeight: "11px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    boxSizing: "border-box",
                                }}
                            >
                                LegalEntityCode
                            </th>

                            <th
                                scope="col"
                                style={{
                                    width: "39%",
                                    height: "28px",
                                    padding: "2px 5px",
                                    textAlign: "center",
                                    verticalAlign: "middle",
                                    borderRight:
                                        "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    fontSize: "9px",
                                    fontWeight: 600,
                                    lineHeight: "11px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    boxSizing: "border-box",
                                }}
                            >
                                LegalEntityName
                            </th>

                            <th
                                scope="col"
                                style={{
                                    width: "18%",
                                    height: "28px",
                                    padding: "2px 4px",
                                    textAlign: "center",
                                    verticalAlign: "middle",
                                    borderRight:
                                        "1px solid #f3f4f6",
                                    color: "#4b5563",
                                    fontSize: "9px",
                                    fontWeight: 600,
                                    lineHeight: "11px",
                                    whiteSpace: "nowrap",
                                    boxSizing: "border-box",
                                }}
                            >
                                Status
                            </th>

                            <th
                                scope="col"
                                style={{
                                    width: "20%",
                                    height: "28px",
                                    padding: "2px 4px",
                                    textAlign: "center",
                                    verticalAlign: "middle",
                                    color: "#4b5563",
                                    fontSize: "9px",
                                    fontWeight: 600,
                                    lineHeight: "11px",
                                    whiteSpace: "nowrap",
                                    boxSizing: "border-box",
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
                            currentRows.map((entity) => (
                                <tr
                                    key={
                                        entity.legal_entity_id
                                    }
                                    onClick={() =>
                                        onSelect(entity)
                                    }
                                    style={{
                                        height: "28px",
                                        borderBottom:
                                            "1px solid #f3f4f6",
                                        cursor: "pointer",
                                        backgroundColor:
                                            selectedEntity?.legal_entity_id ===
                                            entity.legal_entity_id
                                                ? "#eff6ff"
                                                : "#ffffff",
                                        transition:
                                            "background-color 0.15s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (
                                            selectedEntity?.legal_entity_id !==
                                            entity.legal_entity_id
                                        ) {
                                            e.currentTarget.style.backgroundColor =
                                                "#f9fafb";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (
                                            selectedEntity?.legal_entity_id !==
                                            entity.legal_entity_id
                                        ) {
                                            e.currentTarget.style.backgroundColor =
                                                "#ffffff";
                                        }
                                    }}
                                >
                                    {/* CODE */}

                                    <td
                                        style={{
                                            width: "23%",
                                            height: "28px",
                                            padding: "2px 5px",
                                            textAlign:
                                                "center",
                                            verticalAlign:
                                                "middle",
                                            overflow:
                                                "hidden",
                                            boxSizing:
                                                "border-box",
                                            borderRight:
                                                "1px solid #f9fafb",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "100%",
                                                overflow:
                                                    "hidden",
                                                textOverflow:
                                                    "ellipsis",
                                                whiteSpace:
                                                    "nowrap",
                                                color: "#1f2937",
                                                fontSize: "10px",
                                                fontWeight: 500,
                                                lineHeight:
                                                    "12px",
                                            }}
                                            title={
                                                entity.legal_entity_code
                                            }
                                        >
                                            {entity.legal_entity_code ||
                                                "-"}
                                        </div>
                                    </td>

                                    {/* NAME */}

                                    <td
                                        style={{
                                            width: "39%",
                                            height: "28px",
                                            padding: "2px 5px",
                                            textAlign:
                                                "center",
                                            verticalAlign:
                                                "middle",
                                            overflow:
                                                "hidden",
                                            boxSizing:
                                                "border-box",
                                            borderRight:
                                                "1px solid #f9fafb",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "100%",
                                                overflow:
                                                    "hidden",
                                                textOverflow:
                                                    "ellipsis",
                                                whiteSpace:
                                                    "nowrap",
                                                color: "#1f2937",
                                                fontSize: "10px",
                                                fontWeight: 500,
                                                lineHeight:
                                                    "12px",
                                            }}
                                            title={
                                                entity.legal_entity_name
                                            }
                                        >
                                            {entity.legal_entity_name ||
                                                "-"}
                                        </div>
                                    </td>

                                    {/* STATUS */}

                                    <td
                                        style={{
                                            width: "18%",
                                            height: "28px",
                                            padding: "2px 4px",
                                            textAlign:
                                                "center",
                                            verticalAlign:
                                                "middle",
                                            boxSizing:
                                                "border-box",
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
                                                minWidth:
                                                    "45px",
                                                height:
                                                    "16px",
                                                padding:
                                                    "0 5px",
                                                borderRadius:
                                                    "9999px",
                                                fontSize:
                                                    "8px",
                                                fontWeight: 500,
                                                lineHeight:
                                                    "16px",
                                                backgroundColor:
                                                    entity.active
                                                        ? "#dcfce7"
                                                        : "#f3f4f6",
                                                color:
                                                    entity.active
                                                        ? "#15803d"
                                                        : "#4b5563",
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {entity.active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>

                                    {/* ACTIONS */}

                                    <td
                                        style={{
                                            width: "20%",
                                            height: "28px",
                                            padding: "2px 4px",
                                            textAlign:
                                                "center",
                                            verticalAlign:
                                                "middle",
                                            boxSizing:
                                                "border-box",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                                gap: "2px",
                                                height:
                                                    "28px",
                                            }}
                                        >
                                            {/* Edit */}

                                            <button
                                                type="button"
                                                onClick={(
                                                    e
                                                ) => {
                                                    e.stopPropagation();

                                                    console.log(
                                                        "Edit clicked:",
                                                        entity
                                                    );

                                                    onEdit?.(
                                                        entity
                                                    );
                                                }}
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    width: "20px",
                                                    height: "20px",
                                                    padding: 0,
                                                    border: "none",
                                                    borderRadius:
                                                        "4px",
                                                    backgroundColor:
                                                        "transparent",
                                                    color: "#4b5563",
                                                    cursor: "pointer",
                                                }}
                                                title="Edit"
                                                onMouseEnter={(
                                                    e
                                                ) => {
                                                    e.currentTarget.style.backgroundColor =
                                                        "#f3f4f6";
                                                    e.currentTarget.style.color =
                                                        "#111827";
                                                }}
                                                onMouseLeave={(
                                                    e
                                                ) => {
                                                    e.currentTarget.style.backgroundColor =
                                                        "transparent";
                                                    e.currentTarget.style.color =
                                                        "#4b5563";
                                                }}
                                            >
                                                <Pencil
                                                    size={11}
                                                    strokeWidth={
                                                        2
                                                    }
                                                />
                                            </button>

                                            {/* More */}

                                            <div
                                                ref={
                                                    menuRef
                                                }
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    position:
                                                        "relative",
                                                }}
                                            >
                                                <button
                                                    type="button"
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
                                                                entity.legal_entity_id
                                                                ? null
                                                                : entity.legal_entity_id
                                                        );
                                                    }}
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                        width: "20px",
                                                        height: "20px",
                                                        padding: 0,
                                                        border: "none",
                                                        borderRadius:
                                                            "4px",
                                                        backgroundColor:
                                                            "transparent",
                                                        color: "#4b5563",
                                                        cursor: "pointer",
                                                    }}
                                                    title="More actions"
                                                    onMouseEnter={(
                                                        e
                                                    ) => {
                                                        e.currentTarget.style.backgroundColor =
                                                            "#f3f4f6";
                                                        e.currentTarget.style.color =
                                                            "#111827";
                                                    }}
                                                    onMouseLeave={(
                                                        e
                                                    ) => {
                                                        e.currentTarget.style.backgroundColor =
                                                            "transparent";
                                                        e.currentTarget.style.color =
                                                            "#4b5563";
                                                    }}
                                                >
                                                    <MoreVertical
                                                        size={
                                                            11
                                                        }
                                                        strokeWidth={
                                                            2
                                                        }
                                                    />
                                                </button>

                                                {/* Dropdown */}

                                                {openMenu ===
                                                    entity.legal_entity_id && (
                                                    <div
                                                        style={{
                                                            position:
                                                                "fixed",
                                                            zIndex: 9999,
                                                            top: menuPosition.top,
                                                            left: menuPosition.left,
                                                            width: "144px",
                                                            overflow:
                                                                "hidden",
                                                            border:
                                                                "1px solid #e5e7eb",
                                                            borderRadius:
                                                                "6px",
                                                            backgroundColor:
                                                                "#ffffff",
                                                            boxShadow:
                                                                "0 8px 20px rgba(0,0,0,0.12)",
                                                            boxSizing:
                                                                "border-box",
                                                        }}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                onSelect(
                                                                    entity
                                                                );
                                                                setOpenMenu(
                                                                    null
                                                                );
                                                            }}
                                                            style={{
                                                                display:
                                                                    "block",
                                                                width: "100%",
                                                                height: "30px",
                                                                padding:
                                                                    "0 10px",
                                                                border: "none",
                                                                borderBottom:
                                                                    "1px solid #f3f4f6",
                                                                backgroundColor:
                                                                    "#ffffff",
                                                                color: "#374151",
                                                                fontSize:
                                                                    "10px",
                                                                fontWeight: 500,
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
                                                                    "#ffffff";
                                                            }}
                                                        >
                                                            View details
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedStatusEntity(
                                                                    entity
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
                                                                    "block",
                                                                width: "100%",
                                                                height: "30px",
                                                                padding:
                                                                    "0 10px",
                                                                border: "none",
                                                                backgroundColor:
                                                                    "#ffffff",
                                                                color: "#374151",
                                                                fontSize:
                                                                    "10px",
                                                                fontWeight: 500,
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
                                                                    "#ffffff";
                                                            }}
                                                        >
                                                            {entity.active
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
                                        height: "40px",
                                        padding: "4px 8px",
                                        textAlign:
                                            "center",
                                        verticalAlign:
                                            "middle",
                                        color: "#6b7280",
                                        fontSize: "11px",
                                    }}
                                >
                                    No Legal entities found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* =========================================================
                PAGINATION — FIXED DIRECTLY AFTER TABLE
            ========================================================= */}

            <div
                style={{
                    flex: "0 0 40px",
                    width: "100%",
                    height: "40px",
                    minHeight: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "space-between",
                    padding: "0 10px",
                    borderTop:
                        "1px solid #e5e7eb",
                    backgroundColor: "#fafafa",
                    boxSizing: "border-box",
                    marginTop: 0,
                }}
            >
                {/* RECORD INFO */}

                <p
                    style={{
                        margin: 0,
                        whiteSpace: "nowrap",
                        color: "#6b7280",
                        fontSize: "9px",
                        fontWeight: 500,
                        lineHeight: "12px",
                    }}
                >
                    Showing{" "}
                    <span
                        style={{
                            color: "#1f2937",
                            fontWeight: 600,
                        }}
                    >
                        {totalRows === 0
                            ? 0
                            : startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span
                        style={{
                            color: "#1f2937",
                            fontWeight: 600,
                        }}
                    >
                        {Math.min(
                            endIndex,
                            totalRows
                        )}
                    </span>{" "}
                    of{" "}
                    <span
                        style={{
                            color: "#1f2937",
                            fontWeight: 600,
                        }}
                    >
                        {totalRows}
                    </span>{" "}
                    Legal entities
                </p>

                {/* PAGINATION CONTROLS */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "center",
                        gap: "1px",
                        height: "24px",
                        flexShrink: 0,
                    }}
                >
                    {/* First */}

                    <button
                        type="button"
                        onClick={goFirst}
                        disabled={
                            currentPage === 1
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
                            borderRadius: "4px",
                            backgroundColor:
                                "transparent",
                            color:
                                currentPage === 1
                                    ? "#d1d5db"
                                    : "#6b7280",
                            cursor:
                                currentPage === 1
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                        title="First page"
                    >
                        <ChevronsLeft size={14} />
                    </button>

                    {/* Previous */}

                    <button
                        type="button"
                        onClick={goPrevious}
                        disabled={
                            currentPage === 1
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
                            borderRadius: "4px",
                            backgroundColor:
                                "transparent",
                            color:
                                currentPage === 1
                                    ? "#d1d5db"
                                    : "#6b7280",
                            cursor:
                                currentPage === 1
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                        title="Previous page"
                    >
                        <ChevronLeft size={14} />
                    </button>

                    {/* Page Numbers */}

                    <div
                        style={{
                            display: "flex",
                            alignItems:
                                "center",
                            gap: "1px",
                            margin: "0 2px",
                        }}
                    >
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
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage(
                                                page
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
                                                currentPage ===
                                                page
                                                    ? "#2563eb"
                                                    : "transparent",
                                            color:
                                                currentPage ===
                                                page
                                                    ? "#ffffff"
                                                    : "#4b5563",
                                            fontSize:
                                                "9px",
                                            fontWeight: 500,
                                            cursor: "pointer",
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
                    </div>

                    {/* Next */}

                    <button
                        type="button"
                        onClick={goNext}
                        disabled={
                            currentPage ===
                                totalPages ||
                            totalPages === 0
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
                            borderRadius: "4px",
                            backgroundColor:
                                "transparent",
                            color:
                                currentPage ===
                                    totalPages ||
                                totalPages === 0
                                    ? "#d1d5db"
                                    : "#6b7280",
                            cursor:
                                currentPage ===
                                    totalPages ||
                                totalPages === 0
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                        title="Next page"
                    >
                        <ChevronRight size={14} />
                    </button>

                    {/* Last */}

                    <button
                        type="button"
                        onClick={goLast}
                        disabled={
                            currentPage ===
                                totalPages ||
                            totalPages === 0
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
                            borderRadius: "4px",
                            backgroundColor:
                                "transparent",
                            color:
                                currentPage ===
                                    totalPages ||
                                totalPages === 0
                                    ? "#d1d5db"
                                    : "#6b7280",
                            cursor:
                                currentPage ===
                                    totalPages ||
                                totalPages === 0
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                        title="Last page"
                    >
                        <ChevronsRight size={14} />
                    </button>
                </div>
            </div>

            {/* =========================================================
                ACTIVATE / DEACTIVATE CONFIRMATION
            ========================================================= */}

            <ConfirmationModel
                open={showStatusConfirm}
                title={
                    selectedStatusEntity?.active
                        ? "Deactivate legal entity"
                        : "Activate legal entity"
                }
                message={
                    selectedStatusEntity?.active
                        ? `Are you sure you want to deactivate ${selectedStatusEntity?.legal_entity_name}?`
                        : `Are you sure you want to activate ${selectedStatusEntity?.legal_entity_name}?`
                }
                confirmText={
                    selectedStatusEntity?.active
                        ? "Deactivate"
                        : "Activate"
                }
                cancelText="Cancel"
                onCancel={() => {
                    setShowStatusConfirm(false);
                    setSelectedStatusEntity(null);
                }}
                onConfirm={() => {
                    onStatusToggle?.(
                        selectedStatusEntity
                    );

                    setShowStatusConfirm(false);
                    setSelectedStatusEntity(null);
                }}
            />
        </div>
    );
}