
export default function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 rounded bg-gray-200"></div>
          <div className="mt-2 h-4 w-96 rounded bg-gray-100"></div>
        </div>

        <div className="h-10 w-36 rounded-lg bg-gray-200"></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <div className="h-4 w-24 rounded bg-gray-200"></div>
            <div className="mt-4 h-8 w-20 rounded bg-gray-300"></div>
            <div className="mt-3 h-3 w-32 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3">
        <div className="h-10 w-72 rounded-lg bg-gray-200"></div>
        <div className="h-10 w-40 rounded-lg bg-gray-200"></div>
        <div className="h-10 w-40 rounded-lg bg-gray-200"></div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 border-b p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-4 rounded bg-gray-200"
            ></div>
          ))}
        </div>

        {/* Table Rows */}
        {Array.from({ length: 8 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-6 gap-4 border-b p-4"
          >
            {Array.from({ length: 6 }).map((_, col) => (
              <div
                key={col}
                className="h-4 rounded bg-gray-100"
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}