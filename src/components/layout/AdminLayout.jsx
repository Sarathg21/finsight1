import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import NavbarAdmin from "./NavbarAdmin";

export default function AdminLayout({
  activeMenu = "",
  company = "FJ Group",
  initials = "SA",
  userName = "Super Admin",
  userRole = "Super Administrator",
  notificationCount = 0,
}) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggle = () => setSidebarOpen(o => !o);
  const collapsed = !sidebarOpen;

  const breadcrumbMap = {
    "/admin/dashboard": ["Admin", "Dashboard"],
    "/admin/users": ["Admin", "Security", "Users"],
    "/admin/roles": ["Admin", "Security", "Roles"],
    "/admin/useraccess": ["Admin", "Security", "User Access"],
    "/admin/master-data": ["Admin", "Master Data"],
  };

  const currentBreadcrumbs = breadcrumbMap[location.pathname] || ["Admin"];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 relative">

      {/* Mobile backdrop */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={toggle}
        mobileOpen={sidebarOpen}
      />

      {/* Right Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Navbar */}
        <NavbarAdmin
          breadcrumbs={currentBreadcrumbs}
          company={company}
          initials={initials}
          userName={userName}
          userRole={userRole}
          notificationCount={notificationCount}
        />

        {/* Page */}
        <main className="flex-1 overflow-hidden p-5">
          <div className="flex h-full flex-col">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
