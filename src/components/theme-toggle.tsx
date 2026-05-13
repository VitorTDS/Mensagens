import { Check, ImagePlus, Palette, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTheme } from '../hooks/use-theme'
import { compressImageToDataUrl } from '../lib/image'
import type { ThemeMode } from '../types'

const themes: Array<{ value: ThemeMode; label: string; preview: string }> = [
  { value: 'whatsapp-dark', label: 'WhatsApp Escuro', preview: 'linear-gradient(135deg, #0b141a, #202c33)' },
  { value: 'whatsapp-light', label: 'WhatsApp Claro', preview: 'linear-gradient(135deg, #efeae2, #ffffff)' },
  { value: 'midnight', label: 'Noite', preview: 'linear-gradient(135deg, #030712, #1e293b)' },
  { value: 'sunset', label: 'Por do sol', preview: 'linear-gradient(135deg, #fff1e6, #ffc0b8)' },
]

const wallpapers = [
  {
    value: 'dots',
    label: 'Pontos',
    preview:
      'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.04))',
    size: '18px 18px, 100% 100%',
  },
  {
    value: 'grid',
    label: 'Grade',
    preview:
      'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
    size: '18px 18px',
  },
  {
    value: 'plain',
    label: 'Limpo',
    preview: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
    size: '100% 100%',
  },
  {
    value: 'custom',
    label: 'Imagem',
    preview: 'linear-gradient(135deg, rgba(37,211,102,0.3), rgba(125,211,252,0.3))',
    size: '100% 100%',
  },
]

export function ThemeToggle() {
  const {
    theme,
    setTheme,
    wallpaper,
    setWallpaper,
    wallpaperImage,
    setWallpaperImage,
    wallpaperOpacity,
    setWallpaperOpacity,
    wallpaperFit,
    setWallpaperFit,
  } = useTheme()
  const [open, setOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const handleThemeSelect = (value: ThemeMode) => {
    setTheme(value)
    setOpen(false)
  }

  const handleWallpaperSelect = (value: string) => {
    setWallpaper(value)
    setOpen(false)
  }

  const handleWallpaperUpload = async (file: File | null) => {
    if (!file) return
    const dataUrl = await compressImageToDataUrl(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.82,
    })
    setWallpaperImage(dataUrl)
    setWallpaper('custom')
    setOpen(false)
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 text-[var(--text-primary)] shadow-soft backdrop-blur-xl"
        aria-expanded={open}
        aria-label="Abrir configuracoes visuais"
      >
        <Palette className="h-4 w-4 text-[var(--text-muted)]" />
        <span className="hidden sm:inline text-sm">Tema</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+12px)] z-40 w-[min(340px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--panel-bg-strong)] p-4 text-[var(--text-primary)] shadow-glow backdrop-blur-2xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Temas</p>
            <div className="mt-3 grid gap-2">
              {themes.map((option) => {
                const active = option.value === theme

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleThemeSelect(option.value)}
                    className="flex min-w-0 items-center justify-between rounded-2xl border px-3 py-3 text-left transition"
                    style={{
                      borderColor: active ? 'var(--accent)' : 'var(--panel-border)',
                      background: active ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'var(--surface-muted)',
                    }}
                  >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="h-5 w-5 rounded-full" style={{ background: option.preview }} />
                        <span className="truncate text-sm">{option.label}</span>
                      </span>
                    {active ? <Check className="h-4 w-4 text-[var(--accent)]" /> : null}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Wallpaper</p>
              {wallpaper === 'custom' && wallpaperImage ? (
                <button
                  type="button"
                  onClick={() => {
                    setWallpaperImage(null)
                    setWallpaper('plain')
                    setOpen(false)
                  }}
                  className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]"
                >
                  <X className="h-3.5 w-3.5" />
                  Remover
                </button>
              ) : null}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {wallpapers.map((option) => {
                const active = option.value === wallpaper
                const isCustom = option.value === 'custom'
                const previewStyle = isCustom && wallpaperImage
                  ? { backgroundImage: `url(${wallpaperImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { backgroundImage: option.preview, backgroundSize: option.size }

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (isCustom) {
                        fileRef.current?.click()
                        return
                      }
                      handleWallpaperSelect(option.value)
                    }}
                    className="rounded-2xl border p-2 text-left transition"
                    style={{
                      borderColor: active ? 'var(--accent)' : 'var(--panel-border)',
                      background: active ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--surface-muted)',
                    }}
                  >
                    <div className="h-16 rounded-xl border border-[var(--panel-border)]" style={previewStyle} />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs">{option.label}</span>
                      {active ? <Check className="h-3.5 w-3.5 text-[var(--accent)]" /> : null}
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--surface-muted)] px-3 py-2 text-xs"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Escolher imagem
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                void handleWallpaperUpload(event.target.files?.[0] ?? null)
                event.currentTarget.value = ''
              }}
            />
          </div>

          {wallpaper === 'custom' && wallpaperImage ? (
            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>Opacidade</span>
                  <span>{Math.round((1 - wallpaperOpacity) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.45"
                  step="0.01"
                  value={wallpaperOpacity}
                  onChange={(event) => setWallpaperOpacity(Number(event.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <p className="mb-2 text-xs text-[var(--text-muted)]">Ajuste</p>
                <div className="flex gap-2">
                  {(['cover', 'contain'] as const).map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => setWallpaperFit(fit)}
                      className="rounded-full border px-3 py-2 text-xs"
                      style={{
                        borderColor: wallpaperFit === fit ? 'var(--accent)' : 'var(--panel-border)',
                        background:
                          wallpaperFit === fit
                            ? 'color-mix(in srgb, var(--accent) 12%, transparent)'
                            : 'var(--surface-muted)',
                      }}
                    >
                      {fit === 'cover' ? 'Preencher' : 'Ajustar'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
