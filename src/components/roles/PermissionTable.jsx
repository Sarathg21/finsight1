
import { useEffect } from "react";
import {
  ChevronRight,
  Folder,
} from "lucide-react";

import { permissionModules } from "../../data/rolesData";
import { moduleIcons } from "./ModuleIcon";
import Checkbox from "../common/Checkbox";

export default function PermissionTable({
  onSelectAll,
  onClearAll,
  setDirty,
  permissions,
  setPermissions,
  disabled = false,
}) {
  const rows = permissions || permissionModules;

  /* =========================================================
     TOGGLE SINGLE PERMISSION
  ========================================================= */

  const togglePermission = (
    moduleCode,
    permission,
    value
  ) => {
    setPermissions((prev) =>
      prev.map((item) =>
        item.module_code === moduleCode
          ? {
              ...item,
              [permission]: value,
            }
          : item
      )
    );

    setDirty?.(true);
  };

  /* =========================================================
     SELECT ALL
  ========================================================= */

  const selectAllPermissions = () => {
    setPermissions((prev) =>
      prev.map((item) => ({
        ...item,
        can_view: true,
        can_export: true,
        can_upload: true,
        can_admin: true,
      }))
    );

    setDirty?.(true);
  };

  /* =========================================================
     CLEAR ALL
  ========================================================= */

  const clearAllPermissions = () => {
    setPermissions((prev) =>
      prev.map((item) => ({
        ...item,
        can_view: false,
        can_export: false,
        can_upload: false,
        can_admin: false,
      }))
    );

    setDirty?.(true);
  };

  /* =========================================================
     EXPOSE SELECT / CLEAR ACTIONS
  ========================================================= */

  useEffect(() => {
    if (onSelectAll) {
      onSelectAll.current =
        selectAllPermissions;
    }

    if (onClearAll) {
      onClearAll.current =
        clearAllPermissions;
    }
  }, [
    permissions,
    onSelectAll,
    onClearAll,
  ]);

  return (
    <div style={styles.container}>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>

          {/* =================================================
              HEADER
          ================================================= */}

          <thead>
            <tr style={styles.headerRow}>

              <th style={styles.moduleHeader}>
                MODULE / FEATURE
              </th>

              <th style={styles.permissionHeader}>
                VIEW
              </th>

              <th style={styles.permissionHeader}>
                EXPORT
              </th>

              <th style={styles.permissionHeader}>
                UPLOAD
              </th>

              <th style={styles.permissionHeader}>
                ADMIN
              </th>

            </tr>
          </thead>

          {/* =================================================
              BODY
          ================================================= */}

          <tbody>
            {rows?.map((item) => {
              const Icon =
                moduleIcons[
                  item.module_code
                ] || Folder;

              return (
                <tr
                  key={item.module_code}
                  style={styles.bodyRow}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "#FFFFFF";
                  }}
                >

                  {/* MODULE */}

                  <td style={styles.moduleCell}>
                    <div
                      style={
                        styles.moduleContent
                      }
                    >

                      <ChevronRight
                        size={8}
                        strokeWidth={2}
                        style={
                          styles.chevron
                        }
                      />

                      <Icon
                        size={10}
                        strokeWidth={1.8}
                        style={
                          styles.moduleIcon
                        }
                      />

                      <span
                        style={
                          styles.moduleText
                        }
                        title={
                          item.module_code
                        }
                      >
                        {item.module_code}
                      </span>

                    </div>
                  </td>

                  {/* VIEW */}

                  <td
                    style={
                      styles.permissionCell
                    }
                  >
                    <div
                      style={
                        styles.checkboxWrapper
                      }
                    >
                      <Checkbox
                        checked={
                          item.can_view ===
                          true
                        }
                        color="blue"
                        disabled={disabled}
                        onChange={(value) =>
                          !disabled &&
                          togglePermission(
                            item.module_code,
                            "can_view",
                            value
                          )
                        }
                        className="permission-checkbox"
                      />
                    </div>
                  </td>

                  {/* EXPORT */}

                  <td
                    style={
                      styles.permissionCell
                    }
                  >
                    <div
                      style={
                        styles.checkboxWrapper
                      }
                    >
                      <Checkbox
                        checked={
                          item.can_export ===
                          true
                        }
                        color="green"
                        disabled={disabled}
                        onChange={(value) =>
                          !disabled &&
                          togglePermission(
                            item.module_code,
                            "can_export",
                            value
                          )
                        }
                        className="permission-checkbox"
                      />
                    </div>
                  </td>

                  {/* UPLOAD */}

                  <td
                    style={
                      styles.permissionCell
                    }
                  >
                    <div
                      style={
                        styles.checkboxWrapper
                      }
                    >
                      <Checkbox
                        checked={
                          item.can_upload ===
                          true
                        }
                        color="orange"
                        disabled={disabled}
                        onChange={(value) =>
                          !disabled &&
                          togglePermission(
                            item.module_code,
                            "can_upload",
                            value
                          )
                        }
                        className="permission-checkbox"
                      />
                    </div>
                  </td>

                  {/* ADMIN */}

                  <td
                    style={
                      styles.permissionCell
                    }
                  >
                    <div
                      style={
                        styles.checkboxWrapper
                      }
                    >
                      <Checkbox
                        checked={
                          item.can_admin ===
                          true
                        }
                        color="purple"
                        disabled={disabled}
                        onChange={(value) =>
                          !disabled &&
                          togglePermission(
                            item.module_code,
                            "can_admin",
                            value
                          )
                        }
                        className="permission-checkbox"
                      />
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
}

/* =========================================================
   INLINE STYLES
========================================================= */

const styles = {

  /* =======================================================
     CONTAINER
  ======================================================= */

  container: {
    width: "100%",
    minWidth: 0,
    background: "#FFFFFF",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  /* =======================================================
     TABLE WRAPPER
  ======================================================= */

  tableWrapper: {
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  /* =======================================================
     TABLE
  ======================================================= */

  table: {
    width: "100%",
    minWidth: "100%",
    tableLayout: "fixed",
    borderCollapse: "collapse",
    borderSpacing: 0,
    boxSizing: "border-box",
  },

  /* =======================================================
     HEADER
  ======================================================= */

  headerRow: {
    height: "22px",
    background: "#F8FAFC",
    borderTop: "1px solid #E5E7EB",
    borderBottom: "1px solid #E5E7EB",
  },

  moduleHeader: {
    width: "52%",
    height: "22px",
    padding: "0 8px",
    textAlign: "left",
    verticalAlign: "middle",
    color: "#475569",
    fontSize: "7.5px",
    lineHeight: "9px",
    fontWeight: 600,
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  },

  permissionHeader: {
    width: "12%",
    height: "22px",
    padding: 0,
    textAlign: "center",
    verticalAlign: "middle",
    color: "#475569",
    fontSize: "7.5px",
    lineHeight: "9px",
    fontWeight: 600,
    letterSpacing: "0.01em",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  },

  /* =======================================================
     BODY ROW

     Reduced from 25px → 20px
  ======================================================= */

  bodyRow: {
    height: "20px",
    background: "#FFFFFF",
    borderBottom: "1px solid #EEF2F7",
    transition: "background 120ms ease",
    boxSizing: "border-box",
  },

  /* =======================================================
     MODULE CELL
  ======================================================= */

  moduleCell: {
    width: "52%",
    height: "20px",
    padding: "0 8px",
    textAlign: "left",
    verticalAlign: "middle",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  /* =======================================================
     MODULE CONTENT

     Reduced from 25px → 20px
  ======================================================= */

  moduleContent: {
    width: "100%",
    height: "20px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    minWidth: 0,
    boxSizing: "border-box",
  },

  /* =======================================================
     CHEVRON
  ======================================================= */

  chevron: {
    flexShrink: 0,
    color: "#94A3B8",
  },

  /* =======================================================
     MODULE ICON
  ======================================================= */

  moduleIcon: {
    flexShrink: 0,
    color: "#2563EB",
  },

  /* =======================================================
     MODULE TEXT
  ======================================================= */

  moduleText: {
    minWidth: 0,
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#334155",
    fontSize: "7.5px",
    lineHeight: "9px",
    fontWeight: 500,
    boxSizing: "border-box",
  },

  /* =======================================================
     PERMISSION CELL
  ======================================================= */

  permissionCell: {
    width: "12%",
    height: "20px",
    padding: 0,
    textAlign: "center",
    verticalAlign: "middle",
    boxSizing: "border-box",
  },

  /* =======================================================
     CHECKBOX WRAPPER

     Reduced from 25px → 20px
  ======================================================= */

  checkboxWrapper: {
    width: "100%",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },
};