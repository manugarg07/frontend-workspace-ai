import { analytics } from './analyticsService'

const FEEDBACK_KEY = 'user_feedback_log'

export interface UserFeedback {
  id: string
  toolId: string
  helpful: boolean
  comments?: string
  timestamp: string
}

export const feedbackService = {
  submitFeedback(toolId: string, helpful: boolean, comments?: string): { success: boolean; message: string } {
    try {
      const logs = this.getFeedbackLogs()
      
      const newFeedback: UserFeedback = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        toolId,
        helpful,
        comments: comments?.trim(),
        timestamp: new Date().toISOString()
      }

      localStorage.setItem(FEEDBACK_KEY, JSON.stringify([newFeedback, ...logs]))
      
      // Track analytics event
      analytics.trackFeedbackSubmitted(toolId, helpful, comments)

      return { success: true, message: 'Thank you for your valuable feedback!' }
    } catch (e) {
      console.error('Failed to save feedback:', e)
      return { success: false, message: 'Could not log feedback. Please try again.' }
    }
  },

  getFeedbackLogs(): UserFeedback[] {
    try {
      const raw = localStorage.getItem(FEEDBACK_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }
}
