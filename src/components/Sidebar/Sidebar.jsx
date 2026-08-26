
import React, { useState } from 'react';
import {
  FiGrid,
  FiLayers,
  FiUsers,
  FiShield,
  FiSettings,
  FiMenu,
} from 'react-icons/fi';

const menuItems = [
  { name: 'Dashboard', icon: FiGrid },

  { header: 'SECURITY' },
  { name: 'Users', icon: FiUsers },
  { name: 'Roles', icon: FiShield },
  { name: 'User Access', icon: FiShield },

  { header: 'MASTER DATA' },
  { name: 'Master Data', icon: FiLayers },

  { header: 'SYSTEM' },
  { name: 'System Status', icon: FiSettings },
];

export default function Sidebar({ isMobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSub, setActiveSub] = useState('');

  return (
    <aside
      className={`bg-[#081B46] text-slate-300 min-h-screen z-30 transition-all duration-300 flex flex-col border-r border-slate-800/40
        ${collapsed ? 'w-16' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:sticky top-0`}
    >

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center font-bold text-[12px] text-white">
          Fi
        </div>

        {!collapsed && (
          <div>
            <h1 className="text-2xl font-bold text-white leading-none">
              FinSight
            </h1>

            <p className="text-[10px] text-slate-400 leading-none mt-0.5">
              Financial Intelligence
            </p>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-0.5">

        {menuItems.map((item, idx) => {

          /* Section Header */
          if (item.header) {
            return (
              !collapsed && (
                <div
                  key={idx}
                  className="text-[10px] font-bold text-slate-500 tracking-wider px-2 pt-3 pb-1"
                >
                  {item.header}
                </div>
              )
            );
          }

          const Icon = item.icon;

          return (
            <div key={idx}>
              <button
                onClick={() => setActiveSub(item.name)}
                className={`w-full flex items-center px-2 py-1.5 rounded-md transition-all group
                  ${
                    activeSub === item.name
                      ? 'bg-indigo-600/10 text-indigo-400'
                      : 'hover:bg-slate-800/50 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-2">

                  <Icon
                    className={`text-[15px] shrink-0
                      ${
                        activeSub === item.name
                          ? 'text-indigo-400'
                          : 'text-slate-400 group-hover:text-white'
                      }`}
                  />

                  {!collapsed && (
                    <span className="truncate text-[10px] font-medium leading-none">
                      {item.name}
                    </span>
                  )}

                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-2 py-1.5 border-t border-slate-800/60">

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-1 py-1 text-[9px] font-medium bg-slate-800/40 hover:bg-slate-800 rounded-md transition-all text-slate-400 hover:text-white"
        >
          <FiMenu className="text-[12px]" />

          {!collapsed && <span>Collapse</span>}
        </button>

      </div>
    </aside>
  );
}