export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET

  if (secret) {
    return secret
  }

  throw new Error('JWT_SECRET or NEXTAUTH_SECRET must be configured')
}

function base64UrlEncode(value: string): string {
  const bytes = typeof Buffer !== 'undefined'
    ? Buffer.from(value)
    : new TextEncoder().encode(value)

  if (typeof Buffer !== 'undefined') {
    return bytes.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  }

  let binary = ''
  const uint8 = bytes as Uint8Array
  uint8.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf8')
  }

  return atob(padded)
}

export async function createHmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(message)

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, messageData)
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function generateJwtToken(payload: Record<string, unknown>): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60,
  }

  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const signature = await createHmacSha256(signingInput, getJwtSecret())

  return `${signingInput}.${signature}`
}

export async function verifyJwtToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, signatureB64] = parts
    const signingInput = `${headerB64}.${payloadB64}`
    const expectedSignature = await createHmacSha256(signingInput, getJwtSecret())

    if (expectedSignature !== signatureB64) return null

    const payload = JSON.parse(base64UrlDecode(payloadB64)) as Record<string, unknown>
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
