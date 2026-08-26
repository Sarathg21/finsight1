import { Info, RefreshCw } from "lucide-react";

export default function FooterNote({
  title = "Note:",
  message = "",
  lastUpdated = "",
  onRefresh,
  showRefresh = true,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-[11px]">

      <Info className="h-3.5 w-3.5 shrink-0 text-blue-600" />

      <p className="min-w-0 flex-1 text-gray-600 leading-4">
        <span className="font-semibold text-gray-800">
          {title}
        </span>{" "}
        {message}
      </p>
      {(lastUpdated || showRefresh) && (
        <div className="flex items-center gap-1.5 whitespace-nowrap text-[10px] text-gray-500">
          {lastUpdated && (
            <span>
              Last Updated: {lastUpdated}
            </span>
          )}
          {showRefresh && (
            <button
              onClick={onRefresh}
              className="rounded p-1 text-blue-600 hover:bg-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}

        </div>
      )}
    </div>
  );
}