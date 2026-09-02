
import React, { useMemo } from "react";
import {
    UserRound,
    ShieldCheck,
    LockKeyhole,
    Eye,
    Download,
    Upload,
    Settings,
    LogOut,
    Info,
    LoaderCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
// =====================================================
// ACTION ICON CONFIGURATION
//
// UI ONLY.
// These do NOT define authorization.
// Authorization comes from backend `actions`.
// =====================================================

const ACTION_ICONS = {
    VIEW: Eye,
    EXPORT: Download,
    UPLOAD: Upload,
    ADMIN: Settings,
};


// =====================================================
// ACTION CSS CONFIGURATION
//
// UI ONLY.
// =====================================================

const ACTION_CLASSES = {
    VIEW: "permission-view",
    EXPORT: "permission-export",
    UPLOAD: "permission-upload",
    ADMIN: "permission-admin",
};


// =====================================================
// DEFAULT ICON
// =====================================================

const DEFAULT_MODULE_ICON = ShieldCheck;


// =====================================================
// DISPLAY VALUE
// =====================================================

const getDisplayValue = (value, fallback = "—") => {
    if (value === null || value === undefined) {
        return fallback;
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return fallback;
        }

        return value
            .map((item) => {
                if (typeof item === "string") {
                    return item;
                }

                if (item && typeof item === "object") {
                    return (
                        item.name ||
                        item.label ||
                        item.code ||
                        item.id ||
                        ""
                    );
                }

                return String(item);
            })
            .filter(Boolean)
            .join(", ");
    }

    if (typeof value === "object") {
        return (
            value.name ||
            value.label ||
            value.code ||
            value.id ||
            fallback
        );
    }

    return String(value);
};


// =====================================================
// FORMAT DATE
// =====================================================

const formatLastLogin = (value) => {
    if (!value) {
        return "—";
    }

    try {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(date);
    } catch {
        return value;
    }
};


// =====================================================
// NORMALIZE MODULE PERMISSIONS
//
// Backend format:
//
// [
//   {
//     module_code: "SALES_REVENUE",
//     can_view: true,
//     can_export: true,
//     can_upload: false,
//     can_admin: false,
//     actions: ["VIEW", "EXPORT"]
//   }
// ]
//
// IMPORTANT:
// No module names are hard-coded here.
// No permissions are hard-coded here.
// =====================================================

const normalizeModulePermissions = (modulePermissions) => {
    if (!Array.isArray(modulePermissions)) {
        return [];
    }

    return modulePermissions
        .filter(
            (item) =>
                item &&
                typeof item === "object" &&
                item.module_code
        )
        .map((item) => {
            const actions = Array.isArray(item.actions)
                ? item.actions
                    .map((action) => {
                        if (typeof action === "string") {
                            return action.toUpperCase();
                        }

                        if (
                            action &&
                            typeof action === "object"
                        ) {
                            return (
                                action.action ||
                                action.name ||
                                action.code ||
                                ""
                            ).toUpperCase();
                        }

                        return "";
                    })
                    .filter(Boolean)
                : [];

            return {
                moduleCode: String(item.module_code),
                actions: [...new Set(actions)],

                // Keep backend flags available if needed later.
                canView: Boolean(item.can_view),
                canExport: Boolean(item.can_export),
                canUpload: Boolean(item.can_upload),
                canAdmin: Boolean(item.can_admin),
            };
        });
};


// =====================================================
// GET UNIQUE ACTIONS
//
// Permissions are obtained ONLY from backend actions[].
// =====================================================

const getUniqueActions = (modules) => {
    const actionSet = new Set();

    modules.forEach((module) => {
        module.actions.forEach((action) => {
            actionSet.add(action);
        });
    });

    return Array.from(actionSet);
};


// =====================================================
// SCOPE DATA
//
// access_scopes is kept separate from module_permissions.
//
// This is the user's organizational/data hierarchy access.
// =====================================================

const buildScopeData = (accessScopes) => {
    const scopes = Array.isArray(accessScopes)
        ? accessScopes
        : [];

    const getUniqueValues = (key) => {
        const values = scopes
            .map((scope) => scope?.[key])
            .filter(
                (value) =>
                    value !== null &&
                    value !== undefined &&
                    value !== ""
            );

        return [...new Set(values)];
    };

    const legalGroups =
        getUniqueValues("legal_group_code");

    const legalEntities =
        getUniqueValues("legal_entity_name");

    const parentDivisions =
        getUniqueValues("parent_division_name");

    const subdivisions =
        getUniqueValues("subdivision_name");

    const analyses =
        getUniqueValues("analysis_name");

    return {
        accessScope:
            scopes.length > 0
                ? `${scopes.length} access scope${scopes.length > 1 ? "s" : ""
                }`
                : "No access assigned",

        legalGroup:
            legalGroups.length > 0
                ? legalGroups.join(", ")
                : "—",

        legalEntity:
            legalEntities.length > 0
                ? legalEntities.join(", ")
                : "—",

        parentDivision:
            parentDivisions.length > 0
                ? parentDivisions.join(", ")
                : "—",

        subDivision:
            subdivisions.length > 0
                ? subdivisions.join(", ")
                : "—",

        analysis:
            analyses.length > 0
                ? analyses.join(", ")
                : "—",
    };
};


// =====================================================
// PROFILE COMPONENT
// =====================================================

export default function Profile() {

    // =====================================================
    // AUTH CONTEXT
    // =====================================================

    const {
        user,
        loading,
        logout,
        getAccessScopes,
    } = useAuth();


    // =====================================================
    // AUTHORITATIVE ACCESS SCOPES
    //
    // Still comes from /api/access/me.
    // =====================================================

    const accessScopes = getAccessScopes();


    // =====================================================
    // AUTHORITATIVE MODULE PERMISSIONS
    //
    // IMPORTANT:
    // DO NOT use {} here.
    //
    // The backend now returns:
    //
    // user.module_permissions
    // =====================================================

    const modulePermissions =
        Array.isArray(user?.module_permissions)
            ? user.module_permissions
            : [];


    // =====================================================
    // USER DATA
    // =====================================================

    const userData = useMemo(() => {

        const currentUser = user || {};

        return {
            fullName:
                currentUser.full_name ||
                currentUser.employee_name ||
                currentUser.name ||
                "—",

            employeeId:
                currentUser.employee_id ||
                currentUser.employee_code ||
                currentUser.user_id ||
                currentUser.id ||
                "—",

            email:
                currentUser.official_email ||
                currentUser.email ||
                currentUser.email_address ||
                "—",

            designation:
                currentUser.designation ||
                currentUser.job_title ||
                "—",

            department:
                currentUser.department ||
                "—",

            accountStatus:
                currentUser.account_status ||
                currentUser.status ||
                (
                    currentUser.active === false
                        ? "Inactive"
                        : "Active"
                ),

            applicationRole:
                currentUser.role_name ||
                currentUser.role_code ||
                currentUser.role ||
                "—",

            roleCode:
                currentUser.role_code ||
                "—",

            lastLogin:
                formatLastLogin(
                    currentUser.last_login ||
                    currentUser.last_login_at
                ),

            timezone:
                currentUser.timezone ||
                "—",
        };

    }, [user]);


    // =====================================================
    // ACCESS SCOPE DATA
    // =====================================================

    const scopeData = useMemo(() => {
        return buildScopeData(accessScopes);
    }, [accessScopes]);


    // =====================================================
    // NORMALIZED MODULES
    //
    // This is completely dynamic.
    //
    // Example backend response:
    //
    // SALES_REVENUE
    //
    // will automatically become:
    //
    // Allowed Modules
    // SALES_REVENUE
    //
    // No frontend module list required.
    // =====================================================

    const allowedModules = useMemo(() => {

        const modules =
            normalizeModulePermissions(
                modulePermissions
            );

        return modules
            .filter((module) => module.canView === true)
            .map((module) => ({
                ...module,

                // Module icon is visual only.
                // Authorization comes from backend can_view.
                icon: DEFAULT_MODULE_ICON,
            }));

    }, [modulePermissions]);


    // =====================================================
    // UNIQUE USER ACTIONS
    //
    // Derived from backend actions[].
    // =====================================================

    const permissions = useMemo(() => {

        const actions =
            getUniqueActions(
                allowedModules
            );

        return actions.map((action) => ({
            name: action,

            icon:
                ACTION_ICONS[action] ||
                ShieldCheck,

            className:
                ACTION_CLASSES[action] ||
                "permission-default",
        }));

    }, [allowedModules]);


    // =====================================================
    // HANDLERS
    // =====================================================

    const handleChangePassword = () => {
        console.log(
            "Change Password clicked"
        );
    };


    const handleLogout = () => {

        if (typeof logout === "function") {
            logout();
            return;
        }

        localStorage.removeItem("token");

        window.dispatchEvent(
            new Event("auth:unauthorized")
        );
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="profile-loading">

                <LoaderCircle
                    size={24}
                    className="profile-loader"
                />

                <span>
                    Loading profile...
                </span>

            </div>
        );
    }


    // =====================================================
    // NOT AUTHENTICATED
    // =====================================================

    if (!user) {
        return (
            <div className="profile-error">

                <h2>
                    Unable to load profile
                </h2>

                <p>
                    Your authenticated profile could not be loaded.
                </p>

            </div>
        );
    }


    // =====================================================
    // JSX
    // =====================================================

    return (
        <>
            <style>{`

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          width: 100%;
        }

        .profile-loading,
        .profile-error {
          width: 100%;
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;

          gap: 10px;

          background: #f6f7fb;
          color: #606978;

          font-family:
            Inter,
            "Segoe UI",
            Arial,
            sans-serif;

          font-size: 13px;
        }

        .profile-error h2 {
          margin: 0;
          color: #b13d4f;
        }

        .profile-error p {
          margin: 0;
        }

        .profile-loader {
          animation: profile-spin 0.8s linear infinite;
        }

        @keyframes profile-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .profile-page {
          width: 100%;
          min-height: 100vh;
          height: 100vh;

          padding: 14px 18px 10px;

          background: #f6f7fb;
          color: #111827;

          font-family:
            Inter,
            "Segoe UI",
            Arial,
            sans-serif;

          overflow: hidden;
        }

        .profile-header {
          margin-bottom: 10px;
        }

        .profile-header h1 {
          margin: 0;

          color: #111827;

          font-size: 23px;
          line-height: 28px;

          font-weight: 700;

          letter-spacing: -0.45px;
        }

        .profile-header p {
          margin: 1px 0 0;

          color: #606978;

          font-size: 11px;
          line-height: 16px;

          font-weight: 400;
        }

        .profile-card {
          position: relative;

          width: 100%;

          background: #ffffff;

          border: 1px solid #e5e7eb;
          border-radius: 7px;

          box-shadow:
            0 1px 3px rgba(15, 23, 42, 0.035);

          margin-bottom: 8px;
        }

        .card-icon {
          width: 31px;
          height: 31px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 7px;
        }

        .user-card-icon {
          color: #5a469c;
          background: #f5f2ff;
        }

        .access-card-icon {
          color: #4163b1;
          background: #f1f5ff;
        }

        .account-card-icon {
          color: #5b4ba1;
          background: #f5f3ff;
        }

        .card-header {
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 8px;
        }

        .card-title-wrapper {
          display: flex;
          align-items: center;

          gap: 10px;
        }

        .card-title-wrapper h2 {
          margin: 0;

          color: #111827;

          font-size: 14px;
          line-height: 19px;

          font-weight: 700;
        }

        .user-information-card {
          padding: 11px 14px 12px;
        }

        .user-info-grid {
          width: 100%;

          display: grid;

          grid-template-columns: 1fr 1fr;

          column-gap: 18px;
        }

        .user-info-column {
          border: 1px solid #f0f1f4;

          border-radius: 6px;

          overflow: hidden;
        }

        .user-info-row {
          min-height: 32px;

          display: grid;

          grid-template-columns: 150px 1fr;

          align-items: center;

          padding: 0 10px;

          border-bottom: 1px solid #f0f1f4;
        }

        .user-info-row:last-child {
          border-bottom: none;
        }

        .user-info-label,
        .access-label,
        .account-label {
          color: #606a79;

          font-size: 10.5px;
          line-height: 15px;

          font-weight: 400;
        }

        .user-info-value,
        .access-value {
          color: #171c25;

          font-size: 10.5px;
          line-height: 15px;

          font-weight: 500;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .active-badge {
          width: max-content;

          padding: 2px 7px;

          color: #22865d;

          background: #def4e8;

          border-radius: 4px;

          font-size: 9.5px;
          line-height: 14px;

          font-weight: 600;
        }

        .finsight-card {
          padding: 12px 14px 13px;
        }

        .access-card-header,
        .account-header {
          display: flex;
          align-items: center;

          gap: 10px;
        }

        .access-card-header h2,
        .account-header h2 {
          margin: 0;

          color: #111827;

          font-size: 14px;

          font-weight: 700;
        }

        .access-card-header p,
        .account-header p {
          margin: 1px 0 0;

          color: #667085;

          font-size: 10px;
        }

        .access-layout {
          width: 100%;

          display: grid;

          grid-template-columns: 43% 57%;

          margin-top: 10px;
        }

        .access-details {
          padding-right: 20px;

          border-right: 1px solid #edf0f4;
        }

        .access-row {
          min-height: 28px;

          display: grid;

          grid-template-columns: 150px 1fr;

          align-items: center;

          border-bottom: 1px solid #edf0f4;
        }

        .access-row:last-child {
          border-bottom: none;
        }

        .access-permissions {
          padding-left: 20px;
          padding-top: 1px;
        }

        .permission-section {
          margin-bottom: 13px;
        }

        .permission-section-title {
          margin-bottom: 6px;

          color: #606a79;

          font-size: 10.5px;
        }

        .module-list {
          display: flex;
          align-items: center;

          gap: 6px;

          flex-wrap: wrap;
        }

        .module-pill {
          min-height: 31px;

          padding: 0 9px;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 5px;

          border-radius: 5px;

          white-space: nowrap;

          font-size: 10px;

          font-weight: 600;
        }

        .module-default {
          color: #475467;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .permissions-section {
          margin-bottom: 9px;
        }

        .permission-list {
          display: flex;
          align-items: center;

          gap: 6px;

          flex-wrap: wrap;
        }

        .permission-pill {
          min-width: 82px;

          height: 31px;

          padding: 0 9px;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 5px;

          border-radius: 5px;

          font-size: 10px;

          font-weight: 600;
        }

        .permission-view {
          color: #3f65a3;
          background: #f5f8fd;
          border: 1px solid #dce4f1;
        }

        .permission-export {
          color: #278064;
          background: #f3fbf7;
          border: 1px solid #d9ece4;
        }

        .permission-upload {
          color: #b47723;
          background: #fff9f0;
          border: 1px solid #f0e1c9;
        }

        .permission-admin {
          color: #634798;
          background: #f8f5fc;
          border: 1px solid #e3dced;
        }

        .permission-default {
          color: #475467;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .admin-note {
          display: flex;
          align-items: center;

          gap: 5px;

          color: #667085;

          font-size: 9.5px;
        }

        .account-card {
          padding: 12px 14px 13px;
        }

        .account-header {
          margin-bottom: 9px;
        }

        .account-details {
          width: 100%;
        }

        .account-row {
          min-height: 31px;

          display: flex;

          align-items: center;
        }

        .account-label {
          width: 150px;

          flex-shrink: 0;
        }

        .login-information {
          display: flex;
          flex-direction: column;
        }

        .login-date {
          color: #202631;

          font-size: 10.5px;

          font-weight: 500;
        }

        .login-timezone {
          color: #687385;

          font-size: 9.5px;
        }

        .password-value {
          color: #303642;

          font-size: 10.5px;

          letter-spacing: 1px;
        }

        .change-password-button {
          margin-left: 22px;

          padding: 0;

          color: #514496;

          background: transparent;

          border: none;

          font-family: inherit;

          font-size: 10px;

          font-weight: 600;

          cursor: pointer;
        }

        .logout-button {
          position: absolute;

          top: 42px;
          right: 16px;

          height: 31px;

          padding: 0 16px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 6px;

          color: #b13d4f;

          background: #ffffff;

          border: 1px solid #d88d99;

          border-radius: 5px;

          font-family: inherit;

          font-size: 10px;

          font-weight: 600;

          cursor: pointer;
        }

        .profile-footer {
          height: 24px;

          display: flex;

          align-items: flex-end;
          justify-content: space-between;

          color: #687385;

          font-size: 9px;
        }

        .footer-links {
          display: flex;

          align-items: center;

          gap: 10px;
        }

        .footer-links a {
          color: #606978;

          text-decoration: none;
        }

        @media (max-width: 900px) {

          .profile-page {
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }

          .user-info-grid {
            grid-template-columns: 1fr;
            row-gap: 7px;
          }

          .access-layout {
            grid-template-columns: 1fr;
          }

          .access-details {
            padding-right: 0;
            padding-bottom: 10px;

            border-right: none;
            border-bottom: 1px solid #edf0f4;
          }

          .access-permissions {
            padding-left: 0;
            padding-top: 12px;
          }

          .account-card {
            padding-bottom: 55px;
          }

          .logout-button {
            top: auto;
            bottom: 13px;
          }
        }

        @media (max-width: 650px) {

          .profile-page {
            padding: 12px;
          }

          .user-info-row,
          .access-row {
            grid-template-columns: 1fr;

            padding: 7px 9px;
          }

          .account-row {
            align-items: flex-start;

            flex-direction: column;

            gap: 3px;

            padding: 7px 0;
          }

          .account-label {
            width: auto;
          }

          .change-password-button {
            margin-left: 0;
          }

          .logout-button {
            position: static;

            width: 100%;

            margin-top: 9px;
          }

          .profile-footer {
            height: auto;

            padding-top: 14px;

            flex-direction: column;

            align-items: flex-start;

            gap: 6px;
          }
        }

      `}</style>


            <div className="profile-page">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="profile-header">

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        View your account information and FinSight access.
                    </p>

                </div>


                {/* =================================================
                    USER INFORMATION
                ================================================= */}

                <section className="profile-card user-information-card">

                    <div className="card-header">

                        <div className="card-title-wrapper">

                            <div className="card-icon user-card-icon">

                                <UserRound
                                    size={18}
                                    strokeWidth={1.8}
                                />

                            </div>

                            <h2>
                                User Information
                            </h2>

                        </div>

                    </div>


                    <div className="user-info-grid">

                        <div className="user-info-column">

                            <div className="user-info-row">

                                <span className="user-info-label">
                                    Full Name
                                </span>

                                <span className="user-info-value">
                                    {userData.fullName}
                                </span>

                            </div>


                            <div className="user-info-row">

                                <span className="user-info-label">
                                    Employee ID
                                </span>

                                <span className="user-info-value">
                                    {userData.employeeId}
                                </span>

                            </div>


                            <div className="user-info-row">

                                <span className="user-info-label">
                                    Email Address
                                </span>

                                <span className="user-info-value">
                                    {userData.email}
                                </span>

                            </div>

                        </div>


                        <div className="user-info-column">

                            <div className="user-info-row">

                                <span className="user-info-label">
                                    Designation
                                </span>

                                <span className="user-info-value">
                                    {userData.designation}
                                </span>

                            </div>


                            <div className="user-info-row">

                                <span className="user-info-label">
                                    Department
                                </span>

                                <span className="user-info-value">
                                    {userData.department}
                                </span>

                            </div>


                            <div className="user-info-row">

                                <span className="user-info-label">
                                    Account Status
                                </span>

                                <span className="active-badge">
                                    {userData.accountStatus}
                                </span>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    FINSIGHT ACCESS
                ================================================= */}

                <section className="profile-card finsight-card">

                    <div className="access-card-header">

                        <div className="card-icon access-card-icon">

                            <ShieldCheck
                                size={18}
                                strokeWidth={1.8}
                            />

                        </div>

                        <div>

                            <h2>
                                FinSight Access
                            </h2>

                            <p>
                                Your role, access scope and permissions in FinSight.
                            </p>

                        </div>

                    </div>


                    <div className="access-layout">

                        {/* =================================================
                            ORGANIZATIONAL / DATA ACCESS
                        ================================================= */}

                        <div className="access-details">

                            <div className="access-row">

                                <span className="access-label">
                                    Application Role
                                </span>

                                <span className="access-value">
                                    {userData.applicationRole}
                                </span>

                            </div>


                            <div className="access-row">

                                <span className="access-label">
                                    Access Scope
                                </span>

                                <span
                                    className="access-value"
                                    title={scopeData.accessScope}
                                >
                                    {scopeData.accessScope}
                                </span>

                            </div>


                            <div className="access-row">

                                <span className="access-label">
                                    Legal Group
                                </span>

                                <span
                                    className="access-value"
                                    title={scopeData.legalGroup}
                                >
                                    {scopeData.legalGroup}
                                </span>

                            </div>


                            <div className="access-row">

                                <span className="access-label">
                                    Legal Entity
                                </span>

                                <span
                                    className="access-value"
                                    title={scopeData.legalEntity}
                                >
                                    {scopeData.legalEntity}
                                </span>

                            </div>


                            <div className="access-row">

                                <span className="access-label">
                                    Parent Division
                                </span>

                                <span
                                    className="access-value"
                                    title={scopeData.parentDivision}
                                >
                                    {scopeData.parentDivision}
                                </span>

                            </div>


                            <div className="access-row">

                                <span className="access-label">
                                    Sub-Division
                                </span>

                                <span
                                    className="access-value"
                                    title={scopeData.subDivision}
                                >
                                    {scopeData.subDivision}
                                </span>

                            </div>


                            <div className="access-row">

                                <span className="access-label">
                                    Analysis
                                </span>

                                <span
                                    className="access-value"
                                    title={scopeData.analysis}
                                >
                                    {scopeData.analysis}
                                </span>

                            </div>

                        </div>


                        {/* =================================================
                            MODULE + ACTION PERMISSIONS
                        ================================================= */}

                        <div className="access-permissions">

                            {/* =================================================
                                ALLOWED MODULES
                            ================================================= */}

                            <div className="permission-section">

                                <div className="permission-section-title">
                                    Allowed Modules
                                </div>


                                <div className="module-list">

                                    {allowedModules.length > 0 ? (

                                        allowedModules.map((module) => {

                                            const Icon =
                                                module.icon;

                                            return (
                                                <div
                                                    key={module.moduleCode}
                                                    className="module-pill module-default"
                                                    title={
                                                        module.actions.length > 0
                                                            ? module.actions.join(", ")
                                                            : "No actions assigned"
                                                    }
                                                >

                                                    <Icon
                                                        size={14}
                                                        strokeWidth={1.8}
                                                    />

                                                    <span>
                                                        {module.moduleCode}
                                                    </span>

                                                </div>
                                            );

                                        })

                                    ) : (

                                        <span className="access-value">
                                            No modules assigned
                                        </span>

                                    )}

                                </div>

                            </div>


                            {/* =================================================
                                PERMISSIONS
                            ================================================= */}

                            <div className="permission-section permissions-section">

                                <div className="permission-section-title">
                                    Permissions
                                </div>


                                <div className="permission-list">

                                    {permissions.length > 0 ? (

                                        permissions.map((permission) => {

                                            const Icon =
                                                permission.icon;

                                            return (
                                                <div
                                                    key={permission.name}
                                                    className={`permission-pill ${permission.className}`}
                                                >

                                                    <Icon
                                                        size={15}
                                                        strokeWidth={1.9}
                                                    />

                                                    <span>
                                                        {permission.name}
                                                    </span>

                                                </div>
                                            );

                                        })

                                    ) : (

                                        <span className="access-value">
                                            No permissions assigned
                                        </span>

                                    )}

                                </div>

                            </div>


                            <div className="admin-note">

                                <Info
                                    size={13}
                                    strokeWidth={1.8}
                                />

                                <span>
                                    Access and permissions are managed by the Admin.
                                </span>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ACCOUNT
                ================================================= */}

                <section className="profile-card account-card">

                    <div className="account-header">

                        <div className="card-icon account-card-icon">

                            <LockKeyhole
                                size={18}
                                strokeWidth={1.8}
                            />

                        </div>

                        <div>

                            <h2>
                                Account
                            </h2>

                            <p>
                                Manage your account security.
                            </p>

                        </div>

                    </div>


                    <div className="account-details">

                        <div className="account-row">

                            <span className="account-label">
                                Last Login
                            </span>

                            <div className="login-information">

                                <span className="login-date">
                                    {userData.lastLogin}
                                </span>

                                <span className="login-timezone">
                                    {userData.timezone}
                                </span>

                            </div>

                        </div>


                        <div className="account-row">

                            <span className="account-label">
                                Password
                            </span>

                            <span className="password-value">
                                ***********
                            </span>

                            <button
                                type="button"
                                className="change-password-button"
                                onClick={handleChangePassword}
                            >
                                Change Password
                            </button>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                    >

                        <LogOut
                            size={14}
                            strokeWidth={1.9}
                        />

                        <span>
                            Logout
                        </span>

                    </button>

                </section>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="profile-footer">

                    <div>
                        © 2026 ZeNith Data Intelligence LLC. All rights reserved.
                    </div>

                    <div className="footer-links">

                        <a href="#privacy">
                            Privacy Policy
                        </a>

                        <span>
                            •
                        </span>

                        <a href="#terms">
                            Terms of Use
                        </a>

                    </div>

                </footer>

            </div>
        </>
    );
}

