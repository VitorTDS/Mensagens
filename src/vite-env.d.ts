/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_MOONCHAT_ALLOWED_EMAILS?: string
  readonly VITE_MOONCHAT_RELATIONSHIP_START?: string
  readonly VITE_MESSAGE_SECRET?: string
  readonly NEXT_PUBLIC_SUPABASE_URL?: string
  readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
  readonly NEXT_PUBLIC_MOONCHAT_ALLOWED_EMAILS?: string
  readonly NEXT_PUBLIC_MOONCHAT_RELATIONSHIP_START?: string
  readonly NEXT_PUBLIC_MESSAGE_SECRET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
