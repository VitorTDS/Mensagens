import { motion } from 'framer-motion'
import { LockKeyhole, MessageCircleHeart } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { APP_NAME } from '../lib/constants'
import { useSession } from '../hooks/use-session'
import { isSupabaseConfigured } from '../services/supabase'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
      toast.success('Sessao iniciada.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha no login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:py-8" style={{ background: 'var(--app-bg)' }}>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 shadow-glow backdrop-blur-2xl sm:rounded-[2rem] sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-[var(--surface-muted)] p-3">
            <MessageCircleHeart className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-3xl text-[var(--text-primary)] sm:text-4xl">{APP_NAME}</p>
            <p className="text-sm text-[var(--text-muted)]">Entrar no espaco de voces.</p>
          </div>
        </div>

        <div className="mb-5 rounded-[1.4rem] border border-[var(--panel-border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-secondary)]">
          <div className="mb-2 flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 text-[var(--accent)]" />
            <span className="font-medium text-[var(--text-primary)]">Acesso privado</span>
          </div>
          <p>
            {isSupabaseConfigured
              ? 'Use sua conta cadastrada no Supabase.'
              : 'Modo local apenas para desenvolvimento. Configure o Supabase para publicar com seguranca.'}
          </p>
        </div>

        <div className="space-y-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Email"
            className="w-full rounded-[1.4rem] border-[var(--panel-border)] bg-[var(--input-bg)] px-4 py-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus:border-[var(--accent)] focus:ring-0"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Senha"
            className="w-full rounded-[1.4rem] border-[var(--panel-border)] bg-[var(--input-bg)] px-4 py-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus:border-[var(--accent)] focus:ring-0"
          />
          <Button onClick={() => void handleLogin()} disabled={loading} className="h-14 w-full text-base">
            {loading ? 'Entrando...' : `Abrir ${APP_NAME}`}
          </Button>
        </div>
      </motion.section>
    </div>
  )
}
