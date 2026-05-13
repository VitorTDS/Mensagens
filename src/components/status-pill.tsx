import { cn } from '../lib/utils'

interface StatusPillProps {
  online: boolean
  label: string
}

export function StatusPill({ online, label }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-xl',
        online
          ? 'bg-emerald-400/15 text-emerald-300'
          : 'bg-[var(--surface-muted)] text-[var(--text-muted)]',
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', online ? 'bg-emerald-300' : 'bg-[var(--text-soft)]')} />
      {label}
    </span>
  )
}
