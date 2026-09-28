import { Pencil, Edit3 } from "lucide-react";
import AvatarBadge from "../AvatarBadge";
import StatusBadge from "../StatusBadge";
import ChildItemsTable from "../masterdata/ChildItemsTable";

function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

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

export default function LegalEntityDetails({
    entity,
    onEdit,
    onAnnotate,
    onStatusChange, parentDivisions = [],
}) {
    if (!entity) return null;

    return (
        <div className="flex h-full min-h-0 flex-col rounded-lg border border-gray-200 bg-white px-4 pt-2 pb-1 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between h-7">
                <h2 className="text-[15px] font-semibold text-gray-900">
                    Legal Entity Details
                </h2>

                <div className="flex gap-1">
                    {/* <button
                        onClick={onEdit}
                        className="rounded p-1 hover:bg-gray-100"
                    >
                        <Pencil className="h-3.5 w-3.5 text-gray-500" />
                    </button>

                    <button
                        onClick={onAnnotate}
                        className="rounded p-1 hover:bg-gray-100"
                    >
                        <Edit3 className="h-3.5 w-3.5 text-gray-500" />
                    </button> */}
                </div>
            </div>


            {/* Profile */}
            <div className="mt-1.5 flex items-center gap-3">
                <AvatarBadge
                    initials={
                        entity.legal_entity_name
                            ?.substring(0, 2)
                            .toUpperCase()
                    }
                />

                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-[13px] font-semibold text-gray-900">
                            {entity.legal_entity_name}
                        </h3>

                        <StatusBadge
                            label={entity.active ? "Active" : "Inactive"}
                            tone={entity.active ? "green" : "gray"}
                        />
                    </div>

                    <p className="text-[10px] text-gray-500">
                        {entity.subtitle}
                    </p>
                </div>
            </div>

            {/* ================= INFORMATION ================= */}
            <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-2">

                {/* Code */}
                <InfoField label="Legal Entity Code">
                    {entity.legal_entity_code || "-"}
                </InfoField>

                {/* Name */}
                <InfoField label="Legal Entity Name">
                    {entity.legal_entity_name || "-"}
                </InfoField>

                {/* Created On */}
                <InfoField label="Created On">
                    {formatDate(entity.created_at)}
                </InfoField>

                <InfoField label="Created_by">
                    {entity.created_by || "-"}
                </InfoField>

                <InfoField label="Created_by_Name">
                    {entity.created_by_name || "-"}
                </InfoField>

                {/* Updated On */}
                <InfoField label="Updated On">
                    {formatDate(entity.updated_at)}
                </InfoField>

                <InfoField label="Updated_by_Name">
                    {entity.updated_by_name || "-"}
                </InfoField>

                <InfoField label="Updated_by">
                    {entity.updated_by || "-"}
                </InfoField>

                {/* Number of Parent Divisions */}
                <InfoField label="No. of Parent Divisions">
                    {parentDivisions?.length || 0}
                </InfoField>

                {/* Status */}
                <div className="leading-tight py-2">

                    <p className="text-[9px] text-gray-500">
                        Status
                    </p>

                    <input
                        type="text"
                        value={
                            entity.active
                                ? "Active"
                                : "Inactive"
                        }
                        readOnly
                        className={`mt-0.5 h-6 w-full rounded border border-gray-300 bg-white px-2 text-[10px] focus:outline-none ${entity.active
                            ? "text-green-600"
                            : "text-gray-500"
                            }`}
                    />

                </div>

            </div>

            {/* Divider */}
            <div className="mt-1 mb-0.5 border-t border-gray-200" />


            <ChildItemsTable
                title="Parent Divisions under this Legal Entity"
                items={parentDivisions || []}
                total={parentDivisions?.length || 0}
                columns={[
                    {
                        key: "parent_division_code",
                        label: "Code",
                    },
                    {
                        key: "parent_division_name",
                        label: "Parent Division",
                    },
                ]}
            />
        </div>
    );
}