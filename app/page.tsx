'use client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/ebay/listings')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <div className="p-8">読み込み中...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">eBay 価格管理ツール</h1>
      <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
