import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Copy, Download, Trash, RefreshCw, Star, HelpCircle, FileText } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Accordion } from '@/components/ui/Accordion'
import { useToast } from '@/components/ui/Toast'
import { SEO } from '@/components/common/SEO'
import { getToolBySlug, getRelatedTools } from '@/services/toolRegistry'
import type { Tool } from '@/services/toolRegistry'
import { cn } from '@/lib/utils'
import { JSONFormatterPro } from '@/features/formatters/JSONFormatterPro'

export function ToolTemplatePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [inputVal, setInputVal] = useState('')
  const [outputVal, setOutputVal] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)
  const [errorState, setErrorState] = useState<string | null>(null)

  // Find tool details from registry
  const tool = slug ? getToolBySlug(slug) : undefined

  // Redirect to 404 if tool is invalid or coming soon
  useEffect(() => {
    if (!tool || tool.comingSoon) {
      navigate('/404', { replace: true })
    } else {
      // Clear inputs on tool switch
      setInputVal('')
      setOutputVal('')
      setErrorState(null)
    }
  }, [tool, navigate])

  if (!tool) return null

  // Related tools
  const relatedTools = getRelatedTools(tool, 3)

  // Auto-run a mock transformer just to demonstrate visual updates
  useEffect(() => {
    if (!inputVal.trim()) {
      setOutputVal('')
      setErrorState(null)
      return
    }

    try {
      // Simple mock compilation rules based on tool slug
      if (tool.id === 'json-formatter') {
        const parsed = JSON.parse(inputVal)
        setOutputVal(JSON.stringify(parsed, null, 2))
        setErrorState(null)
      } else if (tool.id === 'base64-converter') {
        // Mock Base64
        setOutputVal(btoa(inputVal))
        setErrorState(null)
      } else {
        // Fallback mock: just reverse the text string to show reaction
        setOutputVal(inputVal.split('').reverse().join(''))
        setErrorState(null)
      }
    } catch (err) {
      // Show validation errors visually
      setErrorState(err instanceof Error ? err.message : 'Invalid structure syntax')
      setOutputVal('')
    }
  }, [inputVal, tool.id])

  // Load sample example
  const loadExample = () => {
    if (tool.id === 'json-formatter') {
      setInputVal('{"name":"Frontend Workspace","version":"2.0.0","active":true,"features":["Converters","Formatters","Validators"]}')
      toast('Loaded JSON example configuration', 'info')
    } else if (tool.id === 'base64-converter') {
      setInputVal('Welcome to Workspace.ai!')
      toast('Loaded Base64 example string', 'info')
    } else {
      setInputVal('This is a mock sample text input.')
      toast('Loaded placeholder utility example', 'info')
    }
  }

  // Action: Clear
  const clearInput = () => {
    setInputVal('')
    setOutputVal('')
    setErrorState(null)
    toast('Cleared workspace panels', 'info')
  }

  // Action: Copy to clipboard
  const copyOutput = () => {
    if (!outputVal) return
    navigator.clipboard.writeText(outputVal)
    toast('Copied result to clipboard!', 'success')
  }

  // Action: Download as file
  const downloadOutput = () => {
    if (!outputVal) return
    const fileExtension = tool.id === 'json-formatter' ? 'json' : 'txt'
    const blob = new Blob([outputVal], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${tool.slug}-result.${fileExtension}`
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded result file', 'success')
  }

  // Mock FAQs
  const toolFaqs = [
    {
      id: 'tool-faq-1',
      title: `How do I use the ${tool.title}?`,
      content: `Simply paste your input text or code into the left editor panel. The application will validate the structure in real-time, displaying syntax issues below. The parsed results are rendered instantly in the right output panel.`,
    },
    {
      id: 'tool-faq-2',
      title: 'Is this tool secure to use with private keys or user data?',
      content: `Yes, completely secure. All calculations occur inside your browser using sandboxed JavaScript context. No network API calls are triggered, ensuring your secrets never leave your device.`,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 transition-colors duration-300">
      <SEO
        title={tool.seoTitle || `${tool.title} - Frontend Workspace AI`}
        description={tool.seoDescription || tool.description}
      />

      {/* Header section */}
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: 'Catalog', href: '/tools' }, { label: tool.title }]} />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              {tool.title}
              <button
                onClick={() => {
                  setIsFavorited((prev) => !prev)
                  toast(isFavorited ? 'Removed from favorites' : 'Added to favorites', 'success')
                }}
                className="text-muted-foreground hover:text-yellow-500 transition-colors cursor-pointer"
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={cn('h-5 w-5', isFavorited && 'text-yellow-500 fill-current')} />
              </button>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{tool.description}</p>
          </div>

          {/* Top header buttons */}
          {tool.id !== 'json-formatter' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadExample} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                Load Example
              </Button>
              <Button variant="outline" size="sm" onClick={clearInput} leftIcon={<Trash className="h-3.5 w-3.5" />}>
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      {tool.id === 'json-formatter' ? (
        <JSONFormatterPro />
      ) : (
        <>
          {/* Interactive dual column workspace panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
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
                
                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={copyOutput}
                    disabled={!outputVal}
                    aria-label="Copy output"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={downloadOutput}
                    disabled={!outputVal}
                    aria-label="Download output"
                  >
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

          {/* Guide details / related tools layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            
            {/* Info guide & FAQs */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card className="bg-card/45 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed flex flex-col gap-3">
                  <p>
                    The <strong>{tool.title}</strong> is a dedicated sandboxed utility configured for {tool.category} workflows.
                  </p>
                  <p>
                    Simply supply the data format inside the Input panel. The client-side parse listener handles parsing syntax tokens, checks formatting parameters, and outputs clean compiled results without triggering network requests.
                  </p>
                </CardContent>
              </Card>

              {/* Category FAQ */}
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <HelpCircle className="h-4.5 w-4.5 text-primary" />
                  Frequently Asked Questions
                </h2>
                <Accordion items={toolFaqs} />
              </div>
            </div>

            {/* Related tools sidebar column */}
            <div className="flex flex-col gap-6">
              <Card className="bg-card/65 border-border">
                <CardHeader>
                  <CardTitle className="font-heading text-base">Related Utilities</CardTitle>
                  <CardDescription className="text-xs">Similar tools you might need.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col divide-y divide-border/40">
                    {relatedTools.map((rel) => (
                      <Link
                        key={rel.id}
                        to={`/tool/${rel.slug}`}
                        className="flex flex-col gap-1 p-4 hover:bg-secondary/40 transition-colors"
                      >
                        <span className="font-heading text-sm font-semibold text-foreground">{rel.title}</span>
                        <span className="text-[10px] text-muted-foreground line-clamp-1">{rel.description}</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </>
      )}
    </div>
  )
}
