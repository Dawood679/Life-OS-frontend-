export default function Button({
  children,
  type = 'button',
  variant = 'primary', 
  disabled = false,
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles =
    'w-full font-medium rounded-xl transition-all duration-200 flex items-center justify-center relative group text-sm focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2';

  const variants = {
    primary:
      'bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white! py-3 px-5 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:scale-100',
    outline:
      'border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 py-2.5 px-4 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-400/50 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {leftIcon && <span className="mr-2 flex items-center">{leftIcon}</span>}
      <span>{loading && loadingText ? loadingText : children}</span>
      {rightIcon && !loading && (
        <span className="ml-2 flex items-center">{rightIcon}</span>
      )}
    </button>
  );
}