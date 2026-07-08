import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export interface DropdownItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  divider?: boolean
}

interface DropdownProps {
  label: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
  triggerClassName?: string
}

export function Dropdown({
  label,
  items,
  align = 'left',
  className,
  triggerClassName,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border bg-card rounded-lg hover:bg-secondary/50 focus-ring cursor-pointer transition-colors',
          triggerClassName
        )}
      >
        <span>{label}</span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-1.5 w-56 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg focus:outline-none overflow-hidden glass-panel',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            <div className="py-1">
              {items.map((item, index) => {
                if (item.divider) {
                  return <hr key={`divider-${index}`} className="my-1 border-border" />
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!item.disabled) {
                        item.onClick?.()
                        setIsOpen(false)
                      }
                    }}
                    disabled={item.disabled}
                    className={cn(
                      'flex w-full items-center px-4 py-2 text-sm text-left font-medium transition-colors cursor-pointer',
                      item.disabled
                        ? 'opacity-50 cursor-not-allowed text-muted-foreground'
                        : 'text-foreground hover:bg-secondary/60 hover:text-foreground'
                    )}
                  >
                    {item.icon && <span className="mr-2 text-muted-foreground">{item.icon}</span>}
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
