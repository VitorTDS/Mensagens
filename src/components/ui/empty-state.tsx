import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  icon: ReactNode
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-[var(--panel-border)] bg-[var(--surface-muted)] px-6 py-12 text-center text-[var(--text-secondary)] backdrop-blur-xl">
      <div className="mb-4 rounded-2xl bg-[var(--surface-muted)] p-4">{icon}</div>
      <h3 className="font-display text-3xl text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">{description}</p>
    </div>
  )
}
