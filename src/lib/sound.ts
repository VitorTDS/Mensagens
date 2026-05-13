let audioContext: AudioContext | null = null

export function playMessageSound(frequency = 660) {
  if (typeof window === 'undefined') {
    return
  }

  const Context = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Context) {
    return
  }

  audioContext ??= new Context()
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.value = 0.02

  oscillator.connect(gain)
  gain.connect(audioContext.destination)

  oscillator.start()
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.22)
  oscillator.stop(audioContext.currentTime + 0.24)
}
