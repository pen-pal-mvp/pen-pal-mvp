"use client";

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const password = 'dev-password-12345'

    let { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        alert(signUpError.message)
        setLoading(false)
        return
      }
    }

    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] font-sans text-gray-800 selection:bg-orange-200">
      <header className="bg-white/80 backdrop-blur-md shadow-sm py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-10">
        <div className="text-xl md:text-2xl font-extrabold text-orange-600 tracking-wider">
          韓日ペンパル
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-24 flex flex-col md:flex-row items-center gap-12 md:gap-20">
        
        <div className="flex-1 space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.2] text-gray-900">
            国境を越えた<br />
            <span className="text-orange-500">温かい手紙交換</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
            韓国と日本の言葉や文化を学びながら、のんびりと手紙を交換しませんか？デジタルな時代だからこそ、相手を想って書く「手紙」の時間を大切にするプラットフォームです。
          </p>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <span className="text-3xl">🕊️</span>
              <span className="font-medium text-gray-700">自分のペースでのんびりやり取り</span>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <span className="text-3xl">🌏</span>
              <span className="font-medium text-gray-700">お互いの言語や文化を学び合える</span>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <span className="text-3xl">🛡️</span>
              <span className="font-medium text-gray-700">通報・ブロック完備で安心な環境</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-orange-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-pink-500"></div>
          
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">ペンパルをはじめる</h2>
          <p className="text-sm text-center text-gray-500 mb-8">まずはメールアドレスで無料登録・ログイン</p>
          
          <form onSubmit={handleDevLogin} className="space-y-5">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレスを入力"
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? '手紙の世界へ接続中...' : '手紙を書きはじめる'}
            </button>
          </form>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-xl text-xs text-gray-500 text-center border border-gray-100">
            <span className="block font-bold mb-1 text-gray-700">【開発版プレビュー機能】</span>
            メール認証なしで即時ログインできます。<br/>テスト用のメールアドレスを入力してください。
          </div>
        </div>
      </main>
    </div>
  )
}