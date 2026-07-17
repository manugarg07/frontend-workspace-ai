import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Key,
  Copy,
  Check,
  Download,
  Trash2,
  RefreshCw,
  Info,
  ShieldAlert,
  Sliders,
  Sparkles,
  Lock,
  Clock,
  Eye,
  EyeOff,
  Activity,
  Layers,
  HelpCircle,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { CodeEditorWrapper } from '@/components/ui/CodeEditorWrapper'
import { ToolLayout } from '@/components/common/ToolLayout'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/services/analytics'

type SeparatorType = 'newline' | 'csv'

export function PasswordGeneratorPro() {
  const { toast } = useToast()

  // 1. Load preferences from Local Storage
  const [length, setLength] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pwd-pref-length')
      return saved ? Math.min(128, Math.max(4, parseInt(saved, 10))) : 16
    } catch {
      return 16
    }
  })

  const [includeUpper, setIncludeUpper] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pwd-pref-upper')
      return saved !== 'false' // default true
    } catch {
      return true
    }
  })

  const [includeLower, setIncludeLower] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pwd-pref-lower')
      return saved !== 'false' // default true
    } catch {
      return true
    }
  })

  const [includeNumbers, setIncludeNumbers] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pwd-pref-numbers')
      return saved !== 'false' // default true
    } catch {
      return true
    }
  })

  const [includeSymbols, setIncludeSymbols] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pwd-pref-symbols') === 'true' // default false
    } catch {
      return false
    }
  })

  const [excludeSimilar, setExcludeSimilar] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pwd-pref-similar') === 'true'
    } catch {
      return false
    }
  })

  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pwd-pref-ambiguous') === 'true'
    } catch {
      return false
    }
  })

  const [excludeDuplicates, setExcludeDuplicates] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pwd-pref-duplicates') === 'true'
    } catch {
      return false
    }
  })

  const [quantity, setQuantity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pwd-pref-quantity')
      return saved ? Math.min(100, Math.max(1, parseInt(saved, 10))) : 1
    } catch {
      return 1
    }
  })

  // Display states
  const [passwords, setPasswords] = useState<string[]>([])
  const [showPasswords, setShowPasswords] = useState<boolean>(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isCopiedAll, setIsCopiedAll] = useState<boolean>(false)
  const [generationTime, setGenerationTime] = useState<number>(0)
  const [poolWarning, setPoolWarning] = useState<string | null>(null)

  // Save preferences inside local storage
  useEffect(() => {
    try {
      localStorage.setItem('pwd-pref-length', String(length))
      localStorage.setItem('pwd-pref-upper', String(includeUpper))
      localStorage.setItem('pwd-pref-lower', String(includeLower))
      localStorage.setItem('pwd-pref-numbers', String(includeNumbers))
      localStorage.setItem('pwd-pref-symbols', String(includeSymbols))
      localStorage.setItem('pwd-pref-similar', String(excludeSimilar))
      localStorage.setItem('pwd-pref-ambiguous', String(excludeAmbiguous))
      localStorage.setItem('pwd-pref-duplicates', String(excludeDuplicates))
      localStorage.setItem('pwd-pref-quantity', String(quantity))
    } catch (e) {
      console.warn('Failed to cache preferences inside Local Storage:', e)
    }
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeSimilar, excludeAmbiguous, excludeDuplicates, quantity])

  // Cryptographically secure bias-free random integer generator
  const getSecureRandomInt = useCallback((max: number): number => {
    const range = 4294967296 // 2^32
    const limit = range - (range % max)
    const bytes = new Uint32Array(1)
    do {
      window.crypto.getRandomValues(bytes)
    } while (bytes[0] >= limit)
    return bytes[0] % max
  }, [])

  // Core password generator
  const handleGenerate = useCallback((customQty = quantity) => {
    const startTime = performance.now()
    
    // Character sets definition
    let uppercasePool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let lowercasePool = 'abcdefghijklmnopqrstuvwxyz'
    let numbersPool = '0123456789'
    let symbolsPool = '!@#$%^&*()_+-=[]{}|;:\',./<>?~`'

    // Exclude Similar Characters (O, 0, I, l, 1)
    if (excludeSimilar) {
      uppercasePool = uppercasePool.replace(/[OI]/g, '')
      lowercasePool = lowercasePool.replace(/[l]/g, '')
      numbersPool = numbersPool.replace(/[01]/g, '')
    }

    // Exclude Ambiguous Characters ({ } [ ] ( ) / \ ' " ~ , ; . < >)
    if (excludeAmbiguous) {
      symbolsPool = symbolsPool.replace(/[{}\[\]()\/\\'"~,;.<>]/g, '')
    }

    // Assemble character pools
    let activePool = ''
    if (includeUpper) activePool += uppercasePool
    if (includeLower) activePool += lowercasePool
    if (includeNumbers) activePool += numbersPool
    if (includeSymbols) activePool += symbolsPool

    if (!activePool) {
      setPasswords([])
      setPoolWarning('Please select at least one character set above to generate passwords.')
      return
    }

    setPoolWarning(null)

    // Check duplicate capability constraints
    let finalLength = length
    if (excludeDuplicates && length > activePool.length) {
      finalLength = activePool.length
      setPoolWarning(`Capped length to ${activePool.length} because unique character settings exceed active characters pool size.`)
    }

    const generated: string[] = []

    for (let q = 0; q < customQty; q++) {
      let pwd = ''
      let currentPool = activePool

      // 1. Ensure at least one character from each selected class to guarantee diversity
      const mandatoryChars: string[] = []
      if (includeUpper && uppercasePool) mandatoryChars.push(uppercasePool[getSecureRandomInt(uppercasePool.length)])
      if (includeLower && lowercasePool) mandatoryChars.push(lowercasePool[getSecureRandomInt(lowercasePool.length)])
      if (includeNumbers && numbersPool) mandatoryChars.push(numbersPool[getSecureRandomInt(numbersPool.length)])
      if (includeSymbols && symbolsPool) mandatoryChars.push(symbolsPool[getSecureRandomInt(symbolsPool.length)])

      // Fill remaining slots
      const remainingLength = finalLength - mandatoryChars.length

      if (excludeDuplicates) {
        // Handle duplicate removal
        let poolArray = currentPool.split('')
        
        // Remove already selected mandatory characters from duplicate pool
        mandatoryChars.forEach((char) => {
          const idx = poolArray.indexOf(char)
          if (idx !== -1) poolArray.splice(idx, 1)
        })

        const chosenList = [...mandatoryChars]
        for (let i = 0; i < remainingLength; i++) {
          if (poolArray.length === 0) break
          const randIdx = getSecureRandomInt(poolArray.length)
          chosenList.push(poolArray[randIdx])
          poolArray.splice(randIdx, 1) // Remove to prevent duplicates
        }

        // Shuffle characters lists using Fisher-Yates cryptographically secure shuffle
        for (let i = chosenList.length - 1; i > 0; i--) {
          const j = getSecureRandomInt(i + 1)
          const temp = chosenList[i]
          chosenList[i] = chosenList[j]
          chosenList[j] = temp
        }
        pwd = chosenList.join('')

      } else {
        // Standard random fill
        const chosenList = [...mandatoryChars]
        for (let i = 0; i < remainingLength; i++) {
          chosenList.push(currentPool[getSecureRandomInt(currentPool.length)])
        }

        // Shuffle lists cryptographically
        for (let i = chosenList.length - 1; i > 0; i--) {
          const j = getSecureRandomInt(i + 1)
          const temp = chosenList[i]
          chosenList[i] = chosenList[j]
          chosenList[j] = temp
        }
        pwd = chosenList.join('')
      }

      generated.push(pwd)
    }

    setPasswords(generated)
    setGenerationTime(performance.now() - startTime)
    setIsCopiedAll(false)
    trackEvent({
      action: 'generate_passwords',
      category: 'password_generator',
      value: customQty
    })
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeSimilar, excludeAmbiguous, excludeDuplicates, quantity, getSecureRandomInt])

  // Trigger generation on mount
  useEffect(() => {
    handleGenerate()
  }, [])

  // Hotkey mapping: Control + Enter to regenerate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleGenerate()
        toast('Regenerated secure password', 'success')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleGenerate, toast])

  // Formatting output lists
  const outputText = useMemo(() => {
    return passwords.join('\n')
  }, [passwords])

  // Computes entropy and complexity score based on Shannon Entropy & Character Pools
  const analysis = useMemo(() => {
    if (passwords.length === 0) return null
    const primary = passwords[0]
    
    // Character counters
    let uCount = 0
    let lCount = 0
    let nCount = 0
    let sCount = 0

    const uPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lPool = 'abcdefghijklmnopqrstuvwxyz'
    const nPool = '0123456789'

    for (let i = 0; i < primary.length; i++) {
      const char = primary[i]
      if (uPool.includes(char)) uCount++
      else if (lPool.includes(char)) lCount++
      else if (nPool.includes(char)) nCount++
      else sCount++
    }

    // Determine active character pool size (R)
    let R = 0
    if (includeUpper) R += 26
    if (includeLower) R += 26
    if (includeNumbers) R += 10
    if (includeSymbols) R += 32
    if (excludeSimilar) R -= 5 // OI, l, 01
    if (excludeAmbiguous) R -= 16 // Ambiguous symbols removed

    // Ensure R is at least 1
    R = Math.max(1, R)

    // Shannon bits of entropy: H = L * log2(R)
    const entropy = primary.length * (Math.log(R) / Math.log(2))

    // Estimate crack time assuming 10 billion guesses/sec ($10^{10}$)
    const combinations = Math.pow(R, primary.length)
    const guessesPerSec = 1e10
    const secondsToCrack = combinations / guessesPerSec

    let crackTimeStr = 'Instant'
    if (secondsToCrack >= 31536000 * 1e12) {
      crackTimeStr = 'Infinity (Trillions of Years)'
    } else if (secondsToCrack >= 31536000 * 1e6) {
      const millions = (secondsToCrack / (31536000 * 1e6)).toFixed(1)
      crackTimeStr = `${millions} Million Years`
    } else if (secondsToCrack >= 31536000) {
      const years = Math.floor(secondsToCrack / 31536000)
      crackTimeStr = `${years.toLocaleString()} Year${years > 1 ? 's' : ''}`
    } else if (secondsToCrack >= 86400) {
      const days = Math.floor(secondsToCrack / 86400)
      crackTimeStr = `${days} Day${days > 1 ? 's' : ''}`
    } else if (secondsToCrack >= 3600) {
      const hours = Math.floor(secondsToCrack / 3600)
      crackTimeStr = `${hours} Hour${hours > 1 ? 's' : ''}`
    } else if (secondsToCrack >= 60) {
      const minutes = Math.floor(secondsToCrack / 60)
      crackTimeStr = `${minutes} Minute${minutes > 1 ? 's' : ''}`
    } else if (secondsToCrack > 0.001) {
      crackTimeStr = `${secondsToCrack.toFixed(2)} Second${secondsToCrack > 1 ? 's' : ''}`
    }

    // Complexity score labels
    let rating: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong' = 'Very Weak'
    let progressColor = 'bg-red-500'
    let scorePercent = 20

    if (entropy >= 80) {
      rating = 'Very Strong'
      progressColor = 'bg-emerald-500'
      scorePercent = 100
    } else if (entropy >= 60) {
      rating = 'Strong'
      progressColor = 'bg-teal-500'
      scorePercent = 80
    } else if (entropy >= 36) {
      rating = 'Medium'
      progressColor = 'bg-amber-500'
      scorePercent = 60
    } else if (entropy >= 28) {
      rating = 'Weak'
      progressColor = 'bg-orange-500'
      scorePercent = 40
    }

    // Character diversity class counts (1-4)
    let diversityScore = 0
    if (uCount > 0) diversityScore++
    if (lCount > 0) diversityScore++
    if (nCount > 0) diversityScore++
    if (sCount > 0) diversityScore++

    return {
      upperCount: uCount,
      lowerCount: lCount,
      numbersCount: nCount,
      symbolsCount: sCount,
      entropy: entropy.toFixed(1),
      crackTime: crackTimeStr,
      diversityScore,
      rating,
      progressColor,
      scorePercent
    }
  }, [passwords, includeUpper, includeLower, includeNumbers, includeSymbols, excludeSimilar, excludeAmbiguous])

  // Copy helpers
  const handleCopyIndividual = (index: number) => {
    navigator.clipboard.writeText(passwords[index])
    setCopiedIndex(index)
    toast('Copied password to clipboard', 'success')
    trackEvent({
      action: 'copy_individual',
      category: 'password_generator'
    })
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const handleCopyAll = () => {
    if (!outputText) return
    navigator.clipboard.writeText(outputText)
    setIsCopiedAll(true)
    toast('Copied all passwords to clipboard', 'success')
    trackEvent({
      action: 'copy_all',
      category: 'password_generator'
    })
    setTimeout(() => setIsCopiedAll(false), 2000)
  }

  // File downloads
  const downloadTxt = () => {
    if (!outputText) return
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `passwords-${quantity}.txt`
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded passwords TXT list', 'success')
    trackEvent({
      action: 'download_txt',
      category: 'password_generator'
    })
  }

  const downloadCsv = () => {
    if (passwords.length === 0) return
    let csvContent = 'Index,Password\n'
    passwords.forEach((pwd, idx) => {
      csvContent += `${idx + 1},"${pwd.replace(/"/g, '""')}"\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `passwords-${quantity}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded passwords CSV table', 'success')
    trackEvent({
      action: 'download_csv',
      category: 'password_generator'
    })
  }

  const faqItems = [
    {
      id: 'pwd-faq-1',
      title: 'How does the Web Crypto API secure generation work?',
      content: (
        <span className="font-sans">
          This generator calls the browser's built-in `window.crypto.getRandomValues()` API, which accesses secure entropy seeds directly from your operating system kernel. This is cryptographically secure and immune to standard pseudo-random number generator (PRNG) predictability cracks.
        </span>
      )
    },
    {
      id: 'pwd-faq-2',
      title: 'What represents a cryptographically strong password?',
      content: (
        <span className="font-sans">
          Password strength relies heavily on entropy (measured in bits). A strong password should have at least 60 bits of entropy. This is typically achieved with a length of 14+ characters combining uppercase, lowercase, numbers, and symbols.
        </span>
      )
    },
    {
      id: 'pwd-faq-3',
      title: 'Is it safe to generate passwords on this website?',
      content: (
        <span className="font-sans">
          Yes, fully secure. All generations and evaluations execute client-side inside your browser sandbox memory. No credentials or keys traverse external networks, keeping your secrets 100% private.
        </span>
      )
    },
    {
      id: 'pwd-faq-4',
      title: 'Why should I exclude similar or ambiguous characters?',
      content: (
        <span className="font-sans">
          Similar characters (like `O` and `0`, or `I` and `l`) are frequently misread when manually typing. Ambiguous symbols (like `{`, `}`, `\`, `/`) can cause syntax parsing issues in terminal scripts or configuration setups.
        </span>
      )
    }
  ]

  return (
    <ToolLayout
      toolSlug="password-generator"
      extraSEOProps={{
        title: "Secure Password Generator Pro - Frontend Workspace AI",
        description: "Generate cryptographically secure random passwords instantly. Live entropy crack-time measurements, character diversity charts, and batch exports."
      }}
      editorSection={
        <div className="flex flex-col gap-6 w-full text-left font-sans">
          
          {/* Privacy Security Banner */}
          <Card className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 select-none">
            <CardContent className="p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5 animate-pulse" />
              <div className="text-xs sm:text-sm leading-relaxed">
                Passwords are generated locally in your browser. No data is stored or transmitted.
              </div>
            </CardContent>
          </Card>

          {/* Configuration Settings & Output Panels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
            
            {/* Left Column: Configuration Controls (Col 5) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <Card className="border-border bg-card/45 flex flex-col justify-between flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-heading flex items-center gap-2">
                    <Sliders className="h-4.5 w-4.5 text-primary" /> Parameters Config
                  </CardTitle>
                  <CardDescription className="text-xs">Adjust security lengths and character sets.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4 flex-grow">
                  
                  {/* Slider Length parameter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <span>Password Length</span>
                      <span className="text-primary font-mono font-bold text-sm bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        {length} Chars
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="4"
                        max="128"
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value, 10))}
                        className="flex-1 accent-primary h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                        aria-label="Adjust password length"
                      />
                      <input
                        type="number"
                        min="4"
                        max="128"
                        value={length}
                        onChange={(e) => setLength(Math.min(128, Math.max(4, parseInt(e.target.value, 10) || 4)))}
                        className="w-14 px-2 py-1 text-xs text-center font-bold bg-background border border-border rounded focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Character sets checkbox lists */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Character Groups Include</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      <label className="flex items-center gap-2.5 cursor-pointer text-muted-foreground hover:text-foreground select-none">
                        <input
                          type="checkbox"
                          checked={includeUpper}
                          onChange={(e) => setIncludeUpper(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                        />
                        <span>Uppercase (A-Z)</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer text-muted-foreground hover:text-foreground select-none">
                        <input
                          type="checkbox"
                          checked={includeLower}
                          onChange={(e) => setIncludeLower(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                        />
                        <span>Lowercase (a-z)</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer text-muted-foreground hover:text-foreground select-none">
                        <input
                          type="checkbox"
                          checked={includeNumbers}
                          onChange={(e) => setIncludeNumbers(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                        />
                        <span>Numbers (0-9)</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer text-muted-foreground hover:text-foreground select-none">
                        <input
                          type="checkbox"
                          checked={includeSymbols}
                          onChange={(e) => setIncludeSymbols(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                        />
                        <span>Symbols (!@#$)</span>
                      </label>
                    </div>
                  </div>

                  {/* Exclusions toggles */}
                  <div className="space-y-2 pt-3 border-t border-border/40 text-xs font-semibold text-muted-foreground">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Exclusions & Security Filters</span>
                    <div className="flex flex-col gap-2.5">
                      <label className="flex items-center gap-3 cursor-pointer hover:text-foreground select-none">
                        <input
                          type="checkbox"
                          checked={excludeSimilar}
                          onChange={(e) => setExcludeSimilar(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                        />
                        <span>Exclude Similar (O, 0, I, l, 1)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer hover:text-foreground select-none">
                        <input
                          type="checkbox"
                          checked={excludeAmbiguous}
                          onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                        />
                        <span>Exclude Ambiguous ({"{ } [ ] ( ) / \\ ' \" ~"})</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer hover:text-foreground select-none">
                        <input
                          type="checkbox"
                          checked={excludeDuplicates}
                          onChange={(e) => setExcludeDuplicates(e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-background"
                        />
                        <span>Exclude Duplicate Characters</span>
                      </label>
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="space-y-1.5 pt-3 border-t border-border/40">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Generation Quantity</span>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                        className="flex-1 accent-primary h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                        aria-label="Adjust batch quantity"
                      />
                      <span className="text-xs font-bold text-foreground font-mono w-12 text-center bg-secondary/50 p-1 rounded">
                        {quantity} Qty
                      </span>
                    </div>
                  </div>

                </CardContent>

                {/* Regenerate panel triggers */}
                <CardContent className="p-4 border-t border-border/30 bg-secondary/10 flex flex-col gap-2 select-none">
                  <div className="text-[10px] text-muted-foreground text-center font-mono">
                    Press <kbd className="bg-background border px-1 rounded">Ctrl + Enter</kbd> to regenerate
                  </div>
                  <Button
                    onClick={() => handleGenerate()}
                    className="w-full font-semibold"
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                    aria-label="Generate random passwords"
                  >
                    Generate Passwords
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Output panel, Strength meter & analysis statistics (Col 7) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Output block panel */}
              <Card className="border-border bg-card/65 flex flex-col flex-1 min-h-[300px]">
                <div className="px-4 py-2 border-b border-border/40 bg-secondary/10 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase font-heading tracking-wider flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-primary" /> Generated Passwords
                  </span>
                  
                  {passwords.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="p-1 px-2 text-muted-foreground hover:text-foreground text-[10px] font-bold font-heading flex items-center gap-1 cursor-pointer"
                        aria-label={showPasswords ? "Mask passwords" : "Show passwords"}
                      >
                        {showPasswords ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        <span>{showPasswords ? 'Hide' : 'Reveal'}</span>
                      </button>
                      <span className="text-muted-foreground/30">|</span>
                      <button
                        onClick={handleCopyAll}
                        className="p-1 px-2 text-primary hover:underline text-[10px] font-bold font-heading flex items-center gap-1 cursor-pointer"
                        aria-label="Copy all generated passwords"
                      >
                        {isCopiedAll ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        <span>{isCopiedAll ? 'Copied' : 'Copy All'}</span>
                      </button>
                      <span className="text-muted-foreground/30">|</span>
                      <button
                        onClick={() => setPasswords([])}
                        className="p-1 px-2 text-destructive hover:underline text-[10px] font-bold font-heading flex items-center gap-1 cursor-pointer"
                        aria-label="Clear output list"
                      >
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    </div>
                  )}
                </div>

                <CardContent className="p-3 flex-1 flex flex-col justify-between">
                  {poolWarning && (
                    <div className="mb-3 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/25 p-2 rounded-lg flex items-start gap-2 select-none">
                      <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{poolWarning}</span>
                    </div>
                  )}

                  {passwords.length > 0 ? (
                    <div className="flex-grow flex flex-col gap-3">
                      
                      {/* Hide/Show logic in textarea */}
                      <CodeEditorWrapper
                        language="markdown"
                        value={showPasswords ? outputText : passwords.map(p => '•'.repeat(p.length)).join('\n')}
                        readOnly={true}
                        height={passwords.length > 5 ? "220px" : "120px"}
                      />

                      {/* List displays with copy triggers */}
                      {passwords.length <= 15 && (
                        <div className="border border-border/40 rounded-xl bg-secondary/15 divide-y divide-border/30 max-h-[160px] overflow-y-auto font-mono text-xs text-left">
                          {passwords.map((pwd, idx) => (
                            <div key={idx} className="p-2 px-3 flex items-center justify-between hover:bg-secondary/40 transition-colors">
                              <span className="text-muted-foreground pr-2 font-sans text-[10px] font-bold">#{idx + 1}</span>
                              <span className="font-semibold truncate flex-1 tracking-wide select-all">
                                {showPasswords ? pwd : '•'.repeat(pwd.length)}
                              </span>
                              <button
                                onClick={() => handleCopyIndividual(idx)}
                                className="text-primary hover:text-foreground transition-colors ml-2 cursor-pointer p-1 rounded"
                                aria-label={`Copy password number ${idx + 1}`}
                              >
                                {copiedIndex === idx ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center py-20 text-center select-none">
                      <Key className="h-10 w-10 text-muted-foreground/30 animate-pulse mb-3" />
                      <div className="text-sm font-semibold text-muted-foreground">No passwords generated yet</div>
                      <button
                        onClick={() => handleGenerate()}
                        className="text-xs text-primary hover:underline font-bold mt-1.5 cursor-pointer"
                      >
                        Generate random keys
                      </button>
                    </div>
                  )}

                  {/* Downloads action buttons */}
                  {passwords.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/30 flex flex-wrap gap-2 justify-end select-none">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadTxt}
                        leftIcon={<Download className="h-3.5 w-3.5" />}
                        className="text-xs font-semibold"
                        aria-label="Download passwords as TXT list file"
                      >
                        Download TXT
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadCsv}
                        leftIcon={<Download className="h-3.5 w-3.5" />}
                        className="text-xs font-semibold"
                        aria-label="Download passwords as CSV table"
                      >
                        Download CSV
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Password strength analysis analytics ( Shannon Entropy & Crack times ) */}
              {analysis && (
                <div className="flex flex-col gap-4 w-full">
                  
                  {/* Strength progress bar */}
                  <Card className="border-border bg-card/65 font-sans">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-heading flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Activity className="h-4.5 w-4.5 text-primary" /> Password Security Analysis</span>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase", 
                          analysis.rating === 'Very Strong' && 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
                          analysis.rating === 'Strong' && 'bg-teal-500/10 text-teal-500 border border-teal-500/20',
                          analysis.rating === 'Medium' && 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
                          analysis.rating === 'Weak' && 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
                          analysis.rating === 'Very Weak' && 'bg-red-500/10 text-red-500 border border-red-500/20'
                        )}>
                          {analysis.rating}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 space-y-4">
                      
                      {/* Progress bar */}
                      <div className="space-y-1 select-none">
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div className={cn("h-full transition-all duration-500", analysis.progressColor)} style={{ width: `${analysis.scorePercent}%` }} />
                        </div>
                      </div>

                      {/* Crack statistics grid */}
                      <div className="grid grid-cols-3 gap-3 text-xs font-medium">
                        <div className="p-3 border border-border/40 bg-secondary/15 rounded-lg">
                          <span className="text-[10px] text-muted-foreground font-sans uppercase font-bold tracking-wider block mb-1">Shannon Entropy</span>
                          <span className="font-semibold font-mono text-foreground text-sm">{analysis.entropy} Bits</span>
                        </div>
                        <div className="p-3 border border-border/40 bg-secondary/15 rounded-lg">
                          <span className="text-[10px] text-muted-foreground font-sans uppercase font-bold tracking-wider block mb-1">Brute Crack Time</span>
                          <span className="font-semibold text-foreground text-xs leading-tight flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {analysis.crackTime}
                          </span>
                        </div>
                        <div className="p-3 border border-border/40 bg-secondary/15 rounded-lg">
                          <span className="text-[10px] text-muted-foreground font-sans uppercase font-bold tracking-wider block mb-1">Diversity Score</span>
                          <span className="font-semibold font-mono text-foreground text-sm">{analysis.diversityScore} / 4 Classes</span>
                        </div>
                      </div>

                      {/* Character Analysis bar breakdown */}
                      <div className="space-y-2 pt-2 border-t border-border/40">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Character Classes Counts</span>
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold text-muted-foreground font-mono">
                          <div className="bg-secondary/20 p-2 rounded-lg border border-border/30">
                            <span className="block text-foreground text-xs font-bold">{analysis.upperCount}</span>
                            <span>Uppercase</span>
                          </div>
                          <div className="bg-secondary/20 p-2 rounded-lg border border-border/30">
                            <span className="block text-foreground text-xs font-bold">{analysis.lowerCount}</span>
                            <span>Lowercase</span>
                          </div>
                          <div className="bg-secondary/20 p-2 rounded-lg border border-border/30">
                            <span className="block text-foreground text-xs font-bold">{analysis.numbersCount}</span>
                            <span>Numbers</span>
                          </div>
                          <div className="bg-secondary/20 p-2 rounded-lg border border-border/30">
                            <span className="block text-foreground text-xs font-bold">{analysis.symbolsCount}</span>
                            <span>Symbols</span>
                          </div>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </div>
              )}

            </div>
          </div>

        </div>
      }
      faqs={faqItems}
      instructionsTitle="Secure Password Policy Guidelines"
      instructions={
        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed font-sans">
          
          {/* Why strong passwords matter */}
          <div className="space-y-2">
            <h4 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
              <Lock className="h-4.5 w-4.5 text-primary" /> Why Strong Passwords Matter
            </h4>
            <p>
              In secure computing environments, authentication forms the first line of defense. Standard brute-force dictionary attacks utilize massive database libraries of previously leaked passwords or rapidly guess combinations using high-end graphical processing units (GPUs). A secure password significantly increases computational time, preventing successful breach compromises.
            </p>
          </div>

          {/* Password Security Best Practices */}
          <div className="space-y-2">
            <h4 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-primary" /> Security Best Practices
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong className="text-foreground">Minimum 16 characters:</strong> Length is the most critical driver of cryptographic entropy. Each additional character increases combinations exponentially.</li>
              <li><strong className="text-foreground">Use diverse character sets:</strong> Always combine uppercase, lowercase, numbers, and symbols to maximize character diversity.</li>
              <li><strong className="text-foreground">Utilize Password Managers:</strong> Rather than memorizing complex passwords, leverage encrypted vault managers (like 1Password, Bitwarden) to auto-generate and store unique credentials for every account.</li>
              <li><strong className="text-foreground">Enable Multi-Factor Authentication (MFA):</strong> Stamping credentials with MFA codes prevents access leaks even if a primary password is breached.</li>
            </ul>
          </div>

          {/* Common Password Mistakes */}
          <div className="space-y-2">
            <h4 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-primary" /> Common Password Mistakes
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong className="text-foreground">Password Reuse:</strong> Reusing a single password across multiple services means a single website database leak exposes all your active accounts.</li>
              <li><strong className="text-foreground">Using dictionary words or personal data:</strong> Attackers compile names, birth dates, dictionary vocabularies, and phone sequences into guessing scripts.</li>
              <li><strong className="text-foreground">Storing credentials in plain text:</strong> Avoid saving passwords in plain text files, emails, or stick notes on your desk.</li>
            </ul>
          </div>

        </div>
      }
      benefits={[
        "Kernel-Level Cryptographic Randomness: Leverages OS-seeded browser random integer bytes.",
        "Bit-Entropy Complexity Analyzer: Evaluates crack-time resistance mathematically.",
        "Zero Server Transmissions: Execution runs offline in local sandbox arrays."
      ]}
    />
  )
}
