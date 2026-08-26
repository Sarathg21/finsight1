
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
import { addRole, getRole, updateRole } from "../api/rolesApi"



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



  /*---load roles from database---*/
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

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      (role.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      status === "All" ||
      (role.active ? "Active" : "Inactive") === status;

    const matchesActive =
      status !== "All"
        ? true
        : !activeOnly || role.active;

    return matchesSearch && matchesStatus && matchesActive;
  });

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
        (total, role) => total + (Number(role.users) || 0), 0),
      change: "Currently Assigned",
      description: "Users with Roles",
    },
  ];

  const resetFilters = () => {
    setSearch("");
    setStatus("All");
    setActiveOnly(true);
  };

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

  const pageSize = 7;
  const total = filteredRoles.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
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

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, activeOnly]);

  const handleToggleStatus = (role) => {
    setSelectedRoleAction(role);
    setConfirmAction(role.active ? "deactivate" : "activate");
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
          error.response.data.detail || "Failed to update role status"
        );
      } else {
        toast.error("Unable to connect to server");
      }
    }
  };

  const handleConfirm = async () => {
    if (confirmAction === "edit") {
      setEditRole(selectedRoleAction);
      setShowRoleModal(true);
    }

    if (
      confirmAction === "activate" ||
      confirmAction === "deactivate"
    ) {
      await updateRoleStatus(selectedRoleAction);
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

  /* -------------------- LOADING -------------------- */

  if (loading) {
    return (
      <div className="p-4">
        <PageSkeleton />
      </div>
    );
  }
  return (
    <>
      {/* Header */}
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
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-0.75">
        {dashboardStats.map((item, index) => (
          <StatCard
            key={item.title}
            {...item}
            delay={index * 0.08}
          />
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-x-0.75 gap-y-0.75 mt-0.75 ">

        {/* LEFT : 40% */}
        <div className="xl:col-span-5 flex flex-col gap-0.75 min-h-0">

          {/* FILTER BAR */}
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

                  // When viewing inactive roles,
                  // Active Only must be disabled.
                  if (value === "Inactive") {
                    setActiveOnly(false);
                  }

                  // When returning to All,
                  // restore Active Only.
                  if (value === "All") {
                    setActiveOnly(true);
                  }
                },
              },
            ]}
          />

          {/* ROLES TABLE */}
          <div
            className="
              h-[calc(100vh-320px)]
              min-h-112.5
              rounded-xl
              border
              border-gray-200
              bg-white
              shadow-sm
              overflow-hidden
              p-2
            "
          >
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

        {/* RIGHT : 60% */}
        <div
          className="
            xl:col-span-7"
        >
          <RoleDetailsPanel
            role={selectedRole}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-55 right-0 border-t border-gray-200 bg-white px-0.5 py-0 shadow-sm">
        <FooterNote
          title="Note:"
          message="Changes to role permission will affect all users assigned to this role."
        />
      </div>

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
              ? `Do you want to edit ${selectedRoleAction.role_name || selectedRoleAction.name}?`
              : confirmAction === "deactivate"
                ? `Are you sure you want to deactivate ${selectedRoleAction.role_name || selectedRoleAction.name}?`
                : `Are you sure you want to activate ${selectedRoleAction.role_name || selectedRoleAction.name}?`
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
    </>
  );
}