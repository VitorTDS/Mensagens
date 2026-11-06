import { LockKeyhole, ScanFace } from 'lucide-react'
import { type FormEvent, type ReactElement, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useSession } from '../hooks/use-session'
import { enableLock, getLockCredential, isLockAvailable, verifyLock } from '../lib/app-lock'
import { APP_NAME } from '../lib/constants'
import type { AuthUser } from '../types'
import { Button } from './ui/button'

// Tempo fora do app sem pedir a trava de novo, para escolher uma foto, por exemplo.
const GRACE_PERIOD_MS = 60_000

function LockCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactElement }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-6" style={{ background: 'var(--app-bg)' }}>
      <section className="w-full max-w-md rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 text-center shadow-glow backdrop-blur-2xl sm:rounded-[2rem] sm:p-8">
        <div className="mx-auto mb-4 w-fit rounded-2xl bg-[var(--surface-muted)] p-4">
          <ScanFace className="h-8 w-8 text-[var(--accent)]" />
        </div>
        <p className="font-display text-3xl text-[var(--text-primary)]">{title}</p>
        <p className="mb-6 mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
        {children}
      </section>
    </div>
  )
}

function LockScreen({ credentialId, onUnlock }: { credentialId: string; onUnlock: () => void }) {
  const { signIn } = useSession()
  const [useCode, setUseCode] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  const handleBiometric = async () => {
    setBusy(true)
    try {
      await verifyLock(credentialId)
      onUnlock()
    } catch {
      toast.error('Não foi possível confirmar. Tente de novo ou use o código.')
    } finally {
      setBusy(false)
    }
  }

  const handleCode = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      await signIn(code)
      onUnlock()
    } catch (error) {
      setCode('')
      toast.error(error instanceof Error ? error.message : 'Falha ao entrar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <LockCard title={APP_NAME} subtitle="Toque para desbloquear.">
      {useCode ? (
        <form onSubmit={(event) => void handleCode(event)} className="space-y-4">
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
          <Button type="submit" disabled={busy || !code} className="h-14 w-full text-base">
            {busy ? 'Entrando...' : 'Desbloquear'}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setUseCode(false)}>
            Voltar
          </Button>
        </form>
      ) : (
        <div className="space-y-3">
          <Button disabled={busy} className="h-14 w-full gap-2 text-base" onClick={() => void handleBiometric()}>
            <LockKeyhole className="h-5 w-5" />
            {busy ? 'Confirmando...' : 'Desbloquear'}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setUseCode(true)}>
            Usar código
          </Button>
        </div>
      )}
    </LockCard>
  )
}

function LockOffer({ user, onEnabled, onSkip }: { user: AuthUser; onEnabled: (id: string) => void; onSkip: () => void }) {
  const [busy, setBusy] = useState(false)

  const handleEnable = async () => {
    setBusy(true)
    try {
      onEnabled(await enableLock(user))
      toast.success('Trava ativada neste celular.')
    } catch {
      toast.error('Não foi possível ativar a trava.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <LockCard title="Proteger o cantinho" subtitle="Peça o Face ID ou a biometria sempre que abrir o app neste celular.">
      <div className="space-y-3">
        <Button disabled={busy} className="h-14 w-full text-base" onClick={() => void handleEnable()}>
          {busy ? 'Ativando...' : 'Ativar trava'}
        </Button>
        <Button variant="ghost" className="w-full" onClick={onSkip}>
          Agora não
        </Button>
      </div>
    </LockCard>
  )
}

export function AppLock({ user, children }: { user: AuthUser; children: ReactElement }) {
  const [credentialId, setCredentialId] = useState(() => getLockCredential(user.id))
  const [locked, setLocked] = useState(() => Boolean(getLockCredential(user.id)))
  const [offer, setOffer] = useState(false)
  const hiddenAt = useRef<number | null>(null)

  useEffect(() => {
    if (credentialId) {
      return
    }

    let active = true
    void isLockAvailable()
      .then((available) => {
        if (active) {
          setOffer(available)
        }
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [credentialId])

  useEffect(() => {
    if (!credentialId) {
      return
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt.current = Date.now()
        return
      }

      if (hiddenAt.current !== null && Date.now() - hiddenAt.current >= GRACE_PERIOD_MS) {
        setLocked(true)
      }
      hiddenAt.current = null
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [credentialId])

  if (credentialId && locked) {
    return <LockScreen credentialId={credentialId} onUnlock={() => setLocked(false)} />
  }

  if (offer && !credentialId) {
    return (
      <LockOffer
        user={user}
        onEnabled={(id) => {
          setCredentialId(id)
          setOffer(false)
        }}
        onSkip={() => setOffer(false)}
      />
    )
  }

  return children
}
