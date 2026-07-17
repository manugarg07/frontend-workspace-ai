import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Filter, AlertCircle, ArrowLeft } from 'lucide-react'
import { Chip } from '@/components/ui/Chip'
import { Pagination } from '@/components/ui/Pagination'
import { SEO } from '@/components/common/SEO'
import { ToolCard } from '@/components/ui/ToolCard'
import { Search } from '@/components/ui/Search'
import { 
  TOOLS, 
  CATEGORIES, 
  getToolWithDefaults, 
  mapSlugToCategory, 
  mapCategoryToSlug, 
  getCategoryName 
} from '@/services/toolRegistry'
import type { ToolCategory } from '@/services/toolRegistry'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/services/analytics'

export function ToolsPage() {
  const { categorySlug } = useParams<{ categorySlug?: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'featured'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // 1. Resolve active category from slug parameter or query fallback
  const activeCategory = categorySlug 
    ? mapSlugToCategory(categorySlug) 
    : (searchParams.get('category') as ToolCategory | null)

  // Reset page pagination index on filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory, searchQuery, activeTab])

  // Debounced search telemetry tracking
  useEffect(() => {
    if (!searchQuery.trim()) return
    const timer = setTimeout(() => {
      trackEvent({
        action: 'search_query',
        category: 'catalog_search',
        label: searchQuery.trim()
      })
    }, 1500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Navigate to category slugs
  const handleCategorySelect = (categoryId: ToolCategory | null) => {
    if (categoryId) {
      const slug = mapCategoryToSlug(categoryId)
      navigate(`/tools/${slug}`)
    } else {
      navigate('/tools')
    }
  }

  // Filter tools matching filters and category slug mapping
  const getFilteredTools = () => {
    let result = TOOLS.map((t) => getToolWithDefaults(t)).filter((t) => !t.comingSoon)

    // Category filter matching
    if (activeCategory) {
      result = result.filter((t) => t.category === activeCategory)
    }

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q)) ||
          (t.aliases && t.aliases.some((a) => a.toLowerCase().includes(q)))
      )
    }

    // Tabs filter sorting
    if (activeTab === 'popular') {
      result = result.filter((t) => t.popular)
    } else if (activeTab === 'featured') {
      result = result.filter((t) => t.featured)
    }

    return result
  }

  const filteredTools = getFilteredTools()

  // Pagination bounds logic
  const itemsPerPage = 9
  const totalPages = Math.max(1, Math.ceil(filteredTools.length / itemsPerPage))
  const paginatedTools = filteredTools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const tabs = [
    { id: 'all', label: 'All Utilities' },
    { id: 'popular', label: 'Popular Tools' },
    { id: 'featured', label: 'Featured Tools' },
  ] as const

  // Resolve Category SEO metadata details
  const categoryName = activeCategory ? getCategoryName(activeCategory) : 'All Tools'
  const pageTitle = activeCategory 
    ? `${categoryName} Developer Utilities - Frontend Workspace AI`
    : 'Developer Utilities Catalog index - Frontend Workspace AI'
  
  const pageDescription = activeCategory
    ? `Browse free, browser-based client-side ${categoryName} developer tools. Format, convert, validate, and compile code instantly and securely.`
    : 'Browse our complete catalog of client-side web utility tools. Free online json formatters, jwt decoders, base64 encoders, and css creators.'

  const siteUrl = 'https://personal-frontend-workspace.ai'
  
  // JSON-LD CollectionPage Schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": pageTitle,
    "description": pageDescription,
    "url": window.location.href,
    "about": {
      "@type": "Thing",
      "name": categoryName
    },
    "hasPart": filteredTools.map((t) => ({
      "@type": "SoftwareApplication",
      "name": t.title,
      "description": t.shortDescription,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "All"
    }))
  }

  // JSON-LD Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${siteUrl}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Catalog",
        "item": `${siteUrl}/tools`
      },
      ...(activeCategory ? [{
        "@type": "ListItem",
        "position": 3,
        "name": categoryName,
        "item": `${siteUrl}/tools/${categorySlug}`
      }] : [])
    ]
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 transition-colors duration-300">
      <SEO
        title={pageTitle}
        description={pageDescription}
      />

      {/* Inject Category Schema blocks dynamically */}
      <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>

      {/* Page Header */}
      <div className="flex flex-col gap-2">
        {categorySlug && (
          <button 
            onClick={() => navigate('/tools')}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit mb-1 font-semibold"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to All Utilities</span>
          </button>
        )}
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {categoryName} Utilities
        </h1>
        <p className="text-sm text-muted-foreground font-sans">
          Select client-side utility tool templates to run sandbox parsing operations locally.
        </p>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground border-b border-border/40 pb-3 font-heading uppercase tracking-wider">
            <Filter className="h-4 w-4 text-primary" />
            <span>Filter Categories</span>
          </div>

          {/* Mobile chips list */}
          <div className="flex lg:hidden flex-wrap gap-2">
            <Chip active={!activeCategory} onClick={() => handleCategorySelect(null)}>
              All Categories
            </Chip>
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat.id}
                active={activeCategory === cat.id}
                onClick={() => handleCategorySelect(cat.id)}
              >
                {cat.title}
              </Chip>
            ))}
          </div>

          {/* Desktop side list */}
          <div className="hidden lg:flex flex-col gap-1 text-sm font-medium font-heading">
            <button
              onClick={() => handleCategorySelect(null)}
              className={cn(
                'flex items-center w-full px-3 py-2 text-left rounded-lg transition-colors cursor-pointer',
                !activeCategory 
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm' 
                  : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
              )}
            >
              <span>All Categories</span>
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2 text-left rounded-lg transition-colors cursor-pointer',
                  activeCategory === cat.id 
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm' 
                    : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                )}
              >
                <span>{cat.title}</span>
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold font-mono', 
                  activeCategory === cat.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-secondary/80 text-muted-foreground'
                )}>
                  {TOOLS.filter((t) => !t.comingSoon && t.category === cat.id).length}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 w-full flex flex-col gap-6">
          
          {/* Search bar and Filters Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
            
            {/* Horizontal Tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-1 border-b sm:border-none border-border/40 pb-2 sm:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap font-sans',
                    activeTab === tab.id
                      ? 'bg-secondary text-primary border border-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Input Search box */}
            <div className="w-full sm:max-w-xs">
              <Search
                placeholder={`Search ${categoryName.toLowerCase()}...`}
                value={searchQuery}
                onChange={setSearchQuery}
                className="h-9 font-sans text-xs"
              />
            </div>
          </div>

          {/* Cards Grid */}
          {paginatedTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-border rounded-2xl bg-card/25 min-h-[300px]">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-3 animate-pulse" />
              <h3 className="font-heading text-lg font-semibold mb-1">No tools matched your filters</h3>
              <p className="text-sm text-muted-foreground max-w-sm font-sans">
                Try clearing your search query or choosing another category in the sidebar options list.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  layout="grid"
                />
              ))}
            </div>
          )}

          {/* Pagination Component */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-6"
            />
          )}

        </div>
      </div>
    </div>
  )
}
