import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { playMessageSound } from '../lib/sound'
import {
  getMessages,
  getProfiles,
  markMessagesAsRead,
  sendMessage,
  sendTypingSignal,
  subscribeToMessages,
  subscribeToPresence,
  subscribeToTyping,
  toggleFavorite,
  uploadImage,
} from '../services/chat'
import type { AuthUser, MessageRecord, PresenceState, UserProfile } from '../types'

function getErrorDetail(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error)
    } catch {
      return 'erro em formato nao serializavel'
    }
  }

  return 'erro desconhecido'
}

export function useChat(user: AuthUser | null) {
  const [messages, setMessages] = useState<MessageRecord[]>([])
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [typingUserId, setTypingUserId] = useState<string | null>(null)
  const [presence, setPresence] = useState<PresenceState[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const lastIncomingRef = useRef<string | null>(null)
  const typingTimeout = useRef<number | null>(null)

  const partner = useMemo(
    () => profiles.find((profile) => profile.id !== user?.id) ?? profiles[0] ?? null,
    [profiles, user?.id],
  )
  const partnerPresence = useMemo(
    () => presence.find((entry) => entry.userId === partner?.id) ?? null,
    [partner?.id, presence],
  )

  useEffect(() => {
    if (!user) {
      return
    }

    let mounted = true

    const load = async () => {
      const [nextMessages, nextProfiles] = await Promise.all([getMessages(), getProfiles()])
      if (!mounted) {
        return
      }

      setMessages(nextMessages)
      setProfiles(nextProfiles)
      setLoading(false)
    }

    void load()

    const unsubscribeMessages = subscribeToMessages(() => {
      void getMessages().then((next) => {
        if (!mounted) {
          return
        }

        const latestIncoming = [...next].reverse().find((message) => message.sender_id !== user.id)
        if (latestIncoming && latestIncoming.id !== lastIncomingRef.current) {
          lastIncomingRef.current = latestIncoming.id
          playMessageSound(740)
          if (Notification.permission === 'granted') {
            new Notification('Nova mensagem no MoonChat', {
              body: latestIncoming.content || 'Imagem enviada',
            })
          }
        }

        setMessages(next)
      })
    })

    const unsubscribeTyping = subscribeToTyping((nextTypingUserId) => {
      if (nextTypingUserId !== user.id) {
        setTypingUserId(nextTypingUserId)
      }
    })

    const unsubscribePresence = subscribeToPresence(user.id, setPresence)

    void markMessagesAsRead()

    return () => {
      mounted = false
      unsubscribeMessages()
      unsubscribeTyping()
      unsubscribePresence()
    }
  }, [user])

  const handleSendMessage = async (
    content: string,
    files?: File[] | null,
    kind?: MessageRecord['kind'],
    replyToMessageId?: string | null,
  ) => {
    if (!user || (!content.trim() && !files?.length)) {
      return
    }

    setSending(true)
    setUploadProgress(0)
    try {
      const queue = files?.length ? files : [null]
      const sentMessages: MessageRecord[] = []

      for (let index = 0; index < queue.length; index += 1) {
        const file = queue[index]
        let imageUrl: string | null = null
        try {
          imageUrl = file ? await uploadImage(file) : null
        } catch (error) {
          const detail = getErrorDetail(error)
          throw new Error(`Falha no upload da midia: ${detail}`)
        }

        const mediaType = file ? (file.type.startsWith('video/') ? 'video' : 'image') : null
        let sent: MessageRecord
        try {
          sent = await sendMessage({
            sender: user,
            content: queue.length === 1 ? content.trim() : index === 0 ? content.trim() : '',
            imageUrl,
            mediaType,
            mediaName: file?.name ?? null,
            mediaSize: file?.size ?? null,
            replyToMessageId: index === 0 ? replyToMessageId ?? null : null,
            kind,
          })
        } catch (error) {
          const detail = getErrorDetail(error)
          throw new Error(`Falha ao salvar a mensagem: ${detail}`)
        }

        sentMessages.push(sent)
        setUploadProgress(Math.round(((index + 1) / queue.length) * 100))
      }

      if (sentMessages.length) {
        setMessages((current) => [...current, ...sentMessages])
      }

      playMessageSound(620)

      try {
        await markMessagesAsRead()
      } catch (error) {
        console.error('Falha ao atualizar leitura apos envio:', error)
        // Read receipts are secondary. A send that already succeeded should not fail visibly here.
      }
    } catch (error) {
      console.error('Falha detalhada no envio:', error)
      toast.error(error instanceof Error ? error.message : 'Falha ao enviar a mensagem.')
    } finally {
      setSending(false)
      setUploadProgress(0)
      await sendTypingSignal(user.id, false)
    }
  }

  const handleTyping = async (active: boolean) => {
    if (!user) {
      return
    }

    if (typingTimeout.current) {
      window.clearTimeout(typingTimeout.current)
    }

    await sendTypingSignal(user.id, active)

    if (active) {
      typingTimeout.current = window.setTimeout(() => {
        void sendTypingSignal(user.id, false)
      }, 1500)
    }
  }

  const handleToggleFavorite = async (message: MessageRecord) => {
    if (!user) {
      return
    }

    try {
      await toggleFavorite(user.id, message)
      setMessages(await getMessages())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível favoritar.')
    }
  }

  const onlineIds = new Set(presence.filter((entry) => entry.online).map((entry) => entry.userId))

  return {
    messages,
    profiles,
    partner,
    loading,
    sending,
    uploadProgress,
    typingUserId,
    onlineIds,
    partnerPresence,
    handleSendMessage,
    handleTyping,
    handleToggleFavorite,
  }
}
