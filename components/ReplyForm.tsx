"use client";

import { useState } from 'react';
import { sendReplyAction } from '@/app/actions/letterActions';

export default function ReplyForm({ originalLetterId }: { originalLetterId: string }) {
  const [content, setContent] = useState("");
  const [isExpress, setIsExpress] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) return;
    
    setErrorMessage(null); // 送信前にエラーをリセット
    setIsSubmitting(true);

    try {
      const result = await sendReplyAction(originalLetterId, content, isExpress);

      if (!result.success) {
        // サーバーから弾かれたら、赤文字で画面に表示
        setErrorMessage(result.error || "エラーが発生しました");
        setIsSubmitting(false);
        return;
      }

      // 成功時
      setContent("");
      setIsExpress(false);
      alert("手紙を送信しました！");
    } catch (error) {
      setErrorMessage("通信エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md max-w-md mx-auto mt-4">
      {/* 警告メッセージの表示領域 */}
      {errorMessage && (
        <div className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200 font-bold">
          ⚠️ {errorMessage}
        </div>
      )}

      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
        placeholder="返信内容を書いてください..."
        className="w-full p-2 border rounded-md min-h-[150px] resize-y text-black"
        disabled={isSubmitting}
      />
      
      <label className="flex items-center gap-2 cursor-pointer">
        <input 
          type="checkbox" 
          checked={isExpress}
          onChange={(e) => setIsExpress(e.target.checked)}
          disabled={isSubmitting}
        />
        <span>特急便で送る（プレミアム会員限定）</span>
      </label>

      <button 
        onClick={handleSend}
        disabled={isSubmitting || !content.trim()}
        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "スキャン中・送信中..." : "返信を送信する"}
      </button>
    </div>
  );
}