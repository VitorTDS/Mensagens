export const APP_NAME = 'Nosso cantinho'
const env = import.meta.env

export const RELATIONSHIP_START =
  env.VITE_MOONCHAT_RELATIONSHIP_START ??
  env.NEXT_PUBLIC_MOONCHAT_RELATIONSHIP_START ??
  '2023-06-12'

export const ALLOWED_EMAILS = (
  env.VITE_MOONCHAT_ALLOWED_EMAILS ??
  env.NEXT_PUBLIC_MOONCHAT_ALLOWED_EMAILS ??
  ''
)
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

export const STORAGE_BUCKET = 'moonchat-media'
export const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
]
