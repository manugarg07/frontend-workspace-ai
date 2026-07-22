import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { SEOMeta } from './SEOMeta'
import { JSONLD } from './JSONLD'
import { Breadcrumbs } from './Breadcrumbs'
import { ToolContent } from './ToolContent'
import { TOOLS_CONFIG } from '@/config/tools.config'
import type { ToolSEOConfig } from '@/config/tools.config'
import { useToast } from '../ui/Toast'
import { getToolBySlug, mapCategoryToSlug, getCategoryName } from '@/services/toolRegistry'
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

  // Resolve config from central file, falling back to defaults if not present
  const config = TOOLS_CONFIG.find((t) => t.slug === toolSlug)
  const fallbackConfig: ToolSEOConfig = {
    id: tool.id,
    slug: tool.slug,
    title: tool.title,
    description: tool.description,
    introduction: tool.longDescription || tool.description,
    category: tool.category,
    keywords: tool.keywords || [],
    icon: tool.icon,
    features: tool.benefits || [],
    howToUse: tool.howToUse || [],
    example: {
      input: '',
      output: '',
      explanation: ''
    },
    useCases: tool.useCases || [],
    faqs: (tool.faqs || []).map(f => ({ question: f.question, answer: f.answer })),
    relatedTools: tool.relatedTools || [],
    tips: [],
    pitfalls: []
  }
  const activeConfig = config || fallbackConfig

  return (
    <div className={cn(
      "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 transition-colors duration-300 w-full text-left",
      isFullscreen && "fixed inset-0 z-50 p-6 bg-background overflow-y-auto w-screen h-screen"
    )}>
      {/* Dynamic SEO Tags */}
      <SEOMeta
        title={extraSEOProps?.title || activeConfig.seoTitle || activeConfig.title}
        description={extraSEOProps?.description || activeConfig.seoDescription || activeConfig.description}
        keywords={extraSEOProps?.keywords || activeConfig.keywords}
        canonical={extraSEOProps?.canonical || `/tool/${activeConfig.slug}`}
      />

      {/* JSON-LD Script blocks */}
      <JSONLD tool={activeConfig} />

      {/* Header section with Breadcrumb and Meta */}
      <div className="flex flex-col gap-4">
        {!isFullscreen && (
          <Breadcrumbs toolTitle={activeConfig.title} />
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

      {/* Dynamic SEO Landing Page Content Section */}
      {!isFullscreen && (
        <ToolContent tool={activeConfig} />
      )}
    </div>
  )
}
