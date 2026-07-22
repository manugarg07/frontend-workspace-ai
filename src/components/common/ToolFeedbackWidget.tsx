import React, { useState } from 'react'
import { ThumbsUp, ThumbsDown, MessageSquare, Check, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Textarea } from '../ui/Textarea'
import { useToast } from '../ui/Toast'
import { feedbackService } from '@/services/feedbackService'
import { cn } from '@/lib/utils'

interface ToolFeedbackWidgetProps {
  toolId: string
  className?: string
}

export function ToolFeedbackWidget({ toolId, className }: ToolFeedbackWidgetProps) {
  const [hasVoted, setHasVoted] = useState(false)
  const [helpful, setHelpful] = useState<boolean | null>(null)
  const [comments, setComments] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleVote = (wasHelpful: boolean) => {
    setHelpful(wasHelpful)
    setHasVoted(true)
    
    if (wasHelpful) {
      feedbackService.submitFeedback(toolId, true)
      toast('Thank you for your rating!', 'success')
    } else {
      setShowForm(true)
    }
  }

  const handleCommentsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate short network delay for premium look
    await new Promise((r) => setTimeout(r, 500))
    
    feedbackService.submitFeedback(toolId, helpful || false, comments)
    setIsSubmitting(false)
    setShowForm(false)
    toast('Feedback successfully recorded. Thank you!', 'success')
  }

  if (showForm) {
    return (
      <Card className={cn('bg-card/45 border-border font-sans max-w-lg w-full', className)}>
        <CardHeader className="pb-2">
          <CardTitle as="h3" className="font-heading text-sm sm:text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span>How can we improve this tool?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCommentsSubmit} className="flex flex-col gap-3">
            <Textarea
              placeholder="Tell us what went wrong, missing features, or bugs you found..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="bg-card/60 border-border text-xs sm:text-sm min-h-[80px]"
              aria-label="Feedback comments"
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  feedbackService.submitFeedback(toolId, false)
                  setShowForm(false)
                  toast('Helpfulness feedback recorded.', 'info')
                }}
                className="px-3 py-1.5 border border-border bg-card/60 hover:bg-secondary/40 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold rounded-lg text-xs transition-opacity cursor-pointer flex items-center gap-1"
              >
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between p-4 border border-border/40 bg-card/25 rounded-2xl gap-4 font-sans max-w-2xl', className)}>
      <span className="text-xs sm:text-sm font-semibold text-foreground/90">
        Did this tool help you?
      </span>
      
      <div className="flex items-center gap-2.5 shrink-0">
        {hasVoted ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium animate-pulse">
            <Check className="h-4 w-4 text-emerald-500" />
            <span>Thanks for your rating!</span>
          </span>
        ) : (
          <>
            <button
              onClick={() => handleVote(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card/60 hover:bg-secondary/40 text-foreground rounded-lg text-xs font-semibold cursor-pointer transition-colors focus-ring"
              aria-label="Yes, this tool helped"
            >
              <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
              <span>Yes</span>
            </button>
            <button
              onClick={() => handleVote(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card/60 hover:bg-secondary/40 text-foreground rounded-lg text-xs font-semibold cursor-pointer transition-colors focus-ring"
              aria-label="No, this tool did not help"
            >
              <ThumbsDown className="h-3.5 w-3.5 text-amber-500" />
              <span>No</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
