import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
      // Next.js 15の仕様変更に合わせて、cookies()をawaitで展開する
      const cookieStore = await cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any})
      
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('【Supabase認証エラー】:', error.message)
        return NextResponse.redirect(new URL(`/?error=${error.message}`, request.url))
      }
    }

    return NextResponse.redirect(new URL('/profile', request.url))
  } catch (err) {
    console.error('【サーバークラッシュ原因】:', err)
    return NextResponse.redirect(new URL('/?error=server_crash', request.url))
  }
}