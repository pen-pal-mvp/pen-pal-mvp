"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// 【新規追加】現在のユーザーがプレミアム会員かどうかを確認するアクション
export async function checkPremiumStatusAction() {
  const cookieStore = await cookies();
  const supabase = createServerActionClient({
    cookies: () => cookieStore as any,
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("users")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  return profile?.is_premium || false;
}

export async function sendReplyAction(originalLetterId: string, content: string, isExpress: boolean) {
  // Next.js 15 仕様: cookies() を await
  const cookieStore = await cookies();
  const supabase = createServerActionClient({
    cookies: () => cookieStore as any,
  });

  // 1. 現在のログインユーザー（送信者）を取得
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "認証エラーが発生しました" };
  }

  // 【新規追加】特急便の不正利用をブロック（論理の保護）
  if (isExpress) {
    const { data: profile } = await supabase
      .from("users")
      .select("is_premium")
      .eq("id", user.id)
      .single();
      
    if (!profile?.is_premium) {
      return { success: false, error: "特急便はプレミアム会員限定の機能です。先に登録をお願いします。" };
    }
  }

  // 2. 元の手紙のデータを取得し、返信先の相手（receiver_id）を特定
  const { data: originalLetter, error: fetchError } = await supabase
    .from("letters")
    .select("sender_id")
    .eq("id", originalLetterId)
    .single();

  if (fetchError || !originalLetter) {
    return { success: false, error: "元の手紙が見つかりません" };
  }

  const receiverId = originalLetter.sender_id;

  // 3. 配達時間（delivery_at）の計算
  const deliveryAt = new Date();
  if (!isExpress) {
    // 通常便は24時間後に設定
    deliveryAt.setHours(deliveryAt.getHours() + 24);
  }
  // ※特急便(isExpress = true)の場合は、現在時刻のままなので即時配達される

  // 4. lettersテーブルへ手紙をINSERT
  const { error: insertError } = await supabase
    .from("letters")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: content,
      delivery_at: deliveryAt.toISOString(),
    });

  if (insertError) {
    return { success: false, error: "手紙の送信に失敗しました" };
  }

  return { success: true };
}