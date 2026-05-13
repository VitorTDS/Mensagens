import { motion } from 'framer-motion'
import { Check, CornerUpLeft, Download, Heart, Play } from 'lucide-react'
import { useState } from 'react'
import { formatTime } from '../lib/date'
import { cn } from '../lib/utils'
import type { MessageRecord, UserProfile } from '../types'
import { Avatar } from './ui/avatar'

interface MessageBubbleProps {
  message: MessageRecord
  isOwn: boolean
  sender?: UserProfile
  onFavorite: () => void
  onReply: () => void
  onJumpToReply?: () => void
  onOpenMedia?: (media: { url: string; type: 'image' | 'video'; name?: string | null }) => void
  isFavorite: boolean
  groupedWithPrevious?: boolean
  groupedWithNext?: boolean
  highlighted?: boolean
  replyPreview?: {
    senderName: string
    content: string
    mediaType?: 'image' | 'video' | null
  } | null
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function MessageBubble({
  message,
  isOwn,
  sender,
  onFavorite,
  onReply,
  onJumpToReply,
  onOpenMedia,
  isFavorite,
  groupedWithPrevious = false,
  groupedWithNext = false,
  highlighted = false,
  replyPreview,
}: MessageBubbleProps) {
  const isVideo = message.media_type === 'video'
  const [videoError, setVideoError] = useState(false)
  const mediaMeta = [message.media_name, formatBytes(message.media_size)].filter(Boolean).join(' · ')
  const contentLength = message.content.trim().length
  const hasMedia = Boolean(message.image_url)
  const compactBubble = !hasMedia && contentLength > 0 && contentLength <= 12

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: groupedWithPrevious ? 4 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={cn(
        'flex gap-3',
        groupedWithPrevious ? 'mt-1' : 'mt-4',
        isOwn && 'justify-end',
      )}
    >
      {!isOwn ? (
        groupedWithNext ? (
          <div className="h-9 w-9 shrink-0" />
        ) : (
          <Avatar name={sender?.name ?? 'Pessoa'} src={sender?.avatar} size="sm" />
        )
      ) : null}
      <div className={cn('flex w-fit max-w-[84%] flex-col sm:max-w-[70%]', isOwn && 'items-end self-end')}>
        <div className={cn('relative px-1', isOwn ? 'text-right' : 'text-left')}>
          <div
            className={cn(
              'relative inline-block max-w-full rounded-[1.2rem] shadow-soft',
              compactBubble ? 'px-3 py-2' : 'px-4 py-3',
              hasMedia && isFavorite && 'ring-2 ring-rose-300/60 ring-offset-2 ring-offset-transparent',
              highlighted && 'ring-2 ring-[var(--accent)]/70 ring-offset-2 ring-offset-transparent transition',
              isOwn
                ? cn(
                    'border border-[var(--bubble-own-border)] bg-[var(--bubble-own-bg)] text-[var(--bubble-own-text)]',
                    groupedWithNext ? 'rounded-br-[1.2rem]' : 'rounded-br-[0.35rem]',
                  )
                : cn(
                    'border border-[var(--bubble-other-border)] bg-[var(--bubble-other-bg)] text-[var(--bubble-other-text)]',
                    groupedWithNext ? 'rounded-bl-[1.2rem]' : 'rounded-bl-[0.35rem]',
                  ),
            )}
          >
            {!groupedWithNext ? (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute bottom-0 h-3 w-3 rotate-45',
                  isOwn
                    ? 'right-[-3px] border-r border-b border-[var(--bubble-own-border)] bg-[var(--bubble-own-bg)]'
                    : 'left-[-3px] border-l border-b border-[var(--bubble-other-border)] bg-[var(--bubble-other-bg)]',
                )}
              />
            ) : null}

            {message.kind === 'heart' && <div className="mb-2 text-2xl">💗</div>}
            {message.kind === 'saudade' && (
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
                saudade enviada
              </div>
            )}
            {replyPreview ? (
              <button
                type="button"
                onClick={onJumpToReply}
                className="mb-3 block w-full rounded-2xl border border-[var(--panel-border)] bg-black/10 px-3 py-2 text-left transition hover:bg-black/15"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                  {replyPreview.senderName}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-current/80">
                  {replyPreview.content ||
                    (replyPreview.mediaType === 'video'
                      ? 'Video'
                      : replyPreview.mediaType === 'image'
                        ? 'Foto'
                        : 'Mensagem')}
                </p>
              </button>
            ) : null}
            {message.image_url ? (
              isVideo ? (
                <div className="relative mb-3 w-[min(72vw,22rem)] max-w-full overflow-hidden rounded-2xl sm:w-[min(26rem,60vw)]">
                  {!videoError ? (
                    <>
                      <video
                        src={message.image_url}
                        controls
                        preload="metadata"
                        className="max-h-80 w-full rounded-2xl bg-black object-cover"
                        onError={() => setVideoError(true)}
                      />
                      <button
                        type="button"
                        onClick={() => onOpenMedia?.({ url: message.image_url!, type: 'video', name: message.media_name })}
                        className="absolute right-3 top-3 rounded-full bg-black/55 p-2 text-white"
                        aria-label="Abrir video"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </button>
                      <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                        <Play className="h-3 w-3 fill-current" />
                        video
                      </span>
                    </>
                  ) : (
                    <div className="rounded-2xl bg-black/40 p-4 text-left text-sm text-white">
                      <p>Este navegador nao conseguiu reproduzir este video.</p>
                      <a
                        href={message.image_url}
                        download={message.media_name ?? true}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Baixar video
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenMedia?.({ url: message.image_url!, type: 'image', name: message.media_name })}
                  className="block"
                >
                  <img
                    src={message.image_url}
                    alt="Midia enviada"
                    className="mb-3 h-auto w-[min(72vw,22rem)] max-w-full rounded-2xl object-cover sm:w-[min(26rem,60vw)]"
                  />
                </button>
              )
            ) : null}
            {mediaMeta ? <p className="mb-2 text-xs text-[var(--text-muted)]">{mediaMeta}</p> : null}
            {message.content ? (
              <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
            ) : null}

            <div
              className={cn(
                'mt-2 flex items-center gap-1 text-[11px]',
                isOwn ? 'justify-end text-[var(--text-soft)]' : 'justify-end text-[var(--text-muted)]',
              )}
            >
              <span>{formatTime(message.created_at)}</span>
              {isOwn ? (
                <span className={cn('inline-flex items-center', message.read ? 'text-sky-300' : 'text-[var(--text-soft)]')}>
                  <Check className="h-3.5 w-3.5" />
                  <Check className="-ml-1.5 h-3.5 w-3.5" />
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'mt-2 flex items-center gap-2 px-2 text-xs',
            isOwn ? 'justify-end text-[var(--text-muted)]' : 'text-[var(--text-soft)]',
          )}
        >
          {!groupedWithPrevious ? <span>{sender?.name}</span> : null}
          <button type="button" onClick={onReply} className="transition hover:scale-110" aria-label="Responder mensagem">
            <CornerUpLeft className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onFavorite} className="transition hover:scale-110">
            <Heart className={cn('h-3.5 w-3.5', isFavorite && 'fill-rose-300 text-rose-300')} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
