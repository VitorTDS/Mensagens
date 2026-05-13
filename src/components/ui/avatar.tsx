import { getInitials } from '../../lib/utils'

interface AvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
  }

  return src ? (
    <img
      src={src}
      alt={name}
      className={`${sizes[size]} rounded-2xl border border-white/20 object-cover shadow-soft`}
    />
  ) : (
    <div
      className={`${sizes[size]} flex items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-rose-200 to-purple-200 font-semibold text-ink shadow-soft`}
    >
      {getInitials(name)}
    </div>
  )
}
