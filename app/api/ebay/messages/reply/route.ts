import { cookies } from 'next/headers'
import { replyToMessage } from '@/lib/ebay-messages'
import { refreshToken } from '@/lib/ebay'

export async function POST(request: Request) {
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
