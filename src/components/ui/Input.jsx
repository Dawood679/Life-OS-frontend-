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
      <div className="relative flex items-center group">
        {/* Left Icon */}
        {leftIcon && (
          <span className="absolute left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors">
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
          className={`w-full bg-slate-50/90 dark:bg-slate-900/90 border rounded-xl py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? 'border-red-500 focus:ring-red-500/40 focus:border-red-500'
              : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
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
        <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 pl-1 font-medium flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}