import { jsonFormatterVsValidator } from './articles/json-formatter-vs-validator'
import { htmlToJsxGuide } from './articles/html-to-jsx-guide'
import { cssToTailwindMigration } from './articles/css-to-tailwind-migration'
import { jwtAuthenticationExplained } from './articles/jwt-authentication-explained'
import { svgToReactGuide } from './articles/svg-to-react-guide'
import { bestFrontendTools2026 } from './articles/best-frontend-tools-2026'
import { uuidGeneratorExplained } from './articles/uuid-generator-explained'
import { base64EncodingVsDecoding } from './articles/base64-encoding-vs-decoding'
import { commonJsonErrors } from './articles/common-json-errors'
import { reactProductivityToolkit } from './articles/react-productivity-toolkit'

export type BlogCategory = 'Development' | 'Security' | 'React' | 'Design' | 'SEO'

export interface BlogPost {
  id: string
  slug: string
  title: string
  subtitle?: string
  description: string
  category: BlogCategory
  author: string
  publishedDate: string
  updatedDate?: string
  readingTime: string
  keywords: string[]
  relatedTools: string[] // slugs of tools
  relatedArticles: string[] // slugs of other posts
  content: string // markdown contents
  tips?: string[]
  pitfalls?: string[]
}

export interface BlogCategoryDetails {
  id: string
  name: string
  description: string
}

export const CATEGORIES: BlogCategoryDetails[] = [
  { id: 'Development', name: 'Development', description: 'Core programming guides, code syntax tutorials, and migration blue-prints.' },
  { id: 'Security', name: 'Security', description: 'Web standards security, authentication workflows, cryptographics, and data safety.' },
  { id: 'React', name: 'React', description: 'Component architectures, rendering efficiency, hooks, and vector conversions.' }
]

// Aggregate all articles and sort them chronologically (newest first)
export const BLOG_POSTS: BlogPost[] = [
  jsonFormatterVsValidator,
  htmlToJsxGuide,
  cssToTailwindMigration,
  jwtAuthenticationExplained,
  svgToReactGuide,
  bestFrontendTools2026,
  uuidGeneratorExplained,
  base64EncodingVsDecoding,
  commonJsonErrors,
  reactProductivityToolkit
].sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()) as unknown as BlogPost[]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return BLOG_POSTS.filter((post) => post.category.toLowerCase() === category.toLowerCase())
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return BLOG_POSTS.filter(
    (p) => p.slug !== post.slug && (p.category === post.category || post.relatedArticles.includes(p.slug))
  ).slice(0, limit)
}
