

import { useState, useMemo, useEffect } from "react";
import { UserPlus, Users, UserCheck, UserX, ShieldAlert, UserCog, Edit, } from "lucide-react";
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
  getUsers, getRoles, getLegalGroups, updateUserStatus, getAdminSummary,
} from "../api/userApi";

export default function UsersDashboard() {

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
  const [confirmAction, setConfirmAction] = useState("");
  const [selectedConfirmUser, setSelectedConfirmUser] = useState(null);

  /* -------------------- PAGINATION -------------------- */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);


  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    noRole: 0,
  });

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
        role_code: user.role_code,

        legalGroups: user.legal_groups ?? [],

        active: user.active === true,
        status: user.active === true ? "Active" : "Inactive",

        lastLogin: "-",
        dateOfJoining: user.date_of_joining ?? "-",
        jobTitle: user.designation ?? "-",
        phone: user.phone ?? "--",
        location: user.location ?? "--",

        emailVerified: user.email_verified ?? false,
        mfaEnabled: user.mfa_enabled ?? false,

        raw: user,
      }));

      setUsers(formattedUsers);

      setSelectedUser((prev) => {
        if (prev) {
          const updatedSelected = formattedUsers.find(
            (item) => item.id === prev.id
          );
          return updatedSelected || formattedUsers[0];
        }
        return formattedUsers[0];
      });

    } catch (error) {
      console.error("Users API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* --------------- FETCH KPI DATA FOR USERS-------------------- */
  const fetchUserStats = async () => {
    try {
      const response = await getAdminSummary();
      console.log("Admin Summary:", response.data);
      setUserStats({
        total: response.data.users ?? 0,
        active: response.data.active_users ?? 0,
        inactive: response.data.inactive_users ?? 0,
        noRole: response.data.users_without_role ?? 0,
      });
    } catch (error) {
      console.error("Admin Summary API Error:", error);
    }
  };


  const fetchRoles = async () => {
    try {
      const response = await getRoles();

      const roles = response.data.data || response.data;

      const uniqueActiveRoles = Array.from(
        new Map(
          roles
            .filter((role) => role.active === true)
            .map((role) => [
              role.role_code,
              role,
            ])
        ).values()
      );

      setRoleOptions([
        {
          id: 0,
          code: "All",
          name: "All",
        },
        ...uniqueActiveRoles.map(
          (role, index) => ({
            id: index + 1,
            code: role.role_code,
            name: role.role_name,
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

  /* -------------------- FETCH LEGAL GROUPS -------------------- */
  const fetchLegalGroups = async () => {
    try {
      const response = await getUsers();

      const users = response.data.data || response.data;

      // Flatten legal_groups from all users
      const legalGroups = users.flatMap(
        (user) => user.legal_groups || []
      );

      // Remove duplicate legal groups using legal_group_code
      const uniqueLegalGroups = Array.from(
        new Map(
          legalGroups.map((group) => [
            group.legal_group_code,
            group,
          ])
        ).values()
      );

      const formattedLegalGroups = uniqueLegalGroups.map(
        (group, index) => ({
          id: index + 1,
          code: group.legal_group_code,
          name: group.legal_group_name,
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
  /* -------------------- PAGE LOAD -------------------- */

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
    fetchRoles();
    fetchLegalGroups();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    status,
    role,
    legalGroup,
    activeOnly,
  ]);

  /* -------------------- RESET FILTERS -------------------- */

  const resetFilters = () => {
    setSearch("");
    setStatus("All");
    setRole("All");
    setLegalGroup("All");
    setActiveOnly(false);
  };

  /* -------------------- FILTER USERS -------------------- */

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {

      const matchesSearch =
        (user.name || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        (user.email || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        (user.code || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "All" ||
        (status === "Active" && user.active === true) ||
        (status === "Inactive" && user.active === false);

      const matchesRole =
        role === "All" ||
        user.role === role;

      const matchesLegalGroup =
        legalGroup === "All" ||
        user.legalGroups?.some(
          (group) => group.legal_group_code === legalGroup
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
    setSelectedConfirmUser(user);
    setConfirmAction("edit");
    setShowConfirm(true);
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
            >Cancel</button>

            <button
              onClick={() => {
                toast.dismiss(t.id);
                setSelectedUser(user);
                setShowEditUser(true);
              }}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  };

  const handleConfirm = async () => {
    if (confirmAction === "edit") {
      setSelectedUser(selectedConfirmUser);
      setShowEditUser(true);
    }

    if (
      confirmAction === "deactivate" ||
      confirmAction === "activate"
    ) {
      await updateStatus(selectedConfirmUser);
    }

    setShowConfirm(false);
    setSelectedConfirmUser(null);
    setConfirmAction("");
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setSelectedConfirmUser(null);
    setConfirmAction("");
  };

  const handleToggleStatus = (user) => {
    setSelectedConfirmUser(user);
    setConfirmAction(user.active ? "deactivate" : "activate");
    setShowConfirm(true);
  };

  const updateStatus = async (user) => {
    try {
      const payload = {
        employee_code: user.raw.employee_code,
        employee_name: user.raw.employee_name,
        official_email: user.raw.official_email,
        designation: user.raw.designation,
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

      await Promise.all([
        fetchUsers(),
        fetchUserStats(),
      ]);
    } catch (error) {
      console.error(error.response?.data);
      toast.error("Unable to update user status");
    }
  };
  /* -------------------- KPI CARDS -------------------- */
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
  /* -------------------- LOADING -------------------- */

  if (loading) {
    return (
      <div className="p-4">
        <PageSkeleton />
      </div>
    );
  }
  /* ---------- PART 2 STARTS WITH RETURN ---------- */
  return (
    <div className="flex flex-col gap-0.5">
      {/* HEADER */}
      <div>
        <PageHeader
          title="Users"
          subtitle="Manage application users, their roles and account status."
          buttonText="Add User"
          buttonIcon={UserPlus}
          onButtonClick={() => setShowAddUser(true)}
        />

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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-0.5">
          {statCards.map((item, index) => (
            <StatCard
              key={item.key || item.title || index}
              {...item}
              delay={index * 0.08}
            />
          ))}
        </div>

        {/* FILTER BAR */}
        <FilterBar
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

        {/* TABLE + DETAILS */}

        <div
          className="
            grid
            grid-cols-1
            xl:grid-cols-[minmax(0,1fr)_430px]
            gap-4

          "
        >
          <UserTable
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

            onSelect={(user) => {
              console.log("Dashboard received:", user.id, user.name);
              setSelectedUser(user);
            }}

          />
          {selectedUser && (
            <UserDetails
              key={selectedUser.id}
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-55 right-0 border-t border-gray-200 bg-white px-0.5 py-0 shadow-sm">
        <FooterNote
          title="Note:"
          message=" Deactivated users will not be able to login."
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
        title={
          confirmAction === "edit"
            ? "Edit User"
            : confirmAction === "deactivate"
              ? "Deactivate User"
              : "Activate User"
        }
        message={
          selectedConfirmUser
            ? confirmAction === "edit"
              ? `Do you want to edit ${selectedConfirmUser.name}?`
              : confirmAction === "deactivate"
                ? `Are you sure you want to deactivate ${selectedConfirmUser.name}?`
                : `Are you sure you want to activate ${selectedConfirmUser.name}?`
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
