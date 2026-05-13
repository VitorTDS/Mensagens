import type { MemoryRecord, MessageRecord, UserProfile } from '../types'
import { DEFAULT_AVATARS } from './constants'

const now = new Date()

export const mockProfiles: UserProfile[] = [
  {
    id: 'mock-persona-1',
    name: 'Pessoa Um',
    email: 'persona1@example.com',
    avatar: DEFAULT_AVATARS[0],
    created_at: now.toISOString(),
  },
  {
    id: 'mock-persona-2',
    name: 'Pessoa Dois',
    email: 'persona2@example.com',
    avatar: DEFAULT_AVATARS[1],
    created_at: now.toISOString(),
  },
]

export const mockMessages: MessageRecord[] = [
  {
    id: 'm1',
    sender_id: 'mock-ananda',
    content: 'enc:placeholder',
    image_url: null,
    media_type: null,
    media_name: null,
    media_size: null,
    created_at: new Date(now.getTime() - 1000 * 60 * 40).toISOString(),
    read: true,
    favorite_by: ['mock-vitor'],
    kind: 'text',
  },
  {
    id: 'm2',
    sender_id: 'mock-vitor',
    content: 'enc:placeholder',
    image_url: null,
    media_type: null,
    media_name: null,
    media_size: null,
    created_at: new Date(now.getTime() - 1000 * 60 * 22).toISOString(),
    read: true,
    favorite_by: [],
    kind: 'text',
  },
]

export const mockMemories: MemoryRecord[] = [
  {
    id: 'memory-1',
    title: 'Nosso primeiro café',
    image_url:
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
    description: 'A conversa que virou rotina favorita.',
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 45).toISOString(),
  },
  {
    id: 'memory-2',
    title: 'Fim de tarde juntos',
    image_url:
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
    description: 'Uma foto com cheiro de paz e saudade boa.',
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
]
