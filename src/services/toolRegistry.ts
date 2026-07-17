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
    id: 'url-encoder',
    slug: 'url-encoder',
    title: 'URL Encoder / Decoder',
    description: 'Encode or decode strings to comply with RFC 3986 URL guidelines.',
    icon: 'Link2',
    category: 'converters',
    keywords: ['url-encoder', 'url-decoder', 'urlencode', 'urldecode', 'rfc-3986', 'percent-encoding'],
    popular: true,
    featured: true,
    recentlyAdded: true,
    seoTitle: 'URL Encoder & Decoder - Percent Encoding Tool - Frontend Workspace AI',
    seoDescription: 'Encode or decode strings using standard RFC 3986 percent-encoding instantly online. Supports live conversions, auto-detection, copy/paste, file upload, and character size statistics.',
    relatedTools: ['base64-converter', 'json-formatter', 'regex-tester', 'jwt-decoder', 'uuid-generator'],
    estimatedReadingTime: '2 min read',
    lastUpdated: '2026-07-17',
    howToUse: [
      'Type or paste your raw text or encoded URL stream into the Input panel, or upload a .txt file.',
      'Toggle Auto-Detect Mode to automatically resolve encode/decode paths, or manually select Encode/Decode.',
      'Choose between Live Conversion (real-time updates) or manual Convert triggers.',
      'Review input/output sizes and character metrics, copy the output, or download the TXT file.'
    ],
    benefits: [
      'RFC 3986 Compliant: Fully validates percent-encoding bounds and handles Unicode characters securely.',
      'Offline execution: All conversion processes occur locally, preventing credential or parameter exposures.',
      'Double Translation Safety: Validates malformed escape sequences without causing browser crashes.'
    ],
    useCases: [
      'Encoding query parameters containing spaces, brackets, or ampersands before API fetch calls.',
      'Decoding query strings extracted from server logs to read readable parameters.',
      'Verifying OAuth callback return URLs containing complex redirect queries.'
    ],
    faqs: [
      {
        question: 'What is URL Encoding (Percent-Encoding)?',
        answer: 'URL encoding is a mechanism for encoding information in a Uniform Resource Identifier (URI) under certain circumstances. It replaces reserved characters (like ?, &, =, +) with a percent sign (%) followed by two hexadecimal digits.'
      },
      {
        question: 'What does Auto-Detect Mode do?',
        answer: 'Auto-Detect checks if the input string contains valid percent-encoded structures (like %20 or %3F). If detected, it defaults to URL decoding; otherwise, it encodes the string.'
      },
      {
        question: 'Is it safe to decode private URLs here?',
        answer: 'Yes. The encoding and decoding processes execute entirely client-side. No data is sent over the network.'
      }
    ]
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
    recentlyAdded: true,
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
    recentlyAdded: true,
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
    id: 'uuid-generator',
    slug: 'uuid-generator',
    title: 'UUID / GUID Generator',
    description: 'Generate secure, random UUID v4 identifiers locally in your browser.',
    icon: 'Fingerprint',
    category: 'generators',
    keywords: ['uuid', 'guid', 'uuid-generator', 'generate-uuid', 'uuid-v4', 'random-uuid', 'rfc-4122'],
    popular: true,
    featured: true,
    recentlyAdded: true,
    seoTitle: 'Professional UUID / GUID Generator - Frontend Workspace AI',
    seoDescription: 'Generate single or batch RFC-4122 Version 4 UUIDs instantly in your browser. Supports custom casing, hyphen removal, comma separators, JSON formats, and local Web Crypto generation.',
    relatedTools: ['jwt-decoder', 'base64-converter', 'json-formatter'],
    estimatedReadingTime: '2 min read',
    lastUpdated: '2026-07-17',
    howToUse: [
      'Select the generation quantity (1 to 1000) and custom formatting parameters.',
      'Toggle options such as Uppercase/Lowercase, inclusion of hyphens, and separating formats (newlines, commas, JSON).',
      'Click Generate UUIDs to instantly run cryptographically secure random generation locally.',
      'Copy individual results, download the output block (TXT, CSV, JSON), or regenerate new sets.'
    ],
    benefits: [
      'Cryptographically Secure: Leverages browser-native crypto.randomUUID() for high-entropy entropy pools.',
      '100% Local Execution: Zero server pings, ensuring your generated identifiers remain totally private.',
      'Export-Ready Formats: Generate array schemas, CSV rows, or plain lists instantly.'
    ],
    useCases: [
      'Creating unique primary keys for relational databases like PostgreSQL, MySQL, or SQLite.',
      'Generating correlation IDs for tracing asynchronous microservice calls.',
      'Populating test seed data or mocking database records for local testing environments.'
    ],
    faqs: [
      {
        question: 'What is a UUID (Universally Unique Identifier)?',
        answer: 'A UUID is a 128-bit number used to identify information in computer systems. RFC 4122 defines the standard formats, typically structured as 36-character hexadecimal strings separated by hyphens.'
      },
      {
        question: 'How secure is the Version 4 UUID generator here?',
        answer: 'Extremely secure. The generator runs entirely client-side using the browser-native crypto.randomUUID() or SubtleCrypto random number pools. This ensures maximum randomness entropy.'
      },
      {
        question: 'What is the difference between UUID and GUID?',
        answer: 'GUID stands for Globally Unique Identifier, which is Microsoft\'s implementation of the UUID standard. For all practical purposes, a GUID is a Version 4 UUID.'
      }
    ]
  },
  {
    id: 'password-generator',
    slug: 'password-generator',
    title: 'Password Generator',
    description: 'Generate secure, random passwords locally using cryptographically secure random values.',
    icon: 'Key',
    category: 'generators',
    keywords: ['password', 'generator', 'password-generator', 'secure-password', 'random-password', 'entropy'],
    popular: true,
    featured: true,
    recentlyAdded: true,
    seoTitle: 'Secure Password Generator - Frontend Workspace AI',
    seoDescription: 'Generate cryptographically secure random passwords instantly online. Customize length, uppercase/lowercase, numbers, symbols, character exclusion, and view live entropy cracks.',
    relatedTools: ['uuid-generator', 'jwt-decoder', 'base64-converter'],
    estimatedReadingTime: '3 min read',
    lastUpdated: '2026-07-17',
    howToUse: [
      'Select the password length (4 to 128) and specify what character groups to include (uppercase, lowercase, numbers, symbols).',
      'Customize exclusions: prevent duplicate letters, similar characters (like O, 0, I, l), or ambiguous symbols.',
      'Click Generate Passwords to run cryptographically secure generation locally inside your browser.',
      'Review the strength score (entropy, estimated crack time) and copy or download the results.'
    ],
    benefits: [
      'High Entropy: Employs browser-native Web Cryptography random values instead of weak Math.random methods.',
      'Detailed Analytics: Displays character diversity scores, bit-entropy, and estimated brute-force cracks.',
      '100% Offline: Calculations are sandboxed in the client window, preventing data transmissions.'
    ],
    useCases: [
      'Creating strong root passwords for administrator accounts and system databases.',
      'Generating unique API keys or access tokens for integrations.',
      'Establishing strong default passwords for temporary test users.'
    ],
    faqs: [
      {
        question: 'How does the browser-local cryptographic generation work?',
        answer: 'It calls the native window.crypto.getRandomValues() API to pull high-entropy random integer byte arrays from the OS kernel, ensuring cryptographical uniqueness.'
      },
      {
        question: 'What is entropy in a password?',
        answer: 'Entropy measures a password\'s unpredictability in bits. Higher entropy means a brute-force attacker requires exponentially more computational steps to guess the combination.'
      },
      {
        question: 'Is it safe to generate passwords on this website?',
        answer: 'Absolutely. The code executes 100% locally in your browser. No strings are stored or sent over network sockets.'
      }
    ]
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
    recentlyAdded: true,
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
    relatedTools: ['json-formatter', 'base64-converter', 'password-generator', 'jwt-decoder'],
    estimatedReadingTime: '3 min read',
    lastUpdated: '2026-07-17',
    howToUse: [
      'Input your target JavaScript-compatible regular expression patterns in the Regex input box.',
      'Specify pattern flags such as global (g), case-insensitive (i), and multiline (m) using the toggle pills.',
      'Provide test strings in the main editor. The match highlighter will dynamically flag pattern matches, capture groups, and start/end coordinates.',
      'Optionally toggle Replace mode to enter replacement patterns and preview compiled outputs in real-time.'
    ],
    benefits: [
      'Instant Visual Regex Feedback: Highlights matches and captures groups on-the-fly.',
      'Comprehensive Claims Matching: Details match indexes, text lengths, and sub-groups clearly.',
      'Offline Safety Sandbox: Performs all pattern matching locally in the browser memory.'
    ],
    useCases: [
      'Testing and validating complex email, phone, or password inputs before database inserts.',
      'Prototyping replacement patterns for IDE refactoring or custom command scripts.',
      'Learning regular expressions by visually inspecting match groups.'
    ],
    faqs: [
      {
        question: 'What is a Regular Expression?',
        answer: 'A Regular Expression (Regex) is a sequence of characters defining a search pattern. It is used in algorithms to search, validate, and manipulate strings.'
      },
      {
        question: 'What is the difference between global and local matching?',
        answer: 'Without the global (g) flag, regular expressions only return the first match in a string. Enabling the g flag loops over the entire test text and highlights all matches.'
      },
      {
        question: 'Does this tool support advanced features like lookarounds?',
        answer: 'Yes, it runs on your browser\'s native JavaScript RegExp compiler, meaning it supports advanced JS features like lookaheads, lookbehinds, named groups, and unicode flags.'
      }
    ]
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
