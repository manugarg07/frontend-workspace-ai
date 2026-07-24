export function isValidJson(str: string): boolean {
  if (!str.trim()) return false
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

export function validateBase64(str: string): boolean {
  const clean = str.replace(/\s+/g, '')
  if (!clean) return false
  try {
    // Check characters are valid base64
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean)) {
      return false
    }
    // Attempt decoding
    window.atob(clean)
    return true
  } catch {
    return false
  }
}

export function validateHex(str: string): boolean {
  const clean = str.replace(/\s+/g, '')
  if (!clean) return false
  return /^[0-9a-fA-F]+$/.test(clean) && clean.length % 2 === 0
}
