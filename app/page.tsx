"use client";

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

// コンポーネントの外でクライアントを生成し、インスタンスを1つに保つ（警告解消）
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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

    // SSR（サーバー側）にクッキーを確実に認識させるためのハードリダイレクトを採用
    window.location.href = '/dashboard'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-black">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">開発用ログイン</h1>
        <form onSubmit={handleDevLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="テスト用メールアドレス"
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 font-medium"
          >
            {loading ? '処理中...' : 'メール送信なしで即時ログイン'}
          </button>
        </form>
        <p className="mt-4 text-xs text-center text-gray-500">
          ※制限回避のため、一時的にメール認証をスキップしています。
        </p>
      </div>
    </div>
  )
}