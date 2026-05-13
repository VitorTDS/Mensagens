import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { formatDay } from '../lib/date'
import type { MemoryRecord } from '../types'

export function MemoryCard({ memory }: { memory: MemoryRecord }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-w-0 overflow-hidden rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-soft backdrop-blur-xl sm:rounded-[2rem]"
    >
      <img src={memory.image_url} alt={memory.title} className="h-48 w-full object-cover sm:h-56" />
      <div className="p-5 text-[var(--text-primary)]">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <CalendarDays className="h-4 w-4" />
          {formatDay(memory.created_at)}
        </div>
        <h3 className="mt-3 break-words font-display text-2xl sm:text-3xl">{memory.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{memory.description}</p>
      </div>
    </motion.article>
  )
}
