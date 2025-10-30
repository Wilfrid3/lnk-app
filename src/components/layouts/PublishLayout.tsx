'use client'

import React from 'react'
import Header from '@/components/Header'

interface PublishLayoutProps {
  children: React.ReactNode
}

export default function PublishLayout({ children }: PublishLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="pt-[60px]">
        {children}
      </div>
    </div>
  )
}
