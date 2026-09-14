import { createClient } from '../../utils/supabase/server';
import { headers } from 'next/headers';

export async function verifyPremium() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { 
      status: 'auth_required', 
      message: '有効なアカウントでログインして実行してください', 
      userId: null, 
      ipAddress: null 
    };
  }

  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';

  const { data: profile } = await supabase
    .from('users')
    .select('is_premium')
    .eq('id', user.id)
    .single();

  if (!profile || profile.is_premium !== true) {
    return { 
      status: 'upgrade_required', 
      message: 'プレミアムプランへの移行により本機能が利用可能となります', 
      userId: user.id, 
      ipAddress: ip 
    };
  }

  // 現在のIPアドレスとタイムスタンプを記録（既存IPの場合は更新）
  await supabase
    .from('user_ips')
    .upsert({ 
      user_id: user.id, 
      ip_address: ip, 
      last_seen: new Date().toISOString() 
    });

  // 過去24時間以内のアクティブなアクセスIP履歴を取得
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: activeIps } = await supabase
    .from('user_ips')
    .select('ip_address')
    .eq('user_id', user.id)
    .gte('last_seen', twentyFourHoursAgo);

  // 同時アクセス上限（3 IPアドレス）の判定と強制遮断
  if (activeIps && activeIps.length > 3) {
    return {
      status: 'session_limit_exceeded',
      message: '規定の端末・ネットワーク利用上限に達しました。アカウント保護のためアクセスを制限しています。',
      userId: user.id,
      ipAddress: ip
    };
  }

  return {
    status: 'authorized',
    message: '検証を完了したわ',
    userId: user.id,
    ipAddress: ip
  };
}