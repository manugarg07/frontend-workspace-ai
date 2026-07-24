import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'
import { KeyRound, ShieldAlert, Unlock, HelpCircle, FileJson } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface DecryptPanelProps {
  ciphertext: string
  setCiphertext: (val: string) => void
  secretKey: string
  setSecretKey: (val: string) => void
  keySize: 128 | 192 | 256
  setKeySize: (size: 128 | 192 | 256) => void
  keyMode: 'raw' | 'passphrase'
  setKeyMode: (mode: 'raw' | 'passphrase') => void
  iv: string
  setIv: (val: string) => void
  authTag: string
  setAuthTag: (val: string) => void
  encoding: 'base64' | 'hex'
  setEncoding: (enc: 'base64' | 'hex') => void
  onDecrypt: () => void
  validationError: string | null
  // Granular inline warnings
  keyValidationError: string | null
  ivValidationError: string | null
  ciphertextValidationError: string | null
  tagValidationError: string | null
  isDecryptDisabled: boolean
  onImportJSON: (jsonText: string) => void
}

export function DecryptPanel({
  ciphertext,
  setCiphertext,
  secretKey,
  setSecretKey,
  keySize,
  setKeySize,
  keyMode,
  setKeyMode,
  iv,
  setIv,
  authTag,
  setAuthTag,
  encoding,
  setEncoding,
  onDecrypt,
  validationError,
  keyValidationError,
  ivValidationError,
  ciphertextValidationError,
  tagValidationError,
  isDecryptDisabled,
  onImportJSON,
}: DecryptPanelProps) {
  const { toast } = useToast()

  const handleClear = () => {
    setCiphertext('')
  }

  const handlePasteJSON = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onImportJSON(text)
    } catch {
      // Fallback if clipboard permission is denied
      const text = prompt('Paste your encrypted parameters JSON here:')
      if (text) {
        onImportJSON(text)
      } else {
        toast('Clipboard read blocked. Please input JSON manually.', 'error')
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      <Card className="flex flex-col bg-card/60 border-border shadow-premium relative">
        <CardHeader className="p-4 border-b border-border/40 flex flex-row justify-between items-center bg-secondary/10">
          <div className="flex items-center gap-2">
            <CardTitle className="font-heading text-sm text-foreground uppercase tracking-wider font-semibold">
              Encrypted Payload
            </CardTitle>
            <Badge variant="outline" className="bg-primary/5 text-primary text-[10px]">Decrypt</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold px-2 gap-1 border border-border/60 bg-card hover:bg-secondary/40"
              onClick={handlePasteJSON}
            >
              <FileJson className="h-3.5 w-3.5 text-primary" />
              <span>Paste JSON</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleClear} disabled={!ciphertext}>
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col gap-4">
          <div className="w-full flex flex-col gap-1.5">
            <Textarea
              placeholder="Paste your encrypted ciphertext payload here..."
              value={ciphertext}
              onChange={(e) => setCiphertext(e.target.value)}
              className="flex-1 resize-y min-h-[160px] focus-ring text-xs"
              aria-label="Ciphertext Input Area"
              error={ciphertextValidationError || undefined}
            />
          </div>
          <div className="flex justify-end text-[10px] text-muted-foreground font-mono">
            Size: {ciphertext.replace(/\s+/g, '').length} chars
          </div>
        </CardContent>
      </Card>

      {/* Decryption Settings Card */}
      <Card className="bg-card/60 border-border shadow-premium">
        <CardHeader className="p-4 border-b border-border/40 bg-secondary/10">
          <CardTitle className="font-heading text-sm text-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
            <KeyRound className="h-4.5 w-4.5 text-primary" />
            Decryption Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 flex flex-col gap-5">
          {/* Key Size selection & Algorithm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Cipher Algorithm
              </label>
              <Input value="AES-GCM" disabled className="bg-secondary/25 font-mono text-xs cursor-not-allowed" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Key Bit Size
                </label>
                <Tooltip position="top" className="whitespace-normal max-w-xs text-[11px]" content="The bit size of the symmetric key. For decryption, this MUST match the key size (128, 192, or 256 bits) that was selected when encrypting the data.">
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

          {/* Key Configuration & Secret Key */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Secret Key / Password
                </label>
                <Tooltip position="top" className="whitespace-normal max-w-xs text-[11px]" content="The symmetric key used to decrypt the payload. Choose Raw Key to input base64/hex bytes directly, or Passphrase to input the plaintext password used for key derivation.">
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

            <Input
              placeholder={keyMode === 'passphrase' ? 'Enter password...' : `Enter ${keySize / 8}-byte key in ${encoding}...`}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="font-mono text-xs focus-ring"
              error={keyValidationError || undefined}
            />
          </div>

          {/* IV / Nonce & Encoding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 text-left">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  IV / Nonce (12-byte)
                </label>
                <Tooltip position="top" className="whitespace-normal max-w-xs text-[11px]" content="The exact 12-byte Initialization Vector (IV) that was used during encryption. Under GCM mode, GCM decryption will fail if the IV is modified by even a single bit.">
                  <button type="button" className="text-muted-foreground hover:text-foreground focus:outline-none cursor-help">
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </div>
              <Input
                placeholder={`12-byte IV in ${encoding}...`}
                value={iv}
                onChange={(e) => setIv(e.target.value)}
                className="font-mono text-xs focus-ring"
                error={ivValidationError || undefined}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Input Payload Encoding
                </label>
                <Tooltip position="top" className="whitespace-normal max-w-xs text-[11px]" content="The string encoding of the inputs (ciphertext, key, IV, tag). Must match the encoding selected during encryption.">
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
                    setAuthTag('')
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
                    setAuthTag('')
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

          {/* Authentication Tag */}
          <div className="flex flex-col gap-2 text-left">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Authentication Tag (16-byte)
              </label>
              <Tooltip position="top" className="whitespace-normal max-w-xs text-[11px]" content="Galois message authentication code. Required for AES-GCM decryption: it ensures the ciphertext was not tampered with. If the tag was appended to the ciphertext (standard), leave this blank.">
                <button type="button" className="text-muted-foreground hover:text-foreground focus:outline-none cursor-help">
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            </div>
            <Input
              placeholder={`Optional: 16-byte tag in ${encoding} (leave blank if tag is appended to ciphertext)`}
              value={authTag}
              onChange={(e) => setAuthTag(e.target.value)}
              className="font-mono text-xs focus-ring"
              error={tagValidationError || undefined}
            />
          </div>

          {validationError && (
            <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs font-mono flex items-start gap-2.5">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={onDecrypt}
            disabled={isDecryptDisabled}
            className="w-full h-11 text-sm font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md group mt-1"
          >
            <Unlock className="h-4.5 w-4.5 mr-2 group-hover:scale-110 transition-transform" />
            Decrypt Payload
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
