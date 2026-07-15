import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, AlertCircle } from 'lucide-react'
import { Chip } from '@/components/ui/Chip'
import { Pagination } from '@/components/ui/Pagination'
import { SEO } from '@/components/common/SEO'
import { ToolCard } from '@/components/ui/ToolCard'
import { Search } from '@/components/ui/Search'
import { TOOLS, CATEGORIES } from '@/services/toolRegistry'
import type { ToolCategory } from '@/services/toolRegistry'
import { cn } from '@/lib/utils'

export function ToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'featured' | 'soon'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Grab active category from query params
  const activeCategory = searchParams.get('category') as ToolCategory | null

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory, searchQuery, activeTab])

  // Sync search input if needed, or query parameter triggers
  const handleCategorySelect = (categoryId: ToolCategory | null) => {
    if (categoryId) {
      setSearchParams({ category: categoryId })
    } else {
      searchParams.delete('category')
      setSearchParams(searchParams)
    }
  }

  // Filter tools
  const getFilteredTools = () => {
    let result = [...TOOLS]

    // Category filter
    if (activeCategory) {
      result = result.filter((t) => t.category === activeCategory)
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      )
    }

    // Tab sort
    if (activeTab === 'popular') {
      result = result.filter((t) => t.popular && !t.comingSoon)
    } else if (activeTab === 'featured') {
      result = result.filter((t) => t.featured && !t.comingSoon)
    } else if (activeTab === 'soon') {
      result = result.filter((t) => t.comingSoon)
    }

    return result
  }

  const filteredTools = getFilteredTools()

  // Pagination mock metrics (6 items per page for mockup presentation)
  const itemsPerPage = 6
  const totalPages = Math.max(1, Math.ceil(filteredTools.length / itemsPerPage))
  const paginatedTools = filteredTools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const tabs = [
    { id: 'all', label: 'All Utilities' },
    { id: 'popular', label: 'Popular' },
    { id: 'featured', label: 'Featured' },
    { id: 'soon', label: 'Coming Soon' },
  ] as const

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 transition-colors duration-300">
      <SEO
        title="Explore Utilities - Frontend Workspace AI"
        description="Browse all code converters, css shadows generators, validators, and front-end utilities in the workspace index catalog."
      />

      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Utility Catalog</h1>
        <p className="text-sm text-muted-foreground">Select tool templates to run local operations in sandbox.</p>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Side: Category Filter sidebar (desktop) / chips (mobile) */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground border-b border-border/40 pb-3">
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
          <div className="hidden lg:flex flex-col gap-1 text-sm">
            <button
              onClick={() => handleCategorySelect(null)}
              className={cn(
                'flex items-center w-full px-3 py-2 text-left rounded-lg font-medium transition-colors cursor-pointer',
                !activeCategory ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
              )}
            >
              <span>All Categories</span>
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2 text-left rounded-lg font-medium transition-colors cursor-pointer',
                  activeCategory === cat.id ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                )}
              >
                <span>{cat.title}</span>
                <span className="text-[10px] bg-secondary/80 text-muted-foreground px-1.5 py-0.5 rounded-full font-semibold">
                  {TOOLS.filter((t) => t.category === cat.id).length}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Right Side: Main tools view */}
        <div className="flex-1 w-full flex flex-col gap-6">
          
          {/* Search and Tabs sorting header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
            {/* Sorting tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-1 border-b sm:border-none border-border/40 pb-2 sm:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-secondary text-primary border border-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Catalog search */}
            <div className="w-full sm:max-w-xs">
              <Search
                placeholder="Filter tools..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="h-9"
              />
            </div>
          </div>

          {/* Tools Card Grid */}
          {paginatedTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-2xl bg-card/25 min-h-[300px]">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
              <h3 className="font-heading text-lg font-semibold mb-1">No tools matched your filter</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Try resetting your queries or sidebar filters to reveal standard tools.</p>
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

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mt-6"
          />

        </div>
      </div>
    </div>
  )
}
