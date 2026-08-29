// import React, { useEffect, useState } from "react";
// import { UserPlus } from "lucide-react";
// import toast from "react-hot-toast";
// import PageSkeleton from "../components/common/PageSkeleton";
// import PageHeader from "../components/common/PageHeader";
// import StatCard from "../components/StatCard";
// import FilterBar from "../components/common/FilterBar";
// import RolesTable from "../components/roles/RolesTable";
// import RoleDetailsPanel from "../components/roles/RoleDetailsPanel";
// import FooterNote from "../components/FooterNote";
// import AddRoleModal from "../components/roles/AddRoleModal";
// import ConfirmationModel from "../components/common/ConfirmationModel";
// import { statuses } from "../data/dummyData";
// import { addRole, getRole, updateRole } from "../api/rolesApi";

// export default function RolesDashboard() {

// const [search, setSearch] = useState("");
// const [activeOnly, setActiveOnly] = useState(true);
// const [status, setStatus] = useState("All");
// const [roles, setRoles] = useState([]);
// const [loading, setLoading] = useState(false);
// const [selectedRole, setSelectedRole] = useState(null);

// const [showRoleModal, setShowRoleModal] = useState(false);
// const [editRole, setEditRole] = useState(null);
// const [currentPage, setCurrentPage] = useState(1);

// const [showConfirm, setShowConfirm] = useState(false);
// const [confirmAction, setConfirmAction] = useState("");
// const [selectedRoleAction, setSelectedRoleAction] = useState(null);

// /*---load roles from database---*/

// const fetchRoles = async () => {
// try {
// setLoading(true);


//   const response = await getRole();

//   const data = response.data.data || response.data;

//   console.log("Roles API:", data);

//   const formattedRoles = data.map((role) => ({
//     id: role.role_code,
//     role_code: role.role_code,
//     role_name: role.role_name,
//     name: role.role_name,
//     active: Boolean(role.active),
//     description: role.description || "",
//     users: role.user_count ?? 0,
//     type: role.active ? "Active" : "Inactive",
//   }));

//   const uniqueRoles = Array.from(
//     new Map(
//       formattedRoles.map((role) => [
//         role.role_code,
//         role,
//       ])
//     ).values()
//   );

//   setRoles(uniqueRoles);

//   if (uniqueRoles.length > 0) {
//     setSelectedRole(uniqueRoles[0]);
//   } else {
//     setSelectedRole(null);
//   }

// } catch (err) {
//   console.error("Roles API Error:", err);
//   toast.error("Failed to load roles");
// } finally {
//   setLoading(false);
// }


// };

// const filteredRoles = roles.filter((role) => {
// const matchesSearch =
// (role.name || "")
// .toLowerCase()
// .includes(search.toLowerCase());


// const matchesStatus =
//   status === "All" ||
//   (role.active ? "Active" : "Inactive") === status;

// const matchesActive =
//   status !== "All"
//     ? true
//     : !activeOnly || role.active;

// return matchesSearch && matchesStatus && matchesActive;


// });

// const dashboardStats = [
// {
// title: "Total Roles",
// value: roles.length,
// change: `${roles.length} Roles`,
// description: "All roles in system",
// },
// {
// title: "Active Roles",
// value: roles.filter((r) => r.active).length,
// change: "Currently Active",
// description: "Active Roles",
// },
// {
// title: "Users Assigned",
// value: roles.reduce(
// (total, role) => total + (Number(role.users) || 0),
// 0
// ),
// change: "Currently Assigned",
// description: "Users with Roles",
// },
// ];

// const resetFilters = () => {
// setSearch("");
// setStatus("All");
// setActiveOnly(true);
// };

// const handlePageChange = (page) => {
// setCurrentPage(page);
// };

// const handlePrevious = () => {
// if (currentPage > 1) {
// setCurrentPage((p) => p - 1);
// }
// };

// const handleNext = () => {
// if (currentPage < totalPages) {
// setCurrentPage((p) => p + 1);
// }
// };

// const handleFirst = () => {
// setCurrentPage(1);
// };

// const handleLast = () => {
// setCurrentPage(totalPages);
// };

// const pageSize = 7;
// const total = filteredRoles.length;
// const totalPages = Math.ceil(total / pageSize);
// const startIndex = (currentPage - 1) * pageSize;

// const currentRoles = filteredRoles.slice(
// startIndex,
// startIndex + pageSize
// );

// const startItem =
// total === 0 ? 0 : startIndex + 1;

// const endItem = Math.min(
// currentPage * pageSize,
// total
// );

// useEffect(() => {
// fetchRoles();
// }, []);

// useEffect(() => {
// setCurrentPage(1);
// }, [search, status, activeOnly]);

// const handleToggleStatus = (role) => {
// setSelectedRoleAction(role);
// setConfirmAction(
// role.active ? "deactivate" : "activate"
// );
// setShowConfirm(true);
// };

// const updateRoleStatus = async (role) => {
// try {
// const payload = {
// role_code: role.role_code,
// role_name: role.role_name || role.name,
// active: !role.active,
// };


//   await updateRole(role.role_code, payload);

//   toast.success(
//     role.active
//       ? "Role deactivated successfully"
//       : "Role activated successfully"
//   );

//   fetchRoles();

// } catch (error) {
//   console.error(error);

//   if (error.response) {
//     toast.error(
//       error.response.data.detail ||
//       "Failed to update role status"
//     );
//   } else {
//     toast.error("Unable to connect to server");
//   }
// }


// };

// const handleConfirm = async () => {
// if (confirmAction === "edit") {
// setEditRole(selectedRoleAction);
// setShowRoleModal(true);
// }


// if (
//   confirmAction === "activate" ||
//   confirmAction === "deactivate"
// ) {
//   await updateRoleStatus(selectedRoleAction);
// }

// setShowConfirm(false);
// setSelectedRoleAction(null);
// setConfirmAction("");


// };

// const handleCancel = () => {
// setShowConfirm(false);
// setSelectedRoleAction(null);
// setConfirmAction("");
// };

// /* -------------------- LOADING -------------------- */

// if (loading) {
// return (
// <div
// style={{
// padding: "16px",
// }}
// > <PageSkeleton /> </div>
// );
// }

// return (
// <div
// style={{
// width: "100%",
// minHeight: "100%",
// display: "flex",
// flexDirection: "column",
// gap: "3px",
// paddingBottom: "45px",
// boxSizing: "border-box",
// }}
// >


//   {/* Header */}

//   <PageHeader
//     title="Roles"
//     subtitle="Create and manage user roles, define permissions and access levels across FinSight."
//     buttonText="Add Role"
//     buttonIcon={UserPlus}
//     onButtonClick={() => {
//       setEditRole(null);
//       setShowRoleModal(true);
//     }}
//   />

//   {/* KPI CARDS */}

//   <div
//     style={{
//       display: "grid",
//       gridTemplateColumns:
//         "repeat(3, minmax(0, 1fr))",
//       gap: "3px",
//       width: "100%",
//     }}
//   >
//     {dashboardStats.map((item, index) => (
//       <StatCard
//         key={item.title}
//         {...item}
//         delay={index * 0.08}
//       />
//     ))}
//   </div>

//   {/* MAIN CONTENT */}

//   <div
//     style={{
//       display: "grid",
//       gridTemplateColumns:
//         "minmax(0, 5fr) minmax(0, 7fr)",
//       columnGap: "3px",
//       rowGap: "3px",
//       marginTop: "3px",
//       width: "100%",
//       minHeight: 0,
//     }}
//   >

//     {/* LEFT : 40% */}

//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         gap: "3px",
//         minHeight: 0,
//       }}
//     >

//       {/* FILTER BAR */}

//       <FilterBar
//         width="full"
//         stackActions
//         search={search}
//         setSearch={setSearch}
//         placeholder="Search role name or description..."
//         filters={[
//           {
//             label: "Status",
//             options: statuses,
//             value: status,
//             onChange: (e) => {
//               const value = e.target.value;

//               setStatus(value);

//               if (value === "Inactive") {
//                 setActiveOnly(false);
//               }

//               if (value === "All") {
//                 setActiveOnly(true);
//               }
//             },
//           },
//         ]}
//       />

//       {/* ROLES TABLE */}

//       <div
//         style={{
//           height: "calc(100vh - 320px)",
//           minHeight: "450px",
//           borderRadius: "12px",
//           border: "1px solid #e5e7eb",
//           background: "#ffffff",
//           boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
//           overflow: "hidden",
//           padding: "8px",
//           boxSizing: "border-box",
//         }}
//       >
//         <RolesTable
//           roles={currentRoles}
//           total={total}
//           selectedRole={selectedRole}
//           setSelectedRole={setSelectedRole}

//           onEdit={(role) => {
//             setSelectedRoleAction(role);
//             setConfirmAction("edit");
//             setShowConfirm(true);
//           }}

//           currentPage={currentPage}
//           totalPages={totalPages}
//           pageSize={pageSize}
//           startItem={startItem}
//           endItem={endItem}

//           onPageChange={handlePageChange}
//           onPrevious={handlePrevious}
//           onNext={handleNext}
//           onFirst={handleFirst}
//           onLast={handleLast}
//           onToggleStatus={handleToggleStatus}
//         />
//       </div>
//     </div>

//     {/* RIGHT : 60% */}

//     <div
//       style={{
//         minWidth: 0,
//         width: "100%",
//       }}
//     >
//       <RoleDetailsPanel
//         role={selectedRole}
//       />
//     </div>
//   </div>

//   {/* FOOTER */}

//   <div
//     style={{
//       position: "fixed",
//       bottom: 0,
//       left: "220px",
//       right: 0,
//       borderTop: "1px solid #e5e7eb",
//       background: "#ffffff",
//       padding: "0 2px",
//       boxShadow:
//         "0 -1px 3px rgba(0,0,0,0.05)",
//       zIndex: 20,
//     }}
//   >
//     <FooterNote
//       title="Note:"
//       message="Changes to role permission will affect all users assigned to this role."
//     />
//   </div>

//   {/* ADD / EDIT ROLE MODAL */}

//   <AddRoleModal
//     open={showRoleModal}
//     onClose={() => {
//       setShowRoleModal(false);
//       setEditRole(null);
//     }}
//     editRole={editRole}
//     onSuccess={() => {
//       fetchRoles();
//     }}
//   />

//   {/* CONFIRMATION MODAL */}

//   <ConfirmationModel
//     open={showConfirm}
//     title={
//       confirmAction === "edit"
//         ? "Edit Role"
//         : confirmAction === "deactivate"
//           ? "Deactivate Role"
//           : "Activate Role"
//     }
//     message={
//       selectedRoleAction
//         ? confirmAction === "edit"
//           ? `Do you want to edit ${selectedRoleAction.role_name || selectedRoleAction.name}?`
//           : confirmAction === "deactivate"
//             ? `Are you sure you want to deactivate ${selectedRoleAction.role_name || selectedRoleAction.name}?`
//             : `Are you sure you want to activate ${selectedRoleAction.role_name || selectedRoleAction.name}?`
//         : ""
//     }
//     confirmText={
//       confirmAction === "edit"
//         ? "Edit"
//         : confirmAction === "deactivate"
//           ? "Deactivate"
//           : "Activate"
//     }
//     cancelText="Cancel"
//     onConfirm={handleConfirm}
//     onCancel={handleCancel}
//   />

// </div>


// );
// }
import React, { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import PageSkeleton from "../components/common/PageSkeleton";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/StatCard";
import FilterBar from "../components/common/FilterBar";
import RolesTable from "../components/roles/RolesTable";
import RoleDetailsPanel from "../components/roles/RoleDetailsPanel";
import FooterNote from "../components/FooterNote";
import AddRoleModal from "../components/roles/AddRoleModal";
import ConfirmationModel from "../components/common/ConfirmationModel";

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

      const data = response.data.data || response.data;

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
        setSelectedRole((previousSelected) => {
          if (!previousSelected) {
            return uniqueRoles[0];
          }

          const stillExists = uniqueRoles.find(
            (item) =>
              item.role_code === previousSelected.role_code
          );

          return stillExists || uniqueRoles[0];
        });
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
     FILTER
  ========================================================= */

  const filteredRoles = roles.filter((role) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      (role.name || "")
        .toLowerCase()
        .includes(searchValue) ||
      (role.description || "")
        .toLowerCase()
        .includes(searchValue);

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
     FILTER RESET
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

  const totalPages = Math.ceil(
    total / pageSize
  );

  const startIndex =
    (currentPage - 1) * pageSize;

  const currentRoles = filteredRoles.slice(
    startIndex,
    startIndex + pageSize
  );

  const startItem =
    total === 0
      ? 0
      : startIndex + 1;

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
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchRoles();
  }, []);

  /* =========================================================
     RESET PAGE WHEN FILTER CHANGES
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, activeOnly]);

  /* =========================================================
     TOGGLE STATUS
  ========================================================= */

  const handleToggleStatus = (role) => {
    setSelectedRoleAction(role);

    setConfirmAction(
      role.active
        ? "deactivate"
        : "activate"
    );

    setShowConfirm(true);
  };

  /* =========================================================
     UPDATE ROLE STATUS
  ========================================================= */

  const updateRoleStatus = async (role) => {
    try {
      const payload = {
        role_code: role.role_code,
        role_name:
          role.role_name || role.name,
        active: !role.active,
      };

      await updateRole(
        role.role_code,
        payload
      );

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
      <div
        style={{
          width: "100%",
          minHeight: "100%",
          padding: "24px",
          boxSizing: "border-box",
          background: "#f8fafc",
        }}
      >
        <PageSkeleton />
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",

        /* TOPBAR → PAGE CONTENT GAP */
        paddingTop: "18px",

        /* LEFT / RIGHT PAGE PADDING */
        paddingLeft: "16px",
        paddingRight: "16px",

        /* FOOTER SPACE */
        paddingBottom: "58px",

        background: "#f8fafc",
      }}
    >
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div
        style={{
          width: "100%",
          marginBottom: "12px",
        }}
      >
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "10px",
          width: "100%",
          marginBottom: "10px",
        }}
      >
        {dashboardStats.map(
          (item, index) => (
            <StatCard
              key={item.title}
              {...item}
              delay={index * 0.08}
            />
          )
        )}
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        style={{
          display: "grid",

          /* SAME 40 / 60 STYLE AS REFERENCE */
          gridTemplateColumns:
            "minmax(0, 5fr) minmax(0, 7fr)",

          columnGap: "10px",
          rowGap: "10px",

          width: "100%",
          minHeight: 0,
          alignItems: "stretch",
        }}
      >
        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {/* FILTER */}

          <div
            style={{
              width: "100%",
            }}
          >
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
                    const value =
                      e.target.value;

                    setStatus(value);

                    if (
                      value ===
                      "Inactive"
                    ) {
                      setActiveOnly(false);
                    }

                    if (
                      value === "All"
                    ) {
                      setActiveOnly(true);
                    }
                  },
                },
              ]}
            />
          </div>

          {/* ROLES TABLE */}

          <div
            style={{
              width: "100%",

              /* REDUCED TABLE HEIGHT */
              height:
                "calc(100vh - 355px)",

              minHeight: "430px",

              borderRadius: "10px",
              border:
                "1px solid #e5e7eb",

              background: "#ffffff",

              boxShadow:
                "0 1px 3px rgba(0,0,0,0.06)",

              overflow: "hidden",

              boxSizing: "border-box",

              padding: "7px",
            }}
          >
            <RolesTable
              roles={currentRoles}
              total={total}
              selectedRole={selectedRole}
              setSelectedRole={
                setSelectedRole
              }
              onEdit={(role) => {
                setSelectedRoleAction(
                  role
                );

                setConfirmAction(
                  "edit"
                );

                setShowConfirm(true);
              }}
              currentPage={
                currentPage
              }
              totalPages={
                totalPages
              }
              pageSize={pageSize}
              startItem={startItem}
              endItem={endItem}
              onPageChange={
                handlePageChange
              }
              onPrevious={
                handlePrevious
              }
              onNext={handleNext}
              onFirst={handleFirst}
              onLast={handleLast}
              onToggleStatus={
                handleToggleStatus
              }
            />
          </div>
        </div>

        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <div
          style={{
            minWidth: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <RoleDetailsPanel
            role={selectedRole}
          />
        </div>
      </div>

      {/* =====================================================
          FOOTER NOTE
      ===================================================== */}

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "220px",
          right: 0,

          minHeight: "38px",

          borderTop:
            "1px solid #e5e7eb",

          background: "#ffffff",

          padding:
            "0 12px",

          boxShadow:
            "0 -1px 3px rgba(0,0,0,0.05)",

          zIndex: 20,

          display: "flex",
          alignItems: "center",
        }}
      >
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
            : confirmAction ===
              "deactivate"
            ? "Deactivate Role"
            : "Activate Role"
        }
        message={
          selectedRoleAction
            ? confirmAction ===
              "edit"
              ? `Do you want to edit ${
                  selectedRoleAction.role_name ||
                  selectedRoleAction.name
                }?`
              : confirmAction ===
                "deactivate"
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
            : confirmAction ===
              "deactivate"
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