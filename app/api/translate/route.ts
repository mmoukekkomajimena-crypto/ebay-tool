import { translate, type TargetLang } from '@/lib/deepl'

export async function POST(request: Request) {
  try {
    const { text, targetLang } = await request.json() as {
      text: string
      targetLang: TargetLang
    }

    if (!text || !targetLang) {
      return Response.json(
        { error: 'text and targetLang are required' },
        { status: 400 }
      )
    }

    const translated = await translate(text, targetLang)
    return Response.json({ translated })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
