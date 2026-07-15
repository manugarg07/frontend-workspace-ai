import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Sparkles,
  Code,
  Share2,
  Eye,
  Cpu,
  ArrowLeftRight,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { CodeEditorWrapper } from '@/components/ui/CodeEditorWrapper'
import { FileUpload } from '@/components/ui/FileUpload'
import { Toolbar } from '@/components/ui/Toolbar'
import { ResultPanel } from '@/components/ui/ResultPanel'
import { ToolLayout } from '@/components/common/ToolLayout'
import type { OptionTab } from '@/components/common/ToolLayout'
import { cn } from '@/lib/utils'

// Predefined JWT mock samples
const SAMPLES = {
  standard: {
    title: 'Standard Mock Token',
    data: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3ODUwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  },
  expired: {
    title: 'Expired Mock Token',
    data: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItODQyMDAiLCJuYW1lIjoiQWxpY2UgU21pdGgiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTQ2Njg0ODAwLCJyb2xlcyI6WyJhZG1pbiJdfQ.signature-placeholder'
  }
}

export function JWTDecoderPro() {
  const { toast } = useToast()

  // State Management
  const [inputVal, setInputVal] = useState('')
  const [headerVal, setHeaderVal] = useState('')
  const [payloadVal, setPayloadVal] = useState('')
  const [validationStatus, setValidationStatus] = useState<null | 'success' | 'warning' | 'error'>(null)
  const [validationMessage, setValidationMessage] = useState('')
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Token parsed metrics
  const [tokenMetrics, setTokenMetrics] = useState<{
    algorithm: string
    issuedAt: string
    expiresAt: string
    isExpired: boolean
    subject: string
  } | null>(null)

  // Helper Base64URL decoder
  const base64UrlDecode = (str: string): string => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    return decodeURIComponent(escape(atob(base64)))
  }

  // Conversion Pipeline
  const handleConvert = useCallback((customInput = inputVal) => {
    if (!customInput.trim()) {
      setHeaderVal('')
      setPayloadVal('')
      setValidationStatus(null)
      setValidationMessage('')
      setTokenMetrics(null)
      setProcessingTime(null)
      return
    }

    setIsProcessing(true)
    const startTime = performance.now()

    try {
      const parts = customInput.trim().split('.')
      if (parts.length < 2) {
        throw new Error('Invalid JWT: A valid JSON Web Token must contain at least Header and Payload parts separated by dots.')
      }

      // 1. Decode Header
      const decodedHeader = base64UrlDecode(parts[0])
      const headerObj = JSON.parse(decodedHeader)
      setHeaderVal(JSON.stringify(headerObj, null, 2))

      // 2. Decode Payload
      const decodedPayload = base64UrlDecode(parts[1])
      const payloadObj = JSON.parse(decodedPayload)
      setPayloadVal(JSON.stringify(payloadObj, null, 2))

      // 3. Evaluate claims metrics
      const alg = headerObj.alg || 'None'
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

      setTokenMetrics({
        algorithm: alg,
        issuedAt,
        expiresAt,
        isExpired,
        subject: sub
      })

      if (isExpired) {
        setValidationStatus('warning')
        setValidationMessage('Notice: Token has expired. Check exp date claims.')
      } else {
        setValidationStatus('success')
        setValidationMessage('Success: Token successfully parsed and claims decoded!')
      }
    } catch (err) {
      setValidationStatus('error')
      setValidationMessage(err instanceof Error ? err.message : 'Invalid Token: Failed to base64url-decode token segments.')
      setHeaderVal('')
      setPayloadVal('')
      setTokenMetrics(null)
    } finally {
      const endTime = performance.now()
      setProcessingTime(Number((endTime - startTime).toFixed(3)))
      setIsProcessing(false)
    }
  }, [inputVal])

  // Debounced auto-convert trigger
  useEffect(() => {
    const delay = setTimeout(() => {
      handleConvert()
    }, 250)
    return () => clearTimeout(delay)
  }, [inputVal, handleConvert])

  // File Handlers
  const handleFileLoaded = (text: string, filename: string) => {
    setInputVal(text)
    toast(`Loaded: ${filename}`, 'success')
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
    toast('Copied token header to clipboard!', 'success')
  }

  const handleCopyPayload = () => {
    if (!payloadVal) return
    navigator.clipboard.writeText(payloadVal)
    toast('Copied token payload to clipboard!', 'success')
  }

  const handleCopyFull = () => {
    if (!headerVal || !payloadVal) return
    const fullJson = JSON.stringify({
      header: JSON.parse(headerVal),
      payload: JSON.parse(payloadVal)
    }, null, 2)
    navigator.clipboard.writeText(fullJson)
    toast('Copied header & payload JSON to clipboard!', 'success')
  }

  const handleDownload = () => {
    if (!headerVal || !payloadVal) return
    const fullJson = JSON.stringify({
      header: JSON.parse(headerVal),
      payload: JSON.parse(payloadVal)
    }, null, 2)
    const blob = new Blob([fullJson], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'decoded-jwt.json'
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded decoded JSON token claims', 'success')
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputVal(text)
      toast('Pasted from clipboard', 'success')
    } catch {
      toast('Clipboard permission blocked. Use Ctrl+V inside the editor.', 'error')
    }
  }

  const loadPreset = (key: string) => {
    setInputVal(SAMPLES[key as keyof typeof SAMPLES].data)
    toast(`Loaded preset: ${SAMPLES[key as keyof typeof SAMPLES].title}`, 'info')
  }

  // Preset Spacing Options
  const presetsSamples = useMemo(() => {
    const obj: { [key: string]: { title: string; data: any } } = {}
    Object.entries(SAMPLES).forEach(([key, value]) => {
      obj[key] = { title: value.title, data: value.data }
    })
    return obj
  }, [])

  // FAQs
  const faqItems = [
    {
      id: 'jwt-faq-1',
      title: 'What is a JSON Web Token (JWT)?',
      content: (
        <span>
          JWT is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed.
        </span>
      )
    },
    {
      id: 'jwt-faq-2',
      title: 'Is it safe to paste my production JWT tokens here?',
      content: (
        <span>
          Yes. The decoder runs 100% inside your local browser. No data is sent over the network, ensuring private access credentials or claims remain entirely secure.
        </span>
      )
    }
  ]

  return (
    <FileUpload onFileLoaded={handleFileLoaded} accept=".txt">
      <ToolLayout
        toolSlug="jwt-decoder"
        toolbar={
          <Toolbar
            onPaste={handlePaste}
            onUpload={handleFileUpload}
            uploadAccept=".txt"
            samples={presetsSamples}
            onLoadSample={loadPreset}
            onConvert={() => handleConvert()}
            convertLabel="Decode Token"
            onCopy={handleCopyFull}
            copyDisabled={!headerVal}
            onDownload={handleDownload}
            downloadDisabled={!headerVal}
            onClear={() => { setInputVal(''); setHeaderVal(''); setPayloadVal(''); setValidationStatus(null); setValidationMessage(''); setTokenMetrics(null); }}
            clearDisabled={!inputVal && !headerVal}
          />
        }
        editorSection={
          <div className="flex flex-col gap-6 w-full text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
              {/* Input card */}
              <div className="lg:col-span-5 flex flex-col">
                <CodeEditorWrapper
                  language="markdown"
                  value={inputVal}
                  onChange={setInputVal}
                  placeholder="Paste your encoded JWT token here... (e.g. eyJhbGciOi...)"
                />
              </div>

              {/* Output card (Header & Payload side-by-side or stacked) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <ResultPanel
                  title="Decoded Header & Claims"
                  value={payloadVal}
                  onCopy={handleCopyFull}
                  onDownload={handleDownload}
                  validationStatus={validationStatus}
                  validationMessage={validationMessage}
                  processingTime={processingTime}
                >
                  <div className="flex flex-col gap-4 p-4 flex-1">
                    <div className="flex-1 min-h-[140px] flex flex-col">
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase mb-1.5 font-sans">
                        <span>1. Header (Metadata)</span>
                        <button onClick={handleCopyHeader} className="hover:text-primary transition-colors text-[10px] uppercase font-bold">Copy Header</button>
                      </div>
                      <CodeEditorWrapper
                        language="json"
                        value={headerVal}
                        readOnly={true}
                        height="120px"
                      />
                    </div>
                    <div className="flex-1 min-h-[220px] flex flex-col">
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase mb-1.5 font-sans">
                        <span>2. Payload (Claims)</span>
                        <button onClick={handleCopyPayload} className="hover:text-primary transition-colors text-[10px] uppercase font-bold">Copy Payload</button>
                      </div>
                      <CodeEditorWrapper
                        language="json"
                        value={payloadVal}
                        readOnly={true}
                        height="180px"
                      />
                    </div>
                  </div>
                </ResultPanel>
              </div>
            </div>

            {/* Token Metrics Grid */}
            {tokenMetrics && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
                <div className="p-4 border border-border/40 bg-card/40 rounded-xl font-sans">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Signing Algorithm</div>
                  <div className="text-sm font-semibold mt-1 text-foreground flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-primary" /> {tokenMetrics.algorithm}
                  </div>
                </div>
                <div className="p-4 border border-border/40 bg-card/40 rounded-xl font-sans">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Subject claim (sub)</div>
                  <div className="text-sm font-semibold mt-1 text-foreground truncate">{tokenMetrics.subject}</div>
                </div>
                <div className="p-4 border border-border/40 bg-card/40 rounded-xl font-sans">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Issued At</div>
                  <div className="text-sm font-semibold mt-1 text-foreground flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" /> {tokenMetrics.issuedAt}
                  </div>
                </div>
                <div className="p-4 border border-border/40 bg-card/40 rounded-xl font-sans">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Expiration Date</div>
                  <div className="text-sm font-semibold mt-1 text-foreground flex items-center gap-1.5">
                    {tokenMetrics.isExpired ? (
                      <span className="text-red-500 flex items-center gap-1.5 font-semibold"><AlertTriangle className="h-4 w-4" /> Expired</span>
                    ) : (
                      <span className="text-emerald-500 flex items-center gap-1.5 font-semibold"><CheckCircle2 className="h-4 w-4" /> Active</span>
                    )}
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">{tokenMetrics.expiresAt}</div>
                </div>
              </div>
            )}
          </div>
        }
        faqs={faqItems}
        instructionsTitle="JSON Web Token Decoding Guide"
        instructions={
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground list-none pl-0">
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">1</span>
              <span>Paste your raw base64-encoded JWT token stream inside the left input text panel.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">2</span>
              <span>The debugger splits signature dots, decodes headers/payloads, and renders clean JSON code blocks.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">3</span>
              <span>Review encryption algorithms, check expirations in the metrics bar, and copy decoded claims.</span>
            </li>
          </ul>
        }
        benefits={[
          "100% Secure Local Decoding: No information is transmitted across public network channels.",
          "Cleans properties automatically (extracts signature header segments, parses claims).",
          "Calculates dynamic local expiration alerts."
        ]}
      />
    </FileUpload>
  )
}
