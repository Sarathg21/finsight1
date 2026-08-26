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
import ConfirmationModel from "../common/ConfirmationModel";

export default function LegalEntitiesMasterTable({
  legalEntities = [],
  onEdit,
  onSelect,
  selectedEntity,
  onStatusToggle,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8);

  const [showStatusConfirm, setShowStatusConfirm] =
    useState(false);

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

  const startIndex = (currentPage - 1) * rowsPerPage;
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
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          {/* Header */}
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>

              <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
                Legal Entity Code
              </th>

              <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
                Legal Entity Name
              </th>

              <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
                Status
              </th>

              <th className="px-2 py-1.5 text-center text-[9px] font-bold tracking-wide text-gray-600">
                Action
              </th>

            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((entity) => (
                <tr
                  key={entity.legal_entity_id}
                  onClick={() => onSelect(entity)}
                  className={`cursor-pointer border-b ${selectedEntity?.legal_entity_id ===
                    entity.legal_entity_id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                    }`}
                >

                  {/* Code */}
                  <td className="px-2.5 py-1.5 text-center text-[10px] font-medium leading-tight text-gray-800">
                    {entity.legal_entity_code}
                  </td>

                  {/* Name */}
                  <td className="px-2.5 py-1.5 text-center text-[10px] font-medium leading-tight text-gray-800">
                    {entity.legal_entity_name}
                  </td>

                  {/* Status */}
                  <td className="px-2.5 py-1.5 text-center">
                    <span
                      className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-tight ${entity.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {entity.active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-2.5 py-1.5">

                    <div className="flex justify-center gap-1">

                      {/* Edit */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Edit clicked:", entity);
                          onEdit?.(entity);
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100"
                      >
                        <Pencil
                          size={11}
                          className="text-gray-900"
                        />
                      </button>

                      {/* More */}
                      <div
                        className="relative"
                        ref={menuRef}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            const rect =
                              e.currentTarget.getBoundingClientRect();

                            setMenuPosition({
                              top: rect.bottom + 5,
                              left: rect.right - 145,
                            });

                            setOpenMenu(
                              openMenu ===
                                entity.legal_entity_id
                                ? null
                                : entity.legal_entity_id
                            );
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100"
                        >
                          <MoreVertical
                            size={11}
                            className="text-gray-900"
                          />
                        </button>

                        {openMenu ===
                          entity.legal_entity_id && (
                            <div
                              className="fixed z-9999 w-36 rounded-md border border-gray-200 bg-white shadow-lg"
                              style={{
                                top: menuPosition.top,
                                left: menuPosition.left,
                              }}
                            >

                              <button
                                onClick={() => {
                                  onSelect(entity);
                                  setOpenMenu(null);
                                }}
                                className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                              >
                                View Details
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedStatusEntity(
                                    entity
                                  );
                                  setShowStatusConfirm(
                                    true
                                  );
                                  setOpenMenu(null);
                                }}
                                className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
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
                  className="py-6 text-center text-sm text-gray-500"
                >
                  No Legal Entities found.
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

          {" "}Legal Entities

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
            className=" rounded p-1 text-gray-500 hover:bg-gray-800 disabled:opacity-40">
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
                      }`}  >
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

      {/* Activate / Deactivate Confirmation */}
      <ConfirmationModel
        open={showStatusConfirm}
        title={
          selectedStatusEntity?.active
            ? "Deactivate Legal Entity"
            : "Activate Legal Entity"
        }
        message={
          selectedStatusEntity?.active
            ? `Are you sure you want to deactivate ${selectedStatusEntity?.legal_entity_name}? `
            : `Are you sure you want to activate ${selectedStatusEntity?.legal_entity_name}? `
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
          onStatusToggle?.(selectedStatusEntity);

          setShowStatusConfirm(false);
          setSelectedStatusEntity(null);
        }}
      />

    </div>
  );
}