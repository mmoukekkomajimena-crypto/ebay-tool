import { XMLParser } from 'fast-xml-parser'

const TRADING_API = 'https://api.ebay.com/ws/api.dll'
const COMPAT_LEVEL = '1349'
const SITE_ID = '0' // US

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  processEntities: false,
  htmlEntities: true,
})

function tradingHeaders(callName: string, token: string) {
  return {
    'X-EBAY-API-COMPATIBILITY-LEVEL': COMPAT_LEVEL,
    'X-EBAY-API-CALL-NAME': callName,
    'X-EBAY-API-SITEID': SITE_ID,
    'X-EBAY-API-IAF-TOKEN': token,
    'Content-Type': 'text/xml',
  }
}

// ── Types ───────────────────────────────────────────────

export interface EbayMessage {
  messageId: string
  sender: string
  subject: string
  text: string
  creationDate: string
  read: boolean
  replied: boolean
  itemId: string
  externalMessageId: string
  folder: string
}

export interface EbayMessageSummary {
  messageId: string
  sender: string
  subject: string
  creationDate: string
  read: boolean
  replied: boolean
  itemId: string
}

// ── Get Message List (Headers only) ─────────────────────

export async function getMessageHeaders(
  token: string,
  options: { startTime?: string; endTime?: string; folderId?: number } = {}
): Promise<EbayMessageSummary[]> {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const startTime = options.startTime || thirtyDaysAgo.toISOString()
  const endTime = options.endTime || now.toISOString()
  const folderId = options.folderId ?? 0 // 0 = Inbox

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<GetMyMessagesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <DetailLevel>ReturnHeaders</DetailLevel>
  <FolderID>${folderId}</FolderID>
  <StartTime>${startTime}</StartTime>
  <EndTime>${endTime}</EndTime>
</GetMyMessagesRequest>`

  const res = await fetch(TRADING_API, {
    method: 'POST',
    headers: tradingHeaders('GetMyMessages', token),
    body: xml,
  })

  const text = await res.text()
  const data = parser.parse(text)
  const response = data.GetMyMessagesResponse

  if (response?.Ack === 'Failure') {
    const error = response.Errors
    throw new Error(
      `eBay API error: ${error?.ShortMessage || error?.LongMessage || 'Unknown'}`
    )
  }

  const messages = response?.Messages?.Message
  if (!messages) return []

  const list = Array.isArray(messages) ? messages : [messages]

  return list.map((m: any) => ({
    messageId: String(m.MessageID || ''),
    sender: String(m.Sender || ''),
    subject: String(m.Subject || ''),
    creationDate: String(m.CreationDate || ''),
    read: m.Read === 'true' || m.Read === true,
    replied: m.Replied === 'true' || m.Replied === true,
    itemId: String(m.ItemID || ''),
  }))
}

// ── Get Full Message ────────────────────────────────────

export async function getMessageDetail(
  token: string,
  messageId: string
): Promise<EbayMessage | null> {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<GetMyMessagesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <DetailLevel>ReturnMessages</DetailLevel>
  <MessageIDs>
    <MessageID>${messageId}</MessageID>
  </MessageIDs>
</GetMyMessagesRequest>`

  const res = await fetch(TRADING_API, {
    method: 'POST',
    headers: tradingHeaders('GetMyMessages', token),
    body: xml,
  })

  const text = await res.text()
  const data = parser.parse(text)
  const response = data.GetMyMessagesResponse

  if (response?.Ack === 'Failure') {
    const error = response.Errors
    throw new Error(
      `eBay API error: ${error?.ShortMessage || error?.LongMessage || 'Unknown'}`
    )
  }

  const m = response?.Messages?.Message
  if (!m) return null

  const msg = Array.isArray(m) ? m[0] : m

  return {
    messageId: String(msg.MessageID || ''),
    sender: String(msg.Sender || ''),
    subject: String(msg.Subject || ''),
    text: String(msg.Text || ''),
    creationDate: String(msg.CreationDate || ''),
    read: msg.Read === 'true' || msg.Read === true,
    replied: msg.Replied === 'true' || msg.Replied === true,
    itemId: String(msg.ItemID || ''),
    externalMessageId: String(msg.ExternalMessageID || ''),
    folder: String(msg.Folder?.FolderID || '0'),
  }
}

// ── Reply to Message ────────────────────────────────────

export async function replyToMessage(
  token: string,
  opts: {
    recipientUserId: string
    itemId: string
    body: string
    parentMessageId?: string
    subject?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<AddMemberMessageAAQToPartnerRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <ItemID>${opts.itemId}</ItemID>
  <MemberMessage>
    <Subject>${escapeXml(opts.subject || 'Re: Your message')}</Subject>
    <Body>${escapeXml(opts.body)}</Body>
    <RecipientID>${escapeXml(opts.recipientUserId)}</RecipientID>
    <QuestionType>General</QuestionType>
    ${opts.parentMessageId ? `<ParentMessageID>${opts.parentMessageId}</ParentMessageID>` : ''}
  </MemberMessage>
</AddMemberMessageAAQToPartnerRequest>`

  const res = await fetch(TRADING_API, {
    method: 'POST',
    headers: tradingHeaders('AddMemberMessageAAQToPartner', token),
    body: xml,
  })

  const text = await res.text()
  const data = parser.parse(text)
  const response = data.AddMemberMessageAAQToPartnerResponse

  if (response?.Ack === 'Failure') {
    const error = response.Errors
    return {
      success: false,
      error: error?.ShortMessage || error?.LongMessage || 'Unknown error',
    }
  }

  return { success: true }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
