import { TOOLS_CONFIG } from '@/config/tools.config'

export type ToolCategory =
  | 'converters'
  | 'formatters'
  | 'validators'
  | 'generators'
  | 'utilities'
  | 'frontend'
  | 'react'
  | 'tailwind'
  | 'seo'
  | 'email'
  | 'images'
  | 'accessibility'

export interface Tool {
  id: string
  slug: string
  title: string
  description: string // short description alias
  shortDescription?: string
  longDescription?: string
  category: ToolCategory
  keywords: string[]
  aliases?: string[]
  icon: string // Name of Lucide icon to display
  route?: string
  comingSoon?: boolean
  featured?: boolean
  popular?: boolean
  newlyAdded?: boolean
  recentlyAdded?: boolean
  seoTitle?: string
  seoDescription?: string
  relatedTools?: string[]
  estimatedReadingTime?: string
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
    canonical?: string
  }
  howToUse?: string[]
  benefits?: string[]
  useCases?: string[]
  faqs?: { question: string; answer: string }[]
  lastUpdated?: string
}

export interface CategoryInfo {
  id: ToolCategory
  title: string
  description: string
  icon: string
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'converters',
    title: 'Converters',
    description: 'Transform data formats instantly.',
    icon: 'RefreshCw',
  },
  {
    id: 'formatters',
    title: 'Formatters',
    description: 'Beautify and clean up source code.',
    icon: 'AlignLeft',
  },
  {
    id: 'validators',
    title: 'Validators',
    description: 'Verify syntax compliance and detect bugs.',
    icon: 'CheckCircle2',
  },
  {
    id: 'generators',
    title: 'Generators',
    description: 'Generate assets, configurations, and dummy data.',
    icon: 'Cpu',
  },
  {
    id: 'utilities',
    title: 'Utilities',
    description: 'Everyday developer productivity helpers.',
    icon: 'Wrench',
  },
  {
    id: 'frontend',
    title: 'Frontend',
    description: 'General front-end tooling and helper utilities.',
    icon: 'Layers',
  },
  {
    id: 'react',
    title: 'React',
    description: 'React functional helpers and code snippet creators.',
    icon: 'Atom',
  },
  {
    id: 'tailwind',
    title: 'Tailwind CSS',
    description: 'Tailwind config generators and palette designers.',
    icon: 'Palette',
  },
  {
    id: 'seo',
    title: 'SEO Tools',
    description: 'Optimize metadata, verify robots structure, and calculate weight.',
    icon: 'Search',
  },
  {
    id: 'email',
    title: 'Email Templates',
    description: 'Mock HTML layouts and verify responsive scaling.',
    icon: 'Mail',
  },
  {
    id: 'images',
    title: 'Images',
    description: 'Compress files, convert PNGs, and output SVGs.',
    icon: 'Image',
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    description: 'Verify WCAG compliance and calculate color contrast.',
    icon: 'Eye',
  },
]

export const TOOLS: Tool[] = [
  ...TOOLS_CONFIG as unknown as Tool[],
  {
    id: 'image-optimizer',
    slug: 'image-optimizer',
    title: 'Responsive Image Optimizer',
    description: 'Resize and compress image files into next-gen formats (AVIF, WebP).',
    icon: 'ImageDown',
    category: 'images',
    keywords: ['image', 'optimize', 'webp', 'avif', 'compress', 'resize'],
    comingSoon: true,
  },
  {
    id: 'contrast-checker',
    slug: 'contrast-checker',
    title: 'WCAG Contrast Checker',
    description: 'Calculate WCAG contrast ratios to verify text readability compliance.',
    icon: 'Eye',
    category: 'accessibility',
    keywords: ['contrast', 'checker', 'wcag', 'a11y', 'readability', 'color'],
    comingSoon: true,
  },
]

// Query Helper Utilities
export function getToolBySlug(slug: string): Tool | undefined {
  const tool = TOOLS.find((t) => t.slug === slug)
  return tool ? getToolWithDefaults(tool) : undefined
}

export function getToolsByCategory(categoryId: ToolCategory): Tool[] {
  return TOOLS.filter((t) => t.category === categoryId).map((t) => getToolWithDefaults(t))
}

export function getRelatedTools(tool: Tool, limit = 3): Tool[] {
  return getDynamicRelatedTools(tool, limit)
}

export function getDynamicRelatedTools(tool: Tool, limit = 3): Tool[] {
  const result: Tool[] = []
  
  // 1. Manual recommendations
  if (tool.relatedTools && tool.relatedTools.length > 0) {
    for (const recommendedId of tool.relatedTools) {
      const found = TOOLS.find((t) => t.id === recommendedId && !t.comingSoon)
      if (found && found.id !== tool.id) {
        result.push(getToolWithDefaults(found))
      }
    }
  }
  
  // 2. Same category tools
  if (result.length < limit) {
    const categoryTools = TOOLS.filter(
      (t) => t.id !== tool.id && t.category === tool.category && !t.comingSoon && !result.some((r) => r.id === t.id)
    )
    categoryTools.sort((a, b) => {
      const scoreA = (a.popular ? 1 : 0) + (a.featured ? 1 : 0)
      const scoreB = (b.popular ? 1 : 0) + (b.featured ? 1 : 0)
      return scoreB - scoreA
    })
    
    for (const t of categoryTools) {
      if (result.length >= limit) break
      result.push(getToolWithDefaults(t))
    }
  }
  
  // 3. Fallback: Popular tools from other categories
  if (result.length < limit) {
    const otherTools = TOOLS.filter(
      (t) => t.id !== tool.id && t.category !== tool.category && !t.comingSoon && !result.some((r) => r.id === t.id)
    )
    otherTools.sort((a, b) => {
      const scoreA = (a.popular ? 1 : 0) + (a.featured ? 1 : 0)
      const scoreB = (b.popular ? 1 : 0) + (b.featured ? 1 : 0)
      return scoreB - scoreA
    })
    
    for (const t of otherTools) {
      if (result.length >= limit) break
      result.push(getToolWithDefaults(t))
    }
  }
  
  return result.slice(0, limit)
}

export function searchTools(query: string): Tool[] {
  const cleanQuery = query.toLowerCase().trim()
  if (!cleanQuery) return TOOLS.map((t) => getToolWithDefaults(t))

  return TOOLS.filter(
    (t) =>
      t.title.toLowerCase().includes(cleanQuery) ||
      t.description.toLowerCase().includes(cleanQuery) ||
      t.keywords.some((k) => k.toLowerCase().includes(cleanQuery)) ||
      (t.aliases && t.aliases.some((a) => a.toLowerCase().includes(cleanQuery))) ||
      t.category.toLowerCase().includes(cleanQuery)
  ).map((t) => getToolWithDefaults(t))
}

export function mapSlugToCategory(slug: string): ToolCategory | null {
  const mapping: Record<string, ToolCategory> = {
    formatting: 'formatters',
    conversion: 'converters',
    generators: 'generators',
    encoding: 'converters',
    security: 'validators',
    validation: 'validators',
    utilities: 'utilities',
    frontend: 'frontend',
    react: 'react',
    tailwind: 'tailwind',
    seo: 'seo',
    email: 'email',
    images: 'images',
    accessibility: 'accessibility',
  }
  return mapping[slug.toLowerCase()] || null
}

export function mapCategoryToSlug(category: ToolCategory): string {
  const mapping: Record<ToolCategory, string> = {
    formatters: 'formatting',
    converters: 'conversion',
    generators: 'generators',
    validators: 'security',
    utilities: 'utilities',
    frontend: 'frontend',
    react: 'react',
    tailwind: 'tailwind',
    seo: 'seo',
    email: 'email',
    images: 'images',
    accessibility: 'accessibility',
  }
  return mapping[category] || 'utilities'
}

export function getCategoryName(category: ToolCategory): string {
  const mapping: Record<ToolCategory, string> = {
    formatters: 'Formatting',
    converters: 'Conversion',
    generators: 'Generators',
    validators: 'Validation & Security',
    utilities: 'Utilities',
    frontend: 'Frontend',
    react: 'React Helpers',
    tailwind: 'Tailwind CSS',
    seo: 'SEO Tools',
    email: 'Email Templates',
    images: 'Image Tools',
    accessibility: 'Accessibility',
  }
  return mapping[category] || 'Utilities'
}

export function calculateReadingTime(tool: Tool): string {
  if (tool.estimatedReadingTime) return tool.estimatedReadingTime
  const wordCount = tool.description.split(/\s+/).length + 150
  const readingTime = Math.ceil(wordCount / 200)
  return `${readingTime} min read`
}

export function getToolWithDefaults(tool: Tool) {
  const shortDesc = tool.shortDescription || tool.description
  const longDesc = tool.longDescription || `${shortDesc} Process data, format source structures, and compile React/Tailwind styling components locally in your browser viewport without sending any telemetry to external servers.`
  const readingTime = calculateReadingTime(tool)
  const route = tool.route || `/tool/${tool.slug}`
  const lastUpdated = tool.lastUpdated || '2026-07-17'
  
  const seo = {
    title: tool.seo?.title || tool.seoTitle || `${tool.title} - Free Client-Side Developer Tool`,
    description: tool.seo?.description || tool.seoDescription || shortDesc,
    keywords: tool.seo?.keywords || tool.keywords || [],
    canonical: tool.seo?.canonical || `/tool/${tool.slug}`,
  }

  const howToUse = tool.howToUse || [
    `Enter or paste your raw data in the Source Input panel on the ${tool.title} interface.`,
    `Review any validation errors or syntax flags that appear instantly in the editor footer.`,
    `Copy the compiled, prettified, or translated output from the Output panel, or download the files locally.`
  ]

  const benefits = tool.benefits || [
    "100% Client-Side Privacy: Your data is never uploaded. All calculations occur inside sandboxed browser state variables.",
    "Instant Compile Cycles: Built using high-performance JavaScript engines for zero-latency execution.",
    "Responsive Workspace: Designed to look great and work perfectly on both mobile screens and large developer monitors."
  ]

  const useCases = tool.useCases || [
    "Beautifying messy minified data dumps or API responses.",
    "Formatting and compiling React functional hooks and modules.",
    "Sanitizing data schemas and validating security claims before deployment."
  ]

  const faqs = tool.faqs || [
    {
      question: `Is the ${tool.title} free to use?`,
      answer: `Yes, it is 100% free with no daily limits, token quotas, or account requirements.`
    },
    {
      question: `Does the ${tool.title} upload my data or secrets?`,
      answer: `No. All operations run completely client-side in your local browser viewport. It is safe for keys, payloads, and proprietary code.`
    }
  ]

  return {
    ...tool,
    comingSoon: tool.comingSoon,
    shortDescription: shortDesc,
    longDescription: longDesc,
    route,
    aliases: tool.aliases || [],
    estimatedReadingTime: readingTime,
    lastUpdated,
    seo,
    howToUse,
    benefits,
    useCases,
    faqs,
  }
}
