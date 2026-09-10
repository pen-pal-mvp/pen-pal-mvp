import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '韓日ペンパル | 日韓の温かい手紙交換',
  description: '韓国と日本の言葉や文化を学びながら、のんびり手紙を交換できるプラットフォームです。',
  openGraph: {
    title: '韓日ペンパル',
    description: '日韓の温かい手紙交換プラットフォーム',
    url: 'https://pen-pal-mvp.vercel.app',
    siteName: '韓日ペンパル',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '韓日ペンパル',
    description: '日韓の温かい手紙交換プラットフォーム',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-800 antialiased">
        {children}
      </body>
    </html>
  )
}