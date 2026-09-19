'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { sendNewLetterAction } from '@/app/actions/letterActions' 

function ComposeForm() {
  const searchParams = useSearchParams()
  const receiverId = searchParams.get('to')
  const receiverName = searchParams.get('name') || '相手'

  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null) 
  const router = useRouter()
  
  // 400文字制限の定数
  const MAX_LENGTH = 400

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !receiverId || content.length > MAX_LENGTH) return
    
    setLoading(true)
    setErrorMessage(null)

    try {
      const result = await sendNewLetterAction(receiverId, content)

      if (!result.success) {
        setErrorMessage(result.error || "エラーが発生しました")
        setLoading(false)
        return
      }

      alert('手紙をポストに入れました！1時間後に相手に届きます。')
      router.push('/dashboard')
    } catch (error) {
      setErrorMessage("通信エラーが発生しました。")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSend} className="space-y-6">
      {/* 宛先表示（バイリンガル） */}
      <div className="bg-violet-50 p-5 rounded-2xl border border-violet-100 flex items-start space-x-3">
        <span className="text-2xl mt-1">🕊️</span>
        <div className="flex flex-col gap-1">
          <p className="text-violet-900 font-bold text-lg leading-none">宛先: {receiverName}</p>
          <p className="text-violet-900 font-bold text-base leading-none">받는 사람: {receiverName}</p>
        </div>
      </div>

      {errorMessage && (
        <div className="text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-200 font-bold flex items-center text-lg">
          <span className="mr-2">⚠️</span> {errorMessage}
        </div>
      )}

      {/* テキストエリアと文字数カウンター */}
      <div className="relative">
        <textarea 
          value={content} 
          onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))} 
          required 
          rows={12} 
          placeholder="ここに手紙の本文を書いてください。のんびり、思いを込めて...&#13;&#10;여기에 편지 본문을 작성해 주세요. 여유를 가지고 마음을 담아서..." 
          className="w-full p-6 pb-12 bg-white border border-slate-200 rounded-3xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none transition-all shadow-inner text-lg leading-relaxed" 
          disabled={loading}
        />
        <div className="absolute bottom-5 right-6 text-sm font-medium text-slate-400">
          残り {MAX_LENGTH - content.length} 文字 / 남은 글자수 {MAX_LENGTH - content.length}자
        </div>
      </div>

      {/* 送信ボタン（バイリンガル） */}
      <div className="pt-2">
        <button 
          type="submit" 
          disabled={loading || !content.trim() || content.length > MAX_LENGTH} 
          className="w-full flex flex-col items-center justify-center py-4 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed gap-1"
        >
          <span className="text-lg leading-none">{loading ? 'スキャン中・送信中...' : '手紙を送る ✨'}</span>
          <span className="text-sm font-medium leading-none">{loading ? '전송 중...' : '편지 보내기'}</span>
        </button>
      </div>
    </form>
  )
}

export default function NewLetterPage() {
  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto space-y-6 mt-4">
        
        {/* ヘッダー（バイリンガル） */}
        <div className="flex justify-between items-start px-2 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            新しい手紙を書く <span className="text-slate-300 font-normal">/</span> 새 편지 쓰기
          </h1>
          <Link className="flex flex-col items-end text-slate-500 hover:text-violet-600 transition-colors" href="/users">
            <span className="text-sm font-bold leading-tight">← キャンセル</span>
            <span className="text-xs font-medium leading-tight">취소</span>
          </Link>
        </div>

        {/* フォーム本体のコンテナ（枠線をなくし、画像通りのフラットなデザインに） */}
        <div className="p-2 md:p-4">
          <Suspense fallback={<div className="text-center py-10 text-slate-500 font-bold text-lg">準備中...</div>}>
            <ComposeForm />
          </Suspense>
        </div>
        
      </div>
    </div>
  )
}