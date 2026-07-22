import React from 'react'
import { Share2, Link as LinkIcon, Linkedin, Facebook } from 'lucide-react'
import { useToast } from '../ui/Toast'
import { analytics } from '@/services/analyticsService'
import { cn } from '@/lib/utils'

// SVG for X (formerly Twitter) brand icon since lucide-react might not have X icon in this version
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-3.5 w-3.5 fill-current', className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

interface SocialShareProps {
  slug: string
  title: string
  itemType: 'tool' | 'blog'
  className?: string
  variant?: 'inline' | 'row'
}

export function SocialShare({ slug, title, itemType, className, variant = 'inline' }: SocialShareProps) {
  const { toast } = useToast()
  
  const baseUrl = 'https://www.codestrategists.com'
  const shareUrl = itemType === 'tool' ? `${baseUrl}/tool/${slug}` : `${baseUrl}/blog/${slug}`

  const handleShareClick = (platform: string, url: string) => {
    // Track sharing action
    analytics.trackShareClicked(itemType, slug, platform)
    
    // Open in popup window
    window.open(url, '_blank', 'width=600,height=450,resizable=yes,scrollbars=yes')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    analytics.trackShareClicked(itemType, slug, 'copy_link')
    toast('Link copied to clipboard!', 'success')
  }

  const platforms = [
    {
      name: 'X',
      icon: <XIcon className="h-3.5 w-3.5" />,
      color: 'bg-foreground text-background hover:opacity-90',
      action: () => handleShareClick('X', `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`)
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="h-3.5 w-3.5" />,
      color: 'bg-[#0077b5] text-white hover:opacity-90',
      action: () => handleShareClick('LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`)
    },
    {
      name: 'Facebook',
      icon: <Facebook className="h-3.5 w-3.5" />,
      color: 'bg-[#1877f2] text-white hover:opacity-90',
      action: () => handleShareClick('Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)
    }
  ]

  if (variant === 'row') {
    return (
      <div className={cn('flex flex-wrap items-center gap-2 font-sans', className)}>
        <span className="text-xs font-semibold text-muted-foreground mr-1">Share this:</span>
        {platforms.map((p) => (
          <button
            key={p.name}
            onClick={p.action}
            className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-sm', p.color)}
            aria-label={`Share on ${p.name}`}
          >
            {p.icon}
            <span>{p.name}</span>
          </button>
        ))}
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card hover:bg-secondary/40 text-foreground rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-sm"
          aria-label="Copy page link"
        >
          <LinkIcon className="h-3.5 w-3.5" />
          <span>Copy Link</span>
        </button>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-1.5 font-sans', className)}>
      {platforms.map((p) => (
        <button
          key={p.name}
          onClick={p.action}
          className={cn('p-2 rounded-lg cursor-pointer transition-colors border border-border bg-card/60 hover:bg-secondary/40 text-muted-foreground hover:text-foreground focus-ring shadow-sm', p.name === 'X' ? 'hover:text-foreground' : '')}
          aria-label={`Share on ${p.name}`}
          title={`Share on ${p.name}`}
        >
          {p.icon}
        </button>
      ))}
      <button
        onClick={handleCopyLink}
        className="p-2 rounded-lg cursor-pointer transition-colors border border-border bg-card/60 hover:bg-secondary/40 text-muted-foreground hover:text-foreground focus-ring shadow-sm"
        aria-label="Copy page link"
        title="Copy Link"
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
