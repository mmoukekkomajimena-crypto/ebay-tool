import { cookies } from 'next/headers'
import { getMessageHeaders } from '@/lib/ebay-messages'
import { refreshToken } from '@/lib/ebay'

export async function GET() {
  try {
    const cookieStore = await cookies()
    let token = cookieStore.get('ebay_access_token')?.value
    const refresh = cookieStore.get('ebay_refresh_token')?.value

    if (!token && refresh) {
      const newTokens = await refreshToken(refresh)
      token = newTokens.access_token
    }

    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const messages = await getMessageHeaders(token)
    return Response.json({ messages })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
