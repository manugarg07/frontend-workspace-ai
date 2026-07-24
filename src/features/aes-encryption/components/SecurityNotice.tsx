import React from 'react'
import { ShieldAlert, ServerOff, EyeOff, KeyRound, WifiOff, HelpCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export function SecurityNotice() {
  const securityItems = [
    {
      icon: <WifiOff className="h-5 w-5 text-emerald-500" />,
      title: '100% Offline Processing',
      description: 'All operations are handled instantly in your browser sandbox using the Web Crypto API. No data leaves your machine.',
    },
    {
      icon: <ServerOff className="h-5 w-5 text-emerald-500" />,
      title: 'Zero Server Telemetry',
      description: 'We do not run backend encryption/decryption APIs. There are no remote logs, databases, or analytics tracking your text payloads.',
    },
    {
      icon: <KeyRound className="h-5 w-5 text-emerald-500" />,
      title: 'Keys Never Stored',
      description: 'Your AES passwords and keys are stored strictly in ephemeral component state variables and are flushed on reload.',
    },
    {
      icon: <EyeOff className="h-5 w-5 text-emerald-500" />,
      title: 'Zero Leakage Guarantee',
      description: 'No tracker analytics are configured to scrape input or output data. Safe for database passwords, credentials, and API payloads.',
    },
  ]

  return (
    <div className="flex flex-col gap-6 font-sans">
      <Card className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10 shadow-premium overflow-hidden">
        <div className="border-b border-emerald-500/10 bg-emerald-500/10 px-4 py-3 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300 font-heading">
            Security & Privacy Assured
          </span>
        </div>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityItems.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground/90">{item.title}</span>
                  <span className="text-xs text-muted-foreground leading-normal mt-0.5">{item.description}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cryptographic Primer Card */}
      <Card className="border-border bg-card/60 shadow-premium overflow-hidden text-left">
        <div className="border-b border-border/40 bg-secondary/10 px-4 py-3 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-foreground font-heading">
            AES-GCM Cryptographic Architecture
          </span>
        </div>
        <CardContent className="p-5 flex flex-col gap-4 text-xs text-muted-foreground leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <span className="font-bold text-foreground font-heading text-sm">What is AES-GCM?</span>
              <p>
                Advanced Encryption Standard in Galois/Counter Mode (AES-GCM) is an <strong>Authenticated Encryption with Associated Data (AEAD)</strong> cipher. Unlike legacy block modes (like CBC), GCM encrypts data for confidentiality while simultaneously computing a Galois message authentication code (GMAC).
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-bold text-foreground font-heading text-sm">Why the Authentication Tag Matters</span>
              <p>
                The 16-byte authentication tag provides cryptographic **integrity**. During decryption, the Web Crypto engine re-computes the tag over the ciphertext and IV. If even a single bit of the encrypted payload was altered in transit, decryption immediately aborts. This blocks padding oracle and malicious bit-flipping attacks.
              </p>
            </div>
          </div>

          <hr className="border-border/40 my-1" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <span className="font-bold text-foreground font-heading text-sm">The Role of IV / Nonce</span>
              <p>
                The Initialization Vector (IV) is a number that must be unique for each encryption session. In GCM, the standard IV length is 96 bits (12 bytes). It ensures that encrypting the same text twice with the same key yields entirely different ciphertext strings.
              </p>
            </div>
            <div className="flex flex-col gap-2 bg-destructive/5 dark:bg-destructive/10 border border-destructive/15 p-3 rounded-xl">
              <span className="font-bold text-destructive font-heading text-sm flex items-center gap-1.5">
                CRITICAL: The Danger of IV Reuse
              </span>
              <p className="text-foreground/80">
                <strong>Never reuse a Key + IV pair under GCM.</strong> If two payloads are encrypted using the same key and IV, GCM counter blocks match. An attacker can XOR the ciphertexts to reconstruct the difference stream, recovering the cleartext of both payloads and compromising the integrity key.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
export default SecurityNotice
