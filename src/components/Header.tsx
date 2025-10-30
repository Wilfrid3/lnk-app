// src/components/Header.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Drawer from './Drawer'
import ThemeToggle from './ThemeToggle'
import Image from 'next/image'

const Header: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const openDrawer = () => setIsDrawerOpen(true)
  const closeDrawer = () => setIsDrawerOpen(false)

  return (
    <>
      <header className="bg-white dark:bg-gray-800 py-2 sm:py-3 px-2 sm:px-4 shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          {/* Explorer Button */}
          <div className="flex items-center">
            <button onClick={openDrawer} className="flex items-center text-gray-900 dark:text-gray-100">
              <div className="flex items-center">
                <span className="material-icons text-2xl sm:text-3xl">explore</span>
                <span className="hidden sm:inline text-lg sm:text-2xl ml-1 sm:ml-2">
                  Explorer
                </span>
              </div>
            </button>
          </div>

          {/* Le Yamo */}
          <div className="flex items-center">
            <Link href="/">
            {/* <img src={"/images/full_logo.png"} style={""} alt="Le Yamo Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-2" /> */}
            <Image 
              src="/images/full_logo.png"
              alt="Le Yamo Logo"
              width={40}
              height={40}
              style={{ width:'140px', height: '40px' }}
              priority
              unoptimized
              quality={100}
              loading="eager"
              className="mr-2"
            />
              {/* <div className="text-xl sm:text-3xl font-semibold flex items-center text-gray-900 dark:text-white">
                <span className="bg-primary-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 mx-1">
                  Yamo
                </span>
                {'Zone'}
              </div> */}
            </Link>
          </div>

          {/* Publish Button and Theme Toggle */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/publish">
              <button className="bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-full px-3 sm:px-4 py-2 flex items-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
                <span className="material-icons text-lg sm:text-xl mr-1">add_circle</span>
                <span className="text-sm sm:text-base">
                  Publier
                </span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Drawer Component */}
      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} />
    </>
  )
}

export default Header
