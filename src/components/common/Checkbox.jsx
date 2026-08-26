export default function Checkbox({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
  color = "green",
}) {
  const colors = {
    blue: "bg-blue-600 border-blue-600",
    green: "bg-green-500 border-green-500",
    orange: "bg-orange-500 border-orange-500",
    purple: "bg-purple-600 border-purple-600",
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
        checked
          ? colors[color]
          : "bg-white border-gray-300 hover:border-gray-400"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {checked && (
        <svg viewBox="0 0 20 20" fill="none" className="w-3 h-3 text-white">
          <path
            d="M5 10.5l3.5 3.5L15 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}