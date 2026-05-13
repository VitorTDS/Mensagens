/* eslint-disable react-refresh/only-export-components */
import { createContext, type PropsWithChildren } from 'react'
import { useAuth } from '../hooks/use-auth'

type AuthContextValue = ReturnType<typeof useAuth>

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}
