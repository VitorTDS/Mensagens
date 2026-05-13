import { motion } from 'framer-motion'
import { MoonStar } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div
      className="flex min-h-screen items-center justify-center text-[var(--text-primary)]"
      style={{ background: 'var(--app-bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5"
      >
        <div className="rounded-[2rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 shadow-glow backdrop-blur-2xl">
          <MoonStar className="h-10 w-10 animate-pulseheart text-[var(--accent)]" />
        </div>
        <div className="text-center">
          <p className="font-display text-4xl text-[var(--text-primary)]">MoonChat</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Carregando o seu espaco privado.</p>
        </div>
      </motion.div>
    </div>
  )
}
