import { motion } from 'framer-motion'
import { MessageCircleHeart } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { APP_NAME } from '../lib/constants'
import { useSession } from '../hooks/use-session'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useSession()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      await signIn(code)
      navigate('/')
    } catch (error) {
      setCode('')
      toast.error(error instanceof Error ? error.message : 'Falha ao entrar.')
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
            <p className="text-sm text-[var(--text-muted)]">Digite seu código para entrar.</p>
          </div>
        </div>

        <form onSubmit={(event) => void handleLogin(event)} className="space-y-4">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            aria-label="Código"
            placeholder="Código"
            className="w-full rounded-[1.4rem] border-[var(--panel-border)] bg-[var(--input-bg)] px-4 py-4 text-center text-2xl tracking-[0.3em] text-[var(--text-primary)] placeholder:tracking-normal placeholder:text-[var(--text-soft)] focus:border-[var(--accent)] focus:ring-0"
          />
          <Button type="submit" disabled={loading || !code} className="h-14 w-full text-base">
            {loading ? 'Entrando...' : `Abrir ${APP_NAME}`}
          </Button>
        </form>
      </motion.section>
    </div>
  )
}
