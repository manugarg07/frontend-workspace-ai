import fs from 'fs'
import path from 'url'
import fsPath from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = fsPath.dirname(__filename)

const CONFIG_PATH = fsPath.join(__dirname, '../src/config/tools.config.ts')
const ARTICLES_DIR = fsPath.join(__dirname, '../src/config/articles')
const SITEMAP_PATH = fsPath.join(__dirname, '../public/sitemap.xml')
const ROBOTS_PATH = fsPath.join(__dirname, '../public/robots.txt')
const RSS_PATH = fsPath.join(__dirname, '../public/rss.xml')

const SITE_URL = 'https://www.codestrategists.com'

try {
  console.log('[Sitemap Generator] Initializing build...')
  
  // 1. Parse Tools Config
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Tool configuration file not found at: ${CONFIG_PATH}`)
  }

  const toolContent = fs.readFileSync(CONFIG_PATH, 'utf8')
  const toolsStart = toolContent.indexOf('export const TOOLS_CONFIG: ToolSEOConfig[] = [')
  const toolsSection = toolContent.slice(toolsStart)
  const toolBlocks = toolsSection.split(/\n\s*\}\s*,?\s*\n/)
  const toolSlugs = []

  for (const block of toolBlocks) {
    if (block.includes('comingSoon: true')) {
      continue
    }
    const slugMatch = block.match(/slug:\s*['"]([^'"]+)['"]/)
    if (slugMatch) {
      const slugValue = slugMatch[1]
      if (!toolSlugs.includes(slugValue)) {
        toolSlugs.push(slugValue)
      }
    }
  }

  // 2. Parse Blog Articles
  const blogPosts = []
  if (fs.existsSync(ARTICLES_DIR)) {
    const files = fs.readdirSync(ARTICLES_DIR)
    for (const file of files) {
      if (!file.endsWith('.ts')) continue
      const articleContent = fs.readFileSync(fsPath.join(ARTICLES_DIR, file), 'utf8')
      
      const slugMatch = articleContent.match(/slug:\s*['"]([^'"]+)['"]/)
      const titleMatch = articleContent.match(/title:\s*['"]([^'"]+)['"]/)
      const descMatch = articleContent.match(/description:\s*['"]([^'"]+)['"]/)
      const dateMatch = articleContent.match(/publishedDate:\s*['"]([^'"]+)['"]/)
      const authorMatch = articleContent.match(/author:\s*['"]([^'"]+)['"]/)
      const catMatch = articleContent.match(/category:\s*['"]([^'"]+)['"]/)

      if (slugMatch) {
        blogPosts.push({
          slug: slugMatch[1],
          title: titleMatch ? titleMatch[1] : '',
          description: descMatch ? descMatch[1] : '',
          date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
          author: authorMatch ? authorMatch[1] : 'Developer',
          category: catMatch ? catMatch[1] : 'Development'
        })
      }
    }
  }

  // Sort blog posts chronologically (newest first)
  blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Categories list for tools
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

  // 2.5 Collection pages
  const collectionSlugs = [
    'json-tools',
    'react-tools',
    'css-tools',
    'developer-utilities',
    'generators',
    'converters'
  ]
  for (const slug of collectionSlugs) {
    xml += `  <url>\n    <loc>${SITE_URL}/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`
  }

  // 3. Dynamic Tool pages
  for (const slug of toolSlugs) {
    xml += `  <url>\n    <loc>${SITE_URL}/tool/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`
  }

  // 4. Blog Listing & Category Page
  xml += `  <url>\n    <loc>${SITE_URL}/blog</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`
  const blogCats = [...new Set(blogPosts.map(p => p.category.toLowerCase()))]
  for (const cat of blogCats) {
    xml += `  <url>\n    <loc>${SITE_URL}/blog/category/${cat}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`
  }

  // 5. Dynamic Blog detail pages
  for (const post of blogPosts) {
    xml += `  <url>\n    <loc>${SITE_URL}/blog/${post.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`
  }

  xml += `</urlset>\n`

  // Write sitemap.xml
  const publicDir = fsPath.dirname(SITEMAP_PATH)
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  fs.writeFileSync(SITEMAP_PATH, xml, 'utf8')
  console.log(`[Sitemap Generator] sitemap.xml generated successfully. Includes ${toolSlugs.length} tools and ${blogPosts.length} blog posts.`)

  // Construct RSS Feed
  const rfc822Date = (dateStr) => {
    const d = new Date(dateStr)
    return d.toUTCString()
  }

  let rss = `<?xml version="1.0" encoding="UTF-8" ?>\n`
  rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`
  rss += `<channel>\n`
  rss += `  <title>Code Strategists Blog</title>\n`
  rss += `  <link>${SITE_URL}/blog</link>\n`
  rss += `  <description>Advanced development guidelines, React optimizations, CSS migrations, and Web Security blueprints.</description>\n`
  rss += `  <language>en-us</language>\n`
  rss += `  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`
  rss += `  <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />\n`

  for (const post of blogPosts) {
    rss += `  <item>\n`
    rss += `    <title>${post.title.replace(/&/g, '&amp;')}</title>\n`
    rss += `    <link>${SITE_URL}/blog/${post.slug}</link>\n`
    rss += `    <guid>${SITE_URL}/blog/${post.slug}</guid>\n`
    rss += `    <description>${post.description.replace(/&/g, '&amp;')}</description>\n`
    rss += `    <pubDate>${rfc822Date(post.date)}</pubDate>\n`
    rss += `    <author>${post.author}</author>\n`
    rss += `  </item>\n`
  }

  rss += `</channel>\n`
  rss += `</rss>\n`

  // Write rss.xml
  fs.writeFileSync(RSS_PATH, rss, 'utf8')
  console.log(`[Sitemap Generator] rss.xml generated successfully in public folder.`)

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
