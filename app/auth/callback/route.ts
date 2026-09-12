import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // origin を使うことで、localhostでもVercelでも自動的に正しいURLを取得するわ
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // 成功時は origin (現在の環境のURL) をベースにリダイレクト
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // エラー時も origin へリダイレクト
  return NextResponse.redirect(`${origin}/?error=auth-code-error`);
}