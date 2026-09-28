import { Pencil, Edit3 } from "lucide-react";
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


export default function ParentDivisionDetails({
    division,
    subdivisions = [], legalEntities = [],
    onEdit,
    onAnnotate,
    onStatusChange,
}) {

    console.log("SELECTED PARENT DIVISION:", division);

    if (!division) return null;

    return (
        <div className="flex h-full min-h-0 flex-col rounded-lg border border-gray-200 bg-white px-4 pt-2 pb-1 shadow-sm">

            {/* Header */}
            <div className="flex items-center justify-between h-7">

                <h2 className="text-[15px] font-semibold text-gray-900">
                    Parent Division Details
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
                        division.parent_division_name
                            ?.substring(0, 2)
                            .toUpperCase()
                    }
                />
                <div>
                    <div className="flex items-center gap-2">

                        <h3 className="text-[13px] font-semibold text-gray-900">
                            {division.parent_division_name}
                        </h3>

                        <StatusBadge
                            label={
                                division.active
                                    ? "Active"
                                    : "Inactive"
                            }
                            tone={
                                division.active
                                    ? "green"
                                    : "gray"
                            }
                        />

                    </div>
                    <p className="text-[10px] text-gray-500">
                        Parent Division
                    </p>
                </div>
            </div>

            {/* Information */}
            <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-2">

                <InfoField label="Parent Division Code">
                    {division.parent_division_code || "-"}
                </InfoField>

                <InfoField label="Parent Division Name">
                    {division.parent_division_name || "-"}
                </InfoField>

                {/* Created On */}
                <InfoField label="Created On">
                    {formatDate(division.created_at)}
                </InfoField>


                <InfoField label="Created_by">
                    {division.created_by || "-"}
                </InfoField>

                <InfoField label="Created_by_Name">
                    {division.created_by_name || "-"}
                </InfoField>

                {/* Updated On */}
                <InfoField label="Updated On">
                    {formatDate(division.updated_at)}
                </InfoField>

                <InfoField label="Updated_by_Name">
                    {division.updated_by_name || "-"}
                </InfoField>

                <InfoField label="Updated_by">
                    {division.updated_by || "-"}
                </InfoField>

                {/* Status */}
                <div className="leading-tight py-2">
                    <p className="text-[9px] text-gray-500">
                        Status
                    </p>

                    <input
                        type="text"
                        value={division.active ? "Active" : "Inactive"}
                        readOnly
                        className={`mt-0.5 h-6 w-full rounded border border-gray-300 bg-white px-2 text-[10px] focus:outline-none ${division.active
                            ? "text-green-600"
                            : "text-gray-500"
                            }`}
                    />
                </div>

                <InfoField label="Last Updated On">
                    {division.updatedOn || "-"}
                </InfoField>

                <InfoField label="No. of Legal Entities">
                    {legalEntities.length || "-"}
                </InfoField>

                <InfoField label="Created By">
                    {division.createdBy || "-"}
                </InfoField>
            </div>

            {/* Divider */}
            <div className="mt-1 mb-0.5 border-t border-gray-200" />
            <div className="mt-1 min-h-0 flex-1 overflow-hidden">
                <ChildItemsTable
                    title="Associated Legal Entities"
                    items={legalEntities}
                    total={legalEntities.length}
                    columns={[
                        {
                            key: "legal_entity_code",
                            label: "Code",
                        },
                        {
                            key: "legal_entity_name",
                            label: "Legal Entity",
                        },
                    ]}
                />
            </div>
        </div>
    );
}