import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { LoadingState } from '@/components/ui/FeedbackStates'

// Lazy loaded page components
const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage }))
)
const WorkspacePage = lazy(() =>
  import('@/pages/WorkspacePage').then((m) => ({ default: m.WorkspacePage }))
)
const ToolsPage = lazy(() =>
  import('@/pages/ToolsPage').then((m) => ({ default: m.ToolsPage }))
)
const ToolTemplatePage = lazy(() =>
  import('@/pages/ToolTemplatePage').then((m) => ({ default: m.ToolTemplatePage }))
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
)

const AboutPage = lazy(() =>
  import('@/pages/SecondaryPages').then((m) => ({ default: m.AboutPage }))
)
const ContactPage = lazy(() =>
  import('@/pages/SecondaryPages').then((m) => ({ default: m.ContactPage }))
)
const PrivacyPage = lazy(() =>
  import('@/pages/SecondaryPages').then((m) => ({ default: m.PrivacyPage }))
)
const TermsPage = lazy(() =>
  import('@/pages/SecondaryPages').then((m) => ({ default: m.TermsPage }))
)
const ChangelogPage = lazy(() =>
  import('@/pages/SecondaryPages').then((m) => ({ default: m.ChangelogPage }))
)

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState message="Resolving sandbox assets..." />}>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="workspace" element={<WorkspacePage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="tools/:categorySlug" element={<ToolsPage />} />
          <Route path="tool/:slug" element={<ToolTemplatePage />} />
          
          {/* Categories index redirect to tools list */}
          <Route path="categories" element={<Navigate to="/tools" replace />} />
          
          {/* Secondary marketing/legal routes */}
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="changelog" element={<ChangelogPage />} />
          
          {/* 404 Fallback page */}
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
