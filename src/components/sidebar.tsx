import { Camera, Heart, Images, LogOut, MessageCircleHeart } from 'lucide-react'
import { useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useSession } from '../hooks/use-session'
import { fileToDataUrl } from '../lib/image'
import { RELATIONSHIP_START } from '../lib/constants'
import { countDaysTogether } from '../lib/date'
import type { AuthUser, UserProfile } from '../types'
import { AvatarEditorDialog } from './avatar-editor-dialog'
import { StatusPill } from './status-pill'
import { Avatar } from './ui/avatar'
import { Button } from './ui/button'

interface SidebarProps {
  currentUser: AuthUser
  partner: UserProfile | null
  online: boolean
  onLogout: () => Promise<void>
  onClose?: () => void
}

export function Sidebar({ currentUser, partner, online, onLogout, onClose }: SidebarProps) {
  const { updateProfileAvatar, restoreDefaultProfileAvatar } = useSession()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [avatarDraft, setAvatarDraft] = useState<string | null>(null)

  const items = [
    { to: '/', label: 'Mensagens', icon: MessageCircleHeart },
    { to: '/memories', label: 'Lembrancas', icon: Images },
  ]

  return (
    <aside className="flex h-full min-w-0 flex-col overflow-y-auto rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 text-[var(--text-primary)] shadow-glow backdrop-blur-2xl sm:rounded-[2rem] sm:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative">
          <Avatar name={currentUser.name} src={currentUser.avatar} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg-strong)] p-1.5 text-[var(--text-primary)]"
            aria-label="Trocar foto de perfil"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              if (!file) return
              void fileToDataUrl(file).then(setAvatarDraft)
              event.currentTarget.value = ''
            }}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-[var(--text-muted)]">Logado como</p>
          <p className="truncate text-lg font-semibold">{currentUser.name}</p>
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--surface-muted)] p-4 sm:rounded-[1.75rem]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--text-muted)]">Dias juntos</p>
            <p className="font-display text-4xl text-[var(--text-primary)]">{countDaysTogether(RELATIONSHIP_START)}</p>
          </div>
          <div className="rounded-2xl bg-[var(--surface-muted)] p-3">
            <Heart className="h-6 w-6 text-[var(--accent)]" />
          </div>
        </div>
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          {partner ? `${partner.name} esta ${online ? 'online agora' : 'offline no momento'}.` : 'Convite pronto para sua pessoa favorita.'}
        </p>
      </div>

      <nav className="mt-6 space-y-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                isActive
                  ? 'bg-[var(--surface-muted)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <StatusPill online={online} label={online ? 'Conectados' : 'Aguardando retorno'} />
        <Button variant="secondary" className="w-full gap-2" onClick={() => void onLogout()}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>

      <AvatarEditorDialog
        open={Boolean(avatarDraft)}
        source={avatarDraft}
        onClose={() => setAvatarDraft(null)}
        onSave={updateProfileAvatar}
        onRestoreDefault={restoreDefaultProfileAvatar}
      />
    </aside>
  )
}
