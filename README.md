# CodeStrategists — Professional Developer Tools for Modern Frontend Engineers

A production-ready, highly performant, and search-optimized developer tools catalog built using **Vite + React 19 + TypeScript + Tailwind CSS** (running React Router v7).

Designed to support instant single-page sandbox code conversions, formatters, and secure cryptographic generators with 0 initial page bloat. Visit live: **[codestrategists.com](https://www.codestrategists.com)**

---

## 🚀 Key Features & Production Architecture

### 1. Dynamic Code Splitting & Performance
To optimize bundle sizes, all custom interactive tools are dynamically lazy-loaded using `React.lazy()` inside [ToolTemplatePage.tsx](file:///d:/Projects/Personal/src/pages/ToolTemplatePage.tsx).
- Page loading weights are split, keeping the main routing entry shell at a tiny **6.19 kB**.
- Component assets (Monaco editors, conversion libraries) are fetched asynchronously on-demand.
- Lazy loads are wrapped in custom `<Suspense>` boundary screens backed by a global `<ErrorBoundary>` to catch and isolate component crashes.

### 2. GDPR-Compliant Analytics & Telemetry
Integrates **Google Analytics 4** and **Microsoft Clarity** tracking strictly post user consent:
- A sliding Cookie Preferences compliance overlay manages consent choices (`localStorage` key: `cookie_consent_analytics`).
- Script tags are dynamically generated and injected into the document head only *after* opt-in.
- Supports IP anonymization and triggers telemetry events:
  - **Page Views:** Path navigation tracking.
  - **Tool Usage:** Track active sandbox interactions and runs.
  - **Search Telemetry:** Debounced catalog keywords inputs.
  - **Clipboard Actions:** Track copies on toolbar and panels.
  - **Downloads:** Track file export formats (TXT, CSV, JSON).

### 3. Centralized Error Monitoring
A unified error capturing abstraction is available in [errorMonitoring.ts](file:///d:/Projects/Personal/src/services/errorMonitoring.ts).
- Automatically listens for global window `error` and `unhandledrejection` promise warnings.
- Exposes `reportError()` to capture exceptions in try-catch sandboxes.
- Easily hook Sentry, LogRocket, or Datadog inside the production logging block without adding heavy external dependencies to the workspace.

### 4. SEO & Verification Support
- **Verification Tags:** Supports Google Search Console verification meta headers dynamically via variables.
- **Dynamic Schemas:** Renders automated `SoftwareApplication` and `FAQPage` JSON-LD schemas inside `<ToolLayout>`.
- **Exclusion Sitemap:** Auto-generates clean sitemaps and `robots.txt` referencing live links, dynamically excluding tools marked with `comingSoon: true`.

---

## 🛠️ Environment Configurations

Create `.env.[environment]` configuration files in the root folder. See [.env.example](file:///d:/Projects/Personal/.env.example):

| Variable Name | Purpose | Example Value |
| :--- | :--- | :--- |
| `VITE_GA_ID` | Google Analytics Measurement Tag | `G-XXXXXXXXXX` |
| `VITE_CLARITY_ID` | Microsoft Clarity Project Code | `xxxxxxxxxx` |
| `VITE_GSC_VERIFICATION` | Google Search Console site validation tag | `gsc-verification-hash` |
| `VITE_SITE_URL` | Application canonical base URL | `https://www.codestrategists.com` |

---

## ⚡ Deployment & Build Commands

Build the production bundle and auto-generate sitemaps:
```bash
npm run build
```

Run linter validation tests:
```bash
npm run lint
```

Launch local dev sandbox:
```bash
npm run dev
```

---

## 📦 How to Add a New Tool

Follow these steps to add a new tool to the workspace:

### Step 1: Register the Tool Metadata
Add your tool specifications block into the `TOOLS` list inside [toolRegistry.ts](file:///d:/Projects/Personal/src/services/toolRegistry.ts):
```typescript
{
  id: 'my-new-tool',
  slug: 'my-new-tool',
  title: 'My Custom Tool Pro',
  category: 'converters', // 'formatters' | 'converters' | 'generators' | 'validators' | 'utilities'
  description: 'Instant converter for custom formats.',
  shortDescription: 'Format convert tool.',
  longDescription: 'Detailed usage and syntax validation overview...',
  benefits: [
    'Secure: Works offline.',
    'Fast: 0 network lags.'
  ],
  howToUse: [
    'Paste code inside inputs.',
    'Adjust settings.',
    'Download the output.'
  ],
  useCases: [
    'Convert configs.',
    'Prettify source sheets.'
  ],
  faqs: [
    { question: 'Is data sent to servers?', answer: 'No, everything is compiled in-browser.' }
  ],
  lastUpdated: '2026-07-17',
  estimatedReadingTime: '2 min read',
  popular: true,
  seo: {
    title: 'My Custom Tool Pro - CodeStrategists',
    description: 'Format, parse, and validate custom files locally.',
    keywords: ['custom-format', 'parser'],
    canonical: '/tool/my-new-tool'
  }
}
```

### Step 2: Implement the Feature UI
Create your interactive sandbox code component inside the appropriate folder in `src/features/`. Use the shared `<ToolLayout>` to wrap your panels:
```tsx
import React, { useState } from 'react'
import { ToolLayout } from '@/components/common/ToolLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'

export function MyNewToolPro() {
  const [inputVal, setInputVal] = useState('')
  const [outputVal, setOutputVal] = useState('')

  const handleConvert = () => {
    setOutputVal(inputVal.toUpperCase())
  }

  const editorSection = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      <Card>
        <CardHeader><CardTitle>Input</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Output</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={outputVal} readOnly />
        </CardContent>
      </Card>
    </div>
  )

  return (
    <ToolLayout
      toolSlug="my-new-tool"
      editorSection={editorSection}
      onConvert={handleConvert}
      convertLabel="Convert to UpperCase"
    />
  )
}
```

### Step 3: Lazy-Load the Tool in ToolTemplatePage
Add the lazy load import and map it to `CUSTOM_TOOLS` inside [ToolTemplatePage.tsx](file:///d:/Projects/Personal/src/pages/ToolTemplatePage.tsx):
```tsx
// 1. Add lazy loaded component import:
const MyNewToolPro = lazy(() => import('@/features/converters/MyNewToolPro').then(m => ({ default: m.MyNewToolPro })))

// 2. Register inside CUSTOM_TOOLS record map:
const CUSTOM_TOOLS: Record<string, React.ComponentType> = {
  // ...
  'my-new-tool': MyNewToolPro,
}
```
That's it! The system will automatically serve your tool dynamically, track usage counts in telemetry, render 3-level breadcrumbs and metadata tags, inject structured schema headers, and add it to the search sitemap on build.
