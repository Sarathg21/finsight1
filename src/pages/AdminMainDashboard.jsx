import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import PageHeader from "../components/common/PageHeader";
import PageSkeleton from "../components/common/PageSkeleton";
import {
  Users, UserCheck, ShieldCheck, LockKeyhole, Building2, Building, GitBranch, Layers, BriefcaseBusiness, FileCode2,
  CheckCircle2, UserPlus, Shield, KeyRound,
} from "lucide-react";
import { getAdminSystemStatus } from "../api/adminApi";

export default function AdminMainDashboard() {
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
      setSummary(response.data.data);
    } catch (error) {
      console.error("Admin System Status API Error:", error);
      setError("Unable to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAdminSummary();
  };

  if (loading) {
    return (
      <div className="p-4">
        <PageSkeleton />
      </div>
    );
  }

  const securityKpis = [
    { title: "Total Users", value: summary?.total_users ?? 0, description: "Registered users", icon: Users, background: "bg-[#EEF2FF]", border: "border-[#D7DEF0]" },
    { title: "Active Users", value: summary?.active_users ?? 0, description: "Live status count", icon: UserCheck, background: "bg-[#EDF9F2]", border: "border-[#CFE8D8]" },
    { title: "Active Roles", value: summary?.total_roles ?? 0, description: "Active roles", icon: ShieldCheck, background: "bg-[#F5F0FF]", border: "border-[#DED3F3]" },
    { title: "Active Accesses", value: summary?.active_role_accesses ?? summary?.active_accesses ?? 0, description: "Access assignments", icon: LockKeyhole, background: "bg-[#FFF5E8]", border: "border-[#EBDCC5]" },
  ];

  const masterDataKpis = [
    { title: "Legal Groups", value: summary?.legal_groups ?? summary?.total_legal_groups ?? 0, description: "Active records", icon: Building2 },
    { title: "Legal Entities", value: summary?.legal_entities ?? summary?.total_legal_entities ?? 0, description: "Active records", icon: Building },
    { title: "Parent Divisions", value: summary?.parent_divisions ?? summary?.total_parent_divisions ?? 0, description: "Active records", icon: GitBranch },
    { title: "Subdivisions", value: summary?.subdivisions ?? summary?.total_sub_divisions ?? 0, description: "Active records", icon: Layers },
    { title: "Business Units", value: summary?.business_units ?? summary?.total_business_units ?? 0, description: "Active records", icon: BriefcaseBusiness },
    { title: "Analysis Codes", value: summary?.analysis_codes ?? summary?.total_analysis_codes ?? 0, description: "Active records", icon: FileCode2 },
  ];

  const systemStatus = [
    { name: "Backend API", description: "FastAPI service", status: summary?.api_status ?? "unknown" },
    { name: "Database", description: "PostgreSQL", status: summary?.database ?? summary?.database_status ?? "unknown" },
  ];

  const quickActions = [
    { title: "Add User", description: "Create a new user", icon: UserPlus, path: "/admin/users" },
    { title: "Manage Roles", description: "Roles and permissions", icon: Shield, path: "/admin/roles" },
    { title: "Assign Access", description: "Organization access scope", icon: KeyRound, path: "/admin/useraccess" },
    { title: "Master Data", description: "Maintain hierarchy", icon: Layers, path: "/admin/master-data" },
  ];

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderKpiCard = (card, index) => {
    const Icon = card.icon;
    return (
      <div
        key={`${card.title}-${index}`}
        className={`relative min-h-[94px] rounded-xl border ${card.border || "border-[#D7E0ED]"} ${card.background || "bg-white"} px-4 py-3 transition-all duration-200 hover:-translate-y-px hover:shadow-sm`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold tracking-wide text-[#64748B]">{card.title}</span>
          <Icon className="h-4 w-4 shrink-0 text-[#64748B]" strokeWidth={1.8} />
        </div>
        <div className="mt-2 text-[27px] font-bold leading-none tracking-tight text-[#182238]">
          {card.value}
        </div>
        <div className="mt-1.5 text-[11px] leading-tight text-[#718096]">{card.description}</div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col flex-1 bg-[#F7F9FC] pb-4">
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

      {/* SECURITY & ACCESS */}
      <section className="mt-5">
        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
          Security & Access
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {securityKpis.map((card, index) => renderKpiCard(card, index))}
        </div>
      </section>

      {/* ORGANIZATION MASTER DATA */}
      <section className="mt-3.5">
        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
          Organization Master Data
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
          {masterDataKpis.map((card, index) => renderKpiCard(card, index))}
        </div>
      </section>

      {/* SYSTEM STATUS + QUICK ACTIONS */}
      <section className="mt-3.5 grid grid-cols-1 xl:grid-cols-12 gap-3">

        {/* SYSTEM STATUS (7 columns) */}
        <div className="xl:col-span-7 rounded-xl border border-[#D6DFEC] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[21px] leading-tight font-bold text-[#182238]">System Status</h2>
              <p className="mt-0.5 text-[11px] leading-tight text-[#718096]">Live application health</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF8F1] px-3 py-1 text-[11px] font-bold text-[#12A36A]">
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
              Healthy
            </span>
          </div>

          <div className="divide-y divide-[#DCE3EE]">
            {systemStatus.map((item) => (
              <div key={item.name} className="grid min-h-[35px] grid-cols-[145px_1fr_auto] items-center gap-3 py-1 text-[11px]">
                <div className="font-bold text-[#1E293B]">{item.name}</div>
                <div className="text-[#718096]">{item.description}</div>
                <div className="text-right">
                  <span className={`font-semibold ${item.status === "running" || item.status === "connected" ? "text-[#12A36A]" : "text-[#DC2626]"}`}>
                    {formatStatus(item.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS (5 columns) */}
        <div className="xl:col-span-5 rounded-xl border border-[#D6DFEC] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
          <div className="mb-2">
            <h2 className="text-[21px] leading-tight font-bold text-[#182238]">Quick Actions</h2>
          </div>
          <div className="space-y-1">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <NavLink
                  key={action.title}
                  to={action.path}
                  className="group flex min-h-[30px] w-full items-center gap-3 rounded-lg border border-[#D9E1EC] bg-white px-3 py-1 transition-all duration-200 hover:border-[#C5D2E5] hover:bg-[#F8FAFD] hover:shadow-sm"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-[#64748B] group-hover:text-[#4F5EF7]" strokeWidth={1.8} />
                  <span className="w-[125px] shrink-0 text-[11px] font-bold text-[#27344D]">{action.title}</span>
                  <span className="min-w-0 truncate text-[11px] text-[#718096]">{action.description}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
