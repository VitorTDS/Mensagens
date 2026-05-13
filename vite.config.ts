import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('/react/')) {
            return 'react'
          }
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase'
          }
          if (id.includes('framer-motion')) {
            return 'motion'
          }
          if (id.includes('lucide-react') || id.includes('sonner')) {
            return 'ui'
          }

          return undefined
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'MoonChat',
        short_name: 'MoonChat',
        description: 'Mensagens privadas para casal com foco em emocao, design e privacidade.',
        theme_color: '#120d18',
        background_color: '#120d18',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '256x256',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
