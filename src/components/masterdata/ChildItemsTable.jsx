
import StatusBadge from "../StatusBadge";

export default function ChildItemsTable({
    title,
    items = [],
    total,
    columns = [],
    onViewAll,
    emptyMessage = "No records found",
    showStatus = true,
    scrollHeight = "180px",
}) {
    const count = total ?? items.length;
    const totalColumns = columns.length + (showStatus ? 1 : 0);

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-gray-200">

            {/* Header - FIXED */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-2 py-1">
                <h3 className="text-[11px] font-semibold text-gray-900">
                    {title} ({count})
                </h3>

                {onViewAll && (
                    <button
                        type="button"
                        onClick={onViewAll}
                        className="text-[9px] font-medium text-blue-600 hover:underline"
                    >
                        View All
                    </button>
                )}
            </div>

            {/* TABLE SCROLL AREA */}
            <div
                className="min-h-0 flex-1 overflow-x-auto overflow-y-scroll"
                style={{
                    maxHeight: scrollHeight,
                    height: scrollHeight,
                }}
            >
                <table className="w-full min-w-max border-collapse">

                    {/* Column Header */}
                    <thead>
                        <tr className="bg-gray-50">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="sticky top-0 z-10 whitespace-nowrap border-b border-gray-200 bg-gray-50 px-2 py-1 text-left text-[10px] font-semibold text-gray-800"
                                >
                                    {col.label}
                                </th>
                            ))}

                            {showStatus && (
                                <th
                                    className="sticky top-0 z-10 whitespace-nowrap border-b border-gray-200 bg-gray-50 px-2 py-1 text-left text-[10px] font-semibold text-gray-800"
                                >
                                    Status
                                </th>
                            )}
                        </tr>
                    </thead>

                    {/* Data */}
                    <tbody className="divide-y divide-gray-100">

                        {items.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={totalColumns}
                                    className="py-6 text-center text-[10px] text-gray-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr
                                    key={
                                        item.id ??
                                        item.subdivision_id ??
                                        item.business_unit_id ??
                                        item.analysis_code_id ??
                                        index
                                    }
                                    className="hover:bg-gray-50"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className="whitespace-nowrap px-2 py-1 text-[9px] leading-none text-gray-800"
                                        >
                                            {item[col.key] ?? "-"}
                                        </td>
                                    ))}

                                    {showStatus && (
                                        <td className="whitespace-nowrap px-2 py-1">
                                            <StatusBadge
                                                label={
                                                    item.status ??
                                                    (item.active
                                                        ? "Active"
                                                        : "Inactive")
                                                }
                                                tone={
                                                    item.active === false
                                                        ? "red"
                                                        : "green"
                                                }
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}

                    </tbody>
                </table>
            </div>

            {/* Footer - FIXED */}
            <div className="shrink-0 border-t border-gray-200 bg-white px-2 py-1">
                <p className="text-[8px] font-semibold text-gray-700">
                    Showing {items.length} of {count}
                </p>
            </div>

        </div>
    );
}
