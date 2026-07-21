import React, { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, placeholder, ...props }, ref) => {
    const defaultId = useId()
    const textareaId = id || defaultId
    const errorId = `${textareaId}-error`
    const accessibleName = props['aria-label'] || label || placeholder

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          placeholder={placeholder}
          aria-label={accessibleName}
          aria-describedby={error ? errorId : props['aria-describedby']}
          aria-invalid={error ? true : props['aria-invalid']}
          className={cn(
            'flex min-h-24 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all font-mono',
            error && 'border-destructive focus-visible:ring-destructive/30',
            className
          )}
          {...props}
        />
        {error && (
          <span id={errorId} role="alert" className="text-xs text-destructive mt-0.5">
            {error}
          </span>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
