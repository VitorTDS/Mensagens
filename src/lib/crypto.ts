const SECRET =
  import.meta.env.VITE_MESSAGE_SECRET ??
  import.meta.env.NEXT_PUBLIC_MESSAGE_SECRET ??
  'moonchat-local-secret'

function toBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
}

async function getKey() {
  const encoder = new TextEncoder()
  const keyData = await crypto.subtle.digest('SHA-256', encoder.encode(SECRET))
  return crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function encryptMessage(content: string) {
  if (!content) {
    return ''
  }

  if (!crypto?.subtle) {
    return `plain:${btoa(unescape(encodeURIComponent(content)))}`
  }

  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await getKey()
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(content),
  )

  const payload = new Uint8Array(iv.length + encrypted.byteLength)
  payload.set(iv)
  payload.set(new Uint8Array(encrypted), iv.length)
  return `enc:${toBase64(payload)}`
}

export async function decryptMessage(payload: string) {
  if (!payload) {
    return ''
  }

  if (payload.startsWith('plain:')) {
    return decodeURIComponent(escape(atob(payload.replace('plain:', ''))))
  }

  if (!payload.startsWith('enc:') || !crypto?.subtle) {
    return payload
  }

  try {
    const bytes = fromBase64(payload.replace('enc:', ''))
    const iv = bytes.slice(0, 12)
    const encrypted = bytes.slice(12)
    const key = await getKey()
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)
    return new TextDecoder().decode(decrypted)
  } catch {
    return '[mensagem protegida]'
  }
}
