
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

  /* ---------------- CLOSE MENU OUTSIDE CLICK ---------------- */

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

  /* ---------------- CLOSE MENU ON SCROLL ---------------- */

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

  /* ---------------- TABLE COLUMNS ---------------- */

  // Department removed from Users table
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

  /* ---------------- PAGINATION INFO ---------------- */

  const startItem =
    total === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endItem = Math.min(
    currentPage * pageSize,
    total
  );

  /* ---------------- TABLE HEIGHT ---------------- */

  const tableContainerClass = `
    flex-1
    min-h-0
    overflow-auto
  `;

  /* ---------------- OPEN DROPDOWN ---------------- */

  const handleMenuClick = (event, userId) => {
    event.stopPropagation();

    // Close if already open
    if (openMenu === userId) {
      setOpenMenu(null);
      setMenuPosition(null);
      return;
    }

    const buttonRect =
      event.currentTarget.getBoundingClientRect();

    const menuWidth = 176;

    // Approximate menu height
    const menuHeight = compactAccess ? 80 : 120;

    const spaceBelow =
      window.innerHeight - buttonRect.bottom;

    const spaceAbove = buttonRect.top;

    let top;

    /*
      If there is not enough space below,
      open the dropdown upward.
    */
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

    /*
      Prevent dropdown from going outside
      the left/right side of viewport.
    */
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

  /* ---------------- CURRENT MENU USER ---------------- */

  const menuUser =
    users.find(
      (user) => user.id === openMenu
    );

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      {/* ---------------- HEADER ---------------- */}

      <div
        className="
          shrink-0
          border-b
          border-gray-200
          px-4
          py-2.5
        "
      >
        <h3
          className="
            text-[13px]
            font-semibold
            text-gray-800
          "
        >
          Users List ({total})
        </h3>
      </div>

      {/* ---------------- TABLE ---------------- */}

      <div
        ref={tableRef}
        className={tableContainerClass}
      >
        <table className="min-w-full table-fixed">

          {/* ---------------- TABLE HEADER ---------------- */}

          <thead
            className="
              sticky
              top-0
              z-10
              bg-gray-50
            "
          >
            <tr
              className="
                text-left
                text-[11px]
                font-bold
                tracking-wide
                text-black
              "
            >
              <th className="w-8 px-3 py-1.5">
                <input
                  type="checkbox"
                  className="
                    h-3.5
                    w-3.5
                    rounded
                    border-gray-300
                  "
                />
              </th>

              {columns.map((header) => (
                <th
                  key={header}
                  className="px-3 py-1.5"
                >
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1
                    "
                  >
                    {header}

                    <ArrowUpDown
                      className="
                        h-3
                        w-3
                        opacity-40
                      "
                    />
                  </span>
                </th>
              ))}

              <th className="px-3 py-1.5">
                Action
              </th>
            </tr>
          </thead>

          {/* ---------------- TABLE BODY ---------------- */}

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
                    py-10
                    text-center
                    text-[12px]
                    text-gray-500
                  "
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
                    ${selectedId === user.id
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                    }
                  `}
                >

                  {/* Checkbox */}

                  <td className="px-3 py-1.5">
                    <input
                      type="checkbox"
                      className="
                        h-3.5
                        w-3.5
                        rounded
                        border-gray-300
                      "
                    />
                  </td>

                  {/* Employee Code */}

                  <td
                    className="
                      px-3
                      py-1.5
                      text-[11px]
                      font-medium
                      text-gray-800
                    "
                  >
                    {user.code}
                  </td>

                  {/* Employee Name */}

                  <td
                    className="
                      px-3
                      py-1.5
                      text-[11px]
                      text-gray-800
                    "
                  >
                    {user.name}
                  </td>

                  {/* Email - ONLY USERS PAGE */}

                  {!compactAccess && (
                    <td
                      className="
                        px-3
                        py-1.5
                        text-[11px]
                        text-gray-800
                      "
                    >
                      {user.email}
                    </td>
                  )}

                  {/* Role */}

                  <td
                    className="
                      px-3
                      py-1.5
                      text-[11px]
                      text-gray-800
                    "
                  >
                    {user.role}
                  </td>

                  {/* Status */}

                  <td className="px-3 py-1.5">
                    <StatusBadge
                      label={user.status}
                      tone={
                        user.status ===
                          "Active"
                          ? "green"
                          : "gray"
                      }
                      className="
                        px-2
                        py-0.5
                        text-[9px]
                      "
                    />
                  </td>

                  {/* Last Login - ONLY USERS PAGE */}

                  {!compactAccess && (
                    <td
                      className="
                        whitespace-nowrap
                        px-3
                        py-1.5
                        text-[11px]
                        text-gray-800
                      "
                    >
                      {user.lastLogin}
                    </td>
                  )}

                  {/* ---------------- ACTION COLUMN ---------------- */}

                  <td
                    className="px-3 py-1.5"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >
                    <div
                      className="
                        relative
                        flex
                        items-center
                        gap-1
                      "
                    >

                      {/* Edit Button */}

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
                      >
                        <Edit
                          className="
                            h-3.5
                            w-3.5
                          "
                        />
                      </button>

                      {/* More Button */}

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
                      >
                        <MoreVertical
                          className="
                            h-3.5
                            w-3.5
                          "
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

      {/* ---------------- DROPDOWN ---------------- */}

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
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* View Details */}

            <button
              onClick={() => {
                onSelect(menuUser);

                setOpenMenu(null);
                setMenuPosition(null);
              }}
              className="
                block
                w-full
                px-3
                py-2
                text-left
                text-xs
                hover:bg-gray-50
              "
            >
              View Details
            </button>

            {/* Reset Password */}

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
                  px-3
                  py-2
                  text-left
                  text-xs
                  hover:bg-gray-50
                "
              >
                Reset Password
              </button>
            )}

            {/* Activate / Deactivate */}

            <button
              onClick={() => {
                onToggleStatus(menuUser);

                setOpenMenu(null);
                setMenuPosition(null);
              }}
              className="
                block
                w-full
                px-3
                py-2
                text-left
                text-xs
                hover:bg-gray-50
              "
            >
              {menuUser.active
                ? "Deactivate"
                : "Activate"}
            </button>

          </div>,
          document.body
        )}

      {/* ---------------- PAGINATION ---------------- */}

      <div
        className="
          shrink-0
          flex
          flex-wrap
          items-center
          justify-between
          gap-2
          border-t
          border-gray-200
          bg-gray-50/40
          px-4
          py-2
        "
      >

        {/* Record Count */}

        <p
          className="
            text-[10px]
            text-gray-700
          "
        >
          Showing {startItem} to {endItem} of{" "}
          {total} users
        </p>

        {/* Buttons */}

        <div
          className="
            flex
            items-center
            gap-1
          "
        >

          {/* First */}

          <button
            onClick={onFirst}
            disabled={currentPage === 1}
            className="
              rounded
              p-1
              text-gray-500
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <ChevronsLeft
              className="h-3.5 w-3.5"
            />
          </button>

          {/* Previous */}

          <button
            onClick={onPrevious}
            disabled={currentPage === 1}
            className="
              rounded
              p-1
              text-gray-500
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <ChevronLeft
              className="h-3.5 w-3.5"
            />
          </button>

          {/* Page Numbers */}

          {Array.from(
            { length: totalPages },
            (_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  onClick={() => {
                    tableRef.current?.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });

                    onPageChange(page);
                  }}
                  className={`
                    h-6
                    w-6
                    rounded
                    text-[10px]
                    font-medium
                    ${currentPage === page
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                >
                  {page}
                </button>
              );
            }
          )}

          {/* Next */}

          <button
            onClick={onNext}
            disabled={
              currentPage === totalPages ||
              totalPages === 0
            }
            className="
              rounded
              p-1
              text-gray-500
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <ChevronRight
              className="h-3.5 w-3.5"
            />
          </button>

          {/* Last */}

          <button
            onClick={onLast}
            disabled={
              currentPage === totalPages ||
              totalPages === 0
            }
            className="
              rounded
              p-1
              text-gray-500
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <ChevronsRight
              className="h-3.5 w-3.5"
            />
          </button>

        </div>
      </div>

    </div>
  );
}