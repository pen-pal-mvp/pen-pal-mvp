'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function RequestActions({ connectionId }: { connectionId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleAction = async (newStatus: 'accepted' | 'rejected') => {
    setIsLoading(true);
    
    // connectionsテーブルのstatusを更新（承認 or 拒否）
    const { error } = await supabase
      .from('connections')
      .update({ status: newStatus })
      .eq('id', connectionId);

    if (error) {
      alert('エラーが発生しました: ' + error.message);
      setIsLoading(false);
    } else {
      // 成功したら画面をリロードしてリストを最新状態にする
      router.refresh();
    }
  };

  return (
    <div className="flex space-x-2 mt-3">
      <button
        onClick={() => handleAction('accepted')}
        disabled={isLoading}
        className="flex-1 bg-green-500 text-white font-medium py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
      >
        承認する
      </button>
      <button
        onClick={() => handleAction('rejected')}
        disabled={isLoading}
        className="flex-1 bg-red-500 text-white font-medium py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
      >
        拒否する
      </button>
    </div>
  );
}