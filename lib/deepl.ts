const DEEPL_API_KEY = process.env.DEEPL_API_KEY!
// Free API keys end with ':fx'
const BASE_URL = DEEPL_API_KEY.endsWith(':fx')
  ? 'https://api-free.deepl.com/v2'
  : 'https://api.deepl.com/v2'

export type TargetLang = 'JA' | 'EN' | 'EN-US' | 'EN-GB'

interface TranslateResult {
  translations: { detected_source_language: string; text: string }[]
}

export async function translate(
  text: string,
  targetLang: TargetLang
): Promise<string> {
  const res = await fetch(`${BASE_URL}/translate`, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      target_lang: targetLang,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepL API error: ${res.status} ${err}`)
  }

  const data: TranslateResult = await res.json()
  return data.translations[0].text
}
