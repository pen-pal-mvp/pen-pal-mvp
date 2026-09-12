"use server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function upgradeSubscriptionAction(provider: "line" | "kakao", userId: string) {
  if (!userId) {
    return { success: false, error: "ユーザーIDが指定されていません" };
  }

  // MVPデモ用の特例ルート
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update({ is_premium: true })
    .eq("id", userId); // 修正箇所: 対象を単一のユーザーIDに限定

  if (updateError) {
    console.error("DB Update Error:", updateError);
    return { success: false, error: "データベースの更新に失敗しました" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/premium");
  return { success: true };
}