'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function Home() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', isError: false })
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [cooldown, setCooldown] = useState(0) 

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cooldown > 0) return 

    setLoading(true)
    setMessage({ text: '', isError: false })

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage({ text: 'エラーが発生しました。時間を置いて再度お試しください。', isError: true })
      setLoading(false)
    } else {
      setIsEmailSent(true)
      setCooldown(60) 
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-violet-600 mb-2 tracking-wider">韓日ペンパル</h1>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              国境を越えた<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500">
                温かい手紙交換
              </span>
            </h2>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">
            韓国と日本の言葉や文化を学びながら、のんびりと手紙を交換しませんか？デジタルな時代だからこそ、相手を想って書く「手紙」の時間を大切にするプラットフォームです。
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-violet-200 transition-colors">
              <span className="text-2xl">🕊️</span>
              <p className="font-medium text-slate-700">自分のペースでのんびりやり取り</p>
            </div>
            <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-pink-200 transition-colors">
              <span className="text-2xl">✨</span>
              <p className="font-medium text-slate-700">お互いの好きなカルチャーを語り合う</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-violet-100 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 to-pink-400"></div>
          
          {isEmailSent ? (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="text-6xl mb-4">💌</div>
              <h3 className="text-2xl font-bold text-slate-800">メールを送信しました</h3>
              <p className="text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">{email}</span> 宛に<br/>
                ログイン用のリンクをお送りしました。<br/>
                メール内のリンクをタップしてログインしてください。
              </p>
              
              <div className="bg-violet-50 p-5 rounded-2xl border border-violet-100 mt-6 text-left">
                <h4 className="font-bold text-violet-900 mb-3 flex items-center">
                  <span className="mr-2">💡</span> プレミアム会員ならもっと快適に
                </h4>
                <ul className="text-sm text-violet-800 space-y-2 font-medium">
                  <li>・ワンタップで手紙をAI自動翻訳</li>
                  <li>・お気に入りの手紙を無制限に保存</li>
                  <li>・優先的なマッチングサポート</li>
                </ul>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setIsEmailSent(false)} 
                  className="text-sm text-slate-400 hover:text-violet-600 transition-colors underline"
                >
                  メールアドレスを入力し直す
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">ペンパルをはじめる</h3>
                <p className="text-slate-500 text-sm">まずはメールアドレスで無料登録・ログイン</p>
              </div>

              <form onSubmit={handleMagicLinkLogin} className="space-y-5">
                <div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="メールアドレスを入力" 
                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-slate-800"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading || !email || cooldown > 0}
                  className="w-full py-4 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cooldown > 0 ? `再送信まで ${cooldown}秒お待ちください` : loading ? '送信中...' : 'ログインメールを送る'}
                </button>

                {message.text && (
                  <div className={`p-4 rounded-xl text-sm font-medium ${message.isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-emerald-700 border border-green-100'}`}>
                    {message.text}
                  </div>
                )}
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-slate-400">
                  ※パスワードは不要です。入力したアドレス宛にログイン用の安全なリンクをお送りします。
                </p>
              </div>
            </>
          )}
        </div>

      </main>
    </div>
  )
}