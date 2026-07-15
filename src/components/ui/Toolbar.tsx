import React from 'react'
import {
  Play,
  Copy,
  Download,
  Upload,
  ClipboardList,
  Trash,
  Share2,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { Button } from './Button'
import { Chip } from './Chip'
import { cn } from '@/lib/utils'

interface ToolbarProps {
  onPaste?: () => void
  onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadAccept?: string
  samples?: { [key: string]: { title: string; data: any } }
  onLoadSample?: (key: string) => void
  onConvert?: () => void
  convertLoading?: boolean
  convertLabel?: string
  onCopy?: () => void
  copyDisabled?: boolean
  onDownload?: () => void
  downloadDisabled?: boolean
  onClear?: () => void
  clearDisabled?: boolean
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  onShare?: () => void
  shareDisabled?: boolean
  className?: string
}

export function Toolbar({
  onPaste,
  onUpload,
  uploadAccept = '.html,.json,.txt,.svg',
  samples,
  onLoadSample,
  onConvert,
  convertLoading = false,
  convertLabel = 'Convert',
  onCopy,
  copyDisabled = false,
  onDownload,
  downloadDisabled = false,
  onClear,
  clearDisabled = false,
  isFullscreen = false,
  onToggleFullscreen,
  onShare,
  shareDisabled = false,
  className
}: ToolbarProps) {
  return (
    <div className={cn(
      "border border-border bg-card/65 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm relative z-10 glass-panel font-sans",
      className
    )}>
      {/* Left side actions (Input side) */}
      <div className="flex flex-wrap items-center gap-2">
        {onPaste && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onPaste}
            leftIcon={<ClipboardList className="h-4 w-4" />}
            className="h-9 font-medium"
          >
            Paste
          </Button>
        )}

        {onUpload && (
          <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-border bg-card hover:bg-secondary/40 rounded-lg cursor-pointer transition-colors focus-ring h-9 select-none">
            <Upload className="h-4 w-4" />
            <span>Upload File</span>
            <input
              type="file"
              accept={uploadAccept}
              onChange={onUpload}
              className="hidden"
            />
          </label>
        )}

        {/* Preset Chips */}
        {samples && onLoadSample && (
          <div className="flex items-center gap-1 border-l border-border/40 pl-2">
            {Object.entries(samples).map(([key, sample]) => (
              <Chip key={key} onClick={() => onLoadSample(key)}>
                {sample.title}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Right side actions (Compile and Output side) */}
      <div className="flex items-center gap-2">
        {onConvert && (
          <Button 
            size="sm" 
            variant="primary" 
            onClick={onConvert}
            isLoading={convertLoading}
            leftIcon={<Play className="h-4 w-4" />}
            className="h-9 bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/25"
          >
            {convertLabel}
          </Button>
        )}

        {onCopy && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={onCopy}
            disabled={copyDisabled}
            leftIcon={<Copy className="h-4 w-4" />}
            className="h-9 font-medium"
          >
            Copy
          </Button>
        )}

        {onDownload && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={onDownload}
            disabled={downloadDisabled}
            leftIcon={<Download className="h-4 w-4" />}
            className="h-9 font-medium"
          >
            Download
          </Button>
        )}

        {onShare && (
          <Button
            size="sm"
            variant="outline"
            onClick={onShare}
            disabled={shareDisabled}
            leftIcon={<Share2 className="h-4 w-4" />}
            className="h-9 font-medium"
          >
            Share
          </Button>
        )}

        {onToggleFullscreen && (
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleFullscreen}
            leftIcon={isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            className="h-9 font-medium px-2.5"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          />
        )}

        {onClear && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={onClear}
            disabled={clearDisabled}
            className="h-9 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 font-medium"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
