
import { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import {
  addRole,
  updateRole,
} from "../../api/rolesApi";

export default function AddRoleModal({
  open,
  onClose,
  onSuccess,
  editRole,
}) {
  const isEdit = !!editRole;

  const [formData, setFormData] = useState({
    role_code: "",
    role_name: "",
    active: true,
  });

  const [saving, setSaving] = useState(false);

  /* =========================================================
     POPULATE FORM
  ========================================================= */

  useEffect(() => {
    if (!open) return;

    console.log("Edit Role:", editRole);

    if (editRole) {
      setFormData({
        role_code: editRole.role_code || "",
        role_name: editRole.role_name || "",
        active: editRole.active ?? true,
      });
    } else {
      setFormData({
        role_code: "",
        role_name: "",
        active: true,
      });
    }
  }, [open, editRole]);

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validate = () => {
    const errors = [];

    if (!formData.role_code.trim()) {
      errors.push("Role Code is required");
    }

    if (!formData.role_name.trim()) {
      errors.push("Role Name is required");
    }

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return false;
    }

    return true;
  };

  const isFormValid = () => {
    return (
      formData.role_code.trim() &&
      formData.role_name.trim()
    );
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      role_code: formData.role_code,
      role_name: formData.role_name,
      active: formData.active,
    };

    try {
      setSaving(true);

      if (isEdit) {
        await updateRole(editRole.role_code, payload);

        toast.success("Role updated successfully");
      } else {
        await addRole(payload);

        toast.success("Role created successfully");
      }

      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error(error);

      if (error.response) {
        toast.error(
          error.response.data.detail ||
            "Server error"
        );
      } else if (error.request) {
        toast.error("Unable to connect to server");
      } else {
        toast.error(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.overlay}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.96,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.96,
            y: 20,
          }}
          transition={{ duration: 0.25 }}
          style={styles.modal}
        >

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div style={styles.header}>

            <div style={styles.headerLeft}>

              <div style={styles.headerIcon}>
                <UserPlus size={20} />
              </div>

              <div style={styles.headerText}>
                <h2 style={styles.title}>
                  {isEdit ? "Edit Role" : "Add Role"}
                </h2>

                <p style={styles.subtitle}>
                  {isEdit
                    ? "Update role information"
                    : "Create a new application role"}
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={onClose}
              style={styles.closeButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "#F3F4F6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "transparent";
              }}
            >
              <X size={18} />
            </button>

          </div>

          {/* =====================================================
              BODY
          ===================================================== */}

          <div style={styles.body}>

            <div style={styles.formGrid}>

              {/* =================================================
                  ROLE CODE
              ================================================= */}

              <div style={styles.field}>

                <label style={styles.label}>
                  Role Code
                  <span style={styles.required}>
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="role_code"
                  value={formData.role_code}
                  onChange={handleChange}
                  placeholder="Enter Role Code"
                  disabled={!!editRole}
                  style={{
                    ...styles.input,
                    ...(editRole
                      ? styles.disabledInput
                      : {}),
                  }}
                />

              </div>

              {/* =================================================
                  ROLE NAME
              ================================================= */}

              <div style={styles.field}>

                <label style={styles.label}>
                  Role Name
                  <span style={styles.required}>
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="role_name"
                  value={formData.role_name}
                  onChange={handleChange}
                  placeholder="Enter Role Name"
                  style={styles.input}
                />

              </div>

              {/* =================================================
                  ACTIVE STATUS
              ================================================= */}

              <div style={styles.statusField}>

                <label style={styles.label}>
                  Active Status
                  <span style={styles.required}>
                    *
                  </span>
                </label>

                <div style={styles.radioContainer}>

                  {/* ACTIVE */}

                  <label style={styles.radioLabel}>

                    <input
                      type="radio"
                      name="active"
                      checked={
                        formData.active === true
                      }
                      onChange={() =>
                        setFormData({
                          ...formData,
                          active: true,
                        })
                      }
                      style={styles.radioInput}
                    />

                    <span style={styles.radioText}>
                      Active
                    </span>

                  </label>

                  {/* INACTIVE */}

                  <label style={styles.radioLabel}>

                    <input
                      type="radio"
                      name="active"
                      checked={
                        formData.active === false
                      }
                      onChange={() =>
                        setFormData({
                          ...formData,
                          active: false,
                        })
                      }
                      style={styles.radioInput}
                    />

                    <span style={styles.radioText}>
                      Inactive
                    </span>

                  </label>

                </div>

              </div>

            </div>

          </div>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <div style={styles.footer}>

            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "#F3F4F6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "#FFFFFF";
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={
                saving || !isFormValid()
              }
              style={{
                ...styles.saveButton,
                ...(saving || !isFormValid()
                  ? styles.saveButtonDisabled
                  : {}),
              }}
              onMouseEnter={(e) => {
                if (
                  !saving &&
                  isFormValid()
                ) {
                  e.currentTarget.style.background =
                    "#1D4ED8";
                }
              }}
              onMouseLeave={(e) => {
                if (
                  !saving &&
                  isFormValid()
                ) {
                  e.currentTarget.style.background =
                    "#2563EB";
                }
              }}
            >
              {saving
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                  ? "Update Role"
                  : "Save Role"}
            </button>

          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* =========================================================
   INLINE STYLE CONFIGURATION
========================================================= */

const styles = {

  /* =======================================================
     OVERLAY
  ======================================================= */

  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "rgba(0, 0, 0, 0.40)",
    backdropFilter: "blur(4px)",
    boxSizing: "border-box",
  },

  /* =======================================================
     MODAL
  ======================================================= */

  modal: {
    width: "100%",
    maxWidth: "720px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    background: "#FFFFFF",
    borderRadius: "12px",
    boxShadow:
      "0 20px 40px rgba(15, 23, 42, 0.18)",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    width: "100%",
    minHeight: "76px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    background: "#F9FAFB",
    borderBottom: "1px solid #E5E7EB",
    boxSizing: "border-box",
    flexShrink: 0,
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  headerIcon: {
    width: "40px",
    height: "40px",
    minWidth: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    background: "#DBEAFE",
    color: "#2563EB",
    boxSizing: "border-box",
  },

  headerText: {
    minWidth: 0,
  },

  title: {
    margin: 0,
    padding: 0,
    color: "#111827",
    fontSize: "17px",
    lineHeight: "22px",
    fontWeight: 600,
  },

  subtitle: {
    margin: "3px 0 0 0",
    padding: 0,
    color: "#6B7280",
    fontSize: "12px",
    lineHeight: "17px",
  },

  closeButton: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: 0,
    borderRadius: "7px",
    background: "transparent",
    color: "#6B7280",
    cursor: "pointer",
    padding: 0,
    boxSizing: "border-box",
  },

  /* =======================================================
     BODY
  ======================================================= */

  body: {
    width: "100%",
    padding: "22px 20px",
    background: "#FFFFFF",
    boxSizing: "border-box",
    overflowY: "auto",
  },

  formGrid: {
    width: "100%",
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    columnGap: "18px",
    rowGap: "20px",
    boxSizing: "border-box",
  },

  /* =======================================================
     FORM FIELD
  ======================================================= */

  field: {
    width: "100%",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },

  statusField: {
    gridColumn: "1 / -1",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },

  label: {
    display: "block",
    margin: "0 0 7px 0",
    padding: 0,
    color: "#374151",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
  },

  required: {
    marginLeft: "3px",
    color: "#DC2626",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    height: "40px",
    border: "1px solid #D1D5DB",
    borderRadius: "7px",
    background: "#FFFFFF",
    color: "#111827",
    padding: "0 12px",
    fontSize: "12px",
    lineHeight: "16px",
    outline: "none",
    boxSizing: "border-box",
  },

  disabledInput: {
    background: "#F3F4F6",
    color: "#6B7280",
    cursor: "not-allowed",
  },

  /* =======================================================
     RADIO
  ======================================================= */

  radioContainer: {
    minHeight: "40px",
    display: "flex",
    alignItems: "center",
    gap: "28px",
    boxSizing: "border-box",
  },

  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    height: "32px",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  radioInput: {
    width: "15px",
    height: "15px",
    margin: 0,
    cursor: "pointer",
    accentColor: "#2563EB",
  },

  radioText: {
    color: "#374151",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 400,
  },

  /* =======================================================
     FOOTER
  ======================================================= */

  footer: {
    width: "100%",
    minHeight: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "12px 20px",
    background: "#F9FAFB",
    borderTop: "1px solid #E5E7EB",
    boxSizing: "border-box",
    flexShrink: 0,
  },

  /* =======================================================
     CANCEL BUTTON
  ======================================================= */

  cancelButton: {
    height: "36px",
    minWidth: "82px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #D1D5DB",
    borderRadius: "7px",
    background: "#FFFFFF",
    color: "#374151",
    padding: "0 16px",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
    cursor: "pointer",
    boxSizing: "border-box",
  },

  /* =======================================================
     SAVE BUTTON
  ======================================================= */

  saveButton: {
    height: "36px",
    minWidth: "105px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #2563EB",
    borderRadius: "7px",
    background: "#2563EB",
    color: "#FFFFFF",
    padding: "0 16px",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
    cursor: "pointer",
    boxSizing: "border-box",
  },

  saveButtonDisabled: {
    background: "#9CA3AF",
    borderColor: "#9CA3AF",
    cursor: "not-allowed",
  },
};
