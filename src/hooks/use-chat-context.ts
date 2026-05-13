import { useContext } from 'react'
import { ChatContext } from '../contexts/chat-context'

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext deve ser usado dentro de ChatProvider')
  }

  return context
}
