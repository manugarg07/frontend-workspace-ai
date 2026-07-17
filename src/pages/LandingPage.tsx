import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Lock,
  Search,
  Github,
  Star,
  Mail,
  Activity,
  Smartphone,
  Eye,
  HelpCircle,
  AlertCircle,
  AlignLeft,
  RefreshCw,
  Hash,
  Wrench,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Accordion } from '@/components/ui/Accordion'
import { SEO } from '@/components/common/SEO'
import { ToolCard } from '@/components/ui/ToolCard'
import { TOOLS } from '@/services/toolRegistry'
import type { ToolCategory, Tool } from '@/services/toolRegistry'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/components/ui/Toast'
import { getPopularTools } from '@/services/popularityService'
import { trackEvent } from '@/services/analytics'

interface DisplayCategory {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  registryId?: ToolCategory
  filterFn?: (t: Tool) => boolean
}

const DISPLAY_CATEGORIES: DisplayCategory[] = [
  { id: 'all', title: 'All Utilities', icon: LayoutDashboard },
  { id: 'formatting', title: 'Formatting', icon: AlignLeft, registryId: 'formatters' },
  { id: 'conversion', title: 'Conversion', icon: RefreshCw, registryId: 'converters' },
  { id: 'generators', title: 'Generators', icon: Cpu, registryId: 'generators' },
  { 
    id: 'encoding', 
    title: 'Encoding', 
    icon: Hash, 
    filterFn: (t) => t.id === 'base64-converter' || t.keywords.includes('encoding') || t.keywords.includes('base64') 
  },
  { 
    id: 'security', 
    title: 'Security', 
    icon: Shield, 
    filterFn: (t) => t.id === 'jwt-decoder' || t.keywords.includes('auth') || t.keywords.includes('security') 
  },
  { id: 'validation', title: 'Validation', icon: CheckCircle2, registryId: 'validators' },
  { id: 'utilities', title: 'Utilities', icon: Wrench, registryId: 'utilities' },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  // Interactive Sandbox Panel states
  const [activeSandboxTab, setActiveSandboxTab] = useState<'json' | 'jwt' | 'svg' | 'glass'>('json')
  const [isProcessing, setIsProcessing] = useState(false)
  const [copiedTab, setCopiedTab] = useState<string | null>(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')

  // Tool Explorer search & filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Debounced search telemetry tracking
  useEffect(() => {
    if (!searchQuery.trim()) return
    const timer = setTimeout(() => {
      trackEvent({
        action: 'search_query',
        category: 'landing_search',
        label: searchQuery.trim()
      })
    }, 1500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const [jsonInput, setJsonInput] = useState(
    '{"status":"ok","code":200,"data":{"user":{"name":"Alex Rivera","role":"Lead Architect","skills":["React","TypeScript"]}}}'
  )
  const [jsonOutput, setJsonOutput] = useState(
    '{\n  "status": "ok",\n  "code": 200,\n  "data": {\n    "user": {\n      "name": "Alex Rivera",\n      "role": "Lead Architect",\n      "skills": [\n        "React",\n        "TypeScript"\n      ]\n    }\n  }\n}'
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
  const [glassColor, setGlassColor] = useState('#6d28d9')
  const [glassBorder, setGlassBorder] = useState(15)

  // Subscriptions handler
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    toast('Successfully subscribed to our newsletter updates!', 'success')
    setNewsletterEmail('')
  }

  // Sandbox calculations
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
    }, 400)
  }

  const handleCopyToClipboard = (text: string, tab: string) => {
    navigator.clipboard.writeText(text)
    setCopiedTab(tab)
    setTimeout(() => setCopiedTab(null), 2000)
  }

  const getGlassStyle = () => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result 
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '109, 40, 217'
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
      code: `background: rgba(${rgb}, ${op});\nbackdrop-filter: blur(${glassBlur}px);\nborder: 1px solid rgba(255, 255, 255, ${borderOp});`
    }
  }

  // Get tools catalog lists
  const featuredTools = TOOLS.filter((t) => t.featured && !t.comingSoon).slice(0, 3)
  const recentlyAddedTools = TOOLS.filter((t) => t.recentlyAdded && !t.comingSoon).slice(0, 3)
  const popularTools = getPopularTools(4)

  // Filter tools for unified Tool Explorer
  const getFilteredTools = () => {
    let list = TOOLS.filter((t) => !t.comingSoon)

    // Category filter matching
    if (selectedCategory !== 'all') {
      const activeCat = DISPLAY_CATEGORIES.find((c) => c.id === selectedCategory)
      if (activeCat) {
        if (activeCat.filterFn) {
          list = list.filter(activeCat.filterFn)
        } else if (activeCat.registryId) {
          list = list.filter((t) => t.category === activeCat.registryId)
        }
      }
    }

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      )
    }

    return list
  }

  const explorerTools = getFilteredTools()

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // Scroll smoothly to explorer section
    const el = document.getElementById('explore-catalog')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const faqs = [
    {
      id: 'faq-1',
      title: 'Is Workspace.ai free to use?',
      content: 'Yes, Workspace.ai is 100% free to use. All core browser-based developer utilities—including JSON formatters, HTML to JSX converters, and CSS generators—are completely free and require no accounts, subscriptions, or credit cards.',
    },
    {
      id: 'faq-2',
      title: 'Is my data secure and private?',
      content: 'Absolutely. Your privacy is our highest priority. All code conversions, validations, and formatting processes are executed completely inside your browser\'s local sandbox environment. No data, API keys, or payloads are ever uploaded, transmitted, or stored on our servers.',
    },
    {
      id: 'faq-3',
      title: 'Which browsers are supported?',
      content: 'We support all modern web browsers, including Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, and Brave. Because all tools are client-side, they load fast and run offline on any device.',
    },
    {
      id: 'faq-4',
      title: 'Can I use the tools for commercial projects?',
      content: 'Yes! All code generated, formatted, or designed by Workspace.ai is free to use in any commercial, open-source, or personal projects without license restrictions.',
    },
    {
      id: 'faq-5',
      title: 'How often are new developer tools added?',
      content: 'We release new developer productivity tools and features bi-weekly. You can check the catalog sidebar to see upcoming "Coming Soon" utilities and suggest custom scripts on our GitHub repository.',
    },
  ]

  // SEO Organization and FAQ JSON-LD schemas
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Frontend Workspace AI",
    "url": "https://personal-frontend-workspace.ai",
    "logo": "https://personal-frontend-workspace.ai/logo.png",
    "description": "Premium client-side browser developer tools platform for frontend engineers."
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.title,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.content
      }
    }))
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-background text-foreground grid-bg">
      <SEO 
        title="The Modern Developer Workspace - Frontend Workspace AI"
        description="Format, convert, validate, and generate code quickly using premium, 100% browser-based client-side developer tools. No installations required."
      />

      {/* JSON-LD Schemas */}
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>

      {/* Background Decorative Lighting Blurs */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[25%] right-[-10%] w-[550px] h-[550px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[110px] pointer-events-none" />

      {/* ====================================================
          SECTION 1 - HERO
          ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10 w-full" aria-label="Hero Introduction">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary shadow-sm backdrop-blur-md">
            <Sparkle className="h-3.5 w-3.5 text-primary animate-spin" style={{ animationDuration: '6s' }} />
            <span className="font-heading">100% Client-Side Sandboxing</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.08] max-w-5xl mx-auto"
        >
          The Modern{' '}
          <span className="bg-gradient-to-r from-primary via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Developer Workspace
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed font-sans"
        >
          Developers can format, convert, validate, and generate code quickly using browser-based tools. 
          Zero latency, no cloud uploads, completely secure by design.
        </motion.p>

        {/* Action CTAs */}
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
            onClick={() => {
              const el = document.getElementById('explore-catalog')
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 font-semibold"
          >
            Explore Tools
          </Button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl border border-border hover:bg-secondary/40 text-sm font-semibold transition-all duration-200"
          >
            <Github className="h-4 w-4" />
            <span>View on GitHub</span>
          </a>
        </motion.div>

        {/* Interactive Workspace Sandbox Panel */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-5xl mx-auto border border-border/80 bg-card/65 rounded-2xl shadow-premium glass-panel overflow-hidden text-left"
        >
          {/* Header Bar */}
          <div className="border-b border-border/60 bg-muted/65 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 block" />
              </div>
              <span className="text-xs font-mono text-muted-foreground ml-2 select-none">
                sandbox@workspace.ai:~
              </span>
            </div>
            
            {/* Tab Controllers */}
            <div className="flex items-center bg-secondary/80 p-0.5 rounded-lg border border-border/50 text-xs font-medium">
              <button
                onClick={() => { setActiveSandboxTab('json'); setCopiedTab(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeSandboxTab === 'json' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Format JSON</span>
                <span className="sm:hidden">JSON</span>
              </button>
              <button
                onClick={() => { setActiveSandboxTab('jwt'); setCopiedTab(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeSandboxTab === 'jwt' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Decode JWT</span>
                <span className="sm:hidden">JWT</span>
              </button>
              <button
                onClick={() => { setActiveSandboxTab('svg'); setCopiedTab(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeSandboxTab === 'svg' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">SVG to React</span>
                <span className="sm:hidden">SVG</span>
              </button>
              <button
                onClick={() => { setActiveSandboxTab('glass'); setCopiedTab(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeSandboxTab === 'glass' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">CSS Glass</span>
                <span className="sm:hidden">Glass</span>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-emerald-500 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Offline Safe</span>
            </div>
          </div>

          {/* Editor Playground */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
            {/* Left Column: Input Settings (Col 5) */}
            <div className="md:col-span-5 p-6 border-b md:border-b-0 md:border-r border-border/50 flex flex-col justify-between bg-card/25">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary font-heading">
                    Source Input
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {activeSandboxTab === 'json' && 'payload.json'}
                    {activeSandboxTab === 'jwt' && 'token.jwt'}
                    {activeSandboxTab === 'svg' && 'vector.svg'}
                    {activeSandboxTab === 'glass' && 'config.css'}
                  </span>
                </div>

                {activeSandboxTab === 'json' && (
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="flex-1 min-h-[220px] w-full bg-secondary/15 hover:bg-secondary/25 focus:bg-secondary/35 border border-border/40 rounded-lg p-3 font-mono text-xs focus:outline-none transition-all resize-none text-foreground"
                    placeholder="Paste JSON syntax..."
                  />
                )}

                {activeSandboxTab === 'jwt' && (
                  <textarea
                    value={jwtInput}
                    onChange={(e) => setJwtInput(e.target.value)}
                    className="flex-1 min-h-[220px] w-full bg-secondary/15 hover:bg-secondary/25 focus:bg-secondary/35 border border-border/40 rounded-lg p-3 font-mono text-xs focus:outline-none transition-all resize-none text-foreground break-all"
                    placeholder="Paste JWT string token..."
                  />
                )}

                {activeSandboxTab === 'svg' && (
                  <textarea
                    value={svgInput}
                    onChange={(e) => setSvgInput(e.target.value)}
                    className="flex-1 min-h-[220px] w-full bg-secondary/15 hover:bg-secondary/25 focus:bg-secondary/35 border border-border/40 rounded-lg p-3 font-mono text-xs focus:outline-none transition-all resize-none text-foreground"
                    placeholder="Paste SVG markup nodes..."
                  />
                )}

                {activeSandboxTab === 'glass' && (
                  <div className="space-y-4 flex-1 justify-center flex flex-col py-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Backdrop Blur</span>
                        <span className="text-primary font-mono">{glassBlur}px</span>
                      </div>
                      <input
                        type="range" min="0" max="24" value={glassBlur}
                        onChange={(e) => setGlassBlur(Number(e.target.value))}
                        className="w-full accent-primary bg-secondary/50 rounded-lg h-2"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Opacity</span>
                        <span className="text-primary font-mono">{glassOpacity}%</span>
                      </div>
                      <input
                        type="range" min="5" max="95" value={glassOpacity}
                        onChange={(e) => setGlassOpacity(Number(e.target.value))}
                        className="w-full accent-primary bg-secondary/50 rounded-lg h-2"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Border Opacity</span>
                        <span className="text-primary font-mono">{glassBorder}%</span>
                      </div>
                      <input
                        type="range" min="0" max="80" value={glassBorder}
                        onChange={(e) => setGlassBorder(Number(e.target.value))}
                        className="w-full accent-primary bg-secondary/50 rounded-lg h-2"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground block">Glow Tint Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color" value={glassColor}
                          onChange={(e) => setGlassColor(e.target.value)}
                          className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                        />
                        <span className="text-xs font-mono uppercase text-muted-foreground">{glassColor}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {activeSandboxTab !== 'glass' && (
                <Button
                  onClick={handleRunSandbox}
                  isLoading={isProcessing}
                  className="w-full mt-4 bg-primary text-primary-foreground font-semibold shadow-sm"
                >
                  {activeSandboxTab === 'json' && 'Format Clean JSON'}
                  {activeSandboxTab === 'jwt' && 'Decode JWT Token'}
                  {activeSandboxTab === 'svg' && 'Generate React TSX'}
                </Button>
              )}
            </div>

            {/* Right Column: Output Showcase (Col 7) */}
            <div className="md:col-span-7 p-6 flex flex-col justify-between bg-black/30">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-heading">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Output Sandbox
                  </span>

                  {activeSandboxTab !== 'glass' && (
                    <button
                      onClick={() => {
                        const out = activeSandboxTab === 'json' ? jsonOutput : activeSandboxTab === 'jwt' ? jwtOutput : svgOutput
                        handleCopyToClipboard(out, activeSandboxTab)
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary/35 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-border/40 transition-all cursor-pointer"
                    >
                      {copiedTab === activeSandboxTab ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium font-sans">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span className="font-sans">Copy Code</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex-1 min-h-[220px] rounded-lg border border-border/30 bg-black/50 p-4 font-mono text-xs overflow-auto max-h-[300px] flex flex-col justify-between">
                  {activeSandboxTab === 'glass' ? (
                    <div className="flex-1 flex flex-col justify-between h-full">
                      <div className="w-full h-24 rounded-lg relative overflow-hidden flex items-center justify-center border border-border/20 bg-gradient-to-r from-slate-900 to-black select-none mb-4">
                        <div className="absolute w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 blur-sm animate-pulse left-1/4" />
                        <div className="absolute w-14 h-14 rounded bg-gradient-to-r from-blue-500 to-violet-500 blur-md right-1/4" />
                        <div 
                          className="z-10 px-5 py-2.5 rounded-xl shadow-lg text-[11px] font-heading font-semibold text-white tracking-wide"
                          style={getGlassStyle().style}
                        >
                          Glassmorphic Preview
                        </div>
                      </div>

                      <div className="relative">
                        <pre className="text-[10px] sm:text-xs text-purple-300 leading-relaxed select-all">
                          {getGlassStyle().code}
                        </pre>
                        <button
                          onClick={() => handleCopyToClipboard(getGlassStyle().code, 'glass')}
                          className="absolute right-0 bottom-0 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/50 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/70 border border-border/40 transition-all cursor-pointer font-sans"
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
                      {activeSandboxTab === 'jwt' && (jwtOutput || '// Outputs token payload claims...')}
                      {activeSandboxTab === 'svg' && (svgOutput || '// Outputs React functional component...')}
                    </pre>
                  )}
                </div>
              </div>

              {/* Sandbox Footer */}
              <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground font-sans">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  Configurations never leave your browser sandbox.
                </span>
                <span className="hidden sm:inline font-mono text-[10px] opacity-75">
                  Press Cmd+K to launch palette
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ====================================================
          SECTION 2 - TRUST HIGHLIGHTS
          ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10 border-t border-b border-border/40 bg-card/10 backdrop-blur-sm" aria-label="Trust metrics">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div className="flex flex-col items-center justify-center p-3">
            <Zap className="h-5 w-5 text-primary mb-2 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold text-foreground font-heading">Fast Browser Tools</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-sans">Instant local parsing loops</p>
          </div>
          <div className="flex flex-col items-center justify-center p-3">
            <Shield className="h-5 w-5 text-primary mb-2" />
            <h3 className="text-xs sm:text-sm font-bold text-foreground font-heading">Privacy-First Design</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-sans">Data never uploads to servers</p>
          </div>
          <div className="flex flex-col items-center justify-center p-3 col-span-2 md:col-span-1">
            <Cpu className="h-5 w-5 text-primary mb-2" />
            <h3 className="text-xs sm:text-sm font-bold text-foreground font-heading">No Install Required</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-sans">Runs completely client-side</p>
          </div>
          <div className="flex flex-col items-center justify-center p-3">
            <SmileIcon className="h-5 w-5 text-primary mb-2" />
            <h3 className="text-xs sm:text-sm font-bold text-foreground font-heading">Free to Use</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-sans">No rate limits or auth wall</p>
          </div>
          <div className="flex flex-col items-center justify-center p-3">
            <Github className="h-5 w-5 text-primary mb-2" />
            <h3 className="text-xs sm:text-sm font-bold text-foreground font-heading">Open Source Code</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-sans">MIT licensed github catalog</p>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 3 - FEATURED TOOLS
          ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full relative z-10" aria-label="Featured Utilities">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Featured Developer Utilities
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base font-sans">
            Jump directly into the absolute best tools in our index, customized for instant performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} layout="landing" />
          ))}
        </div>
      </section>

      {/* ====================================================
          SECTION 4 - BROWSE BY CATEGORY
          ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40 w-full relative z-10" aria-label="Categories Catalog">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold tracking-tight mb-3">Browse by Category</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto font-sans">
            Select specialized category structures to filter client-side compilers and code templates.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {DISPLAY_CATEGORIES.map((cat) => {
            const CatIcon = cat.icon
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                    : 'bg-card/35 border-border/50 hover:bg-card/75 hover:border-primary/40'
                }`}
              >
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-2.5 transition-all ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-secondary/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'
                }`}>
                  <CatIcon className="h-4.5 w-4.5" />
                </div>
                <span className="font-heading text-xs font-bold leading-tight block">{cat.title}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ====================================================
          SECTION 6 - LIVE TOOL SEARCH & CATALOG EXPLORER
          (Integrates dynamic search filtering with category chips)
          ==================================================== */}
      <section id="explore-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40 w-full relative z-10scroll-mt-10" aria-label="Interactive catalog search">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="font-heading text-3xl font-bold tracking-tight mb-4">Explore Tool Catalog</h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-8 font-sans">
            Instantly lookup tools, formatters, and compilers locally using search filters.
          </p>

          {/* Prominent Search Bar */}
          <div className="relative w-full max-w-2xl mx-auto shadow-md rounded-xl">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search formatters, converters, generators, validation keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-card/85 border border-border/80 focus:border-primary rounded-xl text-sm focus:outline-none transition-all shadow-sm font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-4 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Category filter chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {DISPLAY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer font-sans ${
                  selectedCategory === cat.id
                    ? 'bg-secondary text-primary border-primary/20 shadow-sm'
                    : 'bg-card/25 border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/35'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic explorer tools display grid */}
        {explorerTools.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-border rounded-2xl bg-card/20 max-w-lg mx-auto">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-heading text-lg font-semibold mb-1">No matching tools found</h3>
            <p className="text-sm text-muted-foreground font-sans">
              Try adjusting your search criteria or switching the category filter chip.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {explorerTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} layout="grid" />
            ))}
          </div>
        )}
      </section>

      {/* ====================================================
          SECTION 7 - RECENTLY ADDED TOOLS
          ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40 w-full relative z-10" aria-label="Recently added tools">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight mb-2">Recently Added Utilities</h2>
            <p className="text-sm text-muted-foreground font-sans">Discover newly launched client compilers in the ecosystem.</p>
          </div>
          <button
            onClick={() => handleCategoryClick('all')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-3 sm:mt-0 cursor-pointer"
          >
            Explore all new releases <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentlyAddedTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} layout="grid" />
          ))}
        </div>
      </section>

      {/* ====================================================
          SECTION 8 - POPULAR TOOLS
          ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40 w-full relative z-10" aria-label="Popular developer tools">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight mb-2">Frequently Used Tools</h2>
            <p className="text-sm text-muted-foreground font-sans">Developer favorites backed by local telemetry tracking.</p>
          </div>
          <button
            onClick={() => handleCategoryClick('all')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-3 sm:mt-0 cursor-pointer"
          >
            Explore full catalog <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} layout="grid" />
          ))}
        </div>
      </section>

      {/* ====================================================
          SECTION 5 - WHY CHOOSE US
          ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40 w-full relative z-10" aria-label="Why choose our developer tools">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-3">Why Choose Workspace.ai</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base font-sans">
            Optimized developer workflows designed for performance, extreme privacy, and rapid execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-card/45 border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-10 w-10 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <CardTitle className="font-heading text-lg">Fast Compile Speeds</CardTitle>
              <CardDescription className="text-sm font-sans mt-2">
                All conversions run directly in your browser. No server round-trips mean code formats in milliseconds.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/45 border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-10 w-10 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-4">
                <Eye className="h-5 w-5" />
              </div>
              <CardTitle className="font-heading text-lg">Modern UI Interface</CardTitle>
              <CardDescription className="text-sm font-sans mt-2">
                Engineered with Outfit header typography, dark mode integration, and glassmorphic blurs.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/45 border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-10 w-10 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-4">
                <Terminal className="h-5 w-5" />
              </div>
              <CardTitle className="font-heading text-lg">Developer Focused</CardTitle>
              <CardDescription className="text-sm font-sans mt-2">
                Use our Cmd+K command palette and keyboard bindings to toggle loaders and templates instantly.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/45 border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-10 w-10 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <CardTitle className="font-heading text-lg">Works in Browser</CardTitle>
              <CardDescription className="text-sm font-sans mt-2">
                100% offline support. Access formatters and compilers while traveling or behind firewalls.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/45 border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-10 w-10 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-4">
                <Smartphone className="h-5 w-5" />
              </div>
              <CardTitle className="font-heading text-lg">Responsive Layouts</CardTitle>
              <CardDescription className="text-sm font-sans mt-2">
                Optimized from day one for mobile, tablet, and widescreen desktop developer displays.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/45 border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="h-10 w-10 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-4">
                <Activity className="h-5 w-5" />
              </div>
              <CardTitle className="font-heading text-lg">Regularly Updated</CardTitle>
              <CardDescription className="text-sm font-sans mt-2">
                Open-source development model with bi-weekly updates and community integrations.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* ====================================================
          SECTION 9 - HOW IT WORKS
          ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40 w-full relative z-10" aria-label="Workflow pipeline tutorial">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl font-bold tracking-tight mb-3">How Workspace Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base font-sans">
            Three simple reactive steps to compile, validate, and format your codebase.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-stretch">
          <div className="hidden lg:block absolute top-1/2 left-[31%] w-[6%] border-t border-dashed border-primary/40 -translate-y-1/2 pointer-events-none" />
          <div className="hidden lg:block absolute top-1/2 left-[64%] w-[6%] border-t border-dashed border-primary/40 -translate-y-1/2 pointer-events-none" />

          {/* Step 1 */}
          <div className="border border-border/80 bg-card/35 hover:bg-card/65 transition-all duration-300 rounded-xl p-8 flex flex-col justify-between group">
            <div>
              <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-full uppercase tracking-wider font-heading">
                Step 01
              </span>
              <h3 className="font-heading text-lg font-bold text-foreground mt-4 mb-2">Choose a Tool</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-sans">
                Browse our formatted category list or query the explorer and launch your required sandboxed utility.
              </p>
            </div>
            <div className="bg-black/25 border border-border/40 p-3.5 rounded-lg font-mono text-[10px] text-muted-foreground text-left leading-relaxed">
              <span className="text-blue-400">const</span> activeTool = <span className="text-yellow-400">'json-formatter'</span>;
            </div>
          </div>

          {/* Step 2 */}
          <div className="border border-border/80 bg-card/35 hover:bg-card/65 transition-all duration-300 rounded-xl p-8 flex flex-col justify-between group">
            <div>
              <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-full uppercase tracking-wider font-heading">
                Step 02
              </span>
              <h3 className="font-heading text-lg font-bold text-foreground mt-4 mb-2">Paste Your Input</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-sans">
                Insert your minified code structures, JWT tokens, or raw vectors. Validation issues flag in real-time.
              </p>
            </div>
            <div className="bg-black/25 border border-border/40 p-3.5 rounded-lg flex items-center justify-center font-heading font-semibold text-xs text-primary h-10 gap-2">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span>Real-time Validation OK</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border border-border/80 bg-card/35 hover:bg-card/65 transition-all duration-300 rounded-xl p-8 flex flex-col justify-between group">
            <div>
              <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-full uppercase tracking-wider font-heading">
                Step 03
              </span>
              <h3 className="font-heading text-lg font-bold text-foreground mt-4 mb-2">Copy the Result</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-sans">
                Export standard layouts, copy code chunks, or copy optimized React component code immediately.
              </p>
            </div>
            <div className="bg-primary text-primary-foreground p-3 rounded-lg flex items-center justify-center gap-2 font-heading font-semibold text-xs transition-all shadow-md">
              <Copy className="h-4 w-4" /> Copy Clean Code
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 10 - FAQ
          ==================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40 w-full relative z-10" aria-label="Frequently Asked Questions">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-center mb-12">Frequently Asked Questions</h2>
        <div className="bg-card/45 border border-border/60 rounded-2xl p-6 md:p-8 glass-panel shadow-sm">
          <Accordion items={faqs} />
        </div>
      </section>

      {/* ====================================================
          SECTION 11 - CALL TO ACTION
          ==================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full relative z-10" aria-label="Platform call to action">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-indigo-600 to-violet-700 text-white p-8 md:p-14 text-center shadow-xl">
          {/* Ambient Glow overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.15),_transparent_40%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(0,0,0,0.2),_transparent_40%)]" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Accelerate Your Styling & Code Conversion loops
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-8 leading-relaxed font-sans">
              All tools run in client sandboxes. Stop switching tabs—format JSON, generate Tailwind grids, and inspect JWT headers instantly.
            </p>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                const el = document.getElementById('explore-catalog')
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="bg-white text-primary border-white hover:bg-white/90 hover:text-primary font-bold shadow-md h-12 px-8 font-heading shrink-0"
            >
              Start Exploring Tools
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function SmileIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" x2="9.01" y1="9" y2="9" />
      <line x1="15" x2="15.01" y1="9" y2="9" />
    </svg>
  )
}
