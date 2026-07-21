import React, { useState, useEffect } from 'react'
import { Cookie, Settings, Check, X, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { initAnalytics } from '@/services/analytics'
import { motion, AnimatePresence } from 'framer-motion'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [analyticsConsent, setAnalyticsConsent] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('cookie_consent_analytics')
      if (consent === null) {
        // Delay display slightly to enhance user experience
        const timer = setTimeout(() => setIsVisible(true), 1500)
        return () => clearTimeout(timer)
      } else if (consent === 'true') {
        // Trigger initialization immediately if already accepted
        initAnalytics()
      }
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem('cookie_consent_analytics', 'true')
    initAnalytics()
    setIsVisible(false)
  }

  const handleDeclineAll = () => {
    localStorage.setItem('cookie_consent_analytics', 'false')
    setIsVisible(false)
  }

  const handleSavePreferences = () => {
    const value = analyticsConsent ? 'true' : 'false'
    localStorage.setItem('cookie_consent_analytics', value)
    if (analyticsConsent) {
      initAnalytics()
    }
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className="fixed bottom-4 right-4 z-50 max-w-md w-[calc(100vw-2rem)] border border-border/80 bg-card/95 backdrop-blur-md p-6 rounded-2xl shadow-premium glass-panel font-sans text-left"
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
              <Cookie className="h-5 w-5 animate-pulse" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 id="cookie-consent-title" className="font-heading text-sm font-bold text-foreground flex items-center gap-1.5">
                Cookie Compliance Banner
              </h3>
              <p id="cookie-consent-desc" className="text-xs text-muted-foreground leading-relaxed">
                We use cookies to analyze web traffic, optimize your single-page editor workspace, and improve SEO mapping.
              </p>
            </div>
          </div>

          {/* Preferences Drawer */}
          <AnimatePresence>
            {showPreferences && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-border/40 space-y-3 overflow-hidden"
              >
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Custom Permissions</span>
                
                {/* Essential Cookies */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20 border border-border/20 text-xs">
                  <div className="space-y-0.5 pr-2">
                    <span className="font-semibold text-foreground block">Essential Cookies</span>
                    <p className="text-[10px] text-muted-foreground leading-normal">Required for layouts caching and favorites persistence.</p>
                  </div>
                  <div className="flex items-center justify-center h-5 w-5 bg-card border border-border/50 text-muted-foreground rounded shrink-0 select-none">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20 border border-border/20 text-xs cursor-pointer hover:bg-secondary/35 transition-colors select-none">
                  <div className="space-y-0.5 pr-2">
                    <span className="font-semibold text-foreground block">Analytics & Performance</span>
                    <p className="text-[10px] text-muted-foreground leading-normal">Enables Google Analytics 4 tracking and Microsoft Clarity session mapping.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analyticsConsent}
                    onChange={(e) => setAnalyticsConsent(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer bg-background"
                  />
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowPreferences(prev => !prev)}
              aria-expanded={showPreferences}
              className="px-3 h-9 text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors rounded-lg bg-transparent cursor-pointer focus-ring"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              <span>{showPreferences ? 'Hide Settings' : 'Preferences'}</span>
            </button>
            
            {showPreferences ? (
              <>
                <Button variant="outline" size="sm" onClick={handleDeclineAll} className="text-xs h-9">
                  Decline All
                </Button>
                <Button variant="primary" size="sm" onClick={handleSavePreferences} className="text-xs h-9 font-semibold">
                  Save Choices
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleDeclineAll} className="text-xs h-9">
                  Reject
                </Button>
                <Button variant="primary" size="sm" onClick={handleAcceptAll} className="text-xs h-9 font-semibold">
                  Accept All
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
