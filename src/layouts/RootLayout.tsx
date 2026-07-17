import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import { CommandPalette } from '@/components/common/CommandPalette'
import { CookieConsent } from '@/components/common/CookieConsent'
import { initAnalytics, trackPageView } from '@/services/analytics'

export function RootLayout() {
  const location = useLocation()

  // Initialize analytics on initial layout mount
  useEffect(() => {
    initAnalytics()
  }, [])

  // Track page views on route transitions
  useEffect(() => {
    trackPageView(location.pathname + location.search)
  }, [location])

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
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
