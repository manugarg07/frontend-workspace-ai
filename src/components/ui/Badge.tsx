import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'destructive'
}

export function Badge({ className, variant = 'secondary', children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold select-none border transition-colors',
        variant === 'primary' && 'bg-primary text-primary-foreground border-transparent',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground border-border',
        variant === 'outline' && 'bg-transparent text-foreground border-border',
        variant === 'accent' && 'bg-accent/80 text-accent-foreground border-accent/20',
        variant === 'destructive' && 'bg-destructive/10 text-destructive border-destructive/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
