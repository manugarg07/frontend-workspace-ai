import React, { useState, useEffect, lazy, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { LoadingState } from '@/components/ui/FeedbackStates'
import { ToolLayout } from '@/components/common/ToolLayout'
import { 
  getToolBySlug, 
  getToolWithDefaults,
} from '@/services/toolRegistry'
import { trackToolUsage } from '@/services/popularityService'
import { analytics } from '@/services/analyticsService'

// Lazy loaded feature components
const JSONFormatterPro = lazy(() => import('@/features/formatters/JSONFormatterPro').then(m => ({ default: m.JSONFormatterPro })))
const HTMLToJSXConverterPro = lazy(() => import('@/features/converters/HTMLToJSXConverterPro').then(m => ({ default: m.HTMLToJSXConverterPro })))
const CSSToTailwindConverterPro = lazy(() => import('@/features/converters/CSSToTailwindConverterPro').then(m => ({ default: m.CSSToTailwindConverterPro })))
const SVGToReactGeneratorPro = lazy(() => import('@/features/converters/SVGToReactGeneratorPro').then(m => ({ default: m.SVGToReactGeneratorPro })))
const Base64ConverterPro = lazy(() => import('@/features/converters/Base64ConverterPro').then(m => ({ default: m.Base64ConverterPro })))
const JWTDecoderPro = lazy(() => import('@/features/validators/JWTDecoderPro').then(m => ({ default: m.JWTDecoderPro })))
const UUIDGeneratorPro = lazy(() => import('@/features/generators/UUIDGeneratorPro').then(m => ({ default: m.UUIDGeneratorPro })))
const PasswordGeneratorPro = lazy(() => import('@/features/generators/PasswordGeneratorPro').then(m => ({ default: m.PasswordGeneratorPro })))
const RegexTesterPro = lazy(() => import('@/features/utilities/RegexTesterPro').then(m => ({ default: m.RegexTesterPro })))
const URLEncoderPro = lazy(() => import('@/features/converters/URLEncoderPro').then(m => ({ default: m.URLEncoderPro })))

const CUSTOM_TOOLS: Record<string, React.ComponentType> = {
  'json-formatter': JSONFormatterPro,
  'html-to-jsx': HTMLToJSXConverterPro,
  'css-to-tailwind': CSSToTailwindConverterPro,
  'svg-to-react': SVGToReactGeneratorPro,
  'base64-converter': Base64ConverterPro,
  'jwt-decoder': JWTDecoderPro,
  'uuid-generator': UUIDGeneratorPro,
  'password-generator': PasswordGeneratorPro,
  'regex-tester': RegexTesterPro,
  'url-encoder': URLEncoderPro,
}

export function ToolTemplatePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [inputVal, setInputVal] = useState('')
  const [outputVal, setOutputVal] = useState('')
  const [errorState, setErrorState] = useState<string | null>(null)

  // Find tool details from registry
  const toolRaw = slug ? getToolBySlug(slug) : undefined
  const tool = toolRaw ? getToolWithDefaults(toolRaw) : undefined

  // Redirect to 404 if tool is invalid or coming soon
  useEffect(() => {
    if (!tool || tool.comingSoon) {
      navigate('/404', { replace: true })
    } else {
      // Clear inputs on tool switch
      setInputVal('')
      setOutputVal('')
      setErrorState(null)
      trackToolUsage(tool.id)
      analytics.trackToolOpened(tool.id)
    }
  }, [slug, navigate, tool])

  // Auto-run a mock transformer just to demonstrate visual updates for generic tools
  useEffect(() => {
    if (!tool) return
    if (CUSTOM_TOOLS[tool.id]) return

    if (!inputVal.trim()) {
      setOutputVal('')
      setErrorState(null)
      return
    }

    try {
      setOutputVal(inputVal.split('').reverse().join(''))
      setErrorState(null)
    } catch (err) {
      setErrorState(err instanceof Error ? err.message : 'Invalid structure syntax')
      setOutputVal('')
    }
  }, [inputVal, tool])

  if (!tool) return null

  // Check if it's a custom tool
  const CustomComponent = CUSTOM_TOOLS[tool.id]

  if (CustomComponent) {
    return (
      <Suspense fallback={<LoadingState message={`Initializing ${tool.title}...`} />}>
        <CustomComponent />
      </Suspense>
    )
  }

  // Action: Copy to clipboard for generic tool
  const copyOutput = () => {
    if (!outputVal) return
    navigator.clipboard.writeText(outputVal)
    toast('Copied result to clipboard!', 'success')
  }

  // Action: Download as file for generic tool
  const downloadOutput = () => {
    if (!outputVal) return
    const blob = new Blob([outputVal], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${tool.slug}-result.txt`
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded result file', 'success')
  }

  const genericEditorSection = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch w-full">
      {/* Input Panel */}
      <Card className="flex flex-col bg-card/60 relative border-border">
        <CardHeader className="p-4 border-b border-border/40 flex flex-row justify-between items-center bg-secondary/10">
          <CardTitle className="font-heading text-sm text-muted-foreground uppercase tracking-wider font-semibold">Input Panel</CardTitle>
          <Badge variant="outline">{tool.category}</Badge>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col gap-2 min-h-[300px]">
          <Textarea
            placeholder={`Paste your raw input here...`}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 resize-y min-h-[250px] focus-ring"
          />
          {errorState && (
            <span className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg font-mono">
              {errorState}
            </span>
          )}
        </CardContent>
      </Card>

      {/* Output Panel */}
      <Card className="flex flex-col bg-card/60 relative border-border">
        <CardHeader className="p-4 border-b border-border/40 flex flex-row justify-between items-center bg-secondary/10">
          <CardTitle className="font-heading text-sm text-muted-foreground uppercase tracking-wider font-semibold">Output Panel</CardTitle>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={copyOutput} disabled={!outputVal} aria-label="Copy output">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={downloadOutput} disabled={!outputVal} aria-label="Download output">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col min-h-[300px]">
          <Textarea
            placeholder="Compiled result will display here..."
            value={outputVal}
            readOnly
            className="flex-1 bg-secondary/20 text-foreground/90 font-mono resize-y min-h-[250px]"
          />
        </CardContent>
      </Card>
    </div>
  )

  const faqItems = tool.faqs.map((f, index) => ({
    id: `faq-${index}`,
    title: f.question,
    content: <span>{f.answer}</span>
  }))

  return (
    <ToolLayout
      toolSlug={tool.slug}
      editorSection={genericEditorSection}
      instructionsTitle={`About ${tool.title}`}
      instructions={<p>{tool.longDescription}</p>}
      benefits={tool.benefits}
      faqs={faqItems}
    />
  )
}
