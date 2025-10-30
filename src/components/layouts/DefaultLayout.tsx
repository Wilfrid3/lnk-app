'use client'

import React from 'react'
import Header from '@/components/Header'
import FooterNav from '@/components/FooterNav'
// import { useAuth } from '@/contexts/AuthContext'

interface DefaultLayoutProps {
  children: React.ReactNode
  hideFooter?: boolean
}

export default function DefaultLayout({ children, hideFooter = false }: DefaultLayoutProps) {
  // const { spoofingState } = useAuth()
  
  // Add extra padding when spoofing indicator is shown
  // const topPadding = spoofingState.isSpoofing ? 'pt-[115px]' : 'pt-[75px]'
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <div className={`pt-[75px] pb-16`}>
        {children}
      </div>
      {!hideFooter && <FooterNav />}
    </div>
  )
}
