import React, { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ToolFAQ } from '@/config/tools.config'

interface FAQSectionProps {
  faqs: ToolFAQ[]
  className?: string
}

export function FAQSection({ faqs, className }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  if (!faqs || faqs.length === 0) return null

  return (
    <div className={cn('flex flex-col gap-4 text-left w-full font-sans', className)}>
      <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-primary" aria-hidden="true" />
        Frequently Asked Questions
      </h2>
      <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card/40 backdrop-blur-sm">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index
          const buttonId = `faq-btn-${index}`
          const panelId = `faq-panel-${index}`

          return (
            <div key={index} className="group transition-colors duration-200">
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between px-6 py-4.5 text-left font-medium text-foreground hover:bg-secondary/20 transition-colors focus-ring cursor-pointer"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="font-heading text-sm sm:text-base pr-4 text-foreground/90 font-semibold group-hover:text-foreground">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4.5 w-4.5 text-muted-foreground transition-transform duration-250 shrink-0 group-hover:text-foreground',
                      isOpen && 'transform rotate-180 text-primary'
                    )}
                    aria-hidden="true"
                  />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden bg-secondary/5"
                  >
                    <div className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
