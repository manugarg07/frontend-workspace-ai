import { analytics } from './analyticsService'

const SUBSCRIBERS_KEY = 'newsletter_subscribers_list'

export interface Subscriber {
  email: string
  source: string
  subscribedAt: string
}

export const newsletterService = {
  subscribe(email: string, source: string): { success: boolean; message: string } {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Please enter a valid email address.' }
    }

    try {
      const subscribers: Subscriber[] = this.getSubscribers()
      const normalizedEmail = email.toLowerCase().trim()

      const exists = subscribers.some((sub) => sub.email === normalizedEmail)
      if (exists) {
        return { success: false, message: 'This email is already subscribed!' }
      }

      const newSubscriber: Subscriber = {
        email: normalizedEmail,
        source,
        subscribedAt: new Date().toISOString()
      }

      localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify([newSubscriber, ...subscribers]))
      
      // Track signup event
      analytics.trackNewsletterSignup(normalizedEmail, source)

      return { success: true, message: 'Thank you for subscribing! Keep an eye on your inbox.' }
    } catch (e) {
      console.error('Failed to subscribe:', e)
      return { success: false, message: 'Something went wrong. Please try again later.' }
    }
  },

  getSubscribers(): Subscriber[] {
    try {
      const raw = localStorage.getItem(SUBSCRIBERS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }
}
