export default function SelectField({
  label,
  value,
  options = [],
  optionLabel,
  optionValue,
  onChange,
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium text-gray-600">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="h-7 w-full rounded border border-gray-300 px-2 text-[10px]"
      >
        <option value="">All</option>

        {options.map((item) => (
          <option
            key={item[optionValue]}
            value={item[optionValue]}
          >
            {item[optionLabel]}
          </option>
        ))}
      </select>
    </div>
  );
}