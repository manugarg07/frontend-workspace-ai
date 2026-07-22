import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import { CommandPalette } from '@/components/common/CommandPalette'
import { CookieConsent } from '@/components/common/CookieConsent'
import { initAnalytics, trackPageView } from '@/services/analytics'

export function RootLayout() {
  const location = useLocation()
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)

  // Initialize analytics on initial layout mount
  useEffect(() => {
    initAnalytics()
  }, [])

  // Track page views on route transitions
  useEffect(() => {
    trackPageView(location.pathname + location.search)
  }, [location])

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {!isOnline && (
        <div className="bg-destructive/10 text-destructive border-b border-destructive/20 text-center py-2 text-xs font-semibold px-4 flex items-center justify-center gap-2 animate-fade-in z-50">
          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          <span>Offline Mode: CodeStrategists is fully functional client-side. No data will leave your device.</span>
        </div>
      )}
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <CommandPalette />
      <CookieConsent />
    </div>
  )
}
