import React from 'react'
import { WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SEO } from '@/components/common/SEO'

export function OfflinePage() {
  const handleReconnect = () => {
    window.location.reload()
  }

  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 grid-bg animate-fade-in">
      <SEO title="You are Offline - CodeStrategists" />
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glow-spot opacity-70" />
      
      <div className="relative max-w-md w-full glass-panel rounded-2xl p-8 text-center shadow-premium border border-border/40 flex flex-col items-center gap-6 z-10">
        
        {/* Animated Wifi Off Icon */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full animate-[spin_16s_linear_infinite] opacity-20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8"/>
          </svg>
          <div className="relative p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl transition-all duration-300 hover:scale-105">
            <WifiOff className="h-10 w-10 animate-pulse" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">Offline Mode</h1>
          <h2 className="text-sm font-medium text-muted-foreground">Connection Lost</h2>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          It looks like your internet connection went offline. Don't worry! Most of our developer tools run 100% locally in your browser and will continue to work.
        </p>

        <div className="h-px w-full bg-border/60" />

        <Button 
          onClick={handleReconnect}
          size="sm" 
          leftIcon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
        >
          Check Connection
        </Button>
      </div>
    </div>
  )
}
