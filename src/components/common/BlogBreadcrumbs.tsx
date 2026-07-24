import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ChevronRight, Home } from 'lucide-react'

interface BlogBreadcrumbsProps {
  category?: string
  postTitle?: string
}

export function BlogBreadcrumbs({ category, postTitle }: BlogBreadcrumbsProps) {
  const items = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' }
  ]

  if (category) {
    items.push({
      name: category,
      url: `/blog/category/${category.toLowerCase()}`
    })
  }

  if (postTitle) {
    items.push({
      name: postTitle,
      url: window.location.pathname
    })
  }

  // Create JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://www.codestrategists.com${item.url}`
    }))
  }

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs sm:text-sm text-muted-foreground font-sans mt-2 mb-6 select-none">
        <Link
          to="/"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors duration-150 focus-ring rounded"
          aria-label="Home"
        >
          <Home className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Home</span>
        </Link>
        
        {items.slice(1).map((item, index) => {
          const isLast = index === items.length - 2
          return (
            <React.Fragment key={item.url}>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" aria-hidden="true" />
              {isLast ? (
                <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.url}
                  className="hover:text-foreground transition-colors duration-150 focus-ring rounded"
                >
                  {item.name}
                </Link>
              )}
            </React.Fragment>
          )
        })}
      </nav>
    </>
  )
}
