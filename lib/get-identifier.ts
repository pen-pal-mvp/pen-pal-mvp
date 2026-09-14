// lib/get-identifier.ts
import { headers, cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getRateLimitIdentifier() {
  // 1. SSR用のSupabaseクライアントをファイル内で直接生成
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {} // 認証情報の読み取り専用として扱うため、セット処理は空でOK
      }
    }
  );
  
  // 2. サーバーサイドでの絶対的な本人認証（改ざん不可能）
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const isPremium = user.user_metadata?.is_premium === true;
    return { 
      identifier: `user:${user.id}`, 
      isPremium,
      tier: isPremium ? "premium" : "free" 
    };
  }

  // 3. Next.js 15仕様：未ログイン時のIP取得
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : "127.0.0.1";

  return { 
    identifier: `ip:${ip}`, 
    isPremium: false,
    tier: "guest"
  };
}