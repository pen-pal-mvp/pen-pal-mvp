'use client';

import { useState } from 'react';

export default function TextAreaWithCount() {
  const [text, setText] = useState('');
  const maxLength = 800;
  const remaining = maxLength - text.length;

  return (
    <div className="relative group">
      <textarea
        name="content"
        required
        maxLength={maxLength}
        rows={12}
        className="w-full p-6 pb-10 bg-white rounded-3xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-slate-700 resize-y shadow-sm leading-relaxed break-all"
        placeholder="ここに手紙の本文を書いてください。のんびり、思いを込めて...&#13;&#10;여기에 편지 본문을 작성해 주세요. 여유를 가지고 마음을 담아서..."
        onChange={(e) => setText(e.target.value)}
        value={text}
      ></textarea>
      
      {/* ★ カウントダウン表示（残り50文字以下になると色がピンクに変わって警告します） */}
      <div className={`absolute bottom-4 right-6 text-xs font-bold pointer-events-none transition-colors ${remaining <= 50 ? 'text-pink-500' : 'text-slate-400'}`}>
        残り {remaining} 文字 / 남은 글자수 {remaining}자
      </div>
    </div>
  );
}