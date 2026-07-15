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
  description: string
  icon: string // Name of Lucide icon to display
  category: ToolCategory
  keywords: string[]
  comingSoon?: boolean
  featured?: boolean
  popular?: boolean
  seoTitle?: string
  seoDescription?: string
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
  {
    id: 'json-formatter',
    slug: 'json-formatter',
    title: 'JSON Formatter',
    description: 'Prettify, minify, and inspect JSON payloads with automated validation.',
    icon: 'Braces',
    category: 'formatters',
    keywords: ['json', 'formatter', 'beautify', 'minify', 'pretty-print', 'parse'],
    popular: true,
    featured: true,
    seoTitle: 'JSON Formatter & Validator - Free Online Developer Tool',
    seoDescription: 'Beautify, validate, parse, and minify JSON data instantly. Clean, format, and structure JSON code with this developer workspace utility.',
  },
  {
    id: 'base64-converter',
    slug: 'base64-converter',
    title: 'Base64 Encoder / Decoder',
    description: 'Convert strings or files to base64 format and decode base64 strings back to text.',
    icon: 'RefreshCcw',
    category: 'converters',
    keywords: ['base64', 'encoder', 'decoder', 'convert', 'string', 'binary'],
    popular: true,
    seoTitle: 'Base64 Encoder & Decoder - Personal Frontend Workspace',
    seoDescription: 'Encode plain text or binary streams into Base64 format, or decode Base64 data back to clear text instantly.',
  },
  {
    id: 'html-to-jsx',
    slug: 'html-to-jsx',
    title: 'HTML to JSX Converter',
    description: 'Convert standard HTML templates into React-compatible JSX elements with style parsing.',
    icon: 'FileCode',
    category: 'converters',
    keywords: ['html', 'jsx', 'react', 'converter', 'class-to-classname', 'inline-styles'],
    popular: true,
    featured: true,
    seoTitle: 'HTML to JSX Converter Pro - Frontend Workspace AI',
    seoDescription: 'Convert HTML syntax to clean JSX online. Replaces class, for, and inline CSS styles, closes void tags, and highlights code structures.',
  },
  {
    id: 'css-to-tailwind',
    slug: 'css-to-tailwind',
    title: 'CSS to Tailwind Converter',
    description: 'Convert standard CSS rules and selectors into equivalent Tailwind CSS utility classes.',
    icon: 'Cpu',
    category: 'converters',
    keywords: ['css', 'tailwind', 'converter', 'utility-classes', 'tailwindcss', 'styles'],
    popular: true,
    featured: true,
    seoTitle: 'CSS to Tailwind CSS Converter Pro - Frontend Workspace AI',
    seoDescription: 'Convert CSS declarations and inline styles into clean Tailwind CSS classes online. Supports layouts, flexbox, typography, spacing, borders, colors, and arbitrary styles.',
  },
  {
    id: 'svg-to-react',
    slug: 'svg-to-react',
    title: 'SVG to React Generator',
    description: 'Convert raw SVG vector drawings into clean, reusable React component files with dynamic size and color props.',
    icon: 'FileCode',
    category: 'converters',
    keywords: ['svg', 'react', 'jsx', 'tsx', 'svgr', 'vector', 'icon', 'converter'],
    popular: true,
    featured: true,
    seoTitle: 'SVG to React Component Generator Pro - Frontend Workspace AI',
    seoDescription: 'Convert SVG code to clean React components online. Supports TSX/JSX formats, customizable props, inline attribute cleaning, and live previews.',
  },
  {
    id: 'jwt-decoder',
    slug: 'jwt-decoder',
    title: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens (JWT) payload, headers, and signature claims.',
    icon: 'ShieldCheck',
    category: 'validators',
    keywords: ['jwt', 'token', 'decode', 'json web token', 'inspect', 'auth'],
    popular: true,
    featured: true,
    seoTitle: 'JWT Decoder & Token Inspector - Frontend Workspace',
    seoDescription: 'Decode JSON Web Tokens (JWT) instantly online. View token headers, claim payloads, and signature information without uploading payloads.',
  },
  {
    id: 'glassmorphism-generator',
    slug: 'glassmorphism-generator',
    title: 'CSS Glassmorphism Generator',
    description: 'Design premium glassmorphic cards with real-time blur, border, and color customization.',
    icon: 'Sparkles',
    category: 'generators',
    keywords: ['glassmorphism', 'css', 'glass', 'backdrop-filter', 'generator', 'ui-design'],
    featured: true,
    seoTitle: 'CSS Glassmorphism Generator - Frontend Workspace AI',
    seoDescription: 'Build beautiful glassmorphic CSS overlays. Custom sliders for blur, opacity, shadow, and borders, and copy CSS inline.',
  },
  {
    id: 'svg-converter',
    slug: 'svg-converter',
    title: 'SVG to React Converter',
    description: 'Convert raw SVG XML nodes into optimized React functional components.',
    icon: 'FileCode',
    category: 'react',
    keywords: ['svg', 'react', 'jsx', 'converter', 'svg2jsx', 'components'],
    popular: true,
    seoTitle: 'SVG to React Component Converter - Frontend Workspace',
    seoDescription: 'Translate standard XML SVG definitions into modern React typescript JSX components ready for integration.',
  },
  {
    id: 'tailwind-grid-generator',
    slug: 'tailwind-grid-generator',
    title: 'Tailwind Grid Generator',
    description: 'Design responsive grids and copy Tailwind utility configurations instantly.',
    icon: 'Grid',
    category: 'tailwind',
    keywords: ['tailwind', 'grid', 'css-grid', 'responsive', 'generator', 'layout'],
    seoTitle: 'Interactive Tailwind Grid Generator - Frontend Workspace',
    seoDescription: 'Visual grid designer for Tailwind CSS. Click to add rows/columns, customize gaps, and copy copy-paste Tailwind utilities.',
  },
  {
    id: 'meta-tag-generator',
    slug: 'meta-tag-generator',
    title: 'SEO Meta Tag Generator',
    description: 'Configure standard and social media meta tags and preview preview cards.',
    icon: 'Search',
    category: 'seo',
    keywords: ['seo', 'meta-tags', 'open-graph', 'twitter-cards', 'generator', 'google-preview'],
    seoTitle: 'SEO Meta Tag Generator & Preview Tool - Frontend Workspace',
    seoDescription: 'Generate complete search and social tags (OpenGraph, Twitter). Includes live search engine and card preview templates.',
  },
  {
    id: 'regex-tester',
    slug: 'regex-tester',
    title: 'Regular Expression Tester',
    description: 'Build, debug, and validate javascript-compatible regular expression patterns.',
    icon: 'Code2',
    category: 'utilities',
    keywords: ['regex', 'regexp', 'test', 'pattern', 'match', 'replace'],
    seoTitle: 'JavaScript Regular Expression Tester - Frontend Workspace',
    seoDescription: 'Interactive JavaScript Regex tester. Validate pattern matches, extract capture groups, and check speeds on dummy data.',
  },
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
  return TOOLS.find((t) => t.slug === slug)
}

export function getToolsByCategory(categoryId: ToolCategory): Tool[] {
  return TOOLS.filter((t) => t.category === categoryId)
}

export function getRelatedTools(tool: Tool, limit = 3): Tool[] {
  return TOOLS.filter((t) => t.id !== tool.id && t.category === tool.category)
    .slice(0, limit)
    .concat(
      TOOLS.filter((t) => t.id !== tool.id && t.category !== tool.category && !t.comingSoon)
    )
    .slice(0, limit)
}

export function searchTools(query: string): Tool[] {
  const cleanQuery = query.toLowerCase().trim()
  if (!cleanQuery) return TOOLS

  return TOOLS.filter(
    (t) =>
      t.title.toLowerCase().includes(cleanQuery) ||
      t.description.toLowerCase().includes(cleanQuery) ||
      t.keywords.some((k) => k.toLowerCase().includes(cleanQuery)) ||
      t.category.toLowerCase().includes(cleanQuery)
  )
}
