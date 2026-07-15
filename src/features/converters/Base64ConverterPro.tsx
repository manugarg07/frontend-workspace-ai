import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Sparkles,
  Code,
  Share2,
  Eye,
  Cpu,
  ArrowLeftRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { CodeEditorWrapper } from '@/components/ui/CodeEditorWrapper'
import { FileUpload } from '@/components/ui/FileUpload'
import { Toolbar } from '@/components/ui/Toolbar'
import { ResultPanel } from '@/components/ui/ResultPanel'
import { ToolLayout } from '@/components/common/ToolLayout'
import type { OptionTab } from '@/components/common/ToolLayout'
import { cn } from '@/lib/utils'

// Predefined Base64 sample presets
const SAMPLES = {
  text: {
    title: 'Plain Text Sample',
    data: 'Welcome to Frontend Workspace AI! Prettify formatting, convert syntax loops, and inspect tokens secure offline.'
  },
  base64: {
    title: 'Encoded Base64 Sample',
    data: 'V2VsY29tZSB0byBGcm9udGVuZCBXb3Jrc3BhY2UgQUkhIFByZXR0aWZ5IGZvcm1hdHRpbmcsIGNvbnZlcnQgc3ludGF4IGxvb3BzLCBhbmQgaW5zcGVjdCB0b2tlbnMgc2VjdXJlIG9mZmxpbmUu'
  }
}

export function Base64ConverterPro() {
  const { toast } = useToast()

  // State Management
  const [inputVal, setInputVal] = useState('')
  const [outputVal, setOutputVal] = useState('')
  const [autoConvert, setAutoConvert] = useState(true)
  const [validationStatus, setValidationStatus] = useState<null | 'success' | 'warning' | 'error'>(null)
  const [validationMessage, setValidationMessage] = useState('')
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Options Settings
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [urlSafe, setUrlSafe] = useState(false)

  // Base64 helper methods
  const base64UrlEncode = (str: string): string => {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  const base64UrlDecode = (str: string): string => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    return decodeURIComponent(escape(atob(base64)))
  }

  // Conversion Pipeline
  const handleConvert = useCallback((customInput = inputVal) => {
    if (!customInput.trim()) {
      setOutputVal('')
      setValidationStatus(null)
      setValidationMessage('')
      setProcessingTime(null)
      return
    }

    setIsProcessing(true)
    const startTime = performance.now()

    try {
      if (mode === 'encode') {
        let encoded = ''
        if (urlSafe) {
          encoded = base64UrlEncode(customInput)
        } else {
          encoded = btoa(unescape(encodeURIComponent(customInput)))
        }
        setOutputVal(encoded)
        setValidationStatus('success')
        setValidationMessage('Text successfully encoded into Base64 format!')
      } else {
        let decoded = ''
        // Normalize input base64 string
        let cleanBase64 = customInput.trim()
        
        if (urlSafe) {
          decoded = base64UrlDecode(cleanBase64)
        } else {
          // Fallback decodes standard
          decoded = decodeURIComponent(escape(atob(cleanBase64)))
        }
        setOutputVal(decoded)
        setValidationStatus('success')
        setValidationMessage('Base64 string successfully decoded into plain text!')
      }
    } catch {
      setValidationStatus('error')
      setValidationMessage('Parser Exception: The input string is not a valid Base64 encoded payload.')
      setOutputVal('')
    } finally {
      const endTime = performance.now()
      setProcessingTime(Number((endTime - startTime).toFixed(3)))
      setIsProcessing(false)
    }
  }, [inputVal, mode, urlSafe])

  // Debounced auto-convert trigger
  useEffect(() => {
    if (autoConvert) {
      const delay = setTimeout(() => {
        handleConvert()
      }, 250)
      return () => clearTimeout(delay)
    }
  }, [inputVal, mode, urlSafe, autoConvert, handleConvert])

  // File Handlers
  const handleFileLoaded = (text: string, filename: string) => {
    setInputVal(text)
    toast(`Loaded: ${filename}`, 'success')
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
    const blob = new Blob([outputVal], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = mode === 'encode' ? 'encoded-base64.txt' : 'decoded-plain.txt'
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded result file', 'success')
  }

  const handleCopy = () => {
    const value = outputVal || inputVal
    if (!value) return
    navigator.clipboard.writeText(value)
    toast('Copied payload to clipboard!', 'success')
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputVal(text)
      toast('Pasted from clipboard', 'success')
    } catch {
      toast('Clipboard permission blocked. Use Ctrl+V inside the editor.', 'error')
    }
  }

  const loadPreset = (key: string) => {
    setInputVal(SAMPLES[key as keyof typeof SAMPLES].data)
    setMode(key === 'base64' ? 'decode' : 'encode')
    toast(`Loaded preset: ${SAMPLES[key as keyof typeof SAMPLES].title}`, 'info')
  }

  // Preset Spacing Options
  const presetsSamples = useMemo(() => {
    const obj: { [key: string]: { title: string; data: any } } = {}
    Object.entries(SAMPLES).forEach(([key, value]) => {
      obj[key] = { title: value.title, data: value.data }
    })
    return obj
  }, [])

  // Options tabs
  const optionTabs: OptionTab[] = [
    {
      id: 'options',
      label: 'Conversion Settings',
      icon: <ArrowLeftRight className="h-3.5 w-3.5" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Operation Mode
            </label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none">
                <input
                  type="radio"
                  name="convertMode"
                  checked={mode === 'encode'}
                  onChange={() => setMode('encode')}
                  className="accent-primary cursor-pointer h-4 w-4"
                />
                <span>Encode (Text → Base64)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none">
                <input
                  type="radio"
                  name="convertMode"
                  checked={mode === 'decode'}
                  onChange={() => setMode('decode')}
                  className="accent-primary cursor-pointer h-4 w-4"
                />
                <span>Decode (Base64 → Text)</span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Format Specifications
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-muted-foreground select-none">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(e) => setUrlSafe(e.target.checked)}
                  className="rounded border-border text-primary focus-ring h-4.5 w-4.5 cursor-pointer"
                />
                <span>Use URL-Safe Base64 (RFC 4648)</span>
              </label>
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-normal">
              URL-safe formats replace <code>+</code> with <code>-</code> and <code>/</code> with <code>_</code>, removing trailing padding equal signs.
            </p>
          </div>
        </div>
      )
    }
  ]

  // FAQs
  const faqItems = [
    {
      id: 'b64-faq-1',
      title: 'What is Base64 encoding?',
      content: (
        <span>
          Base64 encoding schemes represent binary data in an ASCII string format by translating it into a radix-64 representation. This is commonly used to transfer files or secrets safely across protocols like HTTP or SMTP.
        </span>
      )
    },
    {
      id: 'b64-faq-2',
      title: 'Is this Base64 tool safe to use with private keys?',
      content: (
        <span>
          Yes. The encoder executes entirely client-side using JavaScript APIs. None of your data is sent to external servers, making it completely secure for processing access tokens or private API keys.
        </span>
      )
    }
  ]

  return (
    <FileUpload onFileLoaded={handleFileLoaded} accept=".txt">
      <ToolLayout
        toolSlug="base64-converter"
        toolbar={
          <Toolbar
            onPaste={handlePaste}
            onUpload={handleFileUpload}
            uploadAccept=".txt"
            samples={presetsSamples}
            onLoadSample={loadPreset}
            onConvert={() => handleConvert()}
            convertLabel={mode === 'encode' ? 'Encode Text' : 'Decode Base64'}
            onCopy={handleCopy}
            copyDisabled={!outputVal}
            onDownload={handleDownload}
            downloadDisabled={!outputVal}
            onClear={() => { setInputVal(''); setOutputVal(''); setValidationStatus(null); setValidationMessage(''); }}
            clearDisabled={!inputVal && !outputVal}
          />
        }
        editorSection={
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
            {/* Input card */}
            <div className="lg:col-span-6 flex flex-col">
              <CodeEditorWrapper
                language="markdown"
                value={inputVal}
                onChange={setInputVal}
                placeholder={mode === 'encode' ? 'Type or paste plain text here...' : 'Paste your base64 string here...'}
              />
            </div>
            
            {/* Output card */}
            <div className="lg:col-span-6 flex flex-col">
              <ResultPanel
                title={mode === 'encode' ? 'Base64 Encoded Output' : 'Plain Text Decoded Output'}
                value={outputVal}
                onCopy={handleCopy}
                onDownload={handleDownload}
                validationStatus={validationStatus}
                validationMessage={validationMessage}
                processingTime={processingTime}
              >
                <CodeEditorWrapper
                  language="markdown"
                  value={outputVal}
                  readOnly={true}
                />
              </ResultPanel>
            </div>
          </div>
        }
        optionTabs={optionTabs}
        faqs={faqItems}
        instructionsTitle="Base64 Encoding & Decoding Guide"
        instructions={
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground list-none pl-0">
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">1</span>
              <span>Select the operation mode (Encode vs Decode) and option toggles inside the settings panel.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">2</span>
              <span>Paste input streams directly in the left editor or upload text files.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">3</span>
              <span>The compiler returns the translated string in real-time. Copy or download the compiled payload.</span>
            </li>
          </ul>
        }
        benefits={[
          "Instant client-side encoding & decoding utilizing secure local execution contexts.",
          "Supports URL-safe RFC 4648 encoding configurations.",
          "Allows uploading files and downloading outputs cleanly."
        ]}
      />
    </FileUpload>
  )
}
