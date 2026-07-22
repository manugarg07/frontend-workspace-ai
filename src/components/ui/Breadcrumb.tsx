import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const siteUrl = 'https://www.codestrategists.com'
  
  // W3C compliant BreadcrumbList schema
  const breadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Workspace",
        "item": `${siteUrl}/workspace`
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": item.href ? (item.href.startsWith('http') ? item.href : `${siteUrl}${item.href}`) : undefined
      }))
    ].filter((elem) => elem.item !== undefined)
  }

  return (
    <nav className={cn('flex select-none', className)} aria-label="Breadcrumb">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbListSchema)}
        </script>
      </Helmet>

      <ol className="inline-flex items-center space-x-1 md:space-x-2 text-xs sm:text-sm font-medium text-muted-foreground">
        <li className="inline-flex items-center">
          <Link
            to="/workspace"
            className="inline-flex items-center hover:text-foreground transition-colors"
          >
            <Home className="mr-2.5 h-3.5 w-3.5" aria-hidden="true" />
            Workspace
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="inline-flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" aria-hidden="true" />
              {isLast || !item.href ? (
                <span className="text-foreground font-semibold" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
