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
    'w-full font-medium rounded-lg transition-all duration-200 flex items-center justify-center relative group text-sm focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2';

  const variants = {
    primary:
      'bg-brand-gradient text-white py-2.5 px-4 shadow-md hover:opacity-95 active:opacity-90 disabled:bg-disabled-bg disabled:text-disabled-text disabled:border-disabled-border disabled:shadow-none disabled:cursor-not-allowed disabled:opacity-100',
    outline:
      'border border-ink-200 bg-surface-orange/30 text-ink-600 py-2 px-4 hover:bg-brand-gradient hover:text-white hover:border-transparent active:opacity-90 disabled:bg-disabled-bg disabled:text-disabled-text disabled:border-disabled-border disabled:cursor-not-allowed',
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