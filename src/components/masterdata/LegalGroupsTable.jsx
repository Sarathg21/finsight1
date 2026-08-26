import {
  Pencil,
  MoreVertical,
  ArrowUpDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import ConfirmationModel from "../common/ConfirmationModel";


export default function LegalGroupsTable({
  legalGroups = [],
  onEdit,
  onSelect, selectedGroup, onStatusToggle,
}) {

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [selectedStatusGroup, setSelectedStatusGroup] = useState(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const totalRows = legalGroups?.length || 0;

  const totalPages = Math.max(
    1,
    Math.ceil(totalRows / rowsPerPage)
  );

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const currentRows = legalGroups.slice(
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
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goNext = () => {
    setCurrentPage((prev) =>
      Math.min(prev + 1, totalPages)
    );
  };

  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }

    if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);



  {/*......Close menu when clicking outside........*/ }
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
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          {/* Header */}
          <thead className=" border-b border-gray-200 bg-gray-50">
            <tr>
              {[
                "Legal Group Code",
                "Legal Group Name",
                //"Description",
                "Status",
                //"No. of Legal Entities",
                "Action",
              ].map((header) => (
                <th
                  key={header}
                  className="px-2 py-1.5  text-[9px] font-bold text-center capitalize tracking-wide text-gray-600"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>


          {/* Body */}
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((group) => (
                <tr
                  key={group.legal_group_id}
                  onClick={() => onSelect(group)}
                  className={`cursor-pointer border-b ${selectedGroup?.legal_group_id === group.legal_group_id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"}`}>

                  <td className="px-2.5 py-1.5 text-[10px] text-center font-medium leading-tight text-gray-800">
                    {group.legal_group_code}
                  </td>

                  <td className="px-2.5 py-1.5 text-[10px] font-medium text-center leading-tight text-gray-800">
                    {group.legal_group_name}
                  </td>

                  {/* <td className="px-2.5 py-1.5 text-[10px] font-medium text-center leading-tight text-gray-800">
                  {group.description}
                </td> */}

                  <td className="px-2.5 py-1.5 text-center">
                    <span
                      className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px]
                    font-medium leading-tight ${group.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {group.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* <td className="px-2.5 py-1.5 text-center text-[10px] font-medium text-gray-800">
                  {group.legalEntities}
                </td> */}

                  <td className="px-2.5 py-1.5">
                    <div className="flex justify-center gap-1">

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();

                          setOpenMenu(null);

                          onEdit?.(group);
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100"
                      >
                        <Pencil
                          size={11}
                          className="text-gray-900"
                        />
                      </button>

                      {/* <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPosition({
                              top: rect.bottom + 5,
                              left: rect.right - 145,
                            });

                            setOpenMenu(
                              openMenu === group.legal_group_id
                                ? null
                                : group.legal_group_id
                            );
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100"
                        >
                          <MoreVertical
                            size={11}
                            className="text-gray-900"
                          />
                        </button>
                        {openMenu === group.legal_group_id && (
                          <div
                            className="fixed z-9999 w-36 rounded-md border border-gray-200 bg-white shadow-lg"
                            style={{
                              top: menuPosition.top,
                              left: menuPosition.left,
                            }}
                          >
                            <button
                              onClick={() => {
                                const group = legalGroups.find(
                                  (g) => g.legal_group_id === openMenu
                                );
                                if (group) {
                                  onSelect?.(group);
                                }
                                setOpenMenu(null);
                              }}
                              className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                            >
                              View Details
                            </button>

                            <button
                              onClick={() => {
                                const group = legalGroups.find(
                                  (g) => g.legal_group_id === openMenu
                                );

                                if (!group) return;

                                setSelectedStatusGroup(group);
                                setShowStatusConfirm(true);
                                setOpenMenu(null);
                              }}
                              className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                            >
                              {legalGroups.find(
                                (g) => g.legal_group_id === openMenu
                              )?.active
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </div>
                        )}
                      </div> */}

                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();

                            const rect =
                              e.currentTarget.getBoundingClientRect();

                            setMenuPosition({
                              top: rect.bottom + 5,
                              left: rect.right - 145,
                            });

                            setOpenMenu((prev) =>
                              prev === group.legal_group_id
                                ? null
                                : group.legal_group_id
                            );
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100"
                        >
                          <MoreVertical
                            size={11}
                            className="text-gray-900"
                          />
                        </button>

                        {openMenu === group.legal_group_id && (
                          <div
                            className="fixed z-9999 w-36 rounded-md border border-gray-200 bg-white shadow-lg"
                            style={{
                              top: menuPosition.top,
                              left: menuPosition.left,
                            }}
                          >
                            {/* VIEW DETAILS */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();

                                onSelect?.(group);

                                setOpenMenu(null);
                              }}
                              className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                            >
                              View Details
                            </button>

                            {/* ACTIVATE / DEACTIVATE */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();

                                setSelectedStatusGroup(group);
                                setShowStatusConfirm(true);
                                setOpenMenu(null);
                              }}
                              className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                            >
                              {group.active
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
                  className="py-6 text-center text-sm text-gray-500">
                  No legal groups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className=" flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-gray-50/40 px-4 py-2"
      >

        {/* Record Info */}
        <p className=" text-[9px] text-gray-700" >
          Showing{" "}
          {
            totalRows === 0
              ?
              0
              :
              startIndex + 1
          }
          {" "}to{" "}
          {
            Math.min(
              endIndex,
              totalRows
            )
          }
          {" "}of{" "}

          {totalRows}

          {" "}Legal Groups

        </p>
        {/* Pagination Buttons */}
        <div
          className=" flex items-center gap-1"
        >

          {/* First */}
          <button
            onClick={goFirst}
            disabled={
              currentPage === 1
            }
            className=" rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40" >
            <ChevronsLeft
              className="h-3.5 w-3.5"
            />
          </button>

          {/* Previous */}
          <button
            onClick={goPrevious}
            disabled={
              currentPage === 1
            }
            className=" rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40">
            <ChevronLeft
              className="h-3.5 w-3.5"
            />
          </button>

          {/* Page Numbers */}
          {
            Array.from(
              {
                length: totalPages
              },
              (_, index) => {

                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-6 w-6 rounded text-[9px] font-medium ${currentPage === page
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                      }`} >
                    {page}
                  </button>
                )
              }
            )
          }

          {/* Next */}
          <button
            onClick={goNext}
            disabled={
              currentPage === totalPages ||
              totalPages === 0
            }
            className=" rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronRight
              className="h-3.5 w-3.5"
            />
          </button>

          {/* Last */}

          <button
            onClick={goLast}
            disabled={
              currentPage === totalPages ||
              totalPages === 0
            }
            className=" rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronsRight
              className="h-3.5 w-3.5"
            />

          </button>
        </div>
      </div>
      <ConfirmationModel
        open={showStatusConfirm}
        title={
          selectedStatusGroup?.active
            ? "Deactivate Legal Group"
            : "Activate Legal Group"
        }
        message={
          selectedStatusGroup?.active
            ? `Are you sure you want to deactivate ${selectedStatusGroup?.legal_group_name}?`
            : `Are you sure you want to activate ${selectedStatusGroup?.legal_group_name}?`
        }
        confirmText={
          selectedStatusGroup?.active
            ? "Deactivate"
            : "Activate"
        }
        cancelText="Cancel"

        onCancel={() => {
          setShowStatusConfirm(false);
          setSelectedStatusGroup(null);
        }}

        onConfirm={async () => {
          if (!selectedStatusGroup) return;
          await onStatusToggle(selectedStatusGroup);
          setShowStatusConfirm(false);
          setSelectedStatusGroup(null);
        }}
      />
    </div>
  );
}