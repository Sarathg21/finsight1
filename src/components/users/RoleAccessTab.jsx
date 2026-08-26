import { ShieldCheck, ChevronRight, } from "lucide-react";
import PermissionTable from "../roles/PermissionTable";
import { useState, useEffect } from "react";
import { getRolePermissions } from "../../api/rolesApi";


export default function RoleAccessTab({ user, access, loading, }) {
    const [showPermission, setShowPermission] = useState(false);

    const [permissions, setPermissions] = useState([]);
    const [loadingPermissions, setLoadingPermissions] = useState(false);

    const handleViewPermissions = async () => {
        if (!user?.role) {
            console.log("No role code found for selected user");
            return;
        }

        try {
            setLoadingPermissions(true);
            setShowPermission(true);

            console.log("Loading permissions for role:", user.role);

            const response = await getRolePermissions(user.role);

            console.log("Role Permissions API:", response.data);

            const data = response.data?.data || response.data || [];

            setPermissions(data);
        } catch (error) {
            console.error(
                "Failed to load permissions:",
                error.response?.data || error
            );

            setPermissions([]);
        } finally {
            setLoadingPermissions(false);
        }
    };

    function getValues(data, key) {
        const values = [
            ...new Set(
                data
                    .map(item => item[key])
                    .filter(Boolean)
            ),
        ];

        if (values.length === 0) {
            return {
                display: "No Data Access Assigned",
                tooltip: "",
            };
        }

        if (values.length <= 2) {
            return {
                display: values.join(", "),
                tooltip: values.join(", "),
            };
        }

        return {
            display: `Multiple (${values.length})`,
            tooltip: values.join(", "),
        };
    }

    const legalGroup = getValues(access, "legal_group_name");
    const legalEntity = getValues(access, "legal_entity_name");
    const parentDivision = getValues(access, "parent_division_name");
    const subdivision = getValues(access, "subdivision_name");
    const businessUnit = getValues(access, "business_unit_name");
    const analysisCode = getValues(access, "analysis_name");

    if (loading) {
        return (
            <div className="p-4 text-sm text-gray-500">
                Loading access...
            </div>
        );
    }

    return (
        <div
            style={{
                maxHeight: "330px",
                overflowY: "auto",
                overflowX: "hidden",
            }}
            className="space-y-2 p-2 pr-3"
        >

            {/* ASSIGNED ROLE */}
            <section
                className="
                 rounded-lg
                 border
                 border-gray-200
                 bg-white
                 shadow-sm
               "
            >
                <SectionHeader title="Assigned Role" />

                <div
                    className="
                      grid
                      grid-cols-2
                      gap-x-4
                      px-3
                      py-2.5
                    "
                >
                    <InfoField
                        label="Role Code"
                        value={user.role || "-"}
                    />

                    <InfoField
                        label="Status"
                        value={
                            <span
                                className={`
                                  inline-flex
                                  rounded-full
                                  px-2
                                  py-0.5
                                  text-[9px]
                                  font-medium
                                  ${user.active
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {user.active ? "Active" : "Inactive"}
                            </span>
                        }
                    />
                </div>
            </section>

            {/* DATA ACCESS SCOPE */}
            <section
                className="
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    shadow-sm
                "
            >
                <SectionHeader title="Data Access Scope" />
                <div
                    className="
                        grid
                        grid-cols-2
                        gap-x-2
                        gap-y-1
                        px-2
                        py-1.5
                    "
                >

                    <InfoField
                        label="Legal Group"
                        value={legalGroup.display}
                        tooltip={legalGroup.tooltip}
                    />

                    <InfoField
                        label="Legal Entity"
                        value={legalEntity.display}
                        tooltip={legalEntity.tooltip}
                    />

                    <InfoField
                        label="Parent Division"
                        value={parentDivision.display}
                        tooltip={parentDivision.tooltip}
                    />

                    <InfoField
                        label="Sub Division"
                        value={subdivision.display}
                        tooltip={subdivision.tooltip}
                    />

                    <InfoField
                        label="Business Unit"
                        value={businessUnit.display}
                        tooltip={businessUnit.tooltip}
                    />

                    <InfoField
                        label="Analysis Code"
                        value={analysisCode.display}
                        tooltip={analysisCode.tooltip}
                    />
                </div>
            </section>

            {/* MODULE PERMISSIONS */}
            <section
                className="
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    shadow-sm
                "
            >
                <SectionHeader title="Module Permissions" />
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        px-2
                        py-1.5
                    "
                >
                    <div
                        className="
                            flex
                            items-center
                            gap-1.5
                        "
                    >
                        <div
                            className="
                                flex
                                h-6
                                w-6
                                items-center
                                justify-center
                                rounded-full
                                bg-blue-50
                            "
                        >

                            <ShieldCheck
                                size={12}
                                className="text-blue-600"
                            />

                        </div>

                        <div>

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-1
                                "
                            >
                                <p className="text-[11px] font-semibold text-gray-800">
                                    {permissions.length > 0
                                        ? `${permissions.length} Modules Assigned`
                                        : "View Assigned Modules"}
                                </p>
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-medium text-blue-700">
                                    Read Only
                                </span>
                            </div>

                            <p className="text-[9px] text-gray-500">
                                Assigned system access
                            </p>
                        </div>
                    </div>

                    <button
                        className="flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-2 py-1
                      text-[10px] font-medium text-blue-700"
                        onClick={handleViewPermissions} > View
                        <ChevronRight size={11} /> </button>

                    {showPermission && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

                            <div className="w-212.5 rounded-lg bg-white p-4">

                                <div className="flex items-center justify-between">

                                    <h3 className="font-semibold text-gray-800">
                                        Module Permissions
                                    </h3>

                                    <button
                                        onClick={() => setShowPermission(false)}
                                        className="text-gray-500 hover:text-gray-800"
                                    >
                                        ✕
                                    </button>

                                </div>

                                <div className="mt-3">
                                    {loadingPermissions ? (
                                        <div className="py-8 text-center text-xs text-gray-500">
                                            Loading permissions...
                                        </div>
                                    ) : permissions.length === 0 ? (
                                        <div className="py-8 text-center text-xs text-gray-500">
                                            No permissions assigned.
                                        </div>
                                    ) : (
                                        <PermissionTable
                                            permissions={permissions}
                                            setPermissions={setPermissions}
                                            disabled={true}
                                        />
                                    )}
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function SectionHeader({ title }) {
    return (
        <div
            className="border-b border-gray-100 bg-gray-50 px-3 py-2" >
            <h3 className="
                    text-[12px]
                    font-semibold
                    text-gray-800
                " >
                {title}
            </h3>
        </div>
    );
}

function InfoField({ label, value, tooltip, }) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] font-medium text-gray-500">
                {label}
            </p>

            <p
                className=" mt-1 text-[11px] font-semibold text-gray-800 wrap-break-word"
                title={
                    tooltip ||
                    (typeof value === "string" ? value : "")
                }
            > {value}
            </p>
        </div>
    );
}