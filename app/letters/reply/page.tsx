import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TextAreaWithCount from '../new/TextAreaWithCount'

export default async function NewLetterPage({ searchParams }: { searchParams: Promise<{ to?: string, name?: string, error?: string }> }) {
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
  const errorMessage = resolvedSearchParams.error

  if (!receiverId) redirect('/users')

  async function sendLetter(formData: FormData) {
    'use server'
    const rawContent = formData.get('content') as string
    const targetId = formData.get('receiverId') as string
    const targetName = formData.get('receiverName') as string
    
    if (!rawContent || !rawContent.trim() || !targetId) {
      redirect(`/letters/new?to=${targetId}&name=${encodeURIComponent(targetName)}&error=empty`)
    }

    // サーバー側でも言語ごとのバイト制限（上限2400）を適用
    let validStr = '';
    let currentSize = 0;
    for (let i = 0; i < rawContent.length; i++) {
      const charSize = rawContent.charCodeAt(i) <= 255 ? 1 : 6;
      if (currentSize + charSize <= 2400) {
        validStr += rawContent[i];
        currentSize += charSize;
      } else {
        break;
      }
    }

    let safeContent = validStr.replace(/\r?\n{3,}/g, '\n\n').trim()

    if (!safeContent) {
      redirect(`/letters/new?to=${targetId}&name=${encodeURIComponent(targetName)}&error=empty`)
    }

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

    const { error } = await actionSupabase.from('letters').insert({
      sender_id: actionUser.id,
      receiver_id: targetId,
      content: safeContent,
      is_read: false,
      sent_at: now.toISOString(),
      delivery_at: deliveryAt.toISOString(),
    })

    if (error) {
      console.error('送信エラー:', error.message)
      redirect(`/letters/new?to=${targetId}&name=${encodeURIComponent(targetName)}&error=db`)
    }

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
          <input type="hidden" name="receiverId" value={receiverId} />
          <input type="hidden" name="receiverName" value={receiverName} />

          {errorMessage === 'empty' && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-bold text-sm text-center flex flex-col gap-1">
              <span>⚠️ 内容が空白、または不自然な文字のためブロックされました。</span>
              <span className="text-xs">내용이 비어 있거나 부자연스러운 문자로 인해 차단되었습니다.</span>
            </div>
          )}
          {errorMessage === 'db' && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-bold text-sm text-center flex flex-col gap-1">
              <span>⚠️ サーバーエラーにより送信できませんでした。内容を見直してください。</span>
              <span className="text-xs">서버 오류로 인해 전송할 수 없습니다. 내용을 다시 확인해 주세요.</span>
            </div>
          )}

          <div className="bg-violet-50 text-violet-700 p-4 rounded-2xl border border-violet-100 flex flex-col gap-1 font-semibold">
            <span>🕊️ 宛先: {receiverName}</span>
            <span>받는 사람: {receiverName}</span>
          </div>

          <TextAreaWithCount />

          <button type="submit" className="w-full py-4 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center gap-1 leading-tight">
            <span>手紙を送る ✨</span>
            <span className="text-sm font-medium">편지 보내기</span>
          </button>
        </form>

      </div>
    </div>
  )
}