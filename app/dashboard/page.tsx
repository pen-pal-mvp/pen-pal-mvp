import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

  let query = supabase
    .from('letters')
    .select('*, sender:users!letters_sender_id_fkey(pen_name, avatar_type)')
    .eq('receiver_id', user.id)
    .order('sent_at', { ascending: false })

  const { data: allLetters } = await query

  // ブロック関係にあるユーザーからの手紙を除外
  const letters = allLetters?.filter(letter => 
    !blockedIds.includes(letter.sender_id)
  ) || []

  const now = new Date()

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-slate-800">受信箱 / 받은 편지함</h1>
          <div className="flex flex-wrap gap-3 items-center">
            <Link className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-full shadow-md transition-all flex flex-col items-center justify-center text-center leading-tight gap-1" href="/users">
              <span className="text-sm font-bold">🔍 ペンパルを探す</span>
              <span className="text-sm font-bold">펜팔 찾기</span>
            </Link>
            <Link className="bg-white border border-slate-200 hover:border-violet-200 px-4 py-2.5 rounded-full transition-all flex flex-col items-center justify-center text-center group leading-tight gap-1" href="/profile">
              <span className="text-sm font-medium text-slate-600 group-hover:text-violet-600">プロフィール・設定</span>
              <span className="text-sm font-medium text-slate-600 group-hover:text-violet-600">프로필·설정</span>
            </Link>
            {!userData?.is_premium && (
              <Link className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white px-4 py-2.5 rounded-full shadow-md transition-all flex flex-col items-center justify-center text-center leading-tight gap-1" href="/premium">
                <span className="text-sm font-bold">✨ プレミアム登録</span>
                <span className="text-sm font-bold">프리미엄 등록</span>
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {letters.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm flex flex-col items-center gap-2">
              <span className="text-5xl block mb-4">📭</span>
              <p className="text-slate-500 leading-relaxed text-lg font-medium text-center">
                手紙はまだ届いていません。
              </p>
              <p className="text-slate-500 leading-relaxed text-lg font-medium text-center">
                편지가 아직 도착하지 않았습니다.
              </p>
              <p className="text-slate-500 leading-relaxed text-lg font-medium text-center mt-3">
                「ペンパルを探す」から手紙を送ってみましょう！
              </p>
              <p className="text-slate-500 leading-relaxed text-lg font-medium text-center">
                '펜팔 찾기'에서 편지를 보내보세요!
              </p>
            </div>
          ) : (
            letters.map((letter) => {
              const deliveryDate = new Date(letter.delivery_at)
              const sentDate = new Date(letter.sent_at)
              const isDelivered = now >= deliveryDate

              const formatOptions: Intl.DateTimeFormatOptions = { 
                timeZone: 'Asia/Tokyo',
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit' 
              }
              
              const formattedSentDate = sentDate.toLocaleString('ja-JP', formatOptions)
              const formattedDeliveryDate = deliveryDate.toLocaleString('ja-JP', formatOptions)

              // MBTI（英数字）と絵文字を自動判別
              const rawAvatar = letter.sender.avatar_type || '😊'
              const avatar = rawAvatar === 'deleted' ? '👻' : rawAvatar
              const isTextAvatar = /^[a-zA-Z0-9]+$/.test(avatar)

              return (
                <div key={letter.id} className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative">
                  
                  <div className="flex items-center mb-5 space-x-4">
                    <div className={`flex items-center justify-center rounded-full border border-violet-100 shrink-0 bg-violet-50 w-20 h-20 ${isTextAvatar ? 'text-2xl font-black text-violet-600 tracking-widest' : 'text-5xl'}`}>
                      {avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-xl truncate">{letter.sender.pen_name}</p>
                      <p className="text-base text-violet-500 font-bold mt-1">
                        {isDelivered ? '配達完了 / 배달 완료' : '配達中... / 배달 중...'}
                      </p>
                    </div>
                  </div>
                  {isDelivered ? (
                    <div>
                      <Link href={`/letters/${letter.id}`} className="block group mb-2">
                        <div className="bg-slate-50 p-6 rounded-2xl group-hover:bg-violet-50 group-hover:border-violet-200 border border-transparent transition-all flex justify-between items-center gap-4">
                          <p className="text-lg font-medium text-slate-700 group-hover:text-violet-800 transition-colors">
                            発送日時 / 발송 일시: <br className="sm:hidden" />{formattedSentDate}
                          </p>
                          <span className="text-violet-400 group-hover:text-violet-600 font-bold text-3xl shrink-0">→</span>
                        </div>
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100 flex flex-col gap-2">
                      <p className="text-lg text-slate-700 font-medium">
                        この手紙は {formattedDeliveryDate} に開封可能になります。
                      </p>
                      <p className="text-lg text-slate-700 font-medium">
                        이 편지는 {formattedDeliveryDate}에 열어볼 수 있습니다.
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