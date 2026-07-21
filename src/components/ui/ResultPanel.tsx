import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './Card'
import { IconButton } from './IconButton'
import { Copy, Download, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from './FeedbackStates'
import { trackEvent } from '@/services/analytics'

interface ResultPanelProps {
  title: string
  value: string
  onCopy?: () => void
  onDownload?: () => void
  validationStatus?: 'success' | 'warning' | 'error' | null
  validationMessage?: string
  processingTime?: number | null
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function ResultPanel({
  title,
  value,
  onCopy,
  onDownload,
  validationStatus = null,
  validationMessage,
  processingTime = null,
  emptyTitle = "Output Awaiting Code",
  emptyDescription = "Output results will render here automatically or on run.",
  emptyIcon,
  children,
  className
}: ResultPanelProps) {
  return (
    <Card className={cn("flex flex-col bg-card/45 border-border overflow-hidden min-h-[420px] relative", className)}>
      <CardHeader className="p-4 border-b border-border/40 flex justify-between items-center bg-secondary/15 font-sans">
        <CardTitle as="h2" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {onCopy && (
            <IconButton
              variant="outline"
              size="sm"
              onClick={() => {
                onCopy()
                trackEvent({ action: 'copy_click', category: 'result_panel', label: title })
              }}
              disabled={!value}
              aria-label="Copy to Clipboard"
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          )}
          {onDownload && (
            <IconButton
              variant="outline"
              size="sm"
              onClick={() => {
                onDownload()
                trackEvent({ action: 'download_click', category: 'result_panel', label: title })
              }}
              disabled={!value}
              aria-label="Download results file"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col min-h-[350px] relative bg-secondary/5">
        {value ? (
          children
        ) : (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            icon={emptyIcon}
            className="flex-1 border-none bg-transparent min-h-[350px]"
          />
        )}
      </CardContent>

      {/* Validation Metrics Footer */}
      <div className="border-t border-border/40 p-2.5 flex justify-between items-center text-xs bg-secondary/10 font-sans">
        <div className="flex items-center gap-3">
          {validationStatus === 'success' && (
            <span className="flex items-center gap-1.5 text-emerald-500 font-bold uppercase tracking-wider text-[10px]">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Syntax Valid
            </span>
          )}
          {validationStatus === 'warning' && (
            <span className="flex items-center gap-1.5 text-amber-500 font-bold uppercase tracking-wider text-[10px]">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> Syntax Warning
            </span>
          )}
          {validationStatus === 'error' && (
            <span className="flex items-center gap-1.5 text-destructive font-bold uppercase tracking-wider text-[10px]">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> Syntax Invalid
            </span>
          )}
          {validationStatus === null && (
            <span className="text-muted-foreground font-semibold text-[10px] uppercase">Awaiting Input</span>
          )}
        </div>
        {processingTime !== null && (
          <span className="text-[10px] text-muted-foreground">
            Time: <strong className="text-foreground">{processingTime} ms</strong>
          </span>
        )}
      </div>
    </Card>
  )
}
