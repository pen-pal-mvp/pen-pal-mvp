import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              // サーバーコンポーネントからの呼び出しエラーを無視
            }
          },
        },
      }
    )

    // 送られてきたコードを使ってログイン（セッション確立）
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // ログイン成功後、誰がログインしたかを確認
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // usersテーブルから会員ステータス（ここでは is_premium と仮定）を取得
        const { data: userData } = await supabase
          .from('users')
          .select('is_premium')
          .eq('id', user.id)
          .single()

        // 🌟 ここがルートの分岐点よ！
        if (userData?.is_premium) {
          // 会員なら ① dashboard へ案内
          return NextResponse.redirect(`${origin}/dashboard`)
        } else {
          // 非会員（新規登録含む）なら ⑧ welcome へ案内
          return NextResponse.redirect(`${origin}/welcome`)
        }
      }
    }
  }

  // エラー時などはトップページへ戻す
  return NextResponse.redirect(`${origin}/`)
}