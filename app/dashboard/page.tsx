import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ActionMenu from './ActionMenu'

export default async function DashboardPage() {
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
    .select('is_premium')
    .eq('id', user.id)
    .single()

  // ブロックリスト取得
  const { data: blocks } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', user.id)
  const blockedIds = blocks?.map(b => b.blocked_id) || []

  // 通報リスト取得
  const { data: reports } = await supabase
    .from('reports')
    .select('letter_id')
    .eq('reporter_id', user.id)
  const reportedLetterIds = reports?.map(r => r.letter_id) || []

  // 手紙取得
  let query = supabase
    .from('letters')
    .select(`
      *,
      sender:users!letters_sender_id_fkey(pen_name, avatar_type)
    `)
    .eq('receiver_id', user.id)
    .order('sent_at', { ascending: false })

  const { data: allLetters } = await query

  // フィルタリング処理
  const letters = allLetters?.filter(letter => 
    !blockedIds.includes(letter.sender_id) && 
    !reportedLetterIds.includes(letter.id)
  ) || []

  const now = new Date()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">受信箱</h1>
          <div className="space-x-4">
            <Link href="/profile" className="text-sm text-gray-600 hover:underline">プロフィール・設定</Link>
            {!userData?.is_premium && (
              <Link href="/premium" className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold shadow">
                プレミアム登録
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {letters.length === 0 ? (
            <p className="text-gray-500 text-center py-10">手紙はまだ届いていません。</p>
          ) : (
            letters.map((letter) => {
              const deliveryDate = new Date(letter.delivery_at)
              const isDelivered = now >= deliveryDate

              return (
                <div key={letter.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
                  
                  {/* 通報・ブロックボタンコンポーネント */}
                  <ActionMenu letterId={letter.id} senderId={letter.sender_id} />

                  <div className="flex items-center mb-4 space-x-3">
                    <span className="text-3xl">
                      {letter.sender.avatar_type === 'deleted' ? '👻' : letter.sender.avatar_type || '😊'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{letter.sender.pen_name}</p>
                      <p className="text-xs text-gray-400">{isDelivered ? '配達完了' : '配達中...'}</p>
                    </div>
                  </div>

                  {isDelivered ? (
                    <div>
                      <p className="text-gray-700 whitespace-pre-wrap mb-4">{letter.content}</p>
                      <Link href={`/letters/${letter.id}/reply`} className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">
                        返信を書く
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-500">
                        この手紙は {deliveryDate.toLocaleString('ja-JP')} に開封可能になります。
                      </p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}