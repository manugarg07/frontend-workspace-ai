import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Sparkles,
  Code,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Upload,
  Copy,
  Download,
  Info,
  Trash2,
  FileText,
  KeyRound,
  FileJson
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { CodeEditorWrapper } from '@/components/ui/CodeEditorWrapper'
import { FileUpload } from '@/components/ui/FileUpload'
import { Toolbar } from '@/components/ui/Toolbar'
import { ToolLayout } from '@/components/common/ToolLayout'
import { cn } from '@/lib/utils'

// Predefined JWT mock samples
const SAMPLES = {
  activeHmac: {
    title: 'Active Token (HS256)',
    data: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItODQyMDAiLCJuYW1lIjoiQWxleCBSaXZlcmEiLCJpc3MiOiJ3b3Jrc3BhY2UuYWkiLCJhdWQiOiJkZXZlbG9wZXJzIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE4NTM4NzQ4MDAsIm5iZiI6MTUxNjIzOTAyMiwianRpIjoiYWJjLTEyMyJ9.m2Xw2B1Q0t0gQ-G3b80Tf7-f9t1u9m6-k9K-6e7J8I4',
    secret: 'secret-key-123'
  },
  expired: {
    title: 'Expired Token (HS256)',
    data: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItOTAwMDEiLCJuYW1lIjoiQWlzaGEgTWFzaSIsImlzcyI6ImF1dGguY29tcGFueSIsImV4cCI6OTQ2Njg0ODAwLCJpYXQiOjk0NjY4NDAwMCwianRpIjoiZXhwLTk5OSJ9.signature-placeholder',
    secret: ''
  },
  unsigned: {
    title: 'Unsigned Token (None)',
    data: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c3ItNzcwMDAiLCJuYW1lIjoiTWFudSBHYXJnIiwicm9sZXMiOlsiZGV2ZWxvcGVyIl19.',
    secret: ''
  }
}

interface ParsedClaims {
  iss?: string
  sub?: string
  aud?: string
  exp?: number
  iat?: number
  nbf?: number
  jti?: string
  [key: string]: any
}

export function JWTDecoderPro() {
  const { toast } = useToast()

  // State Management
  const [inputVal, setInputVal] = useState('')
  const [headerVal, setHeaderVal] = useState('')
  const [payloadVal, setPayloadVal] = useState('')
  
  // Signature States
  const [signatureB64, setSignatureB64] = useState('')
  const [signatureHex, setSignatureHex] = useState('')
  const [signatureSecret, setSignatureSecret] = useState('')
  const [isSignatureVerified, setIsSignatureVerified] = useState<boolean | null>(null)

  // Validation States
  const [validationStatus, setValidationStatus] = useState<null | 'success' | 'warning' | 'error'>(null)
  const [validationMessage, setValidationMessage] = useState('')
  const [processingTime, setProcessingTime] = useState<number | null>(null)

  // Expiration countdown
  const [countdown, setCountdown] = useState<string>('')
  
  // Parsed Claims explaining state
  const [parsedClaims, setParsedClaims] = useState<ParsedClaims | null>(null)

  const [tokenMetrics, setTokenMetrics] = useState<{
    algorithm: string
    type: string
    issuedAt: string
    expiresAt: string
    notBefore: string
    isExpired: boolean
    isNotActiveYet: boolean
    subject: string
  } | null>(null)

  // base64url decoder
  const base64UrlDecode = (str: string): string => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  }

  // hex conversion
  const base64ToHex = (str: string): string => {
    try {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
      while (base64.length % 4) {
        base64 += '='
      }
      const raw = atob(base64)
      let hex = ''
      for (let i = 0; i < raw.length; i++) {
        const h = raw.charCodeAt(i).toString(16)
        hex += (h.length === 1 ? '0' : '') + h
      }
      return hex.toUpperCase()
    } catch {
      return ''
    }
  }

  // Cryptographic Signature verification (HMAC-SHA256 only)
  const verifyHS256Signature = async (
    headerB64: string,
    payloadB64: string,
    signatureB64: string,
    secret: string
  ): Promise<boolean> => {
    try {
      const encoder = new TextEncoder()
      const keyData = encoder.encode(secret)
      const data = encoder.encode(`${headerB64}.${payloadB64}`)
      
      const key = await window.crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: { name: "SHA-256" } },
        false,
        ["verify"]
      )
      
      let base64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/')
      while (base64.length % 4) {
        base64 += '='
      }
      const sigBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      
      return await window.crypto.subtle.verify(
        "HMAC",
        key,
        sigBytes,
        data
      )
    } catch (e) {
      console.error('HMAC verification error:', e)
      return false
    }
  }

  // Decoding loop
  const handleConvert = useCallback((customInput = inputVal) => {
    if (!customInput.trim()) {
      setHeaderVal('')
      setPayloadVal('')
      setSignatureB64('')
      setSignatureHex('')
      setValidationStatus(null)
      setValidationMessage('')
      setTokenMetrics(null)
      setParsedClaims(null)
      setProcessingTime(null)
      return
    }

    const startTime = performance.now()

    try {
      const parts = customInput.trim().split('.')
      if (parts.length < 2) {
        throw new Error('Invalid JWT format: A valid JSON Web Token must contain at least Header and Payload parts separated by dots.')
      }

      // 1. Decode Header
      const decodedHeader = base64UrlDecode(parts[0])
      const headerObj = JSON.parse(decodedHeader)
      setHeaderVal(JSON.stringify(headerObj, null, 2))

      // 2. Decode Payload
      const decodedPayload = base64UrlDecode(parts[1])
      const payloadObj = JSON.parse(decodedPayload)
      setPayloadVal(JSON.stringify(payloadObj, null, 2))
      setParsedClaims(payloadObj)

      // 3. Decode Signature part
      const rawSig = parts[2] || ''
      setSignatureB64(rawSig)
      setSignatureHex(rawSig ? base64ToHex(rawSig) : '')

      // 4. Claims validation
      const alg = headerObj.alg || 'None'
      const typ = headerObj.typ || 'JWT'
      const sub = payloadObj.sub || 'None'
      
      let issuedAt = 'N/A'
      if (payloadObj.iat) {
        issuedAt = new Date(payloadObj.iat * 1000).toLocaleString()
      }

      let expiresAt = 'N/A'
      let isExpired = false
      if (payloadObj.exp) {
        const expTime = payloadObj.exp * 1000
        expiresAt = new Date(expTime).toLocaleString()
        isExpired = Date.now() > expTime
      }

      let notBefore = 'N/A'
      let isNotActiveYet = false
      if (payloadObj.nbf) {
        const nbfTime = payloadObj.nbf * 1000
        notBefore = new Date(nbfTime).toLocaleString()
        isNotActiveYet = Date.now() < nbfTime
      }

      setTokenMetrics({
        algorithm: alg,
        type: typ,
        issuedAt,
        expiresAt,
        notBefore,
        isExpired,
        isNotActiveYet,
        subject: sub
      })

      if (isExpired) {
        setValidationStatus('warning')
        setValidationMessage('Notice: Token has expired. Check exp date claim.')
      } else if (isNotActiveYet) {
        setValidationStatus('warning')
        setValidationMessage('Notice: Token is not active yet (Not Before nbf claim active).')
      } else if (alg.toLowerCase() === 'none') {
        setValidationStatus('warning')
        setValidationMessage('Notice: Token algorithm is set to None. This represents an unsigned, insecure token.')
      } else {
        setValidationStatus('success')
        setValidationMessage('Success: Token parsed and base64url claims decoded locally.')
      }

    } catch (err) {
      setValidationStatus('error')
      setValidationMessage(err instanceof Error ? err.message : 'Invalid Token: Failed to base64url-decode token segments.')
      setHeaderVal('')
      setPayloadVal('')
      setSignatureB64('')
      setSignatureHex('')
      setTokenMetrics(null)
      setParsedClaims(null)
    } finally {
      const endTime = performance.now()
      setProcessingTime(Number((endTime - startTime).toFixed(3)))
    }
  }, [inputVal])

  // Real-time Expiration Ticker
  useEffect(() => {
    if (!parsedClaims || !parsedClaims.exp) {
      setCountdown('')
      return
    }

    const expTime = parsedClaims.exp * 1000

    const updateCountdown = () => {
      const remaining = expTime - Date.now()
      if (remaining <= 0) {
        setCountdown('Token has expired')
      } else {
        const secs = Math.floor(remaining / 1000) % 60
        const mins = Math.floor(remaining / (1000 * 60)) % 60
        const hours = Math.floor(remaining / (1000 * 60 * 60)) % 24
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24))

        let str = ''
        if (days > 0) str += `${days}d `
        if (hours > 0) str += `${hours}h `
        if (mins > 0) str += `${mins}m `
        str += `${secs}s`
        setCountdown(`Expires in: ${str}`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [parsedClaims])

  // Automatic signature validator trigger (HS256)
  useEffect(() => {
    const checkSignature = async () => {
      if (!inputVal.trim()) {
        setIsSignatureVerified(null)
        return
      }

      const parts = inputVal.trim().split('.')
      if (parts.length !== 3) {
        setIsSignatureVerified(null)
        return
      }

      try {
        const headerObj = JSON.parse(base64UrlDecode(parts[0]))
        
        if (headerObj.alg === 'HS256') {
          if (!signatureSecret) {
            setIsSignatureVerified(null)
            return
          }
          const isValid = await verifyHS256Signature(parts[0], parts[1], parts[2], signatureSecret)
          setIsSignatureVerified(isValid)
        } else {
          // Other encryption algorithms cannot be verified via HMAC secrets
          setIsSignatureVerified(null)
        }
      } catch {
        setIsSignatureVerified(null)
      }
    }

    checkSignature()
  }, [inputVal, signatureSecret])

  // Auto-run trigger
  useEffect(() => {
    const delay = setTimeout(() => {
      handleConvert()
    }, 200)
    return () => clearTimeout(delay)
  }, [inputVal, handleConvert])

  // File loading
  const handleFileLoaded = (text: string, filename: string) => {
    setInputVal(text.trim())
    toast(`Loaded token file: ${filename}`, 'success')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      handleFileLoaded(text, file.name)
    }
    reader.readAsText(file)
  }

  const handleCopyHeader = () => {
    if (!headerVal) return
    navigator.clipboard.writeText(headerVal)
    toast('Copied header JSON to clipboard', 'success')
  }

  const handleCopyPayload = () => {
    if (!payloadVal) return
    navigator.clipboard.writeText(payloadVal)
    toast('Copied payload JSON to clipboard', 'success')
  }

  const handleCopySignature = () => {
    if (!signatureB64) return
    navigator.clipboard.writeText(signatureB64)
    toast('Copied raw signature to clipboard', 'success')
  }

  const handleCopyFull = () => {
    if (!headerVal || !payloadVal) return
    const fullJson = JSON.stringify({
      header: JSON.parse(headerVal),
      payload: JSON.parse(payloadVal),
      signature: signatureB64
    }, null, 2)
    navigator.clipboard.writeText(fullJson)
    toast('Copied full decoded components to clipboard', 'success')
  }

  const handleDownload = () => {
    if (!headerVal || !payloadVal) return
    const fullJson = JSON.stringify({
      header: JSON.parse(headerVal),
      payload: JSON.parse(payloadVal),
      signature: signatureB64
    }, null, 2)
    const blob = new Blob([fullJson], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'decoded-jwt-payload.json'
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded decoded JSON schema data', 'success')
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputVal(text.trim())
      toast('Token pasted from clipboard', 'success')
    } catch {
      toast('Clipboard access blocked. Paste manually inside the editor.', 'error')
    }
  }

  const loadPreset = (key: string) => {
    const sample = SAMPLES[key as keyof typeof SAMPLES]
    setInputVal(sample.data)
    setSignatureSecret(sample.secret)
    toast(`Loaded preset: ${sample.title}`, 'info')
  }

  const presetsSamples = useMemo(() => {
    const obj: { [key: string]: { title: string; data: any } } = {}
    Object.entries(SAMPLES).forEach(([key, value]) => {
      obj[key] = { title: value.title, data: value.data }
    })
    return obj
  }, [])

  // Dynamic claims explain dictionary
  const claimExplanationsList = useMemo(() => {
    if (!parsedClaims) return []
    
    const definitions: Record<string, { label: string; desc: string }> = {
      iss: { label: 'iss (Issuer)', desc: 'Identifies the entity that issued the JWT.' },
      sub: { label: 'sub (Subject)', desc: 'Identifies the subject/user of this token.' },
      aud: { label: 'aud (Audience)', desc: 'Identifies the recipients that the JWT is intended for.' },
      exp: { label: 'exp (Expiration Time)', desc: 'Identifies the expiration time on or after which the JWT must not be accepted.' },
      nbf: { label: 'nbf (Not Before)', desc: 'Identifies the time before which the JWT must not be accepted.' },
      iat: { label: 'iat (Issued At)', desc: 'Identifies the time at which the JWT was issued.' },
      jti: { label: 'jti (JWT ID)', desc: 'Provides a unique identifier for the JWT.' }
    }

    return Object.entries(parsedClaims).map(([key, val]) => {
      const def = definitions[key]
      
      let humanVal = String(val)
      let status: 'active' | 'expired' | 'warning' | 'neutral' = 'neutral'
      
      if ((key === 'exp' || key === 'iat' || key === 'nbf') && typeof val === 'number') {
        humanVal = `${new Date(val * 1000).toLocaleString()} (epoch: ${val})`
        
        if (key === 'exp') {
          const expired = Date.now() > val * 1000
          status = expired ? 'expired' : 'active'
        } else if (key === 'nbf') {
          const notActive = Date.now() < val * 1000
          status = notActive ? 'warning' : 'active'
        } else if (key === 'iat') {
          status = 'active'
        }
      }

      return {
        key,
        label: def ? def.label : key,
        description: def ? def.desc : 'Custom application-specific private claim namespaces.',
        value: humanVal,
        status
      }
    })
  }, [parsedClaims])

  const faqItems = [
    {
      id: 'jwt-faq-1',
      title: 'What is a JSON Web Token (JWT)?',
      content: (
        <span className="font-sans">
          JWT is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. The payload signature allows verifying client integrity locally.
        </span>
      )
    },
    {
      id: 'jwt-faq-2',
      title: 'Is it secure to paste private tokens in CodeStrategists?',
      content: (
        <span className="font-sans">
          Yes, 100% secure. All calculations occur inside your browser using sandboxed JavaScript context. No network API calls are triggered, ensuring your secrets never leave your device.
        </span>
      )
    },
    {
      id: 'jwt-faq-3',
      title: 'How does signature validation work?',
      content: (
        <span className="font-sans">
          CodeStrategists utilizes the browser's native SubtleCrypto Web Cryptography API to calculate HMAC signatures locally. When you type the verification secret, it generates the hash over your decoded Header and Payload blocks and matches it against the third segment of the token.
        </span>
      )
    },
    {
      id: 'jwt-faq-4',
      title: 'What is the "alg: none" security vulnerability?',
      content: (
        <span className="font-sans">
          The "none" algorithm indicates that the JWT is unsigned. A malicious actor can modify headers or claims and change the algorithm parameter to "none", and weak servers might accept it without verifying signature hashes. Always disable "none" in production filters.
        </span>
      )
    }
  ]

  return (
    <FileUpload onFileLoaded={handleFileLoaded} accept=".txt,.json">
      <ToolLayout
        toolSlug="jwt-decoder"
        extraSEOProps={{
          title: "JWT Decoder & Token Inspector - CodeStrategists",
          description: "Decode JSON Web Tokens (JWT) payload, header headers, and signature claims instantly inside your browser. Verify HMAC signatures locally."
        }}
        toolbar={
          <Toolbar
            onPaste={handlePaste}
            onUpload={handleFileUpload}
            uploadAccept=".txt,.json"
            samples={presetsSamples}
            onLoadSample={loadPreset}
            onConvert={() => handleConvert()}
            convertLabel="Parse Claims"
            onCopy={handleCopyFull}
            copyDisabled={!headerVal}
            onDownload={handleDownload}
            downloadDisabled={!headerVal}
            onClear={() => {
              setInputVal('')
              setHeaderVal('')
              setPayloadVal('')
              setSignatureB64('')
              setSignatureHex('')
              setSignatureSecret('')
              setIsSignatureVerified(null)
              setValidationStatus(null)
              setValidationMessage('')
              setTokenMetrics(null)
              setParsedClaims(null)
            }}
            clearDisabled={!inputVal && !headerVal}
          />
        }
        editorSection={
          <div className="flex flex-col gap-6 w-full text-left font-sans">
            
            {/* Top Privacy banner notice */}
            <Card className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
              <CardContent className="p-4 flex items-start gap-3">
                <Shield className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <span className="font-bold">Privacy Guarantee:</span> Your tokens are parsed and cryptographically validated 100% locally inside your browser sandbox. Your signature secret and decoded payloads are never sent to any server.
                </div>
              </CardContent>
            </Card>

            {/* Input & Output Panels Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
              
              {/* Left Column: Input (Col 5) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <Card className="border-border bg-card/45 flex-1 flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-heading">Base64 Encoded Token</CardTitle>
                    <CardDescription className="text-xs">Paste your raw JWT payload stream below.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                    
                    {/* Drag and Drop Zone */}
                    {!inputVal && (
                      <div className="border-2 border-dashed border-border/80 hover:border-primary/50 transition-all rounded-xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 mb-4 bg-secondary/10">
                        <Upload className="h-6 w-6 text-muted-foreground animate-bounce" />
                        <span className="text-xs font-semibold text-foreground">Drag & Drop token text file here</span>
                        <span className="text-[10px] text-muted-foreground">Or click Upload on the toolbar</span>
                      </div>
                    )}

                    <CodeEditorWrapper
                      language="markdown"
                      value={inputVal}
                      onChange={(val) => setInputVal(val.trim())}
                      placeholder="Paste token here... (e.g. eyJhbGciOi...)"
                      height={inputVal ? "350px" : "250px"}
                    />

                    {/* Expiration countdown ticker */}
                    {countdown && (
                      <div className={cn("mt-4 p-3 rounded-lg border text-xs font-mono font-semibold flex items-center gap-2",
                        countdown.includes('expired') 
                          ? 'bg-red-500/10 border-red-500/20 text-red-500'
                          : 'bg-primary/10 border-primary/20 text-primary'
                      )}>
                        <Clock className="h-4 w-4 shrink-0" />
                        <span>{countdown}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Signature verification control card */}
                {tokenMetrics && (
                  <Card className="border-border bg-card/65 font-sans">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-heading flex items-center justify-between">
                        <span>HMAC Signature Verification</span>
                        <Badge variant={tokenMetrics.algorithm === 'HS256' ? 'primary' : 'outline'} className="text-[10px]">
                          {tokenMetrics.algorithm}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-3">
                      <div className="text-xs text-muted-foreground leading-normal">
                        {tokenMetrics.algorithm === 'HS256' ? (
                          "Enter the HMAC SHA-256 secret key to cryptographically verify client payload claims integrity."
                        ) : (
                          `Notice: Signature verification is currently supported for HS256 algorithm. Current: ${tokenMetrics.algorithm}`
                        )}
                      </div>
                      
                      {tokenMetrics.algorithm === 'HS256' && (
                        <div className="flex gap-2">
                          <input
                            type="password"
                            placeholder="HMAC Secret Key..."
                            value={signatureSecret}
                            onChange={(e) => setSignatureSecret(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs bg-background hover:bg-secondary/10 rounded-lg border border-border focus:border-primary focus:outline-none transition-all font-mono"
                          />
                        </div>
                      )}

                      {/* verification state badges */}
                      {signatureSecret && isSignatureVerified !== null && (
                        <div className={cn("p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 font-mono border",
                          isSignatureVerified 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                        )}>
                          {isSignatureVerified ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Signature Verified Successfully!</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 animate-bounce" />
                              <span>Invalid Signature Hash. Match Failed.</span>
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column: Three-Panel Decoded Outputs (Col 7) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                
                {/* Panel 1: Header */}
                <Card className="border-border bg-card/65 flex flex-col">
                  <div className="px-4 py-2 border-b border-border/40 bg-secondary/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase font-heading tracking-wider">1. Decoded Header (Metadata)</span>
                    {headerVal && (
                      <button onClick={handleCopyHeader} className="text-primary hover:underline text-[10px] font-bold font-heading flex items-center gap-1 cursor-pointer">
                        <Copy className="h-3 w-3" /> Copy Header
                      </button>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <CodeEditorWrapper
                      language="json"
                      value={headerVal}
                      readOnly={true}
                      placeholder="Header metadata will display here..."
                      height="120px"
                    />
                  </CardContent>
                </Card>

                {/* Panel 2: Payload */}
                <Card className="border-border bg-card/65 flex flex-col">
                  <div className="px-4 py-2 border-b border-border/40 bg-secondary/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase font-heading tracking-wider">2. Decoded Payload (Claims)</span>
                    {payloadVal && (
                      <button onClick={handleCopyPayload} className="text-primary hover:underline text-[10px] font-bold font-heading flex items-center gap-1 cursor-pointer">
                        <Copy className="h-3 w-3" /> Copy Payload
                      </button>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <CodeEditorWrapper
                      language="json"
                      value={payloadVal}
                      readOnly={true}
                      placeholder="Payload claims data will display here..."
                      height="200px"
                    />
                  </CardContent>
                </Card>

                {/* Panel 3: Signature */}
                <Card className="border-border bg-card/65 flex flex-col">
                  <div className="px-4 py-2 border-b border-border/40 bg-secondary/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase font-heading tracking-wider">3. Token Signature</span>
                    {signatureB64 && (
                      <button onClick={handleCopySignature} className="text-primary hover:underline text-[10px] font-bold font-heading flex items-center gap-1 cursor-pointer">
                        <Copy className="h-3 w-3" /> Copy Signature
                      </button>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3 font-mono text-xs">
                    {signatureB64 ? (
                      <div className="space-y-2">
                        <div>
                          <span className="text-muted-foreground text-[10px] font-sans uppercase font-bold tracking-wider block">Raw Base64URL Signature</span>
                          <div className="bg-secondary/20 border border-border/40 p-2 rounded-lg text-foreground font-semibold break-all max-h-[60px] overflow-y-auto">
                            {signatureB64}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] font-sans uppercase font-bold tracking-wider block">Hexadecimal Format</span>
                          <div className="bg-secondary/20 border border-border/40 p-2 rounded-lg text-foreground font-semibold break-all max-h-[60px] overflow-y-auto">
                            {signatureHex}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-border/30 text-[10px] text-muted-foreground font-sans">
                          Algorithm validation math:
                          <div className="mt-1 bg-black/20 p-2 rounded text-primary border border-primary/10">
                            {tokenMetrics?.algorithm === 'HS256' 
                              ? 'HMACSHA256(base64UrlHeader + "." + base64UrlPayload, secret)' 
                              : `SignatureBytesFromHeaderAndPayload(${tokenMetrics?.algorithm || 'none'})`
                            }
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground italic text-center py-4">No signature segments decoded. Unsigned or malformed token format.</div>
                    )}
                  </CardContent>
                </Card>

              </div>
            </div>

            {/* claims explanation grid table */}
            {claimExplanationsList.length > 0 && (
              <Card className="border-border bg-card/65 font-sans">
                <CardHeader>
                  <CardTitle className="text-base font-heading flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-primary" /> Claims Inspector
                  </CardTitle>
                  <CardDescription className="text-xs">Parsed JWT claim keys defined inside payload parameters.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground uppercase tracking-wider font-bold">
                        <th className="py-2.5 px-3">Claim Key</th>
                        <th className="py-2.5 px-3">Value</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 font-medium">
                      {claimExplanationsList.map((claim) => (
                        <tr key={claim.key} className="hover:bg-secondary/15 transition-all">
                          <td className="py-3 px-3 font-mono text-primary font-bold">{claim.label}</td>
                          <td className="py-3 px-3 break-all font-mono max-w-[200px]">{claim.value}</td>
                          <td className="py-3 px-3 text-muted-foreground leading-normal">{claim.description}</td>
                          <td className="py-3 px-3">
                            {claim.status === 'active' && (
                              <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/25">Active</span>
                            )}
                            {claim.status === 'expired' && (
                              <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full border border-red-500/25">Expired</span>
                            )}
                            {claim.status === 'warning' && (
                              <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/25">Pending</span>
                            )}
                            {claim.status === 'neutral' && (
                              <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded-full border border-border/50">Info</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

          </div>
        }
        faqs={faqItems}
        instructionsTitle="JSON Web Token Inspector Guide"
        instructions={
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed font-sans">
            
            {/* How it works */}
            <div className="space-y-2">
              <h3 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
                <FileJson className="h-4.5 w-4.5 text-primary" /> How JWT Works
              </h3>
              <p>
                A JSON Web Token consists of three base64url-encoded segments separated by dots (`.`): Header, Payload, and Signature.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong className="text-foreground">Header:</strong> Declares token type (JWT) and crypto signing algorithm (e.g. HS256, RS256).</li>
                <li><strong className="text-foreground">Payload:</strong> Contains claims parameter key values (subject ID, timestamps, scope permissions).</li>
                <li><strong className="text-foreground">Signature:</strong> Formed by signing the encoded header/payload with cryptographic keys, securing integrity.</li>
              </ul>
            </div>

            {/* Security best practices */}
            <div className="space-y-2">
              <h3 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
                <Shield className="h-4.5 w-4.5 text-primary" /> Cryptographic Security Best Practices
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong className="text-foreground">Verify Signatures:</strong> Always verify signatures before trust layers read claims parameters.</li>
                <li><strong className="text-foreground">Never store secrets in payloads:</strong> Decoded JWT structures are base64 strings readable by anyone. Do not store authorization keys or user passwords.</li>
                <li><strong className="text-foreground">Use RS256/Asymmetric cryptography:</strong> Prefer RS256 keys. Only authentication servers require signing rights; api gateways verify using public certificates.</li>
                <li><strong className="text-foreground">Short TTL:</strong> Set brief expiration limits and leverage refresh tokens to validate user states.</li>
              </ul>
            </div>

            {/* Common mistakes */}
            <div className="space-y-2">
              <h3 className="font-heading text-foreground font-semibold text-sm flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5 text-primary" /> Common Developer Mistakes
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong className="text-foreground">Trusting header algorithm parameter unconditionally:</strong> Some platforms check algorithm parameters directly, exposing they can be manipulated to "none".</li>
                <li><strong className="text-foreground">Failing to check exp and nbf parameters:</strong> Ensure your payload claims parser always validates timestamp scopes against current local/server offsets.</li>
                <li><strong className="text-foreground">Using weak secrets:</strong> HS256 keys should use high-entropy strings to prevent brute-force signature decodes.</li>
              </ul>
            </div>

          </div>
        }
        benefits={[
          "100% Offline Client Execution: Web Cryptography verification requires zero network requests.",
          "Calculates live ticking expiration alerts and Not Before parameters.",
          "Claims Inspector Table translates cryptographical parameters instantly."
        ]}
      />
    </FileUpload>
  )
}

function Badge({ children, variant = 'outline', className }: { children: React.ReactNode, variant?: 'primary' | 'outline', className?: string }) {
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border", 
      variant === 'primary' 
        ? 'bg-primary/10 text-primary border-primary/20'
        : 'bg-secondary text-muted-foreground border-border/50',
      className
    )}>
      {children}
    </span>
  )
}
