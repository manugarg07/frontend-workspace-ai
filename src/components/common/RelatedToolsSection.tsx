import React from 'react'
import { Link } from 'react-router-dom'
import * as Lucide from 'lucide-react'
import { ArrowRight, Terminal } from 'lucide-react'
import { TOOLS_CONFIG } from '@/config/tools.config'
import { cn } from '@/lib/utils'

interface RelatedToolsSectionProps {
  relatedSlugs: string[]
  className?: string
}

export function RelatedToolsSection({ relatedSlugs, className }: RelatedToolsSectionProps) {
  // Resolve slugs to tool configs, filtering out any inactive/missing tools
  const relatedTools = relatedSlugs
    .map((slug) => TOOLS_CONFIG.find((t) => t.slug === slug))
    .filter((tool): tool is NonNullable<typeof tool> => !!tool && !tool.comingSoon)

  if (relatedTools.length === 0) return null

  return (
    <div className={cn('flex flex-col gap-6 text-left w-full font-sans', className)}>
      <div>
        <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          <Lucide.ArrowLeftRight className="h-5 w-5 text-primary" aria-hidden="true" />
          Related Developer Utilities
        </h2>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          Quickly switch context or pipe output data streams directly through our sandbox pipelines.
        </p>
      </div>

      {/* Responsive Visual Pipeline Chain */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {relatedTools.map((tool, idx) => {
          const ToolIcon = (Lucide as any)[tool.icon] || Terminal

          return (
            <Link
              key={tool.id}
              to={`/tool/${tool.slug}`}
              className="group relative flex flex-col justify-between p-5 border border-border/60 hover:border-primary/40 bg-card/45 hover:bg-secondary/10 rounded-2xl transition-all duration-300 overflow-hidden outline-none focus-ring"
            >
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-lg group-hover:bg-primary/10 transition-colors pointer-events-none" />

              <div>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="h-9 w-9 rounded-xl bg-primary/5 text-primary group-hover:bg-primary/15 group-hover:scale-105 transition-all flex items-center justify-center">
                    <ToolIcon className="h-4.5 w-4.5" aria-hidden="true" />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                    Step {idx + 1}
                  </span>
                </div>

                {/* Info */}
                <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {tool.title}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Action Trigger */}
              <div className="text-[11px] font-bold text-primary flex items-center gap-1 mt-4 group-hover:text-primary">
                <span>Run Sandbox</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
