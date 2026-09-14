"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { containsPersonalInfo } from '@/utils/textFilter';
import { getRateLimitIdentifier } from '@/lib/get-identifier';
import { letterRateLimit } from '@/lib/rate-limit';
import { singleStringSchema } from '@/lib/validations';

// SSR用のSupabaseクライアントを生成する共通関数
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

// 【更新】現在のユーザーがプレミアム会員かどうかを確認するアクション
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

// 【更新】返信用の安全なアクション（レートリミット追加・SSR対応）
export async function sendReplyAction(originalLetterId: string, content: string, isExpress: boolean) {
  // 防壁0-A: Zodによる厳密な型・文字数検証
  const validation = singleStringSchema.safeParse(content);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.flatten().formErrors[0] || "不正なデータ形式です",
    };
  }
  const safeContent = validation.data;

  // 防壁0-B: スパム・API破産防止（レートリミット）
  const { identifier, isPremium } = await getRateLimitIdentifier();
  if (!isPremium) {
    const { success } = await letterRateLimit.limit(identifier);
    if (!success) {
      return { 
        success: false, 
        error: "1時間あたりの送信上限（5通）に達しました。時間を置くか、プレミアム会員になって無制限に手紙を送りましょう！",
        isRateLimited: true 
      };
    }
  }

  const supabase = await getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { success: false, error: "認証エラーが発生しました" };
  }

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
      if (modData.results[0].flagged) {
        return { success: false, error: "不適切な表現（誹謗中傷やハラスメント等）が含まれているため送信できません。" };
      }
    } else {
      return { success: false, error: "現在テキストのスキャンができません。少し時間を置いてから再試行してください。" };
    }
  } catch (e) {
    return { success: false, error: "システムエラーが発生しました。時間を置いて再試行してください。" };
  }

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

  const { data: originalLetter, error: fetchError } = await supabase
    .from("letters")
    .select("sender_id")
    .eq("id", originalLetterId)
    .single();

  if (fetchError || !originalLetter) {
    return { success: false, error: "元の手紙が見つかりません" };
  }

  const receiverId = originalLetter.sender_id;
  const deliveryAt = new Date();
  if (!isExpress) {
    deliveryAt.setHours(deliveryAt.getHours() + 24);
  }

  const { error: insertError } = await supabase
    .from("letters")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: safeContent,
      delivery_at: deliveryAt.toISOString(),
    });

  if (insertError) {
    return { success: false, error: "手紙の送信に失敗しました" };
  }

  return { success: true };
}

// 【更新】新規手紙作成用の安全なアクション（レートリミット追加・SSR対応）
export async function sendNewLetterAction(receiverId: string, content: string) {
  // 防壁0-A: Zodによる厳密な型・文字数検証
  const validation = singleStringSchema.safeParse(content);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.flatten().formErrors[0] || "不正なデータ形式です",
    };
  }
  const safeContent = validation.data;

  // 防壁0-B: スパム・API破産防止（レートリミット）
  const { identifier, isPremium } = await getRateLimitIdentifier();
  if (!isPremium) {
    const { success } = await letterRateLimit.limit(identifier);
    if (!success) {
      return { 
        success: false, 
        error: "1時間あたりの送信上限（5通）に達しました。時間を置くか、プレミアム会員になって無制限に手紙を送りましょう！",
        isRateLimited: true 
      };
    }
  }

  const supabase = await getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { success: false, error: "認証エラーが発生しました" };
  }

  // 防壁1: 連絡先フィルター
  if (containsPersonalInfo(safeContent)) {
    return { success: false, error: "安全のため、LINEやSNSアカウント、電話番号などの連絡先交換は禁止されています。" };
  }

  // 防壁2: AIスキャン
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
      if (modData.results[0].flagged) {
        return { success: false, error: "不適切な表現（誹謗中傷やハラスメント等）が含まれているため送信できません。" };
      }
    } else {
      return { success: false, error: "現在テキストのスキャンができません。少し時間を置いてから再試行してください。" };
    }
  } catch (e) {
    return { success: false, error: "システムエラーが発生しました。時間を置いて再試行してください。" };
  }

  // 1時間後に配達設定
  const deliveryAt = new Date(Date.now() + 60 * 60 * 1000);

  const { error: insertError } = await supabase
    .from("letters")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: safeContent,
      delivery_at: deliveryAt.toISOString(),
      is_read: false
    });

  if (insertError) {
    return { success: false, error: "手紙の送信に失敗しました" };
  }

  return { success: true };
}