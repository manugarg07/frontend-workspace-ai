import React from 'react'
import { RelatedToolsSection } from '@/components/common/RelatedToolsSection'

export function RelatedTools() {
  const relatedSlugs = [
    'jwt-decoder',
    'base64-converter',
    'json-formatter',
    'password-generator',
    'url-encoder',
  ]

  return <RelatedToolsSection relatedSlugs={relatedSlugs} />
}
