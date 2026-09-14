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
          <h1 className="text-3xl font-bold text-slate-800">ペンパルを探す</h1>
          <Link className="text-base text-slate-500 hover:text-violet-600 transition-colors font-medium" href="/dashboard">
            ← ダッシュボードへ戻る
          </Link>
        </div>

        {/* 画像に合わせて縦並びのリスト形式（space-y-4）を採用 */}
        <div className="space-y-4">
          {(!allUsers || allUsers.length === 0) ? (
            <p className="text-lg text-slate-500 text-center py-10 bg-white rounded-3xl border border-slate-100">
              現在、他のユーザーが見つかりません。
            </p>
          ) : (
            allUsers.map((targetUser) => {
              const displayMbti = (targetUser.avatar_type === '😊' || !targetUser.avatar_type) 
                ? '????' 
                : targetUser.avatar_type;

              return (
                <div key={targetUser.id} className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:shadow-md hover:border-violet-200 transition-all">
                  
                  <div className="flex items-start gap-4 flex-1 w-full">
                    <div className="text-xl font-black text-violet-600 tracking-wider bg-violet-50 w-16 h-16 shrink-0 flex items-center justify-center rounded-full border border-violet-100 mt-1">
                      {displayMbti}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 text-xl mb-2">
                        {targetUser.pen_name || '名無しさん'}
                      </div>
                      {/* 変更点: ...で省略する機能を消し、全文表示（whitespace-pre-wrap break-words）に変更 */}
                      <p className="text-base text-slate-500 leading-relaxed whitespace-pre-wrap break-words">
                        {targetUser.bio || '自己紹介はまだありません。'}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                    <Link 
                      href={`/letters/new?to=${targetUser.id}&name=${encodeURIComponent(targetUser.pen_name || '名無しさん')}`}
                      className="block w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg text-center whitespace-nowrap"
                    >
                      手紙を書く ✨
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