import { Menu, Bell, ChevronDown } from "lucide-react";

export default function NavbarAdmin({
  breadcrumbs = [],
  company = "FJ Group",
  initials = "SA",
  userName = "Super Admin",
  userRole = "Super Administrator",
  notificationCount = 0,
}) {

  const list = breadcrumbs || [];
  const trail = list.slice(0, -1);
  const activePage = list[list.length - 1] || "";

  return (
    <header className="h-10 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 sticky top-0 z-20">

      <nav className="hidden md:flex items-center text-sm text-gray-500">
        {trail.map((crumb, index) => (
          <span key={index} className="flex items-center">
            <span className="text-blue-600 font-medium">
              {crumb}
            </span>
            <span className="mx-2 text-gray-300">
              /
            </span>
          </span>
        ))}
        <span className="text-gray-700 font-medium">
          {activePage}
        </span>
      </nav>
      <div className="ml-auto flex items-center gap-3">
        <button className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-md border border-gray-200">
          {company}
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        <button className="relative p-2 rounded-md hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-600" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>
        <button className="flex items-center gap-2">

          <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>

          <div className="hidden sm:block">
            <div className="text-sm font-medium">
              {userName}
            </div>

            <div className="text-[11px] text-gray-500">
              {userRole}
            </div>
          </div>

          <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block"/>

        </button>
      </div>
    </header>
  );
}