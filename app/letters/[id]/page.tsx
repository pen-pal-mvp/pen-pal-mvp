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

  const senderAvatar = letter.sender?.avatar_type === 'deleted' ? '👻' : (letter.sender?.avatar_type || '😊')
  const senderName = letter.sender?.pen_name || '退会したユーザー'
  
  // 英字（MBTI等）か絵文字かの自動判別
  const isTextAvatar = /^[a-zA-Z0-9]+$/.test(senderAvatar)

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* ヘッダー部分（3等分レイアウトで中央にボタンを配置） */}
        <div className="flex flex-col md:flex-row justify-between items-center px-2 border-b border-slate-200 pb-4 gap-4">
          
          <div className="w-full md:w-1/3 flex justify-center md:justify-start">
            <h1 className="text-3xl font-semibold text-slate-800 text-center md:text-left">
              手紙を読む / 편지 읽기
            </h1>
          </div>
          
          <div className="w-full md:w-1/3 flex justify-center">
            {/* 翻訳ボタン (UIのみ) */}
            <button type="button" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-2.5 rounded-2xl shadow-md transition-all flex flex-col items-center justify-center leading-tight gap-1 w-full sm:w-auto">
              <span className="text-sm font-bold">✨ 翻訳する</span>
              <span className="text-sm font-bold">번역하기</span>
            </button>
          </div>

          <div className="w-full md:w-1/3 flex justify-center md:justify-end">
            <Link className="text-base text-slate-500 hover:text-violet-600 transition-colors font-semibold flex flex-col items-center md:items-end leading-tight gap-1" href="/dashboard">
              <span>← 受信箱へ戻る</span>
              <span>수신함으로 돌아가기</span>
            </Link>
          </div>
          
        </div>

        <div className="space-y-8 bg-white p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative">
          
          <div className="flex items-center space-x-5 border-b border-slate-100 pb-6">
            <div className={`flex items-center justify-center rounded-full border border-violet-100 shrink-0 bg-violet-50 w-16 h-16 ${isTextAvatar ? 'text-lg font-black text-violet-600 tracking-widest' : 'text-4xl'}`}>
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