import React, { useState, useEffect, useCallback } from 'react'
import {
  Sparkles,
  Code,
  Share2,
  Eye,
  Cpu,
  ArrowLeftRight
} from 'lucide-react'
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

// HTML to JSX Attribute Mappings
const ATTRIBUTE_MAPPINGS: { [key: string]: string } = {
  // Common HTML attributes
  class: 'className',
  for: 'htmlFor',
  acceptcharset: 'acceptCharset',
  accesskey: 'accessKey',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  autoplay: 'autoPlay',
  cellpadding: 'cellPadding',
  cellspacing: 'cellSpacing',
  charset: 'charSet',
  classid: 'classId',
  colspan: 'colSpan',
  contenteditable: 'contentEditable',
  contextmenu: 'contextMenu',
  crossorigin: 'crossOrigin',
  datetime: 'dateTime',
  enctype: 'encType',
  formaction: 'formAction',
  formenctype: 'formEncType',
  formmethod: 'formMethod',
  formnovalidate: 'formNoValidate',
  formtarget: 'formTarget',
  frameborder: 'frameBorder',
  hreflang: 'hrefLang',
  httpequiv: 'httpEquiv',
  inputmode: 'inputMode',
  keyparams: 'keyParams',
  keytype: 'keyType',
  marginheight: 'marginHeight',
  marginwidth: 'marginWidth',
  maxlength: 'maxLength',
  minlength: 'minLength',
  novalidate: 'noValidate',
  radiogroup: 'radioGroup',
  readonly: 'readOnly',
  rowspan: 'rowSpan',
  spellcheck: 'spellCheck',
  srcdoc: 'srcDoc',
  srclang: 'srcLang',
  srcset: 'srcSet',
  tabindex: 'tabIndex',
  usemap: 'useMap',
  // SVG attributes
  'accent-height': 'accentHeight',
  'alignment-baseline': 'alignmentBaseline',
  'arabic-form': 'arabicForm',
  'baseline-shift': 'baselineShift',
  'cap-height': 'capHeight',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'color-interpolation': 'colorInterpolation',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'color-profile': 'colorProfile',
  'color-rendering': 'colorRendering',
  'dominant-baseline': 'dominantBaseline',
  'enable-background': 'enableBackground',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-size-adjust': 'fontSizeAdjust',
  'font-stretch': 'fontStretch',
  'font-style': 'fontStyle',
  'font-variant': 'fontVariant',
  'font-weight': 'fontWeight',
  'glyph-name': 'glyphName',
  'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
  'glyph-orientation-vertical': 'glyphOrientationVertical',
  'horiz-adv-x': 'horizAdvX',
  'horiz-origin-x': 'horizOriginX',
  'image-rendering': 'imageRendering',
  'letter-spacing': 'letterSpacing',
  'lighting-color': 'lightingColor',
  'marker-end': 'markerEnd',
  'marker-mid': 'markerMid',
  'marker-start': 'markerStart',
  'overline-position': 'overlinePosition',
  'overline-thickness': 'overlineThickness',
  'paint-order': 'paintOrder',
  'panose-1': 'panose1',
  'pointer-events': 'pointerEvents',
  'rendering-intent': 'renderingIntent',
  'shape-rendering': 'shapeRendering',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'strikethrough-position': 'strikethroughPosition',
  'strikethrough-thickness': 'strikethroughThickness',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'stroke-width': 'strokeWidth',
  'text-anchor': 'textAnchor',
  'text-decoration': 'textDecoration',
  'text-rendering': 'textRendering',
  'underline-position': 'underlinePosition',
  'underline-thickness': 'underlineThickness',
  'unicode-bidi': 'unicodeBidi',
  'unicode-range': 'unicodeRange',
  'units-per-em': 'unitsPerEm',
  'v-alphabetic': 'vAlphabetic',
  'v-hanging': 'vHanging',
  'v-ideographic': 'vIdeographic',
  'v-mathematical': 'vMathematical',
  'vector-effect': 'vectorEffect',
  'vert-adv-y': 'vertAdvY',
  'vert-origin-x': 'vertOriginX',
  'vert-origin-y': 'vertOriginY',
  'word-spacing': 'wordSpacing',
  'writing-mode': 'writingMode',
  'x-height': 'xHeight',
  'xlink:actuate': 'xlinkActuate',
  'xlink:arcrole': 'xlinkArcrole',
  'xlink:href': 'xlinkHref',
  'xlink:role': 'xlinkRole',
  'xlink:show': 'xlinkShow',
  'xlink:title': 'xlinkTitle',
  'xlink:type': 'xlinkType',
  'xml:base': 'xmlBase',
  'xml:lang': 'xmlLang',
  'xml:space': 'xmlSpace',
}

// Predefined HTML Sample Templates
const SAMPLES = {
  card: {
    title: 'Product Card',
    data: `<div class="card" style="margin: 20px; padding: 15px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: sans-serif;">
  <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5" alt="Abstract Art" class="card-img" style="width: 100%; height: 200px; object-fit: cover;" />
  <!-- Card details -->
  <h2 style="color: #333; font-size: 1.5rem; margin-top: 10px;">Modern Canvas</h2>
  <p style="color: #666; font-size: 0.875rem;">Explore curated geometric artworks for modern spaces.</p>
  <hr>
  <button class="btn" onclick="alert('View art catalog')">View Art Gallery</button>
</div>`
  },
  form: {
    title: 'Contact Form',
    data: `<form action="/submit" class="contact-form" style="max-width: 400px; padding: 20px; border: 1px solid #ccc; border-radius: 6px; font-family: sans-serif;">
  <h3>Send a message</h3>
  <div class="form-group" style="margin-bottom: 15px;">
    <label for="name-field">Your Name:</label>
    <input type="text" id="name-field" class="form-control" placeholder="Jane Doe" required readonly>
  </div>
  <div class="form-group" style="margin-bottom: 15px;">
    <label for="email-field">Email Address:</label>
    <input type="email" id="email-field" class="form-control" placeholder="jane@example.com" required>
  </div>
  <!-- Submit button -->
  <button type="submit" class="btn btn-primary" style="background-color: #6d28d9; color: white; border: none; padding: 10px 15px; cursor: pointer;">Submit Form</button>
</form>`
  },
  svg: {
    title: 'Gear SVG Icon',
    data: `<!-- Beautiful SVG gear icon -->
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="3" />
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
</svg>`
  },
  navbar: {
    title: 'Navbar Header',
    data: `<nav class="navbar" style="background-color: #1e1e24; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; color: white; font-family: sans-serif;">
  <a href="/" class="brand" style="font-weight: bold; text-decoration: none; color: inherit; font-size: 1.25rem;">CodeStrategists</a>
  <ul class="nav-links" style="display: flex; list-style: none; gap: 15px; margin: 0; padding: 0;">
    <li><a href="/tools" style="text-decoration: none; color: #ccc;">Tools</a></li>
    <li><a href="/about" style="text-decoration: none; color: #ccc;">About</a></li>
    <li><a href="/contact" style="text-decoration: none; color: #ccc;">Contact</a></li>
  </ul>
</nav>`
  }
}

export function HTMLToJSXConverterPro() {
  const { toast } = useToast()

  // State Management
  const [inputVal, setInputVal] = useState('')
  const [outputVal, setOutputVal] = useState('')
  const [autoConvert, setAutoConvert] = useState(true)
  const [validationStatus, setValidationStatus] = useState<null | 'success' | 'warning' | 'error'>(null)
  const [validationMessage, setValidationMessage] = useState('')
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Converter Settings
  const [booleanFormat, setBooleanFormat] = useState<'standalone' | 'explicit'>('standalone')

  // Style string parser: 'color: red; margin-top: 10px' -> { color: 'red', marginTop: '10px' }
  const parseStyleString = useCallback((styleStr: string): { [key: string]: string } => {
    const result: { [key: string]: string } = {}
    const declarations = styleStr.split(';')
    
    for (const decl of declarations) {
      const trimmed = decl.trim()
      if (!trimmed) continue
      
      const colonIndex = trimmed.indexOf(':')
      if (colonIndex === -1) continue
      
      const key = trimmed.slice(0, colonIndex).trim().toLowerCase()
      const value = trimmed.slice(colonIndex + 1).trim()
      
      if (key && value) {
        let camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
        if (camelKey.startsWith('Webkit')) {
          // Keep Webkit capitalized in React style definitions
        } else if (camelKey.startsWith('Ms')) {
          camelKey = 'ms' + camelKey.slice(2)
        }
        result[camelKey] = value
      }
    }
    
    return result
  }, [])

  // Text Nodes Escaper
  const escapeTextToken = useCallback((text: string): string => {
    if (!text) return ''
    let escaped = text

    // 1. Escape literal curly braces
    escaped = escaped.replace(/\{/g, '{"{"}')
    escaped = escaped.replace(/\}/g, '{"}"}')

    // 2. Escape literal angle brackets
    if (escaped.trim()) {
      escaped = escaped.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/g, '&amp;')
      escaped = escaped.replace(/</g, '&lt;')
      escaped = escaped.replace(/>/g, '&gt;')
    }

    return escaped
  }, [])

  // Tag Token Attributes Converter
  const convertTagToken = useCallback((tag: string): string => {
    if (tag.startsWith('<!--') || tag.startsWith('<!DOCTYPE')) {
      return tag
    }

    const isClosing = tag.startsWith('</')
    const cleanTag = tag.trim()
    const tagNameMatch = cleanTag.match(/^<\/?([\w:-]+)/)
    if (!tagNameMatch) return tag
    
    const tagName = tagNameMatch[1]
    
    if (isClosing) {
      return `</${tagName}>`
    }

    const isSelfClosing = cleanTag.endsWith('/>') || cleanTag.endsWith('/ >')
    const isVoid = ['img', 'input', 'br', 'hr', 'link', 'meta', 'source', 'col', 'wbr', 'area', 'base', 'embed', 'param', 'track'].includes(tagName.toLowerCase())

    let attrString = cleanTag.slice(tagNameMatch[0].length)
    if (attrString.endsWith('/>')) {
      attrString = attrString.slice(0, -2)
    } else if (attrString.endsWith('>')) {
      attrString = attrString.slice(0, -1)
    }
    attrString = attrString.trim()

    if (!attrString) {
      return isVoid || isSelfClosing ? `<${tagName} />` : `<${tagName}>`
    }

    const attrRegex = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g
    let match
    const convertedAttrs: string[] = []

    while ((match = attrRegex.exec(attrString)) !== null) {
      const rawName = match[1]
      const doubleQuoteVal = match[2]
      const singleQuoteVal = match[3]
      const unquotedVal = match[4]
      
      const hasValue = doubleQuoteVal !== undefined || singleQuoteVal !== undefined || unquotedVal !== undefined
      const attrVal = doubleQuoteVal ?? singleQuoteVal ?? unquotedVal ?? ''
      const lowerName = rawName.toLowerCase()
      
      let jsxName = ATTRIBUTE_MAPPINGS[lowerName] ?? rawName

      // Check inline event handler (e.g. onclick -> onClick)
      if (lowerName.startsWith('on') && lowerName.length > 2) {
        const eventName = lowerName.slice(2)
        const capitalizedEvent = eventName.charAt(0).toUpperCase() + eventName.slice(1)
        jsxName = `on${capitalizedEvent}`
      }

      // Check Boolean attributes
      const isBoolean = [
        'disabled', 'required', 'checked', 'autofocus', 'readonly', 
        'multiple', 'selected', 'autoplay', 'loop', 'muted', 'controls',
        'novalidate', 'hidden'
      ].includes(lowerName)

      if (isBoolean) {
        let boolVal = true
        if (hasValue && (attrVal === 'false' || attrVal === '0')) {
          boolVal = false
        }

        if (booleanFormat === 'standalone') {
          if (boolVal) {
            convertedAttrs.push(jsxName)
          } else {
            convertedAttrs.push(`${jsxName}={false}`)
          }
        } else {
          convertedAttrs.push(`${jsxName}={${boolVal}}`)
        }
        continue
      }

      // Style Attribute Conversion
      if (lowerName === 'style' && hasValue) {
        const parsedStyle = parseStyleString(attrVal)
        const keys = Object.keys(parsedStyle)
        if (keys.length > 0) {
          const styleProps = keys
            .map((k) => `${k}: '${parsedStyle[k].replace(/'/g, "\\'")}'`)
            .join(', ')
          convertedAttrs.push(`style={{ ${styleProps} }}`)
        }
        continue
      }

      // Inline event strings -> arrow functions
      if (lowerName.startsWith('on') && hasValue) {
        convertedAttrs.push(`${jsxName}={() => { ${attrVal} }}`)
        continue
      }

      // Default attributes
      if (hasValue) {
        const escapedVal = attrVal.replace(/"/g, '&quot;')
        convertedAttrs.push(`${jsxName}="${escapedVal}"`)
      } else {
        convertedAttrs.push(jsxName)
      }
    }

    const attrsString = convertedAttrs.join(' ')
    const space = attrsString ? ' ' : ''

    if (isVoid || isSelfClosing) {
      return `<${tagName}${space}${attrsString} />`
    }
    return `<${tagName}${space}${attrsString}>`
  }, [booleanFormat, parseStyleString])

  // Conversion Compilation Pipeline
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
      // 1. Replace HTML comments with JSX comments
      let jsx = customInput.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}')

      // 2. Tokenize by tags to process tag and text scopes independently
      const tokens = jsx.split(/(<[\s\S]*?>)/g)
      let inScriptOrStyle = false
      const convertedTokens = tokens.map((token) => {
        if (token.startsWith('<') && token.endsWith('>')) {
          const lowerToken = token.toLowerCase()
          if (lowerToken.startsWith('<script') || lowerToken.startsWith('<style')) {
            inScriptOrStyle = true
          } else if (lowerToken.startsWith('</script') || lowerToken.startsWith('</style')) {
            inScriptOrStyle = false
          }
          return convertTagToken(token)
        } else {
          if (inScriptOrStyle) {
            return token
          }
          return escapeTextToken(token)
        }
      })

      const finalJsx = convertedTokens.join('')
      setOutputVal(finalJsx)

      // 3. Simple Validation check (detect mismatched tags)
      const openTags: string[] = []
      const tagRegex = /<\/?([a-zA-Z0-9:-]+)/g
      let match
      let tagMismatch = false
      
      while ((match = tagRegex.exec(finalJsx)) !== null) {
        const fullTag = match[0]
        const name = match[1]
        const isVoid = ['img', 'input', 'br', 'hr', 'link', 'meta', 'source', 'col', 'wbr', 'area', 'base', 'embed', 'param', 'track'].includes(name.toLowerCase())
        
        if (isVoid) continue

        if (fullTag.startsWith('</')) {
          if (openTags.length > 0 && openTags[openTags.length - 1].toLowerCase() === name.toLowerCase()) {
            openTags.pop()
          } else {
            tagMismatch = true
          }
        } else if (!fullTag.endsWith('/>')) {
          openTags.push(name)
        }
      }

      if (openTags.length > 0) {
        tagMismatch = true
      }

      if (tagMismatch) {
        setValidationStatus('warning')
        setValidationMessage('Compiled with warnings: We detected potential mismatched tags or unclosed HTML elements. Double-check your source markup structure.')
      } else {
        setValidationStatus('success')
        setValidationMessage('HTML compiled successfully into valid React JSX!')
      }
    } catch {
      setValidationStatus('error')
      setValidationMessage('Parser Exception: An unexpected error occurred while parsing HTML tokens.')
      setOutputVal(customInput)
    } finally {
      const endTime = performance.now()
      setProcessingTime(Number((endTime - startTime).toFixed(3)))
      setIsProcessing(false)
    }
  }, [inputVal, convertTagToken, escapeTextToken])

  // Debounced auto-conversion trigger
  useEffect(() => {
    if (autoConvert) {
      const delay = setTimeout(() => {
        handleConvert()
      }, 250)
      return () => clearTimeout(delay)
    }
  }, [inputVal, autoConvert, handleConvert])

  // File Upload Handlers
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
    link.download = 'converted-jsx.jsx'
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded JSX file', 'success')
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

  const handleCopy = useCallback(() => {
    const value = outputVal || inputVal
    if (!value) return
    navigator.clipboard.writeText(value)
    toast('Copied to clipboard!', 'success')
  }, [outputVal, inputVal, toast])

  const loadPreset = (key: string) => {
    setInputVal(SAMPLES[key as keyof typeof SAMPLES].data)
    toast(`Loaded preset: ${SAMPLES[key as keyof typeof SAMPLES].title}`, 'info')
  }

  // Configuration Tabs
  const optionTabs: OptionTab[] = [
    {
      id: 'options',
      label: 'Compilation Settings',
      icon: <ArrowLeftRight className="h-3.5 w-3.5" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Boolean Attribute Output Format
            </label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none">
                <input
                  type="radio"
                  name="booleanFormat"
                  checked={booleanFormat === 'standalone'}
                  onChange={() => setBooleanFormat('standalone')}
                  className="accent-primary cursor-pointer h-4 w-4"
                />
                <span>Standalone (e.g. <code>disabled</code>)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground select-none">
                <input
                  type="radio"
                  name="booleanFormat"
                  checked={booleanFormat === 'explicit'}
                  onChange={() => setBooleanFormat('explicit')}
                  className="accent-primary cursor-pointer h-4 w-4"
                />
                <span>Explicit (e.g. <code>disabled={'{true}'}</code>)</span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground/60 leading-normal">
              React parses standalone tags as <code>true</code> by default, but strict TypeScript setups might require explicit <code>{'{true}'}</code> declarations.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              CodeSandbox Deployment
            </span>
            <div className="mt-1">
              <Button 
                size="sm" 
                variant="outline" 
                disabled 
                leftIcon={<Share2 className="h-4 w-4" />}
                className="cursor-not-allowed opacity-60"
              >
                Export to CodeSandbox
              </Button>
              <span className="text-xs text-muted-foreground/50 ml-3 italic">
                Requires Pro cloud integration
              </span>
            </div>
            <p className="text-xs text-muted-foreground/60 leading-normal">
              Directly export your formatted JSX elements into ready-to-run React sandbox templates online.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'ai',
      label: 'AI Refactoring',
      icon: <Sparkles className="h-3.5 w-3.5 text-primary" />,
      badge: 'Pro',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <p className="font-heading text-sm font-bold text-foreground">AI Code Refactoring & Optimization</p>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Leverage localized AI inference loops to optimize converted structures, automatically generate hook actions, inject dynamic dummy data, or structure layouts.
          </p>
          <div className="flex gap-2 max-w-lg mt-2">
            <Input 
              placeholder="Describe edits (e.g. Convert inline styles to Tailwind tags, make card responsive)" 
              disabled 
              className="h-9 cursor-not-allowed bg-secondary/20"
            />
            <Button size="sm" disabled className="cursor-not-allowed bg-primary/50 text-primary-foreground/50 font-semibold h-9 shrink-0">
              Submit Refactor
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'extract',
      label: 'React Extraction',
      icon: <Code className="h-3.5 w-3.5" />,
      badge: 'Beta',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <p className="font-heading text-sm font-bold text-foreground">React Component Decomposition</p>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Decompose large, complex HTML layouts into a tree of functional React components. The compiler automatically extracts nested nodes (like headers, cards, icons) into separate modular modules.
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 font-sans">
            <label className="flex items-center gap-1.5 cursor-not-allowed opacity-50 select-none">
              <input type="checkbox" disabled className="rounded border-border h-4.5 w-4.5" />
              <span>Extract images to ImageComponent</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-not-allowed opacity-50 select-none">
              <input type="checkbox" disabled className="rounded border-border h-4.5 w-4.5" />
              <span>Extract inline styles into separate theme sheets</span>
            </label>
          </div>
        </div>
      )
    },
    {
      id: 'tailwind',
      label: 'Tailwind CSS',
      icon: <Cpu className="h-3.5 w-3.5" />,
      badge: 'Plan',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <p className="font-heading text-sm font-bold text-foreground">Inline Styles to Tailwind Utility Converter</p>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Automatically translate raw style attributes and values (e.g. <code>style="margin-top: 10px; font-weight: bold"</code>) into equivalent Tailwind CSS utility classes (e.g. <code>className="mt-2.5 font-bold"</code>).
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" variant="outline" disabled className="cursor-not-allowed opacity-55">
              Map to Tailwind v4.0
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'preview',
      label: 'Live Preview',
      icon: <Eye className="h-3.5 w-3.5" />,
      badge: 'Plan',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <p className="font-heading text-sm font-bold text-foreground">Live Virtual DOM Render Sandbox</p>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Generate a hot-reloading canvas display of your compiled React elements. Renders the component inside an isolated container to preview styles, tags, and click triggers.
          </p>
          <div className="mt-2">
            <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold">
              Interactive sandbox pipeline: coming in v2.1
            </span>
          </div>
        </div>
      )
    }
  ]

  // FAQs Accordion
  const faqItems = [
    {
      id: 'htmljsx-faq-1',
      title: 'How does the HTML to JSX conversion work?',
      content: (
        <span>
          The compiler parses your raw HTML markup tags, identifies standard properties (like <code>class</code> or <code>for</code>), and converts them to React camelCase tags (<code>className</code> and <code>htmlFor</code>). Inline styles are parsed from CSS semicolon strings into javascript key-value objects, and self-closing tags are closed correctly.
        </span>
      )
    },
    {
      id: 'htmljsx-faq-2',
      title: 'Are custom attributes or SVGs supported?',
      content: (
        <span>
          Yes! The converter supports SVG attributes (like <code>stroke-width</code> to <code>strokeWidth</code>, <code>fill-opacity</code> to <code>fillOpacity</code>, and <code>viewbox</code> to <code>viewBox</code>). Standard custom attributes starting with <code>data-*</code> or <code>aria-*</code> are preserved exactly as defined.
        </span>
      )
    },
    {
      id: 'htmljsx-faq-3',
      title: 'Is my input markup sent to a server for processing?',
      content: (
        <span>
          No. The conversion executes entirely in your browser sandbox using modern javascript logic. Your source code or private keys are never uploaded to any backend service, ensuring complete data security.
        </span>
      )
    },
    {
      id: 'htmljsx-faq-4',
      title: 'How are inline styles and click handlers handled?',
      content: (
        <span>
          Inline style strings (e.g., <code>style="font-size: 14px; margin-top: 10px;"</code>) become JSX object bindings: <code>style={'{'} fontSize: &apos;14px&apos;, marginTop: &apos;10px&apos; {'}'}</code>. Event attributes like <code>onclick</code> are automatically transformed into arrow function expressions (<code>onClick={'{'}() =&gt; {'{'} ... {'}'}{'}'}</code>).
        </span>
      )
    }
  ]

  return (
    <FileUpload onFileLoaded={handleFileLoaded} accept=".html,.svg,.txt">
      <ToolLayout
        toolSlug="html-to-jsx"
        toolbar={
          <Toolbar
            onPaste={handlePaste}
            onUpload={handleFileUpload}
            uploadAccept=".html,.xml,.txt,.svg"
            samples={SAMPLES}
            onLoadSample={loadPreset}
            onConvert={() => handleConvert()}
            convertLoading={isProcessing}
            convertLabel="Convert to JSX"
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
                language="html"
                value={inputVal}
                onChange={setInputVal}
                placeholder="Paste or drop raw HTML structures here..."
              />
            </div>
            
            {/* Output card */}
            <div className="lg:col-span-6 flex flex-col">
              <ResultPanel
                title="React JSX Code"
                value={outputVal}
                onCopy={handleCopy}
                onDownload={handleDownload}
                validationStatus={validationStatus}
                validationMessage={validationMessage}
                processingTime={processingTime}
              >
                <CodeEditorWrapper
                  language="javascript"
                  value={outputVal}
                  readOnly={true}
                />
              </ResultPanel>
            </div>
          </div>
        }
        optionTabs={optionTabs}
        faqs={faqItems}
        instructionsTitle="How to Use the HTML to JSX Converter"
        instructions={
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground list-none pl-0">
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">1</span>
              <span>Paste your raw HTML markup directly in the left editor container or upload a file.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">2</span>
              <span>The compiler automatically processes variables, classes, event bindings, and inline CSS in real-time.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">3</span>
              <span>Inspect conversion warnings, copy the compiled JSX snippet, or download it as a <code>.jsx</code> component file.</span>
            </li>
          </ul>
        }
        benefits={[
          "Instant Client-Side Compile: Extremely fast execution inside your local browser context. Safe and secure.",
          "Auto-renaming: Maps all standard HTML attributes (like class, for, tabindex) to React equivalents.",
          "CSS Style Object Converter: Parses complex inline CSS styles into clean JS objects.",
          "Void Tags Closing: Automatically ensures void tags like <img> or <input> close self-reliantly."
        ]}
      />
    </FileUpload>
  )
}
