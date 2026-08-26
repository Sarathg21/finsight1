
import { Search, ChevronDown, Plus, RotateCcw, SlidersHorizontal, } from "lucide-react";

/* ----------------------------------------
   Reusable Select
---------------------------------------- */

function Select({
  label,
  options = [],
  value = "",
  onChange,
  compact = false,
}) {

  return (
    <div className={compact ? "w-32" : "min-w-36"}>

      <label className="mb-0.5 block text-[10px] font-medium text-gray-500">{label}</label>

      <div className="relative">
        <select
          value={value ?? ""}
          onChange={onChange || (() => { })}
          className=" h-8 w-full rounded-md border border-gray-200 bg-white pl-3 pr-8
            text-[12px] text-gray-700  appearance-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30">

          {options.map((option, index) => {
            // For API objects (Role dropdown)
            if (typeof option === "object" && option !== null) {
              return (
                <option
                  key={option.id}
                  value={option.code}
                >
                  {option.name}
                </option>
              );
            }

            // For normal string dropdowns
            return (
              <option
                key={`${option}-${index}`}
                value={option}
              >
                {option}
              </option>
            );
          })}

        </select>


        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

/* ----------------------------------------
   Filter Bar
---------------------------------------- */

export default function FilterBar({
  search,
  setSearch,
  placeholder = "Search...",
  filters = [],
  showAddButton = false,
  addButtonLabel = "Add",
  onAdd,
  children,
  compact = false,
  width = "full",
  stackActions = false,

  // Users
  activeOnly = false,
  setActiveOnly,
  toggleLabel = "Active Only",
  onReset,
  // NEW USERS ONLY
  showMoreFilters = false,
  onMoreFilters,
  //user access
  customOrder = false,

}) {

  const widthClass =
    width === "40"
      ? "w-[40%]"
      : width === "half"
        ? "w-1/2"
        : "w-full";

  return (
    <div
      className={`${widthClass} rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm`}>
      <div
        className="flex items-end justify-between gap-2">

        {/* LEFT */}
        <div className={`flex gap-2 ${stackActions ? "items-start" : "items-end"}`}>

          {/* ================= DEFAULT ORDER ================= */}
          {!customOrder && (
            <>
              {/* SEARCH */}
              <div className={compact ? "w-60" : "w-72"}>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />

                  <input
                    value={search ?? ""}
                    onChange={(e) => setSearch?.(e.target.value)}
                    placeholder={placeholder}
                    className="h-8 w-full rounded-md border border-gray-200 bg-white pl-8 pr-3 text-[12px] placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* FILTERS */}
              {filters.map((filter) => (
                <Select
                  key={filter.label}
                  label={filter.label}
                  options={filter.options}
                  value={filter.value}
                  onChange={filter.onChange}
                  compact={compact}
                />
              ))}
            </>
          )}

          {/* ================= USER ACCESS ORDER ================= */}
          {customOrder && (
            <>
              {/* Legal Group */}
              {(() => {
                const legalGroupFilter = filters.find(
                  (filter) => filter.label === "Legal Group"
                );

                return legalGroupFilter ? (
                  <Select
                    label={legalGroupFilter.label}
                    options={legalGroupFilter.options}
                    value={legalGroupFilter.value}
                    onChange={legalGroupFilter.onChange}
                    compact={compact}
                  />
                ) : null;
              })()}

              {/* Role */}
              {(() => {
                const roleFilter = filters.find(
                  (filter) => filter.label === "Role"
                );

                return roleFilter ? (
                  <Select
                    label={roleFilter.label}
                    options={roleFilter.options}
                    value={roleFilter.value}
                    onChange={roleFilter.onChange}
                    compact={compact}
                  />
                ) : null;
              })()}

              {/* Search */}
              <div className={compact ? "w-60" : "w-72"}>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />

                  <input
                    value={search ?? ""}
                    onChange={(e) => setSearch?.(e.target.value)}
                    placeholder={placeholder}
                    className="h-8 w-full rounded-md border border-gray-200 bg-white pl-8 pr-3 text-[12px] placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* Status */}
              {(() => {
                const statusFilter = filters.find(
                  (filter) => filter.label === "Status"
                );

                return statusFilter ? (
                  <Select
                    label={statusFilter.label}
                    options={statusFilter.options}
                    value={statusFilter.value}
                    onChange={statusFilter.onChange}
                    compact={compact}
                  />
                ) : null;
              })()}
            </>
          )}

          {/* ACTIVE ONLY */}
          {setActiveOnly && (
            <div
              className={
                stackActions
                  ? "flex flex-col items-start gap-1"
                  : "flex items-center gap-2"
              }
            >
              <div className="flex h-8 items-center gap-2 rounded-md bg-white px-3">
                <span className="text-[10px] font-medium text-gray-700">
                  {toggleLabel}
                </span>

                <button
                  type="button"
                  onClick={() => setActiveOnly(!activeOnly)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full ${activeOnly ? "bg-blue-600" : "bg-gray-300"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${activeOnly ? "translate-x-4" : "translate-x-0.5"
                      }`}
                  />
                </button>
              </div>

              {stackActions && onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="w-25 flex h-8 items-center justify-center gap-1 rounded-md border border-gray-300 bg-white text-[10px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              )}
            </div>
          )}

          {/* RESET */}
          {onReset && !stackActions && (
            <button
              type="button"
              onClick={onReset}
              className="flex h-8 items-center gap-1 rounded-md border border-gray-300 bg-white px-3 text-[12px] font-medium text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}

          {/* MORE FILTERS */}
          {showMoreFilters && (
            <button
              type="button"
              onClick={onMoreFilters}
              className="flex h-8 items-center gap-1 rounded-md border border-gray-300 bg-white px-3 text-[10px] font-medium text-gray-700 hover:bg-gray-50"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              More Filters
            </button>
          )}
        </div>

        {/* RIGHT */}
        <div
          className="flex items-center gap-2">
          {children}
          {
            showAddButton &&
            <button
              type="button"
              onClick={onAdd}
              className="flex h-8 items-center gap-1 rounded-md bg-blue-600 px-3 text-[12px] font-mediumtext-white
                hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5" />
              Add {addButtonLabel}
            </button>
          }
        </div>
      </div>
    </div>
  );
}