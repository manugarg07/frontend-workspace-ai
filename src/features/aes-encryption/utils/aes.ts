import {
  utf8Encode,
  utf8Decode,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  arrayBufferToHex,
  hexToArrayBuffer,
} from './encoding'

export async function generateAESKey(keySize: 128 | 192 | 256): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: keySize },
    true,
    ['encrypt', 'decrypt']
  )
}

export function generateIV(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(12))
}

export async function exportKeyRaw(key: CryptoKey): Promise<Uint8Array> {
  const exported = await window.crypto.subtle.exportKey('raw', key)
  return new Uint8Array(exported)
}

export async function deriveKeyFromPassphrase(passphrase: string, keySize: 128 | 192 | 256): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const data = encoder.encode(passphrase)
  const hash = await window.crypto.subtle.digest('SHA-256', data)
  
  // Truncate to keySize bits
  const byteLength = keySize / 8
  const keyBytes = new Uint8Array(hash).slice(0, byteLength)
  
  return await window.crypto.subtle.importKey(
    'raw',
    keyBytes as any,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  )
}

export interface EncryptionResult {
  ciphertext: string
  iv: string
  key: string
  authTag: string
  stats: {
    timeMs: number
    payloadSize: number
    encryptedSize: number
  }
}

export async function encryptAES({
  plaintext,
  rawKey,
  iv,
  keySize,
  isPassphrase = false,
  encoding = 'base64',
}: {
  plaintext: string
  rawKey: string
  iv: string
  keySize: 128 | 192 | 256
  isPassphrase?: boolean
  encoding?: 'base64' | 'hex'
}): Promise<EncryptionResult> {
  const startTime = performance.now()
  const dataBytes = utf8Encode(plaintext)
  
  // 1. Resolve key
  let cryptoKey: CryptoKey
  let keyBytes: Uint8Array
  
  if (isPassphrase) {
    if (!rawKey.trim()) {
      throw new Error('Passphrase cannot be empty')
    }
    cryptoKey = await deriveKeyFromPassphrase(rawKey, keySize)
    const exportedRaw = await window.crypto.subtle.exportKey('raw', cryptoKey)
    keyBytes = new Uint8Array(exportedRaw)
  } else {
    try {
      const buffer = encoding === 'base64' ? base64ToArrayBuffer(rawKey) : hexToArrayBuffer(rawKey)
      keyBytes = new Uint8Array(buffer)
      if (keyBytes.length !== keySize / 8) {
        throw new Error(`Key size mismatch. A ${keySize}-bit key must be exactly ${keySize / 8} bytes. Received key was ${keyBytes.length} bytes.`)
      }
      cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyBytes as any,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
      )
    } catch (err: any) {
      throw new Error(`Invalid Key input: ${err.message || 'Key must be valid base64 or hex characters and match the key length.'}`)
    }
  }

  // 2. Resolve IV
  let ivBytes: Uint8Array
  try {
    const buffer = encoding === 'base64' ? base64ToArrayBuffer(iv) : hexToArrayBuffer(iv)
    ivBytes = new Uint8Array(buffer)
    if (ivBytes.length !== 12) {
      throw new Error(`Recommended IV size for AES-GCM is 12 bytes (96 bits). Received ${ivBytes.length} bytes.`)
    }
  } catch (err: any) {
    throw new Error(`Invalid IV input: ${err.message || 'IV must be valid base64 or hex characters.'}`)
  }

  // 3. Encrypt
  let encryptedBuffer: ArrayBuffer
  try {
    encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: ivBytes as any, tagLength: 128 },
      cryptoKey,
      dataBytes as any
    )
  } catch (err: any) {
    throw new Error(`Encryption failed: ${err.message || 'Web Crypto encryption routine failed.'}`)
  }

  const encryptedBytes = new Uint8Array(encryptedBuffer)
  
  // Extract ciphertext and authentication tag
  // Web Crypto GCM returns ciphertext with the tag appended at the end
  const ciphertextBytes = encryptedBytes.slice(0, -16)
  const authTagBytes = encryptedBytes.slice(-16)

  const ciphertextStr = encoding === 'base64' ? arrayBufferToBase64(ciphertextBytes.buffer as ArrayBuffer) : arrayBufferToHex(ciphertextBytes.buffer as ArrayBuffer)
  const authTagStr = encoding === 'base64' ? arrayBufferToBase64(authTagBytes.buffer as ArrayBuffer) : arrayBufferToHex(authTagBytes.buffer as ArrayBuffer)
  const keyStr = encoding === 'base64' ? arrayBufferToBase64(keyBytes.buffer as ArrayBuffer) : arrayBufferToHex(keyBytes.buffer as ArrayBuffer)

  const endTime = performance.now()
  const timeMs = endTime - startTime

  return {
    ciphertext: ciphertextStr,
    iv: iv,
    key: keyStr,
    authTag: authTagStr,
    stats: {
      timeMs: parseFloat(timeMs.toFixed(3)),
      payloadSize: dataBytes.length,
      encryptedSize: encryptedBytes.length,
    },
  }
}

export async function decryptAES({
  ciphertext,
  rawKey,
  iv,
  authTag,
  keySize,
  isPassphrase = false,
  encoding = 'base64',
}: {
  ciphertext: string
  rawKey: string
  iv: string
  authTag?: string
  keySize: 128 | 192 | 256
  isPassphrase?: boolean
  encoding?: 'base64' | 'hex'
}): Promise<{ plaintext: string; stats: { timeMs: number } }> {
  const startTime = performance.now()

  // 1. Resolve key
  let cryptoKey: CryptoKey
  if (isPassphrase) {
    if (!rawKey.trim()) {
      throw new Error('Passphrase cannot be empty')
    }
    cryptoKey = await deriveKeyFromPassphrase(rawKey, keySize)
  } else {
    try {
      const buffer = encoding === 'base64' ? base64ToArrayBuffer(rawKey) : hexToArrayBuffer(rawKey)
      const keyBytes = new Uint8Array(buffer)
      if (keyBytes.length !== keySize / 8) {
        throw new Error(`Key size mismatch. A ${keySize}-bit key must be exactly ${keySize / 8} bytes. Received key was ${keyBytes.length} bytes.`)
      }
      cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyBytes as any,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
      )
    } catch (err: any) {
      throw new Error(`Invalid Key input: ${err.message || 'Key must be valid base64 or hex characters and match the key length.'}`)
    }
  }

  // 2. Resolve IV
  let ivBytes: Uint8Array
  try {
    const buffer = encoding === 'base64' ? base64ToArrayBuffer(iv) : hexToArrayBuffer(iv)
    ivBytes = new Uint8Array(buffer)
    if (ivBytes.length !== 12) {
      throw new Error(`Invalid IV size. Expected 12 bytes for AES-GCM. Received ${ivBytes.length} bytes.`)
    }
  } catch (err: any) {
    throw new Error(`Invalid IV input: ${err.message || 'IV must be valid base64 or hex characters.'}`)
  }

  // 3. Resolve ciphertext and authentication tag
  let combinedBytes: Uint8Array
  try {
    const cipherBuffer = encoding === 'base64' ? base64ToArrayBuffer(ciphertext) : hexToArrayBuffer(ciphertext)
    const cipherBytes = new Uint8Array(cipherBuffer)

    if (authTag && authTag.trim()) {
      const tagBuffer = encoding === 'base64' ? base64ToArrayBuffer(authTag) : hexToArrayBuffer(authTag)
      const tagBytes = new Uint8Array(tagBuffer)
      
      combinedBytes = new Uint8Array(cipherBytes.length + tagBytes.length)
      combinedBytes.set(cipherBytes)
      combinedBytes.set(tagBytes, cipherBytes.length)
    } else {
      // If tag is not provided, we assume the ciphertext contains the appended tag (Web Crypto Standard)
      combinedBytes = cipherBytes
    }
  } catch (err: any) {
    throw new Error(`Invalid encrypted payload or auth tag: ${err.message || 'Check your input encoding and syntax.'}`)
  }

  // 4. Decrypt
  let decryptedBuffer: ArrayBuffer
  try {
    decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBytes as any, tagLength: 128 },
      cryptoKey,
      combinedBytes as any
    )
  } catch (err: any) {
    throw new Error('Decryption Failed. Check that your Key, IV, Ciphertext, and Auth Tag match the parameters used to encrypt the payload.')
  }

  const plaintext = utf8Decode(decryptedBuffer)
  const endTime = performance.now()
  const timeMs = endTime - startTime

  return {
    plaintext,
    stats: {
      timeMs: parseFloat(timeMs.toFixed(3)),
    },
  }
}
