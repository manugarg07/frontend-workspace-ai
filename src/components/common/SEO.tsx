import React from 'react'
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article'
}

export function SEO({
  title = 'Frontend Workspace AI - Build Faster. Ship Better.',
  description = 'Build the world\'s best productivity workspace for frontend developers. Free online converters, formatters, code generators, and utilities in one single dashboard.',
  keywords = [
    'frontend workspace',
    'developer tools',
    'json formatter',
    'base64 converter',
    'jwt decoder',
    'css generator',
    'regex tester',
    'react helpers',
    'web tools',
    'developers',
  ],
  canonical,
  ogImage = 'https://personal-frontend-workspace.ai/og-default.png', // Placeholder URL
  ogType = 'website',
}: SEOProps) {
  const siteUrl = 'https://personal-frontend-workspace.ai'
  const finalCanonical = canonical ? `${siteUrl}${canonical}` : window.location.href

  return (
    <Helmet>
      {/* Basic Title and Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <link rel="canonical" href={finalCanonical} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Frontend Workspace AI" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}
