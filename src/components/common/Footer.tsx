import React from 'react'
import { Link } from 'react-router-dom'
import { Terminal, Github, Heart, ExternalLink } from 'lucide-react'
import { CATEGORIES } from '@/services/toolRegistry'
import { NewsletterSignup } from './NewsletterSignup'

export function Footer() {
  const currentYear = new Date().getFullYear()

  // Grab first 5 categories for the footer list
  const footerCategories = CATEGORIES.slice(0, 5)

  // Direct links to key tools
  const developerTools = [
    { name: 'JSON Formatter', slug: 'json-formatter' },
    { name: 'Base64 Converter', slug: 'base64-converter' },
    { name: 'HTML to JSX', slug: 'html-to-jsx' },
    { name: 'CSS to Tailwind', slug: 'css-to-tailwind' },
    { name: 'JWT Decoder', slug: 'jwt-decoder' },
  ]

  return (
    <footer className="border-t border-border/40 bg-card/30 transition-colors duration-300 font-sans z-15 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="sr-only font-heading">Footer Navigation</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="col-span-2 flex flex-col gap-4">
            <Link to="/" className="group flex items-center gap-2.5 font-heading text-lg font-bold text-foreground transition-opacity hover:opacity-90">
              <svg className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M 25 78 L 25 48 L 43 30 L 43 78 Z M 57 78 L 57 34 L 75 16 L 75 78 Z M 57 30 L 57 22 L 75 4 L 75 12 Z" 
                  fill="currentColor" 
                />
                <path 
                  d="M 34 12 L 43 21 L 34 30 L 25 21 Z" 
                  fill="hsl(var(--brand-blue))" 
                />
              </svg>
              <span className="tracking-tight text-foreground font-bold">Code<span className="font-normal text-primary ml-0.5">Strategists</span></span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              Professional Developer Tools for Modern Frontend Engineers. Format, convert, validate, and generate code quickly using premium, 100% browser-based client-side developer tools.
            </p>
            
            <div className="w-full max-w-xs mt-1">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-2">Subscribe to newsletter</span>
              <NewsletterSignup source="footer" variant="compact" />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground p-2 hover:bg-secondary rounded-lg transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                <span>Star on GitHub</span>
              </a>
            </div>
          </div>

          {/* Column 1: Developer Tools */}
          <div>
            <h3 className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Developer Tools</h3>
            <ul className="space-y-2.5 text-sm">
              {developerTools.map((tool) => (
                <li key={tool.slug}>
                  <Link to={`/tool/${tool.slug}`} className="text-muted-foreground hover:text-foreground transition-colors">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Categories</h3>
            <ul className="space-y-2.5 text-sm">
              {footerCategories.map((cat) => (
                <li key={cat.id}>
                  <Link to={`/tools?category=${cat.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                    {cat.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/tools" className="text-primary hover:underline font-medium transition-colors">
                  View All →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Legal */}
          <div>
            <h3 className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/changelog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Changelog
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4">
            <p>© {currentYear} CodeStrategists. All rights reserved.</p>
            <span className="h-4 w-px bg-border hidden md:inline" />
            <p className="font-mono text-xs font-semibold bg-secondary px-2 py-0.5 rounded border border-border/60 text-secondary-foreground">
              v2.0.0
            </p>
          </div>
          <p className="flex items-center gap-1.5">
            Designed for engineers with <Heart className="h-3 w-3 text-red-500 fill-current animate-pulse" aria-hidden="true" /> by Google DeepMind Team.
          </p>
        </div>
      </div>
    </footer>
  )
}
