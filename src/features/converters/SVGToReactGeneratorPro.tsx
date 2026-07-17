import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Sparkles,
  Code,
  Share2,
  Eye,
  Cpu,
  ArrowLeftRight,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { CodeEditorWrapper } from '@/components/ui/CodeEditorWrapper'
import { FileUpload } from '@/components/ui/FileUpload'
import { Toolbar } from '@/components/ui/Toolbar'
import { ResultPanel } from '@/components/ui/ResultPanel'
import { ToolLayout } from '@/components/common/ToolLayout'
import type { OptionTab } from '@/components/common/ToolLayout'
import { cn } from '@/lib/utils'

// Predefined SVG samples
const SAMPLES = {
  gear: {
    title: 'Settings Gear Icon',
    data: `<!-- Settings Gear SVG -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6d28d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="gear-svg">
  <circle cx="12" cy="12" r="3" />
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
</svg>`
  },
  heart: {
    title: 'Heart Icon',
    data: `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#ef4444" stroke="#dc2626" stroke-width="2">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>`
  },
  badge: {
    title: 'Shield Badge Icon',
    data: `<!-- Shield SVG -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
</svg>`
  }
}

// SVG Attribute Replacement Map
const ATTRIBUTE_MAP: { [key: string]: string } = {
  class: 'className',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'xmlns:xlink': 'xmlnsXlink',
  'xml:space': 'xmlSpace',
  'xlink:href': 'xlinkHref',
  'xlink:title': 'xlinkTitle',
  'xlink:role': 'xlinkRole',
  'xlink:show': 'xlinkShow',
  'xlink:actuate': 'xlinkActuate'
}

export function SVGToReactGeneratorPro() {
  const { toast } = useToast()

  // State Management
  const [inputVal, setInputVal] = useState('')
  const [outputVal, setOutputVal] = useState('')
  const [autoConvert, setAutoConvert] = useState(true)
  const [validationStatus, setValidationStatus] = useState<null | 'success' | 'warning'>(null)
  const [validationMessage, setValidationMessage] = useState('')
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Customization Options
  const [componentName, setComponentName] = useState('Icon')
  const [lang, setLang] = useState<'tsx' | 'jsx'>('tsx')
  const [svgrFormat, setSvgrFormat] = useState(false)
  const [dynamicColor, setDynamicColor] = useState(true)
  const [dynamicSizes, setDynamicSizes] = useState(true)

  // Stats Metrics
  const [stats, setStats] = useState({
    replacedCount: 0,
    hasViewBox: false,
    inputBytes: 0,
    outputBytes: 0
  })

  // Live Preview rendering string helper
  const parsedPreviewSvg = useMemo(() => {
    if (!inputVal.trim()) return ''
    try {
      // Clean comments, xml tags, doctypes for safety inside rendering
      let clean = inputVal
        .replace(/<\?xml[\s\S]*?\?>/i, '')
        .replace(/<!DOCTYPE[\s\S]*?>/i, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .trim()
      
      // Ensure it contains svg tag
      if (!clean.toLowerCase().includes('<svg')) {
        return ''
      }
      return clean
    } catch {
      return ''
    }
  }, [inputVal])

  // Conversion Pipeline
  const handleConvert = useCallback((customInput = inputVal) => {
    if (!customInput.trim()) {
      setOutputVal('')
      setValidationStatus(null)
      setValidationMessage('')
      setProcessingTime(null)
      setStats({ replacedCount: 0, hasViewBox: false, inputBytes: 0, outputBytes: 0 })
      return
    }

    setIsProcessing(true)
    const startTime = performance.now()

    try {
      // 1. Clean xml headers, doctypes, and HTML comments
      let cleanSvg = customInput
        .replace(/<\?xml[\s\S]*?\?>/i, '')
        .replace(/<!DOCTYPE[\s\S]*?>/i, '')
        .replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}')
        .trim()

      // Find opening svg tag
      const svgOpenTagMatch = cleanSvg.match(/<svg[\s\S]*?>/i)
      if (!svgOpenTagMatch) {
        setValidationStatus('warning')
        setValidationMessage('Notice: No opening <svg> tag parsed. Verify input vector markup.')
        setOutputVal(customInput)
        setIsProcessing(false)
        return
      }

      let openTag = svgOpenTagMatch[0]
      let innerContent = cleanSvg.slice(openTag.length).replace(/<\/svg>\s*$/i, '')

      // 2. Parse viewBox
      const viewBoxMatch = openTag.match(/viewBox\s*=\s*(?:"([^"]*)"|'([^']*)')/i)
      const viewBoxValue = viewBoxMatch ? (viewBoxMatch[1] || viewBoxMatch[2]) : '0 0 24 24'
      const hasViewBox = !!viewBoxMatch

      // 3. Rename attributes inside tags
      let replacedCount = 0
      const renameRegex = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
      
      // Convert inner attributes
      innerContent = innerContent.replace(renameRegex, (match, name, doubleVal, singleVal) => {
        const val = doubleVal !== undefined ? doubleVal : singleVal
        const lowerName = name.toLowerCase()
        if (ATTRIBUTE_MAP[lowerName]) {
          replacedCount++
          const reactAttr = ATTRIBUTE_MAP[lowerName]
          // Numbers in specific attributes can be numeric bindings or raw strings
          const isNumeric = ['strokeWidth', 'strokeMiterlimit'].includes(reactAttr) && !isNaN(parseFloat(val))
          return isNumeric ? `${reactAttr}={${val}}` : `${reactAttr}="${val}"`
        }
        return match
      })

      // Dynamic color override inside tags
      if (dynamicColor) {
        innerContent = innerContent.replace(/(stroke|fill)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi, (match, prop, doubleVal, singleVal) => {
          const val = (doubleVal !== undefined ? doubleVal : singleVal).toLowerCase()
          const propCamel = prop.toLowerCase()
          if (val !== 'none' && val !== 'transparent') {
            replacedCount++
            return `${propCamel}={props.${propCamel} || "currentColor"}`
          }
          return match
        })
      }

      // Format component name safely: convert strings like 'arrow-right' to 'ArrowRight'
      const formattedComponentName = componentName
        .trim()
        .replace(/[-_.\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
        .replace(/^[a-z]/, f => f.toUpperCase()) || 'Icon'

      // 4. Assemble React component
      let code = ''

      if (svgrFormat) {
        // SVGR style Arrow function format
        if (lang === 'tsx') {
          code = `import * as React from "react"
import type { SVGProps } from "react"

const ${formattedComponentName} = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="${viewBoxValue}"
    ${dynamicSizes ? 'width={24}\n    height={24}' : ''}
    {...props}
  >
    ${innerContent.trim().split('\n').map(line => `    ${line.trim()}`).join('\n')}
  </svg>
)

export default ${formattedComponentName}
`
        } else {
          code = `import * as React from "react"

const ${formattedComponentName} = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="${viewBoxValue}"
    ${dynamicSizes ? 'width={24}\n    height={24}' : ''}
    {...props}
  >
    ${innerContent.trim().split('\n').map(line => `    ${line.trim()}`).join('\n')}
  </svg>
)

export default ${formattedComponentName}
`
        }
      } else {
        // Standard Functional Component format
        if (lang === 'tsx') {
          code = `import React from 'react'

interface ${formattedComponentName}Props extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

export default function ${formattedComponentName}({
  size = 24,
  className,
  ...props
}: ${formattedComponentName}Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="${viewBoxValue}"
      ${dynamicSizes ? 'width={size}\n      height={size}' : ''}
      className={className}
      {...props}
    >
      ${innerContent.trim().split('\n').map(line => `      ${line.trim()}`).join('\n')}
    </svg>
  )
}
`
        } else {
          code = `import React from 'react'

export default function ${formattedComponentName}({
  size = 24,
  className,
  ...props
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="${viewBoxValue}"
      ${dynamicSizes ? 'width={size}\n      height={size}' : ''}
      className={className}
      {...props}
    >
      ${innerContent.trim().split('\n').map(line => `      ${line.trim()}`).join('\n')}
    </svg>
  )
}
`
        }
      }

      setOutputVal(code)
      setStats({
        replacedCount,
        hasViewBox,
        inputBytes: new Blob([customInput]).size,
        outputBytes: new Blob([code]).size
      })

      if (!hasViewBox) {
        setValidationStatus('warning')
        setValidationMessage('Notice: The input SVG had no viewBox attribute. We supplied a default (0 0 24 24), but you might need to adjust details manually.')
      } else {
        setValidationStatus('success')
        setValidationMessage('Success: Compiled SVG vector data into valid React component markup!')
      }
    } catch {
      setValidationStatus('warning')
      setValidationMessage('Error: Failed to parse SVG vector tree structure cleanly.')
      setOutputVal(customInput)
    } finally {
      const endTime = performance.now()
      setProcessingTime(Number((endTime - startTime).toFixed(3)))
      setIsProcessing(false)
    }
  }, [inputVal, componentName, lang, svgrFormat, dynamicColor, dynamicSizes])

  // Debounced auto-run conversion loop
  useEffect(() => {
    if (autoConvert) {
      const delay = setTimeout(() => {
        handleConvert()
      }, 250)
      return () => clearTimeout(delay)
    }
  }, [inputVal, componentName, lang, svgrFormat, dynamicColor, dynamicSizes, autoConvert, handleConvert])

  // File Handlers
  const handleFileLoaded = (text: string, filename: string) => {
    // Extract component name from file name: gear.svg -> Gear
    const baseName = filename.replace(/\.[^/.]+$/, "")
    const autoName = baseName.replace(/[^a-zA-Z0-9]/g, '')
    const finalName = autoName.charAt(0).toUpperCase() + autoName.slice(1)
    
    setComponentName(finalName || 'Icon')
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
    const fileExt = lang === 'tsx' ? 'tsx' : 'jsx'
    const blob = new Blob([outputVal], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${componentName}.${fileExt}`
    link.click()
    URL.revokeObjectURL(url)
    toast(`Downloaded React component file`, 'success')
  }

  const handleCopy = () => {
    const value = outputVal || inputVal
    if (!value) return
    navigator.clipboard.writeText(value)
    toast('Copied component code to clipboard!', 'success')
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
    setComponentName(key.charAt(0).toUpperCase() + key.slice(1) + 'Icon')
    toast(`Loaded preset: ${SAMPLES[key as keyof typeof SAMPLES].title}`, 'info')
  }

  // Spacing options templates
  const presetsSamples = useMemo(() => {
    const obj: { [key: string]: { title: string; data: any } } = {}
    Object.entries(SAMPLES).forEach(([key, value]) => {
      obj[key] = { title: value.title, data: value.data }
    })
    return obj
  }, [])

  // Options tabs configuration
  const optionTabs: OptionTab[] = [
    {
      id: 'options',
      label: 'Component Settings',
      icon: <ArrowLeftRight className="h-3.5 w-3.5" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              React Component Name
            </label>
            <Input
              type="text"
              placeholder="Icon component identifier..."
              value={componentName}
              onChange={(e) => setComponentName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              className="h-9 font-medium"
            />
            <p className="text-[10px] text-muted-foreground/60 leading-normal">
              Capitalized alphanumeric identifier representing the React class.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Language Output Format
            </span>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none">
                <input
                  type="radio"
                  name="codeLang"
                  checked={lang === 'tsx'}
                  onChange={() => setLang('tsx')}
                  className="accent-primary cursor-pointer h-4 w-4"
                />
                <span>TypeScript (.tsx)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none">
                <input
                  type="radio"
                  name="codeLang"
                  checked={lang === 'jsx'}
                  onChange={() => setLang('jsx')}
                  className="accent-primary cursor-pointer h-4 w-4"
                />
                <span>JavaScript (.jsx)</span>
              </label>
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-normal">
              Specify whether to generate prop interface types.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Compilation Style
            </span>
            <div className="flex items-center gap-2 mt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-muted-foreground select-none">
                <input
                  type="checkbox"
                  checked={svgrFormat}
                  onChange={(e) => setSvgrFormat(e.target.checked)}
                  className="rounded border-border text-primary focus-ring h-4.5 w-4.5 cursor-pointer"
                />
                <span>Use SVGR Signature Format</span>
              </label>
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-normal font-sans">
              Compiles as a const arrow function ideal for lightweight SVG bundling layouts.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'props',
      label: 'Props Configuration',
      icon: <Cpu className="h-3.5 w-3.5" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Dynamic Color Overriding
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none mt-2">
              <input
                type="checkbox"
                checked={dynamicColor}
                onChange={(e) => setDynamicColor(e.target.checked)}
                className="rounded border-border text-primary focus-ring h-4.5 w-4.5 cursor-pointer"
              />
              <span>Bind <code>fill</code> and <code>stroke</code> to props</span>
            </label>
            <p className="text-[10px] text-muted-foreground/60 leading-normal">
              Replaces static attributes like <code>stroke="#6d28d9"</code> with dynamic bindings <code>stroke={'{props.stroke || "currentColor"}'}</code>.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Dynamic Sizing
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none mt-2">
              <input
                type="checkbox"
                checked={dynamicSizes}
                onChange={(e) => setDynamicSizes(e.target.checked)}
                className="rounded border-border text-primary focus-ring h-4.5 w-4.5 cursor-pointer"
              />
              <span>Map <code>width</code> and <code>height</code> to size props</span>
            </label>
            <p className="text-[10px] text-muted-foreground/60 leading-normal">
              Removes hardcoded widths and binds elements to a single customizable <code>size</code> parameter.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'ai',
      label: 'AI Icon Optimization',
      icon: <Sparkles className="h-3.5 w-3.5 text-primary" />,
      badge: 'Pro',
      content: (
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <p className="font-heading text-sm font-bold text-foreground">AI SVGO Compression & Cleanup</p>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
            Clean up editor artifacts (from Figma or Illustrator), remove redundant group classes, merge paths, and simplify vector complexity using background optimizations.
          </p>
          <div className="flex gap-2 max-w-lg mt-2 font-sans">
            <Input 
              placeholder="Describe SVG adjustments (e.g. merge all paths, center viewports)" 
              disabled 
              className="h-9 cursor-not-allowed bg-secondary/20"
            />
            <Button size="sm" disabled className="cursor-not-allowed bg-primary/50 text-primary-foreground/50 font-semibold h-9 shrink-0">
              Run SVGO Optimizer
            </Button>
          </div>
        </div>
      )
    }
  ]

  // FAQs items
  const faqItems = [
    {
      id: 'svgr-faq-1',
      title: 'How does the SVG to React Component Generator work?',
      content: (
        <span>
          The compiler cleans up raw XML vector data, removes declaration wrappers, and maps vector attributes to React camelCase bindings (e.g. <code>stroke-width</code> to <code>strokeWidth</code>). It generates a structural function template wrapping the final clean output.
        </span>
      )
    },
    {
      id: 'svgr-faq-2',
      title: 'What sizes and color override features are supported?',
      content: (
        <span>
          If enabled, the generator replaces hardcoded width/height inputs with a dynamic <code>size</code> parameter that defaults to 24. It also translates fill and stroke tags to look up component properties dynamically.
        </span>
      )
    },
    {
      id: 'svgr-faq-3',
      title: 'Can I generate TypeScript components?',
      content: (
        <span>
          Yes! Select the TypeScript (.tsx) format in options to automatically append typings and compile-ready SVG element interfaces to standard outputs.
        </span>
      )
    }
  ]

  return (
    <FileUpload onFileLoaded={handleFileLoaded} accept=".svg,.txt">
      <ToolLayout
        toolSlug="svg-to-react"
        toolbar={
          <Toolbar
            onPaste={handlePaste}
            onUpload={handleFileUpload}
            uploadAccept=".svg,.txt"
            samples={presetsSamples}
            onLoadSample={loadPreset}
            onConvert={() => handleConvert()}
            convertLabel="Generate React Component"
            convertLoading={isProcessing}
            onCopy={handleCopy}
            copyDisabled={!outputVal}
            onDownload={handleDownload}
            downloadDisabled={!outputVal}
            onClear={() => { setInputVal(''); setOutputVal(''); setValidationStatus(null); setValidationMessage(''); setStats({ replacedCount: 0, hasViewBox: false, inputBytes: 0, outputBytes: 0 }); }}
            clearDisabled={!inputVal && !outputVal}
          />
        }
        editorSection={
          <div className="flex flex-col gap-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
              {/* Input card */}
              <div className="lg:col-span-6 flex flex-col">
                <CodeEditorWrapper
                  language="html"
                  value={inputVal}
                  onChange={setInputVal}
                  placeholder="Paste raw SVG code here... (e.g. <svg> ... </svg>)"
                />
              </div>

              {/* Output card */}
              <div className="lg:col-span-6 flex flex-col">
                <ResultPanel
                  title="React Component Output"
                  value={outputVal}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  validationStatus={validationStatus}
                  processingTime={processingTime}
                >
                  <CodeEditorWrapper
                    language={lang === 'tsx' ? 'typescript' : 'javascript'}
                    value={outputVal}
                    readOnly={true}
                  />
                </ResultPanel>
              </div>
            </div>

            {/* Statistics Banner */}
            {stats.inputBytes > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full text-left">
                <div className="p-4 border border-border/40 bg-card/40 rounded-xl font-sans">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Properties Translated</div>
                  <div className="text-xl font-bold mt-1 text-foreground">{stats.replacedCount}</div>
                </div>
                <div className="p-4 border border-border/40 bg-card/40 rounded-xl font-sans">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">viewBox Status</div>
                  <div className="text-xl font-bold mt-1 flex items-center gap-1.5">
                    {stats.hasViewBox ? (
                      <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-4.5 w-4.5" /> Preserved</span>
                    ) : (
                      <span className="text-amber-500 flex items-center gap-1"><AlertTriangle className="h-4.5 w-4.5" /> Generated</span>
                    )}
                  </div>
                </div>
                <div className="p-4 border border-border/40 bg-card/40 rounded-xl font-sans">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Input SVG Size</div>
                  <div className="text-xl font-bold mt-1 text-foreground">
                    {stats.inputBytes > 1024 ? `${(stats.inputBytes / 1024).toFixed(2)} KB` : `${stats.inputBytes} B`}
                  </div>
                </div>
                <div className="p-4 border border-border/40 bg-card/40 rounded-xl font-sans">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Component Code Size</div>
                  <div className="text-xl font-bold mt-1 text-primary font-semibold">
                    {stats.outputBytes > 1024 ? `${(stats.outputBytes / 1024).toFixed(2)} KB` : `${stats.outputBytes} B`}
                  </div>
                </div>
              </div>
            )}

            {/* Live Visual SVG Grid Preview Panel */}
            {parsedPreviewSvg && (
              <Card className="bg-card/40 border-border overflow-hidden font-sans">
                <CardHeader className="p-4 border-b border-border/40 bg-secondary/15 flex justify-between items-center text-left">
                  <div>
                    <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                      Live Render Sandbox Preview
                    </CardTitle>
                    <CardDescription className="text-[10px] mt-0.5">
                      Visual verify responsive resizing and color styles locally.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6 bg-secondary/5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center">
                    {/* Size 16px */}
                    <div className="flex flex-col items-center gap-2 bg-card/60 p-4 border border-border/50 rounded-xl w-full">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase">16px size</div>
                      <div 
                        className="text-primary flex items-center justify-center"
                        style={{ width: 16, height: 16 }}
                        dangerouslySetInnerHTML={{ 
                          __html: parsedPreviewSvg.replace(/width\s*=\s*(?:"[^"]*"|'[^']*')/gi, 'width="16"').replace(/height\s*=\s*(?:"[^"]*"|'[^']*')/gi, 'height="16"')
                        }}
                      />
                    </div>

                    {/* Size 24px - indigo */}
                    <div className="flex flex-col items-center gap-2 bg-card/60 p-4 border border-border/50 rounded-xl w-full">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase">24px Indigo</div>
                      <div 
                        className="text-indigo-500 flex items-center justify-center"
                        style={{ width: 24, height: 24 }}
                        dangerouslySetInnerHTML={{ 
                          __html: parsedPreviewSvg
                            .replace(/width\s*=\s*(?:"[^"]*"|'[^']*')/gi, 'width="24"')
                            .replace(/height\s*=\s*(?:"[^"]*"|'[^']*')/gi, 'height="24"')
                            .replace(/stroke\s*=\s*(?:"#[^"]*"|'#[^']*'|"[a-zA-Z]+"|'[a-zA-Z]+')/gi, 'stroke="currentColor"')
                            .replace(/fill\s*=\s*(?:"#[^"]*"|'#[#']*'|"[a-zA-Z]+"|'[a-zA-Z]+')/gi, 'fill="currentColor"')
                        }}
                      />
                    </div>

                    {/* Size 32px - Red */}
                    <div className="flex flex-col items-center gap-2 bg-card/60 p-4 border border-border/50 rounded-xl w-full">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase">32px Red</div>
                      <div 
                        className="text-red-500 flex items-center justify-center"
                        style={{ width: 32, height: 32 }}
                        dangerouslySetInnerHTML={{ 
                          __html: parsedPreviewSvg
                            .replace(/width\s*=\s*(?:"[^"]*"|'[^']*')/gi, 'width="32"')
                            .replace(/height\s*=\s*(?:"[^"]*"|'[^']*')/gi, 'height="32"')
                            .replace(/stroke\s*=\s*(?:"#[^"]*"|'#[^']*'|"[a-zA-Z]+"|'[a-zA-Z]+')/gi, 'stroke="currentColor"')
                            .replace(/fill\s*=\s*(?:"#[^"]*"|'#[#']*'|"[a-zA-Z]+"|'[a-zA-Z]+')/gi, 'fill="currentColor"')
                        }}
                      />
                    </div>

                    {/* Size 48px - Emerald */}
                    <div className="flex flex-col items-center gap-2 bg-card/60 p-4 border border-border/50 rounded-xl w-full">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase">48px Emerald</div>
                      <div 
                        className="text-emerald-500 flex items-center justify-center"
                        style={{ width: 48, height: 48 }}
                        dangerouslySetInnerHTML={{ 
                          __html: parsedPreviewSvg
                            .replace(/width\s*=\s*(?:"[^"]*"|'[^']*')/gi, 'width="48"')
                            .replace(/height\s*=\s*(?:"[^"]*"|'[^']*')/gi, 'height="48"')
                            .replace(/stroke\s*=\s*(?:"#[^"]*"|'#[^']*'|"[a-zA-Z]+"|'[a-zA-Z]+')/gi, 'stroke="currentColor"')
                            .replace(/fill\s*=\s*(?:"#[^"]*"|'#[#']*'|"[a-zA-Z]+"|'[a-zA-Z]+')/gi, 'fill="currentColor"')
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Warning Alert Panel for Missing viewBox */}
            {validationStatus === 'warning' && validationMessage && (
              <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-4 flex gap-3 text-left font-sans">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-500">SVG Parser Warnings</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed font-sans">
                    {validationMessage}
                  </p>
                </div>
              </div>
            )}
          </div>
        }
        optionTabs={optionTabs}
        faqs={faqItems}
        instructionsTitle="SVG to React Generator Guide"
        instructions={
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground list-none pl-0">
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">1</span>
              <span>Paste standard SVG code into the left editor or drop files directly onto the workspace screen.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">2</span>
              <span>Specify component naming formats, output languages (TSX vs JSX), and dynamic size overrides.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">3</span>
              <span>Inspect translated property lines in real-time, copy code results, or download component files.</span>
            </li>
          </ul>
        }
        benefits={[
          "Instant client-side compilation in milliseconds. Secure and local sandbox execution.",
          "Cleans attributes automatically (XML tags, comments, class to className mappings).",
          "Includes settings to bind fill/stroke variables to props for style override flexibilities.",
          "Live preview grid showcasing resizing displays and color variants."
        ]}
      />
    </FileUpload>
  )
}
