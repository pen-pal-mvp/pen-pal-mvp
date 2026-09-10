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

  // 自分以外の全ユーザーを取得
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, pen_name, avatar_type')
    .neq('id', user.id)

  return (
    <div className="min-h-screen bg-[#faf9f5] p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-800">ペンパルを探す</h1>
          <Link className="text-sm text-gray-500 hover:text-orange-500 transition-colors font-medium" href="/dashboard">
            ← ダッシュボードへ戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(!allUsers || allUsers.length === 0) ? (
            <p className="text-gray-500 col-span-3 text-center py-10 bg-white rounded-2xl border border-gray-100">
              現在、他のユーザーが見つかりません。
            </p>
          ) : (
            allUsers.map((targetUser) => (
              <div key={targetUser.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
                <div className="text-6xl bg-orange-50 w-24 h-24 flex items-center justify-center rounded-full">
                  {targetUser.avatar_type || '😊'}
                </div>
                <div className="font-bold text-gray-800 text-lg">
                  {targetUser.pen_name || '名無しさん'}
                </div>
                <Link 
                  href={`/letters/new?to=${targetUser.id}&name=${encodeURIComponent(targetUser.pen_name || '名無しさん')}`}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-colors shadow-sm text-center"
                >
                  手紙を書く
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}