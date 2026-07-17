import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Link2,
  Copy,
  Check,
  Download,
  Trash2,
  RefreshCw,
  Info,
  ShieldAlert,
  Sliders,
  Sparkles,
  Lock,
  Clock,
  ArrowRightLeft,
  Upload,
  FileText,
  HelpCircle,
  HelpCircleIcon
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { CodeEditorWrapper } from '@/components/ui/CodeEditorWrapper'
import { FileUpload } from '@/components/ui/FileUpload'
import { Toolbar } from '@/components/ui/Toolbar'
import { ToolLayout } from '@/components/common/ToolLayout'
import { cn } from '@/lib/utils'

// Predefined URL presets
const SAMPLES = {
  rawUrl: {
    title: 'Raw URL with Queries',
    data: 'https://search.api.com/v1/query?q=frontend workspace & dev tools&tags=[react,typescript]&active=true&session=🔥-active'
  },
  encodedUrl: {
    title: 'Encoded Percent String',
    data: 'https%3A%2F%2Fsearch.api.com%2Fv1%2Fquery%3Fq%3Dfrontend%20workspace%20%26%20dev%20tools%26tags%3D%5Breact%2Ctypescript%5D%26active%3Dtrue%26session%3D%F0%9F%94%A5-active'
  },
  pathUnicode: {
    title: 'Path with Unicode & Emojis',
    data: 'https://workspace.ai/categories/🚀-product-launch/user/manu-garg?status=active&verified=yes'
  }
}

export function URLEncoderPro() {
  const { toast } = useToast()

  // 1. Load preferences from Local Storage
  const [mode, setMode] = useState<'encode' | 'decode'>(() => {
    try {
      const saved = localStorage.getItem('url-pref-mode')
      return (saved as 'encode' | 'decode') || 'encode'
    } catch {
      return 'encode'
    }
  })

  const [autoDetect, setAutoDetect] = useState<boolean>(() => {
    try {
      return localStorage.getItem('url-pref-autodetect') !== 'false' // default true
    } catch {
      return true
    }
  })

  const [liveConvert, setLiveConvert] = useState<boolean>(() => {
    try {
      return localStorage.getItem('url-pref-live') !== 'false' // default true
    } catch {
      return true
    }
  })

  // Value states
  const [inputVal, setInputVal] = useState('')
  const [outputVal, setOutputVal] = useState('')
  const [errorState, setErrorState] = useState<string | null>(null)
  
  // Interactive copy states
  const [copiedInput, setCopiedInput] = useState(false)
  const [copiedOutput, setCopiedOutput] = useState(false)
  const [processingTime, setProcessingTime] = useState<number | null>(null)

  // Cache settings
  useEffect(() => {
    try {
      localStorage.setItem('url-pref-mode', mode)
      localStorage.setItem('url-pref-autodetect', String(autoDetect))
      localStorage.setItem('url-pref-live', String(liveConvert))
    } catch (e) {
      console.warn(e)
    }
  }, [mode, autoDetect, liveConvert])

  // Strict RFC 3986 encoder (percent encodes standard plus ! ' ( ) * characters)
  const rfc3986Encode = (str: string): string => {
    return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase()
    })
  }

  // Decodes percent sequence and handles plus as space
  const rfc3986Decode = (str: string): string => {
    return decodeURIComponent(str.replace(/\+/g, ' '))
  }

  // Core conversion loop
  const handleConvert = useCallback((customInput = inputVal, customMode = mode) => {
    if (!customInput.trim()) {
      setOutputVal('')
      setErrorState(null)
      setProcessingTime(null)
      return
    }

    const startTime = performance.now()
    
    // 1. Auto detect logic
    let activeMode = customMode
    if (autoDetect) {
      const percentSequenceRegex = /%[0-9a-fA-F]{2}/
      const isEncoded = percentSequenceRegex.test(customInput)
      activeMode = isEncoded ? 'decode' : 'encode'
      setMode(activeMode)
    }

    try {
      if (activeMode === 'encode') {
        setOutputVal(rfc3986Encode(customInput))
        setErrorState(null)
      } else {
        setOutputVal(rfc3986Decode(customInput))
        setErrorState(null)
      }
    } catch (e) {
      setErrorState(
        e instanceof URIError 
          ? 'Malformed URL Input: Invalid percent-escape sequence (e.g. unmatched % symbols).' 
          : (e as Error).message
      )
      setOutputVal('')
    } finally {
      setProcessingTime(performance.now() - startTime)
    }
  }, [inputVal, mode, autoDetect])

  // Live conversion reactive hooks
  useEffect(() => {
    if (liveConvert) {
      handleConvert()
    }
  }, [inputVal, mode, autoDetect, liveConvert, handleConvert])

  // Input drag-and-drop triggers
  const handleFileLoaded = (text: string, filename: string) => {
    setInputVal(text)
    toast(`Loaded file: ${filename}`, 'success')
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

  // Swapping input & output content (very helpful for testing double cycles)
  const handleSwap = () => {
    if (!outputVal && !inputVal) return
    const prevInput = inputVal
    const prevOutput = outputVal
    
    // Disable auto-detect briefly to force mode toggle
    const currentAutoDetect = autoDetect
    if (currentAutoDetect) {
      setAutoDetect(false)
    }
    
    setInputVal(prevOutput)
    setOutputVal(prevInput)
    setMode(mode === 'encode' ? 'decode' : 'encode')
    
    toast('Swapped inputs & outputs', 'info')
  }

  // Clear triggers
  const handleClear = () => {
    setInputVal('')
    setOutputVal('')
    setErrorState(null)
    setProcessingTime(null)
    toast('Cleared workspaces', 'info')
  }

  // Copy operations
  const handleCopyInput = () => {
    navigator.clipboard.writeText(inputVal)
    setCopiedInput(true)
    toast('Copied raw input', 'success')
    setTimeout(() => setCopiedInput(false), 1500)
  }

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(outputVal)
    setCopiedOutput(true)
    toast('Copied converted output', 'success')
    setTimeout(() => setCopiedOutput(false), 1500)
  }

  // Downloads TXT
  const downloadOutput = () => {
    if (!outputVal) return
    const blob = new Blob([outputVal], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `url-${mode}d.txt`
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded result TXT', 'success')
  }

  // Presets load helper
  const loadPreset = (key: string) => {
    const sample = SAMPLES[key as keyof typeof SAMPLES]
    setInputVal(sample.data)
    toast(`Loaded preset URL`, 'info')
  }

  // UTF-8 Byte Size calculators
  const getByteSize = (str: string): string => {
    try {
      const bytes = new Blob([str]).size
      if (bytes >= 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`
      }
      return `${bytes} Bytes`
    } catch {
      return '0 Bytes'
    }
  }

  const presetsSamples = useMemo(() => {
    const obj: { [key: string]: { title: string; data: any } } = {}
    Object.entries(SAMPLES).forEach(([key, value]) => {
      obj[key] = { title: value.title, data: value.data }
    })
    return obj
  }, [])

  const faqItems = [
    {
      id: 'url-faq-1',
      title: 'What is URL Encoding (Percent Encoding)?',
      content: (
        <span className="font-sans">
          URL encoding converts characters into format-compliant representations that can be transmitted securely over the internet. It translates non-ASCII characters and delimiters (like spaces, `&`, `?`, `=`) into `%` followed by their hex values (e.g. space becomes `%20`).
        </span>
      )
    },
    {
      id: 'url-faq-2',
      title: 'What characters are encoded under RFC 3986?',
      content: (
        <span className="font-sans">
          RFC 3986 specifies that unreserved characters (`A-Z`, `a-z`, `0-9`, `-`, `_`, `.`, `~`) never need to be encoded. Delimiters and reserved query markers (like `!`, `'`, `(`, `)`, `*`) are encoded to prevent string splits in API gateways.
        </span>
      )
    },
    {
      id: 'url-faq-3',
      title: 'How does Auto-Detect Mode work?',
      content: (
        <span className="font-sans">
          Auto-Detect runs a check over your input string for standard percent-encoding markers (like `%20` or `%3A`). If found, it automatically sets the mode to **Decode**; otherwise, it defaults to **Encode**.
        </span>
      )
    }
  ]

  return (
    <FileUpload onFileLoaded={handleFileLoaded} accept=".txt">
      <ToolLayout
        toolSlug="url-encoder"
        extraSEOProps={{
          title: "URL Encoder & Decoder - Percent Encoding Tool - Frontend Workspace AI",
          description: "Encode or decode strings using standard RFC 3986 percent-encoding instantly online. Supports live conversions, auto-detection, copy/paste, file upload, and character size statistics."
        }}
        toolbar={
          <Toolbar
            onPaste={async () => {
              try {
                const text = await navigator.clipboard.readText()
                setInputVal(text)
                toast('Pasted from clipboard', 'success')
              } catch {
                toast('Clipboard permission blocked', 'error')
              }
            }}
            onUpload={handleFileUpload}
            uploadAccept=".txt"
            samples={presetsSamples}
            onLoadSample={loadPreset}
            onConvert={() => handleConvert()}
            convertLabel="Convert URL"
            onCopy={handleCopyOutput}
            copyDisabled={!outputVal}
            onDownload={downloadOutput}
            downloadDisabled={!outputVal}
            onClear={handleClear}
            clearDisabled={!inputVal && !outputVal}
          />
        }
        editorSection={
          <div className="flex flex-col gap-6 w-full text-left font-sans">
            
            {/* Top Privacy banner notice */}
            <Card className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 select-none">
              <CardContent className="p-4 flex items-start gap-3">
                <Lock className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  All encoding and decoding happens locally in your browser. No data is transmitted to any server.
                </div>
              </CardContent>
            </Card>

            {/* Inputs & Parameters Layout grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
              
              {/* Left Column: Input Panel & Settings (Col 6) */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <Card className="border-border bg-card/45 flex flex-col justify-between flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-heading flex items-center justify-between">
                      <span>Input String</span>
                      
                      {/* Configuration selectors */}
                      <div className="flex items-center gap-1.5 select-none">
                        <button
                          onClick={() => { setAutoDetect(false); setMode('encode'); }}
                          className={cn("px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer",
                            !autoDetect && mode === 'encode' 
                              ? 'bg-primary/10 text-primary border-primary/20' 
                              : 'bg-background text-muted-foreground border-border/50'
                          )}
                          aria-label="Set manual encoding mode"
                        >
                          Encode
                        </button>
                        <button
                          onClick={() => { setAutoDetect(false); setMode('decode'); }}
                          className={cn("px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer",
                            !autoDetect && mode === 'decode' 
                              ? 'bg-primary/10 text-primary border-primary/20' 
                              : 'bg-background text-muted-foreground border-border/50'
                          )}
                          aria-label="Set manual decoding mode"
                        >
                          Decode
                        </button>
                        <button
                          onClick={() => setAutoDetect(!autoDetect)}
                          className={cn("px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer",
                            autoDetect 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : 'bg-background text-muted-foreground border-border/50'
                          )}
                          aria-label="Toggle Auto-detect Mode"
                        >
                          Auto
                        </button>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-xs">Type or upload string parameters.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4 flex-grow flex flex-col justify-between">
                    
                    {/* Drag and Drop Zone */}
                    {!inputVal && (
                      <div className="border-2 border-dashed border-border/80 hover:border-primary/50 transition-all rounded-xl p-5 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 bg-secondary/10 select-none">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground">Drag & Drop text file here</span>
                        <span className="text-[10px] text-muted-foreground">Or copy-paste queries directly</span>
                      </div>
                    )}

                    <CodeEditorWrapper
                      language="markdown"
                      value={inputVal}
                      onChange={setInputVal}
                      placeholder="Paste your raw text query or encoded percentage string here..."
                      height={inputVal ? "220px" : "150px"}
                    />

                    {/* Input statistics bar */}
                    {inputVal && (
                      <div className="grid grid-cols-2 gap-3 text-[10px] text-muted-foreground font-mono bg-secondary/20 p-2 rounded-lg select-none border border-border/30">
                        <div>Characters: <span className="font-bold text-foreground">{inputVal.length}</span></div>
                        <div>Size: <span className="font-bold text-foreground">{getByteSize(inputVal)}</span></div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Conversion options toggles */}
                <Card className="border-border bg-card/65 font-sans select-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-heading flex items-center gap-1.5">
                      <Sliders className="h-4 w-4 text-primary" /> Conversion Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Live Convert check */}
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground transition-all">
                      <input
                        type="checkbox"
                        checked={liveConvert}
                        onChange={(e) => setLiveConvert(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                      />
                      <span>Live Conversion (Convert as you type)</span>
                    </label>

                    {/* Convert buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSwap}
                        leftIcon={<ArrowRightLeft className="h-3.5 w-3.5" />}
                        disabled={!inputVal && !outputVal}
                        className="text-xs font-semibold cursor-pointer"
                        aria-label="Swap input and output content"
                      >
                        Swap
                      </Button>
                      
                      {!liveConvert && (
                        <Button
                          size="sm"
                          onClick={() => handleConvert()}
                          className="text-xs font-semibold cursor-pointer"
                          aria-label="Convert URL string manual trigger"
                        >
                          Convert
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Output Panel & Status (Col 6) */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <Card className="border-border bg-card/65 flex flex-col flex-1">
                  <div className="px-4 py-2 border-b border-border/40 bg-secondary/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase font-heading tracking-wider flex items-center gap-1">
                      Converted Result ({mode === 'encode' ? 'Encoded' : 'Decoded'})
                    </span>
                    
                    {outputVal && (
                      <div className="flex gap-2">
                        <button onClick={handleCopyOutput} className="text-primary hover:underline text-[9px] uppercase font-bold flex items-center gap-1 cursor-pointer">
                          {copiedOutput ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />} Copy
                        </button>
                        <span className="text-muted-foreground/30">|</span>
                        <button onClick={downloadOutput} className="text-primary hover:underline text-[9px] uppercase font-bold flex items-center gap-1 cursor-pointer">
                          <Download className="h-2.5 w-2.5" /> Download
                        </button>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-4 flex-grow flex flex-col justify-between">
                    
                    {/* Error Alerts */}
                    {errorState && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg flex items-start gap-2 font-mono">
                        <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                        <span>{errorState}</span>
                      </div>
                    )}

                    {/* Compiled output block */}
                    <div className="flex-grow flex flex-col">
                      <CodeEditorWrapper
                        language="markdown"
                        value={outputVal}
                        readOnly={true}
                        placeholder="Converted URL result will display here..."
                        height={outputVal ? "220px" : "150px"}
                      />
                    </div>

                    {/* Output statistics bar */}
                    {outputVal && (
                      <div className="grid grid-cols-3 gap-3 text-[10px] text-muted-foreground font-mono bg-secondary/20 p-2 rounded-lg select-none border border-border/30">
                        <div>Characters: <span className="font-bold text-foreground">{outputVal.length}</span></div>
                        <div>Size: <span className="font-bold text-foreground">{getByteSize(outputVal)}</span></div>
                        <div>Speed: <span className="font-bold text-primary">{processingTime ? `${processingTime.toFixed(2)} ms` : '0 ms'}</span></div>
                      </div>
                    )}

                  </CardContent>
                </Card>
              </div>

            </div>

          </div>
        }
        faqs={faqItems}
        instructionsTitle="URL Encoding Guide"
        instructions={
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed font-sans">
                   {/* What is URL encoding */}
            <div className="space-y-2">
              <h3 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
                <Link2 className="h-4.5 w-4.5 text-primary" /> What is URL Encoding?
              </h3>
              <p>
                URL encoding (Percent encoding) is a standard mechanism defined in RFC 3986. It converts characters containing special meanings (like space delimiters or query dividers) into compliant percentage sequences so URIs can traverse HTTP networks securely.
              </p>
            </div>

            {/* Reserved characters explained */}
            <div className="space-y-2">
              <h3 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
                <Info className="h-4.5 w-4.5 text-primary" /> Reserved vs Unreserved Characters
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong className="text-foreground">Unreserved:</strong> `A-Z`, `a-z`, `0-9`, `-`, `_`, `.`, and `~`. These characters are safe to transmit raw without encoding.</li>
                <li><strong className="text-foreground">Reserved:</strong> Characters like `?`, `&`, `=`, `+`, `/`, `:`, and `#`. These serve structural purposes inside URL routers and query lines, so they must be encoded to `%XX` (e.g. space to `%20` or ampersand to `%26`) when placed inside query values.</li>
              </ul>
            </div>

            {/* URL Encoding Examples */}
            <div className="space-y-2">
              <h3 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-primary" /> Common Percent-Encoding Examples
              </h3>
              <table className="w-full text-xs text-left border-collapse min-w-[280px]">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground font-bold uppercase tracking-wider">
                    <th className="py-1 px-2">Character</th>
                    <th className="py-1 px-2">Percent Code</th>
                    <th className="py-1 px-2">Common Use Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 font-mono">
                  <tr>
                    <td className="py-1.5 px-2 text-foreground font-bold">Space</td>
                    <td className="py-1.5 px-2 text-primary font-bold">%20 or +</td>
                    <td className="py-1.5 px-2 text-muted-foreground font-sans">Query strings spaces</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 text-foreground font-bold">&</td>
                    <td className="py-1.5 px-2 text-primary font-bold">%26</td>
                    <td className="py-1.5 px-2 text-muted-foreground font-sans">Query parameter separators</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 text-foreground font-bold">=</td>
                    <td className="py-1.5 px-2 text-primary font-bold">%3D</td>
                    <td className="py-1.5 px-2 text-muted-foreground font-sans">Query key-value binder</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 text-foreground font-bold">?</td>
                    <td className="py-1.5 px-2 text-primary font-bold">%3F</td>
                    <td className="py-1.5 px-2 text-muted-foreground font-sans">URL query start identifier</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Best practices */}
            <div className="space-y-2">
              <h3 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
                <Sliders className="h-4.5 w-4.5 text-primary" /> URL Best Practices
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong className="text-foreground">Never encode the entire URL:</strong> Encoding complete URL schemes (like `https://...`) turns structural symbols like `/` and `:` into percent codes, rendering the path unresolvable. Only encode parameter keys and values.</li>
                <li><strong className="text-foreground">Validate escape sequences:</strong> Catch missing values or invalid hex codes (e.g. `%G1`) during decodes to prevent application crashes.</li>
              </ul>
            </div>

          </div>
        }
        benefits={[
          "RFC 3986 Compliant: Safely percent-encodes and decodes structural tokens.",
          "Live statistics panel: Computes UTF-8 byte weights and character lengths.",
          "Local processing: 100% offline conversions secure query credentials."
        ]}
      />
    </FileUpload>
  )
}
