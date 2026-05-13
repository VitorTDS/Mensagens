import { useEffect, useState } from 'react'
import {
  getCurrentAuthUser,
  restoreDefaultProfileAvatar,
  signIn,
  signOut,
  subscribeToAuth,
  updateProfileAvatar,
} from '../services/auth'
import type { AuthUser } from '../types'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      const currentUser = await getCurrentAuthUser()
      if (active) {
        setUser(currentUser)
        setLoading(false)
      }
    }

    void load()
    const unsubscribe = subscribeToAuth(() => {
      void load()
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return {
    user,
    loading,
    signIn,
    signOut,
    updateProfileAvatar: async (avatar: string) => {
      if (!user) {
        return
      }
      await updateProfileAvatar(user, avatar)
    },
    restoreDefaultProfileAvatar: async () => {
      if (!user) {
        return
      }
      await restoreDefaultProfileAvatar(user)
    },
  }
}
