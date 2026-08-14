import { type SelectHTMLAttributes, forwardRef } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, className = '', children, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        ref={ref}
        {...props}
        className={[
          'w-full px-3 py-2.5 border rounded-lg text-sm font-sans text-gray-900 bg-white outline-none transition',
          error
            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
          className,
        ].join(' ')}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  ),
)
Select.displayName = 'Select'
