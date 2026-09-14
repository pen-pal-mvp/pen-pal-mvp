"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function upgradeSubscriptionAction(provider: "line" | "kakao", userId: string) {
  if (!userId) {
    return { success: false, error: "ユーザーIDが指定されていません" };
  }

  // Next.js 15対応: cookies() を必ず await で非同期取得する
  const cookieStore = await cookies();

  // マスターキーを廃止し、アクセスしてきたユーザーの権限（Anon Key + Cookie）を持つクライアントを生成
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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Actionからの呼び出し時に発生するCookieセットエラーを安全に無視
          }
        },
      },
    }
  );

  // RLSが有効なため、Cookieの本人ID(auth.uid)と引数のuserIdが一致しない場合は
  // データベース側で強制的にエラー弾きされるわ（完全な防弾ガラス）
  const { error: updateError } = await supabase
    .from("users")
    .update({ is_premium: true })
    .eq("id", userId);

  if (updateError) {
    console.error("DB Update Error (RLS or Auth):", updateError);
    return { success: false, error: "権限がないか、データベースの更新に失敗しました" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/premium");
  return { success: true };
}