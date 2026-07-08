import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import { CommandPalette } from '@/components/common/CommandPalette'

export function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <CommandPalette />
    </div>
  )
}
