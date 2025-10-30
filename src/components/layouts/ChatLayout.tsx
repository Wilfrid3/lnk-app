'use client'

import React from 'react'

interface ChatLayoutProps {
  children: React.ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div 
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {children}
    </div>
  )
}
