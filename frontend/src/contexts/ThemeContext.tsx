import React, { createContext, useContext, useState, useEffect } from 'react'
import { useColorMode } from '@chakra-ui/react'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode()
  const [isDark, setIsDark] = useState(colorMode === 'dark')

  useEffect(() => {
    setIsDark(colorMode === 'dark')
  }, [colorMode])

  const toggleTheme = () => {
    toggleColorMode()
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
