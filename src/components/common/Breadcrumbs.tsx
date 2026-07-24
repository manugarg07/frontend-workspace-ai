import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbsProps {
  toolTitle: string
  parentTitle?: string
  parentRoute?: string
  className?: string
}

export function Breadcrumbs({
  toolTitle,
  parentTitle = 'Developer Tools',
  parentRoute = '/tools',
  className
}: BreadcrumbsProps) {
  return (
    <nav 
      className={cn('flex select-none font-sans', className)} 
      aria-label="Breadcrumb"
    >
      <ol 
        className="flex flex-wrap items-center gap-y-1 gap-x-1.5 text-xs sm:text-sm font-medium text-muted-foreground"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {/* Item 1: Home */}
        <li 
          className="inline-flex items-center"
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link
            to="/"
            itemProp="item"
            className="inline-flex items-center hover:text-foreground transition-colors focus-ring rounded px-1 py-0.5"
          >
            <Home className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            <span itemProp="name">Home</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        {/* Separator */}
        <li className="inline-flex items-center" aria-hidden="true">
          <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
        </li>

        {/* Item 2: Developer Tools Catalog */}
        <li 
          className="inline-flex items-center"
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link
            to={parentRoute}
            itemProp="item"
            className="hover:text-foreground transition-colors focus-ring rounded px-1 py-0.5"
          >
            <span itemProp="name">{parentTitle}</span>
          </Link>
          <meta itemProp="position" content="2" />
        </li>

        {/* Separator */}
        <li className="inline-flex items-center" aria-hidden="true">
          <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
        </li>

        {/* Item 3: Current Tool Page */}
        <li 
          className="inline-flex items-center"
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <span 
            className="text-foreground font-semibold"
            aria-current="page"
            itemProp="name"
          >
            {toolTitle}
          </span>
          <link itemProp="item" href={typeof window !== 'undefined' ? window.location.href : ''} />
          <meta itemProp="position" content="3" />
        </li>
      </ol>
    </nav>
  )
}
