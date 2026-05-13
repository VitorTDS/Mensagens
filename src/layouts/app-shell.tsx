import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '../components/theme-toggle'
import { InstallPrompt } from '../components/install-prompt'
import { Sidebar } from '../components/sidebar'
import { useChatContext } from '../hooks/use-chat-context'
import { useSession } from '../hooks/use-session'

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
      className="min-h-screen overflow-x-hidden px-3 py-3 text-[var(--text-primary)] lg:h-screen lg:min-h-0 lg:overflow-hidden sm:px-5 sm:py-5"
      style={{ background: 'var(--app-bg)' }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl flex-col gap-4 lg:h-[calc(100vh-2.5rem)] lg:min-h-0 lg:flex-row">
        <div className="hidden w-[320px] shrink-0 lg:block">
          <Sidebar currentUser={user} partner={partner} online={partnerOnline} onLogout={signOut} />
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 bg-black/60 p-4 lg:hidden">
            <div className="h-full max-w-xs">
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

        <main className="flex min-h-[calc(100vh-1.5rem)] min-w-0 flex-1 flex-col rounded-[2rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-glow backdrop-blur-2xl lg:h-full lg:min-h-0">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--panel-border)] px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded-2xl border border-[var(--panel-border)] bg-[var(--surface-muted)] p-2 lg:hidden"
                onClick={() => setMobileOpen((current) => !current)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="min-w-0">
                <p className="truncate font-display text-2xl text-[var(--text-primary)] sm:text-3xl">MoonChat</p>
                <p className="text-sm text-[var(--text-muted)]">Um lugar so de voces dois.</p>
              </div>
            </div>
            <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
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
