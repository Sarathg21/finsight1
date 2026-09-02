import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Info,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Shield,
  Layers,
  Settings,
  Search,
  LogOut,UserCog 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* =========================================================
   ADMIN SIDEBAR MENU
   ========================================================= */

const adminSections = [
  {
    title: "Dashboard",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/admin",
      },
    ],
  },

  {
    title: "Security",
    items: [
      {
        label: "Users",
        icon: Users,
        path: "/admin/users",
      },
      {
        label: "Roles & Permissions",
        icon: Shield,
        path: "/admin/roles",
      },
      {
        label: "User Access",
        icon: UserCog,
       path: "/admin/useraccess",
      },
    ],
  },

  {
    title: "Master Data",
    items: [
      {
        label: "Master Data",
        icon: Layers,
        path: "/admin/master-data",
      },
    ],
  },
];

/* =========================================================
   SIDEBAR
   ========================================================= */

export default function SidebarAdmin() {
  const [collapsed, setCollapsed] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  /* Keep accordion functionality */
  const [openSections, setOpenSections] = useState(() => {
    const state = {};

    adminSections.forEach((section) => {
      state[section.title] = true;
    });

    return state;
  });

  /* =========================================================
     SIDEBAR COLLAPSE
     ========================================================= */

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  /* =========================================================
     SECTION TOGGLE
     ========================================================= */

  const toggleSection = (title) => {
    if (collapsed) return;

    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  /* =========================================================
     SEARCH
     ========================================================= */

  const filteredSections = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return adminSections;
    }

    return adminSections
      .map((section) => {
        const filteredItems = section.items.filter((item) =>
          item.label.toLowerCase().includes(search)
        );

        return {
          ...section,
          items: filteredItems,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [searchTerm]);

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <aside
      className={`
        hidden lg:flex
        flex-col
        h-screen
        sticky
        top-0
        shrink-0
        overflow-hidden
        transition-all
        duration-300

        bg-[#071A45]
        text-slate-200

        border-r
        border-[#1B3260]

        ${collapsed ? "w-16" : "w-55"}
      `}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          relative
          flex
          items-center
          justify-between
          h-14.5
          px-3
          shrink-0
          border-b
          border-white/10
        "
      >

        {/* Logo */}

        <div className="flex items-center gap-2.5 overflow-hidden">

          <div
            className="
              h-9
              w-9
              shrink-0
              rounded-[10px]
              bg-linear-to-br
              from-[#7C5CFF]
              to-[#5145D8]
              flex
              items-center
              justify-center
              shadow-lg
              shadow-indigo-900/30
            "
          >
            <span className="text-[12px] font-extrabold text-white">
              FJ
            </span>
          </div>

          {!collapsed && (
            <div className="min-w-0 leading-none">

              <div
                className="
                  text-[15px]
                  font-extrabold
                  text-white
                  whitespace-nowrap
                "
              >
                FJ Group
              </div>

              <div
                className="
                  mt-1
                  text-[8px]
                  font-bold
                  tracking-[0.08em]
                  text-white
                  whitespace-nowrap
                "
              >
                FINANCE SUITE
              </div>

            </div>
          )}

        </div>


        {/* Collapse Button */}

        <button
          onClick={toggleSidebar}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="
            absolute
            -right-2.5
            top-4.25
            h-6
            w-6
            rounded-full
            bg-white
            flex
            items-center
            justify-center
            text-[#071A45]
            shadow-md
            hover:bg-slate-100
            transition-all
            duration-200
            z-50
          "
        >
          {collapsed ? (
            <PanelLeftOpen className="h-3 w-3" />
          ) : (
            <PanelLeftClose className="h-3 w-3" />
          )}
        </button>

      </div>


      {/* =====================================================
          ADMIN TYPE
      ===================================================== */}

      {!collapsed && (
        <div className="px-3 pt-3">

          <div
            className="
              inline-flex
              items-center
              gap-1.5

              rounded-full

              bg-[#EEF0FF]
              text-[#635BDB]

              px-2.5
              py-1

              text-[9px]
              font-bold
              tracking-wide
            "
          >

            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-[#635BDB]
              "
            />

            ADMIN

          </div>

        </div>
      )}


      {/* =====================================================
          SEARCH
      ===================================================== */}

      {!collapsed && (
        <div className="px-3 pt-3 pb-2">

          <div className="relative">

            <Search
              className="
                absolute
                left-2.5
                top-1/2
                -translate-y-1/2
                h-3.5
                w-3.5
                text-slate-400
              "
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search menu..."
              className="
                w-full
                h-7.75

                rounded-[7px]

                bg-white

                pl-8
                pr-2

                text-[11px]
                text-slate-700

                placeholder:text-slate-400

                outline-none

                border
                border-transparent

                focus:border-indigo-400
                focus:ring-1
                focus:ring-indigo-300

                transition-all
              "
            />

          </div>

        </div>
      )}


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav
        className="
          flex-1
          overflow-y-auto
          overflow-x-hidden

          px-2
          pt-1
          pb-3

          sidebar-scroll
        "
      >

        {filteredSections.length === 0 && !collapsed && (
          <div
            className="
              px-3
              py-6
              text-center
              text-[10px]
              text-slate-500
            "
          >
            No menu found
          </div>
        )}


        {filteredSections.map((section) => {
          const menuItems = section.items || [];
          return (
            <div
              key={section.title}
              className="mb-2"
            >
              {/* =================================================
                  SECTION HEADER
              ================================================= */}

              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className="
                    group
                    w-full
                    flex
                    items-center
                    gap-2
                    px-2
                    pt-2
                    pb-1
                    text-left
                  "
                >

                  <span
                    className="
                      shrink-0
                     text-[13px]
                      font-extrabold
                      uppercase
                      tracking-[0.08em]

                      text-white
                    "
                  >
                    {section.title}
                  </span>

                  {/* Horizontal line */}

                  <span
                    className="
                      h-px
                      flex-1
                      bg-white/20
                    "
                  />

                  {/* Accordion icon */}

                  {openSections[section.title] ? (
                    <ChevronDown
                      className="
                        h-3
                        w-3
                        shrink-0
                        text-slate-500
                      "
                    />
                  ) : (
                    <ChevronRight
                      className="
                        h-3
                        w-3
                        shrink-0
                        text-slate-500
                      "
                    />
                  )}

                </button>
              )}


              {/* =================================================
                  MENU ITEMS
              ================================================= */}

              <AnimatePresence initial={false}>

                {(collapsed || openSections[section.title]) && (
                  <motion.ul
                    initial={
                      collapsed
                        ? false
                        : {
                          height: 0,
                          opacity: 0,
                        }
                    }
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.18,
                    }}
                    className="
                      overflow-hidden
                      space-y-0.5
                    "
                  >

                    {menuItems.map((item) => {

                      const Icon = item.icon;

                      return (
                        <li key={item.label}>

                          <NavLink
                            to={item.path}
                            title={
                              collapsed
                                ? item.label
                                : undefined
                            }
                            className={({ isActive }) =>
                              `
                                group

                                flex
                                items-center

                                ${collapsed
                                ? "justify-center"
                                : "gap-3"
                              }

                                min-h-8.75

                                ${collapsed
                                ? "px-2"
                                : "px-3"
                              }

                                rounded-lg

                                text-[14px]
                                font-semibold

                                transition-all
                                duration-200

                                ${isActive
                                ? `
                                      bg-[#5A55D9]
                                      text-white
                                      shadow-md
                                      shadow-indigo-900/20
                                    `
                                : `
                                      text-slate-200
                                      hover:bg-white/10
                                      hover:text-white
                                    `
                              }
                              `
                            }
                          >

                            {/* Icon */}

                            <Icon
                              className="
                               h-5
                               w-5
                                shrink-0
                                text-slate-400
                                group-hover:text-white
                                transition-colors
                              "
                              strokeWidth={1.7}
                            />

                            {/* Label */}

                            {!collapsed && (
                              <span
                                className="
                                  truncate
                                  leading-none
                                "
                              >
                                {item.label}
                              </span>
                            )}

                          </NavLink>

                        </li>
                      );
                    })}

                  </motion.ul>
                )}

              </AnimatePresence>

            </div>
          );
        })}

      </nav>


      {/* =====================================================
          FOOTER USER
      ===================================================== */}

      <div
        className="
          shrink-0
          border-t
          border-white/10
          px-2.5
          py-2.5
        "
      >

        <div
          className={`
            flex
            items-center

            ${collapsed
              ? "justify-center"
              : "gap-2"
            }
          `}
        >

          {/* Avatar */}

          <div
            className="
              h-8
              w-8
              shrink-0

              rounded-full

              bg-linear-to-br
              from-[#6D5CE7]
              to-[#4B42C5]

              flex
              items-center
              justify-center

              text-[10px]
              font-bold
              text-white
            "
          >
            ZA
          </div>


          {/* User Details */}

          {!collapsed && (
            <div className="min-w-0 flex-1">

              <div
                className="
                  truncate
                  text-[10px]
                  font-bold
                  text-white
                "
              >
                Zenith Admin
              </div>

              <div
                className="
                  truncate
                  mt-0.5
                  text-[8px]
                  text-slate-400
                "
              >
                zenith@fjtco.com
              </div>

            </div>
          )}


          {/* Logout */}

          {/* {!collapsed && (
            <button
              type="button"
              title="Logout"
              className="
                shrink-0
                p-1

                text-slate-400

                hover:text-white

                transition-colors
              "
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )} */}

        </div>

      </div>


      {/* =====================================================
          SCROLLBAR STYLE
      ===================================================== */}

      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.18);
          border-radius: 10px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.28);
        }
      `}</style>

    </aside>
  );
}