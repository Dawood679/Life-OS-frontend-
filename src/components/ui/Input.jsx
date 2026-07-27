export default function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  leftIcon,
  rightIcon,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <div className="w-full">
      <div className="relative flex items-center">
        {/* Left Icon */}
        {leftIcon && (
          <span className="absolute left-0 pl-3.5 flex items-center pointer-events-none text-ink-400">
            {leftIcon}
          </span>
        )}

        {/* Input Field */}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-surface-orange border rounded-lg py-2.5 text-sm text-ink-700 placeholder:text-ink-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring/50 focus:border-focus-ring disabled:bg-disabled-bg disabled:text-disabled-text disabled:border-disabled-border disabled:cursor-not-allowed ${
            error
              ? 'border-danger-text focus:ring-danger-text/40 focus:border-danger-text'
              : 'border-ink-200'
          } ${leftIcon ? 'pl-10' : 'pl-4'} ${rightIcon ? 'pr-10' : 'pr-4'} ${className}`}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute right-0 pr-3.5 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {/* WCAG Compliant Error Message */}
      {error && (
        <p className="text-danger-text text-xs mt-1 pl-1 font-medium flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}