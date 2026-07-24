import React from 'react'
import { Helmet } from 'react-helmet-async'

interface SEOMetaProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  robots?: string
  ogImage?: string
  ogType?: 'website' | 'article'
}

export function SEOMeta({
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
  robots = 'index, follow',
  ogImage = 'https://www.codestrategists.com/og-image.png',
  ogType = 'website',
}: SEOMetaProps) {
  const siteUrl = 'https://www.codestrategists.com'
  
  // Format canonical URL to absolute URI format
  let finalCanonical = ''
  if (canonical) {
    // If it's already an absolute URL, use it
    if (canonical.startsWith('http')) {
      finalCanonical = canonical
    } else {
      // Ensure leading slash is present
      const cleanPath = canonical.startsWith('/') ? canonical : `/${canonical}`
      finalCanonical = `${siteUrl}${cleanPath}`
    }
  } else {
    finalCanonical = typeof window !== 'undefined' ? `${siteUrl}${window.location.pathname}` : siteUrl
  }

  return (
    <Helmet>
      {/* Search Engine Titles and Descriptions */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <link rel="canonical" href={finalCanonical} />
      <meta name="robots" content={robots} />

      {/* Google Search Console verification */}
      {import.meta.env?.VITE_GSC_VERIFICATION && (
        <meta name="google-site-verification" content={import.meta.env.VITE_GSC_VERIFICATION} />
      )}

      {/* Open Graph / Facebook Social Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="CodeStrategists" />

      {/* Twitter Cards Social Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}
