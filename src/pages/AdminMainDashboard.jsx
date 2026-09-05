

import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import PageHeader from "../components/Common/PageHeader";

import {
  Users,
  UserCheck,
  ShieldCheck,
  LockKeyhole,
  Building2,
  Building,
  GitBranch,
  Layers,
  BriefcaseBusiness,
  FileCode2,
  CheckCircle2,
  UserPlus,
  Shield,
  KeyRound,
  CalendarDays,
  RefreshCw,
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

  // if (loading) {
  //   return (
  //     <div style={styles.loadingWrapper}>
  //       <PageSkeleton />
  //     </div>
  //   );
  // }

  /* =========================================================
     SECURITY KPI DATA
  ========================================================= */

  const securityKpis = [
    {
      title: "Total Users",
      value: summary?.total_users ?? 0,
      description: "Registered users",
      icon: Users,
      background: "#EEF2FF",
      border: "#D7DEF0",
    },

    {
      title: "Active Users",
      value: summary?.active_users ?? 0,
      description: "Live status count",
      icon: UserCheck,
      background: "#EDF9F2",
      border: "#CFE8D8",
    },

    {
      title: "Active Roles",
      value: summary?.total_roles ?? 0,
      description: "Active roles",
      icon: ShieldCheck,
      background: "#F5F0FF",
      border: "#DED3F3",
    },

    {
      title: "Active Accesses",
      value: summary?.active_accesses ?? 0,
      description: "Access assignments",
      icon: LockKeyhole,
      background: "#FFF5E8",
      border: "#EBDCC5",
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
  ========================================================= */

  const renderKpiCard = (card, index) => {
    const Icon = card.icon;

    return (
      <div
        key={`${card.title}-${index}`}
        style={{
          ...styles.kpiCard,
          background: card.background || "#FFFFFF",
          borderColor: card.border || "#D7E0ED",
        }}
      >
        {/* Card Header */}

        <div style={styles.kpiHeader}>
          <span style={styles.kpiTitle}>
            {card.title}
          </span>

          <Icon
            style={styles.kpiIcon}
            strokeWidth={1.8}
          />
        </div>

        {/* Value */}

        <div style={styles.kpiValue}>
          {card.value}
        </div>

        {/* Description */}

        <div style={styles.kpiDescription}>
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
      path: "/admin/useraccess",
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
     CURRENT DATE
  ========================================================= */

  const currentDate = new Date();

  const formattedDate = currentDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div style={styles.page}>
      {/* =====================================================
          DASHBOARD CONTENT
      ===================================================== */}

      <div style={styles.content}>
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div style={styles.headerWrapper}>
          <PageHeader
            variant="dashboard"
            title="Admin Dashboard"
            subtitle="Users, access control, organization master data and system health."
          />

          {/* ===================================================
              CALENDAR + REFRESH
          =================================================== */}

          <div style={styles.headerActions}>
            {/* Calendar */}

            <button
              type="button"
              style={styles.dateButton}
            >
              <CalendarDays
                style={styles.dateIcon}
                strokeWidth={1.8}
              />

              <span>{formattedDate}</span>
            </button>

            {/* Refresh */}

            <button
              type="button"
              onClick={handleRefresh}
              style={styles.refreshButton}
              disabled={loading}
            >
              <RefreshCw
                style={{
                  ...styles.refreshIcon,
                  animation: loading
                    ? "spin 1s linear infinite"
                    : "none",
                }}
                strokeWidth={2}
              />

              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* =====================================================
            SECURITY & ACCESS
        ===================================================== */}

        <section style={styles.securitySection}>
          <div style={styles.sectionTitle}>
            Security & Access
          </div>

          <div style={styles.securityGrid}>
            {securityKpis.map((card, index) =>
              renderKpiCard(card, index)
            )}
          </div>
        </section>

        {/* =====================================================
            ORGANIZATION MASTER DATA
        ===================================================== */}

        <section style={styles.masterDataSection}>
          <div style={styles.sectionTitle}>
            Organization Master Data
          </div>

          <div style={styles.masterDataGrid}>
            {masterDataKpis.map((card, index) =>
              renderKpiCard(card, index)
            )}
          </div>
        </section>

        {/* =====================================================
            SYSTEM STATUS + QUICK ACTIONS
        ===================================================== */}

        <section style={styles.bottomGrid}>
          {/* ===================================================
              SYSTEM STATUS
          =================================================== */}

          <div style={styles.systemStatusCard}>
            {/* Header */}

            <div style={styles.statusHeader}>
              <div>
                <h2 style={styles.largeTitle}>
                  System Status
                </h2>

                <p style={styles.subtitle}>
                  Live application health
                </p>
              </div>

              {/* Healthy Badge */}

              <span style={styles.healthyBadge}>
                <CheckCircle2
                  style={styles.healthyIcon}
                  strokeWidth={2.5}
                />

                Healthy
              </span>
            </div>

            {/* Status Rows */}

            <div style={styles.statusRows}>
              {systemStatus.map((item) => (
                <div
                  key={item.name}
                  style={styles.statusRow}
                >
                  {/* Name */}

                  <div style={styles.statusName}>
                    {item.name}
                  </div>

                  {/* Description */}

                  <div style={styles.statusDescription}>
                    {item.description}
                  </div>

                  {/* Status */}

                  <div style={styles.statusValueWrapper}>
                    <span
                      style={{
                        ...styles.statusValue,
                        color:
                          item.status === "running" ||
                            item.status === "connected"
                            ? "#12A36A"
                            : "#DC2626",
                      }}
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

          <div style={styles.quickActionsCard}>
            {/* Quick Actions Header */}

            <div style={styles.quickActionsHeader}>
              <h2 style={styles.largeTitle}>
                Quick Actions
              </h2>
            </div>

            {/* Compact Action List */}

            <div style={styles.quickActionsList}>
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <NavLink
                    key={action.title}
                    to={action.path}
                    style={({ isActive }) => ({
                      ...styles.quickActionLink,
                      background: isActive
                        ? "#F8FAFD"
                        : "#FFFFFF",
                    })}
                  >
                    {/* Icon */}

                    <Icon
                      style={styles.quickActionIcon}
                      strokeWidth={1.8}
                    />

                    {/* Title */}

                    <span style={styles.quickActionTitle}>
                      {action.title}
                    </span>

                    {/* Description */}

                    <span
                      style={styles.quickActionDescription}
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

      {/* =======================================================
          SPIN ANIMATION
      ======================================================= */}

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   INLINE STYLE CONFIGURATION
   No Tailwind classes
========================================================= */

const styles = {
  /* =======================================================
     PAGE
  ======================================================= */

  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    background: "#F7F9FC",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingBottom: "0",
    overflow: "visible",
    boxSizing: "border-box",
  },

  content: {
    flex: 1,
    width: "100%",
  },

  loadingWrapper: {
    padding: "16px",
    boxSizing: "border-box",
  },

  /* =======================================================
     HEADER
  ======================================================= */

  headerWrapper: {
    position: "relative",
    width: "100%",
  },

  headerActions: {
    position: "absolute",
    top: "10px",
    right: "0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    zIndex: 5,
  },

  dateButton: {
    height: "34px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "0 12px",
    border: "1px solid #DCE3EE",
    borderRadius: "8px",
    background: "#FFFFFF",
    color: "#27344D",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    boxSizing: "border-box",
    whiteSpace: "nowrap",
  },

  dateIcon: {
    width: "15px",
    height: "15px",
    color: "#64748B",
    flexShrink: 0,
  },

  refreshButton: {
    height: "34px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "0 13px",
    border: "1px solid #2563EB",
    borderRadius: "8px",
    background: "#2563EB",
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    boxSizing: "border-box",
    whiteSpace: "nowrap",
  },

  refreshIcon: {
    width: "15px",
    height: "15px",
    flexShrink: 0,
  },

  /* =======================================================
     ERROR
  ======================================================= */

  errorBox: {
    marginTop: "12px",
    border: "1px solid #FECACA",
    borderRadius: "8px",
    background: "#FEF2F2",
    padding: "12px 16px",
    color: "#DC2626",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  /* =======================================================
     SECTION
  ======================================================= */

  securitySection: {
    marginTop: "20px",
  },

  masterDataSection: {
    marginTop: "14px",
  },

  sectionTitle: {
    marginBottom: "6px",
    color: "#64748B",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.025em",
    lineHeight: "16px",
  },

  /* =======================================================
     KPI GRIDS
  ======================================================= */

  securityGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "12px",
    width: "100%",
  },

  masterDataGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "10px",
    width: "100%",
  },

  /* =======================================================
     KPI CARD
  ======================================================= */

  kpiCard: {
    position: "relative",
    minHeight: "92px",
    borderRadius: "12px",
    border: "1px solid",
    padding: "10px 16px",
    boxSizing: "border-box",
    transition:
      "transform 200ms ease, box-shadow 200ms ease",
  },

  kpiHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },

  kpiTitle: {
    color: "#64748B",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.025em",
    lineHeight: "16px",
  },

  kpiIcon: {
    width: "16px",
    height: "16px",
    flexShrink: 0,
    color: "#64748B",
  },

  kpiValue: {
    marginTop: "8px",
    color: "#182238",
    fontSize: "27px",
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: "-0.025em",
  },

  kpiDescription: {
    marginTop: "6px",
    color: "#718096",
    fontSize: "11px",
    lineHeight: 1.2,
  },

  /* =======================================================
     BOTTOM GRID
  ======================================================= */

  bottomGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.5fr) minmax(280px, 1fr)",
    gap: "12px",
    marginTop: "14px",
    width: "100%",
    alignItems: "stretch",
  },

  /* =======================================================
     SYSTEM STATUS
  ======================================================= */

  systemStatusCard: {
    borderRadius: "12px",
    border: "1px solid #D6DFEC",
    background: "#FFFFFF",
    padding: "10px 16px",
    boxShadow:
      "0 1px 2px rgba(15, 23, 42, 0.02)",
    boxSizing: "border-box",
    minWidth: 0,
  },

  statusHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "4px",
  },

  largeTitle: {
    margin: 0,
    color: "#182238",
    fontSize: "21px",
    lineHeight: 1.2,
    fontWeight: 700,
  },

  subtitle: {
    margin: "2px 0 0",
    color: "#718096",
    fontSize: "11px",
    lineHeight: 1.2,
  },

  healthyBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
    borderRadius: "999px",
    background: "#EAF8F1",
    padding: "4px 12px",
    color: "#12A36A",
    fontSize: "11px",
    fontWeight: 700,
    lineHeight: 1.4,
  },

  healthyIcon: {
    width: "14px",
    height: "14px",
  },

  statusRows: {
    width: "100%",
  },

  statusRow: {
    display: "grid",
    gridTemplateColumns:
      "145px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: "12px",
    minHeight: "34px",
    paddingTop: "4px",
    paddingBottom: "4px",
    borderBottom: "1px solid #DCE3EE",
    fontSize: "11px",
    boxSizing: "border-box",
  },

  statusName: {
    color: "#1E293B",
    fontWeight: 700,
  },

  statusDescription: {
    minWidth: 0,
    color: "#718096",
  },

  statusValueWrapper: {
    textAlign: "right",
  },

  statusValue: {
    fontWeight: 600,
  },

  /* =======================================================
     QUICK ACTIONS
  ======================================================= */

  quickActionsCard: {
    borderRadius: "12px",
    border: "1px solid #D6DFEC",
    background: "#FFFFFF",
    padding: "12px",
    boxShadow:
      "0 1px 2px rgba(15, 23, 42, 0.02)",
    boxSizing: "border-box",
    minWidth: 0,
  },

  quickActionsHeader: {
    marginBottom: "8px",
  },

  quickActionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    width: "100%",
  },

  quickActionLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    minHeight: "30px",
    borderRadius: "8px",
    border: "1px solid #D9E1EC",
    padding: "4px 12px",
    boxSizing: "border-box",
    textDecoration: "none",
    transition:
      "border-color 200ms ease, background 200ms ease, box-shadow 200ms ease",
  },

  quickActionIcon: {
    width: "14px",
    height: "14px",
    flexShrink: 0,
    color: "#64748B",
  },

  quickActionTitle: {
    width: "125px",
    flexShrink: 0,
    color: "#27344D",
    fontSize: "11px",
    fontWeight: 700,
    lineHeight: 1.2,
  },

  quickActionDescription: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#718096",
    fontSize: "11px",
    lineHeight: 1.2,
  },
};