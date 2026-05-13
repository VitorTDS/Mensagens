import { registerSW } from 'virtual:pwa-register'

export function registerPwa() {
  registerSW({
    immediate: true,
    onOfflineReady() {
      console.info('MoonChat pronto para uso offline.')
    },
  })
}
