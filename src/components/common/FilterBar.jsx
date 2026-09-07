
import {
  Search,
  ChevronDown,
  Plus,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

/* ----------------------------------------
   Reusable Select
---------------------------------------- */

function Select({
  label,
  options = [],
  value = "",
  onChange,
}) {
  const selectWidth =
    label === "Role"
      ? "220px"
      : "145px";

  return (
    <div
      style={{
        width: selectWidth,
        minWidth: 0,
        flex: "0 0 auto",
        boxSizing: "border-box",
      }}
    >
      <label
        style={{
          display: "block",
          marginBottom: "4px",
          fontSize: "10px",
          fontWeight: 500,
          lineHeight: "12px",
          color: "#6b7280",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </label>

      <div
        style={{
          position: "relative",
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        <select
          value={value ?? ""}
          onChange={onChange || (() => {})}
          style={{
            display: "block",
            width: "100%",
            height: "32px",
            minWidth: 0,
            boxSizing: "border-box",
            appearance: "none",
            borderRadius: "6px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            paddingLeft: "12px",
            paddingRight: "32px",
            fontSize: "12px",
            color: "#374151",
            outline: "none",
            cursor: "pointer",
          }}
        >
          {options.map((option, index) => {
            if (
              typeof option === "object" &&
              option !== null
            ) {
              return (
                <option
                  key={option.id}
                  value={option.code}
                >
                  {option.name}
                </option>
              );
            }

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
          style={{
            pointerEvents: "none",
            position: "absolute",
            right: "9px",
            top: "50%",
            width: "14px",
            height: "14px",
            transform: "translateY(-50%)",
            color: "#9ca3af",
          }}
        />
      </div>
    </div>
  );
}

/* ----------------------------------------
   Search Input
---------------------------------------- */

function SearchInput({
  search,
  setSearch,
  placeholder,
  customWidth,
}) {
  const searchWidth = customWidth || "288px";

  return (
    <div
      style={{
        width: searchWidth,
        minWidth: searchWidth,
        maxWidth: searchWidth,
        flex: `0 0 ${searchWidth}`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        <Search
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: "12px",
            top: "50%",
            width: "16px",
            height: "16px",
            transform: "translateY(-50%)",
            color: "#9ca3af",
          }}
        />

        <input
          type="text"
          value={search ?? ""}
          onChange={(e) =>
            setSearch?.(e.target.value)
          }
          placeholder={placeholder}
          style={{
            display: "block",
            width: "100%",
            height: "32px",
            minWidth: 0,
            boxSizing: "border-box",
            borderRadius: "6px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            paddingLeft: "40px",
            paddingRight: "12px",
            fontSize: "12px",
            color: "#374151",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}

/* ----------------------------------------
   Active Only Toggle
---------------------------------------- */

function ActiveOnlyToggle({
  activeOnly,
  setActiveOnly,
  toggleLabel,
  vertical = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        flex: "0 0 auto",
        alignItems: "flex-start",
        height: vertical ? "48px" : "32px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          height: vertical ? "48px" : "32px",
          flexDirection: vertical ? "column" : "row",
          alignItems: vertical ? "flex-start" : "center",
          justifyContent: vertical ? "flex-start" : "center",
          gap: vertical ? "5px" : "8px",
          padding: "0 4px",
          whiteSpace: "nowrap",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 500,
            color: "#374151",
            whiteSpace: "nowrap",
            lineHeight: "12px",
          }}
        >
          {toggleLabel}
        </span>

        <button
          type="button"
          onClick={() =>
            setActiveOnly(!activeOnly)
          }
          style={{
            position: "relative",
            display: "inline-flex",
            width: "40px",
            height: "20px",
            flexShrink: 0,
            alignItems: "center",
            border: "none",
            borderRadius: "9999px",
            backgroundColor: activeOnly
              ? "#2563eb"
              : "#d1d5db",
            padding: 0,
            cursor: "pointer",
            transition:
              "background-color 0.2s ease",
          }}
        >
          <span
            style={{
              display: "block",
              width: "16px",
              height: "16px",
              borderRadius: "9999px",
              backgroundColor: "#ffffff",
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.15)",
              transform: activeOnly
                ? "translateX(20px)"
                : "translateX(2px)",
              transition:
                "transform 0.2s ease",
            }}
          />
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------
   Reset Button
---------------------------------------- */

function ResetButton({ onReset }) {
  return (
    <button
      type="button"
      onClick={onReset}
      style={{
        display: "flex",
        height: "32px",
        minWidth: "88px",
        flex: "0 0 auto",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        boxSizing: "border-box",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        backgroundColor: "#ffffff",
        padding: "0 14px",
        fontSize: "11px",
        fontWeight: 500,
        color: "#374151",
        whiteSpace: "nowrap",
        cursor: "pointer",
      }}
    >
      <RotateCcw
        style={{
          width: "14px",
          height: "14px",
          flexShrink: 0,
        }}
      />

      Reset
    </button>
  );
}

/* ----------------------------------------
   More Filters Button
---------------------------------------- */

function MoreFiltersButton({
  onMoreFilters,
}) {
  return (
    <button
      type="button"
      onClick={onMoreFilters}
      style={{
        display: "flex",
        height: "32px",
        minWidth: "120px",
        flex: "0 0 auto",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        boxSizing: "border-box",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        backgroundColor: "#ffffff",
        padding: "0 12px",
        fontSize: "11px",
        fontWeight: 500,
        color: "#374151",
        whiteSpace: "nowrap",
        cursor: "pointer",
      }}
    >
      <SlidersHorizontal
        style={{
          width: "14px",
          height: "14px",
          flexShrink: 0,
        }}
      />

      More Filters
    </button>
  );
}

/* ----------------------------------------
   Add Button
---------------------------------------- */

function AddButton({
  onAdd,
  addButtonLabel,
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      style={{
        display: "flex",
        height: "32px",
        minWidth: "auto",
        flex: "0 0 auto",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        boxSizing: "border-box",
        border: "none",
        borderRadius: "6px",
        backgroundColor: "#2563eb",
        padding: "0 12px",
        fontSize: "12px",
        fontWeight: 500,
        color: "#ffffff",
        whiteSpace: "nowrap",
        cursor: "pointer",
      }}
    >
      <Plus
        style={{
          width: "14px",
          height: "14px",
          flexShrink: 0,
        }}
      />

      Add {addButtonLabel}
    </button>
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

  // More filters
  showMoreFilters = false,
  onMoreFilters,

  // User access
  customOrder = false,
}) {
  const widthValue =
    width === "40"
      ? "40%"
      : width === "half"
        ? "50%"
        : "100%";

  return (
    <div
      style={{
        width: widthValue,
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        padding: "12px",
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      {/* =====================================================
          MAIN FILTER ROW
      ===================================================== */}

      <div
        style={{
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          display: "flex",
          alignItems: stackActions
            ? "flex-start"
            : "flex-end",
          gap: "10px",
        }}
      >
        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div
          style={{
            minWidth: 0,
            flex: "1 1 auto",
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            alignItems: stackActions
              ? "flex-start"
              : "flex-end",
            gap: "10px",
            overflow: "visible",
          }}
        >
          {/* =================================================
              DEFAULT ORDER

              USERS:
              Search → Filters → Active Only → Reset
          ================================================= */}

          {!customOrder && (
            <>
              {/* SEARCH */}

              <SearchInput
                search={search}
                setSearch={setSearch}
                placeholder={placeholder}
              />

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

              {/* ACTIVE ONLY */}

              {setActiveOnly && (
                <ActiveOnlyToggle
                  activeOnly={activeOnly}
                  setActiveOnly={setActiveOnly}
                  toggleLabel=""
                />
              )}

              {/* RESET */}

              {onReset && (
                <ResetButton
                  onReset={onReset}
                />
              )}

              {/* MORE FILTERS */}

              {showMoreFilters && (
                <MoreFiltersButton
                  onMoreFilters={onMoreFilters}
                />
              )}
            </>
          )}

          {/* =================================================
              CUSTOM ORDER

              ROLES / USER ACCESS:

              Legal Group | Role | Search | Status | Toggle
          ================================================= */}

          {customOrder && (
            <>
              {/* =============================================
                  LEFT GROUP
                  Legal Group + Role
              ============================================== */}

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "10px",
                  flex: "0 0 auto",
                  minWidth: 0,
                }}
              >
                {/* LEGAL GROUP */}

                {(() => {
                  const legalGroupFilter =
                    filters.find(
                      (filter) =>
                        filter.label ===
                        "Legal Group"
                    );

                  return legalGroupFilter ? (
                    <Select
                      label={
                        legalGroupFilter.label
                      }
                      options={
                        legalGroupFilter.options
                      }
                      value={
                        legalGroupFilter.value
                      }
                      onChange={
                        legalGroupFilter.onChange
                      }
                      compact={compact}
                    />
                  ) : null;
                })()}

                {/* ROLE */}

                {(() => {
                  const roleFilter =
                    filters.find(
                      (filter) =>
                        filter.label ===
                        "Role"
                    );

                  return roleFilter ? (
                    <Select
                      label={roleFilter.label}
                      options={
                        roleFilter.options
                      }
                      value={
                        roleFilter.value
                      }
                      onChange={
                        roleFilter.onChange
                      }
                      compact={compact}
                    />
                  ) : null;
                })()}
              </div>

              {/* =============================================
                  RIGHT FILTER GROUP

                  Search + Status + Active Only
              ============================================== */}

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",

                  /*
                   * ONLY FOR USER ACCESS:
                   * reduced gap between Role and Search
                   */
                  gap: "4px",

                  flex: "0 0 auto",
                  minWidth: 0,
                  marginLeft: "auto",
                }}
              >
                {/* SEARCH */}

                <SearchInput
                  search={search}
                  setSearch={setSearch}
                  placeholder={placeholder}

                  /*
                   * ONLY customOrder/User Access gets
                   * the wider search box.
                   *
                   * Other pages remain 288px.
                   */
                  customWidth="450px"
                />

                {/* STATUS */}

                {(() => {
                  const statusFilter =
                    filters.find(
                      (filter) =>
                        filter.label ===
                        "Status"
                    );

                  return statusFilter ? (
                    <Select
                      label={
                        statusFilter.label
                      }
                      options={
                        statusFilter.options
                      }
                      value={
                        statusFilter.value
                      }
                      onChange={
                        statusFilter.onChange
                      }
                      compact={compact}
                    />
                  ) : null;
                })()}

                {/* ACTIVE ONLY */}

                {setActiveOnly && (
                  <ActiveOnlyToggle
                    activeOnly={activeOnly}
                    setActiveOnly={setActiveOnly}
                    toggleLabel={toggleLabel}
                    vertical
                  />
                )}
              </div>

              {/* =============================================
                  RESET
              ============================================== */}

              {onReset && (
                <ResetButton
                  onReset={onReset}
                />
              )}

              {/* =============================================
                  MORE FILTERS
              ============================================== */}

              {showMoreFilters && (
                <MoreFiltersButton
                  onMoreFilters={onMoreFilters}
                />
              )}
            </>
          )}
        </div>

        {/* ===================================================
            RIGHT SIDE - ADD BUTTON
        =================================================== */}

        {showAddButton && (
          <div
            style={{
              display: "flex",
              flex: "0 0 auto",
              alignItems: "center",
              gap: "8px",
              boxSizing: "border-box",
            }}
          >
            {children}

            <AddButton
              onAdd={onAdd}
              addButtonLabel={addButtonLabel}
            />
          </div>
        )}
      </div>
    </div>
  );
}

