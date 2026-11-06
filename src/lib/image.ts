export async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function compressImageToDataUrl(
  file: File,
  options: { maxWidth: number; maxHeight: number; quality?: number },
) {
  const source = await fileToDataUrl(file)

  return new Promise<string>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(
        1,
        options.maxWidth / image.width,
        options.maxHeight / image.height,
      )
      const width = Math.max(1, Math.round(image.width * scale))
      const height = Math.max(1, Math.round(image.height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('Nao foi possivel processar a imagem.'))
        return
      }

      context.drawImage(image, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', options.quality ?? 0.82))
    }
    image.onerror = () => reject(new Error('Nao foi possivel ler a imagem.'))
    image.src = source
  })
}

export interface CropAdjustment {
  scale: number
  offsetX: number
  offsetY: number
}

// Posicao da imagem dentro de um quadrado de lado `size`. A imagem sempre cobre
// o quadrado e comeca centralizada. Os offsets vao de -100 a 100 e representam
// a parte da sobra usada, entao o mesmo ajuste vale para qualquer tamanho.
export function getCropRect(
  imageWidth: number,
  imageHeight: number,
  size: number,
  { scale, offsetX, offsetY }: CropAdjustment,
) {
  const ratio = (size / Math.min(imageWidth, imageHeight)) * scale
  const width = imageWidth * ratio
  const height = imageHeight * ratio

  return {
    x: ((size - width) / 2) * (1 - offsetX / 100),
    y: ((size - height) / 2) * (1 - offsetY / 100),
    width,
    height,
  }
}

export async function cropImageToDataUrl(
  source: string,
  options: CropAdjustment & { size: number; quality?: number },
) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = options.size
      canvas.height = options.size
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('Nao foi possivel editar a imagem.'))
        return
      }

      const { x, y, width, height } = getCropRect(image.width, image.height, options.size, options)
      context.drawImage(image, x, y, width, height)
      resolve(canvas.toDataURL('image/jpeg', options.quality ?? 0.88))
    }
    image.onerror = () => reject(new Error('Nao foi possivel carregar a imagem.'))
    image.src = source
  })
}

export async function generateVideoThumbnail(file: File, seekTo = 0.1) {
  const objectUrl = URL.createObjectURL(file)

  return new Promise<string>((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.src = objectUrl

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl)
    }

    video.onloadeddata = () => {
      video.currentTime = Math.min(seekTo, Math.max(0, video.duration || seekTo))
    }

    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 320
      canvas.height = video.videoHeight || 180
      const context = canvas.getContext('2d')
      if (!context) {
        cleanup()
        reject(new Error('Nao foi possivel gerar thumbnail do video.'))
        return
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      cleanup()
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }

    video.onerror = () => {
      cleanup()
      reject(new Error('Nao foi possivel gerar thumbnail do video.'))
    }
  })
}
