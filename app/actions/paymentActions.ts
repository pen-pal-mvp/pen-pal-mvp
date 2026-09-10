"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function upgradeSubscriptionAction(provider: "line" | "kakao") {
  // Next.js 15 仕様: cookies() を await し、as any で型エラーを回避する
  const cookieStore = await cookies();
  const supabase = createServerActionClient({
    cookies: () => cookieStore as any,
  });

  // 1. 現在のログインユーザーを取得
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "認証エラーが発生しました" };
  }

  // =========================================================================
  // ※本来はここで LINE Pay / Kakao Pay の決済確定APIを呼び出しますが、
  // 現段階では「決済が正常に完了した」とみなして処理を進めます。
  // =========================================================================

  // 2. ユーザーをプレミアム会員(is_premium = true)に更新
  const { error: updateError } = await supabase
    .from("users")
    .update({ is_premium: true })
    .eq("id", user.id);

  if (updateError) {
    return { success: false, error: "データベースの更新に失敗しました" };
  }

  // 3. ダッシュボードとプレミアムページのキャッシュをクリアして最新状態を反映
  revalidatePath("/dashboard");
  revalidatePath("/premium");

  return { success: true };
}