import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pin, Star, Clock, Terminal, ArrowRight, Search, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { SEO } from '@/components/common/SEO'
import { TOOLS } from '@/services/toolRegistry'
import type { Tool } from '@/services/toolRegistry'

export function WorkspacePage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter tools based on search
  const filteredTools = TOOLS.filter((t) => !t.comingSoon).filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Mock list of pinned/favorite/recent tools
  const pinnedTools = TOOLS.filter((t) => t.featured && !t.comingSoon).slice(0, 3)
  const favoriteTools = TOOLS.filter((t) => t.popular && !t.comingSoon).slice(0, 2)
  const recentTools = TOOLS.filter((t) => !t.comingSoon).slice(2, 5)

  const recentActivities = [
    { id: 'act-1', action: 'Formatted JSON object payload', time: '10 minutes ago', tool: 'JSON Formatter' },
    { id: 'act-2', action: 'Decoded JWT header token claims', time: '1 hour ago', tool: 'JWT Decoder' },
    { id: 'act-3', action: 'Generated CSS Glassmorphism code', time: 'Yesterday', tool: 'CSS Glassmorphism' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 transition-colors duration-300">
      <SEO title="Workspace Dashboard - Frontend Workspace AI" />

      {/* Header section with search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Developer Workspace</h1>
          <p className="text-sm text-muted-foreground">Quickly access pinned items and track activity stats.</p>
        </div>

        {/* Quick Search */}
        <div className="w-full md:max-w-md">
          <Input
            placeholder="Type command or filter tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-primary" aria-hidden="true" />}
          />
        </div>
      </div>

      {searchQuery ? (
        /* Render search query results if typing */
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-bold">Search Results ({filteredTools.length})</h2>
          {filteredTools.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card/40">
              <p className="text-sm text-muted-foreground">No active utilities match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <Link key={tool.id} to={`/tool/${tool.slug}`}>
                  <Card hoverable className="h-full bg-card/60">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline">{tool.category}</Badge>
                      </div>
                      <CardTitle className="font-heading text-base">{tool.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">{tool.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Standard layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main workspace widgets (2 columns wide) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Pinned Tools */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Pin className="h-4.5 w-4.5 text-primary rotate-45" aria-hidden="true" />
                <h2 className="font-heading text-lg font-bold text-foreground">Pinned Utilities</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pinnedTools.map((tool) => (
                  <Link key={tool.id} to={`/tool/${tool.slug}`} className="group">
                    <Card hoverable className="h-full bg-card/50 border-border group-hover:border-primary/20">
                      <CardHeader className="p-5 flex flex-col justify-between h-full">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{tool.category}</span>
                            <Pin className="h-3 w-3 text-muted-foreground group-hover:text-primary rotate-45 transition-colors" aria-hidden="true" />
                          </div>
                          <CardTitle className="font-heading text-base group-hover:text-primary transition-colors">{tool.title}</CardTitle>
                          <CardDescription className="text-xs mt-1 line-clamp-2">{tool.description}</CardDescription>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                          <span>Open Utility</span>
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Favorite Tools placeholder */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-4.5 w-4.5 text-yellow-500 fill-current" aria-hidden="true" />
                <h2 className="font-heading text-lg font-bold text-foreground">Favorites</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteTools.map((tool) => (
                  <Link key={tool.id} to={`/tool/${tool.slug}`} className="group">
                    <Card hoverable className="bg-card/50 border-border group-hover:border-primary/20">
                      <CardHeader className="p-5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{tool.category}</span>
                          <Star className="h-3 w-3 text-yellow-500 fill-current" aria-hidden="true" />
                        </div>
                        <CardTitle className="font-heading text-sm group-hover:text-primary transition-colors">{tool.title}</CardTitle>
                        <CardDescription className="text-xs mt-1 line-clamp-2">{tool.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recently Used */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4.5 w-4.5 text-muted-foreground" aria-hidden="true" />
                <h2 className="font-heading text-lg font-bold text-foreground">Recently Used</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recentTools.map((tool) => (
                  <Link key={tool.id} to={`/tool/${tool.slug}`} className="group">
                    <Card hoverable className="h-full bg-card/45 border-border/80">
                      <CardHeader className="p-4">
                        <CardTitle className="font-heading text-xs truncate group-hover:text-primary transition-colors">{tool.title}</CardTitle>
                        <span className="text-[9px] text-muted-foreground block mt-1 uppercase tracking-wider font-semibold">{tool.category}</span>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Right column: activity log / metrics placeholder */}
          <div className="flex flex-col gap-6">
            
            {/* Recent Activity placeholder */}
            <Card className="bg-card/65 border-border">
              <CardHeader className="pb-4">
                <CardTitle as="h2" className="font-heading text-base flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" aria-hidden="true" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-xs">Logs for local parsed files.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex flex-col gap-1 text-xs border-l-2 border-primary/20 pl-3 py-1 hover:border-primary transition-colors">
                    <span className="font-semibold text-foreground">{act.action}</span>
                    <div className="flex justify-between items-center text-muted-foreground mt-1">
                      <span>{act.tool}</span>
                      <span>{act.time}</span>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-border/40 pt-4 flex items-center justify-between text-xs text-muted-foreground mt-2">
                  <span>Total actions logged: 3</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" aria-hidden="true" /> Online Synced
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Metrics Panel */}
            <Card className="bg-card/45 border-border/80 text-xs text-muted-foreground">
              <CardHeader className="p-4">
                <CardTitle as="h2" className="text-xs uppercase tracking-wider font-bold">System Status</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex flex-col gap-2">
                <div className="flex justify-between">
                  <span>Vite Compiler</span>
                  <span className="font-mono text-foreground font-semibold">Active (HMR)</span>
                </div>
                <div className="flex justify-between">
                  <span>Local Memory Cache</span>
                  <span className="font-mono text-foreground font-semibold">0.4 MB / 100 MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Session API Key Usage</span>
                  <span className="font-mono text-foreground font-semibold">0 requests (Offline)</span>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      )}
    </div>
  )
}
