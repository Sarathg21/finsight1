
import { useState, useRef, useEffect } from "react";
import { Eye, Download, Upload, Shield } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmationModel from "../common/ConfirmationModel";
import PermissionTable from "./PermissionTable";
import AuditLog from "./AuditLog";
import {
  getRolePermissions,
  updateRolePermissions,
  updateRole,
} from "../../api/rolesApi";
import SaveFooter from "../common/SaveFooter";

export default function RoleDetailsPanel({ role }) {
  const [activeTab, setActiveTab] = useState("permissions");
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const [permissions, setPermissions] = useState([]);

  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);

  // Refs for PermissionTable Select All / Clear All
  const selectAllRef = useRef(null);
  const clearAllRef = useRef(null);

  const tabs = [
    {
      id: "permissions",
      label: "Module Permissions",
    },
  ];

  // --------------------------------
  // Fetch role permissions
  // --------------------------------

  useEffect(() => {
    if (!role?.role_code) return;

    const fetchPermissions = async () => {
      try {
        setLoading(true);

        const response = await getRolePermissions(role.role_code);

        console.log(
          "Role Permissions API:",
          response.data
        );

        setPermissions(response.data);
        setHasChanges(false);
      } catch (error) {
        console.error(
          "Failed to fetch role permissions:",
          error
        );

        toast.error(
          "Failed to load role permissions"
        );

        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [role?.role_code]);

  // --------------------------------
  // Set role details
  // --------------------------------

  useEffect(() => {
    if (!role) return;

    setRoleName(
      role.role_name || role.name || ""
    );

    setDescription(
      role.description || ""
    );

    setActive(
      Boolean(role.active)
    );
  }, [role]);

  // --------------------------------
  // Save role + permissions
  // --------------------------------

  const handleSave = async () => {
    if (!role?.role_code) return;

    try {
      setLoading(true);

      // --------------------------------
      // 1. Update Role
      // --------------------------------

      const rolePayload = {
        role_code: role.role_code,
        role_name: roleName,
        active,
        description,
      };

      console.log(
        "ROLE PAYLOAD:",
        rolePayload
      );

      await updateRole(
        role.role_code,
        rolePayload
      );

      console.log(
        "Role update successful"
      );

      // --------------------------------
      // 2. Update All Permissions
      // --------------------------------

      const permissionsPayload = {
        permissions: permissions.map(
          (permission) => ({
            module_code:
              permission.module_code,

            can_view:
              Boolean(permission.can_view),

            can_export:
              Boolean(permission.can_export),

            can_upload:
              Boolean(permission.can_upload),

            can_admin:
              Boolean(permission.can_admin),

            active:
              permission.active ?? true,
          })
        ),
      };

      console.log(
        "PERMISSIONS PAYLOAD:",
        JSON.stringify(
          permissionsPayload,
          null,
          2
        )
      );

      await updateRolePermissions(
        role.role_code,
        permissionsPayload
      );

      console.log(
        "Permission update successful"
      );

      // --------------------------------
      // 3. Success
      // --------------------------------

      toast.success(
        "Role and permissions saved successfully"
      );

      setHasChanges(false);

      // --------------------------------
      // 4. Re-fetch from backend
      // --------------------------------

      const response =
        await getRolePermissions(
          role.role_code
        );

      console.log(
        "PERMISSIONS AFTER SAVE:",
        response.data
      );

      setPermissions(
        response.data
      );
    } catch (error) {
      console.error(
        "Failed to save role:",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Backend response:",
        JSON.stringify(
          error.response?.data,
          null,
          2
        )
      );

      console.error(
        "Request sent:",
        error.config?.data
      );

      const detail =
        error.response?.data?.detail;

      let errorMessage =
        "Failed to save changes";

      if (Array.isArray(detail)) {
        errorMessage = detail
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }

            const location =
              Array.isArray(item.loc)
                ? item.loc.join(" → ")
                : "field";

            return `${location}: ${item.msg ||
              "Validation error"
              }`;
          })
          .join(", ");
      } else if (
        typeof detail === "string"
      ) {
        errorMessage = detail;
      }

      toast.error(
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Handle tab change
  // --------------------------------

  const handleTabChange = (tab) => {
    if (hasChanges) {
      setPendingTab(tab);
      setShowConfirm(true);
      return;
    }

    setActiveTab(tab);
  };

  // --------------------------------
  // No role selected
  // --------------------------------

  if (!role) {
    return (
      <div className="h-full flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
        <p className="text-sm text-gray-500">
          Select a role to view details
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        h-full
        flex
        flex-col
        rounded-xl
        border
        border-gray-200
        bg-white
        shadow-sm
      "
    >

      {/* Header */}

      <div className="border-b border-gray-100 px-3 py-1">
        <h2 className="text-[12px] font-semibold text-gray-900 leading-none">
          Role Details
        </h2>
      </div>

      {/* Form */}

      <div className="px-3 py-1 h-20 flex flex-col">
        <div
          className="
            grid
            grid-cols-1
            xl:grid-cols-3
            gap-1.5
            items-start
          "
        >

          {/* Role Name */}

          <div>
            <label
              className="
                mb-0.5
                block
                text-[10px]
                font-medium
                text-gray-600
                leading-none
              "
            >
              Role Name
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              value={roleName}
              onChange={(e) => {
                setRoleName(
                  e.target.value
                );

                setHasChanges(true);
              }}
              className="
                h-6
                w-full
                rounded
                border
                border-gray-300
                px-2
                text-[10px]
                leading-none
                outline-none
                focus:border-blue-500
                focus:ring-1
                focus:ring-blue-100
              "
            />
          </div>

          {/* Description */}

          <div>
            <label
              className="
                mb-0.5
                block
                text-[10px]
                font-medium
                text-gray-600
                leading-none
              "
            >
              Description
            </label>

            <textarea
              rows={2}
              value={description}
              onChange={(e) => {
                setDescription(
                  e.target.value
                );

                setHasChanges(true);
              }}
              className="
                h-10
                w-full
                resize-none
                rounded
                border
                border-gray-300
                px-2
                py-1
                text-[10px]
                leading-tight
                outline-none
                focus:border-blue-500
                focus:ring-1
                focus:ring-blue-100
              "
            />
          </div>

          {/* Right Side */}

          <div className="space-y-1">

            {/* Role Code */}

            <div>
              <label
                className="
                  mb-0.5
                  block
                  text-[10px]
                  font-medium
                  text-gray-600
                  leading-none
                "
              >
                Role Code
              </label>

              <input
                value={
                  role.role_code || ""
                }
                readOnly
                className="
                  h-6
                  w-full
                  rounded
                  border
                  border-gray-300
                  px-2
                  text-[10px]
                  leading-none
                  outline-none
                  focus:border-blue-500
                  focus:ring-1
                  focus:ring-blue-100
                "
              />
            </div>

            {/* Status */}

            <div>
              <label
                className="
                  mb-0.5
                  block
                  text-[10px]
                  font-medium
                  text-gray-600
                  leading-none
                "
              >
                Status
              </label>

              <select
                value={
                  active
                    ? "Active"
                    : "Inactive"
                }
                onChange={(e) => {
                  setActive(
                    e.target.value ===
                    "Active"
                  );

                  setHasChanges(true);
                }}
                className="
                  h-6
                  w-full
                  rounded
                  border
                  border-gray-300
                  px-2
                  text-[10px]
                "
              >
                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* Tabs */}

      <div className="border-b border-gray-200">
        <div className="flex">

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                handleTabChange(
                  tab.id
                )
              }
              className={`
                h-7
                px-3
                text-[10px]
                font-medium
                transition-colors
                ${activeTab ===
                  tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
                }
              `}
            >
              {tab.label}
            </button>
          ))}

        </div>
      </div>

      {/* Permissions */}

      {activeTab === "permissions" && (
        <div className="px-3 py-1">

          {/* Toolbar */}

          <div className="mb-1 flex items-center justify-between">

            <p className="text-[9px] text-gray-500">
              Set permissions for modules
              and features
            </p>

            <div className="flex flex-wrap items-center gap-2">

              {/* Select All */}

              <button
                type="button"
                onClick={() =>
                  selectAllRef.current?.()
                }
                className="
                  rounded
                  border
                  border-gray-300
                  px-2
                  py-0.5
                  text-[9px]
                  hover:bg-gray-100
                "
              >
                Select All
              </button>

              {/* Clear All */}

              <button
                type="button"
                onClick={() =>
                  clearAllRef.current?.()
                }
                className="
                  rounded
                  border
                  border-gray-300
                  px-2
                  py-0.5
                  text-[9px]
                  hover:bg-gray-100
                "
              >
                Clear All
              </button>

              {/* View */}

              <span className="flex items-center gap-1 text-[9px] text-gray-600">
                <Eye className="h-2.5 w-2.5 text-blue-600" />
                View
              </span>

              {/* Export */}

              <span className="flex items-center gap-1 text-[9px] text-gray-600">
                <Download className="h-2.5 w-2.5 text-green-600" />
                Export
              </span>

              {/* Upload */}

              <span className="flex items-center gap-1 text-[9px] text-gray-600">
                <Upload className="h-2.5 w-2.5 text-orange-500" />
                Upload
              </span>

              {/* Admin */}

              <span className="flex items-center gap-1 text-[9px] text-gray-600">
                <Shield className="h-2.5 w-2.5 text-purple-600" />
                Admin
              </span>

            </div>
          </div>

          {/* Permission Table */}

          {loading ? (
            <div className="p-5 text-center text-xs text-gray-400">
              Loading permissions...
            </div>
          ) : (
            <PermissionTable
              permissions={
                permissions
              }
              setPermissions={
                setPermissions
              }
              onSelectAll={
                selectAllRef
              }
              onClearAll={
                clearAllRef
              }
              setDirty={
                setHasChanges
              }
            />
          )}

          {/* Permissions Footer */}

          <div
            className="
              flex
              items-center
              justify-between
              border-t
              border-gray-100
              bg-white
              px-2
              py-0.5
            "
          >

            {/* Left */}

            <p className="text-[8px] leading-none text-gray-500">
              <span className="text-blue-600">
                Note:
              </span>{" "}
              Admin permission includes all
              other permissions.
            </p>

            {/* Right */}

            <div className="flex items-center gap-1">

              <SaveFooter
                buttonText="Save Changes"
                onSave={handleSave}
              />

            </div>
          </div>

        </div>
      )}

      {/* Audit Log */}

      {activeTab === "audit" && (
        <AuditLog />
      )}

      {/* Unsaved Changes Confirmation */}

      <ConfirmationModel
        open={showConfirm}
        title="Unsaved Changes"
        message="You have unsaved changes. Do you want to leave this tab?"
        confirmText="Discard Changes"
        cancelText="Stay Here"
        onCancel={() => {
          setShowConfirm(false);
        }}
        onConfirm={() => {
          setHasChanges(false);
          setActiveTab(
            pendingTab
          );
          setPendingTab(null);
          setShowConfirm(false);
        }}
      />

    </div>
  );
}
