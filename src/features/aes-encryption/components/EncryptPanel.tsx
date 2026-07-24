import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'
import { KeyRound, RefreshCw, Copy, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { arrayBufferToBase64, arrayBufferToHex } from '../utils/encoding'

interface EncryptPanelProps {
  plaintext: string
  setPlaintext: (val: string) => void
  inputType: 'text' | 'json'
  setInputType: (val: 'text' | 'json') => void
  keySize: 128 | 192 | 256
  setKeySize: (size: 128 | 192 | 256) => void
  keyMode: 'raw' | 'passphrase'
  setKeyMode: (mode: 'raw' | 'passphrase') => void
  secretKey: string
  setSecretKey: (val: string) => void
  iv: string
  setIv: (val: string) => void
  encoding: 'base64' | 'hex'
  setEncoding: (enc: 'base64' | 'hex') => void
  onEncrypt: () => void
  validationError: string | null
  // Granular inline warnings
  keyValidationError: string | null
  ivValidationError: string | null
  plaintextJsonValidationError: string | null
  isEncryptDisabled: boolean
}

const EXAMPLE_JSON = `{
  "username": "john",
  "email": "john@example.com",
  "role": "admin"
}`

const EXAMPLE_TEXT = `Hello CodeStrategists! This is a secure text payload encrypted using AES-GCM entirely in the browser.`

export function EncryptPanel({
  plaintext,
  setPlaintext,
  inputType,
  setInputType,
  keySize,
  setKeySize,
  keyMode,
  setKeyMode,
  secretKey,
  setSecretKey,
  iv,
  setIv,
  encoding,
  setEncoding,
  onEncrypt,
  validationError,
  keyValidationError,
  ivValidationError,
  plaintextJsonValidationError,
  isEncryptDisabled,
}: EncryptPanelProps) {
  const { toast } = useToast()

  const loadExample = () => {
    setPlaintext(inputType === 'json' ? EXAMPLE_JSON : EXAMPLE_TEXT)
    toast('Loaded example data', 'success')
  }

  const handleClear = () => {
    setPlaintext('')
  }

  const handleGenerateKey = () => {
    if (keyMode === 'passphrase') {
      toast('Passphrase mode uses arbitrary passwords; generation is disabled.', 'info')
      return
    }
    const byteLength = keySize / 8
    const bytes = window.crypto.getRandomValues(new Uint8Array(byteLength))
    const keyStr = encoding === 'base64' ? arrayBufferToBase64(bytes.buffer) : arrayBufferToHex(bytes.buffer)
    setSecretKey(keyStr)
    toast(`Generated new ${keySize}-bit key`, 'success')
  }

  const handleGenerateIV = () => {
    const bytes = window.crypto.getRandomValues(new Uint8Array(12))
    const ivStr = encoding === 'base64' ? arrayBufferToBase64(bytes.buffer) : arrayBufferToHex(bytes.buffer)
    setIv(ivStr)
    toast('Generated new 12-byte IV', 'success')
  }

  const handleCopyKey = () => {
    if (!secretKey) return
    navigator.clipboard.writeText(secretKey)
    toast('Copied key to clipboard', 'success')
  }

  const handleCopyIV = () => {
    if (!iv) return
    navigator.clipboard.writeText(iv)
    toast('Copied IV to clipboard', 'success')
  }

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      <Card className="flex flex-col bg-card/60 border-border shadow-premium relative">
        <CardHeader className="p-4 border-b border-border/40 flex flex-row justify-between items-center bg-secondary/10">
          <div className="flex items-center gap-2">
            <CardTitle className="font-heading text-sm text-foreground uppercase tracking-wider font-semibold">
              Source Payload
            </CardTitle>
            <Badge variant="outline" className="bg-primary/5 text-primary text-[10px]">Encrypt</Badge>
          </div>
          <div className="flex bg-secondary/60 p-0.5 rounded-lg border border-border/60 text-xs font-semibold">
            <button
              onClick={() => {
                setInputType('text')
                setPlaintext('')
              }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                inputType === 'text' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Plain Text
            </button>
            <button
              onClick={() => {
                setInputType('json')
                setPlaintext('')
              }}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                inputType === 'json' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              JSON
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col gap-4">
          <div className="w-full flex flex-col gap-1.5">
            <Textarea
              placeholder={inputType === 'json' ? 'Paste valid JSON payload here...' : 'Paste plain text here...'}
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              className="flex-1 resize-y min-h-[160px] focus-ring text-xs"
              aria-label={inputType === 'json' ? 'JSON Input Area' : 'Text Input Area'}
              error={plaintextJsonValidationError || undefined}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={loadExample}>
                Load Example
              </Button>
              <Button variant="outline" size="sm" onClick={handleClear} disabled={!plaintext}>
                Clear
              </Button>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              Size: {new Blob([plaintext]).size} bytes
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Encryption Settings Card */}
      <Card className="bg-card/60 border-border shadow-premium">
        <CardHeader className="p-4 border-b border-border/40 bg-secondary/10">
          <CardTitle className="font-heading text-sm text-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
            <KeyRound className="h-4.5 w-4.5 text-primary" />
            Encryption Parameters (AES-GCM)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 flex flex-col gap-5">
          {/* Key Size selection & Algorithm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Cipher Algorithm
              </label>
              <Input value="AES-GCM (Authenticated)" disabled className="bg-secondary/25 font-mono text-xs cursor-not-allowed" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Key Bit Size
                </label>
                <Tooltip position="top" className="whitespace-normal max-w-xs text-[11px]" content="AES supports key sizes of 128, 192, or 256 bits. Larger key sizes require more computation but provide stronger resistance against brute-force attacks. 256-bit is recommended.">
                  <button type="button" className="text-muted-foreground hover:text-foreground focus:outline-none cursor-help">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </div>
              <div className="flex bg-secondary/60 p-0.5 rounded-lg border border-border/60 text-xs font-semibold w-full">
                {([128, 192, 256] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setKeySize(size)
                      setSecretKey('')
                    }}
                    className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer text-center ${
                      keySize === size ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {size} bit
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Input Mode & Secret Key */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Secret Key / Password
                </label>
                <Tooltip position="top" className="whitespace-normal max-w-xs text-[11px]" content="The secret key used to encrypt the payload. In Raw Key mode, you must input a key with the exact matching length in Hex or Base64. In Passphrase mode, you can input any password string, and a key is Derived using SHA-256.">
                  <button type="button" className="text-muted-foreground hover:text-foreground focus:outline-none cursor-help">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </div>
              <div className="flex bg-secondary/50 p-0.5 rounded-md border border-border/60 text-[10px] font-semibold">
                <button
                  onClick={() => {
                    setKeyMode('raw')
                    setSecretKey('')
                  }}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${
                    keyMode === 'raw' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Raw Key ({encoding})
                </button>
                <button
                  onClick={() => {
                    setKeyMode('passphrase')
                    setSecretKey('')
                  }}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${
                    keyMode === 'passphrase' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Passphrase
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder={keyMode === 'passphrase' ? 'Enter password to derive key...' : `Enter ${keySize / 8}-byte key in ${encoding}...`}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="font-mono text-xs flex-1 focus-ring"
                type="text"
                error={keyValidationError || undefined}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateKey}
                disabled={keyMode === 'passphrase'}
                className="shrink-0 text-xs border border-border/60 h-10 bg-card hover:bg-secondary/40"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Generate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyKey}
                disabled={!secretKey || !!keyValidationError}
                className="shrink-0 p-2.5 border border-border/60 h-10 bg-card hover:bg-secondary/40"
                aria-label="Copy Key"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            {keyMode === 'raw' && !keyValidationError && (
              <span className="text-[10px] text-muted-foreground leading-normal">
                Raw key bytes: {keySize / 8} bytes required ({encoding === 'hex' ? `${keySize / 4} hex characters` : `approx. ${Math.ceil(keySize / 6)} base64 characters`}).
              </span>
            )}
            {keyMode === 'passphrase' && !keyValidationError && (
              <span className="text-[10px] text-muted-foreground leading-normal">
                A 32-byte SHA-256 hash is computed from this string, then truncated to {keySize / 8} bytes to derive the key.
              </span>
            )}
          </div>

          {/* IV / Nonce & Output Encoding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 text-left">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  IV / Nonce (12-byte)
                </label>
                <Tooltip position="top" className="whitespace-normal max-w-xs text-[11px]" content="Initialization Vector. A random value combined with the key to encrypt the payload. Crucial for AES-GCM: reuse of a Key + IV pair completely destroys GCM security. Generates 12 random bytes (96 bits) for GCM standard.">
                  <button type="button" className="text-muted-foreground hover:text-foreground focus:outline-none cursor-help">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={`12-byte IV in ${encoding}...`}
                  value={iv}
                  onChange={(e) => setIv(e.target.value)}
                  className="font-mono text-xs flex-1 focus-ring"
                  error={ivValidationError || undefined}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateIV}
                  className="shrink-0 text-xs border border-border/60 h-10 bg-card hover:bg-secondary/40"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Generate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyIV}
                  disabled={!iv || !!ivValidationError}
                  className="shrink-0 p-2.5 border border-border/60 h-10 bg-card hover:bg-secondary/40"
                  aria-label="Copy IV"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Output Encoding
                </label>
                <Tooltip position="top" className="whitespace-normal max-w-xs text-[11px]" content="Choose the string encoding format for the binary output. Base64 is standard for web payloads, while Hex (hexadecimal) is standard for low-level diagnostics.">
                  <button type="button" className="text-muted-foreground hover:text-foreground focus:outline-none cursor-help">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </div>
              <div className="flex bg-secondary/60 p-0.5 rounded-lg border border-border/60 text-xs font-semibold h-10 items-center">
                <button
                  onClick={() => {
                    setEncoding('base64')
                    setSecretKey('')
                    setIv('')
                  }}
                  className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer text-center ${
                    encoding === 'base64' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Base64
                </button>
                <button
                  onClick={() => {
                    setEncoding('hex')
                    setSecretKey('')
                    setIv('')
                  }}
                  className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer text-center ${
                    encoding === 'hex' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Hex
                </button>
              </div>
            </div>
          </div>

          {validationError && (
            <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs font-mono flex items-start gap-2.5">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={onEncrypt}
            disabled={isEncryptDisabled}
            className="w-full h-11 text-sm font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md group mt-1"
          >
            <Sparkles className="h-4.5 w-4.5 mr-2 group-hover:scale-110 transition-transform" />
            Encrypt Payload
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
