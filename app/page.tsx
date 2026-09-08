'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` }
    })
    if (error) setMessage('エラー: ' + error.message)
    else setMessage('マジックリンクを送信しました。メールを確認してください。')
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white border rounded text-black">
      <h1 className="text-xl font-bold mb-4 text-center">ログイン</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="メールアドレス"
          required
        />
        <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
          マジックリンクを送信
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-center">{message}</p>}
    </div>
  )
}