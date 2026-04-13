import { getEbayToken } from '@/lib/ebay-token'
import { replyToMessage } from '@/lib/ebay-messages'

export async function POST(request: Request) {
  try {
    const token = await getEbayToken()

    const { recipientUserId, itemId, body, parentMessageId, subject } =
      await request.json()

    if (!recipientUserId || !itemId || !body) {
      return Response.json(
        { error: 'recipientUserId, itemId, and body are required' },
        { status: 400 }
      )
    }

    const result = await replyToMessage(token, {
      recipientUserId,
      itemId,
      body,
      parentMessageId,
      subject,
    })

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 })
    }

    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
