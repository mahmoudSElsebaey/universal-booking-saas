import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-label text-text">
            {label}
            {props.required && <span className="text-error ms-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-text-muted">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'flex h-10 w-full rounded-md border bg-surface px-3 py-2 text-sm text-text',
              'placeholder:text-text-muted',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted',
              error
                ? 'border-error focus-visible:ring-error'
                : 'border-border hover:border-border-strong',
              leftIcon && 'ps-10',
              rightIcon && 'pe-10',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-3 text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-caption text-error">{error}</p>}
        {hint && !error && <p className="text-caption text-text-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
