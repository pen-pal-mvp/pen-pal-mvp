import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function UsersPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // 自分以外の全ユーザーを取得（bioも追加で取得）
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, pen_name, avatar_type, bio')
    .neq('id', user.id)

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-semibold text-slate-800">
            ペンパルを探す / 펜팔 찾기
          </h1>
          <Link className="text-base text-slate-500 hover:text-violet-600 transition-colors font-semibold flex flex-col items-end leading-tight gap-1" href="/dashboard">
            <span>← ダッシュボードへ戻る</span>
            <span>대시보드로 돌아가기</span>
          </Link>
        </div>

        <div className="space-y-4">
          {(!allUsers || allUsers.length === 0) ? (
            <p className="text-lg text-slate-500 font-medium text-center py-10 bg-white rounded-3xl border border-slate-100 flex flex-col gap-1">
              <span>現在、他のユーザーが見つかりません。</span>
              <span>현재 다른 사용자를 찾을 수 없습니다.</span>
            </p>
          ) : (
            allUsers.map((targetUser) => {
              const displayMbti = (targetUser.avatar_type === '😊' || !targetUser.avatar_type) 
                ? '????' 
                : targetUser.avatar_type;
              
              // 過去のデータに改行が含まれていても、強制的に半角スペースに変換して無効化する
              const safeBio = targetUser.bio 
                ? targetUser.bio.replace(/\r?\n/g, ' ') 
                : '自己紹介はまだありません。 / 아직 자기소개가 없습니다.';

              return (
                <div key={targetUser.id} className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-5 hover:shadow-md hover:border-violet-200 transition-all">
                  
                  <div className="flex items-start gap-4 w-full">
                    <div className="text-xl font-black text-violet-600 tracking-wider bg-violet-50 w-16 h-16 shrink-0 flex items-center justify-center rounded-full border border-violet-100 mt-1">
                      {displayMbti}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-xl mb-2">
                        {targetUser.pen_name || '名無しさん'}
                      </div>
                      {/* break-all を追加し、スペースのない長文でも強制折り返しさせて枠の突き破りを防ぐ */}
                      <p className="text-base text-slate-500 font-medium leading-relaxed break-all">
                        {safeBio}
                      </p>
                    </div>
                  </div>

                  {/* ボタンを横並びではなく下部（右寄せ）に配置し、確実にカード内に収める */}
                  <div className="w-full flex sm:justify-end pt-1">
                    <Link 
                      href={`/letters/new?to=${targetUser.id}&name=${encodeURIComponent(targetUser.pen_name || '名無しさん')}`}
                      className="flex flex-col items-center justify-center w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-xl font-semibold text-lg transition-all shadow-md hover:shadow-lg whitespace-nowrap leading-tight gap-1"
                    >
                      <span>手紙を書く ✨</span>
                      <span>편지 쓰기</span>
                    </Link>
                  </div>

                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}