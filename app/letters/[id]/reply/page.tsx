'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ReplyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setIsSuccess(true)
  }

  if (isSuccess) {
    const shareText = encodeURIComponent('手紙の返信をポストしました🕊️\n24時間かけて届く、スローな言語交換アプリ\n#韓日ペンパル #言語交換')
    const shareUrl = encodeURIComponent('https://korea-japan-penpal.vercel.app')

    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E5E0D8] max-w-md w-full text-center space-y-6">
          <div className="text-6xl mb-4 animate-bounce">🕊️</div>
          <h2 className="text-2xl font-bold text-gray-800">手紙を投函しました</h2>
          <p className="text-gray-500 font-medium">
            相手のポストには、24時間後に配達されます。
          </p>

          <hr className="border-gray-100 my-6" />

          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-500 font-bold">
              手紙を送ったことをシェアしませんか？
            </p>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-black text-white text-sm font-bold py-3 px-6 rounded-xl hover:bg-gray-800 transition shadow-sm w-full"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
              Xでシェアする
            </a>
          </div>

          <div className="pt-4">
            <Link 
              href="/dashboard"
              className="text-gray-500 hover:text-gray-800 font-bold text-sm underline underline-offset-4"
            >
              ダッシュボードへ戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 pb-20">
      <header className="max-w-2xl mx-auto py-4 mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">✍️ 返信を書く</h1>
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 font-bold text-sm">
          キャンセル
        </Link>
      </header>

      <main className="max-w-2xl mx-auto bg-white p-5 rounded-2xl shadow-sm border border-[#E5E0D8]">
        <form onSubmit={handleSend} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="心を込めて、手紙を書きましょう..."
            /* ✅ ここで text-gray-900（暗いグレー）を明示的に指定して文字色を修正 */
            className="w-full h-64 p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-serif leading-relaxed placeholder-gray-400"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex justify-center items-center gap-2"
          >
            {isSubmitting ? '投函中...' : '📮 手紙を投函する（通常便）'}
          </button>
        </form>
      </main>
    </div>
  )
}