import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' &&
          'bg-[var(--accent)] text-[var(--bubble-own-text)] shadow-soft hover:translate-y-[-1px] hover:brightness-105',
        variant === 'secondary' &&
          'border border-[var(--panel-border)] bg-[var(--surface-muted)] text-[var(--text-primary)] backdrop-blur-xl hover:opacity-90',
        variant === 'ghost' && 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]',
        className,
      )}
      {...props}
    />
  )
}
