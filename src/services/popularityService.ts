import { TOOLS } from './toolRegistry'
import type { Tool } from './toolRegistry'
import { trackEvent } from './analytics'

const STORAGE_KEY = 'tool_usage_counts'

/**
 * Tracks the usage of a specific tool by incrementing its count in localStorage
 * and recording it in analytics.
 */
export function trackToolUsage(toolId: string): void {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY)
    const counts = rawData ? JSON.parse(rawData) : {}
    
    counts[toolId] = (counts[toolId] || 0) + 1
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts))

    // Record usage in Google Analytics
    trackEvent({
      action: 'use_tool',
      category: 'tools',
      label: toolId
    })
  } catch (error) {
    console.error('Failed to track tool usage count:', error)
  }
}

/**
 * Returns the most popular tools, sorted by local analytics usage,
 * falling back to the standard registry-based popularity flag.
 */
export function getPopularTools(limit = 4): Tool[] {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY)
    const counts = rawData ? JSON.parse(rawData) : {}
    
    // Only include non-coming-soon tools
    const activeTools = TOOLS.filter((t) => !t.comingSoon)
    
    const sorted = [...activeTools].sort((a, b) => {
      const countA = counts[a.id] || 0
      const countB = counts[b.id] || 0
      
      // Sort primarily by tracked analytics count
      if (countA !== countB) {
        return countB - countA
      }
      
      // Secondary fallback to hardcoded popular flag
      const popularA = a.popular ? 1 : 0
      const popularB = b.popular ? 1 : 0
      return popularB - popularA
    })
    
    return sorted.slice(0, limit)
  } catch (error) {
    console.error('Failed to retrieve popular tools from analytics:', error)
    // Safe fallback to hardcoded list in case of errors/server-side-rendering mockup environments
    return TOOLS.filter((t) => t.popular && !t.comingSoon).slice(0, limit)
  }
}
