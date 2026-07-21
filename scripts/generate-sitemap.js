import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const REGISTRY_PATH = path.join(__dirname, '../src/services/toolRegistry.ts')
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml')
const ROBOTS_PATH = path.join(__dirname, '../public/robots.txt')

const SITE_URL = 'https://codestrategists.com'

try {
  console.log('[Sitemap Generator] Initializing build...')
  
  if (!fs.existsSync(REGISTRY_PATH)) {
    throw new Error(`Tool registry file not found at: ${REGISTRY_PATH}`)
  }

  const content = fs.readFileSync(REGISTRY_PATH, 'utf8')

  // Extract the TOOLS array block to parse individually
  const toolsStart = content.indexOf('export const TOOLS: Tool[] = [')
  const toolsEnd = content.indexOf('export function getToolBySlug')
  const toolsSection = content.slice(toolsStart, toolsEnd)

  // Split by closing braces at the root indent of the array
  const blocks = toolsSection.split(/\n\s*\}\s*,?\s*\n/)
  const slugs = []

  for (const block of blocks) {
    // Skip coming soon tools
    if (block.includes('comingSoon: true')) {
      continue
    }

    const slugMatch = block.match(/slug:\s*['"]([^'"]+)['"]/)
    if (slugMatch) {
      const slugValue = slugMatch[1]
      if (!slugs.includes(slugValue)) {
        slugs.push(slugValue)
      }
    }
  }

  // Predefined category slugs corresponding to router mappings
  const categories = [
    'formatting',
    'conversion',
    'generators',
    'encoding',
    'security',
    'validation',
    'utilities'
  ]

  // Construct sitemap xml
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`

  // 1. Homepage & General catalog pages
  xml += `  <url>\n    <loc>${SITE_URL}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`
  xml += `  <url>\n    <loc>${SITE_URL}/workspace</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`
  xml += `  <url>\n    <loc>${SITE_URL}/tools</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`

  // 2. Category pages
  for (const cat of categories) {
    xml += `  <url>\n    <loc>${SITE_URL}/tools/${cat}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`
  }

  // 3. Dynamic Tool pages
  for (const slug of slugs) {
    xml += `  <url>\n    <loc>${SITE_URL}/tool/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`
  }

  xml += `</urlset>\n`

  // Write sitemap.xml
  const publicDir = path.dirname(SITEMAP_PATH)
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  fs.writeFileSync(SITEMAP_PATH, xml, 'utf8')
  console.log(`[Sitemap Generator] sitemap.xml generated successfully in public folder. Includes ${slugs.length} tools.`)

  // Construct robots.txt
  let robots = `User-agent: *\n`
  robots += `Allow: /\n\n`
  robots += `Sitemap: ${SITE_URL}/sitemap.xml\n`

  // Write robots.txt
  fs.writeFileSync(ROBOTS_PATH, robots, 'utf8')
  console.log(`[Sitemap Generator] robots.txt generated successfully in public folder.`)

} catch (error) {
  console.error('[Sitemap Generator] Error:', error.message)
  process.exit(1)
}
