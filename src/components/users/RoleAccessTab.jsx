// import { ShieldCheck, ChevronRight, } from "lucide-react";
// import PermissionTable from "../roles/PermissionTable";
// import { useState, useEffect } from "react";
// import { getRolePermissions } from "../../api/rolesApi";


// export default function RoleAccessTab({ user, access, loading, }) {
//     const [showPermission, setShowPermission] = useState(false);

//     const [permissions, setPermissions] = useState([]);
//     const [loadingPermissions, setLoadingPermissions] = useState(false);

//     const handleViewPermissions = async () => {
//         if (!user?.role) {
//             console.log("No role code found for selected user");
//             return;
//         }

//         try {
//             setLoadingPermissions(true);
//             setShowPermission(true);

//             console.log("Loading permissions for role:", user.role);

//             const response = await getRolePermissions(user.role);

//             console.log("Role Permissions API:", response.data);

//             const data = response.data?.data || response.data || [];

//             setPermissions(data);
//         } catch (error) {
//             console.error(
//                 "Failed to load permissions:",
//                 error.response?.data || error
//             );

//             setPermissions([]);
//         } finally {
//             setLoadingPermissions(false);
//         }
//     };

//     function getValues(data, key) {
//         const values = [
//             ...new Set(
//                 data
//                     .map(item => item[key])
//                     .filter(Boolean)
//             ),
//         ];

//         if (values.length === 0) {
//             return {
//                 display: "No Data Access Assigned",
//                 tooltip: "",
//             };
//         }

//         if (values.length <= 2) {
//             return {
//                 display: values.join(", "),
//                 tooltip: values.join(", "),
//             };
//         }

//         return {
//             display: `Multiple (${values.length})`,
//             tooltip: values.join(", "),
//         };
//     }

//     const legalGroup = getValues(access, "legal_group_name");
//     const legalEntity = getValues(access, "legal_entity_name");
//     const parentDivision = getValues(access, "parent_division_name");
//     const subdivision = getValues(access, "subdivision_name");
//     const businessUnit = getValues(access, "business_unit_name");
//     const analysisCode = getValues(access, "analysis_name");

//     if (loading) {
//         return (
//             <div className="p-4 text-sm text-gray-500">
//                 Loading access...
//             </div>
//         );
//     }

//     return (
//         <div
//             style={{
//                 maxHeight: "330px",
//                 overflowY: "auto",
//                 overflowX: "hidden",
//             }}
//             className="space-y-2 p-2 pr-3"
//         >

//             {/* ASSIGNED ROLE */}
//             <section
//                 className="
//                  rounded-lg
//                  border
//                  border-gray-200
//                  bg-white
//                  shadow-sm
//                "
//             >
//                 <SectionHeader title="Assigned Role" />

//                 <div
//                     className="
//                       grid
//                       grid-cols-2
//                       gap-x-4
//                       px-3
//                       py-2.5
//                     "
//                 >
//                     <InfoField
//                         label="Role Code"
//                         value={user.role || "-"}
//                     />

//                     <InfoField
//                         label="Status"
//                         value={
//                             <span
//                                 className={`
//                                   inline-flex
//                                   rounded-full
//                                   px-2
//                                   py-0.5
//                                   text-[9px]
//                                   font-medium
//                                   ${user.active
//                                         ? "bg-green-100 text-green-700"
//                                         : "bg-red-100 text-red-700"
//                                     }`}
//                             >
//                                 {user.active ? "Active" : "Inactive"}
//                             </span>
//                         }
//                     />
//                 </div>
//             </section>

//             {/* DATA ACCESS SCOPE */}
//             <section
//                 className="
//                     rounded-lg
//                     border
//                     border-gray-200
//                     bg-white
//                     shadow-sm
//                 "
//             >
//                 <SectionHeader title="Data Access Scope" />
//                 <div
//                     className="
//                         grid
//                         grid-cols-2
//                         gap-x-2
//                         gap-y-1
//                         px-2
//                         py-1.5
//                     "
//                 >

//                     <InfoField
//                         label="Legal Group"
//                         value={legalGroup.display}
//                         tooltip={legalGroup.tooltip}
//                     />

//                     <InfoField
//                         label="Legal Entity"
//                         value={legalEntity.display}
//                         tooltip={legalEntity.tooltip}
//                     />

//                     <InfoField
//                         label="Parent Division"
//                         value={parentDivision.display}
//                         tooltip={parentDivision.tooltip}
//                     />

//                     <InfoField
//                         label="Sub Division"
//                         value={subdivision.display}
//                         tooltip={subdivision.tooltip}
//                     />

//                     <InfoField
//                         label="Business Unit"
//                         value={businessUnit.display}
//                         tooltip={businessUnit.tooltip}
//                     />

//                     <InfoField
//                         label="Analysis Code"
//                         value={analysisCode.display}
//                         tooltip={analysisCode.tooltip}
//                     />
//                 </div>
//             </section>

//             {/* MODULE PERMISSIONS */}
//             <section
//                 className="
//                     rounded-lg
//                     border
//                     border-gray-200
//                     bg-white
//                     shadow-sm
//                 "
//             >
//                 <SectionHeader title="Module Permissions" />
//                 <div
//                     className="
//                         flex
//                         items-center
//                         justify-between
//                         px-2
//                         py-1.5
//                     "
//                 >
//                     <div
//                         className="
//                             flex
//                             items-center
//                             gap-1.5
//                         "
//                     >
//                         <div
//                             className="
//                                 flex
//                                 h-6
//                                 w-6
//                                 items-center
//                                 justify-center
//                                 rounded-full
//                                 bg-blue-50
//                             "
//                         >

//                             <ShieldCheck
//                                 size={12}
//                                 className="text-blue-600"
//                             />

//                         </div>

//                         <div>

//                             <div
//                                 className="
//                                     flex
//                                     items-center
//                                     gap-1
//                                 "
//                             >
//                                 <p className="text-[11px] font-semibold text-gray-800">
//                                     {permissions.length > 0
//                                         ? `${permissions.length} Modules Assigned`
//                                         : "View Assigned Modules"}
//                                 </p>
//                                 <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-medium text-blue-700">
//                                     Read Only
//                                 </span>
//                             </div>

//                             <p className="text-[9px] text-gray-500">
//                                 Assigned system access
//                             </p>
//                         </div>
//                     </div>

//                     <button
//                         className="flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-2 py-1
//                       text-[10px] font-medium text-blue-700"
//                         onClick={handleViewPermissions} > View
//                         <ChevronRight size={11} /> </button>

//                     {showPermission && (
//                         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

//                             <div className="w-212.5 rounded-lg bg-white p-4">

//                                 <div className="flex items-center justify-between">

//                                     <h3 className="font-semibold text-gray-800">
//                                         Module Permissions
//                                     </h3>

//                                     <button
//                                         onClick={() => setShowPermission(false)}
//                                         className="text-gray-500 hover:text-gray-800"
//                                     >
//                                         ✕
//                                     </button>

//                                 </div>

//                                 <div className="mt-3">
//                                     {loadingPermissions ? (
//                                         <div className="py-8 text-center text-xs text-gray-500">
//                                             Loading permissions...
//                                         </div>
//                                     ) : permissions.length === 0 ? (
//                                         <div className="py-8 text-center text-xs text-gray-500">
//                                             No permissions assigned.
//                                         </div>
//                                     ) : (
//                                         <PermissionTable
//                                             permissions={permissions}
//                                             setPermissions={setPermissions}
//                                             disabled={true}
//                                         />
//                                     )}
//                                 </div>

//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </section>
//         </div>
//     );
// }

// function SectionHeader({ title }) {
//     return (
//         <div
//             className="border-b border-gray-100 bg-gray-50 px-3 py-2" >
//             <h3 className="
//                     text-[12px]
//                     font-semibold
//                     text-gray-800
//                 " >
//                 {title}
//             </h3>
//         </div>
//     );
// }

// function InfoField({ label, value, tooltip, }) {
//     return (
//         <div className="min-w-0">
//             <p className="text-[10px] font-medium text-gray-500">
//                 {label}
//             </p>

//             <p
//                 className=" mt-1 text-[11px] font-semibold text-gray-800 wrap-break-word"
//                 title={
//                     tooltip ||
//                     (typeof value === "string" ? value : "")
//                 }
//             > {value}
//             </p>
//         </div>
//     );
// }

import { ShieldCheck, ChevronRight, X } from "lucide-react";
import PermissionTable from "../roles/PermissionTable";
import { useState } from "react";
import { getRolePermissions } from "../../api/rolesApi";

export default function RoleAccessTab({
    user,
    access,
    loading,
}) {
    const [showPermission, setShowPermission] = useState(false);

    const [permissions, setPermissions] = useState([]);
    const [loadingPermissions, setLoadingPermissions] = useState(false);

    const safeAccess = Array.isArray(access) ? access : [];

    const handleViewPermissions = async () => {
        if (!user?.role) {
            console.log("No role code found for selected user");
            return;
        }

        try {
            setLoadingPermissions(true);
            setShowPermission(true);

            console.log(
                "Loading permissions for role:",
                user.role
            );

            const response = await getRolePermissions(user.role);

            console.log(
                "Role Permissions API:",
                response.data
            );

            const data =
                response.data?.data ||
                response.data ||
                [];

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
                    .map((item) => item?.[key])
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

    const legalGroup = getValues(
        safeAccess,
        "legal_group_name"
    );

    const legalEntity = getValues(
        safeAccess,
        "legal_entity_name"
    );

    const parentDivision = getValues(
        safeAccess,
        "parent_division_name"
    );

    const subdivision = getValues(
        safeAccess,
        "subdivision_name"
    );

    const businessUnit = getValues(
        safeAccess,
        "business_unit_name"
    );

    const analysisCode = getValues(
        safeAccess,
        "analysis_name"
    );

    if (loading) {
        return (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    color: "#6b7280",
                    boxSizing: "border-box",
                }}
            >
                Loading access...
            </div>
        );
    }

    return (
        <>
            {/* MAIN CONTENT */}
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: "100%",
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "3px 6px 6px 3px",
                    boxSizing: "border-box",
                }}
            >
                {/* ASSIGNED ROLE */}
                <section
                    style={{
                        width: "100%",
                        marginBottom: "8px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        boxShadow:
                            "0 1px 2px rgba(0, 0, 0, 0.04)",
                        overflow: "hidden",
                        boxSizing: "border-box",
                    }}
                >
                    <SectionHeader title="Assigned Role" />

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "minmax(0, 1fr) minmax(0, 1fr)",
                            columnGap: "16px",
                            padding: "7px 10px",
                            alignItems: "center",
                            boxSizing: "border-box",
                        }}
                    >
                        <InfoField
                            label="Role Code"
                            value={user?.role || "-"}
                        />

                        <InfoField
                            label="Status"
                            value={
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minHeight: "17px",
                                        padding: "1px 7px",
                                        borderRadius: "999px",
                                        fontSize: "9px",
                                        lineHeight: "12px",
                                        fontWeight: 600,
                                        backgroundColor:
                                            user?.active
                                                ? "#dcfce7"
                                                : "#fee2e2",
                                        color:
                                            user?.active
                                                ? "#15803d"
                                                : "#b91c1c",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    {user?.active
                                        ? "Active"
                                        : "Inactive"}
                                </span>
                            }
                        />
                    </div>
                </section>

                {/* DATA ACCESS SCOPE */}
                <section
                    style={{
                        width: "100%",
                        marginBottom: "8px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        boxShadow:
                            "0 1px 2px rgba(0, 0, 0, 0.04)",
                        overflow: "hidden",
                        boxSizing: "border-box",
                    }}
                >
                    <SectionHeader title="Data Access Scope" />

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "minmax(0, 1fr) minmax(0, 1fr)",
                            columnGap: "16px",
                            rowGap: "7px",
                            padding: "6px 10px 8px",
                            boxSizing: "border-box",
                        }}
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
                    style={{
                        width: "100%",
                        marginBottom: "4px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        boxShadow:
                            "0 1px 2px rgba(0, 0, 0, 0.04)",
                        overflow: "hidden",
                        boxSizing: "border-box",
                    }}
                >
                    <SectionHeader title="Module Permissions" />

                    <div
                        style={{
                            minHeight: "52px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                            padding: "6px 10px",
                            boxSizing: "border-box",
                        }}
                    >
                        {/* LEFT SIDE */}
                        <div
                            style={{
                                minWidth: 0,
                                flex: "1 1 auto",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <div
                                style={{
                                    flex: "0 0 auto",
                                    width: "26px",
                                    height: "26px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "50%",
                                    backgroundColor: "#eff6ff",
                                }}
                            >
                                <ShieldCheck
                                    size={13}
                                    style={{
                                        color: "#2563eb",
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    minWidth: 0,
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        minWidth: 0,
                                    }}
                                >
                                    <p
                                        style={{
                                            margin: 0,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            fontSize: "11px",
                                            lineHeight: "14px",
                                            fontWeight: 600,
                                            color: "#1f2937",
                                        }}
                                    >
                                        {permissions.length > 0
                                            ? `${permissions.length} Modules Assigned`
                                            : "View Assigned Modules"}
                                    </p>

                                    <span
                                        style={{
                                            flex: "0 0 auto",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            padding: "1px 6px",
                                            borderRadius: "999px",
                                            fontSize: "8px",
                                            lineHeight: "11px",
                                            fontWeight: 600,
                                            backgroundColor: "#dbeafe",
                                            color: "#1d4ed8",
                                        }}
                                    >
                                        Read Only
                                    </span>
                                </div>

                                <p
                                    style={{
                                        margin: "1px 0 0",
                                        fontSize: "9px",
                                        lineHeight: "12px",
                                        color: "#6b7280",
                                    }}
                                >
                                    Assigned system access
                                </p>
                            </div>
                        </div>

                        {/* VIEW BUTTON */}
                        <button
                            type="button"
                            onClick={handleViewPermissions}
                            style={{
                                flex: "0 0 auto",
                                height: "26px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "3px",
                                padding: "0 8px",
                                border: "1px solid #bfdbfe",
                                borderRadius: "5px",
                                backgroundColor: "#eff6ff",
                                color: "#1d4ed8",
                                fontSize: "10px",
                                lineHeight: "14px",
                                fontWeight: 600,
                                cursor: "pointer",
                                boxSizing: "border-box",
                                whiteSpace: "nowrap",
                            }}
                        >
                            View
                            <ChevronRight size={11} />
                        </button>
                    </div>
                </section>
            </div>

            {/* PERMISSIONS MODAL */}
            {showPermission && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                        backgroundColor:
                            "rgba(0, 0, 0, 0.4)",
                        boxSizing: "border-box",
                    }}
                >
                    <div
                        style={{
                            width: "min(900px, 95vw)",
                            maxWidth: "900px",
                            maxHeight: "85vh",
                            display: "flex",
                            flexDirection: "column",
                            backgroundColor: "#ffffff",
                            borderRadius: "10px",
                            boxShadow:
                                "0 20px 40px rgba(0, 0, 0, 0.18)",
                            overflow: "hidden",
                        }}
                    >
                        {/* MODAL HEADER */}
                        <div
                            style={{
                                flex: "0 0 auto",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                minHeight: "46px",
                                padding: "0 14px",
                                borderBottom:
                                    "1px solid #e5e7eb",
                                boxSizing: "border-box",
                            }}
                        >
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: "14px",
                                    lineHeight: "20px",
                                    fontWeight: 600,
                                    color: "#1f2937",
                                }}
                            >
                                Module Permissions
                            </h3>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPermission(false)
                                }
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "none",
                                    borderRadius: "5px",
                                    background: "transparent",
                                    color: "#6b7280",
                                    cursor: "pointer",
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* MODAL CONTENT */}
                        <div
                            style={{
                                flex: "1 1 auto",
                                minHeight: 0,
                                overflowY: "auto",
                                overflowX: "hidden",
                                padding: "12px 14px 14px",
                                boxSizing: "border-box",
                            }}
                        >
                            {loadingPermissions ? (
                                <div
                                    style={{
                                        minHeight: "180px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px",
                                        color: "#6b7280",
                                    }}
                                >
                                    Loading permissions...
                                </div>
                            ) : permissions.length === 0 ? (
                                <div
                                    style={{
                                        minHeight: "180px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px",
                                        color: "#6b7280",
                                    }}
                                >
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
        </>
    );
}

/* ----------------------------------------
   SECTION HEADER
----------------------------------------- */

function SectionHeader({ title }) {
    return (
        <div
            style={{
                width: "100%",
                minHeight: "32px",
                display: "flex",
                alignItems: "center",
                padding: "0 10px",
                borderBottom: "1px solid #f3f4f6",
                backgroundColor: "#f9fafb",
                boxSizing: "border-box",
            }}
        >
            <h3
                style={{
                    margin: 0,
                    fontSize: "11px",
                    lineHeight: "15px",
                    fontWeight: 600,
                    color: "#1f2937",
                }}
            >
                {title}
            </h3>
        </div>
    );
}

/* ----------------------------------------
   INFO FIELD
----------------------------------------- */

function InfoField({
    label,
    value,
    tooltip,
}) {
    return (
        <div
            style={{
                minWidth: 0,
                width: "100%",
                overflow: "hidden",
                boxSizing: "border-box",
            }}
        >
            <p
                style={{
                    margin: 0,
                    fontSize: "9px",
                    lineHeight: "13px",
                    fontWeight: 500,
                    color: "#6b7280",
                }}
            >
                {label}
            </p>

            <p
                title={
                    tooltip ||
                    (typeof value === "string"
                        ? value
                        : "")
                }
                style={{
                    margin: "2px 0 0",
                    fontSize: "10px",
                    lineHeight: "14px",
                    fontWeight: 600,
                    color: "#1f2937",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                }}
            >
                {value || "-"}
            </p>
        </div>
    );
}