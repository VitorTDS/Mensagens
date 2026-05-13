import localforage from 'localforage'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { decryptMessage, encryptMessage } from '../lib/crypto'
import { mockMemories, mockMessages, mockProfiles } from '../lib/mock-data'
import type { AuthUser, MemoryRecord, MessageRecord, PresenceState, UserProfile } from '../types'
import { isSupabaseConfigured, supabase } from './supabase'

const MESSAGES_KEY = 'moonchat:messages'
const MEMORIES_KEY = 'moonchat:memories'
const TYPING_KEY = 'moonchat:typing'
const PROFILES_KEY = 'moonchat:profiles'
const isProduction = import.meta.env.PROD
let typingChannel: RealtimeChannel | null = null

interface MessageRow extends Omit<MessageRecord, 'favorite_by'> {
  favorite_by?: string[]
}

function isMissingColumnError(error: unknown, column: string) {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes(column.toLowerCase())
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message?: unknown }).message ?? '')
    return message.toLowerCase().includes(column.toLowerCase())
  }

  return false
}

async function hydrateMessages(messages: MessageRow[]) {
  return Promise.all(
    messages.map(async (message) => ({
      ...message,
      content: await decryptMessage(message.content),
      favorite_by: message.favorite_by ?? [],
      media_type: message.media_type ?? (message.image_url ? 'image' : null),
      media_name: message.media_name ?? null,
      media_size: message.media_size ?? null,
      reply_to_message_id: message.reply_to_message_id ?? null,
      image_url: message.image_url ? await resolveMediaUrl(message.image_url) : null,
    })),
  )
}

async function resolveMediaUrl(path: string) {
  if (!isSupabaseConfigured || !supabase) {
    return path
  }

  if (path.startsWith('blob:') || path.startsWith('data:') || path.startsWith('http')) {
    return path
  }

  const { data, error } = await supabase.storage.from('moonchat-media').createSignedUrl(path, 60 * 60)
  if (error || !data?.signedUrl) {
    return path
  }

  return data.signedUrl
}

async function loadMockMessages() {
  if (isProduction) {
    throw new Error('Modo mock desativado em producao.')
  }

  const existing = await localforage.getItem<MessageRecord[]>(MESSAGES_KEY)
  if (existing?.length) {
    return existing
  }

  const seeded = await Promise.all(
    mockMessages.map(async (message, index) => ({
      ...message,
      content: await encryptMessage(
        index === 0 ? 'Cheguei em casa e já queria te contar tudo.' : 'Te ver hoje deixou meu dia leve.',
      ),
    })),
  )

  await localforage.setItem(MESSAGES_KEY, seeded)
  return seeded
}

async function loadMockProfiles() {
  if (isProduction) {
    throw new Error('Modo mock desativado em producao.')
  }

  const existing = await localforage.getItem<UserProfile[]>(PROFILES_KEY)
  if (existing?.length) {
    return existing
  }

  await localforage.setItem(PROFILES_KEY, mockProfiles)
  return mockProfiles
}

export async function getProfiles() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('users').select('*').order('created_at')
    if (error) {
      throw error
    }

    return (data ?? []) as UserProfile[]
  }

  if (isProduction) {
    throw new Error('Supabase nao configurado em producao.')
  }

  return loadMockProfiles()
}

export async function getMessages() {
  if (isSupabaseConfigured && supabase) {
    const client = supabase
    const modernSelect =
      'id, sender_id, content, image_url, media_type, media_name, media_size, reply_to_message_id, created_at, read, favorites(user_id)'
    const legacySelect =
      'id, sender_id, content, image_url, created_at, read, favorites(user_id)'

    let data: Record<string, unknown>[] | null = null
    let error: Error | null = null

    const modernResult = await client
      .from('messages')
      .select(modernSelect)
      .order('created_at', { ascending: true })

    data = modernResult.data as Record<string, unknown>[] | null
    error = modernResult.error

    if (
      error &&
      (isMissingColumnError(error, 'media_type') ||
        isMissingColumnError(error, 'media_name') ||
        isMissingColumnError(error, 'media_size') ||
        isMissingColumnError(error, 'reply_to_message_id'))
    ) {
      const legacyResult = await client
        .from('messages')
        .select(legacySelect)
        .order('created_at', { ascending: true })
      data = legacyResult.data as Record<string, unknown>[] | null
      error = legacyResult.error
    }

    if (error) {
      throw error
    }

    const parsed = (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      sender_id: String(row.sender_id),
      content: String(row.content ?? ''),
      image_url: (row.image_url as string | null) ?? null,
      media_type: (row.media_type as 'image' | 'video' | null | undefined) ?? null,
      media_name: (row.media_name as string | null | undefined) ?? null,
      media_size: (row.media_size as number | null | undefined) ?? null,
      reply_to_message_id: (row.reply_to_message_id as string | null | undefined) ?? null,
      created_at: String(row.created_at),
      read: Boolean(row.read),
      favorite_by: Array.isArray(row.favorites)
        ? row.favorites
            .map((favorite) => (favorite as { user_id?: string }).user_id)
            .filter((value): value is string => Boolean(value))
        : [],
    }))

    return hydrateMessages(parsed)
  }

  if (isProduction) {
    throw new Error('Supabase nao configurado em producao.')
  }

  const messages = await loadMockMessages()
  return hydrateMessages(messages)
}

export async function sendMessage(params: {
  sender: AuthUser
  content: string
  imageUrl?: string | null
  mediaType?: 'image' | 'video' | null
  mediaName?: string | null
  mediaSize?: number | null
  replyToMessageId?: string | null
  kind?: MessageRecord['kind']
}) {
  const encrypted = await encryptMessage(params.content)

  if (isSupabaseConfigured && supabase) {
    const payload = {
      sender_id: params.sender.id,
      content: encrypted,
      image_url: params.imageUrl ?? null,
      media_type: params.mediaType ?? null,
      media_name: params.mediaName ?? null,
      media_size: params.mediaSize ?? null,
      reply_to_message_id: params.replyToMessageId ?? null,
      read: false,
      kind: params.kind ?? 'text',
    }

    let result = await supabase
      .from('messages')
      .insert(payload)
      .select()
      .single()

    if (
      result.error &&
      (isMissingColumnError(result.error, 'media_type') ||
        isMissingColumnError(result.error, 'media_name') ||
        isMissingColumnError(result.error, 'media_size') ||
        isMissingColumnError(result.error, 'reply_to_message_id'))
    ) {
      result = await supabase
        .from('messages')
        .insert({
          sender_id: params.sender.id,
          content: encrypted,
          image_url: params.imageUrl ?? null,
          read: false,
          kind: params.kind ?? 'text',
        })
        .select()
        .single()
    }

    if (result.error) {
      throw result.error
    }

    return {
      ...result.data,
      content: params.content,
      favorite_by: [],
    } as MessageRecord
  }

  if (isProduction) {
    throw new Error('Supabase nao configurado em producao.')
  }

  const messages = await loadMockMessages()
  const message: MessageRecord = {
    id: crypto.randomUUID(),
    sender_id: params.sender.id,
    content: encrypted,
    image_url: params.imageUrl ?? null,
    media_type: params.mediaType ?? null,
    media_name: params.mediaName ?? null,
    media_size: params.mediaSize ?? null,
    reply_to_message_id: params.replyToMessageId ?? null,
    created_at: new Date().toISOString(),
    read: false,
    favorite_by: [],
    kind: params.kind ?? 'text',
  }

  const next = [...messages, message]
  await localforage.setItem(MESSAGES_KEY, next)
  window.dispatchEvent(new CustomEvent('moonchat:messages'))
  return { ...message, content: params.content }
}

export function subscribeToMessages(callback: () => void) {
  if (isSupabaseConfigured && supabase) {
    const client = supabase
    const channel = client
      .channel('moonchat:messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => callback(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'favorites' },
        () => callback(),
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }

  if (isProduction) {
    throw new Error('Supabase nao configurado em producao.')
  }

  const handler = () => callback()
  window.addEventListener('moonchat:messages', handler)
  return () => window.removeEventListener('moonchat:messages', handler)
}

export function subscribeToTyping(callback: (userId: string | null) => void) {
  if (isSupabaseConfigured && supabase) {
    const client = supabase
    typingChannel ??= client.channel('moonchat:signals')
    typingChannel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      callback((payload as { userId?: string; active?: boolean }).active ? String((payload as { userId: string }).userId) : null)
    })
    void typingChannel.subscribe()

    return () => {
      if (typingChannel) {
        void client.removeChannel(typingChannel)
        typingChannel = null
      }
    }
  }

  if (isProduction) {
    throw new Error('Supabase nao configurado em producao.')
  }

  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ userId: string | null }>).detail
    callback(detail.userId)
  }

  window.addEventListener(TYPING_KEY, handler)
  return () => window.removeEventListener(TYPING_KEY, handler)
}

export async function sendTypingSignal(userId: string, active: boolean) {
  if (isSupabaseConfigured && supabase) {
    const client = supabase
    typingChannel ??= client.channel('moonchat:signals')
    void typingChannel.subscribe()
    await typingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, active },
    })
    return
  }

  if (isProduction) {
    throw new Error('Supabase nao configurado em producao.')
  }

  window.dispatchEvent(new CustomEvent(TYPING_KEY, { detail: { userId: active ? userId : null } }))
}

export function subscribeToPresence(currentUserId: string, callback: (state: PresenceState[]) => void) {
  if (isSupabaseConfigured && supabase) {
    const client = supabase
    const channel = client.channel('moonchat:presence', {
      config: {
        presence: { key: currentUserId },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, Array<{ online_at?: string }>>
        const mapped: PresenceState[] = Object.entries(state).map(([userId, entries]) => ({
          userId,
          online: entries.length > 0,
          lastSeen: entries[0]?.online_at,
        }))
        callback(mapped)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    return () => {
      void client.removeChannel(channel)
    }
  }

  if (isProduction) {
    throw new Error('Supabase nao configurado em producao.')
  }

  callback(
    mockProfiles.map((profile) => ({
      userId: profile.id,
      online: profile.id === currentUserId,
      lastSeen: new Date().toISOString(),
    })),
  )

  return () => undefined
}

export async function markMessagesAsRead() {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.rpc('moonchat_mark_messages_as_read')

    if (error) {
      throw error
    }

    return
  }

  if (isProduction) {
    throw new Error('Supabase nao configurado em producao.')
  }

  const messages = await loadMockMessages()
  const next = messages.map((message) =>
    message.read ? message : { ...message, read: true },
  )
  await localforage.setItem(MESSAGES_KEY, next)
  window.dispatchEvent(new CustomEvent('moonchat:messages'))
}

export async function toggleFavorite(userId: string, message: MessageRecord) {
  if (isSupabaseConfigured && supabase) {
    const hasFavorite = message.favorite_by.includes(userId)

    if (hasFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('message_id', message.id)
      if (error) {
        throw error
      }
    } else {
      const { error } = await supabase.from('favorites').insert({ user_id: userId, message_id: message.id })
      if (error) {
        throw error
      }
    }

    return
  }

  if (isProduction) {
    throw new Error('Supabase nao configurado em producao.')
  }

  const messages = await loadMockMessages()
  const next = messages.map((entry) =>
    entry.id === message.id
      ? {
          ...entry,
          favorite_by: entry.favorite_by.includes(userId)
            ? entry.favorite_by.filter((id) => id !== userId)
            : [...entry.favorite_by, userId],
        }
      : entry,
  )
  await localforage.setItem(MESSAGES_KEY, next)
  window.dispatchEvent(new CustomEvent('moonchat:messages'))
}

export async function getMemories() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('memories').select('*').order('created_at', { ascending: false })
    if (error) {
      throw error
    }

    return (data ?? []) as MemoryRecord[]
  }

  if (isProduction) {
    throw new Error('Supabase nao configurado em producao.')
  }

  const existing = await localforage.getItem<MemoryRecord[]>(MEMORIES_KEY)
  if (existing?.length) {
    return existing
  }

  await localforage.setItem(MEMORIES_KEY, mockMemories)
  return mockMemories
}

export async function addMemory(memory: Omit<MemoryRecord, 'id' | 'created_at'>) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('memories')
      .insert(memory)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as MemoryRecord
  }

  if (isProduction) {
    throw new Error('Supabase nao configurado em producao.')
  }

  const current = await getMemories()
  const next: MemoryRecord = {
    ...memory,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }
  await localforage.setItem(MEMORIES_KEY, [next, ...current])
  return next
}

export async function uploadImage(file: File) {
  const localPreview = URL.createObjectURL(file)

  if (!isSupabaseConfigured || !supabase) {
    if (isProduction) {
      throw new Error('Supabase nao configurado em producao.')
    }
    return localPreview
  }

  const extension = file.name.split('.').pop() ?? 'jpg'
  const path = `${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('moonchat-media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    throw error
  }

  return path
}

export async function updateMockProfileAvatar(userId: string, avatar: string) {
  const profiles = await loadMockProfiles()
  const next = profiles.map((profile) => (profile.id === userId ? { ...profile, avatar } : profile))
  await localforage.setItem(PROFILES_KEY, next)
}
