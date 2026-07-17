import React, { useState, useEffect, useRef } from 'react'
import { Search, Terminal, CornerDownLeft, Sparkles, Clock, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TOOLS, getToolWithDefaults } from '@/services/toolRegistry'
import type { Tool } from '@/services/toolRegistry'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

interface PaletteItem {
  id: string
  title: string
  subtitle: string
  comingSoon?: boolean
  handler: () => void
  category: string
}

const RECENT_KEY = 'recent_searches_list'

function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecentSearch(toolId: string) {
  try {
    const current = getRecentSearches()
    const updated = [toolId, ...current.filter((id) => id !== toolId)].slice(0, 4)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('Failed to save recent search:', e)
  }
}

function HighlightText({ text, match }: { text: string; match: string }) {
  if (!match.trim()) return <span>{text}</span>
  
  const escapedMatch = match.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  const regex = new RegExp(`(${escapedMatch})`, 'gi')
  const parts = text.split(regex)
  
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-primary/25 text-primary rounded px-0.5 font-semibold dark:bg-primary/40 dark:text-primary-foreground">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Listen to keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setSearch('')
      setSelectedIndex(0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const expandedTools = TOOLS.map((t) => getToolWithDefaults(t))

  // Get search results (tools + custom actions)
  const getFilteredItems = (): PaletteItem[] => {
    const query = search.toLowerCase().trim()

    const actions = [
      {
        id: 'action-theme-light',
        title: 'Switch to Light Theme',
        subtitle: 'Preference',
        handler: () => setTheme('light'),
        category: 'System Actions',
      },
      {
        id: 'action-theme-dark',
        title: 'Switch to Dark Theme',
        subtitle: 'Preference',
        handler: () => setTheme('dark'),
        category: 'System Actions',
      },
      {
        id: 'action-goto-workspace',
        title: 'Go to Workspace Dashboard',
        subtitle: 'Navigation',
        handler: () => navigate('/workspace'),
        category: 'System Actions',
      },
      {
        id: 'action-goto-tools',
        title: 'View All Available Tools',
        subtitle: 'Navigation',
        handler: () => navigate('/tools'),
        category: 'System Actions',
      },
    ]

    if (!query) {
      // 1. Recent Searches
      const recentIds = getRecentSearches()
      const recentItems = recentIds
        .map((id) => expandedTools.find((t) => t.id === id))
        .filter((t): t is typeof expandedTools[0] => !!t)
        .map((t) => ({
          id: `recent-${t.id}`,
          title: t.title,
          subtitle: `Recently Searched • ${t.shortDescription || t.description}`,
          handler: () => {
            saveRecentSearch(t.id)
            navigate(`/tool/${t.slug}`)
          },
          category: 'Recent Searches',
        }))

      // 2. Popular utilities
      const popularItems = expandedTools
        .filter((t) => t.popular && !t.comingSoon)
        .slice(0, 3)
        .map((t) => ({
          id: `popular-${t.id}`,
          title: t.title,
          subtitle: t.shortDescription || t.description,
          handler: () => {
            saveRecentSearch(t.id)
            navigate(`/tool/${t.slug}`)
          },
          category: 'Trending Utilities',
        }))

      const filteredActions = actions.slice(0, 2)
      return [...recentItems, ...popularItems, ...filteredActions]
    }

    // Filter tools matching aliases, categories, keywords, title or description
    const filteredTools = expandedTools.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.keywords.some((k) => k.toLowerCase().includes(query)) ||
        (t.aliases && t.aliases.some((a) => a.toLowerCase().includes(query))) ||
        t.category.toLowerCase().includes(query)
    )

    const filteredActions = actions.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query)
    )

    return [
      ...filteredTools.map((t) => ({
        id: t.id,
        title: t.title,
        subtitle: t.shortDescription || t.description,
        comingSoon: t.comingSoon,
        handler: () => {
          if (!t.comingSoon) {
            saveRecentSearch(t.id)
            navigate(`/tool/${t.slug}`)
          }
        },
        category: 'Matching Developer Tools',
      })),
      ...filteredActions,
    ]
  }

  const items = getFilteredItems()

  // Handle arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (items.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (items[selectedIndex]) {
        items[selectedIndex].handler()
        setIsOpen(false)
      }
    }
  }

  // Scroll active item into view
  useEffect(() => {
    const listElement = listRef.current
    if (!listElement) return

    // Account for headers in children node list
    const activeChild = listElement.querySelector('.active-menu-item') as HTMLElement
    if (!activeChild) return

    const containerTop = listElement.scrollTop
    const containerBottom = containerTop + listElement.clientHeight
    const elemTop = activeChild.offsetTop
    const elemBottom = elemTop + activeChild.clientHeight

    if (elemTop < containerTop) {
      listElement.scrollTop = elemTop - 10
    } else if (elemBottom > containerBottom) {
      listElement.scrollTop = elemBottom - listElement.clientHeight + 10
    }
  }, [selectedIndex])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Raycast Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden glass-panel flex flex-col max-h-[500px]"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="flex items-center border-b border-border/40 px-4 py-3.5">
              <Search className="h-5 w-5 text-muted-foreground mr-3" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setSelectedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search tools, aliases, keywords, or type actions..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-sans"
              />
              <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground font-mono select-none">ESC</span>
            </div>

            {/* List Area */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-2 min-h-[150px] max-h-[350px] flex flex-col gap-1.5"
            >
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-12 gap-2 my-auto">
                  <Terminal className="h-8 w-8 text-muted-foreground animate-bounce" />
                  <p className="text-sm font-semibold font-heading">No results found</p>
                  <p className="text-xs text-muted-foreground font-sans">
                    Try typing another query or searching by keywords (e.g. Base64, json).
                  </p>
                </div>
              ) : (
                items.map((item, index) => {
                  const isSelected = index === selectedIndex
                  const showCategoryHeader = index === 0 || items[index - 1].category !== item.category

                  return (
                    <React.Fragment key={item.id}>
                      {showCategoryHeader && (
                        <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-heading first:pt-1">
                          {item.category}
                        </div>
                      )}
                      <div
                        onClick={() => {
                          item.handler()
                          setIsOpen(false)
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          'flex flex-col items-start px-4 py-2.5 rounded-xl cursor-pointer transition-all select-none',
                          isSelected 
                            ? 'bg-primary text-primary-foreground shadow-md active-menu-item' 
                            : 'text-foreground hover:bg-secondary/40'
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3 w-full min-w-0">
                            {item.category.includes('Recent') ? (
                              <Clock className={cn('h-4 w-4 shrink-0', isSelected ? 'text-primary-foreground' : 'text-muted-foreground')} />
                            ) : item.category.includes('Actions') ? (
                              <Terminal className={cn('h-4 w-4 shrink-0', isSelected ? 'text-primary-foreground' : 'text-muted-foreground')} />
                            ) : (
                              <Sparkles className={cn('h-4 w-4 shrink-0', isSelected ? 'text-primary-foreground' : 'text-primary')} />
                            )}
                            <span className="font-heading font-semibold text-sm truncate">
                              <HighlightText text={item.title} match={search} />
                            </span>
                            {item.comingSoon && (
                              <span className={cn('text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full font-sans', isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-secondary text-muted-foreground')}>
                                Soon
                              </span>
                            )}
                          </div>
                          {isSelected && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 opacity-80" />}
                        </div>
                        <span className={cn('text-[11px] truncate w-full block mt-1 font-sans', isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                          <HighlightText text={item.subtitle} match={search} />
                        </span>
                      </div>
                    </React.Fragment>
                  )
                })
              )}
            </div>

            {/* Footer Hints */}
            <div className="flex items-center justify-between border-t border-border/40 px-4 py-2.5 text-xs text-muted-foreground bg-secondary/15 font-sans">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><kbd className="bg-secondary px-1.5 py-0.5 rounded border border-border/60 text-[10px]">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-secondary px-1.5 py-0.5 rounded border border-border/60 text-[10px]">Enter</kbd> Select</span>
              </div>
              <div>
                <span>Press <kbd className="font-mono bg-secondary px-1.5 py-0.5 rounded border border-border/60 text-[10px]">⌘K</kbd> to close</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
