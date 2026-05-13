export type ThemeMode = 'midnight' | 'whatsapp-light' | 'whatsapp-dark' | 'sunset'

export interface UserProfile {
  id: string
  name: string
  avatar: string
  email: string
  created_at: string
}

export interface MessageRecord {
  id: string
  sender_id: string
  content: string
  image_url: string | null
  media_type?: 'image' | 'video' | null
  media_name?: string | null
  media_size?: number | null
  reply_to_message_id?: string | null
  created_at: string
  read: boolean
  favorite_by: string[]
  kind?: 'text' | 'heart' | 'saudade'
}

export interface MemoryRecord {
  id: string
  title: string
  image_url: string
  description: string
  created_at: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar: string
}

export interface PresenceState {
  userId: string
  online: boolean
  lastSeen?: string
  typing?: boolean
}
