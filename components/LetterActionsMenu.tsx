"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { blockUserAction, reportUserAction } from '@/app/actions/moderationActions';

export default function LetterActionsMenu({ 
  senderId, 
  letterId 
}: { 
  senderId: string, 
  letterId: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleBlock = async () => {
    if (!window.confirm("本当にこのユーザーをブロックしますか？以降、お互いの手紙は非表示になります。")) return;
    
    setIsProcessing(true);
    const result = await blockUserAction(senderId);
    
    if (result.success) {
      alert("ユーザーをブロックしました。安全のためダッシュボードに戻ります。");
      router.push('/dashboard');
    } else {
      alert(result.error || "エラーが発生しました");
      setIsProcessing(false);
    }
  };

  const handleReport = async () => {
    const reason = window.prompt("通報の理由を入力してください（例：出会い目的、暴言、スパムなど）");
    if (!reason) return; // キャンセル、または未入力の場合は処理を中断

    setIsProcessing(true);
    const result = await reportUserAction(senderId, letterId, reason);
    
    if (result.success) {
      alert("運営に通報しました。ご報告ありがとうございます。");
      setIsOpen(false);
    } else {
      alert(result.error || "エラーが発生しました");
    }
    setIsProcessing(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isProcessing}
        className="text-gray-400 hover:text-gray-600 p-2 text-xl font-bold rounded-full hover:bg-gray-100 transition-colors"
        title="その他の操作"
      >
        ︙
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg z-10 overflow-hidden">
          <button 
            onClick={handleReport}
            className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-b border-gray-100 font-medium"
          >
            🚨 この手紙を通報する
          </button>
          <button 
            onClick={handleBlock}
            className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 font-medium"
          >
            🚫 ユーザーをブロック
          </button>
        </div>
      )}
    </div>
  );
}