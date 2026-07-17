/**
 * Production-Grade Analytics Integration Point.
 * Handles Google Analytics 4 (GA4) and Microsoft Clarity.
 * Strictly respects user privacy and GPDR cookie compliance by loading only after consent.
 */

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
}

/**
 * Checks if the user has explicitly accepted cookies/analytics tracking.
 * We enforce a strict opt-in cookie compliance system.
 */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('cookie_consent_analytics') === 'true'
}

/**
 * Initializes Google Analytics 4 (GA4) and Microsoft Clarity scripting snippets.
 * Dynamically injects script tags only if consent has been explicitly granted.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return
  
  if (!hasAnalyticsConsent()) {
    console.log('[Analytics] Initialization skipped: User consent pending or declined.')
    return
  }

  const gaId = import.meta.env.VITE_GA_ID
  const clarityId = import.meta.env.VITE_CLARITY_ID

  // 1. Initialize Google Analytics 4 (GA4)
  if (gaId && !document.getElementById('ga-gtag-script')) {
    try {
      const gaScript = document.createElement('script')
      gaScript.id = 'ga-gtag-script'
      gaScript.async = true
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
      document.head.appendChild(gaScript)

      window.dataLayer = window.dataLayer || []
      window.gtag = function gtag() {
        window.dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', gaId, { 
        page_path: window.location.pathname,
        anonymize_ip: true // Enforce IP anonymization for GDPR
      })
      console.log(`[Analytics] GA4 telemetry successfully initialized with ID: ${gaId}`)
    } catch (err) {
      console.error('[Analytics] Failed to initialize GA4 scripts:', err)
    }
  }

  // 2. Initialize Microsoft Clarity
  if (clarityId && !document.getElementById('clarity-script')) {
    try {
      const clarityScript = document.createElement('script')
      clarityScript.id = 'clarity-script'
      clarityScript.async = true
      
      const claritySnippet = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
      `
      clarityScript.innerHTML = claritySnippet
      document.head.appendChild(clarityScript)
      console.log(`[Analytics] Microsoft Clarity telemetry successfully initialized with ID: ${clarityId}`)
    } catch (err) {
      console.error('[Analytics] Failed to initialize Microsoft Clarity:', err)
    }
  }
}

/**
 * Tracks page view transitions across single-page routes.
 * Called automatically on route changes inside router/layout lifecycle hooks.
 */
export function trackPageView(url: string): void {
  if (typeof window === 'undefined') return
  if (!hasAnalyticsConsent()) return

  const gaId = import.meta.env.VITE_GA_ID
  if (gaId && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title
    })
  }

  console.log(`[Analytics] Telemetry recorded page view: ${url}`)
}

/**
 * Tracks custom user interaction events (e.g. click copy, compile, download).
 */
export function trackEvent({ action, category, label, value }: AnalyticsEvent): void {
  if (typeof window === 'undefined') return
  if (!hasAnalyticsConsent()) return

  const gaId = import.meta.env.VITE_GA_ID
  if (gaId && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }

  console.log('[Analytics] Telemetry recorded custom event:', { action, category, label, value })
}
