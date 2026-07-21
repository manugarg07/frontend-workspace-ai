import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, HelpCircle, FileText, ArrowLeftRight } from 'lucide-react'
import { Breadcrumb } from '../ui/Breadcrumb'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import { Accordion } from '../ui/Accordion'
import { SEO } from './SEO'
import { useToast } from '../ui/Toast'
import { getToolBySlug, getRelatedTools, mapCategoryToSlug, getCategoryName } from '@/services/toolRegistry'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export interface OptionTab {
  id: string
  label: string
  icon: React.ReactNode
  badge?: string
  content: React.ReactNode
}

interface ToolLayoutProps {
  toolSlug: string
  toolbar?: React.ReactNode
  editorSection: React.ReactNode
  optionTabs?: OptionTab[]
  defaultActiveTab?: string
  instructionsTitle?: string
  instructionsDescription?: string
  instructions?: React.ReactNode
  benefits?: string[]
  faqs?: { id: string; title: React.ReactNode; content: React.ReactNode }[]
  extraSEOProps?: {
    title?: string
    description?: string
    keywords?: string[]
    canonical?: string
  }
}

export function ToolLayout({
  toolSlug,
  toolbar,
  editorSection,
  optionTabs,
  defaultActiveTab,
  instructionsTitle = "How It Works",
  instructionsDescription,
  instructions,
  benefits = [],
  faqs = [],
  extraSEOProps
}: ToolLayoutProps) {
  const { toast } = useToast()
  
  // Find tool details from registry
  const tool = getToolBySlug(toolSlug)

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Persistent Favorite state (stored in localStorage per tool slug)
  const [isFavorited, setIsFavorited] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const favs = JSON.parse(localStorage.getItem('workspace-favorites') || '[]')
        return favs.includes(toolSlug)
      } catch {
        return false
      }
    }
    return false
  })

  // Settings active tab state
  const [activeConfigTab, setActiveConfigTab] = useState(
    defaultActiveTab || (optionTabs && optionTabs.length > 0 ? optionTabs[0].id : '')
  )

  // Update localStorage when favorite changes
  const toggleFavorite = () => {
    setIsFavorited((prev: boolean) => {
      const next = !prev
      try {
        const favs = JSON.parse(localStorage.getItem('workspace-favorites') || '[]')
        let updatedFavs = [...favs]
        if (next) {
          if (!updatedFavs.includes(toolSlug)) {
            updatedFavs.push(toolSlug)
          }
          toast(`Added ${tool?.title} to favorites`, 'success')
        } else {
          updatedFavs = updatedFavs.filter((slug) => slug !== toolSlug)
          toast(`Removed ${tool?.title} from favorites`, 'success')
        }
        localStorage.setItem('workspace-favorites', JSON.stringify(updatedFavs))
      } catch {
        // Fallback
      }
      return next
    })
  }

  if (!tool) return null

  const categoryName = getCategoryName(tool.category)
  const categorySlug = mapCategoryToSlug(tool.category)

  // Related tools automatically resolved based on registry category
  const relatedTools = getRelatedTools(tool, 3)

  // Construct JSON-LD schema dynamically
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.title,
    "url": `https://workspace.ai/tool/${tool.slug}`,
    "description": tool.description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5 support"
  }

  // W3C Schema: SoftwareApplication
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.title,
    "description": tool.shortDescription || tool.description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }

  // W3C Schema: FAQPage
  const faqSchema = tool.faqs && tool.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": tool.faqs.map((f) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  } : null

  return (
    <div className={cn(
      "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 transition-colors duration-300 w-full text-left",
      isFullscreen && "fixed inset-0 z-50 p-6 bg-background overflow-y-auto w-screen h-screen"
    )}>
      {/* Dynamic SEO Tags */}
      <SEO
        title={extraSEOProps?.title || tool.seoTitle || `${tool.title} - Frontend Workspace AI`}
        description={extraSEOProps?.description || tool.seoDescription || tool.description}
        keywords={extraSEOProps?.keywords || tool.keywords}
        canonical={extraSEOProps?.canonical || `/tool/${tool.slug}`}
      />

      {/* JSON-LD Script blocks */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Header section with Breadcrumb and Meta */}
      <div className="flex flex-col gap-4">
        {!isFullscreen && (
          <Breadcrumb 
            items={[
              { label: 'Catalog', href: '/tools' },
              { label: categoryName, href: `/tools/${categorySlug}` },
              { label: tool.title }
            ]} 
          />
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <span>{tool.title}</span>
              <button
                type="button"
                onClick={toggleFavorite}
                className="text-muted-foreground hover:text-yellow-500 transition-colors cursor-pointer"
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={cn('h-5 w-5', isFavorited && 'text-yellow-500 fill-current')} aria-hidden="true" />
              </button>
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-3xl font-sans">{tool.description}</p>
            
            <div className="text-[11px] text-muted-foreground mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono">
              <Link 
                to={`/tools/${categorySlug}`}
                className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-semibold hover:bg-primary/20 transition-all"
              >
                {categoryName}
              </Link>
              <span>•</span>
              <span>Last Updated: {tool.lastUpdated || '2026-07-17'}</span>
              <span>•</span>
              <span>{tool.estimatedReadingTime || '2 min read'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Toolbar */}
      {toolbar && (
        <div className="w-full">
          {React.cloneElement(toolbar as React.ReactElement<any>, {
            isFullscreen,
            onToggleFullscreen: () => setIsFullscreen((prev: boolean) => !prev)
          })}
        </div>
      )}

      {/* Main Sandbox Workspace Editors */}
      <div className="w-full">
        {editorSection}
      </div>

      {/* Optional Configuration Tabs Card */}
      {optionTabs && optionTabs.length > 0 && (
        <Card className="border-border bg-card/60 overflow-hidden font-sans">
          <div className="border-b border-border/40 bg-secondary/10 px-4 py-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center bg-secondary/60 p-0.5 rounded-lg border border-border/50 text-xs font-semibold">
              {optionTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveConfigTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer relative",
                    activeConfigTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="bg-primary/20 text-primary text-[8px] font-bold px-1 py-0.5 rounded-full absolute -top-2 -right-1 leading-none">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground font-mono select-none">
              pipeline: v2.0-core
            </div>
          </div>
          <CardContent className="p-6 text-left min-h-[140px] flex flex-col justify-center bg-card/25">
            <AnimatePresence mode="wait">
              {optionTabs.map((tab) => {
                if (tab.id !== activeConfigTab) return null
                return (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="w-full"
                  >
                    {tab.content}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Instructional Guidelines, FAQs, and Related Tools */}
      {!isFullscreen && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 border-t border-border/40 pt-8">
          {/* Instructions and Benefits (Col 2) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="bg-card/45 border-border">
              <CardHeader className="pb-3">
                <CardTitle as="h2" className="font-heading text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                  {instructionsTitle}
                </CardTitle>
                {instructionsDescription && (
                  <CardDescription className="text-xs mt-0.5 leading-normal">
                    {instructionsDescription}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed flex flex-col gap-3">
                {instructions || (
                  <p>
                    Paste your raw code or data format into the input editor. The sandbox parser performs calculations locally in real-time.
                  </p>
                )}
              </CardContent>
            </Card>

            {benefits.length > 0 && (
              <div className="flex flex-col gap-3 text-left">
                <h2 className="font-heading text-base font-bold">Key Benefits</h2>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                  {benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* FAQs Accordion */}
            {faqs.length > 0 && (
              <div className="flex flex-col gap-4 text-left">
                <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                  <HelpCircle className="h-4.5 w-4.5 text-primary" aria-hidden="true" />
                  Frequently Asked Questions
                </h2>
                <Accordion items={faqs} />
              </div>
            )}
          </div>

          {/* Related Tools sidebar (Col 1) */}
          <div className="flex flex-col gap-6">
            {relatedTools.length > 0 && (
              <Card className="bg-card/65 border-border">
                <CardHeader>
                  <CardTitle as="h2" className="font-heading text-base flex items-center gap-2">
                    <ArrowLeftRight className="h-4.5 w-4.5 text-primary" aria-hidden="true" />
                    Related Utilities
                  </CardTitle>
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}
