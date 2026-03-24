import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const html = await res.text()

    const getTag = (pattern: RegExp) => html.match(pattern)?.[1]?.trim() || ''

    const title =
      getTag(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i) ||
      getTag(/<title>([^<]+)<\/title>/i) || ''

    const description =
      getTag(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i) ||
      getTag(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i) || ''

    return NextResponse.json({ title, description })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
