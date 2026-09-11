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

  // レコードが存在しない場合のエラーを防ぐために maybeSingle() を使用
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // プロフィールを更新（または新規作成）するサーバーアクション
  async function updateProfile(formData: FormData) {
    'use server'
    const pen_name = formData.get('pen_name') as string
    const avatar_type = formData.get('avatar_type') as string

    if (!pen_name || !pen_name.trim()) return

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
    if (user) {
      // update ではなく upsert（なければ作成、あれば更新）を使用する
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          pen_name: pen_name.trim(),
          avatar_type: avatar_type || '😊',
        })
    }
    
    // 保存完了後はダッシュボードへ戻る
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] p-8 font-sans">
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
        
        <div>
          <Link href="/dashboard" className="text-orange-500 text-sm hover:underline mb-4 inline-block font-medium">← ダッシュボードへ戻る</Link>
          <h1 className="text-2xl font-bold text-gray-800">プロフィール設定</h1>
        </div>

        <form action={updateProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ペンネーム</label>
            <input 
              type="text" 
              name="pen_name" 
              defaultValue={userData?.pen_name || ''} 
              required 
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-800"
              placeholder="例: 지민"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">アイコン（好きな絵文字を1つ）</label>
            <input 
              type="text" 
              name="avatar_type" 
              defaultValue={userData?.avatar_type || '😊'} 
              maxLength={2}
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-3xl text-center"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">プレミアム状態</label>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium">
              {userData?.is_premium ? '🌟 プレミアム会員' : '無料会員 (機能制限なし)'}
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold shadow-md transition-colors">
              保存してダッシュボードへ戻る
            </button>
          </div>
        </form>

        <hr className="border-gray-100" />

        <div className="pt-2">
          <h2 className="text-red-500 font-bold text-sm mb-3">危険な操作</h2>
          <DeleteAccountForm />
        </div>

      </div>
    </div>
  )
}