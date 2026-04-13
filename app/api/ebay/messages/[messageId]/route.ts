import { cookies } from 'next/headers'
import { getMessageDetail } from '@/lib/ebay-messages'
import { refreshToken } from '@/lib/ebay'
import type { NextRequest } from 'next/server'

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/ebay/messages/[messageId]'>
) {
  try {
    const { messageId } = await ctx.params

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

    const message = await getMessageDetail(token, messageId)
    if (!message) {
      return Response.json({ error: 'Message not found' }, { status: 404 })
    }

    return Response.json({ message })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
