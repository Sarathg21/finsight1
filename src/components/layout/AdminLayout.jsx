
import { Outlet, useLocation } from "react-router-dom";
import SidebarAdmin from "./SidebarAdmin";
import NavbarAdmin from "./NavbarAdmin";

export default function AdminLayout({
  activeMenu = "",
  breadcrumbs = [],
  company = "FJ Group",
  initials = "SA",
  userName = "Super Admin",
  userRole = "Super Administrator",
  notificationCount = 0,
}) {
  const location = useLocation();

  const breadcrumbMap = {
    "/admin/dashboard": ["Admin", "Dashboard"],
    "/admin/users": ["Admin", "Security", "Users"],
    "/admin/roles": ["Admin", "Security", "Roles"],
    "/admin/userAccess": ["Admin", "Security", "User Access"],
    "/admin/master-data": ["Admin", "Master Data"],
  };

  const currentBreadcrumbs =
    breadcrumbMap[location.pathname] || ["Admin"];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">

      {/* Sidebar */}
      <SidebarAdmin
        activeMenu={activeMenu}
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
