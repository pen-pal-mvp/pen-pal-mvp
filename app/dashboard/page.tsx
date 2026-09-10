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

  const { data: blocks } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id)
  const blockedIds = blocks?.map(b => b.blocked_id) || []

  const { data: reports } = await supabase.from('reports').select('letter_id').eq('reporter_id', user.id)
  const reportedLetterIds = reports?.map(r => r.letter_id) || []

  let query = supabase
    .from('letters')
    .select('*, sender:users!letters_sender_id_fkey(pen_name, avatar_type)')
    .eq('receiver_id', user.id)
    .order('sent_at', { ascending: false })

  const { data: allLetters } = await query

  const letters = allLetters?.filter(letter => 
    !blockedIds.includes(letter.sender_id) && 
    !reportedLetterIds.includes(letter.id)
  ) || []

  const now = new Date()

  return (
    <div className="min-h-screen bg-[#faf9f5] p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-800">受信箱</h1>
          <div className="flex flex-wrap gap-3 items-center">
            <Link className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md transition-colors" href="/users">
              🔍 ペンパルを探す
            </Link>
            <Link className="text-sm text-gray-600 hover:text-orange-500 font-medium bg-white border border-gray-200 px-4 py-2.5 rounded-full transition-colors" href="/profile">
              プロフィール・設定
            </Link>
            {!userData?.is_premium && (
              <Link className="bg-yellow-400 text-yellow-900 px-4 py-2.5 rounded-full text-sm font-bold shadow" href="/premium">
                プレミアム登録
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {letters.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
              <span className="text-4xl block mb-3">📭</span>
              <p className="text-gray-500">手紙はまだ届いていません。<br/>「ペンパルを探す」から手紙を送ってみましょう！</p>
            </div>
          ) : (
            letters.map((letter) => {
              const deliveryDate = new Date(letter.delivery_at)
              const isDelivered = now >= deliveryDate

              return (
                <div key={letter.id} className="bg-white p-6 rounded-2xl shadow-sm border border-orange-50 relative">
                  <ActionMenu letterId={letter.id} senderId={letter.sender_id} />
                  <div className="flex items-center mb-4 space-x-4">
                    <div className="text-4xl bg-orange-50 w-16 h-16 flex items-center justify-center rounded-full">
                      {letter.sender.avatar_type === 'deleted' ? '👻' : letter.sender.avatar_type || '😊'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{letter.sender.pen_name}</p>
                      <p className="text-xs text-orange-500 font-medium">{isDelivered ? '配達完了' : '配達中...'}</p>
                    </div>
                  </div>
                  {isDelivered ? (
                    <div>
                      <p className="text-gray-700 whitespace-pre-wrap mb-6 leading-relaxed bg-gray-50 p-4 rounded-xl">
                        {letter.content}
                      </p>
                      <Link className="inline-block border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-6 py-2 rounded-full text-sm font-bold transition-colors" href={`/letters/${letter.id}/reply`}>
                        返信を書く
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-100">
                      <p className="text-sm text-gray-500 font-medium">
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