import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ActionMenu from '@/app/dashboard/ActionMenu'

export default async function LetterViewPage({ params }: { params: Promise<{ id: string }> }) {
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

  const resolvedParams = await params
  const letterId = resolvedParams.id

  const { data: letter, error } = await supabase
    .from('letters')
    .select('*, sender:users!letters_sender_id_fkey(pen_name, avatar_type)')
    .eq('id', letterId)
    .single()

  if (error || !letter || letter.receiver_id !== user.id) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center text-center font-sans">
        <div className="text-5xl mb-4">📭</div>
        <div className="text-lg text-slate-500 font-semibold mb-6 flex flex-col gap-1">
          <span>手紙が見つからないか、アクセス権限がありません。</span>
          <span>편지를 찾을 수 없거나 접근 권한이 없습니다.</span>
        </div>
        <Link href="/dashboard" className="text-lg text-violet-500 hover:text-violet-700 font-semibold transition-colors flex flex-col gap-1">
          <span>← ダッシュボードへ戻る</span>
          <span>대시보드로 돌아가기</span>
        </Link>
      </div>
    )
  }

  if (!letter.is_read) {
    await supabase.from('letters').update({ is_read: true }).eq('id', letterId)
  }

  const senderAvatar = letter.sender?.avatar_type === 'deleted' ? '👻' : (letter.sender?.avatar_type || '????')
  const senderName = letter.sender?.pen_name || '退会したユーザー'
  const translatedPlaceholder = "※現在、AI自動翻訳システムは準備中です。\n（今後のアップデートでOpenAIと連携されます）\n\n※현재 AI 자동 번역 시스템은 준비 중입니다.\n(향후 업데이트에서 OpenAI와 연동될 예정입니다)"

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center px-2 border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-semibold text-slate-800">
            手紙を読む / 편지 읽기
          </h1>
          <Link className="text-base text-slate-500 hover:text-violet-600 transition-colors font-semibold flex flex-col items-end leading-tight gap-1" href="/dashboard">
            <span>← 受信箱へ戻る</span>
            <span>수신함으로 돌아가기</span>
          </Link>
        </div>

        <div className="space-y-8 bg-white p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative">
          
          <div className="flex items-center space-x-5 border-b border-slate-100 pb-6">
            <div className="text-base font-black text-violet-600 tracking-wider bg-violet-50 w-16 h-16 flex items-center justify-center rounded-full border border-violet-100">
              {senderAvatar}
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-slate-800 text-xl">{senderName} からの手紙 / {senderName}님의 편지</p>
            </div>
          </div>

          <section>
            <div className="font-semibold text-xl mb-3 text-slate-800 flex items-center gap-2">
              <span>✉️ オリジナル（手紙本文） / 원본 (편지 본문)</span>
            </div>
            <div className="text-lg font-medium p-6 border border-slate-200 rounded-2xl bg-slate-50 text-slate-700 leading-relaxed shadow-inner whitespace-pre-wrap break-words">
              {letter.content}
            </div>
          </section>

          {/* 下部のボタン配置コンテナ（左にブロック、右に手紙を書く） */}
          <div className="w-full flex justify-between items-end pt-2">
            <ActionMenu letterId={letter.id} senderId={letter.sender_id} />

            <Link className="inline-flex flex-col items-center justify-center border-2 border-violet-400 text-violet-600 hover:bg-violet-50 px-8 py-2 rounded-xl text-sm font-bold transition-colors leading-tight gap-1" href={`/letters/new?to=${letter.sender_id}&name=${encodeURIComponent(senderName)}`}>
              <span>手紙を書く ✨</span>
              <span>편지 쓰기</span>
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}