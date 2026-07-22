import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SEO } from '@/components/common/SEO'

export function NotFoundPage() {
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 grid-bg">
      <SEO title="Page Not Found - CodeStrategists" />
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glow-spot opacity-70" />
      
      <div className="relative max-w-md w-full glass-panel rounded-2xl p-8 text-center shadow-premium border border-border/40 flex flex-col items-center gap-6 z-10">
        
        {/* Animated Brand Mark / 404 hybrid visual */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite] opacity-20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6"/>
          </svg>
          <div className="relative p-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl transition-all duration-300 hover:scale-105 hover:bg-primary/15">
            <FileQuestion className="h-10 w-10 animate-pulse" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-5xl font-black tracking-tight text-foreground bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">404</h1>
          <h2 className="font-heading text-xl font-bold text-foreground">Lost in Translation</h2>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          The developer tool or page you are looking for has either been moved, renamed, or is currently compiling in our pipeline.
        </p>

        <div className="h-px w-full bg-border/60" />

        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>
              Back Home
            </Button>
          </Link>
          <Link to="/workspace">
            <Button size="sm" leftIcon={<Home className="h-4 w-4" aria-hidden="true" />}>
              Workspace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
