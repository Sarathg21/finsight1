
// import { useRef, useState, useEffect } from "react";
// import { createPortal } from "react-dom";
// import toast from "react-hot-toast";
// import { Info } from "lucide-react";

// import {
//   Edit,
//   MoreVertical,
//   ArrowUpDown,
//   ChevronsLeft,
//   ChevronsRight,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";

// import StatusBadge from "../StatusBadge";

// export default function UserTable({
//   users,
//   total,

//   selectedId,
//   onSelect,

//   onEdit,
//   onToggleStatus,

//   currentPage,
//   totalPages,
//   pageSize,

//   onPageChange,
//   onPrevious,
//   onNext,
//   onFirst,
//   onLast,
//   onPageSizeChange,

//   // Existing prop preserved
//   compactAccess = false,
// }) {
//   const tableRef = useRef(null);
//   const menuRef = useRef(null);

//   const [openMenu, setOpenMenu] = useState(null);
//   const [menuPosition, setMenuPosition] = useState(null);

//   /* =========================================================
//      CLOSE MENU OUTSIDE CLICK
//   ========================================================= */

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         menuRef.current &&
//         !menuRef.current.contains(event.target)
//       ) {
//         setOpenMenu(null);
//         setMenuPosition(null);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleClickOutside
//       );
//     };
//   }, []);

//   /* =========================================================
//      CLOSE MENU ON SCROLL
//   ========================================================= */

//   useEffect(() => {
//     const handleScroll = () => {
//       if (openMenu !== null) {
//         setOpenMenu(null);
//         setMenuPosition(null);
//       }
//     };

//     window.addEventListener("scroll", handleScroll, true);

//     return () => {
//       window.removeEventListener(
//         "scroll",
//         handleScroll,
//         true
//       );
//     };
//   }, [openMenu]);

//   /* =========================================================
//      TABLE COLUMNS
//   ========================================================= */

//   const fullColumns = [
//     "Emp Code",
//     "Employee Name",
//     "Email",
//     "Role",
//     "Status",
//     "Last Login",
//   ];

//   const accessColumns = [
//     "Emp Code",
//     "Employee Name",
//     "Role",
//     "Status",
//   ];

//   const columns = compactAccess
//     ? accessColumns
//     : fullColumns;

//   /* =========================================================
//      PAGINATION INFO
//   ========================================================= */

//   const startItem =
//     total === 0
//       ? 0
//       : (currentPage - 1) * pageSize + 1;

//   const endItem = Math.min(
//     currentPage * pageSize,
//     total
//   );

//   /* =========================================================
//      OPEN DROPDOWN
//   ========================================================= */

//   const handleMenuClick = (event, userId) => {
//     event.stopPropagation();

//     if (openMenu === userId) {
//       setOpenMenu(null);
//       setMenuPosition(null);
//       return;
//     }

//     const buttonRect =
//       event.currentTarget.getBoundingClientRect();

//     const menuWidth = 176;

//     const menuHeight = compactAccess
//       ? 80
//       : 120;

//     const spaceBelow =
//       window.innerHeight - buttonRect.bottom;

//     const spaceAbove =
//       buttonRect.top;

//     let top;

//     if (
//       spaceBelow < menuHeight &&
//       spaceAbove >= menuHeight
//     ) {
//       top =
//         buttonRect.top -
//         menuHeight -
//         4;
//     } else {
//       top =
//         buttonRect.bottom +
//         4;
//     }

//     let left =
//       buttonRect.right -
//       menuWidth;

//     if (
//       left + menuWidth >
//       window.innerWidth - 8
//     ) {
//       left =
//         window.innerWidth -
//         menuWidth -
//         8;
//     }

//     if (left < 8) {
//       left = 8;
//     }

//     setMenuPosition({
//       top,
//       left,
//     });

//     setOpenMenu(userId);
//   };

//   /* =========================================================
//      CURRENT MENU USER
//   ========================================================= */

//   const menuUser =
//     users.find(
//       (user) => user.id === openMenu
//     );

//   return (
//     <div
//       className="
//         flex
//         h-full
//         w-full
//         min-w-0
//         flex-col
//         overflow-hidden
//         rounded-xl
//         border
//         border-gray-200
//         bg-white
//         shadow-sm
//       "
//       style={{
//         fontSize: "10px",
//       }}
//     >

//       {/* =====================================================
//           HEADER
//       ===================================================== */}

//       <div
//         className="
//         shrink-0
//         flex
//         items-center
//         border-b
//         border-gray-200
//         bg-white
//         px-4
//         py-2.5
//       "
//         style={{
//           minHeight: "42px",
//         }}
//       >
//         <h3
//           className="
//             m-0
//             font-semibold
//             text-gray-800
//           "
//           style={{
//             fontSize: "14px",
//             lineHeight: "20px",
//             fontWeight: 600,
//           }}
//         >
//           Users List ({total})
//         </h3>
//       </div>

//       {/* =====================================================
//           TABLE
//       ===================================================== */}

//       <div
//         ref={tableRef}
//         className="
//           flex-1
//           min-h-0
//           overflow-hidden
//         "
//         style={{
//           overflow: "hidden",
//         }}
//       >
//         <table
//           className="
//             w-full
//             table-fixed
//             border-collapse
//           "
//           style={{
//             width: "100%",
//             tableLayout: "fixed",
//             fontSize: "10px",
//           }}
//         >

//           {/* =================================================
//               TABLE HEADER
//           ================================================= */}

//           <thead
//             className="
//               bg-gray-50
//             "
//           >
//             <tr
//               className="
//                 text-left
//                 font-semibold
//                 text-gray-700
//               "
//               style={{
//                 height: "30px",
//                 fontSize: "9px",
//                 lineHeight: "12px",
//                 fontWeight: 600,
//               }}
//             >

//               {/* Checkbox */}

//               <th
//                 className="w-8"
//                 style={{
//                   width: "32px",
//                   padding: "4px 8px",
//                   fontSize: "9px",
//                   fontWeight: 600,
//                 }}
//               >
//                 <input
//                   type="checkbox"
//                   className="
//                     rounded
//                     border-gray-300
//                   "
//                   style={{
//                     width: "12px",
//                     height: "12px",
//                   }}
//                 />
//               </th>

//               {/* Columns */}

//               {columns.map((header) => (
//                 <th
//                   key={header}
//                   style={{
//                     padding: "5px 8px",
//                     fontSize: "9px",
//                     lineHeight: "12px",
//                     fontWeight: 600,
//                     whiteSpace: "nowrap",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                   }}
//                 >
//                   <span
//                     className="
//                       inline-flex
//                       items-center
//                       gap-1
//                     "
//                     style={{
//                       fontSize: "9px",
//                       fontWeight: 600,
//                     }}
//                   >
//                     {header}

//                     <ArrowUpDown
//                       style={{
//                         width: "10px",
//                         height: "10px",
//                         opacity: 0.4,
//                         flexShrink: 0,
//                       }}
//                     />
//                   </span>
//                 </th>
//               ))}

//               {/* Action */}

//               <th
//                 style={{
//                   padding: "5px 8px",
//                   fontSize: "9px",
//                   fontWeight: 600,
//                   width: compactAccess
//                     ? "80px"
//                     : "75px",
//                 }}
//               >
//                 Action
//               </th>

//             </tr>
//           </thead>

//           {/* =================================================
//               TABLE BODY
//           ================================================= */}

//           <tbody
//             className="
//               divide-y
//               divide-gray-100
//             "
//           >

//             {users.length === 0 ? (

//               <tr>
//                 <td
//                   colSpan={
//                     compactAccess
//                       ? 6
//                       : 8
//                   }
//                   className="
//                     text-center
//                     text-gray-500
//                   "
//                   style={{
//                     height: "80px",
//                     padding: "10px",
//                     fontSize: "10px",
//                   }}
//                 >
//                   No users found
//                 </td>
//               </tr>

//             ) : (

//               users.map((user) => (

//                 <tr
//                   key={user.id}
//                   onClick={() =>
//                     onSelect(user)
//                   }
//                   className={`
//                     cursor-pointer
//                     transition-colors
//                     ${selectedId === user.id
//                       ? "bg-blue-50"
//                       : "hover:bg-gray-50"
//                     }
//                   `}
//                   style={{
//                     height: "31px",
//                     fontSize: "10px",
//                     lineHeight: "13px",
//                   }}
//                 >

//                   {/* =================================================
//                       CHECKBOX
//                   ================================================= */}

//                   <td
//                     style={{
//                       width: "32px",
//                       padding: "4px 8px",
//                     }}
//                   >
//                     <input
//                       type="checkbox"
//                       className="
//                         rounded
//                         border-gray-300
//                       "
//                       style={{
//                         width: "12px",
//                         height: "12px",
//                       }}
//                       onClick={(e) =>
//                         e.stopPropagation()
//                       }
//                     />
//                   </td>

//                   {/* =================================================
//                       EMPLOYEE CODE
//                   ================================================= */}

//                   <td
//                     className="
//                       font-medium
//                       text-gray-800
//                     "
//                     style={{
//                       padding: "4px 8px",
//                       fontSize: "10px",
//                       lineHeight: "13px",
//                       fontWeight: 500,
//                       whiteSpace: "nowrap",
//                       overflow: "hidden",
//                       textOverflow: "ellipsis",
//                     }}
//                     title={user.code}
//                   >
//                     {user.code}
//                   </td>

//                   {/* =================================================
//                       EMPLOYEE NAME
//                   ================================================= */}

//                   <td
//                     className="
//                       text-gray-800
//                     "
//                     style={{
//                       padding: "4px 8px",
//                       fontSize: "10px",
//                       lineHeight: "13px",
//                       whiteSpace: "nowrap",
//                       overflow: "hidden",
//                       textOverflow: "ellipsis",
//                     }}
//                     title={user.name}
//                   >
//                     {user.name}
//                   </td>

//                   {/* =================================================
//                       EMAIL
//                   ================================================= */}

//                   {!compactAccess && (
//                     <td
//                       className="
//                         text-gray-700
//                       "
//                       style={{
//                         padding: "4px 8px",
//                         fontSize: "10px",
//                         lineHeight: "13px",
//                         whiteSpace: "nowrap",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                       }}
//                       title={user.email}
//                     >
//                       {user.email}
//                     </td>
//                   )}

//                   {/* =================================================
//                       ROLE
//                   ================================================= */}

//                   <td
//                     className="
//                       text-gray-800
//                     "
//                     style={{
//                       padding: "4px 8px",
//                       fontSize: "10px",
//                       lineHeight: "13px",
//                       whiteSpace: "nowrap",
//                       overflow: "hidden",
//                       textOverflow: "ellipsis",
//                     }}
//                     title={user.role}
//                   >
//                     {user.role}
//                   </td>

//                   {/* =================================================
//                       STATUS
//                   ================================================= */}

//                   <td
//                     style={{
//                       padding: "4px 8px",
//                     }}
//                   >
//                     <StatusBadge
//                       label={user.status}
//                       tone={
//                         user.status === "Active"
//                           ? "green"
//                           : "gray"
//                       }
//                       className="
//                         px-2
//                         py-0.5
//                       "
//                       style={{
//                         fontSize: "8px",
//                         lineHeight: "11px",
//                       }}
//                     />
//                   </td>

//                   {/* =================================================
//                       LAST LOGIN
//                   ================================================= */}

//                   {!compactAccess && (
//                     <td
//                       className="
//                         whitespace-nowrap
//                         text-gray-800
//                       "
//                       style={{
//                         padding: "4px 8px",
//                         fontSize: "10px",
//                         lineHeight: "13px",
//                         whiteSpace: "nowrap",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                       }}
//                     >
//                       {user.lastLogin}
//                     </td>
//                   )}

//                   {/* =================================================
//                       ACTION
//                   ================================================= */}

//                   <td
//                     onClick={(e) =>
//                       e.stopPropagation()
//                     }
//                     style={{
//                       padding: "4px 8px",
//                     }}
//                   >
//                     <div
//                       className="
//                         flex
//                         items-center
//                         gap-1
//                       "
//                     >

//                       {/* EDIT */}

//                       <button
//                         onClick={() =>
//                           onEdit(user)
//                         }
//                         className="
//                           rounded
//                           p-0.5
//                           hover:bg-gray-100
//                           hover:text-blue-700
//                         "
//                         style={{
//                           padding: "2px",
//                         }}
//                         title="Edit User"
//                       >
//                         <Edit
//                           style={{
//                             width: "13px",
//                             height: "13px",
//                           }}
//                         />
//                       </button>

//                       {/* MORE */}

//                       <button
//                         onClick={(e) =>
//                           handleMenuClick(
//                             e,
//                             user.id
//                           )
//                         }
//                         className="
//                           rounded
//                           p-0.5
//                           hover:bg-gray-100
//                         "
//                         style={{
//                           padding: "2px",
//                         }}
//                         title="More Actions"
//                       >
//                         <MoreVertical
//                           style={{
//                             width: "13px",
//                             height: "13px",
//                           }}
//                         />
//                       </button>

//                     </div>
//                   </td>

//                 </tr>

//               ))

//             )}

//           </tbody>

//         </table>
//       </div>

//       {/* =====================================================
//           DROPDOWN
//       ===================================================== */}

//       {openMenu !== null &&
//         menuPosition &&
//         menuUser &&
//         createPortal(

//           <div
//             ref={menuRef}
//             className="
//               fixed
//               z-[9999]
//               w-44
//               overflow-hidden
//               rounded-lg
//               border
//               border-gray-200
//               bg-white
//               shadow-lg
//             "
//             style={{
//               top: `${menuPosition.top}px`,
//               left: `${menuPosition.left}px`,
//               width: "176px",
//               zIndex: 9999,
//             }}
//             onClick={(e) =>
//               e.stopPropagation()
//             }
//           >

//             {/* VIEW DETAILS */}

//             <button
//               onClick={() => {
//                 onSelect(menuUser);

//                 setOpenMenu(null);
//                 setMenuPosition(null);
//               }}
//               className="
//                 block
//                 w-full
//                 text-left
//                 hover:bg-gray-50
//               "
//               style={{
//                 padding: "8px 12px",
//                 fontSize: "10px",
//                 lineHeight: "14px",
//               }}
//             >
//               View Details
//             </button>

//             {/* RESET PASSWORD */}

//             {!compactAccess && (
//               <button
//                 onClick={() => {
//                   toast.custom(() => (
//                     <div
//                       className="
//                         flex
//                         items-center
//                         gap-3
//                         rounded-lg
//                         border
//                         border-blue-200
//                         bg-blue-50
//                         px-4
//                         py-3
//                         shadow-lg
//                       "
//                     >
//                       <Info
//                         className="
//                           h-5
//                           w-5
//                           text-blue-600
//                         "
//                       />

//                       <span
//                         className="
//                           text-sm
//                           font-medium
//                           text-blue-900
//                         "
//                       >
//                         Reset password will be
//                         available shortly.
//                       </span>
//                     </div>
//                   ));

//                   setOpenMenu(null);
//                   setMenuPosition(null);
//                 }}
//                 className="
//                   block
//                   w-full
//                   text-left
//                   hover:bg-gray-50
//                 "
//                 style={{
//                   padding: "8px 12px",
//                   fontSize: "10px",
//                   lineHeight: "14px",
//                 }}
//               >
//                 Reset Password
//               </button>
//             )}

//             {/* ACTIVATE / DEACTIVATE */}

//             <button
//               onClick={() => {
//                 onToggleStatus(menuUser);

//                 setOpenMenu(null);
//                 setMenuPosition(null);
//               }}
//               className="
//                 block
//                 w-full
//                 text-left
//                 hover:bg-gray-50
//               "
//               style={{
//                 padding: "8px 12px",
//                 fontSize: "10px",
//                 lineHeight: "14px",
//               }}
//             >
//               {menuUser.active
//                 ? "Deactivate"
//                 : "Activate"}
//             </button>

//           </div>,

//           document.body
//         )}

//       {/* =====================================================
//           PAGINATION
//       ===================================================== */}

//       <div
//         className="
//           shrink-0
//           flex
//           items-center
//           justify-between
//           gap-2
//           border-t
//           border-gray-200
//           bg-gray-50/40
//         "
//         style={{
//           minHeight: "34px",
//           padding: "5px 12px",
//         }}
//       >

//         {/* RECORD COUNT */}

//         <p
//           className="
//             text-gray-700
//           "
//           style={{
//             margin: 0,
//             fontSize: "9px",
//             lineHeight: "12px",
//           }}
//         >
//           Showing {startItem} to {endItem} of{" "}
//           {total} users
//         </p>

//         {/* PAGINATION BUTTONS */}

//         <div
//           className="
//             flex
//             items-center
//             gap-1
//           "
//         >

//           {/* FIRST */}

//           <button
//             onClick={onFirst}
//             disabled={currentPage === 1}
//             className="
//               rounded
//               text-gray-500
//               hover:bg-gray-100
//               disabled:cursor-not-allowed
//               disabled:opacity-40
//             "
//             style={{
//               width: "20px",
//               height: "20px",
//               padding: "2px",
//             }}
//           >
//             <ChevronsLeft
//               style={{
//                 width: "13px",
//                 height: "13px",
//               }}
//             />
//           </button>

//           {/* PREVIOUS */}

//           <button
//             onClick={onPrevious}
//             disabled={currentPage === 1}
//             className="
//               rounded
//               text-gray-500
//               hover:bg-gray-100
//               disabled:cursor-not-allowed
//               disabled:opacity-40
//             "
//             style={{
//               width: "20px",
//               height: "20px",
//               padding: "2px",
//             }}
//           >
//             <ChevronLeft
//               style={{
//                 width: "13px",
//                 height: "13px",
//               }}
//             />
//           </button>

//           {/* PAGE NUMBERS */}

//           {Array.from(
//             { length: totalPages },
//             (_, index) => {
//               const page = index + 1;

//               return (
//                 <button
//                   key={page}
//                   onClick={() => {
//                     onPageChange(page);
//                   }}
//                   className={`
//                     rounded
//                     font-medium
//                     ${currentPage === page
//                       ? "bg-blue-600 text-white"
//                       : "text-gray-600 hover:bg-gray-100"
//                     }
//                   `}
//                   style={{
//                     width: "20px",
//                     height: "20px",
//                     padding: 0,
//                     fontSize: "9px",
//                     lineHeight: "20px",
//                   }}
//                 >
//                   {page}
//                 </button>
//               );
//             }
//           )}

//           {/* NEXT */}

//           <button
//             onClick={onNext}
//             disabled={
//               currentPage === totalPages ||
//               totalPages === 0
//             }
//             className="
//               rounded
//               text-gray-500
//               hover:bg-gray-100
//               disabled:cursor-not-allowed
//               disabled:opacity-40
//             "
//             style={{
//               width: "20px",
//               height: "20px",
//               padding: "2px",
//             }}
//           >
//             <ChevronRight
//               style={{
//                 width: "13px",
//                 height: "13px",
//               }}
//             />
//           </button>

//           {/* LAST */}

//           <button
//             onClick={onLast}
//             disabled={
//               currentPage === totalPages ||
//               totalPages === 0
//             }
//             className="
//               rounded
//               text-gray-500
//               hover:bg-gray-100
//               disabled:cursor-not-allowed
//               disabled:opacity-40
//             "
//             style={{
//               width: "20px",
//               height: "20px",
//               padding: "2px",
//             }}
//           >
//             <ChevronsRight
//               style={{
//                 width: "13px",
//                 height: "13px",
//               }}
//             />
//           </button>

//         </div>

//       </div>

//     </div>
//   );
// }


import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Info } from "lucide-react";

import {
  Edit,
  MoreVertical,
  ArrowUpDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import StatusBadge from "../StatusBadge";

export default function UserTable({
  users,
  total,

  selectedId,
  onSelect,

  onEdit,
  onToggleStatus,

  currentPage,
  totalPages,
  pageSize,

  onPageChange,
  onPrevious,
  onNext,
  onFirst,
  onLast,
  onPageSizeChange,

  // Existing prop preserved
  compactAccess = false,
}) {
  const tableRef = useRef(null);
  const menuRef = useRef(null);

  const [openMenu, setOpenMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);

  /* =========================================================
     CLOSE MENU OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpenMenu(null);
        setMenuPosition(null);
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
     CLOSE MENU ON SCROLL
  ========================================================= */

  useEffect(() => {
    const handleScroll = () => {
      if (openMenu !== null) {
        setOpenMenu(null);
        setMenuPosition(null);
      }
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
        true
      );
    };
  }, [openMenu]);

  /* =========================================================
     TABLE COLUMNS
  ========================================================= */

  const fullColumns = [
    "Emp Code",
    "Employee Name",
    "Email",
    "Role",
    "Status",
    "Last Login",
  ];

  const accessColumns = [
    "Emp Code",
    "Employee Name",
    "Role",
    "Status",
  ];

  const columns = compactAccess
    ? accessColumns
    : fullColumns;

  /* =========================================================
     PAGINATION INFO
  ========================================================= */

  const startItem =
    total === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endItem = Math.min(
    currentPage * pageSize,
    total
  );

  /* =========================================================
     OPEN DROPDOWN
  ========================================================= */

  const handleMenuClick = (event, userId) => {
    event.stopPropagation();

    if (openMenu === userId) {
      setOpenMenu(null);
      setMenuPosition(null);
      return;
    }

    const buttonRect =
      event.currentTarget.getBoundingClientRect();

    const menuWidth = 176;

    const menuHeight = compactAccess
      ? 80
      : 120;

    const spaceBelow =
      window.innerHeight - buttonRect.bottom;

    const spaceAbove =
      buttonRect.top;

    let top;

    if (
      spaceBelow < menuHeight &&
      spaceAbove >= menuHeight
    ) {
      top =
        buttonRect.top -
        menuHeight -
        4;
    } else {
      top =
        buttonRect.bottom +
        4;
    }

    let left =
      buttonRect.right -
      menuWidth;

    if (
      left + menuWidth >
      window.innerWidth - 8
    ) {
      left =
        window.innerWidth -
        menuWidth -
        8;
    }

    if (left < 8) {
      left = 8;
    }

    setMenuPosition({
      top,
      left,
    });

    setOpenMenu(userId);
  };

  /* =========================================================
     CURRENT MENU USER
  ========================================================= */

  const menuUser =
    users.find(
      (user) => user.id === openMenu
    );

  return (
    <div
      className="
        flex
        h-full
        w-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-xl
        border
        border-gray-200
        bg-white
        shadow-sm
      "
      style={{
        fontSize: "10px",
      }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          shrink-0
          flex
          items-center
          border-b
          border-gray-200
          bg-white
          px-4
          py-2.5
        "
        style={{
          minHeight: "42px",
          flexShrink: 0,
        }}
      >
        <h3
          className="
            m-0
            font-semibold
            text-gray-800
          "
          style={{
            fontSize: "14px",
            lineHeight: "20px",
            fontWeight: 600,
          }}
        >
          Users List ({total})
        </h3>
      </div>

      {/* =====================================================
          TABLE AREA
          ONLY THE TABLE USES THE FLEXIBLE AREA.
          PAGINATION IS COMPLETELY OUTSIDE THIS AREA.
      ===================================================== */}

      <div
        ref={tableRef}
        className="
          min-h-0
          flex-1
          overflow-auto
        "
        style={{
          minHeight: 0,
          flex: "1 1 auto",
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        <table
          className="
            w-full
            table-fixed
            border-collapse
          "
          style={{
            width: "100%",
            tableLayout: "fixed",
            fontSize: "10px",
          }}
        >

          {/* =================================================
              TABLE HEADER
          ================================================= */}

          <thead
            className="
              bg-gray-50
            "
          >
            <tr
              className="
                text-left
                font-semibold
                text-gray-700
              "
              style={{
                height: "30px",
                fontSize: "9px",
                lineHeight: "12px",
                fontWeight: 600,
              }}
            >

              {/* Checkbox */}

              <th
                className="w-8"
                style={{
                  width: "32px",
                  padding: "4px 8px",
                  fontSize: "9px",
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  className="
                    rounded
                    border-gray-300
                  "
                  style={{
                    width: "12px",
                    height: "12px",
                  }}
                />
              </th>

              {/* Columns */}

              {columns.map((header) => (
                <th
                  key={header}
                  style={{
                    padding: "5px 8px",
                    fontSize: "9px",
                    lineHeight: "12px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1
                    "
                    style={{
                      fontSize: "9px",
                      fontWeight: 600,
                    }}
                  >
                    {header}

                    <ArrowUpDown
                      style={{
                        width: "10px",
                        height: "10px",
                        opacity: 0.4,
                        flexShrink: 0,
                      }}
                    />
                  </span>
                </th>
              ))}

              {/* Action */}

              <th
                style={{
                  padding: "5px 8px",
                  fontSize: "9px",
                  fontWeight: 600,
                  width: compactAccess
                    ? "80px"
                    : "75px",
                }}
              >
                Action
              </th>

            </tr>
          </thead>

          {/* =================================================
              TABLE BODY
          ================================================= */}

          <tbody
            className="
              divide-y
              divide-gray-100
            "
          >

            {users.length === 0 ? (

              <tr>
                <td
                  colSpan={
                    compactAccess
                      ? 6
                      : 8
                  }
                  className="
                    text-center
                    text-gray-500
                  "
                  style={{
                    height: "80px",
                    padding: "10px",
                    fontSize: "10px",
                  }}
                >
                  No users found
                </td>
              </tr>

            ) : (

              users.map((user) => (

                <tr
                  key={user.id}
                  onClick={() =>
                    onSelect(user)
                  }
                  className={`
                    cursor-pointer
                    transition-colors
                    ${
                      selectedId === user.id
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }
                  `}
                  style={{
                    height: "31px",
                    fontSize: "10px",
                    lineHeight: "13px",
                  }}
                >

                  {/* CHECKBOX */}

                  <td
                    style={{
                      width: "32px",
                      padding: "4px 8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="
                        rounded
                        border-gray-300
                      "
                      style={{
                        width: "12px",
                        height: "12px",
                      }}
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    />
                  </td>

                  {/* EMPLOYEE CODE */}

                  <td
                    className="
                      font-medium
                      text-gray-800
                    "
                    style={{
                      padding: "4px 8px",
                      fontSize: "10px",
                      lineHeight: "13px",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={user.code}
                  >
                    {user.code}
                  </td>

                  {/* EMPLOYEE NAME */}

                  <td
                    className="
                      text-gray-800
                    "
                    style={{
                      padding: "4px 8px",
                      fontSize: "10px",
                      lineHeight: "13px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={user.name}
                  >
                    {user.name}
                  </td>

                  {/* EMAIL */}

                  {!compactAccess && (
                    <td
                      className="
                        text-gray-700
                      "
                      style={{
                        padding: "4px 8px",
                        fontSize: "10px",
                        lineHeight: "13px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={user.email}
                    >
                      {user.email}
                    </td>
                  )}

                  {/* ROLE */}

                  <td
                    className="
                      text-gray-800
                    "
                    style={{
                      padding: "4px 8px",
                      fontSize: "10px",
                      lineHeight: "13px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={user.role}
                  >
                    {user.role}
                  </td>

                  {/* STATUS */}

                  <td
                    style={{
                      padding: "4px 8px",
                    }}
                  >
                    <StatusBadge
                      label={user.status}
                      tone={
                        user.status === "Active"
                          ? "green"
                          : "gray"
                      }
                      className="
                        px-2
                        py-0.5
                      "
                      style={{
                        fontSize: "8px",
                        lineHeight: "11px",
                      }}
                    />
                  </td>

                  {/* LAST LOGIN */}

                  {!compactAccess && (
                    <td
                      className="
                        whitespace-nowrap
                        text-gray-800
                      "
                      style={{
                        padding: "4px 8px",
                        fontSize: "10px",
                        lineHeight: "13px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.lastLogin}
                    </td>
                  )}

                  {/* ACTION */}

                  <td
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                    style={{
                      padding: "4px 8px",
                    }}
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-1
                      "
                    >

                      {/* EDIT */}

                      <button
                        onClick={() =>
                          onEdit(user)
                        }
                        className="
                          rounded
                          p-0.5
                          hover:bg-gray-100
                          hover:text-blue-700
                        "
                        style={{
                          padding: "2px",
                        }}
                        title="Edit User"
                      >
                        <Edit
                          style={{
                            width: "13px",
                            height: "13px",
                          }}
                        />
                      </button>

                      {/* MORE */}

                      <button
                        onClick={(e) =>
                          handleMenuClick(
                            e,
                            user.id
                          )
                        }
                        className="
                          rounded
                          p-0.5
                          hover:bg-gray-100
                        "
                        style={{
                          padding: "2px",
                        }}
                        title="More Actions"
                      >
                        <MoreVertical
                          style={{
                            width: "13px",
                            height: "13px",
                          }}
                        />
                      </button>

                    </div>
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>
      </div>

      {/* =====================================================
          DROPDOWN
      ===================================================== */}

      {openMenu !== null &&
        menuPosition &&
        menuUser &&
        createPortal(

          <div
            ref={menuRef}
            className="
              fixed
              z-9999
              w-44
              overflow-hidden
              rounded-lg
              border
              border-gray-200
              bg-white
              shadow-lg
            "
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              width: "176px",
              zIndex: 9999,
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* VIEW DETAILS */}

            <button
              onClick={() => {
                onSelect(menuUser);

                setOpenMenu(null);
                setMenuPosition(null);
              }}
              className="
                block
                w-full
                text-left
                hover:bg-gray-50
              "
              style={{
                padding: "8px 12px",
                fontSize: "10px",
                lineHeight: "14px",
              }}
            >
              View Details
            </button>

            {/* RESET PASSWORD */}

            {!compactAccess && (
              <button
                onClick={() => {
                  toast.custom(() => (
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-lg
                        border
                        border-blue-200
                        bg-blue-50
                        px-4
                        py-3
                        shadow-lg
                      "
                    >
                      <Info
                        className="
                          h-5
                          w-5
                          text-blue-600
                        "
                      />

                      <span
                        className="
                          text-sm
                          font-medium
                          text-blue-900
                        "
                      >
                        Reset password will be
                        available shortly.
                      </span>
                    </div>
                  ));

                  setOpenMenu(null);
                  setMenuPosition(null);
                }}
                className="
                  block
                  w-full
                  text-left
                  hover:bg-gray-50
                "
                style={{
                  padding: "8px 12px",
                  fontSize: "10px",
                  lineHeight: "14px",
                }}
              >
                Reset Password
              </button>
            )}

            {/* ACTIVATE / DEACTIVATE */}

            <button
              onClick={() => {
                onToggleStatus(menuUser);

                setOpenMenu(null);
                setMenuPosition(null);
              }}
              className="
                block
                w-full
                text-left
                hover:bg-gray-50
              "
              style={{
                padding: "8px 12px",
                fontSize: "10px",
                lineHeight: "14px",
              }}
            >
              {menuUser.active
                ? "Deactivate"
                : "Activate"}
            </button>

          </div>,

          document.body
        )}

      {/* =====================================================
          PAGINATION
          COMPLETELY OUTSIDE TABLE
          ALWAYS STAYS BELOW THE TABLE AREA
      ===================================================== */}

      <div
        className="
          shrink-0
          flex
          items-center
          justify-between
          gap-1
          border-t
          border-gray-200
          bg-gray-50/40
        "
        style={{
          flex: "0 0 34px",
          height: "34px",
          minHeight: "34px",
          width: "100%",
          padding: "5px 12px",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
        }}
      >

        {/* RECORD COUNT */}

        <p
          className="
            text-gray-700
          "
          style={{
            margin: 0,
            fontSize: "9px",
            lineHeight: "12px",
          }}
        >
          Showing {startItem} to {endItem} of{" "}
          {total} users
        </p>

        {/* PAGINATION BUTTONS */}

        <div
          className="
            flex
            items-center
            gap-1
          "
        >

          {/* FIRST */}

          <button
            onClick={onFirst}
            disabled={currentPage === 1}
            className="
              rounded
              text-gray-500
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
            style={{
              width: "20px",
              height: "20px",
              padding: "2px",
            }}
          >
            <ChevronsLeft
              style={{
                width: "13px",
                height: "13px",
              }}
            />
          </button>

          {/* PREVIOUS */}

          <button
            onClick={onPrevious}
            disabled={currentPage === 1}
            className="
              rounded
              text-gray-500
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
            style={{
              width: "20px",
              height: "20px",
              padding: "2px",
            }}
          >
            <ChevronLeft
              style={{
                width: "13px",
                height: "13px",
              }}
            />
          </button>

          {/* PAGE NUMBERS */}

          {Array.from(
            { length: totalPages },
            (_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  onClick={() => {
                    onPageChange(page);
                  }}
                  className={`
                    rounded
                    font-medium
                    ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                  style={{
                    width: "20px",
                    height: "20px",
                    padding: 0,
                    fontSize: "9px",
                    lineHeight: "20px",
                  }}
                >
                  {page}
                </button>
              );
            }
          )}

          {/* NEXT */}

          <button
            onClick={onNext}
            disabled={
              currentPage === totalPages ||
              totalPages === 0
            }
            className="
              rounded
              text-gray-500
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
            style={{
              width: "20px",
              height: "20px",
              padding: "2px",
            }}
          >
            <ChevronRight
              style={{
                width: "13px",
                height: "13px",
              }}
            />
          </button>

          {/* LAST */}

          <button
            onClick={onLast}
            disabled={
              currentPage === totalPages ||
              totalPages === 0
            }
            className="
              rounded
              text-gray-500
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
            style={{
              width: "20px",
              height: "20px",
              padding: "2px",
            }}
          >
            <ChevronsRight
              style={{
                width: "13px",
                height: "13px",
              }}
            />
          </button>

        </div>

      </div>

    </div>
  );
}
