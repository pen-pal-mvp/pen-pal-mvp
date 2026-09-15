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
      const bioValue = bio ? bio.trim().substring(0, 144) : ''
      
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
          <Link href="/dashboard" className="text-violet-500 text-base hover:text-violet-700 mb-4 inline-flex flex-col font-medium transition-colors gap-1">
            <span>← ダッシュボードへ戻る</span>
            <span>대시보드로 돌아가기</span>
          </Link>
          <h1 className="text-3xl font-semibold text-slate-800">
            プロフィール設定 <span className="text-slate-500">/ 프로필 설정</span>
          </h1>
        </div>

        <form action={updateProfile} className="space-y-6">
          <div>
            {/* spanから個別の太さ指定を削除し、親のfont-semiboldを統一して引き継ぐ */}
            <label className="block text-lg font-semibold text-slate-700 mb-2">
              ペンネーム（最大20文字） <span className="text-slate-500">/ 닉네임 (최대 20자)</span>
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
              MBTI（4文字） <span className="text-slate-500">/ MBTI (4자)</span>
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
            <label className="block text-lg font-semibold text-slate-700 mb-2">
              自己紹介（最大144文字） <span className="text-slate-500">/ 자기소개 (최대 144자)</span>
            </label>
            <textarea 
              name="bio" 
              defaultValue={userData?.bio || ''} 
              maxLength={144}
              rows={4}
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-slate-800 resize-none text-lg font-medium leading-relaxed"
              placeholder="はじめまして！韓国の文化や言語に興味があります。 / 만나서 반갑습니다! 한국 문화와 언어에 관심이 있습니다."
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-slate-700 mb-2">
              メンバーステータス <span className="text-slate-500">/ 멤버 상태</span>
            </label>
            <div className={`p-4 rounded-2xl border font-semibold text-lg flex flex-col gap-1 ${userData?.is_premium ? 'bg-violet-50 border-violet-100 text-violet-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
              {userData?.is_premium ? (
                <>
                  <span>🌟 プレミアム会員</span>
                  <span className="text-base">프리미엄 회원</span>
                </>
              ) : (
                <>
                  <span>無料会員 (基本機能制限なし)</span>
                  <span className="text-base">무료 회원 (기본 기능 제한 없음)</span>
                </>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full py-4 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-full font-semibold text-lg shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center gap-1 leading-tight">
              <span>保存してダッシュボードへ戻る</span>
              <span>저장하고 대시보드로 돌아가기</span>
            </button>
          </div>
        </form>

        <hr className="border-slate-100" />

        <div className="pt-2">
          <h2 className="text-rose-500 font-semibold text-lg mb-3 flex items-center gap-2">
            <span className="mr-1">⚠️</span> 危険な操作 <span className="text-rose-400">/ 위험한 작업</span>
          </h2>
          <DeleteAccountForm />
        </div>

      </div>
    </div>
  )
}