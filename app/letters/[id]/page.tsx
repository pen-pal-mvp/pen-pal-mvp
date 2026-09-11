import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

// paramsの型をPromiseに変更
export default async function LetterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // awaitを使ってidを取得（最新Next.jsの必須仕様）
  const { id } = await params
  
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: letter, error } = await supabase
    .from('letters')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !letter) notFound()
  if (letter.receiver_id !== user.id) notFound()

  const isDelivered = new Date(letter.delivery_at) <= new Date()
  if (!isDelivered) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md space-y-4">
          <div className="text-5xl">🕊️</div>
          <h1 className="text-xl font-bold text-gray-800">手紙はまだ配達中です</h1>
          <p className="text-gray-600 text-sm">
            相手のポストからあなたの元へ向かっています。<br />もうしばらくお待ちください。
          </p>
          <div className="pt-4">
            <Link href="/dashboard" className="text-orange-500 font-medium hover:underline text-sm">
              ← ダッシュボードへ戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { data: userData } = await supabase.from('users').select('is_premium').eq('id', user.id).single()
  const isPremium = userData?.is_premium || false

  const { data: senderData } = await supabase.from('users').select('pen_name, avatar_type').eq('id', letter.sender_id).single()

  return (
    <div className="min-h-screen bg-[#faf9f5] p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center px-2">
          <Link href="/dashboard" className="text-sm text-orange-500 font-medium hover:underline">
            ← ダッシュボードへ戻る
          </Link>
          <span className="text-xs text-gray-400">
            {new Date(letter.created_at).toLocaleDateString()} に投函
          </span>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-pink-500"></div>
          
          <div className="flex items-center space-x-4 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-2xl">
              {senderData?.avatar_type || '😊'}
            </div>
            <div>
              <p className="text-xs text-gray-400">差出人</p>
              <p className="font-bold text-gray-800 text-lg">{senderData?.pen_name || '名無しのペンパル'}</p>
            </div>
          </div>

          <div className="py-2">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg font-normal">
              {letter.content}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            {isPremium ? (
              <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-orange-900 flex items-center text-sm">
                    <span className="mr-2">✨</span> AI自動翻訳
                  </h3>
                  <span className="text-xs bg-orange-200 text-orange-800 px-2.5 py-1 rounded-full font-bold">プレミアム機能</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  （ここに翻訳されたテキストがインラインで表示されます）
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-6 rounded-2xl border border-orange-100 text-center space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-800 flex items-center justify-center">
                    <span className="mr-2">✨</span> ワンタップAI自動翻訳を使いませんか？
                  </h3>
                  <p className="text-xs text-gray-600">
                    プレミアムプランに登録すると、韓国語や日本語の手紙を瞬時に翻訳できます。
                  </p>
                </div>
                <Link
                  href="/premium"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 text-white rounded-full font-bold text-sm shadow-md transition-all"
                >
                  プレミアムプランの詳細を見る
                </Link>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-4">
            <Link
              href={`/letters/new?to=${letter.sender_id}&name=${encodeURIComponent(senderData?.pen_name || '相手')}`}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-sm shadow-md transition-all"
            >
              返事を書く ✉️
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}