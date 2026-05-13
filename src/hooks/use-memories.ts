import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { addMemory, getMemories, uploadImage } from '../services/chat'
import type { MemoryRecord } from '../types'

export function useMemories() {
  const [memories, setMemories] = useState<MemoryRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void getMemories()
      .then(setMemories)
      .finally(() => setLoading(false))
  }, [])

  const createMemory = async (params: {
    title: string
    description: string
    file: File
  }) => {
    try {
      const imageUrl = await uploadImage(params.file)
      const created = await addMemory({
        title: params.title,
        description: params.description,
        image_url: imageUrl,
      })
      setMemories((current) => [created, ...current])
      toast.success('Lembrança adicionada.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao salvar a lembrança.')
    }
  }

  return {
    memories,
    loading,
    createMemory,
  }
}
