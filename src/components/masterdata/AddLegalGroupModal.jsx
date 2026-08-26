import { useState, useEffect } from "react";
import { X, FolderPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {addLegalGroup, updateLegalGroup,getLegalGroups} from "../../api/masterLegalApi";
import toast from "react-hot-toast";

export default function AddLegalGroupModal({
  open,
  onClose,
  onSuccess,
  editLegalGroup,
}) {
  const isEdit = !!editLegalGroup;

  const [formData, setFormData] = useState({
    legal_group_code: "",
    legal_group_name: "",
    active: true,
  });

  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

 useEffect(() => {
  if (!open) return;

  console.log("Edit Legal Group:", editLegalGroup);

  if (editLegalGroup) {
    setFormData({
      legal_group_code: editLegalGroup.legal_group_code || "",
      legal_group_name: editLegalGroup.legal_group_name || "",
      active: editLegalGroup.active,
    });
  } else {
    setFormData({
      legal_group_code: "",
      legal_group_name: "",
      active: true,
    });
  }
}, [open, editLegalGroup]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const errors = [];

    if (!formData.legal_group_code.trim()) {
      errors.push("Legal Group Code is required");
    }

    if (!formData.legal_group_name.trim()) {
      errors.push("Legal Group Name is required");
    }

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return false;
    }

    return true;
  };

  const isFormValid = () => {
    return (
      formData.legal_group_code.trim() &&
      formData.legal_group_name.trim()
    );
  };


 const handleUpdate = async () => {
  try{
  const payload = {
    legal_group_code: formData.legal_group_code,
    legal_group_name: formData.legal_group_name,
    active: formData.active,
  };

  console.log("UPDATE START");
  console.log("DATA:", payload);

  if (isEdit) {
    console.log("EDIT ID:", editLegalGroup?.legal_group_id);

      const response = await updateLegalGroup(
        editLegalGroup.legal_group_id,
        payload
      );

      console.log("API RESPONSE:", response);

      toast.success("Legal Group updated successfully");

    } else {

      await addLegalGroup(payload);

      toast.success("Legal Group created successfully");

    }

    onSuccess();
    onClose();

  } catch(error) {
    console.log("UPDATE ERROR:", error);
  }
};

const handleSave = () => {
  if (!validate()) return;

  handleUpdate();
};

  if (!open) return null;

  return (
    <>
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
          className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden"
        >
          {/* Header */}

          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <FolderPlus size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isEdit
                    ? "Edit Legal Group"
                    : "Add Legal Group"}
                </h2>

                <p className="text-sm text-gray-500">
                  {isEdit
                    ? "Update legal group information"
                    : "Create a new legal group"}
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
            <div className="grid grid-cols-1 gap-5">

              {/* Code */}

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Legal Group Code
                  <span className="text-red-600">
                    {" "}
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="legal_group_code"
                  value={
                    formData.legal_group_code
                  }
                  onChange={handleChange}
                  placeholder="Enter Legal Group Code"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Name */}

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Legal Group Name
                  <span className="text-red-600">
                    {" "}
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="legal_group_name"
                  value={
                    formData.legal_group_name
                  }
                  onChange={handleChange}
                  placeholder="Enter Legal Group Name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Status */}

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Active Status
                </label>

                <div className="flex gap-8">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={
                        formData.active === true
                      }
                      onChange={() =>
                        setFormData({
                          ...formData,
                          active: true,
                        })
                      }
                    />

                    <span>Active</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={
                        formData.active === false
                      }
                      onChange={() =>
                        setFormData({
                          ...formData,
                          active: false,
                        })
                      }
                    />

                    <span>Inactive</span>
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
              disabled={
                saving || !isFormValid()
              }
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                ? "Update Legal Group"
                : "Save Legal Group"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    </>
  );
}