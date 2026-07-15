import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as Lucide from 'lucide-react'
import { 
  Terminal, 
  ArrowRight, 
  Zap, 
  Shield, 
  Cpu,
  LayoutDashboard, 
  Sparkles, 
  Check, 
  Copy, 
  Sliders, 
  FileCode, 
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Accordion } from '@/components/ui/Accordion'
import { SEO } from '@/components/common/SEO'
import { ToolCard } from '@/components/ui/ToolCard'
import { TOOLS, CATEGORIES } from '@/services/toolRegistry'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/Toast'
import { Star, Mail } from 'lucide-react'

export function LandingPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [activeSandboxTab, setActiveSandboxTab] = useState<'json' | 'jwt' | 'svg' | 'glass'>('json')
  const [isProcessing, setIsProcessing] = useState(false)
  const [copiedTab, setCopiedTab] = useState<string | null>(null)
  const [isYearly, setIsYearly] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    toast('Successfully subscribed to our newsletter updates!', 'success')
    setNewsletterEmail('')
  }

  // Sandbox inputs
  const [jsonInput, setJsonInput] = useState(
    '{"status":"ok","code":200,"data":{"user":{"name":"Alex Rivera","role":"Lead Architect","skills":["React","TypeScript","Node"]}}}'
  )
  const [jsonOutput, setJsonOutput] = useState(
    '{\n  "status": "ok",\n  "code": 200,\n  "data": {\n    "user": {\n      "name": "Alex Rivera",\n      "role": "Lead Architect",\n      "skills": [\n        "React",\n        "TypeScript",\n        "Node"\n      ]\n    }\n  }\n}'
  )

  const [jwtInput, setJwtInput] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTI5ODMiLCJuYW1lIjoiTWFudSBHYXJnIiwiZW1haWwiOiJtYW51QGV4YW1wbGUuY29tIiwiZXhwIjoxNzg5MzA1NjAwfQ.signature'
  )
  const [jwtOutput, setJwtOutput] = useState(
    '// Decoded Header\n{\n  "alg": "HS256",\n  "typ": "JWT"\n}\n\n// Decoded Payload\n{\n  "user_id": "12983",\n  "name": "Manu Garg",\n  "email": "manu@example.com",\n  "exp": 1789305600\n}'
  )

  const [svgInput, setSvgInput] = useState(
    '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">\n  <circle cx="12" cy="12" r="10"/>\n  <path d="M12 8v4l3 3"/>\n</svg>'
  )
  const [svgOutput, setSvgOutput] = useState(
    "import React from 'react';\n\nexport function ClockIcon(props: React.SVGProps<SVGSVGElement>) {\n  return (\n    <svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\">\n      <circle cx=\"12\" cy=\"12\" r=\"10\"/>\n      <path d=\"M12 8v4l3 3\"/>\n    </svg>\n  );\n}"
  )

  // Glassmorphism sliders
  const [glassBlur, setGlassBlur] = useState(12)
  const [glassOpacity, setGlassOpacity] = useState(30)
  const [glassColor, setGlassColor] = useState('#6d28d9') // Violet primary
  const [glassBorder, setGlassBorder] = useState(15)

  // Grab the featured / popular tools
  const popularTools = TOOLS.filter((t) => t.popular && !t.comingSoon).slice(0, 4)

  const faqs = [
    {
      id: 'faq-1',
      title: 'Is my data safe on Workspace.ai?',
      content: 'Absolutely. Workspace.ai runs 100% locally in your browser. None of your data, code, or API payloads are ever sent to a server. All computations are handled via web sandboxes inside your local environment, making it safe for proprietary production keys and credentials.',
    },
    {
      id: 'faq-2',
      title: 'Can I add custom shortcuts or tools?',
      content: 'Yes! The architecture is built to be modular and highly extensible. Developers can easily declare new config schemas in the registry, connect React components, and build custom pipelines. The workspace search, command palette, and UI styling wrap them automatically.',
    },
    {
      id: 'faq-3',
      title: 'How does offline support work?',
      content: 'Because everything is client-side, Workspace.ai functions completely offline once the static assets are loaded. You can bookmark the application, run conversions on flights, in remote workspaces, or behind secure corporate firewalls without any network connectivity.',
    },
    {
      id: 'faq-4',
      title: 'Is there a limit to tool executions?',
      content: 'No. Since resources are drawn directly from your browser, there are no rate limits, execution fees, or quotas. Prettify gigabyte-scale JSON dumps, generate custom grids, or inspect payloads infinitely.',
    },
  ]

  const handleRunSandbox = () => {
    setIsProcessing(true)
    setTimeout(() => {
      try {
        if (activeSandboxTab === 'json') {
          const parsed = JSON.parse(jsonInput)
          setJsonOutput(JSON.stringify(parsed, null, 2))
        } else if (activeSandboxTab === 'jwt') {
          const parts = jwtInput.split('.')
          if (parts.length >= 2) {
            const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
            setJwtOutput(`// Decoded Header\n${JSON.stringify(header, null, 2)}\n\n// Decoded Payload\n${JSON.stringify(payload, null, 2)}`)
          } else {
            setJwtOutput('Error: Invalid JWT token structure.')
          }
        } else if (activeSandboxTab === 'svg') {
          const cleanSvg = svgInput.trim()
          const componentName = 'ClockIcon'
          const jsxBody = cleanSvg
            .replace(/class=/g, 'className=')
            .replace(/stroke-width=/g, 'strokeWidth=')
            .replace(/stroke-linecap=/g, 'strokeLinecap=')
            .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
            .replace(/fill-rule=/g, 'fillRule=')
            .replace(/clip-rule=/g, 'clipRule=')
          
          setSvgOutput(`import React from 'react';\n\nexport function ${componentName}(props: React.SVGProps<SVGSVGElement>) {\n  return (\n    ${jsxBody.split('\n').map(line => '    ' + line).join('\n').trim()}\n  );\n}`)
        }
      } catch (e: any) {
        if (activeSandboxTab === 'json') setJsonOutput(`Syntax Error: ${e.message}`)
        else if (activeSandboxTab === 'jwt') setJwtOutput(`Decode Error: ${e.message}`)
        else if (activeSandboxTab === 'svg') setSvgOutput(`Conversion Error: ${e.message}`)
      } finally {
        setIsProcessing(false)
      }
    }, 450)
  }

  const handleCopyToClipboard = (text: string, tab: string) => {
    navigator.clipboard.writeText(text)
    setCopiedTab(tab)
    setTimeout(() => setCopiedTab(null), 2000)
  }

  // Get CSS string for Glassmorphism
  const getGlassStyle = () => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result 
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '255, 255, 255'
    }
    const rgb = hexToRgb(glassColor)
    const op = (glassOpacity / 100).toFixed(2)
    const borderOp = (glassBorder / 100).toFixed(2)
    return {
      style: {
        background: `rgba(${rgb}, ${op})`,
        backdropFilter: `blur(${glassBlur}px)`,
        WebkitBackdropFilter: `blur(${glassBlur}px)`,
        border: `1px solid rgba(255, 255, 255, ${borderOp})`,
      },
      code: `background: rgba(${rgb}, ${op});\nbackdrop-filter: blur(${glassBlur}px);\n-webkit-backdrop-filter: blur(${glassBlur}px);\nborder: 1px solid rgba(255, 255, 255, ${borderOp});`
    }
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-background text-foreground grid-bg">
      <SEO />

      {/* Decorative Blur Ambient Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-[450px] h-[450px] rounded-full bg-indigo-600/10 blur-[110px] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center z-10" aria-label="Hero">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-primary" />
            <span className="font-heading">Introducing Workspace 2.0</span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] max-w-5xl mx-auto"
        >
          One unified sandbox for{' '}
          <span className="bg-gradient-to-r from-primary via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            frontend engineers
          </span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed font-sans"
        >
          Stop switching tabs. Format JSON payloads, decode JWT tokens, optimize SVG layouts, and test components locally inside a completely client-side, zero-latency dashboard.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <Button
            size="lg"
            variant="primary"
            leftIcon={<LayoutDashboard className="h-5 w-5" />}
            onClick={() => navigate('/workspace')}
            className="shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all duration-300 font-semibold"
          >
            Launch Workspace
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/tools')}
            rightIcon={<ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            className="font-semibold border-border hover:bg-secondary/40"
          >
            Explore Catalog
          </Button>
        </motion.div>

        {/* Interactive Workspace Sandbox Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-5xl mx-auto border border-border/80 bg-card/65 rounded-2xl shadow-premium glass-panel overflow-hidden text-left"
        >
          {/* Editor Header Bar */}
          <div className="border-b border-border/60 bg-muted/65 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 block" />
              </div>
              <span className="text-xs font-mono text-muted-foreground ml-2 select-none">
                sandbox@workspace.ai: ~
              </span>
            </div>
            
            {/* Tab Toggles */}
            <div className="flex items-center bg-secondary/80 p-0.5 rounded-lg border border-border/50 text-xs font-medium">
              <button
                onClick={() => { setActiveSandboxTab('json'); setCopiedTab(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeSandboxTab === 'json'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Format JSON</span>
              </button>
              <button
                onClick={() => { setActiveSandboxTab('jwt'); setCopiedTab(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeSandboxTab === 'jwt'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Decode JWT</span>
              </button>
              <button
                onClick={() => { setActiveSandboxTab('svg'); setCopiedTab(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeSandboxTab === 'svg'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>SVG to React</span>
              </button>
              <button
                onClick={() => { setActiveSandboxTab('glass'); setCopiedTab(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeSandboxTab === 'glass'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>CSS Glass</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Client-Side</span>
            </div>
          </div>

          {/* Sandbox Playground Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
            {/* Left Side: Input & Settings (Col 5) */}
            <div className="md:col-span-5 p-6 border-b md:border-b-0 md:border-r border-border/50 flex flex-col justify-between bg-card/40">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Input Source
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {activeSandboxTab === 'json' && 'payload.json'}
                    {activeSandboxTab === 'jwt' && 'token.jwt'}
                    {activeSandboxTab === 'svg' && 'vector.svg'}
                    {activeSandboxTab === 'glass' && 'config.css'}
                  </span>
                </div>

                {/* Render corresponding input */}
                {activeSandboxTab === 'json' && (
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="flex-1 min-h-[200px] w-full bg-secondary/20 hover:bg-secondary/30 focus:bg-secondary/40 border border-border/50 rounded-lg p-3 font-mono text-xs focus:outline-none transition-all resize-none text-foreground"
                    placeholder="Paste messy JSON here..."
                  />
                )}

                {activeSandboxTab === 'jwt' && (
                  <textarea
                    value={jwtInput}
                    onChange={(e) => setJwtInput(e.target.value)}
                    className="flex-1 min-h-[200px] w-full bg-secondary/20 hover:bg-secondary/30 focus:bg-secondary/40 border border-border/50 rounded-lg p-3 font-mono text-xs focus:outline-none transition-all resize-none text-foreground break-all"
                    placeholder="Paste base64-encoded JWT token here..."
                  />
                )}

                {activeSandboxTab === 'svg' && (
                  <textarea
                    value={svgInput}
                    onChange={(e) => setSvgInput(e.target.value)}
                    className="flex-1 min-h-[200px] w-full bg-secondary/20 hover:bg-secondary/30 focus:bg-secondary/40 border border-border/50 rounded-lg p-3 font-mono text-xs focus:outline-none transition-all resize-none text-foreground"
                    placeholder="Paste SVG XML here..."
                  />
                )}

                {activeSandboxTab === 'glass' && (
                  <div className="space-y-5 flex-1 justify-center flex flex-col py-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Backdrop Blur</span>
                        <span className="text-primary font-mono">{glassBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        value={glassBlur}
                        onChange={(e) => setGlassBlur(Number(e.target.value))}
                        className="w-full accent-primary bg-secondary/50 rounded-lg h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Opacity</span>
                        <span className="text-primary font-mono">{glassOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="90"
                        value={glassOpacity}
                        onChange={(e) => setGlassOpacity(Number(e.target.value))}
                        className="w-full accent-primary bg-secondary/50 rounded-lg h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Border Opacity</span>
                        <span className="text-primary font-mono">{glassBorder}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={glassBorder}
                        onChange={(e) => setGlassBorder(Number(e.target.value))}
                        className="w-full accent-primary bg-secondary/50 rounded-lg h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground block">
                        Overlay Glow Tint Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={glassColor}
                          onChange={(e) => setGlassColor(e.target.value)}
                          className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                        />
                        <span className="text-xs font-mono uppercase text-muted-foreground">
                          {glassColor}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {activeSandboxTab !== 'glass' && (
                <Button
                  onClick={handleRunSandbox}
                  isLoading={isProcessing}
                  className="w-full mt-4 bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/25"
                >
                  {activeSandboxTab === 'json' && 'Format Sandbox Output'}
                  {activeSandboxTab === 'jwt' && 'Decode Claims'}
                  {activeSandboxTab === 'svg' && 'Convert to JSX'}
                </Button>
              )}
            </div>

            {/* Right Side: Output Preview (Col 7) */}
            <div className="md:col-span-7 p-6 flex flex-col justify-between bg-black/25">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2Icon className="h-3.5 w-3.5" /> Output Sandbox
                  </span>

                  {activeSandboxTab !== 'glass' && (
                    <button
                      onClick={() => {
                        const out = activeSandboxTab === 'json' ? jsonOutput : activeSandboxTab === 'jwt' ? jwtOutput : svgOutput
                        handleCopyToClipboard(out, activeSandboxTab)
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary/40 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-border/40 transition-all cursor-pointer"
                    >
                      {copiedTab === activeSandboxTab ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Raw Code</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Display Output */}
                <div className="flex-1 min-h-[220px] rounded-lg border border-border/30 bg-black/40 p-4 font-mono text-xs overflow-auto max-h-[300px] flex flex-col justify-between">
                  {activeSandboxTab === 'glass' ? (
                    <div className="flex-1 flex flex-col justify-between h-full">
                      {/* Live glassmorphism render showcase */}
                      <div className="w-full h-24 rounded-lg relative overflow-hidden flex items-center justify-center border border-border/20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/60 via-slate-900 to-black select-none mb-4">
                        {/* Interactive floating decorative element */}
                        <div className="absolute w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 blur-sm animate-pulse left-1/4" />
                        <div className="absolute w-14 h-14 rounded bg-gradient-to-r from-blue-500 to-violet-500 blur-md right-1/4" />
                        
                        {/* Real-time styled Glass overlay card */}
                        <div 
                          className="z-10 px-6 py-3 rounded-xl shadow-lg text-[11px] font-heading font-semibold text-white tracking-wide"
                          style={getGlassStyle().style}
                        >
                          Glassmorphic Preview
                        </div>
                      </div>

                      {/* Code string display */}
                      <div className="relative">
                        <pre className="text-[10px] sm:text-xs text-purple-300 leading-relaxed select-all">
                          {getGlassStyle().code}
                        </pre>
                        <button
                          onClick={() => handleCopyToClipboard(getGlassStyle().code, 'glass')}
                          className="absolute right-0 bottom-0 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/50 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/70 border border-border/40 transition-all cursor-pointer"
                        >
                          {copiedTab === 'glass' ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>Copy CSS</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <pre className="text-emerald-300 leading-relaxed select-all whitespace-pre">
                      {activeSandboxTab === 'json' && (jsonOutput || '// Outputs pretty JSON...')}
                      {activeSandboxTab === 'jwt' && (jwtOutput || '// Outputs token credentials...')}
                      {activeSandboxTab === 'svg' && (svgOutput || '// Outputs React functional component...')}
                    </pre>
                  )}
                </div>
              </div>

              {/* Interaction Callout */}
              <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  Your configurations never leave your device
                </span>
                <span className="font-mono text-[10px] opacity-75">
                  Press Cmd+K to launch palette
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature section: Premium layout with hover border glow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40 w-full relative z-10" aria-label="Core benefits">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Optimized for extreme efficiency
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            No server calls, no database bottlenecks. A sandboxed interface built for productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hoverable className="bg-card/45 border-border/60 group relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
            <CardHeader className="p-8">
              <div className="h-12 w-12 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <CardTitle className="font-heading text-xl mb-2 group-hover:text-primary transition-colors">
                Instant Latency
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                Zero network roundtrips. Computations compile directly inside WebAssembly containers in your browser viewport. Instantly format massive payloads.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card hoverable className="bg-card/45 border-border/60 group relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
            <CardHeader className="p-8">
              <div className="h-12 w-12 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6" />
              </div>
              <CardTitle className="font-heading text-xl mb-2 group-hover:text-primary transition-colors">
                100% Client Security
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                Your keys and authorization headers are never uploaded to the cloud. Your secrets stay completely sandboxed inside local state variables. Safe for corporate data.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card hoverable className="bg-card/45 border-border/60 group relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
            <CardHeader className="p-8">
              <div className="h-12 w-12 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="h-6 w-6" />
              </div>
              <CardTitle className="font-heading text-xl mb-2 group-hover:text-primary transition-colors">
                Command-First Control
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                Unlock keyboard-driven shortcuts. Hit Ctrl+K from anywhere to invoke our registry index, filter active utilities, and cycle layout tools using pure keyboard focus.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Workflow Section: Visual Pipeline Diagram */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40 w-full text-center relative z-10" aria-label="How it works">
        <div className="mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Unified Utility Pipeline
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            A three-step reactive processing layout that lets you optimize raw elements without leaving your viewport.
          </p>
        </div>

        {/* Visual Pipeline Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch relative">
          
          {/* Connector Arrow Line Decorator (Desktop only) */}
          <div className="hidden lg:block absolute top-1/2 left-1/3 w-12 border-t-2 border-dashed border-primary/20 -translate-y-1/2 -ml-6" />
          <div className="hidden lg:block absolute top-1/2 left-2/3 w-12 border-t-2 border-dashed border-primary/20 -translate-y-1/2 -ml-6" />

          {/* Step 1 */}
          <div className="border border-border/80 bg-card/50 hover:bg-card/75 transition-all duration-300 rounded-2xl p-8 flex flex-col justify-between hover:border-primary/20 shadow-sm relative group overflow-hidden">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-lg group-hover:bg-primary/10 transition-all" />
            <div>
              <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Step 01
              </span>
              <h3 className="font-heading text-xl font-bold text-foreground mt-4 mb-3">Input Injection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Paste your unformatted minified structures, JWT credentials, or raw vector definitions. The system initializes state variables instantly.
              </p>
            </div>
            <div className="bg-black/30 border border-border/40 p-4 rounded-xl font-mono text-[10px] text-muted-foreground text-left leading-relaxed">
              <span className="text-blue-400">const</span> rawPayload = <span className="text-yellow-400">`{"{"}"user_id":"929"{"}"}`</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border border-border/80 bg-card/50 hover:bg-card/75 transition-all duration-300 rounded-2xl p-8 flex flex-col justify-between hover:border-primary/20 shadow-sm relative group overflow-hidden">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-lg group-hover:bg-primary/10 transition-all" />
            <div>
              <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Step 02
              </span>
              <h3 className="font-heading text-xl font-bold text-foreground mt-4 mb-3">Isolated Parsing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Under the hood, local compiler scripts examine tokens, validate schema definitions, check compliance structures, and flag syntactic bugs inline.
              </p>
            </div>
            <div className="bg-black/30 border border-border/40 p-4 rounded-xl flex items-center justify-center gap-2.5 font-heading font-semibold text-xs text-emerald-400 h-12">
              <Zap className="h-4 w-4 animate-bounce text-emerald-400" />
              <span>Parsing Validated Successfully</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border border-border/80 bg-card/50 hover:bg-card/75 transition-all duration-300 rounded-2xl p-8 flex flex-col justify-between hover:border-primary/20 shadow-sm relative group overflow-hidden">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-lg group-hover:bg-primary/10 transition-all" />
            <div>
              <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Step 03
              </span>
              <h3 className="font-heading text-xl font-bold text-foreground mt-4 mb-3">Copy-to-Clipboard</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Export standard layouts, copy code chunks, or copy optimized React component code directly. Ready for deployment inside your local project codebase.
              </p>
            </div>
            <div className="bg-primary hover:bg-primary/95 text-primary-foreground p-4 rounded-xl flex items-center justify-center gap-2 font-heading font-semibold text-xs transition-all shadow-md shadow-primary/10">
              <Copy className="h-4 w-4" /> Copy Clean Code
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tools Catalogue */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40 w-full relative z-10" aria-label="Popular tools">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight mb-2">Voted Developer Favorites</h2>
            <p className="text-sm text-muted-foreground">Jump directly into our most popular daily utilities.</p>
          </div>
          <Link to="/tools" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/90 hover:underline mt-4 sm:mt-0 group">
            View All Utilities <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              layout="landing"
            />
          ))}
        </div>
      </section>

      {/* Explore Categories: Premium Grid with animated tiles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40 w-full relative z-10" aria-label="Categories">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl font-bold tracking-tight mb-4">
            Structured workspace utility catalog
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Find specialized conversion layers, style engines, validators, and generators mapped by purpose.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => {
            const CatIcon = (Lucide as any)[cat.icon] || Cpu
            return (
              <Link key={cat.id} to={`/tools?category=${cat.id}`} className="group block h-full">
                <div className="border border-border/50 bg-card/35 hover:bg-card/85 hover:border-primary/45 rounded-2xl p-5 text-center transition-all duration-300 h-full flex flex-col items-center justify-center gap-3 hover:shadow-md">
                  <div className="h-10 w-10 bg-secondary/50 rounded-xl text-muted-foreground flex items-center justify-center group-hover:text-primary group-hover:bg-primary/5 transition-all">
                    <CatIcon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-foreground leading-tight">
                    {cat.title}
                  </h3>
                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-mono font-medium">
                    Explore items
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Pricing Mock Panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40 w-full relative z-10" aria-label="Pricing">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Transparent pricing plans
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
            Our core workspace elements will always remain free. Pro tiers are available for team templates and synchronization layers.
          </p>

          {/* Monthly/Yearly billing period selector toggle */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className={`text-sm ${!isYearly ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-12 h-6.5 rounded-full bg-secondary border border-border/60 transition-colors focus:outline-none focus-ring cursor-pointer"
            >
              <div 
                className={`absolute top-1 left-1 w-4.5 h-4.5 rounded-full bg-primary transition-transform ${
                  isYearly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-foreground font-semibold' : 'text-muted-foreground'} flex items-center gap-1.5`}>
              Yearly
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                Save 25%
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
          {/* Free Tier */}
          <div className="border border-border/80 bg-card/45 hover:bg-card/65 transition-all duration-300 rounded-2xl p-8 flex flex-col justify-between group">
            <div>
              <h3 className="font-heading text-xl font-bold text-foreground">Standard Developer</h3>
              <p className="text-sm text-muted-foreground mt-1">Perfect for individual developers.</p>
              <div className="my-8">
                <span className="font-heading text-5xl font-extrabold text-foreground">$0</span>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider ml-2">/ Free Forever</span>
              </div>
              <ul className="space-y-4 text-sm text-muted-foreground border-t border-border/30 pt-6">
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>All standard client sandboxes</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>100% offline access support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>No account requirements</span>
                </li>
              </ul>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-8 border-border hover:bg-secondary/40 font-semibold" 
              onClick={() => navigate('/workspace')}
            >
              Start Developing
            </Button>
          </div>

          {/* Pro Tier */}
          <div className="border-2 border-primary bg-card/75 rounded-2xl p-8 flex flex-col justify-between relative shadow-premium overflow-hidden group">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl font-heading shadow-md">
              Recommended
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-foreground">Workspace Pro</h3>
              <p className="text-sm text-muted-foreground mt-1">Synchronization, team layouts, and custom scripts.</p>
              <div className="my-8">
                <span className="font-heading text-5xl font-extrabold text-foreground">
                  ${isYearly ? '6' : '8'}
                </span>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider ml-2">
                  / user / month {isYearly && '(billed yearly)'}
                </span>
              </div>
              <ul className="space-y-4 text-sm text-muted-foreground border-t border-border/30 pt-6">
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>Everything inside Standard plan</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>Dynamic Cloud sync integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>Shared corporate snippet directories</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>Support priority SLA</span>
                </li>
              </ul>
            </div>
            <Button 
              className="w-full mt-8 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-md shadow-primary/25" 
              onClick={() => navigate('/workspace')}
            >
              Get Started with Pro
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40 w-full relative z-10" aria-label="Testimonials">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl font-bold tracking-tight mb-4">
            Loved by Frontend Engineers
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            See how developers from leading tech teams streamline their formatting and compilation loops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-border/50 bg-card/35 p-6 rounded-2xl flex flex-col justify-between font-sans">
            <div>
              <div className="flex items-center gap-1 mb-4 text-yellow-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                "The HTML to JSX converter works instantly and gets style object tags right every single time. It saves me at least an hour a day refactoring styling grids."
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-primary/20 text-primary text-xs font-bold rounded-full flex items-center justify-center">
                DK
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-foreground">David K.</div>
                <div className="text-[10px] text-muted-foreground font-medium">Software Engineer, Vercel</div>
              </div>
            </div>
          </div>

          <div className="border border-border/50 bg-card/35 p-6 rounded-2xl flex flex-col justify-between font-sans">
            <div>
              <div className="flex items-center gap-1 mb-4 text-yellow-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                "Having a fully offline JWT decoder and JSON formatter that doesn't trigger network requests is a game-changer. My security keys never leak out."
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-primary/20 text-primary text-xs font-bold rounded-full flex items-center justify-center">
                AM
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-foreground">Aisha M.</div>
                <div className="text-[10px] text-muted-foreground font-medium">Security Analyst, Stripe</div>
              </div>
            </div>
          </div>

          <div className="border border-border/50 bg-card/35 p-6 rounded-2xl flex flex-col justify-between font-sans">
            <div>
              <div className="flex items-center gap-1 mb-4 text-yellow-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                "The CSS to Tailwind compiler is brilliant. I can copy standard declarations directly from the inspector and get clean React code in milliseconds."
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-primary/20 text-primary text-xs font-bold rounded-full flex items-center justify-center">
                TL
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-foreground">Thomas L.</div>
                <div className="text-[10px] text-muted-foreground font-medium">Front-End Developer, Meta</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter signup section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40 w-full relative z-10" aria-label="Newsletter">
        <div className="border border-primary/20 bg-card/65 rounded-3xl p-8 md:p-12 glass-panel flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden font-sans">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="text-left max-w-xl">
            <h3 className="font-heading text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" /> Stay in the Loop
            </h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Get notified of new utility releases, offline sandboxing features, and system optimizations. No spam, ever.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:max-w-md shrink-0">
            <input
              type="email"
              placeholder="name@domain.com"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 px-4 py-2 border border-border bg-background hover:bg-secondary/20 rounded-xl text-sm focus-ring outline-none h-11"
            />
            <Button type="submit" size="sm" className="h-11 font-semibold px-5">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* FAQ section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40 w-full relative z-10" aria-label="FAQ">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-center mb-12">Frequently Asked Questions</h2>
        <div className="bg-card/45 border border-border/60 rounded-2xl p-6 md:p-8 glass-panel shadow-sm">
          <Accordion items={faqs} />
        </div>
      </section>
    </div>
  )
}

// Sub-component wrapper icons to avoid missing import errors
function CheckCircle2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
