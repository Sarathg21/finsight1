
import { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getRoles, addUser, updateUser, } from "../../api/userApi";
import toast, { Toaster } from "react-hot-toast";

export default function AddUserModal({
    open,
    onClose,
    onSuccess, editUser,
}) {
    const [formData, setFormData] = useState({
        employee_code: "",
        employee_name: "",
        official_email: "",
        designation: "",
        reporting_manager_code: "",
        role_code: "",
        active: true,
    });
    const isEdit = !!editUser;

    const [roleOptions, setRoleOptions] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [saving, setSaving] = useState(false);

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

    /*.....  Populate Form When Editing....*/
    useEffect(() => {
        if (!open) return;
        fetchRoles();
        if (editUser) {
            setFormData({
                employee_code: editUser.code,
                employee_name: editUser.name,
                official_email: editUser.email,
                designation: editUser.jobTitle,
                reporting_manager_code:
                    editUser.raw?.reporting_manager_code || "",
                role_code: editUser.role,
                active: editUser.status === "Active",
            });
        } else {
            setFormData({
                employee_code: "",
                employee_name: "",
                official_email: "",
                designation: "",
                reporting_manager_code: "",
                role_code: "",
                active: true,
            });

        }
    }, [open, editUser]);

    const validate = () => {
        const errors = [];

        if (!String(formData.employee_code ?? "").trim())
            errors.push("Employee Code is required");

        if (!String(formData.employee_name ?? "").trim())
            errors.push("Employee Name is required");

        if (!String(formData.official_email ?? "").trim()) {
            errors.push("Official Email is required");
        }
        else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.official_email
            )
        ) {
            errors.push("Enter a valid email address");
        }
        if (!String(formData.designation ?? "").trim()) {
            errors.push("Designation is required");

            if (!String(formData.role_code ?? "").trim()) {
                errors.push("Role is required");

                if (errors.length > 0) {
                    errors.forEach((message) => toast.error(message));
                    return false;
                }
                return true;
            };
        }
    }

            const isFormValid = () => {
                return (
                    String(formData.employee_code ?? "").trim() &&
                    String(formData.employee_name ?? "").trim() &&
                    String(formData.official_email ?? "").trim() &&
                    String(formData.designation ?? "").trim() &&
                    String(formData.role_code ?? "").trim()
                );
            };

            const handleChange = (e) => {
                const { name, value } = e.target;
                setFormData((prev) => ({
                    ...prev,
                    [name]: value,
                }));
            };


            const handleSave = async () => {
                console.log("SAVE BUTTON CLICKED");
                if (!validate()) return;

                const payload = {
                    employee_code: formData.employee_code,
                    employee_name: formData.employee_name,
                    official_email: formData.official_email,
                    designation: formData.designation,
                    reporting_manager_code: formData.reporting_manager_code || "",
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
                        toast.success("User created successfully")
                    }

                    if (!isEdit) {
                        setFormData({
                            employee_code: "",
                            employee_name: "",
                            official_email: "",
                            designation: "",
                            reporting_manager_code: "",
                            role_code: "",
                            active: true,
                        });
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
                }
            }
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
                            initial={{ opacity: 0, scale: 0.96, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 20 }}
                            transition={{ duration: 0.25 }}
                            className="w-full max-w-5xl rounded-xl bg-white shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                        <UserPlus size={22} />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {isEdit ? "Edit User" : "Add User"}
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            {isEdit ? "Update user information" : "Create a new application user"}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="rounded-lg p-2 hover:bg-gray-100 transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                    {/* Employee Code */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Employee Code <span className="text-red-600">*</span>
                                        </label>

                                        <input
                                            type="text"
                                            name="employee_code"
                                            value={formData.employee_code}
                                            onChange={handleChange}
                                            placeholder="Enter Employee Code"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    {/* Employee Name */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Employee Name <span className="text-red-600">*</span>
                                        </label>

                                        <input
                                            type="text"
                                            name="employee_name"
                                            value={formData.employee_name}
                                            onChange={handleChange}
                                            placeholder="Enter Employee Name"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Official Email <span className="text-red-600">*</span>
                                        </label>

                                        <input
                                            type="email"
                                            name="official_email"
                                            value={formData.official_email}
                                            onChange={handleChange}
                                            placeholder="Enter Official Email"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Role <span className="text-red-600">*</span>
                                        </label>
                                        <select
                                            name="role_code"
                                            value={formData.role_code}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                                        >
                                            <option value="">
                                                Select Role
                                            </option>

                                            {roleOptions.map((role) => (
                                                <option
                                                    key={role.code}
                                                    value={role.code}
                                                >
                                                    {role.name}
                                                </option>
                                            ))}

                                        </select>
                                    </div>


                                    {/* Designation */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Designation <span className="text-red-600">*</span>
                                        </label>

                                        <input
                                            type="text"
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            placeholder="Enter Designation"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>


                                    {/* Reporting Manager */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Reporting Manager Code
                                        </label>

                                        <input
                                            type="text"
                                            name="reporting_manager_code"
                                            value={formData.reporting_manager_code}
                                            onChange={handleChange}
                                            placeholder="Enter Employee Code"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                                 focus:ring-2 focus:ring-blue-500 outline-none"/>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Active Status <span className="text-red-600">*</span>
                                        </label>

                                        <div className="flex items-center gap-8 h-10.5">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    checked={formData.active === true}
                                                    onChange={() => setFormData({
                                                        ...formData,
                                                        active: true
                                                    })}
                                                />

                                                <span className="text-sm">
                                                    Active
                                                </span>
                                            </label>

                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    checked={formData.active === false}
                                                    onChange={() => setFormData({
                                                        ...formData,
                                                        active: false
                                                    })}
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

                                <button onClick={handleSave} disabled={saving || !isFormValid()}
                                    className=" rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white
                                hover:bg-blue-700 disabled:bg-gray-400">
                                    {saving ? (isEdit ? "Updating..." : "Saving...") : (isEdit ? "Update User" : "Save User")
                                    }
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            );
        }