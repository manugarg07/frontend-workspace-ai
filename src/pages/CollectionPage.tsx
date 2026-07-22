import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Home, ChevronRight, Layers, ArrowRight, Star, HelpCircle, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { FAQSection } from '@/components/common/FAQSection'
import { NewsletterSignup } from '@/components/common/NewsletterSignup'
import { SocialShare } from '@/components/common/SocialShare'
import { getCollectionBySlug } from '@/config/collections.config'
import { getToolBySlug } from '@/services/toolRegistry'
import { analytics } from '@/services/analyticsService'
import { cn } from '@/lib/utils'

interface CollectionPageProps {
  slug: string
}

export default function CollectionPage({ slug }: CollectionPageProps) {
  const collection = useMemo(() => getCollectionBySlug(slug), [slug])

  const tools = useMemo(() => {
    if (!collection) return []
    return collection.toolSlugs
      .map(tSlug => getToolBySlug(tSlug))
      .filter(Boolean)
  }, [collection])

  const handleToolClick = (toolSlug: string) => {
    analytics.trackToolOpened(toolSlug)
  }

  if (!collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center select-text">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Collection Not Found</h1>
        <p className="text-muted-foreground mb-6">The tool collection you are looking for does not exist.</p>
        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow hover:opacity-90 transition-opacity"
        >
          <span>View All Tools</span>
        </Link>
      </div>
    )
  }

  // W3C structured JSON-LD ItemList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.seoDescription,
    url: `https://www.codestrategists.com/${collection.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: tools.length,
      itemListElement: tools.map((t, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: t?.title,
        url: `https://www.codestrategists.com/tool/${t?.slug}`
      }))
    }
  }

  return (
    <>
      <Helmet>
        <title>{collection.seoTitle}</title>
        <meta name="description" content={collection.seoDescription} />
        <link rel="canonical" href={`https://www.codestrategists.com/${collection.slug}`} />
        <meta name="keywords" content={collection.keywords.join(', ')} />
        <meta property="og:title" content={collection.seoTitle} />
        <meta property="og:description" content={collection.seoDescription} />
        <meta property="og:url" content={`https://www.codestrategists.com/${collection.slug}`} />
        <meta name="twitter:title" content={collection.seoTitle} />
        <meta name="twitter:description" content={collection.seoDescription} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans select-text">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-6 select-none">
          <Link
            to="/"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors duration-150 focus-ring rounded"
            aria-label="Home"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" aria-hidden="true" />
          <Link to="/tools" className="hover:text-foreground transition-colors duration-150 focus-ring rounded">
            Tools
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" aria-hidden="true" />
          <span className="text-foreground font-medium truncate max-w-[200px]" aria-current="page">
            {collection.title}
          </span>
        </nav>

        {/* Hero Details */}
        <div className="flex flex-col gap-4 max-w-4xl mt-4 mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary w-fit">
            <Layers className="h-3.5 w-3.5" />
            <span>Developer Tool Collection</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {collection.title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
            {collection.introduction}
          </p>
          
          <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
            <SocialShare slug={collection.slug} title={collection.title} itemType="tool" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Area: Tool Cards & FAQs */}
          <div className="lg:col-span-8 flex flex-col gap-12">
            
            {/* Tool List Grid */}
            <section className="flex flex-col gap-6">
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                Included Utilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {tools.map((t) => {
                  if (!t) return null
                  return (
                    <Card key={t.slug} className="bg-card/45 border-border flex flex-col group hover:shadow-lg transition-all duration-200">
                      <div className="p-6 flex-1 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shadow-sm shadow-primary/5">
                            <Layers className="h-5 w-5" />
                          </div>
                          {t.popular && (
                            <Badge variant="outline" className="bg-amber-500/5 text-amber-500 border-amber-500/20 text-[10px]">
                              Popular
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-1 flex flex-col gap-1.5">
                          <Link
                            to={`/tool/${t.slug}`}
                            onClick={() => handleToolClick(t.slug)}
                            className="hover:text-primary transition-colors font-heading font-extrabold text-base sm:text-lg leading-tight tracking-tight text-foreground"
                          >
                            {t.title}
                          </Link>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {t.description}
                          </p>
                        </div>

                        <Link
                          to={`/tool/${t.slug}`}
                          onClick={() => handleToolClick(t.slug)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary mt-2 group/link"
                        >
                          <span>Open Tool Sandbox</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
                        </Link>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </section>

            {/* FAQs Accordion */}
            {collection.faqs.length > 0 && (
              <section className="flex flex-col gap-4 border-t border-border/40 pt-10">
                <h2 className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <span>Frequently Asked Questions</span>
                </h2>
                <FAQSection faqs={collection.faqs} />
              </section>
            )}

          </div>

          {/* Sidebar Area: Newsletter & Details */}
          <aside className="lg:col-span-4 flex flex-col gap-8 shrink-0">
            {/* Sidebar Newsletter */}
            <NewsletterSignup source={`collection_${collection.slug}`} />
          </aside>
        </div>
      </div>
    </>
  )
}
