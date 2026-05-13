import { ImageUp } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'

interface AddMemoryDialogProps {
  onSave: (params: { title: string; description: string; file: File }) => Promise<void>
}

export function AddMemoryDialog({ onSave }: AddMemoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <ImageUp className="h-4 w-4" />
        Nova lembranca
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--panel-bg-strong)] p-5 text-[var(--text-primary)] shadow-glow sm:rounded-[2rem] sm:p-6">
            <h3 className="font-display text-2xl sm:text-3xl">Guardar um momento</h3>
            <div className="mt-5 space-y-4">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Titulo"
                className="w-full rounded-2xl border-[var(--panel-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-soft)]"
              />
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descricao"
                rows={4}
                className="w-full rounded-2xl border-[var(--panel-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-soft)]"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="w-full rounded-2xl border border-[var(--panel-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--text-secondary)]"
              />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                disabled={!title.trim() || !description.trim() || !file}
                onClick={() =>
                  file &&
                  void onSave({ title: title.trim(), description: description.trim(), file }).then(() => {
                    setOpen(false)
                    setTitle('')
                    setDescription('')
                    setFile(null)
                  })
                }
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
