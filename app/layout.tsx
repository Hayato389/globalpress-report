import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Global Press レポート自動生成',
  description: 'プレスリリース配信レポート自動生成システム',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
