import { registerSW } from 'virtual:pwa-register'
import { APP_NAME } from './constants'

export function registerPwa() {
  registerSW({
    immediate: true,
    onOfflineReady() {
      console.info(`${APP_NAME} pronto para uso offline.`)
    },
  })
}
