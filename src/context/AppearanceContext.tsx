import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { setCssVars } from 'utils'
import {
  getFontSize,
  getFontFace,
  getColorTheme,
  ColorTheme,
  FontSize,
  FontFace,
  CalendarOpen,
  getCalendarIsOpen,
} from 'config'

interface AppearanceContextInterface {
  colorTheme: ColorTheme
  fontFace: FontFace
  fontSize: FontSize
  isCalendarOpen: CalendarOpen
  setColorTheme: (theme: ColorTheme) => void
  setFontSize: (size: FontSize) => void
  setFontFace: (size: FontFace) => void
  toggleIsCalendarOpen: () => void
}

const AppearanceContext = createContext<AppearanceContextInterface | null>(null)

type AppearanceProviderProps = {
  initialColorTheme: ColorTheme
  initialFontSize: FontSize
  initialFontFace: FontFace
  initialCalendarOpen: CalendarOpen
  children: any
}

export function AppearanceProvider({
  initialColorTheme,
  initialFontSize,
  initialFontFace,
  initialCalendarOpen,
  children,
}: AppearanceProviderProps) {
  const [colorTheme, setColorThemeInternal] = useState<ColorTheme>(initialColorTheme)
  const [fontFace, setFontFaceInternal] = useState<FontFace>(initialFontFace)
  const [fontSize, setFontSizeInternal] = useState<FontSize>(initialFontSize)
  const [isCalendarOpen, setIsCalendarOpenInternal] = useState<CalendarOpen>(initialCalendarOpen)

  const setFontFace = (face: FontFace) => {
    setFontFaceInternal(face)
    document.documentElement.style.setProperty('--appearance-fontFace', getFontFace(face))
    window.electronAPI.storeUserPreferences.set('appearance.fontFace', face)
  }

  const setFontSize = (size: FontSize) => {
    setFontSizeInternal(size)
    document.documentElement.style.setProperty('--appearance-fontSize', getFontSize(size) + 'px')
    window.electronAPI.storeUserPreferences.set('appearance.fontSize', size)
  }

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeInternal(theme)
    setCssVars(getColorTheme(theme))
    window.electronAPI.storeUserPreferences.set('appearance.theme', theme)
  }

  const toggleIsCalendarOpen = () => {
    if (isCalendarOpen == 'opened') {
      document.documentElement.style.setProperty(
        '--appearance-entriesOffset',
        getCalendarIsOpen('closed').entriesOffset + 'px'
      )
      setIsCalendarOpenInternal('closed')
      window.electronAPI.storeUserPreferences.set('appearance.calendarOpen', 'closed')
    } else {
      document.documentElement.style.setProperty(
        '--appearance-entriesOffset',
        getCalendarIsOpen('opened').entriesOffset + 'px'
      )
      setIsCalendarOpenInternal('opened')
      window.electronAPI.storeUserPreferences.set('appearance.calendarOpen', 'opened')
    }
  }

  let state = {
    colorTheme,
    fontFace,
    fontSize,
    isCalendarOpen,
    setColorTheme,
    setFontFace,
    setFontSize,
    toggleIsCalendarOpen,
  }
  return <AppearanceContext.Provider value={state}>{children}</AppearanceContext.Provider>
}

export function useAppearanceContext() {
  return useContext(AppearanceContext)
}

export { AppearanceContextInterface }
