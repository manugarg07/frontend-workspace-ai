/**
 * Centralized production-ready error monitoring service.
 * Prepares hooks for integrations with platforms like Sentry or Datadog
 * without introducing direct third-party vendor dependencies.
 */

export interface ErrorContext {
  componentName?: string
  toolId?: string
  action?: string
  extra?: Record<string, any>
}

/**
 * Registers listeners for global uncaught synchronous exceptions and unhandled promise rejections.
 */
export function initErrorMonitoring(): void {
  if (typeof window === 'undefined') return

  window.addEventListener('error', (event) => {
    reportError(event.error || new Error(event.message), {
      action: 'global_uncaught_exception',
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason || new Error('Unhandled Promise Rejection'), {
      action: 'global_unhandled_rejection'
    })
  })

  console.log('[Error Monitoring] Hooked global uncaught errors and promise rejections.')
}

/**
 * Centrally captures, formats, and logs exceptions.
 * Stubs external reporting tools in production builds.
 */
export function reportError(error: unknown, context?: ErrorContext): void {
  const isDev = import.meta.env.DEV
  const errorObj = error instanceof Error ? error : new Error(String(error))

  // 1. Local environment console outputs
  if (isDev) {
    console.group(`🔴 [Error Monitoring] Captured Error: ${errorObj.message}`)
    console.error(errorObj)
    if (context) {
      console.log('Context:', context)
    }
    console.groupEnd()
  } else {
    // Production console warning stub (preserves logs safely)
    console.error(`[Error Monitoring] Error: ${errorObj.message}`, context)
  }

  // 2. Future vendor integration hook (e.g. Sentry / Datadog)
  /*
  if (typeof window !== 'undefined') {
    // Sentry.captureException(errorObj, { extra: context });
  }
  */
}
