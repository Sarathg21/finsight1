
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
import ConfirmationModel from "../Common/ConfirmationModel";

export default function LegalGroupsTable({
  legalGroups = [],
  onEdit,
  onSelect,
  selectedGroup,
  onStatusToggle,
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
        overflow: "hidden",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        width: "100%",
      }}
    >
      {/* Table */}
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
            tableLayout: "auto",
          }}
        >
          {/* Header */}
          <thead
            style={{
              borderBottom: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
            }}
          >
            <tr>
              {[
                "LEGAL GROUP CODE",
                "LEGAL GROUP NAME",
                "STATUS",
                "ACTION",
              ].map((header) => (
                <th
                  key={header}
                  style={{
                    padding: "5px 8px",
                    fontSize: "10px",
                    lineHeight: "12px",
                    fontWeight: 700,
                    textAlign: "center",
                    color: "#4b5563",
                    letterSpacing: "0.03em",
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((group) => {
                const isSelected =
                  selectedGroup?.legal_group_id ===
                  group.legal_group_id;

                return (
                  <tr
                    key={group.legal_group_id}
                    onClick={() => onSelect(group)}
                    style={{
                      cursor: "pointer",
                      borderBottom: "1px solid #e5e7eb",
                      backgroundColor: isSelected
                        ? "#eff6ff"
                        : "#ffffff",
                      transition:
                        "background-color 150ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor =
                          "#f9fafb";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor =
                          "#ffffff";
                      }
                    }}
                  >
                    {/* Legal Group Code */}
                    <td
                      style={{
                        /* Slightly reduced from 9px */
                        padding: "7px 8px",
                        fontSize: "9px",
                        lineHeight: "12px",
                        textAlign: "center",
                        fontWeight: 500,
                        color: "#1f2937",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {group.legal_group_code}
                    </td>

                    {/* Legal Group Name */}
                    <td
                      style={{
                        /* Slightly reduced from 9px */
                        padding: "7px 8px",
                        fontSize: "9px",
                        lineHeight: "12px",
                        fontWeight: 500,
                        textAlign: "center",
                        color: "#1f2937",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {group.legal_group_name}
                    </td>

                    {/* Status */}
                    <td
                      style={{
                        /* Slightly reduced from 9px */
                        padding: "7px 8px",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "9999px",
                          padding: "2px 6px",
                          fontSize: "8px",
                          lineHeight: "11px",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          backgroundColor: group.active
                            ? "#dcfce7"
                            : "#f3f4f6",
                          color: group.active
                            ? "#15803d"
                            : "#4b5563",
                        }}
                      >
                        {group.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    {/* Action */}
                    <td
                      style={{
                        /* Slightly reduced from 7px */
                        padding: "6px 8px",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "2px",
                        }}
                      >
                        {/* Edit */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();

                            setOpenMenu(null);

                            onEdit?.(group);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "22px",
                            height: "22px",
                            padding: 0,
                            border: "none",
                            borderRadius: "4px",
                            backgroundColor:
                              "transparent",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "#f3f4f6";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <Pencil
                            size={10}
                            style={{
                              color: "#111827",
                            }}
                          />
                        </button>

                        {/* More Menu */}
                        <div
                          style={{
                            position: "relative",
                          }}
                        >
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
                                prev ===
                                  group.legal_group_id
                                  ? null
                                  : group.legal_group_id
                              );
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "22px",
                              height: "22px",
                              padding: 0,
                              border: "none",
                              borderRadius: "4px",
                              backgroundColor:
                                "transparent",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "#f3f4f6";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }}
                          >
                            <MoreVertical
                              size={10}
                              style={{
                                color: "#111827",
                              }}
                            />
                          </button>

                          {openMenu ===
                            group.legal_group_id && (
                              <div
                                ref={menuRef}
                                style={{
                                  position: "fixed",
                                  zIndex: 9999,
                                  width: "144px",
                                  top: menuPosition.top,
                                  left: menuPosition.left,
                                  border:
                                    "1px solid #e5e7eb",
                                  borderRadius: "6px",
                                  backgroundColor:
                                    "#ffffff",
                                  boxShadow:
                                    "0 4px 12px rgba(0,0,0,0.12)",
                                  overflow: "hidden",
                                }}
                              >
                                {/* View Details */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    onSelect?.(group);

                                    setOpenMenu(null);
                                  }}
                                  style={{
                                    display: "block",
                                    width: "100%",
                                    padding: "7px 10px",
                                    border: "none",
                                    backgroundColor:
                                      "transparent",
                                    textAlign: "left",
                                    fontSize: "10px",
                                    lineHeight: "14px",
                                    color: "#374151",
                                    cursor: "pointer",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "#f9fafb";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                  }}
                                >
                                  View Details
                                </button>

                                {/* Activate / Deactivate */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    setSelectedStatusGroup(group);
                                    setShowStatusConfirm(true);
                                    setOpenMenu(null);
                                  }}
                                  style={{
                                    display: "block",
                                    width: "100%",
                                    padding: "7px 10px",
                                    border: "none",
                                    backgroundColor:
                                      "transparent",
                                    textAlign: "left",
                                    fontSize: "10px",
                                    lineHeight: "14px",
                                    color: "#374151",
                                    cursor: "pointer",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "#f9fafb";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                  }}
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
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: "18px 8px",
                    textAlign: "center",
                    fontSize: "10px",
                    lineHeight: "14px",
                    color: "#6b7280",
                  }}
                >
                  No legal groups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "6px",
          borderTop: "1px solid #e5e7eb",
          backgroundColor: "rgba(249, 250, 251, 0.4)",
          padding: "5px 12px",
        }}
      >
        {/* Record Info */}
        <p
          style={{
            margin: 0,
            fontSize: "8px",
            lineHeight: "12px",
            color: "#374151",
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
          of {totalRows} Legal Groups
        </p>

        {/* Pagination Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
          }}
        >
          {/* First */}
          <button
            onClick={goFirst}
            disabled={currentPage === 1}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "22px",
              height: "22px",
              padding: 0,
              border: "none",
              borderRadius: "4px",
              backgroundColor: "transparent",
              color: "#6b7280",
              cursor:
                currentPage === 1
                  ? "default"
                  : "pointer",
              opacity:
                currentPage === 1 ? 0.4 : 1,
            }}
          >
            <ChevronsLeft
              style={{
                width: "13px",
                height: "13px",
              }}
            />
          </button>

          {/* Previous */}
          <button
            onClick={goPrevious}
            disabled={currentPage === 1}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "22px",
              height: "22px",
              padding: 0,
              border: "none",
              borderRadius: "4px",
              backgroundColor: "transparent",
              color: "#6b7280",
              cursor:
                currentPage === 1
                  ? "default"
                  : "pointer",
              opacity:
                currentPage === 1 ? 0.4 : 1,
            }}
          >
            <ChevronLeft
              style={{
                width: "13px",
                height: "13px",
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
                  key={page}
                  onClick={() =>
                    setCurrentPage(page)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "22px",
                    height: "22px",
                    padding: 0,
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "8px",
                    lineHeight: "12px",
                    fontWeight: 500,
                    backgroundColor:
                      currentPage === page
                        ? "#2563eb"
                        : "transparent",
                    color:
                      currentPage === page
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
              border: "none",
              borderRadius: "4px",
              backgroundColor: "transparent",
              color: "#6b7280",
              cursor:
                currentPage === totalPages ||
                  totalPages === 0
                  ? "default"
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
                width: "13px",
                height: "13px",
              }}
            />
          </button>

          {/* Last */}
          <button
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
              border: "none",
              borderRadius: "4px",
              backgroundColor: "transparent",
              color: "#6b7280",
              cursor:
                currentPage === totalPages ||
                  totalPages === 0
                  ? "default"
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
                width: "13px",
                height: "13px",
              }}
            />
          </button>
        </div>
      </div>

      {/* Status Confirmation */}
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

          await onStatusToggle(
            selectedStatusGroup
          );

          setShowStatusConfirm(false);
          setSelectedStatusGroup(null);
        }}
      />
    </div>
  );
}

