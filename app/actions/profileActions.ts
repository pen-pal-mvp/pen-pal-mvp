"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { singleStringSchema } from "@/lib/validations";
import { containsPersonalInfo } from "@/utils/textFilter";

export async function updateBioAction(bio: string) {
  // 1. Zodによる厳密な型・文字数検証
  const validation = singleStringSchema.safeParse(bio);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.flatten().formErrors[0] || "不正なデータ形式です",
    };
  }
  const safeBio = validation.data;

  // 2. 連絡先交換フィルター（自己紹介での無料マッチング・離脱を阻止し、マネタイズを守る）
  if (containsPersonalInfo(safeBio)) {
    return { 
      success: false, 
      error: "プロフィールにLINEやSNSアカウントなどの連絡先を記載することは禁止されています。" 
    };
  }

  // 3. 認証チェック
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {}
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "ログインが必要です" };
  }

  // 4. DB更新
  const { error } = await supabase
    .from("users")
    .update({ bio: safeBio })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: "プロフィールの更新に失敗しました" };
  }

  return { success: true };
}