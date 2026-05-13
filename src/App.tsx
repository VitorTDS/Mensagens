import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppShell } from './layouts/app-shell'
import { ProtectedRoute } from './components/protected-route'
import { LoadingScreen } from './components/ui/loading-screen'
import { AuthProvider } from './contexts/auth-context'
import { ChatProvider } from './contexts/chat-context'
import { ThemeProvider } from './contexts/theme-context'
import { useSession } from './hooks/use-session'
import { ChatPage } from './pages/chat-page'
import { LoginPage } from './pages/login-page'
import { MemoriesPage } from './pages/memories-page'

function ShellRoutes() {
  const { user, loading } = useSession()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <ChatProvider>
              <AppShell />
            </ChatProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<ChatPage />} />
        <Route path="/memories" element={<MemoriesPage />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <ShellRoutes />
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              classNames: {
                toast:
                  '!rounded-2xl !border !shadow-glow',
              },
              style: {
                borderColor: 'var(--panel-border)',
                background: 'var(--panel-bg-strong)',
                color: 'var(--text-primary)',
              },
            }}
          />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
