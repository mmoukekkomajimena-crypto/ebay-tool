import { getAccessToken } from '@/lib/ebay'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'no code' }, { status: 400 })
  const tokens = await getAccessToken(code)
  const res = NextResponse.redirect(new URL('/', req.url))
  res.cookies.set('ebay_access_token', tokens.access_token, { maxAge: 7200 })
  res.cookies.set('ebay_refresh_token', tokens.refresh_token, { maxAge: 60 * 60 * 24 * 30 })
  return res
}
