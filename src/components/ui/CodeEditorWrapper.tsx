import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'))

function EditorLoadingFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px] bg-secondary/5 font-sans animate-pulse">
      <svg className="w-10 h-10 text-muted-foreground/35 mb-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-xs font-semibold text-muted-foreground">Loading Code Editor...</p>
    </div>
  )
}

interface CodeEditorWrapperProps {
  language: string
  value: string
  onChange?: (val: string) => void
  readOnly?: boolean
  height?: string
  wordWrap?: 'on' | 'off'
  lineNumbers?: 'on' | 'off'
  placeholder?: string
  onMount?: () => void
}

export function CodeEditorWrapper({
  language,
  value,
  onChange,
  readOnly = false,
  height = "350px",
  wordWrap = "on",
  lineNumbers = "on",
  placeholder = "Enter your code here...",
  onMount
}: CodeEditorWrapperProps) {
  const { resolvedTheme } = useTheme()
  const [monacoLoaded, setMonacoLoaded] = useState(false)
  const [useTextareaFallback, setUseTextareaFallback] = useState(false)

  const gutterRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      setUseTextareaFallback(true)
    }

    const timer = setTimeout(() => {
      if (!monacoLoaded) {
        setUseTextareaFallback(true)
      }
    }, 4500) // Timeout fallback

    return () => clearTimeout(timer)
  }, [monacoLoaded])

  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const lines = useMemo(() => value.split('\n'), [value])
  const lineCount = lines.length

  const handleEditorMount = () => {
    setMonacoLoaded(true)
    if (onMount) {
      onMount()
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col relative" style={{ height }}>
      {!useTextareaFallback ? (
        <Suspense fallback={<EditorLoadingFallback />}>
          <MonacoEditor
            height="100%"
            language={language}
            theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
            value={value}
            onChange={(val) => onChange && onChange(val || '')}
            onMount={handleEditorMount}
            loading={<EditorLoadingFallback />}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: lineNumbers,
              wordWrap: wordWrap,
              readOnly: readOnly,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              folding: true,
              padding: { top: 12, bottom: 12 },
              accessibilitySupport: 'on'
            }}
          />
        </Suspense>
      ) : (
        <div className="flex-1 flex relative h-full bg-secondary/[0.01]">
          {lineNumbers === 'on' && (
            <div
              ref={gutterRef}
              className="w-12 shrink-0 bg-secondary/20 border-r border-border/40 select-none text-right pr-2 text-[11px] leading-5 text-muted-foreground/35 py-3 font-mono overflow-hidden h-full"
            >
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="h-5">
                  {i + 1}
                </div>
              ))}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            onScroll={handleScroll}
            readOnly={readOnly}
            placeholder={placeholder}
            className={cn(
              "flex-1 p-3 text-[13px] leading-5 font-mono bg-transparent text-foreground placeholder:text-muted-foreground/45 border-none resize-none focus:outline-none h-full overflow-y-auto",
              wordWrap === 'off' && "whitespace-pre overflow-x-auto"
            )}
            spellCheck="false"
          />
        </div>
      )}
    </div>
  )
}
