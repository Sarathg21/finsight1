
import AvatarBadge from "../AvatarBadge";
import StatusBadge from "../StatusBadge";
import ChildItemsTable from "../masterdata/ChildItemsTable";

function InfoField({ label, children }) {
  return (
    <div className="leading-tight py-[1.5px]">
      <p className="text-[9px] text-gray-500">
        {label}
      </p>

      <div className="mt-0.5 text-[11px] font-medium text-gray-800">
        {children}
      </div>
    </div>
  );
}

function formatAuditDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LegalGroupDetails({
  group,
  entities = [],
  onEdit,
  onAnnotate,
  onViewAll,
  onStatusChange,
}) {
  if (!group) return null;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-gray-200 bg-white px-4 pt-2 pb-1 shadow-sm">

      {/* Header */}
      <div className="flex h-7 items-center justify-between">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Legal Group Details
        </h2>
      </div>

      {/* Profile */}
      <div className="mt-1.5 flex items-center gap-3">

        <AvatarBadge
          initials={
            group.legal_group_name
              ?.substring(0, 2)
              .toUpperCase()
          }
        />

        <div>
          <div className="flex items-center gap-2">

            <h3 className="text-[13px] font-semibold text-gray-900">
              {group.legal_group_name}
            </h3>

            <StatusBadge
              label={group.active ? "Active" : "Inactive"}
              tone={group.active ? "green" : "gray"}
            />

          </div>

          <p className="text-[10px] text-gray-500">
            {group.subtitle || ""}
          </p>
        </div>

      </div>

      {/* Information */}
      <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-2">

        <InfoField label="Code">
          {group.legal_group_code || "-"}
        </InfoField>

        <InfoField label="Name">
          {group.legal_group_name?.toUpperCase() || "-"}
        </InfoField>

        <InfoField label="Created By">
          {group.created_by || "-"}
        </InfoField>

        <InfoField label="Created_by_Name">
          {group.created_by_name || "-"}
        </InfoField>

        <InfoField label="Created On">
          {formatAuditDate(group.created_at)}
        </InfoField>

        <InfoField label="Updated_by_Name">
          {group.updated_by_name || "-"}
        </InfoField>

        <InfoField label="Updated_By">
          {group.updated_by || "-"}
        </InfoField>

        <InfoField label="Updated On">
          {formatAuditDate(group.updated_at)}
        </InfoField>

        {/* Status */}
        <div className="leading-tight py-2">
          <p className="text-[9px] text-gray-500">
            Status
          </p>

          <input
            type="text"
            value={group.active ? "Active" : "Inactive"}
            readOnly
            className={`mt-0.5 h-6 w-full rounded border border-gray-300 bg-white px-2 text-[10px] focus:outline-none ${group.active
              ? "text-green-600"
              : "text-gray-500"
              }`}
          />
        </div>

        <InfoField label="No. of Legal Entities">
          {entities.length || "-"}
        </InfoField>

      </div>

      {/* Divider */}
      <div className="mt-1 mb-0.5 border-t border-gray-200" />

      {/* Legal Entities */}
      <ChildItemsTable
        title="Legal Entities under this Legal Group"
        items={entities}
        total={entities.length}
        onViewAll={onViewAll}
        columns={[
          {
            key: "legal_entity_code",
            label: "Entity Code",
          },
          {
            key: "legal_entity_name",
            label: "Legal Entity Name",
          },
        ]}
      />

    </div>
  );
}