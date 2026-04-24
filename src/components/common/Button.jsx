export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all active:scale-95'
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 disabled:border-blue-300 disabled:text-blue-300',
    ghost: 'text-gray-600 hover:bg-gray-100 disabled:text-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
