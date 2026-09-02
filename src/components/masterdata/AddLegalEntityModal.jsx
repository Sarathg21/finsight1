import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  addLegalEntities,
  updateLegalEntities,
} from "../../api/masterLegalApi";

export default function AddLegalEntityModal({
  open,
  onClose,
  onSuccess,
  editLegalEntity,
}) {
  const [formData, setFormData] = useState({
    legal_entity_code: "",
    legal_entity_name: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editLegalEntity) {
      setFormData({
        legal_entity_code:
          editLegalEntity.legal_entity_code || "",
        legal_entity_name:
          editLegalEntity.legal_entity_name || "",
      });
    } else {
      setFormData({
        legal_entity_code: "",
        legal_entity_name: "",
      });
    }
  }, [editLegalEntity, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.legal_entity_code.trim()) {
      toast.error("Legal Entity Code is required");
      return;
    }

    if (!formData.legal_entity_name.trim()) {
      toast.error("Legal Entity Name is required");
      return;
    }

    try {
      setLoading(true);

      if (editLegalEntity) {
        await updateLegalEntities(
          editLegalEntity.legal_entity_id,
          formData
        );

        toast.success("Legal Entity updated successfully");
      } else {
        await addLegalEntities(formData);

        toast.success("Legal Entity added successfully");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">

        {/* Header */}
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold">
            {editLegalEntity
              ? "Edit Legal Entity"
              : "Add Legal Entity"}
          </h2>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">

          <div>
            <label className="mb-1 block text-sm font-medium">
              Legal Entity Code
            </label>

            <input
              type="text"
              name="legal_entity_code"
              value={formData.legal_entity_code}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Enter Legal Entity Code"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Legal Entity Name
            </label>

            <input
              type="text"
              name="legal_entity_name"
              value={formData.legal_entity_name}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Enter Legal Entity Name"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-5 py-4">

          <button
            onClick={onClose}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : editLegalEntity
              ? "Update"
              : "Save"}
          </button>

        </div>
      </div>
    </div>
  );
}