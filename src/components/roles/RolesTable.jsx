
// import { useState, useEffect, useRef } from "react";
// import {
//   Pencil,
//   MoreVertical,
//   ChevronLeft,
//   ChevronsLeft,
//   ChevronsRight,
//   ChevronRight,
// } from "lucide-react";

// export default function RolesTable({
//   roles = [],
//   total = 0,
//   selectedRole,
//   setSelectedRole,
//   onEdit,
//   currentPage,
//   totalPages,
//   pageSize,
//   startItem,
//   endItem,
//   onPageChange,
//   onPrevious,
//   onNext,
//   onFirst,
//   onLast,
//   onToggleStatus,
// }) {
//   const [openMenu, setOpenMenu] = useState(null);
//   const menuRef = useRef(null);

//   /* =========================================================
//      CLICK OUTSIDE
//   ========================================================= */

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

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleClickOutside
//       );
//     };
//   }, []);

//   return (
//     <div style={styles.container}>

//       {/* =====================================================
//           HEADER
//       ===================================================== */}

//       <div style={styles.header}>
//         <h2 style={styles.headerTitle}>
//           Roles List ({roles.length})
//         </h2>
//       </div>

//       {/* =====================================================
//           TABLE
//       ===================================================== */}

//       <div style={styles.tableWrapper}>
//         <table style={styles.table}>

//           <colgroup>
//             <col style={{ width: "22%" }} />
//             <col style={{ width: "32%" }} />
//             <col style={{ width: "12%" }} />
//             <col style={{ width: "18%" }} />
//             <col style={{ width: "16%" }} />
//           </colgroup>

//           <thead>
//             <tr style={styles.tableHeaderRow}>

//               <th style={styles.tableHeaderCellLeft}>
//                 Role Name
//               </th>

//               <th style={styles.tableHeaderCellLeft}>
//                 Description
//               </th>

//               <th style={styles.tableHeaderCellCenter}>
//                 Users
//               </th>

//               <th style={styles.tableHeaderCellCenter}>
//                 Status
//               </th>

//               <th style={styles.tableHeaderCellCenter}>
//                 Action
//               </th>

//             </tr>
//           </thead>

//           <tbody>

//             {roles.length === 0 ? (

//               <tr>
//                 <td
//                   colSpan={5}
//                   style={styles.emptyCell}
//                 >
//                   No Roles Found
//                 </td>
//               </tr>

//             ) : (

//               roles.map((role) => {

//                 const isSelected =
//                   selectedRole?.id === role.id;

//                 return (
//                   <tr
//                     key={role.id}
//                     onClick={() =>
//                       setSelectedRole(role)
//                     }
//                     style={{
//                       ...styles.tableRow,
//                       ...(isSelected
//                         ? styles.selectedRow
//                         : {}),
//                     }}
//                     onMouseEnter={(e) => {
//                       if (!isSelected) {
//                         e.currentTarget.style.backgroundColor =
//                           "#F8FAFC";
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       if (!isSelected) {
//                         e.currentTarget.style.backgroundColor =
//                           "#FFFFFF";
//                       }
//                     }}
//                   >

//                     {/* ROLE NAME */}

//                     <td style={styles.roleNameCell}>
//                       {role.role_name || role.name || "-"}
//                     </td>

//                     {/* DESCRIPTION */}

//                     <td style={styles.descriptionCell}>
//                       <span style={styles.descriptionText}>
//                         {role.description || "-"}
//                       </span>
//                     </td>

//                     {/* USERS */}

//                     <td style={styles.usersCell}>
//                       {role.users ?? 0}
//                     </td>

//                     {/* STATUS */}

//                     <td style={styles.statusCell}>
//                       <span
//                         style={{
//                           ...styles.statusBadge,
//                           ...(role.active
//                             ? styles.activeBadge
//                             : styles.inactiveBadge),
//                         }}
//                       >
//                         {role.active
//                           ? "Active"
//                           : "Inactive"}
//                       </span>
//                     </td>

//                     {/* ACTION */}

//                     <td style={styles.actionCell}>

//                       <div style={styles.actionWrapper}>

//                         {/* EDIT */}

//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             onEdit?.(role);
//                           }}
//                           style={styles.iconButton}
//                           title="Edit"
//                           onMouseEnter={(e) => {
//                             e.currentTarget.style.backgroundColor =
//                               "#F3F4F6";
//                           }}
//                           onMouseLeave={(e) => {
//                             e.currentTarget.style.backgroundColor =
//                               "transparent";
//                           }}
//                         >
//                           <Pencil size={13} strokeWidth={2} />
//                         </button>

//                         {/* MORE */}

//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();

//                             setOpenMenu(
//                               openMenu === role.id
//                                 ? null
//                                 : role.id
//                             );
//                           }}
//                           style={styles.iconButton}
//                           title="More"
//                           onMouseEnter={(e) => {
//                             e.currentTarget.style.backgroundColor =
//                               "#F3F4F6";
//                           }}
//                           onMouseLeave={(e) => {
//                             e.currentTarget.style.backgroundColor =
//                               "transparent";
//                           }}
//                         >
//                           <MoreVertical
//                             size={14}
//                             strokeWidth={2}
//                           />
//                         </button>

//                         {/* DROPDOWN */}

//                         {openMenu === role.id && (
//                           <div
//                             ref={menuRef}
//                             style={styles.dropdown}
//                           >
//                             <button
//                               type="button"
//                               onClick={(e) => {
//                                 e.stopPropagation();

//                                 onToggleStatus?.(role);

//                                 setOpenMenu(null);
//                               }}
//                               style={styles.dropdownButton}
//                               onMouseEnter={(e) => {
//                                 e.currentTarget.style.backgroundColor =
//                                   "#F8FAFC";
//                               }}
//                               onMouseLeave={(e) => {
//                                 e.currentTarget.style.backgroundColor =
//                                   "#FFFFFF";
//                               }}
//                             >
//                               {role.active
//                                 ? "Deactivate"
//                                 : "Activate"}
//                             </button>
//                           </div>
//                         )}

//                       </div>

//                     </td>

//                   </tr>
//                 );
//               })
//             )}

//           </tbody>
//         </table>
//       </div>

//       {/* =====================================================
//           FOOTER
//       ===================================================== */}

//       <div style={styles.footer}>

//         {/* SHOWING */}

//         <p style={styles.showingText}>
//           Showing {startItem} to {endItem} of {total} roles
//         </p>

//         {/* PAGINATION */}

//         <div style={styles.pagination}>

//           {/* FIRST */}

//           <button
//             type="button"
//             onClick={onFirst}
//             disabled={currentPage === 1}
//             style={{
//               ...styles.paginationButton,
//               ...(currentPage === 1
//                 ? styles.disabledButton
//                 : {}),
//             }}
//             onMouseEnter={(e) => {
//               if (currentPage !== 1) {
//                 e.currentTarget.style.backgroundColor =
//                   "#F3F4F6";
//               }
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.backgroundColor =
//                 "transparent";
//             }}
//           >
//             <ChevronsLeft size={13} />
//           </button>

//           {/* PREVIOUS */}

//           <button
//             type="button"
//             onClick={onPrevious}
//             disabled={currentPage === 1}
//             style={{
//               ...styles.paginationButton,
//               ...(currentPage === 1
//                 ? styles.disabledButton
//                 : {}),
//             }}
//             onMouseEnter={(e) => {
//               if (currentPage !== 1) {
//                 e.currentTarget.style.backgroundColor =
//                   "#F3F4F6";
//               }
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.backgroundColor =
//                 "transparent";
//             }}
//           >
//             <ChevronLeft size={13} />
//           </button>

//           {/* PAGE NUMBERS */}

//           {Array.from(
//             { length: totalPages },
//             (_, index) => {
//               const page = index + 1;
//               const isCurrent =
//                 currentPage === page;

//               return (
//                 <button
//                   key={page}
//                   type="button"
//                   onClick={() =>
//                     onPageChange(page)
//                   }
//                   style={{
//                     ...styles.pageButton,
//                     ...(isCurrent
//                       ? styles.activePageButton
//                       : {}),
//                   }}
//                   onMouseEnter={(e) => {
//                     if (!isCurrent) {
//                       e.currentTarget.style.backgroundColor =
//                         "#F3F4F6";
//                     }
//                   }}
//                   onMouseLeave={(e) => {
//                     if (!isCurrent) {
//                       e.currentTarget.style.backgroundColor =
//                         "transparent";
//                     }
//                   }}
//                 >
//                   {page}
//                 </button>
//               );
//             }
//           )}

//           {/* NEXT */}

//           <button
//             type="button"
//             onClick={onNext}
//             disabled={
//               currentPage === totalPages ||
//               totalPages === 0
//             }
//             style={{
//               ...styles.paginationButton,
//               ...(currentPage === totalPages ||
//                 totalPages === 0
//                 ? styles.disabledButton
//                 : {}),
//             }}
//             onMouseEnter={(e) => {
//               if (
//                 currentPage !== totalPages &&
//                 totalPages !== 0
//               ) {
//                 e.currentTarget.style.backgroundColor =
//                   "#F3F4F6";
//               }
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.backgroundColor =
//                 "transparent";
//             }}
//           >
//             <ChevronRight size={13} />
//           </button>

//           {/* LAST */}

//           <button
//             type="button"
//             onClick={onLast}
//             disabled={
//               currentPage === totalPages ||
//               totalPages === 0
//             }
//             style={{
//               ...styles.paginationButton,
//               ...(currentPage === totalPages ||
//                 totalPages === 0
//                 ? styles.disabledButton
//                 : {}),
//             }}
//             onMouseEnter={(e) => {
//               if (
//                 currentPage !== totalPages &&
//                 totalPages !== 0
//               ) {
//                 e.currentTarget.style.backgroundColor =
//                   "#F3F4F6";
//               }
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.backgroundColor =
//                 "transparent";
//             }}
//           >
//             <ChevronsRight size={13} />
//           </button>

//         </div>
//       </div>
//     </div>
//   );
// }

// /* =========================================================
//    INLINE STYLES
// ========================================================= */

// const styles = {

//   /* =======================================================
//      MAIN CARD
//   ======================================================= */

//   container: {
//     width: "100%",
//     height: "100%",
//     minWidth: 0,
//     minHeight: 0,

//     display: "flex",
//     flexDirection: "column",

//     backgroundColor: "#FFFFFF",

//     border: "1px solid #E2E8F0",
//     borderRadius: "10px",

//     boxShadow:
//       "0 1px 3px rgba(15, 23, 42, 0.08)",

//     padding: "8px",

//     boxSizing: "border-box",

//     overflow: "hidden",
//   },

//   /* =======================================================
//      HEADER
//   ======================================================= */

//   header: {
//     height: "25px",

//     display: "flex",
//     alignItems: "center",

//     flexShrink: 0,

//     padding: "0 1px",
//   },

//   headerTitle: {
//     margin: 0,

//     color: "#111827",

//     fontSize: "12px",
//     lineHeight: "16px",

//     fontWeight: 600,
//   },

//   /* =======================================================
//      TABLE WRAPPER
//   ======================================================= */

//   tableWrapper: {
//     width: "100%",

//     minWidth: 0,
//     minHeight: 0,

//     marginTop: "4px",

//     overflow: "visible",

//     boxSizing: "border-box",
//   },
//   /* =======================================================
//      TABLE
//   ======================================================= */

//   table: {
//     width: "100%",

//     tableLayout: "fixed",

//     borderCollapse: "collapse",

//     borderSpacing: 0,

//     boxSizing: "border-box",
//   },

//   /* =======================================================
//      HEADER ROW
//   ======================================================= */

//   tableHeaderRow: {
//     height: "26px",

//     backgroundColor: "#F8FAFC",

//     borderBottom:
//       "1px solid #DCE3EB",
//   },

//   tableHeaderCellLeft: {
//     height: "26px",

//     padding: "0 7px",

//     textAlign: "left",

//     verticalAlign: "middle",

//     color: "#1E293B",

//     fontSize: "9px",

//     lineHeight: "12px",

//     fontWeight: 600,

//     whiteSpace: "nowrap",

//     boxSizing: "border-box",
//   },

//   tableHeaderCellCenter: {
//     height: "26px",

//     padding: "0 5px",

//     textAlign: "center",

//     verticalAlign: "middle",

//     color: "#1E293B",

//     fontSize: "9px",

//     lineHeight: "12px",

//     fontWeight: 600,

//     whiteSpace: "nowrap",

//     boxSizing: "border-box",
//   },

//   /* =======================================================
//      BODY ROW
//   ======================================================= */

//   tableRow: {
//     height: "43px",

//     backgroundColor: "#FFFFFF",

//     borderBottom:
//       "1px solid #CBD5E1",

//     cursor: "pointer",

//     transition:
//       "background-color 120ms ease",

//     boxSizing: "border-box",
//   },

//   selectedRow: {
//     backgroundColor: "#EFF6FF",
//   },

//   /* =======================================================
//      ROLE NAME
//   ======================================================= */

//   roleNameCell: {
//     padding: "7px 8px",

//     color: "#111827",

//     fontSize: "10px",

//     lineHeight: "13px",

//     fontWeight: 500,

//     textAlign: "left",

//     verticalAlign: "middle",

//     overflow: "hidden",

//     textOverflow: "ellipsis",

//     whiteSpace: "nowrap",

//     boxSizing: "border-box",
//   },

//   /* =======================================================
//      DESCRIPTION
//   ======================================================= */

//   descriptionCell: {
//     padding: "7px 8px",

//     color: "#64748B",

//     fontSize: "10px",

//     lineHeight: "13px",

//     textAlign: "left",

//     verticalAlign: "middle",

//     overflow: "hidden",

//     boxSizing: "border-box",
//   },

//   descriptionText: {
//     display: "block",

//     overflow: "hidden",

//     textOverflow: "ellipsis",

//     whiteSpace: "nowrap",
//   },

//   /* =======================================================
//      USERS
//   ======================================================= */

//   usersCell: {
//     padding: "7px 5px",

//     color: "#1F2937",

//     fontSize: "10px",

//     lineHeight: "13px",

//     fontWeight: 400,

//     textAlign: "center",

//     verticalAlign: "middle",

//     boxSizing: "border-box",
//   },

//   /* =======================================================
//      STATUS
//   ======================================================= */

//   statusCell: {
//     padding: "7px 5px",

//     textAlign: "center",

//     verticalAlign: "middle",

//     boxSizing: "border-box",
//   },

//   statusBadge: {
//     display: "inline-flex",

//     alignItems: "center",
//     justifyContent: "center",

//     minWidth: "43px",

//     height: "18px",

//     padding: "0 7px",

//     borderRadius: "999px",

//     fontSize: "9px",

//     lineHeight: "12px",

//     fontWeight: 500,

//     boxSizing: "border-box",
//   },

//   activeBadge: {
//     backgroundColor: "#DCFCE7",
//     color: "#15803D",
//   },

//   inactiveBadge: {
//     backgroundColor: "#F1F5F9",
//     color: "#64748B",
//   },

//   /* =======================================================
//      ACTION
//   ======================================================= */

//   actionCell: {
//     position: "relative",

//     padding: "5px 4px",

//     textAlign: "center",

//     verticalAlign: "middle",

//     boxSizing: "border-box",
//   },

//   actionWrapper: {
//     position: "relative",

//     width: "100%",

//     minHeight: "25px",

//     display: "flex",

//     alignItems: "center",

//     justifyContent: "center",

//     gap: "1px",

//     boxSizing: "border-box",
//   },

//   iconButton: {
//     width: "25px",
//     height: "25px",

//     display: "inline-flex",

//     alignItems: "center",
//     justifyContent: "center",

//     padding: 0,

//     border: "none",

//     borderRadius: "5px",

//     backgroundColor: "transparent",

//     color: "#334155",

//     cursor: "pointer",

//     boxSizing: "border-box",
//   },

//   /* =======================================================
//      DROPDOWN
//   ======================================================= */

//   dropdown: {
//     position: "absolute",

//     top: "27px",

//     right: "0",

//     zIndex: 100,

//     width: "130px",

//     backgroundColor: "#FFFFFF",

//     border:
//       "1px solid #E2E8F0",

//     borderRadius: "7px",

//     boxShadow:
//       "0 8px 24px rgba(15, 23, 42, 0.14)",

//     overflow: "hidden",

//     boxSizing: "border-box",
//   },

//   dropdownButton: {
//     width: "100%",

//     minHeight: "31px",

//     display: "block",

//     padding: "7px 10px",

//     border: "none",

//     backgroundColor: "#FFFFFF",

//     color: "#334155",

//     fontSize: "10px",

//     lineHeight: "14px",

//     textAlign: "left",

//     cursor: "pointer",

//     boxSizing: "border-box",
//   },

//   /* =======================================================
//      EMPTY
//   ======================================================= */

//   emptyCell: {
//     height: "80px",

//     padding: "20px",

//     textAlign: "center",

//     verticalAlign: "middle",

//     color: "#64748B",

//     fontSize: "10px",

//     borderBottom:
//       "1px solid #E2E8F0",
//   },

//   /* =======================================================
//      FOOTER
//   ======================================================= */

//   footer: {
//     width: "100%",

//     minHeight: "31px",

//     marginTop: "3px",

//     padding:
//       "4px 1px 0 1px",

//     display: "flex",

//     alignItems: "center",

//     justifyContent: "space-between",

//     gap: "8px",

//     flexShrink: 0,

//     borderTop:
//       "1px solid #E2E8F0",

//     boxSizing: "border-box",
//   },

//   showingText: {
//     margin: 0,

//     padding: 0,

//     color: "#64748B",

//     fontSize: "9px",

//     lineHeight: "12px",

//     whiteSpace: "nowrap",
//   },

//   /* =======================================================
//      PAGINATION
//   ======================================================= */

//   pagination: {
//     display: "flex",

//     alignItems: "center",

//     justifyContent: "flex-end",

//     gap: "2px",

//     flexShrink: 0,
//   },

//   paginationButton: {
//     width: "23px",
//     height: "23px",

//     display: "inline-flex",

//     alignItems: "center",
//     justifyContent: "center",

//     padding: 0,

//     border: "none",

//     borderRadius: "5px",

//     backgroundColor: "transparent",

//     color: "#475569",

//     cursor: "pointer",

//     boxSizing: "border-box",
//   },

//   pageButton: {
//     width: "23px",
//     height: "23px",

//     display: "inline-flex",

//     alignItems: "center",
//     justifyContent: "center",

//     padding: 0,

//     border: "none",

//     borderRadius: "5px",

//     backgroundColor: "transparent",

//     color: "#334155",

//     cursor: "pointer",

//     fontSize: "9px",

//     lineHeight: "12px",

//     boxSizing: "border-box",
//   },

//   activePageButton: {
//     backgroundColor: "#2563EB",

//     color: "#FFFFFF",
//   },

//   disabledButton: {
//     opacity: 0.35,

//     cursor: "not-allowed",
//   },
// };

import { useState, useEffect, useRef } from "react";
import {
  Pencil,
  MoreVertical,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
} from "lucide-react";

export default function RolesTable({
  roles = [],
  total = 0,
  selectedRole,
  setSelectedRole,
  onEdit,
  currentPage,
  totalPages,
  pageSize,
  startItem,
  endItem,
  onPageChange,
  onPrevious,
  onNext,
  onFirst,
  onLast,
  onToggleStatus,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  /* =========================================================
     CLICK OUTSIDE
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

  return (
    <div style={styles.container}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={styles.header}>
        <h2 style={styles.headerTitle}>
          Roles List ({roles.length})
        </h2>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>

          <colgroup>
            <col style={{ width: "22%" }} />
            <col style={{ width: "32%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "16%" }} />
          </colgroup>

          <thead>
            <tr style={styles.tableHeaderRow}>

              <th style={styles.tableHeaderCellLeft}>
                Role Name
              </th>

              <th style={styles.tableHeaderCellLeft}>
                Description
              </th>

              <th style={styles.tableHeaderCellCenter}>
                Users
              </th>

              <th style={styles.tableHeaderCellCenter}>
                Status
              </th>

              <th style={styles.tableHeaderCellCenter}>
                Action
              </th>

            </tr>
          </thead>

          <tbody>

            {roles.length === 0 ? (

              <tr>
                <td
                  colSpan={5}
                  style={styles.emptyCell}
                >
                  No Roles Found
                </td>
              </tr>

            ) : (

              roles.map((role) => {

                const isSelected =
                  selectedRole?.id === role.id;

                return (
                  <tr
                    key={role.id}
                    onClick={() =>
                      setSelectedRole(role)
                    }
                    style={{
                      ...styles.tableRow,
                      ...(isSelected
                        ? styles.selectedRow
                        : {}),
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor =
                          "#F8FAFC";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor =
                          "#FFFFFF";
                      }
                    }}
                  >

                    {/* ROLE NAME */}

                    <td style={styles.roleNameCell}>
                      {role.role_name || role.name || "-"}
                    </td>

                    {/* DESCRIPTION */}

                    <td style={styles.descriptionCell}>
                      <span style={styles.descriptionText}>
                        {role.description || "-"}
                      </span>
                    </td>

                    {/* USERS */}

                    <td style={styles.usersCell}>
                      {role.users ?? 0}
                    </td>

                    {/* STATUS */}

                    <td style={styles.statusCell}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(role.active
                            ? styles.activeBadge
                            : styles.inactiveBadge),
                        }}
                      >
                        {role.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td style={styles.actionCell}>

                      <div style={styles.actionWrapper}>

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(role);
                          }}
                          style={styles.iconButton}
                          title="Edit"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "#F3F4F6";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <Pencil
                            size={13}
                            strokeWidth={2}
                          />
                        </button>

                        {/* MORE */}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();

                            setOpenMenu(
                              openMenu === role.id
                                ? null
                                : role.id
                            );
                          }}
                          style={styles.iconButton}
                          title="More"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "#F3F4F6";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <MoreVertical
                            size={14}
                            strokeWidth={2}
                          />
                        </button>

                        {/* DROPDOWN */}

                        {openMenu === role.id && (
                          <div
                            ref={menuRef}
                            style={styles.dropdown}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();

                                onToggleStatus?.(role);

                                setOpenMenu(null);
                              }}
                              style={styles.dropdownButton}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#F8FAFC";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#FFFFFF";
                              }}
                            >
                              {role.active
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
            )}

          </tbody>
        </table>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div style={styles.footer}>

        {/* SHOWING */}

        <p style={styles.showingText}>
          Showing {startItem} to {endItem} of {total} roles
        </p>

        {/* PAGINATION */}

        <div style={styles.pagination}>

          {/* FIRST */}

          <button
            type="button"
            onClick={onFirst}
            disabled={currentPage === 1}
            style={{
              ...styles.paginationButton,
              ...(currentPage === 1
                ? styles.disabledButton
                : {}),
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.backgroundColor =
                  "#F3F4F6";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "transparent";
            }}
          >
            <ChevronsLeft size={13} />
          </button>

          {/* PREVIOUS */}

          <button
            type="button"
            onClick={onPrevious}
            disabled={currentPage === 1}
            style={{
              ...styles.paginationButton,
              ...(currentPage === 1
                ? styles.disabledButton
                : {}),
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.backgroundColor =
                  "#F3F4F6";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "transparent";
            }}
          >
            <ChevronLeft size={13} />
          </button>

          {/* PAGE NUMBERS */}

          {Array.from(
            { length: totalPages },
            (_, index) => {
              const page = index + 1;
              const isCurrent =
                currentPage === page;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() =>
                    onPageChange(page)
                  }
                  style={{
                    ...styles.pageButton,
                    ...(isCurrent
                      ? styles.activePageButton
                      : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.backgroundColor =
                        "#F3F4F6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) {
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
            type="button"
            onClick={onNext}
            disabled={
              currentPage === totalPages ||
              totalPages === 0
            }
            style={{
              ...styles.paginationButton,
              ...(currentPage === totalPages ||
              totalPages === 0
                ? styles.disabledButton
                : {}),
            }}
            onMouseEnter={(e) => {
              if (
                currentPage !== totalPages &&
                totalPages !== 0
              ) {
                e.currentTarget.style.backgroundColor =
                  "#F3F4F6";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "transparent";
            }}
          >
            <ChevronRight size={13} />
          </button>

          {/* LAST */}

          <button
            type="button"
            onClick={onLast}
            disabled={
              currentPage === totalPages ||
              totalPages === 0
            }
            style={{
              ...styles.paginationButton,
              ...(currentPage === totalPages ||
              totalPages === 0
                ? styles.disabledButton
                : {}),
            }}
            onMouseEnter={(e) => {
              if (
                currentPage !== totalPages &&
                totalPages !== 0
              ) {
                e.currentTarget.style.backgroundColor =
                  "#F3F4F6";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "transparent";
            }}
          >
            <ChevronsRight size={13} />
          </button>

        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INLINE STYLES
========================================================= */

const styles = {

  /* =======================================================
     MAIN CARD
  ======================================================= */

  container: {
    width: "100%",
    height: "100%",
    minWidth: 0,
    minHeight: 0,

    display: "flex",
    flexDirection: "column",

    backgroundColor: "#FFFFFF",

    border: "1px solid #E2E8F0",
    borderRadius: "10px",

    boxShadow:
      "0 1px 3px rgba(15, 23, 42, 0.08)",

    padding: "8px",

    boxSizing: "border-box",

    overflow: "hidden",
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    height: "25px",

    display: "flex",
    alignItems: "center",

    flexShrink: 0,

    padding: "0 1px",
  },

  headerTitle: {
    margin: 0,

    color: "#111827",

    fontSize: "12px",
    lineHeight: "16px",

    fontWeight: 600,
  },

  /* =======================================================
     TABLE WRAPPER
  ======================================================= */

  tableWrapper: {
    width: "100%",

    minWidth: 0,
    minHeight: 0,

    marginTop: "4px",

    overflow: "visible",

    boxSizing: "border-box",
  },

  /* =======================================================
     TABLE
  ======================================================= */

  table: {
    width: "100%",

    tableLayout: "fixed",

    borderCollapse: "collapse",

    borderSpacing: 0,

    boxSizing: "border-box",
  },

  /* =======================================================
     HEADER ROW
  ======================================================= */

  tableHeaderRow: {
    height: "26px",

    backgroundColor: "#F8FAFC",

    borderBottom:
      "1px solid #DCE3EB",
  },

  tableHeaderCellLeft: {
    height: "26px",

    padding: "0 7px",

    textAlign: "left",

    verticalAlign: "middle",

    color: "#1E293B",

    fontSize: "9px",

    lineHeight: "12px",

    fontWeight: 600,

    whiteSpace: "nowrap",

    boxSizing: "border-box",
  },

  tableHeaderCellCenter: {
    height: "26px",

    padding: "0 5px",

    textAlign: "center",

    verticalAlign: "middle",

    color: "#1E293B",

    fontSize: "9px",

    lineHeight: "12px",

    fontWeight: 600,

    whiteSpace: "nowrap",

    boxSizing: "border-box",
  },

  /* =======================================================
     BODY ROW
     
     REDUCED FROM 43px → 39px
  ======================================================= */

  tableRow: {
    height: "39px",

    backgroundColor: "#FFFFFF",

    borderBottom:
      "1px solid #CBD5E1",

    cursor: "pointer",

    transition:
      "background-color 120ms ease",

    boxSizing: "border-box",
  },

  selectedRow: {
    backgroundColor: "#EFF6FF",
  },

  /* =======================================================
     ROLE NAME
     
     FONT INCREASED 10px → 11px
  ======================================================= */

  roleNameCell: {
    padding: "5px 8px",

    color: "#111827",

    fontSize: "11px",

    lineHeight: "14px",

    fontWeight: 500,

    textAlign: "left",

    verticalAlign: "middle",

    overflow: "hidden",

    textOverflow: "ellipsis",

    whiteSpace: "nowrap",

    boxSizing: "border-box",
  },

  /* =======================================================
     DESCRIPTION
     
     FONT INCREASED 10px → 11px
  ======================================================= */

  descriptionCell: {
    padding: "5px 8px",

    color: "#64748B",

    fontSize: "11px",

    lineHeight: "14px",

    textAlign: "left",

    verticalAlign: "middle",

    overflow: "hidden",

    boxSizing: "border-box",
  },

  descriptionText: {
    display: "block",

    overflow: "hidden",

    textOverflow: "ellipsis",

    whiteSpace: "nowrap",
  },

  /* =======================================================
     USERS
     
     FONT INCREASED 10px → 11px
  ======================================================= */

  usersCell: {
    padding: "5px 5px",

    color: "#1F2937",

    fontSize: "11px",

    lineHeight: "14px",

    fontWeight: 400,

    textAlign: "center",

    verticalAlign: "middle",

    boxSizing: "border-box",
  },

  /* =======================================================
     STATUS
  ======================================================= */

  statusCell: {
    padding: "5px 5px",

    textAlign: "center",

    verticalAlign: "middle",

    boxSizing: "border-box",
  },

  statusBadge: {
    display: "inline-flex",

    alignItems: "center",
    justifyContent: "center",

    minWidth: "43px",

    height: "18px",

    padding: "0 7px",

    borderRadius: "999px",

    fontSize: "9px",

    lineHeight: "12px",

    fontWeight: 500,

    boxSizing: "border-box",
  },

  activeBadge: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
  },

  inactiveBadge: {
    backgroundColor: "#F1F5F9",
    color: "#64748B",
  },

  /* =======================================================
     ACTION
  ======================================================= */

  actionCell: {
    position: "relative",

    padding: "4px 4px",

    textAlign: "center",

    verticalAlign: "middle",

    boxSizing: "border-box",
  },

  actionWrapper: {
    position: "relative",

    width: "100%",

    minHeight: "23px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "1px",

    boxSizing: "border-box",
  },

  iconButton: {
    width: "25px",
    height: "25px",

    display: "inline-flex",

    alignItems: "center",
    justifyContent: "center",

    padding: 0,

    border: "none",

    borderRadius: "5px",

    backgroundColor: "transparent",

    color: "#334155",

    cursor: "pointer",

    boxSizing: "border-box",
  },

  /* =======================================================
     DROPDOWN
  ======================================================= */

  dropdown: {
    position: "absolute",

    top: "27px",

    right: "0",

    zIndex: 100,

    width: "130px",

    backgroundColor: "#FFFFFF",

    border:
      "1px solid #E2E8F0",

    borderRadius: "7px",

    boxShadow:
      "0 8px 24px rgba(15, 23, 42, 0.14)",

    overflow: "hidden",

    boxSizing: "border-box",
  },

  dropdownButton: {
    width: "100%",

    minHeight: "31px",

    display: "block",

    padding: "7px 10px",

    border: "none",

    backgroundColor: "#FFFFFF",

    color: "#334155",

    fontSize: "10px",

    lineHeight: "14px",

    textAlign: "left",

    cursor: "pointer",

    boxSizing: "border-box",
  },

  /* =======================================================
     EMPTY
  ======================================================= */

  emptyCell: {
    height: "80px",

    padding: "20px",

    textAlign: "center",

    verticalAlign: "middle",

    color: "#64748B",

    fontSize: "10px",

    borderBottom:
      "1px solid #E2E8F0",
  },

  /* =======================================================
     FOOTER
  ======================================================= */

  footer: {
    width: "100%",

    minHeight: "31px",

    marginTop: "3px",

    padding:
      "4px 1px 0 1px",

    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",

    gap: "8px",

    flexShrink: 0,

    borderTop:
      "1px solid #E2E8F0",

    boxSizing: "border-box",
  },

  showingText: {
    margin: 0,

    padding: 0,

    color: "#64748B",

    fontSize: "9px",

    lineHeight: "12px",

    whiteSpace: "nowrap",
  },

  /* =======================================================
     PAGINATION
  ======================================================= */

  pagination: {
    display: "flex",

    alignItems: "center",

    justifyContent: "flex-end",

    gap: "2px",

    flexShrink: 0,
  },

  paginationButton: {
    width: "23px",
    height: "23px",

    display: "inline-flex",

    alignItems: "center",
    justifyContent: "center",

    padding: 0,

    border: "none",

    borderRadius: "5px",

    backgroundColor: "transparent",

    color: "#475569",

    cursor: "pointer",

    boxSizing: "border-box",
  },

  pageButton: {
    width: "23px",
    height: "23px",

    display: "inline-flex",

    alignItems: "center",
    justifyContent: "center",

    padding: 0,

    border: "none",

    borderRadius: "5px",

    backgroundColor: "transparent",

    color: "#334155",

    cursor: "pointer",

    fontSize: "9px",

    lineHeight: "12px",

    boxSizing: "border-box",
  },

  activePageButton: {
    backgroundColor: "#2563EB",

    color: "#FFFFFF",
  },

  disabledButton: {
    opacity: 0.35,

    cursor: "not-allowed",
  },
};

