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
      <div className="bg-violet-50 p-5 rounded-2xl border border-violet-100 flex items-center space-x-3">
        <span className="text-2xl">🕊️</span>
        <p className="text-violet-900 font-bold">宛先: {receiverName}</p>
      </div>

      {errorMessage && (
        <div className="text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-200 font-bold flex items-center">
          <span className="mr-2">⚠️</span> {errorMessage}
        </div>
      )}

      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
        required 
        rows={12} 
        placeholder="ここに手紙の本文を書いてください。のんびり、思いを込めて..." 
        className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none transition-all shadow-inner" 
        disabled={loading}
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
        <p className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-3 rounded-xl flex items-center">
          <span className="mr-2">⏳</span> ※手紙は送信から1時間後に相手に届きます。
        </p>
        <button 
          type="submit" 
          disabled={loading || !content.trim()} 
          className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        
        <div className="flex justify-between items-center px-2">
          <h1 className="text-2xl font-bold text-slate-800">新しい手紙を書く</h1>
          <Link className="text-sm text-slate-500 hover:text-violet-600 transition-colors font-bold" href="/users">
            ← キャンセル
          </Link>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
          <Suspense fallback={<div className="text-center py-10 text-slate-500 font-bold">準備中...</div>}>
            <ComposeForm />
          </Suspense>
        </div>
        
      </div>
    </div>
  )
}