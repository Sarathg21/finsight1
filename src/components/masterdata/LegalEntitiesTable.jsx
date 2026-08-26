import StatusBadge from "../StatusBadge";

export default function LegalEntitiesTable({
  entities = [],
  total,
  onViewAll,
}) {
  const count = total ?? entities.length;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-2 py-1">
        <h3 className="text-[11px] font-semibold text-gray-900">
          Legal Entities under this Legal Group ({count})
        </h3>

        <button
          type="button"
          onClick={onViewAll}
          className="text-[9px] font-medium text-blue-600 hover:underline"
        >
          View All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-0.5 text-left text-[10px] font-semibold Capitalize text-gray-800">
                Entity Code
              </th>

              <th className="px-2 py-0.5 text-left text-[10px] font-semibold Capitalize text-gray-800">
                Legal Entity Name
              </th>

              <th className="px-2 py-0.5 text-left text-[10px] font-semibold Capitalize text-gray-800">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {entities.map((e) => (
              <tr
                key={e.code}
                className="hover:bg-gray-50"
              >
                <td className="px-2 py-0.5 text-[9px] leading-none text-gray-800">
                  {e.code}
                </td>

                <td className="px-2 py-0.5 text-[9px] leading-none text-gray-800">
                  {e.name}
                </td>

                <td className="px-2 py-0.5">
                  <StatusBadge
                    label={e.status}
                    tone="green"
                  />
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white px-2 py-1">
        <p className="text-[8px] text-gray-500">
          Showing 1 to {entities.length} of {count} entities
        </p>
      </div>

    </div>
  );
}