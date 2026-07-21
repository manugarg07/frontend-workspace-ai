import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  onClick?: () => void
  onDelete?: (e: React.MouseEvent) => void
  disabled?: boolean
}

export function Chip({
  className,
  active = false,
  onClick,
  onDelete,
  disabled = false,
  children,
  ...props
}: ChipProps) {
  const isClickable = !!onClick && !disabled

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-pressed={isClickable ? active : undefined}
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all select-none focus-ring',
        isClickable ? 'cursor-pointer active:scale-95' : 'cursor-default',
        active
          ? 'bg-primary border-transparent text-primary-foreground font-semibold'
          : 'bg-secondary/40 border-border text-foreground hover:bg-secondary',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (!disabled) onDelete(e)
          }}
          className={cn(
            'ml-1.5 p-0.5 rounded-full hover:bg-foreground/10 focus-ring cursor-pointer transition-colors',
            active ? 'hover:bg-primary-foreground/20 text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Remove"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
