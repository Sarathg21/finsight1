import {
  Users,
  Building2,
  GitBranch,
  Network,
  Boxes,
  Code2,
  CircleDollarSign,
} from "lucide-react";
import { useState } from "react";


export default function MasterDataTabs({
  tabs,
  activeTab,
  onTabChange,
}) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between w-full">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id || index}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 ${
                    activeTab === tab.id
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                />
              )}

              <span>{tab.title}</span>

              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}