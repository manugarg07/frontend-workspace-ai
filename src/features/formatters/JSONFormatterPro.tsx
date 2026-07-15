import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Play,
  AlertCircle,
  Sparkles,
  Code,
  Share2,
  Eye,
  Cpu,
  ArrowLeftRight
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { CodeEditorWrapper } from '@/components/ui/CodeEditorWrapper'
import { FileUpload } from '@/components/ui/FileUpload'
import { Toolbar } from '@/components/ui/Toolbar'
import { ResultPanel } from '@/components/ui/ResultPanel'
import { ToolLayout } from '@/components/common/ToolLayout'
import type { OptionTab } from '@/components/common/ToolLayout'
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

const SPACING_OPTIONS = [
  { id: '2', label: '2 Spaces', value: 2 },
  { id: '4', label: '4 Spaces', value: 4 },
  { id: 'tab', label: 'Tab Indent', value: '\t' },
]

export function JSONFormatterPro() {
  const { toast } = useToast()

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

  // ----------------------------------------------------
  // Statistics Calculations
  // ----------------------------------------------------
  const stats = useMemo(() => {
    const charCount = inputVal.length
    const wordCount = inputVal.trim() ? inputVal.trim().split(/\s+/).length : 0
    const byteSize = new Blob([inputVal]).size
    const sizeFormatted = byteSize > 1024
      ? `${(byteSize / 1024).toFixed(2)} KB`
      : `${byteSize} B`

    return { charCount, wordCount, sizeFormatted }
  }, [inputVal])

  const inputLineCount = useMemo(() => inputVal.split('\n').length, [inputVal])

  // Error position parser
  const parseJSONError = (text: string, err: Error) => {
    let position = -1
    const match = err.message.match(/position (\d+)/i)
    if (match) {
      position = parseInt(match[1], 10)
    }

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

    if (position === -1 || position > text.length) {
      position = Math.max(0, text.length - 1)
    }

    const lines = text.slice(0, position).split('\n')
    const lineNum = lines.length
    const colNum = lines[lines.length - 1].length + 1

    const allLines = text.split('\n')
    const errorLine = allLines[lineNum - 1] || ''
    
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

  // Core Formatting Logic
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
    } catch (err) {
      setValidationStatus('error')
      setOutputVal('')
      if (err instanceof Error) {
        setErrorDetails(parseJSONError(customInput, err))
      }
    } finally {
      const endTime = performance.now()
      setProcessingTime(Number((endTime - startTime).toFixed(3)))
    }
  }, [inputVal, spacing])

  // Real-time Auto-formatting triggers
  useEffect(() => {
    if (autoFormat) {
      const delayDebounceFn = setTimeout(() => {
        formatJSON('beautify')
      }, 300)
      return () => clearTimeout(delayDebounceFn)
    }
  }, [inputVal, spacing, autoFormat, formatJSON])

  const handleFileLoaded = (text: string, filename: string) => {
    setInputVal(text)
    toast(`Loaded: ${filename}`, 'success')
    formatJSON('beautify', text)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      handleFileLoaded(text, file.name)
    }
    reader.readAsText(file)
  }

  const handleDownload = () => {
    if (!outputVal) return
    const blob = new Blob([outputVal], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'formatted.json'
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

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputVal(text)
      toast('Pasted from clipboard', 'success')
      formatJSON('beautify', text)
    } catch {
      toast('Clipboard permission blocked. Use Ctrl+V inside the editor.', 'error')
    }
  }

  const loadPreset = (key: string) => {
    const raw = JSON.stringify(SAMPLES[key as keyof typeof SAMPLES].data, null, 2)
    setInputVal(raw)
    toast(`Loaded template: ${SAMPLES[key as keyof typeof SAMPLES].title}`, 'info')
    formatJSON('beautify', raw)
  }

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        formatJSON('beautify')
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        formatJSON('minify')
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (window.getSelection()?.toString() === '' && outputVal) {
          e.preventDefault()
          handleCopy()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [formatJSON, outputVal])

  // Spacing options templates
  const spacingSamples = useMemo(() => {
    const obj: { [key: string]: { title: string; data: any } } = {}
    Object.entries(SAMPLES).forEach(([key, value]) => {
      obj[key] = { title: value.title, data: JSON.stringify(value.data, null, 2) }
    })
    return obj
  }, [])

  // Options tabs
  const optionTabs: OptionTab[] = [
    {
      id: 'options',
      label: 'Formatting Settings',
      icon: <ArrowLeftRight className="h-3.5 w-3.5" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Indentation Spacing
            </label>
            <div className="flex items-center gap-2">
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
            <p className="text-xs text-muted-foreground/60 leading-normal">
              Select spacing width or tab markers. Updates rendering immediately.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Execution Control
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-muted-foreground select-none">
                <input
                  type="checkbox"
                  checked={autoFormat}
                  onChange={(e) => setAutoFormat(e.target.checked)}
                  className="rounded border-border text-primary focus-ring h-4.5 w-4.5 cursor-pointer"
                />
                <span>Auto-Format compilation on input changes</span>
              </label>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'actions',
      label: 'Compactor Actions',
      icon: <Cpu className="h-3.5 w-3.5" />,
      content: (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Advanced Compactor Actions</h4>
          <p className="text-xs text-muted-foreground leading-normal">
            Directly compress the JSON text format or trigger immediate syntax validation check.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Button size="sm" variant="outline" onClick={() => formatJSON('beautify')}>
              Beautify Format
            </Button>
            <Button size="sm" variant="outline" onClick={() => formatJSON('minify')}>
              Minify JSON
            </Button>
            <Button size="sm" variant="outline" onClick={() => formatJSON('validate')}>
              Validate Schema
            </Button>
          </div>
        </div>
      )
    }
  ]

  // FAQs Accordion
  const faqItems = [
    {
      id: 'json-faq-1',
      title: 'How does JSON Formatter Pro work?',
      content: (
        <span>
          The tool parses your input string using client-side JavaScript <code>JSON.parse()</code>. If valid, it reformats it according to your selected indentation spacing. If invalid, it catches the exception and outputs syntax details showing exactly what character caused the issue.
        </span>
      )
    },
    {
      id: 'json-faq-2',
      title: 'Is my data secure?',
      content: (
        <span>
          Yes, all formatting and linting occur client-side inside your browser sandbox. No data is sent over the network, ensuring private system logs or production config objects remain completely confidential.
        </span>
      )
    },
    {
      id: 'json-faq-3',
      title: 'Can I minify my JSON?',
      content: (
        <span>
          Yes! Select the Minify action in the Toolbar or within the options to compress JSON data into a single-line string with all whitespace removed.
        </span>
      )
    }
  ]

  return (
    <FileUpload onFileLoaded={handleFileLoaded} accept=".json,.txt">
      <ToolLayout
        toolSlug="json-formatter"
        toolbar={
          <Toolbar
            onPaste={handlePaste}
            onUpload={handleFileUpload}
            uploadAccept=".json,.txt"
            samples={spacingSamples}
            onLoadSample={loadPreset}
            onConvert={() => formatJSON('beautify')}
            convertLabel="Beautify JSON"
            onCopy={handleCopy}
            copyDisabled={!outputVal && !inputVal}
            onDownload={handleDownload}
            downloadDisabled={!outputVal}
            onClear={() => { setInputVal(''); setOutputVal(''); setValidationStatus(null); setErrorDetails(null); }}
            clearDisabled={!inputVal && !outputVal}
          />
        }
        editorSection={
          <div className="flex flex-col gap-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
              {/* Input card */}
              <div className="lg:col-span-6 flex flex-col">
                <CodeEditorWrapper
                  language="json"
                  value={inputVal}
                  onChange={setInputVal}
                  placeholder="Paste or upload raw JSON code here..."
                />
              </div>

              {/* Output card */}
              <div className="lg:col-span-6 flex flex-col">
                <ResultPanel
                  title="Formatted Output"
                  value={outputVal}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  validationStatus={validationStatus}
                  processingTime={processingTime}
                >
                  <CodeEditorWrapper
                    language="json"
                    value={outputVal}
                    readOnly={true}
                  />
                </ResultPanel>
              </div>
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
                <div className="bg-black/30 border border-destructive/15 p-4 rounded-xl font-mono text-xs text-destructive leading-normal whitespace-pre-wrap select-text">
                  {errorDetails.snippet}
                </div>
              </motion.div>
            )}
          </div>
        }
        optionTabs={optionTabs}
        faqs={faqItems}
        instructionsTitle="What is JSON Formatter Pro?"
        instructions={
          <div className="flex flex-col gap-3">
            <p>
              JSON Formatter Pro is a high-performance, developer-focused online sandbox designed to prettify, validate, parse, and compress JSON structures.
            </p>
            <p className="text-xs text-muted-foreground">
              Paste your raw unformatted string into the Input editor. Standard syntax highlights render instantly on the right. You can select spacing options, search for parameters, or download file outputs.
            </p>
          </div>
        }
        benefits={[
          "100% Client-Side execution. None of your data is sent to external servers.",
          "Compiler-grade diagnostic tracing highlighting line & column numbers for invalid characters.",
          "Gutter-numbered code editors with dark/light themes and word wrapping support."
        ]}
      />
    </FileUpload>
  )
}
