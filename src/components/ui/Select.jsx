export default function Select({
  value,
  onChange,
  options = [],
  placeholder,
  error,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      <div className="relative flex items-center">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full appearance-none bg-surface-orange border rounded-lg py-2.5 pl-4 pr-10 text-sm text-ink-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring/50 focus:border-focus-ring disabled:bg-disabled-bg disabled:text-disabled-text disabled:border-disabled-border disabled:cursor-not-allowed ${
            error
              ? 'border-danger-text focus:ring-danger-text/40 focus:border-danger-text'
              : 'border-ink-200'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className="absolute right-3.5 flex items-center pointer-events-none text-ink-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      {error && (
        <p className="text-danger-text text-xs mt-1 pl-1 font-medium flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}