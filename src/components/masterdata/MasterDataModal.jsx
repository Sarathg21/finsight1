
import { useEffect, useState } from "react";
import { X, FolderPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function MasterDataModal({
  open,
  onClose,
  onSuccess,

  title,
  editData,

  idField,
  codeField,
  nameField,

  codeLabel,
  nameLabel,

  addApi,
  updateApi, onCustomSave,

  extraFields = [],

  compactLayout = false,

  subDivisions = [],
  parentDivisions = [],
}) {
  const isEdit = Boolean(editData);
  const editId = editData && idField
    ? editData[idField]
    : null;

  const [formData, setFormData] = useState({
    active: true,
  });

  const [saving, setSaving] = useState(false);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getArrayValue = (data, field) => {
    if (!data) return [];

    const directValue = data[field.name];

    if (Array.isArray(directValue)) {
      return directValue.map(String);
    }

    /*
      Legal Entity edit response:
      legal_groups: [
        {
          legal_group_id: 1,
          ...
        }
      ]
    */

    if (
      field.name === "legal_group_ids" &&
      Array.isArray(data.legal_groups)
    ) {
      return data.legal_groups
        .map((item) => item?.legal_group_id)
        .filter((id) => id != null)
        .map(String);
    }

    /*
      Parent Division edit response:
      legal_entities: [
        {
          legal_entity_id: 1,
          ...
        }
      ]
    */

    if (
      field.name === "legal_entity_ids" &&
      Array.isArray(data.legal_entities)
    ) {
      return data.legal_entities
        .map((item) => item?.legal_entity_id)
        .filter((id) => id != null)
        .map(String);
    }

    return [];
  };

  const getFieldValue = (data, field) => {
    if (!data) {
      if (field.type === "multi-select") {
        return [];
      }

      return "";
    }

    if (field.type === "multi-select") {
      return getArrayValue(data, field);
    }

    return data[field.name] ?? "";
  };

  const normalizeResponse = (response) => {
    if (!response) return null;

    return (
      response?.data?.data ??
      response?.data ??
      response
    );
  };

  /* =========================================================
     INITIALIZE FORM
  ========================================================= */
  useEffect(() => {
    if (!open) return;

    const initialData = {
      active: editData?.active ?? true,
    };

    if (codeField) {
      initialData[codeField] =
        editData?.[codeField] ?? "";
    }

    if (nameField) {
      initialData[nameField] =
        editData?.[nameField] ?? "";
    }

    extraFields.forEach((field) => {
      initialData[field.name] =
        getFieldValue(editData, field);
    });

    if (editData) {
      initialData.subdivision_id =
        editData.subdivision_id ?? "";

      initialData.subdivision_code =
        editData.subdivision_code ??
        editData.subdivision?.subdivision_code ??
        "";

      initialData.subdivision_name =
        editData.subdivision_name ??
        editData.subdivision?.subdivision_name ??
        "";

      initialData.parent_division_id =
        editData.parent_division_id ??
        editData.parent_division?.parent_division_id ??
        "";

      initialData.parent_division_code =
        editData.parent_division_code ??
        editData.parent_division?.parent_division_code ??
        "";

      initialData.parent_division_name =
        editData.parent_division_name ??
        editData.parent_division?.parent_division_name ??
        "";
    }

    setFormData(initialData);
  }, [
    open,
    editData,
    codeField,
    nameField,
  ]);
  /* =========================================================
     HANDLE NORMAL INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     FIND PARENT DIVISION
  ========================================================= */

  const findParentDivision = (parentDivisionId) => {
    if (!parentDivisionId) return null;

    return parentDivisions.find(
      (item) =>
        String(
          item.parent_division_id ??
          item.id ??
          item.parent_division?.parent_division_id
        ) === String(parentDivisionId)
    );
  };

  /* =========================================================
     HANDLE SELECT
  ========================================================= */

  const handleSelectChange = (e, field) => {
    const {
      name,
      value,
      selectedOptions,
    } = e.target;

    /* MULTI SELECT */

    if (field.type === "multi-select") {
      const values = Array.from(
        selectedOptions,
        (option) => option.value
      );

      setFormData((prev) => ({
        ...prev,
        [name]: values,
      }));

      return;
    }

    /* SUB DIVISION */

    if (name === "subdivision_id") {
      const selectedSubDivision =
        subDivisions.find(
          (item) =>
            String(item.subdivision_id) ===
            String(value)
        );

      if (!value || !selectedSubDivision) {
        setFormData((prev) => ({
          ...prev,

          subdivision_id: value,

          subdivision_code: "",
          subdivision_name: "",

          parent_division_id: "",
          parent_division_code: "",
          parent_division_name: "",
        }));

        return;
      }

      const parentDivisionId =
        selectedSubDivision.parent_division_id ??
        selectedSubDivision.parentDivisionId ??
        selectedSubDivision.parent_division
          ?.parent_division_id ??
        "";

      const selectedParentDivision =
        findParentDivision(parentDivisionId);

      const parentDivisionCode =
        selectedSubDivision.parent_division_code ??
        selectedParentDivision?.parent_division_code ??
        selectedParentDivision?.division_code ??
        selectedParentDivision?.code ??
        selectedParentDivision?.parent_division?.code ??
        "";

      const parentDivisionName =
        selectedSubDivision.parent_division_name ??
        selectedParentDivision?.parent_division_name ??
        selectedParentDivision?.division_name ??
        selectedParentDivision?.name ??
        selectedParentDivision?.parent_division?.name ??
        "";

      setFormData((prev) => ({
        ...prev,

        subdivision_id:
          selectedSubDivision.subdivision_id,

        subdivision_code:
          selectedSubDivision.subdivision_code ?? "",

        subdivision_name:
          selectedSubDivision.subdivision_name ?? "",

        parent_division_id:
          parentDivisionId,

        parent_division_code:
          parentDivisionCode,

        parent_division_name:
          parentDivisionName,
      }));

      return;
    }

    /* NORMAL SELECT */

    const selectedOption =
      field.options?.find(
        (option) =>
          String(option.value) === String(value)
      );

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (
        selectedOption &&
        field.autoFill &&
        typeof field.autoFill === "object"
      ) {
        Object.entries(
          field.autoFill
        ).forEach(
          ([targetField, sourceField]) => {
            updated[targetField] =
              selectedOption[sourceField] ?? "";
          }
        );
      }

      return updated;
    });
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validate = () => {
    const errors = [];

    /* CODE */

    if (
      codeField &&
      !String(
        formData[codeField] ?? ""
      ).trim()
    ) {
      errors.push(
        `${codeLabel} is required`
      );
    }

    /* NAME */

    if (
      nameField &&
      !String(
        formData[nameField] ?? ""
      ).trim()
    ) {
      errors.push(
        `${nameLabel} is required`
      );
    }

    /* EXTRA FIELDS */

    extraFields.forEach((field) => {
      if (!field.required) return;

      const value =
        formData[field.name];

      /* Multi-select */

      if (
        field.type === "multi-select"
      ) {
        if (
          !Array.isArray(value) ||
          value.length === 0
        ) {
          errors.push(
            `${field.label} is required`
          );
        }

        return;
      }

      /* Empty value */

      if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
      ) {
        errors.push(
          `${field.label} is required`
        );

        return;
      }

      /* Number validation */

      if (
        field.type === "number" &&
        Number(value) <= 0
      ) {
        errors.push(
          `${field.label} must be greater than 0`
        );
      }
    });

    if (errors.length > 0) {
      errors.forEach((error) =>
        toast.error(error)
      );

      return false;
    }

    return true;
  };

  /* =========================================================
     FORM VALID
  ========================================================= */

  const isFormValid = () => {
    const codeValid =
      !codeField ||
      Boolean(
        String(
          formData[codeField] ?? ""
        ).trim()
      );

    const nameValid =
      !nameField ||
      Boolean(
        String(
          formData[nameField] ?? ""
        ).trim()
      );

    const extraValid =
      extraFields
        .filter(
          (field) => field.required
        )
        .every((field) => {
          const value =
            formData[field.name];

          if (
            field.type ===
            "multi-select"
          ) {
            return (
              Array.isArray(value) &&
              value.length > 0
            );
          }

          return Boolean(
            String(
              value ?? ""
            ).trim()
          );
        });

    return (
      codeValid &&
      nameValid &&
      extraValid
    );
  };

  /* =========================================================
     BUILD PAYLOAD
  ========================================================= */

  const buildPayload = () => {
    const payload = {};

    /* MAIN FIELDS */

    if (codeField) {
      payload[codeField] =
        String(
          formData[codeField] ?? ""
        ).trim();
    }

    if (nameField) {
      payload[nameField] =
        String(
          formData[nameField] ?? ""
        ).trim();
    }

    payload.active =
      formData.active;

    /* EXTRA FIELDS */

    extraFields.forEach((field) => {
      const value =
        formData[field.name];

      /*
        Read-only hierarchy fields
        are display-only.
      */

      if (field.readOnly) {
        return;
      }

      /* MULTI ID */

      if (
        field.isId &&
        field.type === "multi-select"
      ) {
        payload[field.name] =
          Array.isArray(value)
            ? value
              .filter(
                (item) =>
                  item !== "" &&
                  item !== null &&
                  item !== undefined
              )
              .map(Number)
            : [];

        return;
      }

      /* SINGLE ID */

      if (field.isId) {
        payload[field.name] =
          value === "" ||
            value === null ||
            value === undefined
            ? null
            : Number(value);

        return;
      }

      /* NUMBER FIELD */

      if (field.type === "number") {
        payload[field.name] =
          value === "" ||
            value === null ||
            value === undefined
            ? null
            : Number(value);

        return;
      }

      /* NORMAL FIELD */

      payload[field.name] =
        value ?? "";
    });

    /*
      IMPORTANT:
      return payload must be OUTSIDE
      the forEach loop.
    */

    return payload;
  };

  // SAVE AND UPDATE

  const handleUpdate = async () => {
    if (saving) return;

    // Get ID only when editing
    const currentEditId =
      isEdit
        ? editData?.[idField] ??
        editData?.parent_division_id ??
        editData?.subdivision_id ??
        editData?.legal_entity_id ??
        editData?.legal_group_id ??
        null
        : null;

    console.log("========== SAVE DEBUG ==========");
    console.log("title:", title);
    console.log("isEdit:", isEdit);
    console.log("idField:", idField);
    console.log("editData:", editData);
    console.log("currentEditId:", currentEditId);
    console.log("=================================");

    // ID is mandatory for update
    if (
      isEdit &&
      (currentEditId === undefined ||
        currentEditId === null ||
        currentEditId === "")
    ) {
      toast.error(
        `Unable to update ${title}: ID is missing`
      );
      return;
    }

    try {
      setSaving(true);

      // Build request body
      const payload = buildPayload();

      console.log(
        `${isEdit ? "UPDATE" : "CREATE"} ${title} payload:`,
        payload
      );

      let response;

      // =========================
      // UPDATE
      // =========================
      if (isEdit) {
        if (typeof onCustomSave === "function") {
          response = await onCustomSave({
            ...payload,
            [idField]: currentEditId,
          });
        } else {
          if (typeof updateApi !== "function") {
            throw new Error(
              `updateApi is not provided for ${title}`
            );
          }

          response = await updateApi(
            currentEditId,
            payload
          );
        }

        toast.success(
          `${title} updated successfully`
        );
      }

      // =========================
      // CREATE
      // =========================
      else {
        if (typeof addApi !== "function") {
          throw new Error(
            `addApi is not provided for ${title}`
          );
        }

        response = await addApi(payload);

        toast.success(
          `${title} created successfully`
        );
      }

      // Normalize API response
      const result = normalizeResponse(response);

      // Refresh parent table
      onSuccess?.(result);

      // Close modal
      onClose?.();

    } catch (error) {
      console.error(
        `${title} save error:`,
        error?.response?.data || error
      );

      const detail =
        error?.response?.data?.detail;

      let backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error;

      if (Array.isArray(detail)) {
        backendMessage = detail
          .map(
            (item) =>
              item?.msg ||
              item?.message ||
              String(item)
          )
          .join(", ");
      } else if (typeof detail === "string") {
        backendMessage = detail;
      } else if (
        detail &&
        typeof detail === "object"
      ) {
        backendMessage =
          detail.message ||
          detail.msg ||
          JSON.stringify(detail);
      }

      toast.error(
        backendMessage ||
        `Unable to save ${title}`
      );

    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = () => {
    if (!validate()) return;

    handleUpdate();
  };

  /* =========================================================
     CLOSED
  ========================================================= */

  if (!open) return null;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
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
          transition={{
            duration: 0.25,
          }}
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl"
        >
          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <FolderPlus size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isEdit
                    ? `Edit ${title}`
                    : `Add ${title}`}
                </h2>

                <p className="text-sm text-gray-500">
                  {isEdit
                    ? `Update ${title.toLowerCase()} information`
                    : `Create a new ${title.toLowerCase()}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* BODY */}

          <div className="max-h-[calc(90vh-145px)] overflow-y-auto p-6">
            <div
              className={
                compactLayout
                  ? "grid grid-cols-2 gap-4"
                  : "grid grid-cols-1 gap-5"
              }
            >
              {/* CODE */}

              {codeField && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {codeLabel}
                    <span className="text-red-600">
                      {" "}*
                    </span>
                  </label>

                  <input
                    type="text"
                    name={codeField}
                    value={
                      formData[codeField] ??
                      ""
                    }
                    onChange={handleChange}
                    placeholder={`Enter ${codeLabel}`}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* NAME */}

              {nameField && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {nameLabel}
                    <span className="text-red-600">
                      {" "}*
                    </span>
                  </label>

                  <input
                    type="text"
                    name={nameField}
                    value={
                      formData[nameField] ??
                      ""
                    }
                    onChange={handleChange}
                    placeholder={`Enter ${nameLabel}`}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* EXTRA FIELDS */}

              {extraFields.map(
                (field) => (
                  <div
                    key={field.name}
                    className={
                      field.fullWidth
                        ? "col-span-2"
                        : ""
                    }
                  >
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {field.label}

                      {field.required && (
                        <span className="text-red-600">
                          {" "}*
                        </span>
                      )}
                    </label>

                    {/* MULTI SELECT */}

                    {field.type ===
                      "multi-select" ? (
                      <select
                        multiple
                        name={field.name}
                        value={
                          formData[
                          field.name
                          ] ?? []
                        }
                        onChange={(e) =>
                          handleSelectChange(
                            e,
                            field
                          )
                        }
                        className="h-28 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {field.options?.map(
                          (option) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          )
                        )}
                      </select>
                    ) : field.type ===
                      "select" ? (
                      /* SELECT */

                      <select
                        name={field.name}
                        value={
                          formData[
                          field.name
                          ] ?? ""
                        }
                        onChange={(e) =>
                          handleSelectChange(
                            e,
                            field
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">
                          Select{" "}
                          {field.label}
                        </option>

                        {field.options?.map(
                          (option) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      /* INPUT */

                      <input
                        type={
                          field.type ===
                            "number"
                            ? "number"
                            : "text"
                        }
                        name={field.name}
                        value={
                          formData[
                          field.name
                          ] ?? ""
                        }
                        onChange={
                          handleChange
                        }
                        placeholder={`Enter ${field.label}`}
                        readOnly={
                          field.readOnly ===
                          true
                        }
                        min={
                          field.type ===
                            "number"
                            ? "0"
                            : undefined
                        }
                        step={
                          field.type ===
                            "number"
                            ? "0.000001"
                            : undefined
                        }
                        className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${field.readOnly
                          ? "bg-gray-100 text-gray-600"
                          : ""
                          }`}
                      />
                    )}
                  </div>
                )
              )}

              {/* STATUS */}

              <div
                className={
                  compactLayout
                    ? "col-span-2"
                    : ""
                }
              >
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Active Status
                </label>

                <div className="flex gap-8">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="active"
                      checked={
                        formData.active ===
                        true
                      }
                      onChange={() =>
                        setFormData(
                          (prev) => ({
                            ...prev,
                            active: true,
                          })
                        )
                      }
                    />

                    <span>
                      Active
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="active"
                      checked={
                        formData.active ===
                        false
                      }
                      onChange={() =>
                        setFormData(
                          (prev) => ({
                            ...prev,
                            active: false,
                          })
                        )
                      }
                    />

                    <span>
                      Inactive
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}

          <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={
                saving ||
                !isFormValid()
              }
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                  ? `Update ${title}`
                  : `Save ${title}`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
