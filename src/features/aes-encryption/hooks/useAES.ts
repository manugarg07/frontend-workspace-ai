import { useState, useCallback, useMemo, useEffect } from 'react'
import { encryptAES, decryptAES } from '../utils/aes'
import { validateBase64, validateHex, isValidJson } from '../utils/validation'
import { base64ToArrayBuffer, hexToArrayBuffer } from '../utils/encoding'
import { useToast } from '@/components/ui/Toast'

export function useAES() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt'>('encrypt')

  // Shared / settings parameters
  const [keySize, setKeySize] = useState<128 | 192 | 256>(256)
  const [keyMode, setKeyMode] = useState<'raw' | 'passphrase'>('raw')
  const [secretKey, setSecretKey] = useState('')
  const [iv, setIv] = useState('')
  const [encoding, setEncoding] = useState<'base64' | 'hex'>('base64')

  // Encryption states
  const [plaintext, setPlaintext] = useState('')
  const [inputType, setInputType] = useState<'text' | 'json'>('text')
  const [encryptOutput, setEncryptOutput] = useState('')
  const [authTag, setAuthTag] = useState('')
  const [encryptStats, setEncryptStats] = useState<{
    timeMs: number
    payloadSize: number
    encryptedSize: number
  } | null>(null)

  // Decryption states
  const [ciphertext, setCiphertext] = useState('')
  const [separateAuthTag, setSeparateAuthTag] = useState('')
  const [decryptOutput, setDecryptOutput] = useState('')
  const [decryptStats, setDecryptStats] = useState<{
    timeMs: number
    payloadSize?: number
  } | null>(null)

  // Feedback states
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Clean success/error notifications on tab change
  const handleTabChange = useCallback((tab: 'encrypt' | 'decrypt') => {
    setActiveTab(tab)
    setError(null)
    setSuccessMessage(null)
  }, [])

  // Reset Everything
  const handleReset = useCallback(() => {
    setSecretKey('')
    setIv('')
    setPlaintext('')
    setCiphertext('')
    setSeparateAuthTag('')
    setEncryptOutput('')
    setAuthTag('')
    setDecryptOutput('')
    setEncryptStats(null)
    setDecryptStats(null)
    setError(null)
    setSuccessMessage(null)
  }, [])

  // Auto-validation for Key
  const keyValidationError = useMemo(() => {
    const trimmedKey = secretKey.trim()
    if (!trimmedKey) return null

    if (keyMode === 'raw') {
      if (encoding === 'hex') {
        if (!/^[0-9a-fA-F]*$/.test(trimmedKey)) {
          return 'Key contains invalid characters. Hex keys must only contain 0-9 and A-F.'
        }
        const expectedLen = keySize / 4
        if (trimmedKey.length !== expectedLen) {
          return `Hex key length is incorrect. A ${keySize}-bit key must be exactly ${expectedLen} characters (currently ${trimmedKey.length}).`
        }
      } else {
        // Base64 validation
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(trimmedKey)) {
          return 'Key contains invalid characters. Base64 keys must only contain alphanumeric characters, + and /.'
        }
        try {
          const buf = base64ToArrayBuffer(trimmedKey)
          const expectedBytes = keySize / 8
          if (buf.byteLength !== expectedBytes) {
            return `Base64 key length is incorrect. A ${keySize}-bit key must decode to exactly ${expectedBytes} bytes (currently decodes to ${buf.byteLength} bytes).`
          }
        } catch {
          return 'Key is not a valid Base64 string.'
        }
      }
    } else {
      // Passphrase checks
      if (trimmedKey.length < 1) {
        return 'Passphrase cannot be empty.'
      }
    }
    return null
  }, [secretKey, keyMode, keySize, encoding])

  // Auto-validation for IV
  const ivValidationError = useMemo(() => {
    const trimmedIv = iv.trim()
    if (!trimmedIv) return null

    if (encoding === 'hex') {
      if (!/^[0-9a-fA-F]*$/.test(trimmedIv)) {
        return 'IV contains invalid characters. Hex IVs must only contain 0-9 and A-F.'
      }
      if (trimmedIv.length !== 24) {
        return `Hex IV length is incorrect. AES-GCM IV must be exactly 24 characters (12 bytes) (currently ${trimmedIv.length}).`
      }
    } else {
      // Base64 validation
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(trimmedIv)) {
        return 'IV contains invalid characters. Base64 IVs must only contain alphanumeric characters, + and /.'
      }
      try {
        const buf = base64ToArrayBuffer(trimmedIv)
        if (buf.byteLength !== 12) {
          return `Base64 IV length is incorrect. AES-GCM IV must decode to exactly 12 bytes (currently decodes to ${buf.byteLength} bytes).`
        }
      } catch {
        return 'IV is not a valid Base64 string.'
      }
    }
    return null
  }, [iv, encoding])

  // Auto-validation for Ciphertext
  const ciphertextValidationError = useMemo(() => {
    const trimmedCipher = ciphertext.replace(/\s+/g, '')
    if (!trimmedCipher) return null

    if (encoding === 'hex') {
      if (!/^[0-9a-fA-F]*$/.test(trimmedCipher)) {
        return 'Ciphertext contains invalid characters. Hex input must only contain 0-9 and A-F.'
      }
      if (trimmedCipher.length % 2 !== 0) {
        return 'Hex ciphertext must have an even number of characters.'
      }
    } else {
      // Base64 validation
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(trimmedCipher)) {
        return 'Ciphertext contains invalid characters. Base64 input must only contain alphanumeric characters, + and /.'
      }
      try {
        window.atob(trimmedCipher)
      } catch {
        return 'Ciphertext is not a valid Base64 string.'
      }
    }
    return null
  }, [ciphertext, encoding])

  // Auto-validation for Separate Authentication Tag
  const tagValidationError = useMemo(() => {
    const trimmedTag = separateAuthTag.trim()
    if (!trimmedTag) return null

    if (encoding === 'hex') {
      if (!/^[0-9a-fA-F]*$/.test(trimmedTag)) {
        return 'Tag contains invalid characters. Hex tags must only contain 0-9 and A-F.'
      }
      if (trimmedTag.length !== 32) {
        return `Hex tag length is incorrect. Tag must be exactly 32 characters (16 bytes) (currently ${trimmedTag.length}).`
      }
    } else {
      // Base64 validation
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(trimmedTag)) {
        return 'Tag contains invalid characters. Base64 tags must only contain alphanumeric characters, + and /.'
      }
      try {
        const buf = base64ToArrayBuffer(trimmedTag)
        if (buf.byteLength !== 16) {
          return `Base64 tag length is incorrect. Tag must decode to exactly 16 bytes (currently decodes to ${buf.byteLength} bytes).`
        }
      } catch {
        return 'Tag is not a valid Base64 string.'
      }
    }
    return null
  }, [separateAuthTag, encoding])

  // Check if plaintext JSON is valid
  const plaintextJsonValidationError = useMemo(() => {
    if (inputType !== 'json' || !plaintext.trim()) return null
    try {
      JSON.parse(plaintext)
      return null
    } catch (err: any) {
      return `Invalid JSON: ${err.message || 'Malformed brackets or quotes'}`
    }
  }, [plaintext, inputType])

  // Disable triggers
  const isEncryptDisabled = useMemo(() => {
    return (
      !plaintext.trim() ||
      !secretKey.trim() ||
      !iv.trim() ||
      !!keyValidationError ||
      !!ivValidationError ||
      !!plaintextJsonValidationError
    )
  }, [plaintext, secretKey, iv, keyValidationError, ivValidationError, plaintextJsonValidationError])

  const isDecryptDisabled = useMemo(() => {
    return (
      !ciphertext.trim() ||
      !secretKey.trim() ||
      !iv.trim() ||
      !!ciphertextValidationError ||
      !!keyValidationError ||
      !!ivValidationError ||
      !!tagValidationError
    )
  }, [ciphertext, secretKey, iv, ciphertextValidationError, keyValidationError, ivValidationError, tagValidationError])

  // Execute Encryption
  const handleEncrypt = useCallback(async () => {
    setError(null)
    setSuccessMessage(null)
    setEncryptOutput('')
    setAuthTag('')
    setEncryptStats(null)

    if (isEncryptDisabled) {
      setError('Please correct validation warnings before encrypting.')
      return
    }

    try {
      const res = await encryptAES({
        plaintext,
        rawKey: secretKey.trim(),
        iv: iv.trim(),
        keySize,
        isPassphrase: keyMode === 'passphrase',
        encoding,
      })

      setEncryptOutput(res.ciphertext)
      setAuthTag(res.authTag)
      setEncryptStats(res.stats)
      setSuccessMessage('Encryption Successful')
    } catch (err: any) {
      setError(err.message || 'Encryption failed.')
    }
  }, [plaintext, secretKey, iv, keySize, keyMode, encoding, isEncryptDisabled])

  // Execute Decryption
  const handleDecrypt = useCallback(async () => {
    setError(null)
    setSuccessMessage(null)
    setDecryptOutput('')
    setDecryptStats(null)

    if (isDecryptDisabled) {
      setError('Please correct validation warnings before decrypting.')
      return
    }

    try {
      const res = await decryptAES({
        ciphertext: ciphertext.replace(/\s+/g, ''),
        rawKey: secretKey.trim(),
        iv: iv.trim(),
        authTag: separateAuthTag.trim() || undefined,
        keySize,
        isPassphrase: keyMode === 'passphrase',
        encoding,
      })

      setDecryptOutput(res.plaintext)
      setDecryptStats({
        timeMs: res.stats.timeMs,
        payloadSize: new TextEncoder().encode(res.plaintext).length,
      })
      setSuccessMessage('Payload Successfully Decrypted')
    } catch (err: any) {
      setError(err.message || 'Decryption failed.')
    }
  }, [ciphertext, secretKey, iv, separateAuthTag, keySize, keyMode, encoding, isDecryptDisabled])

  // Auto-transfer encrypted payload to Decrypt panel
  const handleAutoTransfer = useCallback(() => {
    if (!encryptOutput) return

    setCiphertext(encryptOutput)
    setSeparateAuthTag(authTag)
    setPlaintext('') // Optional: clear plaintext
    handleTabChange('decrypt')
    setSuccessMessage(null)
    setError(null)
  }, [encryptOutput, authTag, handleTabChange])

  // Import JSON payload
  const handleImportJSON = useCallback((jsonText: string) => {
    setError(null)
    setSuccessMessage(null)

    if (!jsonText.trim()) {
      setError('Import JSON cannot be empty.')
      return
    }

    try {
      const data = JSON.parse(jsonText)
      
      // Validation checks
      if (!data.ciphertext) {
        setError('Import failed: Missing "ciphertext" parameter.')
        return
      }

      // Check algorithm
      if (data.algorithm && data.algorithm !== 'AES-GCM') {
        toast(`Warning: Expected AES-GCM algorithm, found ${data.algorithm}. Cryptography will execute as AES-GCM.`, 'info')
      }

      // Resolve key size
      if (data.keySize && [128, 192, 256].includes(Number(data.keySize))) {
        setKeySize(Number(data.keySize) as 128 | 192 | 256)
      }

      // Resolve encoding
      if (data.encoding) {
        const enc = data.encoding.toLowerCase()
        if (enc === 'hex' || enc === 'base64') {
          setEncoding(enc as 'hex' | 'base64')
        } else {
          setError(`Import failed: Unsupported encoding format "${data.encoding}". Use Base64 or Hex.`)
          return
        }
      }

      // Populate states
      setCiphertext(data.ciphertext)
      if (data.key) setSecretKey(data.key)
      if (data.iv) setIv(data.iv)
      if (data.tag || data.authTag) setSeparateAuthTag(data.tag || data.authTag)
      
      setKeyMode('raw') // Assume raw imported key
      setActiveTab('decrypt')
      
    } catch {
      setError('Malformed JSON format. Please verify braces, quotes, and commas.')
    }
  }, [])

  return {
    activeTab,
    handleTabChange,
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
    plaintext,
    setPlaintext,
    inputType,
    setInputType,
    ciphertext,
    setCiphertext,
    separateAuthTag,
    setSeparateAuthTag,
    encryptOutput,
    authTag,
    encryptStats,
    decryptOutput,
    decryptStats,
    error,
    successMessage,
    // Validation Errors
    keyValidationError,
    ivValidationError,
    ciphertextValidationError,
    tagValidationError,
    plaintextJsonValidationError,
    // Disables
    isEncryptDisabled,
    isDecryptDisabled,
    // Handlers
    handleEncrypt,
    handleDecrypt,
    handleReset,
    handleAutoTransfer,
    handleImportJSON,
  }
}
