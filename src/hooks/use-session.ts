import { useContext } from 'react'
import { AuthContext } from '../contexts/auth-context'

export function useSession() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useSession deve ser usado dentro de AuthProvider')
  }

  return context
}
