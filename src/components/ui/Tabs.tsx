import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  content?: React.ReactNode
}

interface TabsProps {
  tabs: TabItem[]
  defaultValue?: string
  onChange?: (id: string) => void
  variant?: 'pills' | 'underline'
  className?: string
  tabHeaderClassName?: string
}

export function Tabs({
  tabs,
  defaultValue,
  onChange,
  variant = 'pills',
  className,
  tabHeaderClassName,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.id)

  const handleTabClick = (id: string) => {
    setActiveTab(id)
    onChange?.(id)
  }

  return (
    <div className={cn('w-full flex flex-col gap-4', className)}>
      <div
        className={cn(
          'flex overflow-x-auto select-none no-scrollbar p-1 border-b border-border/40 gap-1',
          variant === 'pills' && 'bg-secondary/40 border-none rounded-xl p-1',
          tabHeaderClassName
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'relative flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors focus-ring rounded-lg cursor-pointer whitespace-nowrap',
                variant === 'underline' && 'bg-transparent border-b-2 border-transparent rounded-none px-4 py-3 -mb-[1px]',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && variant === 'pills' && (
                <motion.div
                  layoutId="active-pill-indicator"
                  className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border/10"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              {isActive && variant === 'underline' && (
                <motion.div
                  layoutId="active-underline-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
      <div className="w-full">
        {tabs.map((tab) => {
          if (tab.id !== activeTab) return null
          return (
            <div key={tab.id} className="w-full animate-fade-in">
              {tab.content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
