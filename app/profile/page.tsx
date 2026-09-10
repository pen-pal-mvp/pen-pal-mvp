import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteAccountForm from './DeleteAccountForm'

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
        
        <div>
          <Link href="/dashboard" className="text-blue-500 text-sm hover:underline mb-4 inline-block">← ダッシュボードへ戻る</Link>
          <h1 className="text-2xl font-bold text-gray-800">プロフィール設定</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">現在のペンネーム</label>
            <div className="p-3 bg-gray-50 rounded border text-gray-800">{userData?.pen_name}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">アイコン</label>
            <div className="text-4xl">{userData?.avatar_type || '😊'}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">プレミアム状態</label>
            <div className="p-3 bg-gray-50 rounded border text-gray-800">
              {userData?.is_premium ? '🌟 プレミアム会員' : '無料会員'}
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="pt-4">
          <h2 className="text-red-500 font-bold text-sm mb-2">危険な操作</h2>
          <DeleteAccountForm />
        </div>

      </div>
    </div>
  )
}