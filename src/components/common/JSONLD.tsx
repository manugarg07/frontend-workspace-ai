import React from 'react'
import { Helmet } from 'react-helmet-async'
import type { ToolSEOConfig } from '@/config/tools.config'

interface JSONLDProps {
  tool: ToolSEOConfig
}

export function JSONLD({ tool }: JSONLDProps) {
  const siteUrl = 'https://www.codestrategists.com'
  const toolUrl = `${siteUrl}/tool/${tool.slug}`

  // 1. Shared Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    'name': 'Code Strategists',
    'url': siteUrl,
    'logo': `${siteUrl}/logo.png`, // Fallback/default logo
    'sameAs': [
      'https://twitter.com/codestrategists', // Example social links
      'https://github.com/codestrategists'
    ]
  }

  // 2. Shared WebSite Schema with search capability
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    'name': 'Code Strategists',
    'url': siteUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${siteUrl}/tools?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }

  // 3. WebPage Schema for the current tool page
  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${toolUrl}#webpage`,
    'url': toolUrl,
    'name': tool.seo?.title || tool.title,
    'description': tool.seo?.description || tool.description,
    'isPartOf': {
      '@id': `${siteUrl}/#website`
    },
    'about': {
      '@id': `${siteUrl}/#organization`
    }
  }

  // 4. SoftwareApplication Schema for this specific utility
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${toolUrl}#software`,
    'name': tool.title,
    'description': tool.description,
    'url': toolUrl,
    'applicationCategory': tool.schemaData?.applicationCategory || 'DeveloperApplication',
    'operatingSystem': tool.schemaData?.operatingSystem || 'All',
    'browserRequirements': tool.schemaData?.browserRequirements || 'Requires HTML5 support',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    }
  }

  // 5. BreadcrumbList Schema (Home -> Developer Tools -> Tool)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': `${siteUrl}/`
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Developer Tools',
        'item': `${siteUrl}/tools`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': tool.title,
        'item': toolUrl
      }
    ]
  }

  // 6. FAQPage Schema dynamically mapped from config
  const faqSchema = tool.faqs && tool.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': tool.faqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  } : null

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webpageSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(softwareAppSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
    </Helmet>
  )
}
