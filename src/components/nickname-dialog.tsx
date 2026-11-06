import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'

interface NicknameDialogProps {
  nickname: string | null
  onClose: () => void
  onSave: (nickname: string) => Promise<void>
}

export function NicknameDialog({ nickname, onClose, onSave }: NicknameDialogProps) {
  const [value, setValue] = useState(nickname ?? '')
  const [saving, setSaving] = useState(false)

  const save = async (next: string) => {
    setSaving(true)
    try {
      await onSave(next)
      onClose()
    } catch {
      toast.error('Não foi possível salvar o nome.')
      setSaving(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void save(value)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--panel-bg-strong)] p-5 shadow-glow"
      >
        <p className="font-display text-2xl text-[var(--text-primary)]">Nome do seu amor</p>
        <p className="mb-4 mt-1 text-sm text-[var(--text-muted)]">Esse nome aparece só para você.</p>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={40}
          autoFocus
          aria-label="Nome"
          placeholder="Como quer chamar?"
          className="w-full rounded-[1.4rem] border-[var(--panel-border)] bg-[var(--input-bg)] px-4 py-3 text-base text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus:border-[var(--accent)] focus:ring-0"
        />
        <div className="mt-4 flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" disabled={saving} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={saving || !value.trim()}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
        {nickname ? (
          <Button
            type="button"
            variant="ghost"
            className="mt-2 w-full"
            disabled={saving}
            onClick={() => void save('')}
          >
            Voltar ao nome original
          </Button>
        ) : null}
      </form>
    </div>
  )
}
