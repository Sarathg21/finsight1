

// import { useState, useRef, useEffect } from "react";
// import {
//   Eye,
//   Download,
//   Upload,
//   Shield,
// } from "lucide-react";
// import toast from "react-hot-toast";

// import ConfirmationModel from "../Common/ConfirmationModel";
// import PermissionTable from "./PermissionTable";
// import AuditLog from "./AuditLog";

// import {
//   getRolePermissions,
//   updateRolePermissions,
//   updateRole,
// } from "../../api/rolesApi";

// import SaveFooter from "../Common/SaveFooter";

// export default function RoleDetailsPanel({ role }) {
//   const [activeTab, setActiveTab] =
//     useState("permissions");

//   const [loading, setLoading] =
//     useState(false);

//   const [hasChanges, setHasChanges] =
//     useState(false);

//   const [showConfirm, setShowConfirm] =
//     useState(false);

//   const [pendingTab, setPendingTab] =
//     useState(null);

//   const [permissions, setPermissions] =
//     useState([]);

//   const [roleName, setRoleName] =
//     useState("");

//   const [description, setDescription] =
//     useState("");

//   const [active, setActive] =
//     useState(true);

//   /* =========================================================
//      REFS
//   ========================================================= */

//   const selectAllRef = useRef(null);
//   const clearAllRef = useRef(null);

//   /* =========================================================
//      TABS
//   ========================================================= */

//   const tabs = [
//     {
//       id: "permissions",
//       label: "Module Permissions",
//     },
//   ];

//   /* =========================================================
//      FETCH PERMISSIONS
//   ========================================================= */

//   useEffect(() => {
//     if (!role?.role_code) return;

//     const fetchPermissions = async () => {
//       try {
//         setLoading(true);

//         const response =
//           await getRolePermissions(
//             role.role_code
//           );

//         console.log(
//           "Role Permissions API:",
//           response.data
//         );

//         setPermissions(
//           response.data
//         );

//         setHasChanges(false);
//       } catch (error) {
//         console.error(
//           "Failed to fetch role permissions:",
//           error
//         );

//         toast.error(
//           "Failed to load role permissions"
//         );

//         setPermissions([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPermissions();
//   }, [role?.role_code]);

//   /* =========================================================
//      SET ROLE DETAILS
//   ========================================================= */

//   useEffect(() => {
//     if (!role) return;

//     setRoleName(
//       role.role_name ||
//       role.name ||
//       ""
//     );

//     setDescription(
//       role.description ||
//       ""
//     );

//     setActive(
//       Boolean(role.active)
//     );
//   }, [role]);

//   /* =========================================================
//      SAVE
//   ========================================================= */

//   const handleSave = async () => {
//     if (!role?.role_code) return;

//     try {
//       setLoading(true);

//       /* -----------------------------------------------
//          UPDATE ROLE
//       ------------------------------------------------ */

//       const rolePayload = {
//         role_code:
//           role.role_code,

//         role_name:
//           roleName,

//         active:
//           active,

//         description:
//           description,
//       };

//       await updateRole(
//         role.role_code,
//         rolePayload
//       );

//       /* -----------------------------------------------
//          UPDATE PERMISSIONS
//       ------------------------------------------------ */

//       const permissionsPayload = {
//         permissions:
//           permissions.map(
//             (permission) => ({
//               module_code:
//                 permission.module_code,

//               can_view:
//                 Boolean(
//                   permission.can_view
//                 ),

//               can_export:
//                 Boolean(
//                   permission.can_export
//                 ),

//               can_upload:
//                 Boolean(
//                   permission.can_upload
//                 ),

//               can_admin:
//                 Boolean(
//                   permission.can_admin
//                 ),

//               active:
//                 permission.active ??
//                 true,
//             })
//           ),
//       };

//       await updateRolePermissions(
//         role.role_code,
//         permissionsPayload
//       );

//       /* -----------------------------------------------
//          SUCCESS
//       ------------------------------------------------ */

//       toast.success(
//         "Role and permissions saved successfully"
//       );

//       setHasChanges(false);

//       /* -----------------------------------------------
//          RE-FETCH
//       ------------------------------------------------ */

//       const response =
//         await getRolePermissions(
//           role.role_code
//         );

//       setPermissions(
//         response.data
//       );
//     } catch (error) {
//       console.error(
//         "Failed to save role:",
//         error
//       );

//       console.error(
//         "Status:",
//         error.response?.status
//       );

//       console.error(
//         "Backend response:",
//         JSON.stringify(
//           error.response?.data,
//           null,
//           2
//         )
//       );

//       const detail =
//         error.response?.data?.detail;

//       let errorMessage =
//         "Failed to save changes";

//       if (Array.isArray(detail)) {
//         errorMessage =
//           detail
//             .map((item) => {
//               if (
//                 typeof item ===
//                 "string"
//               ) {
//                 return item;
//               }

//               const location =
//                 Array.isArray(
//                   item.loc
//                 )
//                   ? item.loc.join(
//                     " → "
//                   )
//                   : "field";

//               return `${location}: ${item.msg ||
//                 "Validation error"
//                 }`;
//             })
//             .join(", ");
//       } else if (
//         typeof detail ===
//         "string"
//       ) {
//         errorMessage = detail;
//       }

//       toast.error(
//         errorMessage
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* =========================================================
//      TAB CHANGE
//   ========================================================= */

//   const handleTabChange = (tab) => {
//     if (hasChanges) {
//       setPendingTab(tab);
//       setShowConfirm(true);
//       return;
//     }

//     setActiveTab(tab);
//   };

//   /* =========================================================
//      NO ROLE
//   ========================================================= */

//   if (!role) {
//     return (
//       <div
//         style={
//           styles.emptyContainer
//         }
//       >
//         <p
//           style={
//             styles.emptyText
//           }
//         >
//           Select a role to view details
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div style={styles.container}>

//       {/* =====================================================
//           HEADER
//       ===================================================== */}

//       <div style={styles.header}>
//         <h2 style={styles.headerTitle}>
//           Role Details
//         </h2>
//       </div>

//       {/* =====================================================
//           ROLE INFORMATION
//       ===================================================== */}

//       <div style={styles.formSection}>

//         <div style={styles.formGrid}>

//           {/* ROLE NAME */}

//           <div style={styles.formField}>
//             <label style={styles.label}>
//               Role Name
//               <span style={styles.required}>
//                 *
//               </span>
//             </label>

//             <input
//               value={roleName}
//               onChange={(e) => {
//                 setRoleName(
//                   e.target.value
//                 );

//                 setHasChanges(true);
//               }}
//               style={styles.input}
//             />
//           </div>

//           {/* DESCRIPTION */}

//           <div style={styles.formField}>
//             <label style={styles.label}>
//               Description
//             </label>

//             <textarea
//               rows={2}
//               value={description}
//               onChange={(e) => {
//                 setDescription(
//                   e.target.value
//                 );

//                 setHasChanges(true);
//               }}
//               style={styles.textarea}
//             />
//           </div>

//           {/* RIGHT SIDE */}

//           <div style={styles.rightFormColumn}>

//             {/* ROLE CODE */}

//             <div style={styles.smallField}>
//               <label style={styles.label}>
//                 Role Code
//               </label>

//               <input
//                 value={
//                   role.role_code ||
//                   ""
//                 }
//                 readOnly
//                 style={{
//                   ...styles.input,
//                   ...styles.readOnlyInput,
//                 }}
//               />
//             </div>

//             {/* STATUS */}

//             <div style={styles.smallField}>
//               <label style={styles.label}>
//                 Status
//               </label>

//               <select
//                 value={
//                   active
//                     ? "Active"
//                     : "Inactive"
//                 }
//                 onChange={(e) => {
//                   setActive(
//                     e.target.value ===
//                     "Active"
//                   );

//                   setHasChanges(
//                     true
//                   );
//                 }}
//                 style={
//                   styles.select
//                 }
//               >
//                 <option value="Active">
//                   Active
//                 </option>

//                 <option value="Inactive">
//                   Inactive
//                 </option>
//               </select>
//             </div>

//           </div>

//         </div>
//       </div>

//       {/* =====================================================
//           TABS
//       ===================================================== */}

//       <div style={styles.tabsContainer}>
//         <div style={styles.tabs}>

//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               type="button"
//               onClick={() =>
//                 handleTabChange(
//                   tab.id
//                 )
//               }
//               style={{
//                 ...styles.tabButton,

//                 ...(activeTab ===
//                   tab.id
//                   ? styles.activeTab
//                   : styles.inactiveTab),
//               }}
//             >
//               {tab.label}
//             </button>
//           ))}

//         </div>
//       </div>

//       {/* =====================================================
//           PERMISSIONS
//       ===================================================== */}

//       {activeTab ===
//         "permissions" && (
//           <div
//             style={
//               styles.permissionsSection
//             }
//           >

//             {/* TOOLBAR */}

//             <div
//               style={
//                 styles.permissionsToolbar
//               }
//             >

//               <p
//                 style={
//                   styles.permissionsHint
//                 }
//               >
//                 Set permissions for modules
//                 and features
//               </p>

//               <div
//                 style={
//                   styles.toolbarRight
//                 }
//               >

//                 {/* SELECT ALL */}

//                 <button
//                   type="button"
//                   onClick={() =>
//                     selectAllRef.current?.()
//                   }
//                   style={
//                     styles.toolbarButton
//                   }
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.backgroundColor =
//                       "#F8FAFC";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.backgroundColor =
//                       "#FFFFFF";
//                   }}
//                 >
//                   Select All
//                 </button>

//                 {/* CLEAR ALL */}

//                 <button
//                   type="button"
//                   onClick={() =>
//                     clearAllRef.current?.()
//                   }
//                   style={
//                     styles.toolbarButton
//                   }
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.backgroundColor =
//                       "#F8FAFC";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.backgroundColor =
//                       "#FFFFFF";
//                   }}
//                 >
//                   Clear All
//                 </button>

//                 {/* VIEW */}

//                 <span
//                   style={
//                     styles.permissionLegend
//                   }
//                 >
//                   <Eye
//                     size={11}
//                     strokeWidth={2}
//                     color="#2563EB"
//                   />
//                   View
//                 </span>

//                 {/* EXPORT */}

//                 <span
//                   style={
//                     styles.permissionLegend
//                   }
//                 >
//                   <Download
//                     size={11}
//                     strokeWidth={2}
//                     color="#16A34A"
//                   />
//                   Export
//                 </span>

//                 {/* UPLOAD */}

//                 <span
//                   style={
//                     styles.permissionLegend
//                   }
//                 >
//                   <Upload
//                     size={11}
//                     strokeWidth={2}
//                     color="#F97316"
//                   />
//                   Upload
//                 </span>

//                 {/* ADMIN */}

//                 <span
//                   style={
//                     styles.permissionLegend
//                   }
//                 >
//                   <Shield
//                     size={11}
//                     strokeWidth={2}
//                     color="#9333EA"
//                   />
//                   Admin
//                 </span>

//               </div>
//             </div>

//             {/* PERMISSION TABLE */}

//             <div
//               style={
//                 styles.permissionTableWrapper
//               }
//             >
//               {loading ? (
//                 <div
//                   style={
//                     styles.loadingContainer
//                   }
//                 >
//                   Loading permissions...
//                 </div>
//               ) : (
//                 <PermissionTable
//                   permissions={
//                     permissions
//                   }
//                   setPermissions={
//                     setPermissions
//                   }
//                   onSelectAll={
//                     selectAllRef
//                   }
//                   onClearAll={
//                     clearAllRef
//                   }
//                   setDirty={
//                     setHasChanges
//                   }
//                 />
//               )}
//             </div>

//             {/* =================================================
//               PERMISSION FOOTER
//           ================================================= */}

//             <div
//               style={
//                 styles.permissionFooter
//               }
//             >

//               <p
//                 style={
//                   styles.noteText
//                 }
//               >
//                 <span
//                   style={
//                     styles.noteLabel
//                   }
//                 >
//                   Note:
//                 </span>{" "}
//                 Admin permission includes all
//                 other permissions.
//               </p>

//               <div
//                 style={
//                   styles.saveContainer
//                 }
//               >
//                 <SaveFooter
//                   buttonText="Save Changes"
//                   onSave={handleSave}
//                 />
//               </div>

//             </div>

//           </div>
//         )}

//       {/* =====================================================
//           AUDIT LOG
//       ===================================================== */}

//       {activeTab === "audit" && (
//         <AuditLog />
//       )}

//       {/* =====================================================
//           CONFIRMATION
//       ===================================================== */}

//       <ConfirmationModel
//         open={showConfirm}
//         title="Unsaved Changes"
//         message="You have unsaved changes. Do you want to leave this tab?"
//         confirmText="Discard Changes"
//         cancelText="Stay Here"
//         onCancel={() => {
//           setShowConfirm(false);
//         }}
//         onConfirm={() => {
//           setHasChanges(false);

//           setActiveTab(
//             pendingTab
//           );

//           setPendingTab(null);

//           setShowConfirm(false);
//         }}
//       />

//     </div>
//   );
// }

// /* =========================================================
//    INLINE STYLES
// ========================================================= */

// const styles = {

//   /* =======================================================
//      MAIN CARD
//   ======================================================= */

//   container: {
//     width: "100%",
//     height: "100%",

//     minWidth: 0,
//     minHeight: 0,

//     display: "flex",
//     flexDirection: "column",

//     backgroundColor: "#FFFFFF",

//     border:
//       "1px solid #E2E8F0",

//     borderRadius: "10px",

//     boxShadow:
//       "0 1px 3px rgba(15, 23, 42, 0.08)",

//     overflow: "hidden",

//     boxSizing: "border-box",
//   },

//   /* =======================================================
//      EMPTY
//   ======================================================= */

//   emptyContainer: {
//     width: "100%",
//     height: "100%",

//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",

//     backgroundColor: "#FFFFFF",

//     border:
//       "1px solid #E2E8F0",

//     borderRadius: "10px",

//     boxShadow:
//       "0 1px 3px rgba(15, 23, 42, 0.08)",

//     boxSizing: "border-box",
//   },

//   emptyText: {
//     margin: 0,

//     color: "#64748B",

//     fontSize: "11px",

//     lineHeight: "16px",
//   },

//   /* =======================================================
//      HEADER
//   ======================================================= */

//   header: {
//     height: "28px",

//     minHeight: "28px",

//     display: "flex",
//     alignItems: "center",

//     padding:
//       "0 11px",

//     borderBottom:
//       "1px solid #E5E7EB",

//     backgroundColor: "#FFFFFF",

//     flexShrink: 0,

//     boxSizing: "border-box",
//   },

//   headerTitle: {
//     margin: 0,

//     color: "#111827",

//     fontSize: "12px",

//     lineHeight: "16px",

//     fontWeight: 600,
//   },

//   /* =======================================================
//      FORM SECTION
//   ======================================================= */

//   formSection: {
//     height: "76px",

//     minHeight: "76px",

//     padding:
//       "6px 11px 5px 11px",

//     boxSizing: "border-box",

//     flexShrink: 0,
//   },

//   formGrid: {
//     width: "100%",

//     height: "100%",

//     display: "grid",

//     gridTemplateColumns:
//       "1fr 1.1fr 0.92fr",

//     columnGap: "7px",

//     alignItems: "start",

//     boxSizing: "border-box",
//   },

//   formField: {
//     width: "100%",

//     minWidth: 0,

//     display: "flex",

//     flexDirection: "column",
//   },

//   smallField: {
//     width: "100%",

//     minWidth: 0,

//     display: "flex",

//     flexDirection: "column",
//   },

//   rightFormColumn: {
//     width: "100%",

//     display: "flex",

//     flexDirection: "column",

//     gap: "5px",

//     minWidth: 0,
//   },

//   /* =======================================================
//      LABEL
//   ======================================================= */

//   label: {
//     marginBottom: "3px",

//     color: "#475569",

//     fontSize: "9px",

//     lineHeight: "11px",

//     fontWeight: 500,

//     whiteSpace: "nowrap",
//   },

//   required: {
//     marginLeft: "3px",

//     color: "#DC2626",
//   },

//   /* =======================================================
//      INPUT
//   ======================================================= */

//   input: {
//     width: "100%",

//     height: "26px",

//     padding:
//       "0 7px",

//     border:
//       "1px solid #CBD5E1",

//     borderRadius: "4px",

//     backgroundColor: "#FFFFFF",

//     color: "#1F2937",

//     fontSize: "9px",

//     lineHeight: "26px",

//     outline: "none",

//     boxSizing: "border-box",
//   },

//   readOnlyInput: {
//     backgroundColor: "#FFFFFF",

//     color: "#334155",
//   },

//   /* =======================================================
//      TEXTAREA
//   ======================================================= */

//   textarea: {
//     width: "100%",

//     height: "42px",

//     minHeight: "42px",

//     resize: "none",

//     padding:
//       "5px 7px",

//     border:
//       "1px solid #CBD5E1",

//     borderRadius: "4px",

//     backgroundColor: "#FFFFFF",

//     color: "#1F2937",

//     fontSize: "9px",

//     lineHeight: "13px",

//     outline: "none",

//     boxSizing: "border-box",
//   },

//   /* =======================================================
//      SELECT
//   ======================================================= */

//   select: {
//     width: "100%",

//     height: "26px",

//     padding:
//       "0 7px",

//     border:
//       "1px solid #CBD5E1",

//     borderRadius: "4px",

//     backgroundColor: "#FFFFFF",

//     color: "#334155",

//     fontSize: "9px",

//     lineHeight: "26px",

//     outline: "none",

//     cursor: "pointer",

//     boxSizing: "border-box",
//   },

//   /* =======================================================
//      TABS
//   ======================================================= */

//   tabsContainer: {
//     width: "100%",

//     height: "30px",

//     minHeight: "30px",

//     borderBottom:
//       "1px solid #E2E8F0",

//     boxSizing: "border-box",

//     flexShrink: 0,
//   },

//   tabs: {
//     height: "100%",

//     display: "flex",

//     alignItems: "stretch",

//     paddingLeft: "1px",
//   },

//   tabButton: {
//     height: "30px",

//     padding:
//       "0 11px",

//     border: "none",

//     borderBottom:
//       "2px solid transparent",

//     backgroundColor:
//       "transparent",

//     fontSize: "9px",

//     lineHeight: "28px",

//     fontWeight: 500,

//     cursor: "pointer",

//     boxSizing: "border-box",
//   },

//   activeTab: {
//     color: "#2563EB",

//     borderBottomColor:
//       "#2563EB",
//   },

//   inactiveTab: {
//     color: "#64748B",

//     borderBottomColor:
//       "transparent",
//   },

//   /* =======================================================
//      PERMISSIONS SECTION
//   ======================================================= */

//   permissionsSection: {
//     width: "100%",

//     flex: 1,

//     minHeight: 0,

//     display: "flex",

//     flexDirection: "column",

//     padding:
//       "5px 10px 5px 10px",

//     boxSizing: "border-box",

//     overflow: "hidden",
//   },

//   /* =======================================================
//      TOOLBAR
//   ======================================================= */

//   permissionsToolbar: {
//     width: "100%",

//     minHeight: "25px",

//     height: "25px",

//     display: "flex",

//     alignItems: "center",

//     justifyContent:
//       "space-between",

//     gap: "8px",

//     flexShrink: 0,

//     boxSizing: "border-box",
//   },

//   permissionsHint: {
//     margin: 0,

//     padding: 0,

//     color: "#64748B",

//     fontSize: "8px",

//     lineHeight: "12px",

//     whiteSpace: "nowrap",
//   },

//   toolbarRight: {
//     display: "flex",

//     alignItems: "center",

//     justifyContent:
//       "flex-end",

//     gap: "9px",

//     flexShrink: 0,
//   },

//   toolbarButton: {
//     height: "22px",

//     padding:
//       "0 8px",

//     border:
//       "1px solid #CBD5E1",

//     borderRadius: "4px",

//     backgroundColor: "#FFFFFF",

//     color: "#475569",

//     fontSize: "8px",

//     lineHeight: "20px",

//     cursor: "pointer",

//     whiteSpace: "nowrap",

//     boxSizing: "border-box",
//   },

//   permissionLegend: {
//     display: "inline-flex",

//     alignItems: "center",

//     gap: "3px",

//     color: "#64748B",

//     fontSize: "8px",

//     lineHeight: "12px",

//     whiteSpace: "nowrap",
//   },

//   /* =======================================================
//      PERMISSION TABLE
//   ======================================================= */

//   permissionTableWrapper: {
//     width: "100%",

//     flex: 1,

//     minHeight: 0,

//     overflow: "auto",

//     boxSizing: "border-box",
//   },

//   loadingContainer: {
//     width: "100%",

//     padding: "25px 10px",

//     textAlign: "center",

//     color: "#94A3B8",

//     fontSize: "10px",

//     boxSizing: "border-box",
//   },

//   /* =======================================================
//      PERMISSION FOOTER
//   ======================================================= */

//   permissionFooter: {
//     width: "100%",

//     minHeight: "31px",

//     height: "31px",

//     display: "flex",

//     alignItems: "center",

//     justifyContent:
//       "space-between",

//     gap: "8px",

//     padding:
//       "3px 0 0 0",

//     borderTop:
//       "1px solid #E2E8F0",

//     backgroundColor: "#FFFFFF",

//     flexShrink: 0,

//     boxSizing: "border-box",
//   },

//   noteText: {
//     margin: 0,

//     padding: 0,

//     color: "#64748B",

//     fontSize: "8px",

//     lineHeight: "12px",

//     whiteSpace: "nowrap",
//   },

//   noteLabel: {
//     color: "#2563EB",
//   },

//   saveContainer: {
//     display: "flex",

//     alignItems: "center",

//     justifyContent:
//       "flex-end",

//     flexShrink: 0,
//   },
// };

import { useState, useRef, useEffect } from "react";
import {
  Eye,
  Download,
  Upload,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";

import ConfirmationModel from "../Common/ConfirmationModel";
import PermissionTable from "./PermissionTable";
import AuditLog from "./AuditLog";

import {
  getRolePermissions,
  updateRolePermissions,
  updateRole,
} from "../../api/rolesApi";

import SaveFooter from "../Common/SaveFooter";

export default function RoleDetailsPanel({ role }) {
  const [activeTab, setActiveTab] =
    useState("permissions");

  const [loading, setLoading] =
    useState(false);

  const [hasChanges, setHasChanges] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [pendingTab, setPendingTab] =
    useState(null);

  const [permissions, setPermissions] =
    useState([]);

  const [roleName, setRoleName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [active, setActive] =
    useState(true);

  /* =========================================================
     REFS
  ========================================================= */

  const selectAllRef = useRef(null);
  const clearAllRef = useRef(null);

  /* =========================================================
     TABS
  ========================================================= */

  const tabs = [
    {
      id: "permissions",
      label: "Module Permissions",
    },
  ];

  /* =========================================================
     FETCH PERMISSIONS
  ========================================================= */

  useEffect(() => {
    if (!role?.role_code) return;

    const fetchPermissions = async () => {
      try {
        setLoading(true);

        const response =
          await getRolePermissions(
            role.role_code
          );

        console.log(
          "Role Permissions API:",
          response.data
        );

        setPermissions(
          response.data
        );

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

  /* =========================================================
     SET ROLE DETAILS
  ========================================================= */

  useEffect(() => {
    if (!role) return;

    setRoleName(
      role.role_name ||
      role.name ||
      ""
    );

    setDescription(
      role.description ||
      ""
    );

    setActive(
      Boolean(role.active)
    );
  }, [role]);

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async () => {
    if (!role?.role_code) return;

    try {
      setLoading(true);

      /* -----------------------------------------------
         UPDATE ROLE
      ------------------------------------------------ */

      const rolePayload = {
        role_code:
          role.role_code,

        role_name:
          roleName,

        active:
          active,

        description:
          description,
      };

      await updateRole(
        role.role_code,
        rolePayload
      );

      /* -----------------------------------------------
         UPDATE PERMISSIONS
      ------------------------------------------------ */

      const permissionsPayload = {
        permissions:
          permissions.map(
            (permission) => ({
              module_code:
                permission.module_code,

              can_view:
                Boolean(
                  permission.can_view
                ),

              can_export:
                Boolean(
                  permission.can_export
                ),

              can_upload:
                Boolean(
                  permission.can_upload
                ),

              can_admin:
                Boolean(
                  permission.can_admin
                ),

              active:
                permission.active ??
                true,
            })
          ),
      };

      await updateRolePermissions(
        role.role_code,
        permissionsPayload
      );

      /* -----------------------------------------------
         SUCCESS
      ------------------------------------------------ */

      toast.success(
        "Role and permissions saved successfully"
      );

      setHasChanges(false);

      /* -----------------------------------------------
         RE-FETCH
      ------------------------------------------------ */

      const response =
        await getRolePermissions(
          role.role_code
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

      const detail =
        error.response?.data?.detail;

      let errorMessage =
        "Failed to save changes";

      if (Array.isArray(detail)) {
        errorMessage =
          detail
            .map((item) => {
              if (
                typeof item ===
                "string"
              ) {
                return item;
              }

              const location =
                Array.isArray(
                  item.loc
                )
                  ? item.loc.join(
                    " → "
                  )
                  : "field";

              return `${location}: ${item.msg ||
                "Validation error"
                }`;
            })
            .join(", ");
      } else if (
        typeof detail ===
        "string"
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

  /* =========================================================
     TAB CHANGE
  ========================================================= */

  const handleTabChange = (tab) => {
    if (hasChanges) {
      setPendingTab(tab);
      setShowConfirm(true);
      return;
    }

    setActiveTab(tab);
  };

  /* =========================================================
     NO ROLE
  ========================================================= */

  if (!role) {
    return (
      <div
        style={
          styles.emptyContainer
        }
      >
        <p
          style={
            styles.emptyText
          }
        >
          Select a role to view details
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={styles.header}>
        <h2 style={styles.headerTitle}>
          Role Details
        </h2>
      </div>

      {/* =====================================================
          ROLE INFORMATION
      ===================================================== */}

      <div style={styles.formSection}>

        <div style={styles.formGrid}>

          {/* ROLE NAME */}

          <div style={styles.formField}>
            <label style={styles.label}>
              Role Name
              <span style={styles.required}>
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
              style={styles.input}
            />
          </div>

          {/* DESCRIPTION */}

          <div style={styles.formField}>
            <label style={styles.label}>
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
              style={styles.textarea}
            />
          </div>

          {/* RIGHT SIDE */}

          <div style={styles.rightFormColumn}>

            {/* ROLE CODE */}

            <div style={styles.smallField}>
              <label style={styles.label}>
                Role Code
              </label>

              <input
                value={
                  role.role_code ||
                  ""
                }
                readOnly
                style={{
                  ...styles.input,
                  ...styles.readOnlyInput,
                }}
              />
            </div>

            {/* STATUS */}

            <div style={styles.smallField}>
              <label style={styles.label}>
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

                  setHasChanges(
                    true
                  );
                }}
                style={
                  styles.select
                }
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

      {/* =====================================================
          TABS
      ===================================================== */}

      <div style={styles.tabsContainer}>
        <div style={styles.tabs}>

          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                handleTabChange(
                  tab.id
                )
              }
              style={{
                ...styles.tabButton,

                ...(activeTab ===
                  tab.id
                  ? styles.activeTab
                  : styles.inactiveTab),
              }}
            >
              {tab.label}
            </button>
          ))}

        </div>
      </div>

      {/* =====================================================
          PERMISSIONS
      ===================================================== */}

      {activeTab ===
        "permissions" && (
          <div
            style={
              styles.permissionsSection
            }
          >

            {/* =================================================
              TOOLBAR
          ================================================= */}

            <div
              style={
                styles.permissionsToolbar
              }
            >

              <p
                style={
                  styles.permissionsHint
                }
              >
                Set permissions for modules
                and features
              </p>

              <div
                style={
                  styles.toolbarRight
                }
              >

                {/* SELECT ALL */}

                <button
                  type="button"
                  onClick={() =>
                    selectAllRef.current?.()
                  }
                  style={
                    styles.toolbarButton
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "#FFFFFF";
                  }}
                >
                  Select All
                </button>

                {/* CLEAR ALL */}

                <button
                  type="button"
                  onClick={() =>
                    clearAllRef.current?.()
                  }
                  style={
                    styles.toolbarButton
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "#FFFFFF";
                  }}
                >
                  Clear All
                </button>

                {/* VIEW */}

                <span
                  style={
                    styles.permissionLegend
                  }
                >
                  <Eye
                    size={11}
                    strokeWidth={2}
                    color="#2563EB"
                  />
                  View
                </span>

                {/* EXPORT */}

                <span
                  style={
                    styles.permissionLegend
                  }
                >
                  <Download
                    size={11}
                    strokeWidth={2}
                    color="#16A34A"
                  />
                  Export
                </span>

                {/* UPLOAD */}

                <span
                  style={
                    styles.permissionLegend
                  }
                >
                  <Upload
                    size={11}
                    strokeWidth={2}
                    color="#F97316"
                  />
                  Upload
                </span>

                {/* ADMIN */}

                <span
                  style={
                    styles.permissionLegend
                  }
                >
                  <Shield
                    size={11}
                    strokeWidth={2}
                    color="#9333EA"
                  />
                  Admin
                </span>

              </div>
            </div>

            {/* =================================================
              PERMISSION TABLE
          ================================================= */}

            <div
              style={
                styles.permissionTableWrapper
              }
            >
              {loading ? (
                <div
                  style={
                    styles.loadingContainer
                  }
                >
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
            </div>

            {/* =================================================
              FOOTER - DIRECTLY BELOW TABLE
          ================================================= */}

            <div
              style={
                styles.permissionFooter
              }
            >

              <p
                style={
                  styles.noteText
                }
              >
                <span
                  style={
                    styles.noteLabel
                  }
                >
                  Note:
                </span>{" "}
                Admin permission includes all
                other permissions.
              </p>

              <div
                style={
                  styles.saveContainer
                }
              >
                <SaveFooter
                  buttonText="Save Changes"
                  onSave={handleSave}
                />
              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          AUDIT LOG
      ===================================================== */}

      {activeTab === "audit" && (
        <AuditLog />
      )}

      {/* =====================================================
          CONFIRMATION
      ===================================================== */}

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

/* =========================================================
   INLINE STYLES
========================================================= */

const styles = {

  /* =======================================================
     MAIN CARD
  ======================================================= */

  container: {
    width: "100%",
    height: "100%",

    minWidth: 0,
    minHeight: 0,

    display: "flex",
    flexDirection: "column",

    backgroundColor: "#FFFFFF",

    border:
      "1px solid #E2E8F0",

    borderRadius: "10px",

    boxShadow:
      "0 1px 3px rgba(15, 23, 42, 0.08)",

    overflow: "hidden",

    boxSizing: "border-box",
  },

  /* =======================================================
     EMPTY
  ======================================================= */

  emptyContainer: {
    width: "100%",
    height: "100%",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    border:
      "1px solid #E2E8F0",

    borderRadius: "10px",

    boxShadow:
      "0 1px 3px rgba(15, 23, 42, 0.08)",

    boxSizing: "border-box",
  },

  emptyText: {
    margin: 0,

    color: "#64748B",

    fontSize: "11px",

    lineHeight: "16px",
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    height: "28px",
    minHeight: "28px",

    display: "flex",
    alignItems: "center",

    padding:
      "0 11px",

    borderBottom:
      "1px solid #E5E7EB",

    backgroundColor: "#FFFFFF",

    flexShrink: 0,

    boxSizing: "border-box",
  },

  headerTitle: {
    margin: 0,

    color: "#111827",

    fontSize: "12px",

    lineHeight: "16px",

    fontWeight: 600,
  },

  /* =======================================================
     FORM SECTION
  ======================================================= */

  formSection: {
    height: "76px",
    minHeight: "76px",

    padding:
      "6px 11px 5px 11px",

    boxSizing: "border-box",

    flexShrink: 0,
  },

  formGrid: {
    width: "100%",
    height: "100%",

    display: "grid",

    gridTemplateColumns:
      "1fr 1.1fr 0.92fr",

    columnGap: "7px",

    alignItems: "start",

    boxSizing: "border-box",
  },

  formField: {
    width: "100%",
    minWidth: 0,

    display: "flex",
    flexDirection: "column",
  },

  smallField: {
    width: "100%",
    minWidth: 0,

    display: "flex",
    flexDirection: "column",
  },

  rightFormColumn: {
    width: "100%",

    display: "flex",
    flexDirection: "column",

    gap: "5px",

    minWidth: 0,
  },

  /* =======================================================
     LABEL
  ======================================================= */

  label: {
    marginBottom: "3px",

    color: "#475569",

    fontSize: "9px",

    lineHeight: "11px",

    fontWeight: 500,

    whiteSpace: "nowrap",
  },

  required: {
    marginLeft: "3px",

    color: "#DC2626",
  },

  /* =======================================================
     INPUT
  ======================================================= */

  input: {
    width: "100%",

    height: "26px",

    padding:
      "0 7px",

    border:
      "1px solid #CBD5E1",

    borderRadius: "4px",

    backgroundColor: "#FFFFFF",

    color: "#1F2937",

    fontSize: "9px",

    lineHeight: "26px",

    outline: "none",

    boxSizing: "border-box",
  },

  readOnlyInput: {
    backgroundColor: "#FFFFFF",

    color: "#334155",
  },

  /* =======================================================
     TEXTAREA
  ======================================================= */

  textarea: {
    width: "100%",

    height: "42px",

    minHeight: "42px",

    resize: "none",

    padding:
      "5px 7px",

    border:
      "1px solid #CBD5E1",

    borderRadius: "4px",

    backgroundColor: "#FFFFFF",

    color: "#1F2937",

    fontSize: "9px",

    lineHeight: "13px",

    outline: "none",

    boxSizing: "border-box",
  },

  /* =======================================================
     SELECT
  ======================================================= */

  select: {
    width: "100%",

    height: "26px",

    padding:
      "0 7px",

    border:
      "1px solid #CBD5E1",

    borderRadius: "4px",

    backgroundColor: "#FFFFFF",

    color: "#334155",

    fontSize: "9px",

    lineHeight: "26px",

    outline: "none",

    cursor: "pointer",

    boxSizing: "border-box",
  },

  /* =======================================================
     TABS
  ======================================================= */

  tabsContainer: {
    width: "100%",

    height: "30px",
    minHeight: "30px",

    borderBottom:
      "1px solid #E2E8F0",

    boxSizing: "border-box",

    flexShrink: 0,
  },

  tabs: {
    height: "100%",

    display: "flex",
    alignItems: "stretch",

    paddingLeft: "1px",
  },

  tabButton: {
    height: "30px",

    padding:
      "0 11px",

    border: "none",

    borderBottom:
      "2px solid transparent",

    backgroundColor:
      "transparent",

    fontSize: "9px",

    lineHeight: "28px",

    fontWeight: 500,

    cursor: "pointer",

    boxSizing: "border-box",
  },

  activeTab: {
    color: "#2563EB",

    borderBottomColor:
      "#2563EB",
  },

  inactiveTab: {
    color: "#64748B",

    borderBottomColor:
      "transparent",
  },

  /* =======================================================
     PERMISSIONS SECTION
  ======================================================= */

  permissionsSection: {
    width: "100%",

    flex: 1,

    minHeight: 0,

    display: "flex",
    flexDirection: "column",

    padding:
      "5px 10px 5px 10px",

    boxSizing: "border-box",

    overflow: "hidden",
  },

  /* =======================================================
     TOOLBAR
  ======================================================= */

  permissionsToolbar: {
    width: "100%",

    minHeight: "25px",
    height: "25px",

    display: "flex",
    alignItems: "center",

    justifyContent:
      "space-between",

    gap: "8px",

    flexShrink: 0,

    boxSizing: "border-box",
  },

  permissionsHint: {
    margin: 0,
    padding: 0,

    color: "#64748B",

    fontSize: "8px",

    lineHeight: "12px",

    whiteSpace: "nowrap",
  },

  toolbarRight: {
    display: "flex",

    alignItems: "center",

    justifyContent:
      "flex-end",

    gap: "9px",

    flexShrink: 0,
  },

  toolbarButton: {
    height: "22px",

    padding:
      "0 8px",

    border:
      "1px solid #CBD5E1",

    borderRadius: "4px",

    backgroundColor: "#FFFFFF",

    color: "#475569",

    fontSize: "8px",

    lineHeight: "20px",

    cursor: "pointer",

    whiteSpace: "nowrap",

    boxSizing: "border-box",
  },

  permissionLegend: {
    display: "inline-flex",

    alignItems: "center",

    gap: "3px",

    color: "#64748B",

    fontSize: "8px",

    lineHeight: "12px",

    whiteSpace: "nowrap",
  },

  /* =======================================================
     PERMISSION TABLE

     IMPORTANT:
     flex: "0 0 auto" makes the footer come immediately
     after the table instead of pushing it to the bottom.
  ======================================================= */

  permissionTableWrapper: {
    width: "100%",

    flex: "0 0 auto",

    minHeight: 0,

    maxHeight:
      "calc(100% - 61px)",

    overflowY: "auto",
    overflowX: "hidden",

    boxSizing: "border-box",
  },

  loadingContainer: {
    width: "100%",

    padding:
      "25px 10px",

    textAlign: "center",

    color: "#94A3B8",

    fontSize: "10px",

    boxSizing: "border-box",
  },

  /* =======================================================
     PERMISSION FOOTER

     Footer is now directly below the permission table.
  ======================================================= */

  permissionFooter: {
    width: "100%",

    minHeight: "31px",
    height: "31px",

    display: "flex",

    alignItems: "center",

    justifyContent:
      "space-between",

    gap: "8px",

    padding:
      "3px 0 0 0",

    marginTop: "2px",

    borderTop:
      "1px solid #E2E8F0",

    backgroundColor: "#FFFFFF",

    flexShrink: 0,

    boxSizing: "border-box",
  },

  noteText: {
    margin: 0,
    padding: 0,

    color: "#64748B",

    fontSize: "8px",

    lineHeight: "12px",

    whiteSpace: "nowrap",
  },

  noteLabel: {
    color: "#2563EB",
  },

  saveContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexShrink: 0,
    padding: "0 8px",
    transform: "scale(1.25)",
    transformOrigin: "right center",

    marginRight: "2px",
  },
};