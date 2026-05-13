import { motion } from 'framer-motion'
import { Heart, MessageCircleHeart, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChatInput } from '../components/chat-input'
import { MessageBubble } from '../components/message-bubble'
import { StatusPill } from '../components/status-pill'
import { Avatar } from '../components/ui/avatar'
import { EmptyState } from '../components/ui/empty-state'
import { useChatContext } from '../hooks/use-chat-context'
import { useSession } from '../hooks/use-session'
import { useTheme } from '../hooks/use-theme'
import { formatChatDay, fromNow } from '../lib/date'

export function ChatPage() {
  const { user } = useSession()
  const { wallpaper, wallpaperImage, wallpaperFit, wallpaperOpacity } = useTheme()
  const {
    messages,
    partner,
    partnerPresence,
    profiles,
    loading,
    sending,
    uploadProgress,
    typingUserId,
    onlineIds,
    handleSendMessage,
    handleTyping,
    handleToggleFavorite,
  } = useChatContext()
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const messageRefs = useRef(new Map<string, HTMLDivElement>())
  const [showHearts, setShowHearts] = useState(false)
  const [replyingTo, setReplyingTo] = useState<{
    id: string
    senderName: string
    content: string
    mediaType?: 'image' | 'video' | null
  } | null>(null)
  const [activeMedia, setActiveMedia] = useState<{
    url: string
    type: 'image' | 'video'
    name?: string | null
  } | null>(null)
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUserId])

  useEffect(() => {
    if (!highlightedMessageId) {
      return
    }

    const timeout = window.setTimeout(() => setHighlightedMessageId(null), 1800)
    return () => window.clearTimeout(timeout)
  }, [highlightedMessageId])

  const messageAuthors = useMemo(
    () => new Map(profiles.map((profile) => [profile.id, profile])),
    [profiles],
  )
  const messagesById = useMemo(
    () => new Map(messages.map((message) => [message.id, message])),
    [messages],
  )
  const firstUnreadIncomingId = useMemo(
    () => messages.find((message) => message.sender_id !== user?.id && !message.read)?.id ?? null,
    [messages, user?.id],
  )

  if (!user) {
    return null
  }

  const wallpaperStyle =
    wallpaper === 'plain'
      ? undefined
      : wallpaper === 'custom' && wallpaperImage
        ? {
            backgroundImage: `linear-gradient(rgba(0,0,0,${wallpaperOpacity}), rgba(0,0,0,${Math.max(
              0.03,
              wallpaperOpacity - 0.04,
            )})), url(${wallpaperImage})`,
            backgroundSize: `100% 100%, ${wallpaperFit}`,
            backgroundPosition: '0 0, center',
            backgroundRepeat: 'no-repeat, no-repeat',
          }
      : wallpaper === 'grid'
        ? {
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(180deg, transparent, rgba(0,0,0,0.03))',
            backgroundSize: '24px 24px, 24px 24px, 100% 100%',
          }
        : {
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(180deg, transparent, rgba(0,0,0,0.03))',
            backgroundPosition: '0 0, 11px 11px, 0 0',
            backgroundSize: '22px 22px, 22px 22px, 100% 100%',
          }

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {showHearts ? (
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
          {Array.from({ length: 16 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ y: '100%', opacity: 0, x: `${index * 6}%` }}
              animate={{ y: '-20%', opacity: [0, 1, 0], x: `${index * 6 + 10}%` }}
              transition={{ duration: 2.2, ease: 'easeOut', delay: index * 0.05 }}
              className="absolute bottom-0 text-2xl"
            >
              💖
            </motion.div>
          ))}
        </div>
      ) : null}

      <div className="border-b border-[var(--panel-border)] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={partner?.name ?? 'Seu amor'} src={partner?.avatar} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-display text-2xl text-[var(--text-primary)] sm:text-3xl">{partner?.name ?? 'Seu amor'}</p>
              <div className="mt-1 flex items-center gap-2">
                <StatusPill
                  online={partner ? onlineIds.has(partner.id) : false}
                  label={typingUserId === partner?.id ? 'digitando...' : partner && onlineIds.has(partner.id) ? 'online' : 'offline'}
                />
                {partner && partnerPresence ? (
                  <span className="text-xs text-[var(--text-muted)]">
                    {partnerPresence.online ? 'online agora' : `visto ${fromNow(partnerPresence.lastSeen ?? new Date().toISOString())}`}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
              espaco seguro para dois
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 sm:px-6" style={wallpaperStyle}>
        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-[1.8rem] bg-[var(--surface-muted)]" />
            ))}
          </div>
        ) : messages.length ? (
          <div className="space-y-5">
            {messages.map((message, index) => {
              const previous = messages[index - 1]
              const next = messages[index + 1]
              const groupedWithPrevious =
                previous?.sender_id === message.sender_id
              const groupedWithNext =
                next?.sender_id === message.sender_id
              const showDaySeparator =
                !previous ||
                new Date(previous.created_at).toDateString() !== new Date(message.created_at).toDateString()
              const isFirstUnreadIncoming = message.id === firstUnreadIncomingId
              const repliedMessage = message.reply_to_message_id ? messagesById.get(message.reply_to_message_id) : null
              const replyPreview = repliedMessage
                ? {
                    senderName:
                      repliedMessage.sender_id === user.id
                        ? 'Voce'
                        : messageAuthors.get(repliedMessage.sender_id)?.name ?? 'Pessoa',
                    content: repliedMessage.content,
                    mediaType: repliedMessage.media_type,
                  }
                : null
              const jumpToReply = () => {
                if (!message.reply_to_message_id) {
                  return
                }

                const target = messageRefs.current.get(message.reply_to_message_id)
                if (!target) {
                  return
                }

                target.scrollIntoView({ behavior: 'smooth', block: 'center' })
                setHighlightedMessageId(message.reply_to_message_id)
              }

              return (
                <div
                  key={message.id}
                  ref={(node) => {
                    if (node) {
                      messageRefs.current.set(message.id, node)
                    } else {
                      messageRefs.current.delete(message.id)
                    }
                  }}
                >
                  {showDaySeparator ? (
                    <div className="my-4 flex items-center justify-center">
                      <span className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-1 text-[11px] font-medium capitalize tracking-[0.08em] text-[var(--text-muted)] shadow-soft">
                        {formatChatDay(message.created_at)}
                      </span>
                    </div>
                  ) : null}
                  {isFirstUnreadIncoming ? (
                    <div className="my-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-[var(--panel-border)]" />
                      <span className="rounded-full bg-[var(--accent)]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                        Mensagens nao lidas
                      </span>
                      <div className="h-px flex-1 bg-[var(--panel-border)]" />
                    </div>
                  ) : null}
                  <MessageBubble
                    message={message}
                    isOwn={message.sender_id === user.id}
                    sender={messageAuthors.get(message.sender_id)}
                    isFavorite={message.favorite_by.includes(user.id)}
                    groupedWithPrevious={groupedWithPrevious}
                    groupedWithNext={groupedWithNext}
                    highlighted={highlightedMessageId === message.id}
                    replyPreview={replyPreview}
                    onFavorite={() => void handleToggleFavorite(message)}
                    onReply={() =>
                      setReplyingTo({
                        id: message.id,
                        senderName: message.sender_id === user.id ? 'Voce' : messageAuthors.get(message.sender_id)?.name ?? 'Pessoa',
                        content: message.content,
                        mediaType: message.media_type,
                      })
                    }
                    onJumpToReply={jumpToReply}
                    onOpenMedia={setActiveMedia}
                  />
                </div>
              )
            })}
            {typingUserId && typingUserId !== user.id ? (
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                {partner?.name ?? 'Seu amor'} esta digitando...
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        ) : (
          <EmptyState
            title="Comecem a conversa"
            description="A primeira mensagem pode ser simples. O importante e abrir um lugar que voces queiram visitar todo dia."
            icon={<MessageCircleHeart className="h-8 w-8 text-[var(--accent)]" />}
          />
        )}
      </div>

      <div className="shrink-0 px-4 pb-4 sm:px-6 sm:pb-6">
        <ChatInput
          disabled={sending}
          uploadProgress={uploadProgress}
          replyTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onTyping={handleTyping}
          onSubmit={async (content, files) => {
            await handleSendMessage(content, files, 'text', replyingTo?.id ?? null)
            setReplyingTo(null)
          }}
          onHeart={async () => {
            await handleSendMessage('Te mandei um coracao porque pensei em voce agora.', null, 'heart')
            setShowHearts(true)
            window.setTimeout(() => setShowHearts(false), 2200)
          }}
          onSaudade={() => handleSendMessage('Saudade de voce. Volta aqui no chat assim que puder 💌', null, 'saudade')}
        />

        <div className="mt-3 flex flex-col gap-2 px-2 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-[var(--accent)]" />
            Mensagens protegidas com criptografia basica.
          </span>
          <span>Atualizacao em tempo real pronta para Supabase Realtime.</span>
        </div>
      </div>

      {activeMedia ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/82 p-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setActiveMedia(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white"
            aria-label="Fechar midia"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex max-h-full w-full max-w-5xl flex-col items-center gap-3">
            {activeMedia.type === 'video' ? (
              <video
                src={activeMedia.url}
                controls
                autoPlay
                className="max-h-[78vh] w-full rounded-[2rem] bg-black object-contain"
              />
            ) : (
              <img
                src={activeMedia.url}
                alt={activeMedia.name ?? 'Midia ampliada'}
                className="max-h-[78vh] w-full rounded-[2rem] object-contain"
              />
            )}
            {activeMedia.name ? <p className="text-sm text-white/80">{activeMedia.name}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
