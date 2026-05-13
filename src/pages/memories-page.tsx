import { Images } from 'lucide-react'
import { AddMemoryDialog } from '../components/add-memory-dialog'
import { MemoryCard } from '../components/memory-card'
import { EmptyState } from '../components/ui/empty-state'
import { useMemories } from '../hooks/use-memories'

export function MemoriesPage() {
  const { memories, loading, createMemory } = useMemories()

  return (
    <div className="flex min-w-0 flex-1 flex-col px-4 py-5 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-[0.32em] text-[var(--text-muted)]">memorias</p>
          <h2 className="mt-2 font-display text-4xl text-[var(--text-primary)] sm:text-5xl">Mural de lembrancas</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
            Guarde fotos, frases e pequenos capitulos que voces querem revisitar com carinho.
          </p>
        </div>
        <AddMemoryDialog onSave={createMemory} />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-[2rem] bg-[var(--surface-muted)]" />
          ))}
        </div>
      ) : memories.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma lembranca ainda"
          description="Adicione a primeira foto do mural e transforme o app em um album vivo."
          icon={<Images className="h-8 w-8 text-[var(--accent)]" />}
        />
      )}
    </div>
  )
}
