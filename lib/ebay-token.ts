import { cookies } from 'next/headers'
import { refreshToken } from '@/lib/ebay'

// ── In-memory token cache ──────────────────────────────
// Caches the access token obtained via refresh-token flow
// so we don't call eBay's token endpoint on every request.
let cachedAccessToken: string | null = null
let cachedTokenExpiry: number = 0 // epoch ms

/**
 * Get a valid eBay token, checking in order:
 * 1. In-memory cached token (from previous refresh)
 * 2. EBAY_REFRESH_TOKEN env var → auto-refresh to get access token
 * 3. EBAY_USER_TOKEN env var (manual token from Developer Portal, expires in ~2h)
 * 4. Cookie-based OAuth token (access_token / refresh_token)
 */
export async function getEbayToken(): Promise<string> {
  // 1. Return cached token if still valid (with 5-min buffer)
  if (cachedAccessToken && Date.now() < cachedTokenExpiry - 5 * 60 * 1000) {
    return cachedAccessToken
  }

  // 2. Auto-refresh using EBAY_REFRESH_TOKEN env var
  const envRefreshToken = process.env.EBAY_REFRESH_TOKEN
  if (envRefreshToken) {
    try {
      const result = await refreshToken(envRefreshToken)
      if (result.access_token) {
        // eBay access tokens typically expire in 7200 seconds (2h)
        const expiresIn = (result.expires_in || 7200) * 1000
        cachedAccessToken = result.access_token
        cachedTokenExpiry = Date.now() + expiresIn
        return cachedAccessToken!
      }
    } catch (e) {
      console.error('Failed to refresh eBay token:', e)
    }
  }

  // 3. Fallback: static token from Developer Portal (expires quickly)
  const envToken = process.env.EBAY_USER_TOKEN
  if (envToken) return envToken

  // 4. Fallback: cookie-based OAuth
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('ebay_access_token')?.value
  if (accessToken) return accessToken

  const cookieRefresh = cookieStore.get('ebay_refresh_token')?.value
  if (cookieRefresh) {
    const newTokens = await refreshToken(cookieRefresh)
    if (newTokens.access_token) return newTokens.access_token
  }

  throw new Error('Not authenticated')
}
