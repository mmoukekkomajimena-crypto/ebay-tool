import { getEbayToken } from '@/lib/ebay-token'
import { getMessageDetail } from '@/lib/ebay-messages'
import type { NextRequest } from 'next/server'

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/ebay/messages/[messageId]'>
) {
  try {
    const { messageId } = await ctx.params
    const token = await getEbayToken()
    const message = await getMessageDetail(token, messageId)

    if (!message) {
      return Response.json({ error: 'Message not found' }, { status: 404 })
    }

    return Response.json({ message })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
