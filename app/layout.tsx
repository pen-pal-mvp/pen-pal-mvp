import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// ✅ OGPとTwitterカードの設定を追加（マーケティング機能）
export const metadata: Metadata = {
  title: '韓日ペンパル - Korea-Japan Penpal',
  description: '手紙の配達に「24時間の遅延」を設けることで、文通の温かみとスローなコミュニケーションを楽しむ言語交換アプリ。',
  openGraph: {
    title: '韓日ペンパル',
    description: '24時間かけて届く、スローな言語交換アプリ。',
    url: 'https://korea-japan-penpal.vercel.app', // ※本番公開時に実際のドメインに書き換えてね
    siteName: '韓日ペンパル',
    images: [
      {
        url: '/ogp.png', // publicフォルダに配置する画像のパス
        width: 1200,
        height: 630,
        alt: '韓日ペンパル OGP画像',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '韓日ペンパル',
    description: '24時間かけて届く、スローな言語交換アプリ。',
    images: ['/ogp.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-[#FDFBF7] text-gray-800 antialiased`}>
        {children}
      </body>
    </html>
  )
}