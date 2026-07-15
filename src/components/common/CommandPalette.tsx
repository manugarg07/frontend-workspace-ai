import React, { useState, useEffect, useRef } from 'react'
import { Search, Terminal, CornerDownLeft, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TOOLS } from '@/services/toolRegistry'
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

  // Get search results (tools + custom actions)
  const getFilteredItems = (): PaletteItem[] => {
    const query = search.toLowerCase().trim()
    const tools = TOOLS.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.keywords.some((k) => k.toLowerCase().includes(query))
    )

    const actions = [
      {
        id: 'action-theme-light',
        title: 'Switch to Light Theme',
        subtitle: 'Preference',
        handler: () => setTheme('light'),
        category: 'Actions',
      },
      {
        id: 'action-theme-dark',
        title: 'Switch to Dark Theme',
        subtitle: 'Preference',
        handler: () => setTheme('dark'),
        category: 'Actions',
      },
      {
        id: 'action-goto-workspace',
        title: 'Go to Workspace Dashboard',
        subtitle: 'Navigation',
        handler: () => navigate('/workspace'),
        category: 'Actions',
      },
      {
        id: 'action-goto-tools',
        title: 'View All Available Tools',
        subtitle: 'Navigation',
        handler: () => navigate('/tools'),
        category: 'Actions',
      },
    ].filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query)
    )

    return [
      ...tools.map((t) => ({
        id: t.id,
        title: t.title,
        subtitle: t.category,
        comingSoon: t.comingSoon,
        handler: () => {
          if (!t.comingSoon) {
            navigate(`/tool/${t.slug}`)
          }
        },
        category: 'Tools',
      })),
      ...actions,
    ]
  }

  const items = getFilteredItems()

  // Handle arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
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

    const activeChild = listElement.children[selectedIndex] as HTMLElement
    if (!activeChild) return

    const containerTop = listElement.scrollTop
    const containerBottom = containerTop + listElement.clientHeight
    const elemTop = activeChild.offsetTop
    const elemBottom = elemTop + activeChild.clientHeight

    if (elemTop < containerTop) {
      listElement.scrollTop = elemTop
    } else if (elemBottom > containerBottom) {
      listElement.scrollTop = elemBottom - listElement.clientHeight
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
            {/* Search Input bar */}
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
                placeholder="Search tools or type actions..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground font-mono select-none">ESC</span>
            </div>

            {/* List area */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-2 min-h-[100px] max-h-[350px] divide-y divide-transparent"
            >
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 gap-2">
                  <Terminal className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-semibold">No results found</p>
                  <p className="text-xs text-muted-foreground">Try typing another query or filter command</p>
                </div>
              ) : (
                items.map((item, index) => {
                  const isSelected = index === selectedIndex

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        item.handler()
                        setIsOpen(false)
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all select-none',
                        isSelected ? 'bg-primary text-primary-foreground shadow-md' : 'text-foreground hover:bg-secondary/40'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {item.category === 'Tools' ? (
                          <Sparkles className={cn('h-4 w-4 shrink-0', isSelected ? 'text-primary-foreground' : 'text-primary')} />
                        ) : (
                          <Terminal className={cn('h-4 w-4 shrink-0', isSelected ? 'text-primary-foreground' : 'text-muted-foreground')} />
                        )}
                        <span className="font-heading truncate">{item.title}</span>
                        {item.comingSoon && (
                          <span className={cn('text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full', isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-secondary text-muted-foreground')}>
                            Soon
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs capitalize font-semibold tracking-wider font-mono opacity-80', isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                          {item.subtitle}
                        </span>
                        {isSelected && <CornerDownLeft className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center justify-between border-t border-border/40 px-4 py-2.5 text-xs text-muted-foreground bg-secondary/20">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="bg-secondary px-1.5 py-0.5 rounded border border-border">↑↓</span> Navigate</span>
                <span className="flex items-center gap-1"><span className="bg-secondary px-1.5 py-0.5 rounded border border-border">Enter</span> Select</span>
              </div>
              <div>
                <span>Press <span className="font-mono bg-secondary px-1.5 py-0.5 rounded border border-border">⌘K</span> to close</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
