
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
    if (!data || !field) return [];

    const fieldName = field.name;

    const normalizeIds = (items) => {
      if (!Array.isArray(items)) return [];

      return items
        .map((item) => {
          if (item && typeof item === "object") {
            return (
              item.id ??
              item.value ??
              item.legal_group_id ??
              item.legal_entity_id ??
              item.parent_division_id ??
              item.subdivision_id ??
              item.group_id ??
              item[fieldName] ??
              item.legal_group?.id ??
              item.legal_group?.legal_group_id ??
              item.legal_entity?.id ??
              item.legal_entity?.legal_entity_id ??
              item.parent_division?.id ??
              item.parent_division?.parent_division_id ??
              item.subdivision?.id ??
              item.subdivision?.subdivision_id
            );
          }

          return item;
        })
        .filter(
          (id) =>
            id !== null &&
            id !== undefined &&
            String(id).trim() !== "" &&
            String(id) !== "NaN"
        )
        .map(String);
    };

    /* =========================================================
       DIRECT ARRAY FIELD
    ========================================================= */

    const directValue = data[fieldName];

    if (Array.isArray(directValue)) {
      return normalizeIds(directValue);
    }

    /* =========================================================
       DIRECT SINGLE VALUE
    ========================================================= */

    if (
      directValue !== null &&
      directValue !== undefined &&
      String(directValue).trim() !== ""
    ) {
      return [String(directValue)];
    }

    /* =========================================================
       LEGAL GROUPS
    ========================================================= */

    if (fieldName === "legal_group_ids") {
      if (Array.isArray(data.legal_groups)) {
        return normalizeIds(data.legal_groups);
      }

      if (Array.isArray(data.legal_group)) {
        return normalizeIds(data.legal_group);
      }

      if (
        data.legal_group_id !== null &&
        data.legal_group_id !== undefined
      ) {
        return [String(data.legal_group_id)];
      }
    }

    /* =========================================================
       LEGAL ENTITIES
    ========================================================= */

    if (fieldName === "legal_entity_ids") {
      if (Array.isArray(data.legal_entities)) {
        return normalizeIds(data.legal_entities);
      }

      if (Array.isArray(data.legal_entity)) {
        return normalizeIds(data.legal_entity);
      }

      if (
        data.legal_entity_id !== null &&
        data.legal_entity_id !== undefined
      ) {
        return [String(data.legal_entity_id)];
      }
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

    /*
     * IMPORTANT:
     * Explicitly preserve false.
     *
     * false = Inactive
     * true  = Active
     */
    const normalizedActive =
      editData?.active === false ||
        editData?.active === 0 ||
        editData?.active === "false" ||
        editData?.active === "0"
        ? false
        : true;

    const initialData = {
      active: normalizedActive,
    };

    /* =======================================================
       CODE
    ======================================================= */

    if (codeField) {
      initialData[codeField] =
        editData?.[codeField] ?? "";
    }

    /* =======================================================
       NAME
    ======================================================= */

    if (nameField) {
      initialData[nameField] =
        editData?.[nameField] ?? "";
    }

    /* =======================================================
       EXTRA FIELDS
    ======================================================= */

    extraFields.forEach((field) => {
      /*
       * Do NOT allow an extraFields "active" value
       * to overwrite our boolean status.
       */
      if (field.name === "active") {
        return;
      }

      initialData[field.name] =
        getFieldValue(editData, field);
    });

    /* =======================================================
       LEGAL GROUP EDIT FIX
    ======================================================= */

    if (
      editData &&
      Array.isArray(editData.legal_groups)
    ) {
      initialData.legal_group_ids =
        getArrayValue(editData, {
          name: "legal_group_ids",
        });
    }

    /* =======================================================
       LEGAL GROUP FALLBACK
    ======================================================= */

    if (
      editData &&
      !initialData.legal_group_ids?.length &&
      editData.legal_group_id !== null &&
      editData.legal_group_id !== undefined
    ) {
      initialData.legal_group_ids = [
        String(editData.legal_group_id),
      ];
    }

    /* =======================================================
       LEGAL GROUP FALLBACK - legal_group
    ======================================================= */

    if (
      editData &&
      !initialData.legal_group_ids?.length &&
      Array.isArray(editData.legal_group)
    ) {
      initialData.legal_group_ids =
        getArrayValue(editData, {
          name: "legal_group_ids",
        });
    }

    /* =======================================================
       SUBDIVISION / PARENT DIVISION DATA
    ======================================================= */

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
    extraFields,
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

    /* =======================================================
       MULTI SELECT
    ======================================================= */

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

    /* =======================================================
       SUB DIVISION
    ======================================================= */

    if (name === "subdivision_id") {
      const selectedSubDivision =
        subDivisions.find(
          (item) =>
            String(item.subdivision_id) ===
            String(value)
        );

      if (
        !value ||
        !selectedSubDivision
      ) {
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

    /* =======================================================
       NORMAL SELECT
    ======================================================= */

    const selectedOption =
      field.options?.find(
        (option) =>
          String(option.value) ===
          String(value)
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
     FIELD VALIDATION
  ========================================================= */

  const isFieldValid = (field) => {
    if (!field) return true;

    // IMPORTANT:
    // Active/Inactive is always a valid value.
    // false is NOT an invalid/empty value.
    if (field.name === "active") return true;

    // Read-only fields don't block Save/Update
    if (isEdit && field.readOnly) return true;

    if (!field.required) return true;

    const value = formData[field.name];

    // Multi-select
    if (field.multiple) {
      return Array.isArray(value) && value.length > 0;
    }

    // Number fields
    if (field.type === "number") {
      return value !== "" && value !== null && value !== undefined;
    }

    // Normal fields
    return (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    );
  };
  /* =========================================================
     VALIDATION
  ========================================================= */

  const validate = () => {
    const errors = [];

    /* =======================================================
       CODE
    ======================================================= */

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

    /* =======================================================
       NAME
    ======================================================= */

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

    /* =======================================================
       EXTRA FIELDS
    ======================================================= */

    extraFields.forEach((field) => {
      /*
       * NEVER validate Active Status.
       *
       * false is a legitimate value.
       */
      if (
        field.name === "active" ||
        field.name === "is_active"
      ) {
        return;
      }

      if (!field.required) {
        return;
      }

      /*
       * Read-only fields do not block updates.
       */
      if (isEdit && field.readOnly) {
        return;
      }

      const value = formData[field.name];

      /* =====================================================
         MULTI SELECT
      ===================================================== */

      if (field.type === "multi-select") {
        const validMultiSelect =
          Array.isArray(value) &&
          value.some(
            (item) =>
              item !== null &&
              item !== undefined &&
              String(item).trim() !== "" &&
              String(item) !== "NaN"
          );

        if (!validMultiSelect) {
          errors.push(
            `${field.label} is required`
          );
        }

        return;
      }

      /* =====================================================
         NORMAL FIELD
      ===================================================== */

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

      /* =====================================================
         NUMBER
      ===================================================== */

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
    // Code validation
    const codeValid =
      !codeField ||
      Boolean(String(formData[codeField] ?? "").trim());

    // Name validation
    const nameValid =
      !nameField ||
      Boolean(String(formData[nameField] ?? "").trim());

    // Extra fields
    const extraValid = (extraFields || []).every((field) => {
      // NEVER allow Active/Inactive to make form invalid
      if (field?.name === "active") {
        return true;
      }

      return isFieldValid(field);
    });

    return codeValid && nameValid && extraValid;
  };
  /* =========================================================
     BUILD PAYLOAD
  ========================================================= */

  const buildPayload = () => {
    const payload = {};

    /* =======================================================
       CODE
    ======================================================= */

    if (codeField) {
      payload[codeField] =
        String(
          formData[codeField] ?? ""
        ).trim();
    }

    /* =======================================================
       NAME
    ======================================================= */

    if (nameField) {
      payload[nameField] =
        String(
          formData[nameField] ?? ""
        ).trim();
    }

    /* =======================================================
       ACTIVE
    ======================================================= */

    /*
     * IMPORTANT:
     *
     * Do NOT use:
     *
     * Boolean(formData.active)
     *
     * because we want the actual boolean state.
     *
     * false must be sent as false.
     */
    payload.active =
      formData.active === false
        ? false
        : true;

    /* =======================================================
       EXTRA FIELDS
    ======================================================= */

    extraFields.forEach((field) => {
      const value =
        formData[field.name];

      /*
       * Active is already handled above.
       *
       * Prevent duplicate/incorrect processing.
       */
      if (
        field.name === "active"
      ) {
        return;
      }

      /*
       * is_active should also not override active.
       */
      if (
        field.name === "is_active"
      ) {
        return;
      }

      /*
       * Read-only fields are never submitted.
       */
      if (field.readOnly) {
        return;
      }

      /* =====================================================
         ID MULTI SELECT
      ===================================================== */

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

      /* =====================================================
         SINGLE ID
      ===================================================== */

      if (field.isId) {
        payload[field.name] =
          value === "" ||
            value === null ||
            value === undefined
            ? null
            : Number(value);

        return;
      }

      /* =====================================================
         NUMBER
      ===================================================== */

      if (field.type === "number") {
        payload[field.name] =
          value === "" ||
            value === null ||
            value === undefined
            ? null
            : Number(value);

        return;
      }

      /* =====================================================
         NORMAL
      ===================================================== */

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
      "formData:",
      formData
    );

    console.log(
      "Active status:",
      formData.active
    );

    console.log(
      "================================="
    );

    /* =======================================================
       ID VALIDATION
    ======================================================= */

    if (
      isEdit &&
      (
        currentEditId === undefined ||
        currentEditId === null ||
        currentEditId === ""
      )
    ) {
      toast.error(
        `Unable to update ${title}: ID is missing`
      );

      return;
    }

    try {
      setSaving(true);

      const payload =
        buildPayload();

      console.log(
        `${isEdit
          ? "UPDATE"
          : "CREATE"
        } ${title} payload:`,
        payload
      );

      let response;

      /* =====================================================
         UPDATE
      ===================================================== */

      if (isEdit) {
        if (
          typeof onCustomSave ===
          "function"
        ) {
          response =
            await onCustomSave({
              ...payload,
              [idField]:
                currentEditId,
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

          response =
            await updateApi(
              currentEditId,
              payload
            );
        }

        toast.success(
          `${title} updated successfully`
        );
      }

      /* =====================================================
         CREATE
      ===================================================== */

      else {
        if (
          typeof addApi !==
          "function"
        ) {
          throw new Error(
            `addApi is not provided for ${title}`
          );
        }

        response =
          await addApi(payload);

        toast.success(
          `${title} created successfully`
        );
      }

      /* =====================================================
         NORMALIZE RESPONSE
      ===================================================== */

      const result =
        normalizeResponse(response);

      onSuccess?.(result);

      onClose?.();
    } catch (error) {
      console.error(
        `${title} save error:`,
        error?.response?.data ||
        error
      );

      const detail =
        error?.response?.data?.detail;

      let backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error;

      /* =====================================================
         ARRAY DETAIL
      ===================================================== */

      if (Array.isArray(detail)) {
        backendMessage =
          detail
            .map(
              (item) =>
                item?.msg ||
                item?.message ||
                String(item)
            )
            .join(", ");
      }

      /* =====================================================
         STRING DETAIL
      ===================================================== */

      else if (
        typeof detail ===
        "string"
      ) {
        backendMessage =
          detail;
      }

      /* =====================================================
         OBJECT DETAIL
      ===================================================== */

      else if (
        detail &&
        typeof detail ===
        "object"
      ) {
        backendMessage =
          detail.message ||
          detail.msg ||
          JSON.stringify(
            detail
          );
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
     FORM VALID STATE
  ========================================================= */

  const formValid =
    isFormValid();

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
    backgroundColor:
      "rgba(0, 0, 0, 0.42)",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter:
      "blur(3px)",
    boxSizing: "border-box",
  };

  const modalStyle = {
    width: "100%",
    maxWidth: compactLayout
      ? "720px"
      : "640px",
    maxHeight:
      "calc(100vh - 48px)",
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
    justifyContent:
      "space-between",
    gap: "16px",
    padding: "18px 22px",
    backgroundColor: "#f8fafc",
    borderBottom:
      "1px solid #e5e7eb",
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
    backgroundColor:
      "transparent",
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
    borderTop:
      "1px solid #e5e7eb",
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
    backgroundColor: saving ? "#9ca3af" : "#2563eb",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 500,
    cursor: saving ? "not-allowed" : "pointer",
    opacity: saving ? 0.7 : 1,
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
          {/* =================================================
              HEADER
          ================================================= */}

          <div style={headerStyle}>
            <div style={headerLeftStyle}>
              <div
                style={iconBoxStyle}
              >
                <FolderPlus
                  size={21}
                />
              </div>

              <div
                style={{
                  minWidth: 0,
                }}
              >
                <h2
                  style={titleStyle}
                >
                  {isEdit
                    ? `Edit ${title}`
                    : `Add ${title}`}
                </h2>

                <p
                  style={
                    subtitleStyle
                  }
                >
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
              style={
                closeButtonStyle
              }
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

          {/* =================================================
              BODY
          ================================================= */}

          <div style={bodyStyle}>
            <div
              style={formGridStyle}
            >
              {/* =================================================
                  CODE
              ================================================= */}

              {codeField && (
                <div
                  style={
                    fieldWrapperStyle
                  }
                >
                  <label
                    style={
                      labelStyle
                    }
                  >
                    {codeLabel}

                    <span
                      style={
                        requiredStyle
                      }
                    >
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name={codeField}
                    value={
                      formData[
                      codeField
                      ] ?? ""
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={`Enter ${codeLabel}`}
                    style={
                      inputStyle
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
                  />
                </div>
              )}

              {/* =================================================
                  NAME
              ================================================= */}

              {nameField && (
                <div
                  style={
                    fieldWrapperStyle
                  }
                >
                  <label
                    style={
                      labelStyle
                    }
                  >
                    {nameLabel}

                    <span
                      style={
                        requiredStyle
                      }
                    >
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name={nameField}
                    value={
                      formData[
                      nameField
                      ] ?? ""
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={`Enter ${nameLabel}`}
                    style={
                      inputStyle
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
                  />
                </div>
              )}

              {/* =================================================
                  EXTRA FIELDS
              ================================================= */}

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
                    <label
                      style={
                        labelStyle
                      }
                    >
                      {field.label}

                      {field.required &&
                        field.name !==
                        "active" &&
                        field.name !==
                        "is_active" && (
                          <span
                            style={
                              requiredStyle
                            }
                          >
                            *
                          </span>
                        )}
                    </label>

                    {/* =================================================
                        MULTI SELECT
                    ================================================= */}

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
                      /* =================================================
                          SELECT
                      ================================================= */

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
                          {
                            field.label
                          }
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
                      /* =================================================
                          INPUT
                      ================================================= */

                      <input
                        type={
                          field.type ===
                            "number"
                            ? "number"
                            : "text"
                        }
                        name={
                          field.name
                        }
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

              {/* =================================================
                  STATUS
              ================================================= */}

              <div
                style={
                  statusWrapperStyle
                }
              >
                <label
                  style={
                    labelStyle
                  }
                >
                  Active Status
                </label>

                <div
                  style={
                    radioGroupStyle
                  }
                >
                  {/* ACTIVE */}

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
                      style={
                        radioStyle
                      }
                    />

                    <span>
                      Active
                    </span>
                  </label>

                  {/* INACTIVE */}

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
                      style={
                        radioStyle
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

          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            style={footerStyle}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={
                cancelButtonStyle
              }
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
              disabled={saving}
              style={{
                ...saveButtonStyle,
                backgroundColor: saving ? "#9ca3af" : "#2563eb",
                borderColor: saving ? "#9ca3af" : "#2563eb",
                opacity: saving ? 0.7 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : isEdit ? "Update" : "Save"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}