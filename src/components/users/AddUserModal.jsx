

import { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getRoles,
    addUser,
    updateUser,
} from "../../api/userApi";
import toast from "react-hot-toast";

export default function AddUserModal({
    open,
    onClose,
    onSuccess,
    editUser,
}) {
    const initialFormData = {
        employee_code: "",
        employee_name: "",
        official_email: "",
        designation: "",
        reporting_manager_code: "",
        role_code: "",
        active: true,
    };

    const [formData, setFormData] = useState(initialFormData);

    const isEdit = !!editUser;

    const [roleOptions, setRoleOptions] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [saving, setSaving] = useState(false);

    /* ---------------------------------------
       FETCH ROLES
    --------------------------------------- */
    const fetchRoles = async () => {
        try {
            setLoadingRoles(true);

            const response = await getRoles();

            console.log("Roles API Response:", response.data);

            const roles = response.data || [];

            const formattedRoles = roles.map((role) => ({
                id: role.role_code,
                code: role.role_code,
                name: role.role_name,
            }));

            console.log("Formatted Roles:", formattedRoles);

            setRoleOptions(formattedRoles);
        } catch (error) {
            console.error("Role loading error:", error);
            toast.error("Failed to load roles");
        } finally {
            setLoadingRoles(false);
        }
    };

    /* ---------------------------------------
       POPULATE FORM WHEN OPEN / EDIT
    --------------------------------------- */
    useEffect(() => {
        if (!open) return;

        fetchRoles();

        if (editUser) {
            setFormData({
                employee_code: editUser.code || "",
                employee_name: editUser.name || "",
                official_email: editUser.email || "",
                designation: editUser.jobTitle || "",
                reporting_manager_code:
                    editUser.raw?.reporting_manager_code || "",
                role_code: editUser.role || "",
                active: editUser.status === "Active",
            });
        } else {
            setFormData(initialFormData);
        }
    }, [open, editUser]);

    /* ---------------------------------------
       VALIDATION
    --------------------------------------- */
    const validate = () => {
        const errors = [];

        if (!String(formData.employee_code ?? "").trim()) {
            errors.push("Employee Code is required");
        }

        if (!String(formData.employee_name ?? "").trim()) {
            errors.push("Employee Name is required");
        }

        if (!String(formData.official_email ?? "").trim()) {
            errors.push("Official Email is required");
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.official_email
            )
        ) {
            errors.push("Enter a valid email address");
        }

        if (!String(formData.designation ?? "").trim()) {
            errors.push("Designation is required");
        }

        if (!String(formData.role_code ?? "").trim()) {
            errors.push("Role is required");
        }

        if (errors.length > 0) {
            errors.forEach((message) => toast.error(message));
            return false;
        }

        return true;
    };

    /* ---------------------------------------
       FORM VALID STATE
    --------------------------------------- */
    const isFormValid = () => {
        return (
            String(formData.employee_code ?? "").trim() &&
            String(formData.employee_name ?? "").trim() &&
            String(formData.official_email ?? "").trim() &&
            String(formData.designation ?? "").trim() &&
            String(formData.role_code ?? "").trim()
        );
    };

    /* ---------------------------------------
       HANDLE INPUT CHANGE
    --------------------------------------- */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* ---------------------------------------
       HANDLE SAVE
    --------------------------------------- */
    const handleSave = async () => {
        console.log("SAVE BUTTON CLICKED");

        if (!validate()) return;

        const payload = {
            employee_code: formData.employee_code,
            employee_name: formData.employee_name,
            official_email: formData.official_email,
            designation: formData.designation,
            reporting_manager_code:
                formData.reporting_manager_code || "",
            role_code: formData.role_code,
            active: formData.active,
        };

        console.log("Payload:", payload);

        try {
            setSaving(true);

            if (isEdit) {
                await updateUser(editUser.id, payload);

                toast.success("User updated successfully");
            } else {
                await addUser(payload);

                toast.success("User created successfully");
            }

            if (!isEdit) {
                setFormData(initialFormData);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.log(error);

            if (error.response) {
                toast.error(
                    error.response.data.detail ||
                    "Server error"
                );

                console.log(
                    "Backend Error:",
                    error.response.data
                );
            } else if (error.request) {
                toast.error(
                    "Unable to connect to server"
                );
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
            {/* MODAL OVERLAY */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    backgroundColor: "rgba(0, 0, 0, 0.40)",
                    backdropFilter: "blur(3px)",
                    boxSizing: "border-box",
                    overflowY: "auto",
                }}
            >
                {/* MODAL */}
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
                    style={{
                        width: "100%",
                        maxWidth: "900px",
                        maxHeight: "calc(100vh - 40px)",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        boxShadow:
                            "0 20px 50px rgba(0, 0, 0, 0.20)",
                        overflow: "hidden",
                        boxSizing: "border-box",
                    }}
                >
                    {/* ==============================
                        HEADER
                    =============================== */}
                    <div
                        style={{
                            flex: "0 0 auto",
                            minHeight: "70px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 20px",
                            borderBottom:
                                "1px solid #e5e7eb",
                            backgroundColor: "#f9fafb",
                            boxSizing: "border-box",
                        }}
                    >
                        {/* HEADER LEFT */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                minWidth: 0,
                            }}
                        >
                            <div
                                style={{
                                    width: "42px",
                                    height: "42px",
                                    flex: "0 0 42px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "10px",
                                    backgroundColor: "#dbeafe",
                                    color: "#2563eb",
                                }}
                            >
                                <UserPlus size={20} />
                            </div>

                            <div
                                style={{
                                    minWidth: 0,
                                }}
                            >
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: "16px",
                                        lineHeight: "22px",
                                        fontWeight: 600,
                                        color: "#111827",
                                    }}
                                >
                                    {isEdit
                                        ? "Edit User"
                                        : "Add User"}
                                </h2>

                                <p
                                    style={{
                                        margin:
                                            "3px 0 0",
                                        fontSize: "11px",
                                        lineHeight: "16px",
                                        color: "#6b7280",
                                    }}
                                >
                                    {isEdit
                                        ? "Update user information"
                                        : "Create a new application user"}
                                </p>
                            </div>
                        </div>

                        {/* CLOSE BUTTON */}
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                width: "32px",
                                height: "32px",
                                flex: "0 0 32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "none",
                                borderRadius: "7px",
                                backgroundColor:
                                    "transparent",
                                color: "#6b7280",
                                cursor: "pointer",
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* ==============================
                        BODY
                    =============================== */}
                    <div
                        style={{
                            flex: "1 1 auto",
                            minHeight: 0,
                            overflowY: "auto",
                            overflowX: "hidden",
                            padding: "20px",
                            boxSizing: "border-box",
                        }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(2, minmax(0, 1fr))",
                                columnGap: "18px",
                                rowGap: "16px",
                                width: "100%",
                            }}
                        >
                            {/* EMPLOYEE CODE */}
                            <FormField
                                label="Employee Code"
                                required
                            >
                                <input
                                    type="text"
                                    name="employee_code"
                                    value={
                                        formData.employee_code
                                    }
                                    onChange={handleChange}
                                    placeholder="Enter Employee Code"
                                    style={inputStyle}
                                />
                            </FormField>

                            {/* EMPLOYEE NAME */}
                            <FormField
                                label="Employee Name"
                                required
                            >
                                <input
                                    type="text"
                                    name="employee_name"
                                    value={
                                        formData.employee_name
                                    }
                                    onChange={handleChange}
                                    placeholder="Enter Employee Name"
                                    style={inputStyle}
                                />
                            </FormField>

                            {/* EMAIL */}
                            <FormField
                                label="Official Email"
                                required
                            >
                                <input
                                    type="email"
                                    name="official_email"
                                    value={
                                        formData.official_email
                                    }
                                    onChange={handleChange}
                                    placeholder="Enter Official Email"
                                    style={inputStyle}
                                />
                            </FormField>

                            {/* ROLE */}
                            <FormField
                                label="Role"
                                required
                            >
                                <select
                                    name="role_code"
                                    value={
                                        formData.role_code
                                    }
                                    onChange={handleChange}
                                    disabled={loadingRoles}
                                    style={{
                                        ...inputStyle,
                                        backgroundColor:
                                            loadingRoles
                                                ? "#f9fafb"
                                                : "#ffffff",
                                        cursor: loadingRoles
                                            ? "not-allowed"
                                            : "pointer",
                                    }}
                                >
                                    <option value="">
                                        {loadingRoles
                                            ? "Loading roles..."
                                            : "Select Role"}
                                    </option>

                                    {roleOptions.map(
                                        (role) => (
                                            <option
                                                key={
                                                    role.code
                                                }
                                                value={
                                                    role.code
                                                }
                                            >
                                                {role.name}
                                            </option>
                                        )
                                    )}
                                </select>
                            </FormField>

                            {/* DESIGNATION */}
                            <FormField
                                label="Designation"
                                required
                            >
                                <input
                                    type="text"
                                    name="designation"
                                    value={
                                        formData.designation
                                    }
                                    onChange={handleChange}
                                    placeholder="Enter Designation"
                                    style={inputStyle}
                                />
                            </FormField>

                            {/* REPORTING MANAGER */}
                            <FormField label="Reporting Manager Code">
                                <input
                                    type="text"
                                    name="reporting_manager_code"
                                    value={
                                        formData.reporting_manager_code
                                    }
                                    onChange={handleChange}
                                    placeholder="Enter Employee Code"
                                    style={inputStyle}
                                />
                            </FormField>

                            {/* ACTIVE STATUS */}
                            <FormField
                                label="Active Status"
                                required
                            >
                                <div
                                    style={{
                                        minHeight: "40px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "28px",
                                    }}
                                >
                                    {/* ACTIVE */}
                                    <label
                                        style={{
                                            display: "inline-flex",
                                            alignItems:
                                                "center",
                                            gap: "7px",
                                            fontSize:
                                                "13px",
                                            color: "#374151",
                                            cursor: "pointer",
                                        }}
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
                                                    (
                                                        prev
                                                    ) => ({
                                                        ...prev,
                                                        active: true,
                                                    })
                                                )
                                            }
                                            style={{
                                                width:
                                                    "14px",
                                                height:
                                                    "14px",
                                                margin: 0,
                                                cursor:
                                                    "pointer",
                                            }}
                                        />

                                        <span>
                                            Active
                                        </span>
                                    </label>

                                    {/* INACTIVE */}
                                    <label
                                        style={{
                                            display: "inline-flex",
                                            alignItems:
                                                "center",
                                            gap: "7px",
                                            fontSize:
                                                "13px",
                                            color: "#374151",
                                            cursor: "pointer",
                                        }}
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
                                                    (
                                                        prev
                                                    ) => ({
                                                        ...prev,
                                                        active: false,
                                                    })
                                                )
                                            }
                                            style={{
                                                width:
                                                    "14px",
                                                height:
                                                    "14px",
                                                margin: 0,
                                                cursor:
                                                    "pointer",
                                            }}
                                        />

                                        <span>
                                            Inactive
                                        </span>
                                    </label>
                                </div>
                            </FormField>
                        </div>
                    </div>

                    {/* ==============================
                        FOOTER
                    =============================== */}
                    <div
                        style={{
                            flex: "0 0 auto",
                            minHeight: "62px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "10px",
                            padding: "12px 20px",
                            borderTop:
                                "1px solid #e5e7eb",
                            backgroundColor: "#f9fafb",
                            boxSizing: "border-box",
                        }}
                    >
                        {/* CANCEL */}
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                height: "34px",
                                padding: "0 16px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent:
                                    "center",
                                border:
                                    "1px solid #d1d5db",
                                borderRadius: "7px",
                                backgroundColor:
                                    "#ffffff",
                                color: "#374151",
                                fontSize: "12px",
                                fontWeight: 500,
                                cursor: "pointer",
                                boxSizing: "border-box",
                            }}
                        >
                            Cancel
                        </button>

                        {/* SAVE / UPDATE */}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={
                                saving ||
                                !isFormValid()
                            }
                            style={{
                                height: "34px",
                                minWidth: "110px",
                                padding: "0 18px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent:
                                    "center",
                                border: "none",
                                borderRadius: "7px",
                                backgroundColor:
                                    saving ||
                                        !isFormValid()
                                        ? "#9ca3af"
                                        : "#2563eb",
                                color: "#ffffff",
                                fontSize: "12px",
                                fontWeight: 500,
                                cursor:
                                    saving ||
                                        !isFormValid()
                                        ? "not-allowed"
                                        : "pointer",
                                boxSizing: "border-box",
                            }}
                        >
                            {saving
                                ? isEdit
                                    ? "Updating..."
                                    : "Saving..."
                                : isEdit
                                    ? "Update User"
                                    : "Save User"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

/* =====================================================
   FORM FIELD
===================================================== */

function FormField({
    label,
    required = false,
    children,
}) {
    return (
        <div
            style={{
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
            }}
        >
            <label
                style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "12px",
                    lineHeight: "16px",
                    fontWeight: 500,
                    color: "#374151",
                }}
            >
                {label}

                {required && (
                    <span
                        style={{
                            marginLeft: "3px",
                            color: "#dc2626",
                        }}
                    >
                        *
                    </span>
                )}
            </label>

            {children}
        </div>
    );
}

/* =====================================================
   INPUT STYLE
===================================================== */

const inputStyle = {
    width: "100%",
    height: "38px",
    display: "block",
    padding: "0 11px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "12px",
    lineHeight: "16px",
    outline: "none",
    boxSizing: "border-box",
};

