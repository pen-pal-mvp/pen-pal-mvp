import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteAccountForm from './DeleteAccountForm'
import BioInput from './BioInput'

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
      // サーバー側でも念のため改行を半角スペースに変換して完全ブロック
      const bioValue = bio ? bio.replace(/\r?\n/g, ' ').trim().substring(0, 144) : ''
      
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
        
        <div className="border-b border-slate-100 pb-4">
          <Link href="/dashboard" className="text-slate-500 text-base hover:text-violet-600 mb-4 inline-flex flex-col font-semibold transition-colors gap-1">
            <span>← ダッシュボードへ戻る</span>
            <span>대시보드로 돌아가기</span>
          </Link>
          <h1 className="text-3xl font-semibold text-slate-800 flex flex-col gap-1">
            <span>プロフィール設定</span>
            <span>프로필 설정</span>
          </h1>
        </div>

        <form action={updateProfile} className="space-y-6">
          <div>
            <label className="flex flex-col text-lg font-semibold text-slate-700 mb-2 gap-1">
              <span>ペンネーム(最大20文字)</span>
              <span>닉네임(최대20자)</span>
            </label>
            <input 
              type="text" 
              name="pen_name" 
              defaultValue={userData?.pen_name || ''} 
              required 
              maxLength={20}
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-slate-800 text-lg font-medium"
              placeholder="例 / 예: 지민"
            />
          </div>
          
          <div>
            <label className="block text-lg font-semibold text-slate-700 mb-2">
              MBTI（4文字） / MBTI (4자)
            </label>
            <input 
              type="text" 
              name="avatar_type" 
              defaultValue={currentMbti} 
              maxLength={4}
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-3xl font-bold tracking-widest text-center uppercase"
              placeholder="例 / 예: ENFP"
            />
          </div>

          <div>
            <label className="flex flex-col text-lg font-semibold text-slate-700 mb-2 gap-1">
              <span>自己紹介(最大144文字)</span>
              <span>자기소개(최대144자)</span>
            </label>
            <BioInput defaultValue={userData?.bio || ''} />
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full py-4 border-2 border-violet-400 text-violet-600 hover:bg-violet-50 rounded-xl font-bold text-lg transition-colors flex flex-col items-center justify-center gap-1 leading-tight">
              <span>保存してダッシュボードへ戻る</span>
              <span>저장하고 대시보드로 돌아가기</span>
            </button>
          </div>
        </form>

        <hr className="border-slate-100" />

        <div className="pt-2">
          <h2 className="text-rose-500 font-semibold text-lg mb-3 flex items-center gap-2">
            <span className="mr-1">⚠️</span> 危険な操作 / 위험한 작업
          </h2>
          <DeleteAccountForm />
        </div>

      </div>
    </div>
  )
}