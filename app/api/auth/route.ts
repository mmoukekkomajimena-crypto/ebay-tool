import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const CLIENT_ID = process.env.EBAY_CLIENT_ID!
  const RUNAME = process.env.EBAY_RUNAME!
  const scopes = [
    'https://api.ebay.com/oauth/api_scope',
    'https://api.ebay.com/oauth/api_scope/sell.inventory',
    'https://api.ebay.com/oauth/api_scope/sell.account',
    'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    'https://api.ebay.com/oauth/api_scope/sell.reputation',
    'https://api.ebay.com/oauth/api_scope/sell.reputation.readonly',
  ].join(' ')
  const url = `https://auth.ebay.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${RUNAME}&response_type=code&scope=${encodeURIComponent(scopes)}`
  return NextResponse.redirect(url)
}
