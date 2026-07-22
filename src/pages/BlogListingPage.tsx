import React, { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Search, Calendar, Clock, User, ArrowRight, BookOpen } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { BlogBreadcrumbs } from '@/components/common/BlogBreadcrumbs'
import { BLOG_POSTS, CATEGORIES } from '@/config/blog.config'
import type { BlogCategory } from '@/config/blog.config'
import { cn } from '@/lib/utils'

const POSTS_PER_PAGE = 6

export default function BlogListingPage() {
  const { category: urlCategory } = useParams<{ category?: string }>()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Map category ID from URL parameter (case-insensitive)
  const activeCategory = useMemo(() => {
    if (!urlCategory) return 'All'
    const found = CATEGORIES.find(c => c.id.toLowerCase() === urlCategory.toLowerCase())
    return found ? found.id : 'All'
  }, [urlCategory])

  // Filter posts by active category and search input
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  // Split out the latest post as "Featured" if we are on page 1 and no search query
  const { featuredPost, listingPosts } = useMemo(() => {
    if (currentPage === 1 && searchQuery === '' && activeCategory === 'All' && filteredPosts.length > 0) {
      return {
        featuredPost: filteredPosts[0],
        listingPosts: filteredPosts.slice(1)
      }
    }
    return {
      featuredPost: null,
      listingPosts: filteredPosts
    }
  }, [filteredPosts, currentPage, searchQuery, activeCategory])

  // Paginated chunk calculation
  const totalPages = Math.ceil(listingPosts.length / POSTS_PER_PAGE)
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE
    return listingPosts.slice(start, start + POSTS_PER_PAGE)
  }, [listingPosts, currentPage])

  const handleCategoryClick = () => {
    setCurrentPage(1)
    setSearchQuery('')
  }

  // Schema for Listing page
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Code Strategists Technical Blog',
    description: 'Advanced development guidelines, React optimizations, CSS migrations, and Web Security blueprints.',
    publisher: {
      '@type': 'Organization',
      name: 'Code Strategists',
      logo: 'https://www.codestrategists.com/favicon.svg'
    },
    blogPost: filteredPosts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.publishedDate,
      author: {
        '@type': 'Person',
        name: post.author
      },
      url: `https://www.codestrategists.com/blog/${post.slug}`
    }))
  }

  return (
    <>
      <Helmet>
        <title>Developer Blog - Code Strategists</title>
        <meta name="description" content="Read in-depth articles on React 19, CSS to Tailwind migration, JWT authentication security, and developer productivity tools." />
        <link rel="canonical" href={activeCategory === 'All' ? 'https://www.codestrategists.com/blog' : `https://www.codestrategists.com/blog/category/${activeCategory.toLowerCase()}`} />
        <meta property="og:title" content="Developer Blog - Code Strategists" />
        <meta property="og:description" content="In-depth tutorials, templates, and best practices built for frontend engineers and web developers." />
        <meta property="og:url" content="https://www.codestrategists.com/blog" />
        <meta name="twitter:title" content="Developer Blog - Code Strategists" />
        <meta name="twitter:description" content="In-depth tutorials and best practices built for frontend engineers." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <BlogBreadcrumbs category={activeCategory === 'All' ? undefined : activeCategory} />

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mt-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <BookOpen className="h-3 w-3" />
            <span>Developer Knowledge Base</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Code Strategists <span className="text-primary">Blog</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Deep-dives into React patterns, web security architectures, design migrations, and frontend tooling built to level up your engineering skills.
          </p>
        </div>

        {/* Toolbar: Category tabs and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-b border-border/50 pb-6 mb-8">
          {/* Categories */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none" aria-label="Blog categories">
            <Link
              to="/blog"
              onClick={handleCategoryClick}
              className={cn(
                'px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap',
                activeCategory === 'All'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              )}
            >
              All Articles
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/blog/category/${cat.id.toLowerCase()}`}
                onClick={handleCategoryClick}
                className={cn(
                  'px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap',
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative max-w-md w-full shrink-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 bg-card/45 border-border"
              aria-label="Search articles"
            />
          </div>
        </div>

        {/* 1. Featured Post Banner */}
        {featuredPost && (
          <div className="mb-12">
            <Card className="bg-card/40 border-border overflow-hidden group">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Banner Text Content */}
                <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                      {featuredPost.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{featuredPost.readingTime}</span>
                    </div>
                  </div>
                  <Link to={`/blog/${featuredPost.slug}`} className="group-hover:text-primary transition-colors">
                    <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                      {featuredPost.title}
                    </h2>
                  </Link>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {featuredPost.description}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-border/30 pt-4 mt-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground font-semibold text-xs">
                        {featuredPost.author[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{featuredPost.author}</p>
                        <p className="text-[10px] text-muted-foreground">{featuredPost.publishedDate}</p>
                      </div>
                    </div>
                    <Link
                      to={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary group/link"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
                {/* Banner Graphics Side */}
                <div className="relative bg-secondary/20 min-h-[220px] lg:min-h-full border-t lg:border-t-0 lg:border-l border-border/40 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
                  <BookOpen className="h-28 w-28 text-muted-foreground/10 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Empty state checks */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border/60 rounded-2xl bg-card/20 max-w-xl mx-auto my-8">
            <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-heading text-lg font-bold text-foreground mb-1">No articles found</h3>
            <p className="text-sm text-muted-foreground">
              We couldn\'t find any matches for "{searchQuery}". Try revising your search keywords.
            </p>
          </div>
        )}

        {/* 2. Grid for subsequent posts */}
        {paginatedPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {paginatedPosts.map((post) => (
              <Card key={post.slug} className="bg-card/45 border-border overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-200">
                {/* Card header graphics */}
                <div className="h-44 bg-secondary/15 border-b border-border/30 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                  <span className="text-[11px] font-bold tracking-wider text-muted-foreground/35 uppercase font-mono">{post.category} GUIDE</span>
                  <BookOpen className="h-12 w-12 text-muted-foreground/5 group-hover:scale-105 transition-transform duration-200" />
                </div>
                {/* Card details */}
                <div className="p-5 flex-1 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-secondary/80 text-foreground border-border">
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{post.readingTime}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      <CardTitle as="h3" className="font-heading text-base sm:text-lg font-bold leading-snug tracking-tight text-foreground line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </Link>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {post.description}
                    </p>
                  </div>

                  <div className="border-t border-border/30 pt-3.5 mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] text-foreground font-semibold">
                        {post.author[0]}
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">{post.author}</span>
                    </div>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary group/item"
                    >
                      <span>Read</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover/item:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination buttons */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 pb-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-border bg-card/45 hover:bg-secondary/40 disabled:opacity-40 disabled:hover:bg-card/45 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
            >
              Previous Page
            </button>
            <span className="text-xs sm:text-sm text-muted-foreground px-4">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-border bg-card/45 hover:bg-secondary/40 disabled:opacity-40 disabled:hover:bg-card/45 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
            >
              Next Page
            </button>
          </div>
        )}
      </div>
    </>
  )
}
