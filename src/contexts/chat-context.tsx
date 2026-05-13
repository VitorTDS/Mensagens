/* eslint-disable react-refresh/only-export-components */
import { createContext, type PropsWithChildren } from 'react'
import { useChat } from '../hooks/use-chat'
import { useSession } from '../hooks/use-session'

type ChatContextValue = ReturnType<typeof useChat>

export const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: PropsWithChildren) {
  const { user } = useSession()
  const chat = useChat(user)
  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>
}
