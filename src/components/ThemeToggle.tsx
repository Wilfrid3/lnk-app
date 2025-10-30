'use client'

import React from 'react'
import { useTheme } from './ThemeProvider'
import { trackApp } from '@/utils/analytics'

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    trackApp.themeChange(newTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
    >
      {theme === 'light' ? (
        <span className="material-icons text-gray-700 dark:text-gray-200">dark_mode</span>
      ) : (
        <span className="material-icons text-yellow-300">light_mode</span>
      )}
    </button>
  )
}

export default ThemeToggle
