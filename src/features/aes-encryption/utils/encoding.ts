export function utf8Encode(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

export function utf8Decode(buffer: ArrayBuffer | Uint8Array): string {
  return new TextDecoder().decode(buffer)
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const cleanBase64 = base64.replace(/\s+/g, '')
  const binary = window.atob(cleanBase64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function hexToArrayBuffer(hex: string): ArrayBuffer {
  const cleanHex = hex.replace(/\s+/g, '')
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Hex string must have an even number of characters')
  }
  if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
    throw new Error('Hex string must only contain hexadecimal characters')
  }
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16)
  }
  return bytes.buffer
}
