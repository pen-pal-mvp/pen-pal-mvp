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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !receiverId) return
    
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
      <div className="bg-violet-50 p-5 rounded-2xl border border-violet-100 flex items-center space-x-4">
        <span className="text-3xl">🕊️</span>
        {/* 宛先の文字を text-xl に拡大 */}
        <p className="text-violet-900 font-bold text-xl">宛先: {receiverName}</p>
      </div>

      {errorMessage && (
        <div className="text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-200 font-bold flex items-center text-lg">
          <span className="mr-2">⚠️</span> {errorMessage}
        </div>
      )}

      {/* 入力欄の文字を text-lg に拡大し、行間(leading-relaxed)を広げて書きやすく調整 */}
      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
        required 
        rows={12} 
        placeholder="ここに手紙の本文を書いてください。のんびり、思いを込めて..." 
        className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none transition-all shadow-inner text-lg leading-relaxed" 
        disabled={loading}
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
        {/* 注意書きの文字を text-xs から text-base に拡大 */}
        <p className="text-base font-bold text-slate-500 bg-slate-100 px-5 py-3 rounded-xl flex items-center w-full md:w-auto justify-center">
          <span className="mr-2">⏳</span> ※手紙は送信から1時間後に相手に届きます。
        </p>
        {/* ボタンの文字を text-lg に拡大 */}
        <button 
          type="submit" 
          disabled={loading || !content.trim()} 
          className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-full font-bold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'スキャン中・送信中...' : '手紙をポストに入れる ✨'}
        </button>
      </div>
    </form>
  )
}

export default function NewLetterPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center px-2 border-b border-slate-200 pb-4">
          {/* タイトルを text-2xl から text-3xl に拡大 */}
          <h1 className="text-3xl font-bold text-slate-800">新しい手紙を書く</h1>
          {/* 戻るリンクを text-sm から text-base に拡大 */}
          <Link className="text-base text-slate-500 hover:text-violet-600 transition-colors font-bold" href="/users">
            ← キャンセル
          </Link>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
          <Suspense fallback={<div className="text-center py-10 text-slate-500 font-bold text-lg">準備中...</div>}>
            <ComposeForm />
          </Suspense>
        </div>
        
      </div>
    </div>
  )
}