


import React, { useState, useEffect, useCallback } from "react";

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

  ArrowUpRight,

  Activity,

  Server,

  Database,

  Sparkles,

} from "lucide-react";



import { getAdminSystemStatus } from "../api/adminApi";



export default function AdminMainDashboard() {

  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState(null);

  const [error, setError] = useState("");



  const fetchAdminSummary = useCallback(async () => {

    try {

      setLoading(true);

      setError("");



      const response = await getAdminSystemStatus();

      setSummary(response?.data?.data ?? null);

    } catch (err) {

      console.error("Admin System Status API Error:", err);

      setError("Unable to load admin dashboard data. Please try again.");

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {

    fetchAdminSummary();

  }, [fetchAdminSummary]);



  const handleRefresh = () => {

    if (!loading) fetchAdminSummary();

  };



  const formatKpiValue = (value) => {

    if (value === null || value === undefined || value === "") {

      return "-";

    }



    if (typeof value === "number") {

      return Number.isFinite(value)

        ? value.toLocaleString("en-US", {

          maximumFractionDigits: 2,

        })

        : "-";

    }



    const normalized = String(value).trim().replace(/,/g, "");



    if (normalized === "") return "-";



    const number = Number(normalized);



    return Number.isFinite(number)

      ? number.toLocaleString("en-US", {

        maximumFractionDigits: 2,

      })

      : String(value);

  };



  const securityKpis = [

    {

      title: "Total Users",

      value: summary?.total_users,

      description: "Registered users",

      icon: Users,

      color: "#4667E8",

      softColor: "#EEF2FF",

      borderColor: "#DCE5FF",

    },

    {

      title: "Active Users",

      value: summary?.active_users,

      description: "Currently active accounts",

      icon: UserCheck,

      color: "#11996D",

      softColor: "#E9F9F1",

      borderColor: "#CDEFE0",

    },

    {

      title: "Active Roles",

      value: summary?.total_roles,

      description: "Configured access roles",

      icon: ShieldCheck,

      color: "#8957D8",

      softColor: "#F3EDFF",

      borderColor: "#E4D8FF",

    },

    {

      title: "Active Accesses",

      value: summary?.active_accesses,

      description: "Access assignments",

      icon: LockKeyhole,

      color: "#D98B23",

      softColor: "#FFF5E5",

      borderColor: "#F5E4C5",

    },

  ];



  const masterDataKpis = [

    {

      title: "Legal Groups",

      value: summary?.legal_groups,

      description: "Active records",

      icon: Building2,

      color: "#4667E8",

      softColor: "#EEF2FF",

      borderColor: "#DCE5FF",

    },

    {

      title: "Legal Entities",

      value: summary?.legal_entities,

      description: "Active records",

      icon: Building,

      color: "#078DAD",

      softColor: "#E7F8FC",

      borderColor: "#CBEFF6",

    },

    {

      title: "Parent Divisions",

      value: summary?.parent_divisions,

      description: "Active records",

      icon: GitBranch,

      color: "#8957D8",

      softColor: "#F3EDFF",

      borderColor: "#E4D8FF",

    },

    {

      title: "Subdivisions",

      value: summary?.subdivisions,

      description: "Active records",

      icon: Layers,

      color: "#11996D",

      softColor: "#E9F9F1",

      borderColor: "#CDEFE0",

    },

    {

      title: "Business Units",

      value: summary?.business_units,

      description: "Active records",

      icon: BriefcaseBusiness,

      color: "#D98B23",

      softColor: "#FFF5E5",

      borderColor: "#F5E4C5",

    },

    {

      title: "Analysis Codes",

      value: summary?.analysis_codes,

      description: "Active records",

      icon: FileCode2,

      color: "#D05C83",

      softColor: "#FFF0F5",

      borderColor: "#F8D9E5",

    },

  ];



  const systemStatus = [

    {

      name: "Backend API",

      description: "FastAPI application service",

      status: summary?.api_status,

      icon: Server,

    },

    {

      name: "Database",

      description: "PostgreSQL database",

      status: summary?.database,

      icon: Database,

    },

  ];



  const quickActions = [

    {

      title: "Add User",

      description: "Create a new user account",

      icon: UserPlus,

      path: "/admin/users",

      color: "#4667E8",

      background: "#EEF2FF",

    },

    {

      title: "Manage Roles",

      description: "Manage roles and permissions",

      icon: Shield,

      path: "/admin/roles",

      color: "#8957D8",

      background: "#F3EDFF",

    },

    {

      title: "Assign Access",

      description: "Configure organization access",

      icon: KeyRound,

      path: "/admin/useraccess",

      color: "#078DAD",

      background: "#E7F8FC",

    },

    {

      title: "Master Data",

      description: "Maintain organizational hierarchy",

      icon: Layers,

      path: "/admin/master-data",

      color: "#11996D",

      background: "#E9F9F1",

    },

  ];



  const formattedDate = new Date().toLocaleDateString("en-GB", {

    day: "2-digit",

    month: "short",

    year: "numeric",

  });



  const normalizeStatus = (status) =>

    String(status ?? "").trim().toLowerCase();



  const isHealthy = (status) =>

    ["running", "connected", "healthy", "ok", "up"].includes(

      normalizeStatus(status)

    );



  const hasStatus = (status) =>

    status !== null &&

    status !== undefined &&

    String(status).trim() !== "";



  const knownStatuses = systemStatus.filter((item) =>

    hasStatus(item.status)

  );



  const allStatusesHealthy =

    knownStatuses.length === systemStatus.length &&

    knownStatuses.every((item) => isHealthy(item.status));



  const hasUnhealthyStatus = knownStatuses.some(

    (item) => !isHealthy(item.status)

  );



  const overallStatus = allStatusesHealthy

    ? "All Systems Operational"

    : hasUnhealthyStatus

      ? "Attention Required"

      : "Status Unavailable";



  const overallStatusType = allStatusesHealthy

    ? "healthy"

    : hasUnhealthyStatus

      ? "warning"

      : "unknown";



  const formatStatus = (status) => {

    if (!hasStatus(status)) return "Unknown";



    return String(status)

      .replace(/[\_-]+/g, " ")

      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  };



  const renderKpiCard = (card, index) => {
    const Icon = card.icon;

    return (
      <article
        key={card.title}
        className={`admin-pro-kpi admin-pro-kpi-${index}`}
        style={{
          "--kpi-color": card.color,
          "--kpi-soft": card.softColor,
          "--kpi-border": card.borderColor,
          "--kpi-delay": `${index * 65}ms`,
        }}
      >
        <div className="admin-pro-kpi-top">
          <div className="admin-pro-kpi-icon">
            <Icon size={18} strokeWidth={1.9} />
          </div>
        </div>

        <div className="admin-pro-kpi-bottom">
          <span className="admin-pro-kpi-label" title={card.title}>
            {card.title}
          </span>
          <div className="admin-pro-kpi-value" title={String(card.value ?? "-")}>
            {loading && summary === null ? (
              <span className="admin-pro-value-skeleton" aria-label="Loading" />
            ) : (
              formatKpiValue(card.value)
            )}
          </div>
          <span className="admin-pro-kpi-description" title={card.description}>
            {card.description}
          </span>
        </div>

        <div className="admin-pro-kpi-progress" aria-hidden="true">
          <span />
        </div>
      </article>
    );
  };

  return (

    <div className="admin-pro-page">

      <style>{`

        .admin-pro-page {

          --admin-navy: #17264b;

          --admin-blue: #315be8;

          --admin-muted: #71809a;

          --admin-border: #e5eaf2;

          min-height: 100vh;

          width: 100%;

          padding: 18px 22px 26px;

          box-sizing: border-box;

          background:

            radial-gradient(ellipse at 3% 0%, rgba(91, 124, 255, .055), transparent 32%),

            #f5f7fb;

          color: var(--admin-navy);

          font-family: inherit;

        }



        .admin-pro-page *,

        .admin-pro-page *::before,

        .admin-pro-page *::after {

          box-sizing: border-box;

        }



        .admin-pro-content {

          width: 100%;

          max-width: 1800px;

          margin: 0 auto;

        }



        .admin-pro-header {

          position: relative;

          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 20px;

          margin-bottom: 25px;

          padding-bottom: 17px;

          border-bottom: 1px solid #e3e9f3;

        }



        .admin-pro-header > div:first-child {

          min-width: 0;

          flex: 1;

        }



        .admin-pro-header .admin-pro-actions {

          flex-shrink: 0;

          display: flex;

          align-items: center;

          gap: 9px;

          padding-top: 7px;

        }



        .admin-pro-date,

        .admin-pro-refresh {

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          height: 39px;

          padding: 0 14px;

          border-radius: 10px;

          font: inherit;

          font-size: 12px;

          font-weight: 650;

          white-space: nowrap;

          transition: transform .18s ease, box-shadow .18s ease,

            background .18s ease, border-color .18s ease;

        }



        .admin-pro-date {

          color: #42516c;

          background: rgba(255,255,255,.9);

          border: 1px solid #e0e6f0;

        }



        .admin-pro-refresh {

          color: #fff;

          background: linear-gradient(135deg, #4169f5, #2850d9);

          border: 1px solid #3159e7;

          box-shadow: 0 4px 11px rgba(49, 91, 232, .18);

          cursor: pointer;

        }



        .admin-pro-refresh:hover:not(:disabled) {

          transform: translateY(-2px);

          box-shadow: 0 7px 16px rgba(49, 91, 232, .26);

        }



        .admin-pro-refresh:disabled {

          opacity: .72;

          cursor: wait;

        }



        .admin-pro-refresh:focus-visible,

        .admin-pro-action:focus-visible {

          outline: 3px solid rgba(65, 105, 245, .25);

          outline-offset: 3px;

        }



        .admin-pro-section {

          margin-top: 23px;

        }



        .admin-pro-section-heading {

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 12px;

          margin-bottom: 12px;

        }



        .admin-pro-section-title-wrap {

          display: flex;

          align-items: center;

          gap: 10px;

          min-width: 0;

        }



        .admin-pro-section-marker {

          display: inline-block;

          width: 4px;

          height: 22px;

          flex-shrink: 0;

          border-radius: 5px;

          background: linear-gradient(180deg, #6084ff, #315be8);

        }



        .admin-pro-section-title {

          margin: 0;

          color: #243452;

          font-size: 15px;

          font-weight: 750;

          letter-spacing: -.25px;

        }



        .admin-pro-section-caption {

          color: #8b97ab;

          font-size: 11px;

          font-weight: 550;

        }



        .admin-pro-security-grid {

          display: grid;

          grid-template-columns: repeat(4, minmax(0, 1fr));

          gap: 15px;

        }



        .admin-pro-master-grid {

          display: grid;

          grid-template-columns: repeat(6, minmax(0, 1fr));

          gap: 13px;

        }



                .admin-pro-kpi {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          min-height: 84px;
          padding: 11px 12px;
          overflow: hidden;
          border: 1px solid transparent;
          border-radius: 13px;
          background: var(--kpi-soft);
          box-shadow: 0 2px 7px rgba(31, 49, 89, .025);
          animation: adminProEnter .45s both;
          animation-delay: var(--kpi-delay);
          transition: transform .22s ease, box-shadow .22s ease,
            border-color .22s ease, filter .22s ease;
        }

        .admin-pro-kpi::before {
          position: absolute;
          inset: 0 auto 0 0;
          width: 3px;
          content: "";
          background: var(--kpi-color);
          opacity: 0;
          transition: opacity .2s ease;
        }

        .admin-pro-kpi:hover {
          transform: translateY(-3px);
          border-color: var(--kpi-border);
          box-shadow: 0 8px 18px rgba(31, 49, 89, .09);
          filter: saturate(1.04);
        }

        .admin-pro-kpi:hover::before { opacity: .8; }

        .admin-pro-kpi-top {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 32px;
          width: 32px;
          min-width: 32px;
        }

        .admin-pro-kpi-heading { display: none; }

        .admin-pro-kpi-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          border: 0;
          border-radius: 50%;
          color: var(--kpi-color);
          background: rgba(255,255,255,.55);
          transition: transform .22s ease, box-shadow .22s ease;
        }

        .admin-pro-kpi:hover .admin-pro-kpi-icon {
          transform: scale(1.08);
          box-shadow: 0 3px 8px rgba(31,49,89,.08);
        }

        .admin-pro-kpi-bottom {
          position: relative;
          display: block;
          flex: 1;
          min-width: 0;
          margin: 0;
          padding: 0;
        }

        .admin-pro-kpi-value {
          position: relative;
          z-index: 1;
          color: #17243b;
          font-size: 17px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -.45px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }

        .admin-pro-kpi-decoration { display: none; }

        .admin-pro-kpi-progress {
          position: absolute;
          left: 45px;
          right: 12px;
          bottom: 8px;
          height: 2px;
          margin: 0;
          overflow: hidden;
          border-radius: 5px;
          background: rgba(255,255,255,.55);
        }

        .admin-pro-kpi-progress span {
          display: block;
          width: 38%;
          height: 100%;
          border-radius: inherit;
          background: var(--kpi-color);
          opacity: .65;
          transition: width .3s ease;
        }

        .admin-pro-kpi:hover .admin-pro-kpi-progress span { width: 68%; }

        .admin-pro-kpi .admin-pro-kpi-label {
          display: block;
          margin: 0 0 3px;
          color: var(--kpi-color);
          font-size: 10.5px;
          font-weight: 750;
          line-height: 1.15;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .admin-pro-kpi .admin-pro-kpi-description {
          display: block;
          margin-top: 3px;
          color: #748198;
          font-size: 9px;
          font-weight: 600;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .admin-pro-value-skeleton {

          display: inline-block;

          width: 85px;

          height: 26px;

          border-radius: 6px;

          background: linear-gradient(90deg, #edf0f7, #e1e7f3, #edf0f7);

          background-size: 200% 100%;

          animation: adminProShimmer 1.3s infinite linear;

        }



        .admin-pro-bottom-grid {

          display: grid;

          grid-template-columns: minmax(0, 1.12fr) minmax(0, 1fr);

          gap: 16px;

          margin-top: 24px;

          align-items: stretch;

        }



        .admin-pro-panel {

          min-width: 0;

          overflow: hidden;

          border: 1px solid #e3e9f2;

          border-radius: 17px;

          background: #fff;

          box-shadow: 0 4px 16px rgba(31, 49, 89, .035);

        }



        .admin-pro-panel-header {

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 12px;

          padding: 18px 19px 15px;

          border-bottom: 1px solid #edf0f6;

        }



        .admin-pro-panel-heading {

          display: flex;

          align-items: center;

          gap: 11px;

          min-width: 0;

        }



        .admin-pro-panel-icon {

          display: flex;

          align-items: center;

          justify-content: center;

          width: 41px;

          height: 41px;

          flex-shrink: 0;

          border-radius: 12px;

          color: #3b60df;

          background: #edf2ff;

        }



        .admin-pro-panel-title {

          margin: 0;

          color: #1d2c49;

          font-size: 15px;

          font-weight: 750;

          letter-spacing: -.3px;

        }



        .admin-pro-panel-subtitle {

          margin: 4px 0 0;

          color: #8793a8;

          font-size: 11px;

          line-height: 1.45;

        }



        .admin-pro-overall-status {

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 6px;

          max-width: 190px;

          padding: 7px 10px;

          border: 1px solid transparent;

          border-radius: 9px;

          font-size: 10px;

          font-weight: 750;

          line-height: 1.35;

          text-align: center;

        }



        .admin-pro-overall-status.healthy {

          color: #12865e;

          background: #eaf9f2;

          border-color: #d1f0e2;

        }



        .admin-pro-overall-status.warning {

          color: #b45309;

          background: #fff7e8;

          border-color: #f6e4bb;

        }



        .admin-pro-overall-status.unknown {

          color: #64748b;

          background: #f1f5f9;

          border-color: #e2e8f0;

        }



        .admin-pro-status-list {

          padding: 4px 19px 12px;

        }



        .admin-pro-status-row {

          display: flex;

          align-items: center;

          gap: 12px;

          min-height: 66px;

          padding: 12px 0;

          border-bottom: 1px solid #eef1f6;

        }



        .admin-pro-status-row:last-child {

          border-bottom: none;

        }



        .admin-pro-status-row-icon {

          display: flex;

          align-items: center;

          justify-content: center;

          width: 36px;

          height: 36px;

          flex-shrink: 0;

          border: 1px solid #e8edf5;

          border-radius: 11px;

          color: #647590;

          background: #f7f9fc;

        }



        .admin-pro-status-info {

          flex: 1;

          min-width: 0;

        }



        .admin-pro-status-name {

          color: #263653;

          font-size: 12px;

          font-weight: 750;

        }



        .admin-pro-status-description {

          margin-top: 4px;

          color: #8b97aa;

          font-size: 10.5px;

          line-height: 1.4;

        }



        .admin-pro-status-value {

          display: inline-flex;

          align-items: center;

          gap: 6px;

          flex-shrink: 0;

          padding: 6px 9px;

          border: 1px solid #e4eaf1;

          border-radius: 8px;

          color: #68758a;

          background: #f8fafc;

          font-size: 10px;

          font-weight: 750;

        }



        .admin-pro-status-value.healthy {

          color: #12865e;

          background: #edfaf3;

          border-color: #d4f0e1;

        }



        .admin-pro-status-value.warning {

          color: #b45309;

          background: #fff7e8;

          border-color: #f6e4bb;

        }



        .admin-pro-status-dot {

          width: 6px;

          height: 6px;

          flex-shrink: 0;

          border-radius: 50%;

          background: currentColor;

        }



        .admin-pro-status-value.healthy .admin-pro-status-dot {

          box-shadow: 0 0 0 3px rgba(18, 134, 94, .09);

        }



        .admin-pro-actions-panel .admin-pro-panel-header {

          padding-bottom: 17px;

        }



        .admin-pro-sparkle {

          color: #7c8ba5;

        }



        .admin-pro-action-list {

          display: grid;

          grid-template-columns: repeat(2, minmax(0, 1fr));

          gap: 11px;

          padding: 16px;

        }



        .admin-pro-action {

          display: flex;

          align-items: center;

          gap: 11px;

          min-width: 0;

          min-height: 86px;

          padding: 13px;

          border: 1px solid #e6ebf3;

          border-radius: 13px;

          color: inherit;

          background: #fff;

          text-decoration: none;

          transition: transform .2s ease, box-shadow .2s ease,

            border-color .2s ease, background .2s ease;

        }



        .admin-pro-action:hover {

          transform: translateY(-3px);

          border-color: #cbd6f8;

          background: #fbfcff;

          box-shadow: 0 7px 17px rgba(31, 49, 89, .07);

        }



        .admin-pro-action.active {

          border-color: #b9c9ff;

          background: #f6f8ff;

        }



        .admin-pro-action-icon {

          display: flex;

          align-items: center;

          justify-content: center;

          width: 41px;

          height: 41px;

          flex-shrink: 0;

          border-radius: 12px;

          transition: transform .2s ease;

        }



        .admin-pro-action:hover .admin-pro-action-icon {

          transform: scale(1.06);

        }



        .admin-pro-action-text {

          flex: 1;

          min-width: 0;

        }



        .admin-pro-action-title {

          display: block;

          color: #253653;

          font-size: 11.5px;

          font-weight: 750;

          line-height: 1.4;

        }



        .admin-pro-action-description {

          display: block;

          margin-top: 5px;

          color: #8995a9;

          font-size: 10px;

          line-height: 1.45;

          overflow-wrap: anywhere;

        }



        .admin-pro-action-arrow {

          flex-shrink: 0;

          color: #9aa6b9;

          transition: transform .2s ease, color .2s ease;

        }



        .admin-pro-action:hover .admin-pro-action-arrow {

          color: #315be8;

          transform: translate(2px, -2px);

        }



        .admin-pro-error {

          display: flex;

          align-items: flex-start;

          gap: 10px;

          margin: 14px 0;

          padding: 13px 15px;

          border: 1px solid #fecaca;

          border-radius: 11px;

          color: #b91c1c;

          background: #fff5f5;

          font-size: 12px;

          line-height: 1.5;

        }



        .admin-pro-error button {

          margin-left: auto;

          flex-shrink: 0;

          padding: 5px 10px;

          border: 1px solid #fecaca;

          border-radius: 7px;

          color: #b91c1c;

          background: #fff;

          font: inherit;

          font-weight: 700;

          cursor: pointer;

        }



        @keyframes adminProEnter {

          from {

            opacity: 0;

            transform: translateY(9px);

          }

          to {

            opacity: 1;

            transform: translateY(0);

          }

        }



        @keyframes adminProShimmer {

          from { background-position: 100% 0; }

          to { background-position: -100% 0; }

        }



        @keyframes adminProSpin {

          to { transform: rotate(360deg); }

        }



        .admin-pro-spin {

          animation: adminProSpin .9s linear infinite;

        }



        @media (max-width: 1200px) {

          .admin-pro-master-grid {

            grid-template-columns: repeat(3, minmax(0, 1fr));

          }



          .admin-pro-security-grid {

            grid-template-columns: repeat(2, minmax(0, 1fr));

          }



          .admin-pro-bottom-grid {

            grid-template-columns: minmax(0, 1fr);

          }

        }



        @media (max-width: 700px) {

          .admin-pro-page {

            padding: 13px 12px 22px;

          }



          .admin-pro-header {

            flex-direction: column;

            gap: 12px;

            margin-bottom: 18px;

            padding-bottom: 14px;

          }



          .admin-pro-header .admin-pro-actions {

            width: 100%;

            justify-content: flex-start;

            padding-top: 0;

          }



          .admin-pro-date,

          .admin-pro-refresh {

            height: 37px;

          }



          .admin-pro-section {

            margin-top: 19px;

          }



          .admin-pro-section-heading {

            align-items: flex-start;

          }



          .admin-pro-section-caption {

            display: none;

          }



          .admin-pro-security-grid {

            gap: 10px;

          }



          .admin-pro-master-grid {

            grid-template-columns: repeat(2, minmax(0, 1fr));

            gap: 10px;

          }



          .admin-pro-kpi {

            min-height: 135px;

            padding: 14px 12px 12px;

            border-radius: 13px;

          }



          .admin-pro-kpi-icon {

            width: 33px;

            height: 33px;

            border-radius: 10px;

          }



          .admin-pro-kpi-label {

            font-size: 11px;

          }



          .admin-pro-kpi-description {

            font-size: 9.5px;

          }



          .admin-pro-kpi-value {

            font-size: clamp(21px, 6vw, 28px);

          }



          .admin-pro-bottom-grid {

            gap: 13px;

            margin-top: 20px;

          }



          .admin-pro-panel-header {

            padding: 14px;

          }



          .admin-pro-overall-status {

            max-width: 130px;

            font-size: 9px;

          }



          .admin-pro-status-list {

            padding: 3px 14px 9px;

          }



          .admin-pro-action-list {

            gap: 9px;

            padding: 12px;

          }



          .admin-pro-action {

            min-height: 90px;

            gap: 8px;

            padding: 10px;

          }



          .admin-pro-action-icon {

            width: 33px;

            height: 33px;

          }



          .admin-pro-action-title {

            font-size: 10.5px;

          }



          .admin-pro-action-description {

            font-size: 9.5px;

          }



          .admin-pro-action-arrow {

            display: none;

          }

        }



        @media (max-width: 380px) {

          .admin-pro-security-grid {

            grid-template-columns: minmax(0, 1fr);

          }



          .admin-pro-action-list {

            grid-template-columns: minmax(0, 1fr);

          }

        }



        @media (prefers-reduced-motion: reduce) {

          .admin-pro-page *,

          .admin-pro-page *::before,

          .admin-pro-page *::after {

            animation-duration: .01ms !important;

            animation-iteration-count: 1 !important;

            scroll-behavior: auto !important;

            transition-duration: .01ms !important;

          }

        }


        /* Reference-style KPI sizing on smaller screens */
        @media (max-width: 700px) {
          .admin-pro-kpi {
            min-height: 80px;
            padding: 10px;
            gap: 8px;
            border-radius: 12px;
          }
          .admin-pro-kpi-top {
            flex-basis: 29px;
            width: 29px;
            min-width: 29px;
          }
          .admin-pro-kpi-icon {
            width: 29px;
            height: 29px;
          }
          .admin-pro-kpi .admin-pro-kpi-label { font-size: 10px; }
          .admin-pro-kpi .admin-pro-kpi-value { font-size: clamp(14px, 4vw, 17px); }
          .admin-pro-kpi .admin-pro-kpi-description { font-size: 8.5px; }
          .admin-pro-kpi-progress {
            left: 39px;
            right: 10px;
            bottom: 7px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .admin-pro-kpi,
          .admin-pro-kpi * {
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
          }
        }

      `}</style>



      <div className="admin-pro-content">

        <header className="admin-pro-header">

          <div>

            <PageHeader

              variant="dashboard"

              title="Admin Dashboard"

              subtitle="Users, access control, organization master data and system health."

            />

          </div>



          <div className="admin-pro-actions">

            <div className="admin-pro-date">

              <CalendarDays size={16} strokeWidth={1.9} />

              <span>{formattedDate}</span>

            </div>



            <button

              type="button"

              onClick={handleRefresh}

              className="admin-pro-refresh"

              disabled={loading}

              aria-label="Refresh admin dashboard"

            >

              <RefreshCw

                size={15}

                strokeWidth={2}

                className={loading ? "admin-pro-spin" : ""}

              />

              <span>{loading ? "Refreshing..." : "Refresh"}</span>

            </button>

          </div>

        </header>



        {error && (

          <div className="admin-pro-error" role="alert">

            <Activity size={17} />

            <span>{error}</span>

            <button type="button" onClick={handleRefresh} disabled={loading}>

              Retry

            </button>

          </div>

        )}



        <section className="admin-pro-section">

          <div className="admin-pro-section-heading">

            <div className="admin-pro-section-title-wrap">

              <span className="admin-pro-section-marker" />

              <h2 className="admin-pro-section-title">

                Security &amp; Access

              </h2>

            </div>



          </div>



          <div className="admin-pro-security-grid">

            {securityKpis.map(renderKpiCard)}

          </div>

        </section>



        <section className="admin-pro-section">

          <div className="admin-pro-section-heading">

            <div className="admin-pro-section-title-wrap">

              <span className="admin-pro-section-marker" />

              <h2 className="admin-pro-section-title">

                Organization Master Data

              </h2>

            </div>



          </div>



          <div className="admin-pro-master-grid">

            {masterDataKpis.map(renderKpiCard)}

          </div>

        </section>



        <section className="admin-pro-bottom-grid">

          <div className="admin-pro-panel">

            <div className="admin-pro-panel-header">

              <div className="admin-pro-panel-heading">

                <div className="admin-pro-panel-icon">

                  <Activity size={21} strokeWidth={1.9} />

                </div>

                <div>

                  <h2 className="admin-pro-panel-title">System Status</h2>

                  <p className="admin-pro-panel-subtitle">

                    Application and database health

                  </p>

                </div>

              </div>



              <span

                className={`admin-pro-overall-status ${overallStatusType}`}

              >

                {allStatusesHealthy ? (

                  <CheckCircle2 size={14} />

                ) : (

                  <Activity size={14} />

                )}

                {overallStatus}

              </span>

            </div>



            <div className="admin-pro-status-list">

              {systemStatus.map((item) => {

                const Icon = item.icon;

                const healthy = isHealthy(item.status);

                const known = hasStatus(item.status);



                const statusClass = !known

                  ? ""

                  : healthy

                    ? "healthy"

                    : "warning";



                return (

                  <div className="admin-pro-status-row" key={item.name}>

                    <div className="admin-pro-status-row-icon">

                      <Icon size={18} strokeWidth={1.8} />

                    </div>



                    <div className="admin-pro-status-info">

                      <div className="admin-pro-status-name">

                        {item.name}

                      </div>

                      <div className="admin-pro-status-description">

                        {item.description}

                      </div>

                    </div>



                    <span className={`admin-pro-status-value ${statusClass}`}>

                      <span className="admin-pro-status-dot" />

                      {formatStatus(item.status)}

                    </span>

                  </div>

                );

              })}

            </div>

          </div>



          <div className="admin-pro-panel admin-pro-actions-panel">

            <div className="admin-pro-panel-header">

              <div className="admin-pro-panel-heading">

                <div className="admin-pro-panel-icon">

                  <Sparkles size={20} strokeWidth={1.8} />

                </div>

                <div>

                  <h2 className="admin-pro-panel-title">Quick Actions</h2>

                  <p className="admin-pro-panel-subtitle">

                    Common administration tasks

                  </p>

                </div>

              </div>

              <Sparkles className="admin-pro-sparkle" size={17} />

            </div>



            <div className="admin-pro-action-list">

              {quickActions.map((action) => {

                const Icon = action.icon;



                return (

                  <NavLink

                    key={action.title}

                    to={action.path}

                    className={({ isActive }) =>

                      `admin-pro-action${isActive ? " active" : ""}`

                    }

                  >

                    <span

                      className="admin-pro-action-icon"

                      style={{

                        color: action.color,

                        background: action.background,

                      }}

                    >

                      <Icon size={19} strokeWidth={1.9} />

                    </span>



                    <span className="admin-pro-action-text">

                      <span className="admin-pro-action-title">

                        {action.title}

                      </span>

                      <span className="admin-pro-action-description">

                        {action.description}

                      </span>

                    </span>



                    <ArrowUpRight

                      className="admin-pro-action-arrow"

                      size={16}

                    />

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


