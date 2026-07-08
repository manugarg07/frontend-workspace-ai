import React from 'react'
import { Inbox, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  actionText?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  title = 'No results found',
  description = 'Try refining your search query or filters.',
  icon = <Inbox className="h-10 w-10 text-muted-foreground" />,
  actionText,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-2xl bg-card/25', className)}>
      <div className="p-3 bg-secondary/50 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  retryText?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this view.',
  icon = <AlertTriangle className="h-10 w-10 text-destructive" />,
  retryText = 'Try again',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8 border border-border bg-destructive/5 rounded-2xl', className)}>
      <div className="p-3 bg-destructive/10 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4 leading-relaxed">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryText}
        </Button>
      )}
    </div>
  )
}

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = 'Loading workspace...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8 gap-3 min-h-[300px]', className)}>
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground font-medium animate-pulse">{message}</p>
    </div>
  )
}
