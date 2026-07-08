import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Play,
  Maximize2,
  Minimize2,
  Copy,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  ArrowLeftRight,
  FolderOpen
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Badge } from '@/components/ui/Badge'
import { Chip } from '@/components/ui/Chip'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

// Predefined JSON Sample Templates
const SAMPLES = {
  simple: {
    title: 'Simple Object',
    data: {
      name: "Workspace AI",
      status: "active",
      version: 2.0,
      offline: true
    }
  },
  nested: {
    title: 'Nested Object',
    data: {
      userId: "usr-4921",
      profile: {
        firstName: "Sarah",
        lastName: "Connor",
        roles: ["operator", "engineer"],
        contacts: {
          email: "sarah.c@workspace.ai",
          github: "https://github.com/sarahconnor"
        }
      },
      preferences: {
        theme: "dark",
        fontSize: 14,
        sidebarExpanded: false
      }
    }
  },
  api: {
    title: 'API Response',
    data: {
      ok: true,
      statusCode: 200,
      statusText: "OK",
      timestamp: 1783510023,
      data: {
        items: [
          { id: 101, name: "JSON Formatter Pro", category: "Formatters", usageCount: 4501 },
          { id: 102, name: "JWT Decoder", category: "Validators", usageCount: 2310 },
          { id: 103, name: "Tailwind Grid", category: "Generators", usageCount: 945 }
        ],
        meta: {
          totalCount: 3,
          page: 1,
          hasMore: false
        }
      }
    }
  },
  array: {
    title: 'Array Data',
    data: [
      { rank: 1, lang: "TypeScript", usage: "High" },
      { rank: 2, lang: "JavaScript", usage: "High" },
      { rank: 3, lang: "CSS", usage: "Medium" }
    ]
  },
  large: {
    title: 'System Config',
    data: {
      system: {
        host: "local.workspace.ai",
        environment: "production",
        uptimeSeconds: 84902,
        loadAverage: [0.15, 0.08, 0.02],
        memory: {
          totalBytes: 17179869184,
          freeBytes: 4210080256,
          cacheBytes: 2199023256
        }
      },
      security: {
        sslEnabled: true,
        corsOrigins: ["https://personal.ai", "http://localhost:3000"],
        tokenExpirySeconds: 3600,
        encryptionAlgorithm: "AES-256-GCM"
      },
      featuresEnabled: {
        offlineSandbox: true,
        commandPalette: true,
        supabaseSync: false,
        stripeBilling: false
      }
    }
  }
}

// Spacing selection definitions
const SPACING_OPTIONS = [
  { id: '2', label: '2 Spaces', value: 2 },
  { id: '4', label: '4 Spaces', value: 4 },
  { id: 'tab', label: 'Tab Indent', value: '\t' },
]

export function JSONFormatterPro() {
  const { toast } = useToast()
  const { resolvedTheme } = useTheme()

  // State Management
  const [inputVal, setInputVal] = useState('')
  const [outputVal, setOutputVal] = useState('')
  const [autoFormat, setAutoFormat] = useState(true)
  const [spacing, setSpacing] = useState<number | string>(2)
  const [validationStatus, setValidationStatus] = useState<null | 'success' | 'error'>(null)
  const [errorDetails, setErrorDetails] = useState<{
    message: string
    line: number
    column: number
    snippet: string
  } | null>(null)
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Search/Find States
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchMatches, setSearchMatches] = useState<number[]>([])
  const [activeMatchIndex, setActiveMatchIndex] = useState(-1)

  // Refs for scrolling and textarea manipulation
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const inputGutterRef = useRef<HTMLDivElement>(null)
  const inputTextareaRef = useRef<HTMLTextAreaElement>(null)

  const outputContainerRef = useRef<HTMLDivElement>(null)
  const outputGutterRef = useRef<HTMLDivElement>(null)
  const outputPreRef = useRef<HTMLPreElement>(null)

  // ----------------------------------------------------
  // Sync Scroll Events
  // ----------------------------------------------------
  const handleInputScroll = () => {
    if (inputTextareaRef.current && inputGutterRef.current) {
      inputGutterRef.current.scrollTop = inputTextareaRef.current.scrollTop
    }
  }

  const handleOutputScroll = () => {
    if (outputPreRef.current && outputGutterRef.current) {
      outputGutterRef.current.scrollTop = outputPreRef.current.scrollTop
    }
  }

  // ----------------------------------------------------
  // Statistics Calculations
  // ----------------------------------------------------
  const stats = useMemo(() => {
    const charCount = inputVal.length
    const wordCount = inputVal.trim() ? inputVal.trim().split(/\s+/).length : 0
    // File size in bytes
    const byteSize = new Blob([inputVal]).size
    const sizeFormatted = byteSize > 1024
      ? `${(byteSize / 1024).toFixed(2)} KB`
      : `${byteSize} B`

    return { charCount, wordCount, sizeFormatted }
  }, [inputVal])

  // Get line numbers count
  const inputLineCount = useMemo(() => inputVal.split('\n').length, [inputVal])
  const outputLineCount = useMemo(() => outputVal.split('\n').length, [outputVal])

  // ----------------------------------------------------
  // Advanced Error position parser
  // ----------------------------------------------------
  const parseJSONError = (text: string, err: Error) => {
    let position = -1
    const match = err.message.match(/position (\d+)/i)
    if (match) {
      position = parseInt(match[1], 10)
    }

    // If position not found, check standard browser error strings
    if (position === -1) {
      const positionMatches = [
        /at position (\d+)/,
        /char (\d+)/,
        /column (\d+)/
      ]
      for (const rx of positionMatches) {
        const m = err.message.match(rx)
        if (m) {
          position = parseInt(m[1], 10)
          break
        }
      }
    }

    // Default to end if unspecified
    if (position === -1 || position > text.length) {
      position = Math.max(0, text.length - 1)
    }

    const lines = text.slice(0, position).split('\n')
    const lineNum = lines.length
    const colNum = lines[lines.length - 1].length + 1

    const allLines = text.split('\n')
    const errorLine = allLines[lineNum - 1] || ''
    
    // Build compiler-like snippet
    const maxOffset = 30
    const start = Math.max(0, colNum - maxOffset)
    const end = Math.min(errorLine.length, colNum + maxOffset)
    
    const slice = errorLine.slice(start, end)
    const padding = ' '.repeat(colNum - 1 - start)
    const pointerLine = `${padding}^`

    const snippet = `${slice}\n${pointerLine}`

    return {
      message: err.message.replace(/in JSON at position \d+/i, '').trim(),
      line: lineNum,
      column: colNum,
      snippet
    }
  }

  // ----------------------------------------------------
  // Formatter Core Operations
  // ----------------------------------------------------
  const formatJSON = useCallback((mode: 'beautify' | 'minify' | 'validate', customInput = inputVal) => {
    if (!customInput.trim()) {
      setOutputVal('')
      setValidationStatus(null)
      setErrorDetails(null)
      setProcessingTime(null)
      return
    }

    const startTime = performance.now()
    try {
      const parsed = JSON.parse(customInput)
      
      if (mode === 'beautify') {
        const indent = spacing === 'tab' ? '\t' : Number(spacing)
        setOutputVal(JSON.stringify(parsed, null, indent))
      } else if (mode === 'minify') {
        setOutputVal(JSON.stringify(parsed))
      } else {
        // Validation only
        setOutputVal(JSON.stringify(parsed, null, 2))
      }

      setValidationStatus('success')
      setErrorDetails(null)
      toast(mode === 'validate' ? 'JSON schema is valid!' : 'Formatted successfully!', 'success')
    } catch (err) {
      setValidationStatus('error')
      setOutputVal('')
      if (err instanceof Error) {
        setErrorDetails(parseJSONError(customInput, err))
        toast('Invalid JSON syntax structure', 'error')
      }
    } finally {
      const endTime = performance.now()
      setProcessingTime(Number((endTime - startTime).toFixed(3)))
    }
  }, [inputVal, spacing, toast])

  // Real-time Auto-formatting triggers
  useEffect(() => {
    if (autoFormat) {
      const delayDebounceFn = setTimeout(() => {
        formatJSON('beautify')
      }, 300)
      return () => clearTimeout(delayDebounceFn)
    }
  }, [inputVal, spacing, autoFormat, formatJSON])

  // ----------------------------------------------------
  // Syntax Highlighter (Regex replacement)
  // ----------------------------------------------------
  const highlightedJSON = useMemo(() => {
    if (!outputVal) return ''

    let html = outputVal
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Match JSON syntax parts
    return html.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-amber-500 dark:text-amber-400' // numbers (orange)
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-indigo-600 dark:text-indigo-400 font-semibold' // key (violet)
          } else {
            cls = 'text-emerald-600 dark:text-emerald-400' // string values (green)
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-blue-500 dark:text-blue-400 font-medium' // booleans (blue)
        } else if (/null/.test(match)) {
          cls = 'text-muted-foreground italic' // null (grey)
        }
        return `<span class="${cls}">${match}</span>`
      }
    )
  }, [outputVal])

  // ----------------------------------------------------
  // File Upload & Download
  // ----------------------------------------------------
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setInputVal(text)
      toast(`Loaded file: ${file.name}`, 'success')
      // Trigger formatting immediately
      formatJSON('beautify', text)
    }
    reader.readAsText(file)
  }

  const handleDownload = () => {
    if (!outputVal) return
    const blob = new Blob([outputVal], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'workspace-format.json'
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded JSON file', 'success')
  }

  const handleCopy = () => {
    const val = outputVal || inputVal
    if (!val) return
    navigator.clipboard.writeText(val)
    toast('Copied payload to clipboard', 'success')
  }

  const handleSwap = () => {
    const out = outputVal
    const inp = inputVal
    if (!out) {
      toast('Output must be formatted before swapping', 'info')
      return
    }
    setInputVal(out)
    setOutputVal(inp)
    toast('Swapped inputs and outputs', 'info')
  }

  const loadPreset = (key: keyof typeof SAMPLES) => {
    const raw = JSON.stringify(SAMPLES[key].data, null, 2)
    setInputVal(raw)
    toast(`Loaded template: ${SAMPLES[key].title}`, 'info')
    formatJSON('beautify', raw)
  }

  // ----------------------------------------------------
  // Custom Selection search finder
  // ----------------------------------------------------
  const handleFind = () => {
    if (!searchTerm.trim() || !inputTextareaRef.current) return
    const text = inputVal
    const term = searchTerm.toLowerCase()
    
    // Find all indexes
    const indices: number[] = []
    let idx = text.toLowerCase().indexOf(term)
    while (idx !== -1) {
      indices.push(idx)
      idx = text.toLowerCase().indexOf(term, idx + 1)
    }

    setSearchMatches(indices)
    
    if (indices.length > 0) {
      setActiveMatchIndex(0)
      selectTextIndex(indices[0], term.length)
      toast(`Found ${indices.length} matches`, 'info')
    } else {
      setActiveMatchIndex(-1)
      toast('No match found', 'info')
    }
  }

  const findNext = () => {
    if (searchMatches.length === 0 || !inputTextareaRef.current) return
    const nextIdx = (activeMatchIndex + 1) % searchMatches.length
    setActiveMatchIndex(nextIdx)
    selectTextIndex(searchMatches[nextIdx], searchTerm.length)
  }

  const selectTextIndex = (start: number, length: number) => {
    const textarea = inputTextareaRef.current
    if (!textarea) return
    textarea.focus()
    textarea.setSelectionRange(start, start + length)
    
    // Scroll selection into view manually
    const textUpToSelection = inputVal.slice(0, start)
    const linesCount = textUpToSelection.split('\n').length
    const rowHeight = 20 // Approx height per line
    textarea.scrollTop = Math.max(0, (linesCount - 5) * rowHeight)
  }

  // ----------------------------------------------------
  // Bind Keyboard Shortcuts
  // ----------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Enter to format
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        formatJSON('beautify')
      }
      // Ctrl + Shift + M to minify
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        formatJSON('minify')
      }
      // Ctrl + C to copy when focus is within editors
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        // If selection is not empty, let standard copy happen. Otherwise copy outputs
        if (window.getSelection()?.toString() === '' && outputVal) {
          e.preventDefault()
          handleCopy()
        }
      }
      // Ctrl + F to show search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setShowSearch((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [formatJSON, outputVal])

  return (
    <div
      className={cn(
        "flex flex-col gap-6 w-full",
        isFullscreen && "fixed inset-0 z-50 p-6 bg-background overflow-y-auto"
      )}
    >
      {/* Search Popover panel */}
      {showSearch && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl glass-panel shadow-md max-w-md w-full relative z-10"
        >
          <Search className="h-4 w-4 text-primary shrink-0" />
          <Input
            placeholder="Search key or text value..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFind()}
            className="h-8 py-1"
          />
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className="h-8 px-2.5" onClick={handleFind}>
              Find
            </Button>
            {searchMatches.length > 0 && (
              <Button size="sm" variant="ghost" className="h-8 px-2.5" onClick={findNext}>
                Next ({activeMatchIndex + 1}/{searchMatches.length})
              </Button>
            )}
            <IconButton size="sm" variant="ghost" onClick={() => setShowSearch(false)}>
              <X className="h-4 w-4" />
            </IconButton>
          </div>
        </motion.div>
      )}

      {/* Main Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        {/* Sample selection chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2">Sample Presets:</span>
          {Object.entries(SAMPLES).map(([key, sample]) => (
            <Chip key={key} onClick={() => loadPreset(key as keyof typeof SAMPLES)}>
              {sample.title}
            </Chip>
          ))}
        </div>

        {/* Global Editor configs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Spacing dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Spacing:</span>
            <select
              value={spacing}
              onChange={(e) => setSpacing(e.target.value)}
              className="text-xs font-medium border border-border bg-card rounded-lg px-2.5 py-1.5 focus-ring outline-none"
            >
              {SPACING_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Auto Format Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-muted-foreground select-none">
            <input
              type="checkbox"
              checked={autoFormat}
              onChange={(e) => setAutoFormat(e.target.checked)}
              className="rounded border-border text-primary focus-ring h-4 w-4 cursor-pointer"
            />
            <span>Auto Format</span>
          </label>

          {/* Fullscreen control */}
          <IconButton size="sm" variant="outline" onClick={() => setIsFullscreen((prev) => !prev)}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </IconButton>
        </div>
      </div>

      {/* Dual Column Workspace grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Side: Input Editor Workspace */}
        <Card className="flex flex-col bg-card/45 relative border-border overflow-hidden">
          <CardHeader className="p-4 border-b border-border/40 flex justify-between items-center bg-secondary/15">
            <CardTitle className="font-heading text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
              Input Editor
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* File upload hidden input proxy */}
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border bg-card hover:bg-secondary/40 rounded-lg cursor-pointer transition-colors focus-ring">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept=".json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setInputVal('')}
                disabled={!inputVal}
              >
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex relative min-h-[350px]">
            {/* Scroll-sync line numbers Gutter */}
            <div
              ref={inputGutterRef}
              className="w-12 shrink-0 bg-secondary/20 border-r border-border/40 select-none text-right pr-2 text-[11px] leading-5 text-muted-foreground/35 py-3 font-mono overflow-hidden"
              style={{ height: '350px' }}
            >
              {Array.from({ length: inputLineCount }).map((_, i) => (
                <div key={i} className="h-5">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Input textarea */}
            <textarea
              ref={inputTextareaRef}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onScroll={handleInputScroll}
              placeholder='Paste or upload raw JSON code here e.g. { "key": "value" }'
              className="flex-1 p-3 text-[13px] leading-5 font-mono bg-transparent text-foreground placeholder:text-muted-foreground/45 border-none resize-none focus:outline-none h-[350px] overflow-y-auto"
              spellCheck="false"
            />
          </CardContent>

          {/* Stats Bar */}
          <div className="border-t border-border/40 p-2.5 flex justify-between items-center text-[10px] sm:text-xs text-muted-foreground bg-secondary/10">
            <div className="flex gap-4">
              <span>Lines: <strong className="text-foreground">{inputLineCount}</strong></span>
              <span>Chars: <strong className="text-foreground">{stats.charCount}</strong></span>
              <span>Words: <strong className="text-foreground">{stats.wordCount}</strong></span>
            </div>
            <div>
              <span>Raw Size: <strong className="text-foreground">{stats.sizeFormatted}</strong></span>
            </div>
          </div>
        </Card>

        {/* Right Side: Output Highlighting Panel */}
        <Card className="flex flex-col bg-card/45 relative border-border overflow-hidden">
          <CardHeader className="p-4 border-b border-border/40 flex justify-between items-center bg-secondary/15">
            <CardTitle className="font-heading text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Formatted Output
            </CardTitle>
            
            {/* Actions toolbar */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handleSwap}
                disabled={!outputVal}
                leftIcon={<ArrowLeftRight className="h-3.5 w-3.5" />}
              >
                Swap
              </Button>
              <IconButton
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!outputVal && !inputVal}
                aria-label="Copy to Clipboard"
              >
                <Copy className="h-4 w-4" />
              </IconButton>
              <IconButton
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!outputVal}
                aria-label="Download results file"
              >
                <Download className="h-4 w-4" />
              </IconButton>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex relative min-h-[350px] bg-secondary/5">
            {/* Scroll-sync Gutter */}
            <div
              ref={outputGutterRef}
              className="w-12 shrink-0 bg-secondary/30 border-r border-border/40 select-none text-right pr-2 text-[11px] leading-5 text-muted-foreground/35 py-3 font-mono overflow-hidden"
              style={{ height: '350px' }}
            >
              {Array.from({ length: outputLineCount }).map((_, i) => (
                <div key={i} className="h-5">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Syntax Highlighted read-only pre block */}
            <pre
              ref={outputPreRef}
              onScroll={handleOutputScroll}
              className="flex-1 p-3 text-[13px] leading-5 font-mono overflow-auto h-[350px]"
            >
              <code
                className="block whitespace-pre select-text"
                dangerouslySetInnerHTML={{ __html: highlightedJSON || '<span class="text-muted-foreground/45">JSON Formatter Pro output will render here...</span>' }}
              />
            </pre>
          </CardContent>

          {/* Validation Metrics Footer */}
          <div className="border-t border-border/40 p-2.5 flex justify-between items-center text-xs bg-secondary/10">
            <div className="flex items-center gap-3">
              {validationStatus === 'success' && (
                <span className="flex items-center gap-1.5 text-emerald-500 font-bold uppercase tracking-wider text-[10px]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Syntax Valid
                </span>
              )}
              {validationStatus === 'error' && (
                <span className="flex items-center gap-1.5 text-destructive font-bold uppercase tracking-wider text-[10px]">
                  <AlertCircle className="h-3.5 w-3.5" /> Syntax Invalid
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

      </div>

      {/* Manual Toolbar actions */}
      <div className="flex flex-wrap gap-2.5">
        <Button onClick={() => formatJSON('beautify')} leftIcon={<Play className="h-4 w-4" />}>
          Beautify / Format
        </Button>
        <Button variant="outline" onClick={() => formatJSON('minify')}>
          Minify JSON
        </Button>
        <Button variant="outline" onClick={() => formatJSON('validate')}>
          Validate Syntax
        </Button>
        <Button variant="outline" onClick={() => setShowSearch((p) => !p)} leftIcon={<Search className="h-4 w-4" />}>
          Find in Input
        </Button>
      </div>

      {/* Compiler Diagnostics Alert Card */}
      {validationStatus === 'error' && errorDetails && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-destructive/20 bg-destructive/5 rounded-2xl p-5 text-left flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-heading text-sm font-bold text-destructive">
                Parse Error: {errorDetails.message}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                A syntax violation was parsed at <strong className="text-foreground">Line {errorDetails.line}</strong>, <strong className="text-foreground">Column {errorDetails.column}</strong>.
              </p>
            </div>
          </div>
          <div className="bg-destructive/10 border border-destructive/15 p-4 rounded-xl font-mono text-xs text-destructive leading-normal whitespace-pre-wrap select-text">
            {errorDetails.snippet}
          </div>
        </motion.div>
      )}

      {/* SEO Info Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t border-border/40 pt-8 text-left">
        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-base font-bold">What is JSON Formatter Pro?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            JSON Formatter Pro is a high-performance, developer-focused online sandbox designed to prettify, validate, parse, and compress JSON structures.
          </p>
          <h3 className="font-heading text-base font-bold mt-2">Key Benefits</h3>
          <ul className="list-disc pl-4 space-y-1.5 text-xs sm:text-sm text-muted-foreground">
            <li>100% Client-Side execution. None of your data is sent to external servers.</li>
            <li>Compiler-grade diagnostic tracing highlighting line & column numbers for invalid characters.</li>
            <li>Sync-scrolling gutters with active layout alignments.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-base font-bold">How to Use</h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Paste your raw unformatted string into the Input editor. Standard syntax highlights render instantly on the right. You can select spacing options, search for parameters using <kbd className="bg-secondary px-1 py-0.5 rounded border border-border">Ctrl+F</kbd>, or download file outputs.
          </p>
          <h3 className="font-heading text-base font-bold mt-2">Keyboard Shortcuts</h3>
          <ul className="space-y-1 text-xs sm:text-sm text-muted-foreground font-mono">
            <li><span className="font-bold text-foreground">Ctrl + Enter</span> : Beautify & Format</li>
            <li><span className="font-bold text-foreground">Ctrl + Shift + M</span> : Minify JSON</li>
            <li><span className="font-bold text-foreground">Ctrl + C</span> : Copy Compiled Output</li>
            <li><span className="font-bold text-foreground">Ctrl + F</span> : Find Search Overlay</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
