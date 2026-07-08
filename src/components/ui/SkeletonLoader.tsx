import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle'
}

export function Skeleton({ className, variant = 'rect', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted rounded',
        variant === 'text' && 'h-4 w-3/4 rounded-sm',
        variant === 'rect' && 'h-full w-full',
        variant === 'circle' && 'rounded-full shrink-0',
        className
      )}
      {...props}
    />
  )
}

export function SkeletonLoader({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4 w-full', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center w-full p-4 border border-border/40 rounded-xl bg-card/40">
          <Skeleton variant="circle" className="h-10 w-10" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton variant="text" className="h-4 w-1/3" />
            <Skeleton variant="text" className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
