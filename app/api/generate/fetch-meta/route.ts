import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000)
    })
    const html = await res.text()

    const getTag = (pattern: RegExp) => html.match(pattern)?.[1]?.trim() || ''

    const title =
      getTag(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i) ||
      getTag(/<meta[^>]*content="([^"]+)"[^>]*property="og:title"/i) ||
      getTag(/<title>([^<]+)<\/title>/i) || ''

    return NextResponse.json({ title })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
