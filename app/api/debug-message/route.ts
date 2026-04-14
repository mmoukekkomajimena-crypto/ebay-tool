import { getEbayToken } from '@/lib/ebay-token'
import { getMessageDetail, stripHtml } from '@/lib/ebay-messages'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const messageId = req.nextUrl.searchParams.get('id')
  if (!messageId) return Response.json({ error: 'id param required' })

  try {
    const token = await getEbayToken()
    const message = await getMessageDetail(token, messageId)
    if (!message) return Response.json({ error: 'not found' })

    const rawText = message.text
    const strippedText = stripHtml(rawText)

    return Response.json({
      version: 3,
      rawTextLength: rawText.length,
      rawTextFirst200: rawText.slice(0, 200),
      strippedTextLength: strippedText.length,
      strippedText: strippedText.slice(0, 500),
      // Show if entities are present in raw text
      hasEntityLt: rawText.includes('&lt;'),
      hasLiteralLt: rawText.includes('<'),
    })
  } catch (err: any) {
    return Response.json({ error: err.message })
  }
}
