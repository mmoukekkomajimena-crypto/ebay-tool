import { getAccessToken } from '@/lib/ebay'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'no code' }, { status: 400 })

  try {
    const tokens = await getAccessToken(code)

    // If there's a refresh_token, show it so the user can save it to Vercel
    if (tokens.refresh_token) {
      const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>eBay 認証完了</title>
<style>
  body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 0 16px; }
  .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
  .token-box { background: #f8f9fa; border: 1px solid #dee2e6; padding: 12px; border-radius: 4px;
    word-break: break-all; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto; }
  .label { font-weight: bold; margin: 16px 0 8px; }
  .note { color: #856404; background: #fff3cd; padding: 12px; border-radius: 8px; margin-top: 16px; }
  button { background: #0070f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 8px; }
  a { color: #0070f3; }
</style></head>
<body>
  <div class="success">✅ eBay認証が完了しました！</div>
  <p class="label">Refresh Token（以下をコピーして Vercel の環境変数に設定）:</p>
  <div class="token-box" id="rt">${tokens.refresh_token}</div>
  <button onclick="navigator.clipboard.writeText(document.getElementById('rt').textContent).then(()=>this.textContent='コピーしました！')">コピー</button>
  <div class="note">
    ⚠️ このリフレッシュトークンを Vercel の <strong>EBAY_REFRESH_TOKEN</strong> に設定してリデプロイしてください。<br>
    有効期限: 約18ヶ月
  </div>
  <p style="margin-top:24px"><a href="/">← トップに戻る</a></p>
</body></html>`

      const res = new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
      res.cookies.set('ebay_access_token', tokens.access_token, { maxAge: 7200 })
      res.cookies.set('ebay_refresh_token', tokens.refresh_token, {
        maxAge: 60 * 60 * 24 * 365,
      })
      return res
    }

    // No refresh token - just redirect
    const res = NextResponse.redirect(new URL('/', req.url))
    res.cookies.set('ebay_access_token', tokens.access_token, { maxAge: 7200 })
    return res
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Token exchange failed', detail: err.message },
      { status: 500 }
    )
  }
}
