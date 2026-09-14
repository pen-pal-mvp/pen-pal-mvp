"use client";
import Link from "next/link";
import { useState } from "react";
import { createCheckoutSessionAction } from "@/app/actions/stripeActions";

export default function PremiumPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handlePayment = async (method: "line" | "kakao") => {
    setIsLoading(method);
    try {
      const result = await createCheckoutSessionAction();
      
      if (result.error) {
        alert("エラー: " + result.error);
        setIsLoading(null);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      alert("通信エラーが発生しました。");
      console.error(error);
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg p-8 md:p-10 bg-white rounded-3xl shadow-lg shadow-violet-100/50 border border-slate-100 space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500">
            プレミアムパスポート
          </h1>
          <p className="text-slate-500 font-bold">한일 펜팔 / 韓日ペンパルをさらに深く楽しむ</p>
        </div>

        <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-6 shadow-inner">
          <h2 className="text-lg font-bold text-violet-800 mb-5 text-center flex items-center justify-center">
            <span className="mr-2">👑</span> 月額プランの特典 / 월간 플랜 혜택
          </h2>
          <ul className="space-y-5 text-slate-700 font-medium">
            <li className="flex items-start">
              <span className="text-2xl mr-4 leading-none">✨</span>
              <div>
                <p className="font-bold">特急便（即時配達）が使い放題</p>
                <p className="text-xs text-slate-500 mt-1">특급 우편(즉시 배달) 무제한</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-4 leading-none">🔍</span>
              <div>
                <p className="font-bold">言語学習マッチングの優先表示</p>
                <p className="text-xs text-slate-500 mt-1">언어 학습 매칭 우선 표시</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-4 leading-none">🌐</span>
              <div>
                <p className="font-bold">手紙のワンタップ自動翻訳機能</p>
                <p className="text-xs text-slate-500 mt-1">편지 원탭 자동 번역 기능</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="space-y-4 pt-2">
          <button 
            onClick={() => handlePayment("line")} 
            disabled={isLoading !== null} 
            className="w-full py-4 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">{isLoading === "line" ? "処理中... / 처리 중..." : "LINE Pay で登録 (300円 / 月)"}</span>
          </button>
          <button 
            onClick={() => handlePayment("kakao")} 
            disabled={isLoading !== null} 
            className="w-full py-4 bg-[#FEE500] hover:bg-[#e6cf00] text-[#191919] font-bold rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">{isLoading === "kakao" ? "処理中... / 처리 중..." : "카카오페이로 구독 (3000원 / 월)"}</span>
          </button>
        </div>

        <div className="pt-6 text-center border-t border-slate-100">
          <Link href="/dashboard" className="text-slate-500 hover:text-violet-600 transition-colors font-bold text-sm">
            ← ダッシュボードに戻る / 대시보드로 돌아가기
          </Link>
        </div>
        
      </div>
    </div>
  );
}