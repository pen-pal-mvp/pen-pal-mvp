'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function RequestButton({ receiverId }: { receiverId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // クライアント側用のSupabaseインスタンス
  const supabase = createClientComponentClient();

  const handleRequest = async () => {
    setIsLoading(true);
    setStatus('idle');

    // 1. 現在のログインユーザーを取得
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('ログインが必要です。');
      setIsLoading(false);
      return;
    }

    // 2. connectionsテーブルにリクエストをINSERT
    const { error } = await supabase
      .from('connections')
      .insert({
        sender_id: session.user.id,
        receiver_id: receiverId,
        status: 'pending', // 最初は「承認待ち」状態
      });

    if (error) {
      console.error(error);
      alert('エラーが発生しました: ' + error.message);
      setStatus('error');
    } else {
      setStatus('success');
    }
    
    setIsLoading(false);
  };

  // 成功時のボタン表示
  if (status === 'success') {
    return (
      <button 
        className="w-full bg-green-500 text-white font-medium py-2 rounded-lg cursor-not-allowed" 
        disabled
      >
        リクエスト送信済み
      </button>
    );
  }

  // 通常時・ロード中のボタン表示
  return (
    <button 
      onClick={handleRequest}
      disabled={isLoading}
      className={`w-full font-medium py-2 rounded-lg transition ${
        isLoading 
          ? 'bg-gray-400 text-white cursor-not-allowed' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`}
    >
      {isLoading ? '送信中...' : '文通を申し込む'}
    </button>
  );
}