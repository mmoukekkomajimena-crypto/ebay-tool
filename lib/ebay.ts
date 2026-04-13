const CLIENT_ID = process.env.EBAY_CLIENT_ID!
const CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET!
const RUNAME = process.env.EBAY_RUNAME!
const BASE = 'https://api.ebay.com'

export function getAuthUrl() {
  const scopes = [
    'https://api.ebay.com/oauth/api_scope',
    'https://api.ebay.com/oauth/api_scope/sell.inventory',
    'https://api.ebay.com/oauth/api_scope/sell.account',
    'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    'https://api.ebay.com/oauth/api_scope/sell.reputation',
    'https://api.ebay.com/oauth/api_scope/sell.reputation.readonly',
  ].join('%20')
  return `https://auth.ebay.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${RUNAME}&response_type=code&scope=${scopes}`
}

export async function getAccessToken(code: string) {
  const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const res = await fetch(`${BASE}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=authorization_code&code=${code}&redirect_uri=${RUNAME}`,
  })
  return res.json()
}

export async function refreshToken(refresh: string) {
  const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const res = await fetch(`${BASE}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=refresh_token&refresh_token=${refresh}`,
  })
  return res.json()
}

export async function getMyListings(token: string) {
  const res = await fetch(`${BASE}/sell/inventory/v1/inventory_item?limit=200`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function updatePrice(token: string, itemId: string, price: number) {
  const res = await fetch(`${BASE}/sell/inventory/v1/inventory_item/${itemId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
  const item = await res.json()
  item.offers = item.offers?.map((o: any) => ({ ...o, pricingSummary: { price: { value: price.toString(), currency: 'USD' } } }))
  return fetch(`${BASE}/sell/inventory/v1/inventory_item/${itemId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
}
