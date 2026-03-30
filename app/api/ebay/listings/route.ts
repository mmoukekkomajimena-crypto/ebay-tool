import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('ebay_access_token')?.value
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  
  const res = await fetch('https://api.ebay.com/sell/inventory/v1/inventory_item?limit=200', {
    headers: { Authorization: `Bearer ${token}`, 'Content-Language': 'en-US' },
  })
  const data = await res.json()
  return NextResponse.json(data)
}
