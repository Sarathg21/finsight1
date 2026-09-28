
import { Pencil, Edit3 } from "lucide-react";
import AvatarBadge from "../AvatarBadge";
import StatusBadge from "../StatusBadge";

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

export default function CurrencyDetails({
    currency,
    onEdit,
    onAnnotate,
    onStatusChange,
}) {
    if (!currency) {
        return (
            <div className="flex h-full items-center justify-center rounded-lg border border-gray-200 bg-white">
                <p className="text-sm text-gray-500">
                    Select a currency
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col rounded-lg border border-gray-200 bg-white px-4 pt-2 pb-1 shadow-sm">

            {/* =================================================
                HEADER
            ================================================= */}
            <div className="flex h-7 items-center justify-between">
                <h2 className="text-[15px] font-semibold text-gray-900">
                    Currency Details
                </h2>

                <div className="flex gap-1">
                    {/*
                    <button
                        type="button"
                        onClick={() => onEdit?.(currency)}
                        className="rounded p-1 hover:bg-gray-100"
                    >
                        <Pencil className="h-3.5 w-3.5 text-gray-500" />
                    </button>

                    <button
                        type="button"
                        onClick={() => onAnnotate?.(currency)}
                        className="rounded p-1 hover:bg-gray-100"
                    >
                        <Edit3 className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                    */}
                </div>
            </div>

            {/* =================================================
                PROFILE
            ================================================= */}
            <div className="mt-1.5 flex items-center gap-3">
                <AvatarBadge
                    initials={
                        currency.currency_code
                            ?.substring(0, 2)
                            .toUpperCase() || "CU"
                    }
                />

                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-[13px] font-semibold text-gray-900">
                            {currency.currency_name || "-"}
                        </h3>

                        <StatusBadge
                            label={
                                currency.active
                                    ? "Active"
                                    : "Inactive"
                            }
                            tone={
                                currency.active
                                    ? "green"
                                    : "gray"
                            }
                        />
                    </div>

                    <p className="text-[10px] text-gray-500">
                        Currency Master Data
                    </p>
                </div>
            </div>

            {/* =================================================
                INFORMATION
            ================================================= */}
            <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-2">

                {/* Currency Code */}
                <InfoField label="Currency Code">
                    {currency.currency_code || "-"}
                </InfoField>

                {/* Currency Name */}
                <InfoField label="Currency Name">
                    {currency.currency_name || "-"}
                </InfoField>

                {/* Conversion Rate */}
                <InfoField label="Conversion Rate to AED">
                    {currency.conversion_rate_to_aed !== null &&
                        currency.conversion_rate_to_aed !== undefined &&
                        currency.conversion_rate_to_aed !== ""
                        ? Number(
                            currency.conversion_rate_to_aed
                        ).toFixed(6)
                        : "-"}
                </InfoField>

                  {/* Created On */}
                <InfoField label="Created On">
                    {formatDate(currency.created_at)}
                </InfoField>

                <InfoField label="Created_by">
                    {currency.created_by || "-"}
                </InfoField>

                <InfoField label="Created_by_Name">
                    {currency.created_by_name || "-"}
                </InfoField>

                {/* Updated On */}
                <InfoField label="Updated On">
                    {formatDate(currency.updated_at)}
                </InfoField>

                <InfoField label="Updated_by_Name">
                    {currency.updated_by_name || "-"}
                </InfoField>

                <InfoField label="Updated_by">
                    {currency.updated_by || "-"}
                </InfoField>

                {/* Status */}
                <div className="leading-tight py-2">
                    <p className="text-[9px] text-gray-500">
                        Status
                    </p>

                    <input
                        type="text"
                        value={currency.active ? "Active" : "Inactive"}
                        readOnly
                        className={`mt-0.5 h-6 w-full rounded border border-gray-300 bg-white px-2 text-[10px] focus:outline-none ${currency.active
                            ? "text-green-600"
                            : "text-gray-500"
                            }`}
                    />
                </div>
            </div>

            {/* =================================================
                DIVIDER
            ================================================= */}
            <div className="mt-1 mb-0.5 border-t border-gray-200" />
        </div>
    );
}
