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
    .maybeSingle()

  async function updateProfile(formData: FormData) {
    'use server'
    const pen_name = formData.get('pen_name') as string
    const avatar_type = formData.get('avatar_type') as string
    const bio = formData.get('bio') as string

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
      const mbtiValue = avatar_type ? avatar_type.trim().toUpperCase().substring(0, 4) : '????'
      const bioValue = bio ? bio.trim().substring(0, 160) : ''
      
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          pen_name: pen_name.trim().substring(0, 20),
          avatar_type: mbtiValue,
          bio: bioValue,
        })
    }
    
    redirect('/dashboard')
  }

  const currentMbti = (userData?.avatar_type === '😊' || !userData?.avatar_type) ? '' : userData.avatar_type

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-md mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 space-y-8">
        
        <div>
          {/* 戻るリンクを text-sm から text-base に拡大 */}
          <Link href="/dashboard" className="text-violet-500 text-base hover:text-violet-700 mb-4 inline-block font-bold transition-colors">
            ← ダッシュボードへ戻る
          </Link>
          {/* タイトルを text-2xl から text-3xl に拡大 */}
          <h1 className="text-3xl font-bold text-slate-800">プロフィール設定</h1>
        </div>

        <form action={updateProfile} className="space-y-6">
          <div>
            {/* ラベルを text-sm から text-lg に拡大 */}
            <label className="block text-lg font-bold text-slate-700 mb-2">ペンネーム（最大20文字）</label>
            {/* 入力文字を text-lg に拡大 */}
            <input 
              type="text" 
              name="pen_name" 
              defaultValue={userData?.pen_name || ''} 
              required 
              maxLength={20}
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-slate-800 text-lg"
              placeholder="例: 지민"
            />
          </div>
          
          <div>
            {/* ラベルを text-sm から text-lg に拡大 */}
            <label className="block text-lg font-bold text-slate-700 mb-2">MBTI（4文字）</label>
            {/* 入力文字を text-2xl から text-3xl に拡大 */}
            <input 
              type="text" 
              name="avatar_type" 
              defaultValue={currentMbti} 
              maxLength={4}
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-3xl font-bold tracking-widest text-center uppercase"
              placeholder="例: ENFP"
            />
          </div>

          <div>
            {/* ラベルを text-sm から text-lg に拡大 */}
            <label className="block text-lg font-bold text-slate-700 mb-2">自己紹介（最大160文字）</label>
            {/* 入力文字を text-sm から text-lg に拡大 */}
            <textarea 
              name="bio" 
              defaultValue={userData?.bio || ''} 
              maxLength={160}
              rows={4}
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-slate-800 resize-none text-lg leading-relaxed"
              placeholder="はじめまして！韓国の文化や言語に興味があります。のんびり手紙交換できたら嬉しいです。"
            />
          </div>

          <div>
            {/* ラベルを text-sm から text-lg に拡大 */}
            <label className="block text-lg font-bold text-slate-700 mb-2">メンバーステータス</label>
            {/* ステータス文字を text-sm から text-lg に拡大 */}
            <div className={`p-4 rounded-2xl border font-bold text-lg flex items-center ${userData?.is_premium ? 'bg-violet-50 border-violet-100 text-violet-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
              {userData?.is_premium ? '🌟 プレミアム会員' : '無料会員 (基本機能制限なし)'}
            </div>
          </div>

          <div className="pt-4">
            {/* ボタン文字に text-lg を追加 */}
            <button type="submit" className="w-full py-4 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-full font-bold text-lg shadow-md hover:shadow-lg transition-all">
              保存してダッシュボードへ戻る
            </button>
          </div>
        </form>

        <hr className="border-slate-100" />

        <div className="pt-2">
          {/* 危険な操作のタイトルを text-sm から text-lg に拡大 */}
          <h2 className="text-rose-500 font-bold text-lg mb-3 flex items-center">
            <span className="mr-2">⚠️</span> 危険な操作
          </h2>
          <DeleteAccountForm />
        </div>

      </div>
    </div>
  )
}