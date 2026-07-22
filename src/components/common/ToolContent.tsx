import React from 'react'
import { CheckCircle2, ListOrdered, Lightbulb, Code2, ClipboardCopy, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { FAQSection } from './FAQSection'
import { RelatedToolsSection } from './RelatedToolsSection'
import { ToolFeedbackWidget } from './ToolFeedbackWidget'
import { SocialShare } from './SocialShare'
import { NewsletterSignup } from './NewsletterSignup'
import type { ToolSEOConfig } from '@/config/tools.config'
import { cn } from '@/lib/utils'

interface ToolContentProps {
  tool: ToolSEOConfig
  className?: string
}

export function ToolContent({ tool, className }: ToolContentProps) {
  return (
    <div className={cn('flex flex-col gap-12 w-full mt-8 border-t border-border/40 pt-12 text-left font-sans', className)}>
      {/* 1. Header & Introduction */}
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          About {tool.title}
        </h2>
        <div className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-4xl space-y-4 font-normal">
          {tool.introduction.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* 2. Grid for Features, How To Use & Common Use Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Column: Features & Use Cases */}
        <div className="flex flex-col gap-8">
          {/* Key Features Card */}
          <Card className="bg-card/45 border-border flex-1">
            <CardHeader className="pb-3">
              <CardTitle as="h3" className="font-heading text-base sm:text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
                Key Features & Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <ul className="space-y-3.5">
                {tool.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Common Use Cases Card */}
          <Card className="bg-card/45 border-border flex-1">
            <CardHeader className="pb-3">
              <CardTitle as="h3" className="font-heading text-base sm:text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                Common Use Cases
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <ul className="space-y-3.5">
                {tool.useCases.map((useCase, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="font-bold text-foreground font-mono shrink-0 mt-0.5 text-[11px] bg-secondary border border-border px-1.5 py-0.5 rounded">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5">{useCase}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: How to Use Guide */}
        <Card className="bg-card/45 border-border">
          <CardHeader className="pb-3">
            <CardTitle as="h3" className="font-heading text-base sm:text-lg flex items-center gap-2">
              <ListOrdered className="h-5 w-5 text-primary" aria-hidden="true" />
              Step-by-Step Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <ol className="relative border-l border-border/60 ml-3 space-y-6">
              {tool.howToUse.map((step, idx) => (
                <li key={idx} className="mb-0 pl-6 relative">
                  {/* Visual Timeline Marker Node */}
                  <span className="absolute -left-3.5 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-secondary border border-border text-xs font-bold text-foreground font-mono shadow-sm">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground/90 text-sm">Instruction Step {idx + 1}</p>
                    <p className="mt-1 text-xs sm:text-sm leading-relaxed">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* 3. Visual Example Card */}
      {tool.example && (
        <Card className="bg-card/45 border-border overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-secondary/10 pb-4">
            <CardTitle as="h3" className="font-heading text-base sm:text-lg flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" aria-hidden="true" />
              Interactive Input / Output Example
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Sample Input Panel */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Sample Input Payload
                </span>
                <pre className="flex-1 bg-black/40 border border-border/50 p-4 rounded-xl text-xs text-foreground/90 font-mono overflow-x-auto whitespace-pre leading-relaxed select-text min-h-[140px] max-h-[220px]">
                  <code>{tool.example.input}</code>
                </pre>
              </div>

              {/* Sample Output Panel */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono">
                  Processed Sandbox Output
                </span>
                <pre className="flex-1 bg-black/40 border border-primary/20 p-4 rounded-xl text-xs text-primary/95 font-mono overflow-x-auto whitespace-pre leading-relaxed select-text min-h-[140px] max-h-[220px]">
                  <code>{tool.example.output}</code>
                </pre>
              </div>
            </div>

            {/* Explanation details card */}
            <div className="bg-secondary/15 border border-border/40 p-4.5 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground font-mono block mb-1">
                Mechanism Explanation
              </span>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {tool.example.explanation}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3.5 Sharing & Feedback Panel */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch md:items-center justify-between bg-card/20 border border-border/40 p-5 rounded-2xl">
        <ToolFeedbackWidget toolId={tool.id} className="border-0 bg-transparent p-0 max-w-full flex-1" />
        <div className="h-px w-full md:h-8 md:w-px bg-border/40 hidden md:block" />
        <div className="flex flex-col gap-2 shrink-0 text-left">
          <span className="text-xs font-semibold text-muted-foreground">Share this tool:</span>
          <SocialShare slug={tool.slug} title={`Free Online ${tool.title}`} itemType="tool" variant="inline" />
        </div>
      </div>

      {/* 4. Tips & Pitfalls Grid */}
      {((tool.tips && tool.tips.length > 0) || (tool.pitfalls && tool.pitfalls.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Pro Tips */}
          {tool.tips && tool.tips.length > 0 && (
            <Card className="bg-card/45 border-border">
              <CardHeader className="pb-3">
                <CardTitle as="h3" className="font-heading text-base sm:text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                  Developer Pro-Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <ul className="space-y-3.5">
                  {tool.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" aria-hidden="true" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Common Pitfalls */}
          {tool.pitfalls && tool.pitfalls.length > 0 && (
            <Card className="bg-card/45 border-border">
              <CardHeader className="pb-3">
                <CardTitle as="h3" className="font-heading text-base sm:text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
                  Common Pitfalls to Avoid
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <ul className="space-y-3.5">
                  {tool.pitfalls.map((pitfall, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-2" aria-hidden="true" />
                      <span>{pitfall}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 4.5 Tool Page Newsletter Signup */}
      <NewsletterSignup source={`tool_${tool.id}`} variant="inline" />

      {/* 5. Dynamic FAQs Section */}
      <FAQSection faqs={tool.faqs} />

      {/* 6. Related tools Internal links pipeline */}
      <RelatedToolsSection relatedSlugs={tool.relatedTools} />
    </div>
  )
}
