'use client'

import React from 'react'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import ConversationsList from '@/components/ConversationsList'

export default function MessagesView() {
  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Messages
              </h1>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <span className="material-icons text-xl">edit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="max-w-7xl mx-auto">
          <ConversationsList className="h-[calc(100vh-4rem)]" />
        </div>
      </div>
    </DefaultLayout>
  )
}
