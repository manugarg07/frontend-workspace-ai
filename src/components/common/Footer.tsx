import React from 'react'
import { Link } from 'react-router-dom'
import { Terminal, Github, Heart } from 'lucide-react'
import { CATEGORIES } from '@/services/toolRegistry'

export function Footer() {
  const currentYear = new Date().getFullYear()

  // Take the first 4 categories for footer column
  const footerCategories = CATEGORIES.slice(0, 4)

  return (
    <footer className="border-t border-border/40 bg-card/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Brand info column */}
          <div className="col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
              <Terminal className="h-5 w-5 text-primary" />
              <span>Workspace<span className="text-primary">.ai</span></span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              Build Faster. Ship Better. The ultimate offline developer productivity dashboard. Everything you need to optimize web projects.
            </p>
            <div className="flex items-center gap-3 mt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="GitHub profile link"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Categories column */}
          <div>
            <h4 className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Categories</h4>
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

          {/* Legal column */}
          <div>
            <h4 className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
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

          {/* Product Info column */}
          <div>
            <h4 className="font-heading text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Company</h4>
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
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} Frontend Workspace AI. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed for engineers with <Heart className="h-3 w-3 text-red-500 fill-current animate-pulse" /> by Google DeepMind Team.
          </p>
        </div>
      </div>
    </footer>
  )
}
