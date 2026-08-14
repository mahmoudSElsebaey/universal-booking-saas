import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  /** Show eye toggle for password fields (default true when type=password) */
  passwordToggle?: boolean
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
      type,
      passwordToggle,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name
    const isPassword = type === 'password'
    const showToggle = passwordToggle ?? isPassword
    const [visible, setVisible] = useState(false)
    const resolvedType = isPassword && showToggle ? (visible ? 'text' : 'password') : type

    const endIcon =
      isPassword && showToggle ? (
        <button
          type="button"
          tabIndex={-1}
          className="text-text-muted hover:text-text focus:outline-none"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      ) : (
        rightIcon
      )

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
            type={resolvedType}
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
              endIcon && 'pe-10',
              className
            )}
            {...props}
          />

          {endIcon && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-3 text-text-muted">
              {endIcon}
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
