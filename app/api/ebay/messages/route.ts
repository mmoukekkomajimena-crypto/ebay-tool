import { getEbayToken } from '@/lib/ebay-token'
import { getMessageHeaders } from '@/lib/ebay-messages'

export async function GET() {
  try {
    const token = await getEbayToken()
    const messages = await getMessageHeaders(token)
    return Response.json({ messages })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
