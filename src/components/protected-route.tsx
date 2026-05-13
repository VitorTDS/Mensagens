import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../hooks/use-session'
import { LoadingScreen } from './ui/loading-screen'

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { user, loading } = useSession()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
