import React from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { Input } from './Input'
import { IconButton } from './IconButton'

interface SearchProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}

export function Search({
  value,
  onChange,
  placeholder = "Search catalog...",
  className
}: SearchProps) {
  const handleClear = () => {
    onChange('')
  }

  return (
    <div className="relative w-full">
      <Input
        type="text"
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        leftIcon={<SearchIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />}
        className={className}
      />
      {value && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10">
          <IconButton
            size="sm"
            variant="ghost"
            onClick={handleClear}
            aria-label="Clear search input"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" aria-hidden="true" />
          </IconButton>
        </div>
      )}
    </div>
  )
}
