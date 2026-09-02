

import {
  ChevronDown,
  ChevronRight,
  Folder,
} from "lucide-react";

import Checkbox from "../common/Checkbox";

export default function PermissionRow({
  module,
  permissionColumns,
  onToggleExpand,
  onUpdatePermission,
  onUpdateChildPermission,
}) {
  return (
    <>
      {/* =====================================================
          PARENT ROW
      ===================================================== */}

      <tr
        style={styles.parentRow}
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

          <div style={styles.moduleContent}>

            {/* Expand */}

            <button
              type="button"
              onClick={() =>
                onToggleExpand(module.id)
              }
              style={styles.expandButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "#F1F5F9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "transparent";
              }}
            >

              {module.children?.length > 0 ? (

                module.expanded ? (
                  <ChevronDown
                    size={11}
                    strokeWidth={2}
                    style={styles.icon}
                  />
                ) : (
                  <ChevronRight
                    size={11}
                    strokeWidth={2}
                    style={styles.icon}
                  />
                )

              ) : (
                <span
                  style={styles.emptyChevron}
                />
              )}

            </button>

            {/* Folder */}

            <Folder
              size={11}
              strokeWidth={1.8}
              style={styles.folderIcon}
            />

            {/* Module Name */}

            <span style={styles.moduleName}>
              {module.name}
            </span>

          </div>

        </td>

        {/* PERMISSIONS */}

        {permissionColumns.map(
          (column) => (
            <td
              key={column.key}
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
                    module.permissions?.[
                      column.key
                    ] ?? false
                  }
                  color={
                    column.color
                  }
                  onChange={(value) =>
                    onUpdatePermission(
                      module.id,
                      column.key,
                      value
                    )
                  }
                />

              </div>

            </td>
          )
        )}

      </tr>

      {/* =====================================================
          CHILD ROWS
      ===================================================== */}

      {module.expanded &&
        module.children?.map(
          (child) => (
            <tr
              key={child.id}
              style={styles.childRow}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "#F8FAFC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "#FAFBFC";
              }}
            >

              {/* CHILD MODULE */}

              <td
                style={
                  styles.childModuleCell
                }
              >

                <div
                  style={
                    styles.childContent
                  }
                >

                  <span
                    style={
                      styles.childSpacer
                    }
                  />

                  <span
                    style={
                      styles.childName
                    }
                  >
                    {child.name}
                  </span>

                </div>

              </td>

              {/* CHILD PERMISSIONS */}

              {permissionColumns.map(
                (column) => (
                  <td
                    key={column.key}
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
                          child
                            .permissions?.[
                            column.key
                          ] ?? false
                        }
                        color={
                          column.color
                        }
                        onChange={(value) =>
                          onUpdateChildPermission(
                            module.id,
                            child.id,
                            column.key,
                            value
                          )
                        }
                      />

                    </div>

                  </td>
                )
              )}

            </tr>
          )
        )}
    </>
  );
}

/* =========================================================
   INLINE STYLES
========================================================= */

const styles = {

  /* =======================================================
     PARENT ROW
  ======================================================= */

  parentRow: {
    height: "20px",
    background: "#FFFFFF",
    borderTop: "1px solid #EEF2F7",
    borderBottom: "1px solid #EEF2F7",
    transition: "background 120ms ease",
    boxSizing: "border-box",
  },

  /* =======================================================
     CHILD ROW
  ======================================================= */

  childRow: {
    height: "20px",
    background: "#FAFBFC",
    borderTop: "1px solid #F1F5F9",
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
    verticalAlign: "middle",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  /* =======================================================
     CHILD MODULE CELL
  ======================================================= */

  childModuleCell: {
    width: "52%",
    height: "20px",
    padding: "0 8px",
    verticalAlign: "middle",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  /* =======================================================
     MODULE CONTENT
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
     CHILD CONTENT
  ======================================================= */

  childContent: {
    width: "100%",
    height: "20px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    paddingLeft: "22px",
    boxSizing: "border-box",
  },

  /* =======================================================
     EXPAND BUTTON
  ======================================================= */

  expandButton: {
    width: "14px",
    height: "14px",
    padding: 0,
    margin: 0,
    border: 0,
    borderRadius: "3px",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    cursor: "pointer",
    boxSizing: "border-box",
  },

  /* =======================================================
     EMPTY CHEVRON
  ======================================================= */

  emptyChevron: {
    width: "11px",
    height: "11px",
    display: "block",
  },

  /* =======================================================
     CHEVRON
  ======================================================= */

  icon: {
    color: "#94A3B8",
    flexShrink: 0,
  },

  /* =======================================================
     FOLDER
  ======================================================= */

  folderIcon: {
    color: "#2563EB",
    flexShrink: 0,
  },

  /* =======================================================
     MODULE NAME
  ======================================================= */

  moduleName: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#334155",
    fontSize: "8px",
    lineHeight: "10px",
    fontWeight: 500,
  },

  /* =======================================================
     CHILD NAME
  ======================================================= */

  childName: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#64748B",
    fontSize: "8px",
    lineHeight: "10px",
    fontWeight: 400,
  },

  /* =======================================================
     CHILD SPACER
  ======================================================= */

  childSpacer: {
    width: "14px",
    flexShrink: 0,
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