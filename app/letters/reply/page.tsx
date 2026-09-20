import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'

export default async function ReplyPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ to?: string, name?: string }> 
}) {
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

  const resolvedParams = await searchParams
  const toId = resolvedParams.to
  const toName = resolvedParams.name || 'ユーザー'

  if (!toId) {
    redirect('/users')
  }

  async function sendReply(formData: FormData) {
    'use server'
    const content = formData.get('content') as string
    if (!content || !content.trim()) return

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
    if (user) {
      await supabase.from('letters').insert({
        sender_id: user.id,
        receiver_id: toId,
        content: content.trim().substring(0, 400),
        is_read: false
      })
    }
    
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-semibold text-slate-800">
            新しい手紙を書く / 새 편지 쓰기
          </h1>
          {/* ここが変更箇所：href を javascript:history.back() に変更し、a タグにしました */}
          <a className="text-sm text-slate-500 hover:text-violet-600 transition-colors font-semibold flex flex-col items-end leading-tight gap-1 cursor-pointer" href="javascript:history.back()">
            <span>← キャンセル</span>
            <span>취소</span>
          </a>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100 space-y-8">
          
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col gap-1">
            <div className="font-semibold text-slate-700 flex items-center gap-2">
              <span>🕊️ 宛先:</span>
              <span className="text-violet-600 font-bold">{toName}</span>
            </div>
            <div className="font-semibold text-slate-700 flex items-center gap-2">
              <span>받는 사람:</span>
              <span className="text-violet-600 font-bold">{toName}</span>
            </div>
          </div>

          <form action={sendReply} className="space-y-6">
            <div className="relative">
              <textarea 
                name="content"
                required
                maxLength={400}
                rows={10}
                className="w-full p-6 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-slate-700 resize-none text-lg leading-relaxed placeholder:text-slate-400"
                placeholder="ここに手紙の本文を書いてください。のんびり、思いを込めて...&#13;&#10;여기에 편지 본문을 작성해 주세요. 여유를 가지고 마음을 담아서..."
              />
              <div className="absolute bottom-4 right-4 text-xs font-semibold text-slate-400">
                残り 400 文字 / 남은 글자수 400자
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full py-4 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-2xl font-semibold text-xl shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center gap-1 leading-tight">
                <span>手紙を送る ✨</span>
                <span>편지 보내기</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}