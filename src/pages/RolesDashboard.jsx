
// import React, { useEffect, useState } from "react";
// import { UserPlus } from "lucide-react";
// import toast from "react-hot-toast";
// import PageSkeleton from "../components/Common/PageSkeleton";
// import PageHeader from "../components/Common/PageHeader";
// import StatCard from "../components/StatCard";
// import FilterBar from "../components/Common/FilterBar";
// import RolesTable from "../components/roles/RolesTable";
// import RoleDetailsPanel from "../components/roles/RoleDetailsPanel";
// import FooterNote from "../components/FooterNote";
// import AddRoleModal from "../components/roles/AddRoleModal";
// import ConfirmationModel from "../components/Common/ConfirmationModel";
// import { statuses } from "../data/dummyData";
// import { addRole, getRole, updateRole } from "../api/rolesApi"



// export default function RolesDashboard() {

//   const [search, setSearch] = useState("");
//   const [activeOnly, setActiveOnly] = useState(true);
//   const [status, setStatus] = useState("All");
//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedRole, setSelectedRole] = useState(null);

//   const [showRoleModal, setShowRoleModal] = useState(false);
//   const [editRole, setEditRole] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);


//   const [showConfirm, setShowConfirm] = useState(false);
//   const [confirmAction, setConfirmAction] = useState("");
//   const [selectedRoleAction, setSelectedRoleAction] = useState(null);



//   /*---load roles from database---*/
//   const fetchRoles = async () => {
//     try {
//       setLoading(true);
//       const response = await getRole();

//       const data = response.data.data || response.data;

//       console.log("Roles API:", data);

//       const formattedRoles = data.map((role) => ({
//         id: role.role_code,
//         role_code: role.role_code,
//         role_name: role.role_name,
//         name: role.role_name,
//         active: Boolean(role.active),
//         description: role.description || "",
//         users: role.user_count ?? 0,
//         type: role.active ? "Active" : "Inactive",
//       }));

//       // Remove duplicate roles
//       const uniqueRoles = Array.from(
//         new Map(
//           formattedRoles.map((role) => [
//             role.role_code,
//             role,
//           ])
//         ).values()
//       );

//       setRoles(uniqueRoles);

//       if (uniqueRoles.length > 0) {
//         setSelectedRole(uniqueRoles[0]);
//       } else {
//         setSelectedRole(null);
//       }

//     } catch (err) {
//       console.error("Roles API Error:", err);
//       toast.error("Failed to load roles");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredRoles = roles.filter((role) => {
//     const matchesSearch =
//       (role.name || "")
//         .toLowerCase()
//         .includes(search.toLowerCase());

//     const matchesStatus =
//       status === "All" ||
//       (role.active ? "Active" : "Inactive") === status;

//     const matchesActive =
//       status !== "All"
//         ? true
//         : !activeOnly || role.active;

//     return matchesSearch && matchesStatus && matchesActive;
//   });

//   const dashboardStats = [
//     {
//       title: "Total Roles",
//       value: roles.length,
//       change: `${roles.length} Roles`,
//       description: "All roles in system",
//     },
//     {
//       title: "Active Roles",
//       value: roles.filter((r) => r.active).length,
//       change: "Currently Active",
//       description: "Active Roles",
//     },
//     {
//       title: "Users Assigned",
//       value: roles.reduce(
//         (total, role) => total + (Number(role.users) || 0), 0),
//       change: "Currently Assigned",
//       description: "Users with Roles",
//     },
//   ];

//   const resetFilters = () => {
//     setSearch("");
//     setStatus("All");
//     setActiveOnly(true);
//   };

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };

//   const handlePrevious = () => {
//     if (currentPage > 1) {
//       setCurrentPage((p) => p - 1);
//     }
//   };

//   const handleNext = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage((p) => p + 1);
//     }
//   };

//   const handleFirst = () => {
//     setCurrentPage(1);
//   };

//   const handleLast = () => {
//     setCurrentPage(totalPages);
//   };

//   const pageSize = 7;
//   const total = filteredRoles.length;
//   const totalPages = Math.ceil(total / pageSize);
//   const startIndex = (currentPage - 1) * pageSize;
//   const currentRoles = filteredRoles.slice(
//     startIndex,
//     startIndex + pageSize
//   );
//   const startItem =
//     total === 0 ? 0 : startIndex + 1;
//   const endItem = Math.min(
//     currentPage * pageSize,
//     total
//   );

//   useEffect(() => {
//     fetchRoles();
//   }, []);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [search, status, activeOnly]);

//   const handleToggleStatus = (role) => {
//     setSelectedRoleAction(role);
//     setConfirmAction(role.active ? "deactivate" : "activate");
//     setShowConfirm(true);
//   };

//   const updateRoleStatus = async (role) => {
//     try {
//       const payload = {
//         role_code: role.role_code,
//         role_name: role.role_name || role.name,
//         active: !role.active,
//       };

//       await updateRole(role.role_code, payload);

//       toast.success(
//         role.active
//           ? "Role deactivated successfully"
//           : "Role activated successfully"
//       );

//       fetchRoles();
//     } catch (error) {
//       console.error(error);

//       if (error.response) {
//         toast.error(
//           error.response.data.detail || "Failed to update role status"
//         );
//       } else {
//         toast.error("Unable to connect to server");
//       }
//     }
//   };

//   const handleConfirm = async () => {
//     if (confirmAction === "edit") {
//       setEditRole(selectedRoleAction);
//       setShowRoleModal(true);
//     }

//     if (
//       confirmAction === "activate" ||
//       confirmAction === "deactivate"
//     ) {
//       await updateRoleStatus(selectedRoleAction);
//     }

//     setShowConfirm(false);
//     setSelectedRoleAction(null);
//     setConfirmAction("");
//   };

//   const handleCancel = () => {
//     setShowConfirm(false);
//     setSelectedRoleAction(null);
//     setConfirmAction("");
//   };

//   /* -------------------- LOADING -------------------- */

//   if (loading) {
//     return (
//       <div className="p-4">
//         <PageSkeleton />
//       </div>
//     );
//   }
//   return (
//     <>
//       {/* Header */}
//       <PageHeader
//         title="Roles"
//         subtitle="Create and manage user roles, define permissions and access levels across FinSight."
//         buttonText="Add Role"
//         buttonIcon={UserPlus}
//         onButtonClick={() => {
//           setEditRole(null);
//           setShowRoleModal(true);
//         }}
//       />
//       {/* KPI CARDS */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-0.75">
//         {dashboardStats.map((item, index) => (
//           <StatCard
//             key={item.title}
//             {...item}
//             delay={index * 0.08}
//           />
//         ))}
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="grid grid-cols-1 xl:grid-cols-12 gap-x-0.75 gap-y-0.75 mt-0.75 ">

//         {/* LEFT : 40% */}
//         <div className="xl:col-span-5 flex flex-col gap-0.75 min-h-0">

//           {/* FILTER BAR */}
//           <FilterBar
//             width="full"
//             stackActions
//             search={search}
//             setSearch={setSearch}
//             placeholder="Search role name or description..."
//             filters={[
//               {
//                 label: "Status",
//                 options: statuses,
//                 value: status,
//                 onChange: (e) => {
//                   const value = e.target.value;

//                   setStatus(value);

//                   // When viewing inactive roles,
//                   // Active Only must be disabled.
//                   if (value === "Inactive") {
//                     setActiveOnly(false);
//                   }

//                   // When returning to All,
//                   // restore Active Only.
//                   if (value === "All") {
//                     setActiveOnly(true);
//                   }
//                 },
//               },
//             ]}
//           />

//           {/* ROLES TABLE */}
//           <div
//             className="
//               h-[calc(100vh-320px)]
//               min-h-112.5
//               rounded-xl
//               border
//               border-gray-200
//               bg-white
//               shadow-sm
//               overflow-hidden
//               p-2
//             "
//           >
//             <RolesTable
//               roles={currentRoles}
//               total={total}
//               selectedRole={selectedRole}
//               setSelectedRole={setSelectedRole}

//               onEdit={(role) => {
//                 setSelectedRoleAction(role);
//                 setConfirmAction("edit");
//                 setShowConfirm(true);
//               }}

//               currentPage={currentPage}
//               totalPages={totalPages}
//               pageSize={pageSize}
//               startItem={startItem}
//               endItem={endItem}

//               onPageChange={handlePageChange}
//               onPrevious={handlePrevious}
//               onNext={handleNext}
//               onFirst={handleFirst}
//               onLast={handleLast}
//               onToggleStatus={handleToggleStatus}
//             />
//           </div>
//         </div>

//         {/* RIGHT : 60% */}
//         <div
//           className="
//             xl:col-span-7"
//         >
//           <RoleDetailsPanel
//             role={selectedRole}
//           />
//         </div>
//       </div>

//       {/* FOOTER */}
//       <div className="fixed bottom-0 left-55 right-0 border-t border-gray-200 bg-white px-0.5 py-0 shadow-sm">
//         <FooterNote
//           title="Note:"
//           message="Changes to role permission will affect all users assigned to this role."
//         />
//       </div>

//       <AddRoleModal
//         open={showRoleModal}
//         onClose={() => {
//           setShowRoleModal(false);
//           setEditRole(null);
//         }}
//         editRole={editRole}
//         onSuccess={() => {
//           fetchRoles();
//         }}
//       />

//       <ConfirmationModel
//         open={showConfirm}
//         title={
//           confirmAction === "edit"
//             ? "Edit Role"
//             : confirmAction === "deactivate"
//               ? "Deactivate Role"
//               : "Activate Role"
//         }
//         message={
//           selectedRoleAction
//             ? confirmAction === "edit"
//               ? `Do you want to edit ${selectedRoleAction.role_name || selectedRoleAction.name}?`
//               : confirmAction === "deactivate"
//                 ? `Are you sure you want to deactivate ${selectedRoleAction.role_name || selectedRoleAction.name}?`
//                 : `Are you sure you want to activate ${selectedRoleAction.role_name || selectedRoleAction.name}?`
//             : ""
//         }
//         confirmText={
//           confirmAction === "edit"
//             ? "Edit"
//             : confirmAction === "deactivate"
//               ? "Deactivate"
//               : "Activate"
//         }
//         cancelText="Cancel"
//         onConfirm={handleConfirm}
//         onCancel={handleCancel}
//       />
//     </>
//   );
// }

import React, { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import PageSkeleton from "../components/Common/PageSkeleton";
import PageHeader from "../components/Common/PageHeader";
import StatCard from "../components/StatCard";
import FilterBar from "../components/Common/FilterBar";
import RolesTable from "../components/roles/RolesTable";
import RoleDetailsPanel from "../components/roles/RoleDetailsPanel";
import FooterNote from "../components/FooterNote";
import AddRoleModal from "../components/roles/AddRoleModal";
import ConfirmationModel from "../components/Common/ConfirmationModel";
import { statuses } from "../data/dummyData";
import { getRole, updateRole } from "../api/rolesApi";

export default function RolesDashboard() {
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [status, setStatus] = useState("All");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [selectedRoleAction, setSelectedRoleAction] = useState(null);

  /* =========================================================
     LOAD ROLES
  ========================================================= */

  const fetchRoles = async () => {
    try {
      setLoading(true);

      const response = await getRole();

      // Handle both { data: [...] } and direct array responses
      let data = response.data?.data || response.data;
      if (!Array.isArray(data)) {
        data = [];
      }

      console.log("Roles API:", data);

      const formattedRoles = data.map((role) => ({
        id: role.role_code,
        role_code: role.role_code,
        role_name: role.role_name,
        name: role.role_name,
        active: Boolean(role.active),
        description: role.description || "",
        users: role.user_count ?? 0,
        type: role.active ? "Active" : "Inactive",
      }));

      // Remove duplicate roles
      const uniqueRoles = Array.from(
        new Map(
          formattedRoles.map((role) => [
            role.role_code,
            role,
          ])
        ).values()
      );

      setRoles(uniqueRoles);

      if (uniqueRoles.length > 0) {
        setSelectedRole(uniqueRoles[0]);
      } else {
        setSelectedRole(null);
      }
    } catch (err) {
      console.error("Roles API Error:", err);
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FILTER ROLES
  ========================================================= */

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      String(role.name || "").toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      status === "All" ||
      (role.active ? "Active" : "Inactive") === status;

    const matchesActive =
      status !== "All"
        ? true
        : !activeOnly || role.active;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesActive
    );
  });

  /* =========================================================
     DASHBOARD STATS
  ========================================================= */

  const dashboardStats = [
    {
      title: "Total Roles",
      value: roles.length,
      change: `${roles.length} Roles`,
      description: "All roles in system",
    },
    {
      title: "Active Roles",
      value: roles.filter((r) => r.active).length,
      change: "Currently Active",
      description: "Active Roles",
    },
    {
      title: "Users Assigned",
      value: roles.reduce(
        (total, role) =>
          total + (Number(role.users) || 0),
        0
      ),
      change: "Currently Assigned",
      description: "Users with Roles",
    },
  ];

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const resetFilters = () => {
    setSearch("");
    setStatus("All");
    setActiveOnly(true);
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const pageSize = 7;
  const total = filteredRoles.length;

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );

  const startIndex =
    (currentPage - 1) * pageSize;

  const currentRoles = filteredRoles.slice(
    startIndex,
    startIndex + pageSize
  );

  const startItem =
    total === 0 ? 0 : startIndex + 1;

  const endItem = Math.min(
    currentPage * pageSize,
    total
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handleFirst = () => {
    setCurrentPage(1);
  };

  const handleLast = () => {
    setCurrentPage(totalPages);
  };

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, activeOnly]);

  /* =========================================================
     STATUS TOGGLE
  ========================================================= */

  const handleToggleStatus = (role) => {
    setSelectedRoleAction(role);
    setConfirmAction(
      role.active ? "deactivate" : "activate"
    );
    setShowConfirm(true);
  };

  const updateRoleStatus = async (role) => {
    try {
      const payload = {
        role_code: role.role_code,
        role_name: role.role_name || role.name,
        active: !role.active,
      };

      await updateRole(role.role_code, payload);

      toast.success(
        role.active
          ? "Role deactivated successfully"
          : "Role activated successfully"
      );

      fetchRoles();
    } catch (error) {
      console.error(error);

      if (error.response) {
        toast.error(
          error.response.data.detail ||
            "Failed to update role status"
        );
      } else {
        toast.error(
          "Unable to connect to server"
        );
      }
    }
  };

  /* =========================================================
     CONFIRMATION
  ========================================================= */

  const handleConfirm = async () => {
    if (confirmAction === "edit") {
      setEditRole(selectedRoleAction);
      setShowRoleModal(true);
    }

    if (
      confirmAction === "activate" ||
      confirmAction === "deactivate"
    ) {
      await updateRoleStatus(
        selectedRoleAction
      );
    }

    setShowConfirm(false);
    setSelectedRoleAction(null);
    setConfirmAction("");
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setSelectedRoleAction(null);
    setConfirmAction("");
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <PageSkeleton />
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div style={styles.page}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={styles.headerWrapper}>
        <PageHeader
          title="Roles"
          subtitle="Create and manage user roles, define permissions and access levels across FinSight."
          buttonText="Add Role"
          buttonIcon={UserPlus}
          onButtonClick={() => {
            setEditRole(null);
            setShowRoleModal(true);
          }}
        />
      </div>

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <div style={styles.kpiGrid}>
        {dashboardStats.map((item, index) => (
          <div
            key={item.title}
            style={styles.kpiItem}
          >
            <StatCard
              {...item}
              delay={index * 0.08}
            />
          </div>
        ))}
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div style={styles.mainGrid}>

        {/* ===================================================
            LEFT : TABLE + FILTER
        =================================================== */}

        <div style={styles.leftColumn}>

          {/* FILTER BAR */}

          <div style={styles.filterWrapper}>
            <FilterBar
              width="full"
              stackActions
              search={search}
              setSearch={setSearch}
              placeholder="Search role name or description..."
              filters={[
                {
                  label: "Status",
                  options: statuses,
                  value: status,
                  onChange: (e) => {
                    const value = e.target.value;

                    setStatus(value);

                    if (value === "Inactive") {
                      setActiveOnly(false);
                    }

                    if (value === "All") {
                      setActiveOnly(true);
                    }
                  },
                },
              ]}
              activeOnly={activeOnly}
              setActiveOnly={setActiveOnly}
              onReset={resetFilters}
            />
          </div>

          {/* ROLES TABLE */}

          <div style={styles.tablePanel}>
            <RolesTable
              roles={currentRoles}
              total={total}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}

              onEdit={(role) => {
                setSelectedRoleAction(role);
                setConfirmAction("edit");
                setShowConfirm(true);
              }}

              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              startItem={startItem}
              endItem={endItem}

              onPageChange={handlePageChange}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onFirst={handleFirst}
              onLast={handleLast}
              onToggleStatus={handleToggleStatus}
            />
          </div>
        </div>

        {/* ===================================================
            RIGHT : DETAILS
        =================================================== */}

        <div style={styles.rightColumn}>
          <RoleDetailsPanel
            role={selectedRole}
          />
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div style={styles.footer}>
        <FooterNote
          title="Note:"
          message="Changes to role permission will affect all users assigned to this role."
        />
      </div>

      {/* =====================================================
          ADD / EDIT ROLE MODAL
      ===================================================== */}

      <AddRoleModal
        open={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setEditRole(null);
        }}
        editRole={editRole}
        onSuccess={() => {
          fetchRoles();
        }}
      />

      {/* =====================================================
          CONFIRMATION MODAL
      ===================================================== */}

      <ConfirmationModel
        open={showConfirm}
        title={
          confirmAction === "edit"
            ? "Edit Role"
            : confirmAction === "deactivate"
              ? "Deactivate Role"
              : "Activate Role"
        }
        message={
          selectedRoleAction
            ? confirmAction === "edit"
              ? `Do you want to edit ${
                  selectedRoleAction.role_name ||
                  selectedRoleAction.name
                }?`
              : confirmAction === "deactivate"
                ? `Are you sure you want to deactivate ${
                    selectedRoleAction.role_name ||
                    selectedRoleAction.name
                  }?`
                : `Are you sure you want to activate ${
                    selectedRoleAction.role_name ||
                    selectedRoleAction.name
                  }?`
            : ""
        }
        confirmText={
          confirmAction === "edit"
            ? "Edit"
            : confirmAction === "deactivate"
              ? "Deactivate"
              : "Activate"
        }
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

/* =========================================================
   INLINE STYLE CONFIGURATION
   ========================================================= */

const styles = {
  /* =======================================================
     PAGE
  ======================================================= */

  page: {
    width: "100%",
    minHeight: "100vh",
    boxSizing: "border-box",
    background: "#F7F9FC",
    padding: "0 16px 70px 16px",
    overflowX: "hidden",
  },

  loadingWrapper: {
    width: "100%",
    minHeight: "100vh",
    boxSizing: "border-box",
    padding: "16px",
    background: "#F7F9FC",
  },

  /* =======================================================
     HEADER
  ======================================================= */

  headerWrapper: {
    width: "100%",
    boxSizing: "border-box",
  },

  /* =======================================================
     KPI
  ======================================================= */

  kpiGrid: {
    width: "100%",
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "8px",
    marginTop: "8px",
    boxSizing: "border-box",
  },

  kpiItem: {
    minWidth: 0,
    width: "100%",
  },

  /* =======================================================
     MAIN GRID
  ======================================================= */

  mainGrid: {
    width: "100%",
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 5fr) minmax(0, 7fr)",
    gap: "8px",
    marginTop: "8px",
    alignItems: "stretch",
    boxSizing: "border-box",
  },

  /* =======================================================
     LEFT COLUMN
  ======================================================= */

  leftColumn: {
    minWidth: 0,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  filterWrapper: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },

  /* =======================================================
     TABLE
  ======================================================= */

  tablePanel: {
    width: "100%",
    height: "calc(100vh - 320px)",
    minHeight: "450px",
    minWidth: 0,
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    background: "#FFFFFF",
    boxShadow:
      "0 1px 2px rgba(15, 23, 42, 0.04)",
    overflow: "hidden",
    padding: "8px",
    boxSizing: "border-box",
  },

  /* =======================================================
     RIGHT COLUMN
  ======================================================= */

  rightColumn: {
    width: "100%",
    minWidth: 0,
    height: "100%",
    boxSizing: "border-box",
  },

  /* =======================================================
     FOOTER
  ======================================================= */

  footer: {
    position: "fixed",
    left: "220px",
    right: 0,
    bottom: 0,
    zIndex: 40,
    minHeight: "48px",
    display: "flex",
    alignItems: "center",
    borderTop: "1px solid #E2E8F0",
    background: "#FFFFFF",
    boxShadow:
      "0 -1px 3px rgba(15, 23, 42, 0.04)",
    padding: "4px 12px",
    boxSizing: "border-box",
  },
};

/* =========================================================
   RESPONSIVE INLINE STYLE SUPPORT

   Because inline styles cannot directly use @media queries,
   the grid naturally uses minmax() and available width.

   For smaller screens, add the following small helper
   component if you want exact mobile breakpoints.
========================================================= */


