
// // import { useState, useMemo, useEffect } from "react";
// // import {
// //     UserPlus, Users, UserCheck, UserX, ShieldAlert, UserCog, Edit, Shield,
// //     Building2, Building, Layers, GitBranch, Briefcase, BarChart3,
// // } from "lucide-react";
// // import ConfirmationModel from "../components/Common/ConfirmationModel";

// // import HierarchyTree from "../components/userAccess/HierarchyTree";
// // import toast from "react-hot-toast";
// // import AdminLayout from "../components/Layout/AdminLayout";
// // import PageHeader from "../components/Common/PageHeader";
// // import FilterBar from "../components/Common/FilterBar";
// // import StatCard from "../components/StatCard";
// // import UserTable from "../components/users/UserTable";
// // import UserDetails from "../components/users/UserDetails";
// // import FooterNote from "../components/FooterNote";
// // import AddUserModal from "../components/users/AddUserModal";
// // import SelectedUserCard from "../components/userAccess/SelectUserCard";
// // import { stats, departments, } from "../data/dummyData";
// // import { getUserAccessSummary } from "../api/userAccessApi";
// // import { getUsers, getRoles, getLegalGroups, updateUserStatus } from "../api/userApi";
// // import PageSkeleton from "../components/Common/PageSkeleton";
// // import {
// //     getUserAccess,
// //     saveUserAccess,
// //     getOrganizationTree,
// // } from "../api/userAccessApi";


// // export default function UserAccessMangement() {

// //     /* -------------------- STATES -------------------- */
// //     const [search, setSearch] = useState("");
// //     const [status, setStatus] = useState("All");

// //     const [role, setRole] = useState("All");
// //     const [roleOptions, setRoleOptions] = useState(["All"]);

// //     const [legalGroup, setLegalGroup] = useState("All");
// //     const [legalGroupOptions, setLegalGroupOptions] = useState(["All"]);

// //     const [activeOnly, setActiveOnly] = useState(false);
// //     const [users, setUsers] = useState([]);
// //     const [selectedUser, setSelectedUser] = useState(null);

// //     const [showAddUser, setShowAddUser] = useState(false);
// //     const [showEditUser, setShowEditUser] = useState(false);
// //     const [editingUser, setEditingUser] = useState(null);

// //     const [loading, setLoading] = useState(false);
// //     const [showConfirm, setShowConfirm] = useState(false);
// //     const [saving, setSaving] = useState(false);
// //     const [showEditConfirm, setShowEditConfirm] = useState(false);
// //     const [userToEdit, setUserToEdit] = useState(null);

// //     const [summaryCards, setSummaryCards] = useState([]);

// //     const [hierarchyTree, setHierarchyTree] = useState([]);
// //     const [selectedAccess, setSelectedAccess] = useState([]);
// //     const [accessSummary, setAccessSummary] = useState({});


// //     /* -------------------- PAGINATION -------------------- */
// //     const [currentPage, setCurrentPage] = useState(1);
// //     const [pageSize, setPageSize] = useState(10);



// //     const normalizeOrgTree = (nodes = []) => {
// //         const prefixMap = {
// //             legal_group: "LG",
// //             legal_entity: "LE",
// //             parent_division: "PD",
// //             subdivision: "SD",
// //             business_unit: "BU",
// //             analysis_code: "AC",
// //         };

// //         return nodes.map((node) => ({
// //             id: `${prefixMap[node.type]}_${node.id}`,
// //             label: node.name,
// //             code: node.code,
// //             type: node.type,

// //             children: normalizeOrgTree(
// //                 node.children || []
// //             ),
// //         }));
// //     };

// //     /* -------------------- FETCH USERS -------------------- */

// //     const fetchUsers = async () => {
// //         try {
// //             setLoading(true);
// //             const response = await getUsers();
// //             console.log("Users API Response:", response.data);

// //             console.table(
// //                 response.data.map((u) => ({
// //                     id: u.user_profile_id,
// //                     name: u.employee_name,
// //                 }))
// //             );
// //             const formattedUsers = response.data.map((user) => ({
// //                 id: user.user_profile_id,
// //                 code: user.employee_code,
// //                 name: user.employee_name,
// //                 email: user.official_email,

// //                 role: user.role_code,

// //                 active: user.active,
// //                 status: user.active ? "Active" : "Inactive",

// //                 legalGroup:
// //                     user.legal_groups?.[0]?.legal_group_code ?? "-",

// //                 raw: user,
// //             }));

// //             setUsers(formattedUsers);
// //             if (formattedUsers.length > 0) {

// //                 let userToSelect = formattedUsers[0];

// //                 if (selectedUser) {
// //                     userToSelect =
// //                         formattedUsers.find(
// //                             (u) => u.id === selectedUser.id
// //                         ) || formattedUsers[0];
// //                 }

// //                 setSelectedUser(userToSelect);

// //                 // Automatically load this user's access
// //                 await loadUserAccess(userToSelect.id);
// //             }

// //         } catch (error) {
// //             console.error("Users API Error:", error);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };
// //     console.log("........", status);
// //     console.log("----------", activeOnly);
// //     /* -------------------- FETCH ROLES -------------------- */
// //     const fetchRoles = async () => {
// //         try {
// //             const response = await getRoles();
// //             console.log(response.data);
// //             const roles = response.data.map((item, index) => ({
// //                 id: index + 1,
// //                 code: item.role_code,
// //                 name: item.role_name,
// //             }));
// //             setRoleOptions([
// //                 {
// //                     id: 0,
// //                     code: "All",
// //                     name: "All",
// //                 },
// //                 ...roles,
// //             ]);

// //         } catch (error) {
// //             console.error(error);
// //         }
// //     };

// //     /* -------------------- FETCH LEGAL GROUPS -------------------- */
// //     const fetchLegalGroups = async () => {
// //         try {
// //             const response = await getLegalGroups();

// //             const groups = (response.data || []).map((item) => ({
// //                 id: item.legal_group_id,
// //                 code: item.legal_group_code,
// //                 name: item.legal_group_name,
// //             }));

// //             setLegalGroupOptions([
// //                 {
// //                     id: 0,
// //                     code: "All",
// //                     name: "All",
// //                 },
// //                 ...groups,
// //             ]);

// //         } catch (error) {
// //             console.error(
// //                 "Legal Groups API Error:",
// //                 error.response?.data || error
// //             );
// //         }
// //     };

// //     // called from SelectedUserCard
// //     const handleSaveClick = () => {
// //         setShowConfirm(true);
// //     };

// //     {/*------Load HierarchyTree---------*/ }
// //     const loadOrganizationHierarchy = async () => {
// //         try {
// //             const response = await getOrganizationTree();

// //             console.log(
// //                 "Organization Tree API:",
// //                 response.data
// //             );

// //             const rawTree = response.data?.data || [];

// //             const normalizedTree =
// //                 normalizeOrgTree(rawTree);

// //             console.log(
// //                 "Normalized Organization Tree:",
// //                 normalizedTree
// //             );

// //             setHierarchyTree(normalizedTree);

// //         } catch (error) {
// //             console.error(
// //                 "Failed to load organization hierarchy:",
// //                 error.response?.data || error
// //             );

// //             setHierarchyTree([]);
// //         }
// //     };

// //     const loadUserAccess = async (userId) => {
// //         try {
// //             const { data } = await getUserAccess(userId);

// //             const selected = new Set();

// //             data.forEach((item) => {
// //                 if (item.legal_group_id)
// //                     selected.add(`LG_${item.legal_group_id}`);

// //                 if (item.legal_entity_id)
// //                     selected.add(`LE_${item.legal_entity_id}`);

// //                 if (item.parent_division_id)
// //                     selected.add(`PD_${item.parent_division_id}`);

// //                 if (item.subdivision_id)
// //                     selected.add(`SD_${item.subdivision_id}`);

// //                 if (item.business_unit_id)
// //                     selected.add(`BU_${item.business_unit_id}`);

// //                 if (item.analysis_code_id)
// //                     selected.add(`AC_${item.analysis_code_id}`);
// //             });

// //             const selectedArray = [...selected];

// //             setSelectedAccess(selectedArray);

// //             console.log("User Access API:", data);
// //             console.log("Unique Selected Access:", selectedArray);

// //         } catch (error) {
// //             console.error(
// //                 "Failed to load user access:",
// //                 error.response?.data || error
// //             );

// //             setSelectedAccess([]);
// //         }
// //     };
// //     const buildAccessPayload = () => {
// //         return {
// //             legal_group_ids: selectedAccess
// //                 .filter((id) => id.startsWith("LG_"))
// //                 .map((id) => Number(id.replace("LG_", ""))),

// //             legal_entity_ids: selectedAccess
// //                 .filter((id) => id.startsWith("LE_"))
// //                 .map((id) => Number(id.replace("LE_", ""))),

// //             parent_division_ids: selectedAccess
// //                 .filter((id) => id.startsWith("PD_"))
// //                 .map((id) => Number(id.replace("PD_", ""))),

// //             subdivision_ids: selectedAccess
// //                 .filter((id) => id.startsWith("SD_"))
// //                 .map((id) => Number(id.replace("SD_", ""))),

// //             business_unit_ids: selectedAccess
// //                 .filter((id) => id.startsWith("BU_"))
// //                 .map((id) => Number(id.replace("BU_", ""))),

// //             analysis_code_ids: selectedAccess
// //                 .filter((id) => id.startsWith("AC_"))
// //                 .map((id) => Number(id.replace("AC_", ""))),
// //         };
// //     };

// //     {/*.........When a user is selected........... */ }
// //     const handleUserSelect = async (user) => {
// //         setSelectedUser(user);
// //         await loadUserAccess(user.id);
// //     };

// //     const handleConfirmSave = async () => {
// //         if (!selectedUser) return;

// //         try {
// //             setSaving(true);

// //             const payload = buildAccessPayload();

// //             console.log("SAVE ACCESS PAYLOAD:", payload);

// //             await saveUserAccess(selectedUser.id, payload);

// //             toast.success("User access updated successfully");

// //             setShowConfirm(false);

// //             // Reload saved access from backend
// //             await loadUserAccess(selectedUser.id);

// //         } catch (error) {
// //             console.error(
// //                 "Save access error:",
// //                 error.response?.data || error
// //             );

// //             toast.error(
// //                 error.response?.data?.detail ||
// //                 "Failed to update user access"
// //             );
// //         } finally {
// //             setSaving(false);
// //         }
// //     };

// //     /* -------------------- FETCH CARDS DATA -------------------- */
// //     const fetchSummaryCards = async () => {
// //         try {
// //             const { data } = await getUserAccessSummary();

// //             setSummaryCards([
// //                 {
// //                     label: "Total Users",
// //                     value: data.users,
// //                     description: "Active users",
// //                     icon: Users,
// //                     color: "blue",
// //                 },
// //                 {
// //                     label: "Active Accesses",
// //                     value: data.active_accesses,
// //                     description: "Active acceses",
// //                     icon: Shield,
// //                     color: "purple",
// //                 },
// //                 {
// //                     label: "Legal Groups",
// //                     value: data.legal_groups,
// //                     description: "Active groups",
// //                     icon: Building2,
// //                     color: "orange",
// //                 },
// //                 {
// //                     label: "Legal Entities",
// //                     value: data.legal_entities,
// //                     description: "Total entities",
// //                     icon: Building,
// //                     color: "teal",
// //                 },
// //                 {
// //                     label: "Parent Divisions",
// //                     value: data.parent_divisions,
// //                     description: "Total divisions",
// //                     icon: Layers,
// //                     color: "blue",
// //                 },
// //                 {
// //                     label: "Subdivisions",
// //                     value: data.subdivisions,
// //                     description: "Total subdivisions",
// //                     icon: GitBranch,
// //                     color: "indigo",
// //                 },
// //                 {
// //                     label: "Business Units",
// //                     value: data.business_units,
// //                     description: "Total units",
// //                     icon: Briefcase,
// //                     color: "blue",
// //                 },
// //                 {
// //                     label: "Analysis Codes",
// //                     value: data.analysis_codes,
// //                     description: "Total codes",
// //                     icon: BarChart3,
// //                     color: "blue",
// //                 },
// //             ]);
// //         } catch (error) {
// //             console.error(error);
// //         }
// //     };
// //     /* -------------------- PAGE LOAD -------------------- */

// //     useEffect(() => {

// //         loadOrganizationHierarchy();

// //         fetchUsers();

// //         fetchRoles();

// //         fetchLegalGroups();

// //         fetchSummaryCards();

// //     }, []);
// //     useEffect(() => {
// //         setCurrentPage(1);
// //     }, [
// //         search,
// //         status,
// //         role,
// //         //department,
// //         legalGroup,
// //         activeOnly,
// //     ]);

// //     {/*.... Get Access Summary......*/ }
// //     useEffect(() => {
// //         const summary = {
// //             legalGroups: 0,
// //             legalEntities: 0,
// //             parentDivisions: 0,
// //             subdivisions: 0,
// //             businessUnits: 0,
// //             analysisCodes: 0,
// //         };

// //         selectedAccess.forEach((id) => {
// //             if (id.startsWith("LG_")) summary.legalGroups++;
// //             if (id.startsWith("LE_")) summary.legalEntities++;
// //             if (id.startsWith("PD_")) summary.parentDivisions++;
// //             if (id.startsWith("SD_")) summary.subdivisions++;
// //             if (id.startsWith("BU_")) summary.businessUnits++;
// //             if (id.startsWith("AC_")) summary.analysisCodes++;
// //         });
// //         setAccessSummary(summary);
// //     }, [selectedAccess]);

// //     /* -------------------- RESET FILTERS -------------------- */

// //     const resetFilters = () => {
// //         setSearch("");
// //         setStatus("All");
// //         setRole("All");
// //         setLegalGroup("All");
// //         setActiveOnly(false);
// //         setSelectedAccess([]);
// //     };

// //     /* -------------------- FILTER USERS -------------------- */
// //     const filteredUsers = useMemo(() => {
// //         return users.filter((user) => {

// //             const searchValue = search.trim().toLowerCase();

// //             const matchesSearch =
// //                 (user.name || "").toLowerCase().includes(searchValue) ||
// //                 (user.email || "").toLowerCase().includes(searchValue) ||
// //                 (user.code || "").toLowerCase().includes(searchValue);

// //             const matchesStatus =
// //                 status === "All" ||
// //                 user.status === status;

// //             const matchesRole =
// //                 role === "All" ||
// //                 user.role === role;

// //             const matchesLegalGroup =
// //                 legalGroup === "All" ||
// //                 String(user.legalGroup || "")
// //                     .trim()
// //                     .toLowerCase() ===
// //                 String(legalGroup || "")
// //                     .trim()
// //                     .toLowerCase();

// //             const matchesActive =
// //                 !activeOnly ||
// //                 user.status === "Active";

// //             return (
// //                 matchesSearch &&
// //                 matchesStatus &&
// //                 matchesRole &&
// //                 matchesLegalGroup &&
// //                 matchesActive
// //             );
// //         });
// //     }, [users, search, status, role, legalGroup, activeOnly,]);

// //     /* -------------------- PAGINATION -------------------- */

// //     const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
// //     const startIndex = (currentPage - 1) * pageSize;
// //     const endIndex = startIndex + pageSize;
// //     const currentUsers = filteredUsers.slice(
// //         startIndex,
// //         endIndex
// //     );
// //     const handlePrevious = () => {
// //         if (currentPage > 1) {
// //             setCurrentPage((prev) => prev - 1);
// //         }
// //     };

// //     const handleNext = () => {
// //         if (currentPage < totalPages) {
// //             setCurrentPage((prev) => prev + 1);
// //         }
// //     };

// //     const handleFirst = () => {
// //         setCurrentPage(1);
// //     };

// //     const handleLast = () => {
// //         setCurrentPage(totalPages);
// //     };

// //     const handlePageSizeChange = (e) => {
// //         setPageSize(Number(e.target.value));
// //         setCurrentPage(1);
// //     };
// //     /* -------------------- EDIT USER FORM-------------------- */
// //     const handleEdit = (user) => {
// //         setUserToEdit(user);
// //         setShowEditConfirm(true);
// //         <div className="w-90 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
// //             <div className="flex items-start gap-3">
// //                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
// //                     <Edit className="h-5 w-5 text-blue-600" />
// //                 </div>

// //                 <div className="flex-1">
// //                     <h3 className="text-sm font-semibold text-gray-900">
// //                         Edit User
// //                     </h3>

// //                     <p className="mt-1 text-xs text-gray-600">
// //                         Do you want to edit{" "}
// //                         <span className="font-semibold">
// //                             {user.name}
// //                         </span>
// //                         ?
// //                     </p>
// //                     <div className="mt-4 flex justify-end gap-2">
// //                         <button
// //                             onClick={() => toast.dismiss(t.id)}
// //                             className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
// //                         >Cancel</button>

// //                         <button
// //                             onClick={() => {
// //                                 toast.dismiss(t.id);
// //                                 setSelectedUser(user);
// //                                 setShowEditUser(true);
// //                             }}
// //                             className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
// //                         >Edit
// //                         </button>
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     };

// //     const handleConfirmEdit = () => {
// //         setShowEditConfirm(false);
// //         setSelectedUser(userToEdit);
// //         setShowEditUser(true);
// //         setUserToEdit(null);
// //     };

// //     const handleCancelEdit = () => {
// //         setShowEditConfirm(false);
// //         setUserToEdit(null);
// //     };

// //     const handleToggleStatus = async (user) => {
// //         try {
// //             const payload = {
// //                 employee_code: user.raw.employee_code,
// //                 employee_name: user.raw.employee_name,
// //                 official_email: user.raw.official_email,
// //                 designation: user.raw.designation,
// //                 department: user.raw.department,
// //                 reporting_manager_code: user.raw.reporting_manager_code,
// //                 role_code: user.raw.role_code,
// //                 active: !user.active,
// //             };

// //             console.log("Payload:", payload);
// //             console.log(user.raw);

// //             await updateUserStatus(user.id, payload);

// //             toast.success(
// //                 user.active
// //                     ? "User deactivated successfully"
// //                     : "User activated successfully"
// //             );

// //             await fetchUsers();
// //         } catch (error) {
// //             console.error(error.response?.data);
// //             toast.error("Unable to update user status");
// //         }
// //     };
// //     /* -------------------- KPI CARDS -------------------- */

// //     const statCards = stats.map((item) => {
// //         let icon = Users;
// //         switch (item.id) {

// //             case "total":
// //                 icon = Users;
// //                 break;

// //             case "active":
// //                 icon = UserCheck;
// //                 break;

// //             case "inactive":
// //                 icon = UserX;
// //                 break;

// //             case "locked":
// //                 icon = ShieldAlert;
// //                 break;

// //             case "noRole":
// //                 icon = UserCog;
// //                 break;

// //             default:
// //                 icon = Users;

// //         }

// //         return {
// //             ...item,
// //             icon,
// //         };

// //     });
// //     console.log("Active Only:", activeOnly);
// //     /* -------------------- LOADING -------------------- */

// //     if (loading) {
// //         return (
// //             <div className="p-4">
// //                 <PageSkeleton />
// //             </div>
// //         );
// //     }
// //     /* ---------- PART 2 STARTS WITH RETURN ---------- */
// //     return (

// //         <div className="flex flex-col gap-0.5">
// //             {/* HEADER */}
// //             <div>
// //                 <PageHeader
// //                     title="User Access Management"
// //                     subtitle="Manage users and define their access to Legal Entities, Divisions, SubDivisions and Business Units."
// //                     buttonText="Assign Access"
// //                     buttonIcon={Shield}
// //                     onButtonClick={() => {
// //                         if (!selectedUser) {
// //                             toast("Please select a user first.");
// //                             return;
// //                         }

// //                         setUserToEdit(selectedUser);
// //                         setShowEditConfirm(true);
// //                     }}
// //                 />

// //                 <AddUserModal
// //                     open={showAddUser || showEditUser}
// //                     editUser={selectedUser}
// //                     onClose={() => {
// //                         setShowAddUser(false);
// //                         setShowEditUser(false);
// //                     }}
// //                     onSuccess={() => {
// //                         fetchUsers();
// //                         setShowAddUser(false);
// //                         setShowEditUser(false);
// //                     }}
// //                 />

// //                 {/* KPI CARDS */}
// //                 <div className="grid grid-cols-8 gap-2.5">
// //                     {summaryCards.map((item, index) => (
// //                         <StatCard
// //                             key={item.key || item.title || index}
// //                             {...item}
// //                             delay={index * 0.08}
// //                         />
// //                     ))}
// //                 </div>
// //                 {/* FILTER BAR */}
// //                 <FilterBar
// //                     customOrder={true}
// //                     search={search}
// //                     setSearch={setSearch}
// //                     placeholder="Search by name, email or employee code..."
// //                     filters={[
// //                         {
// //                             label: "Status",
// //                             options: ["All", "Active", "Inactive"],
// //                             value: status,
// //                             onChange: (e) => setStatus(e.target.value),
// //                         },
// //                         {
// //                             label: "Role",
// //                             options: roleOptions,
// //                             value: role,
// //                             onChange: (e) => setRole(e.target.value),
// //                         },
// //                         {
// //                             label: "Legal Group",
// //                             options: legalGroupOptions,
// //                             value: legalGroup,
// //                             onChange: (e) => setLegalGroup(e.target.value),
// //                         },
// //                     ]}
// //                     activeOnly={activeOnly}
// //                     setActiveOnly={setActiveOnly}
// //                     toggleLabel="Active Users Only"
// //                     showMoreFilters
// //                     onReset={resetFilters}
// //                 />
// //                 {/* ================= USER TABLE + Hierarchy+ userdetails ================= */}
// //                 <div className=" grid grid-cols-[40%_30%_30%] gap-3 w-full h-[calc(100vh-310px)] min-h-0 overflow-hidden">

// //                     {/* ================= USER TABLE 40% ================= */}
// //                     <div className=" min-w-0 w-full h-full overflow-hidden">
// //                         <UserTable
// //                             compactAccess={true}
// //                             users={currentUsers}
// //                             total={filteredUsers.length}
// //                             onEdit={handleEdit}
// //                             onToggleStatus={handleToggleStatus}
// //                             currentPage={currentPage}
// //                             totalPages={totalPages}
// //                             pageSize={pageSize}
// //                             onPageChange={setCurrentPage}
// //                             onPrevious={handlePrevious}
// //                             onNext={handleNext}
// //                             onFirst={handleFirst}
// //                             onLast={handleLast}
// //                             onPageSizeChange={handlePageSizeChange}
// //                             selectedId={selectedUser?.id}
// //                             onSelect={handleUserSelect} />
// //                     </div>
// //                     {/* ================= HIERARCHY 30% ================= */}
// //                     <div className="min-w-0 h-full min-h-0 overflow-hidden flex ">
// //                         <HierarchyTree
// //                             tree={hierarchyTree}
// //                             selected={selectedAccess}
// //                             setSelected={setSelectedAccess}
// //                         />
// //                     </div>
// //                     {/* ================= USER DETAILS 30% ================= */}

// //                     <div className="w-92.5 h-full min-h-0 overflow-hidden">
// //                         {
// //                             selectedUser && (
// //                                 <SelectedUserCard
// //                                     user={selectedUser}
// //                                     accessSummary={accessSummary}
// //                                     onSave={() => setShowConfirm(true)}
// //                                     onClose={() => {
// //                                         setSelectedUser(null);
// //                                     }}
// //                                 />
// //                             )
// //                         }
// //                     </div>
// //                 </div>
// //             </div>

// //             {/* FOOTER */}
// //             <div className="fixed bottom-0 left-55 right-0 border-t border-gray-200 bg-white px-3 py-1 shadow-sm">
// //                 <FooterNote
// //                     title="Note:"
// //                     message="Deactivated users will not be able to login. Locked users are blocked due to multiple failed login attempts."
// //                     lastUpdated="20 Jun 2026 10:15 AM"
// //                     onRefresh={() => console.log("Refresh clicked")}
// //                 />
// //             </div>
// //             <AddUserModal
// //                 open={showAddUser}
// //                 onClose={() => setShowAddUser(false)}
// //                 onSuccess={() => {
// //                     fetchUsers();
// //                     setShowAddUser(false);
// //                 }}
// //             />

// //             <ConfirmationModel
// //                 open={showConfirm}
// //                 title="Save Access?"
// //                 message={`Do you want to save access changes for ${selectedUser?.name}?`}
// //                 confirmText={saving ? "Saving..." : "Save"}
// //                 cancelText="Cancel"
// //                 onCancel={() => setShowConfirm(false)}
// //                 onConfirm={handleConfirmSave}
// //             />

// //             <ConfirmationModel
// //                 open={showEditConfirm}
// //                 title="Assign Access?"
// //                 message={
// //                     `Do you want to assign access for ${userToEdit?.name}?`
// //                 }
// //                 confirmText="Assign Access"
// //                 cancelText="Cancel"
// //                 onCancel={handleCancelEdit}
// //                 onConfirm={handleConfirmEdit}
// //             />
// //         </div>
// //     );
// // }

// import { useState, useMemo, useEffect } from "react";
// import {
//     UserPlus, Users, UserCheck, UserX, ShieldAlert, UserCog, Edit, Shield,
//     Building2, Building, Layers, GitBranch, Briefcase, BarChart3,
// } from "lucide-react";
// import ConfirmationModel from "../components/Common/ConfirmationModel";

// import HierarchyTree from "../components/userAccess/HierarchyTree";
// import toast from "react-hot-toast";
// import AdminLayout from "../components/Layout/AdminLayout";
// import PageHeader from "../components/Common/PageHeader";
// import FilterBar from "../components/Common/FilterBar";
// import StatCard from "../components/StatCard";
// import UserTable from "../components/users/UserTable";
// import UserDetails from "../components/users/UserDetails";
// import FooterNote from "../components/FooterNote";
// import AddUserModal from "../components/users/AddUserModal";
// import SelectedUserCard from "../components/userAccess/SelectUserCard";
// import { stats, departments, } from "../data/dummyData";
// import { getUserAccessSummary } from "../api/userAccessApi";
// import { getUsers, getRoles, getLegalGroups, updateUserStatus } from "../api/userApi";
// import PageSkeleton from "../components/Common/PageSkeleton";
// import {
//     getUserAccess,
//     saveUserAccess,
//     getOrganizationTree,
// } from "../api/userAccessApi";


// export default function UserAccessMangement() {

//     /* -------------------- STATES -------------------- */
//     const [search, setSearch] = useState("");
//     const [status, setStatus] = useState("All");

//     const [role, setRole] = useState("All");
//     const [roleOptions, setRoleOptions] = useState(["All"]);

//     const [legalGroup, setLegalGroup] = useState("All");
//     const [legalGroupOptions, setLegalGroupOptions] = useState(["All"]);

//     const [activeOnly, setActiveOnly] = useState(false);
//     const [users, setUsers] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null);

//     const [showAddUser, setShowAddUser] = useState(false);
//     const [showEditUser, setShowEditUser] = useState(false);
//     const [editingUser, setEditingUser] = useState(null);

//     const [loading, setLoading] = useState(false);
//     const [showConfirm, setShowConfirm] = useState(false);
//     const [saving, setSaving] = useState(false);
//     const [showEditConfirm, setShowEditConfirm] = useState(false);
//     const [userToEdit, setUserToEdit] = useState(null);

//     const [summaryCards, setSummaryCards] = useState([]);

//     const [hierarchyTree, setHierarchyTree] = useState([]);
//     const [selectedAccess, setSelectedAccess] = useState([]);
//     const [accessSummary, setAccessSummary] = useState({});


//     /* -------------------- PAGINATION -------------------- */
//     const [currentPage, setCurrentPage] = useState(1);
//     const [pageSize, setPageSize] = useState(10);


//     const normalizeOrgTree = (nodes = []) => {
//         const prefixMap = {
//             legal_group: "LG",
//             legal_entity: "LE",
//             parent_division: "PD",
//             subdivision: "SD",
//             business_unit: "BU",
//             analysis_code: "AC",
//         };

//         return nodes.map((node) => ({
//             id: `${prefixMap[node.type]}_${node.id}`,
//             label: node.name,
//             code: node.code,
//             type: node.type,

//             children: normalizeOrgTree(
//                 node.children || []
//             ),
//         }));
//     };


//     /* -------------------- FETCH USERS -------------------- */

//     const fetchUsers = async () => {
//         try {
//             setLoading(true);
//             const response = await getUsers();
//             console.log("Users API Response:", response.data);

//             console.table(
//                 response.data.map((u) => ({
//                     id: u.user_profile_id,
//                     name: u.employee_name,
//                 }))
//             );

//             const formattedUsers = response.data.map((user) => ({
//                 id: user.user_profile_id,
//                 code: user.employee_code,
//                 name: user.employee_name,
//                 email: user.official_email,

//                 role: user.role_code,

//                 active: user.active,
//                 status: user.active ? "Active" : "Inactive",

//                 legalGroup:
//                     user.legal_groups?.[0]?.legal_group_code ?? "-",

//                 raw: user,
//             }));

//             setUsers(formattedUsers);

//             if (formattedUsers.length > 0) {

//                 let userToSelect = formattedUsers[0];

//                 if (selectedUser) {
//                     userToSelect =
//                         formattedUsers.find(
//                             (u) => u.id === selectedUser.id
//                         ) || formattedUsers[0];
//                 }

//                 setSelectedUser(userToSelect);

//                 // Automatically load this user's access
//                 await loadUserAccess(userToSelect.id);
//             }

//         } catch (error) {
//             console.error("Users API Error:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     console.log("........", status);
//     console.log("----------", activeOnly);


//     /* -------------------- FETCH ROLES -------------------- */

//     const fetchRoles = async () => {
//         try {
//             const response = await getRoles();
//             console.log(response.data);

//             const roles = response.data.map((item, index) => ({
//                 id: index + 1,
//                 code: item.role_code,
//                 name: item.role_name,
//             }));

//             setRoleOptions([
//                 {
//                     id: 0,
//                     code: "All",
//                     name: "All",
//                 },
//                 ...roles,
//             ]);

//         } catch (error) {
//             console.error(error);
//         }
//     };


//     /* -------------------- FETCH LEGAL GROUPS -------------------- */

//     const fetchLegalGroups = async () => {
//         try {
//             const response = await getLegalGroups();

//             const groups = (response.data || []).map((item) => ({
//                 id: item.legal_group_id,
//                 code: item.legal_group_code,
//                 name: item.legal_group_name,
//             }));

//             setLegalGroupOptions([
//                 {
//                     id: 0,
//                     code: "All",
//                     name: "All",
//                 },
//                 ...groups,
//             ]);

//         } catch (error) {
//             console.error(
//                 "Legal Groups API Error:",
//                 error.response?.data || error
//             );
//         }
//     };


//     // called from SelectedUserCard
//     const handleSaveClick = () => {
//         setShowConfirm(true);
//     };


//     {/*------Load HierarchyTree---------*/ }

//     const loadOrganizationHierarchy = async () => {
//         try {
//             const response = await getOrganizationTree();

//             console.log(
//                 "Organization Tree API:",
//                 response.data
//             );

//             const rawTree = response.data?.data || [];

//             const normalizedTree =
//                 normalizeOrgTree(rawTree);

//             console.log(
//                 "Normalized Organization Tree:",
//                 normalizedTree
//             );

//             setHierarchyTree(normalizedTree);

//         } catch (error) {
//             console.error(
//                 "Failed to load organization hierarchy:",
//                 error.response?.data || error
//             );

//             setHierarchyTree([]);
//         }
//     };


//     const loadUserAccess = async (userId) => {
//         try {
//             const { data } = await getUserAccess(userId);

//             const selected = new Set();

//             data.forEach((item) => {
//                 if (item.legal_group_id)
//                     selected.add(`LG_${item.legal_group_id}`);

//                 if (item.legal_entity_id)
//                     selected.add(`LE_${item.legal_entity_id}`);

//                 if (item.parent_division_id)
//                     selected.add(`PD_${item.parent_division_id}`);

//                 if (item.subdivision_id)
//                     selected.add(`SD_${item.subdivision_id}`);

//                 if (item.business_unit_id)
//                     selected.add(`BU_${item.business_unit_id}`);

//                 if (item.analysis_code_id)
//                     selected.add(`AC_${item.analysis_code_id}`);
//             });

//             const selectedArray = [...selected];

//             setSelectedAccess(selectedArray);

//             console.log("User Access API:", data);
//             console.log("Unique Selected Access:", selectedArray);

//         } catch (error) {
//             console.error(
//                 "Failed to load user access:",
//                 error.response?.data || error
//             );

//             setSelectedAccess([]);
//         }
//     };


//     const buildAccessPayload = () => {
//         return {
//             legal_group_ids: selectedAccess
//                 .filter((id) => id.startsWith("LG_"))
//                 .map((id) => Number(id.replace("LG_", ""))),

//             legal_entity_ids: selectedAccess
//                 .filter((id) => id.startsWith("LE_"))
//                 .map((id) => Number(id.replace("LE_", ""))),

//             parent_division_ids: selectedAccess
//                 .filter((id) => id.startsWith("PD_"))
//                 .map((id) => Number(id.replace("PD_", ""))),

//             subdivision_ids: selectedAccess
//                 .filter((id) => id.startsWith("SD_"))
//                 .map((id) => Number(id.replace("SD_", ""))),

//             business_unit_ids: selectedAccess
//                 .filter((id) => id.startsWith("BU_"))
//                 .map((id) => Number(id.replace("BU_", ""))),

//             analysis_code_ids: selectedAccess
//                 .filter((id) => id.startsWith("AC_"))
//                 .map((id) => Number(id.replace("AC_", ""))),
//         };
//     };


//     {/*.........When a user is selected........... */ }

//     const handleUserSelect = async (user) => {
//         setSelectedUser(user);
//         await loadUserAccess(user.id);
//     };


//     const handleConfirmSave = async () => {
//         if (!selectedUser) return;

//         try {
//             setSaving(true);

//             const payload = buildAccessPayload();

//             console.log("SAVE ACCESS PAYLOAD:", payload);

//             await saveUserAccess(selectedUser.id, payload);

//             toast.success("User access updated successfully");

//             setShowConfirm(false);

//             // Reload saved access from backend
//             await loadUserAccess(selectedUser.id);

//         } catch (error) {
//             console.error(
//                 "Save access error:",
//                 error.response?.data || error
//             );

//             toast.error(
//                 error.response?.data?.detail ||
//                 "Failed to update user access"
//             );
//         } finally {
//             setSaving(false);
//         }
//     };


//     /* -------------------- FETCH CARDS DATA -------------------- */

//     const fetchSummaryCards = async () => {
//         try {
//             const { data } = await getUserAccessSummary();

//             setSummaryCards([
//                 {
//                     label: "Total Users",
//                     value: data.users,
//                     description: "Active users",
//                     icon: Users,
//                     color: "blue",
//                 },
//                 {
//                     label: "Active Accesses",
//                     value: data.active_accesses,
//                     description: "Active acceses",
//                     icon: Shield,
//                     color: "purple",
//                 },
//                 {
//                     label: "Legal Groups",
//                     value: data.legal_groups,
//                     description: "Active groups",
//                     icon: Building2,
//                     color: "orange",
//                 },
//                 {
//                     label: "Legal Entities",
//                     value: data.legal_entities,
//                     description: "Total entities",
//                     icon: Building,
//                     color: "teal",
//                 },
//                 {
//                     label: "Parent Divisions",
//                     value: data.parent_divisions,
//                     description: "Total divisions",
//                     icon: Layers,
//                     color: "blue",
//                 },
//                 {
//                     label: "Subdivisions",
//                     value: data.subdivisions,
//                     description: "Total subdivisions",
//                     icon: GitBranch,
//                     color: "indigo",
//                 },
//                 {
//                     label: "Business Units",
//                     value: data.business_units,
//                     description: "Total units",
//                     icon: Briefcase,
//                     color: "blue",
//                 },
//                 {
//                     label: "Analysis Codes",
//                     value: data.analysis_codes,
//                     description: "Total codes",
//                     icon: BarChart3,
//                     color: "blue",
//                 },
//             ]);

//         } catch (error) {
//             console.error(error);
//         }
//     };


//     /* -------------------- PAGE LOAD -------------------- */

//     useEffect(() => {

//         loadOrganizationHierarchy();

//         fetchUsers();

//         fetchRoles();

//         fetchLegalGroups();

//         fetchSummaryCards();

//     }, []);


//     useEffect(() => {
//         setCurrentPage(1);
//     }, [
//         search,
//         status,
//         role,
//         //department,
//         legalGroup,
//         activeOnly,
//     ]);


//     {/*.... Get Access Summary......*/ }

//     useEffect(() => {
//         const summary = {
//             legalGroups: 0,
//             legalEntities: 0,
//             parentDivisions: 0,
//             subdivisions: 0,
//             businessUnits: 0,
//             analysisCodes: 0,
//         };

//         selectedAccess.forEach((id) => {
//             if (id.startsWith("LG_")) summary.legalGroups++;
//             if (id.startsWith("LE_")) summary.legalEntities++;
//             if (id.startsWith("PD_")) summary.parentDivisions++;
//             if (id.startsWith("SD_")) summary.subdivisions++;
//             if (id.startsWith("BU_")) summary.businessUnits++;
//             if (id.startsWith("AC_")) summary.analysisCodes++;
//         });

//         setAccessSummary(summary);

//     }, [selectedAccess]);


//     /* -------------------- RESET FILTERS -------------------- */

//     const resetFilters = () => {
//         setSearch("");
//         setStatus("All");
//         setRole("All");
//         setLegalGroup("All");
//         setActiveOnly(false);
//         setSelectedAccess([]);
//     };


//     /* -------------------- FILTER USERS -------------------- */

//     const filteredUsers = useMemo(() => {
//         return users.filter((user) => {

//             const searchValue = search.trim().toLowerCase();

//             const matchesSearch =
//                 (user.name || "").toLowerCase().includes(searchValue) ||
//                 (user.email || "").toLowerCase().includes(searchValue) ||
//                 (user.code || "").toLowerCase().includes(searchValue);

//             const matchesStatus =
//                 status === "All" ||
//                 user.status === status;

//             const matchesRole =
//                 role === "All" ||
//                 user.role === role;

//             const matchesLegalGroup =
//                 legalGroup === "All" ||
//                 String(user.legalGroup || "")
//                     .trim()
//                     .toLowerCase() ===
//                 String(legalGroup || "")
//                     .trim()
//                     .toLowerCase();

//             const matchesActive =
//                 !activeOnly ||
//                 user.status === "Active";

//             return (
//                 matchesSearch &&
//                 matchesStatus &&
//                 matchesRole &&
//                 matchesLegalGroup &&
//                 matchesActive
//             );
//         });
//     }, [users, search, status, role, legalGroup, activeOnly,]);


//     /* -------------------- PAGINATION -------------------- */

//     const totalPages = Math.max(
//         1,
//         Math.ceil(filteredUsers.length / pageSize)
//     );

//     const startIndex = (currentPage - 1) * pageSize;

//     const endIndex = startIndex + pageSize;

//     const currentUsers = filteredUsers.slice(
//         startIndex,
//         endIndex
//     );


//     const handlePrevious = () => {
//         if (currentPage > 1) {
//             setCurrentPage((prev) => prev - 1);
//         }
//     };


//     const handleNext = () => {
//         if (currentPage < totalPages) {
//             setCurrentPage((prev) => prev + 1);
//         }
//     };


//     const handleFirst = () => {
//         setCurrentPage(1);
//     };


//     const handleLast = () => {
//         setCurrentPage(totalPages);
//     };


//     const handlePageSizeChange = (e) => {
//         setPageSize(Number(e.target.value));
//         setCurrentPage(1);
//     };


//     /* -------------------- EDIT USER FORM-------------------- */

//     const handleEdit = (user) => {
//         setUserToEdit(user);
//         setShowEditConfirm(true);

//         <div className="w-90 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
//             <div className="flex items-start gap-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
//                     <Edit className="h-5 w-5 text-blue-600" />
//                 </div>

//                 <div className="flex-1">
//                     <h3 className="text-sm font-semibold text-gray-900">
//                         Edit User
//                     </h3>

//                     <p className="mt-1 text-xs text-gray-600">
//                         Do you want to edit{" "}
//                         <span className="font-semibold">
//                             {user.name}
//                         </span>
//                         ?
//                     </p>

//                     <div className="mt-4 flex justify-end gap-2">
//                         <button
//                             onClick={() => toast.dismiss(t.id)}
//                             className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
//                         >
//                             Cancel
//                         </button>

//                         <button
//                             onClick={() => {
//                                 toast.dismiss(t.id);
//                                 setSelectedUser(user);
//                                 setShowEditUser(true);
//                             }}
//                             className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
//                         >
//                             Edit
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     };


//     const handleConfirmEdit = () => {
//         setShowEditConfirm(false);
//         setSelectedUser(userToEdit);
//         setShowEditUser(true);
//         setUserToEdit(null);
//     };


//     const handleCancelEdit = () => {
//         setShowEditConfirm(false);
//         setUserToEdit(null);
//     };


//     const handleToggleStatus = async (user) => {
//         try {
//             const payload = {
//                 employee_code: user.raw.employee_code,
//                 employee_name: user.raw.employee_name,
//                 official_email: user.raw.official_email,
//                 designation: user.raw.designation,
//                 department: user.raw.department,
//                 reporting_manager_code: user.raw.reporting_manager_code,
//                 role_code: user.raw.role_code,
//                 active: !user.active,
//             };

//             console.log("Payload:", payload);
//             console.log(user.raw);

//             await updateUserStatus(user.id, payload);

//             toast.success(
//                 user.active
//                     ? "User deactivated successfully"
//                     : "User activated successfully"
//             );

//             await fetchUsers();

//         } catch (error) {
//             console.error(error.response?.data);
//             toast.error("Unable to update user status");
//         }
//     };


//     /* -------------------- KPI CARDS -------------------- */

//     const statCards = stats.map((item) => {
//         let icon = Users;

//         switch (item.id) {

//             case "total":
//                 icon = Users;
//                 break;

//             case "active":
//                 icon = UserCheck;
//                 break;

//             case "inactive":
//                 icon = UserX;
//                 break;

//             case "locked":
//                 icon = ShieldAlert;
//                 break;

//             case "noRole":
//                 icon = UserCog;
//                 break;

//             default:
//                 icon = Users;

//         }

//         return {
//             ...item,
//             icon,
//         };

//     });


//     console.log("Active Only:", activeOnly);


//     /* -------------------- LOADING -------------------- */

//     if (loading) {
//         return (
//             <div
//                 style={{
//                     height: "calc(100vh - 64px)",
//                     overflow: "hidden",
//                     boxSizing: "border-box",
//                     padding: "16px",
//                 }}
//             >
//                 <PageSkeleton />
//             </div>
//         );
//     }


//     /* ---------- PART 2 STARTS WITH RETURN ---------- */

//     return (

//         <div
//             className="flex flex-col gap-0.5"
//             style={{
//                 height: "calc(100vh - 64px)",
//                 minHeight: 0,
//                 overflow: "hidden",
//                 boxSizing: "border-box",
//                 position: "relative",
//             }}
//         >

//             {/* HEADER + CONTENT */}

//             <div
//                 style={{
//                     display: "flex",
//                     flexDirection: "column",
//                     flex: "1 1 0%",
//                     minHeight: 0,
//                     overflow: "hidden",
//                     paddingBottom: "32px",
//                     boxSizing: "border-box",
//                 }}
//             >

//                 <PageHeader
//                     title="User Access Management"
//                     subtitle="Manage users and define their access to Legal Entities, Divisions, SubDivisions and Business Units."
//                     buttonText="Assign Access"
//                     buttonIcon={Shield}
//                     onButtonClick={() => {
//                         if (!selectedUser) {
//                             toast("Please select a user first.");
//                             return;
//                         }

//                         setUserToEdit(selectedUser);
//                         setShowEditConfirm(true);
//                     }}
//                 />


//                 <AddUserModal
//                     open={showAddUser || showEditUser}
//                     editUser={selectedUser}
//                     onClose={() => {
//                         setShowAddUser(false);
//                         setShowEditUser(false);
//                     }}
//                     onSuccess={() => {
//                         fetchUsers();
//                         setShowAddUser(false);
//                         setShowEditUser(false);
//                     }}
//                 />


//                 {/* KPI CARDS */}

//                 <div
//                     className="grid grid-cols-8 gap-2.5"
//                     style={{
//                         flexShrink: 0,
//                     }}
//                 >
//                     {summaryCards.map((item, index) => (
//                         <StatCard
//                             key={item.key || item.title || index}
//                             {...item}
//                             delay={index * 0.08}
//                         />
//                     ))}
//                 </div>


//                 {/* FILTER BAR */}

//                 <div
//                     style={{
//                         flexShrink: 0,
//                     }}
//                 >
//                     <FilterBar
//                         customOrder={true}
//                         search={search}
//                         setSearch={setSearch}
//                         placeholder="Search by name, email or employee code..."
//                         filters={[
//                             {
//                                 label: "Status",
//                                 options: ["All", "Active", "Inactive"],
//                                 value: status,
//                                 onChange: (e) => setStatus(e.target.value),
//                             },
//                             {
//                                 label: "Role",
//                                 options: roleOptions,
//                                 value: role,
//                                 onChange: (e) => setRole(e.target.value),
//                             },
//                             {
//                                 label: "Legal Group",
//                                 options: legalGroupOptions,
//                                 value: legalGroup,
//                                 onChange: (e) => setLegalGroup(e.target.value),
//                             },
//                         ]}
//                         activeOnly={activeOnly}
//                         setActiveOnly={setActiveOnly}
//                         toggleLabel="Active Users Only"
//                         showMoreFilters
//                         onReset={resetFilters}
//                     />
//                 </div>


//                 {/* ================= USER TABLE + HIERARCHY + USER DETAILS ================= */}

//                 <div
//                     style={{
//                         display: "grid",
//                         gridTemplateColumns:
//                             "minmax(0, 4fr) minmax(0, 3fr) minmax(0, 3fr)",
//                         gap: "12px",
//                         width: "100%",
//                         flex: "1 1 0%",
//                         minHeight: 0,
//                         height: 0,
//                         overflow: "hidden",
//                         boxSizing: "border-box",
//                     }}
//                 >

//                     {/* ================= USER TABLE 40% ================= */}

//                     <div
//                         style={{
//                             minWidth: 0,
//                             minHeight: 0,
//                             width: "100%",
//                             height: "100%",
//                             overflow: "hidden",
//                             display: "flex",
//                             flexDirection: "column",
//                         }}
//                     >
//                         <UserTable
//                             compactAccess={true}
//                             users={currentUsers}
//                             total={filteredUsers.length}
//                             onEdit={handleEdit}
//                             onToggleStatus={handleToggleStatus}
//                             currentPage={currentPage}
//                             totalPages={totalPages}
//                             pageSize={pageSize}
//                             onPageChange={setCurrentPage}
//                             onPrevious={handlePrevious}
//                             onNext={handleNext}
//                             onFirst={handleFirst}
//                             onLast={handleLast}
//                             onPageSizeChange={handlePageSizeChange}
//                             selectedId={selectedUser?.id}
//                             onSelect={handleUserSelect}
//                         />
//                     </div>


//                     {/* ================= HIERARCHY 30% ================= */}

//                     <div
//                         style={{
//                             minWidth: 0,
//                             minHeight: 0,
//                             width: "100%",
//                             height: "100%",
//                             overflow: "hidden",
//                             display: "flex",
//                             flexDirection: "column",
//                         }}
//                     >
//                         <HierarchyTree
//                             tree={hierarchyTree}
//                             selected={selectedAccess}
//                             setSelected={setSelectedAccess}
//                         />
//                     </div>


//                     {/* ================= USER DETAILS 30% ================= */}

//                     <div
//                         style={{
//                             minWidth: 0,
//                             minHeight: 0,
//                             width: "100%",
//                             height: "100%",
//                             overflow: "hidden",
//                             display: "flex",
//                             flexDirection: "column",
//                         }}
//                     >
//                         {selectedUser && (
//                             <SelectedUserCard
//                                 user={selectedUser}
//                                 accessSummary={accessSummary}
//                                 onSave={() => setShowConfirm(true)}
//                                 onClose={() => {
//                                     setSelectedUser(null);
//                                 }}
//                             />
//                         )}
//                     </div>

//                 </div>

//             </div>


//             {/* FOOTER */}

//             <div
//                 style={{
//                     position: "fixed",
//                     bottom: 0,
//                     left: "220px",
//                     right: 0,
//                     height: "32px",
//                     minHeight: "32px",
//                     borderTop: "1px solid #e5e7eb",
//                     backgroundColor: "#ffffff",
//                     padding: "4px 12px",
//                     boxShadow: "0 -1px 4px rgba(0,0,0,0.05)",
//                     boxSizing: "border-box",
//                     overflow: "hidden",
//                     zIndex: 100,
//                 }}
//             >
//                 <FooterNote
//                     title="Note:"
//                     message="Deactivated users will not be able to login. Locked users are blocked due to multiple failed login attempts."
//                     lastUpdated="20 Jun 2026 10:15 AM"
//                     onRefresh={() => console.log("Refresh clicked")}
//                 />
//             </div>


//             <AddUserModal
//                 open={showAddUser}
//                 onClose={() => setShowAddUser(false)}
//                 onSuccess={() => {
//                     fetchUsers();
//                     setShowAddUser(false);
//                 }}
//             />


//             <ConfirmationModel
//                 open={showConfirm}
//                 title="Save Access?"
//                 message={`Do you want to save access changes for ${selectedUser?.name}?`}
//                 confirmText={saving ? "Saving..." : "Save"}
//                 cancelText="Cancel"
//                 onCancel={() => setShowConfirm(false)}
//                 onConfirm={handleConfirmSave}
//             />


//             <ConfirmationModel
//                 open={showEditConfirm}
//                 title="Assign Access?"
//                 message={
//                     `Do you want to assign access for ${userToEdit?.name}?`
//                 }
//                 confirmText="Assign Access"
//                 cancelText="Cancel"
//                 onCancel={handleCancelEdit}
//                 onConfirm={handleConfirmEdit}
//             />

//         </div>
//     );
// }

import { useState, useMemo, useEffect } from "react";
import {
    UserPlus, Users, UserCheck, UserX, ShieldAlert, UserCog, Edit, Shield,
    Building2, Building, Layers, GitBranch, Briefcase, BarChart3,
} from "lucide-react";
import ConfirmationModel from "../components/Common/ConfirmationModel";

import HierarchyTree from "../components/userAccess/HierarchyTree";
import toast from "react-hot-toast";
import AdminLayout from "../components/Layout/AdminLayout";
import PageHeader from "../components/Common/PageHeader";
import FilterBar from "../components/Common/FilterBar";
import StatCard from "../components/StatCard";
import UserTable from "../components/users/UserTable";
import UserDetails from "../components/users/UserDetails";
import FooterNote from "../components/FooterNote";
import AddUserModal from "../components/users/AddUserModal";
import SelectedUserCard from "../components/userAccess/SelectUserCard";
import { stats, departments, } from "../data/dummyData";
import { getUserAccessSummary } from "../api/userAccessApi";
import { getUsers, getRoles, getLegalGroups, updateUserStatus } from "../api/userApi";
import PageSkeleton from "../components/Common/PageSkeleton";
import {
    getUserAccess,
    saveUserAccess,
    getOrganizationTree,
} from "../api/userAccessApi";


export default function UserAccessMangement() {

    /* -------------------- STATES -------------------- */
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");

    const [role, setRole] = useState("All");
    const [roleOptions, setRoleOptions] = useState(["All"]);

    const [legalGroup, setLegalGroup] = useState("All");
    const [legalGroupOptions, setLegalGroupOptions] = useState(["All"]);

    const [activeOnly, setActiveOnly] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const [showAddUser, setShowAddUser] = useState(false);
    const [showEditUser, setShowEditUser] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showEditConfirm, setShowEditConfirm] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    const [summaryCards, setSummaryCards] = useState([]);

    const [hierarchyTree, setHierarchyTree] = useState([]);
    const [selectedAccess, setSelectedAccess] = useState([]);
    const [accessSummary, setAccessSummary] = useState({});


    /* -------------------- PAGINATION -------------------- */
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);


    const normalizeOrgTree = (nodes = []) => {
        const prefixMap = {
            legal_group: "LG",
            legal_entity: "LE",
            parent_division: "PD",
            subdivision: "SD",
            business_unit: "BU",
            analysis_code: "AC",
        };

        return nodes.map((node) => ({
            id: `${prefixMap[node.type]}_${node.id}`,
            label: node.name,
            code: node.code,
            type: node.type,

            children: normalizeOrgTree(
                node.children || []
            ),
        }));
    };


    /* -------------------- FETCH USERS -------------------- */

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await getUsers();
            console.log("Users API Response:", response.data);

            console.table(
                response.data.map((u) => ({
                    id: u.user_profile_id,
                    name: u.employee_name,
                }))
            );

            const formattedUsers = response.data.map((user) => ({
                id: user.user_profile_id,
                code: user.employee_code,
                name: user.employee_name,
                email: user.official_email,

                role: user.role_code,

                active: user.active,
                status: user.active ? "Active" : "Inactive",

                legalGroup:
                    user.legal_groups?.[0]?.legal_group_code ?? "-",

                raw: user,
            }));

            setUsers(formattedUsers);

            if (formattedUsers.length > 0) {

                let userToSelect = formattedUsers[0];

                if (selectedUser) {
                    userToSelect =
                        formattedUsers.find(
                            (u) => u.id === selectedUser.id
                        ) || formattedUsers[0];
                }

                setSelectedUser(userToSelect);

                // Automatically load this user's access
                await loadUserAccess(userToSelect.id);
            }

        } catch (error) {
            console.error("Users API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    console.log("........", status);
    console.log("----------", activeOnly);


    /* -------------------- FETCH ROLES -------------------- */

    const fetchRoles = async () => {
        try {
            const response = await getRoles();
            console.log(response.data);

            const roles = response.data.map((item, index) => ({
                id: index + 1,
                code: item.role_code,
                name: item.role_name,
            }));

            setRoleOptions([
                {
                    id: 0,
                    code: "All",
                    name: "All",
                },
                ...roles,
            ]);

        } catch (error) {
            console.error(error);
        }
    };


    /* -------------------- FETCH LEGAL GROUPS -------------------- */

    const fetchLegalGroups = async () => {
        try {
            const response = await getLegalGroups();

            const groups = (response.data || []).map((item) => ({
                id: item.legal_group_id,
                code: item.legal_group_code,
                name: item.legal_group_name,
            }));

            setLegalGroupOptions([
                {
                    id: 0,
                    code: "All",
                    name: "All",
                },
                ...groups,
            ]);

        } catch (error) {
            console.error(
                "Legal Groups API Error:",
                error.response?.data || error
            );
        }
    };


    // called from SelectedUserCard
    const handleSaveClick = () => {
        setShowConfirm(true);
    };


    {/*------Load HierarchyTree---------*/ }

    const loadOrganizationHierarchy = async () => {
        try {
            const response = await getOrganizationTree();

            console.log(
                "Organization Tree API:",
                response.data
            );

            const rawTree = response.data?.data || [];

            const normalizedTree =
                normalizeOrgTree(rawTree);

            console.log(
                "Normalized Organization Tree:",
                normalizedTree
            );

            setHierarchyTree(normalizedTree);

        } catch (error) {
            console.error(
                "Failed to load organization hierarchy:",
                error.response?.data || error
            );

            setHierarchyTree([]);
        }
    };


    const loadUserAccess = async (userId) => {
        try {
            const { data } = await getUserAccess(userId);

            const selected = new Set();

            data.forEach((item) => {
                if (item.legal_group_id)
                    selected.add(`LG_${item.legal_group_id}`);

                if (item.legal_entity_id)
                    selected.add(`LE_${item.legal_entity_id}`);

                if (item.parent_division_id)
                    selected.add(`PD_${item.parent_division_id}`);

                if (item.subdivision_id)
                    selected.add(`SD_${item.subdivision_id}`);

                if (item.business_unit_id)
                    selected.add(`BU_${item.business_unit_id}`);

                if (item.analysis_code_id)
                    selected.add(`AC_${item.analysis_code_id}`);
            });

            const selectedArray = [...selected];

            setSelectedAccess(selectedArray);

            console.log("User Access API:", data);
            console.log("Unique Selected Access:", selectedArray);

        } catch (error) {
            console.error(
                "Failed to load user access:",
                error.response?.data || error
            );

            setSelectedAccess([]);
        }
    };


    const buildAccessPayload = () => {
        return {
            legal_group_ids: selectedAccess
                .filter((id) => id.startsWith("LG_"))
                .map((id) => Number(id.replace("LG_", ""))),

            legal_entity_ids: selectedAccess
                .filter((id) => id.startsWith("LE_"))
                .map((id) => Number(id.replace("LE_", ""))),

            parent_division_ids: selectedAccess
                .filter((id) => id.startsWith("PD_"))
                .map((id) => Number(id.replace("PD_", ""))),

            subdivision_ids: selectedAccess
                .filter((id) => id.startsWith("SD_"))
                .map((id) => Number(id.replace("SD_", ""))),

            business_unit_ids: selectedAccess
                .filter((id) => id.startsWith("BU_"))
                .map((id) => Number(id.replace("BU_", ""))),

            analysis_code_ids: selectedAccess
                .filter((id) => id.startsWith("AC_"))
                .map((id) => Number(id.replace("AC_", ""))),
        };
    };


    {/*.........When a user is selected........... */ }

    const handleUserSelect = async (user) => {
        setSelectedUser(user);
        await loadUserAccess(user.id);
    };


    const handleConfirmSave = async () => {
        if (!selectedUser) return;

        try {
            setSaving(true);

            const payload = buildAccessPayload();

            console.log("SAVE ACCESS PAYLOAD:", payload);

            await saveUserAccess(selectedUser.id, payload);

            toast.success("User access updated successfully");

            setShowConfirm(false);

            // Reload saved access from backend
            await loadUserAccess(selectedUser.id);

        } catch (error) {
            console.error(
                "Save access error:",
                error.response?.data || error
            );

            toast.error(
                error.response?.data?.detail ||
                "Failed to update user access"
            );
        } finally {
            setSaving(false);
        }
    };


    /* -------------------- FETCH CARDS DATA -------------------- */

    const fetchSummaryCards = async () => {
        try {
            const { data } = await getUserAccessSummary();

            setSummaryCards([
                {
                    label: "Total Users",
                    value: data.users,
                    description: "Active users",
                    icon: Users,
                    color: "blue",
                },
                {
                    label: "Active Accesses",
                    value: data.active_accesses,
                    description: "Active acceses",
                    icon: Shield,
                    color: "purple",
                },
                {
                    label: "Legal Groups",
                    value: data.legal_groups,
                    description: "Active groups",
                    icon: Building2,
                    color: "orange",
                },
                {
                    label: "Legal Entities",
                    value: data.legal_entities,
                    description: "Total entities",
                    icon: Building,
                    color: "teal",
                },
                {
                    label: "Parent Divisions",
                    value: data.parent_divisions,
                    description: "Total divisions",
                    icon: Layers,
                    color: "blue",
                },
                {
                    label: "Subdivisions",
                    value: data.subdivisions,
                    description: "Total subdivisions",
                    icon: GitBranch,
                    color: "indigo",
                },
                {
                    label: "Business Units",
                    value: data.business_units,
                    description: "Total units",
                    icon: Briefcase,
                    color: "blue",
                },
                {
                    label: "Analysis Codes",
                    value: data.analysis_codes,
                    description: "Total codes",
                    icon: BarChart3,
                    color: "blue",
                },
            ]);

        } catch (error) {
            console.error(error);
        }
    };


    /* -------------------- PAGE LOAD -------------------- */

    useEffect(() => {

        loadOrganizationHierarchy();

        fetchUsers();

        fetchRoles();

        fetchLegalGroups();

        fetchSummaryCards();

    }, []);


    useEffect(() => {
        setCurrentPage(1);
    }, [
        search,
        status,
        role,
        //department,
        legalGroup,
        activeOnly,
    ]);


    {/*.... Get Access Summary......*/ }

    useEffect(() => {
        const summary = {
            legalGroups: 0,
            legalEntities: 0,
            parentDivisions: 0,
            subdivisions: 0,
            businessUnits: 0,
            analysisCodes: 0,
        };

        selectedAccess.forEach((id) => {
            if (id.startsWith("LG_")) summary.legalGroups++;
            if (id.startsWith("LE_")) summary.legalEntities++;
            if (id.startsWith("PD_")) summary.parentDivisions++;
            if (id.startsWith("SD_")) summary.subdivisions++;
            if (id.startsWith("BU_")) summary.businessUnits++;
            if (id.startsWith("AC_")) summary.analysisCodes++;
        });

        setAccessSummary(summary);

    }, [selectedAccess]);


    /* -------------------- RESET FILTERS -------------------- */

    const resetFilters = () => {
        setSearch("");
        setStatus("All");
        setRole("All");
        setLegalGroup("All");
        setActiveOnly(false);
        setSelectedAccess([]);
    };


    /* -------------------- FILTER USERS -------------------- */

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {

            const searchValue = search.trim().toLowerCase();

            const matchesSearch =
                (user.name || "").toLowerCase().includes(searchValue) ||
                (user.email || "").toLowerCase().includes(searchValue) ||
                (user.code || "").toLowerCase().includes(searchValue);

            const matchesStatus =
                status === "All" ||
                user.status === status;

            const matchesRole =
                role === "All" ||
                user.role === role;

            const matchesLegalGroup =
                legalGroup === "All" ||
                String(user.legalGroup || "")
                    .trim()
                    .toLowerCase() ===
                String(legalGroup || "")
                    .trim()
                    .toLowerCase();

            const matchesActive =
                !activeOnly ||
                user.status === "Active";

            return (
                matchesSearch &&
                matchesStatus &&
                matchesRole &&
                matchesLegalGroup &&
                matchesActive
            );
        });
    }, [users, search, status, role, legalGroup, activeOnly,]);


    /* -------------------- PAGINATION -------------------- */

    const totalPages = Math.max(
        1,
        Math.ceil(filteredUsers.length / pageSize)
    );

    const startIndex = (currentPage - 1) * pageSize;

    const endIndex = startIndex + pageSize;

    const currentUsers = filteredUsers.slice(
        startIndex,
        endIndex
    );


    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };


    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };


    const handleFirst = () => {
        setCurrentPage(1);
    };


    const handleLast = () => {
        setCurrentPage(totalPages);
    };


    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };


    /* -------------------- EDIT USER FORM-------------------- */

    const handleEdit = (user) => {
        setUserToEdit(user);
        setShowEditConfirm(true);

        <div className="w-90 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Edit className="h-5 w-5 text-blue-600" />
                </div>

                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Edit User
                    </h3>

                    <p className="mt-1 text-xs text-gray-600">
                        Do you want to edit{" "}
                        <span className="font-semibold">
                            {user.name}
                        </span>
                        ?
                    </p>

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                setSelectedUser(user);
                                setShowEditUser(true);
                            }}
                            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                        >
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    };


    const handleConfirmEdit = () => {
        setShowEditConfirm(false);
        setSelectedUser(userToEdit);
        setShowEditUser(true);
        setUserToEdit(null);
    };


    const handleCancelEdit = () => {
        setShowEditConfirm(false);
        setUserToEdit(null);
    };


    const handleToggleStatus = async (user) => {
        try {
            const payload = {
                employee_code: user.raw.employee_code,
                employee_name: user.raw.employee_name,
                official_email: user.raw.official_email,
                designation: user.raw.designation,
                department: user.raw.department,
                reporting_manager_code: user.raw.reporting_manager_code,
                role_code: user.raw.role_code,
                active: !user.active,
            };

            console.log("Payload:", payload);
            console.log(user.raw);

            await updateUserStatus(user.id, payload);

            toast.success(
                user.active
                    ? "User deactivated successfully"
                    : "User activated successfully"
            );

            await fetchUsers();

        } catch (error) {
            console.error(error.response?.data);
            toast.error("Unable to update user status");
        }
    };


    /* -------------------- KPI CARDS -------------------- */

    const statCards = stats.map((item) => {
        let icon = Users;

        switch (item.id) {

            case "total":
                icon = Users;
                break;

            case "active":
                icon = UserCheck;
                break;

            case "inactive":
                icon = UserX;
                break;

            case "locked":
                icon = ShieldAlert;
                break;

            case "noRole":
                icon = UserCog;
                break;

            default:
                icon = Users;

        }

        return {
            ...item,
            icon,
        };

    });


    console.log("Active Only:", activeOnly);


    /* -------------------- LOADING -------------------- */

    if (loading) {
        return (
            <div
                style={{
                    height: "calc(100vh - 64px)",
                    overflow: "hidden",
                    boxSizing: "border-box",
                    padding: "12px",
                }}
            >
                <PageSkeleton />
            </div>
        );
    }


    /* ---------- PART 2 STARTS WITH RETURN ---------- */

    return (

        <div
            className="flex flex-col"
            style={{
                height: "calc(100vh - 64px)",
                minHeight: 0,
                overflow: "hidden",
                boxSizing: "border-box",
                position: "relative",
            }}
        >

            {/* HEADER + CONTENT */}

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: "1 1 0%",
                    minHeight: 0,
                    overflow: "hidden",
                    paddingBottom: "30px",
                    boxSizing: "border-box",
                }}
            >

                <div
                    style={{
                        flexShrink: 0,
                        marginBottom: "2px",
                    }}
                >
                    <PageHeader
                        title="User Access Management"
                        subtitle="Manage users and define their access to Legal Entities, Divisions, SubDivisions and Business Units."
                        buttonText="Assign Access"
                        buttonIcon={Shield}
                        onButtonClick={() => {
                            if (!selectedUser) {
                                toast("Please select a user first.");
                                return;
                            }

                            setUserToEdit(selectedUser);
                            setShowEditConfirm(true);
                        }}
                    />
                </div>


                <AddUserModal
                    open={showAddUser || showEditUser}
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


                {/* KPI CARDS */}

                <div
                    className="grid grid-cols-8 gap-2.5"
                    style={{
                        flexShrink: 0,
                        marginBottom: "2px",
                    }}
                >
                    {summaryCards.map((item, index) => (
                        <StatCard
                            key={item.key || item.title || index}
                            {...item}
                            delay={index * 0.08}
                        />
                    ))}
                </div>


                {/* FILTER BAR */}

                <div
                    style={{
                        flexShrink: 0,
                        marginBottom: "2px",
                    }}
                >
                    <FilterBar
                        customOrder={true}
                        search={search}
                        setSearch={setSearch}
                        placeholder="Search by name, email or employee code..."
                        filters={[
                            {
                                label: "Status",
                                options: ["All", "Active", "Inactive"],
                                value: status,
                                onChange: (e) => setStatus(e.target.value),
                            },
                            {
                                label: "Role",
                                options: roleOptions,
                                value: role,
                                onChange: (e) => setRole(e.target.value),
                            },
                            {
                                label: "Legal Group",
                                options: legalGroupOptions,
                                value: legalGroup,
                                onChange: (e) => setLegalGroup(e.target.value),
                            },
                        ]}
                        activeOnly={activeOnly}
                        setActiveOnly={setActiveOnly}
                        toggleLabel="Active Users Only"
                        showMoreFilters
                        onReset={resetFilters}
                    />
                </div>


                {/* ================= USER TABLE + HIERARCHY + USER DETAILS ================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "minmax(0, 4fr) minmax(0, 3fr) minmax(0, 3fr)",
                        gap: "10px",
                        width: "100%",
                        flex: "1 1 0%",
                        minHeight: 0,
                        height: 0,
                        overflow: "hidden",
                        boxSizing: "border-box",
                    }}
                >

                    {/* ================= USER TABLE 40% ================= */}

                    <div
                        style={{
                            minWidth: 0,
                            minHeight: 0,
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <UserTable
                            compactAccess={true}
                            users={currentUsers}
                            total={filteredUsers.length}
                            onEdit={handleEdit}
                            onToggleStatus={handleToggleStatus}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            onFirst={handleFirst}
                            onLast={handleLast}
                            onPageSizeChange={handlePageSizeChange}
                            selectedId={selectedUser?.id}
                            onSelect={handleUserSelect}
                        />
                    </div>


                    {/* ================= HIERARCHY 30% ================= */}

                    <div
                        style={{
                            minWidth: 0,
                            minHeight: 0,
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <HierarchyTree
                            tree={hierarchyTree}
                            selected={selectedAccess}
                            setSelected={setSelectedAccess}
                        />
                    </div>


                    {/* ================= USER DETAILS 30% ================= */}

                    <div
                        style={{
                            minWidth: 0,
                            minHeight: 0,
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {selectedUser && (
                            <SelectedUserCard
                                user={selectedUser}
                                accessSummary={accessSummary}
                                onSave={() => setShowConfirm(true)}
                                onClose={() => {
                                    setSelectedUser(null);
                                }}
                            />
                        )}
                    </div>

                </div>

            </div>


            {/* FOOTER */}

            <div
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: "220px",
                    right: 0,
                    height: "30px",
                    minHeight: "30px",
                    borderTop: "1px solid #e5e7eb",
                    backgroundColor: "#ffffff",
                    padding: "3px 12px",
                    boxShadow: "0 -1px 4px rgba(0,0,0,0.05)",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    zIndex: 100,
                }}
            >
                <FooterNote
                    title="Note:"
                    message="Deactivated users will not be able to login. Locked users are blocked due to multiple failed login attempts."
                    lastUpdated="20 Jun 2026 10:15 AM"
                    onRefresh={() => console.log("Refresh clicked")}
                />
            </div>


            <AddUserModal
                open={showAddUser}
                onClose={() => setShowAddUser(false)}
                onSuccess={() => {
                    fetchUsers();
                    setShowAddUser(false);
                }}
            />


            <ConfirmationModel
                open={showConfirm}
                title="Save Access?"
                message={`Do you want to save access changes for ${selectedUser?.name}?`}
                confirmText={saving ? "Saving..." : "Save"}
                cancelText="Cancel"
                onCancel={() => setShowConfirm(false)}
                onConfirm={handleConfirmSave}
            />


            <ConfirmationModel
                open={showEditConfirm}
                title="Assign Access?"
                message={
                    `Do you want to assign access for ${userToEdit?.name}?`
                }
                confirmText="Assign Access"
                cancelText="Cancel"
                onCancel={handleCancelEdit}
                onConfirm={handleConfirmEdit}
            />

        </div>
    );
}