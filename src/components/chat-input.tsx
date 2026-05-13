import { ImagePlus, SendHorizonal, Smile, Video, X } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { generateVideoThumbnail } from '../lib/image'
import { Button } from './ui/button'

const EmojiPicker = lazy(() => import('emoji-picker-react'))

interface ChatInputProps {
  disabled?: boolean
  uploadProgress?: number
  replyTo?: {
    id: string
    senderName: string
    content: string
    mediaType?: 'image' | 'video' | null
  } | null
  onCancelReply?: () => void
  onSubmit: (content: string, files?: File[] | null) => Promise<void>
  onTyping: (active: boolean) => Promise<void>
  onHeart: () => Promise<void>
  onSaudade: () => Promise<void>
}

export function ChatInput({
  disabled,
  uploadProgress = 0,
  replyTo,
  onCancelReply,
  onSubmit,
  onTyping,
  onHeart,
  onSaudade,
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [videoThumbnails, setVideoThumbnails] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (!files.length) {
      setPreviewUrls([])
      setVideoThumbnails({})
      return
    }

    const objectUrls = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls(objectUrls)

    void Promise.all(
      files.map(async (file) => {
        if (!file.type.startsWith('video/')) {
          return null
        }
        try {
          const thumbnail = await generateVideoThumbnail(file)
          return { key: file.name + file.size, thumbnail }
        } catch {
          return null
        }
      }),
    ).then((entries) => {
      const next: Record<string, string> = {}
      entries.forEach((entry) => {
        if (entry) next[entry.key] = entry.thumbnail
      })
      setVideoThumbnails(next)
    })

    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url))
  }, [files])

  return (
    <div className="sticky bottom-0 z-10 mt-6 min-w-0 rounded-[2rem] border border-[var(--panel-border)] bg-[var(--composer-bg)] p-3 shadow-glow backdrop-blur-2xl">
      {replyTo ? (
        <div className="mb-3 flex items-start justify-between gap-3 rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--surface-muted)] px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
              Respondendo para {replyTo.senderName}
            </p>
            <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
              {replyTo.content || (replyTo.mediaType === 'video' ? 'Video' : replyTo.mediaType === 'image' ? 'Foto' : 'Mensagem')}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="rounded-xl bg-[var(--panel-bg)] p-2 text-[var(--text-muted)]"
            aria-label="Cancelar resposta"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {files.length ? (
        <div className="mb-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {files.map((file, index) => {
              const previewUrl = previewUrls[index]
              const isVideo = file.type.startsWith('video/')
              const thumbnail = videoThumbnails[file.name + file.size]

              return (
                <div key={`${file.name}-${file.size}-${index}`} className="flex min-w-0 items-start justify-between gap-3 rounded-[1.5rem] bg-[var(--surface-muted)] p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {isVideo ? (
                      <div className="relative">
                        {thumbnail ? (
                          <img src={thumbnail} alt="Thumbnail do video" className="h-16 w-16 rounded-2xl object-cover" />
                        ) : (
                          <video src={previewUrl} className="h-16 w-16 rounded-2xl object-cover" muted />
                        )}
                        <span className="absolute inset-x-0 bottom-1 text-center text-[10px] font-medium text-white">VIDEO</span>
                      </div>
                    ) : (
                      <img src={previewUrl} alt="Preview" className="h-16 w-16 rounded-2xl object-cover" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {isVideo ? 'Video pronto para envio' : 'Foto pronta para envio'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                    className="rounded-xl bg-[var(--surface-muted)] p-2 text-[var(--text-muted)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>

          {disabled ? (
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Enviando midias</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--surface-muted)]">
                <div
                  className="h-2 rounded-full bg-[var(--accent)] transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-end gap-3">
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-2xl bg-[var(--surface-muted)] p-3 text-[var(--text-muted)] transition hover:opacity-90"
            aria-label="Enviar foto ou video"
          >
            {files.some((file) => file.type.startsWith('video/')) ? <Video className="h-5 w-5" /> : <ImagePlus className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={() => setShowEmoji((current) => !current)}
            className="rounded-2xl bg-[var(--surface-muted)] p-3 text-[var(--text-muted)] transition hover:opacity-90"
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>

        <div className="relative min-w-0 flex-1">
          {showEmoji ? (
            <div className="absolute bottom-[calc(100%+12px)] left-0 z-20">
              <Suspense fallback={<div className="rounded-3xl bg-[var(--panel-bg-strong)] px-6 py-10 text-sm text-[var(--text-muted)]">Carregando emojis...</div>}>
                <EmojiPicker
                  width={320}
                  height={380}
                  onEmojiClick={(emojiData) => {
                    setMessage((current) => `${current}${emojiData.emoji}`)
                    inputRef.current?.focus()
                  }}
                />
              </Suspense>
            </div>
          ) : null}

          <textarea
            ref={inputRef}
            value={message}
            autoFocus
            rows={1}
            disabled={disabled}
            onChange={(event) => {
              setMessage(event.target.value)
              void onTyping(Boolean(event.target.value))
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void onSubmit(message, files).then(() => {
                  setMessage('')
                  setFiles([])
                  inputRef.current?.focus()
                })
              }
            }}
            placeholder="Escreva algo bonito..."
            className="max-h-32 min-h-[54px] w-full resize-none rounded-[1.6rem] border-[var(--panel-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus:border-[var(--accent)] focus:ring-0"
          />
        </div>

        <div className="hidden gap-2 sm:flex">
          <Button variant="secondary" onClick={() => void onSaudade()}>
            Saudade
          </Button>
          <Button variant="secondary" onClick={() => void onHeart()}>
            💖
          </Button>
        </div>
        <Button
          onClick={() =>
            void onSubmit(message, files).then(() => {
              setMessage('')
              setFiles([])
              inputRef.current?.focus()
            })
          }
          disabled={disabled || (!message.trim() && !files.length)}
          className="h-[54px] w-[54px] rounded-2xl p-0"
        >
          <SendHorizonal className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-3 flex gap-2 sm:hidden">
        <Button variant="secondary" onClick={() => void onSaudade()} className="flex-1">
          Saudade
        </Button>
        <Button variant="secondary" onClick={() => void onHeart()} className="flex-1">
          Coracao
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(event) => {
          setFiles((current) => [...current, ...Array.from(event.target.files ?? [])])
          event.currentTarget.value = ''
        }}
      />
    </div>
  )
}
