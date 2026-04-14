import { refreshToken } from '@/lib/ebay'
import { stripHtml } from '@/lib/ebay-messages'

export async function GET() {
  // Test stripHtml
  const testInput = '<style>body{color:red}</style><p>Hello <b>World</b></p>'
  const testOutput = stripHtml(testInput)

  const hasClientId = !!process.env.EBAY_CLIENT_ID
  const hasClientSecret = !!process.env.EBAY_CLIENT_SECRET
  const hasRefreshToken = !!process.env.EBAY_REFRESH_TOKEN
  const hasUserToken = !!process.env.EBAY_USER_TOKEN
  const refreshTokenPreview = process.env.EBAY_REFRESH_TOKEN
    ? `${process.env.EBAY_REFRESH_TOKEN.slice(0, 10)}...（${process.env.EBAY_REFRESH_TOKEN.length}文字）`
    : 'なし'

  // Try refresh
  let refreshResult: any = null
  let refreshError: string | null = null
  if (hasRefreshToken && hasClientId && hasClientSecret) {
    try {
      refreshResult = await refreshToken(process.env.EBAY_REFRESH_TOKEN!)
      // Hide the actual token value
      if (refreshResult.access_token) {
        refreshResult = {
          ...refreshResult,
          access_token: refreshResult.access_token.slice(0, 10) + '...',
        }
      }
    } catch (e: any) {
      refreshError = e.message
    }
  }

  return Response.json({
    stripHtmlTest: { input: testInput, output: testOutput },
    env: {
      hasClientId,
      hasClientSecret,
      hasRefreshToken,
      hasUserToken,
      refreshTokenPreview,
    },
    refreshResult,
    refreshError,
  })
}
