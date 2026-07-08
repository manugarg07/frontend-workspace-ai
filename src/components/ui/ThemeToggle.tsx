import React from 'react'
import { Sun, Moon, Laptop } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import type { Theme } from '@/hooks/useTheme'
import { Dropdown } from './Dropdown'
import type { DropdownItem } from './Dropdown'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const items: DropdownItem[] = [
    {
      id: 'light',
      label: 'Light',
      icon: <Sun className="h-4 w-4" />,
      onClick: () => setTheme('light'),
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: <Moon className="h-4 w-4" />,
      onClick: () => setTheme('dark'),
    },
    {
      id: 'system',
      label: 'System',
      icon: <Laptop className="h-4 w-4" />,
      onClick: () => setTheme('system'),
    },
  ]

  const triggerLabel = (
    <span className="flex items-center justify-center">
      {resolvedTheme === 'dark' ? (
        <Moon className="h-4 w-4 text-primary" />
      ) : (
        <Sun className="h-4 w-4 text-primary" />
      )}
      <span className="sr-only">Toggle theme (Current: {theme})</span>
    </span>
  )

  return (
    <Dropdown
      label={triggerLabel}
      items={items}
      align="right"
      triggerClassName="p-2 border border-border bg-card/50 rounded-lg hover:bg-secondary/50 focus-ring cursor-pointer"
    />
  )
}
