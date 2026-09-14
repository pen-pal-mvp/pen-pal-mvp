"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// SSR用のSupabaseクライアントを生成するヘルパー関数
async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
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
          } catch (error) {
            // Server Action内からの呼び出し時のエラーハンドリング
          }
        },
      },
    }
  );
}

// ユーザーをブロックするアクション
export async function blockUserAction(blockedId: string) {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { success: false, error: "認証エラーが発生しました" };

  const { error } = await supabase.from('blocks').insert({
    blocker_id: user.id,
    blocked_id: blockedId
  });

  if (error) {
    if (error.code === '23505') return { success: true }; // 既にブロック済みの場合は成功扱い
    return { success: false, error: "ブロック処理に失敗しました" };
  }

  return { success: true };
}

// ユーザーを通報するアクション
export async function reportUserAction(reportedId: string, letterId: string, reason: string) {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { success: false, error: "認証エラーが発生しました" };

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    reported_id: reportedId,
    letter_id: letterId,
    reason: reason
  });

  if (error) return { success: false, error: "通報処理に失敗しました" };
  return { success: true };
}