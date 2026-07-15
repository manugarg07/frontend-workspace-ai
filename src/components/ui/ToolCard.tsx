import React from 'react'
import { Link } from 'react-router-dom'
import * as Lucide from 'lucide-react'
import { ArrowRight, Terminal } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card'
import { Badge } from './Badge'
import { cn } from '@/lib/utils'
import type { Tool } from '@/services/toolRegistry'

interface ToolCardProps {
  tool: Tool
  layout?: 'grid' | 'list' | 'landing'
  className?: string
}

export function ToolCard({
  tool,
  layout = 'grid',
  className
}: ToolCardProps) {
  const ToolIcon = (Lucide as any)[tool.icon] || Terminal

  const cardContent = (
    <Card 
      hoverable={!tool.comingSoon} 
      className={cn(
        "h-full flex flex-col justify-between border-border transition-all duration-300 relative group overflow-hidden",
        layout === 'landing' ? "bg-card/45 border-border/60 hover:border-primary/45" : "bg-card/60 hover:border-primary/20",
        tool.comingSoon && "opacity-65 pointer-events-none"
      )}
    >
      {/* Glow decorative effect for premium look */}
      {!tool.comingSoon && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
      )}

      <CardHeader className="pb-3 p-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {tool.category}
          </span>
          <div className="flex items-center gap-1.5">
            {tool.popular && !tool.comingSoon && (
              <Badge variant="primary" className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 border-none">
                Popular
              </Badge>
            )}
            {tool.featured && !tool.comingSoon && (
              <Badge variant="accent" className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 border-none">
                Featured
              </Badge>
            )}
            {tool.comingSoon && (
              <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 text-muted-foreground bg-secondary/80">
                Soon
              </Badge>
            )}
          </div>
        </div>

        {/* Icon Circle */}
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300",
          layout === 'landing' 
            ? "bg-secondary/50 text-primary group-hover:bg-primary/10 group-hover:scale-115 mb-5" 
            : "bg-primary/5 text-primary group-hover:bg-primary/15 group-hover:scale-110 mb-4"
        )}>
          <ToolIcon className="h-5 w-5" />
        </div>

        <CardTitle className="font-heading text-base group-hover:text-primary transition-colors">
          {tool.title}
        </CardTitle>
        
        <CardDescription className="text-xs line-clamp-3 mt-1.5 leading-relaxed text-muted-foreground">
          {tool.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 pb-6 px-6 text-xs font-semibold text-primary flex items-center gap-1 mt-auto">
        {!tool.comingSoon ? (
          <div className="flex items-center gap-1 group-hover:text-primary">
            <span>{layout === 'landing' ? 'Open Sandbox' : 'Open Utility'}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        ) : (
          <span className="text-muted-foreground font-medium">In active pipeline</span>
        )}
      </CardContent>
    </Card>
  )

  if (tool.comingSoon) {
    return (
      <div className={cn("block h-full cursor-not-allowed select-none", className)}>
        {cardContent}
      </div>
    )
  }

  return (
    <Link to={`/tool/${tool.slug}`} className={cn("block h-full group", className)}>
      {cardContent}
    </Link>
  )
}
