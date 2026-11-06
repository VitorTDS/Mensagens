import { type MouseEvent, useLayoutEffect, useRef, useState } from 'react'

export function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [zoomPoint, setZoomPoint] = useState<{ x: number; y: number } | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)

  // Depois de ampliar, leva o ponto tocado para o meio da area visivel.
  useLayoutEffect(() => {
    const box = boxRef.current
    if (box && zoomPoint) {
      box.scrollLeft = zoomPoint.x * box.scrollWidth - box.clientWidth / 2
      box.scrollTop = zoomPoint.y * box.scrollHeight - box.clientHeight / 2
    }
  }, [zoomPoint])

  const handleClick = (event: MouseEvent<HTMLImageElement>) => {
    if (zoomPoint) {
      setZoomPoint(null)
      return
    }

    const image = event.currentTarget.getBoundingClientRect()
    setZoomPoint({
      x: (event.clientX - image.left) / image.width,
      y: (event.clientY - image.top) / image.height,
    })
  }

  return (
    <div ref={boxRef} className="max-h-[78vh] w-full overflow-auto rounded-[2rem]">
      <img
        src={src}
        alt={alt}
        onClick={handleClick}
        className={
          zoomPoint
            ? 'w-[250%] max-w-none cursor-zoom-out'
            : 'max-h-[78vh] w-full cursor-zoom-in object-contain'
        }
      />
    </div>
  )
}
