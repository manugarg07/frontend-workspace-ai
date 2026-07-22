import React, { useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, AlertTriangle, Layers, BookOpen } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { BlogBreadcrumbs } from '@/components/common/BlogBreadcrumbs'
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer'
import { useToast } from '@/components/ui/Toast'
import { NewsletterSignup } from '@/components/common/NewsletterSignup'
import { SocialShare } from '@/components/common/SocialShare'
import { getPostBySlug, BLOG_POSTS, getRelatedPosts } from '@/config/blog.config'
import { getToolBySlug } from '@/services/toolRegistry'
import { cn } from '@/lib/utils'

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Retrieve matching article
  const post = useMemo(() => {
    if (!slug) return undefined
    return getPostBySlug(slug)
  }, [slug])

  // Resolve previous and next posts
  const { prevPost, nextPost } = useMemo(() => {
    if (!post) return { prevPost: null, nextPost: null }
    const idx = BLOG_POSTS.findIndex((p) => p.slug === post.slug)
    return {
      prevPost: idx < BLOG_POSTS.length - 1 ? BLOG_POSTS[idx + 1] : null,
      nextPost: idx > 0 ? BLOG_POSTS[idx - 1] : null
    }
  }, [post])

  // Resolve related articles
  const relatedPosts = useMemo(() => {
    if (!post) return []
    return getRelatedPosts(post, 3)
  }, [post])

  // Resolve related tools details
  const relatedTools = useMemo(() => {
    if (!post) return []
    return post.relatedTools.map(slug => getToolBySlug(slug)).filter(Boolean)
  }, [post])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast('Article link copied to clipboard.', 'success')
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Article Not Found</h1>
        <p className="text-muted-foreground mb-6">The blog post you are looking for does not exist or has been relocated.</p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Blog</span>
        </Link>
      </div>
    )
  }

  // W3C compliant BlogPosting JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedDate,
    dateModified: post.updatedDate || post.publishedDate,
    author: {
      '@type': 'Person',
      name: post.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'CodeStrategists',
      logo: 'https://www.codestrategists.com/logo.svg'
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.codestrategists.com/blog/${post.slug}`
    }
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - CodeStrategists Blog</title>
        <meta name="description" content={post.description} />
        <link rel="canonical" href={`https://www.codestrategists.com/blog/${post.slug}`} />
        <meta name="keywords" content={post.keywords.join(', ')} />
        <meta property="og:title" content={`${post.title} - CodeStrategists Blog`} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.codestrategists.com/blog/${post.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} - CodeStrategists Blog`} />
        <meta name="twitter:description" content={post.description} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-text">
        {/* Breadcrumbs */}
        <BlogBreadcrumbs category={post.category} postTitle={post.title} />

        {/* Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors focus-ring rounded"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to all articles</span>
          </Link>
          <SocialShare slug={post.slug} title={post.title} itemType="blog" variant="inline" />
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Article content (8 cols) */}
          <main className="lg:col-span-8 flex flex-col gap-8">
            {/* Header section */}
            <div className="flex flex-col gap-4 border-b border-border/40 pb-6">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                  {post.category}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{post.readingTime}</span>
                </div>
              </div>
              
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                {post.title}
              </h1>
              
              {post.subtitle && (
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {post.subtitle}
                </p>
              )}

              {/* Author & dates metadata card */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground font-semibold text-xs">
                    {post.author[0]}
                  </div>
                  <span className="font-medium text-foreground">{post.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Published {post.publishedDate}</span>
                </div>
                {post.updatedDate && (
                  <div className="text-xs text-muted-foreground/75 italic">
                    (Updated {post.updatedDate})
                  </div>
                )}
              </div>
            </div>

            {/* Markdown Content Area */}
            <MarkdownRenderer content={post.content} />

            {/* Tips & Pitfalls sections inside blog if configured */}
            {((post.tips && post.tips.length > 0) || (post.pitfalls && post.pitfalls.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border/40 pt-8 mt-4">
                {post.tips && post.tips.length > 0 && (
                  <Card className="bg-emerald-500/5 border-emerald-500/10">
                    <CardHeader className="pb-2">
                      <CardTitle as="h3" className="font-heading text-sm sm:text-base flex items-center gap-2 text-emerald-600">
                        Pro Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs sm:text-sm text-muted-foreground">
                      <ul className="space-y-2">
                        {post.tips.map((t, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                {post.pitfalls && post.pitfalls.length > 0 && (
                  <Card className="bg-amber-500/5 border-amber-500/10">
                    <CardHeader className="pb-2">
                      <CardTitle as="h3" className="font-heading text-sm sm:text-base flex items-center gap-2 text-amber-600">
                        Common Pitfalls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs sm:text-sm text-muted-foreground">
                      <ul className="space-y-2">
                        {post.pitfalls.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Reusable Cross-promotional CTA Widget */}
            {relatedTools.length > 0 && (
              <Card className="bg-primary/5 border border-primary/20 p-6 sm:p-8 rounded-2xl flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-2.5 text-primary">
                  <Layers className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">Interactive Developer Tooling</span>
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground">
                  Try {relatedTools[0]?.title} Online
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Need to validate or format your payloads immediately? Access our secure, sandboxed client-side utilities directly in your browser. No data leaks, no accounts required.
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  {relatedTools.map((t) => (
                    <Link
                      key={t?.slug}
                      to={`/tools?tool=${t?.slug}`}
                      className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-xs sm:text-sm hover:opacity-90 shadow-sm transition-opacity"
                    >
                      Open {t?.title}
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Blog Page Newsletter Signup */}
            <NewsletterSignup source={`blog_${post.slug}`} variant="inline" className="mt-4" />

            {/* Previous/Next articles navigation controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between border-t border-border/40 pt-6 mt-8">
              {prevPost ? (
                <Link
                  to={`/blog/${prevPost.slug}`}
                  className="flex-1 flex flex-col gap-1.5 p-4 border border-border/50 hover:border-primary/30 rounded-xl bg-card/25 text-left group hover:shadow-sm transition-all"
                >
                  <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" />
                    <span>Previous Post</span>
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {prevPost.title}
                  </span>
                </Link>
              ) : (
                <div className="flex-1 hidden sm:block" />
              )}
              
              {nextPost ? (
                <Link
                  to={`/blog/${nextPost.slug}`}
                  className="flex-1 flex flex-col gap-1.5 p-4 border border-border/50 hover:border-primary/30 rounded-xl bg-card/25 text-right items-end group hover:shadow-sm transition-all"
                >
                  <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground flex items-center gap-1">
                    <span>Next Post</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {nextPost.title}
                  </span>
                </Link>
              ) : (
                <div className="flex-1 hidden sm:block" />
              )}
            </div>
          </main>

          {/* Right Column: Sidebar (4 cols) */}
          <aside className="lg:col-span-4 flex flex-col gap-8 shrink-0">
            {/* Sidebar section 1: Related Tools */}
            {relatedTools.length > 0 && (
              <Card className="bg-card/45 border-border">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle as="h3" className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <span>Related Tooling</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col gap-3.5">
                  {relatedTools.map((t) => (
                    <div key={t?.slug} className="flex flex-col gap-1">
                      <Link to={`/tools?tool=${t?.slug}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                        {t?.title}
                      </Link>
                      <p className="text-xs text-muted-foreground leading-normal line-clamp-2">
                        {t?.description}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Sidebar section 2: Related Articles */}
            {relatedPosts.length > 0 && (
              <Card className="bg-card/45 border-border">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle as="h3" className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>Related Articles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col gap-4">
                  {relatedPosts.map((p) => (
                    <div key={p.slug} className="flex flex-col gap-1">
                      <Link to={`/blog/${p.slug}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {p.title}
                      </Link>
                      <span className="text-[10px] text-muted-foreground">{p.publishedDate}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </article>
    </>
  )
}
