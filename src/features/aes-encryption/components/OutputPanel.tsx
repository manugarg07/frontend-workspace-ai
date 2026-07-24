import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Copy, Download, Zap, FileJson, Lock, Check, ArrowRight } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface OutputPanelProps {
  output: string
  mode: 'encrypt' | 'decrypt'
  iv: string
  keyStr: string
  authTag?: string
  encoding: 'base64' | 'hex'
  stats: {
    timeMs: number
    payloadSize?: number
    encryptedSize?: number
  } | null
  error?: string | null
  onAutoTransfer?: () => void
}

export function OutputPanel({
  output,
  mode,
  iv,
  keyStr,
  authTag,
  encoding,
  stats,
  error,
  onAutoTransfer,
}: OutputPanelProps) {
  const { toast } = useToast()
  const [copiedPayload, setCopiedPayload] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)

  const handleCopyPayload = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopiedPayload(true)
    toast('Copied result payload to clipboard!', 'success')
    setTimeout(() => setCopiedPayload(false), 2000)
  }

  const handleCopyAll = () => {
    if (!output) return
    const keyLenBits = keyStr
      ? encoding === 'base64'
        ? window.atob(keyStr).length * 8
        : keyStr.length * 4
      : 256

    const data = {
      algorithm: 'AES-GCM',
      keySize: keyLenBits,
      encoding: encoding === 'base64' ? 'Base64' : 'Hex',
      ciphertext: mode === 'encrypt' ? output : undefined,
      plaintext: mode === 'decrypt' ? output : undefined,
      key: keyStr,
      iv: iv,
      tag: mode === 'encrypt' ? authTag : undefined,
    }
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopiedAll(true)
    toast('Copied parameter JSON block!', 'success')
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const downloadJSON = () => {
    if (!output) return
    const keyLenBits = keyStr
      ? encoding === 'base64'
        ? window.atob(keyStr).length * 8
        : keyStr.length * 4
      : 256

    const data = {
      algorithm: 'AES-GCM',
      keySize: keyLenBits,
      encoding: encoding === 'base64' ? 'Base64' : 'Hex',
      ciphertext: mode === 'encrypt' ? output : undefined,
      plaintext: mode === 'decrypt' ? output : undefined,
      key: keyStr,
      iv: iv,
      tag: mode === 'encrypt' ? authTag : undefined,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = mode === 'encrypt' ? 'aes-encrypted-payload.json' : 'aes-decrypted-payload.json'
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded parameters JSON file', 'success')
  }

  const downloadTXT = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = mode === 'encrypt' ? 'ciphertext.txt' : 'plaintext.txt'
    link.click()
    URL.revokeObjectURL(url)
    toast('Downloaded raw payload TXT file', 'success')
  }

  if (error) {
    return (
      <Card className="flex flex-col bg-card/60 border-destructive/20 shadow-premium min-h-[300px] justify-center items-center text-center p-6">
        <div className="flex flex-col items-center gap-3 max-w-md">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <Lock className="h-6 w-6 animate-pulse" />
          </div>
          <h3 className="font-heading font-bold text-base text-foreground">Cryptographic Error</h3>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">{error}</p>
        </div>
      </Card>
    )
  }

  const isPlaintext = mode === 'decrypt'

  // Calculate compression/expansion metrics
  const compressionStats = (() => {
    if (!output || !stats) return null
    const plainSize = stats.payloadSize || 0
    const encSize = stats.encryptedSize || 0
    if (plainSize === 0) return null

    // For GCM mode, ciphertext is equal length to plaintext. The extra size comes from the 16-byte auth tag.
    const difference = encSize - plainSize
    const ratio = (encSize / plainSize).toFixed(2)
    const percentChange = ((encSize - plainSize) / plainSize * 100).toFixed(1)

    return {
      ratio,
      difference,
      percentChange,
    }
  })()

  return (
    <Card className="flex flex-col bg-card/60 border-border shadow-premium relative h-full">
      <CardHeader className="p-4 border-b border-border/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondary/10">
        <CardTitle className="font-heading text-sm text-muted-foreground uppercase tracking-wider font-semibold">
          {isPlaintext ? 'Decrypted Cleartext' : 'Encrypted Ciphertext'}
        </CardTitle>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs font-semibold px-2.5 gap-1 border border-border/60 bg-card hover:bg-secondary/40"
            onClick={handleCopyAll}
            disabled={!output}
            aria-label="Copy all parameters as JSON"
          >
            {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <FileJson className="h-3.5 w-3.5" />}
            <span>{copiedAll ? 'Copied!' : 'Copy JSON'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs font-semibold px-2.5 gap-1 border border-border/60 bg-card hover:bg-secondary/40"
            onClick={handleCopyPayload}
            disabled={!output}
            aria-label="Copy result payload"
          >
            {copiedPayload ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedPayload ? 'Copied!' : 'Copy Payload'}</span>
          </Button>
          
          {/* Download split buttons */}
          <div className="flex rounded-md border border-border/60 overflow-hidden text-xs bg-card">
            <button
              onClick={downloadTXT}
              disabled={!output}
              className="px-2.5 py-1.5 hover:bg-secondary/40 disabled:opacity-50 text-muted-foreground hover:text-foreground font-semibold border-r border-border/60 cursor-pointer"
              title="Download raw output TXT"
            >
              <Download className="h-3.5 w-3.5 inline mr-1" />
              TXT
            </button>
            <button
              onClick={downloadJSON}
              disabled={!output}
              className="px-2.5 py-1.5 hover:bg-secondary/40 disabled:opacity-50 text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
              title="Download metadata parameters JSON"
            >
              JSON
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 flex-1 flex flex-col gap-4">
        <Textarea
          placeholder={isPlaintext ? 'Plaintext result will render here...' : 'Ciphertext result will render here...'}
          value={output}
          readOnly
          className="flex-1 bg-secondary/20 text-foreground/90 font-mono resize-y min-h-[160px] text-xs"
        />

        {/* Auto-Transfer Button */}
        {mode === 'encrypt' && output && onAutoTransfer && (
          <Button
            variant="secondary"
            onClick={onAutoTransfer}
            className="w-full h-10 text-xs font-bold gap-1.5 border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all font-sans"
          >
            <span>Use for Decryption</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {/* Stats and metadata */}
        {stats && output && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-secondary/25 border border-border/40 p-3 rounded-xl flex items-center gap-2.5">
                <Zap className="h-4.5 w-4.5 text-yellow-500 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Speed</span>
                  <span className="text-xs font-semibold font-mono text-foreground">{stats.timeMs} ms</span>
                </div>
              </div>

              <div className="bg-secondary/25 border border-border/40 p-3 rounded-xl flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-muted-foreground shrink-0 bg-secondary px-1.5 py-0.5 rounded border border-border/60">
                  IN
                </span>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Plain Size</span>
                  <span className="text-xs font-semibold font-mono text-foreground">
                    {stats.payloadSize !== undefined ? `${stats.payloadSize} B` : '—'}
                  </span>
                </div>
              </div>

              {!isPlaintext && (
                <div className="bg-secondary/25 border border-border/40 p-3 rounded-xl flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-muted-foreground shrink-0 bg-secondary px-1.5 py-0.5 rounded border border-border/60">
                    OUT
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Cipher Size</span>
                    <span className="text-xs font-semibold font-mono text-foreground">
                      {stats.encryptedSize !== undefined ? `${stats.encryptedSize} B` : '—'}
                    </span>
                  </div>
                </div>
              )}

              {mode === 'encrypt' && compressionStats && (
                <div className="bg-secondary/25 border border-border/40 p-3 rounded-xl flex items-center gap-2.5">
                  <span className="text-[9px] font-mono font-bold text-muted-foreground shrink-0 bg-secondary px-1.5 py-0.5 rounded border border-border/60">
                    RATIO
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Expansion</span>
                    <span className="text-xs font-semibold font-mono text-foreground">
                      {compressionStats.ratio}x (+{compressionStats.percentChange}%)
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-secondary/25 border border-border/40 p-3 rounded-xl flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <span className="text-xs font-mono font-bold text-muted-foreground shrink-0 bg-secondary px-1.5 py-0.5 rounded border border-border/60">
                  ALG
                </span>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Cipher</span>
                  <span className="text-xs font-semibold font-mono text-foreground">AES-GCM</span>
                </div>
              </div>
            </div>

            {/* Crypto parameter values details */}
            <div className="bg-secondary/15 border border-border/40 rounded-xl p-3.5 flex flex-col gap-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-border/20">
                <span className="text-muted-foreground font-semibold uppercase text-[10px]">Key size</span>
                <span className="text-foreground">
                  {keyStr ? (encoding === 'base64' ? window.atob(keyStr).length * 8 : keyStr.length * 4) : 256} bit
                </span>
              </div>
              <div className="flex flex-col gap-1 py-1 border-b border-border/20 text-left">
                <span className="text-muted-foreground font-semibold uppercase text-[10px]">Key ({encoding})</span>
                <span className="text-foreground truncate break-all">{keyStr}</span>
              </div>
              <div className="flex flex-col gap-1 py-1 border-b border-border/20 text-left">
                <span className="text-muted-foreground font-semibold uppercase text-[10px]">IV ({encoding})</span>
                <span className="text-foreground truncate break-all">{iv}</span>
              </div>
              {!isPlaintext && authTag && (
                <div className="flex flex-col gap-1 py-1 text-left">
                  <span className="text-muted-foreground font-semibold uppercase text-[10px]">Authentication Tag ({encoding})</span>
                  <span className="text-primary font-semibold truncate break-all">{authTag}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
