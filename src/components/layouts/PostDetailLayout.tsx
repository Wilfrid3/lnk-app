'use client'

import React from 'react'
import Header from '@/components/Header'
import { useTheme } from '@/components/ThemeProvider'

interface PostDetailLayoutProps {
  children: React.ReactNode
}

export default function PostDetailLayout({ children }: PostDetailLayoutProps) {
  const { theme } = useTheme()

  return (
    <div 
      className={`min-h-screen w-full flex flex-col ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      {/* No bottom navigation here - the post detail has its own bottom actions */}
    </div>
  )
}
