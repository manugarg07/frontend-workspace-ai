import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'secondary', size = 'md', rounded = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all focus-ring active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          rounded ? 'rounded-full' : 'rounded-lg',
          // Variants
          variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20',
          variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
          variant === 'outline' && 'bg-transparent border border-border text-foreground hover:bg-secondary/50',
          variant === 'ghost' && 'bg-transparent text-foreground hover:bg-secondary',
          // Sizes
          size === 'sm' && 'p-1.5 h-11 w-11 md:h-8 md:w-8',
          size === 'md' && 'p-2 h-11 w-11 md:h-10 md:w-10',
          size === 'lg' && 'p-2.5 h-12 w-12',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'
