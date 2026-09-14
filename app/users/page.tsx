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
          {/* タイトルを text-3xl に拡大 */}
          <h1 className="text-3xl font-bold text-slate-800">ペンパルを探す</h1>
          {/* 戻るリンクを text-base に拡大 */}
          <Link className="text-base text-slate-500 hover:text-violet-600 transition-colors font-medium" href="/dashboard">
            ← ダッシュボードへ戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(!allUsers || allUsers.length === 0) ? (
            <p className="text-lg text-slate-500 col-span-3 text-center py-10 bg-white rounded-3xl border border-slate-100">
              現在、他のユーザーが見つかりません。
            </p>
          ) : (
            allUsers.map((targetUser) => {
              const displayMbti = (targetUser.avatar_type === '😊' || !targetUser.avatar_type) 
                ? '????' 
                : targetUser.avatar_type;

              return (
                <div key={targetUser.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-5 hover:shadow-md hover:border-violet-200 transition-all group">
                  
                  {/* アバター文字を text-2xl に拡大 */}
                  <div className="text-2xl font-black text-violet-600 tracking-wider bg-violet-50 w-24 h-24 flex items-center justify-center rounded-full border border-violet-100 group-hover:scale-105 transition-transform">
                    {displayMbti}
                  </div>

                  <div className="w-full">
                    {/* 名前を text-xl に拡大 */}
                    <div className="font-bold text-slate-800 text-xl mb-2">
                      {targetUser.pen_name || '名無しさん'}
                    </div>
                    {/* 自己紹介(bio)を text-xs から text-base に大きく拡大（行の高さも合わせて調整） */}
                    <p className="text-base text-slate-500 line-clamp-3 leading-relaxed px-2 min-h-[4.5rem]">
                      {targetUser.bio || '自己紹介はまだありません。'}
                    </p>
                  </div>

                  {/* ボタンの文字を text-lg に拡大し、タップしやすいように py-4 に調整 */}
                  <Link 
                    href={`/letters/new?to=${targetUser.id}&name=${encodeURIComponent(targetUser.pen_name || '名無しさん')}`}
                    className="w-full py-4 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg text-center mt-2"
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