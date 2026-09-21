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
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ヘッダー部分：Flexboxで自然なバランス配置 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-4 px-2">
          
          {/* 左：ペンパルを探す */}
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 text-center md:text-left shrink-0">
            ペンパルを探す / 펜팔 찾기
          </h1>
          
          {/* 中央：翻訳ボタン（自然な余白で配置） */}
          <button type="button" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-2.5 rounded-2xl shadow-md transition-all flex flex-col items-center justify-center leading-tight gap-1 w-full sm:w-auto">
            <span className="text-sm font-bold">✨ 翻訳する</span>
            <span className="text-sm font-bold">번역하기</span>
          </button>

          {/* 右：プレミアム登録 */}
          <Link className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white px-5 py-2.5 rounded-full shadow-md transition-all flex flex-col items-center justify-center text-center leading-tight gap-1 shrink-0 w-full sm:w-auto" href="/premium">
            <span className="text-sm font-bold">✨ プレミアム登録</span>
            <span className="text-sm font-bold">프리미엄 등록</span>
          </Link>
          
        </div>

        {/* ユーザーリスト */}
        <div className="space-y-6">
          {(!allUsers || allUsers.length === 0) ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm flex flex-col items-center gap-2">
              <p className="text-slate-500 leading-relaxed text-lg font-medium text-center">
                現在、他のユーザーが見つかりません。
              </p>
              <p className="text-slate-500 leading-relaxed text-lg font-medium text-center">
                현재 다른 사용자를 찾을 수 없습니다.
              </p>
            </div>
          ) : (
            allUsers.map((targetUser) => {
              const displayMbti = (targetUser.avatar_type === '😊' || !targetUser.avatar_type) 
                ? '????' 
                : targetUser.avatar_type;

              return (
                <div key={targetUser.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 hover:shadow-md hover:border-violet-200 transition-all group">
                  
                  {/* アバター */}
                  <div className="flex items-center justify-center rounded-full border border-violet-100 shrink-0 bg-violet-50 w-20 h-20 group-hover:scale-105 transition-transform text-4xl text-slate-700">
                    {displayMbti}
                  </div>

                  {/* 名前とBio */}
                  <div className="flex-1 w-full min-w-0">
                    <div className="font-bold text-slate-800 text-xl mb-2 truncate">
                      {targetUser.pen_name || '名無しさん'}
                    </div>
                    <p className="text-base text-slate-600 leading-relaxed break-words">
                      {targetUser.bio || '自己紹介はまだありません。 / 자기소개가 아직 없습니다.'}
                    </p>
                  </div>

                  {/* 手紙を書くボタン（self-center を追加して常に上下中央に固定） */}
                  <Link 
                    href={`/letters/new?to=${targetUser.id}&name=${encodeURIComponent(targetUser.pen_name || '名無しさん')}`}
                    className="shrink-0 w-full sm:w-auto px-8 py-3 border-2 border-violet-400 text-violet-600 hover:bg-violet-50 rounded-xl font-bold text-sm transition-colors flex flex-col items-center justify-center leading-tight gap-1 mt-2 sm:mt-0 self-center"
                  >
                    <span>手紙を書く ✨</span>
                    <span>편지 쓰기</span>
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