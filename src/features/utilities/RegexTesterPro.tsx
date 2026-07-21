import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Code2,
  Copy,
  Check,
  Download,
  Trash2,
  RefreshCw,
  Info,
  Sliders,
  Settings,
  Sparkles,
  HelpCircle,
  FileText,
  Search,
  CheckCircle,
  AlertTriangle,
  ArrowRightLeft
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { CodeEditorWrapper } from '@/components/ui/CodeEditorWrapper'
import { ToolLayout } from '@/components/common/ToolLayout'
import { cn } from '@/lib/utils'

// Predefined regex library presets
const SAMPLE_LIBRARY = {
  email: {
    title: 'Email Validator',
    regex: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    text: 'Workspace feedback: contact@workspace.ai, sales-support@company.co.uk, or test-invalid@domain.',
    flags: { g: true, i: true, m: false, s: false, u: false, y: false },
    replaceText: '[hidden-email]'
  },
  phone: {
    title: 'US Phone Extractor',
    regex: '\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b',
    text: 'Customer support hotline: 800-555-0199. Alternate support lines: 555.555.0123, or 202-555-0143.',
    flags: { g: true, i: false, m: false, s: false, u: false, y: false },
    replaceText: 'XXX-XXX-XXXX'
  },
  url: {
    title: 'URL Extractor',
    regex: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    text: 'Documentation is available at https://docs.codestrategists.com/api. Follow secure updates on http://status.company.org/index.html.',
    flags: { g: true, i: true, m: false, s: false, u: false, y: false },
    replaceText: '<secure-link>'
  },
  ipv4: {
    title: 'IPv4 Address Val',
    regex: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    text: 'Node server local network addresses: localhost: 127.0.0.1, internal proxy: 192.168.1.1, broadcast IP: 256.100.0.1.',
    flags: { g: true, i: false, m: false, s: false, u: false, y: false },
    replaceText: 'IP_ADDRESS'
  }
}

interface MatchResult {
  index: number
  length: number
  value: string
  groups: string[]
}

export function RegexTesterPro() {
  const { toast } = useToast()

  // State Management
  const [regexInput, setRegexInput] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')
  const [testText, setTestText] = useState('Workspace feedback: contact@workspace.ai, sales-support@company.co.uk, or test-invalid@domain.')
  const [replaceText, setReplaceText] = useState('[hidden-email]')
  const [replaceMode, setReplaceMode] = useState(false)

  // Toggling regex flags
  const [flags, setFlags] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('regex-pref-flags')
      return saved ? JSON.parse(saved) : { g: true, i: true, m: false, s: false, u: false, y: false }
    } catch {
      return { g: true, i: true, m: false, s: false, u: false, y: false }
    }
  })

  // Results State
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Clipboard/copy states
  const [copiedRegex, setCopiedRegex] = useState(false)
  const [copiedResults, setCopiedResults] = useState(false)
  const [copiedReplaced, setCopiedReplaced] = useState(false)

  // Sync flags cache
  useEffect(() => {
    try {
      localStorage.setItem('regex-pref-flags', JSON.stringify(flags))
    } catch (e) {
      console.warn(e)
    }
  }, [flags])

  // Flag toggle handler
  const toggleFlag = (flag: string) => {
    setFlags((prev) => ({
      ...prev,
      [flag]: !prev[flag]
    }))
  }

  // Regex evaluation engine
  const evaluateRegex = useCallback(() => {
    if (!regexInput.trim()) {
      setMatches([])
      setError(null)
      return
    }

    try {
      const activeFlags = Object.entries(flags)
        .filter(([_, active]) => active)
        .map(([flag]) => flag)
        .join('')

      const regex = new RegExp(regexInput, activeFlags)
      setError(null)

      const foundMatches: MatchResult[] = []

      if (activeFlags.includes('g')) {
        let match
        regex.lastIndex = 0
        let loopCount = 0

        // Shield matching iterations from locking browser thread
        while ((match = regex.exec(testText)) !== null) {
          loopCount++
          if (loopCount > 3000) {
            // Cap search matches to preserve performance
            break
          }

          foundMatches.push({
            index: match.index,
            length: match[0].length,
            value: match[0],
            groups: match.slice(1).map((g) => g || '')
          })

          // Secure zero-length pattern loops (e.g. ^ or \b or a*)
          if (match.index === regex.lastIndex) {
            regex.lastIndex++
          }
        }
      } else {
        // Single match mode
        const match = regex.exec(testText)
        if (match) {
          foundMatches.push({
            index: match.index,
            length: match[0].length,
            value: match[0],
            groups: match.slice(1).map((g) => g || '')
          })
        }
      }

      setMatches(foundMatches)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid Regular Expression syntax')
      setMatches([])
    }
  }, [regexInput, flags, testText])

  // Trigger matching on changes
  useEffect(() => {
    const delay = setTimeout(() => {
      evaluateRegex()
    }, 150)
    return () => clearTimeout(delay)
  }, [regexInput, testText, flags, evaluateRegex])

  // Replacement String compiler
  const replacementOutput = useMemo(() => {
    if (error || !regexInput.trim()) return ''
    try {
      const activeFlags = Object.entries(flags)
        .filter(([_, active]) => active)
        .map(([flag]) => flag)
        .join('')

      const regex = new RegExp(regexInput, activeFlags)
      return testText.replace(regex, replaceText)
    } catch {
      return ''
    }
  }, [regexInput, flags, testText, replaceText, error])

  // Load Preset pattern helper
  const loadPreset = (key: keyof typeof SAMPLE_LIBRARY) => {
    const preset = SAMPLE_LIBRARY[key]
    setRegexInput(preset.regex)
    setTestText(preset.text)
    setReplaceText(preset.replaceText)
    setFlags(preset.flags)
    toast(`Loaded preset: ${preset.title}`, 'info')
  }

  // Clear all states
  const handleClear = () => {
    setRegexInput('')
    setTestText('')
    setReplaceText('')
    setMatches([])
    setError(null)
    toast('Cleared inputs and workspaces', 'info')
  }

  // Copy operations
  const handleCopyRegex = () => {
    navigator.clipboard.writeText(regexInput)
    setCopiedRegex(true)
    toast('Copied regex pattern', 'success')
    setTimeout(() => setCopiedRegex(false), 1500)
  }

  const handleCopyResults = () => {
    if (matches.length === 0) return
    const text = JSON.stringify(matches, null, 2)
    navigator.clipboard.writeText(text)
    setCopiedResults(true)
    toast('Copied matched coordinates JSON', 'success')
    setTimeout(() => setCopiedResults(false), 1500)
  }

  const handleCopyReplaced = () => {
    if (!replacementOutput) return
    navigator.clipboard.writeText(replacementOutput)
    setCopiedReplaced(true)
    toast('Copied replaced output string', 'success')
    setTimeout(() => setCopiedReplaced(false), 1500)
  }

  // File downloads
  const downloadResults = () => {
    if (matches.length === 0) return
    const text = JSON.stringify({ pattern: regexInput, matches }, null, 2)
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'regex-matches.json'
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded matches JSON data', 'success')
  }

  const downloadReplaced = () => {
    if (!replacementOutput) return
    const blob = new Blob([replacementOutput], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'regex-replaced-output.txt'
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded replaced TXT output', 'success')
  }

  // Render highlighted matches inside text preview blocks
  const renderHighlighted = useMemo(() => {
    if (matches.length === 0 || !testText) {
      return (
        <div className="whitespace-pre-wrap break-all font-mono text-sm leading-relaxed p-3 bg-secondary/15 rounded-lg border min-h-[140px] text-muted-foreground italic">
          {testText || 'Matches will highlight here once test text is supplied.'}
        </div>
      )
    }

    // Sort matching indexes to prevent overlap bounds
    const sorted = [...matches].sort((a, b) => a.index - b.index)
    const elements: React.ReactNode[] = []
    let lastIdx = 0

    sorted.forEach((match, idx) => {
      // String segment before match
      if (match.index > lastIdx) {
        elements.push(
          <span key={`text-${idx}`}>{testText.substring(lastIdx, match.index)}</span>
        )
      }

      // Highlighted match block
      elements.push(
        <mark
          key={`match-${idx}`}
          className="bg-yellow-500/25 text-foreground dark:text-yellow-100 border-b-2 border-yellow-500 px-0.5 rounded-sm font-semibold select-all hover:bg-yellow-500/35 transition-colors duration-150"
          title={`Match #${idx + 1}: "${match.value}" (Index: ${match.index}-${match.index + match.length})`}
        >
          {match.value}
        </mark>
      )

      lastIdx = match.index + match.length
    })

    // Remaining string segment
    if (lastIdx < testText.length) {
      elements.push(<span key="text-end">{testText.substring(lastIdx)}</span>)
    }

    return (
      <div className="whitespace-pre-wrap break-all font-mono text-sm leading-relaxed p-3 bg-secondary/15 rounded-lg border min-h-[140px]">
        {elements}
      </div>
    )
  }, [testText, matches])

  const faqItems = [
    {
      id: 'regex-faq-1',
      title: 'What is a Regular Expression (Regex)?',
      content: (
        <span className="font-sans">
          A regular expression is a sequence of characters defining a search pattern. It is commonly used in string validation, searching, and replacing matching text structures within databases or applications.
        </span>
      )
    },
    {
      id: 'regex-faq-2',
      title: 'What does each regex flag do?',
      content: (
        <span className="font-sans">
          - **g (Global):** Find all matches rather than stopping at the first.
          - **i (Ignore case):** Case-insensitive matching.
          - **m (Multiline):** Makes `^` and `$` anchor matches at start/end of lines.
          - **s (DotAll):** Makes dot `.` match newline characters.
          - **u (Unicode):** Enables full unicode compliance.
          - **y (Sticky):** Matches only starting from target index.
        </span>
      )
    },
    {
      id: 'regex-faq-3',
      title: 'Is my matching text sent to any servers?',
      content: (
        <span className="font-sans">
          No. The regular expressions are compiled and executed locally in your browser memory using JavaScript's native RegExp compiler. Your text never leaves your device.
        </span>
      )
    }
  ]

  return (
    <ToolLayout
      toolSlug="regex-tester"
      extraSEOProps={{
        title: "JavaScript Regular Expression (Regex) Tester - Frontend Workspace AI",
        description: "Interactive JavaScript Regex tester. Validate pattern matches, capture groups, and check speeds on dummy data."
      }}
      editorSection={
        <div className="flex flex-col gap-6 w-full text-left font-sans">
          
          {/* Top Library Preset Selector */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border/40 pb-4 select-none">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mr-2">Sample Regex Library</span>
            {Object.entries(SAMPLE_LIBRARY).map(([key, item]) => (
              <button
                key={key}
                onClick={() => loadPreset(key as keyof typeof SAMPLE_LIBRARY)}
                className="px-2.5 py-1 rounded bg-secondary/80 hover:bg-secondary text-xs text-muted-foreground hover:text-foreground border border-border/50 transition-colors cursor-pointer"
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* Configuration Parameters & Panels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
            
            {/* Left Column: Regex Input & Flags Configuration (Col 5) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <Card className="border-border bg-card/45 flex flex-col justify-between flex-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-heading flex items-center gap-2">
                    <Sliders className="h-4.5 w-4.5 text-primary" /> Pattern Definition
                  </CardTitle>
                  <CardDescription className="text-xs">Specify patterns and toggled flags.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4 flex-grow">
                  
                  {/* Pattern input */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <span>Regular Expression</span>
                      {regexInput && (
                        <button onClick={handleCopyRegex} className="text-primary hover:underline text-[9px] uppercase font-bold flex items-center gap-1 cursor-pointer">
                          {copiedRegex ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />} Copy
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1 text-sm font-mono focus-within:border-primary transition-all">
                      <span className="text-muted-foreground select-none">/</span>
                      <input
                        type="text"
                        value={regexInput}
                        onChange={(e) => setRegexInput(e.target.value)}
                        placeholder="e.g. [a-zA-Z]+"
                        aria-label="Regular Expression pattern"
                        className="flex-1 bg-transparent py-1.5 border-none focus:outline-none text-foreground font-mono"
                      />
                      <span className="text-muted-foreground select-none">/</span>
                      <span className="text-primary font-bold">
                        {Object.entries(flags)
                          .filter(([_, active]) => active)
                          .map(([flag]) => flag)
                          .join('')}
                      </span>
                    </div>

                    {/* Flags toggler pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {Object.entries(flags).map(([flag, active]) => (
                        <button
                          key={flag}
                          type="button"
                          onClick={() => toggleFlag(flag)}
                          className={cn("px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-all border cursor-pointer",
                            active 
                              ? 'bg-primary/10 text-primary border-primary/20' 
                              : 'bg-background text-muted-foreground hover:text-foreground border-border/50'
                          )}
                          title={`Toggle Flag: ${flag}`}
                          aria-label={`Toggle flag ${flag}`}
                        >
                          {flag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Replace Mode Toggle */}
                  <div className="pt-4 border-t border-border/40 space-y-3">
                    <label className="flex items-center justify-between cursor-pointer select-none">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Replace Mode Actions</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={replaceMode}
                          onChange={(e) => setReplaceMode(e.target.checked)}
                          aria-label="Toggle replace mode"
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                      </div>
                    </label>

                    {replaceMode && (
                      <div className="space-y-1.5 animate-fade-in">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Replacement Text</span>
                        <input
                          type="text"
                          value={replaceText}
                          onChange={(e) => setReplaceText(e.target.value)}
                          placeholder="Replacement replacement string..."
                          aria-label="Replacement Text"
                          className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:border-primary focus:outline-none font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Dynamic validation error block */}
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg flex items-start gap-2 font-mono">
                      <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {!error && regexInput && (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs rounded-lg flex items-start gap-2 font-mono select-none">
                      <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                      <span>Regex compiled successfully. Active matches: {matches.length}</span>
                    </div>
                  )}

                </CardContent>
                
                {/* Clear options */}
                <CardContent className="p-4 border-t border-border/30 bg-secondary/10 flex flex-col gap-2 select-none">
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className="w-full font-semibold border-destructive/20 hover:bg-destructive/10 text-destructive"
                    leftIcon={<Trash2 className="h-4 w-4" />}
                    aria-label="Clear regex inputs"
                  >
                    Clear All Inputs
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Text Editors, Highlight Marks & Replace Previews (Col 7) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Text Matcher Card */}
              <Card className="border-border bg-card/65 flex flex-col">
                <div className="px-4 py-2 border-b border-border/40 bg-secondary/10 flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase font-heading tracking-wider flex items-center gap-1.5">
                    <Search className="h-4 w-4 text-primary" /> Test Text Input
                  </span>
                </div>
                <CardContent className="p-3 space-y-3">
                  <CodeEditorWrapper
                    language="markdown"
                    value={testText}
                    onChange={setTestText}
                    placeholder="Enter test text strings to run matching rules on..."
                    height="120px"
                  />
                  
                  {/* Matching Highlight overlays */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block select-none">Live Match Highlights</span>
                    {renderHighlighted}
                  </div>
                </CardContent>
              </Card>

              {/* Replace Output block */}
              {replaceMode && (
                <Card className="border-border bg-card/65 flex flex-col animate-fade-in">
                  <div className="px-4 py-2 border-b border-border/40 bg-secondary/10 flex justify-between items-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase font-heading tracking-wider flex items-center gap-1.5">
                      <ArrowRightLeft className="h-4 w-4 text-primary" /> Replacement Output Preview
                    </span>
                    {replacementOutput && (
                      <div className="flex gap-2">
                        <button onClick={handleCopyReplaced} className="text-primary hover:underline text-[9px] uppercase font-bold flex items-center gap-1 cursor-pointer">
                          {copiedReplaced ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />} Copy
                        </button>
                        <span className="text-muted-foreground/30">|</span>
                        <button onClick={downloadReplaced} className="text-primary hover:underline text-[9px] uppercase font-bold flex items-center gap-1 cursor-pointer">
                          <Download className="h-2.5 w-2.5" /> Download
                        </button>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <CodeEditorWrapper
                      language="markdown"
                      value={replacementOutput}
                      readOnly={true}
                      placeholder="Replacement text output will display here..."
                      height="120px"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Match Details coordinate list inspector */}
              {matches.length > 0 && (
                <Card className="border-border bg-card/65 font-sans">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-heading flex items-center justify-between">
                      <span>Matches Details Inspector</span>
                      <div className="flex items-center gap-2">
                        <button onClick={handleCopyResults} className="text-primary hover:underline text-[9px] uppercase font-bold flex items-center gap-1 cursor-pointer">
                          {copiedResults ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />} Copy Coordinates
                        </button>
                        <span className="text-muted-foreground/30">|</span>
                        <button onClick={downloadResults} className="text-primary hover:underline text-[9px] uppercase font-bold flex items-center gap-1 cursor-pointer">
                          <Download className="h-2.5 w-2.5" /> Download JSON
                        </button>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-xs">Index positions and capture groups of matches.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 max-h-[220px] overflow-y-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/50 text-muted-foreground uppercase tracking-wider font-bold">
                          <th className="py-2 px-3 text-center">Match #</th>
                          <th className="py-2 px-3">Position Index</th>
                          <th className="py-2 px-3">Length</th>
                          <th className="py-2 px-3">Value</th>
                          <th className="py-2 px-3">Capture Groups</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30 font-medium font-mono text-[11px]">
                        {matches.map((match, idx) => (
                          <tr key={idx} className="hover:bg-secondary/15 transition-all">
                            <td className="py-2 px-3 text-center font-sans text-primary font-bold">#{idx + 1}</td>
                            <td className="py-2 px-3">{match.index} – {match.index + match.length}</td>
                            <td className="py-2 px-3">{match.length} chars</td>
                            <td className="py-2 px-3 text-foreground font-bold">{match.value}</td>
                            <td className="py-2 px-3 text-muted-foreground max-w-[200px] truncate">
                              {match.groups.length > 0 
                                ? match.groups.map((g, gIdx) => `$${gIdx + 1}: "${g}"`).join(', ') 
                                : 'None'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}

            </div>
          </div>

        </div>
      }
      faqs={faqItems}
      instructionsTitle="Regular Expression Testing Guidelines"
      instructions={
        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed font-sans">
          
          {/* What is Regex */}
          <div className="space-y-2">
            <h3 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
              <Code2 className="h-4.5 w-4.5 text-primary" /> What is Regex?
            </h3>
            <p>
              Regex is shorthand for <strong>Regular Expressions</strong>. It represents structured pattern schemas used to coordinate text validations, match substring positions, or perform bulk format replacements in script loops.
            </p>
          </div>

          {/* Regex Flags Explained */}
          <div className="space-y-2">
            <h3 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
              <Sliders className="h-4.5 w-4.5 text-primary" /> Pattern Modifiers (Flags)
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong className="text-foreground">g (Global):</strong> Continues search beyond the initial match to highlight all matching occurrences.</li>
              <li><strong className="text-foreground">i (Ignore Case):</strong> Executes validations case-insensitively.</li>
              <li><strong className="text-foreground">m (Multiline):</strong> Changes anchors `^` and `$` to match start/end bounds of individual lines instead of the complete string.</li>
              <li><strong className="text-foreground">s (Dot All):</strong> Extends standard dot `.` boundaries to match newline (`\n`) characters.</li>
            </ul>
          </div>

          {/* Common Regex Patterns */}
          <div className="space-y-2">
            <h3 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
              <Search className="h-4.5 w-4.5 text-primary" /> Common Regex Patterns Cheat Sheet
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 border border-border/40 bg-secondary/15 rounded-lg">
                <span className="font-bold text-foreground block">Email Validation</span>
                <code className="text-primary font-mono select-all block mt-1 text-[10px]">{"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"}</code>
              </div>
              <div className="p-3 border border-border/40 bg-secondary/15 rounded-lg">
                <span className="font-bold text-foreground block">Digit / Integer Matching</span>
                <code className="text-primary font-mono select-all block mt-1 text-[10px]">\b\d+\b</code>
              </div>
              <div className="p-3 border border-border/40 bg-secondary/15 rounded-lg">
                <span className="font-bold text-foreground block">Trim Whitespaces</span>
                <code className="text-primary font-mono select-all block mt-1 text-[10px]">\s+</code>
              </div>
              <div className="p-3 border border-border/40 bg-secondary/15 rounded-lg">
                <span className="font-bold text-foreground block">Alphanumeric Strings</span>
                <code className="text-primary font-mono select-all block mt-1 text-[10px]">^[a-zA-Z0-9]+$</code>
              </div>
            </div>
          </div>

          {/* Regex Best Practices */}
          <div className="space-y-2">
            <h3 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
              <Settings className="h-4.5 w-4.5 text-primary" /> Regex Best Practices
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong className="text-foreground">Avoid Catastrophic Backtracking:</strong> Be cautious with nested quantifiers (e.g. `(a+)+`). They can trigger massive exponential calculation loops on long strings, locking thread execution.</li>
              <li><strong className="text-foreground">Enforce Anchors:</strong> Always use anchors (`^` and `$`) where matching full strings is required, avoiding substring mismatch slips.</li>
              <li><strong className="text-foreground">Comment complex matches:</strong> Add descriptive comments explaining group layouts for future maintenance.</li>
            </ul>
          </div>

        </div>
      }
      benefits={[
        "Visual Matches Highlight: Spot character pattern alignments in real-time.",
        "Captures details list: Inspect start/end indexes and group segmentations.",
        "Zero telemetries: Pattern logic compiles locally, preserving privacy."
      ]}
    />
  )
}
