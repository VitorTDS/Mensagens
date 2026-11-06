import { APP_NAME } from './constants'
import type { AuthUser } from '../types'

const storageKey = (userId: string) => `cantinho:trava:${userId}`

function toBase64(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
}

function randomChallenge() {
  return crypto.getRandomValues(new Uint8Array(32))
}

export async function isLockAvailable() {
  if (!window.PublicKeyCredential) {
    return false
  }

  return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
}

export function getLockCredential(userId: string) {
  try {
    return localStorage.getItem(storageKey(userId))
  } catch {
    return null
  }
}

// A trava e local: a biometria confirma quem esta com o aparelho, entao o
// desafio nasce e termina aqui, sem validacao no servidor.
export async function enableLock(user: AuthUser) {
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: randomChallenge(),
      rp: { name: APP_NAME },
      user: {
        id: new TextEncoder().encode(user.id),
        name: user.email,
        displayName: user.name,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'required',
      },
      attestation: 'none',
      timeout: 60000,
    },
  })) as PublicKeyCredential | null

  if (!credential) {
    throw new Error('Não foi possível ativar a trava.')
  }

  const credentialId = toBase64(credential.rawId)
  localStorage.setItem(storageKey(user.id), credentialId)
  return credentialId
}

export async function verifyLock(credentialId: string) {
  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: randomChallenge(),
      allowCredentials: [{ type: 'public-key', id: fromBase64(credentialId) }],
      userVerification: 'required',
      timeout: 60000,
    },
  })

  if (!credential) {
    throw new Error('Não foi possível confirmar.')
  }
}
