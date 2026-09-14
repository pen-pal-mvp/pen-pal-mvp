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
        getAll() {
          return cookieStore.getAll()
        },
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

  // 【強化フィルター】自分がブロックした相手、および自分をブロックした相手の両方を取得
  const { data: blockingData } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id)
  const { data: blockedByData } = await supabase.from('blocks').select('blocker_id').eq('blocked_id', user.id)

  const blockedIds = [
    ...(blockingData?.map(b => b.blocked_id) || []),
    ...(blockedByData?.map(b => b.blocker_id) || [])
  ]

  const { data: reports } = await supabase.from('reports').select('letter_id').eq('reporter_id', user.id)
  const reportedLetterIds = reports?.map(r => r.letter_id) || []

  // ★ 変更点：取得データに `bio` を追加
  let query = supabase
    .from('letters')
    .select('*, sender:users!letters_sender_id_fkey(pen_name, avatar_type, bio)')
    .eq('receiver_id', user.id)
    .order('sent_at', { ascending: false })

  const { data: allLetters } = await query

  const letters = allLetters?.filter(letter => 
    !blockedIds.includes(letter.sender_id) && 
    !reportedLetterIds.includes(letter.id)
  ) || []

  const now = new Date()

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-slate-800">受信箱</h1>
          <div className="flex flex-wrap gap-3 items-center">
            <Link className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md transition-all" href="/users">
              🔍 ペンパルを探す
            </Link>
            <Link className="text-sm text-slate-600 hover:text-violet-600 font-medium bg-white border border-slate-200 hover:border-violet-200 px-4 py-2.5 rounded-full transition-all" href="/profile">
              プロフィール・設定
            </Link>
            {!userData?.is_premium && (
              <Link className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white px-4 py-2.5 rounded-full text-sm font-bold shadow-md transition-all" href="/premium">
                ✨ プレミアム登録
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {letters.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm">
              <span className="text-5xl block mb-4">📭</span>
              <p className="text-slate-500 leading-relaxed">手紙はまだ届いていません。<br/>「ペンパルを探す」から手紙を送ってみましょう！</p>
            </div>
          ) : (
            letters.map((letter) => {
              const deliveryDate = new Date(letter.delivery_at)
              const isDelivered = now >= deliveryDate
              
              // MBTIの表示最適化
              const displayMbti = (letter.sender.avatar_type === '😊' || !letter.sender.avatar_type) 
                ? '????' 
                : letter.sender.avatar_type;

              return (
                <div key={letter.id} className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative">
                  {isDelivered && (
                    <ActionMenu letterId={letter.id} senderId={letter.sender_id} />
                  )}

                  <div className="flex items-start mb-5 space-x-4">
                    <div className="text-sm font-black text-violet-600 tracking-wider bg-violet-50 w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-full border border-violet-100 mt-1">
                      {letter.sender.avatar_type === 'deleted' ? '👻' : displayMbti}
                    </div>
                    <div className="flex-1 min-w-0 pr-8 md:pr-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-slate-800 text-lg truncate pr-2">{letter.sender.pen_name}</p>
                        <p className="text-xs text-violet-500 font-bold whitespace-nowrap">{isDelivered ? '配達完了' : '配達中...'}</p>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {letter.sender.bio || '自己紹介はまだありません。'}
                      </p>
                    </div>
                  </div>
                  
                  {isDelivered ? (
                    <div>
                      <Link href={`/letters/${letter.id}`} className="block group mb-6">
                        <div className="bg-slate-50 p-5 rounded-2xl group-hover:bg-violet-50 group-hover:border-violet-200 border border-transparent transition-all">
                          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed line-clamp-3">
                            {letter.content}
                          </p>
                          <p className="mt-3 text-sm font-bold text-pink-500 flex items-center">
                            手紙を開く（AI翻訳） <span className="ml-1">✨</span>
                          </p>
                        </div>
                      </Link>
                      <Link className="inline-block border-2 border-violet-400 text-violet-600 hover:bg-violet-50 px-6 py-2 rounded-full text-sm font-bold transition-colors" href={`/letters/new?to=${letter.sender_id}&name=${encodeURIComponent(letter.sender.pen_name)}`}>
                        返信を書く
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">
                      <p className="text-sm text-slate-500 font-medium">
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