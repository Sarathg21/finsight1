import { useState, useEffect, useRef } from "react";
import {
  Pencil,
  MoreVertical,
  ChevronLeft, ChevronsLeft, ChevronsRight,
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

  onLast, onToggleStatus,

}) {
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

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

  console.log("RolesTable data:", roles);
  return (
    <div
      className="h-full w-full
        bg-white
        rounded-xl
        border
        border-gray-200
        shadow-sm
        p-2
        flex
        flex-col
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          className="
            text-[12px]
            font-semibold
            text-gray-900
          "
        >
          Roles List ({roles.length})
        </h2>
      </div>

      {/* Table */}
      <div
        className="
          mt-1
          flex-1
          overflow-hidden
        "
      >
        <table
          className="
            w-full
            table-fixed
            border-collapse
          "
        >

          {/* Header */}
          <thead className="bg-gray-50">
            <tr
              className="
                h-6
                border-b
                border-gray-200
              "
            >
              <th
                className="
                  w-[22%]
                  px-1
                  text-left
                  text-[9px]
                  font-semibold
                  text-gray-900
                "
              >
                Role Name
              </th>


              <th
                className="
                  w-[32%]
                  px-1
                  text-left
                  text-[9px]
                  font-semibold
                  text-gray-900
                "
              >
                Description
              </th>


              <th
                className="
                  w-[12%]
                  px-1
                  text-center
                  text-[9px]
                  font-semibold
                  text-gray-900
                "
              >
                Users
              </th>


              <th
                className="
                  w-[18%]
                  px-1
                  text-center
                  text-[9px]
                  font-semibold
                  text-gray-900
                "
              >
                Status
              </th>


              <th
                className="
                  w-[16%]
                  px-1
                  text-center
                  text-[9px]
                  font-semibold
                  text-gray-900
                "
              >
                Action
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-5">
                  No Roles Found
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`border-b cursor-pointer ${selectedRole?.id === role.id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                    }`}
                >
                  <td className="px-2 py-2 text-[10px]">
                    {role.name}
                  </td>

                  <td className="px-2 py-2 text-[10px]">
                    {role.description || "-"}
                  </td>

                  <td className="px-2 py-2 text-center text-[10px]">
                    {role.users}
                  </td>

                  <td className="px-2 py-2 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[9px] ${role.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {role.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-2 py-2 text-center">
                    <div className="flex items-center justify-center gap-1 relative">

                      {/* Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(role);
                        }}
                        className="rounded p-1 hover:bg-gray-100"
                      >
                        <Pencil size={12} />
                      </button>

                      {/* More Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === role.id ? null : role.id);
                        }}
                        className="rounded p-1 hover:bg-gray-100"
                      >
                        <MoreVertical size={12} />
                      </button>

                      {/* Dropdown */}
                      {openMenu === role.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-6 z-20 w-32 rounded-md border border-gray-200 bg-white shadow-lg"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStatus(role);
                              setOpenMenu(null);
                            }}
                            className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                          >
                            {role.active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        className="
          mt-1
          pt-1
          border-t
          border-gray-200
          flex
          items-center
          justify-between
        "
      >

        <p
          className="
            text-[9px]
            text-gray-500
          "
        >
          Showing {startItem} to {endItem} of {total} roles
        </p>


        <div className="flex items-center gap-1">

          <button
            onClick={onFirst}
            disabled={currentPage === 1}
            className="rounded p-1 hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronsLeft size={12} />
          </button>

          <button
            onClick={onPrevious}
            disabled={currentPage === 1}
            className="rounded p-1 hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronLeft size={12} />
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`h-6 w-6 rounded text-[9px]
                    ${currentPage === page
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                    }`}
                >
                  {page}
                </button>
              );
            }
          )}

          <button
            onClick={onNext}
            disabled={
              currentPage === totalPages ||
              totalPages === 0
            }
            className="rounded p-1 hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronRight size={12} />
          </button>

          <button
            onClick={onLast}
            disabled={
              currentPage === totalPages ||
              totalPages === 0
            }
            className="rounded p-1 hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronsRight size={12} />
          </button>

        </div>
      </div>
    </div>
  );
}