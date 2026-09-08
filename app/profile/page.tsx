'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ProfilePage() {
  const supabase = createClientComponentClient()
  const [penname, setPenname] = useState('')
  const [bio, setBio] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/'
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('penname, bio')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setPenname(data.penname || '')
        setBio(data.bio || '')
      }
      setLoading(false)
    }
    loadProfile()
  }, [supabase])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setMessage('エラー: ログインしていません。')
      return
    }

    // ここを update から upsert に変更して、idも一緒に保存するようにしたわ
    const { error } = await supabase
      .from('users')
      .upsert({ id: session.user.id, penname, bio })

    if (error) {
      setMessage('エラー: ' + error.message)
    } else {
      setMessage('プロフィールを更新しました。')
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-black">読み込み中...</div>
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white border rounded text-black shadow">
      <h1 className="text-xl font-bold mb-4 text-center">プロフィール設定</h1>
      <form onSubmit={handleUpdate}>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">ペンネーム</label>
          <input
            type="text"
            value={penname}
            onChange={(e) => setPenname(e.target.value)}
            className="w-full p-2 border rounded text-black bg-white"
            placeholder="ペンネームを入力"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1">自己紹介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 border rounded text-black bg-white h-24"
            placeholder="自己紹介を入力"
          />
        </div>
        <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">
          保存する
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-sm text-center font-bold ${message.includes('成功') || message.includes('更新しました') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}