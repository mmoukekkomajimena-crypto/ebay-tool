import { cookies } from 'next/headers'
import { refreshToken } from '@/lib/ebay'

/**
 * Get a valid eBay token, checking in order:
 * 1. EBAY_USER_TOKEN env var (from eBay Developer Portal)
 * 2. Cookie-based OAuth token (access_token / refresh_token)
 */
export async function getEbayToken(): Promise<string> {
  // 1. Check env var (Developer Portal token)
  const envToken = process.env.EBAY_USER_TOKEN
  if (envToken) return envToken

  // 2. Check cookies (OAuth flow)
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('ebay_access_token')?.value
  if (accessToken) return accessToken

  const refresh = cookieStore.get('ebay_refresh_token')?.value
  if (refresh) {
    const newTokens = await refreshToken(refresh)
    if (newTokens.access_token) return newTokens.access_token
  }

  throw new Error('Not authenticated')
}
