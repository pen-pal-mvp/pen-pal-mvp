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
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-slate-800">ペンパルを探す</h1>
          <Link className="text-sm text-slate-500 hover:text-violet-600 transition-colors font-medium" href="/dashboard">
            ← ダッシュボードへ戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(!allUsers || allUsers.length === 0) ? (
            <p className="text-slate-500 col-span-3 text-center py-10 bg-white rounded-3xl border border-slate-100">
              現在、他のユーザーが見つかりません。
            </p>
          ) : (
            allUsers.map((targetUser) => {
              const displayMbti = (targetUser.avatar_type === '😊' || !targetUser.avatar_type) 
                ? '????' 
                : targetUser.avatar_type;

              return (
                <div key={targetUser.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-5 hover:shadow-md hover:border-violet-200 transition-all group">
                  
                  <div className="text-xl font-black text-violet-600 tracking-wider bg-violet-50 w-24 h-24 flex items-center justify-center rounded-full border border-violet-100 group-hover:scale-105 transition-transform">
                    {displayMbti}
                  </div>

                  <div className="w-full">
                    <div className="font-bold text-slate-800 text-lg mb-2">
                      {targetUser.pen_name || '名無しさん'}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed px-2 min-h-[3.5rem]">
                      {targetUser.bio || '自己紹介はまだありません。'}
                    </p>
                  </div>

                  <Link 
                    href={`/letters/new?to=${targetUser.id}&name=${encodeURIComponent(targetUser.pen_name || '名無しさん')}`}
                    className="w-full py-3 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg text-center mt-2"
                  >
                    手紙を書く ✨
                  </Link>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}