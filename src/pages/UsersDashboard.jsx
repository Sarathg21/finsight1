// import { useState, useMemo, useEffect } from "react";
// import {
// UserPlus,
// Users,
// UserCheck,
// UserX,
// ShieldAlert,
// UserCog,
// Edit,
// } from "lucide-react";
// import toast from "react-hot-toast";


// import PageHeader from "../components/common/PageHeader";
// import FilterBar from "../components/common/FilterBar";
// import StatCard from "../components/StatCard";
// import UserTable from "../components/users/UserTable";
// import UserDetails from "../components/users/UserDetails";
// import FooterNote from "../components/FooterNote";
// import AddUserModal from "../components/users/AddUserModal";
// import ConfirmationModel from "../components/common/ConfirmationModel";
// import PageSkeleton from "../components/common/PageSkeleton";

// import {
// getUsers,
// getRoles,
// getLegalGroups,
// updateUserStatus,
// getAdminSummary,
// } from "../api/userApi";

// export default function UsersDashboard() {

// /* -------------------- STATES -------------------- */

// const [search, setSearch] = useState("");
// const [status, setStatus] = useState("All");

// const [role, setRole] = useState("All");
// const [roleOptions, setRoleOptions] = useState(["All"]);

// const [legalGroup, setLegalGroup] = useState("All");
// const [legalGroupOptions, setLegalGroupOptions] = useState(["All"]);

// const [activeOnly, setActiveOnly] = useState(false);
// const [users, setUsers] = useState([]);
// const [selectedUser, setSelectedUser] = useState(null);

// const [showAddUser, setShowAddUser] = useState(false);
// const [showEditUser, setShowEditUser] = useState(false);
// const [editingUser, setEditingUser] = useState(null);

// const [loading, setLoading] = useState(false);

// const [showConfirm, setShowConfirm] = useState(false);
// const [confirmAction, setConfirmAction] = useState("");
// const [selectedConfirmUser, setSelectedConfirmUser] = useState(null);

// /* -------------------- PAGINATION -------------------- */

// const [currentPage, setCurrentPage] = useState(1);
// const [pageSize, setPageSize] = useState(10);

// const [userStats, setUserStats] = useState({
// total: 0,
// active: 0,
// inactive: 0,
// noRole: 0,
// });

// /* -------------------- FETCH USERS -------------------- */

// const fetchUsers = async () => {
// try {
// setLoading(true);

//   const response = await getUsers();

//   console.log("Users API Response:", response.data);

//   console.table(
//     response.data.map((u) => ({
//       id: u.user_profile_id,
//       name: u.employee_name,
//     }))
//   );

//   const formattedUsers = response.data.map((user) => ({
//     id: user.user_profile_id,
//     code: user.employee_code,
//     name: user.employee_name,
//     email: user.official_email,

//     role: user.role_code,
//     role_code: user.role_code,

//     legalGroups: user.legal_groups ?? [],

//     active: user.active === true,
//     status: user.active === true ? "Active" : "Inactive",

//     lastLogin: "-",
//     dateOfJoining: user.date_of_joining ?? "-",
//     jobTitle: user.designation ?? "-",
//     phone: user.phone ?? "--",
//     location: user.location ?? "--",

//     emailVerified: user.email_verified ?? false,
//     mfaEnabled: user.mfa_enabled ?? false,

//     raw: user,
//   }));

//   setUsers(formattedUsers);

//   setSelectedUser((prev) => {
//     if (prev) {
//       const updatedSelected = formattedUsers.find(
//         (item) => item.id === prev.id
//       );

//       return updatedSelected || formattedUsers[0];
//     }

//     return formattedUsers[0];
//   });

// } catch (error) {
//   console.error("Users API Error:", error);
// } finally {
//   setLoading(false);
// }

// };

// /* --------------- FETCH KPI DATA FOR USERS -------------------- */

// const fetchUserStats = async () => {
// try {
// const response = await getAdminSummary();


//   console.log("Admin Summary:", response.data);

//   setUserStats({
//     total: response.data.users ?? 0,
//     active: response.data.active_users ?? 0,
//     inactive: response.data.inactive_users ?? 0,
//     noRole: response.data.users_without_role ?? 0,
//   });

// } catch (error) {
//   console.error("Admin Summary API Error:", error);
// }


// };

// /* -------------------- FETCH ROLES -------------------- */

// const fetchRoles = async () => {
// try {
// const response = await getRoles();


//   const roles = response.data.data || response.data;

//   const uniqueActiveRoles = Array.from(
//     new Map(
//       roles
//         .filter((role) => role.active === true)
//         .map((role) => [
//           role.role_code,
//           role,
//         ])
//     ).values()
//   );

//   setRoleOptions([
//     {
//       id: 0,
//       code: "All",
//       name: "All",
//     },
//     ...uniqueActiveRoles.map(
//       (role, index) => ({
//         id: index + 1,
//         code: role.role_code,
//         name: role.role_name,
//       })
//     ),
//   ]);

// } catch (error) {
//   console.error(
//     "Failed to load roles:",
//     error
//   );
// }


// };

// /* -------------------- FETCH LEGAL GROUPS -------------------- */

// const fetchLegalGroups = async () => {
// try {
// const response = await getUsers();


//   const users = response.data.data || response.data;

//   const legalGroups = users.flatMap(
//     (user) => user.legal_groups || []
//   );

//   const uniqueLegalGroups = Array.from(
//     new Map(
//       legalGroups.map((group) => [
//         group.legal_group_code,
//         group,
//       ])
//     ).values()
//   );

//   const formattedLegalGroups = uniqueLegalGroups.map(
//     (group, index) => ({
//       id: index + 1,
//       code: group.legal_group_code,
//       name: group.legal_group_name,
//     })
//   );

//   setLegalGroupOptions([
//     {
//       id: 0,
//       code: "All",
//       name: "All",
//     },
//     ...formattedLegalGroups,
//   ]);

// } catch (error) {
//   console.error(
//     "Failed to load legal groups:",
//     error
//   );
// }


// };

// /* -------------------- PAGE LOAD -------------------- */

// useEffect(() => {
// fetchUsers();
// fetchUserStats();
// fetchRoles();
// fetchLegalGroups();
// }, []);

// useEffect(() => {
// setCurrentPage(1);
// }, [
// search,
// status,
// role,
// legalGroup,
// activeOnly,
// ]);

// /* -------------------- RESET FILTERS -------------------- */

// const resetFilters = () => {
// setSearch("");
// setStatus("All");
// setRole("All");
// setLegalGroup("All");
// setActiveOnly(false);
// };

// /* -------------------- FILTER USERS -------------------- */

// const filteredUsers = useMemo(() => {
// return users.filter((user) => {


//   const matchesSearch =
//     (user.name || "")
//       .toLowerCase()
//       .includes(search.toLowerCase()) ||

//     (user.email || "")
//       .toLowerCase()
//       .includes(search.toLowerCase()) ||

//     (user.code || "")
//       .toLowerCase()
//       .includes(search.toLowerCase());

//   const matchesStatus =
//     status === "All" ||
//     (status === "Active" && user.active === true) ||
//     (status === "Inactive" && user.active === false);

//   const matchesRole =
//     role === "All" ||
//     user.role === role;

//   const matchesLegalGroup =
//     legalGroup === "All" ||
//     user.legalGroups?.some(
//       (group) => group.legal_group_code === legalGroup
//     );

//   const matchesActive =
//     !activeOnly ||
//     user.active === true;

//   return (
//     matchesSearch &&
//     matchesStatus &&
//     matchesRole &&
//     matchesLegalGroup &&
//     matchesActive
//   );
// });


// }, [
// users,
// search,
// status,
// role,
// legalGroup,
// activeOnly,
// ]);

// /* -------------------- PAGINATION -------------------- */

// const totalPages = Math.max(
// 1,
// Math.ceil(filteredUsers.length / pageSize)
// );

// const startIndex = (currentPage - 1) * pageSize;
// const endIndex = startIndex + pageSize;

// const currentUsers = filteredUsers.slice(
// startIndex,
// endIndex
// );

// const handlePrevious = () => {
// if (currentPage > 1) {
// setCurrentPage((prev) => prev - 1);
// }
// };

// const handleNext = () => {
// if (currentPage < totalPages) {
// setCurrentPage((prev) => prev + 1);
// }
// };

// const handleFirst = () => {
// setCurrentPage(1);
// };

// const handleLast = () => {
// setCurrentPage(totalPages);
// };

// const handlePageSizeChange = (e) => {
// setPageSize(Number(e.target.value));
// setCurrentPage(1);
// };

// /* -------------------- EDIT USER FORM -------------------- */

// const handleEdit = (user) => {
// setSelectedConfirmUser(user);
// setConfirmAction("edit");
// setShowConfirm(true);


// <div
//   style={{
//     width: "360px",
//     borderRadius: "12px",
//     border: "1px solid #e5e7eb",
//     background: "#ffffff",
//     padding: "16px",
//     boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
//   }}
// >
//   <div
//     style={{
//       display: "flex",
//       alignItems: "flex-start",
//       gap: "12px",
//     }}
//   >
//     <div
//       style={{
//         display: "flex",
//         width: "40px",
//         height: "40px",
//         alignItems: "center",
//         justifyContent: "center",
//         borderRadius: "50%",
//         background: "#dbeafe",
//       }}
//     >
//       <Edit
//         style={{
//           width: "20px",
//           height: "20px",
//           color: "#2563eb",
//         }}
//       />
//     </div>

//     <div style={{ flex: 1 }}>
//       <h3
//         style={{
//           margin: 0,
//           fontSize: "14px",
//           fontWeight: 600,
//           color: "#111827",
//         }}
//       >
//         Edit User
//       </h3>

//       <p
//         style={{
//           marginTop: "4px",
//           fontSize: "12px",
//           color: "#4b5563",
//         }}
//       >
//         Do you want to edit{" "}
//         <span
//           style={{
//             fontWeight: 600,
//           }}
//         >
//           {user.name}
//         </span>
//         ?
//       </p>

//       <div
//         style={{
//           marginTop: "16px",
//           display: "flex",
//           justifyContent: "flex-end",
//           gap: "8px",
//         }}
//       >
//         <button
//           onClick={() => toast.dismiss(t.id)}
//           style={{
//             border: "1px solid #d1d5db",
//             borderRadius: "6px",
//             padding: "6px 12px",
//             fontSize: "12px",
//             fontWeight: 500,
//             background: "#ffffff",
//             cursor: "pointer",
//           }}
//         >
//           Cancel
//         </button>

//         <button
//           onClick={() => {
//             toast.dismiss(t.id);
//             setSelectedUser(user);
//             setShowEditUser(true);
//           }}
//           style={{
//             border: "none",
//             borderRadius: "6px",
//             padding: "6px 12px",
//             fontSize: "12px",
//             fontWeight: 500,
//             color: "#ffffff",
//             background: "#2563eb",
//             cursor: "pointer",
//           }}
//         >
//           Edit
//         </button>
//       </div>
//     </div>
//   </div>
// </div>;


// };

// const handleConfirm = async () => {
// if (confirmAction === "edit") {
// setSelectedUser(selectedConfirmUser);
// setShowEditUser(true);
// }


// if (
//   confirmAction === "deactivate" ||
//   confirmAction === "activate"
// ) {
//   await updateStatus(selectedConfirmUser);
// }

// setShowConfirm(false);
// setSelectedConfirmUser(null);
// setConfirmAction("");


// };

// const handleCancel = () => {
// setShowConfirm(false);
// setSelectedConfirmUser(null);
// setConfirmAction("");
// };

// const handleToggleStatus = (user) => {
// setSelectedConfirmUser(user);
// setConfirmAction(
// user.active ? "deactivate" : "activate"
// );
// setShowConfirm(true);
// };

// const updateStatus = async (user) => {
// try {
// const payload = {
// employee_code: user.raw.employee_code,
// employee_name: user.raw.employee_name,
// official_email: user.raw.official_email,
// designation: user.raw.designation,
// reporting_manager_code:
// user.raw.reporting_manager_code,
// role_code: user.raw.role_code,
// active: !user.active,
// };


//   console.log("Payload:", payload);
//   console.log(user.raw);

//   await updateUserStatus(user.id, payload);

//   toast.success(
//     user.active
//       ? "User deactivated successfully"
//       : "User activated successfully"
//   );

//   await Promise.all([
//     fetchUsers(),
//     fetchUserStats(),
//   ]);

// } catch (error) {
//   console.error(error.response?.data);
//   toast.error("Unable to update user status");
// }


// };

// /* -------------------- KPI CARDS -------------------- */

// const statCards = [
// {
// id: "total",
// title: "Total Users",
// value: userStats.total,
// icon: Users,
// },
// {
// id: "active",
// title: "Active Users",
// value: userStats.active,
// icon: UserCheck,
// },
// {
// id: "inactive",
// title: "Inactive Users",
// value: userStats.inactive,
// icon: UserX,
// },
// {
// id: "noRole",
// title: "Users Without Role",
// value: userStats.noRole,
// icon: UserCog,
// },
// ];

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

// /* -------------------- MAIN UI -------------------- */

// return (
// <div
// style={{
// display: "flex",
// flexDirection: "column",
// gap: "2px",
// }}
// >


//   {/* HEADER */}

//   <div>
//     <PageHeader
//       title="Users"
//       subtitle="Manage application users, their roles and account status."
//       buttonText="Add User"
//       buttonIcon={UserPlus}
//       onButtonClick={() => setShowAddUser(true)}
//     />

//     <AddUserModal
//       open={showAddUser || showEditUser}
//       editUser={selectedUser}
//       onClose={() => {
//         setShowAddUser(false);
//         setShowEditUser(false);
//       }}
//       onSuccess={() => {
//         fetchUsers();
//         setShowAddUser(false);
//         setShowEditUser(false);
//       }}
//     />

//     {/* KPI CARDS */}

//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns:
//           "repeat(4, minmax(0, 1fr))",
//         gap: "2px",
//       }}
//     >
//       {statCards.map((item, index) => (
//         <StatCard
//           key={item.key || item.title || index}
//           {...item}
//           delay={index * 0.08}
//         />
//       ))}
//     </div>

//     {/* FILTER BAR */}

//     <FilterBar
//       search={search}
//       setSearch={setSearch}
//       placeholder="Search by name, email or employee code..."
//       filters={[
//         {
//           label: "Status",
//           options: ["All", "Active", "Inactive"],
//           value: status,
//           onChange: (e) =>
//             setStatus(e.target.value),
//         },
//         {
//           label: "Role",
//           options: roleOptions,
//           value: role,
//           onChange: (e) =>
//             setRole(e.target.value),
//         },
//         {
//           label: "Legal Group",
//           options: legalGroupOptions,
//           value: legalGroup,
//           onChange: (e) =>
//             setLegalGroup(e.target.value),
//         },
//       ]}
//       activeOnly={activeOnly}
//       setActiveOnly={setActiveOnly}
//       toggleLabel="Active Users Only"
//       showMoreFilters
//       onReset={resetFilters}
//     />

//     {/* TABLE + DETAILS */}

//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns:
//           "minmax(0, 1fr) 430px",
//         gap: "16px",
//       }}
//     >
//       <UserTable
//         users={currentUsers}
//         total={filteredUsers.length}
//         onEdit={handleEdit}
//         onToggleStatus={handleToggleStatus}
//         currentPage={currentPage}
//         totalPages={totalPages}
//         pageSize={pageSize}
//         onPageChange={setCurrentPage}
//         onPrevious={handlePrevious}
//         onNext={handleNext}
//         onFirst={handleFirst}
//         onLast={handleLast}
//         onPageSizeChange={handlePageSizeChange}
//         selectedId={selectedUser?.id}
//         onSelect={(user) => {
//           console.log(
//             "Dashboard received:",
//             user.id,
//             user.name
//           );
//           setSelectedUser(user);
//         }}
//       />

//       {selectedUser && (
//         <UserDetails
//           key={selectedUser.id}
//           user={selectedUser}
//           onClose={() => setSelectedUser(null)}
//           onEdit={handleEdit}
//           onToggleStatus={handleToggleStatus}
//         />
//       )}
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
//         "0 -1px 2px rgba(0,0,0,0.04)",
//       zIndex: 20,
//     }}
//   >
//     <FooterNote
//       title="Note:"
//       message=" Deactivated users will not be able to login."
//       lastUpdated="20 Jun 2026 10:15 AM"
//       onRefresh={() =>
//         console.log("Refresh clicked")
//       }
//     />
//   </div>

//   <AddUserModal
//     open={showAddUser}
//     onClose={() => setShowAddUser(false)}
//     onSuccess={() => {
//       fetchUsers();
//       setShowAddUser(false);
//     }}
//   />

//   <ConfirmationModel
//     open={showConfirm}
//     title={
//       confirmAction === "edit"
//         ? "Edit User"
//         : confirmAction === "deactivate"
//           ? "Deactivate User"
//           : "Activate User"
//     }
//     message={
//       selectedConfirmUser
//         ? confirmAction === "edit"
//           ? `Do you want to edit ${selectedConfirmUser.name}?`
//           : confirmAction === "deactivate"
//             ? `Are you sure you want to deactivate ${selectedConfirmUser.name}?`
//             : `Are you sure you want to activate ${selectedConfirmUser.name}?`
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
import { useState, useMemo, useEffect } from "react";
import {
  UserPlus,
  Users,
  UserCheck,
  UserX,
  UserCog,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "../components/common/PageHeader";
import FilterBar from "../components/common/FilterBar";
import StatCard from "../components/StatCard";
import UserTable from "../components/users/UserTable";
import UserDetails from "../components/users/UserDetails";
import FooterNote from "../components/FooterNote";
import AddUserModal from "../components/users/AddUserModal";
import ConfirmationModel from "../components/common/ConfirmationModel";
import PageSkeleton from "../components/common/PageSkeleton";

import {
  getUsers,
  getRoles,
  updateUserStatus,
  getAdminSummary,
} from "../api/userApi";


/* ============================================================
   INLINE PAGE STYLES
   ============================================================ */

const styles = {
  page: {
    width: "100%",
    minHeight: "100%",
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
  },

  content: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    paddingBottom: "56px",
    width: "100%",
    boxSizing: "border-box",
  },

  pageHeader: {
    width: "100%",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "2px",
    width: "100%",
    boxSizing: "border-box",
  },

  filterWrapper: {
    position: "sticky",
    top: "0",
    zIndex: 30,
    width: "100%",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    boxShadow:
      "0 1px 2px rgba(0, 0, 0, 0.05)",
    boxSizing: "border-box",
  },

  tableDetailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) 430px",
    gap: "12px",
    alignItems: "start",
    width: "100%",
    boxSizing: "border-box",
  },

  tableWrapper: {
    minWidth: 0,
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    boxShadow:
      "0 1px 2px rgba(0, 0, 0, 0.05)",
    boxSizing: "border-box",
  },

  detailsWrapper: {
    minWidth: 0,
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    boxShadow:
      "0 1px 2px rgba(0, 0, 0, 0.05)",
    position: "sticky",
    top: "76px",
    boxSizing: "border-box",
  },

  footer: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
    width: "100%",
    backgroundColor: "#ffffff",
    borderTop: "1px solid #e5e7eb",
    boxShadow:
      "0 -1px 3px rgba(0, 0, 0, 0.05)",
    boxSizing: "border-box",
  },

  skeleton: {
    width: "100%",
    minHeight: "100%",
    backgroundColor: "#f8fafc",
    padding: "16px",
    boxSizing: "border-box",
  },
};


export default function UsersDashboard() {
  /* ============================================================
     STATES
     ============================================================ */

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [role, setRole] = useState("All");
  const [roleOptions, setRoleOptions] = useState([
    {
      id: 0,
      code: "All",
      name: "All",
    },
  ]);

  const [legalGroup, setLegalGroup] = useState("All");
  const [legalGroupOptions, setLegalGroupOptions] =
    useState([
      {
        id: 0,
        code: "All",
        name: "All",
      },
    ]);

  const [activeOnly, setActiveOnly] =
    useState(false);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] =
    useState(null);

  const [showAddUser, setShowAddUser] =
    useState(false);

  const [showEditUser, setShowEditUser] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  /* ============================================================
     CONFIRMATION
     ============================================================ */

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [confirmAction, setConfirmAction] =
    useState("");

  const [selectedConfirmUser, setSelectedConfirmUser] =
    useState(null);

  /* ============================================================
     PAGINATION
     ============================================================ */

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  /* ============================================================
     KPI / USER STATS
     ============================================================ */

  const [userStats, setUserStats] =
    useState({
      total: 0,
      active: 0,
      inactive: 0,
      noRole: 0,
    });

  /* ============================================================
     FETCH USERS
     ============================================================ */

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await getUsers();

      const usersData =
        response?.data?.data ||
        response?.data ||
        [];

      console.log(
        "Users API Response:",
        usersData
      );

      const formattedUsers =
        usersData.map((user) => ({
          id: user.user_profile_id,

          code: user.employee_code,

          name: user.employee_name,

          email: user.official_email,

          role: user.role_code,

          role_code: user.role_code,

          legalGroups:
            user.legal_groups ?? [],

          active:
            user.active === true,

          status:
            user.active === true
              ? "Active"
              : "Inactive",

          lastLogin:
            user.last_login ?? "-",

          dateOfJoining:
            user.date_of_joining ?? "-",

          jobTitle:
            user.designation ?? "-",

          phone:
            user.phone ?? "--",

          location:
            user.location ?? "--",

          emailVerified:
            user.email_verified ?? false,

          mfaEnabled:
            user.mfa_enabled ?? false,

          raw: user,
        }));

      setUsers(formattedUsers);

      /* Preserve selected user after refresh */
      setSelectedUser(
        (previousSelected) => {
          if (!formattedUsers.length) {
            return null;
          }

          if (previousSelected) {
            const updatedSelected =
              formattedUsers.find(
                (item) =>
                  item.id ===
                  previousSelected.id
              );

            return (
              updatedSelected ||
              formattedUsers[0]
            );
          }

          return formattedUsers[0];
        }
      );
    } catch (error) {
      console.error(
        "Users API Error:",
        error
      );

      toast.error(
        "Unable to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     FETCH KPI DATA
     ============================================================ */

  const fetchUserStats = async () => {
    try {
      const response =
        await getAdminSummary();

      console.log(
        "Admin Summary:",
        response.data
      );

      setUserStats({
        total:
          response.data?.users ?? 0,

        active:
          response.data?.active_users ?? 0,

        inactive:
          response.data?.inactive_users ?? 0,

        noRole:
          response.data?.users_without_role ??
          0,
      });
    } catch (error) {
      console.error(
        "Admin Summary API Error:",
        error
      );
    }
  };

  /* ============================================================
     FETCH ROLES
     ============================================================ */

  const fetchRoles = async () => {
    try {
      const response =
        await getRoles();

      const roles =
        response?.data?.data ||
        response?.data ||
        [];

      const uniqueActiveRoles =
        Array.from(
          new Map(
            roles
              .filter(
                (roleItem) =>
                  roleItem.active === true
              )
              .map(
                (roleItem) => [
                  roleItem.role_code,
                  roleItem,
                ]
              )
          ).values()
        );

      setRoleOptions([
        {
          id: 0,
          code: "All",
          name: "All",
        },

        ...uniqueActiveRoles.map(
          (roleItem, index) => ({
            id: index + 1,
            code: roleItem.role_code,
            name: roleItem.role_name,
          })
        ),
      ]);
    } catch (error) {
      console.error(
        "Failed to load roles:",
        error
      );
    }
  };

  /* ============================================================
     FETCH LEGAL GROUPS
     ============================================================ */

  const fetchLegalGroups = async () => {
    try {
      const response =
        await getUsers();

      const usersData =
        response?.data?.data ||
        response?.data ||
        [];

      const legalGroups =
        usersData.flatMap(
          (user) =>
            user.legal_groups || []
        );

      const uniqueLegalGroups =
        Array.from(
          new Map(
            legalGroups.map(
              (group) => [
                group.legal_group_code,
                group,
              ]
            )
          ).values()
        );

      const formattedLegalGroups =
        uniqueLegalGroups.map(
          (group, index) => ({
            id: index + 1,
            code:
              group.legal_group_code,
            name:
              group.legal_group_name,
          })
        );

      setLegalGroupOptions([
        {
          id: 0,
          code: "All",
          name: "All",
        },

        ...formattedLegalGroups,
      ]);
    } catch (error) {
      console.error(
        "Failed to load legal groups:",
        error
      );
    }
  };

  /* ============================================================
     INITIAL PAGE LOAD
     ============================================================ */

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
    fetchRoles();
    fetchLegalGroups();
  }, []);

  /* ============================================================
     RESET PAGINATION WHEN FILTER CHANGES
     ============================================================ */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    status,
    role,
    legalGroup,
    activeOnly,
  ]);

  /* ============================================================
     RESET FILTERS
     ============================================================ */

  const resetFilters = () => {
    setSearch("");
    setStatus("All");
    setRole("All");
    setLegalGroup("All");
    setActiveOnly(false);
  };

  /* ============================================================
     FILTER USERS
     ============================================================ */

  const filteredUsers = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        (user.name || "")
          .toLowerCase()
          .includes(
            normalizedSearch
          ) ||
        (user.email || "")
          .toLowerCase()
          .includes(
            normalizedSearch
          ) ||
        (user.code || "")
          .toLowerCase()
          .includes(
            normalizedSearch
          );

      const matchesStatus =
        status === "All" ||
        (status === "Active" &&
          user.active === true) ||
        (status === "Inactive" &&
          user.active === false);

      const matchesRole =
        role === "All" ||
        user.role === role;

      const matchesLegalGroup =
        legalGroup === "All" ||
        user.legalGroups?.some(
          (group) =>
            group.legal_group_code ===
            legalGroup
        );

      const matchesActive =
        !activeOnly ||
        user.active === true;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole &&
        matchesLegalGroup &&
        matchesActive
      );
    });
  }, [
    users,
    search,
    status,
    role,
    legalGroup,
    activeOnly,
  ]);

  /* ============================================================
     PAGINATION
     ============================================================ */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length /
        pageSize
    )
  );

  const startIndex =
    (currentPage - 1) *
    pageSize;

  const endIndex =
    startIndex + pageSize;

  const currentUsers =
    filteredUsers.slice(
      startIndex,
      endIndex
    );

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(
        (previousPage) =>
          previousPage - 1
      );
    }
  };

  const handleNext = () => {
    if (
      currentPage <
      totalPages
    ) {
      setCurrentPage(
        (previousPage) =>
          previousPage + 1
      );
    }
  };

  const handleFirst = () => {
    setCurrentPage(1);
  };

  const handleLast = () => {
    setCurrentPage(totalPages);
  };

  const handlePageSizeChange = (
    event
  ) => {
    setPageSize(
      Number(event.target.value)
    );

    setCurrentPage(1);
  };

  /* ============================================================
     EDIT USER
     ============================================================ */

  const handleEdit = (user) => {
    setSelectedConfirmUser(user);
    setConfirmAction("edit");
    setShowConfirm(true);
  };

  /* ============================================================
     CONFIRM ACTION
     ============================================================ */

  const handleConfirm = async () => {
    if (!selectedConfirmUser) {
      return;
    }

    if (confirmAction === "edit") {
      setSelectedUser(
        selectedConfirmUser
      );

      setShowEditUser(true);
    }

    if (
      confirmAction ===
        "deactivate" ||
      confirmAction === "activate"
    ) {
      await updateStatus(
        selectedConfirmUser
      );
    }

    setShowConfirm(false);
    setSelectedConfirmUser(null);
    setConfirmAction("");
  };

  /* ============================================================
     CANCEL CONFIRMATION
     ============================================================ */

  const handleCancel = () => {
    setShowConfirm(false);
    setSelectedConfirmUser(null);
    setConfirmAction("");
  };

  /* ============================================================
     TOGGLE USER STATUS
     ============================================================ */

  const handleToggleStatus = (
    user
  ) => {
    setSelectedConfirmUser(user);

    setConfirmAction(
      user.active
        ? "deactivate"
        : "activate"
    );

    setShowConfirm(true);
  };

  /* ============================================================
     UPDATE USER STATUS
     ============================================================ */

  const updateStatus = async (user) => {
    try {
      const payload = {
        employee_code:
          user.raw.employee_code,

        employee_name:
          user.raw.employee_name,

        official_email:
          user.raw.official_email,

        designation:
          user.raw.designation,

        reporting_manager_code:
          user.raw
            .reporting_manager_code,

        role_code:
          user.raw.role_code,

        active:
          !user.active,
      };

      console.log(
        "Update User Payload:",
        payload
      );

      await updateUserStatus(
        user.id,
        payload
      );

      toast.success(
        user.active
          ? "User deactivated successfully"
          : "User activated successfully"
      );

      await Promise.all([
        fetchUsers(),
        fetchUserStats(),
      ]);
    } catch (error) {
      console.error(
        "Update User Error:",
        error?.response?.data ||
          error
      );

      toast.error(
        "Unable to update user status"
      );
    }
  };

  /* ============================================================
     KPI CARDS
     ============================================================ */

  const statCards = [
    {
      id: "total",
      title: "Total Users",
      value: userStats.total,
      icon: Users,
    },

    {
      id: "active",
      title: "Active Users",
      value: userStats.active,
      icon: UserCheck,
    },

    {
      id: "inactive",
      title: "Inactive Users",
      value: userStats.inactive,
      icon: UserX,
    },

    {
      id: "noRole",
      title: "Users Without Role",
      value: userStats.noRole,
      icon: UserCog,
    },
  ];

  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {
    return (
      <div style={styles.skeleton}>
        <PageSkeleton />
      </div>
    );
  }

  /* ============================================================
     UI
     ============================================================ */

  return (
    <div style={styles.page}>
      <div style={styles.content}>

        {/* ======================================================
            PAGE HEADER
            ====================================================== */}

        <div style={styles.pageHeader}>
          <PageHeader
            title="Users"
            subtitle="Manage application users, their roles and account status."
            buttonText="Add User"
            buttonIcon={UserPlus}
            onButtonClick={() =>
              setShowAddUser(true)
            }
          />
        </div>


        {/* ======================================================
            KPI CARDS
            ====================================================== */}

        <div style={styles.kpiGrid}>
          {statCards.map(
            (item, index) => (
              <StatCard
                key={
                  item.id ||
                  item.title ||
                  index
                }
                {...item}
                delay={
                  index * 0.08
                }
              />
            )
          )}
        </div>


        {/* ======================================================
            FILTER BAR
            ====================================================== */}

        <div style={styles.filterWrapper}>
          <FilterBar
            search={search}
            setSearch={setSearch}
            placeholder="Search by name, email or employee code..."
            filters={[
              {
                label: "Status",
                options: [
                  "All",
                  "Active",
                  "Inactive",
                ],
                value: status,
                onChange: (
                  event
                ) =>
                  setStatus(
                    event.target.value
                  ),
              },

              {
                label: "Role",
                options:
                  roleOptions,
                value: role,
                onChange: (
                  event
                ) =>
                  setRole(
                    event.target.value
                  ),
              },

              {
                label:
                  "Legal Group",
                options:
                  legalGroupOptions,
                value:
                  legalGroup,
                onChange: (
                  event
                ) =>
                  setLegalGroup(
                    event.target.value
                  ),
              },
            ]}
            activeOnly={activeOnly}
            setActiveOnly={
              setActiveOnly
            }
            toggleLabel="Active Users Only"
            showMoreFilters
            onReset={resetFilters}
          />
        </div>


        {/* ======================================================
            USERS TABLE + DETAILS
            ====================================================== */}

        <div
          style={styles.tableDetailsGrid}
        >

          {/* USER TABLE */}

          <div style={styles.tableWrapper}>
            <UserTable
              users={currentUsers}
              total={
                filteredUsers.length
              }

              onEdit={handleEdit}

              onToggleStatus={
                handleToggleStatus
              }

              currentPage={
                currentPage
              }

              totalPages={
                totalPages
              }

              pageSize={pageSize}

              onPageChange={
                setCurrentPage
              }

              onPrevious={
                handlePrevious
              }

              onNext={handleNext}

              onFirst={handleFirst}

              onLast={handleLast}

              onPageSizeChange={
                handlePageSizeChange
              }

              selectedId={
                selectedUser?.id
              }

              onSelect={(user) => {
                console.log(
                  "Dashboard received:",
                  user.id,
                  user.name
                );

                setSelectedUser(
                  user
                );
              }}
            />
          </div>


          {/* USER DETAILS */}

          {selectedUser && (
            <div
              style={
                styles.detailsWrapper
              }
            >
              <UserDetails
                key={
                  selectedUser.id
                }
                user={selectedUser}
                onClose={() =>
                  setSelectedUser(
                    null
                  )
                }
                onEdit={handleEdit}
                onToggleStatus={
                  handleToggleStatus
                }
              />
            </div>
          )}
        </div>
      </div>


      {/* ========================================================
          FOOTER NOTE
          ======================================================== */}

      <div style={styles.footer}>
        <FooterNote
          title="Note:"
          message=" Deactivated users will not be able to login."
          lastUpdated="20 Jun 2026 10:15 AM"
          onRefresh={() =>
            console.log(
              "Refresh clicked"
            )
          }
        />
      </div>


      {/* ========================================================
          ADD / EDIT USER MODAL
          ======================================================== */}

      <AddUserModal
        open={
          showAddUser ||
          showEditUser
        }

        editUser={selectedUser}

        onClose={() => {
          setShowAddUser(false);
          setShowEditUser(false);
        }}

        onSuccess={() => {
          fetchUsers();

          setShowAddUser(false);
          setShowEditUser(false);
        }}
      />


      {/* ========================================================
          CONFIRMATION MODAL
          ======================================================== */}

      <ConfirmationModel
        open={showConfirm}

        title={
          confirmAction === "edit"
            ? "Edit User"
            : confirmAction ===
              "deactivate"
            ? "Deactivate User"
            : "Activate User"
        }

        message={
          selectedConfirmUser
            ? confirmAction ===
              "edit"
              ? `Do you want to edit ${selectedConfirmUser.name}?`
              : confirmAction ===
                "deactivate"
              ? `Are you sure you want to deactivate ${selectedConfirmUser.name}?`
              : `Are you sure you want to activate ${selectedConfirmUser.name}?`
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

        onConfirm={
          handleConfirm
        }

        onCancel={
          handleCancel
        }
      />
    </div>
  );
}