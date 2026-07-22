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
  title = 'CodeStrategists - Professional Developer Tools for Modern Frontend Engineers',
  description = 'Format, convert, validate, and generate code quickly using premium, 100% browser-based client-side developer tools. No installations required.',
  keywords = [
    'codestrategists',
    'code strategists',
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
  ogImage = 'https://www.codestrategists.com/og-default.png',
  ogType = 'website',
}: SEOProps) {
  const siteUrl = 'https://www.codestrategists.com'
  const finalCanonical = canonical ? `${siteUrl}${canonical}` : window.location.href

  return (
    <Helmet>
      {/* Basic Title and Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <link rel="canonical" href={finalCanonical} />
      
      {/* Google Search Console verification */}
      {import.meta.env.VITE_GSC_VERIFICATION && (
        <meta name="google-site-verification" content={import.meta.env.VITE_GSC_VERIFICATION} />
      )}

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="CodeStrategists" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}
