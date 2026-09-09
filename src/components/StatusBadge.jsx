
const toneMap = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  gray: "bg-gray-100 text-gray-700",
};

export default function StatusBadge({
  status,
  label,
  tone,
  className = "",
}) {
  // Use status when provided
  const displayLabel = status ?? label ?? "Active";

  // Automatically select color based on status
  const displayTone =
    tone ??
    (displayLabel === "Active"
      ? "green"
      : displayLabel === "Inactive"
        ? "red"
        : "gray");

  return (
    <span
      className={`
                inline-flex
                items-center
                rounded-full
                px-2.5
                py-1
                text-xs
                font-medium
                ${toneMap[displayTone] ?? toneMap.gray}
                ${className}
            `}
    >
      {displayLabel}
    </span>
  );
}

