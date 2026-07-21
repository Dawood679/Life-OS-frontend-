export default function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'outline'
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
    'w-full font-medium rounded-lg transition flex items-center justify-center relative group text-sm';

  const variants = {
    primary:
      'bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 text-white py-2.5 px-4 shadow-md hover:opacity-95 disabled:opacity-70',
    outline:
      'border border-slate-200 bg-orange-50/30 text-slate-600 py-2 px-4 hover:bg-gradient-to-r hover:from-indigo-500 hover:via-sky-500 hover:to-sky-400 hover:text-white',
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
        <span className="absolute right-4 flex items-center">{rightIcon}</span>
      )}
    </button>
  );
}