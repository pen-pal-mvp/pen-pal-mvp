'use client';

import { useState, ChangeEvent } from 'react';

export default function TextAreaWithCount() {
  const [text, setText] = useState('');
  const MAX_CAPACITY = 2400; // 半角2400文字分（全角だと400文字分）

  // 文字のサイズを判定する関数（半角=1、全角=6として計算）
  const calculateCapacity = (str: string) => {
    let size = 0;
    for (let i = 0; i < str.length; i++) {
      // アスキーコード255以下（半角英数字・記号）は1、それ以外（日・韓など）は6とする
      size += str.charCodeAt(i) <= 255 ? 1 : 6;
    }
    return size;
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    if (calculateCapacity(newText) <= MAX_CAPACITY) {
      setText(newText);
    } else {
      // コピペ等で上限を超えた場合、制限内に収まる部分だけを切り取る
      let validStr = '';
      let currentSize = 0;
      for (let i = 0; i < newText.length; i++) {
        const charSize = newText.charCodeAt(i) <= 255 ? 1 : 6;
        if (currentSize + charSize <= MAX_CAPACITY) {
          validStr += newText[i];
          currentSize += charSize;
        } else {
          break;
        }
      }
      setText(validStr);
    }
  };

  const currentCapacity = calculateCapacity(text);
  // 全角（6ポイント）換算での残り文字数を表示（400からカウントダウン）
  const remainingDisplay = Math.floor((MAX_CAPACITY - currentCapacity) / 6);

  return (
    <div className="relative group">
      <textarea
        name="content"
        required
        rows={12}
        className="w-full p-6 pb-10 bg-white rounded-3xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-slate-700 resize-y shadow-sm leading-relaxed break-all"
        placeholder="ここに手紙の本文を書いてください。のんびり、思いを込めて...&#13;&#10;여기에 편지 본문을 작성해 주세요. 여유를 가지고 마음을 담아서..."
        onChange={handleChange}
        value={text}
      ></textarea>
      
      <div className={`absolute bottom-4 right-6 text-xs font-bold pointer-events-none transition-colors ${remainingDisplay <= 20 ? 'text-pink-500' : 'text-slate-400'}`}>
        残り {remainingDisplay} 文字 / 남은 글자수 {remainingDisplay}자
      </div>
    </div>
  );
}