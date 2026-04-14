'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface MessageSummary {
  messageId: string
  sender: string
  subject: string
  creationDate: string
  read: boolean
  replied: boolean
  itemId: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/ebay/messages')
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || 'Failed to fetch messages')
        return data
      })
      .then((data) => {
        setMessages(data.messages || [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-semibold">エラーが発生しました</p>
          <p className="text-sm mt-1">{error}</p>
          {error.includes('Not authenticated') && (
            <a
              href="/api/auth"
              className="mt-3 inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              eBayにログイン
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">メッセージ</h1>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {messages.length}件
          </span>
        </div>
      </header>

      {/* Message List */}
      <div className="flex-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            <p className="text-sm">メッセージはありません</p>
          </div>
        ) : (
          <ul className="divide-y">
            {messages.map((msg) => (
              <li key={msg.messageId}>
                <Link
                  href={`/messages/${msg.messageId}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {msg.sender.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${!msg.read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                        {msg.sender}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatDate(msg.creationDate)}
                      </span>
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${!msg.read ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                      {msg.subject}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {!msg.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                      {msg.replied && (
                        <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          返信済
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays < 7) {
      return `${diffDays}日前`
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
    }
  } catch {
    return ''
  }
}
