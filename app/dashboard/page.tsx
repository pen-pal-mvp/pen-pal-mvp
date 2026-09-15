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

  const { data: blockingData } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id)
  const { data: blockedByData } = await supabase.from('blocks').select('blocker_id').eq('blocked_id', user.id)

  const blockedIds = [
    ...(blockingData?.map(b => b.blocked_id) || []),
    ...(blockedByData?.map(b => b.blocker_id) || [])
  ]

  const { data: reports } = await supabase.from('reports').select('letter_id').eq('reporter_id', user.id)
  const reportedLetterIds = reports?.map(r => r.letter_id) || []

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
          <h1 className="text-3xl font-semibold text-slate-800">
            受信箱 / 수신함
          </h1>
          <div className="flex flex-wrap gap-3 items-center">
            <Link className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-full text-base font-semibold shadow-md transition-all flex flex-col items-center leading-tight gap-1" href="/users">
              <span>🔍 ペンパルを探す</span>
              <span>펜팔 찾기</span>
            </Link>
            <Link className="text-base text-slate-600 hover:text-violet-600 font-semibold bg-white border border-slate-200 hover:border-violet-200 px-4 py-2.5 rounded-full transition-all flex flex-col items-center leading-tight gap-1" href="/profile">
              <span>プロフィール・設定</span>
              <span>프로필 설정</span>
            </Link>
            {!userData?.is_premium && (
              <Link className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white px-4 py-2.5 rounded-full text-base font-semibold shadow-md transition-all flex flex-col items-center leading-tight gap-1" href="/premium">
                <span>✨ プレミアム登録</span>
                <span>프리미엄 등록</span>
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {letters.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm">
              <span className="text-5xl block mb-4">📭</span>
              <p className="text-lg text-slate-700 font-medium leading-relaxed mb-4 flex flex-col gap-1">
                <span>手紙はまだ届いていません。</span>
                <span>편지가 아직 도착하지 않았습니다.</span>
              </p>
              <p className="text-lg text-slate-700 font-medium leading-relaxed flex flex-col gap-1">
                <span>「ペンパルを探す」から手紙を送ってみましょう！</span>
                <span>'펜팔 찾기'에서 편지를 보내보세요!</span>
              </p>
            </div>
          ) : (
            letters.map((letter) => {
              const deliveryDate = new Date(letter.delivery_at)
              const isDelivered = now >= deliveryDate
              
              const displayMbti = (letter.sender.avatar_type === '😊' || !letter.sender.avatar_type) 
                ? '????' 
                : letter.sender.avatar_type;

              return (
                <div key={letter.id} className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative">
                  
                  <div className="flex items-start mb-5 space-x-5">
                    <div className="text-lg font-black text-violet-600 tracking-wider bg-violet-50 w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-full border border-violet-100 mt-1">
                      {letter.sender.avatar_type === 'deleted' ? '👻' : displayMbti}
                    </div>
                    <div className="flex-1 min-w-0 pr-8 md:pr-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-800 text-2xl truncate pr-2">{letter.sender.pen_name}</p>
                        {/* ここを font-medium から font-semibold に変更し、太さを完全に統一 */}
                        <div className="text-right flex flex-col gap-1 text-violet-500 font-semibold">
                          <span className="text-base whitespace-nowrap">{isDelivered ? '配達完了' : '配達中...'}</span>
                          <span className="text-base whitespace-nowrap">{isDelivered ? '배달 완료' : '배달 중...'}</span>
                        </div>
                      </div>
                      <p className="text-base text-slate-500 line-clamp-2 leading-relaxed font-medium">
                        {letter.sender.bio || '自己紹介はまだありません。 / 아직 자기소개가 없습니다.'}
                      </p>
                    </div>
                  </div>
                  
                  {isDelivered ? (
                    <div>
                      <Link href={`/letters/${letter.id}`} className="block group mb-6">
                        <div className="bg-slate-50 py-8 px-5 rounded-2xl group-hover:bg-violet-50 group-hover:border-violet-200 border border-transparent transition-all text-center">
                          <span className="text-6xl block mb-4">💌</span>
                          <p className="text-xl text-slate-700 font-semibold mb-2">手紙が届いています / 편지가 도착했습니다</p>
                          <p className="text-lg text-slate-500 font-medium mb-5 flex flex-col items-center gap-1">
                            <span>タップして封筒を開ける</span>
                            <span>탭하여 봉투 열기</span>
                          </p>
                          <p className="inline-flex flex-col items-center text-lg font-semibold text-pink-500 bg-pink-50 px-8 py-3 rounded-full group-hover:bg-pink-100 transition-colors leading-tight gap-1">
                            <span>手紙を読む（AI翻訳） ✨</span>
                            <span>편지 읽기 (AI 번역)</span>
                          </p>
                        </div>
                      </Link>
                      <Link className="inline-flex flex-col items-center justify-center border-2 border-violet-400 text-violet-600 hover:bg-violet-50 px-6 py-3 rounded-full text-lg font-semibold transition-colors leading-tight gap-1" href={`/letters/new?to=${letter.sender_id}&name=${encodeURIComponent(letter.sender.pen_name)}`}>
                        <span>返信を書く</span>
                        <span>답장 쓰기</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">
                      <p className="text-lg text-slate-500 font-medium flex flex-col items-center gap-1">
                        <span>この手紙は {deliveryDate.toLocaleString('ja-JP')} に開封可能になります。</span>
                        <span>이 편지는 {deliveryDate.toLocaleString('ja-JP')}에 열어볼 수 있습니다.</span>
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