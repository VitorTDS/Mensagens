import localforage from 'localforage'
import { ALLOWED_EMAILS, DEFAULT_AVATARS } from '../lib/constants'
import type { AuthUser, UserProfile } from '../types'
import { isSupabaseConfigured, supabase } from './supabase'
import { updateMockProfileAvatar } from './chat'
import { STORAGE_BUCKET } from '../lib/constants'

const MOCK_SESSION_KEY = 'moonchat:mock-session'
const isProduction = import.meta.env.PROD

function isAllowed(email: string) {
  if (!ALLOWED_EMAILS.length) {
    return true
  }

  return ALLOWED_EMAILS.includes(email.toLowerCase())
}

function nameFromEmail(email: string) {
  const prefix = email.split('@')[0] ?? 'Moon'
  return prefix
    .split(/[.\-_]/g)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')
}

function avatarFromEmail(email: string) {
  const normalized = email.toLowerCase()
  let hash = 0
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0
  }
  return DEFAULT_AVATARS[hash % DEFAULT_AVATARS.length]
}

export function getDefaultAvatarForEmail(email: string) {
  return avatarFromEmail(email)
}

async function resolveAvatarUrl(avatar: string | null | undefined) {
  if (!avatar || !isSupabaseConfigured || !supabase) {
    return avatar ?? undefined
  }

  if (avatar.startsWith('http') || avatar.startsWith('data:') || avatar.startsWith('blob:')) {
    return avatar
  }

  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(avatar, 60 * 60)
  if (error || !data?.signedUrl) {
    return avatar
  }

  return data.signedUrl
}

export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  if (isSupabaseConfigured && supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user.email) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata.name ?? nameFromEmail(session.user.email),
      avatar:
        (await resolveAvatarUrl(session.user.user_metadata.avatar_url)) ??
        avatarFromEmail(session.user.email),
    }
  }

  if (isProduction) {
    throw new Error('Este ambiente de producao exige configuracao do Supabase.')
  }

  return (await localforage.getItem<AuthUser | null>(MOCK_SESSION_KEY)) ?? null
}

export async function signIn(email: string, password: string) {
  if (!isAllowed(email)) {
    throw new Error('Este email não está autorizado para acessar o MoonChat.')
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      throw error
    }

    const user = await getCurrentAuthUser()
    if (!user) {
      throw new Error('Não foi possível iniciar a sessão.')
    }

    await ensureUserProfile(user)
    return user
  }

  if (isProduction) {
    throw new Error('Este ambiente de producao exige configuracao do Supabase.')
  }

  if (password.length < 4) {
    throw new Error('No modo mock, use uma senha com pelo menos 4 caracteres.')
  }

  const user: AuthUser = {
    id: `mock-${email.toLowerCase().replace(/[^a-z0-9]+/g, '-') || crypto.randomUUID()}`,
    email,
    name: nameFromEmail(email),
    avatar: avatarFromEmail(email),
  }

  await localforage.setItem(MOCK_SESSION_KEY, user)
  window.dispatchEvent(new CustomEvent('moonchat:auth'))
  return user
}

export async function signOut() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut()
    return
  }

  if (isProduction) {
    throw new Error('Este ambiente de producao exige configuracao do Supabase.')
  }

  await localforage.removeItem(MOCK_SESSION_KEY)
  window.dispatchEvent(new CustomEvent('moonchat:auth'))
}

export function subscribeToAuth(callback: () => void) {
  if (isSupabaseConfigured && supabase) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => callback())

    return () => subscription.unsubscribe()
  }

  if (isProduction) {
    throw new Error('Este ambiente de producao exige configuracao do Supabase.')
  }

  const handler = () => callback()
  window.addEventListener('moonchat:auth', handler)
  return () => window.removeEventListener('moonchat:auth', handler)
}

export async function ensureUserProfile(user: AuthUser) {
  if (!isSupabaseConfigured || !supabase) {
    return
  }

  const profile: UserProfile = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    created_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('users').upsert(profile)
  if (error) {
    throw error
  }
}

export async function updateProfileAvatar(user: AuthUser, avatar: string) {
  if (isSupabaseConfigured && supabase) {
    const blob = await (await fetch(avatar)).blob()
    const path = `avatars/${user.id}-${crypto.randomUUID()}.jpg`
    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/jpeg',
    })
    if (uploadError) {
      throw uploadError
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        avatar_url: path,
      },
    })
    if (authError) {
      throw authError
    }

    const { error } = await supabase.from('users').update({ avatar: path }).eq('id', user.id)
    if (error) {
      throw error
    }

    return
  }

  if (isProduction) {
    throw new Error('Este ambiente de producao exige configuracao do Supabase.')
  }

  const nextUser: AuthUser = { ...user, avatar }
  await localforage.setItem(MOCK_SESSION_KEY, nextUser)
  await updateMockProfileAvatar(user.id, avatar)
  window.dispatchEvent(new CustomEvent('moonchat:auth'))
  window.dispatchEvent(new CustomEvent('moonchat:messages'))
}

export async function restoreDefaultProfileAvatar(user: AuthUser) {
  await updateProfileAvatar(user, getDefaultAvatarForEmail(user.email))
}
