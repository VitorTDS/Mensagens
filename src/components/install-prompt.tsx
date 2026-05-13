import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!promptEvent) {
    return null
  }

  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await promptEvent.prompt()
        setPromptEvent(null)
      }}
      className="gap-2 px-3 sm:px-4"
    >
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Instalar app</span>
    </Button>
  )
}
