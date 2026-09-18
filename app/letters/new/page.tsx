import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NewLetterPage({ searchParams }: { searchParams: Promise<{ to?: string, name?: string }> }) {
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

  const resolvedSearchParams = await searchParams
  const receiverId = resolvedSearchParams.to
  const receiverName = resolvedSearchParams.name || 'ユーザー'

  if (!receiverId) redirect('/users')

  async function sendLetter(formData: FormData) {
    'use server'
    const rawContent = formData.get('content') as string
    // ★ 修正：隠しフィールドから宛先IDを確実に受け取る
    const targetId = formData.get('receiverId') as string
    
    if (!rawContent || !rawContent.trim() || !targetId) return

    let safeContent = rawContent.substring(0, 800)
    safeContent = safeContent.replace(/\r?\n{3,}/g, '\n\n').trim()

    const cookieStore = await cookies()
    const actionSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user: actionUser } } = await actionSupabase.auth.getUser()
    if (!actionUser) return

    const now = new Date()
    const deliveryAt = new Date(now.getTime() + 3 * 60000)

    // ★ 修正：受け取った targetId を使って確実にデータベースへ保存
    await actionSupabase.from('letters').insert({
      sender_id: actionUser.id,
      receiver_id: targetId,
      content: safeContent,
      is_read: false,
      sent_at: now.toISOString(),
      delivery_at: deliveryAt.toISOString(),
    })

    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 px-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">新しい手紙を書く / 새 편지 쓰기</h1>
          <Link className="text-sm text-slate-500 hover:text-violet-600 transition-colors font-semibold flex flex-col items-end leading-tight gap-1" href="/users">
            <span>← キャンセル</span>
            <span>취소</span>
          </Link>
        </div>

        <form action={sendLetter} className="space-y-6">
          {/* ★ 修正：ユーザーには見えない宛先IDの入力欄を設置 */}
          <input type="hidden" name="receiverId" value={receiverId} />

          <div className="bg-violet-50 text-violet-700 p-4 rounded-2xl border border-violet-100 flex flex-col gap-1 font-semibold">
            <span>🕊️ 宛先: {receiverName}</span>
            <span>받는 사람: {receiverName}</span>
          </div>

          <div className="relative group">
            <textarea
              name="content"
              required
              maxLength={800}
              rows={12}
              className="w-full p-6 pb-10 bg-white rounded-3xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-slate-700 resize-y shadow-sm leading-relaxed break-all"
              placeholder="ここに手紙の本文を書いてください。のんびり、思いを込めて...&#13;&#10;여기에 편지 본문을 작성해 주세요. 여유를 가지고 마음을 담아서..."
            ></textarea>
            
            <div className="absolute bottom-4 right-6 text-xs font-bold text-slate-400 pointer-events-none">
              最大 800文字 / 최대 800자
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center gap-1 leading-tight">
            <span>手紙を送る ✨</span>
            <span className="text-sm font-medium">편지 보내기</span>
          </button>
        </form>

      </div>
    </div>
  )
}