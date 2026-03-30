'use client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    fetch('/api/ebay/listings')
      .then(r => {
        if (r.status === 401) { setAuthed(false); setLoading(false); return null }
        setAuthed(true)
        return r.json()
      })
      .then(d => { if (d) { setListings(d.orders || []); setLoading(false) } })
  }, [])

  if (loading) return <div className="p-8">読み込み中...</div>

  if (!authed) return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">eBay 価格管理ツール</h1>
      <a href="/api/auth" className="bg-blue-600 text-white px-6 py-3 rounded-lg">
        eBayでログイン
      </a>
    </div>
  )

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">eBay 価格管理ツール</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">商品名</th>
              <th className="border p-2">価格</th>
              <th className="border p-2">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {listings.length === 0 && (
              <tr><td colSpan={3} className="border p-4 text-center text-gray-500">データなし</td></tr>
            )}
            {listings.map((order: any) => (
              <tr key={order.orderId} className="hover:bg-gray-50">
                <td className="border p-2">{order.lineItems?.[0]?.title || '-'}</td>
                <td className="border p-2 text-center">${order.pricingSummary?.total?.value}</td>
                <td className="border p-2 text-center">{order.orderFulfillmentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
