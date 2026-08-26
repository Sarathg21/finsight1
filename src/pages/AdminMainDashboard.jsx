import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import PageHeader from "../components/common/PageHeader";
import PageSkeleton from "../components/common/PageSkeleton";
import FooterNote from "../components/FooterNote";

import {
  Users, UserCheck, ShieldCheck, LockKeyhole, Building2, Building, GitBranch, Layers, BriefcaseBusiness, FileCode2,
  CheckCircle2, UserPlus, Shield, KeyRound,
} from "lucide-react";
import { getAdminSystemStatus } from "../api/adminApi";

export default function AdminMainDashboard() {

  /* =========================================================
     LOADING
  ========================================================= */

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");


  useEffect(() => {
    fetchAdminSummary();
  }, []);


  const fetchAdminSummary = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminSystemStatus();

      console.log("Admin System Status:", response.data);

      setSummary(response.data.data);
    } catch (error) {
      console.error("Admin System Status API Error:", error);

      setError("Unable to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = () => {
    fetchAdminSummary();
  };

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <div className="p-4">
        <PageSkeleton />
      </div>
    );
  }

  /* =========================================================
     SECURITY KPI DATA
  ========================================================= */

  const securityKpis = [
    {
      title: "Total Users",
      value: summary?.total_users ?? 0,
      description: "Registered users",
      icon: Users,
      background: "bg-[#EEF2FF]",
      border: "border-[#D7DEF0]",
    },

    {
      title: "Active Users",
      value: summary?.active_users ?? 0,
      description: "Live status count",
      icon: UserCheck,
      background: "bg-[#EDF9F2]",
      border: "border-[#CFE8D8]",
    },

    {
      title: "Active Roles",
      value: summary?.total_roles ?? 0,
      description: "Active roles",
      icon: ShieldCheck,
      background: "bg-[#F5F0FF]",
      border: "border-[#DED3F3]",
    },

    {
      title: "Active Accesses",
      value: summary?.active_accesses ?? 0,
      description: "Access assignments",
      icon: LockKeyhole,
      background: "bg-[#FFF5E8]",
      border: "border-[#EBDCC5]",
    },
  ];

  /* =========================================================
     MASTER DATA KPI DATA
  ========================================================= */

  const masterDataKpis = [
    {
      title: "Legal Groups",
      value: summary?.legal_groups ?? 0,
      description: "Active records",
      icon: Building2,
    },

    {
      title: "Legal Entities",
      value: summary?.legal_entities ?? 0,
      description: "Active records",
      icon: Building,
    },

    {
      title: "Parent Divisions",
      value: summary?.parent_divisions ?? 0,
      description: "Active records",
      icon: GitBranch,
    },

    {
      title: "Subdivisions",
      value: summary?.subdivisions ?? 0,
      description: "Active records",
      icon: Layers,
    },

    {
      title: "Business Units",
      value: summary?.business_units ?? 0,
      description: "Active records",
      icon: BriefcaseBusiness,
    },

    {
      title: "Analysis Codes",
      value: summary?.analysis_codes ?? 0,
      description: "Active records",
      icon: FileCode2,
    },
  ];

  /* =========================================================
     KPI CARD
     Reduced vertical padding/height
  ========================================================= */

  const renderKpiCard = (card, index) => {
    const Icon = card.icon;

    return (
      <div
        key={`${card.title}-${index}`}
        className={`
          relative
          min-h-23

          rounded-xl
          border

          ${card.border || "border-[#D7E0ED]"}
          ${card.background || "bg-white"}

          px-4
          py-2.5

          transition-all
          duration-200

          hover:-translate-y-px
          hover:shadow-sm
        `}
      >
        {/* Card Header */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-2
          "
        >
          <span
            className="
              text-[12px]
              font-semibold
              tracking-wide
              text-[#64748B]
            "
          >
            {card.title}
          </span>

          <Icon
            className="
              h-4
              w-4
              shrink-0
              text-[#64748B]
            "
            strokeWidth={1.8}
          />
        </div>

        {/* Value */}

        <div
          className="
            mt-2
            text-[27px]
            leading-none
            font-bold
            tracking-tight
            text-[#182238]
          "
        >
          {card.value}
        </div>

        {/* Description */}

        <div
          className="
            mt-1.5
            text-[11px]
            leading-tight
            text-[#718096]
          "
        >
          {card.description}
        </div>
      </div>
    );
  };

  /* =========================================================
     SYSTEM STATUS
  ========================================================= */

  const systemStatus = [
    {
      name: "Backend API",
      description: "FastAPI service",
      status: summary?.api_status ?? "unknown",
    },

    {
      name: "Database",
      description: "PostgreSQL",
      status: summary?.database ?? "unknown",
    },
  ];
  /* =========================================================
     QUICK ACTIONS
     Existing routing preserved
  ========================================================= */

  const quickActions = [
    {
      title: "Add User",
      description: "Create a new user",
      icon: UserPlus,
      path: "/admin/users",
    },

    {
      title: "Manage Roles",
      description: "Roles and permissions",
      icon: Shield,
      path: "/admin/roles",
    },

    {
      title: "Assign Access",
      description: "Organization access scope",
      icon: KeyRound,
      path: "/admin/user-access",
    },

    {
      title: "Master Data",
      description: "Maintain hierarchy",
      icon: Layers,
      path: "/admin/master-data",
    },
  ];

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  /* =========================================================
     MAIN UI
  ========================================================= */
  /* -------------------- LOADING -------------------- */

  if (loading) {
    return (
      <div className="p-4">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen
        w-full
        flex
        flex-col
        bg-[#F7F9FC]
        px-4
        pb-0
        overflow-visible
      "
    >

      {/* =====================================================
          DASHBOARD CONTENT
          flex-1 allows footer to stay at bottom
      ===================================================== */}

      <div className="flex-1">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <PageHeader
          variant="dashboard"
          title="Admin Dashboard"
          subtitle="Users, access control, organization master data and system health."
          onRefresh={handleRefresh}
        />

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* =====================================================
            SECURITY & ACCESS
        ===================================================== */}

        <section className="mt-5">

          <div
            className="
              mb-1.5
              text-[11px]
              font-bold
              uppercase
              tracking-wide
              text-[#64748B]
            "
          >
            Security & Access
          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-4
              gap-3
            "
          >
            {securityKpis.map((card, index) =>
              renderKpiCard(card, index)
            )}
          </div>

        </section>

        {/* =====================================================
            ORGANIZATION MASTER DATA
        ===================================================== */}

        <section className="mt-3.5">

          <div
            className="
              mb-1.5
              text-[11px]
              font-bold
              uppercase
              tracking-wide
              text-[#64748B]
            "
          >
            Organization Master Data
          </div>

          <div
            className="
              grid
              grid-cols-2
              md:grid-cols-3
              xl:grid-cols-6
              gap-2.5
            "
          >
            {masterDataKpis.map((card, index) =>
              renderKpiCard(card, index)
            )}
          </div>

        </section>

        {/* =====================================================
            SYSTEM STATUS + QUICK ACTIONS
        ===================================================== */}

        <section
          className="
            grid
            grid-cols-1
            xl:grid-cols-10
            gap-3
            mt-3.5
          "
        >

          {/* ===================================================
              SYSTEM STATUS
          =================================================== */}

          <div
            className="
              xl:col-span-6

              rounded-xl
              border
              border-[#D6DFEC]

              bg-white

              px-4
              py-2.5

              shadow-[0_1px_2px_rgba(15,23,42,0.02)]
            "
          >

            {/* Header */}

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
                mb-1
              "
            >

              <div>

                <h2
                  className="
                    text-[21px]
                    leading-tight
                    font-bold
                    text-[#182238]
                  "
                >
                  System Status
                </h2>

                <p
                  className="
                    mt-0.5
                    text-[11px]
                    leading-tight
                    text-[#718096]
                  "
                >
                  Live application health
                </p>

              </div>

              {/* Healthy Badge */}

              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5

                  rounded-full

                  bg-[#EAF8F1]

                  px-3
                  py-1

                  text-[11px]
                  font-bold
                  text-[#12A36A]
                "
              >
                <CheckCircle2
                  className="h-3.5 w-3.5"
                  strokeWidth={2.5}
                />

                Healthy
              </span>

            </div>

            {/* Status Rows */}

            <div
              className="
                divide-y
                divide-[#DCE3EE]
              "
            >

              {systemStatus.map((item) => (

                <div
                  key={item.name}
                  className="
                    grid
                    grid-cols-[145px_1fr_auto]
                    items-center
                    gap-3

                    min-h-8.5
                    py-1

                    text-[11px]
                  "
                >

                  {/* Name */}

                  <div
                    className="
                      font-bold
                      text-[#1E293B]
                    "
                  >
                    {item.name}
                  </div>

                  {/* Description */}

                  <div
                    className="
                      text-[#718096]
                    "
                  >
                    {item.description}
                  </div>

                  {/* Status */}
                  <div className="text-right">
                    <span
                      className={`font-semibold ${item.status === "running" || item.status === "connected"
                          ? "text-[#12A36A]"
                          : "text-[#DC2626]"
                        }`}
                    >
                      {formatStatus(item.status)}
                    </span>
                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* ===================================================
              QUICK ACTIONS
          =================================================== */}

          <div
            className="
              xl:col-span-4

              rounded-xl
              border
              border-[#D6DFEC]

              bg-white

              p-3

              shadow-[0_1px_2px_rgba(15,23,42,0.02)]
            "
          >

            {/* Quick Actions Header */}

            <div className="mb-2">

              <h2
                className="
                  text-[21px]
                  leading-tight
                  font-bold
                  text-[#182238]
                "
              >
                Quick Actions
              </h2>

            </div>

            {/* Compact Action List */}

            <div className="space-y-1">

              {quickActions.map((action) => {

                const Icon = action.icon;

                return (
                  <NavLink
                    key={action.title}
                    to={action.path}
                    className="
                      group

                      flex
                      items-center
                      gap-3

                      w-full

                      min-h-7.5

                      rounded-lg

                      border
                      border-[#D9E1EC]

                      bg-white

                      px-3
                      py-1

                      transition-all
                      duration-200

                      hover:border-[#C5D2E5]
                      hover:bg-[#F8FAFD]
                      hover:shadow-sm
                    "
                  >

                    {/* Icon */}

                    <Icon
                      className="
                        h-3.5
                        w-3.5
                        shrink-0
                        text-[#64748B]

                        group-hover:text-[#4F5EF7]
                      "
                      strokeWidth={1.8}
                    />

                    {/* Title */}

                    <span
                      className="
                        w-31.25
                        shrink-0

                        text-[11px]
                        font-bold

                        text-[#27344D]
                      "
                    >
                      {action.title}
                    </span>

                    {/* Description */}

                    <span
                      className="
                        min-w-0
                        truncate

                        text-[11px]

                        text-[#718096]
                      "
                    >
                      {action.description}
                    </span>

                  </NavLink>
                );

              })}

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}