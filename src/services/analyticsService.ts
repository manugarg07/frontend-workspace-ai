import { trackEvent } from './analytics'

export interface AnalyticsEvent {
  id: string
  name: string
  properties: Record<string, any>
  timestamp: string
}

const EVENTS_KEY = 'workspace_analytics_events'

function getEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveEvent(name: string, properties: Record<string, any>) {
  try {
    const events = getEvents()
    const newEvent: AnalyticsEvent = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      name,
      properties,
      timestamp: new Date().toISOString()
    }
    
    // Maintain a local log of the last 100 events
    const updated = [newEvent, ...events].slice(0, 100)
    localStorage.setItem(EVENTS_KEY, JSON.stringify(updated))
    
    // Forward to GA4 / Clarity integration
    trackEvent({
      action: name,
      category: 'growth_features',
      label: properties.toolId || properties.slug || properties.query || properties.email || ''
    })
    
    // Log to console in development environment
    if (import.meta.env.DEV) {
      console.log(`[Analytics Event] "${name}":`, properties)
    }
  } catch (e) {
    console.error('Failed to log analytics event:', e)
  }
}

export const analytics = {
  trackToolOpened(toolId: string) {
    saveEvent('tool_opened', { toolId })
  },
  
  trackToolUsed(toolId: string, actionType: string) {
    saveEvent('tool_used', { toolId, actionType })
  },
  
  trackCopyClicked(toolId: string, target: string) {
    saveEvent('copy_clicked', { toolId, target })
  },
  
  trackDownloadClicked(toolId: string, filename: string) {
    saveEvent('download_clicked', { toolId, filename })
  },
  
  trackShareClicked(itemType: 'tool' | 'blog', slug: string, platform: string) {
    saveEvent('share_clicked', { itemType, slug, platform })
  },
  
  trackSearchUsed(query: string, resultsCount: number) {
    saveEvent('search_used', { query, resultsCount })
  },
  
  trackNewsletterSignup(email: string, source: string) {
    saveEvent('newsletter_signup', { email, source })
  },
  
  trackFeedbackSubmitted(toolId: string, helpful: boolean, comments?: string) {
    saveEvent('feedback_submitted', { toolId, helpful, comments: comments || '' })
  },

  // Retrieve logged events for auditing
  getEventsLog(): AnalyticsEvent[] {
    return getEvents()
  }
}
