'use client'

import React from 'react'

interface MinimalLayoutProps {
  children: React.ReactNode
}

export default function MinimalLayout({ children }: MinimalLayoutProps) {
  return (
    <div className="bg-gray-50 min-h-screen">
      {children}
    </div>
  )
}
