import React, { useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileLoaded: (text: string, filename: string) => void
  accept?: string
  children: React.ReactNode
  className?: string
}

export function FileUpload({
  onFileLoaded,
  accept,
  children,
  className
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      // Basic check for file extension if accept is specified
      if (accept) {
        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
        const acceptedExts = accept.split(',').map(ext => ext.trim().toLowerCase())
        if (!acceptedExts.includes(fileExt) && !acceptedExts.includes(file.type)) {
          // File type not accepted, let parent handle or ignore
          return
        }
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        onFileLoaded(text, file.name)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn("relative flex flex-col flex-1", className)}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1.5px] flex items-center justify-center pointer-events-none z-30 transition-all rounded-2xl border border-primary">
          <div className="px-6 py-4 rounded-xl border border-primary/20 bg-background/95 shadow-md flex items-center gap-3 font-sans animate-fade-in">
            <Upload className="h-5 w-5 text-primary animate-bounce" />
            <span className="text-sm font-semibold text-foreground">Drop file here to upload</span>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
