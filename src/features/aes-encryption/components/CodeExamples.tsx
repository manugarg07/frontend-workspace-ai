import React, { useState } from 'react'
import { Code2, Clipboard, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface CodeExamplesProps {
  keySize: 128 | 192 | 256
  encoding: 'base64' | 'hex'
}

export function CodeExamples({ keySize, encoding }: CodeExamplesProps) {
  const { toast } = useToast()
  const [activeCodeTab, setActiveCodeTab] = useState<'webcrypto' | 'nodejs'>('webcrypto')
  const [activeActionTab, setActiveActionTab] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [copied, setCopied] = useState(false)

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast('Code copied to clipboard!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const isHex = encoding === 'hex'

  const webcryptoEncryptCode = isHex
    ? `/**
 * Encrypts plain text using AES-GCM (Hex key/IV inputs)
 * @param {string} plaintext - Text or JSON payload to encrypt
 * @param {string} rawKeyHex - Hex encoded AES key (${keySize}-bit / ${keySize / 8} bytes)
 * @param {string} ivHex - Hex encoded 12-byte IV/Nonce
 */
async function encryptAESGCM(plaintext, rawKeyHex, ivHex) {
  // Convert Hex string keys and IVs to Uint8Arrays
  const keyBytes = new Uint8Array(rawKeyHex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
  const ivBytes = new Uint8Array(ivHex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
  
  // Encode plaintext string to Uint8Array
  const dataBytes = new TextEncoder().encode(plaintext);
  
  // Import raw key bytes as CryptoKey
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  // Encrypt the payload
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivBytes, tagLength: 128 },
    cryptoKey,
    dataBytes
  );
  
  // Web Crypto GCM outputs ciphertext with the tag appended at the end
  const encryptedBytes = new Uint8Array(encrypted);
  const ciphertextBytes = encryptedBytes.slice(0, -16);
  const authTagBytes = encryptedBytes.slice(-16);
  
  // Convert buffers back to Hex strings
  const toHex = (buf) => Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return {
    ciphertext: toHex(ciphertextBytes),
    authTag: toHex(authTagBytes)
  };
}`
    : `/**
 * Encrypts plain text using AES-GCM (Base64 key/IV inputs)
 * @param {string} plaintext - Text or JSON payload to encrypt
 * @param {string} rawKeyBase64 - Base64 encoded AES key (${keySize}-bit / ${keySize / 8} bytes)
 * @param {string} ivBase64 - Base64 encoded 12-byte IV/Nonce
 */
async function encryptAESGCM(plaintext, rawKeyBase64, ivBase64) {
  // Helper to convert Base64 string to Uint8Array
  const fromBase64 = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  
  const keyBytes = fromBase64(rawKeyBase64);
  const ivBytes = fromBase64(ivBase64);
  const dataBytes = new TextEncoder().encode(plaintext);
  
  // Import raw key bytes as CryptoKey
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  // Encrypt the payload
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivBytes, tagLength: 128 },
    cryptoKey,
    dataBytes
  );
  
  // Web Crypto GCM outputs ciphertext with the tag appended at the end
  const encryptedBytes = new Uint8Array(encrypted);
  const ciphertextBytes = encryptedBytes.slice(0, -16);
  const authTagBytes = encryptedBytes.slice(-16);
  
  // Helper to convert Uint8Array to Base64
  const toBase64 = (buf) => btoa(String.fromCharCode(...buf));
  
  return {
    ciphertext: toBase64(ciphertextBytes),
    authTag: toBase64(authTagBytes)
  };
}`

  const webcryptoDecryptCode = isHex
    ? `/**
 * Decrypts AES-GCM ciphertext payloads (Hex inputs)
 * @param {string} ciphertextHex - Hex encoded encrypted ciphertext (without auth tag)
 * @param {string} rawKeyHex - Hex encoded AES key (${keySize}-bit / ${keySize / 8} bytes)
 * @param {string} ivHex - Hex encoded 12-byte IV
 * @param {string} authTagHex - Hex encoded 16-byte authentication tag
 */
async function decryptAESGCM(ciphertextHex, rawKeyHex, ivHex, authTagHex) {
  const fromHex = (hex) => new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
  
  const keyBytes = fromHex(rawKeyHex);
  const ivBytes = fromHex(ivHex);
  const cipherBytes = fromHex(ciphertextHex);
  const tagBytes = fromHex(authTagHex);
  
  // Combine ciphertext and tag (Web Crypto expects them concatenated)
  const combinedBytes = new Uint8Array(cipherBytes.length + tagBytes.length);
  combinedBytes.set(cipherBytes);
  combinedBytes.set(tagBytes, cipherBytes.length);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes, tagLength: 128 },
    cryptoKey,
    combinedBytes
  );
  
  return new TextDecoder().decode(decrypted);
}`
    : `/**
 * Decrypts AES-GCM ciphertext payloads (Base64 inputs)
 * @param {string} ciphertextBase64 - Base64 encoded encrypted ciphertext (without auth tag)
 * @param {string} rawKeyBase64 - Base64 encoded AES key (${keySize}-bit / ${keySize / 8} bytes)
 * @param {string} ivBase64 - Base64 encoded 12-byte IV
 * @param {string} authTagBase64 - Base64 encoded 16-byte authentication tag
 */
async function decryptAESGCM(ciphertextBase64, rawKeyBase64, ivBase64, authTagBase64) {
  const fromBase64 = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  
  const keyBytes = fromBase64(rawKeyBase64);
  const ivBytes = fromBase64(ivBase64);
  const cipherBytes = fromBase64(ciphertextBase64);
  const tagBytes = fromBase64(authTagBase64);
  
  // Combine ciphertext and tag (Web Crypto expects them concatenated)
  const combinedBytes = new Uint8Array(cipherBytes.length + tagBytes.length);
  combinedBytes.set(cipherBytes);
  combinedBytes.set(tagBytes, cipherBytes.length);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes, tagLength: 128 },
    cryptoKey,
    combinedBytes
  );
  
  return new TextDecoder().decode(decrypted);
}`

  const nodeEncryptCode = isHex
    ? `const crypto = require('crypto');

/**
 * Encrypts plain text in Node.js using AES-GCM (Hex inputs)
 */
function encryptAESGCM(plaintext, rawKeyHex, ivHex) {
  const key = Buffer.from(rawKeyHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  
  // Create cipher instance
  const cipher = crypto.createCipheriv('aes-${keySize}-gcm', key, iv);
  
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  
  // Extract 16-byte authentication tag
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    ciphertext,
    authTag
  };
}`
    : `const crypto = require('crypto');

/**
 * Encrypts plain text in Node.js using AES-GCM (Base64 inputs)
 */
function encryptAESGCM(plaintext, rawKeyBase64, ivBase64) {
  const key = Buffer.from(rawKeyBase64, 'base64');
  const iv = Buffer.from(ivBase64, 'base64');
  
  // Create cipher instance
  const cipher = crypto.createCipheriv('aes-${keySize}-gcm', key, iv);
  
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');
  
  // Extract 16-byte authentication tag
  const authTag = cipher.getAuthTag().toString('base64');
  
  return {
    ciphertext,
    authTag
  };
}`

  const nodeDecryptCode = isHex
    ? `const crypto = require('crypto');

/**
 * Decrypts AES-GCM ciphertext in Node.js (Hex inputs)
 */
function decryptAESGCM(ciphertextHex, rawKeyHex, ivHex, authTagHex) {
  const key = Buffer.from(rawKeyHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-${keySize}-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let plaintext = decipher.update(ciphertext, 'binary', 'utf8');
  plaintext += decipher.final('utf8');
  
  return plaintext;
}`
    : `const crypto = require('crypto');

/**
 * Decrypts AES-GCM ciphertext in Node.js (Base64 inputs)
 */
function decryptAESGCM(ciphertextBase64, rawKeyBase64, ivBase64, authTagBase64) {
  const key = Buffer.from(rawKeyBase64, 'base64');
  const iv = Buffer.from(ivBase64, 'base64');
  const ciphertext = Buffer.from(ciphertextBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');
  
  const decipher = crypto.createDecipheriv('aes-${keySize}-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let plaintext = decipher.update(ciphertext, 'binary', 'utf8');
  plaintext += decipher.final('utf8');
  
  return plaintext;
}`

  const activeCode =
    activeActionTab === 'encrypt'
      ? activeCodeTab === 'webcrypto'
        ? webcryptoEncryptCode
        : nodeEncryptCode
      : activeCodeTab === 'webcrypto'
      ? webcryptoDecryptCode
      : nodeDecryptCode

  return (
    <Card className="border-border bg-card/60 overflow-hidden font-sans">
      <CardHeader className="border-b border-border/40 bg-secondary/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle as="h3" className="font-heading text-base sm:text-lg flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            Production Code Generator
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Ready-to-use functions corresponding to your configurations
          </p>
        </div>

        {/* Code/Action toggles */}
        <div className="flex gap-2">
          <div className="flex bg-secondary/60 p-0.5 rounded-lg border border-border/60 text-xs font-semibold">
            <button
              onClick={() => setActiveActionTab('encrypt')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeActionTab === 'encrypt' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Encrypt
            </button>
            <button
              onClick={() => setActiveActionTab('decrypt')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeActionTab === 'decrypt' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Decrypt
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 text-left">
        {/* Environment tab list */}
        <div className="border-b border-border/40 bg-secondary/20 px-4 py-2 flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveCodeTab('webcrypto')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeCodeTab === 'webcrypto' ? 'bg-card text-foreground border border-border/60 shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Web Crypto API (Browser)
            </button>
            <button
              onClick={() => setActiveCodeTab('nodejs')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeCodeTab === 'nodejs' ? 'bg-card text-foreground border border-border/60 shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Node.js Crypto
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(activeCode)}
            className="h-8 text-xs gap-1.5 border border-border/60 bg-card hover:bg-secondary/40"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </Button>
        </div>

        {/* Code display area */}
        <div className="p-4 bg-black/40 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed select-text min-h-[250px] max-h-[400px]">
          <code className="text-foreground/90">{activeCode}</code>
        </div>
      </CardContent>
    </Card>
  )
}
