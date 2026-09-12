"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getServerUserId() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (_) {}
        },
      },
    }
  );

  // サーバー側で直接Cookieから確実なユーザー情報を取得
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}