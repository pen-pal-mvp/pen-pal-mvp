'use client'

import { useState, Suspense } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ComposeForm() {
  const searchParams = useSearchParams()
  const receiverId = searchParams.get('to')
  const receiverName = searchParams.get('name') || '相手'

  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const MAX_LENGTH = 400 // ここで手紙の最大文字数を設定

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !receiverId || content.length > MAX_LENGTH) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('ログインが必要です')
      return
    }

    const deliveryTime = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    const { error } = await supabase.from('letters').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim(),
      delivery_at: deliveryTime,
      is_read: false
    })

    if (error) {
      alert('送信に失敗しました')
      setLoading(false)
    } else {
      alert('手紙をポストに入れました！1時間後に相手に届きます。')
      router.push('/dashboard')
    }
  }

  return (
    <form onSubmit={handleSend} className="space-y-4">
      <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 flex items-center space-x-3 mb-2">
        <span className="text-2xl">🕊️</span>
        <p className="text-orange-900 font-bold">宛先: {receiverName}</p>
      </div>

      <div className="relative">
        <textarea 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          required 
          maxLength={MAX_LENGTH}
          rows={12} 
          placeholder={`ここに手紙の本文を書いてください。（最大${MAX_LENGTH}文字）`}
          className="w-full p-5 pb-8 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all" 
        />
        <div className={`absolute bottom-4 right-4 text-sm font-medium ${content.length >= MAX_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
          {content.length} / {MAX_LENGTH}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
        <p className="text-xs font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
          ※手紙は送信から1時間後に相手に届きます。
        </p>
        <button 
          type="submit" 
          disabled={loading || !content.trim() || content.length > MAX_LENGTH} 
          className="w-full md:w-auto px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '送信中...' : '手紙をポストに入れる'}
        </button>
      </div>
    </form>
  )
}

export default function NewLetterPage() {
  return (
    <div className="min-h-screen bg-[#faf9f5] p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center px-2">
          <h1 className="text-2xl font-bold text-gray-800">新しい手紙を書く</h1>
          <Link className="text-sm text-gray-500 hover:text-orange-500 transition-colors font-medium" href="/users">
            ← キャンセル
          </Link>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
          <Suspense fallback={<div className="text-center py-10 text-gray-500">準備中...</div>}>
            <ComposeForm />
          </Suspense>
        </div>
        
      </div>
    </div>
  )
}