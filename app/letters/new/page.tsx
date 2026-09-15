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
        setErrorMessage(result.error || "エラーが発生しました / 오류가 발생했습니다")
        setLoading(false)
        return
      }

      alert('手紙をポストに入れました！1時間後に相手に届きます。\n\n편지를 우체통에 넣었습니다! 1시간 후에 상대방에게 도착합니다.')
      router.push('/dashboard')
    } catch (error) {
      setErrorMessage("通信エラーが発生しました。 / 통신 에러가 발생했습니다.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSend} className="space-y-6">
      <div className="bg-violet-50 p-5 rounded-2xl border border-violet-100 flex items-center space-x-4">
        <span className="text-3xl">🕊️</span>
        <div className="flex flex-col gap-1">
          <p className="text-violet-900 font-semibold text-xl">宛先: {receiverName}</p>
          <p className="text-violet-900 font-semibold text-xl">받는 사람: {receiverName}</p>
        </div>
      </div>

      {errorMessage && (
        <div className="text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-200 font-semibold flex items-center text-lg">
          <span className="mr-2">⚠️</span> {errorMessage}
        </div>
      )}

      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
        required 
        rows={12} 
        placeholder={`ここに手紙の本文を書いてください。のんびり、思いを込めて...\n여기에 편지 본문을 작성해 주세요. 여유를 가지고 마음을 담아서...`}
        className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none transition-all shadow-inner text-lg leading-relaxed font-medium" 
        disabled={loading}
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
        <div className="text-base font-semibold text-slate-500 bg-slate-100 px-5 py-4 rounded-xl flex items-center w-full md:w-auto justify-center gap-3">
          <span className="text-xl">⏳</span>
          <div className="flex flex-col gap-1 text-left">
            <span>※手紙は送信から1時間後に相手に届きます。</span>
            <span>※편지는 전송 후 1시간 뒤에 상대방에게 도착합니다.</span>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading || !content.trim()} 
          className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-full font-semibold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1 leading-tight"
        >
          {loading ? (
            <>
              <span>スキャン中・送信中...</span>
              <span>스캔 중・전송 중...</span>
            </>
          ) : (
            <>
              <span>手紙をポストに入れる ✨</span>
              <span>편지를 우체통에 넣기</span>
            </>
          )}
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
          <h1 className="text-3xl font-semibold text-slate-800">
            新しい手紙を書く / 새 편지 쓰기
          </h1>
          <Link className="text-base text-slate-500 hover:text-violet-600 transition-colors font-semibold flex flex-col items-end leading-tight gap-1" href="/users">
            <span>← キャンセル</span>
            <span>취소</span>
          </Link>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
          <Suspense fallback={
            <div className="text-center py-10 text-slate-500 font-semibold text-lg flex flex-col gap-1">
              <span>準備中...</span>
              <span>준비 중...</span>
            </div>
          }>
            <ComposeForm />
          </Suspense>
        </div>
        
      </div>
    </div>
  )
}