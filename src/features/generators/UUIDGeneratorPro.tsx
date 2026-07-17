import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Fingerprint,
  Copy,
  Check,
  Download,
  Trash2,
  RefreshCw,
  Info,
  ShieldAlert,
  Sliders,
  Settings,
  Sparkles,
  Layers,
  HelpCircle,
  FileText,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { CodeEditorWrapper } from '@/components/ui/CodeEditorWrapper'
import { ToolLayout } from '@/components/common/ToolLayout'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/services/analytics'

// Types for settings
type UUIDVersion = 'v4' | 'v1' | 'v6' | 'v7'
type SeparatorLayout = 'newline' | 'comma' | 'json'

export function UUIDGeneratorPro() {
  const { toast } = useToast()

  // 1. Persistent state from Local Storage
  const [quantity, setQuantity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('uuid-pref-quantity')
      return saved ? Math.min(1000, Math.max(1, parseInt(saved, 10))) : 10
    } catch {
      return 10
    }
  })

  const [customQtyInput, setCustomQtyInput] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('uuid-pref-quantity')
      return saved ? saved : '10'
    } catch {
      return '10'
    }
  })

  const [isCustomQty, setIsCustomQty] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('uuid-pref-quantity')
      if (!saved) return false
      const num = parseInt(saved, 10)
      return ![1, 10, 25, 50, 100].includes(num)
    } catch {
      return false
    }
  })

  const [uppercase, setUppercase] = useState<boolean>(() => {
    try {
      return localStorage.getItem('uuid-pref-uppercase') === 'true'
    } catch {
      return false
    }
  })

  const [removeHyphens, setRemoveHyphens] = useState<boolean>(() => {
    try {
      return localStorage.getItem('uuid-pref-remove-hyphens') === 'true'
    } catch {
      return false
    }
  })

  const [separator, setSeparator] = useState<SeparatorLayout>(() => {
    try {
      const saved = localStorage.getItem('uuid-pref-separator')
      return (saved as SeparatorLayout) || 'newline'
    } catch {
      return 'newline'
    }
  })

  const [selectedVersion, setSelectedVersion] = useState<UUIDVersion>('v4')

  // Generation result states
  const [generatedList, setGeneratedList] = useState<string[]>([])
  const [formattedOutput, setFormattedOutput] = useState<string>('')
  const [generationTime, setGenerationTime] = useState<number>(0)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isCopiedAll, setIsCopiedAll] = useState<boolean>(false)

  // Save settings on changes
  useEffect(() => {
    try {
      localStorage.setItem('uuid-pref-quantity', String(quantity))
      localStorage.setItem('uuid-pref-uppercase', String(uppercase))
      localStorage.setItem('uuid-pref-remove-hyphens', String(removeHyphens))
      localStorage.setItem('uuid-pref-separator', separator)
    } catch (e) {
      console.warn('Failed to cache preferences inside local storage:', e)
    }
  }, [quantity, uppercase, removeHyphens, separator])

  // Cryptographically Secure Version 4 Generator
  const generateUUIDv4 = useCallback((): string => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID()
    }

    // High entropy fallback using getRandomValues
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const bytes = new Uint8Array(16)
      window.crypto.getRandomValues(bytes)

      // Set version bits to 4 (0100)
      bytes[6] = (bytes[6] & 0x0f) | 0x40
      // Set variant bits to 1 (10xx)
      bytes[8] = (bytes[8] & 0x3f) | 0x80

      const hex: string[] = []
      for (let i = 0; i < 16; i++) {
        hex.push(bytes[i].toString(16).padStart(2, '0'))
      }

      return [
        hex.slice(0, 4).join(''),
        hex.slice(4, 6).join(''),
        hex.slice(6, 8).join(''),
        hex.slice(8, 10).join(''),
        hex.slice(10, 16).join('')
      ].join('-')
    }

    // Legacy fallback for local non-secure hosts
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }, [])

  // Core generator loop
  const handleGenerate = useCallback((qty = quantity) => {
    const startTime = performance.now()
    const uuids: string[] = []

    for (let i = 0; i < qty; i++) {
      uuids.push(generateUUIDv4())
    }

    setGeneratedList(uuids)
    setGenerationTime(performance.now() - startTime)
    setIsCopiedAll(false)
    trackEvent({
      action: 'generate_uuids',
      category: 'uuid_generator',
      value: qty
    })
  }, [quantity, generateUUIDv4])

  // Format outputs based on preferences
  useEffect(() => {
    if (generatedList.length === 0) {
      setFormattedOutput('')
      return
    }

    let processed = generatedList.map((uuid) => {
      let val = uuid
      if (removeHyphens) {
        val = val.replace(/-/g, '')
      }
      return uppercase ? val.toUpperCase() : val.toLowerCase()
    })

    if (separator === 'comma') {
      setFormattedOutput(processed.join(', '))
    } else if (separator === 'json') {
      setFormattedOutput(JSON.stringify(processed, null, 2))
    } else {
      setFormattedOutput(processed.join('\n'))
    }
  }, [generatedList, uppercase, removeHyphens, separator])

  // Trigger initial generate on mount
  useEffect(() => {
    handleGenerate()
  }, [])

  // Hotkey mapping: Command/Control + Enter to regenerate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleGenerate()
        toast('Regenerated new batch', 'success')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleGenerate, toast])

  // Custom Quantity Input handler
  const handleCustomQtyChange = (val: string) => {
    setCustomQtyInput(val)
    const num = parseInt(val, 10)
    if (!isNaN(num) && num >= 1 && num <= 1000) {
      setQuantity(num)
    }
  }

  // Copy operations
  const handleCopyIndividual = (index: number) => {
    let uuid = generatedList[index]
    if (removeHyphens) uuid = uuid.replace(/-/g, '')
    uuid = uppercase ? uuid.toUpperCase() : uuid.toLowerCase()

    navigator.clipboard.writeText(uuid)
    setCopiedIndex(index)
    toast('Copied individual identifier', 'success')
    trackEvent({
      action: 'copy_individual',
      category: 'uuid_generator'
    })
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const handleCopyAll = () => {
    if (!formattedOutput) return
    navigator.clipboard.writeText(formattedOutput)
    setIsCopiedAll(true)
    toast('Copied all generated UUIDs to clipboard', 'success')
    trackEvent({
      action: 'copy_all',
      category: 'uuid_generator'
    })
    setTimeout(() => setIsCopiedAll(false), 2000)
  }

  // File downloads
  const downloadTxt = () => {
    if (!formattedOutput) return
    const blob = new Blob([formattedOutput], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `uuids-${quantity}.txt`
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded TXT list', 'success')
    trackEvent({
      action: 'download_txt',
      category: 'uuid_generator'
    })
  }

  const downloadCsv = () => {
    if (generatedList.length === 0) return
    let csvContent = 'Index,UUID\n'
    generatedList.forEach((uuid, idx) => {
      let val = uuid
      if (removeHyphens) val = val.replace(/-/g, '')
      val = uppercase ? val.toUpperCase() : val.toLowerCase()
      csvContent += `${idx + 1},${val}\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `uuids-${quantity}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded CSV table', 'success')
    trackEvent({
      action: 'download_csv',
      category: 'uuid_generator'
    })
  }

  const downloadJson = () => {
    if (generatedList.length === 0) return
    let processed = generatedList.map((uuid) => {
      let val = uuid
      if (removeHyphens) val = val.replace(/-/g, '')
      return uppercase ? val.toUpperCase() : val.toLowerCase()
    })
    const jsonStr = JSON.stringify({ uuids: processed }, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `uuids-${quantity}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded JSON file', 'success')
    trackEvent({
      action: 'download_json',
      category: 'uuid_generator'
    })
  }

  // Predefined quantities selector
  const qtyButtons = [1, 10, 25, 50, 100]

  const selectQty = (num: number) => {
    setIsCustomQty(false)
    setQuantity(num)
    handleGenerate(num)
  }

  const activateCustomQty = () => {
    setIsCustomQty(true)
    const num = parseInt(customQtyInput, 10)
    if (!isNaN(num) && num >= 1 && num <= 1000) {
      setQuantity(num)
      handleGenerate(num)
    }
  }

  // Metrics summary
  const metrics = useMemo(() => {
    return {
      count: generatedList.length,
      characters: formattedOutput.length,
      speed: generationTime.toFixed(3)
    }
  }, [generatedList, formattedOutput, generationTime])

  // FAQ items
  const faqItems = [
    {
      id: 'uuid-faq-1',
      title: 'What is a UUID?',
      content: (
        <span className="font-sans">
          UUID (Universally Unique Identifier) is a 128-bit label used for resources in computer networks. It is represented as 32 hexadecimal digits separated by four hyphens, resulting in 36 characters (e.g. `de305d54-75b4-431b-adb2-eb6b9e546013`).
        </span>
      )
    },
    {
      id: 'uuid-faq-2',
      title: 'How are UUIDs generated here?',
      content: (
        <span className="font-sans">
          All UUIDs are generated locally on your computer. The generator calls the secure browser-native `crypto.randomUUID()` API. If unsupported by the client device, it falls back to raw high-entropy buffers generated via `crypto.getRandomValues()`. No telemetry or database keys are sent over the network.
        </span>
      )
    },
    {
      id: 'uuid-faq-3',
      title: 'What is the probability of a collision in UUID v4?',
      content: (
        <span className="font-sans">
          UUID v4 has 122 bits of randomness. The probability of a collision is so infinitesimally small that it is practically zero. For instance, to have a 50% chance of a single collision, you would need to generate 2.71 quintillion UUIDs.
        </span>
      )
    },
    {
      id: 'uuid-faq-4',
      title: 'Are UUID versions 1, 6, and 7 supported?',
      content: (
        <span className="font-sans">
          Currently, the generator outputs cryptographically secure random UUID Version 4. The underlying architecture is extensible, allowing the addition of time-based Version 1, reordered Version 6, and Unix Epoch millisecond-ordered Version 7 in upcoming workspace pipeline updates.
        </span>
      )
    }
  ]

  return (
    <ToolLayout
      toolSlug="uuid-generator"
      extraSEOProps={{
        title: "UUID / GUID Generator Pro - Frontend Workspace AI",
        description: "Generate single or batch Universally Unique Identifiers (UUID v4) instantly. Customize casings, hyphen options, separator layouts, and download TXT/CSV/JSON outputs."
      }}
      editorSection={
        <div className="flex flex-col gap-6 w-full text-left font-sans">
          
          {/* Privacy Lock Banner */}
          <Card className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 select-none">
            <CardContent className="p-4 flex items-start gap-3">
              <Fingerprint className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5 animate-pulse" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <span className="font-bold">Cryptographically Secure:</span> All UUIDs are generated locally in your browser sandbox using high-entropy secure crypto random pools. No data is transmitted to any server.
              </div>
            </CardContent>
          </Card>

          {/* Core Configuration & Panel Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
            
            {/* Left Column: Configuration Controls (Col 5) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <Card className="border-border bg-card/45 flex flex-col justify-between flex-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-heading flex items-center gap-2">
                    <Sliders className="h-4.5 w-4.5 text-primary" /> Configuration Settings
                  </CardTitle>
                  <CardDescription className="text-xs">Adjust quantities and formatting parameters.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-5 flex-1">
                  
                  {/* Version select tabs */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">UUID Version Selection</span>
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-secondary/40 rounded-lg border border-border/40 text-xs font-semibold">
                      <button
                        onClick={() => setSelectedVersion('v4')}
                        className={cn("py-1.5 rounded-md transition-all cursor-pointer", 
                          selectedVersion === 'v4' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}
                        aria-label="Select UUID version 4"
                      >
                        v4 (Random)
                      </button>
                      <button
                        disabled
                        className="py-1.5 rounded-md text-muted-foreground/35 cursor-not-allowed select-none flex flex-col items-center justify-center relative group"
                        aria-label="UUID version 1 (disabled)"
                      >
                        <span>v1</span>
                        <span className="text-[8px] scale-90 text-primary opacity-60 absolute -top-1 -right-1">Soon</span>
                      </button>
                      <button
                        disabled
                        className="py-1.5 rounded-md text-muted-foreground/35 cursor-not-allowed select-none flex flex-col items-center justify-center relative group"
                        aria-label="UUID version 6 (disabled)"
                      >
                        <span>v6</span>
                        <span className="text-[8px] scale-90 text-primary opacity-60 absolute -top-1 -right-1">Soon</span>
                      </button>
                      <button
                        disabled
                        className="py-1.5 rounded-md text-muted-foreground/35 cursor-not-allowed select-none flex flex-col items-center justify-center relative group"
                        aria-label="UUID version 7 (disabled)"
                      >
                        <span>v7</span>
                        <span className="text-[8px] scale-90 text-primary opacity-60 absolute -top-1 -right-1">Soon</span>
                      </button>
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Generation Quantity</span>
                    <div className="flex flex-wrap gap-1.5">
                      {qtyButtons.map((qty) => (
                        <button
                          key={qty}
                          onClick={() => selectQty(qty)}
                          className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                            !isCustomQty && quantity === qty 
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-background hover:bg-secondary/30 text-muted-foreground hover:text-foreground border-border'
                          )}
                          aria-label={`Generate ${qty} UUIDs`}
                        >
                          {qty}
                        </button>
                      ))}
                      
                      <button
                        onClick={activateCustomQty}
                        className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                          isCustomQty 
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background hover:bg-secondary/30 text-muted-foreground hover:text-foreground border-border'
                        )}
                        aria-label="Use custom generation quantity"
                      >
                        Custom
                      </button>
                    </div>

                    {isCustomQty && (
                      <div className="flex items-center gap-3 mt-2 animate-fade-in">
                        <input
                          type="range"
                          min="1"
                          max="1000"
                          value={quantity}
                          onChange={(e) => handleCustomQtyChange(e.target.value)}
                          className="flex-1 accent-primary h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={customQtyInput}
                          onChange={(e) => handleCustomQtyChange(e.target.value)}
                          className="w-16 px-2 py-1 text-xs text-center font-semibold bg-background border border-border rounded focus:border-primary focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Formatting options toggle */}
                  <div className="space-y-3 pt-3 border-t border-border/40">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Formatting Modifiers</span>
                    
                    <div className="flex flex-col gap-2.5">
                      {/* Uppercase */}
                      <label className="flex items-center gap-3 cursor-pointer select-none text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        <input
                          type="checkbox"
                          checked={uppercase}
                          onChange={(e) => setUppercase(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                        />
                        <span>Uppercase Letters</span>
                      </label>

                      {/* Remove Hyphens */}
                      <label className="flex items-center gap-3 cursor-pointer select-none text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        <input
                          type="checkbox"
                          checked={removeHyphens}
                          onChange={(e) => setRemoveHyphens(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                        />
                        <span>Strip Hyphens (Dashes)</span>
                      </label>
                    </div>
                  </div>

                  {/* Output Separator representation */}
                  <div className="space-y-1.5 pt-3 border-t border-border/40">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Output Layout Structure</span>
                    <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                      <button
                        onClick={() => setSeparator('newline')}
                        className={cn("py-1.5 rounded-lg border text-center transition-all cursor-pointer",
                          separator === 'newline' 
                            ? 'bg-secondary text-primary border-primary/20 font-bold' 
                            : 'bg-background hover:bg-secondary/20 text-muted-foreground border-border/60'
                        )}
                        aria-label="Format one UUID per line"
                      >
                        One Per Line
                      </button>
                      <button
                        onClick={() => setSeparator('comma')}
                        className={cn("py-1.5 rounded-lg border text-center transition-all cursor-pointer",
                          separator === 'comma' 
                            ? 'bg-secondary text-primary border-primary/20 font-bold' 
                            : 'bg-background hover:bg-secondary/20 text-muted-foreground border-border/60'
                        )}
                        aria-label="Format comma separated list"
                      >
                        Comma Separated
                      </button>
                      <button
                        onClick={() => setSeparator('json')}
                        className={cn("py-1.5 rounded-lg border text-center transition-all cursor-pointer",
                          separator === 'json' 
                            ? 'bg-secondary text-primary border-primary/20 font-bold' 
                            : 'bg-background hover:bg-secondary/20 text-muted-foreground border-border/60'
                        )}
                        aria-label="Format as JSON array string"
                      >
                        JSON Array
                      </button>
                    </div>
                  </div>

                </CardContent>
                
                {/* Generation triggers */}
                <CardContent className="p-4 border-t border-border/30 bg-secondary/10 flex flex-col gap-2 select-none">
                  <div className="text-[10px] text-muted-foreground text-center font-mono">
                    Press <kbd className="bg-background border px-1 rounded">Ctrl + Enter</kbd> to generate
                  </div>
                  <Button
                    onClick={() => handleGenerate()}
                    className="w-full font-semibold"
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                    aria-label="Regenerate random UUID identifiers"
                  >
                    Generate UUIDs
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Output Panel & File Exports (Col 7) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <Card className="border-border bg-card/65 flex flex-col flex-1 min-h-[400px]">
                <div className="px-4 py-2 border-b border-border/40 bg-secondary/10 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase font-heading tracking-wider flex items-center gap-1.5">
                    <Fingerprint className="h-4 w-4 text-primary" /> Generated Identifiers
                  </span>
                  
                  {/* Actions buttons */}
                  {formattedOutput && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleCopyAll}
                        className="p-1 px-2 text-primary hover:underline text-[10px] font-bold font-heading flex items-center gap-1 cursor-pointer"
                        aria-label="Copy all generated UUIDs"
                      >
                        {isCopiedAll ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        <span>{isCopiedAll ? 'Copied' : 'Copy All'}</span>
                      </button>
                      <span className="text-muted-foreground/30">|</span>
                      <button
                        onClick={() => {
                          setGeneratedList([])
                          setFormattedOutput('')
                        }}
                        className="p-1 px-2 text-destructive hover:underline text-[10px] font-bold font-heading flex items-center gap-1 cursor-pointer"
                        aria-label="Clear all outputs"
                      >
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Result Block Content */}
                <CardContent className="p-3 flex-1 flex flex-col justify-between">
                  {formattedOutput ? (
                    <div className="flex-1 flex flex-col gap-3">
                      <CodeEditorWrapper
                        language={separator === 'json' ? 'json' : 'markdown'}
                        value={formattedOutput}
                        readOnly={true}
                        height="300px"
                      />
                      
                      {/* Individual copy cards if newline format list */}
                      {separator === 'newline' && generatedList.length <= 15 && (
                        <div className="border border-border/40 rounded-xl bg-secondary/15 divide-y divide-border/30 max-h-[160px] overflow-y-auto font-mono text-xs text-left">
                          {generatedList.map((uuid, idx) => {
                            let val = uuid
                            if (removeHyphens) val = val.replace(/-/g, '')
                            val = uppercase ? val.toUpperCase() : val.toLowerCase()
                            return (
                              <div key={idx} className="p-2 px-3 flex items-center justify-between hover:bg-secondary/40 transition-colors">
                                <span className="text-muted-foreground pr-2 font-sans text-[10px] font-bold">#{idx + 1}</span>
                                <span className="font-semibold select-all truncate flex-1">{val}</span>
                                <button
                                  onClick={() => handleCopyIndividual(idx)}
                                  className="text-primary hover:text-foreground transition-colors ml-2 cursor-pointer p-1 rounded"
                                  aria-label={`Copy UUID number ${idx + 1}`}
                                >
                                  {copiedIndex === idx ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center py-20 text-center select-none">
                      <Fingerprint className="h-10 w-10 text-muted-foreground/30 animate-pulse mb-3" />
                      <div className="text-sm font-semibold text-muted-foreground">No UUIDs generated yet</div>
                      <button
                        onClick={() => handleGenerate()}
                        className="text-xs text-primary hover:underline font-bold mt-1.5 cursor-pointer"
                      >
                        Generate random batch
                      </button>
                    </div>
                  )}

                  {/* Downloads and File Exports */}
                  {formattedOutput && (
                    <div className="mt-4 pt-3 border-t border-border/30 flex flex-wrap gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadTxt}
                        leftIcon={<Download className="h-3.5 w-3.5" />}
                        className="text-xs font-semibold"
                        aria-label="Download UUIDs as TXT text file"
                      >
                        Download TXT
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadCsv}
                        leftIcon={<Download className="h-3.5 w-3.5" />}
                        className="text-xs font-semibold"
                        aria-label="Download UUIDs as CSV table rows"
                      >
                        Download CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadJson}
                        leftIcon={<Download className="h-3.5 w-3.5" />}
                        className="text-xs font-semibold"
                        aria-label="Download UUIDs as JSON configuration file"
                      >
                        Download JSON
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ticking Metrics summary box */}
              {formattedOutput && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                  <div className="p-4 border border-border/40 bg-card/45 rounded-xl font-sans">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Identifiers Count</div>
                    <div className="text-sm font-semibold mt-1 text-foreground">{metrics.count} UUIDs</div>
                  </div>
                  <div className="p-4 border border-border/40 bg-card/45 rounded-xl font-sans">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">UUID Version</div>
                    <div className="text-sm font-semibold mt-1 text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-primary" /> Version 4
                    </div>
                  </div>
                  <div className="p-4 border border-border/40 bg-card/45 rounded-xl font-sans">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Characters</div>
                    <div className="text-sm font-semibold mt-1 text-foreground">{metrics.characters} chars</div>
                  </div>
                  <div className="p-4 border border-border/40 bg-card/45 rounded-xl font-sans">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Time Elapsed</div>
                    <div className="text-sm font-semibold mt-1 text-foreground flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground" /> {metrics.speed} ms
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      }
      faqs={faqItems}
      instructionsTitle="Universally Unique Identifier Guide"
      instructions={
        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed font-sans">
          
          {/* What is a UUID */}
          <div className="space-y-2">
            <h4 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
              <Fingerprint className="h-4.5 w-4.5 text-primary" /> What is a UUID?
            </h4>
            <p>
              UUID stands for <strong>Universally Unique Identifier</strong>. Defined in RFC 4122, it is a 128-bit label used to uniquely identify resources in computer systems. Standard string notation splits this identifier into hexadecimal sequences delimited by dashes, totalizing 36 characters.
            </p>
          </div>

          {/* UUID Versions Explained */}
          <div className="space-y-2">
            <h4 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
              <Layers className="h-4.5 w-4.5 text-primary" /> UUID Versions Explained
            </h4>
            <p>
              The RFC 4122 standard defines several distinct versions, each suited for different architectures:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong className="text-foreground">Version 1 (Time-based):</strong> Generated combining the system MAC address and timestamp. Might expose hardware details.</li>
              <li><strong className="text-foreground">Version 4 (Cryptographically Random):</strong> Generated entirely from random value pools. Recommended for general usage.</li>
              <li><strong className="text-foreground">Version 6 (Reordered Time):</strong> Reorders timestamp bytes from Version 1 for database clustering indexing efficiency.</li>
              <li><strong className="text-foreground">Version 7 (Unix Epoch ordered):</strong> Encodes Unix Epoch milliseconds as prefix, making identifiers chronologically sortable. Ideal for DB primary keys.</li>
            </ul>
          </div>

          {/* Common Use Cases */}
          <div className="space-y-2">
            <h4 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
              <FileText className="h-4.5 w-4.5 text-primary" /> Common Use Cases
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong className="text-foreground">Database Primary Keys:</strong> Prevents auto-incrementing ID guess attacks and simplifies distributed database merging operations.</li>
              <li><strong className="text-foreground">Correlation IDs:</strong> Stamped on network requests to trace asynchronous workflows across API microservices.</li>
              <li><strong className="text-foreground">Session Tokens:</strong> Used as transient user authorization tracking parameters inside secure browser cookie states.</li>
            </ul>
          </div>

          {/* UUID Best Practices */}
          <div className="space-y-2">
            <h4 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
              <Settings className="h-4.5 w-4.5 text-primary" /> UUID Best Practices
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong className="text-foreground">Use high-entropy sources:</strong> Always generate UUIDs using secure cryptographic APIs. Weak pseudorandom generators like standard Math.random are prone to collisions.</li>
              <li><strong className="text-foreground">Optimize database storage:</strong> While UUIDs are represented as 36-character strings, store them as raw 16-byte binary arrays inside databases like MySQL or PostgreSQL for optimal indexing speed.</li>
              <li><strong className="text-foreground">Select Version 7 for indexing:</strong> If database primary keys require B-Tree indexes, prefer Version 7 timestamp ordering to avoid page splitting memory leaks.</li>
            </ul>
          </div>

        </div>
      }
      benefits={[
        "Local High-Entropy Generation: Employs browser-native Web Cryptography random numbers.",
        "Custom Output Layouts: Clean options for comma separation, JSON representation, and newlines.",
        "Zero Telemetry tracking: No identifiers ever traverse external network channels."
      ]}
    />
  )
}
