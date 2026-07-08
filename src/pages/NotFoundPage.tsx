import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SEO } from '@/components/common/SEO'

export function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center flex flex-col items-center justify-center gap-6">
      <SEO title="Page Not Found - Frontend Workspace AI" />
      
      <div className="p-4 bg-primary/10 text-primary border border-primary/20 rounded-full animate-bounce">
        <FileQuestion className="h-12 w-12" />
      </div>

      <h1 className="font-heading text-4xl font-extrabold tracking-tight">404</h1>
      <h2 className="font-heading text-xl font-bold text-foreground -mt-3">Page Not Found</h2>
      
      <p className="text-sm text-muted-foreground leading-relaxed">
        The tool or page you are looking for has either been moved, is coming soon in a future release, or does not exist.
      </p>

      <div className="flex flex-wrap gap-3 mt-2">
        <Link to="/">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back Home
          </Button>
        </Link>
        <Link to="/workspace">
          <Button size="sm" leftIcon={<Home className="h-4 w-4" />}>
            Workspace
          </Button>
        </Link>
      </div>
    </div>
  )
}
