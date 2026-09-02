
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
  updateApi,
  onCustomSave,

  extraFields = [],

  compactLayout = false,

  subDivisions = [],
  parentDivisions = [],
}) {
  const isEdit = Boolean(editData);
  const editId =
    editData && idField
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

    if (
      field.name === "legal_group_ids" &&
      Array.isArray(data.legal_groups)
    ) {
      return data.legal_groups
        .map((item) => item?.legal_group_id)
        .filter((id) => id != null)
        .map(String);
    }

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

    extraFields.forEach((field) => {
      if (!field.required) return;

      const value =
        formData[field.name];

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

    extraFields.forEach((field) => {
      const value =
        formData[field.name];

      if (field.readOnly) {
        return;
      }

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

      if (field.isId) {
        payload[field.name] =
          value === "" ||
            value === null ||
            value === undefined
            ? null
            : Number(value);

        return;
      }

      if (field.type === "number") {
        payload[field.name] =
          value === "" ||
            value === null ||
            value === undefined
            ? null
            : Number(value);

        return;
      }

      payload[field.name] =
        value ?? "";
    });

    return payload;
  };

  /* =========================================================
     SAVE AND UPDATE
  ========================================================= */

  const handleUpdate = async () => {
    if (saving) return;

    const currentEditId =
      isEdit
        ? editData?.[idField] ??
        editData?.parent_division_id ??
        editData?.subdivision_id ??
        editData?.legal_entity_id ??
        editData?.legal_group_id ??
        null
        : null;

    console.log(
      "========== SAVE DEBUG =========="
    );
    console.log("title:", title);
    console.log("isEdit:", isEdit);
    console.log("idField:", idField);
    console.log("editData:", editData);
    console.log(
      "currentEditId:",
      currentEditId
    );
    console.log(
      "================================="
    );

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

      const payload = buildPayload();

      console.log(
        `${isEdit ? "UPDATE" : "CREATE"} ${title} payload:`,
        payload
      );

      let response;

      if (isEdit) {
        if (
          typeof onCustomSave ===
          "function"
        ) {
          response = await onCustomSave({
            ...payload,
            [idField]: currentEditId,
          });
        } else {
          if (
            typeof updateApi !==
            "function"
          ) {
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
      } else {
        if (
          typeof addApi !== "function"
        ) {
          throw new Error(
            `addApi is not provided for ${title}`
          );
        }

        response = await addApi(payload);

        toast.success(
          `${title} created successfully`
        );
      }

      const result =
        normalizeResponse(response);

      onSuccess?.(result);

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
      } else if (
        typeof detail === "string"
      ) {
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
     INLINE STYLES
  ========================================================= */

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
    boxSizing: "border-box",
  };

  const modalStyle = {
    width: "100%",
    maxWidth: compactLayout
      ? "720px"
      : "640px",
    maxHeight: "calc(100vh - 48px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    boxShadow:
      "0 20px 50px rgba(0, 0, 0, 0.18)",
    boxSizing: "border-box",
  };

  const headerStyle = {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "18px 22px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    boxSizing: "border-box",
  };

  const headerLeftStyle = {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const iconBoxStyle = {
    width: "42px",
    height: "42px",
    minWidth: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "#dbeafe",
    color: "#2563eb",
    boxSizing: "border-box",
  };

  const titleStyle = {
    margin: 0,
    fontSize: "17px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "#111827",
  };

  const subtitleStyle = {
    margin: "2px 0 0",
    fontSize: "12px",
    lineHeight: "18px",
    color: "#6b7280",
  };

  const closeButtonStyle = {
    width: "36px",
    height: "36px",
    minWidth: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "transparent",
    color: "#6b7280",
    cursor: saving
      ? "not-allowed"
      : "pointer",
    opacity: saving ? 0.5 : 1,
    flexShrink: 0,
  };

  const bodyStyle = {
    flex: "1 1 auto",
    minHeight: 0,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "22px",
    boxSizing: "border-box",
  };

  const formGridStyle = {
    display: "grid",
    gridTemplateColumns:
      compactLayout
        ? "repeat(2, minmax(0, 1fr))"
        : "1fr",
    gap: "18px",
    width: "100%",
    boxSizing: "border-box",
  };

  const fieldWrapperStyle = {
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
  };

  const fullWidthStyle = {
    gridColumn: "1 / -1",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "7px",
    fontSize: "13px",
    lineHeight: "18px",
    fontWeight: 500,
    color: "#374151",
  };

  const requiredStyle = {
    marginLeft: "3px",
    color: "#dc2626",
  };

  const inputStyle = {
    width: "100%",
    height: "40px",
    padding: "0 12px",
    border:
      "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "13px",
    lineHeight: "20px",
    outline: "none",
    boxSizing: "border-box",
    transition:
      "border-color 0.15s ease, box-shadow 0.15s ease",
  };

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
  };

  const multiSelectStyle = {
    width: "100%",
    minHeight: "112px",
    padding: "8px 10px",
    border:
      "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "13px",
    lineHeight: "20px",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
  };

  const readOnlyInputStyle = {
    ...inputStyle,
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    cursor: "default",
  };

  const statusWrapperStyle = {
    ...fieldWrapperStyle,
    ...(compactLayout
      ? fullWidthStyle
      : {}),
    paddingTop: "2px",
  };

  const radioGroupStyle = {
    display: "flex",
    alignItems: "center",
    gap: "26px",
    minHeight: "40px",
  };

  const radioLabelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "13px",
    color: "#374151",
    cursor: "pointer",
    userSelect: "none",
  };

  const radioStyle = {
    width: "15px",
    height: "15px",
    margin: 0,
    accentColor: "#2563eb",
    cursor: "pointer",
  };

  const footerStyle = {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "14px 22px",
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e5e7eb",
    boxSizing: "border-box",
  };

  const cancelButtonStyle = {
    height: "38px",
    padding: "0 18px",
    border:
      "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontSize: "13px",
    fontWeight: 500,
    cursor: saving
      ? "not-allowed"
      : "pointer",
    opacity: saving ? 0.5 : 1,
    boxSizing: "border-box",
  };

  const saveButtonStyle = {
    height: "38px",
    padding: "0 20px",
    border: "1px solid #2563eb",
    borderRadius: "8px",
    backgroundColor:
      saving || !isFormValid()
        ? "#9ca3af"
        : "#2563eb",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 500,
    cursor:
      saving || !isFormValid()
        ? "not-allowed"
        : "pointer",
    opacity:
      saving || !isFormValid()
        ? 0.9
        : 1,
    boxSizing: "border-box",
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <AnimatePresence>
      <motion.div
        style={overlayStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          style={modalStyle}
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
        >
          {/* HEADER */}

          <div style={headerStyle}>
            <div style={headerLeftStyle}>
              <div style={iconBoxStyle}>
                <FolderPlus size={21} />
              </div>

              <div
                style={{
                  minWidth: 0,
                }}
              >
                <h2 style={titleStyle}>
                  {isEdit
                    ? `Edit ${title}`
                    : `Add ${title}`}
                </h2>

                <p style={subtitleStyle}>
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
              style={closeButtonStyle}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.backgroundColor =
                    "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "transparent";
              }}
            >
              <X size={19} />
            </button>
          </div>

          {/* BODY */}

          <div style={bodyStyle}>
            <div style={formGridStyle}>
              {/* CODE */}

              {codeField && (
                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>
                    {codeLabel}
                    <span style={requiredStyle}>
                      *
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
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        "#3b82f6";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(59, 130, 246, 0.12)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "#d1d5db";
                      e.currentTarget.style.boxShadow =
                        "none";
                    }}
                  />
                </div>
              )}

              {/* NAME */}

              {nameField && (
                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>
                    {nameLabel}
                    <span style={requiredStyle}>
                      *
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
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        "#3b82f6";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(59, 130, 246, 0.12)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "#d1d5db";
                      e.currentTarget.style.boxShadow =
                        "none";
                    }}
                  />
                </div>
              )}

              {/* EXTRA FIELDS */}

              {extraFields.map(
                (field) => (
                  <div
                    key={field.name}
                    style={{
                      ...fieldWrapperStyle,
                      ...(field.fullWidth
                        ? fullWidthStyle
                        : {}),
                    }}
                  >
                    <label style={labelStyle}>
                      {field.label}

                      {field.required && (
                        <span
                          style={
                            requiredStyle
                          }
                        >
                          *
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
                        style={
                          multiSelectStyle
                        }
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            "#3b82f6";
                          e.currentTarget.style.boxShadow =
                            "0 0 0 3px rgba(59, 130, 246, 0.12)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor =
                            "#d1d5db";
                          e.currentTarget.style.boxShadow =
                            "none";
                        }}
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
                        style={
                          selectStyle
                        }
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            "#3b82f6";
                          e.currentTarget.style.boxShadow =
                            "0 0 0 3px rgba(59, 130, 246, 0.12)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor =
                            "#d1d5db";
                          e.currentTarget.style.boxShadow =
                            "none";
                        }}
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
                        style={
                          field.readOnly
                            ? readOnlyInputStyle
                            : inputStyle
                        }
                        onFocus={(e) => {
                          if (
                            !field.readOnly
                          ) {
                            e.currentTarget.style.borderColor =
                              "#3b82f6";
                            e.currentTarget.style.boxShadow =
                              "0 0 0 3px rgba(59, 130, 246, 0.12)";
                          }
                        }}
                        onBlur={(e) => {
                          if (
                            !field.readOnly
                          ) {
                            e.currentTarget.style.borderColor =
                              "#d1d5db";
                            e.currentTarget.style.boxShadow =
                              "none";
                          }
                        }}
                      />
                    )}
                  </div>
                )
              )}

              {/* STATUS */}

              <div style={statusWrapperStyle}>
                <label style={labelStyle}>
                  Active Status
                </label>

                <div
                  style={
                    radioGroupStyle
                  }
                >
                  <label
                    style={
                      radioLabelStyle
                    }
                  >
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
                      style={radioStyle}
                    />

                    <span>
                      Active
                    </span>
                  </label>

                  <label
                    style={
                      radioLabelStyle
                    }
                  >
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
                      style={radioStyle}
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

          <div style={footerStyle}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={cancelButtonStyle}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.backgroundColor =
                    "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "#ffffff";
              }}
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
              style={saveButtonStyle}
              onMouseEnter={(e) => {
                if (
                  !saving &&
                  isFormValid()
                ) {
                  e.currentTarget.style.backgroundColor =
                    "#1d4ed8";
                }
              }}
              onMouseLeave={(e) => {
                if (
                  !saving &&
                  isFormValid()
                ) {
                  e.currentTarget.style.backgroundColor =
                    "#2563eb";
                }
              }}
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