import React from 'react'
import { Accordion } from '@/components/ui/Accordion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { HelpCircle } from 'lucide-react'

export function FAQ() {
  const faqItems = [
    {
      id: 'faq-gcm-vs-cbc',
      title: 'Why is AES-GCM preferred over AES-CBC?',
      content: (
        <p>
          AES-GCM (Galois/Counter Mode) is an <strong>authenticated encryption</strong> algorithm (AEAD). It provides both confidentiality (encryption) and data integrity (authentication tag verification). AES-CBC, on the other hand, only provides confidentiality and is vulnerable to padding oracle attacks unless combined with a separate MAC (like HMAC-SHA-256) in an Encrypt-then-MAC scheme. GCM is faster, more secure, and prevents tampering.
        </p>
      ),
    },
    {
      id: 'faq-iv-size',
      title: 'Why is the IV size exactly 12 bytes (96 bits) for AES-GCM?',
      content: (
        <p>
          While AES-GCM allows IVs of different sizes, the cryptographic standard recommends exactly <strong>12 bytes (96 bits)</strong>. For 12-byte IVs, GCM uses a direct mapping to the internal counter block, bypassing the GHASH function. Using other IV sizes invokes GHASH, increasing CPU execution cycles and opening subtle security vulnerabilities.
        </p>
      ),
    },
    {
      id: 'faq-local-security',
      title: 'Is it safe to encrypt corporate payloads or credentials here?',
      content: (
        <p>
          Yes. All encryption and decryption operations run 100% locally in your browser's execution engine via the native <strong>Web Crypto API</strong>. The keys, plaintext, and ciphertext are stored only in volatile RAM variables. No network requests are made, ensuring zero data leakage to external servers.
        </p>
      ),
    },
    {
      id: 'faq-key-derivation',
      title: 'How does the Passphrase Key Mode work?',
      content: (
        <p>
          Cryptographic keys must have specific lengths (16, 24, or 32 bytes). In Passphrase Mode, the tool runs your password through the <strong>SHA-256</strong> hashing algorithm, generating a 32-byte hash. This hash is then truncated or padded to match the selected key size (128, 192, or 256 bits) and imported as a CryptoKey.
        </p>
      ),
    },
    {
      id: 'faq-node-compat',
      title: 'How do I decrypt this payload in a Node.js backend?',
      content: (
        <p>
          You can decrypt the payload in Node.js using the built-in <code>crypto</code> module. You must pass the Key, IV, ciphertext, and the 16-byte Authentication Tag. See the <strong>Code Examples</strong> panel below for a production-ready Node.js code template.
        </p>
      ),
    },
  ]

  return (
    <Card className="border-border bg-card/60 overflow-hidden font-sans">
      <CardHeader className="border-b border-border/40 bg-secondary/10 pb-4">
        <CardTitle as="h3" className="font-heading text-base sm:text-lg flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Accordion items={faqItems} allowMultiple={false} />
      </CardContent>
    </Card>
  )
}
