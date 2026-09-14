import { SafeHtml } from '@/components/SafeHtml';
import Link from 'next/link';

// ※実際はDBや翻訳APIからの取得データに置き換えること
const letterData = {
  originalText: "こんにちは。<script>alert('セッションを盗むわよ')</script><br>これは<b>テスト</b>です。",
  translatedText: "Hello.<script>fetch('malicious-site')</script><br>This is a <b>test</b>."
};

export default function LetterViewPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center px-2">
          <h1 className="text-2xl font-bold text-slate-800">手紙を読む</h1>
          <Link className="text-sm text-slate-500 hover:text-violet-600 transition-colors font-bold" href="/dashboard">
            ← 受信箱へ戻る
          </Link>
        </div>

        <div className="space-y-8 bg-white p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
          <section>
            <div className="font-bold text-lg mb-3 text-slate-800 flex items-center">
              <span className="mr-2">✉️</span> オリジナル（手紙本文）
            </div>
            {/* originalTextが安全に改行と太字のみ反映されて表示される */}
            <SafeHtml
              content={letterData.originalText}
              className="p-6 border border-slate-200 rounded-2xl bg-slate-50 text-slate-700 leading-relaxed shadow-inner"
            />
          </section>

          <section>
            <div className="font-bold text-lg mb-3 flex items-center">
              <span className="mr-2">✨</span> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500">
                AI自動翻訳
              </span>
            </div>
            {/* translatedTextも同様に安全にレンダリングされる */}
            <SafeHtml
              content={letterData.translatedText}
              className="p-6 border border-violet-100 rounded-2xl bg-violet-50 text-slate-700 leading-relaxed shadow-inner"
            />
          </section>
        </div>
      </div>
    </div>
  );
}