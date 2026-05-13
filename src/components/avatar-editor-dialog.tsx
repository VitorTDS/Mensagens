import { useEffect, useMemo, useState } from 'react'
import { Button } from './ui/button'
import { cropImageToDataUrl } from '../lib/image'

interface AvatarEditorDialogProps {
  source: string | null
  open: boolean
  onClose: () => void
  onSave: (avatar: string) => Promise<void>
  onRestoreDefault?: () => Promise<void>
}

export function AvatarEditorDialog({
  source,
  open,
  onClose,
  onSave,
  onRestoreDefault,
}: AvatarEditorDialogProps) {
  const [scale, setScale] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setScale(1)
      setOffsetX(0)
      setOffsetY(0)
    }
  }, [open, source])

  const previewStyle = useMemo(
    () =>
      source
        ? {
            backgroundImage: `url(${source})`,
            backgroundPosition: `calc(50% + ${offsetX}px) calc(50% + ${offsetY}px)`,
            backgroundSize: `${scale * 100}%`,
          }
        : undefined,
    [offsetX, offsetY, scale, source],
  )

  if (!open || !source) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--panel-bg-strong)] p-5 text-[var(--text-primary)] shadow-glow sm:rounded-[2rem] sm:p-6">
        <h3 className="font-display text-2xl sm:text-3xl">Ajustar foto</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Centralize o rosto e salve a versao final.</p>

        <div className="mt-5 flex justify-center">
          <div className="h-44 w-44 overflow-hidden rounded-full border-4 border-[var(--panel-border)] bg-[var(--surface-muted)] sm:h-56 sm:w-56">
            <div className="h-full w-full bg-center bg-no-repeat" style={previewStyle} />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block text-sm text-[var(--text-secondary)]">
            Zoom
            <input
              type="range"
              min="1"
              max="2.4"
              step="0.01"
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
              className="mt-2 w-full"
            />
          </label>
          <label className="block text-sm text-[var(--text-secondary)]">
            Horizontal
            <input
              type="range"
              min="-120"
              max="120"
              step="1"
              value={offsetX}
              onChange={(event) => setOffsetX(Number(event.target.value))}
              className="mt-2 w-full"
            />
          </label>
          <label className="block text-sm text-[var(--text-secondary)]">
            Vertical
            <input
              type="range"
              min="-120"
              max="120"
              step="1"
              value={offsetY}
              onChange={(event) => setOffsetY(Number(event.target.value))}
              className="mt-2 w-full"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          {onRestoreDefault ? (
            <Button
              variant="secondary"
              className="flex-1"
              disabled={saving}
              onClick={async () => {
                setSaving(true)
                try {
                  await onRestoreDefault()
                  onClose()
                } finally {
                  setSaving(false)
                }
              }}
            >
              Padrao
            </Button>
          ) : null}
          <Button
            className="flex-1"
            disabled={saving}
            onClick={async () => {
              setSaving(true)
              try {
                const avatar = await cropImageToDataUrl(source, {
                  size: 512,
                  scale,
                  offsetX,
                  offsetY,
                  quality: 0.86,
                })
                await onSave(avatar)
                onClose()
              } finally {
                setSaving(false)
              }
            }}
          >
            {saving ? 'Salvando...' : 'Salvar foto'}
          </Button>
        </div>
      </div>
    </div>
  )
}
