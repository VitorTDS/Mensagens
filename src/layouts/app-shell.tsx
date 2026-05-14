import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '../components/theme-toggle'
import { InstallPrompt } from '../components/install-prompt'
import { Sidebar } from '../components/sidebar'
import { useChatContext } from '../hooks/use-chat-context'
import { useSession } from '../hooks/use-session'
import { APP_NAME } from '../lib/constants'

export function AppShell() {
  const { user, signOut } = useSession()
  const { partner, onlineIds } = useChatContext()
  const [mobileOpen, setMobileOpen] = useState(false)
  const partnerOnline = partner ? onlineIds.has(partner.id) : false

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission()
    }
  }, [])

  if (!user) {
    return null
  }

  return (
    <div
      className="h-[100dvh] overflow-hidden px-3 py-3 text-[var(--text-primary)] sm:px-5 sm:py-5"
      style={{ background: 'var(--app-bg)' }}
    >
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-3 lg:flex-row lg:gap-4">
        <div className="hidden w-[320px] shrink-0 lg:block">
          <Sidebar currentUser={user} partner={partner} online={partnerOnline} onLogout={signOut} />
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 bg-black/60 p-3 sm:p-4 lg:hidden">
            <div className="h-full max-w-[92vw] sm:max-w-xs">
              <Sidebar
                currentUser={user}
                partner={partner}
                online={partnerOnline}
                onLogout={signOut}
                onClose={() => setMobileOpen(false)}
              />
            </div>
          </div>
        ) : null}

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-glow backdrop-blur-2xl sm:rounded-[2rem]">
          <header className="flex flex-wrap items-start justify-between gap-2 border-b border-[var(--panel-border)] px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded-2xl border border-[var(--panel-border)] bg-[var(--surface-muted)] p-2 lg:hidden"
                onClick={() => setMobileOpen((current) => !current)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="min-w-0">
                <p className="truncate font-display text-xl text-[var(--text-primary)] sm:text-3xl">{APP_NAME}</p>
                <p className="hidden text-sm text-[var(--text-muted)] sm:block">Um cantinho so de voces dois.</p>
              </div>
            </div>
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-3">
              <InstallPrompt />
              <ThemeToggle />
            </div>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
