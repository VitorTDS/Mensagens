/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, type PropsWithChildren } from 'react'
import type { ThemeMode } from '../types'

interface ThemeContextValue {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  wallpaper: string
  setWallpaper: (wallpaper: string) => void
  wallpaperImage: string | null
  setWallpaperImage: (wallpaperImage: string | null) => void
  wallpaperOpacity: number
  setWallpaperOpacity: (wallpaperOpacity: number) => void
  wallpaperFit: 'cover' | 'contain'
  setWallpaperFit: (wallpaperFit: 'cover' | 'contain') => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

const DEFAULT_THEME: ThemeMode = 'whatsapp-dark'
const DEFAULT_WALLPAPER = 'dots'
const WALLPAPER_IMAGE_KEY = 'moonchat-wallpaper-image'
const WALLPAPER_OPACITY_KEY = 'moonchat-wallpaper-opacity'
const WALLPAPER_FIT_KEY = 'moonchat-wallpaper-fit'

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('moonchat-theme') as ThemeMode | null
    return saved ?? DEFAULT_THEME
  })
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('moonchat-wallpaper') ?? DEFAULT_WALLPAPER)
  const [wallpaperImage, setWallpaperImage] = useState<string | null>(() => localStorage.getItem(WALLPAPER_IMAGE_KEY))
  const [wallpaperOpacity, setWallpaperOpacity] = useState(() => Number(localStorage.getItem(WALLPAPER_OPACITY_KEY) ?? '0.14'))
  const [wallpaperFit, setWallpaperFit] = useState<'cover' | 'contain'>(() => {
    const saved = localStorage.getItem(WALLPAPER_FIT_KEY)
    return saved === 'contain' ? 'contain' : 'cover'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.wallpaper = wallpaper
    document.documentElement.classList.toggle('dark', theme === 'midnight' || theme === 'whatsapp-dark')
    document.body.classList.toggle('light', theme === 'whatsapp-light' || theme === 'sunset')
    localStorage.setItem('moonchat-theme', theme)
    localStorage.setItem('moonchat-wallpaper', wallpaper)
    localStorage.setItem(WALLPAPER_OPACITY_KEY, String(wallpaperOpacity))
    localStorage.setItem(WALLPAPER_FIT_KEY, wallpaperFit)
    if (wallpaperImage) {
      localStorage.setItem(WALLPAPER_IMAGE_KEY, wallpaperImage)
    } else {
      localStorage.removeItem(WALLPAPER_IMAGE_KEY)
    }
  }, [theme, wallpaper, wallpaperFit, wallpaperImage, wallpaperOpacity])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        wallpaper,
        setWallpaper,
        wallpaperImage,
        setWallpaperImage,
        wallpaperOpacity,
        setWallpaperOpacity,
        wallpaperFit,
        setWallpaperFit,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
