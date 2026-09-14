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
        <p className="text-lg text-slate-500 font-bold mb-6">手紙が見つからないか、アクセス権限がありません。</p>
        <Link href="/dashboard" className="text-lg text-violet-500 hover:text-violet-700 font-bold transition-colors">
          ← ダッシュボードへ戻る
        </Link>
      </div>
    )
  }

  if (!letter.is_read) {
    await supabase.from('letters').update({ is_read: true }).eq('id', letterId)
  }

  const senderAvatar = letter.sender?.avatar_type === 'deleted' ? '👻' : (letter.sender?.avatar_type || '????')
  const senderName = letter.sender?.pen_name || '退会したユーザー'
  const translatedPlaceholder = "※現在、AI自動翻訳システムは準備中です。\n（今後のアップデートでOpenAIと連携されます）"

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center px-2">
          <h1 className="text-3xl font-bold text-slate-800">手紙を読む</h1>
          <Link className="text-base text-slate-500 hover:text-violet-600 transition-colors font-bold" href="/dashboard">
            ← 受信箱へ戻る
          </Link>
        </div>

        <div className="space-y-8 bg-white p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative">
          
          <div className="absolute top-6 right-6 md:top-8 md:right-8">
            <ActionMenu letterId={letter.id} senderId={letter.sender_id} />
          </div>

          <div className="flex items-center space-x-5 border-b border-slate-100 pb-6 pr-24">
            <div className="text-base font-black text-violet-600 tracking-wider bg-violet-50 w-16 h-16 flex items-center justify-center rounded-full border border-violet-100">
              {senderAvatar}
            </div>
            <div>
              {/* 送信者名のみを表示し、時間の要素を完全に排除 */}
              <p className="font-bold text-slate-800 text-xl">{senderName} からの手紙</p>
            </div>
          </div>

          <section>
            <div className="font-bold text-xl mb-3 text-slate-800 flex items-center">
              <span className="mr-2">✉️</span> オリジナル（手紙本文）
            </div>
            <div className="text-lg p-6 border border-slate-200 rounded-2xl bg-slate-50 text-slate-700 leading-relaxed shadow-inner whitespace-pre-wrap break-words">
              {letter.content}
            </div>
          </section>

          <section>
            <div className="font-bold text-xl mb-3 flex items-center">
              <span className="mr-2">✨</span> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500">
                AI自動翻訳
              </span>
            </div>
            <div className="text-lg p-6 border border-violet-100 rounded-2xl bg-violet-50 text-slate-700 leading-relaxed shadow-inner whitespace-pre-wrap">
              {translatedPlaceholder}
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}