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
          <h1 className="text-3xl font-bold text-slate-800">ペンパルを探す</h1>
          <Link className="text-base text-slate-500 hover:text-violet-600 transition-colors font-medium" href="/dashboard">
            ← ダッシュボードへ戻る
          </Link>
        </div>

        {/* 変更点: grid（ボックス型）から flex-col（縦並びのライン型）へ変更 */}
        <div className="flex flex-col space-y-4">
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
                // 変更点: 横長のレイアウト(flex-row)に変更し、左からアイコン・名前・ボタンの順に配置
                <div key={targetUser.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:shadow-md hover:border-violet-200 transition-all group">
                 
                  {/* アバター（左側） */}
                  <div className="text-2xl font-black text-violet-600 tracking-wider bg-violet-50 w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-full border border-violet-100 group-hover:scale-105 transition-transform">
                    {displayMbti}
                  </div>

                  {/* 名前と自己紹介（中央・左寄せ） */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="font-bold text-slate-800 text-xl mb-1 truncate">
                      {targetUser.pen_name || '名無しさん'}
                    </div>
                    <p className="text-base text-slate-500 line-clamp-2 leading-relaxed">
                      {targetUser.bio || '自己紹介はまだありません。'}
                    </p>
                  </div>

                  {/* 手紙を書くボタン（右側 / スマホでは下） */}
                  <div className="w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0">
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