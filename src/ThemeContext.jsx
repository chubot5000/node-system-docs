import { createContext, useContext, useState, useCallback } from 'react'

const ThemeContext = createContext()

export const light = {
  bg: '#F5F3F0',
  panelBg: 'white',
  panelBorder: '#EDEAE7',
  text: '#655343',
  textMuted: '#999',
  textFaint: '#B0AAA5',
  inputBorder: '#E0DCDA',
  inputBg: 'white',
  dotColor: '#D5D0CC',
  nodeBg: 'white',
  nodeStroke: '#747474',
  canvasBg: '#FFFFFF',
  menuBg: 'white',
  menuBorder: '#E0DCDA',
  menuShadow: '0 4px 20px rgba(0,0,0,0.12)',
  hoverBg: '#FAFAF9',
  sectionHover: '#f9f8f6',
  activeBg: '#655343',
  activeText: 'white',
  btnBg: 'white',
  btnBorder: '#E0DCDA',
  exportBg: '#655343',
}

export const dark = {
  bg: '#1A1A1E',
  panelBg: '#242428',
  panelBorder: '#3A3A3E',
  text: '#D4CBC2',
  textMuted: '#888',
  textFaint: '#666',
  inputBorder: '#444',
  inputBg: '#2E2E33',
  dotColor: '#3A3A3E',
  nodeBg: '#2A2A2E',
  nodeStroke: '#666',
  canvasBg: '#1E1E22',
  menuBg: '#2A2A2E',
  menuBorder: '#444',
  menuShadow: '0 4px 20px rgba(0,0,0,0.4)',
  hoverBg: '#333338',
  sectionHover: '#333338',
  activeBg: '#D4CBC2',
  activeText: '#1A1A1E',
  btnBg: '#2E2E33',
  btnBorder: '#444',
  exportBg: '#D4CBC2',
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light')
  const theme = mode === 'dark' ? dark : light
  const toggle = useCallback(() => setMode(m => m === 'light' ? 'dark' : 'light'), [])
  return <ThemeContext.Provider value={{ theme, mode, toggle }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
