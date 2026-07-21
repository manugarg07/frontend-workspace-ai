import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Terminal, Search, Menu, X, Layers, LayoutDashboard } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { label: 'Workspace', path: '/workspace', icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> },
    { label: 'Tools', path: '/tools', icon: <Layers className="h-4 w-4" aria-hidden="true" /> },
    { label: 'Changelog', path: '/changelog' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/60 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 font-heading text-lg font-bold text-foreground">
            <div className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary shadow-sm shadow-primary/5">
              <Terminal className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Workspace<span className="text-primary">.ai</span>
            </span>
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all hover:bg-secondary/50',
                  isActive(link.path)
                    ? 'text-primary bg-primary/5 font-semibold border border-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Global Toolbar actions */}
        <div className="flex items-center gap-3">
          {/* Quick Search Shortcut CTA */}
          <button
            type="button"
            onClick={() => {
              // Fire keyboard event to trigger palette
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                bubbles: true,
              })
              window.dispatchEvent(event)
            }}
            className="hidden sm:flex items-center gap-2 border border-border bg-card/50 hover:bg-secondary/40 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors focus-ring"
            aria-label="Search tools"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Search tools...</span>
            <span className="font-mono text-[10px] font-semibold bg-secondary border border-border/60 px-1.5 py-0.5 rounded text-secondary-foreground ml-1">⌘K</span>
          </button>

          <ThemeToggle />

          {/* Mobile Menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            className="flex md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg focus-ring cursor-pointer transition-colors"
            aria-label="Toggle main menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/30 bg-card overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setTimeout(() => {
                    const event = new KeyboardEvent('keydown', {
                      key: 'k',
                      metaKey: true,
                    })
                    window.dispatchEvent(event)
                  }, 100)
                }}
                className="flex items-center gap-2 border border-border bg-secondary/35 text-muted-foreground px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span>Search tools...</span>
              </button>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all',
                    isActive(link.path)
                      ? 'text-primary bg-primary/5 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
