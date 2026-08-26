
import PermissionRow from "./PermissionRow";
import { useState, useEffect } from "react";
import { ChevronRight, Folder } from "lucide-react";

import { permissionModules } from "../../data/rolesData";
import { moduleIcons } from "./ModuleIcon";
import Checkbox from "../common/Checkbox";

export default function PermissionTable({
  onSelectAll,
  onClearAll,
  setDirty,
  permissions,
  setPermissions,
  disabled = false,
}) {

  const rows = permissions || permissionModules;

  /* ---------------- Toggle Single Permission ---------------- */

  const togglePermission = (
    moduleCode,
    permission,
    value
  ) => {
    setPermissions((prev) =>
      prev.map((item) =>
        item.module_code === moduleCode
          ? {
            ...item,
            [permission]: value,
          }
          : item
      )
    );

    setDirty?.(true);
  };

  /* ---------------- Select All ---------------- */

  const selectAllPermissions = () => {
    setPermissions((prev) =>
      prev.map((item) => ({
        ...item,
        can_view: true,
        can_export: true,
        can_upload: true,
        can_admin: true,
      }))
    );

    setDirty?.(true);
  };

  /* ---------------- Clear All ---------------- */

  const clearAllPermissions = () => {
    setPermissions((prev) =>
      prev.map((item) => ({
        ...item,
        can_view: false,
        can_export: false,
        can_upload: false,
        can_admin: false,
      }))
    );

    setDirty?.(true);
  };

  /* ---------------- Expose Select/Clear Actions ---------------- */

  useEffect(() => {
    if (onSelectAll) {
      onSelectAll.current = selectAllPermissions;
    }

    if (onClearAll) {
      onClearAll.current = clearAllPermissions;
    }
  }, [permissions, onSelectAll, onClearAll]);

  return (
    <div className="w-full overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full table-fixed border-collapse">

          {/* Header */}

          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="h-6.25">

              <th
                className="
                  w-[52%]
                  px-2
                  py-0
                  text-left
                  text-[8px]
                  font-semibold
                  uppercase
                  leading-none
                  text-gray-600
                "
              >
                Module / Feature
              </th>

              <th
                className="
                  w-[12%]
                  px-0.5
                  py-0
                  text-left
                  text-[8px]
                  font-semibold
                  uppercase
                  leading-none
                  text-gray-600
                "
              >
                View
              </th>

              <th
                className="
                  w-[12%]
                  px-0.5
                  py-0
                  text-left
                  text-[8px]
                  font-semibold
                  uppercase
                  leading-none
                  text-gray-600
                "
              >
                Export
              </th>

              <th
                className="
                  w-[12%]
                  px-0.5
                  py-0
                  text-left
                  text-[8px]
                  font-semibold
                  uppercase
                  leading-none
                  text-gray-600
                "
              >
                Upload
              </th>

              <th
                className="
                  w-[12%]
                  px-0.5
                  py-0
                  text-left
                  text-[8px]
                  font-semibold
                  uppercase
                  leading-none
                  text-gray-600
                "
              >
                Admin
              </th>

            </tr>
          </thead>

          {/* Body */}

          <tbody>
            {rows?.map((item) => {
              const Icon =
                moduleIcons[item.module_code] ||
                Folder;

              return (
                <tr
                  key={item.module_code}
                  className="
                    h-[24.5px]
                    border-t
                    border-gray-100
                    hover:bg-gray-50
                    transition-colors
                  "
                >

                  {/* Module */}

                  <td className="px-2 py-0 align-middle">
                    <div className="flex items-center gap-1">

                      <ChevronRight
                        size={8}
                        className="text-gray-500"
                      />

                      <Icon
                        size={10}
                        className="text-blue-600"
                      />

                      <span
                        className="
                          truncate
                          text-[8px]
                          font-medium
                          text-gray-700
                        "
                      >
                        {item.module_code}
                      </span>

                    </div>
                  </td>

                  {/* View */}

                  <td className="text-center">
                    <Checkbox
                      checked={item.can_view === true}
                      color="blue"
                      disabled={disabled}
                      onChange={(value) =>
                        !disabled &&
                        togglePermission(
                          item.module_code,
                          "can_view",
                          value
                        )
                      }
                      className="
                        h-3
                        w-3
                        accent-blue-600
                      "
                    />
                  </td>

                  {/* Export */}

                  <td className="text-center">
                    <Checkbox
                      checked={item.can_export === true}
                      color="green"
                      disabled={disabled}
                      onChange={(value) =>
                        !disabled &&
                        togglePermission(
                          item.module_code,
                          "can_export",
                          value
                        )
                      }

                      className="
                    h-3
                    w-3
                    accent-green-600
                    "
                    />
                  </td>

                  {/* Upload */}

                  <td className="text-center">
                    <Checkbox
                      checked={item.can_upload === true}
                      color="orange"
                      disabled={disabled}
                      onChange={(value) =>
                        !disabled &&
                        togglePermission(
                          item.module_code,
                          "can_upload",
                          value
                        )
                      }
                      className=" h-3 w-3 accent-orange-500"
                    />

                  </td>

                  {/* Admin */}

                  <td className="text-center">
                    <Checkbox
                      checked={item.can_admin === true}
                      color="purple"
                      disabled={disabled}
                      onChange={(value) =>
                        !disabled &&
                        togglePermission(
                          item.module_code,
                          "can_admin",
                          value
                        )
                      }
                      className="h-3 w-3 accent-purple-600"
                    />
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
}
