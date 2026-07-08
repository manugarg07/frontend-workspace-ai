import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Terminal, ArrowRight, Zap, Shield, Search, Cpu, RefreshCw, AlignLeft, LayoutDashboard, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Accordion } from '@/components/ui/Accordion'
import { SEO } from '@/components/common/SEO'
import { TOOLS, CATEGORIES } from '@/services/toolRegistry'
import { motion } from 'framer-motion'

export function LandingPage() {
  const navigate = useNavigate()

  // Grab the featured / popular tools
  const popularTools = TOOLS.filter((t) => t.popular && !t.comingSoon).slice(0, 4)

  const faqs = [
    {
      id: 'faq-1',
      title: 'Is my data safe on Workspace.ai?',
      content: 'Absolutely. Workspace.ai runs 100% locally in your browser. None of your data, code, or tokens are ever sent to a server. You can even run the entire workspace completely offline.',
    },
    {
      id: 'faq-2',
      title: 'Can I add custom shortcuts or tools?',
      content: 'Yes! The architecture is built to be extremely extensible. In our configuration registry, you can declare new tools and link your code. The workspace handles search, routing, and UI automatically.',
    },
    {
      id: 'faq-3',
      title: 'How much does it cost?',
      content: 'Workspace.ai is completely free to use during our public beta. We plan to introduce a team plan in the future for shared code configurations and snippets, while standard core utility features will remain free forever.',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden grid-bg">
      <SEO />

      {/* Ambient background glow spots */}
      <div className="glow-spot top-1/4 left-10" />
      <div className="glow-spot top-2/3 right-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center select-none" aria-label="Hero">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary">
            <Zap className="h-3 w-3 animate-pulse" />
            <span>Introducing Beta 2.0</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl mx-auto"
        >
          Build <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">Faster</span>. Ship <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">Better</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          The ultimate productivity workspace for frontend developers. Stop switching tabs. Prettify JSON, debug JWTs, convert SVGs, and optimize CSS in a unified dashboard.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-10"
        >
          <Button
            size="lg"
            leftIcon={<LayoutDashboard className="h-4 w-4" />}
            onClick={() => navigate('/workspace')}
          >
            Launch Workspace
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/tools')}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Explore All Tools
          </Button>
        </motion.div>

        {/* Visual search command trigger mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto p-4 border border-border bg-card/65 rounded-2xl shadow-premium glass-panel text-left flex items-center justify-between hover:border-primary/30 transition-all cursor-pointer"
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
            window.dispatchEvent(event)
          }}
        >
          <div className="flex items-center gap-3 text-muted-foreground">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Search across categories and active utilities...</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <span className="bg-secondary px-1.5 py-0.5 rounded border border-border">Ctrl</span>
            <span className="bg-secondary px-1.5 py-0.5 rounded border border-border">K</span>
          </div>
        </motion.div>
      </section>

      {/* Feature section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40 w-full" aria-label="Core benefits">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hoverable className="bg-card/45">
            <CardHeader>
              <div className="h-10 w-10 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <CardTitle>Zero Latency</CardTitle>
              <CardDescription>Instant browser rendering. No API request latency. Everything runs on your machine.</CardDescription>
            </CardHeader>
          </Card>
          <Card hoverable className="bg-card/45">
            <CardHeader>
              <div className="h-10 w-10 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <CardTitle>100% Private</CardTitle>
              <CardDescription>No database, no signups. Your data stays in your browser. Safe for proprietary project keys.</CardDescription>
            </CardHeader>
          </Card>
          <Card hoverable className="bg-card/45">
            <CardHeader>
              <div className="h-10 w-10 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <CardTitle>Built for Speed</CardTitle>
              <CardDescription>Keyboard shortcuts, cmd palette navigation, and clean layouts built to optimize daily workflows.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40 w-full text-center" aria-label="How it works">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight mb-4">Streamlined Developer Pipelines</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-12 max-w-xl mx-auto">Copy raw code, validate instantly, preview mock results, and copy polished assets in one smooth loop.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-stretch">
          <div className="border border-border bg-card/65 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Step 01</span>
              <h3 className="font-heading text-lg font-bold text-foreground mt-3 mb-2">Input Paste</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Drop messy formatting, minified JSON payloads, or SVG configurations into the panel. Workspace parses the input automatically.</p>
            </div>
            <div className="bg-secondary/40 border border-border/60 p-4 rounded-xl font-mono text-[10px] text-muted-foreground mt-6 leading-relaxed">
              {"{ \"user_id\": \"9291\",\n \"scope\": \"read:write\" }"}
            </div>
          </div>
          <div className="border border-border bg-card/65 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Step 02</span>
              <h3 className="font-heading text-lg font-bold text-foreground mt-3 mb-2">Auto validation</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">The parser analyzes compliance instantly, flags syntactic problems, and resolves styling or color issues inline.</p>
            </div>
            <div className="bg-secondary/40 border border-border/60 p-4 rounded-xl flex items-center justify-center gap-3 font-heading font-semibold text-xs text-emerald-500 mt-6 h-20">
              <Zap className="h-4 w-4 shrink-0 animate-bounce" /> Syntax Schema Validated
            </div>
          </div>
          <div className="border border-border bg-card/65 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Step 03</span>
              <h3 className="font-heading text-lg font-bold text-foreground mt-3 mb-2">Instant Export</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Download updated assets or click single-click copy buttons to clipboard. Zero server requests, maximum speed.</p>
            </div>
            <div className="bg-primary border border-primary/20 p-4 rounded-xl flex items-center justify-center gap-2 font-heading font-semibold text-xs text-primary-foreground mt-6 h-20 shadow-md">
              Copy Clean Code
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tools section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40 w-full" aria-label="Popular tools">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight">Voted Developer Favorites</h2>
            <p className="text-sm text-muted-foreground">Jump directly into our most popular daily utilities.</p>
          </div>
          <Link to="/tools" className="text-sm text-primary hover:underline font-semibold flex items-center gap-1 mt-2 sm:mt-0">
            View Catalog <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {popularTools.map((tool) => (
            <motion.div key={tool.id} variants={itemVariants}>
              <Link to={`/tool/${tool.slug}`} className="block h-full group">
                <Card hoverable className="h-full bg-card/50 flex flex-col justify-between border-border group-hover:border-primary/30">
                  <CardHeader className="pb-3">
                    <div className="p-2 bg-secondary/50 rounded-lg text-primary w-fit mb-4">
                      <Terminal className="h-4 w-4" />
                    </div>
                    <CardTitle className="font-heading text-base group-hover:text-primary transition-colors">{tool.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1">{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4 text-xs font-semibold text-primary flex items-center gap-1">
                    <span>Open Utility</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Explore Categories section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40 w-full" aria-label="Categories">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-center mb-10">Optimized across 12 Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} to={`/tools?category=${cat.id}`} className="block group">
              <div className="border border-border/50 bg-card/35 hover:bg-card hover:border-primary/20 rounded-xl p-4 text-center transition-all h-full flex flex-col items-center justify-center gap-2">
                <div className="p-2 bg-secondary/60 rounded-lg text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-all">
                  <Cpu className="h-4 w-4" />
                </div>
                <h3 className="font-heading text-xs sm:text-sm font-semibold text-foreground">{cat.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pricing Mock Panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40 w-full" aria-label="Pricing">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-center mb-3">Simple pricing, built for growth</h2>
        <p className="text-sm text-muted-foreground text-center mb-12 max-w-sm mx-auto">Free offline utilities forever. Premium options for syncing configuration across devices.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
          {/* Free Tier */}
          <div className="border border-border bg-card/50 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">Standard Sandbox</h3>
              <p className="text-sm text-muted-foreground mt-1">Perfect for individual developers.</p>
              <div className="my-6">
                <span className="font-heading text-4xl font-extrabold text-foreground">$0</span>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider ml-1">/ Free Forever</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground border-t border-border/30 pt-6">
                <li className="flex items-center gap-2.5">
                  <Zap className="h-3.5 w-3.5 text-primary shrink-0" /> All 10+ standard utilities
                </li>
                <li className="flex items-center gap-2.5">
                  <Zap className="h-3.5 w-3.5 text-primary shrink-0" /> 100% local, sandboxed data
                </li>
                <li className="flex items-center gap-2.5">
                  <Zap className="h-3.5 w-3.5 text-primary shrink-0" /> Full offline support
                </li>
              </ul>
            </div>
            <Button variant="outline" className="w-full mt-8" onClick={() => navigate('/workspace')}>
              Start Developing
            </Button>
          </div>

          {/* Pro Tier */}
          <div className="border-2 border-primary bg-card rounded-2xl p-8 flex flex-col justify-between relative shadow-premium">
            <span className="absolute -top-3 right-6 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              Recommended
            </span>
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">Workspace Pro</h3>
              <p className="text-sm text-muted-foreground mt-1">Sync, team pipelines, and private backups.</p>
              <div className="my-6">
                <span className="font-heading text-4xl font-extrabold text-foreground">$8</span>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider ml-1">/ User / Month</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground border-t border-border/30 pt-6">
                <li className="flex items-center gap-2.5">
                  <Zap className="h-3.5 w-3.5 text-primary shrink-0" /> everything in Standard
                </li>
                <li className="flex items-center gap-2.5">
                  <Zap className="h-3.5 w-3.5 text-primary shrink-0" /> Cloud Sync (Supabase integration)
                </li>
                <li className="flex items-center gap-2.5">
                  <Zap className="h-3.5 w-3.5 text-primary shrink-0" /> Stripe-backed checkout options
                </li>
                <li className="flex items-center gap-2.5">
                  <Zap className="h-3.5 w-3.5 text-primary shrink-0" /> Shareable snippet libraries
                </li>
              </ul>
            </div>
            <Button className="w-full mt-8" onClick={() => navigate('/workspace')}>
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40 w-full" aria-label="FAQ">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-center mb-10">Frequently Asked Questions</h2>
        <Accordion items={faqs} />
      </section>
    </div>
  )
}
