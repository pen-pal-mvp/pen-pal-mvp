"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { containsPersonalInfo } from '@/utils/textFilter';
import { getRateLimitIdentifier } from '@/lib/get-identifier';
import { letterRateLimit } from '@/lib/rate-limit';
import { singleStringSchema } from '@/lib/validations';

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {} 
      }
    }
  );
}

export async function checkPremiumStatusAction() {
  const supabase = await getSupabaseClient();
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
  const validation = singleStringSchema.safeParse(content);
  if (!validation.success) {
    return { success: false, error: validation.error.flatten().formErrors[0] || "不正なデータ形式です" };
  }
  const safeContent = validation.data;

  const { identifier, isPremium } = await getRateLimitIdentifier();
  if (!isPremium) {
    const { success } = await letterRateLimit.limit(identifier);
    if (!success) {
      return { success: false, error: "1時間あたりの送信上限（5通）に達しました。時間を置くか、プレミアム会員になって無制限に手紙を送りましょう！" };
    }
  }

  const supabase = await getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "認証エラーが発生しました" };

  if (containsPersonalInfo(safeContent)) {
    return { success: false, error: "安全のため、LINEやSNSアカウント、電話番号などの連絡先交換は禁止されています。" };
  }

  try {
    const modResponse = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input: safeContent })
    });
    if (modResponse.ok) {
      const modData = await modResponse.json();
      if (modData.results[0].flagged) return { success: false, error: "不適切な表現が含まれているため送信できません。" };
    } else {
      return { success: false, error: "現在テキストのスキャンができません。時間を置いて再試行してください。" };
    }
  } catch (e) {
    return { success: false, error: "システムエラーが発生しました。時間を置いて再試行してください。" };
  }

  if (isExpress) {
    const { data: profile } = await supabase.from("users").select("is_premium").eq("id", user.id).single();
    if (!profile?.is_premium) return { success: false, error: "特急便はプレミアム会員限定の機能です。" };
  }

  const { data: originalLetter, error: fetchError } = await supabase
    .from("letters")
    .select("sender_id")
    .eq("id", originalLetterId)
    .single();
  if (fetchError || !originalLetter) return { success: false, error: "元の手紙が見つかりません" };

  const receiverId = originalLetter.sender_id;
  const deliveryAt = new Date();
  if (!isExpress) deliveryAt.setHours(deliveryAt.getHours() + 24);

  // ★ 防壁強化：sent_at と is_read を明示的に追加し、詳細なエラーをフロントへ返す
  const { error: insertError } = await supabase
    .from("letters")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: safeContent,
      sent_at: new Date().toISOString(),
      delivery_at: deliveryAt.toISOString(),
      is_read: false
    });

  if (insertError) {
    return { success: false, error: `DBエラー: ${insertError.message} (Code: ${insertError.code})` };
  }

  return { success: true };
}

export async function sendNewLetterAction(receiverId: string, content: string) {
  const validation = singleStringSchema.safeParse(content);
  if (!validation.success) {
    return { success: false, error: validation.error.flatten().formErrors[0] || "不正なデータ形式です" };
  }
  const safeContent = validation.data;

  const { identifier, isPremium } = await getRateLimitIdentifier();
  if (!isPremium) {
    const { success } = await letterRateLimit.limit(identifier);
    if (!success) {
      return { success: false, error: "1時間あたりの送信上限（5通）に達しました。時間を置くか、プレミアム会員になって無制限に手紙を送りましょう！" };
    }
  }

  const supabase = await getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "認証エラーが発生しました" };

  if (containsPersonalInfo(safeContent)) {
    return { success: false, error: "安全のため、連絡先交換は禁止されています。" };
  }

  try {
    const modResponse = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input: safeContent })
    });
    if (modResponse.ok) {
      const modData = await modResponse.json();
      if (modData.results[0].flagged) return { success: false, error: "不適切な表現が含まれているため送信できません。" };
    } else {
      return { success: false, error: "現在テキストのスキャンができません。時間を置いて再試行してください。" };
    }
  } catch (e) {
    return { success: false, error: "システムエラーが発生しました。時間を置いて再試行してください。" };
  }

  const deliveryAt = new Date(Date.now() + 60 * 60 * 1000);

  // ★ 防壁強化：sent_at を明示的に追加し、詳細なエラーをフロントへ返す
  const { error: insertError } = await supabase
    .from("letters")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: safeContent,
      sent_at: new Date().toISOString(),
      delivery_at: deliveryAt.toISOString(),
      is_read: false
    });

  if (insertError) {
    return { success: false, error: `DBエラー: ${insertError.message} (Code: ${insertError.code})` };
  }

  return { success: true };
}