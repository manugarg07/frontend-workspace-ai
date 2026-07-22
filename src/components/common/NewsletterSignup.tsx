import React, { useState } from 'react'
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Input } from '../ui/Input'
import { useToast } from '../ui/Toast'
import { newsletterService } from '@/services/newsletterService'
import { cn } from '@/lib/utils'

interface NewsletterSignupProps {
  source: string
  className?: string
  variant?: 'card' | 'inline' | 'compact'
}

export function NewsletterSignup({ source, className, variant = 'card' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    // Simulate minor delay for premium UX feel
    await new Promise((r) => setTimeout(r, 600))
    
    const result = newsletterService.subscribe(email, source)
    setIsSubmitting(false)

    if (result.success) {
      setIsSubscribed(true)
      setEmail('')
      toast(result.message, 'success')
    } else {
      toast(result.message, 'error')
    }
  }

  if (isSubscribed) {
    return (
      <div className={cn('flex flex-col items-center text-center p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl gap-2 font-sans', className)}>
        <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-pulse" />
        <h4 className="font-heading text-sm sm:text-base font-bold text-foreground">You\'re on the list!</h4>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Thanks for subscribing. We\'ll send you high-quality developer resources monthly.
        </p>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={cn('flex flex-col gap-2 w-full font-sans', className)}>
        <label htmlFor="compact-email" className="sr-only">Email address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            id="compact-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-9 pr-12 bg-card/45 border-border"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="absolute right-1 top-1 p-1.5 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-lg transition-all focus-ring cursor-pointer"
            aria-label="Subscribe"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex flex-col md:flex-row items-start md:items-center justify-between p-6 sm:p-8 border border-border/40 bg-card/40 rounded-2xl gap-6 font-sans', className)}>
        <div className="flex flex-col gap-1 w-full max-w-md">
          <h4 className="font-heading text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <span>Developer Newsletter</span>
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Get the latest frontend updates, React deep-dives, and tool checklists delivered to your inbox monthly.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-sm shrink-0">
          <label htmlFor="inline-email" className="sr-only">Email address</label>
          <Input
            id="inline-email"
            type="email"
            placeholder="dev@codestrategists.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 bg-card/60 border-border"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold rounded-lg text-xs sm:text-sm transition-all focus-ring cursor-pointer shrink-0"
          >
            {isSubmitting ? 'Joining...' : 'Subscribe'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <Card className={cn('bg-card/45 border-border overflow-hidden font-sans', className)}>
      <CardHeader className="pb-3">
        <CardTitle as="h3" className="font-heading text-base sm:text-lg flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
          Join the Newsletter
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Stay updated with monthly tutorials, React engineering checklists, CSS tricks, and newly added local tools.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label htmlFor="card-email" className="sr-only">Email address</label>
          <Input
            id="card-email"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-card/60 border-border"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold rounded-lg text-xs sm:text-sm shadow transition-opacity focus-ring cursor-pointer"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
          </button>
        </form>
        <span className="text-[10px] text-muted-foreground text-center">
          Strictly privacy-focused. Unsubscribe with one click at any time.
        </span>
      </CardContent>
    </Card>
  )
}
