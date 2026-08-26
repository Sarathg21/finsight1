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

  /* ---------------- Populate Form ---------------- */

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

  /* ---------------- Handle Change ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ---------------- Validation ---------------- */

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

  /* ---------------- Save ---------------- */

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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
          className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl"
        >
          {/* Header */}

          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <UserPlus size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isEdit ? "Edit Role" : "Add Role"}
                </h2>

                <p className="text-sm text-gray-500">
                  {isEdit
                    ? "Update role information"
                    : "Create a new application role"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Role Code */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Role Code
                  <span className="text-red-600">
                    {" "}*
                  </span>
                </label>
                <input
                  type="text"
                  name="role_code"
                  value={formData.role_code}
                  onChange={handleChange}
                  placeholder="Enter Role Code"
                  disabled={!!editRole}
                  className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${editRole ? "cursor-not-allowed bg-gray-100 text-gray-500" : ""
                    }`}
                />
              </div>

              {/* Role Name */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Role Name
                  <span className="text-red-600">
                    {" "}*
                  </span>
                </label>

                <input
                  type="text"
                  name="role_name"
                  value={formData.role_name}
                  onChange={handleChange}
                  placeholder="Enter Role Name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Active Status */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Active Status
                  <span className="text-red-600">
                    {" "}*
                  </span>
                </label>

                <div className="flex items-center gap-8 h-10">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.active === true}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          active: true,
                        })
                      }
                    />

                    <span className="text-sm">
                      Active
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.active === false}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          active: false,
                        })
                      }
                    />

                    <span className="text-sm">
                      Inactive
                    </span>
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}

          <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">

            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !isFormValid()}
              className="
                rounded-lg
                bg-blue-600
                px-6
                py-2
                text-sm
                font-medium
                text-white
                hover:bg-blue-700
                disabled:bg-gray-400
              "
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