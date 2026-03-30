import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = process.env.EBAY_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: 'no token' }, { status: 500 })
  
  const res = await fetch('https://api.ebay.com/sell/inventory/v1/inventory_item?limit=200', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  return NextResponse.json(data)
}
