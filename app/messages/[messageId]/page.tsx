'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface MessageDetail {
  messageId: string
  sender: string
  subject: string
  text: string
  creationDate: string
  read: boolean
  replied: boolean
  itemId: string
  externalMessageId: string
}

export default function MessageDetailPage() {
  const { messageId } = useParams<{ messageId: string }>()
  const [message, setMessage] = useState<MessageDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Translation
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [translating, setTranslating] = useState(false)

  // Reply
  const [replyJa, setReplyJa] = useState('')
  const [replyEn, setReplyEn] = useState<string | null>(null)
  const [transReply, setTransReply] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    fetch(`/api/ebay/messages/${messageId}`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error)
        return data
      })
      .then((data) => {
        setMessage(data.message)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [messageId])

  // Translate received message to Japanese
  async function translateToJapanese() {
    if (!message?.text) return
    setTranslating(true)
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message.text, targetLang: 'JA' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTranslatedText(data.translated)
    } catch (err: any) {
      alert('翻訳エラー: ' + err.message)
    } finally {
      setTranslating(false)
    }
  }

  // Translate Japanese reply to English
  async function translateReplyToEnglish() {
    if (!replyJa.trim()) return
    setTransReply(true)
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyJa, targetLang: 'EN' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReplyEn(data.translated)
    } catch (err: any) {
      alert('翻訳エラー: ' + err.message)
    } finally {
      setTransReply(false)
    }
  }

  // Send reply
  async function handleSend() {
    if (!replyEn || !message) return
    setSending(true)
    try {
      const res = await fetch('/api/ebay/messages/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientUserId: message.sender,
          itemId: message.itemId,
          body: replyEn,
          parentMessageId: message.messageId,
          subject: `Re: ${message.subject}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSent(true)
      setReplyJa('')
      setReplyEn(null)
    } catch (err: any) {
      alert('送信エラー: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error || !message) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p>{error || 'メッセージが見つかりません'}</p>
          <Link href="/messages" className="text-blue-600 underline mt-2 inline-block text-sm">
            一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold truncate">{message.sender}</h1>
            <p className="text-xs text-gray-500 truncate">{message.subject}</p>
          </div>
        </div>
      </header>

      {/* Message Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Info Bar */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{formatDateTime(message.creationDate)}</span>
          {message.itemId && message.itemId !== '0' && (
            <>
              <span>·</span>
              <a
                href={`https://www.ebay.com/itm/${message.itemId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                商品を見る
              </a>
            </>
          )}
        </div>

        {/* Original Message Bubble */}
        <div className="space-y-2">
          <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          </div>

          {/* Translate Button */}
          {!translatedText && (
            <button
              onClick={translateToJapanese}
              disabled={translating}
              className="flex items-center gap-1.5 text-sm text-blue-600 font-medium px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 active:bg-blue-200 transition-colors disabled:opacity-50"
            >
              {translating ? (
                <>
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-blue-600 border-t-transparent rounded-full" />
                  翻訳中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                  </svg>
                  日本語に翻訳
                </>
              )}
            </button>
          )}

          {/* Translated Text */}
          {translatedText && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <svg className="w-3.5 h-3.5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                </svg>
                <span className="text-xs font-medium text-yellow-700">日本語訳</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{translatedText}</p>
            </div>
          )}
        </div>

        {/* Sent confirmation */}
        {sent && (
          <div className="flex justify-end">
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <p className="text-sm text-green-700 font-medium">✓ 返信を送信しました</p>
            </div>
          </div>
        )}
      </div>

      {/* Reply Area */}
      <div className="sticky bottom-0 bg-white border-t">
        {/* English Preview */}
        {replyEn && (
          <div className="px-4 pt-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-blue-700">英語プレビュー</span>
                <button
                  onClick={() => setReplyEn(null)}
                  className="text-xs text-blue-500 underline"
                >
                  編集に戻る
                </button>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{replyEn}</p>
            </div>
          </div>
        )}

        <div className="p-3 space-y-2">
          {!replyEn ? (
            <>
              {/* Japanese Input */}
              <textarea
                value={replyJa}
                onChange={(e) => setReplyJa(e.target.value)}
                placeholder="日本語で返信を入力..."
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={translateReplyToEnglish}
                disabled={!replyJa.trim() || transReply}
                className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2"
              >
                {transReply ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    英語に翻訳中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                    </svg>
                    英語に翻訳してプレビュー
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full bg-green-600 text-white font-medium py-2.5 rounded-xl text-sm disabled:opacity-50 hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  送信中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                  この英文で送信
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDateTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}
